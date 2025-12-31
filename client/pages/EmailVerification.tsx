// pages/EmailVerifiedRedirect.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function EmailVerifiedRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // الانتقال إلى CreateStore بعد ثانيتين
    const timer = setTimeout(() => {
      navigate("/create-store?emailVerified=true", {
        replace: true,
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          ✅ تم التحقق من البريد الإلكتروني!
        </h1>
        <p className="text-gray-600 mb-6">
          تم تأكيد بريدك الإلكتروني بنجاح. يتم توجيهك الآن إلى إنشاء متجرك...
        </p>
        <div className="animate-pulse text-sm text-gray-500">
          جاري التوجيه إلى إنشاء المتجر...
        </div>
      </div>
    </div>
  );
}
