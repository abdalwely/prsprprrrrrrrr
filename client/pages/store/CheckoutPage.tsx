import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  MapPin,
  CreditCard,
  Package,
  CheckCircle,
} from "lucide-react";
import { storeService } from "@/lib/src";
import { cartService, orderService, productService } from "@/lib/src";
import {
  getOrCreateCustomerIdForStore,
  linkVisitorToCustomer,
} from "@/lib/src";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { Order, ShippingAddress } from "@/lib/src";

interface CartItemWithProduct {
  productId: string;
  quantity: number;
  addedAt: Date;
  product?: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

const CheckoutPage: React.FC = () => {
  const { subdomain } = useParams<{ subdomain: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [store, setStore] = useState<any>(null);
  const [cart, setCart] = useState<CartItemWithProduct[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState<string>("");
  const [customerCartId, setCustomerCartId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // معلومات العميل
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // معلومات الشحن
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: "",
    city: "",
    district: "",
    state: "",
    governorate: "",
    zipCode: "",
    country: "اليمن",
  });

  // طريقة الدفع
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer">(
    "cod",
  );

  // ملاحظات الطلب
  const [orderNotes, setOrderNotes] = useState("");

  // بيانات المستخدم الحالي
  const userData = getCurrentCustomer();

  // تحميل بيانات المتجر والسلة
  useEffect(() => {
    const loadStoreAndCartData = async () => {
      try {
        if (!subdomain) return;

        setLoading(true);

        // جلب بيانات المتجر
        const storeData = await storeService.getBySubdomain(subdomain);
        if (!storeData) {
          toast({
            title: "المتجر غير موجود",
            description: "المتجر المطلوب غير موجود أو غير نشط",
            variant: "destructive",
          });
          navigate("/customer/stores");
          return;
        }
        setStore(storeData);

        // الحصول على معرف العميل/الضيف للمتجر
        const customerIdentifier = await getOrCreateCustomerIdForStore(
          storeData.id,
        );
        setCustomerId(customerIdentifier);

        console.log("🆔 معرف العميل/الضيف للمتجر:", customerIdentifier);

        // جلب سلة العميل
        const customerCart = await cartService.getCustomerCart(
          customerIdentifier,
          storeData.id,
        );

        if (customerCart && customerCart.items.length > 0) {
          setCustomerCartId(customerCart.id);

          // جلب منتجات المتجر
          const storeProducts = await productService.getByStore(storeData.id);
          setProducts(storeProducts);

          // دمج معلومات المنتج مع عناصر السلة
          const cartWithProducts = customerCart.items
            .map((item: any) => {
              const product = storeProducts.find(
                (p: any) => p.id === item.productId,
              );
              return {
                productId: item.productId,
                quantity: item.quantity,
                addedAt: item.addedAt?.toDate() || new Date(),
                product: product,
              };
            })
            .filter((item: any) => item.product !== undefined);

          setCart(cartWithProducts);
          console.log("✅ تم تحميل السلة:", cartWithProducts.length, "منتج");
        } else {
          toast({
            title: "السلة فارغة",
            description: "أضف منتجات إلى السلة قبل إتمام الشراء",
            variant: "destructive",
          });
          navigate(`/store/${subdomain}`);
        }
      } catch (error) {
        console.error("❌ خطأ في تحميل بيانات checkout:", error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "حدث خطأ أثناء تحميل معلومات الطلب",
          variant: "destructive",
        });
        navigate(`/store/${subdomain}`);
      } finally {
        setLoading(false);
      }
    };

    loadStoreAndCartData();
  }, [subdomain, navigate, toast]);

  // تحميل معلومات المستخدم المسجل
  useEffect(() => {
    if (userData) {
      setCustomerInfo((prev) => ({
        ...prev,
        email: userData.email || "",
        firstName: userData.displayName?.split(" ")[0] || "",
        lastName: userData.displayName?.split(" ").slice(1).join(" ") || "",
      }));
    }
  }, [userData]);

  // حساب إجمالي السلة
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  // حساب تكلفة الشحن
  const getShippingCost = () => {
    if (!store) return 0;
    const total = getCartTotal();
    const freeThreshold = store.settings?.freeShippingThreshold || 100000;

    if (total >= freeThreshold) {
      return 0;
    }

    return store.settings?.shippingCost || 3000;
  };

  // حساب الضريبة
  const getTaxAmount = () => {
    if (!store?.settings?.taxEnabled) return 0;
    const subtotal = getCartTotal();
    const taxRate = store.settings.taxRate || 0.05;
    return subtotal * taxRate;
  };

  // حساب الإجمالي النهائي
  const getFinalTotal = () => {
    const subtotal = getCartTotal();
    const shipping = getShippingCost();
    const tax = getTaxAmount();
    return subtotal + shipping + tax;
  };

  // التحقق من صحة البيانات
  const validateForm = () => {
    const errors = [];

    if (!customerInfo.firstName.trim()) errors.push("الاسم الأول مطلوب");
    if (!customerInfo.lastName.trim()) errors.push("اسم العائلة مطلوب");
    if (!customerInfo.email.trim()) errors.push("البريد الإلكتروني مطلوب");
    if (!customerInfo.phone.trim()) errors.push("رقم الهاتف مطلوب");

    if (!shippingAddress.street.trim()) errors.push("عنوان الشحن مطلوب");
    if (!shippingAddress.city.trim()) errors.push("المدينة مطلوبة");
    if (!shippingAddress.governorate.trim()) errors.push("المحافظة مطلوبة");

    if (errors.length > 0) {
      toast({
        title: "بيانات ناقصة",
        description: errors.join(", "),
        variant: "destructive",
      });
      return false;
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast({
        title: "بريد إلكتروني غير صحيح",
        description: "الرجاء إدخال بريد إلكتروني صالح",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // معالجة إنشاء الطلب
  const handlePlaceOrder = async () => {
    if (!validateForm() || !store) return;

    setPlacingOrder(true);

    try {
      // 🔥 إذا كان ضيفاً وتم التسجيل أثناء العملية
      let finalCustomerId = customerId;
      if (customerId.startsWith("guest_") && userData?.uid) {
        const visitorId = customerId.replace("guest_", "");
        await linkVisitorToCustomer(store.id, visitorId, userData.uid);
        finalCustomerId = userData.uid;
        console.log("✅ تم ربط الضيف بالمستخدم:", finalCustomerId);
      }

      // إنشاء snapshot للعميل
      const customerSnapshot = {
        email: customerInfo.email,
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        phone: customerInfo.phone,
        shippingAddress: shippingAddress,
        uid: finalCustomerId.startsWith("guest_") ? undefined : finalCustomerId,
      };

      // إنشاء بيانات الطلب
      const orderData: Omit<Order, "id"> = {
        storeId: store.id,
        customerId: finalCustomerId,
        customerSnapshot,
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.product?.name || "منتج",
          price: item.product?.price || 0,
          quantity: item.quantity,
          image: item.product?.images?.[0] || "",
        })),
        subtotal: getCartTotal(),
        shipping: getShippingCost(),
        tax: getTaxAmount(),
        total: getFinalTotal(),
        shippingAddress: shippingAddress,
        billingAddress: shippingAddress, // نفس عنوان الشحن
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
        orderStatus: "pending",
        notes: orderNotes,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // إنشاء الطلب في Firestore
      const firestoreOrderId = await orderService.create(orderData);
      console.log("✅ تم إنشاء الطلب:", firestoreOrderId);

      // 🔥 إذا كان ضيفاً، عرض خيار التسجيل
      if (customerId.startsWith("guest_") && !userData?.uid) {
        toast({
          title: "تم إنشاء الطلب! 🎉",
          description: "سجل حساباً لحفظ سجل طلباتك",
          action: (
            <Button
              onClick={() =>
                navigate(
                  `/customer/auth?storeId=${store.id}&returnUrl=/store/${subdomain}/order/${firestoreOrderId}`,
                )
              }
              variant="outline"
            >
              تسجيل حساب
            </Button>
          ),
          duration: 8000,
        });
      } else {
        toast({
          title: "تم إنشاء الطلب بنجاح! 🎉",
          description: "سيتم التواصل معك لتأكيد الطلب",
        });
      }

      // مسح السلة
      if (customerCartId) {
        await cartService.clearCart(customerCartId);
      }

      // الانتقال لصفحة تأكيد الطلب
      navigate(`/store/${subdomain}/order/${firestoreOrderId}`);
    } catch (error) {
      console.error("❌ خطأ في إنشاء الطلب:", error);
      toast({
        title: "خطأ في إنشاء الطلب",
        description: "حدث خطأ أثناء إنشاء الطلب. حاول مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">إتمام الطلب</h1>
          <p className="text-muted-foreground mb-8">
            أكمل بياناتك لإتمام عملية الشراء
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* العمود الأيمن: معلومات الطلب */}
            <div className="lg:col-span-2 space-y-8">
              {/* معلومات العميل */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    معلومات العميل والشحن
                  </CardTitle>
                  <CardDescription>أدخل معلوماتك وعنوان الشحن</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">الاسم الأول *</Label>
                      <Input
                        id="firstName"
                        value={customerInfo.firstName}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            firstName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">اسم العائلة *</Label>
                      <Input
                        id="lastName"
                        value={customerInfo.lastName}
                        onChange={(e) =>
                          setCustomerInfo({
                            ...customerInfo,
                            lastName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          phone: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="street">عنوان الشحن *</Label>
                    <Input
                      id="street"
                      placeholder="الشارع، الحي، رقم المنزل"
                      value={shippingAddress.street}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          street: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">المدينة *</Label>
                      <Input
                        id="city"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            city: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">الحي/المنطقة</Label>
                      <Input
                        id="district"
                        value={shippingAddress.district}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            district: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="governorate">المحافظة *</Label>
                      <select
                        id="governorate"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={shippingAddress.governorate}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            governorate: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">اختر المحافظة</option>
                        <option value="صنعاء">صنعاء</option>
                        <option value="عدن">عدن</option>
                        <option value="تعز">تعز</option>
                        <option value="الحديدة">الحديدة</option>
                        <option value="حضرموت">حضرموت</option>
                        <option value="إب">إب</option>
                        <option value="ذمار">ذمار</option>
                        <option value="المكلا">المكلا</option>
                        <option value="مأرب">مأرب</option>
                        <option value="شبوة">شبوة</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">الرمز البريدي</Label>
                      <Input
                        id="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            zipCode: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">الدولة</Label>
                    <Input
                      id="country"
                      value={shippingAddress.country}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          country: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* طريقة الدفع */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    طريقة الدفع
                  </CardTitle>
                  <CardDescription>
                    اختر طريقة الدفع المناسبة لك
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) =>
                      setPaymentMethod(value as "cod" | "bank_transfer")
                    }
                  >
                    <div className="flex items-center space-x-2 space-x-reverse mb-4">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <span>الدفع عند الاستلام</span>
                          <span className="text-sm text-muted-foreground">
                            + رسوم خدمة ١٠٠٠ ريال
                          </span>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem
                        value="bank_transfer"
                        id="bank_transfer"
                      />
                      <Label
                        htmlFor="bank_transfer"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <span>التحويل البنكي</span>
                          <span className="text-sm text-green-600">
                            خصم ١٠٠٠ ريال
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          الحساب البنكي:{" "}
                          {store?.contact?.bankAccount ||
                            "سيظهر بعد اختيار هذه الطريقة"}
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* ملاحظات الطلب */}
              <Card>
                <CardHeader>
                  <CardTitle>ملاحظات إضافية</CardTitle>
                  <CardDescription></CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="ملاحظات حول الطلب، وقت التوصيل المفضل، الخ..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>

            {/* العمود الأيسر: ملخص الطلب */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    ملخص الطلب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* المنتجات */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="flex justify-between items-start"
                      >
                        <div>
                          <p className="font-medium">
                            {item.product?.name || "منتج"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} ×{" "}
                            {item.product?.price?.toLocaleString() || 0} ريال
                          </p>
                        </div>
                        <span className="font-medium">
                          {(
                            (item.product?.price || 0) * item.quantity
                          ).toLocaleString()}{" "}
                          ريال
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* الحسابات */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المجموع</span>
                      <span>{getCartTotal().toLocaleString()} ريال</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الشحن</span>
                      <span>{getShippingCost().toLocaleString()} ريال</span>
                    </div>

                    {store?.settings?.taxEnabled && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الضريبة</span>
                        <span>{getTaxAmount().toLocaleString()} ريال</span>
                      </div>
                    )}

                    {paymentMethod === "cod" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          رسوم الدفع عند الاستلام
                        </span>
                        <span>١٬٠٠٠ ريال</span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>الإجمالي النهائي</span>
                      <span>{getFinalTotal().toLocaleString()} ريال</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    className="w-full"
                    size="lg"
                    disabled={placingOrder || cart.length === 0}
                  >
                    {placingOrder ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري إنشاء الطلب...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="ml-2 h-4 w-4" />
                        إتمام الطلب
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    بالضغط على "إتمام الطلب"، فإنك توافق على الشروط والأحكام
                  </p>
                </CardContent>
              </Card>

              {/* معلومات المتجر */}
              {store && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      {store.logo && (
                        <img
                          src={store.logo}
                          alt={store.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{store.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {store.contact?.phone}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          وسائل الدفع:
                        </span>
                        <span>تحويل بنكي • نقدي</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          وقت التوصيل:
                        </span>
                        <span>٢-٥ أيام عمل</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          سياسة الإرجاع:
                        </span>
                        <span>٧ أيام</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
