import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Circle,
  Package,
  Truck,
  CreditCard,
  Shield,
  Globe,
  Award,
  ArrowRight,
  Lock,
  X,
} from "lucide-react";
import { complianceService } from "@/lib/complianceService";

/* ================== Types ================== */

export interface ChecklistItems {
  addProduct: boolean;
  addCategories: boolean;
  enableShipping: boolean;
  enablePayment: boolean;
  verification: boolean;
  customDomain: boolean;
  seoOptimization: boolean;
}

interface ChecklistItemConfig {
  id: keyof ChecklistItems;
  title: string;
  description: string;
  required: boolean;
  points: number;
  icon: React.ReactNode;
  link: string;
  featureKey?: string;
}

interface StoreChecklistProps {
  storeId: string;
  storeName: string;
  complianceLevel: "basic" | "intermediate" | "advanced";
  checklistItems: ChecklistItems;
  onUpdate: (key: keyof ChecklistItems, value: boolean) => Promise<void>;
  onHide?: () => void;
}

/* ================== Component ================== */

export default function StoreChecklist({
  storeId,
  storeName,
  complianceLevel,
  checklistItems,
  onUpdate,
  onHide,
}: StoreChecklistProps) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ChecklistItemConfig[]>([]);

  /* -------- Initialize checklist -------- */
  useEffect(() => {
    const baseItems: ChecklistItemConfig[] = [
      {
        id: "addProduct",
        title: "إضافة أول منتج",
        description: "لا يمكن تشغيل المتجر بدون منتج واحد على الأقل",
        required: true,
        points: 25,
        icon: <Package className="w-5 h-5" />,
        link: `/merchant/products/new?storeId=${storeId}`,
        featureKey: "add_product",
      },
      {
        id: "addCategories",
        title: "إنشاء أقسام",
        description: "تنظيم المنتجات داخل المتجر",
        required: false,
        points: 10,
        icon: <Package className="w-5 h-5" />,
        link: `/merchant/categories?storeId=${storeId}`,
      },
      {
        id: "enableShipping",
        title: "إعداد الشحن",
        description: "تحديد مناطق وأسعار التوصيل",
        required: false,
        points: 15,
        icon: <Truck className="w-5 h-5" />,
        link: `/merchant/settings?tab=shipping&storeId=${storeId}`,
      },
      {
        id: "enablePayment",
        title: "طرق الدفع",
        description: "الدفع عند الاستلام أو تحويل محلي",
        required: false,
        points: 15,
        icon: <CreditCard className="w-5 h-5" />,
        link: `/merchant/settings?tab=payment&storeId=${storeId}`,
      },
      {
        id: "verification",
        title: "توثيق المتجر",
        description: "زيادة الثقة وفتح مزايا متقدمة",
        required: false,
        points: 25,
        icon: <Shield className="w-5 h-5" />,
        link: `/merchant/verification?storeId=${storeId}`,
        featureKey: "verification",
      },
      {
        id: "customDomain",
        title: "نطاق مخصص",
        description: "ربط نطاق خاص باسم متجرك",
        required: false,
        points: 10,
        icon: <Globe className="w-5 h-5" />,
        link: `/merchant/settings?tab=domain&storeId=${storeId}`,
      },
      {
        id: "seoOptimization",
        title: "تحسين محركات البحث",
        description: "تحسين ظهور متجرك في البحث",
        required: false,
        points: 5,
        icon: <Award className="w-5 h-5" />,
        link: `/merchant/settings?tab=seo&storeId=${storeId}`,
      },
    ];

    setItems(baseItems);
  }, [storeId]);

  /* -------- Calculations -------- */
  const totalPoints = items.reduce((s, i) => s + i.points, 0);
  const earnedPoints = items.reduce(
    (s, i) => (checklistItems[i.id] ? s + i.points : s),
    0,
  );
  const progress = Math.round((earnedPoints / totalPoints) * 100);

  /* -------- Toggle -------- */
  const toggleItem = async (key: keyof ChecklistItems) => {
    if (loading) return;
    try {
      setLoading(true);
      await onUpdate(key, !checklistItems[key]);
    } finally {
      setLoading(false);
    }
  };

  /* ================== Render ================== */

  return (
    <Card className="border-2 border-blue-100 relative">
      {onHide && (
        <button
          onClick={onHide}
          className="absolute top-3 left-3 p-1 rounded hover:bg-gray-100"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}

      <CardHeader>
        <CardTitle>قائمة مهام متجرك – {storeName}</CardTitle>
        <CardDescription>
          أكمل المهام لرفع مستوى متجرك وفتح مزايا إضافية
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>التقدم</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          {items.map((item) => {
            const completed = checklistItems[item.id];
            const access = item.featureKey
              ? complianceService.canAccessFeature(
                  complianceLevel,
                  item.featureKey,
                )
              : { allowed: true };

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 border rounded ${
                  completed ? "bg-green-50" : "bg-gray-50"
                } ${!access.allowed ? "opacity-60" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <button
                    disabled={!access.allowed}
                    onClick={() => toggleItem(item.id)}
                  >
                    {completed ? (
                      <CheckCircle className="text-green-600" />
                    ) : (
                      <Circle className="text-gray-400" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.title}</span>
                      {item.required && (
                        <Badge variant="destructive">مطلوب</Badge>
                      )}
                      {!access.allowed && <Lock className="w-3 h-3" />}
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline">{item.points} نقطة</Badge>
                  {!completed && access.allowed && (
                    <Button asChild size="sm" variant="ghost">
                      <a href={item.link}>
                        ابدأ
                        <ArrowRight className="w-4 h-4 mr-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
