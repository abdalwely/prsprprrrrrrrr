// pages/SignUp.tsx - كامل ومحدث مع التوافق مع الخدمات
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/src/services/auth/auth.service";
import { userService } from "@/lib/src/services/user/user.service";
import {
  Store,
  Mail,
  Lock,
  User,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  FileText,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  CheckCircle,
} from "lucide-react";

import { businessTypesWithSub } from "@/lib/businessTypes";

// أنواع البيانات
interface FormData {
  // معلومات الحساب
  merchantName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;

  // معلومات المتجر
  businessName: string;
  businessType: string;
  city: string;
  storeDescription: string;
}

// واجهة بيانات المستخدم للتاجر
interface MerchantUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: "merchant" | "admin" | "customer";
  city: string;
  businessName: string;
  businessType: string;
  storeDescription?: string;
}

// المدن
const cities = [
  "صنعاء",
  "عدن",
  "تعز",
  "الحديدة",
  "إب",
  "ذمار",
  "المكلا",
  "سيئون",
  "شبوة",
  "مأرب",
  "الجوف",
  "البيضاء",
  "عمران",
  "صعدة",
  "حجة",
  "لحج",
  "أبين",
  "الضالع",
  "ريمة",
];

export default function SignUp() {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [timer, setTimer] = useState(60);

  const [formData, setFormData] = useState<FormData>({
    merchantName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
    businessName: "",
    businessType: "",
    city: "",
    storeDescription: "",
  });

  const businessTypes = businessTypesWithSub;

  const { toast } = useToast();
  const navigate = useNavigate();
  const isArabic = language === "ar";

  // مؤقت لإعادة إرسال الرمز
  useEffect(() => {
    if (timer > 0 && currentStep === 2 && !isCodeVerified) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer, currentStep, isCodeVerified]);

  const text = {
    ar: {
      // العناوين
      title: "انضم إلى منصة التجارة الذكية",
      subtitle: "ابدأ رحلتك في التجارة الإلكترونية",
      description: "أنشئ حسابك وابدأ في بناء متجرك الإلكتروني خلال دقائق",

      // الخطوات
      step1: "معلومات الحساب",
      step2: "تحقق الهاتف",
      step3: "معلومات المتجر",

      // حقول النموذج
      merchantName: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الجوال",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      businessName: "اسم المتجر/المنشأة",
      businessType: "نوع النشاط",
      city: "المدينة",
      storeDescription: "وصف مختصر عن المتجر",

      // شروط
      termsAccepted: "أوافق على شروط الاستخدام وسياسة الخصوصية",
      termsLink: "قراءة الشروط",

      // أزرار
      next: "التالي",
      previous: "السابق",
      createAccount: "إنشاء الحساب",
      creating: "جاري الإنشاء...",
      verify: "تحقق",
      resendCode: "إعادة إرسال الرمز",
      verifyLater: "تخطي التحقق",

      // تحقق الهاتف
      verificationTitle: "تحقق من رقم الجوال",
      verificationDescription: "أدخل الرمز المرسل إلى هاتفك",
      verificationCode: "رمز التحقق",
      codeSent: "تم إرسال الرمز",
      verifySuccess: "تم التحقق بنجاح",
      timer: "ثانية",

      // رسائل النجاح
      success: "تم إنشاء الحساب بنجاح",
      welcomeMessage: "مرحباً بك! سيتم توجيهك إلى إعداد المتجر",
      accountCreated: "حسابك جاهز الآن",
      proceedToStore: "المتابعة إلى إنشاء المتجر",

      // رسائل الخطأ
      passwordMismatch: "كلمات المرور غير متطابقة",
      allFieldsRequired: "جميع الحقول مطلوبة",
      termsRequired: "يجب الموافقة على الشروط والأحكام",
      invalidPhone: "رقم الجوال غير صالح",
      invalidEmail: "البريد الإلكتروني غير صالح",

      // نصائح
      passwordTip: "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل",
      phoneTip: "أدخل رقم هاتفك الصحيح للتحقق",
      businessTip: "اختر النشاط الأقرب لمتجرك",

      // روابط
      haveAccount: "لديك حساب بالفعل؟",
      signIn: "تسجيل الدخول",
      goHome: "العودة للرئيسية",
    },
    en: {
      // Titles
      title: "Join Smart Commerce Platform",
      subtitle: "Start Your E-commerce Journey",
      description:
        "Create your account and start building your online store in minutes",

      // Steps
      step1: "Account Info",
      step2: "Phone Verification",
      step3: "Store Info",

      // Form fields
      merchantName: "Full Name",
      email: "Email",
      phone: "Phone Number",
      password: "Password",
      confirmPassword: "Confirm Password",
      businessName: "Store/Business Name",
      businessType: "Business Type",
      city: "City",
      storeDescription: "Brief Store Description",

      // Terms
      termsAccepted: "I agree to Terms of Use and Privacy Policy",
      termsLink: "Read Terms",

      // Buttons
      next: "Next",
      previous: "Previous",
      createAccount: "Create Account",
      creating: "Creating...",
      verify: "Verify",
      resendCode: "Resend Code",
      verifyLater: "Skip Verification",

      // Phone verification
      verificationTitle: "Phone Verification",
      verificationDescription: "Enter the code sent to your phone",
      verificationCode: "Verification Code",
      codeSent: "Code sent",
      verifySuccess: "Verification successful",
      timer: "seconds",

      // Success messages
      success: "Account created successfully",
      welcomeMessage: "Welcome! You will be redirected to store setup",
      accountCreated: "Your account is ready",
      proceedToStore: "Proceed to Store Setup",

      // Error messages
      passwordMismatch: "Passwords do not match",
      allFieldsRequired: "All fields are required",
      termsRequired: "You must agree to the terms",
      invalidPhone: "Invalid phone number",
      invalidEmail: "Invalid email",

      // Tips
      passwordTip: "Password must be at least 6 characters",
      phoneTip: "Enter your correct phone number for verification",
      businessTip: "Choose the activity closest to your store",

      // Links
      haveAccount: "Already have an account?",
      signIn: "Sign In",
      goHome: "Back to Home",
    },
  };

  const currentText = text[language];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1);
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      const required = [
        "merchantName",
        "email",
        "phone",
        "password",
        "confirmPassword",
      ];
      for (const field of required) {
        if (!formData[field as keyof FormData]) {
          toast({
            title: "خطأ",
            description: currentText.allFieldsRequired,
            variant: "destructive",
          });
          return false;
        }
      }

      if (!formData.termsAccepted) {
        toast({
          title: "خطأ",
          description: currentText.termsRequired,
          variant: "destructive",
        });
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "خطأ",
          description: currentText.passwordMismatch,
          variant: "destructive",
        });
        return false;
      }

      if (formData.password.length < 6) {
        toast({
          title: "خطأ",
          description: currentText.passwordTip,
          variant: "destructive",
        });
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "خطأ",
          description: currentText.invalidEmail,
          variant: "destructive",
        });
        return false;
      }

      const phoneRegex = /^\+?[\d\s-]{10,15}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast({
          title: "خطأ",
          description: currentText.invalidPhone,
          variant: "destructive",
        });
        return false;
      }

      return true;
    }

    if (step === 3) {
      const required = [
        "businessName",
        "businessType",
        "city",
        "storeDescription",
      ];
      for (const field of required) {
        if (!formData[field as keyof FormData]) {
          toast({
            title: "خطأ",
            description: currentText.allFieldsRequired,
            variant: "destructive",
          });
          return false;
        }
      }

      if (formData.storeDescription.length < 20) {
        toast({
          title: "خطأ",
          description: "يرجى كتابة وصف مفصل للمتجر (20 حرف على الأقل)",
          variant: "destructive",
        });
        return false;
      }

      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep(1)) return;
    if (currentStep === 3 && !validateStep(3)) return;

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
      if (currentStep === 1) {
        setTimer(60); // إعادة تعيين المؤقت عند الانتقال لخطوة التحقق
        simulateSendingCode(); // محاكاة إرسال الرمز
      }
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const simulateSendingCode = () => {
    toast({
      title: currentText.codeSent,
      description: `تم إرسال رمز التحقق إلى ${formData.phone}`,
    });
  };

  const handleVerifyCode = () => {
    const code = verificationCode.join("");
    if (code.length !== 6) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رمز التحقق المكون من 6 أرقام",
        variant: "destructive",
      });
      return;
    }

    setIsCodeVerified(true);
    toast({
      title: currentText.verifySuccess,
      description: "تم التحقق من رقم الجوال بنجاح",
    });

    setTimeout(() => {
      setCurrentStep(3);
    }, 1000);
  };

  const handleResendCode = () => {
    if (timer > 0) {
      toast({
        title: "يرجى الانتظار",
        description: `يمكنك إعادة الإرسال بعد ${timer} ثانية`,
        variant: "destructive",
      });
      return;
    }

    simulateSendingCode();
    setTimer(60);
  };

  const handleSkipVerification = () => {
    toast({
      title: "تم تخطي التحقق",
      description: "يمكنك التحقق لاحقاً من إعدادات الحساب",
    });
    setCurrentStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // فصل الاسم الأول والاسم الأخير
      const nameParts = formData.merchantName.trim().split(" ");
      const firstName = nameParts[0] || formData.merchantName;
      const lastName = nameParts.slice(1).join(" ") || firstName;

      // تحضير بيانات المستخدم للتاجر
      const merchantUserData: MerchantUserData = {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        userType: "merchant",
        city: formData.city,
        businessName: formData.businessName,
        businessType: formData.businessType,
        storeDescription: formData.storeDescription,
      };

      // استخدام authService لإنشاء الحساب
      const result = await authService.createAccount(
        formData.email,
        formData.password,
        merchantUserData,
      );

      if (result.success && result.user) {
        const user = result.user.user;
        const userData = result.userData;

        // حفظ بيانات التاجر في localStorage
        const merchantData = {
          uid: user.uid,
          email: userData?.email || formData.email,
          merchantName: formData.merchantName,
          businessName: formData.businessName,
          businessType: formData.businessType,
          city: formData.city,
          storeDescription: formData.storeDescription,
          userType: "merchant",
          phone: merchantUserData.phone,
          isEmailVerified: user.emailVerified || false,
          createdAt: new Date().toISOString(),
          firstName: merchantUserData.firstName,
          lastName: merchantUserData.lastName,
        };

        localStorage.setItem("currentMerchant", JSON.stringify(merchantData));
        localStorage.setItem("userUid", user.uid);
        localStorage.setItem("userEmail", formData.email);
        localStorage.setItem("userPhone", formData.phone);
        localStorage.setItem("isNewMerchant", "true");

        // إرسال رابط التحقق بالبريد الإلكتروني
        try {
          await authService.sendEmailVerification(user);

          localStorage.setItem("pendingEmailVerification", "true");

          toast({
            title: "📧 رابط التحقق أرسل",
            description: "تم إرسال رابط تحقق إلى بريدك الإلكتروني",
          });
        } catch (error) {
          console.warn("⚠️ لم يتم إرسال رابط التحقق:", error);
          // لا توقف العملية، يمكن التحقق لاحقاً
        }

        toast({
          title: "✅ " + currentText.success,
          description: "يتم توجيهك إلى صفحة انتظار التحقق...",
          duration: 3000,
        });

        // الانتقال إلى صفحة انتظار التحقق
        setTimeout(() => {
          navigate("/waiting-email-verification", {
            state: {
              email: formData.email,
              userId: user.uid,
              merchantData,
            },
            replace: true,
          });
        }, 1500);
      } else {
        throw new Error(result.error || "فشل في إنشاء الحساب");
      }
    } catch (error: any) {
      console.error("❌ خطأ في إنشاء الحساب:", error);

      let errorMessage = error.message || "حدث خطأ غير متوقع";

      // معالجة أخطاء Firebase الشائعة
      if (
        errorMessage.includes("email-already-in-use") ||
        errorMessage.includes("البريد الإلكتروني مسجل مسبقاً")
      ) {
        errorMessage = "البريد الإلكتروني مستخدم بالفعل";
      } else if (
        errorMessage.includes("weak-password") ||
        errorMessage.includes("كلمة المرور ضعيفة")
      ) {
        errorMessage = "كلمة المرور ضعيفة. يجب أن تكون 6 أحرف على الأقل";
      } else if (errorMessage.includes("invalid-email")) {
        errorMessage = "البريد الإلكتروني غير صالح";
      } else if (errorMessage.includes("network-request-failed")) {
        errorMessage = "فشل في الاتصال بالشبكة. تحقق من اتصالك بالإنترنت";
      }

      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: currentText.step1, icon: User },
      { number: 2, title: currentText.step2, icon: Phone },
      { number: 3, title: currentText.step3, icon: Store },
    ];

    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? "bg-blue-600 border-blue-600 text-white"
                      : currentStep === step.number
                        ? "border-blue-600 text-blue-600"
                        : "border-gray-300 text-gray-400"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="mt-2 text-xs font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${currentStep > step.number ? "bg-blue-600" : "bg-gray-300"}`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="merchantName" className="flex items-center">
            <User className="w-4 h-4 ml-2 rtl:mr-2 text-gray-500" />
            {currentText.merchantName} *
          </Label>
          <Input
            id="merchantName"
            name="merchantName"
            value={formData.merchantName}
            onChange={handleInputChange}
            placeholder={isArabic ? "أدخل أسمك الكامل" : "Ahmed Mohammed Ali"}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center">
            <Mail className="w-4 h-4 ml-2 rtl:mr-2 text-gray-500" />
            {currentText.email} *
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="example@domain.com"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center">
            <Phone className="w-4 h-4 ml-2 rtl:mr-2 text-gray-500" />
            {currentText.phone} *
          </Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder={isArabic ? "+967 7X XXX XXXX" : "+1 234 567 8900"}
            required
            disabled={loading}
          />
          <p className="text-xs text-gray-500">{currentText.phoneTip}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center">
              <Lock className="w-4 h-4 ml-2 rtl:mr-2 text-gray-500" />
              {currentText.password} *
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-2 rtl:right-2 rtl:left-auto top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {currentText.confirmPassword} *
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute left-2 rtl:right-2 rtl:left-auto top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500">{currentText.passwordTip}</p>

        <div className="flex items-center space-x-2 rtl:space-x-reverse pt-4">
          <Checkbox
            id="terms"
            checked={formData.termsAccepted}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                termsAccepted: checked as boolean,
              }))
            }
          />
          <Label htmlFor="terms" className="text-sm cursor-pointer">
            {currentText.termsAccepted}{" "}
            <Link to="/terms" className="text-blue-600 hover:underline">
              ({currentText.termsLink})
            </Link>
          </Label>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          تحقق من بريدك الإلكتروني
        </h3>
        <p className="text-gray-600 mb-2">
          سيتم إرسال رابط تحقق إلى بريدك الإلكتروني بعد إكمال معلومات المتجر
        </p>
        <p className="text-sm text-gray-500 font-medium">{formData.email}</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-blue-600 ml-2 rtl:mr-2" />
            <div>
              <h4 className="font-medium text-blue-800">
                سيتم إرسال رابط التحقق
              </h4>
              <p className="text-blue-700 text-sm">
                بعد إدخال معلومات المتجر في الخطوة التالية، سيتم إرسال رابط تحقق
                إلى:
                <br />
                <strong>{formData.email}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              toast({
                title: "يمكنك التحقق لاحقاً",
                description:
                  "يمكنك التحقق من بريدك الإلكتروني من إعدادات الحساب",
              });
              setCurrentStep(3);
            }}
          >
            تخطي والتحقق لاحقاً
          </Button>

          <p className="text-xs text-gray-500">
            ملاحظة: التحقق من البريد الإلكتروني يزيد من أمان حسابك
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName" className="flex items-center">
            <Building2 className="w-4 h-4 ml-2 rtl:mr-2 text-gray-500" />
            {currentText.businessName} *
          </Label>
          <Input
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleInputChange}
            placeholder={
              isArabic ? "متجر الإلكترونيات الحديث" : "Modern Electronics Store"
            }
            required
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessType" className="flex items-center">
              <Briefcase className="w-4 h-4 ml-2 rtl:mr-2 text-gray-500" />
              {currentText.businessType} *
            </Label>
            <Select
              value={formData.businessType}
              onValueChange={(value) =>
                handleSelectChange("businessType", value)
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isArabic ? "اختر نوع النشاط" : "Select business type"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label[language]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">{currentText.businessTip}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="flex items-center">
              <MapPin className="w-4 h-4 ml-2 rtl:mr-2 text-gray-500" />
              {currentText.city} *
            </Label>
            <Select
              value={formData.city}
              onValueChange={(value) => handleSelectChange("city", value)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={isArabic ? "اختر المدينة" : "Select city"}
                />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="storeDescription" className="flex items-center">
            <FileText className="w-4 h-4 ml-2 rtl:mr-2 text-gray-500" />
            {currentText.storeDescription} *
          </Label>
          <Textarea
            id="storeDescription"
            name="storeDescription"
            value={formData.storeDescription}
            onChange={handleInputChange}
            rows={3}
            placeholder={
              isArabic
                ? "صف نشاطك التجاري باختصار..."
                : "Briefly describe your business..."
            }
            required
            disabled={loading}
          />
          <p className="text-xs text-gray-500">
            {isArabic
              ? "وصف مفصل يجذب العملاء (20 حرف على الأقل)"
              : "Detailed description to attract customers (at least 20 chars)"}
          </p>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <div
      className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${isArabic ? "rtl" : "ltr"}`}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 rtl:space-x-reverse mb-6"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              منصة التجارة الذكية
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentText.title}
          </h1>
          <p className="text-gray-600 mb-6">{currentText.description}</p>

          {/* لغة الموقع */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="flex items-center space-x-1 rtl:space-x-reverse mx-auto mb-4"
          >
            <Globe className="h-4 w-4" />
            <span>{language === "ar" ? "English" : "العربية"}</span>
          </Button>
        </div>

        {/* البطاقة الرئيسية */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              {currentText.subtitle}
            </CardTitle>
            <CardDescription className="text-center">
              {currentStep === 1 && currentText.step1}
              {currentStep === 2 && currentText.step2}
              {currentStep === 3 && currentText.step3}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* مؤشر الخطوات */}
            {renderStepIndicator()}

            {/* النموذج */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNext();
              }}
            >
              {renderCurrentStep()}

              {/* أزرار التنقل */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={loading}
                    >
                      <ArrowLeft className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      {currentText.previous}
                    </Button>
                  )}
                </div>

                <div>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {currentStep === 3 ? (
                      loading ? (
                        <>
                          <Loader2 className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0 animate-spin" />
                          {currentText.creating}
                        </>
                      ) : (
                        <>
                          {currentText.createAccount}
                          <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                        </>
                      )
                    ) : (
                      <>
                        {currentText.next}
                        <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {/* رابط تسجيل الدخول */}
            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-gray-600">
                {currentText.haveAccount}{" "}
                <Link
                  to="/login"
                  className="text-blue-600 font-medium hover:underline"
                >
                  {currentText.signIn}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* معلومات إضافية */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {isArabic
              ? "بإنشائك لحساب، فإنك توافق على شروط الاستخدام وسياسة الخصوصية الخاصة بنا."
              : "By creating an account, you agree to our Terms of Use and Privacy Policy."}
          </p>
          <Link
            to="/"
            className="inline-block mt-4 text-sm text-blue-600 hover:underline"
          >
            {currentText.goHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
