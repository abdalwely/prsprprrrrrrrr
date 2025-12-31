import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Settings,
  Save,
  ArrowLeft,
  Globe,
  CreditCard,
  Bell,
  Shield,
  Users,
  Mail,
  FileText,
  Palette,
  Database,
  Server,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function PlatformSettings() {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [showCommission, setShowCommission] = useState(false);

  const { userData } = useAuth();
  const { toast } = useToast();
  const isArabic = language === "ar";

  // بيانات الإعدادات - محدثة لليمن
  const [settings, setSettings] = useState({
    // الإعدادات العامة
    general: {
      platformName: "منصتي",
      platformDescription: "منصة متاجر يمنية متكاملة",
      defaultLanguage: "ar",
      timezone: "Asia/Aden", // منطقة صنعاء الزمنية
      currency: "YER", // الريال اليمني
      dateFormat: "dd/MM/yyyy",
      supportEmail: "support@platform.ye",
      supportPhone: "+967123456789",
    },
    // إعدادات العمولات
    commission: {
      commissionRate: 5,
      taxRate: 15,
      minimumPayout: 1000,
      payoutSchedule: "weekly",
      commissionType: "percentage", // percentage or fixed
    },
    // إعدادات الأمان
    security: {
      requireEmailVerification: true,
      requirePhoneVerification: false,
      twoFactorAuth: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      strongPassword: true,
    },
    // إعدادات الإشعارات
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      newStoreAlerts: true,
      suspensionAlerts: true,
      payoutAlerts: true,
      securityAlerts: true,
      weeklyReports: true,
    },
    // إعدادات المظهر
    appearance: {
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
      darkMode: false,
      fontFamily: "Cairo",
      borderRadius: "8px",
      rtlSupport: true,
    },
  });

  const text = {
    ar: {
      platformSettings: "إعدادات المنصة",
      settingsDescription: "إدارة إعدادات وإعدادات المنصة العامة",
      backToDashboard: "العودة للوحة التحكم",
      saveChanges: "حفظ التغييرات",
      changesSaved: "تم حفظ التغييرات بنجاح",
      generalSettings: "الإعدادات العامة",
      commissionSettings: "إعدادات العمولات",
      securitySettings: "إعدادات الأمان",
      notificationSettings: "إعدادات الإشعارات",
      appearanceSettings: "إعدادات المظهر",
      advancedSettings: "الإعدادات المتقدمة",
      platformName: "اسم المنصة",
      platformDescription: "وصف المنصة",
      defaultLanguage: "اللغة الافتراضية",
      timezone: "المنطقة الزمنية",
      currency: "العملة",
      dateFormat: "تنسيق التاريخ",
      commissionRate: "نسبة العمولة",
      taxRate: "نسبة الضريبة",
      minimumPayout: "الحد الأدنى للسحب",
      payoutSchedule: "جدول السحب",
      requireEmailVerification: "تفعيل البريد الإلكتروني",
      requirePhoneVerification: "تفعيل رقم الهاتف",
      twoFactorAuth: "المصادقة الثنائية",
      sessionTimeout: "مهلة الجلسة (دقيقة)",
      maxLoginAttempts: "أقصى محاولات تسجيل دخول",
      emailNotifications: "الإشعارات البريدية",
      smsNotifications: "إشعارات SMS",
      pushNotifications: "الإشعارات المنبثقة",
      newStoreAlerts: "تنبيهات المتاجر الجديدة",
      suspensionAlerts: "تنبيهات التعليق",
      payoutAlerts: "تنبيهات السحب",
      primaryColor: "اللون الأساسي",
      secondaryColor: "اللون الثانوي",
      darkMode: "الوضع الداكن",
      fontFamily: "نوع الخط",
      borderRadius: "زوايا الأزرار",
      percentage: "نسبة مئوية",
      fixed: "مبلغ ثابت",
      daily: "يومي",
      weekly: "أسبوعي",
      monthly: "شهري",
      enabled: "مفعل",
      disabled: "معطل",
      yemenRiyal: "ريال يمني",
      saudiRiyal: "ريال سعودي",
      usDollar: "دولار أمريكي",
      euro: "يورو",
      yemen: "اليمن - صنعاء",
      saudi: "السعودية - الرياض",
      supportEmail: "البريد الإلكتروني للدعم",
      supportPhone: "رقم هاتف الدعم",
      passwordMinLength: "الحد الأدنى لكلمة المرور",
      strongPassword: "كلمة مرور قوية",
      securityAlerts: "تنبيهات الأمان",
      weeklyReports: "التقارير الأسبوعية",
      rtlSupport: "دعم اللغة العربية",
    },
    en: {
      platformSettings: "Platform Settings",
      settingsDescription:
        "Manage general platform settings and configurations",
      backToDashboard: "Back to Dashboard",
      saveChanges: "Save Changes",
      changesSaved: "Changes saved successfully",
      generalSettings: "General Settings",
      commissionSettings: "Commission Settings",
      securitySettings: "Security Settings",
      notificationSettings: "Notification Settings",
      appearanceSettings: "Appearance Settings",
      advancedSettings: "Advanced Settings",
      platformName: "Platform Name",
      platformDescription: "Platform Description",
      defaultLanguage: "Default Language",
      timezone: "Timezone",
      currency: "Currency",
      dateFormat: "Date Format",
      commissionRate: "Commission Rate",
      taxRate: "Tax Rate",
      minimumPayout: "Minimum Payout",
      payoutSchedule: "Payout Schedule",
      requireEmailVerification: "Email Verification",
      requirePhoneVerification: "Phone Verification",
      twoFactorAuth: "Two-Factor Authentication",
      sessionTimeout: "Session Timeout (minutes)",
      maxLoginAttempts: "Max Login Attempts",
      emailNotifications: "Email Notifications",
      smsNotifications: "SMS Notifications",
      pushNotifications: "Push Notifications",
      newStoreAlerts: "New Store Alerts",
      suspensionAlerts: "Suspension Alerts",
      payoutAlerts: "Payout Alerts",
      primaryColor: "Primary Color",
      secondaryColor: "Secondary Color",
      darkMode: "Dark Mode",
      fontFamily: "Font Family",
      borderRadius: "Border Radius",
      percentage: "Percentage",
      fixed: "Fixed",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      enabled: "Enabled",
      disabled: "Disabled",
      yemenRiyal: "Yemeni Riyal",
      saudiRiyal: "Saudi Riyal",
      usDollar: "US Dollar",
      euro: "Euro",
      yemen: "Yemen - Sana'a",
      saudi: "Saudi Arabia - Riyadh",
      supportEmail: "Support Email",
      supportPhone: "Support Phone",
      passwordMinLength: "Password Minimum Length",
      strongPassword: "Strong Password",
      securityAlerts: "Security Alerts",
      weeklyReports: "Weekly Reports",
      rtlSupport: "RTL Support",
    },
  };

  const currentText = text[language];

  const handleSave = async () => {
    setLoading(true);
    try {
      // محاكاة حفظ الإعدادات
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "تم بنجاح",
        description: currentText.changesSaved,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const tabs = [
    { id: "general", label: currentText.generalSettings, icon: Settings },
    {
      id: "commission",
      label: currentText.commissionSettings,
      icon: CreditCard,
    },
    { id: "security", label: currentText.securitySettings, icon: Shield },
    {
      id: "notifications",
      label: currentText.notificationSettings,
      icon: Bell,
    },
    { id: "appearance", label: currentText.appearanceSettings, icon: Palette },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {currentText.platformName}
          </label>
          <input
            type="text"
            value={settings.general.platformName}
            onChange={(e) =>
              handleSettingChange("general", "platformName", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {currentText.defaultLanguage}
          </label>
          <select
            value={settings.general.defaultLanguage}
            onChange={(e) =>
              handleSettingChange("general", "defaultLanguage", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {currentText.timezone}
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) =>
              handleSettingChange("general", "timezone", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Asia/Aden">{currentText.yemen} (UTC+3)</option>
            <option value="Asia/Riyadh">{currentText.saudi} (UTC+3)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">New York (UTC-5)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {currentText.currency}
          </label>
          <select
            value={settings.general.currency}
            onChange={(e) =>
              handleSettingChange("general", "currency", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="YER">{currentText.yemenRiyal} (YER)</option>
            <option value="SAR">{currentText.saudiRiyal} (SAR)</option>
            <option value="USD">{currentText.usDollar} (USD)</option>
            <option value="EUR">{currentText.euro} (EUR)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {currentText.supportEmail}
          </label>
          <input
            type="email"
            value={settings.general.supportEmail}
            onChange={(e) =>
              handleSettingChange("general", "supportEmail", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {currentText.supportPhone}
          </label>
          <input
            type="tel"
            value={settings.general.supportPhone}
            onChange={(e) =>
              handleSettingChange("general", "supportPhone", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {currentText.platformDescription}
        </label>
        <textarea
          value={settings.general.platformDescription}
          onChange={(e) =>
            handleSettingChange(
              "general",
              "platformDescription",
              e.target.value,
            )
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );

  const renderCommissionSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {currentText.commissionRate} (%)
          </label>
          <div className="relative">
            <input
              type="number"
              value={settings.commission.commissionRate}
              onChange={(e) =>
                handleSettingChange(
                  "commission",
                  "commissionRate",
                  parseInt(e.target.value),
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              min="0"
              max="100"
            />
            <span className="absolute right-3 rtl:left-3 rtl:right-auto top-2 text-gray-500">
              %
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {currentText.taxRate} (%)
          </label>
          <div className="relative">
            <input
              type="number"
              value={settings.commission.taxRate}
              onChange={(e) =>
                handleSettingChange(
                  "commission",
                  "taxRate",
                  parseInt(e.target.value),
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              min="0"
              max="100"
            />
            <span className="absolute right-3 rtl:left-3 rtl:right-auto top-2 text-gray-500">
              %
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {currentText.minimumPayout} (
            {settings.general.currency === "YER"
              ? "ريال يمني"
              : settings.general.currency}
            )
          </label>
          <input
            type="number"
            value={settings.commission.minimumPayout}
            onChange={(e) =>
              handleSettingChange(
                "commission",
                "minimumPayout",
                parseInt(e.target.value),
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {currentText.payoutSchedule}
          </label>
          <select
            value={settings.commission.payoutSchedule}
            onChange={(e) =>
              handleSettingChange(
                "commission",
                "payoutSchedule",
                e.target.value,
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="daily">{currentText.daily}</option>
            <option value="weekly">{currentText.weekly}</option>
            <option value="monthly">{currentText.monthly}</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">
              {currentText.requireEmailVerification}
            </h4>
            <p className="text-sm text-gray-600">
              يتطلب من المستخدمين تفعيل بريدهم الإلكتروني
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.security.requireEmailVerification}
              onChange={(e) =>
                handleSettingChange(
                  "security",
                  "requireEmailVerification",
                  e.target.checked,
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:rtl:-translate-x-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">
              {currentText.requirePhoneVerification}
            </h4>
            <p className="text-sm text-gray-600">
              يتطلب من المستخدمين تفعيل رقم هاتفهم
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.security.requirePhoneVerification}
              onChange={(e) =>
                handleSettingChange(
                  "security",
                  "requirePhoneVerification",
                  e.target.checked,
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:rtl:-translate-x-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">
              {currentText.twoFactorAuth}
            </h4>
            <p className="text-sm text-gray-600">
              تفعيل المصادقة الثنائية للمشرفين
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) =>
                handleSettingChange(
                  "security",
                  "twoFactorAuth",
                  e.target.checked,
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:rtl:-translate-x-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">
              {currentText.strongPassword}
            </h4>
            <p className="text-sm text-gray-600">
              يتطلب كلمات مرور قوية تحتوي على أحرف وأرقام ورموز
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.security.strongPassword}
              onChange={(e) =>
                handleSettingChange(
                  "security",
                  "strongPassword",
                  e.target.checked,
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:rtl:-translate-x-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {currentText.sessionTimeout} (دقيقة)
            </label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) =>
                handleSettingChange(
                  "security",
                  "sessionTimeout",
                  parseInt(e.target.value),
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {currentText.maxLoginAttempts}
            </label>
            <input
              type="number"
              value={settings.security.maxLoginAttempts}
              onChange={(e) =>
                handleSettingChange(
                  "security",
                  "maxLoginAttempts",
                  parseInt(e.target.value),
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {currentText.passwordMinLength}
            </label>
            <input
              type="number"
              value={settings.security.passwordMinLength}
              onChange={(e) =>
                handleSettingChange(
                  "security",
                  "passwordMinLength",
                  parseInt(e.target.value),
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              min="6"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">
              {currentText.emailNotifications}
            </h4>
            <p className="text-sm text-gray-600">
              إرسال إشعارات عبر البريد الإلكتروني
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) =>
                handleSettingChange(
                  "notifications",
                  "emailNotifications",
                  e.target.checked,
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:rtl:-translate-x-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">
              {currentText.smsNotifications}
            </h4>
            <p className="text-sm text-gray-600">
              إرسال إشعارات عبر الرسائل النصية
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.smsNotifications}
              onChange={(e) =>
                handleSettingChange(
                  "notifications",
                  "smsNotifications",
                  e.target.checked,
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:rtl:-translate-x-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">
              {currentText.newStoreAlerts}
            </h4>
            <p className="text-sm text-gray-600">
              إشعارات عند إنشاء متاجر جديدة
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.newStoreAlerts}
              onChange={(e) =>
                handleSettingChange(
                  "notifications",
                  "newStoreAlerts",
                  e.target.checked,
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:rtl:-translate-x-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">
              {currentText.suspensionAlerts}
            </h4>
            <p className="text-sm text-gray-600">إشعارات عند تعليق المتاجر</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.suspensionAlerts}
              onChange={(e) =>
                handleSettingChange(
                  "notifications",
                  "suspensionAlerts",
                  e.target.checked,
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:rtl:-translate-x-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">
              {currentText.securityAlerts}
            </h4>
            <p className="text-sm text-gray-600">
              إشعارات عند اكتشاف أنشطة أمنية مشبوهة
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.securityAlerts}
              onChange={(e) =>
                handleSettingChange(
                  "notifications",
                  "securityAlerts",
                  e.target.checked,
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:rtl:-translate-x-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {currentText.primaryColor}
          </label>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <input
              type="color"
              value={settings.appearance.primaryColor}
              onChange={(e) =>
                handleSettingChange(
                  "appearance",
                  "primaryColor",
                  e.target.value,
                )
              }
              className="w-12 h-12 rounded border border-gray-300"
            />
            <input
              type="text"
              value={settings.appearance.primaryColor}
              onChange={(e) =>
                handleSettingChange(
                  "appearance",
                  "primaryColor",
                  e.target.value,
                )
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {currentText.secondaryColor}
          </label>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <input
              type="color"
              value={settings.appearance.secondaryColor}
              onChange={(e) =>
                handleSettingChange(
                  "appearance",
                  "secondaryColor",
                  e.target.value,
                )
              }
              className="w-12 h-12 rounded border border-gray-300"
            />
            <input
              type="text"
              value={settings.appearance.secondaryColor}
              onChange={(e) =>
                handleSettingChange(
                  "appearance",
                  "secondaryColor",
                  e.target.value,
                )
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {currentText.fontFamily}
          </label>
          <select
            value={settings.appearance.fontFamily}
            onChange={(e) =>
              handleSettingChange("appearance", "fontFamily", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Cairo">Cairo (عربية)</option>
            <option value="Tajawal">Tajawal (عربية)</option>
            <option value="Inter">Inter (إنجليزية)</option>
            <option value="Roboto">Roboto (إنجليزية)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {currentText.borderRadius} (px)
          </label>
          <input
            type="number"
            value={parseInt(settings.appearance.borderRadius)}
            onChange={(e) =>
              handleSettingChange(
                "appearance",
                "borderRadius",
                `${e.target.value}px`,
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            min="0"
            max="20"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">{currentText.darkMode}</h4>
          <p className="text-sm text-gray-600">تفعيل الوضع الداكن للمنصة</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.appearance.darkMode}
            onChange={(e) =>
              handleSettingChange("appearance", "darkMode", e.target.checked)
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:rtl:-translate-x-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">
            {currentText.rtlSupport}
          </h4>
          <p className="text-sm text-gray-600">
            تفعيل دعم اللغة العربية والاتجاه من اليمين لليسار
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.appearance.rtlSupport}
            onChange={(e) =>
              handleSettingChange("appearance", "rtlSupport", e.target.checked)
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:rtl:-translate-x-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings();
      case "commission":
        return renderCommissionSettings();
      case "security":
        return renderSecuritySettings();
      case "notifications":
        return renderNotificationSettings();
      case "appearance":
        return renderAppearanceSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isArabic ? "rtl" : "ltr"}`}
    >
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>{currentText.backToDashboard}</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Settings className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">
                  {currentText.platformSettings}
                </span>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="btn-gradient"
            >
              <Save className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {loading ? "جاري الحفظ..." : currentText.saveChanges}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>
                  {tabs.find((tab) => tab.id === activeTab)?.label}
                </CardTitle>
                <CardDescription>
                  {currentText.settingsDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>{renderContent()}</CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
