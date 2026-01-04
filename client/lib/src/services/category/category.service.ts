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
  orderBy,
  writeBatch,
  Timestamp,
} from "firebase/firestore";

import { productService } from "../product";
import { cleanFirestoreData } from "../../utils";
import {
  Category,
  CategoryUpdateData,
  CreateCategoryData,
  ImportCategoriesData,
  MergeCategoriesData,
} from "../../types";
import { db } from "../../firebase/firebase";
import { subBusinessCategoryService } from "../sub-business-category";

export const categoryService = {
  async create(
    categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const cleanedData = cleanFirestoreData({
      ...categoryData,
      uiProperties: categoryData.uiProperties || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("📝 إنشاء فئة جديدة:", {
      name: categoryData.name,
      storeId: categoryData.storeId,
      hasUIProperties: !!cleanedData.uiProperties,
    });

    const docRef = await addDoc(collection(db, "categories"), cleanedData);
    return docRef.id;
  },

  async getById(categoryId: string): Promise<Category | null> {
    try {
      const docSnap = await getDoc(doc(db, "categories", categoryId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { id: docSnap.id, ...data } as Category;
      }
      return null;
    } catch (error) {
      console.error("Error getting category by ID:", error);
      return null;
    }
  },

  async getByStore(
    storeId: string,
    filters?: {
      parentId?: string;
      includeInactive?: boolean;
      uiProperty?: {
        key: keyof Category["uiProperties"];
        value: any;
      };
    },
  ): Promise<Category[]> {
    try {
      const constraints: any[] = [where("storeId", "==", storeId)];

      if (!filters?.includeInactive) {
        constraints.push(where("isActive", "==", true));
      }

      if (filters?.parentId !== undefined) {
        constraints.push(where("parentId", "==", filters.parentId));
      }

      const q = query(collection(db, "categories"), ...constraints);
      const querySnapshot = await getDocs(q);

      let categories = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Category,
      );

      if (filters?.uiProperty) {
        const { key, value } = filters.uiProperty;
        categories = categories.filter(
          (category) => category.uiProperties?.[key] === value,
        );
      }

      categories = categories.sort((a, b) => a.order - b.order);

      return categories;
    } catch (error) {
      console.error("Error getting categories by store:", error);
      return [];
    }
  },

  async update(categoryId: string, data: Partial<Category>): Promise<void> {
    try {
      const currentCategory = await this.getById(categoryId);
      if (!currentCategory) {
        throw new Error("الفئة غير موجودة");
      }

      if (data.name && data.name !== currentCategory.name) {
        const existingCategories = await this.getByStore(
          currentCategory.storeId,
          { includeInactive: true },
        );

        const nameExists = existingCategories.some(
          (cat) => cat.name === data.name && cat.id !== categoryId,
        );

        if (nameExists) {
          throw new Error("هذا الاسم مستخدم بالفعل");
        }
      }

      const cleanedData = cleanFirestoreData({
        ...data,
        updatedAt: new Date(),
      });

      await updateDoc(doc(db, "categories", categoryId), cleanedData);

      console.log("✅ تم تحديث الفئة:", {
        categoryId,
        name: data.name || currentCategory.name,
      });
    } catch (error) {
      console.error("❌ خطأ في تحديث الفئة:", error);
      throw error;
    }
  },

  async delete(categoryId: string): Promise<void> {
    try {
      const currentCategory = await this.getById(categoryId);
      if (!currentCategory) {
        throw new Error("الفئة غير موجودة");
      }

      const products = await productService.getByStore(
        currentCategory.storeId,
        "all",
      );
      const productsInCategory = products.filter(
        (product) => product.category === categoryId,
      );

      if (productsInCategory.length > 0) {
        throw new Error(
          `لا يمكن حذف الفئة لأنها تحتوي على ${productsInCategory.length} منتج`,
        );
      }

      const subCategories = await this.getByStore(currentCategory.storeId, {
        parentId: categoryId,
        includeInactive: true,
      });

      if (subCategories.length > 0) {
        throw new Error(
          `لا يمكن حذف الفئة لأنها تحتوي على ${subCategories.length} فئة فرعية`,
        );
      }

      await deleteDoc(doc(db, "categories", categoryId));

      console.log("✅ تم حذف الفئة:", {
        categoryId,
        name: currentCategory.name,
      });
    } catch (error) {
      console.error("❌ خطأ في حذف الفئة:", error);
      throw error;
    }
  },

  async deleteSafely(
    categoryId: string,
    moveToCategoryId?: string,
  ): Promise<void> {
    try {
      const currentCategory = await this.getById(categoryId);
      if (!currentCategory) {
        throw new Error("الفئة غير موجودة");
      }

      if (moveToCategoryId) {
        const targetCategory = await this.getById(moveToCategoryId);
        if (!targetCategory) {
          throw new Error("الفئة الهدف غير موجودة");
        }

        const products = await productService.getByStore(
          currentCategory.storeId,
          "all",
        );
        const productsToUpdate = products.filter(
          (product) => product.category === categoryId,
        );

        const batch = writeBatch(db);
        for (const product of productsToUpdate) {
          const productRef = doc(db, "products", product.id);
          batch.update(productRef, {
            category: moveToCategoryId,
            updatedAt: Timestamp.now(),
          });
        }

        if (productsToUpdate.length > 0) {
          await batch.commit();
          console.log(
            `📦 تم نقل ${productsToUpdate.length} منتج إلى الفئة الجديدة`,
          );
        }
      }

      await deleteDoc(doc(db, "categories", categoryId));

      console.log("✅ تم حذف الفئة بأمان:", {
        categoryId,
        name: currentCategory.name,
      });
    } catch (error) {
      console.error("❌ خطأ في الحذف الآمن للفئة:", error);
      throw error;
    }
  },

  async getAllCategoriesWithDetails(
    storeId: string,
  ): Promise<Array<Category & { productCount: number }>> {
    try {
      // استخدام getStoreCategoriesByStoreId مباشرة
      const categories = await this.getByStore(storeId, {
        includeInactive: true,
      });

      const products = await productService.getByStore(storeId, "all");

      const categoriesWithCounts = categories.map((category) => {
        const productCount = products.filter(
          (product) => product.category === category.id,
        ).length;

        return {
          ...category,
          productCount,
        };
      });

      return categoriesWithCounts;
    } catch (error) {
      console.error("❌ خطأ في جلب الفئات مع التفاصيل:", error);
      return [];
    }
  },

  async updateCategoriesOrder(
    storeId: string,
    categoryOrder: Array<{ id: string; order: number }>,
  ): Promise<void> {
    try {
      const batch = writeBatch(db);

      for (const { id, order } of categoryOrder) {
        const categoryRef = doc(db, "categories", id);
        batch.update(categoryRef, {
          order,
          updatedAt: new Date(),
        });
      }

      await batch.commit();
    } catch (error) {
      console.error("❌ خطأ في تحديث ترتيب الفئات:", error);
      throw error;
    }
  },

  async toggleCategoryStatus(
    categoryId: string,
    isActive: boolean,
  ): Promise<void> {
    try {
      const currentCategory = await this.getById(categoryId);
      if (!currentCategory) {
        throw new Error("الفئة غير موجودة");
      }

      if (!isActive) {
        const products = await productService.getByStore(
          currentCategory.storeId,
          "all",
        );
        const productsInCategory = products.filter(
          (product) => product.category === categoryId,
        );

        if (productsInCategory.length > 0) {
          throw new Error(
            `لا يمكن تعطيل الفئة لأنها تحتوي على ${productsInCategory.length} منتج`,
          );
        }
      }

      await updateDoc(doc(db, "categories", categoryId), {
        isActive,
        updatedAt: new Date(),
      });

      console.log("✅ تم تغيير حالة الفئة:", {
        categoryId,
        name: currentCategory.name,
        newStatus: isActive ? "نشطة" : "معطلة",
      });
    } catch (error) {
      console.error("❌ خطأ في تغيير حالة الفئة:", error);
      throw error;
    }
  },

  async mergeCategories(
    sourceCategoryId: string,
    targetCategoryId: string,
  ): Promise<void> {
    try {
      const sourceCategory = await this.getById(sourceCategoryId);
      const targetCategory = await this.getById(targetCategoryId);

      if (!sourceCategory || !targetCategory) {
        throw new Error("إحدى الفئات غير موجودة");
      }

      if (sourceCategory.storeId !== targetCategory.storeId) {
        throw new Error("الفئات تابعة لمتاجر مختلفة");
      }

      const products = await productService.getByStore(
        sourceCategory.storeId,
        "all",
      );
      const productsToUpdate = products.filter(
        (product) => product.category === sourceCategoryId,
      );

      const batch = writeBatch(db);
      for (const product of productsToUpdate) {
        const productRef = doc(db, "products", product.id);
        batch.update(productRef, {
          category: targetCategoryId,
          updatedAt: Timestamp.now(),
        });
      }

      const subCategories = await this.getByStore(sourceCategory.storeId, {
        parentId: sourceCategoryId,
        includeInactive: true,
      });

      for (const subCategory of subCategories) {
        const subCategoryRef = doc(db, "categories", subCategory.id);
        batch.update(subCategoryRef, {
          parentId: targetCategoryId,
          updatedAt: new Date(),
        });
      }

      batch.delete(doc(db, "categories", sourceCategoryId));

      await batch.commit();

      console.log("✅ تم دمج الفئات:", {
        sourceCategory: sourceCategory.name,
        targetCategory: targetCategory.name,
        movedProducts: productsToUpdate.length,
      });
    } catch (error) {
      console.error("❌ خطأ في دمج الفئات:", error);
      throw error;
    }
  },

  async createSubCategory(
    parentCategoryId: string,
    categoryData: Omit<Category, "id" | "createdAt" | "updatedAt" | "parentId">,
  ): Promise<string> {
    try {
      const parentCategory = await this.getById(parentCategoryId);
      if (!parentCategory) {
        throw new Error("الفئة الرئيسية غير موجودة");
      }

      const subCategoryData: Omit<Category, "id" | "createdAt" | "updatedAt"> =
        {
          ...categoryData,
          parentId: parentCategoryId,
          storeId: parentCategory.storeId,
        };

      return await this.create(subCategoryData);
    } catch (error) {
      console.error("❌ خطأ في إنشاء الفئة الفرعية:", error);
      throw error;
    }
  },

  async importFromTemplate(
    storeId: string,
    categories: Array<{
      name: string;
      description?: string;
      order?: number;
      uiProperties?: Category["uiProperties"];
    }>,
  ): Promise<string[]> {
    try {
      const createdIds: string[] = [];

      for (const cat of categories) {
        const categoryId = await this.create({
          storeId,
          name: cat.name,
          description: cat.description || "",
          order: cat.order || 0,
          uiProperties: cat.uiProperties,
          isActive: true,
        });

        createdIds.push(categoryId);
      }

      console.log("✅ تم استيراد الفئات:", {
        storeId,
        count: createdIds.length,
      });

      return createdIds;
    } catch (error) {
      console.error("❌ خطأ في استيراد الفئات:", error);
      throw error;
    }
  },

  async exportCategories(storeId: string): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      order: number;
      isActive: boolean;
      createdAt: Date;
      productCount: number;
      uiProperties?: Category["uiProperties"];
    }>
  > {
    try {
      const categories = await this.getByStore(storeId, {
        includeInactive: true,
      });
      const products = await productService.getByStore(storeId, "all");

      const result = categories.map((category) => {
        const productCount = products.filter(
          (product) => product.category === category.id,
        ).length;

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          order: category.order,
          isActive: category.isActive,
          createdAt: category.createdAt,
          productCount,
          uiProperties: category.uiProperties,
        };
      });

      return result;
    } catch (error) {
      console.error("❌ خطأ في تصدير الفئات:", error);
      return [];
    }
  },
};

// ============ دوال مساعدة لتعديل الفئات ============

export async function updateCategoryComprehensive(
  categoryId: string,
  updateData: CategoryUpdateData,
): Promise<void> {
  try {
    const category = await categoryService.getById(categoryId);
    if (!category) {
      throw new Error("الفئة غير موجودة");
    }

    await categoryService.update(categoryId, updateData);

    console.log("✅ تم التحديث الشامل للفئة:", {
      categoryId,
      name: updateData.name || category.name,
    });
  } catch (error) {
    console.error("❌ خطأ في التحديث الشامل للفئة:", error);
    throw error;
  }
}

export async function createCategoryWithValidation(
  categoryData: CreateCategoryData,
): Promise<string> {
  try {
    const existingCategories = await categoryService.getByStore(
      categoryData.storeId,
      { includeInactive: true },
    );

    const duplicate = existingCategories.find(
      (cat) => cat.name.toLowerCase() === categoryData.name.toLowerCase(),
    );

    if (duplicate) {
      throw new Error("هذا الاسم مستخدم بالفعل");
    }

    const categoryId = await categoryService.create({
      ...categoryData,
      isActive: categoryData.isActive ?? true,
      order: categoryData.order || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Omit<Category, "id">);

    console.log("✅ تم إنشاء فئة جديدة:", {
      categoryId,
      name: categoryData.name,
      storeId: categoryData.storeId,
    });

    return categoryId;
  } catch (error) {
    console.error("❌ خطأ في إنشاء الفئة:", error);
    throw error;
  }
}

export async function importCategoriesWithValidation(
  storeId: string,
  importData: ImportCategoriesData,
): Promise<string[]> {
  try {
    const existingCategories = await categoryService.getByStore(storeId, {
      includeInactive: true,
    });

    const existingNames = new Set(
      existingCategories.map((cat) => cat.name.toLowerCase()),
    );

    const uniqueCategories = importData.categories.filter(
      (cat) => !existingNames.has(cat.name.toLowerCase()),
    );

    if (uniqueCategories.length === 0) {
      throw new Error("جميع الفئات موجودة بالفعل");
    }

    const importedIds = await categoryService.importFromTemplate(
      storeId,
      uniqueCategories,
    );

    console.log("✅ تم استيراد الفئات:", {
      storeId,
      imported: importedIds.length,
      skipped: importData.categories.length - uniqueCategories.length,
    });

    return importedIds;
  } catch (error) {
    console.error("❌ خطأ في استيراد الفئات:", error);
    throw error;
  }
}

export async function exportCategoriesFormatted(
  storeId: string,
  format: "json" | "csv" | "excel" = "json",
): Promise<any> {
  try {
    const categories = await categoryService.exportCategories(storeId);

    switch (format) {
      case "json":
        return {
          storeId,
          categories,
          exportDate: new Date(),
          totalCategories: categories.length,
          totalProducts: categories.reduce(
            (sum, cat) => sum + cat.productCount,
            0,
          ),
        };

      case "csv":
        const headers = [
          "ID",
          "الاسم",
          "الوصف",
          "الترتيب",
          "الحالة",
          "عدد المنتجات",
          "تاريخ الإنشاء",
        ];
        const rows = categories.map((cat) => [
          cat.id,
          cat.name,
          cat.description,
          cat.order,
          cat.isActive ? "نشطة" : "معطلة",
          cat.productCount,
          cat.createdAt.toISOString(),
        ]);

        return {
          headers,
          rows,
          total: categories.length,
        };

      case "excel":
        return {
          storeId,
          categories,
          message: "تنسيق Excel متاح مع إضافة مكتبة مناسبة",
        };

      default:
        return categories;
    }
  } catch (error) {
    console.error("❌ خطأ في تصدير الفئات:", error);
    throw error;
  }
}

export async function mergeCategoriesWithValidation(
  mergeData: MergeCategoriesData,
): Promise<void> {
  try {
    const sourceCategory = await categoryService.getById(
      mergeData.sourceCategoryId,
    );
    const targetCategory = await categoryService.getById(
      mergeData.targetCategoryId,
    );

    if (!sourceCategory || !targetCategory) {
      throw new Error("إحدى الفئات غير موجودة");
    }

    if (sourceCategory.storeId !== targetCategory.storeId) {
      throw new Error("الفئات تابعة لمتاجر مختلفة");
    }

    await categoryService.mergeCategories(
      mergeData.sourceCategoryId,
      mergeData.targetCategoryId,
    );

    console.log("✅ تم دمج الفئات:", {
      source: sourceCategory.name,
      target: targetCategory.name,
      storeId: sourceCategory.storeId,
    });
  } catch (error) {
    console.error("❌ خطأ في دمج الفئات:", error);
    throw error;
  }
}

export async function copyCategoriesToSubBusiness(
  storeId: string,
  sourceSubBusinessType: string,
  targetSubBusinessType: string,
): Promise<string[]> {
  try {
    const sourceCategories = await categoryService.getByStore(storeId, {
      includeInactive: true,
    });

    if (sourceCategories.length === 0) {
      throw new Error("لا توجد فئات في النشاط الفرعي المصدر");
    }

    const createdIds: string[] = [];

    for (const sourceCat of sourceCategories) {
      const categoryId = await categoryService.create({
        storeId,
        name: sourceCat.name,
        description: sourceCat.description,
        image: sourceCat.image,
        order: sourceCat.order,
        parentId: sourceCat.parentId,
        isActive: sourceCat.isActive,
      });

      createdIds.push(categoryId);
    }

    console.log("✅ تم نسخ الفئات:", {
      storeId,
      from: sourceSubBusinessType,
      to: targetSubBusinessType,
      count: createdIds.length,
    });

    return createdIds;
  } catch (error) {
    console.error("❌ خطأ في نسخ الفئات:", error);
    throw error;
  }
}

export async function getCategoriesForSubBusinessType(
  storeId: string,
  subBusinessType: string,
): Promise<Array<{ id: string; name: string; description?: string }>> {
  try {
    const subBusinessCat =
      await subBusinessCategoryService.getBySubBusinessType(
        storeId,
        subBusinessType,
      );

    if (subBusinessCat && subBusinessCat.categories.length > 0) {
      return subBusinessCat.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
      }));
    }

    const regularCategories = await categoryService.getByStore(storeId, {
      includeInactive: true,
    });

    if (regularCategories.length > 0) {
      return regularCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
      }));
    }

    const defaultCategories: Record<
      string,
      Array<{ name: string; description?: string }>
    > = {
      restaurant: [
        { name: "أطباق رئيسية", description: "الأطباق الرئيسية في المطعم" },
        { name: "مقبلات", description: "مقبلات ووجبات خفيفة" },
        { name: "حلويات", description: "حلويات ومشروبات حلوة" },
        { name: "مشروبات", description: "مشروبات ساخنة وباردة" },
      ],
      cafe: [
        { name: "مشروبات ساخنة", description: "قهوة، شاي، مشروبات ساخنة" },
        { name: "مشروبات باردة", description: "عصائر، مشروبات مثلجة" },
        { name: "حلويات", description: "حلويات وكيكات" },
        { name: "وجبات خفيفة", description: "سناك ومقبلات" },
      ],
      grocery: [
        { name: "معلبات", description: "أغذية معلبة" },
        { name: "مشروبات", description: "مشروبات متنوعة" },
        { name: "سناكات", description: "وجبات خفيفة" },
        { name: "بهارات", description: "بهارات وتوابل" },
      ],
    };

    const categories = defaultCategories[subBusinessType] || [
      { name: "عام", description: "فئة عامة" },
      { name: "مميز", description: "منتجات مميزة" },
      { name: "جديد", description: "منتجات جديدة" },
      { name: "غير مصنف", description: "بدون تصنيف" },
    ];

    return categories.map((cat, index) => ({
      id: `default_${subBusinessType}_${index}`,
      ...cat,
    }));
  } catch (error) {
    console.error("❌ خطأ في جلب الفئات للنشاط الفرعي:", error);
    return [
      { id: "default_1", name: "عام", description: "فئة عامة" },
      { id: "default_2", name: "مميز", description: "منتجات مميزة" },
    ];
  }
}

export async function saveCustomCategoriesForSubBusinessType(
  storeId: string,
  subBusinessType: string,
  categories: Array<{ name: string; description?: string }>,
): Promise<string> {
  return subBusinessCategoryService.createOrUpdate(
    storeId,
    subBusinessType,
    categories,
  );
}

export async function initializeStoreCategories(
  storeId: string,
  subBusinessTypes: string[],
): Promise<void> {
  try {
    console.log("🔄 تهيئة الفئات للنشاطات الفرعية:", subBusinessTypes);

    for (const subType of subBusinessTypes) {
      const defaultCategories = await getCategoriesForSubBusinessType(
        storeId,
        subType,
      );

      if (defaultCategories.length > 0) {
        await saveCustomCategoriesForSubBusinessType(
          storeId,
          subType,
          defaultCategories.map((cat) => ({
            name: cat.name,
            description: cat.description,
          })),
        );

        for (const cat of defaultCategories) {
          await categoryService.create({
            storeId,
            name: cat.name,
            description: cat.description || "",
            order: defaultCategories.indexOf(cat),
            isActive: true,
          });
        }
      }
    }

    console.log("✅ تم تهيئة الفئات للنشاطات الفرعية");
  } catch (error) {
    console.error("❌ خطأ في تهيئة الفئات:", error);
  }
}

export const createCategory = categoryService.create;
export const getCategoryById = categoryService.getById;
export const getStoreCategoriesByStoreId = categoryService.getByStore;
// ⭐ هذا هو التصحيح المهم:
export const updateCategory = categoryService.update.bind(categoryService);
export const deleteCategory = categoryService.delete.bind(categoryService);
export const deleteCategorySafely =
  categoryService.deleteSafely.bind(categoryService);
export const toggleCategoryStatus =
  categoryService.toggleCategoryStatus.bind(categoryService);
export const updateCategoriesOrder =
  categoryService.updateCategoriesOrder.bind(categoryService);
export const getAllCategoriesWithDetails =
  categoryService.getAllCategoriesWithDetails;
export const createSubCategory = categoryService.createSubCategory;
export const mergeCategories = categoryService.mergeCategories;
export const importCategories = categoryService.importFromTemplate;
export const exportCategories = categoryService.exportCategories;
