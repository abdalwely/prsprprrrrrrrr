import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  loginCustomer,
  registerCustomer,
  isCustomerLoggedIn,
} from "@/lib/customer-auth";
import { getCurrentStoreId } from "@/lib/src/firebase/firebase";
import { Loader2 } from "lucide-react";

interface StoreInfo {
  storeId: string;
  storeName: string;
  subdomain: string;
}

const CustomerAuth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // الحصول على storeId من الـ URL أو state
  const searchParams = new URLSearchParams(location.search);
  const storeIdFromUrl = searchParams.get("storeId");
  const returnUrl = searchParams.get("returnUrl") || "/customer/dashboard";

  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // حالة تسجيل الدخول
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // حالة التسجيل
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerFullName, setRegisterFullName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerCountry, setRegisterCountry] = useState("اليمن");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // تحميل معلومات المتجر
  useEffect(() => {
    const loadStoreInfo = async () => {
      try {
        // 1. حاول الحصول من الـ URL
        if (storeIdFromUrl) {
          // هنا يمكنك استدعاء API لجلب معلومات المتجر
          // هذا مثال افتراضي
          setStoreInfo({
            storeId: storeIdFromUrl,
            storeName: "متجر",
            subdomain: "store",
          });
          return;
        }

        // 2. حاول الحصول من localStorage
        const pendingStore = localStorage.getItem("pendingStoreInfo");
        if (pendingStore) {
          const storeData = JSON.parse(pendingStore);
          setStoreInfo({
            storeId: storeData.storeId || storeData.id,
            storeName: storeData.name || "متجر",
            subdomain: storeData.subdomain || "store",
          });
          return;
        }

        // 3. حاول الحصول من مسار الصفحة الحالي
        const currentStoreId = await getCurrentStoreId();
        if (currentStoreId) {
          setStoreInfo({
            storeId: currentStoreId,
            storeName: "متجرك",
            subdomain: window.location.pathname.split("/")[2] || "store",
          });
        }
      } catch (error) {
        console.error("❌ خطأ في تحميل معلومات المتجر:", error);
      }
    };

    loadStoreInfo();

    // التحقق إذا كان المستخدم مسجلاً مسبقاً
    if (isCustomerLoggedIn()) {
      navigate(returnUrl);
    }
  }, [storeIdFromUrl, returnUrl, navigate]);

  // معالجة تسجيل الدخول
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      toast({
        title: "الحقول مطلوبة",
        description: "الرجاء إدخال البريد الإلكتروني وكلمة المرور",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔄 محاولة تسجيل الدخول...");

      const loginResult = await loginCustomer(
        loginEmail,
        loginPassword,
        storeInfo?.storeId,
      );

      console.log("✅ تسجيل الدخول ناجح:", loginResult);

      toast({
        title: "تم تسجيل الدخول بنجاح!",
        description: "مرحباً بعودتك",
      });

      // الانتقال بعد 1 ثانية
      setTimeout(() => {
        navigate(returnUrl);
      }, 1000);
    } catch (error: any) {
      console.error("❌ خطأ في تسجيل الدخول:", error);

      toast({
        title: "فشل تسجيل الدخول",
        description: error.message || "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // معالجة التسجيل
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من صحة البيانات
    if (!registerEmail || !registerPassword || !registerFullName) {
      toast({
        title: "الحقول مطلوبة",
        description: "الرجاء إكمال جميع الحقول الإلزامية",
        variant: "destructive",
      });
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast({
        title: "كلمة المرور غير متطابقة",
        description: "تأكد من تطابق كلمتي المرور",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "الشروط والأحكام",
        description: "يجب الموافقة على الشروط والأحكام",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔄 إنشاء حساب جديد...");

      await registerCustomer(
        registerEmail,
        registerPassword,
        registerFullName,
        registerPhone,
        registerCountry,
        storeInfo?.storeId,
      );

      toast({
        title: "تم إنشاء الحساب بنجاح!",
        description: "تم تسجيل دخولك تلقائياً",
      });

      // الانتقال بعد 1 ثانية
      setTimeout(() => {
        navigate(returnUrl);
      }, 1000);
    } catch (error: any) {
      console.error("❌ خطأ في إنشاء الحساب:", error);

      toast({
        title: "فشل إنشاء الحساب",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // الاستمرار كضيف
  const continueAsGuest = () => {
    if (storeInfo?.subdomain) {
      // حفظ معرف الضيف في localStorage
      const visitorKey = `visitor_${storeInfo.storeId}`;
      const visitorId = `vis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(visitorKey, visitorId);

      toast({
        title: "مرحباً كضيف",
        description: "يمكنك التسجيل لاحقاً لحفظ طلباتك",
      });

      navigate(`/store/${storeInfo.subdomain}`);
    } else {
      toast({
        title: "لم يتم تحديد متجر",
        description: "الرجاء تحديد متجر أولاً",
        variant: "destructive",
      });
    }
  };

  // إعادة تعيين كلمة المرور
  const handleForgotPassword = () => {
    toast({
      title: "إعادة تعيين كلمة المرور",
      description: "سيتم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني",
    });

    // في التطبيق الفعلي، استدعي دالة resetPassword
    // resetPassword(loginEmail);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {storeInfo
              ? `تسجيل الدخول إلى ${storeInfo.storeName}`
              : "تسجيل الدخول"}
          </CardTitle>
          <CardDescription className="text-center">
            {storeInfo
              ? "أدخل بياناتك للوصول إلى المتجر"
              : "قم بتسجيل الدخول أو إنشاء حساب جديد"}
          </CardDescription>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
            <TabsTrigger value="register">إنشاء حساب</TabsTrigger>
          </TabsList>

          {/* علامة تبويب تسجيل الدخول */}
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">البريد الإلكتروني</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="example@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">كلمة المرور</Label>
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-sm"
                      onClick={handleForgotPassword}
                    >
                      نسيت كلمة المرور؟
                    </Button>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked === true)
                    }
                  />
                  <Label htmlFor="remember-me" className="text-sm">
                    تذكرني
                  </Label>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    "تسجيل الدخول"
                  )}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">ليس لديك حساب؟ </span>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0"
                    onClick={() => setActiveTab("register")}
                  >
                    إنشاء حساب جديد
                  </Button>
                </div>
              </CardFooter>
            </form>
          </TabsContent>

          {/* علامة تبويب التسجيل */}
          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-fullname">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="register-fullname"
                    type="text"
                    placeholder="محمد أحمد"
                    value={registerFullName}
                    onChange={(e) => setRegisterFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="example@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-phone">رقم الهاتف</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder="+967 7X XXX XXXX"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-password">
                      كلمة المرور <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      تأكيد كلمة المرور <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-country">البلد</Label>
                  <select
                    id="register-country"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={registerCountry}
                    onChange={(e) => setRegisterCountry(e.target.value)}
                  >
                    <option value="اليمن">اليمن</option>
                    <option value="السعودية">السعودية</option>
                    <option value="الإمارات">الإمارات</option>
                    <option value="عمان">عمان</option>
                    <option value="البحرين">البحرين</option>
                    <option value="قطر">قطر</option>
                    <option value="الكويت">الكويت</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) =>
                      setAcceptTerms(checked === true)
                    }
                  />
                  <Label htmlFor="terms" className="text-sm">
                    أوافق على الشروط والأحكام
                  </Label>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    "إنشاء حساب"
                  )}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    لديك حساب بالفعل؟{" "}
                  </span>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0"
                    onClick={() => setActiveTab("login")}
                  >
                    تسجيل الدخول
                  </Button>
                </div>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>

        {/* زر الاستمرار كضيف */}
        {storeInfo && (
          <div className="px-6 pb-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={continueAsGuest}
            >
              الاستمرار كضيف
            </Button>
          </div>
        )}

        {/* معلومات المتجر */}
        {storeInfo && (
          <div className="px-6 pb-6 pt-2 border-t">
            <p className="text-sm text-center text-muted-foreground">
              أنت تقوم بالتسجيل في:{" "}
              <span className="font-medium">{storeInfo.storeName}</span>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CustomerAuth;
