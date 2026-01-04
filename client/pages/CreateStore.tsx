// D:\New folder (2)\store\client\pages\CreateStore.tsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { submitStoreApplication } from "@/lib/store-approval-system";
import { checkSubdomainAvailability } from "@/lib/src";
import {
  businessTypesWithSub,
  primaryBusinessTypes,
  getSubBusinessTypes,
} from "@/lib/businessTypes";
import {
  Store,
  Upload,
  MapPin,
  Building,
  ShoppingBag,
  CreditCard,
  Globe,
  X,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Truck,
  Shield,
  FileText,
  ChevronRight,
  Phone,
  Map,
  Check,
  Users,
  Briefcase,
  Settings,
  CheckSquare,
  Globe2,
  ChevronDown,
  Tag,
  Tags,
} from "lucide-react";

// === إعدادات اللغة ===
const LANGUAGE = {
  ar: {
    title: "إنشاء متجر جديد",
    subtitle: "منصة متكاملة للتجارة الإلكترونية",
    steps: [
      { title: "معلومات المتجر", subtitle: "البيانات الأساسية" },
      { title: "النشاط التجاري", subtitle: "تحديد التخصص" },
      { title: "الإعدادات النهائية", subtitle: "اكتمال المعلومات" },
    ],
    form: {
      storeName: "اسم المتجر",
      storeNamePlaceholder: "أدخل اسم المتجر",
      subdomain: "النطاق الفرعي",
      subdomainPlaceholder: "مثال: متجري",
      description: "الوصف المختصر",
      descriptionPlaceholder: "وصف مختصر للمتجر",
      logo: "شعار المتجر",
      businessType: "النشاط التجاري الرئيسي",
      businessTypePlaceholder: "اختر النشاط الرئيسي",
      subBusinessType: "التخصصات الفرعية",
      subBusinessTypePlaceholder: "اختر التخصصات",
      phone: "رقم الهاتف",
      city: "المدينة",
      paymentMethods: "طرق الدفع",
      cashOnDelivery: "الدفع عند الاستلام",
      bankTransfer: "التحويل البنكي",
      policies: "اتفاقية المنصة",
      policy1: "مسؤولية المنتج",
      policy1Desc: "أتحمل مسؤولية المنتجات المعروضة وجودتها",
      policy2: "الامتثال للأنظمة",
      policy2Desc: "أتعهد بعدم عرض منتجات مخالفة",
      policy3: "مراجعة الجودة",
      policy3Desc: "أوافق على مراجعة المنتجات لضمان الجودة",
      summary: "ملخص المتجر",
      next: "التالي",
      back: "رجوع",
      create: "إنشاء المتجر",
      creating: "جاري الإنشاء...",
      generate: "تولد",
      checking: "جاري التحقق...",
      available: "النطاق متاح",
      unavailable: "النطاق محجوز",
      uploadLogo: "رفع شعار",
      changeLogo: "تغيير الشعار",
      delete: "حذف",
      fileRequirements: "PNG, JPG - الحد الأقصى 5MB",
      required: "مطلوب",
      optional: "اختياري",
      status: "حالة",
      ready: "جاهز للإرسال",
      preparing: "قيد الإعداد",
    },
    features: [
      { title: "حماية البيانات", desc: "بياناتك محمية وفق أعلى معايير الأمان" },
      { title: "دعم فني", desc: "فريق دعم متاح على مدار الساعة" },
      { title: "سهولة الاستخدام", desc: "واجهة بسيطة وسهلة الاستخدام" },
    ],
    footer: "© 2024 منصة التجارة الإلكترونية. جميع الحقوق محفوظة.",
  },
  en: {
    title: "Create New Store",
    subtitle: "Integrated E-commerce Platform",
    steps: [
      { title: "Store Information", subtitle: "Basic Details" },
      { title: "Business Activity", subtitle: "Define Specialty" },
      { title: "Final Settings", subtitle: "Complete Information" },
    ],
    form: {
      storeName: "Store Name",
      storeNamePlaceholder: "Enter store name",
      subdomain: "Subdomain",
      subdomainPlaceholder: "Example: mystore",
      description: "Brief Description",
      descriptionPlaceholder: "Brief store description",
      logo: "Store Logo",
      businessType: "Main Business Activity",
      businessTypePlaceholder: "Select main activity",
      subBusinessType: "Sub-specialties",
      subBusinessTypePlaceholder: "Select specialties",
      phone: "Phone Number",
      city: "City",
      paymentMethods: "Payment Methods",
      cashOnDelivery: "Cash on Delivery",
      bankTransfer: "Bank Transfer",
      policies: "Platform Agreement",
      policy1: "Product Responsibility",
      policy1Desc:
        "I take responsibility for displayed products and their quality",
      policy2: "Regulatory Compliance",
      policy2Desc: "I pledge not to display prohibited products",
      policy3: "Quality Review",
      policy3Desc: "I agree to product review for quality assurance",
      summary: "Store Summary",
      next: "Next",
      back: "Back",
      create: "Create Store",
      creating: "Creating...",
      generate: "Generate",
      checking: "Checking...",
      available: "Domain available",
      unavailable: "Domain taken",
      uploadLogo: "Upload Logo",
      changeLogo: "Change Logo",
      delete: "Delete",
      fileRequirements: "PNG, JPG - Max 5MB",
      required: "Required",
      optional: "Optional",
      status: "Status",
      ready: "Ready to Submit",
      preparing: "In Preparation",
    },
    features: [
      {
        title: "Data Protection",
        desc: "Your data protected with highest security standards",
      },
      { title: "Technical Support", desc: "Support team available 24/7" },
      { title: "Easy to Use", desc: "Simple and user-friendly interface" },
    ],
    footer: "© 2024 E-commerce Platform. All rights reserved.",
  },
};

// === نظام الألوان الاحترافي ===
const THEME = {
  primary: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  accent: {
    blue: "#3b82f6",
    emerald: "#10b981",
    violet: "#8b5cf6",
  },
};

// === أيقونات الخطوات ===
const stepIcons = [Building, Briefcase, Settings];

// === مكونات منفصلة للحقول ===
const StoreNameInput = React.memo(
  ({
    value,
    onChange,
    placeholder,
    dir,
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    dir: "rtl" | "ltr";
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="storeName" className="text-sm font-medium">
            اسم المتجر *
          </Label>
          <Badge variant="outline" className="text-xs">
            مطلوب
          </Badge>
        </div>
        <Input
          id="storeName"
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10"
          dir={dir}
        />
      </div>
    );
  },
);

const SubdomainInput = React.memo(
  ({
    value,
    onChange,
    placeholder,
    onGenerate,
    subdomainAvailable,
    subdomainChecking,
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    onGenerate: () => void;
    subdomainAvailable: boolean | null;
    subdomainChecking: boolean;
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="subdomain" className="text-sm font-medium">
            الرابط الفرعي *
          </Label>
          <Badge variant="outline" className="text-xs">
            مطلوب
          </Badge>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center border rounded-md overflow-hidden">
            <Input
              id="subdomain"
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="h-10 border-0 focus-visible:ring-0"
              dir="ltr"
            />
            <span className="px-3 py-2 bg-gray-50 text-gray-600 text-sm whitespace-nowrap border-r">
              .commercial.ye
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onGenerate}
            className="h-10 border-gray-300"
            size="sm"
          >
            Generate
          </Button>
        </div>

        <AnimatePresence>
          {value && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {subdomainChecking ? (
                <div className="flex items-center text-sm text-blue-600">
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Checking...
                </div>
              ) : subdomainAvailable === true ? (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="w-3 h-3 mr-2" />
                  Domain available
                </div>
              ) : subdomainAvailable === false ? (
                <div className="flex items-center text-sm text-red-600">
                  <X className="w-3 h-3 mr-2" />
                  Domain taken
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

const DescriptionTextarea = React.memo(
  ({
    value,
    onChange,
    placeholder,
    dir,
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    dir: "rtl" | "ltr";
  }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description" className="text-sm font-medium">
            الوصف المختصر
          </Label>
          <Badge variant="outline" className="text-xs">
            اختياري
          </Badge>
        </div>
        <Textarea
          id="description"
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          dir={dir}
        />
      </div>
    );
  },
);

const PhoneInput = React.memo(
  ({
    value,
    onChange,
    placeholder,
    dir,
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    dir: "rtl" | "ltr";
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone *
          </Label>
          <Badge variant="outline" className="text-xs">
            Required
          </Badge>
        </div>
        <Input
          id="phone"
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10"
          dir={dir}
        />
      </div>
    );
  },
);

// === مكونات الخطوات ===
const Step1 = React.memo(
  ({
    language,
    steps,
    t,
    storeName,
    setStoreName,
    subdomain,
    handleSubdomainChange,
    generateSubdomain,
    subdomainAvailable,
    subdomainChecking,
    description,
    setDescription,
    logoPreview,
    handleLogoUpload,
  }: any) => {
    const Icon = stepIcons[0];
    return (
      <motion.div
        initial={{ opacity: 0, x: language === "ar" ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {steps[0].title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{steps[0].subtitle}</p>
        </div>

        <div className="space-y-5">
          <StoreNameInput
            value={storeName}
            onChange={setStoreName}
            placeholder={t.form.storeNamePlaceholder}
            dir={language === "ar" ? "rtl" : "ltr"}
          />

          <SubdomainInput
            value={subdomain}
            onChange={handleSubdomainChange}
            placeholder={t.form.subdomainPlaceholder}
            onGenerate={generateSubdomain}
            subdomainAvailable={subdomainAvailable}
            subdomainChecking={subdomainChecking}
          />

          <DescriptionTextarea
            value={description}
            onChange={setDescription}
            placeholder={t.form.descriptionPlaceholder}
            dir={language === "ar" ? "rtl" : "ltr"}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{t.form.logo}</Label>
              <Badge variant="outline" className="text-xs">
                {t.form.optional}
              </Badge>
            </div>
            <div className="border rounded-lg p-4">
              {logoPreview ? (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded border overflow-hidden flex-shrink-0">
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("logo-change")?.click()
                      }
                    >
                      {t.form.changeLogo}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLogoUpload(null, true)} // pass true to delete
                      className="text-red-600 hover:text-red-700"
                    >
                      {t.form.delete}
                    </Button>
                    <input
                      id="logo-change"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("logo-upload")?.click()
                    }
                  >
                    {t.form.uploadLogo}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    {t.form.fileRequirements}
                  </p>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e)}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  },
);

const Step2 = React.memo(
  ({
    language,
    steps,
    t,
    selectedPrimaryBusiness,
    handlePrimaryBusinessChange,
    availableSubTypes,
    subActivities,
    handleSubBusinessToggle,
  }: any) => {
    const Icon = stepIcons[1];
    return (
      <motion.div
        initial={{ opacity: 0, x: language === "ar" ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {steps[1].title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{steps[1].subtitle}</p>
        </div>

        <div className="space-y-5">
          {/* النشاط التجاري الرئيسي */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {t.form.businessType} *
              </Label>
              <Badge variant="outline" className="text-xs">
                {t.form.required}
              </Badge>
            </div>
            <Select
              value={selectedPrimaryBusiness}
              onValueChange={handlePrimaryBusinessChange}
            >
              <SelectTrigger className="h-12">
                <div className="flex items-center">
                  <Tag className="w-4 h-4 ml-2 text-gray-500" />
                  <SelectValue placeholder={t.form.businessTypePlaceholder} />
                </div>
              </SelectTrigger>
              <SelectContent>
                {primaryBusinessTypes.map((business) => (
                  <SelectItem key={business.id} value={business.id}>
                    <div className="flex items-center">
                      <ShoppingBag className="w-4 h-4 ml-2 text-gray-500" />
                      <div>
                        <div>{business.name[language]}</div>
                        <div className="text-xs text-gray-500">
                          {business.name[language === "ar" ? "en" : "ar"]}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* الأنشطة الفرعية */}
          {selectedPrimaryBusiness && availableSubTypes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {t.form.subBusinessType}
                </Label>
                <Badge variant="outline" className="text-xs">
                  {t.form.optional}
                </Badge>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 w-full justify-between"
                  >
                    <div className="flex items-center">
                      <Tags className="w-4 h-4 ml-2 text-gray-500" />
                      {subActivities.length > 0 ? (
                        <div className="flex items-center gap-2">
                          <span>
                            {subActivities.length}{" "}
                            {language === "ar" ? "مختار" : "selected"}
                          </span>
                          <div className="flex gap-1">
                            {subActivities.slice(0, 2).map((subId: string) => {
                              const subType = availableSubTypes.find(
                                (s: any) => s.value === subId,
                              );
                              return subType ? (
                                <Badge
                                  key={subId}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {subType.label[language].substring(0, 10)}
                                  ...
                                </Badge>
                              ) : null;
                            })}
                            {subActivities.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{subActivities.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">
                          {t.form.subBusinessTypePlaceholder}
                        </span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-64 overflow-y-auto">
                  {availableSubTypes.map((subType: any) => (
                    <DropdownMenuCheckboxItem
                      key={subType.value}
                      checked={subActivities.includes(subType.value)}
                      onCheckedChange={() =>
                        handleSubBusinessToggle(subType.value)
                      }
                      className="py-3"
                    >
                      <div className="flex flex-col">
                        <span>{subType.label[language]}</span>
                        <span className="text-xs text-gray-500">
                          {subType.label[language === "ar" ? "en" : "ar"]}
                        </span>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {subActivities.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm text-gray-600 mb-2">
                    {language === "ar"
                      ? "التخصصات المختارة:"
                      : "Selected specialties:"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subActivities.map((subId: string) => {
                      const subType = availableSubTypes.find(
                        (s: any) => s.value === subId,
                      );
                      return subType ? (
                        <Badge
                          key={subId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {subType.label[language]}
                          <button
                            onClick={() => handleSubBusinessToggle(subId)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  },
);

const Step3 = React.memo(
  ({
    language,
    steps,
    t,
    phone,
    setPhone,
    city,
    setCity,
    cashOnDelivery,
    setCashOnDelivery,
    bankTransfer,
    setBankTransfer,
    productResponsibility,
    setProductResponsibility,
    noProhibitedItems,
    setNoProhibitedItems,
    platformReviewRights,
    setPlatformReviewRights,
    storeName,
    subdomain,
    selectedPrimaryBusiness,
  }: any) => {
    const Icon = stepIcons[2];
    return (
      <motion.div
        initial={{ opacity: 0, x: language === "ar" ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {steps[2].title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{steps[2].subtitle}</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              {language === "ar" ? "معلومات الاتصال" : "Contact Information"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PhoneInput
                value={phone}
                onChange={setPhone}
                placeholder={language === "ar" ? "77XXXXXXX" : "Phone number"}
                dir="ltr"
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="city" className="text-sm font-medium">
                    {t.form.city} *
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {t.form.required}
                  </Badge>
                </div>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={t.form.city} />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "صنعاء",
                      "عدن",
                      "تعز",
                      "الحديدة",
                      "مأرب",
                      "إب",
                      "ذمار",
                      "المكلا",
                      "سيئون",
                      "شبوه",
                      "حضرموت",
                      "المهرة",
                      "الجوف",
                      "بيحان",
                      "ريمة",
                      "أبين",
                      "لحج",
                      "الضالع",
                      "عمران",
                      "صعدة",
                      "حجة",
                      "المحويت",
                      "سقطرى",
                    ].map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              {t.form.paymentMethods}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-lg border ${cashOnDelivery ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <CreditCard
                      className={`w-5 h-5 ${language === "ar" ? "ml-2" : "mr-2"} text-blue-600`}
                    />
                    <div className="font-medium">{t.form.cashOnDelivery}</div>
                  </div>
                  <Checkbox
                    checked={cashOnDelivery}
                    onCheckedChange={(checked) =>
                      setCashOnDelivery(checked === true)
                    }
                  />
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border ${bankTransfer ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Truck
                      className={`w-5 h-5 ${language === "ar" ? "ml-2" : "mr-2"} text-blue-600`}
                    />
                    <div className="font-medium">{t.form.bankTransfer}</div>
                  </div>
                  <Checkbox
                    checked={bankTransfer}
                    onCheckedChange={(checked) =>
                      setBankTransfer(checked === true)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">{t.form.policies}</h4>
            <div className="space-y-3">
              {[
                {
                  id: "policy1",
                  title: t.form.policy1,
                  description: t.form.policy1Desc,
                  checked: productResponsibility,
                  onChange: setProductResponsibility,
                },
                {
                  id: "policy2",
                  title: t.form.policy2,
                  description: t.form.policy2Desc,
                  checked: noProhibitedItems,
                  onChange: setNoProhibitedItems,
                },
                {
                  id: "policy3",
                  title: t.form.policy3,
                  description: t.form.policy3Desc,
                  checked: platformReviewRights,
                  onChange: setPlatformReviewRights,
                },
              ].map((policy) => (
                <div
                  key={policy.id}
                  className={`p-4 rounded-lg border ${policy.checked ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                >
                  <div className="flex items-start">
                    <Checkbox
                      id={policy.id}
                      checked={policy.checked}
                      onCheckedChange={(checked) =>
                        policy.onChange(checked === true)
                      }
                      className={`mt-0.5 ${language === "ar" ? "ml-3" : "mr-3"}`}
                    />
                    <Label
                      htmlFor={policy.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{policy.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {policy.description}
                      </div>
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-5">
            <h4 className="font-medium text-gray-900 mb-4">{t.form.summary}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">{t.form.storeName}</div>
                <div className="font-medium mt-1">{storeName || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">{t.form.subdomain}</div>
                <div className="font-medium mt-1" dir="ltr">
                  {subdomain || "—"}.commercial.ye
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">
                  {t.form.businessType}
                </div>
                <div className="font-medium mt-1">
                  {selectedPrimaryBusiness
                    ? primaryBusinessTypes.find(
                        (b) => b.id === selectedPrimaryBusiness,
                      )?.name[language]
                    : "—"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">{t.form.city}</div>
                <div className="font-medium mt-1">{city || "—"}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  },
);

export default function CreateStore() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [language, setLanguage] = useState<"ar" | "en">("ar");

  // === حالة النظام ===
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(
    null,
  );
  const [subdomainChecking, setSubdomainChecking] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [selectedPrimaryBusiness, setSelectedPrimaryBusiness] = useState("");
  const [availableSubTypes, setAvailableSubTypes] = useState<any[]>([]);

  // === كل حقل له حالة منفصلة ===
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [subActivities, setSubActivities] = useState<string[]>([]);
  const [cashOnDelivery, setCashOnDelivery] = useState(true);
  const [bankTransfer, setBankTransfer] = useState(false);
  const [productResponsibility, setProductResponsibility] = useState(false);
  const [noProhibitedItems, setNoProhibitedItems] = useState(false);
  const [platformReviewRights, setPlatformReviewRights] = useState(false);

  // === استخدام useMemo للغات ===
  const t = useMemo(() => LANGUAGE[language], [language]);
  const steps = useMemo(() => t.steps, [t]);

  // أضف هذا في بداية المكون بعد useState
  useEffect(() => {
    console.log("🔍 فحص بيانات التاجر عند تحميل الصفحة CreateStore...");

    // فحص ما إذا كان currentMerchant موجوداً
    const currentMerchantStr = localStorage.getItem("currentMerchant");
    if (currentMerchantStr) {
      try {
        const merchantData = JSON.parse(currentMerchantStr);
        console.log("✅ وجدت currentMerchant:", merchantData);

        // إذا كان هناك بيانات ولكنها غير مكتملة، نقوم بتحديثها
        if (merchantData.uid && !merchantData.id) {
          merchantData.id = merchantData.uid;
          localStorage.setItem("currentMerchant", JSON.stringify(merchantData));
          console.log("🔧 تم إصلاح بيانات التاجر: إضافة id من uid");
        }
      } catch (e) {
        console.error("❌ خطأ في تحليل currentMerchant:", e);
      }
    } else {
      console.log("⚠️ currentMerchant غير موجود في localStorage");

      // محاولة إنشاء بيانات تاجر من userUid
      const userUid = localStorage.getItem("userUid");
      const userEmail = localStorage.getItem("userEmail");

      if (userUid) {
        const newMerchantData = {
          uid: userUid,
          id: userUid,
          email: userEmail || "",
          displayName: "New Merchant",
          role: "merchant",
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(
          "currentMerchant",
          JSON.stringify(newMerchantData),
        );
        console.log("🆕 تم إنشاء currentMerchant جديد من userUid");
      }
    }
  }, []);

  // === استخدام useCallback للدوال ===
  const handleCheckSubdomain = useCallback(async (subdomain: string) => {
    if (subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    setSubdomainChecking(true);
    try {
      const isAvailable = await checkSubdomainAvailability(subdomain);
      setSubdomainAvailable(isAvailable);
    } catch (error) {
      console.error("Error checking subdomain:", error);
      setSubdomainAvailable(null);
    } finally {
      setSubdomainChecking(false);
    }
  }, []);

  const handleSubdomainChange = useCallback(
    (value: string) => {
      const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
      setSubdomain(cleanValue);

      if (cleanValue.length >= 3) {
        handleCheckSubdomain(cleanValue);
      } else {
        setSubdomainAvailable(null);
      }
    },
    [handleCheckSubdomain],
  );

  const generateSubdomain = useCallback(() => {
    if (!storeName.trim()) {
      toast({
        title:
          language === "ar"
            ? "أدخل اسم المتجر أولاً"
            : "Enter store name first",
        variant: "destructive",
      });
      return;
    }

    const generated = storeName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .substring(0, 20);

    setSubdomain(generated);
    handleCheckSubdomain(generated);

    toast({
      title:
        language === "ar"
          ? "تم توليد النطاق تلقائيًا"
          : "Domain generated automatically",
      description: `${generated}.commercial.ye`,
    });
  }, [storeName, handleCheckSubdomain, toast, language]);

  // === تحديث الأنواع الفرعية ===
  useEffect(() => {
    if (selectedPrimaryBusiness) {
      const subs = getSubBusinessTypes(selectedPrimaryBusiness);
      setAvailableSubTypes(subs);
      setSubActivities([]);
    }
  }, [selectedPrimaryBusiness]);

  // === التحقق من صحة الخطوة ===
  const validateStep = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 1:
          if (!storeName.trim()) {
            toast({
              title:
                language === "ar" ? "اسم المتجر مطلوب" : "Store name required",
              variant: "destructive",
            });
            return false;
          }
          if (!subdomain.trim()) {
            toast({
              title:
                language === "ar"
                  ? "النطاق الفرعي مطلوب"
                  : "Subdomain required",
              variant: "destructive",
            });
            return false;
          }
          if (subdomainAvailable === false) {
            toast({
              title:
                language === "ar" ? "النطاق غير متاح" : "Domain not available",
              variant: "destructive",
            });
            return false;
          }
          return true;

        case 3:
          if (!phone.trim() || phone.length < 7) {
            toast({
              title:
                language === "ar"
                  ? "رقم الهاتف غير صالح"
                  : "Invalid phone number",
              variant: "destructive",
            });
            return false;
          }
          if (!city) {
            toast({
              title: language === "ar" ? "المدينة مطلوبة" : "City required",
              variant: "destructive",
            });
            return false;
          }
          if (
            !productResponsibility ||
            !noProhibitedItems ||
            !platformReviewRights
          ) {
            toast({
              title:
                language === "ar"
                  ? "يجب الموافقة على جميع البنود"
                  : "Must accept all terms",
              variant: "destructive",
            });
            return false;
          }
          return true;

        default:
          return true;
      }
    },
    [
      storeName,
      subdomain,
      subdomainAvailable,
      phone,
      city,
      productResponsibility,
      noProhibitedItems,
      platformReviewRights,
      toast,
      language,
    ],
  );

  // === التنقل بين الخطوات ===
  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, validateStep]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, []);

  // === رفع الشعار ===
  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement> | null, deleteLogo = false) => {
      if (deleteLogo) {
        setLogoPreview("");
        return;
      }

      if (!e || !e.target.files?.[0]) return;

      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: language === "ar" ? "حجم الملف كبير" : "File too large",
          description: language === "ar" ? "الحد الأقصى 5MB" : "Maximum 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [toast, language],
  );

  // === معالجة اختيار النشاط الرئيسي ===
  const handlePrimaryBusinessChange = useCallback((value: string) => {
    setSelectedPrimaryBusiness(value);
  }, []);

  // === معالجة اختيار الأنشطة الفرعية ===
  const handleSubBusinessToggle = useCallback((value: string) => {
    setSubActivities((prev) =>
      prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value],
    );
  }, []);

  // === إنشاء المتجر ===
  // === إنشاء المتجر ===
  const handleCreateStore = useCallback(async () => {
    if (!validateStep(3)) return;

    setLoading(true);

    try {
      console.log("🔍 البحث عن بيانات التاجر في localStorage...");

      // 1. أولاً: فحص محتوى localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key || "");
        console.log(`📂 ${key}: ${value?.substring(0, 100)}...`);
      }

      // 2. البحث عن بيانات التاجر - المفتاح الصحيح هو currentMerchant
      let merchantData = null;

      // محاولة من currentMerchant (هذا هو المفتاح الذي رأيناه في السجلات)
      const currentMerchantStr = localStorage.getItem("currentMerchant");
      if (currentMerchantStr) {
        try {
          merchantData = JSON.parse(currentMerchantStr);
          console.log("✅ وجدت بيانات في currentMerchant:", merchantData);
        } catch (e) {
          console.error("❌ خطأ في تحليل currentMerchant:", e);
        }
      }

      // محاولة من userUid إذا كان currentMerchant فارغاً
      if (!merchantData || !merchantData.uid) {
        const userUid = localStorage.getItem("userUid");
        if (userUid) {
          merchantData = {
            uid: userUid,
            id: userUid,
            email: localStorage.getItem("userEmail") || "",
            displayName: "New Merchant",
            role: "merchant",
          };
          console.log("✅ أنشأت بيانات من userUid:", merchantData);
        }
      }

      // إذا لم نجد بيانات التاجر بعد
      if (!merchantData || (!merchantData.uid && !merchantData.id)) {
        console.error("❌ لم أجد بيانات التاجر في localStorage");
        console.log("📋 محتويات localStorage:", Object.keys(localStorage));

        toast({
          title:
            language === "ar"
              ? "بيانات الحساب غير مكتملة"
              : "Account data incomplete",
          description:
            language === "ar"
              ? "يبدو أن بيانات حسابك غير مكتملة. يرجى المحاولة مرة أخرى أو التواصل مع الدعم."
              : "Your account data appears to be incomplete. Please try again or contact support.",
          variant: "destructive",
          duration: 5000,
        });

        // لا نوجه إلى /auth/login لأنه غير موجود، نبقى في الصفحة
        return;
      }

      // تأكد من وجود ID
      if (!merchantData.id && merchantData.uid) {
        merchantData.id = merchantData.uid;
      }

      if (!merchantData.uid && merchantData.id) {
        merchantData.uid = merchantData.id;
      }

      console.log("✅ بيانات التاجر التي سيتم استخدامها:", {
        id: merchantData.id,
        uid: merchantData.uid,
        email: merchantData.email,
        displayName: merchantData.displayName,
        phoneNumber: merchantData.phoneNumber,
      });

      // إعداد بيانات المتجر
      const storeConfig = {
        template: "corporate",
        customization: {
          storeName: storeName,
          storeDescription:
            description ||
            (language === "ar"
              ? "متجر إلكتروني احترافي"
              : "Professional online store"),
          colors: {
            primary: THEME.accent.blue,
            secondary: THEME.primary[600],
            background: "#FFFFFF",
          },
          subdomain: subdomain,
          customDomain: "",
          entityType: "individual",
          logo: logoPreview,
        },
      };

      const settings = {
        currency: "YER",
        language: language,
        shipping: {
          enabled: false,
          defaultCost: 0,
        },
        payment: {
          cashOnDelivery: cashOnDelivery,
          bankTransfer: bankTransfer,
        },
      };

      // إنشاء بيانات التاجر الكاملة
      const fullMerchantData = {
        id: merchantData.id || merchantData.uid,
        uid: merchantData.uid || merchantData.id,
        email:
          merchantData.email ||
          localStorage.getItem("userEmail") ||
          "unknown@email.com",
        name:
          merchantData.displayName ||
          merchantData.name ||
          storeName + " Merchant",
        phone:
          phone ||
          merchantData.phoneNumber ||
          localStorage.getItem("userPhone") ||
          "",
        city: city || "",
        businessType: selectedPrimaryBusiness || "other",
        subBusinessTypes: subActivities,
        address: city || "",
        createdAt: new Date().toISOString(),
        status: "active",
        role: "merchant",
        // إضافة بيانات إضافية إذا كانت موجودة
        ...(merchantData.displayName && {
          displayName: merchantData.displayName,
        }),
        ...(merchantData.photoURL && { photoURL: merchantData.photoURL }),
        ...(merchantData.phoneNumber && {
          phoneNumber: merchantData.phoneNumber,
        }),
        ...(merchantData.merchantName && {
          merchantName: merchantData.merchantName,
        }),
      };

      // تحديث بيانات التاجر في localStorage
      localStorage.setItem("currentMerchant", JSON.stringify(fullMerchantData));
      console.log("💾 تم حفظ/تحديث بيانات التاجر في currentMerchant");

      // الآن ننشئ المتجر
      console.log("🚀 بدء إنشاء المتجر...");
      console.log("📤 إرسال البيانات:", {
        merchantId: fullMerchantData.id,
        storeName: storeName,
        subdomain: subdomain,
      });

      const result = await submitStoreApplication(
        fullMerchantData.id,
        fullMerchantData,
        storeConfig,
        settings,
        selectedPrimaryBusiness || "general",
      );

      console.log("✅ تم إنشاء المتجر بنجاح:", result);

      // إعداد بيانات المتجر للـ localStorage
      const storeInfo = {
        id: result.storeId,
        name: storeName,
        subdomain: subdomain,
        status: "pending", // عادة تكون معلقة حتى المراجعة
        createdAt: new Date().toISOString(),
        checklist: result.checklist || [],
        complianceLevel: result.complianceLevel || "basic",
        merchantId: fullMerchantData.id,
        merchantEmail: fullMerchantData.email,
      };

      // حفظ المتجر في localStorage
      localStorage.setItem("currentStore", JSON.stringify(storeInfo));

      // تحديث بيانات التاجر بإضافة معلومات المتجر
      const updatedMerchantData = {
        ...fullMerchantData,
        storeId: result.storeId,
        storeName: storeName,
        hasStore: true,
      };

      localStorage.setItem(
        "currentMerchant",
        JSON.stringify(updatedMerchantData),
      );

      // تحديث userUid إذا كان مختلفاً
      if (localStorage.getItem("userUid") !== fullMerchantData.uid) {
        localStorage.setItem("userUid", fullMerchantData.uid);
      }

      localStorage.setItem("storeCreationProgress", "completed");

      toast({
        title:
          language === "ar"
            ? "تم إنشاء المتجر بنجاح 🎉"
            : "Store created successfully 🎉",
        description:
          language === "ar"
            ? "جاري توجيهك إلى لوحة التحكم..."
            : "Redirecting to dashboard...",
      });

      // الانتقال إلى لوحة التحكم
      // في دالة handleCreateStore، عدل جزء الانتقال:
      // الانتقال إلى لوحة التحكم
      setTimeout(() => {
        // المسار الصحيح هو /merchant/dashboard بدون معرف المتجر
        navigate(`/merchant/dashboard`, {
          state: {
            storeId: result.storeId,
            storeName: storeName,
            created: true,
            checklist: result.checklist,
            merchantData: updatedMerchantData,
            subdomain: subdomain,
          },
          replace: true,
        });
      }, 2000);
    } catch (error: any) {
      console.error("❌ خطأ في إنشاء المتجر:", error);

      // عرض رسالة خطأ مفصلة
      let errorMessage =
        error.message ||
        (language === "ar"
          ? "حدث خطأ غير متوقع أثناء إنشاء المتجر"
          : "An unexpected error occurred while creating the store");

      // إضافة تفاصيل إضافية للخطأ
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code) {
        errorMessage = `Error ${error.code}: ${error.message}`;
      }

      toast({
        title:
          language === "ar" ? "خطأ في إنشاء المتجر" : "Error creating store",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [
    validateStep,
    storeName,
    description,
    subdomain,
    logoPreview,
    language,
    cashOnDelivery,
    bankTransfer,
    phone,
    city,
    selectedPrimaryBusiness,
    subActivities,
    navigate,
    toast,
  ]);

  // === محتوى الخطوة الحالية ===
  const StepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            language={language}
            steps={steps}
            t={t}
            storeName={storeName}
            setStoreName={setStoreName}
            subdomain={subdomain}
            handleSubdomainChange={handleSubdomainChange}
            generateSubdomain={generateSubdomain}
            subdomainAvailable={subdomainAvailable}
            subdomainChecking={subdomainChecking}
            description={description}
            setDescription={setDescription}
            logoPreview={logoPreview}
            handleLogoUpload={handleLogoUpload}
          />
        );
      case 2:
        return (
          <Step2
            language={language}
            steps={steps}
            t={t}
            selectedPrimaryBusiness={selectedPrimaryBusiness}
            handlePrimaryBusinessChange={handlePrimaryBusinessChange}
            availableSubTypes={availableSubTypes}
            subActivities={subActivities}
            handleSubBusinessToggle={handleSubBusinessToggle}
          />
        );
      case 3:
        return (
          <Step3
            language={language}
            steps={steps}
            t={t}
            phone={phone}
            setPhone={setPhone}
            city={city}
            setCity={setCity}
            cashOnDelivery={cashOnDelivery}
            setCashOnDelivery={setCashOnDelivery}
            bankTransfer={bankTransfer}
            setBankTransfer={setBankTransfer}
            productResponsibility={productResponsibility}
            setProductResponsibility={setProductResponsibility}
            noProhibitedItems={noProhibitedItems}
            setNoProhibitedItems={setNoProhibitedItems}
            platformReviewRights={platformReviewRights}
            setPlatformReviewRights={setPlatformReviewRights}
            storeName={storeName}
            subdomain={subdomain}
            selectedPrimaryBusiness={selectedPrimaryBusiness}
          />
        );
      default:
        return null;
    }
  }, [
    currentStep,
    language,
    steps,
    t,
    storeName,
    subdomain,
    handleSubdomainChange,
    generateSubdomain,
    subdomainAvailable,
    subdomainChecking,
    description,
    logoPreview,
    handleLogoUpload,
    selectedPrimaryBusiness,
    handlePrimaryBusinessChange,
    availableSubTypes,
    subActivities,
    handleSubBusinessToggle,
    phone,
    city,
    cashOnDelivery,
    bankTransfer,
    productResponsibility,
    noProhibitedItems,
    platformReviewRights,
  ]);

  // === الشريط الجانبي المحسّن - على اليمين ===
  const Sidebar = useMemo(
    () => (
      <div className="h-full flex flex-col">
        {/* العنوان الرئيسي */}
        <div className="mb-8 text-right">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-sm text-gray-600 mt-2">{t.subtitle}</p>
        </div>

        {/* الخطوات بشكل عمودي أنيق على اليمين */}
        <div className="flex-1 mb-8">
          <div className="relative">
            {/* الخط العمودي المزخرف على اليمين */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-blue-400 to-emerald-500 transform translate-x-1/2 rounded-full" />

            {steps.map((step, index) => {
              const Icon = stepIcons[index];
              const isActive = currentStep === index + 1;
              const isCompleted = currentStep > index + 1;

              return (
                <div
                  key={index}
                  className={`relative flex items-start mb-10 last:mb-0 group transition-all duration-300 ${
                    isActive ? "scale-105" : ""
                  }`}
                >
                  {/* نص الخطوة على اليسار */}
                  <div className="flex-1 ml-4 text-left">
                    <div
                      className={`font-bold text-base transition-all duration-300 ${
                        isCompleted
                          ? "text-emerald-700"
                          : isActive
                            ? "text-blue-700"
                            : "text-gray-700 group-hover:text-gray-900"
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {step.subtitle}
                    </div>

                    {/* شريط التقدم المصغر */}
                    {isActive && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.5 }}
                        className="h-1 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full mt-2"
                      />
                    )}
                  </div>

                  {/* الدائرة على الخط مع تأثيرات - على اليمين */}
                  <div className="relative z-10">
                    <div
                      className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 transform ${
                        isCompleted
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-100 shadow-lg shadow-emerald-200 scale-110"
                          : isActive
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-100 shadow-lg shadow-blue-200 scale-110 ring-4 ring-blue-100"
                            : "bg-white border-gray-200 text-gray-400 group-hover:border-gray-300 group-hover:shadow-md"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-7 h-7 text-white" />
                      ) : (
                        <Icon
                          className={`w-7 h-7 transition-all duration-300 ${
                            isActive
                              ? "text-white"
                              : "text-gray-500 group-hover:text-gray-700"
                          }`}
                        />
                      )}
                    </div>

                    {/* رقم الخطوة */}
                    <div
                      className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-500 text-white"
                          : isActive
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* تغيير اللغة مع تصميم جديد - في أسفل الشريط */}
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Globe2 className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {language === "ar" ? "اللغة / Language" : "Language / اللغة"}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {language === "ar" ? "محدد" : "Selected"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={language === "ar" ? "default" : "outline"}
              onClick={() => setLanguage("ar")}
              className={`h-11 transition-all duration-300 ${
                language === "ar"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:shadow-lg"
                  : "hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-center w-full">
                {language === "ar" && (
                  <Check className="w-4 h-4 ml-2 animate-pulse" />
                )}
                <span className="font-medium">العربية</span>
              </div>
            </Button>

            <Button
              variant={language === "en" ? "default" : "outline"}
              onClick={() => setLanguage("en")}
              className={`h-11 transition-all duration-300 ${
                language === "en"
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md hover:shadow-lg"
                  : "hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-center w-full">
                <span className="font-medium">English</span>
                {language === "en" && (
                  <Check className="w-4 h-4 mr-2 animate-pulse" />
                )}
              </div>
            </Button>
          </div>

          {/* مؤشر التقدم الكلي */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">
                {language === "ar" ? "تقدم الإنشاء" : "Creation Progress"}
              </span>
              <span className="text-xs font-medium text-blue-600">
                {Math.round((currentStep / 3) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Step 1</span>
              <span>Step 2</span>
              <span>Step 3</span>
            </div>
          </div>
        </div>
      </div>
    ),
    [language, t, steps, currentStep],
  );

  // === أزرار التنقل ===
  const NavigationButtons = useMemo(
    () => (
      <div
        className={`flex ${language === "ar" ? "flex-row-reverse" : ""} justify-between items-center pt-6 border-t border-gray-200`}
      >
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={loading}
              size="default"
              className={`h-11 px-6 transition-all duration-300 hover:scale-105 ${
                language === "ar" ? "flex-row-reverse" : ""
              }`}
            >
              {language === "ar" ? (
                <>
                  <ArrowRight className="w-4 h-4 ml-2" />
                  <span className="font-medium">{t.form.back}</span>
                </>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="font-medium">{t.form.back}</span>
                </>
              )}
            </Button>
          )}
        </div>

        <div>
          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              size="default"
              className={`h-11 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium transition-all duration-300 hover:scale-105 shadow-md ${
                language === "ar" ? "flex-row-reverse" : ""
              }`}
            >
              {language === "ar" ? (
                <>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="font-medium">{t.form.next}</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 ml-2" />
                  <span className="font-medium">{t.form.next}</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleCreateStore}
              disabled={loading}
              size="default"
              className="h-11 px-8 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2
                    className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"} animate-spin`}
                  />
                  <span className="font-medium">{t.form.creating}</span>
                </>
              ) : (
                <span className="font-medium flex items-center">
                  <Store className="w-4 h-4 ml-2" />
                  {t.form.create}
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    ),
    [
      language,
      currentStep,
      handleBack,
      loading,
      t,
      handleNext,
      handleCreateStore,
    ],
  );

  // === الميزات ===
  const FeaturesSection = useMemo(
    () => (
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {t.features.map((feature, index) => {
          const FeatureIcon = [Shield, Users, CheckSquare][index];
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:border-blue-300"
            >
              <div
                className={`flex items-center mb-4 ${language === "ar" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center ${
                    language === "ar" ? "ml-4" : "mr-4"
                  }`}
                >
                  <FeatureIcon className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">
                    {feature.title}
                  </div>
                  <div className="text-xs text-blue-600 font-medium mt-1">
                    {language === "ar" ? "ميزة مميزة" : "Premium Feature"}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    ),
    [t.features, language],
  );

  // === العرض الرئيسي ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-emerald-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* المحتوى الرئيسي */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                {/* شريط التقدم العلوي */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        {language === "ar"
                          ? "إنشاء متجر جديد"
                          : "New Store Creation"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {language === "ar"
                          ? `الخطوة ${currentStep} من 3 - ${steps[currentStep - 1].title}`
                          : `Step ${currentStep} of 3 - ${steps[currentStep - 1].title}`}
                      </div>
                    </div>
                    <Badge
                      variant={currentStep === 3 ? "default" : "outline"}
                      className={`px-4 py-2 text-sm font-medium ${
                        currentStep === 3
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md"
                          : "border-blue-300 text-blue-700 bg-blue-50"
                      }`}
                    >
                      {currentStep === 3 ? t.form.ready : t.form.preparing}
                    </Badge>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentStep / 3) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-400 rounded-full shadow-md"
                    />
                  </div>
                </div>

                {/* محتوى الخطوة */}
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="min-h-[500px]"
                >
                  {StepContent}
                </motion.div>

                {/* أزرار التنقل */}
                {NavigationButtons}
              </CardContent>
            </Card>

            {/* ميزات المنصة */}
            {FeaturesSection}
          </div>

          {/* الشريط الجانبي الجديد - على اليمين */}
          <div className="lg:col-span-1">
            <Card className="h-full border-0 shadow-2xl bg-gradient-to-b from-white to-blue-50/30 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="p-8 h-full flex flex-col">
                {Sidebar}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* حقوق النشر */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-300 shadow-sm">
            <span className="mr-2">©</span>
            <span>{t.footer}</span>
            <div className="w-1 h-1 bg-gray-400 rounded-full mx-3" />
            <span className="text-blue-600 font-medium">
              {language === "ar"
                ? "منصة التجارة الإلكترونية"
                : "E-commerce Platform"}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
