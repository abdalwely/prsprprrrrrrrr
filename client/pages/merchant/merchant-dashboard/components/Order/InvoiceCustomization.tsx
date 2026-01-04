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
// Invoice Preview Component
// ============================================================================
interface InvoicePreviewProps {
  settings: any;
  order?: Order;
  onClose: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  settings,
  order,
  onClose,
}) => {
  // دالة لتحويل governorate إلى state والعكس
  const convertAddressForDisplay = (address: any) => {
    if (!address) return address;

    // إذا كان يحتوي على governorate ولكن ليس state
    if (address.governorate && !address.state) {
      return {
        ...address,
        state: address.governorate,
      };
    }

    // إذا كان يحتوي على state ولكن ليس governorate
    if (address.state && !address.governorate) {
      return {
        ...address,
        governorate: address.state,
      };
    }

    return address;
  };

  // دالة لإنشاء عنوان افتراضي متوافق
  const createDefaultAddress = () => ({
    street: "شارع الملك فهد",
    city: "صنعاء",
    district: "التحرير",
    state: "أمانة العاصمة",
    governorate: "أمانة العاصمة", // إضافة كليهما للتوافق
    zipCode: "12345",
    country: "اليمن",
  });
  // إنشاء طلب افتراضي للمعاينة متوافق مع Order interface
  const previewOrder: Order = order || {
    id: "ORD-2024-001",
    storeId: "store-001",
    customerId: "customer-001",
    customerSnapshot: {
      email: "customer@example.com",
      firstName: "أحمد",
      lastName: "محمد",
      phone: "0512345678",
      shippingAddress: createDefaultAddress(), // استخدام الدالة
    },
    items: [
      {
        productId: "P001",
        name: "منتج تجريبي 1",
        price: 150,
        quantity: 2,
        image: "",
      },
      {
        productId: "P002",
        name: "منتج تجريبي 2",
        price: 200,
        quantity: 1,
        image: "",
      },
    ],
    subtotal: 500,
    shipping: 50,
    tax: 75,
    discount: 25,
    total: 600,
    shippingAddress: createDefaultAddress(), // استخدام الدالة
    billingAddress: createDefaultAddress(), // استخدام الدالة
    paymentMethod: "bank_transfer",
    paymentStatus: "paid",
    orderStatus: "delivered",
    notes: "يرجى التسليم قبل الساعة 2 ظهراً",
    trackingNumber: "TRK-789654123",
    estimatedDelivery: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    storeContact: undefined,
    storeName: undefined,
    firestoreId: "ORD-2024-001",
    discountCode: "DISCOUNT10",
    paymentDetails: {
      transactionId: "TXN-123456",
      paymentGateway: "stripe",
      paidAt: new Date(),
    },
    fulfillmentStatus: "fulfilled",
    customerNotes: "يرجى التواصل قبل التسليم",
    carrier: "شركة الشحن السريع",
    deliveredAt: new Date(),
    cancelledAt: undefined,
    refundedAt: undefined,
  };
  const handlePrint = () => {
    const printContent = document.getElementById("invoice-preview-content");
    if (printContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>فاتورة الطلب ${previewOrder.id}</title>
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 20mm;
                }

                body {
                  font-family: 'Arial', 'Segoe UI', sans-serif;
                  font-size: 12px;
                  line-height: 1.5;
                  color: #333;
                  direction: rtl;
                }

                .invoice-container {
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                  border: 1px solid #ddd;
                  background: white;
                }

                .invoice-header {
                  border-bottom: 2px solid #333;
                  padding-bottom: 20px;
                  margin-bottom: 30px;
                }

                .invoice-footer {
                  border-top: 2px solid #333;
                  padding-top: 20px;
                  margin-top: 30px;
                  text-align: center;
                  color: #666;
                }

                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
                }

                th, td {
                  padding: 10px;
                  text-align: right;
                  border: 1px solid #ddd;
                }

                th {
                  background-color: #f8f9fa;
                  font-weight: bold;
                }

                .total-row {
                  font-weight: bold;
                  background-color: #f8f9fa;
                }

                .text-right {
                  text-align: right;
                }

                .text-left {
                  text-align: left;
                }

                .text-center {
                  text-align: center;
                }

                .mb-3 {
                  margin-bottom: 1rem;
                }

                .mt-3 {
                  margin-top: 1rem;
                }

                .mb-5 {
                  margin-bottom: 3rem;
                }

                .py-2 {
                  padding-top: 0.5rem;
                  padding-bottom: 0.5rem;
                }

                .border {
                  border: 1px solid #dee2e6;
                }

                .border-top {
                  border-top: 1px solid #dee2e6;
                }
              }

              body {
                font-family: 'Arial', 'Segoe UI', sans-serif;
                direction: rtl;
                background: #f5f5f5;
                padding: 20px;
              }

              .invoice-preview {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              ${printContent.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 1000);
              };
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleDownloadPDF = () => {
    // يمكنك استخدام مكتبة مثل jsPDF هنا
    alert("ميزة تحميل PDF تحت التطوير");
    // قم بتنفيذ منطق إنشاء PDF هنا
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            معاينة الفاتورة
          </DialogTitle>
          <DialogDescription>
            معاينة فاتورة الطلب قبل الطباعة أو التحميل
          </DialogDescription>
        </DialogHeader>

        <div id="invoice-preview-content" className="invoice-preview space-y-6">
          {/* رأس الفاتورة */}
          <div className="invoice-header">
            <div className="flex justify-between items-start mb-6">
              <div>
                {settings.includeLogo && settings.logoUrl && (
                  <img
                    src={settings.logoUrl}
                    alt="شعار المتجر"
                    className="h-20 mb-4 object-contain"
                  />
                )}
                {settings.includeStoreInfo && (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {settings.storeName || "اسم المتجر"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {settings.storeAddress || "عنوان المتجر"}
                    </p>
                    <p className="text-gray-600">
                      الهاتف: {settings.storePhone || "0512345678"}
                    </p>
                    <p className="text-gray-600">
                      البريد: {settings.storeEmail || "store@example.com"}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-left">
                <h2 className="text-3xl font-bold text-gray-800">فاتورة</h2>
                <div className="mt-4 space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">رقم الفاتورة:</span>{" "}
                    {previewOrder.id}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">التاريخ:</span>{" "}
                    {new Date(previewOrder.createdAt).toLocaleDateString(
                      "ar-SA",
                    )}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">الوقت:</span>{" "}
                    {new Date(previewOrder.createdAt).toLocaleTimeString(
                      "ar-SA",
                    )}
                  </p>
                  {settings.showDueDate && (
                    <p className="text-gray-600">
                      <span className="font-medium">تاريخ الاستحقاق:</span>{" "}
                      {new Date(
                        new Date(previewOrder.createdAt).getTime() +
                          (settings.dueDateDays || 30) * 24 * 60 * 60 * 1000,
                      ).toLocaleDateString("ar-SA")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {settings.includeTaxInfo &&
              (settings.taxNumber || settings.commercialRegister) && (
                <div className="bg-gray-50 p-4 rounded-md mb-6 border">
                  <h3 className="font-bold mb-3 text-gray-800">
                    المعلومات الضريبية
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {settings.taxNumber && (
                      <div>
                        <span className="text-gray-600">الرقم الضريبي: </span>
                        <span className="font-medium text-gray-800">
                          {settings.taxNumber}
                        </span>
                      </div>
                    )}
                    {settings.commercialRegister && (
                      <div>
                        <span className="text-gray-600">السجل التجاري: </span>
                        <span className="font-medium text-gray-800">
                          {settings.commercialRegister}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* معلومات العميل والطلب */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">معلومات العميل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">الاسم</p>
                    <p className="font-medium">
                      {previewOrder.customerSnapshot.firstName}{" "}
                      {previewOrder.customerSnapshot.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                    <p>{previewOrder.customerSnapshot.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الهاتف</p>
                    <p>{previewOrder.customerSnapshot.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">عنوان الشحن</p>
                    <p className="text-gray-700">
                      {previewOrder.shippingAddress.street}
                      <br />
                      {previewOrder.shippingAddress.city} -{" "}
                      {previewOrder.shippingAddress.district}
                      <br />
                      {previewOrder.shippingAddress.governorate}
                      <br />
                      {previewOrder.shippingAddress.country}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">معلومات الطلب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {settings.showPaymentMethod && (
                    <div>
                      <p className="text-sm text-gray-500">طريقة الدفع</p>
                      <p className="font-medium">
                        {previewOrder.paymentMethod === "cod"
                          ? "الدفع عند الاستلام"
                          : previewOrder.paymentMethod === "bank_transfer"
                            ? "تحويل بنكي"
                            : previewOrder.paymentMethod === "online"
                              ? "دفع إلكتروني"
                              : "محفظة إلكترونية"}
                      </p>
                    </div>
                  )}
                  {settings.showShippingMethod && previewOrder.carrier && (
                    <div>
                      <p className="text-sm text-gray-500">شركة الشحن</p>
                      <p>{previewOrder.carrier}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">حالة الطلب</p>
                    <Badge
                      className={
                        previewOrder.orderStatus === "delivered"
                          ? "bg-green-100 text-green-800"
                          : previewOrder.orderStatus === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : previewOrder.orderStatus === "processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                      }
                    >
                      {previewOrder.orderStatus === "delivered"
                        ? "تم التوصيل"
                        : previewOrder.orderStatus === "shipped"
                          ? "تم الشحن"
                          : previewOrder.orderStatus === "processing"
                            ? "قيد المعالجة"
                            : previewOrder.orderStatus === "pending"
                              ? "قيد الانتظار"
                              : "ملغي"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">حالة الدفع</p>
                    <Badge
                      className={
                        previewOrder.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : previewOrder.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      {previewOrder.paymentStatus === "paid"
                        ? "مدفوع"
                        : previewOrder.paymentStatus === "pending"
                          ? "قيد الانتظار"
                          : previewOrder.paymentStatus === "failed"
                            ? "فشل"
                            : "تم الاسترجاع"}
                    </Badge>
                  </div>
                  {previewOrder.trackingNumber && (
                    <div>
                      <p className="text-sm text-gray-500">رقم التتبع</p>
                      <p className="font-mono font-medium">
                        {previewOrder.trackingNumber}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* معلومات البنك */}
          {settings.showBankDetails && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  معلومات البنك للتحويلات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {settings.bankName && (
                    <div>
                      <p className="text-sm text-gray-500">اسم البنك</p>
                      <p className="font-medium">{settings.bankName}</p>
                    </div>
                  )}
                  {settings.accountNumber && (
                    <div>
                      <p className="text-sm text-gray-500">رقم الحساب</p>
                      <p className="font-mono">{settings.accountNumber}</p>
                    </div>
                  )}
                  {settings.iban && (
                    <div>
                      <p className="text-sm text-gray-500">رقم IBAN</p>
                      <p className="font-mono">{settings.iban}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* جدول المنتجات */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              المنتجات المطلوبة
            </h3>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">المنتج</TableHead>
                      <TableHead className="text-center">السعر</TableHead>
                      <TableHead className="text-center">الكمية</TableHead>
                      <TableHead className="text-center">المجموع</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewOrder.items.map((item, index) => (
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
                              <p className="text-xs text-gray-500">
                                رقم المنتج: {item.productId}
                                {item.variantId &&
                                  ` | النوع: ${item.variantId}`}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.price.toLocaleString()}{" "}
                          {settings.currency || "ريال"}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {(item.price * item.quantity).toLocaleString()}{" "}
                          {settings.currency || "ريال"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* الحسابات النهائية */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* الملاحظات */}
            <div className="space-y-4">
              {settings.showOrderNotes && previewOrder.notes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">ملاحظات الطلب</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-line">
                      {previewOrder.notes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {settings.showCustomerNotes && previewOrder.customerNotes && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">ملاحظات العميل</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-line">
                      {previewOrder.customerNotes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* تفاصيل الفاتورة */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">تفاصيل الفاتورة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">مجموع المنتجات:</span>
                    <span>
                      {previewOrder.subtotal.toLocaleString()}{" "}
                      {settings.currency || "ريال"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">تكلفة الشحن:</span>
                    <span>
                      {previewOrder.shipping.toLocaleString()}{" "}
                      {settings.currency || "ريال"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الضريبة:</span>
                    <span>
                      {previewOrder.tax.toLocaleString()}{" "}
                      {settings.currency || "ريال"}
                    </span>
                  </div>
                  {previewOrder.discount && previewOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>الخصم:</span>
                      <span>
                        -{previewOrder.discount.toLocaleString()}{" "}
                        {settings.currency || "ريال"}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>الإجمالي النهائي:</span>
                    <span className="text-primary">
                      {previewOrder.total.toLocaleString()}{" "}
                      {settings.currency || "ريال"}
                    </span>
                  </div>

                  {previewOrder.discountCode && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                      <span className="text-gray-600">كود الخصم: </span>
                      <span className="font-medium">
                        {previewOrder.discountCode}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* تذييل الفاتورة */}
          <div className="invoice-footer pt-6 border-t">
            <div className="text-center">
              <p className="font-medium text-gray-700 mb-4 text-lg">
                {settings.footerText || "شكراً لاختياركم متجرنا"}
              </p>

              {settings.termsAndConditions && (
                <div className="mt-4">
                  <h4 className="font-bold mb-2 text-gray-800">
                    الشروط والأحكام:
                  </h4>
                  <p className="text-gray-600 text-sm whitespace-pre-line">
                    {settings.termsAndConditions}
                  </p>
                </div>
              )}

              <p className="mt-6 text-xs text-gray-500">
                تم إنشاء الفاتورة تلقائياً بتاريخ{" "}
                {new Date().toLocaleDateString("ar-SA")} | جميع الحقوق محفوظة ©{" "}
                {new Date().getFullYear()} {settings.storeName || "المتجر"}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            طباعة الفاتورة
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            تحميل PDF
          </Button>
          <Button onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// Invoice Customization Component
// ============================================================================
interface InvoiceCustomizationProps {
  storeId: string | null;
}

const InvoiceCustomization: React.FC<InvoiceCustomizationProps> = ({
  storeId,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceSettings, setInvoiceSettings] = useState({
    storeName: "متجر إلكتروني",
    storeAddress: "اليمن، صنعاء، شارع النصر",
    storePhone: "0512345678",
    storeEmail: "info@store.com",
    taxNumber: "123456789",
    commercialRegister: "987654321",
    logoUrl: "",
    includeLogo: true,
    includeTaxInfo: true,
    includeStoreInfo: true,
    footerText: "شكراً لاختياركم متجرنا",
    termsAndConditions:
      "1. جميع المنتجات مضمونة الجودة\n2. سياسة الإرجاع خلال 14 يوم\n3. الشحن خلال 2-5 أيام عمل",
    watermark: "",
    watermarkOpacity: 0.1,
    currency: "ريال",
    language: "ar",
    showOrderNotes: true,
    showCustomerNotes: true,
    showPaymentMethod: true,
    showShippingMethod: true,
    invoiceNumberPrefix: "INV-",
    showInvoiceDate: true,
    showDueDate: true,
    dueDateDays: 30,
    showBankDetails: false,
    bankName: "",
    accountNumber: "",
    iban: "",
  });

  const loadInvoiceSettings = async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      const savedSettings = await orderService.getInvoiceSettings(storeId);
      if (savedSettings) {
        setInvoiceSettings((prev) => ({ ...prev, ...savedSettings }));
      }
    } catch (error) {
      console.error("خطأ في تحميل إعدادات الفواتير:", error);
      toast({
        title: "خطأ",
        description: "تعذر تحميل إعدادات الفواتير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveInvoiceSettings = async () => {
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
      await orderService.saveInvoiceSettings(storeId, invoiceSettings);
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات الفاتورة بنجاح",
      });
    } catch (error) {
      console.error("خطأ في حفظ إعدادات الفواتير:", error);
      toast({
        title: "خطأ",
        description: "تعذر حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "خطأ",
          description: "حجم الملف كبير جداً. الحد الأقصى 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setInvoiceSettings({ ...invoiceSettings, logoUrl: result });
        toast({
          title: "تم الرفع",
          description: "تم رفع الشعار بنجاح",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    loadInvoiceSettings();
  }, [storeId]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تخصيص الفواتير</CardTitle>
          <CardDescription>تخصيص شكل ومحتوى فواتير الطلبات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* قسم الشعار */}
          <div className="space-y-4">
            <h3 className="font-medium">شعار المتجر</h3>
            <div className="flex items-center gap-6">
              {invoiceSettings.includeLogo && invoiceSettings.logoUrl && (
                <div className="border rounded-lg p-4">
                  <img
                    src={invoiceSettings.logoUrl}
                    alt="شعار المتجر"
                    className="h-32 w-auto object-contain"
                  />
                  <p className="text-xs text-gray-500 mt-2">الشعار الحالي</p>
                </div>
              )}

              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-logo">إظهار شعار المتجر</Label>
                  <Switch
                    id="include-logo"
                    checked={invoiceSettings.includeLogo}
                    onCheckedChange={(checked) =>
                      setInvoiceSettings({
                        ...invoiceSettings,
                        includeLogo: checked,
                      })
                    }
                  />
                </div>

                {invoiceSettings.includeLogo && (
                  <div className="space-y-2">
                    <Label htmlFor="logo-upload">رفع شعار جديد</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="flex-1"
                      />
                      {invoiceSettings.logoUrl && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setInvoiceSettings({
                              ...invoiceSettings,
                              logoUrl: "",
                            })
                          }
                        >
                          إزالة
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      حجم الملف الأقصى: 5MB، الأنواع المسموحة: JPG, PNG, SVG
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* معلومات المتجر */}
          <div className="space-y-4">
            <h3 className="font-medium">معلومات المتجر على الفاتورة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">اسم المتجر *</Label>
                <Input
                  id="store-name"
                  value={invoiceSettings.storeName}
                  onChange={(e) =>
                    setInvoiceSettings({
                      ...invoiceSettings,
                      storeName: e.target.value,
                    })
                  }
                  placeholder="أدخل اسم المتجر"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-address">عنوان المتجر *</Label>
                <Input
                  id="store-address"
                  value={invoiceSettings.storeAddress}
                  onChange={(e) =>
                    setInvoiceSettings({
                      ...invoiceSettings,
                      storeAddress: e.target.value,
                    })
                  }
                  placeholder="أدخل عنوان المتجر"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-phone">هاتف المتجر</Label>
                <Input
                  id="store-phone"
                  value={invoiceSettings.storePhone}
                  onChange={(e) =>
                    setInvoiceSettings({
                      ...invoiceSettings,
                      storePhone: e.target.value,
                    })
                  }
                  placeholder="0512345678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-email">البريد الإلكتروني</Label>
                <Input
                  id="store-email"
                  type="email"
                  value={invoiceSettings.storeEmail}
                  onChange={(e) =>
                    setInvoiceSettings({
                      ...invoiceSettings,
                      storeEmail: e.target.value,
                    })
                  }
                  placeholder="info@store.com"
                />
              </div>
            </div>
          </div>

          {/* المعلومات الضريبية */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">المعلومات الضريبية</h3>
              <div className="flex items-center gap-2">
                <Label htmlFor="include-tax" className="text-sm">
                  إظهار المعلومات الضريبية
                </Label>
                <Switch
                  id="include-tax"
                  checked={invoiceSettings.includeTaxInfo}
                  onCheckedChange={(checked) =>
                    setInvoiceSettings({
                      ...invoiceSettings,
                      includeTaxInfo: checked,
                    })
                  }
                />
              </div>
            </div>

            {invoiceSettings.includeTaxInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-number">الرقم الضريبي</Label>
                  <Input
                    id="tax-number"
                    value={invoiceSettings.taxNumber}
                    onChange={(e) =>
                      setInvoiceSettings({
                        ...invoiceSettings,
                        taxNumber: e.target.value,
                      })
                    }
                    placeholder="123456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commercial-register">السجل التجاري</Label>
                  <Input
                    id="commercial-register"
                    value={invoiceSettings.commercialRegister}
                    onChange={(e) =>
                      setInvoiceSettings({
                        ...invoiceSettings,
                        commercialRegister: e.target.value,
                      })
                    }
                    placeholder="987654321"
                  />
                </div>
              </div>
            )}
          </div>

          {/* معلومات البنك */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">معلومات البنك للتحويلات</h3>
              <div className="flex items-center gap-2">
                <Label htmlFor="show-bank-details" className="text-sm">
                  إظهار معلومات البنك
                </Label>
                <Switch
                  id="show-bank-details"
                  checked={invoiceSettings.showBankDetails}
                  onCheckedChange={(checked) =>
                    setInvoiceSettings({
                      ...invoiceSettings,
                      showBankDetails: checked,
                    })
                  }
                />
              </div>
            </div>

            {invoiceSettings.showBankDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank-name">اسم البنك</Label>
                  <Input
                    id="bank-name"
                    value={invoiceSettings.bankName}
                    onChange={(e) =>
                      setInvoiceSettings({
                        ...invoiceSettings,
                        bankName: e.target.value,
                      })
                    }
                    placeholder="البنك المركزي اليمني"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-number">رقم الحساب</Label>
                  <Input
                    id="account-number"
                    value={invoiceSettings.accountNumber}
                    onChange={(e) =>
                      setInvoiceSettings({
                        ...invoiceSettings,
                        accountNumber: e.target.value,
                      })
                    }
                    placeholder="1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iban">رقم IBAN</Label>
                  <Input
                    id="iban"
                    value={invoiceSettings.iban}
                    onChange={(e) =>
                      setInvoiceSettings({
                        ...invoiceSettings,
                        iban: e.target.value,
                      })
                    }
                    placeholder="YE00XXXX0000000000000000"
                  />
                </div>
              </div>
            )}
          </div>

          {/* إعدادات التنسيق */}
          <div className="space-y-4">
            <h3 className="font-medium">إعدادات التنسيق</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">العملة</Label>
                <Select
                  value={invoiceSettings.currency}
                  onValueChange={(value) =>
                    setInvoiceSettings({ ...invoiceSettings, currency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ريال">ريال يمني</SelectItem>
                    <SelectItem value="$">دولار ($)</SelectItem>
                    <SelectItem value="€">يورو (€)</SelectItem>
                    <SelectItem value="ريال سعودي">ريال سعودي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice-prefix">بادئة رقم الفاتورة</Label>
                <Input
                  id="invoice-prefix"
                  value={invoiceSettings.invoiceNumberPrefix}
                  onChange={(e) =>
                    setInvoiceSettings({
                      ...invoiceSettings,
                      invoiceNumberPrefix: e.target.value,
                    })
                  }
                  placeholder="INV-"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-days">أيام الاستحقاق</Label>
                <Input
                  id="due-days"
                  type="number"
                  value={invoiceSettings.dueDateDays}
                  onChange={(e) =>
                    setInvoiceSettings({
                      ...invoiceSettings,
                      dueDateDays: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">لغة الفاتورة</Label>
                <Select
                  value={invoiceSettings.language}
                  onValueChange={(value) =>
                    setInvoiceSettings({ ...invoiceSettings, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">الإنجليزية</SelectItem>
                    <SelectItem value="ar-en">ثنائية اللغة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-invoice-date">
                    إظهار تاريخ الفاتورة
                  </Label>
                  <Switch
                    id="show-invoice-date"
                    checked={invoiceSettings.showInvoiceDate}
                    onCheckedChange={(checked) =>
                      setInvoiceSettings({
                        ...invoiceSettings,
                        showInvoiceDate: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-due-date">إظهار تاريخ الاستحقاق</Label>
                  <Switch
                    id="show-due-date"
                    checked={invoiceSettings.showDueDate}
                    onCheckedChange={(checked) =>
                      setInvoiceSettings({
                        ...invoiceSettings,
                        showDueDate: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-payment-method">إظهار طريقة الدفع</Label>
                  <Switch
                    id="show-payment-method"
                    checked={invoiceSettings.showPaymentMethod}
                    onCheckedChange={(checked) =>
                      setInvoiceSettings({
                        ...invoiceSettings,
                        showPaymentMethod: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-shipping-method">
                    إظهار طريقة الشحن
                  </Label>
                  <Switch
                    id="show-shipping-method"
                    checked={invoiceSettings.showShippingMethod}
                    onCheckedChange={(checked) =>
                      setInvoiceSettings({
                        ...invoiceSettings,
                        showShippingMethod: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-order-notes">إظهار ملاحظات الطلب</Label>
                  <Switch
                    id="show-order-notes"
                    checked={invoiceSettings.showOrderNotes}
                    onCheckedChange={(checked) =>
                      setInvoiceSettings({
                        ...invoiceSettings,
                        showOrderNotes: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-customer-notes">
                    إظهار ملاحظات العميل
                  </Label>
                  <Switch
                    id="show-customer-notes"
                    checked={invoiceSettings.showCustomerNotes}
                    onCheckedChange={(checked) =>
                      setInvoiceSettings({
                        ...invoiceSettings,
                        showCustomerNotes: checked,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* نص التذييل والشروط */}
          <div className="space-y-4">
            <h3 className="font-medium">نص التذييل والشروط</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="footer-text">نص تذييل الفاتورة</Label>
                <Input
                  id="footer-text"
                  value={invoiceSettings.footerText}
                  onChange={(e) =>
                    setInvoiceSettings({
                      ...invoiceSettings,
                      footerText: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">الشروط والأحكام</Label>
                <Textarea
                  id="terms"
                  rows={4}
                  value={invoiceSettings.termsAndConditions}
                  onChange={(e) =>
                    setInvoiceSettings({
                      ...invoiceSettings,
                      termsAndConditions: e.target.value,
                    })
                  }
                  placeholder="أدخل الشروط والأحكام التي تظهر في الفاتورة (يمكن استخدام الأسطر الجديدة)"
                />
                <p className="text-xs text-gray-500">
                  استخدم Enter لإنشاء سطر جديد في الفاتورة
                </p>
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <Button onClick={saveInvoiceSettings} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ الإعدادات"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              معاينة الفاتورة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* نافذة معاينة الفاتورة */}
      {showPreview && (
        <InvoicePreview
          settings={invoiceSettings}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};
export default InvoiceCustomization;
