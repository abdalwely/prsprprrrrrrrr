// // ImportExport.tsx
// import React, { useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Download, Upload, FileText, FileSpreadsheet } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

// interface ImportExportProps {
//   storeId: string;
//   subBusinessTypes: string[];
//   onImport: (subBusinessType: string, data: any[]) => Promise<void>;
//   onExport: (format: string, subBusinessType?: string) => Promise<any>;
// }

// export default function ImportExport({
//   storeId,
//   subBusinessTypes,
//   onImport,
//   onExport,
// }: ImportExportProps) {
//   const { toast } = useToast();
//   const [activeTab, setActiveTab] = useState("import");
//   const [selectedSubBusinessType, setSelectedSubBusinessType] = useState("");
//   const [importData, setImportData] = useState("");
//   const [importing, setImporting] = useState(false);
//   const [exporting, setExporting] = useState(false);
//   const [exportFormat, setExportFormat] = useState("json");

//   const handleImport = async () => {
//     if (!selectedSubBusinessType) {
//       toast({
//         title: "خطأ",
//         description: "يرجى اختيار النشاط الفرعي",
//         variant: "destructive",
//       });
//       return;
//     }

//     if (!importData.trim()) {
//       toast({
//         title: "خطأ",
//         description: "يرجى إدخال البيانات",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       setImporting(true);

//       let parsedData;
//       try {
//         parsedData = JSON.parse(importData);
//       } catch (e) {
//         // إذا لم يكن JSON، نفترض أنه CSV بسيط
//         const lines = importData.trim().split("\n");
//         parsedData = lines.map((line) => {
//           const [name, description] = line
//             .split(",")
//             .map((field) => field.trim());
//           return { name, description };
//         });
//       }

//       await onImport(selectedSubBusinessType, parsedData);

//       toast({
//         title: "تم الاستيراد",
//         description: `تم استيراد ${parsedData.length} فئة`,
//       });

//       setImportData("");
//     } catch (error) {
//       toast({
//         title: "خطأ في الاستيراد",
//         description: error.message,
//         variant: "destructive",
//       });
//     } finally {
//       setImporting(false);
//     }
//   };

//   const handleExport = async () => {
//     try {
//       setExporting(true);
//       const data = await onExport(
//         exportFormat,
//         selectedSubBusinessType || undefined,
//       );

//       toast({
//         title: "تم التصدير",
//         description: `تم تصدير ${data.length || data.categories?.length || 0} فئة`,
//       });
//     } catch (error) {
//       toast({
//         title: "خطأ في التصدير",
//         description: error.message,
//         variant: "destructive",
//       });
//     } finally {
//       setExporting(false);
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>الاستيراد والتصدير</CardTitle>
//         <CardDescription>
//           استيراد فئات من ملف أو تصدير الفئات الحالية
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <Tabs value={activeTab} onValueChange={setActiveTab}>
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="import">
//               <Upload className="h-4 w-4 ml-2" />
//               استيراد
//             </TabsTrigger>
//             <TabsTrigger value="export">
//               <Download className="h-4 w-4 ml-2" />
//               تصدير
//             </TabsTrigger>
//           </TabsList>

//           {/* تبويب الاستيراد */}
//           <TabsContent value="import" className="space-y-4">
//             <div>
//               <Label htmlFor="importType">النشاط الفرعي</Label>
//               <Select
//                 value={selectedSubBusinessType}
//                 onValueChange={setSelectedSubBusinessType}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="اختر النشاط الفرعي" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {subBusinessTypes.map((type, index) => (
//                     <SelectItem key={index} value={type}>
//                       {type}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <Label htmlFor="importData">بيانات الفئات</Label>
//               <Textarea
//                 id="importData"
//                 value={importData}
//                 onChange={(e) => setImportData(e.target.value)}
//                 placeholder='[
//   {"name": "اسم الفئة 1", "description": "وصف الفئة 1"},
//   {"name": "اسم الفئة 2", "description": "وصف الفئة 2"}
// ]'
//                 rows={8}
//                 className="font-mono text-sm"
//               />
//               <p className="text-xs text-muted-foreground mt-1">
//                 أدخل البيانات بتنسيق JSON أو CSV بسيط (اسم الفئة، وصف الفئة)
//               </p>
//             </div>

//             <Button
//               onClick={handleImport}
//               disabled={importing}
//               className="w-full"
//             >
//               {importing ? "جاري الاستيراد..." : "استيراد الفئات"}
//             </Button>
//           </TabsContent>

//           {/* تبويب التصدير */}
//           <TabsContent value="export" className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <Label htmlFor="exportSubBusinessType">النشاط الفرعي</Label>
//                 <Select
//                   value={selectedSubBusinessType}
//                   onValueChange={setSelectedSubBusinessType}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="جميع الأنشطة" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="">جميع الأنشطة</SelectItem>
//                     {subBusinessTypes.map((type, index) => (
//                       <SelectItem key={index} value={type}>
//                         {type}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label htmlFor="exportFormat">التنسيق</Label>
//                 <Select value={exportFormat} onValueChange={setExportFormat}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="اختر التنسيق" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="json">
//                       <FileText className="h-4 w-4 ml-2 inline" />
//                       JSON
//                     </SelectItem>
//                     <SelectItem value="csv">
//                       <FileSpreadsheet className="h-4 w-4 ml-2 inline" />
//                       CSV
//                     </SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label>خيارات التصدير</Label>
//               <div className="flex flex-wrap gap-2">
//                 <Button
//                   variant="outline"
//                   onClick={() =>
//                     onExport("json", selectedSubBusinessType || undefined)
//                   }
//                   disabled={exporting}
//                 >
//                   <FileText className="h-4 w-4 ml-2" />
//                   JSON
//                 </Button>
//                 <Button
//                   variant="outline"
//                   onClick={() =>
//                     onExport("csv", selectedSubBusinessType || undefined)
//                   }
//                   disabled={exporting}
//                 >
//                   <FileSpreadsheet className="h-4 w-4 ml-2" />
//                   CSV
//                 </Button>
//               </div>
//             </div>

//             <Button
//               onClick={handleExport}
//               disabled={exporting}
//               className="w-full"
//             >
//               {exporting ? "جاري التصدير..." : "تصدير الفئات"}
//             </Button>
//           </TabsContent>
//         </Tabs>
//       </CardContent>
//     </Card>
//   );
// }
