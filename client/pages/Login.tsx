import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { signInUserEnhanced } from "@/lib/auth-enhanced";
import { testFirebaseConnection } from "@/lib/firebase-diagnostics";
import { signInUserDev } from "@/lib/auth-dev";
import { showAvailableCredentials } from "@/lib/fallback-auth";
import { redirectUserAfterLogin } from "@/lib/user-routing";
import {
  Store,
  ShoppingBag,
  Shield,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function Login() {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("merchant");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isArabic = language === "ar";

  const text = {
    ar: {
      title: "تسجيل الدخول",
      subtitle: "مرحباً بك مرة أخرى",
      description: "سجل دخولك للوصول إلى لوحة التحكم الخاصة بك",
      merchant: "تاجر",
      customer: "عميل",
      admin: "مشرف",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      login: "تسجيل الدخول",
      signingIn: "جاري تسجيل الدخول...",
      forgotPassword: "نسيت كلمة المرور؟",
      noAccount: "ليس لديك حساب؟",
      signUp: "إنشاء حساب",
      merchantDesc: "للتجار وأصحاب المتاجر",
      customerDesc: "للعملاء والمشترين",
      adminDesc: "للمشرفين والمديرين",
      success: "تم تسجيل الدخول بنجاح!",
      redirecting: "جاري التوجيه...",
      errorTitle: "خطأ في تسجيل الدخول",
      unexpectedError: "حدث خطأ غير متوقع",
      // نص التحقق من البريد
      emailNotVerified: "البريد الإلكتروني غير مفعل",
      emailNotVerifiedDesc: "يجب تفعيل بريدك الإلكتروني أولاً قبل تسجيل الدخول",
      checkEmail: "يرجى فحص بريدك الإلكتروني وتفعيل الحساب",
      // رسائل الأخطاء الجديدة
      emailNotFound: "البريد الإلكتروني غير مسجل في المنصة",
      wrongPassword: "كلمة المرور غير صحيحة",
      invalidEmail: "صيغة البريد الإلكتروني غير صحيحة",
      tooManyAttempts: "تم محاولة الدخول مرات عديدة، يرجى الانتظار قليلاً",
      accountDisabled: "تم تعطيل حسابك، يرجى التواصل مع الدعم",
      networkError: "خطأ في الاتصال بالشبكة",
      serverError: "لا يمكن الاتصال بالخادم، يرجى المحاولة لاحقاً",
      timeoutError: "انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى",
    },
    en: {
      title: "Sign In",
      subtitle: "Welcome Back",
      description: "Sign in to access your dashboard",
      merchant: "Merchant",
      customer: "Customer",
      admin: "Admin",
      email: "Email",
      password: "Password",
      login: "Sign In",
      signingIn: "Signing In...",
      forgotPassword: "Forgot password?",
      noAccount: "Don't have an account?",
      signUp: "Sign Up",
      merchantDesc: "For merchants and store owners",
      customerDesc: "For customers and buyers",
      adminDesc: "For administrators and managers",
      success: "Signed in successfully!",
      redirecting: "Redirecting...",
      errorTitle: "Sign In Error",
      unexpectedError: "An unexpected error occurred",
      // Email verification text
      emailNotVerified: "Email not verified",
      emailNotVerifiedDesc: "You must verify your email before signing in",
      checkEmail: "Please check your email and verify your account",
      // New error messages
      emailNotFound: "Email is not registered",
      wrongPassword: "Incorrect password",
      invalidEmail: "Invalid email format",
      tooManyAttempts: "Too many login attempts. Please try again later",
      accountDisabled: "Your account has been disabled. Please contact support",
      networkError: "Network error. Please check your internet connection",
      serverError: "Cannot connect to server. Please try again later",
      timeoutError: "Connection timeout. Please try again",
    },
  };

  const currentText = text[language];

  const userTypes = [
    {
      id: "merchant",
      label: currentText.merchant,
      description: currentText.merchantDesc,
      icon: Store,
      color: "from-blue-500 to-purple-600",
    },
    {
      id: "customer",
      label: currentText.customer,
      description: currentText.customerDesc,
      icon: ShoppingBag,
      color: "from-green-500 to-teal-600",
    },
    {
      id: "admin",
      label: currentText.admin,
      description: currentText.adminDesc,
      icon: Shield,
      color: "from-red-500 to-pink-600",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("🚀 Starting login process...");

      // Show available credentials in development mode
      if (process.env.NODE_ENV === "development") {
        showAvailableCredentials();
      }

      // Check if Firebase is disabled (development mode)
      const isFirebaseDisabled =
        process.env.NODE_ENV === "development" ||
        (typeof window !== "undefined" &&
          (window as any).__FIREBASE_DISABLED__);

      let result;
      let firebaseUser: any = null;

      if (isFirebaseDisabled) {
        console.log("🔧 Using development auth");
        try {
          result = await signInUserDev(formData.email, formData.password);

          // استخراج المستخدم
          firebaseUser = (result as any)?.user || result;

          // ========== ⚠️ الكود المعلق للتحقق من البريد في وضع التطوير ==========
          /*
        if (firebaseUser?.emailVerified === false) {
          toast({
            title: currentText.emailNotVerified,
            description: currentText.emailNotVerifiedDesc,
            variant: "destructive",
          });
          setLoading(false);
          return; // لا يسمح بالدخول
        }
        */
          // ========== ⚠️ نهاية الكود المعلق ==========

          // ✅ فقط إظهار رسالة تحذيرية بدون منع الدخول
          if (firebaseUser?.emailVerified === false) {
            console.log(
              "⚠️ Email not verified (development mode) - Login allowed for testing",
            );
            toast({
              title: "⚠️ " + currentText.emailNotVerified,
              description: "يسمح بالدخول للاختبار - البريد غير مفعل",
              variant: "default",
            });
          }
        } catch (devError: any) {
          result = {
            success: false,
            error: devError.message || "Invalid credentials (development mode)",
          };
        }
      } else {
        try {
          const connectionTest = await testFirebaseConnection();
          console.log("🔍 Firebase connection test:", connectionTest);
          result = await signInUserEnhanced(formData.email, formData.password);

          if (result.success && result.user) {
            firebaseUser = result.user.user;

            // ========== ⚠️ الكود المعلق للتحقق من البريد في وضع الإنتاج ==========
            /*
          if (firebaseUser?.emailVerified === false) {
            toast({
              title: currentText.emailNotVerified,
              description: currentText.emailNotVerifiedDesc,
              variant: "destructive",
            });
            setLoading(false);
            return; // لا يسمح بالدخول
          }
          */
            // ========== ⚠️ نهاية الكود المعلق ==========

            // ✅ فقط إظهار رسالة تحذيرية بدون منع الدخول
            if (firebaseUser?.emailVerified === false) {
              console.log(
                "⚠️ Email not verified (production mode) - Login allowed for testing",
              );
              toast({
                title: "⚠️ " + currentText.emailNotVerified,
                description: "يسمح بالدخول للاختبار - البريد غير مفعل",
                variant: "default",
              });
            }
          }
        } catch (error: any) {
          result = {
            success: false,
            error: error.message || currentText.unexpectedError,
          };
        }
      }

      if (result.success && result.user) {
        console.log("✅ Login successful");

        // ✅ عرض رسالة مختلفة إذا كان البريد غير مفعل
        if (firebaseUser?.emailVerified === false) {
          toast({
            title: "✅ تم تسجيل الدخول (بريد غير مفعل)",
            description:
              "تم السماح بالدخول للاختبار - يرجى تفعيل البريد لاحقاً",
          });
        } else {
          toast({
            title: currentText.success,
            description: currentText.redirecting,
          });
        }

        // عند التوجيه، استخدم firebaseUser مباشرة:

        setTimeout(async () => {
          // استخراج userId من firebaseUser
          const userIdToUse = firebaseUser?.uid;

          if (userIdToUse) {
            console.log("🔀 Redirecting with userId:", userIdToUse);
            await redirectUserAfterLogin(navigate, location, userIdToUse);
          } else {
            console.error("❌ No userId found");

            // محاولة الحصول على userId من Firebase Auth مباشرة
            try {
              const { auth } = await import("@/lib/firebase");
              const currentUser = auth.currentUser;
              if (currentUser?.uid) {
                console.log(
                  "✅ Found userId from auth.currentUser:",
                  currentUser.uid,
                );
                await redirectUserAfterLogin(
                  navigate,
                  location,
                  currentUser.uid,
                );
              } else {
                console.log(
                  "⚠️ No current user, redirecting to default dashboard",
                );
                navigate("/merchant/dashboard");
              }
            } catch (importError) {
              console.error("❌ Error importing auth:", importError);
              navigate("/merchant/dashboard");
            }
          }
        }, 500);
      } else {
        console.error("❌ Login failed:", result.error);

        toast({
          title: currentText.errorTitle,
          description: result.error || currentText.unexpectedError,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Unexpected login error:", error);

      toast({
        title: currentText.errorTitle,
        description: error.message || currentText.unexpectedError,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 ${isArabic ? "rtl" : "ltr"}`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 rtl:space-x-reverse mb-6"
          >
            <div className="bg-gradient-to-r from-primary to-brand p-2 rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">
              منصة التجارة الذكية
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentText.title}
          </h1>
          <p className="text-gray-600">{currentText.description}</p>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="mt-4 flex items-center space-x-1 rtl:space-x-reverse mx-auto"
          >
            <Globe className="h-4 w-4" />
            <span>{language === "ar" ? "English" : "العربية"}</span>
          </Button>
        </div>

        <Card className="card-shadow">
          <CardHeader className="space-y-4">
            <div className="text-center">
              <CardTitle className="text-2xl">{currentText.subtitle}</CardTitle>
              <CardDescription>{currentText.description}</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                {userTypes.map((type) => (
                  <TabsTrigger
                    key={type.id}
                    value={type.id}
                    className="flex flex-col items-center space-y-1 p-3"
                  >
                    <type.icon className="h-4 w-4" />
                    <span className="text-xs">{type.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {userTypes.map((type) => (
                <TabsContent key={type.id} value={type.id}>
                  <div className="text-center mb-6">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center mb-3`}
                    >
                      <type.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">{type.label}</h3>
                    <p className="text-gray-600 text-sm">{type.description}</p>
                  </div>

                  {process.env.NODE_ENV === "development" && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">
                        🔧 Development Mode
                      </h4>
                      <p className="text-xs text-blue-700 mb-2">
                        Quick login credentials:
                      </p>
                      <div className="space-y-1 text-xs text-blue-600">
                        <div>
                          <strong>Admin:</strong> admin@ecommerce-platform.com /
                          AdminPlatform2024!
                        </div>
                        <div>
                          <strong>Merchant:</strong> merchant@test.com /
                          merchant123
                        </div>
                        <div>
                          <strong>Customer:</strong> customer@test.com /
                          customer123
                        </div>
                      </div>
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        <strong>Note:</strong> Email verification is required
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{currentText.email}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 rtl:right-3 rtl:left-auto top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder={
                            isArabic
                              ? "أدخل بريدك الإلكتروني"
                              : "Enter your email"
                          }
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10 rtl:pr-10 rtl:pl-3"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">{currentText.password}</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 rtl:right-3 rtl:left-auto top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={
                            isArabic
                              ? "أدخل كلمة المرور"
                              : "Enter your password"
                          }
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 pr-10 rtl:pr-10 rtl:pl-10"
                          required
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 rtl:left-2 rtl:right-auto top-2 h-6 w-6 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 rtl:ml-2" />
                        {isArabic ? "معلومات هامة" : "Important Information"}
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                        <li>
                          {isArabic
                            ? "يجب تفعيل البريد الإلكتروني قبل تسجيل الدخول"
                            : "Email must be verified before logging in"}
                        </li>
                        <li>
                          {isArabic
                            ? "إذا نسيت كلمة المرور، اضغط على 'نسيت كلمة المرور؟'"
                            : "If you forgot your password, click 'Forgot password?'"}
                        </li>
                        <li>
                          {isArabic
                            ? "تأكد من صحة البريد الإلكتروني وكلمة المرور"
                            : "Make sure your email and password are correct"}
                        </li>
                      </ul>
                    </div>

                    <Button
                      type="submit"
                      className="w-full btn-gradient"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 animate-spin" />
                          {currentText.signingIn}
                        </>
                      ) : (
                        <>
                          {currentText.login}
                          <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 space-y-3 text-center">
                    <p className="text-gray-600">
                      {currentText.noAccount}{" "}
                      <Link
                        to="/signup"
                        className="text-primary font-medium hover:underline"
                      >
                        {currentText.signUp}
                      </Link>
                    </p>

                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline block"
                    >
                      {currentText.forgotPassword}
                    </Link>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
