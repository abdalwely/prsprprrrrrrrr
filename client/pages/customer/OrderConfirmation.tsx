// D:\New folder (2)\store\client\pages\customer\OrderConfirmation.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  ShoppingBag,
  Home,
  Package,
  Truck,
  Clock,
  Mail,
  Phone,
  MapPin,
  Download,
  Share2,
  CreditCard,
  Banknote,
  Building2,
} from "lucide-react";
import { orderService, storeService, type Order } from "@/lib/firestore";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  image: string;
}

interface OrderData {
  id: string;
  storeId: string;
  storeName: string;
  customerId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  storeContact?: {
    phone?: string;
    email?: string;
  };
  firestoreId?: string;
}

export default function OrderConfirmation() {
  const { subdomain } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState<string>("المتجر");

  useEffect(() => {
    loadOrderData();
  }, [location]);

  const loadOrderData = async () => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const orderIdFromUrl = searchParams.get("orderId");

      if (orderIdFromUrl) {
        const firestoreOrder = await orderService.getById(orderIdFromUrl);
        if (firestoreOrder) {
          // ✅ التحقق من نوع التاريخ وحمايته
          const createdAt = firestoreOrder.createdAt
            ? firestoreOrder.createdAt instanceof Date
              ? firestoreOrder.createdAt
              : typeof firestoreOrder.createdAt === "string"
                ? new Date(firestoreOrder.createdAt)
                : typeof firestoreOrder.createdAt === "number"
                  ? new Date(firestoreOrder.createdAt)
                  : new Date()
            : new Date();

          const updatedAt = firestoreOrder.updatedAt
            ? firestoreOrder.updatedAt instanceof Date
              ? firestoreOrder.updatedAt
              : typeof firestoreOrder.updatedAt === "string"
                ? new Date(firestoreOrder.updatedAt)
                : typeof firestoreOrder.updatedAt === "number"
                  ? new Date(firestoreOrder.updatedAt)
                  : new Date()
            : new Date();

          const orderData = {
            id: firestoreOrder.id,
            storeId: firestoreOrder.storeId,
            storeName: "جاري التحميل...",
            customerId: firestoreOrder.customerId,
            customerInfo: firestoreOrder.customerSnapshot,
            shippingAddress: firestoreOrder.shippingAddress,
            items: firestoreOrder.items,
            subtotal: firestoreOrder.subtotal,
            shipping: firestoreOrder.shipping,
            tax: firestoreOrder.tax,
            total: firestoreOrder.total,
            paymentMethod: firestoreOrder.paymentMethod,
            paymentStatus: firestoreOrder.paymentStatus,
            orderStatus: firestoreOrder.orderStatus,
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
            firestoreId: firestoreOrder.id,
          };

          const store = await storeService.getById(firestoreOrder.storeId);
          if (store) {
            setStoreName(store.name);
            // ✅ إضافة storeContact فقط إذا كان موجوداً في orderData
            const orderDataWithContact = {
              ...orderData,
              storeContact: store.contact || {},
            };
            setOrder(orderDataWithContact);
          }
        }
      }
    } catch (error) {
      console.error("Error loading order data:", error);
    }
  };

  const getOrderStatusInfo = (status: string) => {
    const statuses: {
      [key: string]: { text: string; color: string; icon: any };
    } = {
      pending: {
        text: "قيد الانتظار",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      },
      processing: {
        text: "قيد المعالجة",
        color: "bg-blue-100 text-blue-800",
        icon: Package,
      },
      shipped: {
        text: "تم الشحن",
        color: "bg-purple-100 text-purple-800",
        icon: Truck,
      },
      delivered: {
        text: "تم التسليم",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      cancelled: {
        text: "ملغي",
        color: "bg-red-100 text-red-800",
        icon: Clock,
      },
    };

    return statuses[status] || statuses.pending;
  };

  const getPaymentMethodText = (method: string) => {
    const methods: { [key: string]: string } = {
      cod: "الدفع عند الاستلام",
      bank: "التحويل البنكي",
      card: "البطاقة الائتمانية",
    };
    return methods[method] || method;
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons: { [key: string]: any } = {
      cod: Banknote,
      bank: Building2,
      card: CreditCard,
    };
    return icons[method] || CreditCard;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      return "غير محدد";
    }
  };

  const handleDownloadReceipt = () => {
    if (!order) return;

    const receiptContent = `
      إيصال طلب - ${order.storeName}
      رقم الطلب: ${order.id}
      التاريخ: ${formatDate(order.createdAt)}

      معلومات العميل:
      الاسم: ${order.customerInfo.firstName} ${order.customerInfo.lastName}
      البريد الإلكتروني: ${order.customerInfo.email}
      الهاتف: ${order.customerInfo.phone}

      العنوان:
      ${order.shippingAddress.street}
      ${order.shippingAddress.city}, ${order.shippingAddress.state}
      ${order.shippingAddress.country}
      ${order.shippingAddress.zipCode ? `الرمز البريدي: ${order.shippingAddress.zipCode}` : ""}

      المنتجات:
      ${order.items
        .map(
          (item) => `
        - ${item.name} × ${item.quantity}: ${item.price * item.quantity} ر.س
      `,
        )
        .join("")}

      الإجمالي:
      المجموع الفرعي: ${order.subtotal} ر.س
      الشحن: ${order.shipping} ر.س
      الضريبة: ${order.tax} ر.س
      الإجمالي النهائي: ${order.total} ر.س

      طريقة الدفع: ${getPaymentMethodText(order.paymentMethod)}
      حالة الطلب: ${getOrderStatusInfo(order.orderStatus).text}

      شكراً لشرائك من ${order.storeName}
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${order.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "تم تحميل الإيصال",
      description: "تم حفظ الإيصال بنجاح",
    });
  };

  const handleShareOrder = async () => {
    if (!order) return;

    const shareData = {
      title: `طلبي من ${order.storeName}`,
      text: `طلبت من ${order.storeName} - رقم الطلب: ${order.id} - الإجمالي: ${order.total} ر.س`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("تم إلغاء المشاركة");
      }
    } else {
      // Fallback: نسخ إلى الحافظة
      navigator.clipboard.writeText(shareData.text);
      toast({
        title: "تم النسخ",
        description: "تم نسخ تفاصيل الطلب إلى الحافظة",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <CheckCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            لم يتم العثور على الطلب
          </h1>
          <p className="text-gray-600 mb-6">تعذر تحميل تفاصيل الطلب المطلوب</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate(`/store/${subdomain}`)}>
              العودة للمتجر
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/customer/dashboard")}
            >
              لوحة التحكم
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getOrderStatusInfo(order.orderStatus);
  const StatusIcon = statusInfo.icon;
  const PaymentIcon = getPaymentMethodIcon(order.paymentMethod);

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        {/* رأس الصفحة */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            تم استلام طلبك بنجاح!
          </h1>
          <p className="text-xl text-gray-600">
            شكراً لك على طلبك من <strong>{storeName}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* المحتوى الرئيسي */}
          <div className="lg:col-span-2 space-y-6">
            {/* بطاقة حالة الطلب */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${statusInfo.color}`}>
                      <StatusIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">حالة الطلب</h3>
                      <Badge className={`mt-1 ${statusInfo.color} border-0`}>
                        {statusInfo.text}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-600">رقم الطلب</p>
                    <p className="font-mono font-semibold">{order.id}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">تاريخ الطلب</p>
                    <p className="font-semibold">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">طريقة الدفع</p>
                    <div className="flex items-center gap-2">
                      <PaymentIcon className="h-4 w-4 text-gray-500" />
                      <p className="font-semibold">
                        {getPaymentMethodText(order.paymentMethod)}
                      </p>
                    </div>
                  </div>
                </div>

                {order.trackingNumber && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-gray-600">رقم التتبع</p>
                      <p className="font-semibold font-mono">
                        {order.trackingNumber}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* تفاصيل الطلب */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">تفاصيل الطلب</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            الكمية: {item.quantity}
                          </p>
                          {item.variant && (
                            <p className="text-sm text-gray-500">
                              {item.variant}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">
                          {item.price * item.quantity} ر.س
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.price} ر.س للقطعة
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي</span>
                    <span>{order.subtotal} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الشحن</span>
                    <span>{order.shipping} ر.س</span>
                  </div>
                  {order.tax > 0 && (
                    <div className="flex justify-between">
                      <span>الضريبة</span>
                      <span>{order.tax} ر.س</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي</span>
                    <span className="text-green-600">{order.total} ر.س</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* معلومات الشحن */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  عنوان الشحن
                </h3>
                <div className="space-y-2">
                  <p>
                    <strong>الاسم:</strong> {order.customerInfo.firstName}{" "}
                    {order.customerInfo.lastName}
                  </p>
                  <p>
                    <strong>العنوان:</strong> {order.shippingAddress.street}
                  </p>
                  <p>
                    <strong>المدينة:</strong> {order.shippingAddress.city}
                  </p>
                  <p>
                    <strong>المنطقة:</strong> {order.shippingAddress.state}
                  </p>
                  <p>
                    <strong>الدولة:</strong> {order.shippingAddress.country}
                  </p>
                  {order.shippingAddress.zipCode && (
                    <p>
                      <strong>الرمز البريدي:</strong>{" "}
                      {order.shippingAddress.zipCode}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* معلومات الاتصال */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  معلومات الاتصال
                </h3>
                <div className="space-y-2">
                  <p>
                    <strong>البريد الإلكتروني:</strong>{" "}
                    {order.customerInfo.email}
                  </p>
                  <p>
                    <strong>الهاتف:</strong> {order.customerInfo.phone}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            {/* إجراءات سريعة */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">الإجراءات</h3>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleDownloadReceipt}
                  >
                    <Download className="h-4 w-4 ml-2" />
                    تحميل الإيصال
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleShareOrder}
                  >
                    <Share2 className="h-4 w-4 ml-2" />
                    مشاركة الطلب
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* معلومات المتجر */}
            {(order.storeContact?.phone || order.storeContact?.email) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">
                    للتواصل مع المتجر
                  </h3>
                  <div className="space-y-3">
                    {order.storeContact.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{order.storeContact.phone}</span>
                      </div>
                    )}
                    {order.storeContact.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{order.storeContact.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* أزرار التنقل */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => navigate(`/store/${subdomain}`)}
                  >
                    <ShoppingBag className="h-4 w-4 ml-2" />
                    مواصلة التسوق
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/customer/dashboard")}
                  >
                    <Home className="h-4 w-4 ml-2" />
                    العودة للرئيسية
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/customer/orders")}
                  >
                    <Package className="h-4 w-4 ml-2" />
                    عرض جميع الطلبات
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* معلومات مهمة */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">معلومات مهمة</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>• سيتم التواصل معك خلال 24 ساعة لتأكيد تفاصيل الطلب</p>
                  <p>• يمكنك تتبع حالة طلبك من صفحة الطلبات</p>
                  <p>• لأي استفسارات، لا تتردد في التواصل مع خدمة العملاء</p>
                  {order.paymentMethod === "cod" && (
                    <p className="text-yellow-600 font-semibold">
                      • سيتم الاتصال بك لتأكيد العنوان وموعد التسليم
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>لأي استفسارات حول طلبك، لا تتردد في التواصل مع خدمة العملاء</p>
          <p className="mt-1">سيصلك تأكيد الطلب على بريدك الإلكتروني قريباً</p>
          {order.firestoreId && (
            <p className="mt-1 text-xs">
              معرف الطلب في النظام: {order.firestoreId}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
