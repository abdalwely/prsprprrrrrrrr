import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Search,
  Filter,
  Download,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { orderService, customerService } from "@/lib/firestore";
import { getCurrentStoreId } from "@/lib/firebase";
import { Order } from "@/lib/types";

const OrdersTab: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  // عوامل التصفية
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // تحديث حالة الطلب
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newOrderStatus, setNewOrderStatus] = useState("");

  // تحميل الطلبات
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);

        // الحصول على storeId الحالي
        const currentStoreId = await getCurrentStoreId();
        setStoreId(currentStoreId);

        if (!currentStoreId) {
          toast({
            title: "لم يتم تحديد متجر",
            description: "يجب تحديد متجر أولاً",
            variant: "destructive",
          });
          return;
        }

        // جلب الطلبات من المتجر
        const storeOrders = await orderService.getByStore(currentStoreId);
        setOrders(storeOrders);
        setFilteredOrders(storeOrders);
      } catch (error) {
        console.error("❌ خطأ في تحميل الطلبات:", error);
        toast({
          title: "خطأ في تحميل الطلبات",
          description: "تعذر تحميل قائمة الطلبات",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [toast]);

  // تطبيق التصفية
  useEffect(() => {
    let result = orders;

    // تصفية النص
    if (searchTerm.trim()) {
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerSnapshot.email
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customerSnapshot.firstName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customerSnapshot.lastName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customerSnapshot.phone
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.trackingNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // تصفية حالة الطلب
    if (statusFilter !== "all") {
      result = result.filter((order) => order.orderStatus === statusFilter);
    }

    // تصفية حالة الدفع
    if (paymentFilter !== "all") {
      result = result.filter((order) => order.paymentStatus === paymentFilter);
    }

    // تصفية التاريخ
    if (dateFilter !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      switch (dateFilter) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0);
          result = result.filter(
            (order) => new Date(order.createdAt) >= cutoffDate,
          );
          break;
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          result = result.filter(
            (order) => new Date(order.createdAt) >= cutoffDate,
          );
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          result = result.filter(
            (order) => new Date(order.createdAt) >= cutoffDate,
          );
          break;
      }
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, paymentFilter, dateFilter, orders]);

  // عرض تفاصيل الطلب
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setNewOrderStatus(order.orderStatus);
  };

  // تحديث حالة الطلب
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newOrderStatus || !storeId) return;

    setUpdatingStatus(true);
    try {
      await orderService.update(selectedOrder.id, {
        orderStatus: newOrderStatus as any,
        updatedAt: new Date(),
      });

      // تحديث القائمة المحلية
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id
            ? {
                ...order,
                orderStatus: newOrderStatus as any,
                updatedAt: new Date(),
              }
            : order,
        ),
      );

      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              orderStatus: newOrderStatus as any,
              updatedAt: new Date(),
            }
          : null,
      );

      toast({
        title: "تم التحديث",
        description: `تم تحديث حالة الطلب إلى ${getStatusLabel(newOrderStatus)}`,
      });
    } catch (error) {
      console.error("❌ خطأ في تحديث حالة الطلب:", error);
      toast({
        title: "خطأ في التحديث",
        description: "تعذر تحديث حالة الطلب",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  // تصدير الطلبات
  const handleExportOrders = () => {
    try {
      const csvData = [
        [
          "رقم الطلب",
          "العميل",
          "البريد",
          "الهاتف",
          "التاريخ",
          "المجموع",
          "حالة الطلب",
          "حالة الدفع",
        ],
        ...filteredOrders.map((o) => [
          o.id,
          `${o.customerSnapshot.firstName} ${o.customerSnapshot.lastName}`,
          o.customerSnapshot.email,
          o.customerSnapshot.phone,
          new Date(o.createdAt).toLocaleDateString("ar-SA"),
          o.total.toLocaleString(),
          getStatusLabel(o.orderStatus),
          getPaymentStatusLabel(o.paymentStatus),
        ]),
      ];

      const csvContent = csvData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();

      toast({
        title: "تم التصدير",
        description: `تم تصدير ${filteredOrders.length} طلب`,
      });
    } catch (error) {
      console.error("❌ خطأ في تصدير الطلبات:", error);
      toast({
        title: "خطأ في التصدير",
        variant: "destructive",
      });
    }
  };

  // إعادة تعيين التصفية
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setDateFilter("all");
  };

  // الحصول على تسمية الحالة
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "قيد الانتظار",
      processing: "قيد المعالجة",
      shipped: "تم الشحن",
      delivered: "تم التوصيل",
      cancelled: "ملغي",
      returned: "مرتجع",
    };
    return labels[status] || status;
  };

  // الحصول على تسمية حالة الدفع
  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "قيد الانتظار",
      paid: "مدفوع",
      failed: "فشل",
      refunded: "تم الاسترجاع",
    };
    return labels[status] || status;
  };

  // الحصول على لون البادج حسب الحالة
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // الحصول على لون بادج حالة الدفع
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // الحصول على أيقونة الحالة
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // الانتقال لتفاصيل الطلب الكاملة
  const goToOrderDetails = (orderId: string) => {
    if (storeId) {
      navigate(`/store/${storeId}/order/${orderId}`);
    }
  };

  // حساب الإحصائيات
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.orderStatus === "pending").length,
    processing: orders.filter((o) => o.orderStatus === "processing").length,
    shipped: orders.filter((o) => o.orderStatus === "shipped").length,
    delivered: orders.filter((o) => o.orderStatus === "delivered").length,
    revenue: orders.reduce((sum, order) => sum + order.total, 0),
    averageOrder:
      orders.length > 0
        ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length
        : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  إجمالي الإيرادات
                </p>
                <p className="text-2xl font-bold">
                  {stats.revenue.toLocaleString()} ريال
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  متوسط قيمة الطلب
                </p>
                <p className="text-2xl font-bold">
                  {stats.averageOrder.toLocaleString()} ريال
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الطلبات المعلقة</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات التحكم */}
      <Card>
        <CardHeader>
          <CardTitle>إدارة الطلبات</CardTitle>
          <CardDescription>
            قائمة جميع طلبات المتجر، يمكنك البحث والتصفية وتحديث الحالة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث برقم الطلب، اسم العميل، البريد، الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={resetFilters}>
                الكل
              </Button>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="حالة الطلب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="processing">قيد المعالجة</SelectItem>
                  <SelectItem value="shipped">تم الشحن</SelectItem>
                  <SelectItem value="delivered">تم التوصيل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="حالة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الدفعات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                  <SelectItem value="failed">فشل</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الفترات</SelectItem>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">آخر أسبوع</SelectItem>
                  <SelectItem value="month">آخر شهر</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleExportOrders}>
                <Download className="ml-2 h-4 w-4" />
                تصدير
              </Button>
            </div>
          </div>

          {/* جدول الطلبات */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المجموع</TableHead>
                  <TableHead>حالة الطلب</TableHead>
                  <TableHead>حالة الدفع</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {searchTerm ||
                      statusFilter !== "all" ||
                      paymentFilter !== "all" ||
                      dateFilter !== "all"
                        ? "لا توجد نتائج للبحث"
                        : "لا يوجد طلبات بعد"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {order.paymentMethod === "cod"
                              ? "الدفع عند الاستلام"
                              : "تحويل بنكي"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.customerSnapshot.firstName}{" "}
                            {order.customerSnapshot.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.customerSnapshot.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.customerSnapshot.phone}
                          </p>
                          {order.customerId?.startsWith("guest_") && (
                            <Badge variant="outline" className="text-xs mt-1">
                              ضيف
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {new Date(order.createdAt).toLocaleDateString(
                              "ar-SA",
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleTimeString(
                              "ar-SA",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">
                          {order.total.toLocaleString()} ريال
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.items.length} منتج
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getStatusBadge(order.orderStatus)} flex items-center gap-1 w-fit`}
                        >
                          {getStatusIcon(order.orderStatus)}
                          {getStatusLabel(order.orderStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getPaymentStatusBadge(order.paymentStatus)} w-fit`}
                        >
                          {getPaymentStatusLabel(order.paymentStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="ml-1 h-4 w-4" />
                            عرض
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => goToOrderDetails(order.id)}
                          >
                            تفاصيل
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* ملخص التصفية */}
          {(searchTerm ||
            statusFilter !== "all" ||
            paymentFilter !== "all" ||
            dateFilter !== "all") && (
            <div className="mt-4 text-sm text-muted-foreground">
              عرض {filteredOrders.length} من أصل {orders.length} طلب
            </div>
          )}
        </CardContent>
      </Card>

      {/* تفاصيل الطلب المحدد */}
      {selectedOrder && (
        <Dialog
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>تفاصيل الطلب #{selectedOrder.id}</DialogTitle>
              <DialogDescription>
                معلومات كاملة عن الطلب والعميل
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* معلومات الطلب */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-3">معلومات الطلب</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          رقم الطلب:
                        </span>
                        <span className="font-medium">{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          تاريخ الطلب:
                        </span>
                        <span>
                          {new Date(selectedOrder.createdAt).toLocaleString(
                            "ar-SA",
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          تاريخ التحديث:
                        </span>
                        <span>
                          {new Date(selectedOrder.updatedAt).toLocaleString(
                            "ar-SA",
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          طريقة الدفع:
                        </span>
                        <span>
                          {selectedOrder.paymentMethod === "cod"
                            ? "الدفع عند الاستلام"
                            : "تحويل بنكي"}
                        </span>
                      </div>
                      {selectedOrder.trackingNumber && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            رقم التتبع:
                          </span>
                          <span className="font-medium">
                            {selectedOrder.trackingNumber}
                          </span>
                        </div>
                      )}
                      {selectedOrder.estimatedDelivery && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            التاريخ المتوقع للتوصيل:
                          </span>
                          <span>
                            {new Date(
                              selectedOrder.estimatedDelivery,
                            ).toLocaleDateString("ar-SA")}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-3">العميل</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الاسم:</span>
                        <span className="font-medium">
                          {selectedOrder.customerSnapshot.firstName}{" "}
                          {selectedOrder.customerSnapshot.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">البريد:</span>
                        <span>{selectedOrder.customerSnapshot.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الهاتف:</span>
                        <span>{selectedOrder.customerSnapshot.phone}</span>
                      </div>
                      {selectedOrder.customerSnapshot.uid && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            معرف العميل:
                          </span>
                          <span className="font-mono text-xs">
                            {selectedOrder.customerSnapshot.uid.substring(0, 8)}
                            ...
                          </span>
                        </div>
                      )}
                      {selectedOrder.customerId?.startsWith("guest_") && (
                        <Badge variant="outline" className="w-fit">
                          حساب ضيف
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-3">الحالة</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          حالة الطلب:
                        </span>
                        <Badge
                          className={getStatusBadge(selectedOrder.orderStatus)}
                        >
                          {getStatusLabel(selectedOrder.orderStatus)}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          حالة الدفع:
                        </span>
                        <Badge
                          className={getPaymentStatusBadge(
                            selectedOrder.paymentStatus,
                          )}
                        >
                          {getPaymentStatusLabel(selectedOrder.paymentStatus)}
                        </Badge>
                      </div>

                      <Separator />

                      <div>
                        <Label htmlFor="order-status" className="mb-2 block">
                          تغيير حالة الطلب
                        </Label>
                        <div className="flex items-center gap-2">
                          <Select
                            value={newOrderStatus}
                            onValueChange={setNewOrderStatus}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">
                                قيد الانتظار
                              </SelectItem>
                              <SelectItem value="processing">
                                قيد المعالجة
                              </SelectItem>
                              <SelectItem value="shipped">تم الشحن</SelectItem>
                              <SelectItem value="delivered">
                                تم التوصيل
                              </SelectItem>
                              <SelectItem value="cancelled">إلغاء</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            onClick={handleUpdateStatus}
                            disabled={
                              updatingStatus ||
                              newOrderStatus === selectedOrder.orderStatus
                            }
                            size="sm"
                          >
                            {updatingStatus ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "تحديث"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* عناصر الطلب */}
              <div>
                <h4 className="font-medium mb-3">عناصر الطلب</h4>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>المجموع</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-12 w-12 rounded-md object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  رقم المنتج: {item.productId}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.price.toLocaleString()} ريال
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="font-medium">
                            {(item.price * item.quantity).toLocaleString()} ريال
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              {/* الحسابات والعنوان */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-3">الحسابات</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          مجموع المنتجات:
                        </span>
                        <span>
                          {selectedOrder.subtotal.toLocaleString()} ريال
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الشحن:</span>
                        <span>
                          {selectedOrder.shipping.toLocaleString()} ريال
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الضريبة:</span>
                        <span>{selectedOrder.tax.toLocaleString()} ريال</span>
                      </div>
                      {selectedOrder.discount && selectedOrder.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">الخصم:</span>
                          <span className="text-green-600">
                            -{selectedOrder.discount.toLocaleString()} ريال
                          </span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>الإجمالي النهائي:</span>
                        <span>{selectedOrder.total.toLocaleString()} ريال</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-medium mb-3">عنوان الشحن</h4>
                    <div className="text-sm space-y-1">
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>
                        {selectedOrder.shippingAddress.city}،
                        {selectedOrder.shippingAddress.district &&
                          ` ${selectedOrder.shippingAddress.district}`}
                      </p>
                      <p>{selectedOrder.shippingAddress.governorate}</p>
                      <p>
                        {selectedOrder.shippingAddress.country}
                        {selectedOrder.shippingAddress.zipCode &&
                          `، ${selectedOrder.shippingAddress.zipCode}`}
                      </p>
                    </div>

                    {selectedOrder.notes && (
                      <>
                        <Separator className="my-3" />
                        <div>
                          <h5 className="font-medium mb-1">ملاحظات الطلب:</h5>
                          <p className="text-sm text-muted-foreground">
                            {selectedOrder.notes}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => goToOrderDetails(selectedOrder.id)}
              >
                عرض الصفحة الكاملة
              </Button>
              <Button onClick={() => setSelectedOrder(null)}>إغلاق</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default OrdersTab;
