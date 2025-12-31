// lib/customer-stores.ts
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment 
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface StoreLinkData {
  name: string;
  subdomain: string;
  ownerId: string;
  merchantId?: string;
}

// دالة ربط المتجر بالعميل في Firebase
export async function linkStoreToCustomer(
  customerId: string,
  storeId: string,
  storeData: StoreLinkData
): Promise<void> {
  try {
    console.log("🔗 ربط المتجر بالعميل:", { customerId, storeId, storeData });
    const linkId = `${customerId}_${storeId}`;
    
    // 1. إنشاء/تحديث رابط المتجر للعميل
    const customerStoreRef = doc(db, "customerStores", linkId);
    
    const existingLink = await getDoc(customerStoreRef);
    
    if (existingLink.exists()) {
      // تحديث الرابط الموجود
      await updateDoc(customerStoreRef, {
        lastVisited: serverTimestamp(),
        visitsCount: increment(1)
      });
      console.log("✅ تم تحديث رابط المتجر الموجود");
    } else {
      // إنشاء رابط جديد
      await setDoc(customerStoreRef, {
        id: linkId,
        customerId,
        storeId,
        storeName: storeData.name,
        storeSubdomain: storeData.subdomain,
        ownerId: storeData.ownerId,
        merchantId: storeData.merchantId || storeData.ownerId,
        favorite: false,
        lastVisited: serverTimestamp(),
        createdAt: serverTimestamp(),
        visitsCount: 1
      });
      console.log("✅ تم إنشاء رابط متجر جديد للعميل");
    }
    
    // 2. إضافة العميل إلى قائمة عملاء التاجر
    const merchantCustomerRef = doc(db, "merchantCustomers", `${storeData.merchantId || storeData.ownerId}_${customerId}`);
    
    const existingCustomer = await getDoc(merchantCustomerRef);
    
    if (!existingCustomer.exists()) {
      await setDoc(merchantCustomerRef, {
        customerId,
        merchantId: storeData.merchantId || storeData.ownerId,
        storeId,
        storeName: storeData.name,
        customerEmail: await getCustomerEmail(customerId),
        linkedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });
      console.log("✅ تم إضافة العميل إلى قائمة عملاء التاجر");
    }

    // No localStorage mirroring — Firestore only
  } catch (error: any) {
    console.error("❌ خطأ في ربط المتجر بالعميل:", error);
    throw new Error(`فشل في ربط المتجر: ${error.message}`);
  }
}

// دالة جلب متاجر العميل
export async function getCustomerStores(customerId: string): Promise<any[]> {
  try {
    const storesQuery = query(
      collection(db, "customerStores"),
      where("customerId", "==", customerId)
    );
    
    const querySnapshot = await getDocs(storesQuery);
    const stores: any[] = [];
    
    querySnapshot.forEach((doc) => {
      stores.push({ id: doc.id, ...doc.data() });
    });
    
    console.log("📊 متاجر العميل:", stores.length);
    return stores;
  } catch (error) {
    console.error("❌ خطأ في جلب متاجر العميل:", error);
    return [];
  }
}

// دالة جلب عملاء التاجر
export async function getMerchantCustomers(merchantId: string): Promise<any[]> {
  try {
    const customersQuery = query(
      collection(db, "merchantCustomers"),
      where("merchantId", "==", merchantId)
    );
    
    const querySnapshot = await getDocs(customersQuery);
    const customers: any[] = [];
    
    querySnapshot.forEach((doc) => {
      customers.push({ id: doc.id, ...doc.data() });
    });
    
    console.log("👥 عملاء التاجر:", customers.length);
    return customers;
  } catch (error) {
    console.error("❌ خطأ في جلب عملاء التاجر (Firestore):", error);
    // No localStorage fallback — return empty on error
    return [];
  }
}

// دالة لإزالة رابط العميل مع المتجر/التاجر
export async function removeCustomerLink(customerId: string, storeId: string, merchantId?: string): Promise<void> {
  try {
    const linkId = `${customerId}_${storeId}`;

    // Try Firestore deletion if possible
    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'customerStores', linkId));
      if (merchantId) {
        await deleteDoc(doc(db, 'merchantCustomers', `${merchantId}_${customerId}`));
      }
      console.log('✅ removed link from Firestore:', linkId);
      return;
    } catch (err) {
      console.error('❌ failed to remove link from Firestore:', err);
      throw err;
    }
  } catch (error) {
    console.error('❌ removeCustomerLink failed:', error);
    throw error;
  }
}

// دالة جلب بريد العميل
async function getCustomerEmail(customerId: string): Promise<string> {
  try {
    const customerDoc = await getDoc(doc(db, "customers", customerId));
    
    if (customerDoc.exists()) {
      const customerData = customerDoc.data();
      return customerData.email || "";
    }
    
    return "";
  } catch (error) {
    console.error("❌ خطأ في جلب بريد العميل:", error);
    return "";
  }
}

// دالة إضافة متجر للمفضلة
export async function toggleFavoriteStore(
  customerId: string,
  storeId: string,
  isFavorite: boolean
): Promise<void> {
  try {
    const linkId = `${customerId}_${storeId}`;
    await updateDoc(doc(db, "customerStores", linkId), {
      favorite: isFavorite,
      updatedAt: serverTimestamp()
    });
    console.log(`✅ تم ${isFavorite ? 'إضافة' : 'إزالة'} المتجر من المفضلة`);
  } catch (error) {
    console.error("❌ خطأ في تحديث المفضلة:", error);
    throw error;
  }
}

// دالة التحقق من وجود رابط المتجر
export async function checkStoreLink(
  customerId: string,
  storeId: string
): Promise<boolean> {
  try {
    const linkId = `${customerId}_${storeId}`;

    try {
      // Try Firestore first (if initialized)
      if (db) {
        const customerStoreRef = doc(db, "customerStores", linkId);
        const existingLink = await getDoc(customerStoreRef);
        if (existingLink.exists()) return true;
      }
    } catch (err) {
      console.warn('⚠️ checkStoreLink Firestore check failed, falling back to localStorage:', err);
    }

    // Fallback: check localStorage links
    try {
      const customerStores = JSON.parse(localStorage.getItem('customerStores') || '[]');
      return customerStores.some((l: any) => l.id === linkId || (l.customerId === customerId && l.storeId === storeId));
    } catch (err) {
      console.error('❌ checkStoreLink localStorage fallback failed:', err);
      return false;
    }
  } catch (error) {
    console.error("❌ خطأ في التحقق من رابط المتجر:", error);
    return false;
  }
}