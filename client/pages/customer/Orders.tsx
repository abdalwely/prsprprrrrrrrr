import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Favorites from "./Favorites";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  orderService,
  customerService,
  storeService,
  type Order,
} from "@/lib/src";
import { Package, ArrowLeft, CheckCircle } from "lucide-react";
import ConfirmReceiptDialog from "@/components/ui/ConfirmReceiptDialog";

// Helper to parse Firestore Timestamp / string / Date into a JS Date
const parseOrderDate = (value: any): Date => {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number")
    return new Date(value);
  if (value && typeof value.toDate === "function") return value.toDate();
  if (value && typeof value.seconds === "number")
    return new Date(value.seconds * 1000);
  return new Date(value);
};

export default function Orders() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogOrderId, setConfirmDialogOrderId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const load = async () => {
      if (!userData?.uid) return;
      setLoading(true);
      try {
        const customer = await customerService.getByUid(userData.uid);
        if (!customer) {
          toast({
            title: "لم يتم العثور على بيانات العميل",
            description: "لا يوجد حساب عميل مرتبط بمستخدمك",
            variant: "destructive",
          });
          setOrders([]);
          return;
        }

        const found = await orderService.getByCustomer(customer.uid);
        setOrders(found || []);

        // Load store names for display
        const uniqueStoreIds = Array.from(new Set(found.map((o) => o.storeId)));
        const names: Record<string, string> = {};
        await Promise.all(
          uniqueStoreIds.map(async (sid) => {
            try {
              const s = await storeService.getById(sid);
              if (s) names[sid] = s.name || sid;
            } catch (e) {
              names[sid] = sid;
            }
          }),
        );
        setStoreNames(names);
      } catch (error) {
        console.error("Error loading orders:", error);
        toast({
          title: "خطأ في جلب الطلبات",
          description: "حاول مرة أخرى لاحقاً",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userData?.uid, toast]);

  const handleConfirmReceipt = async (orderId: string) => {
    if (!userData?.uid || !orderId) return;
    // Optimistic update: mark order as delivered locally while request runs
    setConfirmingId(orderId);
    const prevOrders = orders;
    try {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                customerConfirmedDelivery: true,
                orderStatus: "delivered",
              }
            : o,
        ),
      );

      const customer = await customerService.getByUid(userData.uid);
      if (!customer) {
        toast({
          title: "لم يتم العثور على بيانات العميل",
          variant: "destructive",
        });
        setOrders(prevOrders);
        return;
      }

      await orderService.getStats(orderId);

      toast({
        title: "تم تأكيد الاستلام",
        description: "شكراً لتأكيدك استلام الطلب",
      });

      // Refresh orders list from server to be safe
      const found = await orderService.getByCustomer(customer.uid);
      setOrders(found || []);

      // Refresh store names mapping
      const uniqueStoreIds = Array.from(new Set(found.map((o) => o.storeId)));
      const names: Record<string, string> = {};
      await Promise.all(
        uniqueStoreIds.map(async (sid) => {
          try {
            const s = await storeService.getById(sid);
            if (s) names[sid] = s.name || sid;
          } catch (e) {
            names[sid] = sid;
          }
        }),
      );
      setStoreNames(names);
    } catch (error) {
      console.error("Error confirming receipt:", error);
      toast({
        title: "خطأ في تأكيد الاستلام",
        description: "حاول مرة أخرى لاحقاً",
        variant: "destructive",
      });
      // revert optimistic change
      setOrders(prevOrders);
    } finally {
      setConfirmingId(null);
    }
  };

  // Confirmation dialog handlers (moved inside component)
  const confirmDialogClose = () => {
    setConfirmDialogOrderId(null);
    setConfirmDialogOpen(false);
  };

  const confirmDialogYes = async () => {
    if (!confirmDialogOrderId) return;
    await handleConfirmReceipt(confirmDialogOrderId);
    confirmDialogClose();
  };

  const getOrderStatusInfo = (status: string) => {
    const statuses: { [key: string]: { text: string; color: string } } = {
      pending: { text: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800" },
      processing: { text: "قيد المعالجة", color: "bg-blue-100 text-blue-800" },
      shipped: { text: "تم الشحن", color: "bg-purple-100 text-purple-800" },
      delivered: { text: "تم التسليم", color: "bg-green-100 text-green-800" },
      cancelled: { text: "ملغي", color: "bg-red-100 text-red-800" },
    };
    return statuses[status] || statuses.pending;
  };

  if (!userData?.uid) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Package className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">الرجاء تسجيل الدخول</h2>
          <p className="text-gray-600">يجب تسجيل الدخول لعرض طلباتك</p>
          <div className="mt-4">
            <Button onClick={() => navigate("/login")}>تسجيل الدخول</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Tabs defaultValue="orders" value={undefined}>
            <TabsList>
              <TabsTrigger value="orders">طلباتي</TabsTrigger>
              <TabsTrigger value="favorites">المفضلة</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> العودة
          </Button>
        </div>

        <TabsContent value="orders">
          {loading ? (
            <div className="text-center py-20">جاري تحميل الطلبات...</div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                لا توجد طلبات حتى الآن.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => {
                const effectiveStatus =
                  (o as any).orderStatus || (o as any).status || "";
                const merchantConfirmed =
                  (o as any).merchantConfirmedDelivery || false;
                const customerConfirmed =
                  (o as any).customerConfirmedDelivery || false;

                return (
                  <Card key={o.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">#{o.id}</div>
                          <div className="text-sm text-gray-600">
                            {parseOrderDate(
                              o.createdAt as any,
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{o.total} ر.س</div>
                          <div className="text-sm text-gray-600 flex items-center gap-3 justify-end">
                            <span>{o.paymentStatus}</span>
                            <div className="flex items-center gap-2">
                              {(effectiveStatus === "shipped" ||
                                merchantConfirmed) &&
                                !customerConfirmed && (
                                  <label className="inline-flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 text-green-600 rounded"
                                      onChange={() => {
                                        setConfirmDialogOrderId(o.id);
                                        setConfirmDialogOpen(true);
                                      }}
                                      disabled={confirmingId === o.id}
                                      aria-label="تأكيد الاستلام"
                                    />
                                    <span className="text-sm text-green-700">
                                      تأكيد الاستلام
                                    </span>
                                  </label>
                                )}
                              <Badge
                                className={`${getOrderStatusInfo(effectiveStatus).color} border-0`}
                              >
                                {getOrderStatusInfo(effectiveStatus).text}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          متجر: {storeNames[o.storeId] || o.storeId}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/store/${o.storeId}/order?orderId=${o.id}`,
                                { state: { order: o } },
                              )
                            }
                          >
                            عرض التفاصيل
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        <TabsContent value="favorites">
          <Favorites />
        </TabsContent>
      </div>
      <ConfirmReceiptDialog
        open={confirmDialogOpen}
        onClose={confirmDialogClose}
        onConfirm={confirmDialogYes}
        loading={confirmingId === confirmDialogOrderId}
      />
    </div>
  );
}
