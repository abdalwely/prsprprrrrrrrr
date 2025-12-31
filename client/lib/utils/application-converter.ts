// 📂 client/lib/utils/application-converter.ts
/**
 * محول بيانات متقدم لتحويل وتطبيع بيانات الطلبات
 */

import {
  UnifiedStoreApplication,
  UnifiedStore,
  MerchantData,
  StoreConfig,
} from "@/lib/types/unified-types";
import { storeService, Store } from "@/lib/firestore";
import { StoreCustomization } from "../types/store";

// ============================================
// 🛠️ الثوابت والقيم الافتراضية
// ============================================

const DEFAULT_VALUES = {
  MERCHANT: {
    address: "عنوان غير محدد",
    emailVerified: false,
    subBusinessTypes: [],
    country: "اليمن",
    zipCode: "",
  },

  STORE_CONFIG: {
    template: "modern",
    customization: {
      colors: {
        primary: "#3B82F6",
        secondary: "#10B981",
        background: "#FFFFFF",
        text: "#1F2937",
      },
      subdomain: "",
      entityType: "individual",
    },
  },

  SETTINGS: {
    currency: "YER",
    language: "ar",
    timezone: "Asia/Aden",
    shipping: {
      enabled: true,
      freeShippingThreshold: 0,
      shippingCost: 0,
      defaultCost: 0,
      zones: [],
    },
    payment: {
      cashOnDelivery: true,
      bankTransfer: true,
      creditCard: false,
      paypal: false,
      stripe: false,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
    },
    taxes: {
      enabled: false,
      includeInPrice: false,
      rate: 0,
    },
  },
};

// ============================================
// 🛠️ دوال المساعدة
// ============================================

function getSafeValue(obj: any, path: string, defaultValue: any = ""): any {
  if (!obj) return defaultValue;

  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== "object") {
      return defaultValue;
    }
    result = result[key];
    if (result === undefined) {
      return defaultValue;
    }
  }

  return result ?? defaultValue;
}

function detectDataSource(data: any): "legacy" | "new" | "migrated" {
  if (data.metadata?.source === "migrated") return "migrated";

  const hasLegacyFields =
    data.merchantData?.businessName && !data.merchantData?.address;
  const hasNewFields =
    data.merchantData?.address &&
    data.merchantData?.emailVerified !== undefined;

  if (hasLegacyFields && !hasNewFields) return "legacy";
  if (hasNewFields && !hasLegacyFields) return "new";
  return "legacy";
}

export function generateSubdomain(storeName: string): string {
  if (!storeName || storeName.trim() === "") {
    return `store-${Date.now().toString().slice(-8)}`;
  }

  let cleanName = storeName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (cleanName.length > 30) {
    cleanName = cleanName.substring(0, 30);
  }

  const timestamp = Date.now().toString().slice(-6);
  return `${cleanName}-${timestamp}`;
}

function createSmartAddress(merchantData: MerchantData): string {
  const { address, city, country } = merchantData;

  if (address && address !== DEFAULT_VALUES.MERCHANT.address) {
    return address;
  }

  const parts = [];
  if (city) parts.push(city);
  if (country && country !== DEFAULT_VALUES.MERCHANT.country) {
    parts.push(country);
  }

  return parts.length > 0 ? parts.join(", ") : DEFAULT_VALUES.MERCHANT.address;
}

// ============================================
// 🚀 الدوال الرئيسية
// ============================================

/**
 * تطبيع بيانات الطلب
 */
export function normalizeApplication(
  id: string,
  firestoreData: any,
): UnifiedStoreApplication {
  const data = firestoreData || {};
  const source = detectDataSource(data);

  const merchantData: MerchantData = {
    firstName: getSafeValue(data, "merchantData.firstName", ""),
    lastName: getSafeValue(data, "merchantData.lastName", ""),
    email: getSafeValue(data, "merchantData.email", ""),
    phone: getSafeValue(data, "merchantData.phone", ""),
    city: getSafeValue(data, "merchantData.city", ""),
    businessName: getSafeValue(
      data,
      "merchantData.businessName",
      getSafeValue(
        data,
        "storeConfig.storeName",
        getSafeValue(data, "storeConfig.customization.storeName", ""),
      ),
    ),
    businessType: getSafeValue(data, "merchantData.businessType", ""),

    address: getSafeValue(
      data,
      "merchantData.address",
      `${getSafeValue(data, "merchantData.city", "")}, ${DEFAULT_VALUES.MERCHANT.country}`,
    ),

    emailVerified: getSafeValue(
      data,
      "merchantData.emailVerified",
      getSafeValue(
        data,
        "emailVerified",
        DEFAULT_VALUES.MERCHANT.emailVerified,
      ),
    ),

    subBusinessTypes: getSafeValue(
      data,
      "merchantData.subBusinessTypes",
      DEFAULT_VALUES.MERCHANT.subBusinessTypes,
    ),

    country: getSafeValue(
      data,
      "merchantData.country",
      DEFAULT_VALUES.MERCHANT.country,
    ),
    zipCode: getSafeValue(
      data,
      "merchantData.zipCode",
      DEFAULT_VALUES.MERCHANT.zipCode,
    ),
  };

  const storeConfig: StoreConfig = {
    storeName: getSafeValue(
      data,
      "storeConfig.storeName",
      getSafeValue(
        data,
        "storeConfig.customization.storeName",
        merchantData.businessName,
      ),
    ),

    storeDescription: getSafeValue(
      data,
      "storeConfig.storeDescription",
      getSafeValue(data, "storeConfig.customization.storeDescription", ""),
    ),

    template: getSafeValue(
      data,
      "storeConfig.template",
      DEFAULT_VALUES.STORE_CONFIG.template,
    ),

    customization: {
      storeName: getSafeValue(
        data,
        "storeConfig.customization.storeName",
        merchantData.businessName,
      ),
      storeDescription: getSafeValue(
        data,
        "storeConfig.customization.storeDescription",
        "",
      ),
      colors: {
        primary: getSafeValue(
          data,
          "storeConfig.customization.colors.primary",
          DEFAULT_VALUES.STORE_CONFIG.customization.colors.primary,
        ),
        secondary: getSafeValue(
          data,
          "storeConfig.customization.colors.secondary",
          DEFAULT_VALUES.STORE_CONFIG.customization.colors.secondary,
        ),
        background: getSafeValue(
          data,
          "storeConfig.customization.colors.background",
          DEFAULT_VALUES.STORE_CONFIG.customization.colors.background,
        ),
        text: getSafeValue(
          data,
          "storeConfig.customization.colors.text",
          DEFAULT_VALUES.STORE_CONFIG.customization.colors.text,
        ),
      },
      subdomain: getSafeValue(
        data,
        "storeConfig.customization.subdomain",
        generateSubdomain(merchantData.businessName),
      ),
      customDomain: getSafeValue(
        data,
        "storeConfig.customization.customDomain",
        "",
      ),
      entityType: getSafeValue(
        data,
        "storeConfig.customization.entityType",
        DEFAULT_VALUES.STORE_CONFIG.customization.entityType,
      ),
      logo: getSafeValue(data, "storeConfig.customization.logo", ""),
    },
  };

  const application: UnifiedStoreApplication = {
    id,
    merchantId: data.merchantId || data.ownerId || "",
    ownerId: data.ownerId || data.merchantId || "",

    merchantData,
    storeConfig,
    settings: data.settings,

    status: getSafeValue(data, "status", "pending"),
    submittedAt: data.submittedAt || new Date().toISOString(),
    reviewedAt: data.reviewedAt,
    reviewedBy: data.reviewedBy,
    notes: data.notes,
    rejectionReason: data.rejectionReason,

    convertedStoreId: data.convertedStoreId,
    convertedAt: data.convertedAt,

    verification: data.verification || {
      status: "not_started",
    },

    metadata: {
      version: 2,
      source,
      migratedAt: data.migratedAt,
      lastUpdated: new Date().toISOString(),
    },
  };

  return application;
}

/**
 * إنشاء تخصيص متوافق مع enhanced-templates.ts
 */
function createCompatibleCustomization(
  application: UnifiedStoreApplication,
): StoreCustomization {
  const defaultColors = DEFAULT_VALUES.STORE_CONFIG.customization.colors;

  return {
    branding: {
      logo: application.storeConfig.customization?.logo || "",
      favicon: "",
      brandName:
        application.storeConfig.storeName ||
        application.merchantData.businessName,
      brandDescription: {
        ar: application.storeConfig.storeDescription || "",
        en: application.storeConfig.storeDescription || "",
      },
      brandColors: {
        primary:
          application.storeConfig.customization?.colors?.primary ||
          defaultColors.primary,
        secondary:
          application.storeConfig.customization?.colors?.secondary ||
          defaultColors.secondary,
        accent: "#F3F4F6",
        background:
          application.storeConfig.customization?.colors?.background ||
          defaultColors.background,
        text:
          application.storeConfig.customization?.colors?.text ||
          defaultColors.text,
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      showPoweredBy: true,
      watermark: "",
    },

    colors: {
      primary:
        application.storeConfig.customization?.colors?.primary ||
        defaultColors.primary,
      secondary:
        application.storeConfig.customization?.colors?.secondary ||
        defaultColors.secondary,
      background:
        application.storeConfig.customization?.colors?.background ||
        defaultColors.background,
      text:
        application.storeConfig.customization?.colors?.text ||
        defaultColors.text,
      accent: "#F3F4F6",
      headerBackground: "#FFFFFF",
      footerBackground: "#F9FAFB",
      cardBackground: "#FFFFFF",
      borderColor: "#E5E7EB",
    },

    fonts: {
      heading: "Cairo, sans-serif",
      body: "Cairo, sans-serif",
      size: {
        small: "0.875rem",
        medium: "1rem",
        large: "1.125rem",
        xlarge: "1.25rem",
      },
    },

    layout: {
      headerStyle: "modern",
      footerStyle: "detailed",
      productGridColumns: 4,
      containerWidth: "normal",
      borderRadius: "medium",
      spacing: "normal",
    },

    homepage: {
      showHeroSlider: true,
      showFeaturedProducts: true,
      showCategories: true,
      showNewsletter: true,
      showTestimonials: false,
      showStats: true,
      showBrands: false,
      heroImages: [],
      heroTexts: [
        {
          title: `مرحباً بكم في ${application.storeConfig.storeName || application.merchantData.businessName}`,
          subtitle: "أفضل المنتجات بأسعار مميزة",
          buttonText: "تسوق الآن",
        },
      ],
      sectionsOrder: ["hero", "categories", "featured", "stats"],
    },

    pages: {
      enableBlog: false,
      enableReviews: true,
      enableWishlist: true,
      enableCompare: false,
      enableLiveChat: false,
      enableFAQ: true,
      enableAboutUs: true,
      enableContactUs: true,
    },

    effects: {
      animations: true,
      gradients: true,
      shadows: true,
      transitions: true,
    },

    // الحقول المطلوبة الأخرى من StoreCustomization
    typography: {
      primaryFont: "Cairo",
      secondaryFont: "Inter",
      fontSizes: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
      },
    },

    enhancedLayout: {
      containerWidth: "container",
      headerStyle: "fixed",
      footerStyle: "detailed",
      sidebarEnabled: true,
      breadcrumbsEnabled: true,
      megaMenuEnabled: true,
    },

    enhancedHomepage: {
      heroSection: {
        enabled: true,
        style: "slideshow",
        backgroundImage: "",
        backgroundVideo: "",
        overlay: true,
        overlayOpacity: 0.4,
        textAlignment: "center",
        content: {
          title: {
            ar: `مرحباً بكم في ${application.storeConfig.storeName || application.merchantData.businessName}`,
            en: `Welcome to ${application.storeConfig.storeName || application.merchantData.businessName}`,
          },
          subtitle: {
            ar: "اكتشف أفضل المنتجات بأسعار مميزة",
            en: "Discover the best products at amazing prices",
          },
          ctaText: { ar: "تسوق الآن", en: "Shop Now" },
          ctaLink: "/products",
        },
      },
      featuredProducts: {
        enabled: true,
        title: { ar: "المنتجات المميزة", en: "Featured Products" },
        limit: 8,
        layout: "grid",
        columns: 4,
        showPrices: true,
        showRatings: true,
        showQuickView: true,
      },
      categories: {
        enabled: true,
        title: { ar: "التصنيفات", en: "Categories" },
        style: "grid",
        showImages: true,
        showProductCount: true,
        limit: 6,
      },
      banners: {
        enabled: false,
        banners: [],
      },
      testimonials: {
        enabled: false,
        title: { ar: "آراء العملاء", en: "Customer Reviews" },
        testimonials: [],
        layout: "carousel",
      },
      newsletter: {
        enabled: true,
        title: {
          ar: "اشترك في النشرة الإخبارية",
          en: "Subscribe to Newsletter",
        },
        description: {
          ar: "احصل على أحدث العروض والمنتجات",
          en: "Get latest offers and products",
        },
        placeholder: {
          ar: "أدخل بريدك الإلكتروني",
          en: "Enter your email",
        },
        buttonText: { ar: "اشتراك", en: "Subscribe" },
        style: "inline",
      },
      aboutSection: {
        enabled: false,
        title: { ar: "عن متجرنا", en: "About Our Store" },
        content: { ar: "", en: "" },
        image: "",
        features: [],
      },
    },

    productPage: {
      layout: "sidebar",
      imageGallery: {
        style: "thumbnails",
        showZoom: true,
        showFullscreen: true,
        showVideo: true,
      },
      productInfo: {
        showSKU: true,
        showAvailability: true,
        showShipping: true,
        showWishlist: true,
        showCompare: true,
        showShare: true,
        showReviews: true,
        showRelatedProducts: true,
        showRecommendations: true,
      },
      reviews: {
        enabled: true,
        requirePurchase: false,
        moderationEnabled: true,
        allowPhotos: true,
        showVerifiedBadge: true,
      },
    },

    categoryPage: {
      layout: "sidebar",
      productsPerPage: 20,
      gridColumns: 4,
      listView: true,
      sortOptions: ["newest", "price-low", "price-high", "rating", "popular"],
      filters: {
        priceRange: true,
        brand: true,
        color: true,
        size: true,
        rating: true,
        availability: true,
        customAttributes: true,
      },
      pagination: "numbers",
    },

    cart: {
      style: "sidebar",
      showThumbnails: true,
      showContinueShopping: true,
      showShippingCalculator: true,
      showCouponCode: true,
      showEstimatedTotal: true,
      saveForLater: true,
      quickCheckout: true,
    },

    checkout: {
      layout: "multi-step",
      guestCheckout: true,
      accountCreation: "optional",
      addressValidation: true,
      showOrderSummary: true,
      showTrustBadges: true,
      showSecurityInfo: true,
      paymentMethods: {
        cashOnDelivery: true,
        bankTransfer: true,
        creditCard: false,
        digitalWallet: false,
        installments: false,
      },
    },

    orderTracking: {
      enabled: true,
      showMap: true,
      showEstimatedDelivery: true,
      emailNotifications: true,
      smsNotifications: true,
      statusSteps: [
        {
          key: "pending",
          title: { ar: "قيد المراجعة", en: "Under Review" },
          description: {
            ar: "تم استلام طلبك وهو قيد المراجعة",
            en: "Your order has been received and is under review",
          },
        },
        {
          key: "confirmed",
          title: { ar: "تم التأكيد", en: "Confirmed" },
          description: {
            ar: "تم تأكيد طلبك وجاري التجهيز",
            en: "Your order has been confirmed and is being prepared",
          },
        },
        {
          key: "shipped",
          title: { ar: "تم الشحن", en: "Shipped" },
          description: {
            ar: "تم شحن طلبك وهو في الطريق إليك",
            en: "Your order has been shipped and is on the way",
          },
        },
        {
          key: "delivered",
          title: { ar: "تم التوصيل", en: "Delivered" },
          description: {
            ar: "تم توصيل طلبك بنجاح",
            en: "Your order has been delivered successfully",
          },
        },
      ],
    },

    staticPages: {
      aboutUs: {
        enabled: true,
        content: { ar: "", en: "" },
      },
      privacyPolicy: {
        enabled: true,
        content: { ar: "", en: "" },
      },
      termsOfService: {
        enabled: true,
        content: { ar: "", en: "" },
      },
      returnPolicy: {
        enabled: true,
        content: { ar: "", en: "" },
      },
      shippingInfo: {
        enabled: true,
        content: { ar: "", en: "" },
      },
      faq: {
        enabled: true,
        faqs: [],
      },
      contactUs: {
        enabled: true,
        showMap: true,
        showContactForm: true,
        content: { ar: "", en: "" },
      },
    },

    seo: {
      metaTitle: {
        ar:
          application.storeConfig.storeName ||
          application.merchantData.businessName,
        en:
          application.storeConfig.storeName ||
          application.merchantData.businessName,
      },
      metaDescription: {
        ar: application.storeConfig.storeDescription || "",
        en: application.storeConfig.storeDescription || "",
      },
      keywords: {
        ar: ["متجر", "تسوق", "منتجات"],
        en: ["store", "shop", "products"],
      },
      ogImage: "",
      structuredData: true,
      sitemap: true,
      robotsTxt: "User-agent: *\nAllow: /",
      analytics: {
        googleAnalytics: "",
        facebookPixel: "",
        customCode: "",
      },
    },

    social: {
      enabled: true,
      platforms: {
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: "",
        tiktok: "",
        snapchat: "",
        whatsapp: "",
      },
      showInHeader: true,
      showInFooter: true,
      socialLogin: true,
      socialSharing: true,
    },

    advanced: {
      multiLanguage: true,
      multiCurrency: false,
      darkMode: true,
      rtlSupport: true,
      pwa: true,
      lazyLoading: true,
      imageOptimization: true,
      caching: true,
      cdnEnabled: false,
      customCSS: "",
      customJS: "",
    },
  };
}

/**
 * تحويل طلب متجر إلى متجر فعلي (متوافق تماماً مع firestore.ts)
 */
export function convertApplicationToStore(
  application: UnifiedStoreApplication,
): Omit<Store, "id" | "createdAt" | "updatedAt"> {
  const smartAddress = createSmartAddress(application.merchantData);

  let subdomain = application.storeConfig.customization?.subdomain;
  if (!subdomain || subdomain.trim() === "") {
    subdomain = generateSubdomain(
      application.storeConfig.storeName ||
        application.merchantData.businessName,
    );
  }

  const shippingSettings =
    application.settings?.shipping || DEFAULT_VALUES.SETTINGS.shipping;
  const paymentSettings =
    application.settings?.payment || DEFAULT_VALUES.SETTINGS.payment;

  const storeData: Omit<Store, "id" | "createdAt" | "updatedAt"> = {
    ownerId: application.ownerId || application.merchantId,

    name:
      application.storeConfig.storeName ||
      application.merchantData.businessName ||
      "متجر جديد",

    description:
      application.storeConfig.storeDescription ||
      `متجر ${application.merchantData.businessName || "إلكتروني"}`,

    logo: application.storeConfig.customization?.logo || "",
    subdomain,
    customDomain: application.storeConfig.customization?.customDomain,
    template: application.storeConfig.template || "modern",
    industry: application.merchantData.businessType,

    customization: createCompatibleCustomization(application) as any,

    settings: {
      currency:
        application.settings?.currency || DEFAULT_VALUES.SETTINGS.currency,
      language:
        application.settings?.language || DEFAULT_VALUES.SETTINGS.language,
      timezone:
        application.settings?.timezone || DEFAULT_VALUES.SETTINGS.timezone,

      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
      },

      shipping: {
        enabled: shippingSettings.enabled,
        freeShippingThreshold: shippingSettings.freeShippingThreshold,
        shippingCost: shippingSettings.shippingCost,
        defaultCost: shippingSettings.defaultCost,
        zones: shippingSettings.zones || [],
      },

      payment: {
        cashOnDelivery: paymentSettings.cashOnDelivery,
        bankTransfer: paymentSettings.bankTransfer,
        creditCard: paymentSettings.creditCard,
        paypal: paymentSettings.paypal || false,
        stripe: paymentSettings.stripe || false,
      },

      taxes: {
        enabled: false,
        includeInPrice: false,
        rate: 0,
      },
    },

    // ✅ الآن متوافق مع Store.contact الذي يحتوي على country و zipCode
    contact: {
      phone: application.merchantData.phone,
      email: application.merchantData.email,
      address: smartAddress,
      city: application.merchantData.city,
      country: application.merchantData.country || "اليمن", // ✅ متوافق
      zipCode: application.merchantData.zipCode || "", // ✅ متوافق
    },

    socialMedia: {},
    status: "pending",
  };

  return storeData;
}

/**
 * دالة مساعدة للاستخدام السريع
 */
export async function processStoreApplication(
  applicationId: string,
  firestoreData: any,
): Promise<{ success: boolean; storeId?: string }> {
  try {
    const normalizedApp = normalizeApplication(applicationId, firestoreData);
    const storeData = convertApplicationToStore(normalizedApp);
    const storeId = await storeService.create(storeData);

    return {
      success: true,
      storeId,
    };
  } catch (error) {
    console.error("❌ خطأ في معالجة طلب المتجر:", error);
    return {
      success: false,
    };
  }
}

// ============================================
// 📦 التصدير
// ============================================

export default {
  normalizeApplication,
  convertApplicationToStore,
  processStoreApplication,
  generateSubdomain,
  DEFAULT_VALUES,
};
