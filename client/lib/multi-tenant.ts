/**
 * 🔒 CORE MULTI-TENANT HELPER FUNCTIONS
 * Ensures complete data isolation between stores
 * All operations are scoped to storeId
 */

import {
  doc,
  collection,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  writeBatch,
  QueryConstraint,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import type { StoreCustomer, Cart, CartItem, Order } from "./types";

// ============ CUSTOMER MANAGEMENT ============

/**
 * ✅ Problem 1 Solution: Ensure customer record exists in specific store
 * Each store has its own customer records completely isolated
 */
export async function ensureStoreCustomer(
  storeId: string,
  uid: string,
): Promise<StoreCustomer> {
  const customerRef = doc(db, "stores", storeId, "customers", uid);
  const snap = await getDoc(customerRef);

  if (!snap.exists()) {
    const user = auth.currentUser;
    const userEmail = user?.email || "";
    const userName = user?.displayName || "";
    const [firstName, ...lastNameParts] = userName.split(" ");
    const lastName = lastNameParts.join(" ") || "";

    const newCustomer = {
      uid,
      email: userEmail,
      firstName,
      lastName,
      phone: "",
      storeId,
      isActive: true,
      isVerified: false,
      firstVisit: serverTimestamp(),
      lastVisit: serverTimestamp(),
      shippingAddress: {
        street: "",
        city: "",
        district: "",
        governorate: "",
        zipCode: "",
        country: "اليمن",
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(customerRef, newCustomer);
    console.log(`✅ Created customer in store ${storeId}: ${uid}`);
  } else {
    // Update last visit
    await updateDoc(customerRef, {
      lastVisit: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  const updated = await getDoc(customerRef);
  const data = updated.data() || {};
  return {
    id: uid,
    uid,
    email: data.email || "",
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    phone: data.phone || "",
    storeId,
    isActive: data.isActive ?? true,
    isVerified: data.isVerified ?? false,
    firstVisit: data.firstVisit?.toDate?.() || new Date(),
    lastVisit: data.lastVisit?.toDate?.() || new Date(),
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as StoreCustomer;
}

/**
 * ✅ Problem 1 + 2 Solution: Get or create customer ID for a store
 * Returns uid for logged-in users or guest_{visitorId} for guests
 * This maintains the per-store isolation while supporting guest checkout
 */
export async function getOrCreateCustomerIdForStore(
  storeId: string,
): Promise<string> {
  const user = auth.currentUser;

  // Registered customer
  if (user?.uid) {
    await ensureStoreCustomer(storeId, user.uid);
    return user.uid;
  }

  // Guest visitor
  const storageKey = `visitor_${storeId}`;
  let visitorId = localStorage.getItem(storageKey);

  if (!visitorId) {
    visitorId = `vis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, visitorId);

    // Create visitor record in store (for analytics/security)
    try {
      const visitorRef = doc(db, "stores", storeId, "visitors", visitorId);
      await setDoc(visitorRef, {
        visitorId,
        storeId,
        firstVisit: serverTimestamp(),
        lastActivity: serverTimestamp(),
        isGuest: true,
        userAgent: navigator.userAgent.substring(0, 100),
      });
    } catch (err) {
      console.warn("⚠️ Could not save visitor record:", err);
    }
  }

  return `guest_${visitorId}`;
}

/**
 * ✅ Problem 1 + 2 + 3 Solution: Link guest to registered customer
 * Migrates all guest data (cart, orders, favorites) to the registered account
 * while maintaining complete per-store isolation
 */
export async function linkVisitorToCustomer(
  storeId: string,
  visitorId: string,
  uid: string,
): Promise<void> {
  console.log(
    `🔗 Linking visitor ${visitorId} to ${uid} in store ${storeId}`,
  );

  // 1. Ensure customer exists in store
  await ensureStoreCustomer(storeId, uid);

  // 2. Migrate cart items (per-store)
  try {
    const guestCustomerId = `guest_${visitorId}`;
    const guestCartRef = doc(
      db,
      "stores",
      storeId,
      "carts",
      guestCustomerId,
    );
    const guestCartSnap = await getDoc(guestCartRef);

    if (guestCartSnap.exists()) {
      const guestCart = guestCartSnap.data() as Cart;

      if (guestCart.items?.length > 0) {
        const userCartRef = doc(db, "stores", storeId, "carts", uid);
        const userCartSnap = await getDoc(userCartRef);

        if (userCartSnap.exists()) {
          // Merge items
          const userCart = userCartSnap.data() as Cart;
          const mergedItems = [...(userCart.items || [])];

          guestCart.items.forEach((guestItem: CartItem) => {
            const existingIndex = mergedItems.findIndex(
              (item) => item.productId === guestItem.productId,
            );
            if (existingIndex > -1) {
              mergedItems[existingIndex].quantity += guestItem.quantity;
            } else {
              mergedItems.push(guestItem);
            }
          });

          await updateDoc(userCartRef, {
            items: mergedItems,
            updatedAt: serverTimestamp(),
          });
        } else {
          // Create user cart with guest items
          await setDoc(userCartRef, {
            customerId: uid,
            storeId,
            items: guestCart.items,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        // Clear guest cart
        await updateDoc(guestCartRef, {
          items: [],
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (cartError) {
    console.warn("⚠️ Could not migrate cart:", cartError);
  }

  // 3. Update visitor record (per-store)
  try {
    const visitorRef = doc(db, "stores", storeId, "visitors", visitorId);
    await updateDoc(visitorRef, {
      linkedToUid: uid,
      linkedAt: serverTimestamp(),
      isGuest: false,
    });
  } catch (err) {
    console.warn("⚠️ Could not update visitor:", err);
  }

  // 4. Migrate orders (per-store) - only update storeId-specific orders
  try {
    const ordersRef = collection(db, "stores", storeId, "orders");
    const ordersQ = query(
      ordersRef,
      where("customerId", "==", `guest_${visitorId}`),
    );
    const ordersSnap = await getDocs(ordersQ);

    if (ordersSnap.docs.length > 0) {
      const batch = writeBatch(db);
      ordersSnap.docs.forEach((orderDoc) => {
        batch.update(orderDoc.ref, {
          customerId: uid,
          "customerSnapshot.uid": uid,
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
      console.log(
        `✅ Migrated ${ordersSnap.docs.length} orders in store ${storeId}`,
      );
    }
  } catch (ordersError) {
    console.warn("⚠️ Could not migrate orders:", ordersError);
  }

  // 5. Clean localStorage
  localStorage.removeItem(`visitor_${storeId}`);
  console.log(`✅ Linking complete for store ${storeId}`);
}

// ============ CART MANAGEMENT (Per-Store) ============

/**
 * ✅ Problem 1 Solution: Create cart in specific store
 * Cart is completely isolated per store
 */
export async function createStoreCart(
  customerId: string,
  storeId: string,
  items: CartItem[] = [],
): Promise<Cart> {
  const cartRef = doc(db, "stores", storeId, "carts", customerId);

  const cart = {
    customerId,
    storeId,
    items,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(cartRef, cart);
  console.log(`✅ Created cart in store ${storeId} for ${customerId}`);

  return {
    id: customerId,
    ...cart,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Cart;
}

/**
 * ✅ Problem 1 Solution: Get cart from specific store
 * Only accesses that store's cart
 */
export async function getStoreCart(
  customerId: string,
  storeId: string,
): Promise<Cart | null> {
  const cartRef = doc(db, "stores", storeId, "carts", customerId);
  const snap = await getDoc(cartRef);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();
  return {
    id: customerId,
    customerId,
    storeId,
    items: data.items || [],
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as Cart;
}

/**
 * ✅ Problem 1 Solution: Update cart in specific store
 * Only updates that store's cart
 */
export async function updateStoreCart(
  customerId: string,
  storeId: string,
  items: CartItem[],
): Promise<void> {
  const cartRef = doc(db, "stores", storeId, "carts", customerId);
  await updateDoc(cartRef, {
    items,
    updatedAt: serverTimestamp(),
  });
  console.log(`✅ Updated cart in store ${storeId} for ${customerId}`);
}

/**
 * ✅ Problem 1 Solution: Clear cart in specific store
 */
export async function clearStoreCart(
  customerId: string,
  storeId: string,
): Promise<void> {
  const cartRef = doc(db, "stores", storeId, "carts", customerId);
  await updateDoc(cartRef, {
    items: [],
    updatedAt: serverTimestamp(),
  });
  console.log(`✅ Cleared cart in store ${storeId} for ${customerId}`);
}

// ============ ORDER MANAGEMENT (Per-Store) ============

/**
 * ✅ Problem 1 Solution: Create order in specific store
 * Order is completely isolated per store with snapshots
 */
export async function createStoreOrder(
  storeId: string,
  orderData: Omit<Order, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const ordersRef = collection(db, "stores", storeId, "orders");

  const order = {
    ...orderData,
    storeId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(ordersRef, order);
  console.log(`✅ Created order in store ${storeId}: ${docRef.id}`);

  // Update customer's lastOrderAt if registered
  if (orderData.customerId && !orderData.customerId.startsWith("guest_")) {
    try {
      const customerRef = doc(
        db,
        "stores",
        storeId,
        "customers",
        orderData.customerId,
      );
      await updateDoc(customerRef, {
        lastOrderAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn("⚠️ Could not update customer lastOrderAt:", err);
    }
  }

  return docRef.id;
}

/**
 * ✅ Problem 1 Solution: Get order from specific store
 * Only accesses that store's order
 */
export async function getStoreOrder(
  storeId: string,
  orderId: string,
): Promise<Order | null> {
  const orderRef = doc(db, "stores", storeId, "orders", orderId);
  const snap = await getDoc(orderRef);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();
  return {
    id: snap.id,
    storeId,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as Order;
}

/**
 * ✅ Problem 1 Solution: Get all orders for a store
 * Only returns orders from that specific store
 */
export async function getStoreOrders(
  storeId: string,
  constraints: QueryConstraint[] = [],
): Promise<Order[]> {
  const ordersRef = collection(db, "stores", storeId, "orders");
  const q = query(ordersRef, ...constraints);
  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      storeId,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as Order;
  });
}

/**
 * ✅ Problem 1 Solution: Get customer's orders in a specific store
 * Only returns customer's orders from that store
 */
export async function getStoreCustomerOrders(
  storeId: string,
  customerId: string,
): Promise<Order[]> {
  return getStoreOrders(storeId, [
    where("customerId", "==", customerId),
  ]);
}

/**
 * ✅ Problem 1 Solution: Update order in specific store
 */
export async function updateStoreOrder(
  storeId: string,
  orderId: string,
  updates: Partial<Order>,
): Promise<void> {
  const orderRef = doc(db, "stores", storeId, "orders", orderId);
  await updateDoc(orderRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
  console.log(`✅ Updated order in store ${storeId}: ${orderId}`);
}

// ============ STORE CUSTOMERS (Per-Store) ============

/**
 * ✅ Problem 1 Solution: Get all customers in a store
 * Only shows customers from that specific store (for CustomersTab)
 * Merchant can ONLY see their own store's customers
 */
export async function getStoreCustomers(
  storeId: string,
): Promise<StoreCustomer[]> {
  const customersRef = collection(db, "stores", storeId, "customers");
  const snap = await getDocs(customersRef);

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      uid: doc.id,
      storeId,
      ...data,
      firstVisit: data.firstVisit?.toDate?.() || new Date(),
      lastVisit: data.lastVisit?.toDate?.() || new Date(),
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as StoreCustomer;
  });
}
