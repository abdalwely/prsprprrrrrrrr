// // CategoryForm.tsx
// import React, { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useStore } from "@/contexts/StoreContext";
// import { useToast } from "@/hooks/use-toast";
// import { createCategory, updateCategory } from "@/lib/firestore";

// interface CategoryFormProps {
//   storeId: string;
//   category?: Category | null;
//   onSuccess: () => void;
//   onCancel: () => void;
// }

// export default function CategoryForm({
//   storeId,
//   category,
//   onSuccess,
//   onCancel,
// }: CategoryFormProps) {
//   const { toast } = useToast();
//   const { store: currentStore } = useStore();

//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     subBusinessType: "",
//     order: 0,
//     isActive: true,
//   });

//   const [loading, setLoading] = useState(false);

//   // ملء البيانات عند التعديل
//   useEffect(() => {
//     if (category) {
//       setFormData({
//         name: category.name,
//         description: category.description,
//         subBusinessType: category.subBusinessType || "",
//         order: category.order,
//         isActive: category.isActive,
//       });
//     } else {
//       // قيم افتراضية جديدة
//       const lastOrder = Math.max(
//         ...(currentStore?.categories?.map((c) => c.order) || [0]),
//       );
//       setFormData({
//         name: "",
//         description: "",
//         subBusinessType: currentStore?.subBusinessTypes?.[0] || "",
//         order: lastOrder + 1,
//         isActive: true,
//       });
//     }
//   }, [category, currentStore]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.name.trim()) {
//       toast({
//         title: "خطأ في الإدخال",
//         description: "يرجى إدخال اسم الفئة",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       setLoading(true);

//       const categoryData = {
//         storeId,
//         name: formData.name.trim(),
//         description: formData.description.trim(),
//         subBusinessType: formData.subBusinessType || undefined,
//         order: formData.order,
//         isActive: formData.isActive,
//       };

//       if (category) {
//         // تحديث الفئة
//         await updateCategory(category.id, categoryData);
//         toast({
//           title: "تم التحديث",
//           description: "تم تحديث الفئة بنجاح",
//         });
//       } else {
//         // إنشاء فئة جديدة
//         await createCategory(categoryData);
//         toast({
//           title: "تم الإنشاء",
//           description: "تم إنشاء الفئة بنجاح",
//         });
//       }

//       onSuccess();
//     } catch (error) {
//       toast({
//         title: "خطأ",
//         description: error.message || "حدث خطأ أثناء الحفظ",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (field: string, value: any) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>{category ? "تعديل الفئة" : "إضافة فئة جديدة"}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* معلومات أساسية */}
//           <div className="space-y-4">
//             <div>
//               <Label htmlFor="name">اسم الفئة *</Label>
//               <Input
//                 id="name"
//                 value={formData.name}
//                 onChange={(e) => handleChange("name", e.target.value)}
//                 placeholder="أدخل اسم الفئة"
//                 required
//               />
//             </div>

//             <div>
//               <Label htmlFor="description">وصف الفئة</Label>
//               <Textarea
//                 id="description"
//                 value={formData.description}
//                 onChange={(e) => handleChange("description", e.target.value)}
//                 placeholder="أدخل وصف الفئة"
//                 rows={3}
//               />
//             </div>

//             {/* النشاط الفرعي */}
//             {currentStore?.subBusinessTypes &&
//               currentStore.subBusinessTypes.length > 0 && (
//                 <div>
//                   <Label htmlFor="subBusinessType">النشاط الفرعي</Label>
//                   <Select
//                     value={formData.subBusinessType}
//                     onValueChange={(value) =>
//                       handleChange("subBusinessType", value)
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="اختر النشاط الفرعي" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {currentStore.subBusinessTypes.map((type, index) => (
//                         <SelectItem key={index} value={type}>
//                           {type}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     هذه الفئة ستظهر فقط للمنتجات ذات النشاط الفرعي المحدد
//                   </p>
//                 </div>
//               )}

//             {/* الترتيب */}
//             <div>
//               <Label htmlFor="order">ترتيب العرض</Label>
//               <Input
//                 id="order"
//                 type="number"
//                 value={formData.order}
//                 onChange={(e) =>
//                   handleChange("order", parseInt(e.target.value) || 0)
//                 }
//                 min="0"
//               />
//               <p className="text-xs text-muted-foreground mt-1">
//                 الفئات ذات الرقم الأقل تظهر أولاً
//               </p>
//             </div>

//             {/* الحالة */}
//             <div className="flex items-center justify-between">
//               <div>
//                 <Label htmlFor="isActive">حالة الفئة</Label>
//                 <p className="text-xs text-muted-foreground">
//                   الفئات المعطلة لن تظهر في القوائم
//                 </p>
//               </div>
//               <Switch
//                 checked={formData.isActive}
//                 onCheckedChange={(checked) => handleChange("isActive", checked)}
//               />
//             </div>
//           </div>

//           {/* أزرار الإجراء */}
//           <div className="flex justify-end gap-3 pt-4 border-t">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={onCancel}
//               disabled={loading}
//             >
//               إلغاء
//             </Button>
//             <Button type="submit" disabled={loading}>
//               {loading ? "جاري الحفظ..." : category ? "تحديث" : "إنشاء"}
//             </Button>
//           </div>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }
