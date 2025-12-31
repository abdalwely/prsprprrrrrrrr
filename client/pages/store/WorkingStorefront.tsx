import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  storeService,
  productService,
  categoryService,
  customerService,
  cartService,
  favoritesService,
  orderService,
  type Store,
  type Product,
  type Category,
  type CartItem as FirestoreCartItem,
  Order,
} from "@/lib/firestore";
import {
  Search,
  ShoppingCart,
  Heart,
  Star,
  Package,
  Home,
  ShoppingBag,
  User,
  Plus,
  Minus,
  ArrowLeft,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Globe,
  CreditCard,
  Truck,
  Shield,
  Instagram,
  Twitter,
  Facebook,
  MessageCircle,
  ShoppingBasket,
  CheckCircle,
  Clock,
  XCircle,
  PackageOpen,
  Eye,
  Calendar,
} from "lucide-react";
import ConfirmReceiptDialog from "@/components/ui/ConfirmReceiptDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { signOutUser } from "@/lib/auth";

// ============================================
// ✅ تعريف الواجهات المتوافقة مع firestore.ts
// ============================================

// استخدام CartItem مباشرة من firestore.ts
type CartItem = FirestoreCartItem;

// استخدام Order مباشرة من firestore.ts مع تعديل طفيف للتوافق
interface CustomerOrder extends Order {
  // لا تحتاج حقول إضافية، فقط للتوافق النوعي
}

// تعريف واجهة مبسطة لألوان المتجر
interface StoreColors {
  primary?: string;
  secondary?: string;
  background?: string;
  text?: string;
  accent?: string;
  border?: string;
  success?: string;
  warning?: string;
  error?: string;
}

// تعريف واجهة مبسطة للخطوط
interface StoreFonts {
  heading?: string;
  body?: string;
}

// تعريف واجهة مبسطة للأنماط
interface StoreStyles {
  borderRadius?: string;
  shadow?: string;
  transition?: string;
}

// ============================================
// ✅ تعريف الثوابت والدوال المساعدة
// ============================================

const ORDER_STATUS_MAP: Record<string, string> = {
  pending: "قيد الانتظار",
  processing: "قيد المعالجة",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

const PAYMENT_METHODS_MAP: Record<string, string> = {
  cashOnDelivery: "الدفع عند الاستلام",
  bankTransfer: "التحويل البنكي",
  creditCard: "البطاقة الائتمانية",
  paypal: "باي بال",
  stripe: "سترايب",
  mada: "مدى",
  mobileWallet: "محفظة إلكترونية",
};

// دالة تحويل التاريخ
const convertToValidDate = (date: any): Date => {
  if (!date) return new Date();

  if (date instanceof Date) return date;
  if (typeof date === "string") return new Date(date);
  if (typeof date.toDate === "function") return date.toDate();
  if (date.seconds) return new Date(date.seconds * 1000);

  return new Date();
};

// حساب نسبة التخفيض
const calculateSalePercentage = (
  originalPrice: number,
  salePrice?: number,
): number => {
  if (!salePrice || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

// ============================================
// ✅ 3. مكون ProductCard
// ============================================

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  store: Store | null;
  onToggleFavorite: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onViewDetails: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  store,
  onToggleFavorite,
  onAddToCart,
  onViewDetails,
}) => {
  // حساب التخفيض بشكل صحيح
  const originalPrice = product.comparePrice || product.price;
  const currentPrice =
    product.discount?.isActive && product.discount.salePrice
      ? product.discount.salePrice
      : product.price;

  const salePercentage = calculateSalePercentage(originalPrice, currentPrice);
  const hasSale = salePercentage > 0;

  const isOutOfStock =
    product.inventory?.trackInventory && product.inventory.quantity === 0;
  const isLowStock =
    product.inventory?.trackInventory && product.inventory.quantity < 10;

  // الحصول على إعدادات التخصيص بشكل آمن
  const customization = store?.customization || {};
  const colors = (customization as any).colors || ({} as StoreColors);
  const styles = (customization as any).styles || ({} as StoreStyles);
  const fonts = (customization as any).fonts || ({} as StoreFonts);

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200"
      style={{
        borderRadius: styles.borderRadius || "8px",
        boxShadow: styles.shadow || "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      }}
      onClick={() => onViewDetails(product)}
    >
      <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden relative">
        <div className="w-full h-full flex items-center justify-center">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Package className="h-16 w-16 text-gray-400" />
          )}
        </div>

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasSale && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white">
              خصم {salePercentage}%
            </Badge>
          )}
          {product.featured && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <Star className="h-3 w-3 ml-1" />
              مميز
            </Badge>
          )}
        </div>

        <div className="absolute top-2 right-2">
          {isOutOfStock ? (
            <Badge variant="destructive">نفد</Badge>
          ) : isLowStock ? (
            <Badge className="bg-yellow-500 text-white">
              آخر {product.inventory?.quantity || 0}
            </Badge>
          ) : null}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          style={{
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            padding: "0",
          }}
        >
          <Heart
            className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`}
          />
        </Button>
      </div>

      <CardContent className="p-4">
        <h3
          className="font-semibold line-clamp-2 mb-2 text-gray-800"
          style={{
            fontFamily: fonts.heading || "Cairo, sans-serif",
          }}
        >
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[40px]">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-green-600">
                {currentPrice} {store?.settings?.currency || "ر.س"}
              </span>
              {hasSale && (
                <span className="text-sm text-gray-500 line-through">
                  {originalPrice} {store?.settings?.currency || "ر.س"}
                </span>
              )}
            </div>
            {product.inventory?.sku && (
              <span className="text-xs text-gray-500">
                SKU: {product.inventory.sku}
              </span>
            )}
          </div>

          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product.id);
            }}
            style={{
              backgroundColor: colors.primary || "#2563eb",
              color: "white",
              border: "none",
              borderRadius: styles.borderRadius || "8px",
            }}
            className="hover:opacity-90 transition-opacity rounded-full w-10 h-10 p-0"
            disabled={isOutOfStock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-xs">
            {product.category || "غير مصنف"}
          </Badge>

          {product.tags && product.tags.length > 0 && (
            <div className="flex gap-1">
              {product.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// ✅ 4. مكون OrdersTable
// ============================================

interface OrdersTableProps {
  orders: CustomerOrder[];
  store: Store | null;
  onViewDetails: (order: CustomerOrder) => void;
  onReorder: (order: CustomerOrder) => void;
  onConfirmDelivery: (orderId: string) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  store,
  onViewDetails,
  onReorder,
  onConfirmDelivery,
}) => {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((order) => order.orderStatus === activeTab);
  }, [orders, activeTab]);

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getOrderStatusColor = (status: string): string => {
    const customization = store?.customization || {};
    const colors = (customization as any).colors || ({} as StoreColors);

    const statusColors: Record<string, string> = {
      pending: colors.warning || "#f59e0b",
      processing: colors.primary || "#2563eb",
      shipped: colors.accent || "#7c3aed",
      delivered: colors.success || "#10b981",
      cancelled: colors.error || "#ef4444",
    };
    return statusColors[status] || colors.text || "#1e293b";
  };

  const getOrderStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <PackageOpen className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const customization = store?.customization || {};
  const styles = (customization as any).styles || ({} as StoreStyles);

  if (filteredOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <PackageOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">لا توجد طلبات في هذه الفئة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">جميع الطلبات</TabsTrigger>
          <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
          <TabsTrigger value="processing">قيد المعالجة</TabsTrigger>
          <TabsTrigger value="shipped">تم الشحن</TabsTrigger>
          <TabsTrigger value="delivered">تم التسليم</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card style={{ borderRadius: styles.borderRadius || "8px" }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الطلب</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>المنتجات</TableHead>
              <TableHead>المجموع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الدفع</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
              const statusColor = getOrderStatusColor(order.orderStatus);
              const isShipped = order.orderStatus === "shipped";

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{order.id.slice(-8).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-500" />
                      {formatDate(order.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                            <Package className="h-3 w-3 text-gray-600" />
                          </div>
                          <span className="text-sm">
                            {item.name} × {item.quantity}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <span className="text-xs text-gray-500">
                          + {order.items.length - 2} منتجات أخرى
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {order.total} {store?.settings?.currency || "ر.س"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Badge
                        className="flex items-center gap-1 w-fit"
                        style={{
                          backgroundColor: `${statusColor}20`,
                          color: statusColor,
                          borderColor: statusColor,
                        }}
                      >
                        {getOrderStatusIcon(order.orderStatus)}
                        {ORDER_STATUS_MAP[order.orderStatus] ||
                          order.orderStatus}
                      </Badge>

                      {isShipped && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onConfirmDelivery(order.id)}
                          className="hover:bg-green-50 hover:text-green-700 border-green-200 text-green-600"
                        >
                          <CheckCircle className="h-4 w-4 ml-1" />
                          تأكيد استلام الطلب
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant={
                          order.paymentStatus === "paid"
                            ? "default"
                            : "secondary"
                        }
                        className="w-fit"
                      >
                        {order.paymentStatus === "paid" ? "مدفوع" : "قيد الدفع"}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <CreditCard className="h-3 w-3" />
                        {PAYMENT_METHODS_MAP[order.paymentMethod] ||
                          order.paymentMethod}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetails(order)}
                        className="hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        تفاصيل
                      </Button>
                      {order.orderStatus !== "cancelled" &&
                        order.orderStatus !== "delivered" && (
                          <Button
                            size="sm"
                            style={{
                              backgroundColor:
                                ((store?.customization as any)?.colors
                                  ?.primary as string) || "#2563eb",
                              color: "white",
                            }}
                            onClick={() => onReorder(order)}
                            className="hover:opacity-90"
                          >
                            <ShoppingCart className="h-4 w-4 ml-1" />
                            إعادة الطلب
                          </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

// ============================================
// ✅ مكون نافذة تسجيل الدخول المطلوب
// ============================================

interface LoginRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  productId?: string | null;
  store: Store | null;
  subdomain?: string;
  onLogin: () => void;
  onContinueAsGuest: () => void;
}

const LoginRequiredDialog: React.FC<LoginRequiredDialogProps> = ({
  open,
  onClose,
  productId,
  store,
  subdomain,
  onLogin,
  onContinueAsGuest,
}) => {
  if (!open) return null;

  const customization = store?.customization || {};
  const colors = (customization as any).colors || ({} as StoreColors);
  const styles = (customization as any).styles || ({} as StoreStyles);
  const fonts = (customization as any).fonts || ({} as StoreFonts);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        style={{
          borderRadius: styles.borderRadius || "16px",
        }}
      >
        <div
          className="p-6 text-center"
          style={{ fontFamily: fonts.body || "Cairo, sans-serif" }}
        >
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{
              backgroundColor: `${colors.primary || "#2563eb"}20`,
            }}
          >
            <User
              className="h-8 w-8"
              style={{ color: colors.primary || "#2563eb" }}
            />
          </div>

          <h2
            className="text-2xl font-bold mb-3 text-gray-900"
            style={{ fontFamily: fonts.heading || "Cairo, sans-serif" }}
          >
            تسجيل الدخول مطلوب
          </h2>

          <p className="text-gray-600 mb-6 leading-relaxed">
            للاستمرار في إضافة المنتجات إلى سلة التسوق، يرجى تسجيل الدخول إلى
            حسابك.
            <br />
            إذا لم يكن لديك حساب، يمكنك إنشاء حساب جديد بسرعة.
          </p>

          <div className="space-y-3">
            <Button
              className="w-full py-3 text-lg rounded-xl"
              onClick={onLogin}
              style={{
                backgroundColor: colors.primary || "#2563eb",
                color: "white",
              }}
            >
              <User className="h-5 w-5 ml-2" />
              تسجيل الدخول / إنشاء حساب
            </Button>

            <Button
              variant="outline"
              className="w-full py-3 text-lg rounded-xl border-2"
              onClick={onContinueAsGuest}
            >
              <ShoppingCart className="h-5 w-5 ml-2" />
              الاستمرار كضيف
            </Button>

            <Button
              variant="ghost"
              className="w-full py-2 text-gray-600 hover:text-gray-900"
              onClick={onClose}
            >
              إلغاء
            </Button>
          </div>
        </div>

        <div
          className="p-4 text-center border-t"
          style={{
            borderColor: colors.border || "#e5e7eb",
            backgroundColor: colors.background || "#f8fafc",
          }}
        >
          <p className="text-sm text-gray-500">
            التسجيل يمكنك من:
            <span className="block text-xs mt-1">
              ✓ تتبع طلباتك ✓ حفظ المفضلة ✓ خصومات حصرية
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ✅ 5. المكون الرئيسي WorkingStorefront
// ============================================

export default function WorkingStorefront() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userData } = useAuth();

  // الحالات الرئيسية
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // حالة واجهة المستخدم
  const [currentPage, setCurrentPage] = useState<
    "home" | "products" | "cart" | "orders" | "favorites"
  >("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // حالة المستخدم والبيانات
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [customerId, setCustomerId] = useState<string>("");

  // حالة المودال
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalOrderId, setConfirmModalOrderId] = useState<string | null>(
    null,
  );
  const [confirmModalProcessing, setConfirmModalProcessing] = useState(false);

  // حالة نافذة تسجيل الدخول
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginRequiredForProduct, setLoginRequiredForProduct] = useState<
    string | null
  >(null);

  // ✅ استخدام useMemo للحسابات المتكررة
  const storeStyles = useMemo(() => {
    if (!store) return {};

    const customization = store.customization || {};
    const colors = (customization as any).colors || ({} as StoreColors);
    const styles = (customization as any).styles || ({} as StoreStyles);
    const fonts = (customization as any).fonts || ({} as StoreFonts);

    return {
      "--store-primary": colors.primary || "#2563eb",
      "--store-secondary": colors.secondary || "#64748b",
      "--store-background": colors.background || "#ffffff",
      "--store-text": colors.text || "#1e293b",
      "--store-accent": colors.accent || "#f59e0b",
      "--store-border": colors.border || "#e5e7eb",
      "--store-success": colors.success || "#10b981",
      "--store-warning": colors.warning || "#f59e0b",
      "--store-error": colors.error || "#ef4444",
      "--font-heading": fonts.heading || "Cairo, sans-serif",
      "--font-body": fonts.body || "Cairo, sans-serif",
      "--border-radius": styles.borderRadius || "8px",
      "--shadow": styles.shadow || "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      "--transition": styles.transition || "all 0.3s ease",
    } as React.CSSProperties;
  }, [store]);

  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    return products.filter((product) => {
      if (product.status !== "active") return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.tags &&
          product.tags.some((tag) => tag.toLowerCase().includes(query))) ||
        (product.category && product.category.toLowerCase().includes(query))
      );
    });
  }, [products, searchQuery]);

  const cartCalculations = useMemo(() => {
    const subtotal = cart.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return total;

      const price =
        product.discount?.isActive && product.discount.salePrice
          ? product.discount.salePrice
          : product.price;

      return total + price * item.quantity;
    }, 0);

    const shippingCost = store?.settings?.shipping?.enabled
      ? subtotal >= (store.settings.shipping.freeShippingThreshold || 200)
        ? 0
        : store.settings.shipping.defaultCost || 15
      : 0;

    const taxAmount = store?.settings?.taxes?.enabled
      ? store.settings.taxes.includeInPrice
        ? 0
        : subtotal * (store.settings.taxes.rate || 0.15)
      : 0;

    const total = subtotal + shippingCost + taxAmount;
    const itemsCount = cart.reduce((count, item) => count + item.quantity, 0);

    return { subtotal, shippingCost, taxAmount, total, itemsCount };
  }, [cart, products, store]);

  // ✅ دالة توجيه إجبارية للمتجر
  const forceStoreRedirect = useCallback(() => {
    // حفظ في كل مكان ممكن
    const storeData = {
      storeId: store?.id,
      storeName: store?.name,
      subdomain: subdomain,
      ownerId: store?.ownerId,
      returnUrl: `/store/${subdomain}`,
      timestamp: Date.now(),
    };

    // 1. localStorage
    localStorage.setItem("pendingStoreInfo", JSON.stringify(storeData));

    // 2. sessionStorage
    sessionStorage.setItem(
      "returnToStore",
      JSON.stringify({
        subdomain: subdomain,
        path: `/store/${subdomain}`,
        timestamp: Date.now(),
        source: "force",
      }),
    );

    // 3. history state
    window.history.replaceState(
      { ...window.history.state, pendingStoreInfo: storeData },
      "",
      window.location.href,
    );

    console.log("💥 FORCE saved store redirect data for:", subdomain);
  }, [store, subdomain]);

  // ✅ استخدام useCallback للدوال
  const loadStoreData = useCallback(async () => {
    try {
      setLoading(true);

      if (!subdomain) {
        toast({
          title: "خطأ",
          description: "لم يتم تحديد رابط المتجر",
          variant: "destructive",
        });
        return;
      }

      const foundStore = await storeService.getBySubdomain(subdomain);
      if (!foundStore) {
        toast({
          title: "المتجر غير متوفر",
          description: `لم يتم العثور على متجر بالرابط: ${subdomain}`,
          variant: "destructive",
        });
        return;
      }

      // جلب جميع المنتجات أولاً
      const allStoreProducts = await productService.getByStore(foundStore.id);

      // تصفية المنتجات النشطة فقط
      const activeProducts = allStoreProducts.filter(
        (product) =>
          product.status === "active" || product.status === undefined,
      );

      console.log(
        `📊 إحصائيات المنتجات: ${allStoreProducts.length} منتج إجمالي، ${activeProducts.length} منتج نشط`,
      );

      const storeCategories = await categoryService.getByStore(foundStore.id);

      setStore(foundStore);
      setProducts(activeProducts); // ⬅️ استخدام المنتجات النشطة فقط
      setCategories(storeCategories);
    } catch (error) {
      console.error("❌ خطأ في تحميل بيانات المتجر:", error);
      toast({
        title: "خطأ في تحميل المتجر",
        description: "حدث خطأ أثناء تحميل بيانات المتجر",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [subdomain, toast]);

  // ✅ دالة تحميل السلة والمفضلة مع تدقيق البيانات
  // ✅ دالة تحميل السلة والمفضلة مع تدقيق البيانات
  const loadCartAndFavorites = useCallback(async () => {
    try {
      if (!store?.id || !customerId) {
        console.log("⏸️ توقف تحميل السلة: متجر أو مستخدم غير محدد");
        return;
      }

      console.log(
        `🔍 جلب السلة والمفضلة للمستخدم: ${customerId}, المتجر: ${store.id}`,
      );

      const [customerCart, customerFavorites] = await Promise.all([
        cartService.getCustomerCart(customerId, store.id),
        favoritesService.getFavorites(customerId, store.id),
      ]);

      console.log("🛒 نتائج جلب البيانات:", {
        customerCart,
        customerFavorites,
        hasCart: !!customerCart,
        hasFavorites: !!customerFavorites,
      });

      // تحديث السلة
      if (
        customerCart &&
        customerCart.items &&
        Array.isArray(customerCart.items)
      ) {
        console.log(`🛍️ تحميل ${customerCart.items.length} عنصر في السلة`);
        setCart(customerCart.items);
      } else {
        console.log("🆕 إنشاء سلة فارغة جديدة");
        // إذا لم توجد سلة، أنشئ واحدة فارغة
        await cartService.createCartWithItems(customerId, store.id, []);
        setCart([]);
      }

      // تحديث المفضلة
      let favoriteIds: string[] = [];

      // معالجة المفضلة بأمان
      if (customerFavorites) {
        if (Array.isArray(customerFavorites)) {
          favoriteIds = customerFavorites
            .filter((item: any) => item && item.productId)
            .map((item: any) => item.productId);
        } else if (
          (customerFavorites as any).items &&
          Array.isArray((customerFavorites as any).items)
        ) {
          favoriteIds = (customerFavorites as any).items
            .filter((item: any) => item && item.productId)
            .map((item: any) => item.productId);
        }
      }

      console.log(`⭐ تم تحميل ${favoriteIds.length} منتج مفضل`);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error("❌ خطأ في تحميل السلة والمفضلة:", error);
      // تعيين القيم الافتراضية في حالة الخطأ
      setCart([]);
      setFavorites([]);
    }
  }, [store?.id, customerId]);

  const loadCustomerOrders = useCallback(async () => {
    try {
      if (!store?.id || !customerId) return;

      // جلب جميع طلبات العميل ثم تصفيتها يدوياً
      const allOrders = await orderService.getByCustomer(customerId);

      // تصفية الطلبات الخاصة بهذا المتجر فقط
      const firestoreOrders = allOrders.filter(
        (order) => order.storeId === store.id,
      );

      // تحويل Orders إلى CustomerOrders مع التواريخ الصحيحة
      const customerOrders: CustomerOrder[] = firestoreOrders.map((order) => ({
        ...order,
        createdAt: convertToValidDate(order.createdAt),
        updatedAt: convertToValidDate(order.updatedAt),
      }));

      setOrders(customerOrders);
    } catch (error) {
      console.error("❌ خطأ في تحميل الطلبات:", error);
      toast({
        title: "خطأ في تحميل الطلبات",
        description: "حدث خطأ أثناء تحميل طلباتك",
        variant: "destructive",
      });
    }
  }, [store?.id, customerId, toast]);

  const saveCartToFirestore = useCallback(
    async (updatedCart: CartItem[]) => {
      try {
        if (!store?.id || !customerId) return;

        const existingCart = await cartService.getCustomerCart(
          customerId,
          store.id,
        );

        if (existingCart) {
          await cartService.updateCart(existingCart.id, updatedCart);
        } else {
          await cartService.createCartWithItems(
            customerId,
            store.id,
            updatedCart,
          );
        }
      } catch (error) {
        console.error("❌ خطأ في حفظ السلة:", error);
        toast({
          title: "خطأ في حفظ السلة",
          description: "حدث خطأ أثناء حفظ السلة في قاعدة البيانات",
          variant: "destructive",
        });
      }
    },
    [store?.id, customerId, toast],
  );

  // في دالة saveFavoritesToFirestore، استبدل الأسطر 920-924 بـ:
  const saveFavoritesToFirestore = useCallback(
    async (updatedFavorites: string[]) => {
      try {
        if (!store?.id || !customerId) return;

        // 1. جلب المفضلات الحالية
        const existingFavoritesResponse = await favoritesService.getFavorites(
          customerId,
          store.id,
        );

        // 2. معالجة البيانات بأمان
        let existingFavorites: Array<{ id?: string; productId: string }> = [];

        if (existingFavoritesResponse) {
          // إذا كان Response يحتوي على خاصية items
          if (
            existingFavoritesResponse.items &&
            Array.isArray(existingFavoritesResponse.items)
          ) {
            existingFavorites = existingFavoritesResponse.items;
          }
          // إذا كان Response نفسه مصفوفة
          else if (Array.isArray(existingFavoritesResponse)) {
            existingFavorites = existingFavoritesResponse;
          }
        }

        // 3. إنشاء مجموعة من productIds الحالية
        const currentFavoriteIds = new Set<string>();
        existingFavorites.forEach((fav) => {
          if (fav && fav.productId) {
            currentFavoriteIds.add(fav.productId);
          }
        });

        // 4. إنشاء مجموعة من productIds الجديدة
        const newFavoriteIds = new Set(updatedFavorites);

        // 5. إضافة المنتجات الجديدة
        for (const productId of updatedFavorites) {
          if (!currentFavoriteIds.has(productId)) {
            await favoritesService.addFavorite(customerId, store.id, productId);
          }
        }

        // 6. إزالة المنتجات الملغاة
        for (const fav of existingFavorites) {
          if (fav && fav.productId && !newFavoriteIds.has(fav.productId)) {
            if (fav.id) {
              await favoritesService.removeFavorite(fav.id);
            }
          }
        }

        console.log("✅ تم حفظ المفضلة في Firestore");
      } catch (error) {
        console.error("❌ خطأ في حفظ المفضلة:", error);
        toast({
          title: "خطأ في حفظ المفضلة",
          description: "حدث خطأ أثناء حفظ المفضلة في قاعدة البيانات",
          variant: "destructive",
        });
      }
    },
    [store?.id, customerId, toast],
  );

  const addToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      // ✅ التحقق إذا كان المستخدم زائر (ليس لديه حساب في Firebase)
      const isGuest =
        !userData?.uid ||
        customerId.startsWith("guest_") ||
        customerId === "anonymous";

      if (isGuest) {
        // عرض نافذة تسجيل الدخول
        setLoginRequiredForProduct(productId);
        setShowLoginDialog(true);
        return;
      }

      // الاستمرار في المنطق الحالي إذا كان المستخدم مسجلاً
      const product = products.find((p) => p.id === productId);
      if (!product) {
        toast({
          title: "خطأ",
          description: "المنتج غير موجود",
          variant: "destructive",
        });
        return;
      }

      // التحقق من المخزون
      if (
        product.inventory?.trackInventory &&
        (product.inventory.quantity || 0) < quantity
      ) {
        toast({
          title: "نفد المخزون",
          description: "الكمية المطلوبة غير متوفرة في المخزون",
          variant: "destructive",
        });
        return;
      }

      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex(
          (item) => item.productId === productId,
        );
        let newCart: CartItem[];

        if (existingItemIndex > -1) {
          const newQuantity = prevCart[existingItemIndex].quantity + quantity;

          // التحقق من المخزون مرة أخرى للتحديث
          if (
            product.inventory?.trackInventory &&
            newQuantity > (product.inventory.quantity || 0)
          ) {
            toast({
              title: "تجاوز المخزون",
              description: "لا يمكن إضافة كمية أكبر من المتاح في المخزون",
              variant: "destructive",
            });
            return prevCart;
          }

          newCart = [...prevCart];
          newCart[existingItemIndex] = {
            ...prevCart[existingItemIndex],
            quantity: newQuantity,
            addedAt: new Date(),
          };
        } else {
          newCart = [
            ...prevCart,
            {
              productId,
              quantity,
              addedAt: new Date(),
            },
          ];
        }

        // حفظ في Firestore بدون انتظار
        saveCartToFirestore(newCart).catch(console.error);

        toast({
          title: "تم الإضافة إلى السلة",
          description: `تم إضافة ${product.name} إلى سلة التسوق`,
        });

        return newCart;
      });
    },
    [products, saveCartToFirestore, toast, userData, customerId],
  );

  const updateCartQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity <= 0) {
        setCart((prevCart) => {
          const newCart = prevCart.filter(
            (item) => item.productId !== productId,
          );
          saveCartToFirestore(newCart).catch(console.error);
          return newCart;
        });
        return;
      }

      const product = products.find((p) => p.id === productId);
      if (
        product?.inventory?.trackInventory &&
        quantity > (product.inventory.quantity || 0)
      ) {
        toast({
          title: "تجاوز المخزون",
          description: "لا يمكن طلب كمية أكبر من المتاح في المخزون",
          variant: "destructive",
        });
        return;
      }

      setCart((prevCart) => {
        const newCart = prevCart.map((item) =>
          item.productId === productId
            ? { ...item, quantity, addedAt: new Date() }
            : item,
        );
        saveCartToFirestore(newCart).catch(console.error);
        return newCart;
      });
    },
    [products, saveCartToFirestore, toast],
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      setFavorites((prevFavorites) => {
        const newFavorites = prevFavorites.includes(productId)
          ? prevFavorites.filter((id) => id !== productId)
          : [...prevFavorites, productId];

        // حفظ في Firestore بدون انتظار
        saveFavoritesToFirestore(newFavorites).catch(console.error);

        const product = products.find((p) => p.id === productId);
        if (product) {
          toast({
            title: prevFavorites.includes(productId)
              ? "تم الحذف من المفضلة"
              : "تم الإضافة إلى المفضلة",
            description: prevFavorites.includes(productId)
              ? `تم إزالة ${product.name} من المفضلة`
              : `تم إضافة ${product.name} إلى المفضلة`,
          });
        }

        return newFavorites;
      });
    },
    [products, saveFavoritesToFirestore, toast],
  );

  // ✅ معالجة تسجيل الدخول
  const handleLogin = useCallback(() => {
    setShowLoginDialog(false);
    // حفظ معلومات المنتج مؤقتاً قبل التوجيه
    if (loginRequiredForProduct) {
      sessionStorage.setItem(
        "pendingCartItem",
        JSON.stringify({
          productId: loginRequiredForProduct,
          quantity: 1,
          storeId: store?.id,
          storeName: store?.name,
          subdomain,
        }),
      );
    }
    forceStoreRedirect(); // ⬅️ استخدام دالة التوجيه الإجبارية

    navigate("/customer/auth", {
      state: {
        from: `/store/${subdomain}`,
        storeId: store?.id,
        storeName: store?.name,
      },
    });
  }, [loginRequiredForProduct, store, subdomain, navigate, forceStoreRedirect]);

  const handleContinueAsGuest = useCallback(async () => {
    // خيار التسجيل كضيف (إنشاء حساب ضيف سريع)
    try {
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("guestUid", guestId);
      setCustomerId(guestId);

      toast({
        title: "مرحباً كضيف",
        description:
          "يمكنك إضافة المنتجات للسلة، ولكن ننصحك بالتسجيل لحفظ طلباتك",
      });

      setShowLoginDialog(false);
      setLoginRequiredForProduct(null);
    } catch (error) {
      console.error("❌ خطأ في إنشاء حساب ضيف:", error);
    }
  }, [toast]);

  // ✅ useEffect محسنة
  useEffect(() => {
    loadStoreData();
  }, [loadStoreData]);

  useEffect(() => {
    const initializeCustomerId = () => {
      if (userData?.uid) {
        setCustomerId(userData.uid);
        return;
      }

      try {
        let guestId = localStorage.getItem("guestUid");
        if (!guestId) {
          guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem("guestUid", guestId);
        }
        setCustomerId(guestId);
      } catch (e) {
        setCustomerId("anonymous");
      }
    };

    initializeCustomerId();
  }, [userData]);

  useEffect(() => {
    if (store?.id && customerId) {
      loadCartAndFavorites();
    }
  }, [store?.id, customerId, loadCartAndFavorites]);

  useEffect(() => {
    if (currentPage === "orders" && store?.id && customerId) {
      loadCustomerOrders();
    }
  }, [currentPage, store?.id, customerId, loadCustomerOrders]);

  // ✅ معالجات الأحداث
  const handleCheckout = useCallback(() => {
    // التحقق من تسجيل الدخول
    const isGuest =
      !userData?.uid ||
      customerId.startsWith("guest_") ||
      customerId === "anonymous";

    if (isGuest) {
      setShowLoginDialog(true);
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "السلة فارغة",
        description: "أضف بعض المنتجات إلى السلة أولاً",
        variant: "destructive",
      });
      return;
    }

    // حفظ بيانات السلة مؤقتاً للتوجيه
    try {
      sessionStorage.setItem(
        "checkoutCart",
        JSON.stringify({
          items: cart,
          storeId: store?.id,
          storeName: store?.name,
          total: cartCalculations.total,
        }),
      );
    } catch (e) {
      console.error("❌ خطأ في حفظ بيانات الدفع:", e);
    }

    navigate(`/store/${subdomain}/checkout`);
  }, [
    cart,
    store,
    cartCalculations.total,
    navigate,
    subdomain,
    toast,
    userData,
    customerId,
  ]);

  const viewOrderDetails = useCallback(
    (order: CustomerOrder) => {
      const orderDetails = `
رقم الطلب: #${order.id.slice(-8)}
التاريخ: ${new Date(order.createdAt).toLocaleDateString("ar-SA")}
الحالة: ${ORDER_STATUS_MAP[order.orderStatus] || order.orderStatus}
طريقة الدفع: ${PAYMENT_METHODS_MAP[order.paymentMethod] || order.paymentMethod}
حالة الدفع: ${order.paymentStatus === "paid" ? "مدفوع" : "قيد الدفع"}
المجموع الفرعي: ${order.subtotal} ${store?.settings?.currency || "ر.س"}
الضريبة: ${order.tax} ${store?.settings?.currency || "ر.س"}
الشحن: ${order.shipping} ${store?.settings?.currency || "ر.س"}
الإجمالي: ${order.total} ${store?.settings?.currency || "ر.س"}
    `;

      toast({
        title: `تفاصيل الطلب #${order.id.slice(-8)}`,
        description: orderDetails,
        duration: 10000,
      });
    },
    [store?.settings?.currency, toast],
  );

  const reorder = useCallback(
    async (order: CustomerOrder) => {
      try {
        let addedCount = 0;

        setCart((prevCart) => {
          const newCart = [...prevCart];

          for (const item of order.items) {
            const product = products.find((p) => p.id === item.productId);
            if (!product) continue;

            const existingItemIndex = newCart.findIndex(
              (cartItem) => cartItem.productId === item.productId,
            );

            if (existingItemIndex > -1) {
              newCart[existingItemIndex].quantity += item.quantity;
            } else {
              newCart.push({
                productId: item.productId,
                quantity: item.quantity,
                addedAt: new Date(),
              });
            }
            addedCount++;
          }

          saveCartToFirestore(newCart).catch(console.error);
          return newCart;
        });

        toast({
          title: "تمت إعادة الطلب",
          description: `تمت إضافة ${addedCount} منتج إلى السلة`,
        });

        setCurrentPage("cart");
      } catch (error) {
        console.error("❌ خطأ في إعادة الطلب:", error);
        toast({
          title: "خطأ في إعادة الطلب",
          description: "حدث خطأ أثناء إضافة المنتجات إلى السلة",
          variant: "destructive",
        });
      }
    },
    [products, saveCartToFirestore, toast],
  );

  const handleConfirmDelivery = useCallback(
    async (orderId: string) => {
      try {
        // تحديث محلي فوري
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, orderStatus: "delivered" } : o,
          ),
        );

        await orderService.update(orderId, {
          orderStatus: "delivered",
          deliveredAt: new Date(),
        });

        toast({
          title: "تم تأكيد الاستلام",
          description: "شكراً لتأكيدك استلام الطلب",
        });
      } catch (err) {
        console.error("❌ خطأ في تأكيد الاستلام:", err);
        toast({
          title: "خطأ",
          description: "فشل تأكيد الاستلام",
          variant: "destructive",
        });

        // إعادة تحميل البيانات
        await loadCustomerOrders();
      }
    },
    [loadCustomerOrders, toast],
  );

  const openConfirmModal = useCallback((orderId: string) => {
    setConfirmModalOrderId(orderId);
    setConfirmModalOpen(true);
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmModalOpen(false);
    setConfirmModalOrderId(null);
    setConfirmModalProcessing(false);
  }, []);

  const confirmModalYes = useCallback(async () => {
    if (!confirmModalOrderId) return;

    try {
      setConfirmModalProcessing(true);
      await handleConfirmDelivery(confirmModalOrderId);
      closeConfirmModal();
    } catch (err) {
      console.error("❌ خطأ في تأكيد الاستلام:", err);
      setConfirmModalProcessing(false);
    }
  }, [confirmModalOrderId, handleConfirmDelivery, closeConfirmModal]);

  // ✅ حالة التحميل
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: "#ffffff",
          color: "#1e293b",
        }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-4"
            style={{
              borderColor: "#2563eb",
            }}
          ></div>
          <p
            className="text-lg font-semibold"
            style={{
              fontFamily: "Cairo, sans-serif",
            }}
          >
            جاري تحميل المتجر...
          </p>
        </div>
      </div>
    );
  }

  // ✅ حالة عدم وجود متجر
  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center max-w-2xl mx-auto p-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            المتجر غير متوفر
          </h1>
          <p className="text-gray-600 mb-4">
            لم يتم العثور على متجر بالرابط: <strong>{subdomain}</strong>
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={() => loadStoreData()} variant="outline">
              إعادة تحميل البيانات
            </Button>
            <Button
              onClick={() => navigate("/customer/stores")}
              className="bg-green-600 hover:bg-green-700"
            >
              تصفح جميع المتاجر
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // الحصول على إعدادات التخصيص بشكل آمن
  const customization = store.customization || {};
  const colors = (customization as any).colors || ({} as StoreColors);
  const fonts = (customization as any).fonts || ({} as StoreFonts);
  const styles = (customization as any).styles || ({} as StoreStyles);

  return (
    <div className="min-h-screen" dir="rtl" style={storeStyles}>
      {/* ✅ إشعار للزوار */}
      {!userData?.uid && (
        <div
          className="bg-yellow-50 border-b border-yellow-200 text-center py-2 text-sm text-yellow-800"
          dir="rtl"
        >
          <AlertCircle className="h-4 w-4 inline ml-1" />
          أنت تتصفح كزائر.{" "}
          <button
            className="font-semibold hover:text-yellow-900 underline"
            onClick={() => {
              forceStoreRedirect(); // ⬅️ استخدام دالة التوجيه الإجبارية
              navigate("/customer/auth", {
                state: { from: `/store/${subdomain}` },
              });
            }}
          >
            سجل الدخول
          </button>{" "}
          لحفظ طلباتك والمفضلة.
        </div>
      )}

      {/* ✅ الهيدر */}
      <header
        className="shadow-sm border-b sticky top-0 z-40 bg-white"
        style={{
          backgroundColor: colors.background || "#ffffff",
          borderColor: colors.border || "#e5e7eb",
          fontFamily: fonts.body || "Cairo, sans-serif",
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div
            className="flex items-center justify-between py-2 text-sm border-b"
            style={{
              borderColor: colors.border || "#e5e7eb",
            }}
          >
            <div className="flex items-center gap-4">
              <span className="text-gray-600">مرحباً بكم في {store.name}</span>
              {store.settings?.currency && (
                <span className="text-gray-600">
                  العملة: {store.settings.currency}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {store.settings?.shipping?.enabled && (
                <span className="text-gray-600">
                  التوصيل المجاني للطلبات أكثر من{" "}
                  {store.settings.shipping.freeShippingThreshold || 200}{" "}
                  {store.settings.currency || "ر.س"}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between py-4">
            {/* الشعار */}
            <div
              onClick={() => {
                setCurrentPage("home");
                setSelectedProduct(null);
              }}
              className="flex items-center gap-3 cursor-pointer"
            >
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: colors.primary || "#2563eb",
                  }}
                >
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
              )}
              <span
                className="text-xl font-bold"
                style={{
                  fontFamily: fonts.heading || "Cairo, sans-serif",
                  color: colors.text || "#1e293b",
                }}
              >
                {store.name}
              </span>
            </div>

            {/* بحث */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Input
                  placeholder="ابحث عن المنتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500"
                  style={{
                    borderRadius: styles.borderRadius || "8px",
                  }}
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* أزرار الهيدر */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage("cart")}
                className="relative"
                style={{
                  borderRadius: styles.borderRadius || "8px",
                }}
              >
                <ShoppingCart className="h-5 w-5" />
                {cart.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    style={{
                      backgroundColor: colors.primary || "#2563eb",
                    }}
                  >
                    {cartCalculations.itemsCount}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage("orders")}
                className="relative"
                style={{
                  borderRadius: styles.borderRadius || "8px",
                }}
              >
                <ShoppingBasket className="h-5 w-5" />
                {orders.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    style={{
                      backgroundColor: colors.primary || "#2563eb",
                    }}
                  >
                    {orders.length}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage("favorites")}
                className="relative"
                style={{
                  borderRadius: styles.borderRadius || "8px",
                }}
              >
                <Heart className="h-5 w-5" />
                {favorites.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    style={{
                      backgroundColor: colors.primary || "#2563eb",
                    }}
                  >
                    {favorites.length}
                  </span>
                )}
              </Button>

              {/* زر تسجيل الدخول للزوار أو Dropdown للمسجلين */}
              {!userData?.uid ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    forceStoreRedirect(); // ⬅️ استخدام دالة التوجيه الإجبارية
                    navigate("/customer/auth", {
                      state: { from: `/store/${subdomain}` },
                    });
                  }}
                  style={{
                    backgroundColor: colors.primary || "#2563eb",
                    borderRadius: styles.borderRadius || "8px",
                  }}
                >
                  <User className="h-4 w-4 ml-2" />
                  تسجيل الدخول
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ borderRadius: styles.borderRadius || "8px" }}
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={async () => {
                        if (userData?.uid) {
                          navigate("/customer/profile");
                        } else if (customerId && store?.id) {
                          navigate(
                            `/customer/profile?customerId=${encodeURIComponent(customerId)}&storeId=${encodeURIComponent(store.id)}`,
                          );
                        } else {
                          navigate("/login");
                        }
                      }}
                    >
                      الملف الشخصي
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={async () => {
                        try {
                          await signOutUser();
                          navigate("/");
                        } catch (e) {
                          console.error("Error signing out", e);
                        }
                      }}
                    >
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* التنقل */}
          <nav className="pb-4">
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { id: "home", label: "الرئيسية", icon: Home },
                { id: "products", label: "جميع المنتجات", icon: Package },
                { id: "orders", label: "طلباتي", icon: ShoppingBasket },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  onClick={() => setCurrentPage(item.id as any)}
                  size="sm"
                  style={{
                    backgroundColor:
                      currentPage === item.id
                        ? colors.primary || "#2563eb"
                        : "transparent",
                    color:
                      currentPage === item.id
                        ? "white"
                        : colors.text || "#1e293b",
                    border:
                      currentPage === item.id
                        ? "none"
                        : `1px solid ${colors.secondary || "#64748b"}`,
                    borderRadius: styles.borderRadius || "8px",
                  }}
                >
                  <item.icon className="h-4 w-4 ml-2" />
                  {item.label}
                </Button>
              ))}

              {categories.slice(0, 6).map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentPage("products");
                    setSearchQuery(category.name);
                  }}
                  className="text-sm"
                  style={{
                    borderRadius: styles.borderRadius || "8px",
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* ✅ المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === "home" && !selectedProduct && (
          <div className="space-y-12">
            {/* قسم البطل */}
            <section
              className="relative h-96 rounded-2xl overflow-hidden shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${colors.primary || "#2563eb"} 0%, ${colors.accent || "#7c3aed"} 100%)`,
                borderRadius: styles.borderRadius || "8px",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-white text-center px-8">
                <div className="max-w-2xl">
                  <h1
                    className="text-5xl font-bold mb-6"
                    style={{ fontFamily: fonts.heading || "Cairo, sans-serif" }}
                  >
                    مرحباً بكم في {store.name}
                  </h1>
                  <p className="text-xl mb-8 opacity-90">{store.description}</p>
                  <Button
                    size="lg"
                    onClick={() => setCurrentPage("products")}
                    style={{
                      backgroundColor: colors.background || "#ffffff",
                      color: colors.primary || "#2563eb",
                      borderRadius: styles.borderRadius || "8px",
                    }}
                    className="hover:opacity-90 transition-opacity text-lg px-8 py-3 rounded-full"
                  >
                    تسوق الآن
                  </Button>
                </div>
              </div>
            </section>

            {/* التصنيفات */}
            {categories.length > 0 && (
              <section>
                <h2
                  className="text-3xl font-bold mb-8 text-center"
                  style={{ fontFamily: fonts.heading || "Cairo, sans-serif" }}
                >
                  تسوق حسب الفئة
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {categories.map((category) => (
                    <Card
                      key={category.id}
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-md"
                      onClick={() => {
                        setCurrentPage("products");
                        setSearchQuery(category.name);
                      }}
                    >
                      <CardContent className="p-6 text-center">
                        <div
                          className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                          style={{
                            backgroundColor: `${colors.primary || "#2563eb"}20`,
                          }}
                        >
                          <Package
                            className="h-10 w-10"
                            style={{ color: colors.primary || "#2563eb" }}
                          />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* المنتجات المميزة */}
            <section>
              <h2
                className="text-3xl font-bold mb-8 text-center"
                style={{ fontFamily: fonts.heading || "Cairo, sans-serif" }}
              >
                المنتجات المميزة
              </h2>
              {products.filter((p) => p.featured && p.status === "active")
                .length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products
                    .filter((p) => p.featured && p.status === "active")
                    .slice(0, 8)
                    .map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isFavorite={favorites.includes(product.id)}
                        store={store}
                        onAddToCart={addToCart}
                        onToggleFavorite={toggleFavorite}
                        onViewDetails={setSelectedProduct}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    لا توجد منتجات مميزة حالياً
                  </h3>
                  <p className="text-gray-600 mb-4">
                    لم يقم صاحب المتجر بتعيين أي منتجات كمميزة
                  </p>
                  <Button onClick={() => setCurrentPage("products")}>
                    عرض جميع المنتجات
                  </Button>
                </div>
              )}
            </section>

            {/* المنتجات المتاحة */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2
                  className="text-3xl font-bold"
                  style={{ fontFamily: fonts.heading || "Cairo, sans-serif" }}
                >
                  المنتجات المتاحة
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage("products")}
                  className="border-2"
                >
                  عرض الكل
                </Button>
              </div>
              {products.filter((p) => p.status === "active").length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products
                    .filter((p) => p.status === "active")
                    .slice(0, 8)
                    .map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isFavorite={favorites.includes(product.id)}
                        store={store}
                        onAddToCart={addToCart}
                        onToggleFavorite={toggleFavorite}
                        onViewDetails={setSelectedProduct}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    لا توجد منتجات حالياً
                  </h3>
                  <p className="text-gray-600">
                    لم يقم صاحب المتجر بإضافة أي منتجات بعد
                  </p>
                </div>
              )}
            </section>
          </div>
        )}

        {currentPage === "products" && !selectedProduct && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1
                className="text-3xl font-bold"
                style={{ fontFamily: fonts.heading || "Cairo, sans-serif" }}
              >
                جميع المنتجات
              </h1>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                عرض {filteredProducts.length} منتج
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <AlertCircle className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {searchQuery
                    ? "لم يتم العثور على منتجات"
                    : "لا توجد منتجات بعد"}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? "جرب استخدام كلمات بحث مختلفة أو تصفح جميع المنتجات"
                    : "لم يقم صاحب المتجر بإضافة أي منتجات بعد. يمكنك العودة لاحقاً."}
                </p>
                <div className="flex gap-3 justify-center mt-6">
                  {searchQuery && (
                    <Button
                      onClick={() => setSearchQuery("")}
                      variant="outline"
                    >
                      عرض جميع المنتجات
                    </Button>
                  )}
                  <Button onClick={() => setCurrentPage("home")}>
                    العودة للرئيسية
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={favorites.includes(product.id)}
                    store={store}
                    onAddToCart={addToCart}
                    onToggleFavorite={toggleFavorite}
                    onViewDetails={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {selectedProduct && (
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button
                onClick={() => setSelectedProduct(null)}
                className="hover:text-blue-600 transition-colors"
              >
                المنتجات
              </button>
              <ArrowLeft className="h-4 w-4" />
              <span className="text-gray-800 font-medium">
                {selectedProduct.name}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg">
                  {selectedProduct.images?.[0] ? (
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-24 w-24 text-gray-400" />
                  )}
                </div>
                {selectedProduct.images &&
                  selectedProduct.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-3">
                      {selectedProduct.images.slice(1).map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                        >
                          <img
                            src={image}
                            alt={`${selectedProduct.name} ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge
                      style={{ backgroundColor: colors.primary || "#2563eb" }}
                    >
                      {selectedProduct.category || "غير مصنف"}
                    </Badge>
                    {selectedProduct.featured && (
                      <Badge
                        style={{ backgroundColor: colors.warning || "#f59e0b" }}
                      >
                        <Star className="h-3 w-3 ml-1" />
                        منتج مميز
                      </Badge>
                    )}
                  </div>

                  <h1
                    className="text-3xl font-bold mb-4 text-gray-900"
                    style={{ fontFamily: fonts.heading || "Cairo, sans-serif" }}
                  >
                    {selectedProduct.name}
                  </h1>

                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl font-bold text-green-600">
                      {selectedProduct.discount?.isActive &&
                      selectedProduct.discount.salePrice
                        ? selectedProduct.discount.salePrice
                        : selectedProduct.price}{" "}
                      {store.settings?.currency || "ر.س"}
                    </span>
                    {selectedProduct.discount?.isActive &&
                      selectedProduct.discount.salePrice && (
                        <div className="flex flex-col">
                          <span className="text-xl text-gray-500 line-through">
                            {selectedProduct.comparePrice ||
                              selectedProduct.price}{" "}
                            {store.settings?.currency || "ر.س"}
                          </span>
                          <Badge
                            style={{
                              backgroundColor: colors.error || "#ef4444",
                            }}
                          >
                            وفر{" "}
                            {calculateSalePercentage(
                              selectedProduct.comparePrice ||
                                selectedProduct.price,
                              selectedProduct.discount.salePrice,
                            )}
                            %
                          </Badge>
                        </div>
                      )}
                  </div>

                  <p className="text-gray-600 leading-relaxed text-lg">
                    {selectedProduct.description}
                  </p>
                </div>

                {selectedProduct.inventory?.sku && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600">
                      <strong>رقم المنتج:</strong>{" "}
                      {selectedProduct.inventory.sku}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <span className="text-gray-700 font-medium">الحالة:</span>
                  {selectedProduct.inventory?.trackInventory &&
                  selectedProduct.inventory.quantity === 0 ? (
                    <Badge
                      variant="destructive"
                      className="text-base py-1 px-3"
                    >
                      ✗ نفد المخزون
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-base py-1 px-3">
                      ✓ متوفر ({selectedProduct.inventory?.quantity || 0} قطعة)
                    </Badge>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    className="flex-1 py-3 text-lg rounded-xl"
                    onClick={() => addToCart(selectedProduct.id)}
                    disabled={
                      selectedProduct.inventory?.trackInventory &&
                      selectedProduct.inventory.quantity === 0
                    }
                    style={{
                      backgroundColor: colors.primary || "#2563eb",
                      color: "white",
                    }}
                  >
                    <ShoppingCart className="h-5 w-5 ml-2" />
                    {selectedProduct.inventory?.trackInventory &&
                    selectedProduct.inventory.quantity === 0
                      ? "نفد المخزون"
                      : "إضافة للسلة"}
                  </Button>
                  <Button
                    variant="outline"
                    className="py-3 px-4 rounded-xl border-2"
                    size="lg"
                    onClick={() => toggleFavorite(selectedProduct.id)}
                  >
                    <Heart
                      className={`h-5 w-5 ${favorites.includes(selectedProduct.id) ? "fill-red-500 text-red-500" : ""}`}
                    />
                  </Button>
                </div>

                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4">
                    <span className="text-gray-700 font-medium ml-2">
                      الكلمات الدلالية:
                    </span>
                    {selectedProduct.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentPage === "cart" && (
          <div className="space-y-6">
            <h1
              className="text-3xl font-bold"
              style={{ fontFamily: fonts.heading || "Cairo, sans-serif" }}
            >
              سلة التسوق
            </h1>

            {cart.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  سلة التسوق فارغة
                </h3>
                <p className="text-gray-600 mb-6">أضف بعض المنتجات للمتابعة</p>
                <Button onClick={() => setCurrentPage("products")} size="lg">
                  تصفح المنتجات
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item) => {
                    const product = products.find(
                      (p) => p.id === item.productId,
                    );
                    if (!product) return null;

                    const price =
                      product.discount?.isActive && product.discount.salePrice
                        ? product.discount.salePrice
                        : product.price;

                    return (
                      <Card key={item.productId} className="border-0 shadow-md">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              ) : (
                                <Package className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">
                                {product.name}
                              </h3>
                              <p className="text-gray-600 mb-3">
                                {price} {store.settings?.currency || "ر.س"}{" "}
                                للقطعة
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      updateCartQuantity(
                                        item.productId,
                                        item.quantity - 1,
                                      )
                                    }
                                    className="h-10 w-10 hover:bg-gray-100"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="px-4 py-2 min-w-[60px] text-center font-semibold">
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
                                    disabled={
                                      product.inventory?.trackInventory &&
                                      item.quantity >=
                                        (product.inventory.quantity || 0)
                                    }
                                    className="h-10 w-10 hover:bg-gray-100"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="text-left">
                                  <p className="font-semibold text-lg">
                                    {price * item.quantity}{" "}
                                    {store.settings?.currency || "ر.س"}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      updateCartQuantity(item.productId, 0)
                                    }
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"
                                  >
                                    حذف
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div>
                  <Card className="border-0 shadow-lg sticky top-4">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl">ملخص الطلب</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-lg">
                        <span>المجموع الفرعي</span>
                        <span className="font-semibold">
                          {cartCalculations.subtotal}{" "}
                          {store.settings?.currency || "ر.س"}
                        </span>
                      </div>

                      {store.settings?.taxes?.enabled && (
                        <div className="flex justify-between text-lg">
                          <span>
                            الضريبة (
                            {Math.round(
                              (store.settings.taxes.rate || 0.15) * 100,
                            )}
                            %)
                          </span>
                          <span className="font-semibold">
                            {cartCalculations.taxAmount}{" "}
                            {store.settings?.currency || "ر.س"}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-lg">
                        <span>الشحن</span>
                        <span className="font-semibold">
                          {cartCalculations.shippingCost === 0
                            ? "مجاني"
                            : `${cartCalculations.shippingCost} ${store.settings?.currency || "ر.س"}`}
                        </span>
                      </div>

                      {cartCalculations.shippingCost > 0 && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-700 text-center">
                            أنفق{" "}
                            {(store.settings?.shipping?.freeShippingThreshold ||
                              200) - cartCalculations.subtotal}{" "}
                            {store.settings?.currency || "ر.س"} أخرى للحصول على
                            شحن مجاني
                          </p>
                        </div>
                      )}

                      <div className="border-t border-gray-300 pt-4">
                        <div className="flex justify-between text-xl font-bold">
                          <span>الإجمالي</span>
                          <span>
                            {cartCalculations.total}{" "}
                            {store.settings?.currency || "ر.س"}
                          </span>
                        </div>
                      </div>
                      <Button
                        className="w-full py-3 text-lg rounded-xl mt-4"
                        onClick={handleCheckout}
                        style={{
                          backgroundColor: colors.primary || "#2563eb",
                          color: "white",
                        }}
                      >
                        إتمام الشراء
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}

        {currentPage === "orders" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1
                  className="text-3xl font-bold"
                  style={{ fontFamily: fonts.heading || "Cairo, sans-serif" }}
                >
                  طلباتي
                </h1>
                <p className="text-gray-600 mt-2">
                  عرض جميع طلباتك في هذا المتجر
                </p>
              </div>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {orders.length} طلب
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBasket className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  لا توجد طلبات
                </h3>
                <p className="text-gray-600 mb-6">لم تقم بأي طلبات حتى الآن</p>
                <Button onClick={() => setCurrentPage("products")} size="lg">
                  تصفح المنتجات
                </Button>
              </div>
            ) : (
              <>
                <OrdersTable
                  orders={orders}
                  store={store}
                  onViewDetails={viewOrderDetails}
                  onReorder={reorder}
                  onConfirmDelivery={openConfirmModal}
                />

                <ConfirmReceiptDialog
                  open={confirmModalOpen}
                  onClose={closeConfirmModal}
                  onConfirm={confirmModalYes}
                  loading={confirmModalProcessing}
                />
              </>
            )}
          </div>
        )}

        {currentPage === "favorites" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1
                  className="text-3xl font-bold"
                  style={{ fontFamily: fonts.heading || "Cairo, sans-serif" }}
                >
                  مفضلاتي
                </h1>
                <p className="text-gray-600 mt-2">
                  المنتجات التي أضفتها إلى المفضلة في هذا المتجر
                </p>
              </div>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {favorites.length} منتج
              </div>
            </div>

            {favorites.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  لا توجد منتجات في المفضلة
                </h3>
                <p className="text-gray-600 mb-6">
                  أضف منتجات إلى المفضلة للعودة إليها لاحقاً
                </p>
                <Button onClick={() => setCurrentPage("products")} size="lg">
                  تصفح المنتجات
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter((p) => favorites.includes(p.id))
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFavorite={favorites.includes(product.id)}
                      store={store}
                      onAddToCart={addToCart}
                      onToggleFavorite={toggleFavorite}
                      onViewDetails={setSelectedProduct}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ✅ الفوتر */}
      <footer
        className="mt-20 border-t"
        style={{
          backgroundColor: colors.background || "#ffffff",
          borderColor: colors.border || "#e5e7eb",
          color: colors.text || "#1e293b",
          fontFamily: fonts.body || "Cairo, sans-serif",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                {store.logo ? (
                  <img
                    src={store.logo}
                    alt={store.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: colors.primary || "#2563eb" }}
                  >
                    <ShoppingBag className="h-4 w-4 text-white" />
                  </div>
                )}
                <span
                  className="text-xl font-bold"
                  style={{ fontFamily: fonts.heading || "Cairo, sans-serif" }}
                >
                  {store.name}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                {store.description}
              </p>

              <div className="space-y-2 text-sm text-gray-600">
                {store.contact?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{store.contact.phone}</span>
                  </div>
                )}
                {store.contact?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{store.contact.email}</span>
                  </div>
                )}
                {store.contact?.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{store.contact.address}</span>
                  </div>
                )}
              </div>

              {store.socialMedia && (
                <div className="flex gap-3 mt-4">
                  {store.socialMedia.whatsapp && (
                    <a
                      href={store.socialMedia.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-green-500"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </a>
                  )}
                  {store.socialMedia.instagram && (
                    <a
                      href={store.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-pink-500"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {store.socialMedia.twitter && (
                    <a
                      href={store.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-400"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {store.socialMedia.facebook && (
                    <a
                      href={store.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">روابط سريعة</h4>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <button
                    onClick={() => setCurrentPage("home")}
                    className="hover:text-blue-600 transition-colors"
                  >
                    الرئيسية
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("products")}
                    className="hover:text-blue-600 transition-colors"
                  >
                    جميع المنتجات
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("cart")}
                    className="hover:text-blue-600 transition-colors"
                  >
                    سلة التسوق
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage("orders")}
                    className="hover:text-blue-600 transition-colors"
                  >
                    طلباتي
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">الدفع والشحن</h4>
              <div className="space-y-3 text-sm text-gray-600">
                {store.settings?.payment && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>
                      {Object.entries(store.settings.payment)
                        .filter(([_, value]) => value === true)
                        .map(([key]) => PAYMENT_METHODS_MAP[key] || key)
                        .join("، ")}
                    </span>
                  </div>
                )}

                {store.settings?.shipping?.enabled && (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>شحن لجميع المناطق</span>
                  </div>
                )}

                {store.settings?.taxes?.enabled && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>
                      الأسعار{" "}
                      {store.settings.taxes.includeInPrice
                        ? "شاملة"
                        : "غير شاملة"}{" "}
                      الضريبة
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 mt-8 pt-8 text-center text-gray-500">
            <p>
              © {new Date().getFullYear()} {store.name}. جميع الحقوق محفوظة.
            </p>
            {store.customDomain && (
              <p className="text-sm mt-1">
                <Globe className="h-3 w-3 inline ml-1" />
                {store.customDomain}
              </p>
            )}
          </div>
        </div>
      </footer>

      {/* ✅ نافذة تسجيل الدخول المطلوب */}
      <LoginRequiredDialog
        open={showLoginDialog}
        onClose={() => {
          setShowLoginDialog(false);
          setLoginRequiredForProduct(null);
        }}
        productId={loginRequiredForProduct}
        store={store}
        subdomain={subdomain}
        onLogin={handleLogin}
        onContinueAsGuest={handleContinueAsGuest}
      />

      {/* ✅ نافذة تأكيد استلام الطلب */}
      <ConfirmReceiptDialog
        open={confirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModalYes}
        loading={confirmModalProcessing}
      />
    </div>
  );
}
