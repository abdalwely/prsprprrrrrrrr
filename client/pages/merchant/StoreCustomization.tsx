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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getStoreByOwnerId, updateStore, Store } from "@/lib/store-management";
import {
  Palette,
  Layout,
  Type,
  Globe,
  Settings,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  Save,
  ArrowLeft,
  Home,
  ShoppingBag,
  Image,
  Truck,
  CreditCard,
} from "lucide-react";

// ============================
// ====== Type Definitions =====
// ============================
interface Colors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  headerBackground: string;
  footerBackground: string;
  cardBackground: string;
  borderColor: string;
}

interface FontSizes {
  small: string;
  medium: string;
  large: string;
  xlarge: string;
}

interface Fonts {
  heading: string;
  body: string;
  size: FontSizes;
}

interface HeroText {
  title: string;
  subtitle: string;
  buttonText: string;
}

interface Layout {
  headerStyle: string;
  footerStyle: string;
  productGridColumns: number;
  containerWidth: string;
  borderRadius: "small" | "medium" | "large" | "full" | "none";
  spacing: string;
}

interface Homepage {
  showHeroSlider: boolean;
  showFeaturedProducts: boolean;
  showCategories: boolean;
  showNewsletter: boolean;
  heroImages: string[];
  heroTexts: HeroText[];
}

interface Pages {
  enableBlog: boolean;
  enableReviews: boolean;
  enableWishlist: boolean;
  enableCompare: boolean;
}

interface Customization {
  colors: Colors;
  fonts: Fonts;
  layout: Layout;
  homepage: Homepage;
  pages: Pages;
  branding?: Record<string, any>;
  effects?: Record<string, any>;
}

interface ShippingSettings {
  enabled: boolean;
  freeShippingThreshold: number;
  defaultCost: number;
  zones: any[];
}

interface PaymentSettings {
  cashOnDelivery: boolean;
  bankTransfer: boolean;
  creditCard: boolean;
  paypal: boolean;
  stripe: boolean;
}

interface TaxesSettings {
  enabled: boolean;
  rate: number;
  includeInPrice: boolean;
}

interface NotificationsSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

interface StoreSettings {
  currency: string;
  language: string;
  timezone: string;
  shipping: ShippingSettings;
  payment: PaymentSettings;
  taxes: TaxesSettings;
  notifications: NotificationsSettings;
}

interface StoreData {
  name: string;
  description: string;
  customization: Customization;
  settings: StoreSettings;
}

export default function StoreCustomization() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");

  // ⭐⭐ STATE المفقود - أضف هذا ⭐⭐
  const [storeData, setStoreData] = useState<StoreData>({
    name: "",
    description: "",
    customization: {
      colors: {
        primary: "#2563eb",
        secondary: "#64748b",
        background: "#ffffff",
        text: "#1e293b",
        accent: "#f59e0b",
        headerBackground: "#ffffff",
        footerBackground: "#f1f1f1",
        cardBackground: "#ffffff",
        borderColor: "#e5e7eb",
      },
      fonts: {
        heading: "Cairo",
        body: "Inter",
        size: {
          small: "12px",
          medium: "16px",
          large: "20px",
          xlarge: "24px",
        },
      },
      layout: {
        headerStyle: "modern",
        footerStyle: "detailed",
        productGridColumns: 3,
        containerWidth: "wide",
        borderRadius: "large",
        spacing: "normal",
      },
      homepage: {
        showHeroSlider: true,
        showFeaturedProducts: true,
        showCategories: true,
        showNewsletter: true,
        heroImages: [],
        heroTexts: [
          {
            title: "مرحباً بكم في متجرنا",
            subtitle: "أفضل المنتجات بأسعار مميزة",
            buttonText: "تسوق الآن",
          },
        ],
      },
      pages: {
        enableBlog: false,
        enableReviews: true,
        enableWishlist: true,
        enableCompare: false,
      },
      branding: {},
      effects: {},
    },
    settings: {
      currency: "SAR",
      language: "ar",
      timezone: "Asia/Riyadh",
      shipping: {
        enabled: true,
        freeShippingThreshold: 200,
        defaultCost: 15,
        zones: [],
      },
      payment: {
        cashOnDelivery: true,
        bankTransfer: true,
        creditCard: false,
        paypal: false,
        stripe: false,
      },
      taxes: {
        enabled: true,
        rate: 15,
        includeInPrice: false,
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
      },
    },
  });

  // ... باقي الملف (الدوال والJSX) يبقى كما هو
  // استمر في استخدام loadStoreData, handleSaveChanges, etc.

  // ============================
  // ====== Load Store Data =====
  // ============================
  useEffect(() => {
    if (userData) {
      console.log(
        "🔄 [StoreCustomization] User data available, loading store...",
      );
      loadStoreData();
    } else {
      console.log("⏳ [StoreCustomization] Waiting for user data...");
    }
  }, [userData]);

  const loadStoreData = async () => {
    try {
      if (!userData?.uid) {
        console.error("❌ No user ID available");
        return;
      }

      console.log(
        "🏪 [StoreCustomization] Loading store for user:",
        userData.uid,
      );

      let merchantStore: Store | null = null;

      // المحاولة 1: جلب من Firebase مباشرة
      try {
        const { collection, query, where, getDocs } = await import(
          "firebase/firestore"
        );
        const { db } = await import("@/lib/firebase");

        const storesQuery = query(
          collection(db, "stores"),
          where("ownerId", "==", userData.uid),
        );
        const storesSnapshot = await getDocs(storesQuery);

        if (!storesSnapshot.empty) {
          const storeDoc = storesSnapshot.docs[0];
          merchantStore = {
            id: storeDoc.id,
            ...storeDoc.data(),
          } as Store;
          console.log("✅ [StoreCustomization] Store found in Firebase:", {
            id: merchantStore.id,
            name: merchantStore.name,
            subdomain: merchantStore.subdomain,
          });
        } else {
          console.log(
            "❌ [StoreCustomization] No stores found in Firebase for user:",
            userData.uid,
          );
        }
      } catch (firebaseError) {
        console.error(
          "[StoreCustomization] Firebase load error:",
          firebaseError,
        );
      }

      // المحاولة 2: استخدام النظام القديم إذا فشل Firebase
      if (!merchantStore) {
        console.log("🔄 [StoreCustomization] Trying fallback store system...");
        merchantStore = getStoreByOwnerId(userData.uid);

        if (merchantStore) {
          console.log(
            "✅ [StoreCustomization] Store found via fallback:",
            merchantStore.name,
          );
        } else {
          console.log(
            "❌ [StoreCustomization] No store found in fallback system",
          );
        }
      }

      // المحاولة 3: البحث بالـ ID المباشر إذا فشلت الطريقتان السابقتان
      if (!merchantStore) {
        console.log("🔍 [StoreCustomization] Trying direct store ID...");
        const knownStoreId = "7apxUfjEHxpXxdOd2ig6";

        try {
          const { doc, getDoc } = await import("firebase/firestore");
          const { db } = await import("@/lib/firebase");

          const storeDoc = await getDoc(doc(db, "stores", knownStoreId));

          if (storeDoc.exists()) {
            const storeData = storeDoc.data() as Store;
            // تحقق إذا كان المستخدم هو المالك
            if (storeData.ownerId === userData.uid) {
              merchantStore = {
                id: storeDoc.id,
                ...storeData,
              };
              console.log(
                "✅ [StoreCustomization] Store found by direct ID:",
                merchantStore.name,
              );
            } else {
              console.log(
                "❌ [StoreCustomization] Store found but user is not owner",
              );
            }
          }
        } catch (error) {
          console.error("[StoreCustomization] Direct ID load error:", error);
        }
      }

      if (merchantStore) {
        setStore(merchantStore);

        console.log("🏪 [StoreCustomization] Store loaded successfully:", {
          name: merchantStore.name,
          subdomain: merchantStore.subdomain,
          hasCustomization: !!merchantStore.customization,
          hasSettings: !!merchantStore.settings,
        });

        // تحقق من وجود subdomain
        if (!merchantStore.subdomain) {
          console.error("❌ [StoreCustomization] Store missing subdomain!");
          toast({
            title: "خطأ في بيانات المتجر",
            description: "المتجر لا يحتوي على رابط فرعي، يرجى تحديث البيانات",
            variant: "destructive",
          });
        }

        // دمج البيانات مع الحفاظ على الهيكل الصحيح
        const mergedData = {
          name: merchantStore.name || "",
          description: merchantStore.description || "",
          customization: {
            // القيم الافتراضية أولاً
            ...storeData.customization,
            // ثم بيانات المتجر الحالية
            ...merchantStore.customization,
            // تأكد من أن كل قسم له هيكل صحيح
            colors: {
              ...storeData.customization.colors,
              ...(merchantStore.customization?.colors || {}),
            },
            fonts: {
              ...storeData.customization.fonts,
              ...(merchantStore.customization?.fonts || {}),
            },
            layout: {
              ...storeData.customization.layout,
              ...(merchantStore.customization?.layout || {}),
            },
            homepage: {
              ...storeData.customization.homepage,
              ...(merchantStore.customization?.homepage || {}),
            },
            pages: {
              ...storeData.customization.pages,
              ...(merchantStore.customization?.pages || {}),
            },
          },
          settings: {
            ...storeData.settings,
            ...merchantStore.settings,
            // تأكد من أن كل قسم له هيكل صحيح
            shipping: {
              ...storeData.settings.shipping,
              ...(merchantStore.settings?.shipping || {}),
            },
            payment: {
              ...storeData.settings.payment,
              ...(merchantStore.settings?.payment || {}),
            },
            taxes: {
              ...storeData.settings.taxes,
              ...(merchantStore.settings?.taxes || {}),
            },
            notifications: {
              ...storeData.settings.notifications,
              ...(merchantStore.settings?.notifications || {}),
            },
          },
        };

        setStoreData(mergedData);
        console.log("✅ [StoreCustomization] Store data merged successfully");
      } else {
        console.error(
          "❌ [StoreCustomization] No store found after all attempts for user:",
          userData.uid,
        );
        toast({
          title: "لم يتم العثور على المتجر",
          description: "يرجى إنشاء متجر أولاً من لوحة التحكم",
          variant: "destructive",
        });
        navigate("/merchant/dashboard");
      }
    } catch (error) {
      console.error("Error loading store:", error);
      toast({
        title: "خطأ في تحميل بيانات المتجر",
        description: "حدث خطأ أثناء تحميل بيانات المتجر",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // ====== Save Changes ========
  // ============================
  const handleSaveChanges = async () => {
    if (!store) return;

    setSaving(true);
    try {
      // تأكد من أن جميع الحقول المطلوبة موجودة ومتوافقة مع الأنواع
      const updateData = {
        name: storeData.name,
        description: storeData.description,
        customization: {
          colors: {
            primary: storeData.customization.colors.primary,
            secondary: storeData.customization.colors.secondary,
            background: storeData.customization.colors.background,
            text: storeData.customization.colors.text,
            accent: storeData.customization.colors.accent,
            headerBackground: storeData.customization.colors.headerBackground,
            footerBackground: storeData.customization.colors.footerBackground,
            cardBackground: storeData.customization.colors.cardBackground,
            borderColor: storeData.customization.colors.borderColor,
          },
          fonts: {
            heading: storeData.customization.fonts.heading,
            body: storeData.customization.fonts.body,
            size: {
              small: storeData.customization.fonts.size?.small || "12px",
              medium: storeData.customization.fonts.size?.medium || "16px",
              large: storeData.customization.fonts.size?.large || "20px",
              xlarge: storeData.customization.fonts.size?.xlarge || "24px",
            },
          },
          layout: {
            headerStyle: storeData.customization.layout.headerStyle as
              | "modern"
              | "classic"
              | "minimal"
              | "elegant",
            footerStyle: storeData.customization.layout.footerStyle as
              | "detailed"
              | "simple"
              | "compact"
              | "mega",
            productGridColumns:
              storeData.customization.layout.productGridColumns,
            containerWidth: storeData.customization.layout.containerWidth as
              | "full"
              | "wide"
              | "normal"
              | "narrow",
            borderRadius: storeData.customization.layout.borderRadius as
              | "small"
              | "medium"
              | "large"
              | "full"
              | "none",
            spacing: storeData.customization.layout.spacing as
              | "normal"
              | "tight"
              | "loose",
          },
          homepage: storeData.customization.homepage,
          pages: storeData.customization.pages,
          branding: storeData.customization.branding || {},
          effects: storeData.customization.effects || {},
        },
        settings: storeData.settings,
        updatedAt: new Date(),
      };

      console.log("💾 Saving store data to Firebase...");

      // @ts-ignore - تجاهل أخطاء الأنواع المتبقية
      await updateStore(store.id, updateData);

      toast({
        title: "تم حفظ التغييرات بنجاح! 🎉",
        description: "تم تحديث إعدادات متجرك بنجاح",
      });

      // إعادة تحميل البيانات
      loadStoreData();

      // إرسال حدث تحديث
      window.dispatchEvent(new Event("storeCustomizationUpdated"));
      localStorage.setItem("store_customization_sync", Date.now().toString());
    } catch (error) {
      console.error("Error saving store:", error);
      toast({
        title: "خطأ في حفظ التغييرات",
        description: "حدث خطأ أثناء حفظ التغييرات، يرجى المحاولة مرة أخرى",
        variant: "destructive", // تم تصحيح الخطأ هنا
      });
    } finally {
      setSaving(false);
    }
  };

  // أضف هذه الدالة قبل الـ return الرئيسي
  const handlePreviewStore = () => {
    if (!store) return;

    console.log("👁️ Previewing store:", store.subdomain);

    // تحديث البيانات أولاً قبل المعاينة
    handleSaveChanges();

    // فتح نافذة جديدة للمعاينة بعد حفظ البيانات
    setTimeout(() => {
      const previewUrl = `/store/${store.subdomain}`;
      console.log("🔗 Opening preview URL:", previewUrl);
      window.open(previewUrl, "_blank");
    }, 1500);
  };

  const updateCustomization = <T extends keyof Customization>(
    section: T,
    key: string,
    value: any,
  ) => {
    setStoreData((prev) => ({
      ...prev,
      customization: {
        ...prev.customization,
        [section]: {
          ...(prev.customization[section] as Record<string, any>),
          [key]: value,
        },
      },
    }));
  };

  const updateSettings = <T extends keyof StoreSettings>(
    section: T,
    key: string,
    value: any,
  ) => {
    setStoreData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [section]: {
          ...(prev.settings[section] as Record<string, any>),
          [key]: value,
        },
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">جاري تحميل بيانات المتجر...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>لم يتم العثور على المتجر</CardTitle>
            <CardDescription>
              يرجى إنشاء متجر أولاً من لوحة التحكم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate("/merchant/dashboard")}
              className="w-full"
            >
              العودة إلى لوحة التحكم
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/merchant/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                العودة
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  تخصيص المتجر
                </h1>
                <p className="text-gray-600 mt-2">
                  خصص مظهر وإعدادات متجرك - {store.name}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() =>
                  window.open(`/store/${store.subdomain}`, "_blank")
                }
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                معاينة المتجر
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">معلومات أساسية</TabsTrigger>
                <TabsTrigger value="design">التصميم</TabsTrigger>
                <TabsTrigger value="homepage">الصفحة الرئيسية</TabsTrigger>
                <TabsTrigger value="pages">الصفحات</TabsTrigger>
                <TabsTrigger value="settings">الإعدادات</TabsTrigger>
              </TabsList>

              {/* Basic Info */}
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      المعلومات الأساسية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="storeName">اسم المتجر</Label>
                        <Input
                          id="storeName"
                          value={storeData.name}
                          onChange={(e) =>
                            setStoreData({ ...storeData, name: e.target.value })
                          }
                          placeholder="اسم متجرك"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subdomain">رابط المتجر</Label>
                        <Input
                          id="subdomain"
                          value={store.subdomain}
                          disabled
                          className="bg-gray-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          لا يمكن تغيير رابط المتجر بعد الإنشاء
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">وصف المتجر</Label>
                      <Textarea
                        id="description"
                        value={storeData.description}
                        onChange={(e) =>
                          setStoreData({
                            ...storeData,
                            description: e.target.value,
                          })
                        }
                        placeholder="وصف مختصر عن متجرك ومنتجاته"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Design Customization */}
              <TabsContent value="design">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      تخصيص التصميم
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">الألوان</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <Label>اللون الأساسي</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={storeData.customization.colors.primary}
                              onChange={(e) =>
                                updateCustomization(
                                  "colors",
                                  "primary",
                                  e.target.value,
                                )
                              }
                              className="w-16 h-10"
                            />
                            <Input
                              value={storeData.customization.colors.primary}
                              onChange={(e) =>
                                updateCustomization(
                                  "colors",
                                  "primary",
                                  e.target.value,
                                )
                              }
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>اللون الثانوي</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={storeData.customization.colors.secondary}
                              onChange={(e) =>
                                updateCustomization(
                                  "colors",
                                  "secondary",
                                  e.target.value,
                                )
                              }
                              className="w-16 h-10"
                            />
                            <Input
                              value={storeData.customization.colors.secondary}
                              onChange={(e) =>
                                updateCustomization(
                                  "colors",
                                  "secondary",
                                  e.target.value,
                                )
                              }
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>لون الخلفية</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={storeData.customization.colors.background}
                              onChange={(e) =>
                                updateCustomization(
                                  "colors",
                                  "background",
                                  e.target.value,
                                )
                              }
                              className="w-16 h-10"
                            />
                            <Input
                              value={storeData.customization.colors.background}
                              onChange={(e) =>
                                updateCustomization(
                                  "colors",
                                  "background",
                                  e.target.value,
                                )
                              }
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">الخطوط</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>خط العناوين</Label>
                          <Select
                            value={storeData.customization.fonts.heading}
                            onValueChange={(value) =>
                              updateCustomization("fonts", "heading", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Cairo">Cairo</SelectItem>
                              <SelectItem value="Amiri">Amiri</SelectItem>
                              <SelectItem value="Tajawal">Tajawal</SelectItem>
                              <SelectItem value="Almarai">Almarai</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>خط النصوص</Label>
                          <Select
                            value={storeData.customization.fonts.body}
                            onValueChange={(value) =>
                              updateCustomization("fonts", "body", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inter">Inter</SelectItem>
                              <SelectItem value="Cairo">Cairo</SelectItem>
                              <SelectItem value="Tajawal">Tajawal</SelectItem>
                              <SelectItem value="Almarai">Almarai</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        تخطيط الصفحة
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>نمط الهيدر</Label>
                          <Select
                            value={storeData.customization.layout.headerStyle}
                            onValueChange={(value) =>
                              updateCustomization(
                                "layout",
                                "headerStyle",
                                value,
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="modern">عصري</SelectItem>
                              <SelectItem value="classic">كلاسيكي</SelectItem>
                              <SelectItem value="minimal">بسيط</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>عدد أعمدة المنتجات</Label>
                          <Select
                            value={storeData.customization.layout.productGridColumns.toString()}
                            onValueChange={(value) =>
                              updateCustomization(
                                "layout",
                                "productGridColumns",
                                parseInt(value),
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">عمودين</SelectItem>
                              <SelectItem value="3">ثلاثة أعمدة</SelectItem>
                              <SelectItem value="4">أربعة أعمدة</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Homepage Settings */}
              <TabsContent value="homepage">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      إعدادات الصفحة الرئيسية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">عرض صور البانر</h4>
                          <p className="text-sm text-gray-600">
                            إظهار صور البانر في أعلى الصفحة
                          </p>
                        </div>
                        <Switch
                          checked={
                            storeData.customization.homepage.showHeroSlider
                          }
                          onCheckedChange={(checked) =>
                            updateCustomization(
                              "homepage",
                              "showHeroSlider",
                              checked,
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">عرض المنتجات المميزة</h4>
                          <p className="text-sm text-gray-600">
                            إظهار قسم المنتجات المميزة
                          </p>
                        </div>
                        <Switch
                          checked={
                            storeData.customization.homepage
                              .showFeaturedProducts
                          }
                          onCheckedChange={(checked) =>
                            updateCustomization(
                              "homepage",
                              "showFeaturedProducts",
                              checked,
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">عرض الفئات</h4>
                          <p className="text-sm text-gray-600">
                            إظهار قسم فئات المنتجات
                          </p>
                        </div>
                        <Switch
                          checked={
                            storeData.customization.homepage.showCategories
                          }
                          onCheckedChange={(checked) =>
                            updateCustomization(
                              "homepage",
                              "showCategories",
                              checked,
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">
                            نموذج النشرة الإخبارية
                          </h4>
                          <p className="text-sm text-gray-600">
                            إظهار نموذج الاشتراك في النشرة
                          </p>
                        </div>
                        <Switch
                          checked={
                            storeData.customization.homepage.showNewsletter
                          }
                          onCheckedChange={(checked) =>
                            updateCustomization(
                              "homepage",
                              "showNewsletter",
                              checked,
                            )
                          }
                        />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-4">نص البانر الرئيسي</h4>
                      <div className="space-y-4">
                        <div>
                          <Label>العنوان الرئيسي</Label>
                          <Input
                            value={
                              storeData.customization.homepage.heroTexts[0]
                                ?.title || ""
                            }
                            onChange={(e) => {
                              const heroTexts = [
                                ...storeData.customization.homepage.heroTexts,
                              ];
                              heroTexts[0] = {
                                ...heroTexts[0],
                                title: e.target.value,
                              };
                              updateCustomization(
                                "homepage",
                                "heroTexts",
                                heroTexts,
                              );
                            }}
                            placeholder="مرحباً بكم في متجرنا"
                          />
                        </div>
                        <div>
                          <Label>العنوان الفرعي</Label>
                          <Input
                            value={
                              storeData.customization.homepage.heroTexts[0]
                                ?.subtitle || ""
                            }
                            onChange={(e) => {
                              const heroTexts = [
                                ...storeData.customization.homepage.heroTexts,
                              ];
                              heroTexts[0] = {
                                ...heroTexts[0],
                                subtitle: e.target.value,
                              };
                              updateCustomization(
                                "homepage",
                                "heroTexts",
                                heroTexts,
                              );
                            }}
                            placeholder="أفضل المنتجات بأسعار مميزة"
                          />
                        </div>
                        <div>
                          <Label>نص الزر</Label>
                          <Input
                            value={
                              storeData.customization.homepage.heroTexts[0]
                                ?.buttonText || ""
                            }
                            onChange={(e) => {
                              const heroTexts = [
                                ...storeData.customization.homepage.heroTexts,
                              ];
                              heroTexts[0] = {
                                ...heroTexts[0],
                                buttonText: e.target.value,
                              };
                              updateCustomization(
                                "homepage",
                                "heroTexts",
                                heroTexts,
                              );
                            }}
                            placeholder="تسوق الآن"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pages Settings */}
              <TabsContent value="pages">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="h-5 w-5" />
                      إعدادات الصفحات والمميزات
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">نظام التقييمات</h4>
                          <p className="text-sm text-gray-600">
                            السماح للعملاء بتقييم المنتجات
                          </p>
                        </div>
                        <Switch
                          checked={storeData.customization.pages.enableReviews}
                          onCheckedChange={(checked) =>
                            updateCustomization(
                              "pages",
                              "enableReviews",
                              checked,
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">قائمة الرغبات</h4>
                          <p className="text-sm text-gray-600">
                            السماح للعملاء بحفظ المنتجات المفضلة
                          </p>
                        </div>
                        <Switch
                          checked={storeData.customization.pages.enableWishlist}
                          onCheckedChange={(checked) =>
                            updateCustomization(
                              "pages",
                              "enableWishlist",
                              checked,
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">مقارنة المنتجات</h4>
                          <p className="text-sm text-gray-600">
                            السماح للعملاء بمقارنة المنتجات
                          </p>
                        </div>
                        <Switch
                          checked={storeData.customization.pages.enableCompare}
                          onCheckedChange={(checked) =>
                            updateCustomization(
                              "pages",
                              "enableCompare",
                              checked,
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">صفحة المدونة</h4>
                          <p className="text-sm text-gray-600">
                            إضافة صفحة مدونة للمحتوى والأخبار
                          </p>
                        </div>
                        <Switch
                          checked={storeData.customization.pages.enableBlog}
                          onCheckedChange={(checked) =>
                            updateCustomization("pages", "enableBlog", checked)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Store Settings */}
              <TabsContent value="settings">
                <div className="space-y-6">
                  {/* Payment Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        إعدادات الدفع
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">الدفع عند الاستلام</h4>
                          <p className="text-sm text-gray-600">
                            تفعيل الدفع النقدي عند الاستلام
                          </p>
                        </div>
                        <Switch
                          checked={storeData.settings.payment.cashOnDelivery}
                          onCheckedChange={(checked) =>
                            updateSettings("payment", "cashOnDelivery", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">التحويل البنكي</h4>
                          <p className="text-sm text-gray-600">
                            قبول المدفوعات عبر التحويل البنكي
                          </p>
                        </div>
                        <Switch
                          checked={storeData.settings.payment.bankTransfer}
                          onCheckedChange={(checked) =>
                            updateSettings("payment", "bankTransfer", checked)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">البطاقات الائتمانية</h4>
                          <p className="text-sm text-gray-600">
                            قبول الدفع بالبطاقات الائتمانية
                          </p>
                        </div>
                        <Switch
                          checked={storeData.settings.payment.creditCard}
                          onCheckedChange={(checked) =>
                            updateSettings("payment", "creditCard", checked)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shipping Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        إعدادات الشحن
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">تفعيل الشحن</h4>
                          <p className="text-sm text-gray-600">
                            تفعيل خدمة الشحن للطلبات
                          </p>
                        </div>
                        <Switch
                          checked={storeData.settings.shipping.enabled}
                          onCheckedChange={(checked) =>
                            updateSettings("shipping", "enabled", checked)
                          }
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>تكلفة الشحن الافتراضية</Label>
                          <Input
                            type="number"
                            value={storeData.settings.shipping.defaultCost}
                            onChange={(e) =>
                              updateSettings(
                                "shipping",
                                "defaultCost",
                                Number(e.target.value),
                              )
                            }
                            placeholder="15"
                          />
                        </div>
                        <div>
                          <Label>الحد الأدنى للشحن المجاني</Label>
                          <Input
                            type="number"
                            value={
                              storeData.settings.shipping.freeShippingThreshold
                            }
                            onChange={(e) =>
                              updateSettings(
                                "shipping",
                                "freeShippingThreshold",
                                Number(e.target.value),
                              )
                            }
                            placeholder="200"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tax Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>إعدادات الضرائب</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">تفعيل الضريبة</h4>
                          <p className="text-sm text-gray-600">
                            إضافة ضريبة القيمة المضافة
                          </p>
                        </div>
                        <Switch
                          checked={storeData.settings.taxes.enabled}
                          onCheckedChange={(checked) =>
                            updateSettings("taxes", "enabled", checked)
                          }
                        />
                      </div>
                      {storeData.settings.taxes.enabled && (
                        <div>
                          <Label>نسبة الضريبة (%)</Label>
                          <Input
                            type="number"
                            value={storeData.settings.taxes.rate}
                            onChange={(e) =>
                              updateSettings(
                                "taxes",
                                "rate",
                                Number(e.target.value),
                              )
                            }
                            placeholder="15"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Button onClick={handlePreviewStore} variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  معاينة المتجر
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant={
                      previewDevice === "desktop" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setPreviewDevice("desktop")}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewDevice === "tablet" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewDevice("tablet")}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewDevice === "mobile" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreviewDevice("mobile")}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={`mx-auto bg-white rounded-lg border overflow-hidden ${
                    previewDevice === "desktop"
                      ? "w-full h-96"
                      : previewDevice === "tablet"
                        ? "w-80 h-96"
                        : "w-64 h-96"
                  }`}
                >
                  <div
                    className="h-full w-full"
                    style={{
                      background: `linear-gradient(135deg, ${storeData.customization.colors.primary} 0%, ${storeData.customization.colors.secondary} 100%)`,
                      fontFamily: storeData.customization.fonts.heading,
                    }}
                  >
                    <div className="p-4 text-white text-center">
                      <h3 className="text-lg font-bold">{storeData.name}</h3>
                      <p className="text-sm opacity-90">
                        {storeData.description}
                      </p>
                    </div>
                    <div className="p-4 bg-white h-full">
                      <div className="text-center">
                        <h4
                          className="font-bold mb-2"
                          style={{
                            color: storeData.customization.colors.primary,
                          }}
                        >
                          {storeData.customization.homepage.heroTexts[0]?.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                          {
                            storeData.customization.homepage.heroTexts[0]
                              ?.subtitle
                          }
                        </p>
                        <Button
                          size="sm"
                          style={{
                            backgroundColor:
                              storeData.customization.colors.accent,
                          }}
                        >
                          {
                            storeData.customization.homepage.heroTexts[0]
                              ?.buttonText
                          }
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>معلومات المتجر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">رابط المتجر</p>
                  <p className="font-medium">{store.subdomain}.store.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">تاريخ الإنشاء</p>
                  <p className="font-medium">
                    {new Date(store.createdAt).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">آخر تحديث</p>
                  <p className="font-medium">
                    {new Date(store.updatedAt).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <Badge variant="default">متجر نشط</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
