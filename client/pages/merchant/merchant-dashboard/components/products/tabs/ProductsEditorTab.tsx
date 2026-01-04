import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Download, Upload } from "lucide-react";

interface ProductsEditorTabProps {
  setSubActiveTab: (tabId: string) => void;
}

export default function ProductsEditorTab({
  setSubActiveTab,
}: ProductsEditorTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">محرر المنتجات</h2>
          <p className="text-muted-foreground">تحرير وتعديل المنتجات بسرعة</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير المنتجات
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 ml-2" />
            استيراد منتجات
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Edit className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">محرر المنتجات قريباً</h3>
            <p className="text-gray-500 mb-6">
              هذه الميزة قيد التطوير، ستكون متاحة قريباً لتعديل المنتجات بشكل
              جماعي
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setSubActiveTab("management")}
              >
                الانتقال لإدارة المنتجات
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
