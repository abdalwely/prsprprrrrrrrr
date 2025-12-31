// pages/WaitingEmailVerification.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  RefreshCw,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { resendEmailVerification } from "@/lib/auth-enhanced";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function WaitingEmailVerification() {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { email, userId, merchantData } = location.state || {};

  useEffect(() => {
    if (!email || !userId) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى إنشاء الحساب أولاً",
        variant: "destructive",
      });
      navigate("/signup");
      return;
    }

    // مراقبة حالة المصادقة والتحقق من البريد
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // ⭐️ إذا تم التحقق من البريد، الانتقال إلى CreateStore
        if (currentUser.emailVerified) {
          console.log("✅ البريد تم التحقق تلقائياً!");

          // تحديث localStorage
          localStorage.setItem("pendingEmailVerification", "false");

          if (merchantData) {
            localStorage.setItem(
              "currentMerchant",
              JSON.stringify({
                ...merchantData,
                isEmailVerified: true,
              }),
            );
          }

          toast({
            title: "✅ تم التحقق من البريد!",
            description: "جاري توجيهك إلى إنشاء المتجر...",
          });

          setTimeout(() => {
            navigate("/create-store?emailVerified=true", {
              replace: true,
            });
          }, 1500);
        }
      }
    });

    return () => unsubscribe();
  }, [email, userId, navigate, toast, merchantData]);

  const handleCheckVerification = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // إعادة تحميل بيانات المستخدم
      await user.reload();

      if (user.emailVerified) {
        console.log("✅ التحقق الناجح!");

        // تحديث localStorage
        localStorage.setItem("pendingEmailVerification", "false");

        if (merchantData) {
          localStorage.setItem(
            "currentMerchant",
            JSON.stringify({
              ...merchantData,
              isEmailVerified: true,
            }),
          );
        }

        toast({
          title: "✅ تم التحقق بنجاح!",
          description: "جاري توجيهك إلى إنشاء المتجر...",
        });

        setTimeout(() => {
          navigate("/create-store?emailVerified=true", {
            replace: true,
          });
        }, 1000);
      } else {
        toast({
          title: "لم يتم التحقق بعد",
          description: "لم تقم بالتحقق من بريدك الإلكتروني بعد.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ خطأ في التحقق:", error);
      toast({
        title: "خطأ في التحقق",
        description: "حدث خطأ أثناء التحقق من حالة البريد",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user) return;

    setResendLoading(true);
    try {
      await resendEmailVerification(user);
      setCountdown(60); // 60 ثانية
      toast({
        title: "✅ تم إعادة الإرسال",
        description: "تم إرسال رابط تحقق جديد إلى بريدك الإلكتروني",
      });
    } catch (error: any) {
      console.error("❌ خطأ في إعادة الإرسال:", error);
      toast({
        title: "خطأ في الإرسال",
        description: "لم نتمكن من إرسال رابط التحقق. يرجى المحاولة لاحقاً.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleOpenEmail = () => {
    window.open(`https://${email.split("@")[1]}`, "_blank");
  };

  // عد تنازلي لإعادة الإرسال
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">انتظر التحقق من البريد</CardTitle>
          <p className="text-gray-600 mt-2">
            تم إرسال رابط تحقق إلى:
            <br />
            <strong className="text-lg">{email}</strong>
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button
              onClick={handleCheckVerification}
              className="w-full"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  التحقق من حالة البريد
                </>
              )}
            </Button>

            <Button
              onClick={handleOpenEmail}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              فتح بريدي الإلكتروني
            </Button>

            <Button
              onClick={handleResendVerification}
              variant="outline"
              className="w-full"
              disabled={resendLoading || countdown > 0}
            >
              {resendLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : countdown > 0 ? (
                <Clock className="h-4 w-4 mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              {countdown > 0
                ? `إعادة الإرسال بعد ${countdown} ثانية`
                : "إعادة إرسال رابط التحقق"}
            </Button>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">تعليمات مهمة:</h4>
            <ul className="text-blue-700 text-sm space-y-2">
              <li className="flex items-start">
                <span className="ml-2">•</span>
                <span>
                  تحقق من بريدك الإلكتروني واضغط على{" "}
                  <strong>"Verify Email"</strong> في الرسالة الواردة
                </span>
              </li>
              <li className="flex items-start">
                <span className="ml-2">•</span>
                <span>
                  قد يصل البريد إلى مجلد <strong>"البريد المزعج (Spam)"</strong>
                </span>
              </li>
              <li className="flex items-start">
                <span className="ml-2">•</span>
                <span>
                  بعد الضغط على الرابط، ارجع إلى هذه الصفحة واضغط على{" "}
                  <strong>"التحقق من حالة البريد"</strong>
                </span>
              </li>
              <li className="flex items-start">
                <span className="ml-2">•</span>
                <span>
                  يمكنك إعادة إرسال الرابط كل <strong>60 ثانية</strong> إذا لم
                  تستلم البريد
                </span>
              </li>
            </ul>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              لم تستلم البريد؟ تأكد من صحة العنوان: <strong>{email}</strong>
            </p>
            <p className="mt-1">
              بعد التحقق، سيتم توجيهك تلقائياً إلى إنشاء المتجر
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
