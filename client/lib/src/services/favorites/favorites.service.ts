import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { Favorite } from "../../types";
import { db } from "../../firebase/firebase";

export const favoritesService = {
  // إضافة منتج للمفضلة
  async addFavorite(
    customerId: string,
    storeId: string,
    productId: string,
  ): Promise<string> {
    try {
      // التحقق من عدم وجود المنتج بالفعل
      const existing = await this.getFavorite(customerId, storeId, productId);
      if (existing) {
        return existing.id;
      }

      const favRef = await addDoc(collection(db, "customerFavorites"), {
        customerId,
        storeId,
        productId,
        addedAt: serverTimestamp(),
      });

      return favRef.id;
    } catch (error) {
      console.error("❌ خطأ في إضافة المفضلة:", error);
      throw error;
    }
  },

  // جلب منتج مفضل
  async getFavorite(
    customerId: string,
    storeId: string,
    productId: string,
  ): Promise<Favorite | null> {
    try {
      const q = query(
        collection(db, "customerFavorites"),
        where("customerId", "==", customerId),
        where("storeId", "==", storeId),
        where("productId", "==", productId),
        limit(1),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          addedAt: data.addedAt?.toDate() || new Date(),
        } as Favorite;
      }

      return null;
    } catch (error) {
      console.error("❌ خطأ في جلب المفضلة:", error);
      return null;
    }
  },

  // جلب جميع المفضلات
  async getFavorites(customerId: string, storeId: string): Promise<Favorite[]> {
    try {
      const q = query(
        collection(db, "customerFavorites"),
        where("customerId", "==", customerId),
        where("storeId", "==", storeId),
        orderBy("addedAt", "desc"),
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          addedAt: data.addedAt?.toDate() || new Date(),
        } as Favorite;
      });
    } catch (error) {
      console.error("❌ خطأ في جلب المفضلات:", error);
      return [];
    }
  },

  // إزالة من المفضلة
  async removeFavorite(favoriteId: string): Promise<void> {
    try {
      const favRef = doc(db, "customerFavorites", favoriteId);
      await deleteDoc(favRef);
    } catch (error) {
      console.error("❌ خطأ في إزالة المفضلة:", error);
      throw error;
    }
  },

  // إزالة منتج من المفضلة
  async removeFavoriteByProduct(
    customerId: string,
    storeId: string,
    productId: string,
  ): Promise<void> {
    try {
      const favorite = await this.getFavorite(customerId, storeId, productId);
      if (favorite) {
        await this.removeFavorite(favorite.id);
      }
    } catch (error) {
      console.error("❌ خطأ في إزالة المفضلة:", error);
      throw error;
    }
  },

  // التحقق إذا كان المنتج مفضلاً
  async isFavorite(
    customerId: string,
    storeId: string,
    productId: string,
  ): Promise<boolean> {
    try {
      const favorite = await this.getFavorite(customerId, storeId, productId);
      return !!favorite;
    } catch (error) {
      console.error("❌ خطأ في التحقق من المفضلة:", error);
      return false;
    }
  },
};
