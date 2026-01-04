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
import OrderStatuses from "./Order/OrderStatuses";
import InvoiceCustomization from "./Order/InvoiceCustomization";
import OrderSettings from "./Order/OrderSettings";
import OrdersManagement from "./Order/OrdersManagement";

// تعريف الـ Props للمكون الرئيسي
interface OrdersTabProps {
  orders: Order[];
  stats: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    revenue: number;
    averageOrder: number;
  };
  subActiveTab: string;
  setSubActiveTab: (tabId: any) => void;
  navigate: NavigateFunction;
  showConfirmDialog: (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "shipping" | "customer" | "order" | "payment" | "product",
  ) => void;
  editingOrder: Order | null;
  setEditingOrder: React.Dispatch<React.SetStateAction<Order | null>>;
  handleUpdateOrderAddress: (
    orderId: string,
    address: ShippingAddress,
  ) => Promise<void>;
  savingOrderAddress: boolean;
  setSavingOrderAddress: React.Dispatch<React.SetStateAction<boolean>>;
}

// تعريف Stats interface
interface Stats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  revenue: number;
  averageOrder: number;
}

const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  stats,
  subActiveTab,
  setSubActiveTab,
  navigate,
  showConfirmDialog,
  editingOrder,
  setEditingOrder,
  handleUpdateOrderAddress,
  savingOrderAddress,
  setSavingOrderAddress,
}) => {
  const { toast } = useToast();
  const [storeId, setStoreId] = useState<string | null>(null);

  // Tab configurations
  const orderTabs = [
    {
      id: "management",
      label: "إدارة الطلبات",
      icon: <Package className="h-4 w-4" />,
    },
    {
      id: "settings",
      label: "إعدادات الطلب",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      id: "payments",
      label: "حالات الطلب",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      id: "invoices",
      label: "تخصيص الفواتير",
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  useEffect(() => {
    const loadStoreId = async () => {
      const currentStoreId = await getCurrentStoreId();
      setStoreId(currentStoreId);
    };
    loadStoreId();
  }, []);

  // Helper functions
  const getStatusLabel = (status: string): string => {
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

  const getPaymentStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: "قيد الانتظار",
      paid: "مدفوع",
      failed: "فشل",
      refunded: "تم الاسترجاع",
      partially_refunded: "مدفوع جزئياً",
    };
    return labels[status] || status;
  };

  const getStatusBadge = (status: string): string => {
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

  const getPaymentStatusBadge = (status: string): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      case "partially_refunded":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
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
                  {(stats?.revenue || 0).toLocaleString()} ريال
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
                  {(stats?.averageOrder || 0).toLocaleString()} ريال
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
                <p className="text-2xl font-bold">{stats?.pending || 0}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>إدارة الطلبات</CardTitle>
          <CardDescription>
            قم بإدارة طلباتك، إعدادات الطلب، حالات الطلب، وتخصيص الفواتير
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={subActiveTab}
            onValueChange={setSubActiveTab}
            className="w-full"
          >
            {/* <TabsList className="grid grid-cols-4 mb-6">
              {orderTabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList> */}

            {/* Tab 1: إدارة الطلبات */}
            <TabsContent value="management" className="space-y-4">
              <OrdersManagement
                orders={orders}
                navigate={navigate}
                showConfirmDialog={showConfirmDialog}
                storeId={storeId}
                getStatusLabel={getStatusLabel}
                getPaymentStatusLabel={getPaymentStatusLabel}
                getStatusBadge={getStatusBadge}
                getPaymentStatusBadge={getPaymentStatusBadge}
              />
            </TabsContent>

            {/* Tab 2: إعدادات الطلب */}
            <TabsContent value="settings" className="space-y-4">
              <OrderSettings storeId={storeId} />
            </TabsContent>

            {/* Tab 3: حالات الطلب */}
            <TabsContent value="payments" className="space-y-4">
              <OrderStatuses storeId={storeId} />
            </TabsContent>

            {/* Tab 4: تخصيص الفواتير */}
            <TabsContent value="invoices" className="space-y-4">
              <InvoiceCustomization storeId={storeId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersTab;
