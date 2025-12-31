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
import { storeService, productService } from "@/lib/firestore";
import {
  Store as StoreIcon,
  Search,
  ShoppingBag,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  Grid3X3,
  Users,
  Package,
  Filter,
  Heart,
  TrendingUp,
  Award,
  ShieldCheck,
  Truck,
  CreditCard,
  Eye,
  ThumbsUp,
  ShoppingCart,
  UserPlus,
} from "lucide-react";

// Local icon components used by categories
const Home = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const Book = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

interface StoreWithMetadata {
  id: string;
  name: string;
  description: string;
  subdomain: string;
  status: string;
  ownerId: string;
  customization?: any;
  settings?: any;
  createdAt: Date;
  productCount: number;
  averageRating: number;
  reviewCount: number;
  category?: string;
  totalSales?: number;
  isVerified?: boolean;
  shippingEnabled?: boolean;
  paymentMethods?: string[];
}

export default function StoreSelection() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stores, setStores] = useState<StoreWithMetadata[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreWithMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    filterAndSortStores();
  }, [searchTerm, stores, activeTab, sortBy, selectedCategory]);

  const loadStores = async () => {
    try {
      setLoading(true);

      const allStores = await storeService.getAll();

      const activeStores = allStores.filter(
        (store) => store.status === "active",
      );

      const storesWithMetadata = await Promise.all(
        activeStores.map(async (store) => {
          try {
            const products = await productService.getByStore(store.id);

            const averageRating = 4.2 + Math.random() * 0.8;
            const reviewCount = Math.floor(Math.random() * 500) + 50;
            const totalSales = Math.floor(Math.random() * 10000) + 1000;

            let category = "عام";
            const name = store.name.toLowerCase();
            const desc = store.description.toLowerCase();

            if (name.includes("إلكتروني") || desc.includes("إلكتروني")) {
              category = "إلكترونيات";
            } else if (name.includes("أزياء") || desc.includes("أزياء")) {
              category = "أزياء";
            } else if (name.includes("منزل") || desc.includes("منزل")) {
              category = "منزل";
            } else if (name.includes("كتاب") || desc.includes("كتاب")) {
              category = "كتب";
            } else if (name.includes("رياض") || desc.includes("رياض")) {
              category = "رياضة";
            } else if (name.includes("جمال") || desc.includes("جمال")) {
              category = "جمال";
            }

            // تحويل payment settings إلى array من الأسماء
            const paymentMethods = store.settings?.payment
              ? Object.entries(store.settings.payment)
                  .filter(([key, value]) => value === true && key !== "methods")
                  .map(([key]) => {
                    const methodsMap: Record<string, string> = {
                      cashOnDelivery: "الدفع عند الاستلام",
                      bankTransfer: "التحويل البنكي",
                      creditCard: "بطاقة ائتمان",
                      paypal: "PayPal",
                      stripe: "Stripe",
                    };
                    return methodsMap[key] || key;
                  })
              : ["بطاقة ائتمان", "الدفع عند الاستلام"];

            return {
              ...store,
              productCount: products.length,
              averageRating: parseFloat(averageRating.toFixed(1)),
              reviewCount,
              category,
              totalSales,
              isVerified: Math.random() > 0.3,
              shippingEnabled: store.settings?.shipping?.enabled || false,
              paymentMethods,
            };
          } catch (error) {
            console.error(
              `Error loading products for store ${store.id}:`,
              error,
            );
            return {
              ...store,
              productCount: 0,
              averageRating: 0,
              reviewCount: 0,
              category: "عام",
              totalSales: 0,
              isVerified: false,
              shippingEnabled: false,
              paymentMethods: ["بطاقة ائتمان", "الدفع عند الاستلام"],
            };
          }
        }),
      );

      setStores(storesWithMetadata);
      setFilteredStores(storesWithMetadata);
    } catch (error) {
      console.error("Error loading stores:", error);
      toast({
        title: "خطأ في تحميل المتاجر",
        description: "حدث خطأ أثناء تحميل قائمة المتاجر",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStores = () => {
    let filtered = [...stores];

    if (activeTab === "featured") {
      filtered = filtered.filter(
        (store) =>
          store.isVerified && store.totalSales && store.totalSales > 5000,
      );
    } else if (activeTab === "verified") {
      filtered = filtered.filter((store) => store.isVerified);
    } else if (activeTab === "new") {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      filtered = filtered.filter(
        (store) => new Date(store.createdAt) > twoWeeksAgo,
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(
        (store) => store.category === selectedCategory,
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (store) =>
          store.name.toLowerCase().includes(term) ||
          store.description.toLowerCase().includes(term) ||
          store.subdomain.toLowerCase().includes(term) ||
          store.category?.toLowerCase().includes(term),
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.averageRating - a.averageRating;
        case "products":
          return b.productCount - a.productCount;
        case "sales":
          return (b.totalSales || 0) - (a.totalSales || 0);
        case "name":
          return a.name.localeCompare(b.name, "ar");
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    setFilteredStores(filtered);
  };

  // الدالة المعدلة - دائماً تنتقل لصفحة تسجيل الدخول مع تمرير البيانات
  const handleStoreSelect = async (store: StoreWithMetadata) => {
    try {
      console.log("🎯 اختيار متجر:", store.name);

      // إعداد بيانات المتجر الأساسية فقط
      const storeDataForAuth = {
        storeId: store.id,
        storeName: store.name,
        subdomain: store.subdomain,
        ownerId: store.ownerId || "",
        category: store.category || "عام",
        description: store.description || "",
        productCount: store.productCount,
        averageRating: store.averageRating,
        reviewCount: store.reviewCount,
        totalSales: store.totalSales || 0,
        isVerified: store.isVerified || false,
        shippingEnabled: store.shippingEnabled || false,
        paymentMethods: store.paymentMethods || [],
        returnUrl: `/store/${store.subdomain}`,
      };

      console.log("📊 بيانات المتجر المحضرة:", storeDataForAuth);

      // store pending selection in history state (avoid localStorage)
      try {
        window.history.replaceState(
          {
            ...(window.history.state || {}),
            pendingStoreInfo: storeDataForAuth,
          },
          "",
        );
        console.log("💾 تم حفظ بيانات المتجر في history.state");
      } catch (err) {
        console.warn(
          "Could not set history state for pendingStoreSelection:",
          err,
        );
        // fallback to localStorage for older flows
        try {
          localStorage.setItem(
            "pendingStoreSelection",
            JSON.stringify(storeDataForAuth),
          );
          console.log(
            "💾 saved fallback pendingStoreSelection to localStorage",
          );
        } catch (e) {}
      }

      // إعداد query parameters (بدون createdAt)
      const storeParams = new URLSearchParams({
        storeId: store.id,
        storeName: encodeURIComponent(store.name),
        subdomain: store.subdomain,
        ownerId: store.ownerId || "",
        merchantId: store.ownerId || "",
        category: store.category || "عام",
        description: encodeURIComponent(store.description || ""),
        productCount: store.productCount.toString(),
        averageRating: store.averageRating.toString(),
        reviewCount: store.reviewCount.toString(),
        returnUrl: encodeURIComponent(`/store/${store.subdomain}`),
      }).toString();

      console.log("📍 الانتقال إلى صفحة تسجيل الدخول كعميل");

      toast({
        title: "تسجيل الدخول كعميل",
        description: `جاري إعداد حسابك للدخول إلى ${store.name}`,
      });

      // الانتقال إلى صفحة تسجيل الدخول كعميل مع البيانات
      navigate(`/customer/auth?${storeParams}`);
    } catch (error) {
      console.error("❌ خطأ في اختيار المتجر:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من فتح المتجر، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const handleQuickView = (store: StoreWithMetadata) => {
    navigate(`/store/${store.subdomain}`, {
      state: { fromStoreSelection: true },
    });
  };

  // دالة للاستمرار كضيف
  const handleContinueAsGuest = (store: StoreWithMetadata) => {
    // store guest info in history state (no localStorage)
    try {
      const guest = {
        ...store,
        isGuest: true,
        guestId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      window.history.replaceState(
        { ...(window.history.state || {}), pendingStoreInfo: guest },
        "",
      );
    } catch (err) {
      console.warn("Could not set history state for guestStoreData:", err);
      try {
        localStorage.setItem(
          "guestStoreData",
          JSON.stringify({
            ...store,
            isGuest: true,
            guestId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          }),
        );
      } catch (e) {}
    }

    toast({
      title: "مرحباً كضيف! 🛒",
      description: "يمكنك التسوق الآن، وسيتم حفظ منتجاتك في سلة التسوق",
    });

    navigate(`/store/${store.subdomain}`);
  };

  const categories = [
    { id: "all", name: "جميع الفئات", icon: Grid3X3 },
    { id: "إلكترونيات", name: "إلكترونيات", icon: ShoppingBag },
    { id: "أزياء", name: "أزياء", icon: Award },
    { id: "منزل", name: "منزل", icon: Home },
    { id: "كتب", name: "كتب", icon: Book },
    { id: "رياضة", name: "رياضة", icon: TrendingUp },
    { id: "جمال", name: "جمال", icon: Heart },
  ];

  const sortOptions = [
    { id: "newest", name: "الأحدث" },
    { id: "rating", name: "الأعلى تقييماً" },
    { id: "products", name: "الأكثر منتجات" },
    { id: "sales", name: "الأكثر مبيعات" },
    { id: "name", name: "الاسم من أ إلى ي" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600">جاري تحميل المتاجر...</p>
          <p className="text-sm text-gray-500 mt-2">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      dir="rtl"
    >
      <div className="bg-gradient-to-r from-primary/90 to-brand/90 text-white py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              اكتشف أفضل المتاجر الإلكترونية
            </h1>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              تسوق من آلاف المتاجر الموثوقة في مكان واحد، اختر ما يناسبك وابدأ
              تجربة تسوق فريدة
            </p>

            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="ابحث عن متجر، فئة، أو منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-6 text-lg bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder-white/70 focus:bg-white/20 focus:border-white rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <StoreIcon className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {stores.length}
              </h3>
              <p className="text-gray-600">متجر متاح</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {stores
                  .reduce((sum, store) => sum + store.productCount, 0)
                  .toLocaleString()}
              </h3>
              <p className="text-gray-600">منتج متوفر</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {stores
                  .reduce((sum, store) => sum + store.reviewCount, 0)
                  .toLocaleString()}
              </h3>
              <p className="text-gray-600">تقييم وتعليق</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {stores
                  .reduce((sum, store) => sum + (store.totalSales || 0), 0)
                  .toLocaleString()}
                +
              </h3>
              <p className="text-gray-600">طلب مكتمل</p>
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary"
                >
                  جميع المتاجر
                </TabsTrigger>
                <TabsTrigger
                  value="featured"
                  className="data-[state=active]:bg-primary"
                >
                  <Award className="h-4 w-4 ml-1" />
                  المميزة
                </TabsTrigger>
                <TabsTrigger
                  value="verified"
                  className="data-[state=active]:bg-primary"
                >
                  <ShieldCheck className="h-4 w-4 ml-1" />
                  الموثقة
                </TabsTrigger>
                <TabsTrigger
                  value="new"
                  className="data-[state=active]:bg-primary"
                >
                  <Star className="h-4 w-4 ml-1" />
                  جديدة
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        ترتيب حسب: {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Tabs>

          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={`${selectedCategory === null ? "bg-primary text-white" : ""}`}
            >
              الكل
            </Button>
            {categories.slice(1).map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() =>
                  setSelectedCategory(
                    category.id === "all" ? null : category.id,
                  )
                }
                className={`${selectedCategory === category.id ? "bg-primary text-white" : ""}`}
              >
                <category.icon className="h-4 w-4 ml-1" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {filteredStores.length === 0 ? (
          <div className="text-center py-16">
            <StoreIcon className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              لا توجد متاجر
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? `لم يتم العثور على متاجر تطابق "${searchTerm}"`
                : "لا توجد متاجر متاحة حالياً"}
            </p>
            {searchTerm && (
              <Button onClick={() => setSearchTerm("")} variant="outline">
                مسح البحث
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              عرض <span className="font-semibold">{filteredStores.length}</span>{" "}
              من <span className="font-semibold">{stores.length}</span> متجر
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store) => (
                <Card
                  key={store.id}
                  className="hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group"
                >
                  <div className="relative h-48 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      {store.isVerified && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                          <ShieldCheck className="h-3 w-3 ml-1" />
                          موثّق
                        </Badge>
                      )}
                      {store.totalSales && store.totalSales > 10000 && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100">
                          <TrendingUp className="h-3 w-3 ml-1" />
                          الأكثر مبيعاً
                        </Badge>
                      )}
                    </div>

                    <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2">
                      <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                        <StoreIcon className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pt-12">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-center gap-2">
                          {store.name}
                          {store.isVerified && (
                            <ShieldCheck className="h-4 w-4 text-green-500" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {store.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-gray-900">
                          {store.productCount}
                        </div>
                        <div className="text-gray-500 text-xs">منتج</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900 flex items-center justify-center">
                          <Star className="h-3 w-3 text-yellow-500 fill-current ml-1" />
                          {store.averageRating}
                        </div>
                        <div className="text-gray-500 text-xs">تقييم</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">
                          {store.reviewCount.toLocaleString()}
                        </div>
                        <div className="text-gray-500 text-xs">مراجعة</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {store.category}
                      </Badge>
                      {store.shippingEnabled && (
                        <Badge variant="outline" className="text-xs">
                          <Truck className="h-3 w-3 ml-1" />
                          شحن متاح
                        </Badge>
                      )}
                      {store.paymentMethods &&
                        store.paymentMethods.includes("الدفع عند الاستلام") && (
                          <Badge variant="outline" className="text-xs">
                            <CreditCard className="h-3 w-3 ml-1" />
                            دفع عند الاستلام
                          </Badge>
                        )}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-primary font-medium">
                          {store.subdomain}.store.com
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          منذ{" "}
                          {Math.floor(
                            (new Date().getTime() -
                              new Date(store.createdAt).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          يوم
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleStoreSelect(store)}
                        className="flex-1 bg-gradient-to-r from-primary to-brand hover:opacity-90"
                      >
                        <ShoppingBag className="h-4 w-4 ml-2" />
                        دخول المتجر
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuickView(store)}
                        title="معاينة سريعة"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        title="أضف إلى المفضلة"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      {!userData && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handleContinueAsGuest(store)}
                        >
                          التسوق كضيف
                        </Button>
                      )}
                    </div>

                    {store.totalSales && store.totalSales > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">تم بيع</span>
                          <span className="font-semibold text-primary">
                            {store.totalSales.toLocaleString()} منتج
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        <div className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-brand/10 rounded-2xl text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              هل أنت تاجر وتريد عرض منتجاتك هنا؟
            </h3>
            <p className="text-gray-600 mb-6">
              انضم إلى منصتنا واجعل متجرك الإلكتروني أمام آلاف العملاء المحتملين
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/signup")}
                size="lg"
                className="bg-gradient-to-r from-primary to-brand hover:opacity-90"
              >
                <StoreIcon className="h-5 w-5 ml-2" />
                إنشاء متجر جديد
              </Button>
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                size="lg"
              >
                <UserPlus className="h-5 w-5 ml-2" />
                تسجيل الدخول كتاجر
              </Button>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span>متاجر موثقة وآمنة</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Truck className="h-4 w-4 text-blue-500" />
                <span>خيارات شحن متنوعة</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-500" />
                <span>دفع آمن ومتعدد</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// (Moved icon components to top of file)
