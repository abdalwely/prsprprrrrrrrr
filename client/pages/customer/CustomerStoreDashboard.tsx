import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { storeService, productService, orderService } from "@/lib/firestore";
import {
  Store as StoreIcon,
  Package,
  ShoppingCart,
  Heart,
  Star,
  Search,
  ArrowLeft,
  Eye,
  Plus,
  Minus,
  ShoppingBag,
  User,
  TrendingUp,
  Trash2,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  X,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

// أنواع البيانات
interface CartItem {
  productId: string;
  quantity: number;
  product: any;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function CustomerStoreDashboard() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<
    "cart" | "shipping" | "payment" | "confirmation"
  >("cart");
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
  });

  useEffect(() => {
    loadSelectedStore();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const loadSelectedStore = async () => {
    try {
      const selectedStoreId = localStorage.getItem("selectedStoreId");

      if (!selectedStoreId) {
        toast({
          title: "لم يتم اختيار متجر",
          description: "يرجى اختيار متجر من القائمة المتاحة",
          variant: "destructive",
        });
        navigate("/customer/stores");
        return;
      }

      const store = await storeService.getById(selectedStoreId);

      if (!store) {
        toast({
          title: "المتجر غير موجود",
          description: "المتجر المختار لم يعد متاحاً",
          variant: "destructive",
        });
        navigate("/customer/stores");
        return;
      }

      setSelectedStore(store);

      // جلب منتجات المتجر
      const storeProducts = await productService.getByStore(store.id);
      setProducts(storeProducts);
      setFilteredProducts(storeProducts);

      // جلب طلبات العميل من هذا المتجر
      const allOrders = await orderService.getByStore(store.id);
      const customerStoreOrders = allOrders.filter(
        (order) => order.customerInfo?.email === userData?.email,
      );
      setCustomerOrders(customerStoreOrders);

      // تحميل السلة من localStorage
      const savedCart = localStorage.getItem(`cart_${store.id}`);
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        // ربط بيانات المنتجات مع السلة
        const cartWithProducts = cartData
          .map((item: CartItem) => ({
            ...item,
            product: storeProducts.find((p) => p.id === item.productId),
          }))
          .filter((item: CartItem) => item.product); // إزالة المنتجات غير الموجودة
        setCart(cartWithProducts);
      }

      // تحميل المفضلة من localStorage
      const savedWishlist = localStorage.getItem(`wishlist_${store.id}`);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }

      // تعبئة بيانات الشحن من بيانات المستخدم
      if (userData) {
        setShippingInfo((prev) => ({
          ...prev,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
        }));
      }
    } catch (error) {
      console.error("Error loading selected store:", error);
      toast({
        title: "خطأ في تحميل المتجر",
        description: "حدث خطأ أثناء تحميل بيانات المتجر",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory,
      );
    }

    setFilteredProducts(filtered);
  };

  // إضافة منتج للسلة
  const addToCart = (product: any, quantity: number = 1) => {
    if (!selectedStore) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.productId === product.id,
      );
      let newCart;

      if (existingItem) {
        // تحديث الكمية إذا المنتج موجود
        newCart = prevCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      } else {
        // إضافة منتج جديد
        newCart = [...prevCart, { productId: product.id, quantity, product }];
      }

      // حفظ في localStorage
      const cartForStorage = newCart.map(({ product, ...item }) => item);
      localStorage.setItem(
        `cart_${selectedStore.id}`,
        JSON.stringify(cartForStorage),
      );

      return newCart;
    });

    toast({
      title: "تم الإضافة للسلة",
      description: `تم إضافة ${product.name} إلى سلة التسوق`,
    });
  };

  // تحديث كمية المنتج في السلة
  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (!selectedStore) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item,
      );

      // حفظ في localStorage
      const cartForStorage = newCart.map(({ product, ...item }) => item);
      localStorage.setItem(
        `cart_${selectedStore.id}`,
        JSON.stringify(cartForStorage),
      );

      return newCart;
    });
  };

  // إزالة منتج من السلة
  const removeFromCart = (productId: string) => {
    if (!selectedStore) return;

    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.productId !== productId);

      // حفظ في localStorage
      const cartForStorage = newCart.map(({ product, ...item }) => item);
      localStorage.setItem(
        `cart_${selectedStore.id}`,
        JSON.stringify(cartForStorage),
      );

      return newCart;
    });

    toast({
      title: "تم الإزالة من السلة",
      description: "تم إزالة المنتج من سلة التسوق",
    });
  };

  // تفريغ السلة
  const clearCart = () => {
    if (!selectedStore) return;

    setCart([]);
    localStorage.removeItem(`cart_${selectedStore.id}`);

    toast({
      title: "تم تفريغ السلة",
      description: "تم إزالة جميع المنتجات من سلة التسوق",
    });
  };

  const toggleWishlist = (productId: string) => {
    if (!selectedStore) return;

    const newWishlist = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];

    setWishlist(newWishlist);
    localStorage.setItem(
      `wishlist_${selectedStore.id}`,
      JSON.stringify(newWishlist),
    );

    toast({
      title: wishlist.includes(productId)
        ? "تم إزالة المنتج من المفضلة"
        : "تم إضافة المنتج للمفضلة",
    });
  };

  // إنشاء طلب جديد
  const createOrder = async () => {
    if (!selectedStore || !userData || cart.length === 0) return;

    try {
      const orderItems: OrderItem[] = cart.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0] || "",
      }));

      const subtotal = getCartTotal();
      const shipping =
        subtotal >=
        (selectedStore.settings?.shipping?.freeShippingThreshold || 200)
          ? 0
          : selectedStore.settings?.shipping?.defaultCost || 15;
      const tax = subtotal * 0.15; // ضريبة 15%
      const total = subtotal + shipping + tax;

      const orderData = {
        storeId: selectedStore.id,
        customerId: userData.uid,
        customerInfo: {
          firstName: shippingInfo.firstName || userData.firstName || "عميل",
          lastName: shippingInfo.lastName || userData.lastName || "مجهول",
          email: shippingInfo.email || userData.email,
          phone: shippingInfo.phone || userData.phone || "غير متوفر",
        },
        items: orderItems,
        subtotal,
        shipping,
        tax,
        total,
        shippingAddress: {
          street: shippingInfo.address || "عنوان التوصيل",
          city: shippingInfo.city || "الرياض",
          state: "منطقة الرياض",
          zipCode: shippingInfo.zipCode || "12345",
          country: "المملكة العربية السعودية",
        },
        paymentMethod: "credit_card",
        paymentStatus: "paid" as const,
        orderStatus: "pending" as const,
        notes: "طلب من خلال لوحة تحكم العميل",
      };

      const orderId = await orderService.create(orderData);

      // تفريغ السلة بعد إنشاء الطلب
      clearCart();
      setCheckoutStep("confirmation");

      toast({
        title: "تم إنشاء الطلب بنجاح",
        description: `رقم طلبك: ${orderId.slice(-8)}`,
      });

      // إعادة تحميل الطلبات
      const allOrders = await orderService.getByStore(selectedStore.id);
      const customerStoreOrders = allOrders.filter(
        (order) => order.customerInfo?.email === userData.email,
      );
      setCustomerOrders(customerStoreOrders);
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "خطأ في إنشاء الطلب",
        description: "حدث خطأ أثناء إنشاء الطلب",
        variant: "destructive",
      });
    }
  };

  const getUniqueCategories = () => {
    const categories = [
      ...new Set(products.map((product) => product.category)),
    ];
    return categories;
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.product ? item.product.price * item.quantity : 0);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleShippingInfoChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // مكون سلة التسوق المنبثقة
  const CartSidebar = () => (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setShowCart(false)}
      />
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">
              سلة التسوق ({getCartItemsCount()})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCart(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">سلة التسوق فارغة</p>
                <Button className="mt-4" onClick={() => setShowCart(false)}>
                  متابعة التسوق
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 border-b pb-4"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.product.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {item.product.name}
                      </h4>
                      <p className="text-green-600 font-semibold">
                        {item.product.price} ر.س
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.quantity - 1,
                              )
                            }
                            className="h-8 w-8"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-3 py-1 text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateCartQuantity(
                                item.productId,
                                item.quantity + 1,
                              )
                            }
                            className="h-8 w-8"
                            disabled={
                              item.quantity >=
                              (item.product.inventory?.quantity || 0)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>المجموع الفرعي</span>
                  <span>{getCartTotal()} ر.س</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>الشحن</span>
                  <span>
                    {getCartTotal() >=
                    (selectedStore.settings?.shipping?.freeShippingThreshold ||
                      200)
                      ? "مجاني"
                      : `${selectedStore.settings?.shipping?.defaultCost || 15} ر.س`}
                  </span>
                </div>
                {getCartTotal() <
                  (selectedStore.settings?.shipping?.freeShippingThreshold ||
                    200) && (
                  <div className="text-xs text-blue-600 text-center">
                    أنفق{" "}
                    {(
                      (selectedStore.settings?.shipping
                        ?.freeShippingThreshold || 200) - getCartTotal()
                    ).toFixed(2)}{" "}
                    ر.س أخرى للحصول على شحن مجاني
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>الإجمالي</span>
                  <span>
                    {getCartTotal() +
                      (getCartTotal() >=
                      (selectedStore.settings?.shipping
                        ?.freeShippingThreshold || 200)
                        ? 0
                        : selectedStore.settings?.shipping?.defaultCost ||
                          15)}{" "}
                    ر.س
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  setShowCart(false);
                  setCheckoutStep("shipping");
                }}
                disabled={cart.length === 0}
              >
                <CreditCard className="h-4 w-4 ml-2" />
                اتمام الشراء
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                تفريغ السلة
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // مكون اتمام الشراء
  const CheckoutProcess = () => (
    <div className="fixed inset-0 z-50 overflow-hidden bg-white">
      <div className="container mx-auto p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              if (checkoutStep === "shipping") {
                setCheckoutStep("cart");
              } else if (checkoutStep === "payment") {
                setCheckoutStep("shipping");
              } else {
                setCheckoutStep("cart");
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة
          </Button>
          <h2 className="text-xl font-bold">اكمال الطلب</h2>
          <div className="w-20"></div>
        </div>

        {/* Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div
              className={`flex items-center ${checkoutStep === "shipping" || checkoutStep === "payment" || checkoutStep === "confirmation" ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  checkoutStep === "shipping" ||
                  checkoutStep === "payment" ||
                  checkoutStep === "confirmation"
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-400"
                }`}
              >
                1
              </div>
              <span className="mr-2">معلومات الشحن</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300 mx-4"></div>
            <div
              className={`flex items-center ${checkoutStep === "payment" || checkoutStep === "confirmation" ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  checkoutStep === "payment" || checkoutStep === "confirmation"
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-400"
                }`}
              >
                2
              </div>
              <span className="mr-2">الدفع</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300 mx-4"></div>
            <div
              className={`flex items-center ${checkoutStep === "confirmation" ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  checkoutStep === "confirmation"
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-400"
                }`}
              >
                3
              </div>
              <span className="mr-2">التأكيد</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          {item.product.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {item.product.name}
                          </p>
                          <p className="text-gray-600 text-xs">
                            الكمية: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">
                        {item.product.price * item.quantity} ر.س
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي</span>
                    <span>{getCartTotal()} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الشحن</span>
                    <span>
                      {getCartTotal() >=
                      (selectedStore.settings?.shipping
                        ?.freeShippingThreshold || 200)
                        ? "مجاني"
                        : `${selectedStore.settings?.shipping?.defaultCost || 15} ر.س`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>الضريبة (15%)</span>
                    <span>{(getCartTotal() * 0.15).toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>الإجمالي</span>
                    <span>
                      {getCartTotal() +
                        (getCartTotal() >=
                        (selectedStore.settings?.shipping
                          ?.freeShippingThreshold || 200)
                          ? 0
                          : selectedStore.settings?.shipping?.defaultCost ||
                            15) +
                        getCartTotal() * 0.15}{" "}
                      ر.س
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {checkoutStep === "shipping" && (
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الشحن</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        الاسم الأول
                      </label>
                      <Input
                        placeholder="الاسم الأول"
                        value={shippingInfo.firstName}
                        onChange={(e) =>
                          handleShippingInfoChange("firstName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        اسم العائلة
                      </label>
                      <Input
                        placeholder="اسم العائلة"
                        value={shippingInfo.lastName}
                        onChange={(e) =>
                          handleShippingInfoChange("lastName", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      البريد الإلكتروني
                    </label>
                    <Input
                      placeholder="البريد الإلكتروني"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) =>
                        handleShippingInfoChange("email", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      رقم الهاتف
                    </label>
                    <Input
                      placeholder="رقم الهاتف"
                      value={shippingInfo.phone}
                      onChange={(e) =>
                        handleShippingInfoChange("phone", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      العنوان
                    </label>
                    <Input
                      placeholder="العنوان"
                      value={shippingInfo.address}
                      onChange={(e) =>
                        handleShippingInfoChange("address", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        المدينة
                      </label>
                      <Input
                        placeholder="المدينة"
                        value={shippingInfo.city}
                        onChange={(e) =>
                          handleShippingInfoChange("city", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        الرمز البريدي
                      </label>
                      <Input
                        placeholder="الرمز البريدي"
                        value={shippingInfo.zipCode}
                        onChange={(e) =>
                          handleShippingInfoChange("zipCode", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => setCheckoutStep("payment")}
                  >
                    <Truck className="h-4 w-4 ml-2" />
                    المتابعة للدفع
                  </Button>
                </CardContent>
              </Card>
            )}

            {checkoutStep === "payment" && (
              <Card>
                <CardHeader>
                  <CardTitle>طريقة الدفع</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 border-blue-500 bg-blue-50">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">بطاقة ائتمان</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <Truck className="h-5 w-5" />
                      <span>الدفع عند الاستلام</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">معلومات البطاقة</h4>
                    <div className="space-y-3">
                      <Input placeholder="رقم البطاقة" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="تاريخ الانتهاء" />
                        <Input placeholder="CVV" />
                      </div>
                      <Input placeholder="اسم حامل البطاقة" />
                    </div>
                  </div>

                  <Button className="w-full" onClick={createOrder}>
                    <CheckCircle className="h-4 w-4 ml-2" />
                    تأكيد الطلب والدفع
                  </Button>
                </CardContent>
              </Card>
            )}

            {checkoutStep === "confirmation" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-green-600">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                    تم تأكيد طلبك بنجاح
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-gray-600">
                    شكراً لك على شرائك من {selectedStore.name}. تم استلام طلبك
                    وسيتم تجهيزه قريباً.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold">
                      رقم الطلب: #
                      {customerOrders[customerOrders.length - 1]?.id?.slice(
                        -8,
                      ) || "جاري المعالجة"}
                    </p>
                    <p className="text-sm text-gray-600">
                      سيصلك إشعار بتحديثات الطلب على بريدك الإلكتروني
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => {
                        setCheckoutStep("cart");
                        navigate("/customer/dashboard");
                      }}
                    >
                      العودة للرئيسية
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCheckoutStep("cart");
                        setShowCart(false);
                      }}
                    >
                      متابعة التسوق
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>لم يتم اختيار متجر</CardTitle>
            <CardDescription>
              يرجى اختيار متجر من القائمة المتاحة أولاً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate("/customer/stores")}
              className="w-full"
            >
              اختيار متجر
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      {/* سلة التسوق المنبثقة */}
      {showCart && <CartSidebar />}

      {/* عملية الدفع */}
      {checkoutStep !== "cart" && <CheckoutProcess />}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/customer/stores")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                تغيير المتجر
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {selectedStore.name}
                </h1>
                <p className="text-gray-600 mt-2">
                  {selectedStore.description}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-center">
                <Button
                  variant="outline"
                  className="relative"
                  onClick={() => setShowCart(true)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  السلة
                  {getCartItemsCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1">
                      {getCartItemsCount()}
                    </Badge>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  {getCartTotal()} ر.س
                </p>
              </div>
              <Button
                onClick={() =>
                  window.open(`/store/${selectedStore.subdomain}`, "_blank")
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                عرض المتجر الكامل
              </Button>
            </div>
          </div>
        </div>

        {/* Store Info Banner */}
        <Card
          className="mb-8"
          style={{
            background: `linear-gradient(135deg, ${selectedStore.customization?.colors?.primary || "#2563eb"} 0%, ${selectedStore.customization?.colors?.secondary || "#64748b"} 100%)`,
          }}
        >
          <CardContent className="p-6 text-white">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <Package className="h-8 w-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm opacity-90">منتج متاح</p>
              </div>
              <div className="text-center">
                <Star className="h-8 w-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {products.length > 0 ? "4.5" : "0"}
                </p>
                <p className="text-sm opacity-90">متوسط التقييم</p>
              </div>
              <div className="text-center">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{customerOrders.length}</p>
                <p className="text-sm opacity-90">طلباتي</p>
              </div>
              <div className="text-center">
                <Heart className="h-8 w-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{wishlist.length}</p>
                <p className="text-sm opacity-90">المفضلة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">المنتجات</TabsTrigger>
            <TabsTrigger value="orders">طلباتي</TabsTrigger>
            <TabsTrigger value="wishlist">المفضلة</TabsTrigger>
            <TabsTrigger value="profile">ملفي الشخصي</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                منتجات {selectedStore.name}
              </h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="ابحث في المنتجات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">جميع الفئات</option>
                  {getUniqueCategories().map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  لا توجد منتجات
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "لم يتم العثور على منتجات تطابق بحثك"
                    : "لا توجد منتجات في هذا المتجر حالياً"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="hover:shadow-lg transition-shadow duration-300"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="h-16 w-16 text-gray-400" />
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => toggleWishlist(product.id)}
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                wishlist.includes(product.id)
                                  ? "fill-red-500 text-red-500"
                                  : "text-gray-400"
                              }`}
                            />
                          </Button>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {product.description}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {product.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-green-600">
                              {product.price} ر.س
                            </p>
                            {product.comparePrice &&
                              product.comparePrice > product.price && (
                                <p className="text-sm text-gray-500 line-through">
                                  {product.comparePrice} ر.س
                                </p>
                              )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {cart.find(
                            (item) => item.productId === product.id,
                          ) ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateCartQuantity(
                                    product.id,
                                    cart.find(
                                      (item) => item.productId === product.id,
                                    )!.quantity - 1,
                                  )
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-medium">
                                {
                                  cart.find(
                                    (item) => item.productId === product.id,
                                  )!.quantity
                                }
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateCartQuantity(
                                    product.id,
                                    cart.find(
                                      (item) => item.productId === product.id,
                                    )!.quantity + 1,
                                  )
                                }
                                disabled={
                                  cart.find(
                                    (item) => item.productId === product.id,
                                  )!.quantity >=
                                  (product.inventory?.quantity || 0)
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => addToCart(product)}
                              className="flex-1"
                              disabled={product.inventory?.quantity === 0}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {product.inventory?.quantity === 0
                                ? "نفد المخزون"
                                : "إضافة للسلة"}
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          متوفر: {product.inventory?.quantity || 0} قطعة
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">
              طلباتي من {selectedStore.name}
            </h2>

            {customerOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  لا توجد طلبات
                </h3>
                <p className="text-gray-600">
                  لم تقم بأي طلبات من هذا المتجر بعد
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {customerOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            طلب #{order.id.slice(-8)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {order.items.length} منتج - {order.total} ر.س
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString(
                              "ar-SA",
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              order.orderStatus === "delivered"
                                ? "default"
                                : order.orderStatus === "shipped"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {order.orderStatus === "pending" && "في الانتظار"}
                            {order.orderStatus === "processing" &&
                              "قيد المعالجة"}
                            {order.orderStatus === "shipped" && "تم الشحن"}
                            {order.orderStatus === "delivered" && "تم التوصيل"}
                            {order.orderStatus === "cancelled" && "ملغي"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <h2 className="text-2xl font-bold">قائمة المفضلة</h2>

            {wishlist.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  قائمة المفضلة فارغة
                </h3>
                <p className="text-gray-600">
                  لم تضف أي منتجات إلى قائمة المفضلة بعد
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlist.map((productId) => {
                  const product = products.find((p) => p.id === productId);
                  if (!product) return null;

                  return (
                    <Card
                      key={product.id}
                      className="hover:shadow-lg transition-shadow duration-300"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="relative">
                            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="h-16 w-16 text-gray-400" />
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => toggleWishlist(product.id)}
                            >
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            </Button>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-2">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-2xl font-bold text-green-600">
                              {product.price} ر.س
                            </p>
                          </div>
                          <Button
                            onClick={() => addToCart(product)}
                            className="w-full"
                            disabled={product.inventory?.quantity === 0}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {product.inventory?.quantity === 0
                              ? "نفد المخزون"
                              : "إضافة للسلة"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold">
              ملفي الشخصي في {selectedStore.name}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    معلوماتي الشخصية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">الاسم</p>
                      <p className="font-medium">
                        {userData?.firstName} {userData?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                      <p className="font-medium">{userData?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">تاريخ الانضمام</p>
                      <p className="font-medium">
                        {userData?.createdAt
                          ? new Date(userData.createdAt).toLocaleDateString(
                              "ar-SA",
                            )
                          : "غير متوفر"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    إحصائياتي في المتجر
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {customerOrders.length}
                      </p>
                      <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {customerOrders.reduce(
                          (sum, order) => sum + order.total,
                          0,
                        )}{" "}
                        ر.س
                      </p>
                      <p className="text-sm text-gray-600">إجمالي المشتريات</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">
                        {wishlist.length}
                      </p>
                      <p className="text-sm text-gray-600">المنتجات المفضلة</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {getCartItemsCount()}
                      </p>
                      <p className="text-sm text-gray-600">في السلة حالياً</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
