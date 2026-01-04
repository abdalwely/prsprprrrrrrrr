// D:\New folder (2)\store\client\pages\merchant\merchant-dashboard\components\DesignTab.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Icons
import {
  Store as StoreIcon,
  Palette,
  Layout,
  Globe,
  FileText,
  AlertCircle,
  Link as LinkIcon,
  DollarSign,
  Wifi as WifiIcon,
  Save,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Building,
  FileDigit,
  Settings,
  Shield,
  FileCheck,
  Activity,
  BarChart,
  Target,
  AlertTriangle,
  CheckSquare,
  XSquare,
  Eye,
  Download,
  Printer,
  Copy,
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  Users,
  Package,
  Truck,
  CreditCard,
  Lock,
  Bell,
  Moon,
  Sun,
  UploadCloud,
  X,
  Plus,
  Minus,
  ExternalLink,
  Check,
  ChevronRight,
  Info,
  HelpCircle,
  ShoppingCart,
  Search,
  Home,
  Star,
  ShoppingBag,
  Filter,
  Grid,
  Type,
  Layers,
  Droplets,
  Maximize2,
  Minimize2,
  Box,
  PaintBucket,
  Brush,
  Crop,
  Frame,
  Sparkles,
  Zap,
  Wrench,
  Cog,
  Sliders,
  MousePointerClick,
  Camera,
  Video,
  Headphones,
  Volume2,
  Megaphone,
  Flag,
  ShieldCheck,
  Key,
  Fingerprint,
  Ticket,
  Gift,
  Trophy,
  Crown,
  Gem,
  Coins,
  Wallet,
  Receipt,
  PieChart,
  LineChart,
  TrendingUp as TrendingUpIcon,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  MoveLeft,
  MoveRight,
  MoveUp,
  MoveDown,
  RotateCcw,
  Repeat,
  Loader2,
  BadgeCheck,
  Crown as CrownIcon,
  Zap as ZapIcon,
  Target as TargetIcon,
  XCircle,
  User,
  LogOut,
  LogIn,
  Key as KeyIcon,
  AlertCircle as AlertCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  X as XIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
  Maximize as MaximizeIcon,
  ExternalLink as ExternalLinkIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Printer as PrinterIcon,
  Camera as CameraIcon,
  Film,
  Headphones as HeadphonesIcon,
  Volume2 as Volume2Icon,
  Bell as BellIcon,
  Award as AwardIcon,
  Trophy as TrophyIcon,
  Crown as CrownIcon2,
  Gem as GemIcon,
  Coins as CoinsIcon,
  Wallet as WalletIcon,
  Receipt as ReceiptIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
} from "lucide-react";

// Types and Services
import { Store } from "@/lib/src";
import { storeService } from "@/lib/src";
import { toast } from "sonner";
import {
  createBasicCustomization,
  ensureEnhancedCustomization,
} from "@/lib/src/types";

// Types
interface DesignTabProps {
  store: Store;
  loadMerchantData: () => Promise<void>;
  subActiveTab: string;
  setSubActiveTab: (tabId: string) => void;
}

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  type:
    | "store"
    | "design"
    | "business"
    | "compliance"
    | "contact"
    | "shipping"
    | "payment"
    | "taxes";
}

// Constants - متوافقة مع storeService
const YEMENI_GOVERNORATES = [
  "أبين",
  "عدن",
  "المهرة",
  "المحويت",
  "عمران",
  "البيضاء",
  "الضالع",
  "حضرموت",
  "حجة",
  "إب",
  "الجوف",
  "لحج",
  "مأرب",
  "ريمة",
  "صعدة",
  "صنعاء",
  "شبوة",
  "تعز",
  "الحديدة",
  "ذمار",
];

const INDUSTRIES = [
  { value: "general", label: "عام" },
  { value: "electronics", label: "إلكترونيات" },
  { value: "fashion", label: "أزياء وموضة" },
  { value: "home", label: "منزل ومطبخ" },
  { value: "beauty", label: "جمال والعناية" },
  { value: "food", label: "مواد غذائية" },
  { value: "health", label: "صحة ولياقة" },
  { value: "books", label: "كتب وتعليم" },
  { value: "automotive", label: "سيارات وقطع غيار" },
  { value: "sports", label: "رياضة ولياقة" },
];

const CURRENCIES = [
  { value: "YER", label: "ريال يمني (ر.ي)" },
  { value: "SAR", label: "ريال سعودي (ر.س)" },
  { value: "USD", label: "دولار أمريكي ($)" },
  { value: "AED", label: "درهم إماراتي (د.إ)" },
  { value: "QAR", label: "ريال قطري (ر.ق)" },
  { value: "KWD", label: "دينار كويتي (د.ك)" },
];

const LANGUAGES = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "الإنجليزية" },
];

const TIMEZONES = [
  { value: "Asia/Aden", label: "اليمن (Asia/Aden)" },
  { value: "Asia/Riyadh", label: "السعودية (Asia/Riyadh)" },
  { value: "Asia/Dubai", label: "الإمارات (Asia/Dubai)" },
  { value: "Asia/Kuwait", label: "الكويت (Asia/Kuwait)" },
  { value: "Asia/Qatar", label: "قطر (Asia/Qatar)" },
  { value: "UTC", label: "التوقيت العالمي (UTC)" },
];

const BUSINESS_TYPES = [
  { value: "retail", label: "تجارة تجزئة" },
  { value: "wholesale", label: "تجارة جملة" },
  { value: "manufacturing", label: "تصنيع" },
  { value: "services", label: "خدمات" },
  { value: "import_export", label: "استيراد/تصدير" },
  { value: "online_retail", label: "تجزئة إلكترونية" },
  { value: "dropshipping", label: "دروبشيبينغ" },
];

const LEGAL_STRUCTURES = [
  { value: "sole_proprietorship", label: "مؤسسة فردية" },
  { value: "llc", label: "شركة ذات مسؤولية محدودة" },
  { value: "joint_stock", label: "شركة مساهمة" },
  { value: "partnership", label: "شركة تضامن" },
  { value: "cooperative", label: "جمعية تعاونية" },
];

const DEVIATION_TYPES = [
  { value: "price_variation", label: "تغير في الأسعار" },
  { value: "product_variation", label: "اختلاف في المنتجات" },
  { value: "delivery_time", label: "تغير في أوقات التوصيل" },
  { value: "warranty_terms", label: "شروط الضمان" },
  { value: "return_policy", label: "سياسة الإرجاع" },
];

// Design Constants
const FONT_FAMILIES = [
  { value: "Tajawal", label: "Tajawal" },
  { value: "Cairo", label: "Cairo" },
  { value: "Almarai", label: "Almarai" },
  { value: "IBM Plex Sans Arabic", label: "IBM Plex Sans Arabic" },
  { value: "Noto Sans Arabic", label: "Noto Sans Arabic" },
  { value: "Inter", label: "Inter" },
];

const COLORS = [
  { value: "#3b82f6", label: "أزرق" },
  { value: "#10b981", label: "أخضر" },
  { value: "#8b5cf6", label: "بنفسجي" },
  { value: "#f59e0b", label: "برتقالي" },
  { value: "#ef4444", label: "أحمر" },
  { value: "#06b6d4", label: "سماوي" },
];

// Custom Icons Components (لأيقونات غير مستوردة)
const SmartphoneIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
    <path d="M12 18h.01" />
  </svg>
);

const BanknoteIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="12" x="2" y="6" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

export default function DesignTab({
  store,
  loadMerchantData,
  subActiveTab,
  setSubActiveTab,
}: DesignTabProps) {
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [newSubActivity, setNewSubActivity] = useState("");
  const [allowedDeviation, setAllowedDeviation] = useState("");

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: "",
    message: "",
    onConfirm: async () => {},
    type: "store",
  });

  // Form States - تتوافق مع Store في Firestore
  const [storeData, setStoreData] = useState({
    // الحقول الأساسية
    name: store.name || "",
    description: store.description || "",
    industry: store.industry || "general",
    taxNumber: store.taxNumber || "",
    commercialRegistration: store.commercialRegistration || "",

    // العملة واللغة والمنطقة الزمنية
    currency: store.currency || "YER",
    language: store.language || "ar",
    timezone: store.timezone || "Asia/Aden",

    // الأنشطة التجارية
    businessActivities: store.businessActivities || {
      mainActivity: "retail",
      subActivities: [],
      registrationNumber: `REG-${Date.now()}`,
      taxNumber: "",
      issueDate: new Date(),
      expiryDate: undefined,
      businessType: "retail",
      industry: "general",
      legalStructure: "sole_proprietorship",
    },

    // إعدادات الامتثال
    complianceSettings: store.complianceSettings || {
      autoDetection: true,
      strictMode: false,
      notifyOnViolation: true,
      allowedDeviations: [],
      reviewThreshold: 10,
    },

    // معلومات الاتصال
    contact: store.contact || {
      phone: "",
      email: "",
      address: "",
      city: "",
      governorate: "",
      country: "اليمن",
      zipCode: "",
      originalCity: "",
    },

    // إعدادات الشحن
    shipping: store.settings?.shipping || {
      enabled: false,
      freeShippingThreshold: 0,
      shippingCost: 0,
      defaultCost: 0,
      zones: [],
      methods: [],
    },

    // إعدادات الدفع
    payment: store.settings?.payment || {
      cashOnDelivery: true,
      bankTransfer: false,
      creditCard: false,
      paypal: false,
      stripe: false,
      mada: false,
      mobileWallet: false,
      bankInfo: {
        bankName: "",
        accountNumber: "",
        accountName: "",
      },
    },

    // إعدادات الضرائب
    taxes: store.settings?.taxes || {
      enabled: false,
      includeInPrice: false,
      rate: 0,
    },

    // إعدادات الإشعارات
    notifications: store.settings?.notifications || {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
    },
  });

  // Design Settings - من customization
  const [designSettings, setDesignSettings] = useState(() => {
    const customization = store.customization;
    return {
      // الألوان
      primaryColor: customization?.colors?.primary || "#3b82f6",
      secondaryColor: customization?.colors?.secondary || "#10b981",
      backgroundColor: customization?.colors?.background || "#ffffff",
      textColor: customization?.colors?.text || "#333333",
      accentColor: customization?.colors?.accent || "#3b82f6",

      // الخطوط
      headingFont: customization?.fonts?.heading || "Tajawal",
      bodyFont: customization?.fonts?.body || "Tajawal",

      // التخطيط
      headerStyle: customization?.layout?.headerStyle || "fixed",
      footerStyle: customization?.layout?.footerStyle || "detailed",
      productGridColumns: customization?.layout?.productGridColumns || 4,
      containerWidth: customization?.layout?.containerWidth || "1200px",
      borderRadius: customization?.layout?.borderRadius || "medium",
      spacing: customization?.layout?.spacing || "normal",

      // الشعار
      logo: customization?.branding?.logo || "",
    };
  });

  // Update form when store changes
  useEffect(() => {
    setStoreData({
      name: store.name || "",
      description: store.description || "",
      industry: store.industry || "general",
      taxNumber: store.taxNumber || "",
      commercialRegistration: store.commercialRegistration || "",
      currency: store.currency || "YER",
      language: store.language || "ar",
      timezone: store.timezone || "Asia/Aden",
      businessActivities: store.businessActivities || {
        mainActivity: "retail",
        subActivities: [],
        registrationNumber: `REG-${Date.now()}`,
        taxNumber: "",
        issueDate: new Date(),
        expiryDate: undefined,
        businessType: "retail",
        industry: "general",
        legalStructure: "sole_proprietorship",
      },
      complianceSettings: store.complianceSettings || {
        autoDetection: true,
        strictMode: false,
        notifyOnViolation: true,
        allowedDeviations: [],
        reviewThreshold: 10,
      },
      contact: store.contact || {
        phone: "",
        email: "",
        address: "",
        city: "",
        governorate: "",
        country: "اليمن",
        zipCode: "",
        originalCity: "",
      },
      shipping: store.settings?.shipping || {
        enabled: false,
        freeShippingThreshold: 0,
        shippingCost: 0,
        defaultCost: 0,
        zones: [],
        methods: [],
      },
      payment: store.settings?.payment || {
        cashOnDelivery: true,
        bankTransfer: false,
        creditCard: false,
        paypal: false,
        stripe: false,
        mada: false,
        mobileWallet: false,
        bankInfo: {
          bankName: "",
          accountNumber: "",
          accountName: "",
        },
      },
      taxes: store.settings?.taxes || {
        enabled: false,
        includeInPrice: false,
        rate: 0,
      },
      notifications: store.settings?.notifications || {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
      },
    });

    const customization = store.customization;
    setDesignSettings({
      primaryColor: customization?.colors?.primary || "#3b82f6",
      secondaryColor: customization?.colors?.secondary || "#10b981",
      backgroundColor: customization?.colors?.background || "#ffffff",
      textColor: customization?.colors?.text || "#333333",
      accentColor: customization?.colors?.accent || "#3b82f6",
      headingFont: customization?.fonts?.heading || "Tajawal",
      bodyFont: customization?.fonts?.body || "Tajawal",
      headerStyle: customization?.layout?.headerStyle || "fixed",
      footerStyle: customization?.layout?.footerStyle || "detailed",
      productGridColumns: customization?.layout?.productGridColumns || 4,
      containerWidth: customization?.layout?.containerWidth || "1200px",
      borderRadius: customization?.layout?.borderRadius || "medium",
      spacing: customization?.layout?.spacing || "normal",
      logo: customization?.branding?.logo || "",
    });
  }, [store]);

  // Helper Functions
  const showConfirmDialog = (
    title: string,
    message: string,
    onConfirm: () => Promise<void>,
    type: ConfirmDialogState["type"] = "store",
  ) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm,
      type,
    });
  };

  // ============ Save Functions ============

  const saveStoreData = async () => {
    setIsLoading(true);
    try {
      await storeService.update(store.id, {
        name: storeData.name,
        description: storeData.description,
        industry: storeData.industry,
        taxNumber: storeData.taxNumber,
        commercialRegistration: storeData.commercialRegistration,
        currency: storeData.currency,
        language: storeData.language,
        timezone: storeData.timezone,
      });

      toast.success("✅ تم حفظ بيانات المتجر بنجاح");
      await loadMerchantData();
    } catch (error) {
      toast.error("❌ فشل في حفظ بيانات المتجر");
      console.error("Error saving store data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBusinessActivities = async () => {
    setIsLoading(true);
    try {
      await storeService.updateBusinessActivities(
        store.id,
        storeData.businessActivities,
      );

      toast.success("✅ تم حفظ الأنشطة التجارية بنجاح");
      await loadMerchantData();
    } catch (error) {
      toast.error("❌ فشل في حفظ الأنشطة التجارية");
      console.error("Error saving business activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveComplianceSettings = async () => {
    setIsLoading(true);
    try {
      await storeService.updateComplianceSettings(
        store.id,
        storeData.complianceSettings,
      );

      toast.success("✅ تم حفظ إعدادات الامتثال بنجاح");
      await loadMerchantData();
    } catch (error) {
      toast.error("❌ فشل في حفظ إعدادات الامتثال");
      console.error("Error saving compliance settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveContactInfo = async () => {
    setIsLoading(true);
    try {
      await storeService.updateContactWithGovernorate(
        store.id,
        storeData.contact,
      );

      toast.success("✅ تم حفظ معلومات الاتصال بنجاح");
      await loadMerchantData();
    } catch (error) {
      toast.error("❌ فشل في حفظ معلومات الاتصال");
      console.error("Error saving contact info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDesignSettings = async () => {
    setIsLoading(true);
    try {
      // إنشاء customization أساسي جديد مع تحديثاتنا
      const basicCustomization = createBasicCustomization({
        colors: {
          primary: designSettings.primaryColor,
          secondary: designSettings.secondaryColor,
          background: designSettings.backgroundColor,
          text: designSettings.textColor,
          accent: designSettings.accentColor,
          headerBackground: designSettings.backgroundColor,
          footerBackground: "#F9FAFB",
          cardBackground: "#FFFFFF",
          borderColor: "#E5E7EB",
        },
        fonts: {
          heading: designSettings.headingFont,
          body: designSettings.bodyFont,
          size: {
            small: "0.875rem",
            medium: "1rem",
            large: "1.125rem",
            xlarge: "1.25rem",
          },
        },
        layout: {
          headerStyle: designSettings.headerStyle,
          footerStyle: designSettings.footerStyle,
          productGridColumns: designSettings.productGridColumns,
          containerWidth: designSettings.containerWidth,
          borderRadius: designSettings.borderRadius,
          spacing: designSettings.spacing,
        },
        branding: {
          logo: designSettings.logo,
          favicon: store.customization?.branding?.favicon || "",
        },
      });

      // تحويل إلى enhanced
      const enhancedCustomization =
        ensureEnhancedCustomization(basicCustomization);

      await storeService.update(store.id, {
        customization: enhancedCustomization,
      });

      toast.success("✅ تم حفظ إعدادات التصميم بنجاح");
      await loadMerchantData();
    } catch (error) {
      toast.error("❌ فشل في حفظ إعدادات التصميم");
      console.error("Error saving design settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveStoreSettings = async () => {
    setIsLoading(true);
    try {
      await storeService.update(store.id, {
        settings: {
          currency: storeData.currency,
          language: storeData.language,
          timezone: storeData.timezone,
          notifications: storeData.notifications,
          shipping: storeData.shipping,
          payment: storeData.payment,
          taxes: storeData.taxes,
        },
      });

      toast.success("✅ تم حفظ إعدادات المتجر بنجاح");
      await loadMerchantData();
    } catch (error) {
      toast.error("❌ فشل في حفظ إعدادات المتجر");
      console.error("Error saving store settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Business Activities Helpers
  const handleAddSubActivity = () => {
    if (newSubActivity.trim()) {
      setStoreData({
        ...storeData,
        businessActivities: {
          ...storeData.businessActivities,
          subActivities: [
            ...storeData.businessActivities.subActivities,
            newSubActivity.trim(),
          ],
        },
      });
      setNewSubActivity("");
    }
  };

  const handleRemoveSubActivity = (index: number) => {
    const newSubActivities = [...storeData.businessActivities.subActivities];
    newSubActivities.splice(index, 1);
    setStoreData({
      ...storeData,
      businessActivities: {
        ...storeData.businessActivities,
        subActivities: newSubActivities,
      },
    });
  };

  // Compliance Settings Helpers
  const handleAddAllowedDeviation = () => {
    if (allowedDeviation.trim()) {
      setStoreData({
        ...storeData,
        complianceSettings: {
          ...storeData.complianceSettings,
          allowedDeviations: [
            ...storeData.complianceSettings.allowedDeviations,
            allowedDeviation.trim(),
          ],
        },
      });
      setAllowedDeviation("");
    }
  };

  const handleRemoveAllowedDeviation = (index: number) => {
    const newDeviations = [...storeData.complianceSettings.allowedDeviations];
    newDeviations.splice(index, 1);
    setStoreData({
      ...storeData,
      complianceSettings: {
        ...storeData.complianceSettings,
        allowedDeviations: newDeviations,
      },
    });
  };

  // Tabs Configuration - فقط التبويبات المتوافقة مع storeService
  const settingsTabs = [
    { id: "store-data", label: "بيانات المتجر", icon: StoreIcon },
    { id: "business-activities", label: "الأنشطة التجارية", icon: Building },
    { id: "compliance", label: "إعدادات الامتثال", icon: Shield },
    { id: "contact-info", label: "معلومات الاتصال", icon: MapPin },
    { id: "design", label: "تصميم المتجر", icon: Palette },
    { id: "shipping", label: "إعدادات الشحن", icon: Truck },
    { id: "payment", label: "إعدادات الدفع", icon: CreditCard },
    { id: "taxes", label: "إعدادات الضرائب", icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      {/* Confirm Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await confirmDialog.onConfirm();
                } catch (error) {
                  console.error("Error in confirm action:", error);
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "تأكيد الحفظ"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quick Navigation */}
      {/* <div className="flex flex-wrap gap-2">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={subActiveTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSubActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div> */}

      {/* Main Content */}
      <div className="space-y-6">
        {/* Store Data Tab */}
        {subActiveTab === "store-data" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StoreIcon className="h-5 w-5" />
                البيانات الأساسية للمتجر
              </CardTitle>
              <CardDescription>إدارة المعلومات الأساسية للمتجر</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">اسم المتجر *</Label>
                  <Input
                    id="store-name"
                    value={storeData.name}
                    onChange={(e) =>
                      setStoreData({
                        ...storeData,
                        name: e.target.value,
                      })
                    }
                    placeholder="أدخل اسم المتجر"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-industry">مجال النشاط *</Label>
                  <Select
                    value={storeData.industry}
                    onValueChange={(value) =>
                      setStoreData({
                        ...storeData,
                        industry: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مجال النشاط" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-currency">العملة *</Label>
                  <Select
                    value={storeData.currency}
                    onValueChange={(value) =>
                      setStoreData({
                        ...storeData,
                        currency: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العملة" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store-language">اللغة *</Label>
                  <Select
                    value={storeData.language}
                    onValueChange={(value) =>
                      setStoreData({
                        ...storeData,
                        language: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر اللغة" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-description">وصف المتجر</Label>
                <Textarea
                  id="store-description"
                  className="min-h-[120px]"
                  value={storeData.description}
                  onChange={(e) =>
                    setStoreData({
                      ...storeData,
                      description: e.target.value,
                    })
                  }
                  placeholder="أدخل وصفاً مفصلاً لمتجرك..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-number">الرقم الضريبي</Label>
                  <Input
                    id="tax-number"
                    value={storeData.taxNumber}
                    onChange={(e) =>
                      setStoreData({
                        ...storeData,
                        taxNumber: e.target.value,
                      })
                    }
                    placeholder="أدخل الرقم الضريبي"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commercial-reg">السجل التجاري</Label>
                  <Input
                    id="commercial-reg"
                    value={storeData.commercialRegistration}
                    onChange={(e) =>
                      setStoreData({
                        ...storeData,
                        commercialRegistration: e.target.value,
                      })
                    }
                    placeholder="أدخل رقم السجل التجاري"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">المنطقة الزمنية</Label>
                  <Select
                    value={storeData.timezone}
                    onValueChange={(value) =>
                      setStoreData({
                        ...storeData,
                        timezone: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المنطقة الزمنية" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex gap-4 justify-end">
                <Button
                  onClick={() => {
                    showConfirmDialog(
                      "تأكيد الحفظ",
                      "هل تريد حفظ جميع التغييرات على بيانات المتجر؟",
                      saveStoreData,
                      "store",
                    );
                  }}
                  disabled={isLoading}
                  className="min-w-[150px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      حفظ البيانات الأساسية
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={loadMerchantData}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 ml-2" />
                  تحديث البيانات
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Activities Tab */}
        {subActiveTab === "business-activities" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                الأنشطة التجارية
              </CardTitle>
              <CardDescription>
                إدارة الأنشطة التجارية الرئيسية والفرعية للمتجر
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="main-activity">النشاط الرئيسي *</Label>
                  <Input
                    id="main-activity"
                    value={storeData.businessActivities.mainActivity}
                    onChange={(e) =>
                      setStoreData({
                        ...storeData,
                        businessActivities: {
                          ...storeData.businessActivities,
                          mainActivity: e.target.value,
                        },
                      })
                    }
                    placeholder="مثال: تجارة إلكترونية"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-type">نوع النشاط التجاري</Label>
                  <Select
                    value={storeData.businessActivities.businessType}
                    onValueChange={(value) =>
                      setStoreData({
                        ...storeData,
                        businessActivities: {
                          ...storeData.businessActivities,
                          businessType: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع النشاط" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legal-structure">الهيكل القانوني</Label>
                  <Select
                    value={storeData.businessActivities.legalStructure}
                    onValueChange={(value) =>
                      setStoreData({
                        ...storeData,
                        businessActivities: {
                          ...storeData.businessActivities,
                          legalStructure: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الهيكل القانوني" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEGAL_STRUCTURES.map((structure) => (
                        <SelectItem
                          key={structure.value}
                          value={structure.value}
                        >
                          {structure.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registration-number">رقم التسجيل</Label>
                  <Input
                    id="registration-number"
                    value={storeData.businessActivities.registrationNumber}
                    onChange={(e) =>
                      setStoreData({
                        ...storeData,
                        businessActivities: {
                          ...storeData.businessActivities,
                          registrationNumber: e.target.value,
                        },
                      })
                    }
                    placeholder="رقم التسجيل التجاري"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>الأنشطة الفرعية</Label>
                    <p className="text-sm text-muted-foreground">
                      قم بإضافة الأنشطة التجارية الفرعية
                    </p>
                  </div>
                  <Badge variant="outline">
                    {storeData.businessActivities.subActivities.length} نشاط
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newSubActivity}
                    onChange={(e) => setNewSubActivity(e.target.value)}
                    placeholder="أدخل نشاطاً فرعياً جديداً"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleAddSubActivity()
                    }
                  />
                  <Button onClick={handleAddSubActivity}>إضافة</Button>
                </div>

                {storeData.businessActivities.subActivities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {storeData.businessActivities.subActivities.map(
                      (activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-background rounded-lg border"
                        >
                          <div className="flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4 text-green-500" />
                            <span>{activity}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSubActivity(index)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="text-center p-6 border-2 border-dashed rounded-lg">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      لا توجد أنشطة فرعية مضافة
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex gap-4 justify-end">
                <Button
                  onClick={() => {
                    showConfirmDialog(
                      "تأكيد الحفظ",
                      "هل تريد حفظ التغييرات على الأنشطة التجارية؟",
                      saveBusinessActivities,
                      "business",
                    );
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      حفظ الأنشطة التجارية
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compliance Settings Tab */}
        {subActiveTab === "compliance" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                إعدادات الامتثال
              </CardTitle>
              <CardDescription>
                تكوين نظام الامتثال والكشف التلقائي عن المخالفات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      <Label>الكشف التلقائي عن المخالفات</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      اكتشاف تلقائي للمنتجات غير المطابقة للأنشطة المسجلة
                    </p>
                  </div>
                  <Switch
                    checked={storeData.complianceSettings.autoDetection}
                    onCheckedChange={(checked) =>
                      setStoreData({
                        ...storeData,
                        complianceSettings: {
                          ...storeData.complianceSettings,
                          autoDetection: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <Label>وضع الامتثال الصارم</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      رفض تلقائي للمنتجات المخالفة مع إشعار فوري
                    </p>
                  </div>
                  <Switch
                    checked={storeData.complianceSettings.strictMode}
                    onCheckedChange={(checked) =>
                      setStoreData({
                        ...storeData,
                        complianceSettings: {
                          ...storeData.complianceSettings,
                          strictMode: checked,
                        },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-blue-500" />
                      <Label>إشعارات المخالفات</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      إرسال إشعارات عند اكتشاف منتجات مخالفة
                    </p>
                  </div>
                  <Switch
                    checked={storeData.complianceSettings.notifyOnViolation}
                    onCheckedChange={(checked) =>
                      setStoreData({
                        ...storeData,
                        complianceSettings: {
                          ...storeData.complianceSettings,
                          notifyOnViolation: checked,
                        },
                      })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>عتبة المراجعة (%)</Label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={storeData.complianceSettings.reviewThreshold}
                        onChange={(e) =>
                          setStoreData({
                            ...storeData,
                            complianceSettings: {
                              ...storeData.complianceSettings,
                              reviewThreshold: parseInt(e.target.value) || 10,
                            },
                          })
                        }
                        className="w-32"
                      />
                      <div className="flex-1">
                        <Progress
                          value={storeData.complianceSettings.reviewThreshold}
                          className="h-2"
                        />
                      </div>
                      <Badge variant="outline">
                        {storeData.complianceSettings.reviewThreshold}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      نسبة المنتجات التي تسبب مراجعة تلقائية للمتجر
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>الانحرافات المسموحة</Label>
                      <p className="text-sm text-muted-foreground">
                        أنواع الانحرافات المسموح بها في المنتجات
                      </p>
                    </div>
                    <Select
                      value={allowedDeviation}
                      onValueChange={setAllowedDeviation}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="اختر نوع الانحراف" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEVIATION_TYPES.map((deviation) => (
                          <SelectItem
                            key={deviation.value}
                            value={deviation.value}
                          >
                            {deviation.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={allowedDeviation}
                      onChange={(e) => setAllowedDeviation(e.target.value)}
                      placeholder="أو أدخل انحرافاً مخصصاً"
                    />
                    <Button onClick={handleAddAllowedDeviation}>إضافة</Button>
                  </div>

                  {storeData.complianceSettings.allowedDeviations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {storeData.complianceSettings.allowedDeviations.map(
                        (deviation, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-background rounded-lg border"
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{deviation}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveAllowedDeviation(index)
                              }
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-4 border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground">
                        لا توجد انحرافات مسموحة
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex gap-4 justify-end">
                <Button
                  onClick={() => {
                    showConfirmDialog(
                      "تأكيد الحفظ",
                      "هل تريد حفظ التغييرات على إعدادات الامتثال؟",
                      saveComplianceSettings,
                      "compliance",
                    );
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      حفظ إعدادات الامتثال
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Info Tab */}
        {subActiveTab === "contact-info" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                معلومات الاتصال
              </CardTitle>
              <CardDescription>
                المعلومات التي يستخدمها العملاء للتواصل مع متجرك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-email">البريد الإلكتروني *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={storeData.contact.email}
                    onChange={(e) =>
                      setStoreData({
                        ...storeData,
                        contact: {
                          ...storeData.contact,
                          email: e.target.value,
                        },
                      })
                    }
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-phone">رقم الهاتف *</Label>
                  <Input
                    id="contact-phone"
                    value={storeData.contact.phone}
                    onChange={(e) =>
                      setStoreData({
                        ...storeData,
                        contact: {
                          ...storeData.contact,
                          phone: e.target.value,
                        },
                      })
                    }
                    placeholder="+967 7X XXX XXXX"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">العنوان الكامل *</Label>
                <Textarea
                  id="address"
                  className="min-h-[80px]"
                  value={storeData.contact.address}
                  onChange={(e) =>
                    setStoreData({
                      ...storeData,
                      contact: {
                        ...storeData.contact,
                        address: e.target.value,
                      },
                    })
                  }
                  placeholder="الشارع، الحي، المنطقة"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">المدينة *</Label>
                  <Input
                    id="city"
                    value={storeData.contact.city}
                    onChange={(e) =>
                      setStoreData({
                        ...storeData,
                        contact: {
                          ...storeData.contact,
                          city: e.target.value,
                        },
                      })
                    }
                    placeholder="المدينة"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="governorate">المحافظة *</Label>
                  <Select
                    value={storeData.contact.governorate}
                    onValueChange={(value) =>
                      setStoreData({
                        ...storeData,
                        contact: {
                          ...storeData.contact,
                          governorate: value,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEMENI_GOVERNORATES.map((gov) => (
                        <SelectItem key={gov} value={gov}>
                          {gov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">البلد</Label>
                  <Input
                    id="country"
                    value={storeData.contact.country}
                    onChange={(e) =>
                      setStoreData({
                        ...storeData,
                        contact: {
                          ...storeData.contact,
                          country: e.target.value,
                        },
                      })
                    }
                    placeholder="البلد"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip-code">الرمز البريدي</Label>
                  <Input
                    id="zip-code"
                    value={storeData.contact.zipCode}
                    onChange={(e) =>
                      setStoreData({
                        ...storeData,
                        contact: {
                          ...storeData.contact,
                          zipCode: e.target.value,
                        },
                      })
                    }
                    placeholder="الرمز البريدي"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <Button
                  onClick={() => {
                    showConfirmDialog(
                      "تأكيد الحفظ",
                      "هل تريد حفظ التغييرات على معلومات الاتصال؟",
                      saveContactInfo,
                      "contact",
                    );
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      حفظ معلومات الاتصال
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Design Tab */}
        {subActiveTab === "design" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                تصميم المتجر
              </CardTitle>
              <CardDescription>
                تخصيص مظهر متجرك: الألوان، الخطوط، التخطيط
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">الألوان</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>اللون الأساسي</Label>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-lg border"
                          style={{
                            backgroundColor: designSettings.primaryColor,
                          }}
                        />
                        <Select
                          value={designSettings.primaryColor}
                          onValueChange={(value) =>
                            setDesignSettings({
                              ...designSettings,
                              primaryColor: value,
                            })
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="اختر اللون الأساسي" />
                          </SelectTrigger>
                          <SelectContent>
                            {COLORS.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-4 w-4 rounded"
                                    style={{ backgroundColor: color.value }}
                                  />
                                  {color.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>اللون الثانوي</Label>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-lg border"
                          style={{
                            backgroundColor: designSettings.secondaryColor,
                          }}
                        />
                        <Select
                          value={designSettings.secondaryColor}
                          onValueChange={(value) =>
                            setDesignSettings({
                              ...designSettings,
                              secondaryColor: value,
                            })
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="اختر اللون الثانوي" />
                          </SelectTrigger>
                          <SelectContent>
                            {COLORS.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-4 w-4 rounded"
                                    style={{ backgroundColor: color.value }}
                                  />
                                  {color.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">الخطوط</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>خط العناوين</Label>
                      <Select
                        value={designSettings.headingFont}
                        onValueChange={(value) =>
                          setDesignSettings({
                            ...designSettings,
                            headingFont: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر خط العناوين" />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_FAMILIES.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>خط النصوص</Label>
                      <Select
                        value={designSettings.bodyFont}
                        onValueChange={(value) =>
                          setDesignSettings({
                            ...designSettings,
                            bodyFont: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر خط النصوص" />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_FAMILIES.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">التخطيط</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>عدد أعمدة المنتجات</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDesignSettings({
                            ...designSettings,
                            productGridColumns: Math.max(
                              2,
                              designSettings.productGridColumns - 1,
                            ),
                          })
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="text-center flex-1">
                        <div className="text-2xl font-bold">
                          {designSettings.productGridColumns}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          أعمدة
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDesignSettings({
                            ...designSettings,
                            productGridColumns: Math.min(
                              6,
                              designSettings.productGridColumns + 1,
                            ),
                          })
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex gap-4 justify-end">
                <Button
                  onClick={() => {
                    showConfirmDialog(
                      "تأكيد الحفظ",
                      "هل تريد حفظ إعدادات التصميم؟",
                      saveDesignSettings,
                      "design",
                    );
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      حفظ التصميم
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shipping Settings Tab */}
        {subActiveTab === "shipping" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                إعدادات الشحن
              </CardTitle>
              <CardDescription>
                تكوين إعدادات الشحن والتوصيل للمنتجات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label>تفعيل نظام الشحن</Label>
                    <p className="text-sm text-muted-foreground">
                      السماح بإضافة تكاليف الشحن للطلبات
                    </p>
                  </div>
                  <Switch
                    checked={storeData.shipping.enabled}
                    onCheckedChange={(checked) =>
                      setStoreData({
                        ...storeData,
                        shipping: {
                          ...storeData.shipping,
                          enabled: checked,
                        },
                      })
                    }
                  />
                </div>

                {storeData.shipping.enabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shipping-cost">
                          تكلفة الشحن الأساسية
                        </Label>
                        <Input
                          id="shipping-cost"
                          type="number"
                          value={storeData.shipping.shippingCost}
                          onChange={(e) =>
                            setStoreData({
                              ...storeData,
                              shipping: {
                                ...storeData.shipping,
                                shippingCost: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          placeholder="0"
                        />
                        <p className="text-xs text-muted-foreground">
                          التكلفة الأساسية للشحن
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="free-threshold">حد الشحن المجاني</Label>
                        <Input
                          id="free-threshold"
                          type="number"
                          value={storeData.shipping.freeShippingThreshold}
                          onChange={(e) =>
                            setStoreData({
                              ...storeData,
                              shipping: {
                                ...storeData.shipping,
                                freeShippingThreshold:
                                  parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          placeholder="0"
                        />
                        <p className="text-xs text-muted-foreground">
                          الحد الأدنى للطلب للحصول على شحن مجاني
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              <div className="flex gap-4 justify-end">
                <Button
                  onClick={() => {
                    showConfirmDialog(
                      "تأكيد الحفظ",
                      "هل تريد حفظ إعدادات الشحن؟",
                      async () => {
                        await saveStoreSettings();
                      },
                      "shipping",
                    );
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      حفظ إعدادات الشحن
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Settings Tab */}
        {subActiveTab === "payment" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                إعدادات الدفع
              </CardTitle>
              <CardDescription>
                تكوين طرق الدفع المتاحة في متجرك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">طرق الدفع المتاحة</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <Package className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <Label>الدفع عند الاستلام</Label>
                        <p className="text-sm text-muted-foreground">
                          الدفع عند استلام الطلب
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={storeData.payment.cashOnDelivery}
                      onCheckedChange={(checked) =>
                        setStoreData({
                          ...storeData,
                          payment: {
                            ...storeData.payment,
                            cashOnDelivery: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <BanknoteIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <Label>التحويل البنكي</Label>
                        <p className="text-sm text-muted-foreground">
                          الدفع عبر التحويل البنكي
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={storeData.payment.bankTransfer}
                      onCheckedChange={(checked) =>
                        setStoreData({
                          ...storeData,
                          payment: {
                            ...storeData.payment,
                            bankTransfer: checked,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100">
                        <SmartphoneIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <Label>المحفظة الإلكترونية</Label>
                        <p className="text-sm text-muted-foreground">
                          الدفع عبر المحافظ الإلكترونية
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={storeData.payment.mobileWallet}
                      onCheckedChange={(checked) =>
                        setStoreData({
                          ...storeData,
                          payment: {
                            ...storeData.payment,
                            mobileWallet: checked,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {storeData.payment.bankTransfer && (
                <div className="space-y-4">
                  <h3 className="font-semibold">معلومات الحساب البنكي</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank-name">اسم البنك</Label>
                      <Input
                        id="bank-name"
                        value={storeData.payment.bankInfo.bankName}
                        onChange={(e) =>
                          setStoreData({
                            ...storeData,
                            payment: {
                              ...storeData.payment,
                              bankInfo: {
                                ...storeData.payment.bankInfo,
                                bankName: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="اسم البنك"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account-number">رقم الحساب</Label>
                      <Input
                        id="account-number"
                        value={storeData.payment.bankInfo.accountNumber}
                        onChange={(e) =>
                          setStoreData({
                            ...storeData,
                            payment: {
                              ...storeData.payment,
                              bankInfo: {
                                ...storeData.payment.bankInfo,
                                accountNumber: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="رقم الحساب"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account-name">اسم صاحب الحساب</Label>
                      <Input
                        id="account-name"
                        value={storeData.payment.bankInfo.accountName}
                        onChange={(e) =>
                          setStoreData({
                            ...storeData,
                            payment: {
                              ...storeData.payment,
                              bankInfo: {
                                ...storeData.payment.bankInfo,
                                accountName: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="اسم صاحب الحساب"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex gap-4 justify-end">
                <Button
                  onClick={() => {
                    showConfirmDialog(
                      "تأكيد الحفظ",
                      "هل تريد حفظ إعدادات الدفع؟",
                      async () => {
                        await saveStoreSettings();
                      },
                      "payment",
                    );
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      حفظ إعدادات الدفع
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Taxes Settings Tab */}
        {subActiveTab === "taxes" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                إعدادات الضرائب
              </CardTitle>
              <CardDescription>تكوين إعدادات الضرائب والرسوم</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-0.5">
                    <Label>تفعيل نظام الضرائب</Label>
                    <p className="text-sm text-muted-foreground">
                      إضافة ضريبة على أسعار المنتجات
                    </p>
                  </div>
                  <Switch
                    checked={storeData.taxes.enabled}
                    onCheckedChange={(checked) =>
                      setStoreData({
                        ...storeData,
                        taxes: {
                          ...storeData.taxes,
                          enabled: checked,
                        },
                      })
                    }
                  />
                </div>

                {storeData.taxes.enabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tax-rate">نسبة الضريبة (%)</Label>
                        <Input
                          id="tax-rate"
                          type="number"
                          min="0"
                          max="100"
                          value={storeData.taxes.rate}
                          onChange={(e) =>
                            setStoreData({
                              ...storeData,
                              taxes: {
                                ...storeData.taxes,
                                rate: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          placeholder="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>إدراج الضريبة في السعر</Label>
                        <div className="flex items-center gap-2 mt-2">
                          <Switch
                            checked={storeData.taxes.includeInPrice}
                            onCheckedChange={(checked) =>
                              setStoreData({
                                ...storeData,
                                taxes: {
                                  ...storeData.taxes,
                                  includeInPrice: checked,
                                },
                              })
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            إظهار السعر شامل الضريبة
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Info className="h-4 w-4 text-blue-500" />
                        <span>
                          مثال: سعر المنتج 100 {storeData.currency} + ضريبة{" "}
                          {storeData.taxes.rate}% ={" "}
                          {storeData.taxes.includeInPrice
                            ? `100 ${storeData.currency} (شامل الضريبة)`
                            : `${100 + (100 * storeData.taxes.rate) / 100} ${storeData.currency}`}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              <div className="flex gap-4 justify-end">
                <Button
                  onClick={() => {
                    showConfirmDialog(
                      "تأكيد الحفظ",
                      "هل تريد حفظ إعدادات الضرائب؟",
                      async () => {
                        await saveStoreSettings();
                      },
                      "taxes",
                    );
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 ml-2" />
                      حفظ إعدادات الضرائب
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
