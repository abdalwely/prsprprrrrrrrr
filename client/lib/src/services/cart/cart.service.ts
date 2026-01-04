import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { Cart, CartItem } from "../../types";

export const cartService = {
  // إنشاء سلة جديدة
  async createCart(customerId: string, storeId: string): Promise<string> {
    try {
      const cartRef = await addDoc(collection(db, "customerCarts"), {
        customerId,
        storeId,
        items: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return cartRef.id;
    } catch (error) {
      console.error("❌ خطأ في إنشاء السلة:", error);
      throw error;
    }
  },

  // إنشاء سلة مع عناصر
  async createCartWithItems(
    customerId: string,
    storeId: string,
    items: CartItem[],
  ): Promise<string> {
    try {
      const cartRef = await addDoc(collection(db, "customerCarts"), {
        customerId,
        storeId,
        items,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return cartRef.id;
    } catch (error) {
      console.error("❌ خطأ في إنشاء السلة مع عناصر:", error);
      throw error;
    }
  },

  // جلب سلة العميل
  async getCustomerCart(
    customerId: string,
    storeId: string,
  ): Promise<Cart | null> {
    try {
      const q = query(
        collection(db, "customerCarts"),
        where("customerId", "==", customerId),
        where("storeId", "==", storeId),
        limit(1),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Cart;
      }

      return null;
    } catch (error) {
      console.error("❌ خطأ في جلب سلة العميل:", error);
      return null;
    }
  },

  // تحديث السلة
  async updateCart(cartId: string, items: CartItem[]): Promise<void> {
    try {
      const cartRef = doc(db, "customerCarts", cartId);
      await updateDoc(cartRef, {
        items,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("❌ خطأ في تحديث السلة:", error);
      throw error;
    }
  },

  // مسح السلة
  async clearCart(cartId: string): Promise<void> {
    try {
      const cartRef = doc(db, "customerCarts", cartId);
      await updateDoc(cartRef, {
        items: [],
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("❌ خطأ في مسح السلة:", error);
      throw error;
    }
  },

  // إضافة منتج للسلة
  async addToCart(
    cartId: string,
    productId: string,
    quantity: number = 1,
  ): Promise<void> {
    try {
      const cartRef = doc(db, "customerCarts", cartId);
      const cartSnap = await getDoc(cartRef);

      if (!cartSnap.exists()) {
        throw new Error("السلة غير موجودة");
      }

      const cart = cartSnap.data() as Cart;
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId === productId,
      );

      let newItems: CartItem[];
      if (existingItemIndex > -1) {
        newItems = [...cart.items];
        newItems[existingItemIndex].quantity += quantity;
        newItems[existingItemIndex].addedAt = new Date();
      } else {
        newItems = [
          ...cart.items,
          {
            productId,
            quantity,
            addedAt: new Date(),
          },
        ];
      }

      await updateDoc(cartRef, {
        items: newItems,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("❌ خطأ في إضافة المنتج للسلة:", error);
      throw error;
    }
  },

  // إزالة منتج من السلة
  async removeFromCart(cartId: string, productId: string): Promise<void> {
    try {
      const cartRef = doc(db, "customerCarts", cartId);
      const cartSnap = await getDoc(cartRef);

      if (!cartSnap.exists()) {
        throw new Error("السلة غير موجودة");
      }

      const cart = cartSnap.data() as Cart;
      const newItems = cart.items.filter(
        (item) => item.productId !== productId,
      );

      await updateDoc(cartRef, {
        items: newItems,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("❌ خطأ في إزالة المنتج من السلة:", error);
      throw error;
    }
  },

  // تحديث كمية المنتج
  async updateQuantity(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    try {
      if (quantity <= 0) {
        await this.removeFromCart(cartId, productId);
        return;
      }

      const cartRef = doc(db, "customerCarts", cartId);
      const cartSnap = await getDoc(cartRef);

      if (!cartSnap.exists()) {
        throw new Error("السلة غير موجودة");
      }

      const cart = cartSnap.data() as Cart;
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId === productId,
      );

      if (existingItemIndex === -1) {
        throw new Error("المنتج غير موجود في السلة");
      }

      const newItems = [...cart.items];
      newItems[existingItemIndex].quantity = quantity;
      newItems[existingItemIndex].addedAt = new Date();

      await updateDoc(cartRef, {
        items: newItems,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("❌ خطأ في تحديث الكمية:", error);
      throw error;
    }
  },
};
