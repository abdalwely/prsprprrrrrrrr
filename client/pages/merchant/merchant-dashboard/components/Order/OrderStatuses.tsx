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
// Order Statuses Component
// ============================================================================
interface OrderStatusesProps {
  storeId: string | null;
}

interface StatusConfig {
  id: string;
  label: string;
  color: string;
  isActive: boolean;
  description: string;
  nextStatuses: string[];
}

const OrderStatuses: React.FC<OrderStatusesProps> = ({ storeId }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<StatusConfig[]>([
    {
      id: "pending",
      label: "قيد الانتظار",
      color: "bg-yellow-100 text-yellow-800",
      isActive: true,
      description: "تم استلام الطلب ولم تتم معالجته بعد",
      nextStatuses: ["processing", "cancelled"],
    },
    {
      id: "processing",
      label: "قيد المعالجة",
      color: "bg-blue-100 text-blue-800",
      isActive: true,
      description: "الطلب قيد التحضير والتجهيز",
      nextStatuses: ["shipped", "cancelled"],
    },
    {
      id: "shipped",
      label: "تم الشحن",
      color: "bg-purple-100 text-purple-800",
      isActive: true,
      description: "تم شحن الطلب إلى العنوان المحدد",
      nextStatuses: ["delivered", "returned"],
    },
    {
      id: "delivered",
      label: "تم التوصيل",
      color: "bg-green-100 text-green-800",
      isActive: true,
      description: "تم توصيل الطلب للعميل",
      nextStatuses: [],
    },
    {
      id: "cancelled",
      label: "ملغي",
      color: "bg-red-100 text-red-800",
      isActive: true,
      description: "تم إلغاء الطلب",
      nextStatuses: [],
    },
    {
      id: "returned",
      label: "مرتجع",
      color: "bg-orange-100 text-orange-800",
      isActive: true,
      description: "تم إرجاع الطلب",
      nextStatuses: ["refunded"],
    },
    {
      id: "refunded",
      label: "تم الاسترجاع",
      color: "bg-gray-100 text-gray-800",
      isActive: true,
      description: "تم استرجاع المبلغ للعميل",
      nextStatuses: [],
    },
  ]);

  const [newStatus, setNewStatus] = useState({
    id: "",
    label: "",
    color: "bg-gray-100 text-gray-800",
    description: "",
  });

  const addStatus = () => {
    if (!newStatus.id || !newStatus.label) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال معرف وتسمية للحالة",
        variant: "destructive",
      });
      return;
    }

    const exists = statuses.find((s) => s.id === newStatus.id);
    if (exists) {
      toast({
        title: "خطأ",
        description: "معرّف الحالة موجود مسبقاً",
        variant: "destructive",
      });
      return;
    }

    setStatuses([
      ...statuses,
      {
        ...newStatus,
        isActive: true,
        nextStatuses: [],
      },
    ]);

    setNewStatus({
      id: "",
      label: "",
      color: "bg-gray-100 text-gray-800",
      description: "",
    });

    toast({
      title: "تمت الإضافة",
      description: "تمت إضافة حالة جديدة بنجاح",
    });
  };

  const toggleStatus = (id: string) => {
    setStatuses(
      statuses.map((status) =>
        status.id === id ? { ...status, isActive: !status.isActive } : status,
      ),
    );
  };

  const saveStatuses = async () => {
    if (!storeId) {
      toast({
        title: "خطأ",
        description: "لم يتم تحديد المتجر",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await orderService.saveOrderSettings(storeId, { statusConfig: statuses });
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات حالات الطلب",
      });
    } catch (error) {
      console.error("خطأ في حفظ الحالات:", error);
      toast({
        title: "خطأ",
        description: "تعذر حفظ إعدادات الحالات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>حالات الطلب</CardTitle>
          <CardDescription>
            إدارة حالات الطلب وسير العمل (Workflow)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* قائمة الحالات الحالية */}
          <div className="space-y-4">
            <h3 className="font-medium">الحالات الحالية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statuses.map((status) => (
                <Card key={status.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={status.color}>{status.label}</Badge>
                      <Switch
                        checked={status.isActive}
                        onCheckedChange={() => toggleStatus(status.id)}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {status.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      المعرف: <code>{status.id}</code>
                    </p>
                    {status.nextStatuses.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">
                          الحالات التالية: {status.nextStatuses.join(", ")}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* إضافة حالة جديدة */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-medium">إضافة حالة جديدة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status-id">معرف الحالة (ID)</Label>
                <Input
                  id="status-id"
                  placeholder="مثال: custom_status"
                  value={newStatus.id}
                  onChange={(e) =>
                    setNewStatus({ ...newStatus, id: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-label">تسمية الحالة</Label>
                <Input
                  id="status-label"
                  placeholder="مثال: قيد المراجعة"
                  value={newStatus.label}
                  onChange={(e) =>
                    setNewStatus({ ...newStatus, label: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-color">لون البادج</Label>
                <Select
                  value={newStatus.color}
                  onValueChange={(value) =>
                    setNewStatus({ ...newStatus, color: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bg-yellow-100 text-yellow-800">
                      أصفر
                    </SelectItem>
                    <SelectItem value="bg-blue-100 text-blue-800">
                      أزرق
                    </SelectItem>
                    <SelectItem value="bg-green-100 text-green-800">
                      أخضر
                    </SelectItem>
                    <SelectItem value="bg-red-100 text-red-800">
                      أحمر
                    </SelectItem>
                    <SelectItem value="bg-purple-100 text-purple-800">
                      بنفسجي
                    </SelectItem>
                    <SelectItem value="bg-gray-100 text-gray-800">
                      رمادي
                    </SelectItem>
                    <SelectItem value="bg-orange-100 text-orange-800">
                      برتقالي
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-desc">الوصف</Label>
                <Input
                  id="status-desc"
                  placeholder="وصف حالة الطلب"
                  value={newStatus.description}
                  onChange={(e) =>
                    setNewStatus({ ...newStatus, description: e.target.value })
                  }
                />
              </div>
            </div>

            <Button onClick={addStatus} className="mt-4">
              إضافة حالة
            </Button>
          </div>

          <div className="pt-6 border-t">
            <Button onClick={saveStatuses} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ جميع التغييرات"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default OrderStatuses;
