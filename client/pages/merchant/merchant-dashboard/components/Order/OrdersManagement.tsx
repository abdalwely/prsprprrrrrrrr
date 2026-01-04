import React, { useState, useEffect } from "react";
import { useNavigate, NavigateFunction } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Settings,
  FileText,
  CreditCard,
  FileDown,
  Printer,
} from "lucide-react";

import { orderService } from "@/lib/src/services/order/order.service";
import { Order, OrderItem, ShippingAddress } from "@/lib/src/types";
import { getCurrentStoreId } from "@/lib/src/firebase/firebase";

// ============================================================================
// Orders Management Component
// ============================================================================
interface OrdersManagementProps {
  orders: Order[];
  navigate: NavigateFunction;
  showConfirmDialog: (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "shipping" | "customer" | "order" | "payment" | "product",
  ) => void;
  storeId: string | null;
  getStatusLabel: (status: string) => string;
  getPaymentStatusLabel: (status: string) => string;
  getStatusBadge: (status: string) => string;
  getPaymentStatusBadge: (status: string) => string;
}

const OrdersManagement: React.FC<OrdersManagementProps> = ({
  orders,
  navigate,
  showConfirmDialog,
  storeId,
  getStatusLabel,
  getPaymentStatusLabel,
  getStatusBadge,
  getPaymentStatusBadge,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newOrderStatus, setNewOrderStatus] = useState("");

  // عوامل التصفية
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  useEffect(() => {
    setFilteredOrders(orders);
    setLoading(false);
  }, [orders]);

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

      toast({
        title: "تم التحديث",
        description: `تم تحديث حالة الطلب إلى ${getStatusLabel(newOrderStatus)}`,
      });

      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              orderStatus: newOrderStatus as any,
              updatedAt: new Date(),
            }
          : null,
      );
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* أدوات التحكم */}
      <Card>
        <CardContent className="pt-6">
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

            <div className="flex items-center gap-2 flex-wrap">
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
                  <SelectItem value="refunded">تم الاسترجاع</SelectItem>
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
                              : order.paymentMethod === "bank_transfer"
                                ? "تحويل بنكي"
                                : "دفع إلكتروني"}
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
                          طريقة الدفع:
                        </span>
                        <span>
                          {selectedOrder.paymentMethod === "cod"
                            ? "الدفع عند الاستلام"
                            : selectedOrder.paymentMethod === "bank_transfer"
                              ? "تحويل بنكي"
                              : "دفع إلكتروني"}
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
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
export default OrdersManagement;
