import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Clock,
  Filter,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Target,
  BarChart,
  TrendingUp as TrendingUpIcon,
  ShoppingBag,
  Tag,
  Layers,
  BarChart2,
  Activity,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  Award,
  Trophy,
  TrendingDown as TrendingDownIcon,
  Percent,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  DollarSign as DollarIcon,
  Package as PackageIcon,
  Users as UsersIcon,
  ShoppingCart as CartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Stats, DetailedStats } from "../types";
import { StatsCard } from "./shared/StatsCard";
import { useStore } from "@/lib/contexts/StoreContext";
import { useToast } from "@/hooks/use-toast";
import {
  getStoreAnalytics,
  getSalesReport,
  getProductAnalytics,
  getCustomerAnalytics,
  getInventoryReport,
  exportReportToExcel,
  exportReportToPDF,
  AnalyticsTimeFrame,
} from "@/lib/src/utils/analytics";

interface OverviewTabProps {
  stats: Stats;
}

// بيانات افتراضية للإحصائيات التفصيلية
const initialDetailedStats: DetailedStats = {
  sales: {
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    refundRate: 0,
  },
  orders: {
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
    averageProcessingTime: "0",
  },
  products: {
    total: 0,
    active: 0,
    outOfStock: 0,
    lowStock: 0,
    categories: 0,
    averagePrice: 0,
    inventoryValue: 0,
  },
  customers: {
    total: 0,
    newThisMonth: 0,
    active: 0,
    repeatCustomers: 0,
    averageLifetimeValue: 0,
    retentionRate: 0,
  },
  inventory: {
    totalValue: 0,
    turnoverRate: 0,
    stockoutRate: 0,
    bestSellers: [],
  },
  performance: {
    storeTraffic: 0,
    bounceRate: 0,
    averageSessionDuration: "0",
    pageViews: 0,
    mobileVsDesktop: {
      mobile: 0,
      desktop: 0,
    },
  },
  timeAnalysis: {
    revenueByMonth: [],
    ordersByDay: [],
    peakHours: [],
  },
  categories: [],
};

export default function OverviewTab({ stats }: OverviewTabProps) {
  const { store: currentStore } = useStore();
  const { toast } = useToast();
  const [detailedStats, setDetailedStats] =
    useState<DetailedStats>(initialDetailedStats);
  const [isLoading, setIsLoading] = useState(false);
  const [timeFrame, setTimeFrame] = useState<AnalyticsTimeFrame>("month");
  const [activeTab, setActiveTab] = useState("overview");

  // تحميل البيانات التفصيلية
  const loadDetailedStats = async () => {
    if (!currentStore?.id) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد متجر أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // جلب جميع التقارير
      const [
        analytics,
        salesReport,
        productAnalytics,
        customerAnalytics,
        inventoryReport,
      ] = await Promise.all([
        getStoreAnalytics(currentStore.id, timeFrame),
        getSalesReport(currentStore.id, timeFrame),
        getProductAnalytics(currentStore.id),
        getCustomerAnalytics(currentStore.id, timeFrame),
        getInventoryReport(currentStore.id),
      ]);

      // تحديث الحالة بجميع البيانات
      setDetailedStats({
        sales: {
          daily: salesReport.dailyRevenue || 0,
          weekly: salesReport.weeklyRevenue || 0,
          monthly: salesReport.monthlyRevenue || 0,
          yearly: salesReport.yearlyRevenue || 0,
          averageOrderValue: salesReport.averageOrderValue || 0,
          conversionRate: analytics.conversionRate || 0,
          refundRate: salesReport.refundRate || 0,
        },
        orders: {
          total: analytics.totalOrders || 0,
          pending: analytics.pendingOrders || 0,
          processing: analytics.processingOrders || 0,
          shipped: analytics.shippedOrders || 0,
          delivered: analytics.deliveredOrders || 0,
          cancelled: analytics.cancelledOrders || 0,
          returned: analytics.returnedOrders || 0,
          averageProcessingTime: analytics.averageProcessingTime || "0",
        },
        products: {
          total: productAnalytics.totalProducts || 0,
          active: productAnalytics.activeProducts || 0,
          outOfStock: productAnalytics.outOfStock || 0,
          lowStock: productAnalytics.lowStock || 0,
          categories: productAnalytics.categoriesCount || 0,
          averagePrice: productAnalytics.averagePrice || 0,
          inventoryValue: productAnalytics.inventoryValue || 0,
        },
        customers: {
          total: customerAnalytics.totalCustomers || 0,
          newThisMonth: customerAnalytics.newCustomers || 0,
          active: customerAnalytics.activeCustomers || 0,
          repeatCustomers: customerAnalytics.repeatCustomers || 0,
          averageLifetimeValue: customerAnalytics.averageLifetimeValue || 0,
          retentionRate: customerAnalytics.retentionRate || 0,
        },
        inventory: {
          totalValue: inventoryReport.totalValue || 0,
          turnoverRate: inventoryReport.turnoverRate || 0,
          stockoutRate: inventoryReport.stockoutRate || 0,
          bestSellers: inventoryReport.bestSellers || [],
        },
        performance: {
          storeTraffic: analytics.storeTraffic || 0,
          bounceRate: analytics.bounceRate || 0,
          averageSessionDuration: analytics.averageSessionDuration || "0",
          pageViews: analytics.pageViews || 0,
          mobileVsDesktop: {
            mobile: analytics.mobileTraffic || 0,
            desktop: analytics.desktopTraffic || 0,
          },
        },
        timeAnalysis: {
          revenueByMonth: salesReport.revenueByMonth || [],
          ordersByDay: analytics.ordersByDay || [],
          peakHours: analytics.peakHours || [],
        },
        categories: productAnalytics.categories || [],
      });

      toast({
        title: "تم تحميل التقارير",
        description: "تم تحديث جميع الإحصائيات بنجاح",
      });
    } catch (error: any) {
      console.error("❌ خطأ في تحميل التقارير:", error);
      toast({
        title: "خطأ في تحميل التقارير",
        description: error.message || "تعذر تحميل التقارير",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // تحميل البيانات عند تغيير الفترة الزمنية أو المتجر
  useEffect(() => {
    if (currentStore?.id) {
      loadDetailedStats();
    }
  }, [currentStore?.id, timeFrame]);

  // دالة تصدير التقرير
  const handleExportReport = async (format: "excel" | "pdf") => {
    if (!currentStore?.id) return;

    try {
      if (format === "excel") {
        await exportReportToExcel(currentStore.id, timeFrame);
        toast({
          title: "تم التصدير",
          description: "تم تصدير التقرير إلى Excel بنجاح",
        });
      } else {
        await exportReportToPDF(currentStore.id, timeFrame);
        toast({
          title: "تم التصدير",
          description: "تم تصدير التقرير إلى PDF بنجاح",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في التصدير",
        description: error.message || "تعذر تصدير التقرير",
        variant: "destructive",
      });
    }
  };

  // دالة إعادة تحميل البيانات
  const handleRefresh = () => {
    loadDetailedStats();
  };

  // دالة تنسيق الوقت
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} دقيقة`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ساعة ${mins > 0 ? `${mins} دقيقة` : ""}`;
  };

  // دالة تنسيق النسبة المئوية
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // دالة تنسيق المبلغ
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} ريال`;
  };

  return (
    <div className="space-y-6">
      {/* شريط التحكم */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">تقارير المتجر</h1>
          <p className="text-muted-foreground">
            تحليل شامل لأداء متجرك وبيانات عملك
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="timeframe">الفترة:</Label>
            <Select
              value={timeFrame}
              onValueChange={(value: AnalyticsTimeFrame) => setTimeFrame(value)}
              disabled={isLoading}
            >
              <SelectTrigger id="timeframe" className="w-32">
                <SelectValue placeholder="اختر الفترة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">اليوم</SelectItem>
                <SelectItem value="week">الأسبوع</SelectItem>
                <SelectItem value="month">الشهر</SelectItem>
                <SelectItem value="quarter">ربع سنوي</SelectItem>
                <SelectItem value="year">سنة</SelectItem>
                <SelectItem value="all">جميع الفترات</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ml-2 ${isLoading ? "animate-spin" : ""}`}
            />
            تحديث
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExportReport("excel")}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 ml-2" />
              Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportReport("pdf")}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 ml-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* تبويبات التقارير */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            المبيعات
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            الطلبات
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            المنتجات
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            العملاء
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            الأداء
          </TabsTrigger>
        </TabsList>

        {/* تبويب النظرة العامة */}
        <TabsContent value="overview" className="space-y-6">
          {/* بطاقات الإحصائيات السريعة */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="إجمالي المبيعات"
              value={formatCurrency(detailedStats.sales.monthly)}
              icon={DollarSign}
              change="+12.5%"
              trend="up"
              color="green"
              description={`يوميًا: ${formatCurrency(detailedStats.sales.daily)}`}
            />
            <StatsCard
              title="الطلبات"
              value={detailedStats.orders.total.toString()}
              icon={ShoppingCart}
              change="+8.2%"
              trend="up"
              color="blue"
              description={`متوسط القيمة: ${formatCurrency(detailedStats.sales.averageOrderValue)}`}
            />
            <StatsCard
              title="المنتجات النشطة"
              value={detailedStats.products.active.toString()}
              icon={Package}
              change="+15%"
              trend="up"
              color="purple"
              description={`قيمة المخزون: ${formatCurrency(detailedStats.products.inventoryValue)}`}
            />
            <StatsCard
              title="العملاء النشطين"
              value={detailedStats.customers.active.toString()}
              icon={Users}
              change="+24"
              trend="up"
              color="orange"
              description={`جدد هذا الشهر: ${detailedStats.customers.newThisMonth}`}
            />
          </div>

          {/* الصف الثاني من البطاقات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  معدل التحويل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(detailedStats.sales.conversionRate)}
                </div>
                <Progress
                  value={detailedStats.sales.conversionRate}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  نسبة الزوار الذين يتحولون لعملاء
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  متوسط وقت المعالجة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {detailedStats.orders.averageProcessingTime} يوم
                </div>
                <div className="flex items-center mt-2">
                  {parseFloat(detailedStats.orders.averageProcessingTime) <
                  2 ? (
                    <TrendingDownIcon className="h-4 w-4 text-green-600 ml-2" />
                  ) : (
                    <TrendingUpIcon className="h-4 w-4 text-red-600 ml-2" />
                  )}
                  <span
                    className={`text-sm ${parseFloat(detailedStats.orders.averageProcessingTime) < 2 ? "text-green-600" : "text-red-600"}`}
                  >
                    {parseFloat(detailedStats.orders.averageProcessingTime) < 2
                      ? "أقل من المتوسط"
                      : "أعلى من المتوسط"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  العملاء المتكررين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {detailedStats.customers.repeatCustomers}
                </div>
                <div className="flex items-center mt-2">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    {formatPercentage(detailedStats.customers.retentionRate)}{" "}
                    استبقاء
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  الطلبات المسلمة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {detailedStats.orders.delivered}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1">
                    <Progress
                      value={
                        (detailedStats.orders.delivered /
                          detailedStats.orders.total) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(
                      (detailedStats.orders.delivered /
                        detailedStats.orders.total) *
                        100,
                    )}
                    %
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* مخططات النظرة العامة */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* مخطط المبيعات الشهرية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    المبيعات الشهرية
                  </span>
                  <Badge variant="outline">آخر 6 أشهر</Badge>
                </CardTitle>
                <CardDescription>
                  تطور الإيرادات على مدار الشهور
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex flex-col justify-end">
                  {detailedStats.timeAnalysis.revenueByMonth.length > 0 ? (
                    <div className="flex items-end justify-between h-48">
                      {detailedStats.timeAnalysis.revenueByMonth
                        .slice(-6)
                        .map((month, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center"
                          >
                            <div
                              className="w-10 bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                              style={{
                                height: `${(month.revenue / Math.max(...detailedStats.timeAnalysis.revenueByMonth.map((m) => m.revenue))) * 100}%`,
                              }}
                            />
                            <span className="text-xs mt-2">{month.month}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(month.revenue)}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">لا توجد بيانات</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* أفضل المنتجات مبيعاً */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  أفضل المنتجات مبيعاً
                </CardTitle>
                <CardDescription>
                  أفضل 5 منتجات من حيث الإيرادات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detailedStats.inventory.bestSellers
                    .slice(0, 5)
                    .map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 hover:bg-muted rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-700"
                                : index === 1
                                  ? "bg-gray-100 text-gray-700"
                                  : index === 2
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            <span className="font-bold">{index + 1}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-bold">
                            {formatCurrency(product.revenue)}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {product.sold} مبيع
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {product.stock} متبقي
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تبويب المبيعات */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarIcon className="h-5 w-5" />
                  ملخص المبيعات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    المبيعات اليومية
                  </span>
                  <span className="font-bold">
                    {formatCurrency(detailedStats.sales.daily)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    المبيعات الأسبوعية
                  </span>
                  <span className="font-bold">
                    {formatCurrency(detailedStats.sales.weekly)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    المبيعات الشهرية
                  </span>
                  <span className="font-bold">
                    {formatCurrency(detailedStats.sales.monthly)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    المبيعات السنوية
                  </span>
                  <span className="font-bold">
                    {formatCurrency(detailedStats.sales.yearly)}
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      متوسط قيمة الطلب
                    </span>
                    <span className="font-bold">
                      {formatCurrency(detailedStats.sales.averageOrderValue)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUpIcon className="h-5 w-5" />
                  تحليل المبيعات حسب الفئة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detailedStats.categories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">
                            {formatCurrency(category.revenue)}
                          </span>
                          <Badge
                            variant={
                              category.growth >= 0 ? "default" : "destructive"
                            }
                            className="mr-2"
                          >
                            {category.growth >= 0 ? "+" : ""}
                            {category.growth}%
                          </Badge>
                        </div>
                      </div>
                      <Progress
                        value={
                          (category.revenue /
                            Math.max(
                              ...detailedStats.categories.map((c) => c.revenue),
                            )) *
                          100
                        }
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{category.orders} طلب</span>
                        <span>{category.products} منتج</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                مؤشرات أداء المبيعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold mb-2">
                    {formatPercentage(detailedStats.sales.conversionRate)}
                  </div>
                  <p className="text-sm font-medium mb-1">معدل التحويل</p>
                  <p className="text-xs text-muted-foreground">
                    نسبة الزوار إلى العملاء
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold mb-2">
                    {formatPercentage(detailedStats.sales.refundRate)}
                  </div>
                  <p className="text-sm font-medium mb-1">معدل المرتجعات</p>
                  <p className="text-xs text-muted-foreground">
                    نسبة الطلبات المرتجعة
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold mb-2">
                    {Math.round(
                      detailedStats.performance.storeTraffic,
                    ).toLocaleString()}
                  </div>
                  <p className="text-sm font-medium mb-1">حركة المتجر</p>
                  <p className="text-xs text-muted-foreground">
                    زيارات المتجر هذا الشهر
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تبويب الطلبات */}
        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  قيد الانتظار
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {detailedStats.orders.pending}
                </div>
                <p className="text-xs text-muted-foreground">تنتظر الموافقة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  قيد المعالجة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {detailedStats.orders.processing}
                </div>
                <p className="text-xs text-muted-foreground">جاري التحضير</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  قيد الشحن
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {detailedStats.orders.shipped}
                </div>
                <p className="text-xs text-muted-foreground">في الطريق</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  مسلمة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {detailedStats.orders.delivered}
                </div>
                <p className="text-xs text-muted-foreground">تم التسليم</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع حالات الطلبات</CardTitle>
                <CardDescription>
                  نسبة كل حالة من إجمالي الطلبات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      label: "مسلمة",
                      value: detailedStats.orders.delivered,
                      color: "bg-green-500",
                    },
                    {
                      label: "قيد الانتظار",
                      value: detailedStats.orders.pending,
                      color: "bg-amber-500",
                    },
                    {
                      label: "قيد المعالجة",
                      value: detailedStats.orders.processing,
                      color: "bg-blue-500",
                    },
                    {
                      label: "قيد الشحن",
                      value: detailedStats.orders.shipped,
                      color: "bg-purple-500",
                    },
                    {
                      label: "ملغاة",
                      value: detailedStats.orders.cancelled,
                      color: "bg-red-500",
                    },
                    {
                      label: "مرتجعة",
                      value: detailedStats.orders.returned,
                      color: "bg-gray-500",
                    },
                  ].map((item, index) => {
                    const percentage =
                      (item.value / detailedStats.orders.total) * 100;
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${item.color}`}
                            />
                            <span className="text-sm">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.value}</span>
                            <span className="text-sm text-muted-foreground">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أوقات الذروة</CardTitle>
                <CardDescription>
                  أكثر الأوقات نشاطاً في الطلبات
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detailedStats.timeAnalysis.peakHours.map((hour, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">ساعة {hour.hour}</p>
                          <p className="text-xs text-muted-foreground">
                            أعلى نشاط
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{hour.orders} طلب</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تبويب المنتجات */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <PackageIcon className="h-4 w-4" />
                  إجمالي المنتجات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {detailedStats.products.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  {detailedStats.products.active} نشط
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  غير متوفر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {detailedStats.products.outOfStock}
                </div>
                <p className="text-xs text-muted-foreground">يحتاج تجديد</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingDownIcon className="h-4 w-4" />
                  مخزون منخفض
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {detailedStats.products.lowStock}
                </div>
                <p className="text-xs text-muted-foreground">يحتاج مراجعة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  الفئات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {detailedStats.products.categories}
                </div>
                <p className="text-xs text-muted-foreground">تصنيفات مختلفة</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات المخزون</CardTitle>
                <CardDescription>تحليل القيمة والتوزيع</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      قيمة المخزون الإجمالية
                    </span>
                    <span className="font-bold">
                      {formatCurrency(detailedStats.products.inventoryValue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      متوسط سعر المنتج
                    </span>
                    <span className="font-bold">
                      {formatCurrency(detailedStats.products.averagePrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      معدل دوران المخزون
                    </span>
                    <span className="font-bold">
                      {detailedStats.inventory.turnoverRate.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      معدل نفاد المخزون
                    </span>
                    <span className="font-bold">
                      {formatPercentage(detailedStats.inventory.stockoutRate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أداء المنتجات</CardTitle>
                <CardDescription>مقارنة الأداء حسب الفئات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detailedStats.categories
                    .slice(0, 5)
                    .map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded flex items-center justify-center ${
                              index === 0
                                ? "bg-yellow-100"
                                : index === 1
                                  ? "bg-gray-100"
                                  : index === 2
                                    ? "bg-amber-100"
                                    : "bg-blue-50"
                            }`}
                          >
                            <span className="text-sm font-medium">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {category.products} منتج
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {category.orders} طلب
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تبويب العملاء */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  إجمالي العملاء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {detailedStats.customers.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  {detailedStats.customers.newThisMonth} جدد هذا الشهر
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  العملاء النشطين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {detailedStats.customers.active}
                </div>
                <p className="text-xs text-muted-foreground">شهرياً</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  العملاء المتكررين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {detailedStats.customers.repeatCustomers}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(detailedStats.customers.retentionRate)}{" "}
                  استبقاء
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarIcon className="h-4 w-4" />
                  متوسط القيمة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(detailedStats.customers.averageLifetimeValue)}
                </div>
                <p className="text-xs text-muted-foreground">لكل عميل</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>تحليل العملاء</CardTitle>
                <CardDescription>توزيع العملاء حسب القيمة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      label: "العملاء المميزين (أعلى 20%)",
                      color: "bg-purple-500",
                      percentage: 20,
                    },
                    {
                      label: "العملاء المتوسطين (60%)",
                      color: "bg-blue-500",
                      percentage: 60,
                    },
                    {
                      label: "العملاء الجدد (20%)",
                      color: "bg-green-500",
                      percentage: 20,
                    },
                  ].map((segment, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${segment.color}`}
                          />
                          <span className="text-sm">{segment.label}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {segment.percentage}%
                        </span>
                      </div>
                      <Progress value={segment.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>نمو العملاء</CardTitle>
                <CardDescription>تطور قاعدة العملاء مع الوقت</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">مخطط نمو العملاء</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>هذا الشهر:</span>
                        <span className="font-bold">
                          +{detailedStats.customers.newThisMonth}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>معدل الاستبقاء:</span>
                        <span className="font-bold">
                          {formatPercentage(
                            detailedStats.customers.retentionRate,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* تبويب الأداء */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  حركة المتجر
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    detailedStats.performance.storeTraffic,
                  ).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  زيارات هذا الشهر
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MousePointer className="h-4 w-4" />
                  معدل الارتداد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(detailedStats.performance.bounceRate)}
                </div>
                <p className="text-xs text-muted-foreground">
                  نسبة الزوار السريعين
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  مدة الجلسة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {detailedStats.performance.averageSessionDuration}
                </div>
                <p className="text-xs text-muted-foreground">
                  متوسط مدة الزيارة
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>تحليل الأجهزة</CardTitle>
                <CardDescription>نسبة الزوار حسب نوع الجهاز</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-blue-500" />
                      <span>الهواتف</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">
                        {detailedStats.performance.mobileVsDesktop.mobile}%
                      </span>
                      <Progress
                        value={detailedStats.performance.mobileVsDesktop.mobile}
                        className="w-32 mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-purple-500" />
                      <span>أجهزة الكمبيوتر</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">
                        {detailedStats.performance.mobileVsDesktop.desktop}%
                      </span>
                      <Progress
                        value={
                          detailedStats.performance.mobileVsDesktop.desktop
                        }
                        className="w-32 mt-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مؤشرات الأداء الرئيسية</CardTitle>
                <CardDescription>مقاييس أداء المتجر</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>معدل التحويل</span>
                    <Badge variant="default">
                      {formatPercentage(detailedStats.sales.conversionRate)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>متوسط قيمة الطلب</span>
                    <Badge variant="default">
                      {formatCurrency(detailedStats.sales.averageOrderValue)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>معدل تكرار الشراء</span>
                    <Badge variant="default">
                      {formatPercentage(detailedStats.customers.retentionRate)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>وقت المعالجة</span>
                    <Badge variant="default">
                      {detailedStats.orders.averageProcessingTime} يوم
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>مقارنة الأداء</CardTitle>
              <CardDescription>مقارنة مع الشهر السابق</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    +12.5%
                  </div>
                  <p className="text-sm font-medium">المبيعات</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    +8.2%
                  </div>
                  <p className="text-sm font-medium">الطلبات</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    +24%
                  </div>
                  <p className="text-sm font-medium">العملاء الجدد</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    -2.1%
                  </div>
                  <p className="text-sm font-medium">معدل الارتداد</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ملخص نهائي */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              ملخص الأداء
            </CardTitle>
            <CardDescription>نظرة سريعة على أداء متجرك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatCurrency(detailedStats.sales.monthly)}
                </div>
                <p className="text-sm font-medium">الإيرادات الشهرية</p>
                <p className="text-xs text-muted-foreground">
                  +12.5% عن الشهر الماضي
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {detailedStats.orders.total}
                </div>
                <p className="text-sm font-medium">إجمالي الطلبات</p>
                <p className="text-xs text-muted-foreground">
                  +8.2% عن الشهر الماضي
                </p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {detailedStats.customers.total}
                </div>
                <p className="text-sm font-medium">إجمالي العملاء</p>
                <p className="text-xs text-muted-foreground">+24 عميل جديد</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl font-bold text-amber-600 mb-2">
                  {formatPercentage(detailedStats.sales.conversionRate)}
                </div>
                <p className="text-sm font-medium">معدل التحويل</p>
                <p className="text-xs text-muted-foreground">
                  +1.2% عن الشهر الماضي
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="text-sm text-muted-foreground">
              <p>
                📈 <strong>نقاط القوة:</strong> نمو قوي في المبيعات والعملاء
                الجدد
              </p>
              <p>
                ⚡ <strong>مجالات التحسين:</strong> خفض وقت معالجة الطلبات،
                تحسين معدل التحويل
              </p>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

// مكون مساعد للرمز
const Repeat = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17 2l4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="M7 22l-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);
