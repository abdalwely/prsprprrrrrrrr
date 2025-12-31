// pages/ApplicationStatus.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StoreApplication } from "@/lib/store-approval-system";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";

export default function ApplicationStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  const { applicationId, storeName, submittedAt } = location.state || {};

  const [application, setApplication] = useState<StoreApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) {
      console.error("❌ لا يوجد applicationId في حالة الطلب");
      console.log("📍 location.state:", location.state);
      navigate("/merchant/dashboard");
      return;
    }

    console.log("🔍 جاري تحميل حالة الطلب:", applicationId);

    const unsubscribe = onSnapshot(
      doc(db, "storeApplications", applicationId),
      (docSnap) => {
        setLoading(false);

        if (docSnap.exists()) {
          const data = docSnap.data() as StoreApplication;
          console.log("📊 بيانات الطلب المستلمة:", {
            status: data.status,
            activatedStoreId: data.activatedStoreId,
            hasStoreId: !!data.activatedStoreId,
            storeName: data.storeConfig.customization.storeName,
          });

          setApplication({
            id: docSnap.id,
            ...data,
          });

          // ⭐⭐ إذا تمت الموافقة ولديه storeId
          if (data.status === "approved" && data.activatedStoreId) {
            console.log("🎯 توجيه إلى لوحة التحكم:", {
              storeId: data.activatedStoreId,
              storeName: data.storeConfig.customization.storeName,
            });

            // تأكد من أن storeId صالح
            if (
              data.activatedStoreId &&
              data.activatedStoreId !== "undefined"
            ) {
              setTimeout(() => {
                navigate(`/merchant/dashboard/${data.activatedStoreId}`);
              }, 3000);
            } else {
              console.error(
                "❌ activatedStoreId غير صالح:",
                data.activatedStoreId,
              );
            }
          }
        } else {
          setError("طلب المتجر غير موجود");
        }
      },
      (error) => {
        setLoading(false);
        setError("خطأ في تحميل بيانات الطلب");
        console.error("❌ Error fetching application:", error);
      },
    );

    return () => unsubscribe();
  }, [applicationId, navigate]);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: {
        label: "قيد المراجعة",
        color: "bg-yellow-100 text-yellow-800",
      },
      approved: { label: "تمت الموافقة", color: "bg-green-100 text-green-800" },
      rejected: { label: "مرفوض", color: "bg-red-100 text-red-800" },
      under_review: {
        label: "قيد الدراسة",
        color: "bg-blue-100 text-blue-800",
      },
    };

    const variant =
      variants[status as keyof typeof variants] || variants.pending;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const getVerificationBadge = (status: string) => {
    const variants = {
      not_started: { label: "لم يبدأ", color: "bg-gray-100 text-gray-800" },
      pending: {
        label: "قيد المراجعة",
        color: "bg-yellow-100 text-yellow-800",
      },
      verified: { label: "موثق", color: "bg-green-100 text-green-800" },
      rejected: { label: "مرفوض", color: "bg-red-100 text-red-800" },
    };

    const variant =
      variants[status as keyof typeof variants] || variants.not_started;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return "غير محدد";
    return new Date(timestamp.toDate()).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">جاري تحميل حالة الطلب...</h2>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              خطأ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "طلب المتجر غير موجود"}</p>
            <Button
              className="mt-4"
              onClick={() => navigate("/merchant/dashboard")}
            >
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">حالة طلب إنشاء المتجر</CardTitle>
              {getStatusBadge(application.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  معلومات الطلب
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">رقم الطلب:</dt>
                    <dd className="font-mono">{application.id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">اسم المتجر:</dt>
                    <dd>{application.storeConfig.customization.storeName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">النطاق:</dt>
                    <dd>
                      {application.storeConfig.customization.subdomain}
                      .smartstore.ye
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">تاريخ التقديم:</dt>
                    <dd>{formatDate(application.submittedAt)}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  الحالة الحالية
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">موافقة النظام:</span>
                    {getStatusBadge(application.status)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">توثيق المستندات:</span>
                    {getVerificationBadge(application.verification.status)}
                  </div>

                  {application.reviewedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">آخر تحديث:</span>
                      <span>{formatDate(application.reviewedAt)}</span>
                    </div>
                  )}

                  {application.activatedStoreId && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-green-700 font-medium">
                        ✓ تم إنشاء متجرك بنجاح!
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        جاري توجيهك إلى لوحة التحكم...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ملاحظات */}
            {application.notes && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-800">ملاحظات:</h4>
                <p className="text-blue-700">{application.notes}</p>
              </div>
            )}

            {/* سبب الرفض */}
            {application.rejectionReason && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-red-800">سبب الرفض:</h4>
                <p className="text-red-700">{application.rejectionReason}</p>
              </div>
            )}

            {/* خطوات التالية */}
            <div className="mt-8">
              <h3 className="font-semibold mb-4">الخطوات التالية:</h3>
              <div className="space-y-3">
                {application.status === "pending" && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium">طلبك قيد المراجعة</p>
                      <p className="text-sm text-gray-600">
                        فريقنا يراجع طلبك. قد تستغرق العملية من 1-3 أيام عمل.
                      </p>
                    </div>
                  </div>
                )}

                {application.status === "approved" && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">تمت الموافقة على طلبك</p>
                      <p className="text-sm text-gray-600">
                        سيتم توجيهك تلقائياً إلى لوحة تحكم متجرك خلال 5 ثوانٍ.
                      </p>
                      <Button
                        className="mt-2"
                        onClick={() =>
                          navigate(
                            `/merchant/dashboard/${application.activatedStoreId}`,
                          )
                        }
                      >
                        الانتقال إلى لوحة التحكم الآن
                      </Button>
                    </div>
                  </div>
                )}

                {application.status === "rejected" && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium">تم رفض طلبك</p>
                      <p className="text-sm text-gray-600">
                        يمكنك تعديل بياناتك وتقديم طلب جديد.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => navigate("/create-store")}
                      >
                        إنشاء طلب جديد
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>للاستفسارات، راسلنا على support@smartstore.ye</p>
        </div>
      </div>
    </div>
  );
}
