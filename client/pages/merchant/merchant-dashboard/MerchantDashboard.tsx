import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// ✅ الجديد (المسار الصحيح):
import { storeService } from "@/lib/src/services/store/store.service";
import { productService } from "@/lib/src/services/product/product.service";
import { orderService } from "@/lib/src/services/order/order.service";
import { customerService } from "@/lib/src/services/customer/customer.service";

// الأنواع
import type { Store } from "@/lib/src/types/store.types";
import type { Product } from "@/lib/src/types/product.types";
import type { Order } from "@/lib/src/types/order.types";
import type { Category } from "@/lib/src/types/category.types";
import type { ShippingAddress } from "@/lib/src/types/shared.types";

// Contexts

// استيراد مكونات الأقسام
import OverviewTab from "./components/OverviewTab";
import ProductsTab from "./components/ProductsTab";
import OrdersTab from "./components/OrdersTab";
import CustomersTab from "./components/CustomersTab";
import DesignTab from "./components/DesignTab";
import SettingsTab from "./components/SettingsTab";
import AnalyticsTab from "./components/AnalyticsTab";

// 🔥 استيراد StoreChecklist الجديد
import StoreChecklist, { ChecklistItems } from "./components/StoreChecklist";
import { categoryService } from "@/lib/src/services/category";

// استيراد المكونات المشتركة
import { DashboardHeader } from "./components/shared/Layout";
import { ConfirmDialog } from "./components/shared/ConfirmDialog";
import {
  Stats,
  ExtendedCustomer,
  ExtendedStore,
  ConfirmDialogState,
  SubActiveTabs,
  StoreSettings,
  ShippingSettings,
  PaymentSettings,
  DesignSettings,
} from "./types";
import { useAuth } from "@/lib/contexts/AuthContext";
import { updateCustomerShippingAddress } from "@/lib/src/services/customer/customer.service";
import { updateOrderShippingAddressWithGovernorate } from "@/lib/src/services/order/order.service";
import { LoadingSkeleton } from "./components/shared/LoadingSkeleton";
import { useStore } from "@/lib/contexts/StoreContext";

// قائمة المحافظات اليمنية
export const YEMENI_GOVERNORATES = [
  "أمانة العاصمة (صنعاء)",
  "صنعاء",
  "عدن",
  "تعز",
  "الحديدة",
  "إب",
  "ذمار",
  "مأرب",
  "الجوف",
  "المهرة",
  "حضرموت",
  "شبوة",
  "عمران",
  "البيضاء",
  "الضالع",
  "لحج",
  "أبين",
  "حجة",
  "صعدة",
  "ريمة",
  "سقطرى",
];

export default function MerchantComprehensiveDashboard() {
  const { userData, loading: authLoading } = useAuth(); // 🔥 تغيير الاسم
  const { store: contextStore, loading: storeLoading } = useStore();

  const navigate = useNavigate();
  const location = useLocation(); // 🔥 تم إضافة useLocation
  const { toast } = useToast();

  // الحالات الرئيسية
  const [store, setStore] = useState<ExtendedStore | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<ExtendedCustomer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 حالة العرض التلقائي للـ Checklist
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState({
    addProduct: false,
    addCategories: false,
    enableShipping: false,
    enablePayment: false,
    verification: false,
    customDomain: false,
    seoOptimization: false,
  });

  // حالة التبويبات الفرعية لكل قسم
  const [subActiveTab, setSubActiveTab] = useState<SubActiveTabs>({
    products: "management",
    orders: "management",
    customers: "customers",
    design: "store-data",
    settings: "settings-tools",
    analytics: "store-performance",
  });

  // 🔥 إضافة حالة للتبويب الفرعي النشط العام
  const [activeSubTab, setActiveSubTab] = useState("");

  // حالات التحميل والحفظ
  const [savingStoreSettings, setSavingStoreSettings] = useState(false);
  const [savingShippingSettings, setSavingShippingSettings] = useState(false);
  const [savingPaymentSettings, setSavingPaymentSettings] = useState(false);
  const [savingDesignSettings, setSavingDesignSettings] = useState(false);
  const [savingCustomerAddress, setSavingCustomerAddress] = useState<
    string | null
  >(null);
  const [savingOrderAddress, setSavingOrderAddress] = useState<string | null>(
    null,
  );

  // حوارات التأكيد
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "store",
  });

  // حالات التحرير
  const [editingCustomer, setEditingCustomer] = useState<{
    id: string;
    shippingAddress: ShippingAddress;
  } | null>(null);

  const [editingOrder, setEditingOrder] = useState<{
    id: string;
    shippingAddress: ShippingAddress;
  } | null>(null);

  // الإحصائيات
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    activeCustomers: 0,
    monthlyRevenue: 0,
    conversionRate: 3.4,
    averageOrderValue: 0,
    returnRate: 1.2,
    topSellingProducts: [] as Product[],
    salesByMonth: [] as { month: string; sales: number }[],
    visitorsCount: 1256,
    bounceRate: 34.5,
    newCustomersThisMonth: 24,
    averageProcessingTime: 2.5,
    customerSatisfaction: 92,
  });

  // إعدادات المتجر
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: "",
    description: "",
    logo: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "",
    governorate: "",
    country: "اليمن",
    originalCity: "",
    zipCode: "",
    currency: "YER",
    language: "ar",
    timezone: "Asia/Aden",
    taxNumber: "",
    commercialRegistration: "",
  });

  // إعدادات الشحن
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    enabled: true,
    freeShippingThreshold: 20000,
    shippingCost: 1500,
    defaultCost: 1500,
    shippingZones: [],
    shippingMethods: [],
  });

  // إعدادات الدفع
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    cashOnDelivery: true,
    bankTransfer: true,
    creditCard: false,
    paypal: false,
    stripe: false,
    mada: false,
    mobileWallet: false,
    bankInfo: {
      bankName: "",
      accountNumber: "",
      accountName: "",
      iban: "",
      swiftCode: "",
    },
  });

  // إعدادات التصميم
  const [designSettings, setDesignSettings] = useState<DesignSettings>({
    theme: "light",
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6",
    fontFamily: "Tajawal",
    logo: "",
    favicon: "",
  });

  // 🔥 تحقق من عرض Checklist عند تحميل الصفحة
  useEffect(() => {
    const checkForNewStore = () => {
      const currentStore = localStorage.getItem("currentStore");
      const isNewMerchant = localStorage.getItem("isNewMerchant");
      const showChecklistParam = location.state?.showChecklist;

      if (currentStore) {
        const storeData = JSON.parse(currentStore);

        // تحقق من Checklist الموجود في البيانات
        if (storeData.checklist) {
          setChecklistItems(storeData.checklist);
        }

        // عرض Checklist إذا:
        // 1. كان هناك معلمة showChecklist في الـ state
        // 2. أو كان المتجر جديداً (isNewMerchant)
        // 3. أو كان مستوى الإكمال أقل من 50%
        const completionRate = calculateChecklistCompletion(
          storeData.checklist,
        );

        if (
          showChecklistParam ||
          isNewMerchant === "true" ||
          completionRate < 50
        ) {
          setShowChecklist(true);
          localStorage.removeItem("isNewMerchant");
        }
      }
    };

    checkForNewStore();
  }, [location.state]);

  // 🔥 دالة حساب نسبة إكمال Checklist
  const calculateChecklistCompletion = (items: any) => {
    if (!items) return 0;
    const totalItems = Object.keys(items).length;
    const completedItems = Object.values(items).filter(
      (item) => item === true,
    ).length;
    return Math.round((completedItems / totalItems) * 100);
  };

  // 🔥 دالة تحديث حالة Checklist
  const handleUpdateChecklist = async (itemId: string, completed: boolean) => {
    try {
      // منطق التحديث
      const updatedChecklist = {
        ...checklistItems,
        [itemId]: completed,
      };

      // حساب مستوى الامتثال الجديد
      const completedCount =
        Object.values(updatedChecklist).filter(Boolean).length;
      const totalItems = Object.keys(updatedChecklist).length;
      const completionRate = (completedCount / totalItems) * 100;

      let newComplianceLevel: "basic" | "intermediate" | "advanced" = "basic";
      if (completionRate >= 80) {
        newComplianceLevel = "advanced";
      } else if (completionRate >= 50) {
        newComplianceLevel = "intermediate";
      }

      // الخطوات التالية
      const nextSteps = [];
      if (!updatedChecklist.addProduct && newComplianceLevel === "basic") {
        nextSteps.push("أضف منتجك الأول");
      }
      if (
        !updatedChecklist.enablePayment &&
        newComplianceLevel === "intermediate"
      ) {
        nextSteps.push("فعل طرق الدفع");
      }
      if (
        !updatedChecklist.seoOptimization &&
        newComplianceLevel === "advanced"
      ) {
        nextSteps.push("حسن محركات البحث");
      }

      // تحديث الحالة
      setChecklistItems(updatedChecklist);

      // إرجاع القيمة المطلوبة
      return {
        newChecklist: updatedChecklist,
        newComplianceLevel,
        nextSteps,
      };
    } catch (error) {
      console.error("خطأ في تحديث القائمة:", error);
      throw error;
    }
  };

  // تحميل البيانات الأولية
  useEffect(() => {
    if (userData) {
      loadMerchantData();
    }
  }, [userData]);

  const loadMerchantData = async () => {
    try {
      console.log("🔍 [DASHBOARD] بدء تحميل بيانات لوحة التحكم...");

      if (!userData?.uid) {
        console.warn("⚠️ لا يوجد معرف مستخدم");
        return;
      }

      const userStores = await storeService.getByOwner(userData.uid);
      console.log(`🏪 عدد المتاجر للمستخدم: ${userStores.length}`);

      if (userStores.length === 0) {
        console.warn("⚠️ المستخدم ليس لديه متاجر");
        setStore(null);
        setLoading(false);
        return;
      }

      const merchantStore = userStores[0] as ExtendedStore;

      // 🔧 الإصلاح: استبدل السطر 363 وما حوله:
      console.log("✅ المتجر المحمل:", {
        id: merchantStore.id,
        name: merchantStore.name,
        subBusinessTypes: merchantStore.businessActivities?.subActivities || [], // استخدام optional chaining
        primaryBusinessType:
          merchantStore.businessActivities?.mainActivity || "غير محدد", // استخدام optional chaining
        currency: merchantStore.currency || merchantStore.settings?.currency,
        timezone: merchantStore.timezone || merchantStore.settings?.timezone,
        language: merchantStore.language || merchantStore.settings?.language,
        taxNumber: merchantStore.taxNumber,
        commercialRegistration: merchantStore.commercialRegistration,
        governorate: merchantStore.contact?.governorate,
        originalCity: merchantStore.contact?.originalCity,
        zipCode: merchantStore.contact?.zipCode,
      });

      setStore(merchantStore);

      // 🔥 تحميل Checklist من المتجر
      if (merchantStore.checklist) {
        setChecklistItems(merchantStore.checklist);
      }

      // تحديث إعدادات المتجر
      setStoreSettings({
        name: merchantStore.name,
        description: merchantStore.description || "",
        logo: merchantStore.logo || "",
        contactEmail: merchantStore.contact?.email || "",
        contactPhone: merchantStore.contact?.phone || "",
        address: merchantStore.contact?.address || "",
        city: merchantStore.contact?.city || "",
        governorate:
          merchantStore.contact?.governorate || YEMENI_GOVERNORATES[0],
        country: merchantStore.contact?.country || "اليمن",
        originalCity: merchantStore.contact?.originalCity || "",
        zipCode: merchantStore.contact?.zipCode || "",
        currency:
          merchantStore.currency || merchantStore.settings?.currency || "YER",
        language:
          merchantStore.language || merchantStore.settings?.language || "ar",
        timezone:
          merchantStore.timezone ||
          merchantStore.settings?.timezone ||
          "Asia/Aden",
        taxNumber: merchantStore.taxNumber || "",
        commercialRegistration: merchantStore.commercialRegistration || "",
      });

      // تحميل البيانات الأخرى
      const [storeProducts, storeOrders, storeCategories] = await Promise.all([
        productService.getByStore(merchantStore.id),
        orderService.getByStore(merchantStore.id),
        categoryService.getByStore(merchantStore.id),
      ]);

      setProducts(storeProducts);
      setOrders(storeOrders);
      setCategories(storeCategories);

      // تحميل العملاء
      const storeCustomers = await customerService.getByStore(merchantStore.id);
      const extendedCustomers: ExtendedCustomer[] = storeCustomers.map(
        (customer) => ({
          ...customer,
          storeId: merchantStore.id,
          totalOrders: (customer as any).totalOrders || 0,
          totalSpent: (customer as any).totalSpent || 0,
        }),
      );

      setCustomers(extendedCustomers);

      // تحديث الإحصائيات
      updateStats(storeProducts, storeOrders, extendedCustomers);

      // تحديث إعدادات الشحن
      if (merchantStore.settings?.shipping) {
        setShippingSettings({
          enabled: merchantStore.settings.shipping.enabled,
          freeShippingThreshold:
            merchantStore.settings.shipping.freeShippingThreshold || 20000,
          shippingCost: merchantStore.settings.shipping.shippingCost || 1500,
          defaultCost: merchantStore.settings.shipping.defaultCost || 1500,
          shippingZones: merchantStore.settings.shipping.zones || [],
          shippingMethods: merchantStore.settings.shipping.methods || [],
        });
      }

      // تحديث إعدادات الدفع
      if (merchantStore.settings?.payment) {
        setPaymentSettings({
          cashOnDelivery: merchantStore.settings.payment.cashOnDelivery,
          bankTransfer: merchantStore.settings.payment.bankTransfer,
          creditCard: merchantStore.settings.payment.creditCard || false,
          paypal: merchantStore.settings.payment.paypal || false,
          stripe: merchantStore.settings.payment.stripe || false,
          mada: merchantStore.settings.payment.mada || false,
          mobileWallet: merchantStore.settings.payment.mobileWallet || false,
          bankInfo: {
            bankName: merchantStore.settings!.payment.bankInfo?.bankName || "",
            accountNumber:
              merchantStore.settings!.payment.bankInfo?.accountNumber || "",
            accountName:
              merchantStore.settings!.payment.bankInfo?.accountName || "",
            iban: merchantStore.settings!.payment.bankInfo?.iban || "",
            swiftCode:
              merchantStore.settings!.payment.bankInfo?.swiftCode || "",
          },
        });
      }

      // تحديث إعدادات التصميم
      if (merchantStore.customization) {
        const { branding, colors } = merchantStore.customization;
        if (branding && colors) {
          setDesignSettings((prev) => ({
            ...prev,
            primaryColor: colors.primary || prev.primaryColor,
            secondaryColor: colors.secondary || prev.secondaryColor,
            logo: branding.logo || prev.logo,
          }));
        }
      }

      console.log("✅ تم تحميل جميع البيانات بنجاح!");
    } catch (error) {
      console.error("❌ خطأ في تحميل بيانات التاجر:", error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "تعذر تحميل البيانات من قاعدة البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (
    products: Product[],
    orders: Order[],
    customers: ExtendedCustomer[],
  ) => {
    const revenue = orders
      .filter((order) => order.orderStatus === "delivered")
      .reduce((sum, order) => sum + order.total, 0);

    const pendingOrdersCount = orders.filter((order) =>
      ["pending", "processing"].includes(order.orderStatus),
    ).length;

    const lowStockCount = products.filter(
      (product) =>
        product.inventory?.quantity <= 5 && product.status === "active",
    ).length;

    const activeCustomersCount = customers.filter(
      (customer) => customer.isActive,
    ).length;

    const avgOrderValue = orders.length > 0 ? revenue / orders.length : 0;

    const topProducts = [...products]
      .sort(
        (a, b) => (b.inventory?.quantity || 0) - (a.inventory?.quantity || 0),
      )
      .slice(0, 5);

    const salesByMonth = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleDateString("ar-YE", { month: "long" }),
        sales: Math.floor(Math.random() * 500000) + 100000,
      };
    }).reverse();

    setStats((prev) => ({
      ...prev,
      totalRevenue: revenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      pendingOrders: pendingOrdersCount,
      lowStockProducts: lowStockCount,
      activeCustomers: activeCustomersCount,
      monthlyRevenue: revenue * 0.3,
      averageOrderValue: avgOrderValue,
      topSellingProducts: topProducts,
      salesByMonth,
    }));
  };

  // دوال الحفظ والتأكيد
  const showConfirmDialog = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "store" | "shipping" | "payment" | "design" | "customer" | "order",
  ) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      onConfirm,
      type,
    });
  };

  // دالة حفظ إعدادات المتجر
  const handleSaveStoreSettings = async () => {
    if (!store) return;

    const saveAction = async () => {
      setSavingStoreSettings(true);
      try {
        await storeService.update(store.id, {
          name: storeSettings.name,
          description: storeSettings.description,
          logo: storeSettings.logo,
          contact: {
            email: storeSettings.contactEmail,
            phone: storeSettings.contactPhone,
            address: storeSettings.address,
            city: storeSettings.city,
            governorate: storeSettings.governorate,
            country: storeSettings.country,
            originalCity: storeSettings.originalCity,
            zipCode: storeSettings.zipCode,
          },
          currency: storeSettings.currency,
          language: storeSettings.language,
          timezone: storeSettings.timezone,
          taxNumber: storeSettings.taxNumber,
          commercialRegistration: storeSettings.commercialRegistration,
        });

        toast({
          title: "✅ تم الحفظ بنجاح",
          description: "تم تحديث جميع إعدادات المتجر",
        });

        loadMerchantData();
      } catch (error) {
        console.error("❌ خطأ في حفظ إعدادات المتجر:", error);
        toast({
          title: "❌ خطأ في الحفظ",
          description: "تعذر حفظ الإعدادات",
          variant: "destructive",
        });
      } finally {
        setSavingStoreSettings(false);
      }
    };

    showConfirmDialog(
      "تأكيد الحفظ",
      "هل أنت متأكد من حفظ التغييرات على إعدادات المتجر؟",
      saveAction,
      "store",
    );
  };

  // دالة حفظ إعدادات التصميم
  const handleSaveDesignSettings = async () => {
    if (!store) return;

    const saveAction = async () => {
      setSavingDesignSettings(true);
      try {
        await storeService.update(store.id, {
          customization: {
            ...store?.customization,
            colors: {
              ...store?.customization?.colors,
              primary: designSettings.primaryColor,
              secondary: designSettings.secondaryColor,
            },
            branding: {
              ...store?.customization?.branding,
              logo: designSettings.logo,
            },
          },
        });

        toast({
          title: "✅ تم الحفظ بنجاح",
          description: "تم تحديث إعدادات التصميم",
        });

        loadMerchantData();
      } catch (error) {
        console.error("❌ خطأ في حفظ إعدادات التصميم:", error);
        toast({
          title: "❌ خطأ في الحفظ",
          description: "تعذر حفظ إعدادات التصميم",
          variant: "destructive",
        });
      } finally {
        setSavingDesignSettings(false);
      }
    };

    showConfirmDialog(
      "تأكيد الحفظ",
      "هل أنت متأكد من حفظ التغييرات على إعدادات التصميم؟",
      saveAction,
      "design",
    );
  };

  // دالة حفظ إعدادات الشحن
  const handleSaveShippingSettings = async () => {
    if (!store) return;

    const saveAction = async () => {
      setSavingShippingSettings(true);
      try {
        await storeService.update(store.id, {
          settings: {
            ...store?.settings,
            shipping: {
              ...store?.settings?.shipping,
              enabled: shippingSettings.enabled,
              freeShippingThreshold: shippingSettings.freeShippingThreshold,
              shippingCost: shippingSettings.shippingCost,
              defaultCost: shippingSettings.defaultCost,
              zones: shippingSettings.shippingZones,
              methods: shippingSettings.shippingMethods,
            },
          },
        });

        toast({
          title: "✅ تم الحفظ بنجاح",
          description: "تم تحديث إعدادات الشحن",
        });

        loadMerchantData();
      } catch (error) {
        console.error("❌ خطأ في حفظ إعدادات الشحن:", error);
        toast({
          title: "❌ خطأ في الحفظ",
          description: "تعذر حفظ إعدادات الشحن",
          variant: "destructive",
        });
      } finally {
        setSavingShippingSettings(false);
      }
    };

    showConfirmDialog(
      "تأكيد الحفظ",
      "هل أنت متأكد من حفظ التغييرات على إعدادات الشحن؟",
      saveAction,
      "shipping",
    );
  };

  // دالة حفظ إعدادات الدفع
  const handleSavePaymentSettings = async () => {
    if (!store) return;

    const saveAction = async () => {
      setSavingPaymentSettings(true);
      try {
        await storeService.update(store.id, {
          settings: {
            ...store?.settings,
            payment: {
              ...store?.settings?.payment,
              cashOnDelivery: paymentSettings.cashOnDelivery,
              bankTransfer: paymentSettings.bankTransfer,
              creditCard: paymentSettings.creditCard,
              paypal: paymentSettings.paypal,
              stripe: paymentSettings.stripe,
              mada: paymentSettings.mada,
              mobileWallet: paymentSettings.mobileWallet,
              bankInfo: paymentSettings.bankInfo,
            },
          },
        });

        toast({
          title: "✅ تم الحفظ بنجاح",
          description: "تم تحديث إعدادات الدفع",
        });

        loadMerchantData();
      } catch (error) {
        console.error("❌ خطأ في حفظ إعدادات الدفع:", error);
        toast({
          title: "❌ خطأ في الحفظ",
          description: "تعذر حفظ إعدادات الدفع",
          variant: "destructive",
        });
      } finally {
        setSavingPaymentSettings(false);
      }
    };

    showConfirmDialog(
      "تأكيد الحفظ",
      "هل أنت متأكد من حفظ التغييرات على إعدادات الدفع؟",
      saveAction,
      "payment",
    );
  };

  // دالة تحديث عنوان العميل
  const handleUpdateCustomerAddress = async (
    customerId: string,
    shippingAddress: ShippingAddress,
  ) => {
    setSavingCustomerAddress(customerId);
    try {
      await updateCustomerShippingAddress(customerId, { shippingAddress });

      toast({
        title: "✅ تم التحديث",
        description: "تم تحديث عنوان الشحن للعميل",
      });

      // تحديث القائمة المحلية
      setCustomers(
        customers.map((customer) =>
          customer.uid === customerId
            ? { ...customer, shippingAddress }
            : customer,
        ),
      );

      setEditingCustomer(null);
    } catch (error) {
      console.error("❌ خطأ في تحديث عنوان العميل:", error);
      toast({
        title: "❌ خطأ في التحديث",
        description: "تعذر تحديث عنوان العميل",
        variant: "destructive",
      });
    } finally {
      setSavingCustomerAddress(null);
    }
  };

  // دالة تحديث عنوان الطلب
  const handleUpdateOrderAddress = async (
    orderId: string,
    shippingAddress: ShippingAddress,
  ) => {
    setSavingOrderAddress(orderId);
    try {
      await updateOrderShippingAddressWithGovernorate(orderId, {
        shippingAddress,
      });

      toast({
        title: "✅ تم التحديث",
        description: "تم تحديث عنوان الشحن للطلب",
      });

      // تحديث القائمة المحلية
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, shippingAddress } : order,
        ),
      );

      setEditingOrder(null);
    } catch (error) {
      console.error("❌ خطأ في تحديث عنوان الطلب:", error);
      toast({
        title: "❌ خطأ في التحديث",
        description: "تعذر تحديث عنوان الطلب",
        variant: "destructive",
      });
    } finally {
      setSavingOrderAddress(null);
    }
  };

  // تحديث حالة التبويبات الفرعية - تم التعديل لتكون متوافقة
  const updateSubTab = (tabName: string, subTabId: string) => {
    // تحقق من أن tabName صحيح قبل التحديث
    const validTabNames: (keyof SubActiveTabs)[] = [
      "products",
      "orders",
      "customers",
      "design",
      "settings",
      "analytics",
    ];

    if (validTabNames.includes(tabName as keyof SubActiveTabs)) {
      setSubActiveTab((prev) => ({
        ...prev,
        [tabName]: subTabId,
      }));
    }

    // 🔥 تحديث التبويب الفرعي النشط العام
    setActiveSubTab(subTabId);
  };

  // 🔥 دالة التعامل مع النقر على التبويب الرئيسي
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);

    // 🔥 ضبط التبويب الفرعي الافتراضي للقسم الجديد
    const defaultSubTabs: Record<string, string> = {
      products: "management",
      orders: "management",
      customers: "customers",
      design: "store-data",
      settings: "settings-tools",
      analytics: "store-performance",
    };

    if (defaultSubTabs[tabId]) {
      const subTabId = defaultSubTabs[tabId];
      setActiveSubTab(subTabId);
      updateSubTab(tabId, subTabId);
    } else {
      setActiveSubTab("");
    }
  };

  // 🔥 دالة لإخفاء Checklist
  const handleHideChecklist = () => {
    setShowChecklist(false);
    toast({
      title: "تم إخفاء قائمة المهام",
      description: "يمكنك إعادة عرضها من الإعدادات",
    });
  };

  // // حالة التحميل
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex flex-col">
  //       <div className="border-b py-4 px-6">
  //         <div className="flex items-center justify-between">
  //           <Skeleton className="h-8 w-48" />
  //           <Skeleton className="h-10 w-64" />
  //         </div>
  //       </div>
  //       <div className="flex-1 container mx-auto px-6 py-8">
  //         <div className="animate-pulse space-y-6">
  //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  //             {[1, 2, 3, 4].map((i) => (
  //               <Skeleton key={i} className="h-32 rounded-lg" />
  //             ))}
  //           </div>
  //           <Skeleton className="h-64 rounded-lg" />
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // // حالة عدم وجود متجر
  // if (!store) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center p-4">
  //       <div className="w-full max-w-md text-center">
  //         <h2 className="text-2xl font-bold mb-2">لا يوجد متجر</h2>
  //         <p className="text-muted-foreground mb-6">
  //           يبدو أنك لا تمتلك متجراً بعد. ابدأ رحلتك التجارية الآن!
  //         </p>
  //         <Button onClick={() => navigate("/create-store")} className="w-full">
  //           إنشاء متجر جديد
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }

  // 🔧 أضف سجلات تشخيصية
  useEffect(() => {
    console.log("🎯 [MERCHANT-DASHBOARD] Mounted with state:", {
      authLoading,
      storeLoading,
      userData: userData?.email,
      contextStore: contextStore?.name,
      localStore: store?.name,
      localLoading: loading,
    });
  }, [authLoading, storeLoading, userData, contextStore, store, loading]);

  // 🔧 تحميل البيانات عندما تتوفر السياقات
  useEffect(() => {
    console.log("🔄 [MERCHANT-DASHBOARD] useEffect triggered:", {
      hasUserData: !!userData,
      hasContextStore: !!contextStore,
      authLoading,
      storeLoading,
    });

    // انتظر حتى تكتمل تحميل السياقات
    if (authLoading || (storeLoading && !contextStore)) {
      console.log("⏳ [MERCHANT-DASHBOARD] Waiting for contexts...");
      return;
    }

    // إذا لم يكن هناك مستخدم، أعد التوجيه
    if (!userData) {
      console.log("👤 [MERCHANT-DASHBOARD] No user data, redirecting...");
      navigate("/login");
      return;
    }

    // إذا كان هناك متجر في السياق ولكن ليس في الحالة المحلية، حمله
    if (contextStore && !store) {
      console.log(
        "🏪 [MERCHANT-DASHBOARD] Context store available, loading merchant data...",
      );
      loadMerchantData();
    }

    // إذا لم يكن هناك متجر على الإطلاق
    if (!contextStore && !storeLoading) {
      console.log("📭 [MERCHANT-DASHBOARD] No store found");
      setStore(null);
      setLoading(false);
    }
  }, [userData, contextStore, authLoading, storeLoading]);

  // ... بقية الكود

  // حالة التحميل المعدلة
  if (authLoading) {
    console.log("⏳ [MERCHANT-DASHBOARD] Rendering skeleton (auth loading)");
    return (
      <div className="min-h-screen flex flex-col">
        <div className="border-b py-4 px-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
        <div className="flex-1 container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // حالة التحميل المعدلة
  if (authLoading) {
    console.log("⏳ [MERCHANT-DASHBOARD] Rendering skeleton (auth loading)");
    return <LoadingSkeleton />;
  }

  // حالة عدم وجود متجر - عرض مباشرة
  if (!contextStore && !storeLoading) {
    console.log("📭 [MERCHANT-DASHBOARD] Rendering no-store state");
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2">لا يوجد متجر</h2>
          <p className="text-muted-foreground mb-6">
            يبدو أنك لا تمتلك متجراً بعد. ابدأ رحلتك التجارية الآن!
          </p>
          <Button onClick={() => navigate("/create-store")} className="w-full">
            إنشاء متجر جديد
          </Button>
        </div>
      </div>
    );
  }

  // 🔧 أضف شرطاً لتحميل البيانات إذا كان المتجر محملاً ولكن البيانات لم تحمل بعد
  if (contextStore && !store) {
    console.log("🏪 [MERCHANT-DASHBOARD] Store exists but data not loaded");

    // 🔥 هذا مهم: استخدم contextStore مباشرة إذا كان store محلياً null
    const currentStore = contextStore as ExtendedStore;

    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader
          store={currentStore} // ⬅️ استخدام contextStore مباشرة
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          navigate={navigate}
          userData={userData}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          updateSubTab={updateSubTab}
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
        />

        <main className="flex-1">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري تحميل بيانات المتجر...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 🔧 إذا وصلنا إلى هنا، فالمتجر والبيانات محملة
  console.log(
    "🎉 [MERCHANT-DASHBOARD] Rendering dashboard for:",
    store?.name || contextStore?.name,
  );

  // 🔧 استخدام المتجر المناسب (المحلي أولاً، ثم السياقي)
  const displayStore = store || (contextStore as ExtendedStore);

  // 🔧 تأكد من أن displayStore ليس null
  if (!displayStore) {
    console.error("❌ [MERCHANT-DASHBOARD] No store to display!");
    return <LoadingSkeleton />;
  }

  // 🎉 الآن اعرض لوحة التحكم
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        store={displayStore}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        navigate={navigate}
        userData={userData}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        updateSubTab={updateSubTab}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
      />

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* 🔥 عرض Checklist تلقائياً للمتاجر الجديدة */}
          {showChecklist && displayStore && (
            <div className="mb-6">
              <StoreChecklist
                storeId={displayStore.id}
                storeName={displayStore.name}
                complianceLevel={displayStore.complianceLevel || "basic"}
                checklistItems={checklistItems}
                onHide={handleHideChecklist}
                onUpdate={function (
                  key: keyof ChecklistItems,
                  value: boolean,
                ): Promise<void> {
                  throw new Error("Function not implemented.");
                }}
              />
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-6"
          >
            {/* محتوى التبويبات */}
            <TabsContent value="overview">
              <OverviewTab stats={stats} />
            </TabsContent>

            <TabsContent value="products">
              <ProductsTab
                products={products}
                categories={categories}
                subActiveTab={subActiveTab.products}
                setSubActiveTab={(tabId) => updateSubTab("products", tabId)}
                navigate={navigate}
              />
            </TabsContent>

            <TabsContent value="orders">
              <OrdersTab
                orders={orders}
                subActiveTab={subActiveTab.orders}
                setSubActiveTab={(tabId) => updateSubTab("orders", tabId)}
                navigate={navigate}
                handleUpdateOrderAddress={handleUpdateOrderAddress}
                stats={{
                  total: stats.totalOrders,
                  pending: stats.pendingOrders,
                  processing: stats.averageProcessingTime,
                  shipped: 0,
                  delivered: 0,
                  revenue: stats.totalRevenue,
                  averageOrder: stats.averageOrderValue,
                }}
                showConfirmDialog={function (
                  title: string,
                  message: string,
                  onConfirm: () => void,
                  type:
                    | "shipping"
                    | "customer"
                    | "order"
                    | "payment"
                    | "product",
                ): void {
                  throw new Error("Function not implemented.");
                }}
                editingOrder={undefined}
                setEditingOrder={function (
                  value: React.SetStateAction<Order>,
                ): void {
                  throw new Error("Function not implemented.");
                }}
                savingOrderAddress={false}
                setSavingOrderAddress={function (
                  value: React.SetStateAction<boolean>,
                ): void {
                  throw new Error("Function not implemented.");
                }}
              />
            </TabsContent>

            <TabsContent value="customers">
              <CustomersTab
                customers={customers}
                subActiveTab={subActiveTab.customers}
                setSubActiveTab={(tabId) => updateSubTab("customers", tabId)}
                navigate={navigate}
              />
            </TabsContent>

            <TabsContent value="design">
              <DesignTab
                store={displayStore}
                subActiveTab={subActiveTab.design}
                setSubActiveTab={(tabId) => updateSubTab("design", tabId)}
                loadMerchantData={loadMerchantData}
              />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsTab
                store={displayStore}
                shippingSettings={shippingSettings}
                setShippingSettings={setShippingSettings}
                paymentSettings={paymentSettings}
                setPaymentSettings={setPaymentSettings}
                subActiveTab={subActiveTab.settings}
                setSubActiveTab={(tabId) => updateSubTab("settings", tabId)}
                loadMerchantData={loadMerchantData}
                showConfirmDialog={showConfirmDialog}
                handleSaveShippingSettings={handleSaveShippingSettings}
                handleSavePaymentSettings={handleSavePaymentSettings}
                savingShippingSettings={savingShippingSettings}
                savingPaymentSettings={savingPaymentSettings}
                YEMENI_GOVERNORATES={YEMENI_GOVERNORATES}
                checklistItems={checklistItems}
                updateChecklistItem={handleUpdateChecklist}
              />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsTab
                stats={stats}
                subActiveTab={subActiveTab.analytics}
                setSubActiveTab={(tabId) => updateSubTab("analytics", tabId)}
                checklistItems={checklistItems}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <ConfirmDialog
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
      />
    </div>
  );
}
