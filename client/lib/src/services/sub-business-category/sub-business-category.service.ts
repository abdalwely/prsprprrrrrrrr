import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { SubBusinessCategory } from "../../types/category.types";

export const subBusinessCategoryService = {
  async createOrUpdate(
    storeId: string,
    subBusinessType: string,
    categories: Array<{
      name: string;
      description?: string;
      image?: string;
      order?: number;
    }>,
  ): Promise<string> {
    try {
      const q = query(
        collection(db, "subBusinessCategories"),
        where("storeId", "==", storeId),
        where("subBusinessType", "==", subBusinessType),
      );

      const querySnapshot = await getDocs(q);

      const categoryData: Omit<SubBusinessCategory, "id"> = {
        storeId,
        subBusinessType,
        categories: categories.map((cat, index) => ({
          id: `cat_${Date.now()}_${index}`,
          name: cat.name,
          description: cat.description || "",
          image: cat.image || "",
          order: cat.order || index,
          isActive: true,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0];
        await updateDoc(docRef.ref, {
          categories: categoryData.categories,
          updatedAt: new Date(),
        });
        return docRef.id;
      } else {
        const docRef = await addDoc(
          collection(db, "subBusinessCategories"),
          categoryData,
        );
        return docRef.id;
      }
    } catch (error) {
      console.error("❌ خطأ في إنشاء/تحديث فئات النشاط الفرعي:", error);
      throw error;
    }
  },

  async getBySubBusinessType(
    storeId: string,
    subBusinessType: string,
  ): Promise<SubBusinessCategory | null> {
    try {
      const q = query(
        collection(db, "subBusinessCategories"),
        where("storeId", "==", storeId),
        where("subBusinessType", "==", subBusinessType),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as SubBusinessCategory;
      }
      return null;
    } catch (error) {
      console.error("❌ خطأ في جلب فئات النشاط الفرعي:", error);
      return null;
    }
  },

  async updateCategoryInSubBusiness(
    storeId: string,
    subBusinessType: string,
    categoryId: string,
    updates: Partial<{
      name: string;
      description: string;
      image: string;
      order: number;
      isActive: boolean;
    }>,
  ): Promise<void> {
    try {
      const q = query(
        collection(db, "subBusinessCategories"),
        where("storeId", "==", storeId),
        where("subBusinessType", "==", subBusinessType),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0];
        const data = docRef.data() as SubBusinessCategory;

        const updatedCategories = data.categories.map((cat) =>
          cat.id === categoryId ? { ...cat, ...updates } : cat,
        );

        await updateDoc(docRef.ref, {
          categories: updatedCategories,
          updatedAt: new Date(),
        });

        console.log("✅ تم تحديث الفئة في النشاط الفرعي:", {
          storeId,
          subBusinessType,
          categoryId,
          updates,
        });
      }
    } catch (error) {
      console.error("❌ خطأ في تحديث الفئة في النشاط الفرعي:", error);
      throw error;
    }
  },

  async deleteCategoryFromSubBusiness(
    storeId: string,
    subBusinessType: string,
    categoryId: string,
  ): Promise<void> {
    try {
      const q = query(
        collection(db, "subBusinessCategories"),
        where("storeId", "==", storeId),
        where("subBusinessType", "==", subBusinessType),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0];
        const data = docRef.data() as SubBusinessCategory;

        const updatedCategories = data.categories.filter(
          (cat) => cat.id !== categoryId,
        );

        await updateDoc(docRef.ref, {
          categories: updatedCategories,
          updatedAt: new Date(),
        });

        console.log("✅ تم حذف الفئة من النشاط الفرعي:", {
          storeId,
          subBusinessType,
          categoryId,
        });
      }
    } catch (error) {
      console.error("❌ خطأ في حذف الفئة من النشاط الفرعي:", error);
      throw error;
    }
  },

  async addCategoryToSubBusiness(
    storeId: string,
    subBusinessType: string,
    category: {
      name: string;
      description?: string;
      image?: string;
      order?: number;
    },
  ): Promise<string> {
    try {
      const q = query(
        collection(db, "subBusinessCategories"),
        where("storeId", "==", storeId),
        where("subBusinessType", "==", subBusinessType),
      );

      const querySnapshot = await getDocs(q);

      const newCategory = {
        id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: category.name,
        description: category.description || "",
        image: category.image || "",
        order: category.order || 0,
        isActive: true,
      };

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0];
        const data = docRef.data() as SubBusinessCategory;

        const updatedCategories = [...data.categories, newCategory];

        await updateDoc(docRef.ref, {
          categories: updatedCategories,
          updatedAt: new Date(),
        });

        return newCategory.id;
      } else {
        const categoryData: Omit<SubBusinessCategory, "id"> = {
          storeId,
          subBusinessType,
          categories: [newCategory],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const docRef = await addDoc(
          collection(db, "subBusinessCategories"),
          categoryData,
        );

        return newCategory.id;
      }
    } catch (error) {
      console.error("❌ خطأ في إضافة فئة إلى النشاط الفرعي:", error);
      throw error;
    }
  },

  async getAllByStore(storeId: string): Promise<SubBusinessCategory[]> {
    try {
      const q = query(
        collection(db, "subBusinessCategories"),
        where("storeId", "==", storeId),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as SubBusinessCategory,
      );
    } catch (error) {
      console.error("❌ خطأ في جلب فئات الأنشطة الفرعية:", error);
      return [];
    }
  },
};
// تصدير الدوال المساعدة
export const getSubBusinessCategories =
  subBusinessCategoryService.getBySubBusinessType;
export const addCategoryToSubBusiness =
  subBusinessCategoryService.addCategoryToSubBusiness;
export const updateCategoryInSubBusiness =
  subBusinessCategoryService.updateCategoryInSubBusiness;
export const deleteCategoryFromSubBusiness =
  subBusinessCategoryService.deleteCategoryFromSubBusiness;
