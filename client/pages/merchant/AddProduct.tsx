import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useStore } from "@/lib/contexts/StoreContext";
import {
  productService,
  createCategoryWithValidation,
  getStoreCategoriesByStoreId,
  ComplianceDecision,
  DEFAULT_PRODUCT_TYPES,
  complianceSystem,
  ProductKind,
  PRODUCT_KINDS,
  ProductKindSelectionResult,
  FieldVisibility,
  KindBasedValidation,
  ProductStatus,
} from "@/lib/src";
import { ExtendedStore } from "@/lib/src";
import {
  Package,
  Upload,
  Plus,
  X,
  ArrowLeft,
  Save,
  Eye,
  Tag,
  Settings,
  FileText,
  Image as ImageIcon,
  Package2,
  Truck,
  File,
  Users2,
  Calendar,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  AlertTriangle,
  Loader2,
  ChevronDown,
  Clock,
  Shield,
  Search,
  Brain,
  Sparkles,
  Store,
  Rocket,
  XCircle,
} from "lucide-react";

// 🔥 تعريف الأنواع المطلوبة
interface ProductTypeSuggestion {
  id: string;
  name: string;
  activityId: string;
  confidence: number;
  matchedKeywords: string[];
  requiredFields?: string[];
  icon?: string;
  description?: string;
}

interface ComplianceRecommendation {
  type: "warning" | "suggestion" | "requirement";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  action?: string;
  productTypeId?: string;
}

// 🔥 مكون اقتراحات نوع المنتج
const ProductTypeSuggestions = ({
  name,
  description,
  tags,
  selectedKind,
  selectedProductType,
  onSelectProductType,
}: {
  name: string;
  description: string;
  tags: string[];
  selectedKind: ProductKind;
  selectedProductType: string;
  onSelectProductType: (productTypeId: string) => void;
}) => {
  const [suggestions, setSuggestions] = useState<ProductTypeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [showAllTypes, setShowAllTypes] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!name.trim() || name.length < 2) return;

      setLoading(true);
      try {
        console.log("🔍 بدء اقتراح أنواع المنتج:", name);
        const detected = await productService.suggestProductTypes(
          name,
          description,
          tags,
          5,
        );

        console.log("✅ الاقتراحات المستلمة:", detected.length);

        // 🔥 فلترة الاقتراحات لتتناسب مع kind المختار
        const kindInfo = PRODUCT_KINDS[selectedKind];
        const compatibleSuggestions = detected.filter((suggestion) =>
          kindInfo.suggestedActivities.includes(suggestion.activityId),
        );

        console.log("🔍 الاقتراحات المتوافقة:", compatibleSuggestions.length);

        // إذا لم توجد اقتراحات متوافقة، أظهر جميع الاقتراحات
        const finalSuggestions =
          compatibleSuggestions.length > 0
            ? compatibleSuggestions
            : detected.slice(0, 3);

        setSuggestions(finalSuggestions);

        if (compatibleSuggestions.length === 0 && detected.length > 0) {
          toast({
            title: "⚠️ لا توجد اقتراحات متوافقة",
            description: "جاري عرض اقتراحات عامة",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("❌ خطأ في اقتراح أنواع المنتجات:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 1000);
    return () => clearTimeout(timeoutId);
  }, [name, description, tags, selectedKind, toast]);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>جارٍ اكتشاف نوع المنتج المناسب...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0 && name.length < 3) return null;

  const displaySuggestions = showAllTypes
    ? DEFAULT_PRODUCT_TYPES.slice(0, 6).map((pt) => ({
        id: pt.id,
        name: pt.name,
        activityId: pt.activityId,
        confidence: 0.5,
        matchedKeywords: [],
        icon: pt.metadata?.icon,
        description: pt.description,
      }))
    : suggestions;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          اقتراحات نوع المنتج التفصيلي
        </CardTitle>
        <CardDescription>
          اختر النوع الأنسب بناءً على اسم ووصف منتجك
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displaySuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`border rounded-xl p-4 cursor-pointer transition-all ${
                selectedProductType === suggestion.id
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => onSelectProductType(suggestion.id)}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{suggestion.icon || "📦"}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{suggestion.name}</h4>
                    {suggestion.confidence > 0 && (
                      <Badge
                        variant={
                          suggestion.confidence > 0.7
                            ? "default"
                            : suggestion.confidence > 0.4
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {suggestion.description || "منتج عام"}
                  </p>

                  {suggestion.matchedKeywords.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">
                        الكلمات المطابقة:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.matchedKeywords
                          .slice(0, 3)
                          .map((keyword, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {keyword}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  {selectedProductType === suggestion.id && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>محدَد</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 🔥 زر لإظهار جميع الأنواع */}
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllTypes(!showAllTypes)}
            className="gap-2"
          >
            {showAllTypes ? (
              <>
                <X className="h-4 w-4" />
                إخفاء الأنواع
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                عرض جميع الأنواع
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// 🔥 مكون الزراعة - محسن
const AgricultureSpecificFields = ({
  productData,
  setProductData,
  visible,
}: {
  productData: any;
  setProductData: React.Dispatch<React.SetStateAction<any>>;
  visible: boolean;
}) => {
  if (!visible) return null;

  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Sparkles className="h-5 w-5" />
          خيارات خاصة بالزراعة
        </CardTitle>
        <CardDescription className="text-green-700">
          هذه الحقول مخصصة للمنتجات الزراعية فقط
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="agricultureType" className="text-green-700">
              نوع المنتج الزراعي *
            </Label>
            <Select
              value={productData.agricultureType || ""}
              onValueChange={(value) =>
                setProductData((prev) => ({
                  ...prev,
                  agricultureType: value,
                }))
              }
            >
              <SelectTrigger className="mt-1 bg-white">
                <SelectValue placeholder="اختر النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fertilizer">سماد</SelectItem>
                <SelectItem value="seeds">بذور</SelectItem>
                <SelectItem value="pesticide">مبيد</SelectItem>
                <SelectItem value="tools">أدوات زراعية</SelectItem>
                <SelectItem value="soil">تربة</SelectItem>
                <SelectItem value="saplings">شتلات</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="organic" className="text-green-700">
              منتج عضوي
            </Label>
            <div className="flex items-center gap-2 mt-2">
              <Switch
                id="organic"
                checked={productData.isOrganic || false}
                onCheckedChange={(checked) =>
                  setProductData((prev) => ({
                    ...prev,
                    isOrganic: checked,
                  }))
                }
              />
              <span className="text-sm text-gray-600">نعم، منتج عضوي</span>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="usageInstructions" className="text-green-700">
            تعليمات الاستخدام *
          </Label>
          <Textarea
            id="usageInstructions"
            value={productData.usageInstructions || ""}
            onChange={(e) =>
              setProductData((prev) => ({
                ...prev,
                usageInstructions: e.target.value,
              }))
            }
            placeholder="أدخل تعليمات الاستخدام للمنتج الزراعي..."
            className="mt-1 min-h-[100px] bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="shelfLife" className="text-green-700">
              مدة الصلاحية (أشهر) *
            </Label>
            <Input
              id="shelfLife"
              type="number"
              min="1"
              value={productData.shelfLifeMonths || 12}
              onChange={(e) =>
                setProductData((prev) => ({
                  ...prev,
                  shelfLifeMonths: parseInt(e.target.value) || 12,
                }))
              }
              placeholder="12"
              className="mt-1 bg-white"
            />
          </div>

          <div>
            <Label htmlFor="certification" className="text-green-700">
              الشهادة
            </Label>
            <Select
              value={productData.certification || ""}
              onValueChange={(value) =>
                setProductData((prev) => ({
                  ...prev,
                  certification: value,
                }))
              }
            >
              <SelectTrigger className="mt-1 bg-white">
                <SelectValue placeholder="اختر الشهادة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="organic">عضوي معتمد</SelectItem>
                <SelectItem value="iso">ISO</SelectItem>
                <SelectItem value="gmp">GMP</SelectItem>
                <SelectItem value="none">لا توجد شهادة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Alert className="bg-green-100 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ملاحظة: المنتجات الزراعية المكتملة تحصل على موافقة تلقائية من نظام
            الامتثال
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

// 🔥 مكون اختيار kind
const ProductKindSelector = ({
  selectedKind,
  onSelectKind,
  onResetKind,
}: {
  selectedKind: ProductKind | "";
  onSelectKind: (kind: ProductKind) => void;
  onResetKind: () => void;
}) => (
  <Card className="mb-8">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-2xl">
        <Package className="h-6 w-6" />
        الخطوة الأولى: ما نوع المنتج الذي تبيعه؟
      </CardTitle>
      <CardDescription>
        اختر نوعًا واحدًا فقط، وسيظهر لك الحقول المناسبة تلقائيًا
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(PRODUCT_KINDS).map((kind) => (
          <div
            key={kind.id}
            className={`border-2 rounded-xl p-6 cursor-pointer transition-all text-center h-full flex flex-col justify-between ${
              selectedKind === kind.id
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
            }`}
            onClick={() => onSelectKind(kind.id)}
          >
            <div>
              <div className="text-4xl mb-4">{kind.icon}</div>
              <h3 className="font-bold text-lg mb-2">{kind.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{kind.description}</p>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-gray-500">
                يتطلب:
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                  {kind.requires.inventory && (
                    <Badge variant="outline" className="text-xs">
                      مخزون
                    </Badge>
                  )}
                  {kind.requires.shipping && (
                    <Badge variant="outline" className="text-xs">
                      شحن
                    </Badge>
                  )}
                  {kind.requires.digitalDelivery && (
                    <Badge variant="outline" className="text-xs">
                      تسليم رقمي
                    </Badge>
                  )}
                  {kind.requires.expiryDate && (
                    <Badge variant="outline" className="text-xs">
                      صلاحية
                    </Badge>
                  )}
                </div>
              </div>

              {selectedKind === kind.id && (
                <div className="mt-4 pt-4 border-t">
                  <Badge className="bg-blue-600 text-white">✓ محدَد</Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// 🔥 مكون عرض حالة kind
const KindStatusDisplay = ({
  selectedKind,
  kindSelectionResult,
  onResetKind,
}: {
  selectedKind: ProductKind;
  kindSelectionResult: ProductKindSelectionResult | null;
  onResetKind: () => void;
}) => (
  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm border">
          <span className="text-3xl">{PRODUCT_KINDS[selectedKind].icon}</span>
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-xl text-gray-800">
              {PRODUCT_KINDS[selectedKind].name}
            </h3>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              {selectedKind === ProductKind.PHYSICAL && "📦 ملموس"}
              {selectedKind === ProductKind.SERVICE && "🔧 خدمة"}
              {selectedKind === ProductKind.FOOD && "🍔 طعام"}
              {selectedKind === ProductKind.DIGITAL && "💾 رقمي"}
            </Badge>
          </div>
          <p className="text-gray-600 mt-1">
            {PRODUCT_KINDS[selectedKind].description}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onResetKind}
        className="text-gray-600 hover:text-gray-800 hover:bg-white border-gray-300"
      >
        <X className="h-4 w-4 ml-1" />
        تغيير النوع
      </Button>
    </div>

    {kindSelectionResult && (
      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="font-medium">مستوى الامتثال</span>
            </div>
            <div>
              <Badge
                variant={
                  kindSelectionResult.complianceLevel === "high"
                    ? "destructive"
                    : kindSelectionResult.complianceLevel === "medium"
                      ? "default"
                      : "secondary"
                }
                className="text-sm"
              >
                {kindSelectionResult.complianceLevel === "high"
                  ? "🛡️ عالي"
                  : kindSelectionResult.complianceLevel === "medium"
                    ? "⚠️ متوسط"
                    : "✅ منخفض"}
              </Badge>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="font-medium">الحقول المطلوبة</span>
            </div>
            <div className="text-sm text-gray-600">
              {kindSelectionResult.requiredFields.length} حقل
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">الحالة</span>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              {kindSelectionResult.allowed ? "✅ مسموح" : "❌ غير مسموح"}
            </Badge>
          </div>
        </div>

        {kindSelectionResult.reason && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              {kindSelectionResult.reason}
            </AlertDescription>
          </Alert>
        )}

        {kindSelectionResult.nextSteps.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Rocket className="h-4 w-4 text-blue-600" />
              الخطوات التالية
            </h4>
            <ul className="space-y-2">
              {kindSelectionResult.nextSteps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <div className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full text-xs mt-0.5">
                    {idx + 1}
                  </div>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}
  </div>
);

// 🔥 مكون حقل المخزون
const InventoryField = ({
  productData,
  setProductData,
  visible,
}: {
  productData: any;
  setProductData: React.Dispatch<React.SetStateAction<any>>;
  visible: boolean;
}) => {
  if (!visible) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package2 className="h-5 w-5" />
          إدارة المخزون
        </CardTitle>
        <CardDescription>تحديد الكمية وإعدادات المخزون</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="stock">الكمية المتاحة *</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={productData.inventory.quantity}
            onChange={(e) =>
              setProductData((prev) => ({
                ...prev,
                inventory: {
                  ...prev.inventory,
                  quantity: parseInt(e.target.value) || 0,
                },
              }))
            }
            placeholder="0"
            className="mt-1"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="trackInventory">تتبع المخزون تلقائيًا</Label>
              <p className="text-sm text-gray-500">
                خفض الكمية تلقائيًا عند كل بيع
              </p>
            </div>
            <Switch
              id="trackInventory"
              checked={productData.inventory.trackInventory}
              onCheckedChange={(checked) =>
                setProductData((prev) => ({
                  ...prev,
                  inventory: { ...prev.inventory, trackInventory: checked },
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowBackorders">السماح بالطلبات المسبقة</Label>
              <p className="text-sm text-gray-500">
                قبول طلبات أكثر من الكمية المتاحة
              </p>
            </div>
            <Switch
              id="allowBackorders"
              checked={productData.inventory.allowBackorders}
              onCheckedChange={(checked) =>
                setProductData((prev) => ({
                  ...prev,
                  inventory: { ...prev.inventory, allowBackorders: checked },
                }))
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 🔥 مكون حقل الشحن
const ShippingField = ({
  productData,
  setProductData,
  visible,
}: {
  productData: any;
  setProductData: React.Dispatch<React.SetStateAction<any>>;
  visible: boolean;
}) => {
  if (!visible) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          خيارات الشحن
        </CardTitle>
        <CardDescription>تحديد إعدادات الشحن والأوزان</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="requiresShipping">المنتج يحتاج شحن</Label>
            <p className="text-sm text-gray-500">هل سيشحن هذا المنتج للعميل؟</p>
          </div>
          <Switch
            id="requiresShipping"
            checked={productData.shipping.requiresShipping}
            onCheckedChange={(checked) =>
              setProductData((prev) => ({
                ...prev,
                shipping: { ...prev.shipping, requiresShipping: checked },
              }))
            }
          />
        </div>

        {productData.shipping.requiresShipping && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="weight">الوزن (كجم)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productData.shipping.weight}
                  onChange={(e) =>
                    setProductData((prev) => ({
                      ...prev,
                      shipping: {
                        ...prev.shipping,
                        weight: parseFloat(e.target.value) || 0,
                      },
                    }))
                  }
                  placeholder="0.5"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="length">الطول (سم)</Label>
                <Input
                  id="length"
                  type="number"
                  min="0"
                  value={productData.shipping.length}
                  onChange={(e) =>
                    setProductData((prev) => ({
                      ...prev,
                      shipping: {
                        ...prev.shipping,
                        length: parseInt(e.target.value) || 0,
                      },
                    }))
                  }
                  placeholder="20"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="width">العرض (سم)</Label>
                <Input
                  id="width"
                  type="number"
                  min="0"
                  value={productData.shipping.width}
                  onChange={(e) =>
                    setProductData((prev) => ({
                      ...prev,
                      shipping: {
                        ...prev.shipping,
                        width: parseInt(e.target.value) || 0,
                      },
                    }))
                  }
                  placeholder="15"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="height">الارتفاع (سم)</Label>
              <Input
                id="height"
                type="number"
                min="0"
                value={productData.shipping.height}
                onChange={(e) =>
                  setProductData((prev) => ({
                    ...prev,
                    shipping: {
                      ...prev.shipping,
                      height: parseInt(e.target.value) || 0,
                    },
                  }))
                }
                placeholder="10"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="shippingClass">فئة الشحن</Label>
              <Select
                value={productData.shipping.shippingClass}
                onValueChange={(value) =>
                  setProductData((prev) => ({
                    ...prev,
                    shipping: { ...prev.shipping, shippingClass: value },
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="اختر فئة الشحن" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">عادي</SelectItem>
                  <SelectItem value="express">سريع</SelectItem>
                  <SelectItem value="heavy">ثقيل</SelectItem>
                  <SelectItem value="fragile">قابل للكسر</SelectItem>
                  <SelectItem value="refrigerated">مبرد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 🔥 مكون حقل التسليم الرقمي
const DigitalDeliveryField = ({
  productData,
  setProductData,
  visible,
}: {
  productData: any;
  setProductData: React.Dispatch<React.SetStateAction<any>>;
  visible: boolean;
}) => {
  if (!visible) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          التسليم الرقمي
        </CardTitle>
        <CardDescription>إعدادات التسليم الإلكتروني للملفات</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="digitalDeliveryEnabled">تفعيل التسليم الرقمي</Label>
            <p className="text-sm text-gray-500">
              إرسال الملفات تلقائيًا بعد الشراء
            </p>
          </div>
          <Switch
            id="digitalDeliveryEnabled"
            checked={productData.digitalDelivery.enabled}
            onCheckedChange={(checked) =>
              setProductData((prev) => ({
                ...prev,
                digitalDelivery: { ...prev.digitalDelivery, enabled: checked },
              }))
            }
          />
        </div>

        {productData.digitalDelivery.enabled && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accessDuration">مدة الوصول (أيام)</Label>
                <Input
                  id="accessDuration"
                  type="number"
                  min="1"
                  value={productData.digitalDelivery.accessDuration}
                  onChange={(e) =>
                    setProductData((prev) => ({
                      ...prev,
                      digitalDelivery: {
                        ...prev.digitalDelivery,
                        accessDuration: parseInt(e.target.value) || 365,
                      },
                    }))
                  }
                  placeholder="365"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="fileFormat">صيغة الملف</Label>
                <Select
                  value={productData.digitalDelivery.fileFormat}
                  onValueChange={(value) =>
                    setProductData((prev) => ({
                      ...prev,
                      digitalDelivery: {
                        ...prev.digitalDelivery,
                        fileFormat: value,
                      },
                    }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر صيغة الملف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="zip">ZIP</SelectItem>
                    <SelectItem value="mp4">MP4</SelectItem>
                    <SelectItem value="mp3">MP3</SelectItem>
                    <SelectItem value="docx">DOCX</SelectItem>
                    <SelectItem value="xlsx">XLSX</SelectItem>
                    <SelectItem value="pptx">PPTX</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoSend">الإرسال التلقائي</Label>
                <p className="text-sm text-gray-500">
                  إرسال الملف تلقائيًا بعد اكتمال الطلب
                </p>
              </div>
              <Switch
                id="autoSend"
                checked={productData.digitalDelivery.autoSend}
                onCheckedChange={(checked) =>
                  setProductData((prev) => ({
                    ...prev,
                    digitalDelivery: {
                      ...prev.digitalDelivery,
                      autoSend: checked,
                    },
                  }))
                }
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 🔥 مكون حقل تفاصيل الخدمة
const ServiceDetailsField = ({
  productData,
  setProductData,
  visible,
}: {
  productData: any;
  setProductData: React.Dispatch<React.SetStateAction<any>>;
  visible: boolean;
}) => {
  if (!visible) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users2 className="h-5 w-5" />
          تفاصيل الخدمة
        </CardTitle>
        <CardDescription>إعدادات الخدمة والتواصل مع العملاء</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="requiresCustomerInfo">مطلوب معلومات العميل</Label>
            <p className="text-sm text-gray-500">
              جمع معلومات إضافية من العميل قبل البدء
            </p>
          </div>
          <Switch
            id="requiresCustomerInfo"
            checked={productData.serviceDetails.requiresCustomerInfo}
            onCheckedChange={(checked) =>
              setProductData((prev) => ({
                ...prev,
                serviceDetails: {
                  ...prev.serviceDetails,
                  requiresCustomerInfo: checked,
                },
              }))
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="estimatedDuration">المدة المتوقعة</Label>
            <Select
              value={productData.serviceDetails.estimatedDuration}
              onValueChange={(value) =>
                setProductData((prev) => ({
                  ...prev,
                  serviceDetails: {
                    ...prev.serviceDetails,
                    estimatedDuration: value,
                  },
                }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="اختر المدة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 ساعة">1 ساعة</SelectItem>
                <SelectItem value="2 ساعة">2 ساعات</SelectItem>
                <SelectItem value="3 ساعات">3 ساعات</SelectItem>
                <SelectItem value="1 يوم">1 يوم</SelectItem>
                <SelectItem value="2-3 أيام">2-3 أيام</SelectItem>
                <SelectItem value="1 أسبوع">1 أسبوع</SelectItem>
                <SelectItem value="2 أسابيع">2 أسابيع</SelectItem>
                <SelectItem value="1 شهر">1 شهر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="communicationMethod">طريقة التواصل</Label>
            <Select
              value={productData.serviceDetails.communicationMethod}
              onValueChange={(
                value: "email" | "phone" | "whatsapp" | "in_person",
              ) =>
                setProductData((prev) => ({
                  ...prev,
                  serviceDetails: {
                    ...prev.serviceDetails,
                    communicationMethod: value,
                  },
                }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="اختر طريقة التواصل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">واتساب</SelectItem>
                <SelectItem value="email">بريد إلكتروني</SelectItem>
                <SelectItem value="phone">مكالمة</SelectItem>
                <SelectItem value="in_person">حضوري</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="preparationTime">وقت التحضير</Label>
          <Input
            id="preparationTime"
            value={productData.serviceDetails.preparationTime}
            onChange={(e) =>
              setProductData((prev) => ({
                ...prev,
                serviceDetails: {
                  ...prev.serviceDetails,
                  preparationTime: e.target.value,
                },
              }))
            }
            placeholder="مثال: 30 دقيقة"
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// 🔥 مكون حقل صلاحية المنتج
const ExpiryInfoField = ({
  productData,
  setProductData,
  visible,
}: {
  productData: any;
  setProductData: React.Dispatch<React.SetStateAction<any>>;
  visible: boolean;
}) => {
  if (!visible) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          معلومات الصلاحية
        </CardTitle>
        <CardDescription>إعدادات تاريخ الصلاحية والتخزين</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="hasExpiryDate">هل المنتج له صلاحية؟</Label>
            <p className="text-sm text-gray-500">
              تحديد إذا كان المنتج له تاريخ انتهاء صلاحية
            </p>
          </div>
          <Switch
            id="hasExpiryDate"
            checked={productData.expiryInfo.hasExpiryDate}
            onCheckedChange={(checked) =>
              setProductData((prev) => ({
                ...prev,
                expiryInfo: { ...prev.expiryInfo, hasExpiryDate: checked },
              }))
            }
          />
        </div>

        {productData.expiryInfo.hasExpiryDate && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">تاريخ الانتهاء</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={productData.expiryInfo.expiryDate}
                  onChange={(e) =>
                    setProductData((prev) => ({
                      ...prev,
                      expiryInfo: {
                        ...prev.expiryInfo,
                        expiryDate: e.target.value,
                      },
                    }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="shelfLife">مدة الصلاحية</Label>
                <Input
                  id="shelfLife"
                  value={productData.expiryInfo.shelfLife}
                  onChange={(e) =>
                    setProductData((prev) => ({
                      ...prev,
                      expiryInfo: {
                        ...prev.expiryInfo,
                        shelfLife: e.target.value,
                      },
                    }))
                  }
                  placeholder="مثال: 7 أيام"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="storageInstructions">تعليمات التخزين</Label>
              <Textarea
                id="storageInstructions"
                value={productData.expiryInfo.storageInstructions}
                onChange={(e) =>
                  setProductData((prev) => ({
                    ...prev,
                    expiryInfo: {
                      ...prev.expiryInfo,
                      storageInstructions: e.target.value,
                    },
                  }))
                }
                placeholder="مثال: يحفظ في مكان جاف بعيداً عن الرطوبة"
                className="mt-1 min-h-[100px]"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// 🔥 مكون التحقق من الصحة - معدل
const ValidationDisplay = ({
  kindValidation,
}: {
  kindValidation: KindBasedValidation | null;
}) => {
  if (!kindValidation) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          نتائج التحقق من الصحة
        </CardTitle>
        <CardDescription>تحليل النظام لبيانات المنتج المدخلة</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {kindValidation.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>أخطاء يجب تصحيحها</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {kindValidation.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {kindValidation.warnings.length > 0 && (
            <Alert
              variant="default"
              className="bg-amber-50 border-amber-200 text-amber-800"
            >
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle>تحذيرات</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {kindValidation.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {kindValidation.suggestions.length > 0 && (
            <Alert
              variant="default"
              className="bg-blue-50 border-blue-200 text-blue-800"
            >
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertTitle>اقتراحات</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {kindValidation.suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {kindValidation.isValid &&
            kindValidation.errors.length === 0 &&
            kindValidation.warnings.length === 0 && (
              <Alert
                variant="default"
                className="bg-green-50 border-green-200 text-green-800"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>✅ جميع البيانات صالحة</AlertTitle>
                <AlertDescription>يمكنك متابعة حفظ المنتج</AlertDescription>
              </Alert>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

// 🔥 مكون متابعة الحقول المطلوبة
const RequiredFieldsIndicator = ({
  kindSelectionResult,
  productData,
}: {
  kindSelectionResult: ProductKindSelectionResult | null;
  productData: any;
}) => {
  if (!kindSelectionResult) return null;

  const requiredFields = kindSelectionResult.requiredFields || [];
  const completedFields = requiredFields.filter((field) => {
    const fieldPath = field.split(".");
    let value = productData;

    for (const key of fieldPath) {
      value = value?.[key];
      if (value === undefined || value === null || value === "") {
        return false;
      }
    }
    return true;
  });

  const completionPercentage =
    requiredFields.length > 0
      ? Math.round((completedFields.length / requiredFields.length) * 100)
      : 100;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          الحقول المطلوبة ({completedFields.length}/{requiredFields.length})
        </CardTitle>
        <CardDescription>نسبة الإكمال: {completionPercentage}%</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {requiredFields.map((field, index) => {
            const fieldPath = field.split(".");
            let value = productData;
            let isComplete = true;

            for (const key of fieldPath) {
              value = value?.[key];
              if (value === undefined || value === null || value === "") {
                isComplete = false;
                break;
              }
            }

            return (
              <div key={index} className="flex items-center gap-3">
                {isComplete ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <span
                  className={`text-sm ${isComplete ? "text-green-700" : "text-gray-600"}`}
                >
                  {field}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default function AddProduct() {
  const { userData } = useAuth();
  const { getUserStore } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentStore, setCurrentStore] = useState<ExtendedStore | null>(null);
  const [storeLoaded, setStoreLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("kind");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // 🔥 حالة نظام kind الجديد
  const [selectedKind, setSelectedKind] = useState<ProductKind | "">("");
  const [kindSelectionResult, setKindSelectionResult] =
    useState<ProductKindSelectionResult | null>(null);
  const [fieldVisibility, setFieldVisibility] =
    useState<FieldVisibility | null>(null);
  const [kindValidation, setKindValidation] =
    useState<KindBasedValidation | null>(null);

  // 🔥 حالة discovery الجديدة
  const [productTypeSuggestions, setProductTypeSuggestions] = useState<
    ProductTypeSuggestion[]
  >([]);
  const [selectedProductType, setSelectedProductType] = useState<string>("");
  const [detectionLoading, setDetectionLoading] = useState(false);
  const [complianceRecommendations, setComplianceRecommendations] = useState<
    ComplianceRecommendation[]
  >([]);
  const [complianceStatus, setComplianceStatus] = useState<{
    decision?: ComplianceDecision;
    status?: ProductStatus;
    message?: string;
    activityId?: string;
    isCompatible?: boolean;
  }>({});

  // ⭐ حالة المنتج الكاملة - محدثة مع حقول الزراعة
  const [productData, setProductData] = useState({
    // 🔥 الخطوة 1: نوع المنتج الأساسي
    kind: "" as ProductKind,

    // 🔥 المعلومات الأساسية (مطلوبة للجميع)
    name: "",
    description: "",
    shortDescription: "",
    price: 0,
    comparePrice: 0,
    costPrice: 0,

    // 🔥 التصنيف
    category: "",
    subCategory: "",

    // 🔥 العلامة التجارية
    brand: "",
    sku: `SKU-${Date.now()}`,

    // 🔥 الصور
    images: [] as string[],

    // 🔥 الحقول الشرطية (سيتم تفعيلها حسب kind)
    inventory: {
      quantity: 0,
      trackInventory: true,
      lowStockThreshold: 5,
      allowBackorders: false,
    },

    shipping: {
      requiresShipping: false,
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      shippingClass: "standard",
    },

    digitalDelivery: {
      enabled: false,
      files: [] as string[],
      autoSend: true,
      accessDuration: 365,
      fileFormat: "",
    },

    serviceDetails: {
      estimatedDuration: "",
      requiresCustomerInfo: false,
      communicationMethod: "whatsapp" as
        | "email"
        | "phone"
        | "whatsapp"
        | "in_person",
      preparationTime: "",
      maxOrdersPerDay: 0,
    },

    expiryInfo: {
      hasExpiryDate: false,
      expiryDate: "",
      shelfLife: "",
      storageInstructions: "",
      allergens: [] as string[],
    },

    // 🔥 المواصفات
    specifications: {} as Record<string, string>,

    // 🔥 الوسوم والكلمات المفتاحية
    tags: [] as string[],

    // 🔥 إدارة التخفيضات
    discount: {
      type: "none" as "percentage" | "fixed" | "none",
      value: 0,
      startDate: "",
      endDate: "",
      isActive: false,
    },

    // 🔥 إعدادات المنتج
    featured: false,
    status: ProductStatus.ACTIVE,
    visibility: "visible" as "visible" | "hidden" | "catalog" | "search",

    // 🔥 خيارات الضريبة
    taxable: true,
    taxClass: "standard",

    // 🔥 خيارات البيع
    soldIndividually: false,

    // 🔥 SEO
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [] as string[],

    // 🔥 خيارات إضافية
    warranty: "",
    returnPolicy: "",
    sizeGuide: "",

    // 🔥 مراجعات وتقييمات
    enableReviews: true,

    // 🔥 الحقول الجديدة للزراعة - المضافة
    agricultureType: "",
    isOrganic: false,
    usageInstructions: "",
    shelfLifeMonths: 12,
    certification: "",

    // 🔥 حالة مؤقتة
    newAllergen: "",
    newTag: "",
    newSeoKeyword: "",
    newSpec: { key: "", value: "" },
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // ⭐ حالة جديدة: إنشاء فئة جديدة
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] =
    useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: "",
    description: "",
    order: 0,
    isActive: true,
  });
  const [creatingCategory, setCreatingCategory] = useState(false);

  const storeFromState = location.state?.store;

  // 🔧 تحميل المتجر والبيانات
  useEffect(() => {
    const loadStoreAndData = async () => {
      console.log("🚀 بدء تحميل المتجر...");

      if (
        storeFromState &&
        storeFromState.id &&
        storeFromState.ownerId === userData?.uid
      ) {
        console.log("✅ استخدام المتجر من state:", storeFromState.name);
        setCurrentStore(storeFromState);
        await loadStoreData(storeFromState);
        setStoreLoaded(true);
        return;
      }

      console.log("🔍 جلب متجر المستخدم...");
      const userStore = await getUserStore();

      if (userStore) {
        console.log("✅ تم تحميل المتجر:", userStore.name);
        setCurrentStore(userStore);
        await loadStoreData(userStore);
      } else {
        console.log("❌ لم يتم العثور على متجر");
        toast({
          title: "لم يتم العثور على متجر",
          description: "يرجى إنشاء متجر أولاً",
          variant: "destructive",
        });
      }

      setStoreLoaded(true);
    };

    loadStoreAndData();
  }, [storeFromState, getUserStore, userData?.uid, toast]);

  // 🔧 تحميل بيانات المتجر
  const loadStoreData = async (store: ExtendedStore) => {
    try {
      console.log("📊 تحميل بيانات المتجر الكاملة...");
      await loadCategories(store.id);

      console.log("🏪 تفاصيل المتجر:", {
        name: store.name,
        industry: store.industry,
        businessActivities: store.businessActivities,
      });
    } catch (error) {
      console.error("❌ خطأ في تحميل بيانات المتجر:", error);
      toast({
        title: "خطأ في تحميل بيانات المتجر",
        description: "تعذر تحميل بيانات المتجر الكاملة",
        variant: "destructive",
      });
    }
  };

  // 🔧 تحميل الفئات
  const loadCategories = async (storeId: string) => {
    if (!storeId) {
      console.error("❌ لا يوجد معرف متجر لتحميل الفئات");
      return;
    }

    try {
      setIsLoadingCategories(true);
      console.log("📂 جلب الفئات للمتجر:", storeId);

      const loadedCategories = await getStoreCategoriesByStoreId(storeId);
      console.log("✅ الفئات المحملة:", loadedCategories.length);

      const sortedCategories = (loadedCategories || []).sort(
        (a: any, b: any) => a.order - b.order,
      );

      setCategories(sortedCategories);
    } catch (error) {
      console.error("❌ خطأ في تحميل الفئات:", error);
      toast({
        title: "خطأ في تحميل الفئات",
        description: "تعذر تحميل الفئات، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // 🔥 تأثير: عند اختيار kind
  const handleKindSelect = async (kind: ProductKind) => {
    setSelectedKind(kind);

    if (!currentStore) return;

    setLoading(true);
    try {
      // 🔍 الحصول على قواعد kind
      const result = await complianceSystem.handleProductKindSelection(
        kind,
        currentStore.id,
      );

      setKindSelectionResult(result);

      // 🔍 الحصول على إعدادات العرض
      const visibility = complianceSystem.getFieldVisibility(kind);
      setFieldVisibility(visibility);

      // 🔍 تحديث حالة المنتج
      setProductData((prev) => ({
        ...prev,
        kind: kind,
      }));

      // 🔍 الانتقال للخطوة التالية
      setActiveTab("basic");

      toast({
        title: `تم اختيار: ${PRODUCT_KINDS[kind].name}`,
        description: "الآن يمكنك إكمال باقي المعلومات",
        variant: "default",
      });
    } catch (error) {
      console.error("❌ خطأ في اختيار نوع المنتج:", error);
      toast({
        title: "خطأ في النظام",
        description: "حدث خطأ أثناء معالجة نوع المنتج",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔥 تأثير: التحقق من صحة البيانات حسب kind
  useEffect(() => {
    const validateData = () => {
      if (!selectedKind) return;

      const validation = complianceSystem.validateProductDataByKind(
        productData,
        selectedKind,
      );

      setKindValidation(validation);

      // عرض التحذيرات
      if (validation.warnings.length > 0) {
        console.log("⚠️ تحذيرات:", validation.warnings);
      }
    };

    validateData();
  }, [productData, selectedKind]);

  // 🔥 تأثير: كشف نوع المنتج التفصيلي
  useEffect(() => {
    const detectProductType = async () => {
      if (
        !selectedKind ||
        !productData.name ||
        productData.name.trim().length < 3
      ) {
        return;
      }

      setDetectionLoading(true);
      try {
        console.log("🔍 بدء كشف نوع المنتج التفصيلي...");

        const detection = await complianceSystem.detectDetailedProductType(
          {
            name: productData.name,
            description: productData.description,
            tags: productData.tags,
          },
          selectedKind,
        );

        if (detection.productType) {
          setSelectedProductType(detection.productType.id);

          // تحديث اقتراحات أنواع المنتجات
          const suggestions: ProductTypeSuggestion[] = [
            {
              id: detection.productType.id,
              name: detection.productType.name,
              activityId: detection.productType.activityId,
              confidence: detection.confidence,
              matchedKeywords: detection.matchedKeywords,
              icon: detection.productType.metadata?.icon,
              description: detection.productType.description,
            },
          ];

          // إضافة أنواع أخرى مقترحة
          const otherTypes = DEFAULT_PRODUCT_TYPES.filter(
            (pt) =>
              pt.activityId === detection.productType?.activityId &&
              pt.id !== detection.productType.id,
          )
            .slice(0, 2)
            .map((pt) => ({
              id: pt.id,
              name: pt.name,
              activityId: pt.activityId,
              confidence: 0.6,
              matchedKeywords: [],
              icon: pt.metadata?.icon,
              description: pt.description,
            }));

          setProductTypeSuggestions([...suggestions, ...otherTypes]);

          toast({
            title: `تم اكتشاف: ${detection.productType.name}`,
            description: `الثقة: ${Math.round(detection.confidence * 100)}%`,
            variant: "default",
          });
        }
      } catch (error) {
        console.error("❌ خطأ في كشف نوع المنتج:", error);
      } finally {
        setDetectionLoading(false);
      }
    };

    const timeoutId = setTimeout(detectProductType, 1500);
    return () => clearTimeout(timeoutId);
  }, [
    productData.name,
    productData.description,
    productData.tags,
    selectedKind,
  ]);

  // 🔥 دوال معالجة kind
  const resetKindSelection = () => {
    setSelectedKind("");
    setKindSelectionResult(null);
    setFieldVisibility(null);
    setKindValidation(null);
    setSelectedProductType("");
    setProductTypeSuggestions([]);
    setActiveTab("kind");

    setProductData((prev) => ({
      ...prev,
      kind: "" as ProductKind,
    }));
  };

  // 🔧 دوال الوسوم
  const addTag = () => {
    if (
      productData.newTag.trim() &&
      !productData.tags.includes(productData.newTag.trim())
    ) {
      setProductData((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: "",
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProductData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // 🔧 دوال المواصفات
  const addSpecification = () => {
    if (productData.newSpec.key.trim() && productData.newSpec.value.trim()) {
      setProductData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [prev.newSpec.key.trim()]: prev.newSpec.value.trim(),
        },
        newSpec: { key: "", value: "" },
      }));
    }
  };

  const removeSpecification = (keyToRemove: string) => {
    setProductData((prev) => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[keyToRemove];
      return {
        ...prev,
        specifications: newSpecs,
      };
    });
  };

  // 🔧 دوال كلمات SEO
  const addSeoKeyword = () => {
    if (
      productData.newSeoKeyword.trim() &&
      !productData.seoKeywords.includes(productData.newSeoKeyword.trim())
    ) {
      setProductData((prev) => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, prev.newSeoKeyword.trim()],
        newSeoKeyword: "",
      }));
    }
  };

  const removeSeoKeyword = (keywordToRemove: string) => {
    setProductData((prev) => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter(
        (keyword) => keyword !== keywordToRemove,
      ),
    }));
  };

  // 🔧 دالة رفع الصور
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    setUploadingImages(true);

    const promises = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then((base64Images) => {
        setProductData((prev) => ({
          ...prev,
          images: [...prev.images, ...base64Images],
        }));
        setImageFiles((prev) => [...prev, ...files]);
        setUploadingImages(false);

        toast({
          title: "تم رفع الصور بنجاح",
          description: `تم رفع ${files.length} صور`,
        });
      })
      .catch((error) => {
        console.error("Error uploading images:", error);
        setUploadingImages(false);
        toast({
          title: "خطأ في رفع الصور",
          description: "حدث خطأ أثناء رفع الصور",
          variant: "destructive",
        });
      });
  };

  const removeImage = (index: number) => {
    setProductData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 🔧 دالة إنشاء فئة جديدة
  const handleCreateNewCategory = async () => {
    if (!newCategoryData.name.trim()) {
      toast({
        title: "خطأ في الإدخال",
        description: "يرجى إدخال اسم الفئة",
        variant: "destructive",
      });
      return;
    }

    if (!currentStore?.id) {
      toast({
        title: "خطأ",
        description: "المتجر غير متوفر",
        variant: "destructive",
      });
      return;
    }

    setCreatingCategory(true);

    try {
      const existingCategory = categories.find(
        (cat) => cat.name.toLowerCase() === newCategoryData.name.toLowerCase(),
      );

      if (existingCategory) {
        toast({
          title: "فئة موجودة مسبقاً",
          description: `الفئة "${newCategoryData.name}" موجودة بالفعل`,
          variant: "destructive",
        });
        return;
      }

      const categoryData: any = {
        storeId: currentStore.id,
        name: newCategoryData.name.trim(),
        description: newCategoryData.description.trim(),
        order: newCategoryData.order || categories.length,
        isActive: true,
      };

      const categoryId = await createCategoryWithValidation(categoryData);

      toast({
        title: "تم إنشاء الفئة",
        description: `تم إنشاء الفئة "${newCategoryData.name}"`,
      });

      await loadCategories(currentStore.id);

      setProductData((prev) => ({
        ...prev,
        category: categoryId,
      }));

      setShowCreateCategoryDialog(false);
      setNewCategoryData({
        name: "",
        description: "",
        order: categories.length,
        isActive: true,
      });
    } catch (error: any) {
      console.error("Error creating category:", error);
      toast({
        title: "خطأ في إنشاء الفئة",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setCreatingCategory(false);
    }
  };

  // 🔥 دالة حفظ المنتج المحدثة مع تحسينات الزراعة
  const handleSaveProduct = async () => {
    if (!currentStore?.id) {
      toast({
        title: "خطأ في المتجر",
        description: "لم يتم العثور على بيانات المتجر",
        variant: "destructive",
      });
      return;
    }

    if (!userData?.uid) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "الرجاء تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    if (!selectedKind) {
      toast({
        title: "نوع المنتج مطلوب",
        description: "يجب اختيار نوع المنتج أولاً",
        variant: "destructive",
      });
      return;
    }

    const validation = complianceSystem.validateProductDataByKind(
      productData,
      selectedKind,
    );

    if (!validation.isValid) {
      toast({
        title: "بيانات غير صالحة",
        description: validation.errors.join("، "),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("🛒 إضافة منتج جديد بنظام kind:", {
        storeId: currentStore.id,
        kind: selectedKind,
        productType: selectedProductType,
        storeIndustry: currentStore.industry,
        productName: productData.name,
        userId: userData.uid,
        storeActivities: currentStore.businessActivities?.subActivities,
      });

      // 🔥 **بناء metadata بشكل صحيح للمنتجات الزراعية**
      let metadata: any = {};

      // إذا كان منتج زراعي
      const isAgricultureProduct =
        selectedProductType === "pt_agriculture_011" ||
        productData.agricultureType ||
        productData.name.toLowerCase().includes("سماد") ||
        productData.name.toLowerCase().includes("بذور") ||
        productData.name.toLowerCase().includes("زراع");

      if (isAgricultureProduct) {
        metadata.agricultureSpecific = {
          agricultureType: productData.agricultureType || "seeds",
          isOrganic: productData.isOrganic || false,
          usageInstructions: productData.usageInstructions || "",
          shelfLifeMonths: productData.shelfLifeMonths || 12,
          certification: productData.certification || "",
          addedAt: new Date().toISOString(),
          source: "AddProduct form",
        };

        console.log("🌱 إعداد metadata زراعية:", metadata.agricultureSpecific);
      }

      // 🔥 **إنشاء كائن المنتج الكامل المتوافق مع firestore.ts**
      const productToCreate = {
        // الحقول الأساسية
        name: productData.name,
        description: productData.description,
        shortDescription: productData.shortDescription || undefined,
        price: productData.price,
        comparePrice: productData.comparePrice || undefined,
        costPrice: productData.costPrice || undefined,
        category: productData.category || undefined,
        subCategory: productData.subCategory || undefined,
        brand: productData.brand || undefined,
        sku: productData.sku,
        images:
          productData.images.length > 0
            ? productData.images
            : ["/placeholder-product.jpg"],
        specifications: productData.specifications || {},
        tags: productData.tags || [],
        featured: productData.featured || false,
        status: ProductStatus.DRAFT, // ✅ يبدأ كمسودة، النظام سيحدد حالته النهائية
        visibility: productData.visibility || "visible",

        // الضرائب
        tax: {
          taxable: productData.taxable !== false,
          taxClass: productData.taxClass || "standard",
        },

        soldIndividually: productData.soldIndividually || false,

        // SEO
        seo: {
          title:
            productData.seoTitle || productData.name.substring(0, 60) || "",
          description:
            productData.seoDescription ||
            productData.description.substring(0, 160) ||
            "",
          keywords: productData.seoKeywords || [],
        },

        warranty: productData.warranty || undefined,
        returnPolicy: productData.returnPolicy || undefined,
        sizeGuide: productData.sizeGuide || undefined,
        reviewsEnabled: productData.enableReviews !== false,

        // الحقول الشرطية حسب kind
        ...(fieldVisibility?.showInventory && {
          inventory: {
            quantity: productData.inventory.quantity || 0,
            sku: productData.sku,
            trackInventory: productData.inventory.trackInventory !== false,
            lowStockThreshold: productData.inventory.lowStockThreshold || 5,
            backorders: productData.inventory.allowBackorders || false,
          },
        }),

        ...(fieldVisibility?.showShipping && {
          shipping: {
            requiresShipping: productData.shipping.requiresShipping !== false,
            weight: productData.shipping.weight || undefined,
            dimensions:
              productData.shipping.length &&
              productData.shipping.width &&
              productData.shipping.height
                ? {
                    length: productData.shipping.length,
                    width: productData.shipping.width,
                    height: productData.shipping.height,
                  }
                : undefined,
            shippingClass: productData.shipping.shippingClass || "standard",
          },
        }),

        ...(fieldVisibility?.showDigitalDelivery && {
          digitalDelivery: {
            enabled: productData.digitalDelivery.enabled !== false,
            files: productData.digitalDelivery.files || [],
            autoSend: productData.digitalDelivery.autoSend !== false,
            accessDuration: productData.digitalDelivery.accessDuration || 365,
          },
        }),

        ...(fieldVisibility?.showServiceDetails && {
          serviceDetails: {
            estimatedDuration:
              productData.serviceDetails.estimatedDuration || "",
            requiresCustomerInfo:
              productData.serviceDetails.requiresCustomerInfo !== false,
            communicationMethod:
              productData.serviceDetails.communicationMethod || "whatsapp",
            preparationTime:
              productData.serviceDetails.preparationTime || undefined,
            maxOrdersPerDay:
              productData.serviceDetails.maxOrdersPerDay || undefined,
          },
        }),

        ...(fieldVisibility?.showExpiryDate && {
          expiryInfo: {
            hasExpiryDate: productData.expiryInfo.hasExpiryDate || false,
            expiryDate: productData.expiryInfo.expiryDate
              ? new Date(productData.expiryInfo.expiryDate)
              : undefined,
            shelfLife: productData.expiryInfo.shelfLife || undefined,
            storageInstructions:
              productData.expiryInfo.storageInstructions || undefined,
            allergens: productData.expiryInfo.allergens || [],
          },
        }),

        // الخصومات
        ...(productData.discount.isActive && {
          discount: {
            type: productData.discount.type,
            value: productData.discount.value,
            startDate: productData.discount.startDate
              ? new Date(productData.discount.startDate)
              : undefined,
            endDate: productData.discount.endDate
              ? new Date(productData.discount.endDate)
              : undefined,
            isActive: true,
            originalPrice: productData.comparePrice || productData.price,
            salePrice: productData.price,
          },
        }),

        // الإحصائيات
        stats: {
          views: 0,
          sales: 0,
          wishlistCount: 0,
        },

        // الحقول المطلوبة للنظام
        kind: selectedKind,
        storeId: currentStore.id,
        ownerId: userData.uid,

        // 🔥 metadata للمنتجات الزراعية (فقط إذا كانت موجودة)
        ...(Object.keys(metadata).length > 0 && { metadata }),

        // الحقول الإضافية للتتبع
        _createdFrom: "add_product_page_v4",
        _creationTime: new Date().toISOString(),
      };

      // 🔥 **إضافة tags تلقائية للمنتجات الزراعية**
      if (isAgricultureProduct) {
        const agricultureTags = [
          "زراعة",
          "منتج زراعي",
          "بذور",
          "سماد",
          "زراعي",
        ];
        const currentTags = productToCreate.tags || [];
        const newTags = [...new Set([...currentTags, ...agricultureTags])];
        productToCreate.tags = newTags;
        console.log("🏷️ إضافة وسوم زراعية:", newTags);
      }

      console.log("📤 إرسال بيانات المنتج إلى productService.create():", {
        name: productToCreate.name,
        kind: productToCreate.kind,
        hasMetadata: !!productToCreate.metadata,
        agricultureSpecific: productToCreate.metadata?.agricultureSpecific,
        storeId: productToCreate.storeId,
        // تأكد من عدم إرسال الحقول المحجوزة
        _semantics: undefined, // ✅ لا ترسل، النظام يبنيها
        createdAt: undefined, // ✅ لا ترسل، النظام يضيفها
        updatedAt: undefined, // ✅ لا ترسل، النظام يضيفها
      });

      // 🔥 **إرسال المنتج للنظام**
      const result = await productService.create(productToCreate, {
        forceProductTypeId: selectedProductType || undefined,
        skipKindValidation: true, // ✅ تم التحقق مسبقاً
      });

      console.log("✅ تم إضافة المنتج بنجاح:", {
        productId: result.id,
        productName: productData.name,
        kind: result.kind,
        decision: result.decision,
        status: result.status,
        detectedActivity: result.detectedActivity,
        productType: result.productType?.name,
        warnings: result.warnings?.length || 0,
        shadowActions: result.shadowActions,
      });

      // 🔥 **رسائل خاصة بناءً على النتيجة**
      if (result.decision === ComplianceDecision.BLOCK) {
        toast({
          title: "🚫 المنتج مرفوض",
          description: "المنتج يحتوي على مخالفات خطيرة",
          variant: "destructive",
        });
        return;
      } else if (result.decision === ComplianceDecision.REVIEW_REQUIRED) {
        toast({
          title: "⚠️ المنتج تحت المراجعة",
          description: "سيتم مراجعة المنتج قبل نشره في المتجر",
          variant: "default",
        });
      } else {
        toast({
          title: "✅ تم إنشاء المنتج بنجاح!",
          description: `"${productData.name}" ${result.status === ProductStatus.ACTIVE ? "نشط الآن في متجرك" : "في انتظار المراجعة"}`,
          variant: "default",
        });

        // 🔥 **رسالة خاصة للمنتجات الزراعية**
        if (isAgricultureProduct) {
          setTimeout(() => {
            toast({
              title: "🌱 منتج زراعي",
              description: "تم حفظ المنتج الزراعي مع متطلبات الامتثال الخاصة",
              variant: "default",
            });
          }, 1000);
        }
      }

      // الانتقال بعد 2 ثوانٍ
      setTimeout(() => {
        navigate("/merchant/products");
      }, 2000);
    } catch (error: any) {
      console.error("❌ خطأ في إنشاء المنتج:", {
        message: error.message,
        stack: error.stack,
        userId: userData?.uid,
        storeId: currentStore?.id,
        productName: productData.name,
        agricultureType: productData.agricultureType,
        selectedProductType: selectedProductType,
      });

      toast({
        title: "خطأ في إنشاء المنتج",
        description: error.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔧 دالة الانتقال لإنشاء متجر
  const goToCreateStore = () => {
    navigate("/merchant/stores/create", {
      state: { from: location.pathname },
    });
  };

  // عرض حالة عدم وجود متجر
  if (!currentStore && storeLoaded) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Store className="h-6 w-6" />
              متجر غير موجود
            </CardTitle>
            <CardDescription>
              تحتاج إلى إنشاء متجر قبل إضافة منتجات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              لم يتم العثور على متجر نشط لحسابك. يرجى إنشاء متجر أولاً لإضافة
              منتجات.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={goToCreateStore} className="gap-2">
              <Plus className="h-4 w-4" />
              إنشاء متجر جديد
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/merchant/dashboard")}
              className="ml-4"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للرئيسية
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/merchant/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة للرئيسية
        </Button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">إضافة منتج جديد</h1>
            <p className="text-gray-600 mt-2">
              {currentStore
                ? `لمتجر: ${currentStore.name}`
                : "جارٍ تحميل بيانات المتجر..."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {selectedKind && (
              <Badge className="text-sm px-3 py-1">
                <span className="mr-2">{PRODUCT_KINDS[selectedKind].icon}</span>
                {PRODUCT_KINDS[selectedKind].name}
              </Badge>
            )}
            <Button
              onClick={() => navigate("/merchant/products")}
              variant="outline"
              className="gap-2"
            >
              <Package className="h-4 w-4" />
              جميع المنتجات
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="kind" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            نوع المنتج
          </TabsTrigger>
          <TabsTrigger
            value="basic"
            disabled={!selectedKind}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            المعلومات الأساسية
          </TabsTrigger>
          <TabsTrigger
            value="advanced"
            disabled={!selectedKind}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            خيارات متقدمة
          </TabsTrigger>
          <TabsTrigger
            value="review"
            disabled={!selectedKind}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            المراجعة النهائية
          </TabsTrigger>
        </TabsList>

        {/* 🔥 تبويب اختيار نوع المنتج */}
        <TabsContent value="kind" className="space-y-6">
          <ProductKindSelector
            selectedKind={selectedKind}
            onSelectKind={handleKindSelect}
            onResetKind={resetKindSelection}
          />

          {selectedKind && kindSelectionResult && (
            <KindStatusDisplay
              selectedKind={selectedKind}
              kindSelectionResult={kindSelectionResult}
              onResetKind={resetKindSelection}
            />
          )}

          {selectedKind && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        ✅ تم اختيار نوع المنتج
                      </h3>
                      <p className="text-gray-600">
                        يمكنك الآن المتابعة لإكمال باقي المعلومات
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setActiveTab("basic")}
                    className="gap-2"
                  >
                    التالي: المعلومات الأساسية
                    <ChevronDown className="h-4 w-4 rotate-90" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 🔥 تبويب المعلومات الأساسية */}
        <TabsContent value="basic" className="space-y-6">
          <ValidationDisplay kindValidation={kindValidation} />

          {kindSelectionResult && (
            <RequiredFieldsIndicator
              kindSelectionResult={kindSelectionResult}
              productData={productData}
            />
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                المعلومات الأساسية
              </CardTitle>
              <CardDescription>
                أدخل المعلومات الأساسية للمنتج (مطلوبة للجميع)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">اسم المنتج *</Label>
                <Input
                  id="name"
                  value={productData.name}
                  onChange={(e) =>
                    setProductData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="أدخل اسم المنتج"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">وصف المنتج *</Label>
                <Textarea
                  id="description"
                  value={productData.description}
                  onChange={(e) =>
                    setProductData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="أدخل وصفًا مفصلاً للمنتج"
                  className="mt-1 min-h-[150px]"
                />
                <p className="text-sm text-gray-500 mt-1">
                  يجب أن يكون الوصف على الأقل{" "}
                  {kindSelectionResult?.validationRules.minDescriptionLength ||
                    50}{" "}
                  حرفًا
                </p>
              </div>

              <div>
                <Label htmlFor="shortDescription">وصف مختصر</Label>
                <Textarea
                  id="shortDescription"
                  value={productData.shortDescription}
                  onChange={(e) =>
                    setProductData((prev) => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                  placeholder="أدخل وصفًا مختصرًا للمنتج"
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">السعر (ريال) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={productData.price}
                    onChange={(e) =>
                      setProductData((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="comparePrice">سعر المقارنة</Label>
                  <Input
                    id="comparePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={productData.comparePrice}
                    onChange={(e) =>
                      setProductData((prev) => ({
                        ...prev,
                        comparePrice: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="costPrice">سعر التكلفة</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={productData.costPrice}
                    onChange={(e) =>
                      setProductData((prev) => ({
                        ...prev,
                        costPrice: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">الفئة</Label>
                  <div className="flex gap-2 mt-1">
                    <Select
                      value={productData.category}
                      onValueChange={(value) =>
                        setProductData((prev) => ({
                          ...prev,
                          category: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر فئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-categories" disabled>
                            لا توجد فئات
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateCategoryDialog(true)}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      جديد
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="brand">العلامة التجارية</Label>
                  <Input
                    id="brand"
                    value={productData.brand}
                    onChange={(e) =>
                      setProductData((prev) => ({
                        ...prev,
                        brand: e.target.value,
                      }))
                    }
                    placeholder="اسم العلامة التجارية"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sku">رمز SKU</Label>
                <Input
                  id="sku"
                  value={productData.sku}
                  onChange={(e) =>
                    setProductData((prev) => ({
                      ...prev,
                      sku: e.target.value,
                    }))
                  }
                  placeholder="رمز المخزون الفريد"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* 🔥 مكون اقتراحات نوع المنتج - مضافة */}
          {selectedKind && productData.name && productData.name.length >= 2 && (
            <ProductTypeSuggestions
              name={productData.name}
              description={productData.description}
              tags={productData.tags}
              selectedKind={selectedKind}
              selectedProductType={selectedProductType}
              onSelectProductType={(productTypeId) => {
                setSelectedProductType(productTypeId);

                // إذا كان نوع زراعي، أضف وسوم تلقائية
                if (productTypeId === "pt_agriculture_011") {
                  const agricultureTags = ["زراعة", "نباتات", "منتج زراعي"];
                  const currentTags = productData.tags;
                  const newTags = [
                    ...new Set([...currentTags, ...agricultureTags]),
                  ];

                  setProductData((prev) => ({
                    ...prev,
                    tags: newTags,
                  }));
                }

                toast({
                  title: "تم تحديد نوع المنتج",
                  description: "سيتم استخدام هذا النوع في تقييم الامتثال",
                  variant: "default",
                });
              }}
            />
          )}

          {/* 🔥 مكون الحقول الخاصة بالزراعة - مضافة */}
          <AgricultureSpecificFields
            productData={productData}
            setProductData={setProductData}
            visible={selectedProductType === "pt_agriculture_011"}
          />

          {/* 🔥 الحقول الشرطية حسب نوع المنتج */}
          {selectedKind && fieldVisibility && (
            <>
              <InventoryField
                productData={productData}
                setProductData={setProductData}
                visible={fieldVisibility.showInventory}
              />

              <ShippingField
                productData={productData}
                setProductData={setProductData}
                visible={fieldVisibility.showShipping}
              />

              <DigitalDeliveryField
                productData={productData}
                setProductData={setProductData}
                visible={fieldVisibility.showDigitalDelivery}
              />

              <ServiceDetailsField
                productData={productData}
                setProductData={setProductData}
                visible={fieldVisibility.showServiceDetails}
              />

              <ExpiryInfoField
                productData={productData}
                setProductData={setProductData}
                visible={fieldVisibility.showExpiryDate}
              />
            </>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setActiveTab("kind")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              السابق
            </Button>
            <Button onClick={() => setActiveTab("advanced")} className="gap-2">
              التالي: خيارات متقدمة
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Button>
          </div>
        </TabsContent>

        {/* 🔥 تبويب الخيارات المتقدمة */}
        <TabsContent value="advanced" className="space-y-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                صور المنتج
              </CardTitle>
              <CardDescription>
                أضف صورًا واضحة وعالية الجودة للمنتج
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">اسحب وأفلت الصور هنا أو</p>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() =>
                      document.getElementById("imageUpload")?.click()
                    }
                  >
                    <Upload className="h-4 w-4" />
                    اختر صور
                  </Button>
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <p className="text-sm text-gray-500 mt-4">
                    يمكنك رفع صور JPG، PNG حتى 5MB لكل صورة
                  </p>
                </div>

                {uploadingImages && (
                  <div className="text-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                    <p className="text-gray-600 mt-2">جارٍ رفع الصور...</p>
                  </div>
                )}

                {productData.images.length > 0 && (
                  <div>
                    <Label>الصور المرفوعة ({productData.images.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      {productData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center rounded-b-lg">
                            {index === 0 ? "صورة رئيسية" : `صورة ${index + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                الوسوم والكلمات المفتاحية
              </CardTitle>
              <CardDescription>
                أضف وسومًا لمساعدة العملاء في العثور على منتجك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>الوسوم</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="أضف وسم"
                    value={productData.newTag}
                    onChange={(e) =>
                      setProductData((prev) => ({
                        ...prev,
                        newTag: e.target.value,
                      }))
                    }
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button onClick={addTag} type="button">
                    إضافة
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {productData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>كلمات SEO</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="أضف كلمة مفتاحية"
                    value={productData.newSeoKeyword}
                    onChange={(e) =>
                      setProductData((prev) => ({
                        ...prev,
                        newSeoKeyword: e.target.value,
                      }))
                    }
                    onKeyPress={(e) => e.key === "Enter" && addSeoKeyword()}
                  />
                  <Button onClick={addSeoKeyword} type="button">
                    إضافة
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {productData.seoKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeSeoKeyword(keyword)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>المواصفات</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                  <Input
                    placeholder="اسم المواصفة"
                    value={productData.newSpec.key}
                    onChange={(e) =>
                      setProductData((prev) => ({
                        ...prev,
                        newSpec: { ...prev.newSpec, key: e.target.value },
                      }))
                    }
                  />
                  <Input
                    placeholder="قيمة المواصفة"
                    value={productData.newSpec.value}
                    onChange={(e) =>
                      setProductData((prev) => ({
                        ...prev,
                        newSpec: { ...prev.newSpec, value: e.target.value },
                      }))
                    }
                    onKeyPress={(e) => e.key === "Enter" && addSpecification()}
                  />
                </div>
                <div className="mt-2">
                  <Button onClick={addSpecification} type="button" size="sm">
                    إضافة مواصفة
                  </Button>
                </div>
                <div className="space-y-2 mt-4">
                  {Object.entries(productData.specifications).map(
                    ([key, value], index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span className="font-medium">{key}</span>
                        <span className="text-gray-600">{value}</span>
                        <button
                          type="button"
                          onClick={() => removeSpecification(key)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setActiveTab("basic")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              السابق
            </Button>
            <Button onClick={() => setActiveTab("review")} className="gap-2">
              التالي: المراجعة النهائية
              <ChevronDown className="h-4 w-4 rotate-90" />
            </Button>
          </div>
        </TabsContent>

        {/* 🔥 تبويب المراجعة النهائية */}
        <TabsContent value="review" className="space-y-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Eye className="h-6 w-6" />
                المراجعة النهائية
              </CardTitle>
              <CardDescription>
                راجع جميع المعلومات قبل حفظ المنتج
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">
                      {selectedKind ? PRODUCT_KINDS[selectedKind].icon : "📦"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {productData.name || "اسم المنتج"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge>
                        {selectedKind
                          ? PRODUCT_KINDS[selectedKind].name
                          : "غير محدد"}
                      </Badge>
                      <Badge variant="outline">
                        {productData.price
                          ? `${productData.price} ريال`
                          : "السعر"}
                      </Badge>
                      {selectedProductType && (
                        <Badge variant="secondary">
                          {DEFAULT_PRODUCT_TYPES.find(
                            (pt) => pt.id === selectedProductType,
                          )?.name || "نوع محدد"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 text-gray-700">
                      المعلومات الأساسية
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">الاسم:</span>
                        <span className="font-medium">
                          {productData.name || "غير محدد"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">السعر:</span>
                        <span className="font-medium">
                          {productData.price} ريال
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الفئة:</span>
                        <span className="font-medium">
                          {categories.find((c) => c.id === productData.category)
                            ?.name || "غير محدد"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">العلامة التجارية:</span>
                        <span className="font-medium">
                          {productData.brand || "غير محدد"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 text-gray-700">
                      إعدادات النوع
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">نوع المنتج:</span>
                        <Badge>
                          {selectedKind
                            ? PRODUCT_KINDS[selectedKind].name
                            : "غير محدد"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">مستوى الامتثال:</span>
                        <Badge
                          variant={
                            kindSelectionResult?.complianceLevel === "high"
                              ? "destructive"
                              : kindSelectionResult?.complianceLevel ===
                                  "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {kindSelectionResult?.complianceLevel === "high"
                            ? "عالي"
                            : kindSelectionResult?.complianceLevel === "medium"
                              ? "متوسط"
                              : "منخفض"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الحقول المطلوبة:</span>
                        <span className="font-medium">
                          {kindSelectionResult?.requiredFields.length || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الحالة:</span>
                        <Badge
                          className={
                            kindSelectionResult?.allowed
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {kindSelectionResult?.allowed
                            ? "✅ مسموح"
                            : "❌ غير مسموح"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* معلومات الزراعة إذا كانت موجودة */}
                {selectedProductType === "pt_agriculture_011" && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h4 className="font-medium mb-3 text-gray-700">
                        معلومات الزراعة
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">نوع المنتج:</span>
                          <span className="font-medium">
                            {productData.agricultureType || "غير محدد"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">منتج عضوي:</span>
                          <span className="font-medium">
                            {productData.isOrganic ? "نعم" : "لا"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">مدة الصلاحية:</span>
                          <span className="font-medium">
                            {productData.shelfLifeMonths} شهر
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {kindValidation && (
                  <>
                    <Separator className="my-6" />

                    <div>
                      <h4 className="font-medium mb-3 text-gray-700">
                        نتائج التحقق
                      </h4>
                      <div className="space-y-3">
                        {kindValidation.errors.length > 0 && (
                          <Alert variant="destructive">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4" />
                              <span>أخطاء: {kindValidation.errors.length}</span>
                            </div>
                          </Alert>
                        )}

                        {kindValidation.warnings.length > 0 && (
                          <Alert variant="default">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              <span>
                                تحذيرات: {kindValidation.warnings.length}
                              </span>
                            </div>
                          </Alert>
                        )}

                        {kindValidation.suggestions.length > 0 && (
                          <Alert className="bg-blue-50 border-blue-200">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="h-4 w-4 text-blue-600" />
                              <span className="text-blue-800">
                                اقتراحات: {kindValidation.suggestions.length}
                              </span>
                            </div>
                          </Alert>
                        )}

                        {kindValidation.isValid && (
                          <Alert className="bg-green-50 border-green-200">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-green-800">
                                ✅ جميع البيانات صالحة
                              </span>
                            </div>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <ValidationDisplay kindValidation={kindValidation} />

              <Alert className="bg-blue-50 border-blue-200">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">ملاحظة هامة</AlertTitle>
                <AlertDescription className="text-blue-700">
                  سيتم فحص المنتج تلقائيًا بواسطة نظام الامتثال الذكي. المنتجات
                  الزراعية المكتملة تحصل على موافقة تلقائية.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row gap-4 justify-between border-t pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>
                    سيتم التحقق من المنتج تلقائيًا من قبل نظام الامتثال
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>قد يستغرق التحقق بضع ثوانٍ</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("advanced")}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  السابق
                </Button>
                <Button
                  onClick={handleSaveProduct}
                  disabled={loading || !kindValidation?.isValid}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      حفظ المنتج
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 🔥 نافذة إنشاء فئة جديدة */}
      <Dialog
        open={showCreateCategoryDialog}
        onOpenChange={setShowCreateCategoryDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إنشاء فئة جديدة</DialogTitle>
            <DialogDescription>أضف فئة جديدة لمنتجات متجرك</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="categoryName">اسم الفئة *</Label>
              <Input
                id="categoryName"
                value={newCategoryData.name}
                onChange={(e) =>
                  setNewCategoryData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="أدخل اسم الفئة"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="categoryDescription">وصف الفئة</Label>
              <Textarea
                id="categoryDescription"
                value={newCategoryData.description}
                onChange={(e) =>
                  setNewCategoryData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="أدخل وصفًا للفئة"
                className="mt-1 min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="categoryOrder">ترتيب العرض</Label>
              <Input
                id="categoryOrder"
                type="number"
                min="0"
                value={newCategoryData.order}
                onChange={(e) =>
                  setNewCategoryData((prev) => ({
                    ...prev,
                    order: parseInt(e.target.value) || 0,
                  }))
                }
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateCategoryDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCreateNewCategory}
              disabled={creatingCategory}
            >
              {creatingCategory ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الإنشاء...
                </>
              ) : (
                "إنشاء الفئة"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
