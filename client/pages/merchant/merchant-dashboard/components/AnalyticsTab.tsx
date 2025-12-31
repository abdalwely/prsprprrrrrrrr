import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  Users,
  Eye,
  Layout,
  ShoppingCart,
  HeartIcon,
  TrendingUp,
  TestTubeIcon,
  CreditCard,
  Truck,
  Package,
  Settings,
  StarIcon,
  AwardIcon,
  BarChart3,
} from "lucide-react";
import { ChecklistItems, Stats } from "../types";

interface AnalyticsTabProps {
  stats: Stats;
  subActiveTab: string;
  setSubActiveTab: (tabId: string) => void;
  checklistItems?: ChecklistItems; // 🔥 إضافة
}

export default function AnalyticsTab({
  stats,
  subActiveTab,
  setSubActiveTab,
  checklistItems, // 🔥 إضافة
}: AnalyticsTabProps) {
  const reportCategories = [
    {
      title: "أداء المتجر",
      items: [
        { id: "store-performance", label: "المبيعات", icon: DollarSign },
        { id: "customers-performance", label: "العملاء", icon: Users },
        { id: "visits", label: "الزيارات", icon: Eye },
        { id: "landing-pages", label: "صفحات الهبوط", icon: Layout },
        {
          id: "abandoned-carts",
          label: "السلات المتروكة",
          icon: ShoppingCart,
        },
        { id: "wishlist", label: "أمنيات العملاء", icon: HeartIcon },
        { id: "conversion-rate", label: "معدل التحويل", icon: TrendingUp },
        { id: "trial", label: "تجريبي", icon: TestTubeIcon },
        { id: "payments-report", label: "المدفوعات", icon: CreditCard },
        { id: "shipping-report", label: "الشحن", icon: Truck },
        { id: "inventory-report", label: "المخزون", icon: Package },
        {
          id: "employees",
          label: "الموظفين قريبًا!",
          icon: Users,
          disabled: true,
        },
        {
          id: "operations",
          label: "التشغيل قريبًا!",
          icon: Settings,
          disabled: true,
        },
      ],
    },
    {
      title: "التحليلات الذكية",
      items: [
        { id: "ratings", label: "التقييم", icon: StarIcon },
        { id: "products-analytics", label: "المنتجات", icon: Package },
        {
          id: "shipping-company-analytics",
          label: "شركة الشحن",
          icon: Truck,
        },
      ],
    },
    {
      title: "التقارير",
      items: [
        { id: "sales-reports", label: "المبيعات", icon: DollarSign },
        { id: "products-reports", label: "المنتجات", icon: Package },
        { id: "customers-reports", label: "العملاء", icon: Users },
        {
          id: "shipping-companies-reports",
          label: "شركات الشحن",
          icon: Truck,
        },
        { id: "loyalty-system", label: "نظام الولاء", icon: AwardIcon },
      ],
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* <div className="w-full lg:w-72">
        <Card className="lg:sticky lg:top-6">
          <ScrollArea className="h-[700px]">
            <CardContent className="p-4">
              {reportCategories.map((category, index) => (
                <div key={index} className="mb-6">
                  <h3 className="font-medium mb-2 text-right text-sm text-muted-foreground">
                    {category.title}
                  </h3>
                  <div className="space-y-1">
                    {category.items.map((item) => (
                      <Button
                        key={item.id}
                        variant={
                          subActiveTab === item.id ? "secondary" : "ghost"
                        }
                        className="w-full justify-start flex-row-reverse mb-1"
                        disabled={item.disabled}
                        onClick={() =>
                          !item.disabled && setSubActiveTab(item.id)
                        }
                      >
                        <item.icon className="h-4 w-4 ml-3" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                  {index < reportCategories.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </ScrollArea>
        </Card>
      </div> */}

      <div className="flex-1">
        {subActiveTab === "store-performance" && (
          <Card>
            <CardHeader>
              <CardTitle>أداء المتجر - المبيعات</CardTitle>
              <CardDescription>تحليل المبيعات حسب الفترة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button variant="outline" size="sm">
                    اليوم
                  </Button>
                  <Button variant="outline" size="sm">
                    الأسبوع
                  </Button>
                  <Button variant="outline" size="sm">
                    الشهر
                  </Button>
                  <Button variant="outline" size="sm">
                    السنة
                  </Button>
                </div>
                <div className="h-64 bg-muted rounded flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">رسم بياني للمبيعات</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {subActiveTab === "customers-performance" && (
          <Card>
            <CardHeader>
              <CardTitle>تقارير العملاء</CardTitle>
              <CardDescription>معدلات الولاء والاحتفاظ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm">معدل الاحتفاظ</div>
                  <div className="text-2xl font-bold">85%</div>
                </div>
                <Progress value={85} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="text-sm">العملاء الجدد</div>
                  <div className="text-2xl font-bold">24</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">معدل تكرار الشراء</div>
                  <div className="text-2xl font-bold">2.3</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {subActiveTab === "products-reports" && (
          <Card>
            <CardHeader>
              <CardTitle>تقارير المنتجات</CardTitle>
              <CardDescription>تحليل أداء المنتجات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المنتج</TableHead>
                      <TableHead className="text-right">المبيعات</TableHead>
                      <TableHead className="text-right">الإيرادات</TableHead>
                      <TableHead className="text-right">معدل التحويل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topSellingProducts.slice(0, 5).map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{Math.floor(Math.random() * 100)}</TableCell>
                        <TableCell>
                          {Math.floor(Math.random() * 100000)} ريال
                        </TableCell>
                        <TableCell>{Math.floor(Math.random() * 20)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
