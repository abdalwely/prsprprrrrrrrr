// // components/merchant/products/CategoryManager/CategoryManager.tsx
// import React, { useState } from "react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Layers,
//   Grid,
//   Upload,
//   Download,
//   Merge,
//   Copy,
//   Trash2,
//   Eye,
//   Edit,
// } from "lucide-react";

// // المكونات الفرعية
// import CategoryList from "./CategoryList";
// import CategoryForm from "./CategoryForm";
// import ImportExport from "./ImportExport";
// import BulkActions from "./BulkActions";
// import CategoryStats from "./CategoryStats";

// interface CategoryManagerProps {
//   storeId: string;
//   products: Product[];
//   categories: Category[];
//   onRefresh: () => void;
// }

// export default function CategoryManager({
//   storeId,
//   products,
//   categories,
//   onRefresh,
// }: CategoryManagerProps) {
//   const [activeTab, setActiveTab] = useState("list");
//   const [selectedCategory, setSelectedCategory] = useState<Category | null>(
//     null,
//   );
//   const [selectedIds, setSelectedIds] = useState<string[]>([]);

//   // حساب الإحصائيات
//   const stats = {
//     totalCategories: categories.length,
//     activeCategories: categories.filter((c) => c.isActive).length,
//     categoriesWithProducts: categories.filter((c) =>
//       products.some((p) => p.category === c.id),
//     ).length,
//     productsWithoutCategory: products.filter((p) => !p.category).length,
//   };

//   return (
//     <>
//       {/* شريط العنوان والإحصائيات */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h2 className="text-2xl font-bold">مدير الفئات</h2>
//           <p className="text-muted-foreground">
//             إدارة {stats.totalCategories} فئة في متجرك
//           </p>
//         </div>
//         <div className="flex gap-2">
//           <Button
//             variant={activeTab === "list" ? "default" : "outline"}
//             onClick={() => setActiveTab("list")}
//           >
//             <Grid className="h-4 w-4 ml-2" />
//             عرض الفئات
//           </Button>
//           <Button
//             variant={activeTab === "add" ? "default" : "outline"}
//             onClick={() => setActiveTab("add")}
//           >
//             <Layers className="h-4 w-4 ml-2" />
//             إضافة فئة
//           </Button>
//           <Button
//             variant={activeTab === "bulk" ? "default" : "outline"}
//             onClick={() => setActiveTab("bulk")}
//           >
//             <Copy className="h-4 w-4 ml-2" />
//             إجراءات جماعية
//           </Button>
//         </div>
//       </div>

//       {/* إحصائيات سريعة */}
//       <CategoryStats stats={stats} />

//       {/* محتوى التبويبات */}
//       <div className="mt-6">
//         {activeTab === "list" && (
//           <CategoryList
//             storeId={storeId}
//             categories={categories}
//             products={products}
//             onSelectCategory={setSelectedCategory}
//             selectedIds={selectedIds}
//             onSelectIds={setSelectedIds}
//             onRefresh={onRefresh}
//           />
//         )}

//         {activeTab === "add" && (
//           <CategoryForm
//             storeId={storeId}
//             category={selectedCategory}
//             onSuccess={() => {
//               setSelectedCategory(null);
//               onRefresh();
//             }}
//             onCancel={() => {
//               setSelectedCategory(null);
//               setActiveTab("list");
//             }}
//           />
//         )}

//         {activeTab === "bulk" && (
//           <BulkActions
//             storeId={storeId}
//             selectedIds={selectedIds}
//             categories={categories}
//             onSuccess={onRefresh}
//           />
//         )}
//       </div>

//       {/* شريط الأدوات السفلي */}
//       {selectedIds.length > 0 && (
//         <div className="fixed bottom-6 right-6 bg-white p-4 rounded-lg shadow-lg border">
//           <div className="flex items-center gap-4">
//             <span className="font-medium">{selectedIds.length} فئة محددة</span>
//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => {
//                   // تفعيل/تعطيل جماعي
//                 }}
//               >
//                 <Eye className="h-4 w-4 ml-2" />
//                 تغيير الحالة
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => {
//                   // دمج الفئات
//                 }}
//               >
//                 <Merge className="h-4 w-4 ml-2" />
//                 دمج
//               </Button>
//               <Button
//                 variant="destructive"
//                 size="sm"
//                 onClick={() => {
//                   // حذف جماعي
//                 }}
//               >
//                 <Trash2 className="h-4 w-4 ml-2" />
//                 حذف
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
