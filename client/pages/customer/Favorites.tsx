import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Heart, ShoppingCart, Search, X } from "lucide-react";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getCurrentStoreId } from "@/lib/firebase";
import { Favorite, Product } from "@/lib/src"; // ✅ الآن متطابق
import { favoritesService, productService } from "@/lib/src";

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [storeId, setStoreId] = useState<string | null>(null);

  const userData = getCurrentCustomer();

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);

        const currentStoreId = await getCurrentStoreId();
        setStoreId(currentStoreId);

        if (!currentStoreId) {
          toast({
            title: "لم يتم تحديد متجر",
            description: "يجب زيارة متجر أولاً",
            variant: "destructive",
          });
          navigate("/customer/stores");
          return;
        }

        const customerIdentifier = await getCustomerIdentifier(currentStoreId);

        if (!customerIdentifier) {
          toast({
            title: "تعذر تحديد الهوية",
            description: "يجب تسجيل الدخول أو زيارة المتجر كضيف",
            variant: "destructive",
          });
          return;
        }

        const favs = await favoritesService.getFavorites(
          customerIdentifier,
          currentStoreId,
        );
        setFavorites(favs);

        const productIds = favs.map((fav) => fav.productId);
        const productsData: Record<string, Product> = {};

        for (const productId of productIds) {
          try {
            const product = await productService.getById(productId);
            if (product) {
              // ✅ الآن الأنواع متطابقة
              productsData[productId] = product;
            }
          } catch (error) {
            console.warn(`⚠️ خطأ في جلب المنتج ${productId}:`, error);
          }
        }

        setProducts(productsData);
      } catch (error) {
        console.error("❌ خطأ في تحميل المفضلات:", error);
        toast({
          title: "خطأ في تحميل المفضلات",
          description: "تعذر تحميل قائمة المفضلات",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [navigate, toast]);

  const getCustomerIdentifier = async (
    storeId: string,
  ): Promise<string | null> => {
    if (!storeId) return null;

    if (userData?.uid) {
      return userData.uid;
    }

    const storageKey = `visitor_${storeId}`;
    const visitorId = localStorage.getItem(storageKey);

    if (visitorId) {
      return `guest_${visitorId}`;
    }

    return null;
  };

  const handleRemoveFavorite = async (
    favoriteId: string,
    productId: string,
  ) => {
    try {
      await favoritesService.removeFavorite(favoriteId);
      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
      toast({
        title: "تمت الإزالة",
        description: "تم إزالة المنتج من المفضلة",
      });
    } catch (error) {
      console.error("❌ خطأ في إزالة المفضلة:", error);
      toast({
        title: "خطأ في الإزالة",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!storeId) {
      toast({
        title: "لم يتم تحديد متجر",
        variant: "destructive",
      });
      return;
    }

    try {
      // ✅ الوصول للكمية بطريقة صحيحة
      const product = products[productId];
      const quantity = product.inventory?.quantity || 0;

      if (quantity <= 0) {
        toast({
          title: "نفذت الكمية",
          description: "المنتج غير متوفر حالياً",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "تمت الإضافة",
        description: "تم إضافة المنتج إلى سلة التسوق",
      });
    } catch (error) {
      console.error("❌ خطأ في إضافة المنتج للسلة:", error);
      toast({
        title: "خطأ في الإضافة",
        description: "تعذر إضافة المنتج إلى السلة",
        variant: "destructive",
      });
    }
  };

  const filteredFavorites = favorites.filter((fav) => {
    if (!searchTerm) return true;

    const product = products[fav.productId];
    if (!product) return false;

    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.shortDescription
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      ) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleRegister = () => {
    navigate("/customer/auth");
  };

  const handleGoToStore = () => {
    if (storeId) {
      navigate(`/store/${storeId}`);
    } else {
      navigate("/customer/stores");
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
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">المفضلة</h1>
            <p className="text-muted-foreground">
              منتجاتك المفضلة{" "}
              {favorites.length > 0 && `(${favorites.length} منتج)`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {!userData && (
              <Button onClick={handleRegister} variant="outline">
                تسجيل حساب لحفظ المفضلة
              </Button>
            )}

            <Button onClick={handleGoToStore}>
              <ShoppingCart className="ml-2 h-4 w-4" />
              متابعة التسوق
            </Button>
          </div>
        </div>

        {/* شريط البحث */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في المفضلة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-3 top-2 h-6 w-6 p-0"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {filteredFavorites.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? "لا توجد نتائج" : "قائمة المفضلة فارغة"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? "لم يتم العثور على منتجات تطابق بحثك"
                  : "أضف منتجات إلى المفضلة لتظهر هنا"}
              </p>
              <Button onClick={handleGoToStore}>
                <ShoppingCart className="ml-2 h-4 w-4" />
                تصفح المتجر
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((fav) => {
              const product = products[fav.productId];

              if (!product) return null;

              // ✅ الحصول على الكمية بشكل صحيح
              const quantity = product.inventory?.quantity || 0;
              const isActive = product.status && quantity > 0;

              // ✅ حساب السعر مع الخصم إن وجد
              const finalPrice =
                product.discount?.isActive && product.discount.salePrice
                  ? product.discount.salePrice
                  : product.price;

              const originalPrice = product.comparePrice || product.price;

              return (
                <Card key={fav.id} className="overflow-hidden">
                  <div className="relative h-48 bg-gray-100">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="h-12 w-12 text-gray-300" />
                      </div>
                    )}

                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 left-2 h-8 w-8 p-0 rounded-full"
                      onClick={() => handleRemoveFavorite(fav.id, product.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    {!isActive && (
                      <Badge className="absolute top-2 right-2 bg-red-500">
                        غير متوفر
                      </Badge>
                    )}

                    {product.discount?.isActive && (
                      <Badge className="absolute bottom-2 right-2 bg-green-500">
                        خصم{" "}
                        {product.discount.type === "percentage"
                          ? `${product.discount.value}%`
                          : `${product.discount.value} ريال`}
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg truncate">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.shortDescription || product.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">
                        {finalPrice.toLocaleString()} ريال
                      </span>
                      {originalPrice > finalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          {originalPrice.toLocaleString()} ريال
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span
                        className={`font-medium ${quantity > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {quantity > 0 ? `متوفر (${quantity})` : "نفذت الكمية"}
                      </span>

                      {product.brand && (
                        <Badge variant="outline">{product.brand}</Badge>
                      )}
                    </div>

                    {product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Button
                      className="w-full"
                      disabled={!isActive}
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <ShoppingCart className="ml-2 h-4 w-4" />
                      {isActive ? "أضف إلى السلة" : "غير متوفر"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* معلومات للمستخدمين الضيوف */}
        {!userData && favorites.length > 0 && (
          <Card className="mt-8 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Heart className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-800 mb-2">
                    أنت تستخدم حساب ضيف
                  </h4>
                  <p className="text-amber-700 mb-4">
                    منتجاتك المفضلة مخزنة على هذا الجهاز فقط. سجل حساباً دائماً
                    لحفظها والوصول إليها من أي جهاز.
                  </p>
                  <Button
                    onClick={handleRegister}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    تسجيل حساب دائم
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Favorites;
