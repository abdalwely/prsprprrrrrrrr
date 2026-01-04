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
// Order Settings Component
// ============================================================================
interface OrderSettingsProps {
  storeId: string | null;
}

const OrderSettings: React.FC<OrderSettingsProps> = ({ storeId }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    autoConfirmOrders: false,
    allowGuestCheckout: true,
    minimumOrderAmount: 0,
    freeShippingThreshold: 1000,
    defaultOrderStatus: "pending",
    defaultPaymentStatus: "pending",
    enableOrderTracking: true,
    enableCustomerNotes: true,
    enablePartialPayments: false,
    enableBackorders: false,
    requireShippingAddress: true,
    requireBillingAddress: false,
    orderExpiryDays: 30,
  });

  const loadSettings = async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      const savedSettings = await orderService.getOrderSettings(storeId);
      if (savedSettings) {
        setSettings((prev) => ({ ...prev, ...savedSettings }));
      }
    } catch (error) {
      console.error("خطأ في تحميل الإعدادات:", error);
      toast({
        title: "خطأ",
        description: "تعذر تحميل إعدادات الطلبات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
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
      await orderService.saveOrderSettings(storeId, settings);
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات الطلبات بنجاح",
      });
    } catch (error) {
      console.error("خطأ في حفظ الإعدادات:", error);
      toast({
        title: "خطأ",
        description: "تعذر حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [storeId]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الطلبات</CardTitle>
          <CardDescription>
            إدارة الإعدادات المتعلقة بمعالجة وتنفيذ الطلبات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-confirm">التأكيد التلقائي للطلبات</Label>
                  <p className="text-sm text-gray-500">
                    تأكيد الطلبات تلقائياً عند استلامها
                  </p>
                </div>
                <Switch
                  id="auto-confirm"
                  checked={settings.autoConfirmOrders}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoConfirmOrders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="guest-checkout">الطلب كضيف</Label>
                  <p className="text-sm text-gray-500">
                    السماح للعملاء بالطلب دون إنشاء حساب
                  </p>
                </div>
                <Switch
                  id="guest-checkout"
                  checked={settings.allowGuestCheckout}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allowGuestCheckout: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="order-tracking">تتبع الطلبات</Label>
                  <p className="text-sm text-gray-500">
                    تمكين نظام تتبع الطلبات
                  </p>
                </div>
                <Switch
                  id="order-tracking"
                  checked={settings.enableOrderTracking}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableOrderTracking: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="customer-notes">ملاحظات العميل</Label>
                  <p className="text-sm text-gray-500">
                    السماح للعملاء بإضافة ملاحظات للطلب
                  </p>
                </div>
                <Switch
                  id="customer-notes"
                  checked={settings.enableCustomerNotes}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enableCustomerNotes: checked })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="min-order">حد الطلب الأدنى (ريال)</Label>
                <Input
                  id="min-order"
                  type="number"
                  value={settings.minimumOrderAmount}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      minimumOrderAmount: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="free-shipping">حد الشحن المجاني (ريال)</Label>
                <Input
                  id="free-shipping"
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      freeShippingThreshold: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order-expiry">أيام انتهاء الطلب</Label>
                <Input
                  id="order-expiry"
                  type="number"
                  value={settings.orderExpiryDays}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      orderExpiryDays: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="default-status">حالة الطلب الافتراضية</Label>
              <Select
                value={settings.defaultOrderStatus}
                onValueChange={(value) =>
                  setSettings({ ...settings, defaultOrderStatus: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="processing">قيد المعالجة</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-status">حالة الدفع الافتراضية</Label>
              <Select
                value={settings.defaultPaymentStatus}
                onValueChange={(value) =>
                  setSettings({ ...settings, defaultPaymentStatus: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="paid">مدفوع</SelectItem>
                  <SelectItem value="partial">دفع جزئي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="shipping-address">عنوان الشحن</Label>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-sm">مطلوب عنوان الشحن</span>
                  <p className="text-xs text-gray-500">
                    إلزامية إدخال عنوان الشحن
                  </p>
                </div>
                <Switch
                  id="shipping-address"
                  checked={settings.requireShippingAddress}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      requireShippingAddress: checked,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing-address">عنوان الفاتورة</Label>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-sm">مطلوب عنوان الفاتورة</span>
                  <p className="text-xs text-gray-500">
                    إلزامية إدخال عنوان الفاتورة
                  </p>
                </div>
                <Switch
                  id="billing-address"
                  checked={settings.requireBillingAddress}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, requireBillingAddress: checked })
                  }
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={saveSettings} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ الإعدادات"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default OrderSettings;
