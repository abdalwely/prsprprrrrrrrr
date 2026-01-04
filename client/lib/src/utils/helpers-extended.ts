import {
  query,
  collection,
  where,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { categoryService } from "../services/category";
import { productService } from "../services/product";
import { subBusinessCategoryService } from "../services/sub-business-category";
import { getCategoriesForSubBusinessType } from "./helpers";
import { ComplianceStatus } from "../types/compliance.types";

// ============ دوال المساعدة الإضافية ============

export async function updateCategoryComprehensive(
  categoryId: string,
  updateData: any,
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
  categoryData: any,
): Promise<string> {
  try {
    const existingCategories = await categoryService.getByStore(
      categoryData.storeId,
      { includeInactive: true },
    );

    const duplicate = existingCategories.find(
      (cat: any) => cat.name.toLowerCase() === categoryData.name.toLowerCase(),
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
    } as any);

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
  importData: any,
): Promise<string[]> {
  try {
    const existingCategories = await categoryService.getByStore(storeId, {
      includeInactive: true,
    });

    const existingNames = new Set(
      existingCategories.map((cat: any) => cat.name.toLowerCase()),
    );

    const uniqueCategories = importData.categories.filter(
      (cat: any) => !existingNames.has(cat.name.toLowerCase()),
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
            (sum: number, cat: any) => sum + cat.productCount,
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
        const rows = categories.map((cat: any) => [
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
  mergeData: any,
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
          defaultCategories.map((cat: any) => ({
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

export async function fixAgricultureComplianceIssues(storeId: string): Promise<{
  success: boolean;
  fixedProducts: number;
  failedProducts: number;
  details: Array<{
    productId: string;
    productName: string;
    oldStatus: ComplianceStatus;
    newStatus: ComplianceStatus;
    fixed: boolean;
    error?: string;
  }>;
}> {
  try {
    console.log(`🔧 بدء إصلاح المشاكل الزراعية للمتجر: ${storeId}`);

    const results = {
      success: true,
      fixedProducts: 0,
      failedProducts: 0,
      details: [] as Array<{
        productId: string;
        productName: string;
        oldStatus: ComplianceStatus;
        newStatus: ComplianceStatus;
        fixed: boolean;
        error?: string;
      }>,
    };

    // جلب المتجر
    const { storeService } = await import("../services/store");
    const store = await storeService.getById(storeId);
    if (!store) {
      throw new Error("المتجر غير موجود");
    }

    // جلب جميع المنتجات
    const products = await productService.getByStore(storeId, "all");

    // استخراج أنشطة المتجر
    const storeActivities = (() => {
      const activities: string[] = [];
      if (store.businessActivities?.mainActivity)
        activities.push(store.businessActivities.mainActivity);
      if (store.businessActivities?.subActivities)
        activities.push(...store.businessActivities.subActivities);
      if (store.industry) activities.push(store.industry);
      return activities.map((a) => a.toLowerCase());
    })();

    console.log(
      `🔍 فحص ${products.length} منتج لأنشطة المتجر:`,
      storeActivities,
    );

    // معالجة كل منتج
    for (const product of products) {
      try {
        const productId = product.id;
        const productName = product.name;
        const oldStatus =
          product._semantics?.complianceStatus ||
          ComplianceStatus.PENDING_REVIEW;

        // التحقق إذا كان المنتج زراعي
        const isAgricultureProduct =
          product._semantics?.detectedActivity === "agriculture" ||
          product.name?.toLowerCase().includes("بذور") ||
          product.name?.toLowerCase().includes("زراع") ||
          product.name?.toLowerCase().includes("سماد") ||
          (product.tags || []).some((tag) => tag.includes("زراعة"));

        if (isAgricultureProduct) {
          // التحقق من التوافق
          const { checkActivityCompatibility } = await import(
            "../constants/activity-map"
          );
          const isCompatible = checkActivityCompatibility(
            "agriculture",
            storeActivities,
          );

          let newStatus = oldStatus;

          if (isCompatible && oldStatus === ComplianceStatus.NON_COMPLIANT) {
            // المنتج زراعي والمتجر زراعي - تصحيح الحالة
            newStatus = ComplianceStatus.COMPLIANT;

            // تحديث المنتج
            await productService.update(productId, {
              _semantics: {
                ...product._semantics,
                complianceStatus: newStatus,
                validationFlags: (
                  product._semantics?.validationFlags || []
                ).filter((flag: string) => !flag.includes("غير مسجل للمتجر")),
                updatedAt: new Date(),
              },
            } as any);

            results.fixedProducts++;

            console.log(`✅ تم إصلاح: ${productName}`, {
              oldStatus,
              newStatus,
              storeActivities,
            });
          }

          results.details.push({
            productId,
            productName,
            oldStatus,
            newStatus,
            fixed: isCompatible && oldStatus === ComplianceStatus.NON_COMPLIANT,
          });
        }
      } catch (error: any) {
        results.failedProducts++;
        results.success = false;

        results.details.push({
          productId: product.id,
          productName: product.name,
          oldStatus:
            product._semantics?.complianceStatus ||
            ComplianceStatus.PENDING_REVIEW,
          newStatus:
            product._semantics?.complianceStatus ||
            ComplianceStatus.PENDING_REVIEW,
          fixed: false,
          error: error.message,
        });

        console.error(`❌ خطأ في إصلاح المنتج ${product.id}:`, error);
      }
    }

    console.log(`🎉 اكتمل الإصلاح الزراعي:`, {
      storeId,
      totalProducts: products.length,
      fixed: results.fixedProducts,
      failed: results.failedProducts,
    });

    return results;
  } catch (error: any) {
    console.error("❌ خطأ عام في إصلاح المشاكل الزراعية:", error);
    return {
      success: false,
      fixedProducts: 0,
      failedProducts: 0,
      details: [],
    };
  }
}
