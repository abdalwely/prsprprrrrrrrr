// // hooks/use-categories.ts
// import { useState, useEffect } from "react";
// import {
//   getStoreCategoriesByStoreId,
//   getCategoriesBySubBusinessType,
//   createCategory,
//   updateCategory,
//   deleteCategorySafely,
//   toggleCategoryStatus,
//   updateCategoriesOrder,
//   mergeCategories,
//   exportCategories,
//   importCategories,
//   Category,
//   CreateCategoryData,
//   CategoryUpdateData,
// } from "@/lib/firestore";

// export default function useCategories(storeId: string) {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // جلب جميع الفئات للمتجر
//   const loadCategories = async (subBusinessType?: string) => {
//     try {
//       setLoading(true);
//       let data;

//       if (subBusinessType && subBusinessType !== "all") {
//         // جلب الفئات حسب النشاط الفرعي
//         data = await getCategoriesBySubBusinessType(storeId, subBusinessType);
//       } else {
//         // جلب جميع الفئات
//         data = await getStoreCategoriesByStoreId(storeId);
//       }

//       setCategories(data);
//       setError(null);
//     } catch (err) {
//       setError("فشل في تحميل الفئات");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // إنشاء فئة جديدة
//   const handleCreateCategory = async (categoryData: CreateCategoryData) => {
//     try {
//       const newCategory = await createCategory(categoryData);
//       await loadCategories(); // إعادة تحميل القائمة
//       return newCategory;
//     } catch (err) {
//       throw err;
//     }
//   };

//   // تحديث فئة
//   const handleUpdateCategory = async (
//     categoryId: string,
//     updates: CategoryUpdateData,
//   ) => {
//     try {
//       await updateCategory(categoryId, updates);
//       await loadCategories();
//     } catch (err) {
//       throw err;
//     }
//   };

//   // حذف فئة (آمن)
//   const handleDeleteCategory = async (
//     categoryId: string,
//     moveToCategoryId?: string,
//   ) => {
//     try {
//       await deleteCategorySafely(categoryId, moveToCategoryId);
//       await loadCategories();
//     } catch (err) {
//       throw err;
//     }
//   };

//   // تغيير حالة الفئة
//   const handleToggleStatus = async (categoryId: string, isActive: boolean) => {
//     try {
//       await toggleCategoryStatus(categoryId, isActive);
//       await loadCategories();
//     } catch (err) {
//       throw err;
//     }
//   };

//   // تحديث ترتيب الفئات
//   const handleReorder = async (orderedIds: string[]) => {
//     try {
//       const orderUpdates = orderedIds.map((id, index) => ({
//         id,
//         order: index,
//       }));
//       await updateCategoriesOrder(storeId, orderUpdates);
//       await loadCategories();
//     } catch (err) {
//       throw err;
//     }
//   };

//   // دمج الفئات
//   const handleMerge = async (
//     sourceId: string,
//     targetId: string,
//     moveProducts: boolean = true,
//   ) => {
//     try {
//       await mergeCategories({
//         sourceCategoryId: sourceId,
//         targetCategoryId: targetId,
//         moveProducts,
//       });
//       await loadCategories();
//     } catch (err) {
//       throw err;
//     }
//   };

//   // تصدير الفئات
//   const handleExport = async (
//     format: "json" | "csv",
//     subBusinessType?: string,
//   ) => {
//     try {
//       const data = await exportCategories(storeId, subBusinessType, format);

//       if (format === "json") {
//         const blob = new Blob([JSON.stringify(data, null, 2)], {
//           type: "application/json",
//         });
//         downloadBlob(blob, `categories-${storeId}.json`);
//       }

//       return data;
//     } catch (err) {
//       throw err;
//     }
//   };

//   // استيراد الفئات
//   const handleImport = async (
//     subBusinessType: string,
//     categoriesData: Array<{ name: string; description?: string }>,
//   ) => {
//     try {
//       await importCategories(storeId, {
//         subBusinessType,
//         categories: categoriesData,
//       });
//       await loadCategories();
//     } catch (err) {
//       throw err;
//     }
//   };

//   // التهيئة التلقائية عند تغيير المتجر
//   useEffect(() => {
//     if (storeId) {
//       loadCategories();
//     }
//   }, [storeId]);

//   return {
//     categories,
//     loading,
//     error,
//     loadCategories,
//     createCategory: handleCreateCategory,
//     updateCategory: handleUpdateCategory,
//     deleteCategory: handleDeleteCategory,
//     toggleStatus: handleToggleStatus,
//     reorder: handleReorder,
//     merge: handleMerge,
//     exportCategories: handleExport,
//     importCategories: handleImport,
//   };
// }
