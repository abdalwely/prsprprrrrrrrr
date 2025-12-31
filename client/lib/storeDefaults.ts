// store/client/lib/storeDefaults.ts

import { StoreCustomization } from "./types/store";

export const defaultStoreCustomization: StoreCustomization = {
  // الخصائص الأساسية
  colors: {
    primary: "#3B82F6",
    secondary: "#10B981",
    background: "#FFFFFF",
    text: "#1F2937",
    accent: "#F3F4F6",
    headerBackground: "#FFFFFF",
    footerBackground: "#F9FAFB",
    cardBackground: "#FFFFFF",
    borderColor: "#E5E7EB",
  },

  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
    size: {
      small: "0.875rem",
      medium: "1rem",
      large: "1.125rem",
      xlarge: "1.25rem",
    },
  },

  layout: {
    headerStyle: "fixed",
    footerStyle: "detailed",
    productGridColumns: 4,
    containerWidth: "1200px",
    borderRadius: "medium",
    spacing: "normal",
  },

  homepage: {
    showHeroSlider: true,
    showFeaturedProducts: true,
    showCategories: true,
    showNewsletter: true,
    showTestimonials: true, // ⭐ إضافة
    showStats: false, // ⭐ إضافة
    showBrands: true, // ⭐ إضافة
    heroImages: [],
    heroTexts: [],
    sectionsOrder: [], // ⭐ إضافة اختيارية
  },
  pages: {
    enableBlog: false,
    enableReviews: true,
    enableWishlist: true,
    enableCompare: false,
    enableLiveChat: true, // ⭐ إضافة
    enableFAQ: true, // ⭐ إضافة
    enableAboutUs: true, // ⭐ إضافة
    enableContactUs: true, // ⭐ إضافة
  },

  effects: {
    animations: true,
    gradients: true,
    shadows: true,
    transitions: true,
  },

  // Branding
  branding: {
    logo: "",
    favicon: "",
    brandName: "",
    brandDescription: { ar: "", en: "" },
    brandColors: {
      primary: "#3B82F6",
      secondary: "#10B981",
      accent: "#F3F4F6",
      background: "#FFFFFF",
      text: "#1F2937",
      textSecondary: "#6B7280",
      border: "#E5E7EB",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
    },
    showPoweredBy: true,
    watermark: "",
  },

  // Typography
  typography: {
    primaryFont: "Inter",
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

  // Enhanced Layout
  enhancedLayout: {
    containerWidth: "container",
    headerStyle: "fixed",
    footerStyle: "detailed",
    sidebarEnabled: true,
    breadcrumbsEnabled: true,
    megaMenuEnabled: true,
  },

  // Enhanced Homepage
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
        title: { ar: "مرحباً بك في متجرنا", en: "Welcome to Our Store" },
        subtitle: {
          ar: "اكتشف أفضل المنتجات",
          en: "Discover the best products",
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
      enabled: true,
      title: { ar: "آراء العملاء", en: "Customer Reviews" },
      testimonials: [],
      layout: "carousel",
    },

    newsletter: {
      enabled: true,
      title: { ar: "اشترك في النشرة", en: "Subscribe to Newsletter" },
      description: { ar: "احصل على أحدث العروض", en: "Get latest offers" },
      placeholder: { ar: "أدخل بريدك الإلكتروني", en: "Enter your email" },
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

  // Product Page
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

  // Category Page
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

  // Cart
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

  // Checkout
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
      creditCard: true,
      digitalWallet: true,
      installments: false,
    },
  },

  // Order Tracking
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
          ar: "تم استلام طلبك",
          en: "Your order has been received",
        },
      },
      {
        key: "confirmed",
        title: { ar: "تم التأكيد", en: "Confirmed" },
        description: {
          ar: "تم تأكيد طلبك",
          en: "Your order has been confirmed",
        },
      },
      {
        key: "shipped",
        title: { ar: "تم الشحن", en: "Shipped" },
        description: { ar: "تم شحن طلبك", en: "Your order has been shipped" },
      },
      {
        key: "delivered",
        title: { ar: "تم التوصيل", en: "Delivered" },
        description: {
          ar: "تم توصيل طلبك",
          en: "Your order has been delivered",
        },
      },
    ],
  },

  // Static Pages
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

  // SEO
  seo: {
    metaTitle: { ar: "", en: "" },
    metaDescription: { ar: "", en: "" },
    keywords: { ar: [], en: [] },
    ogImage: "",
    structuredData: true,
    sitemap: true,
    robotsTxt: "",
    analytics: {
      googleAnalytics: "",
      facebookPixel: "",
      customCode: "",
    },
  },

  // Social Media
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

  // Advanced Features
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

// دالة مساعدة لإنشاء كائن customization متوافق
export const createStoreCustomization = (
  partialCustomization: Partial<StoreCustomization> = {},
): StoreCustomization => {
  return {
    ...defaultStoreCustomization,
    ...partialCustomization,
  };
};

// دالة للتحقق من أن الكائن متوافق مع StoreCustomization
export const validateStoreCustomization = (
  customization: any,
): customization is StoreCustomization => {
  return (
    customization &&
    typeof customization === "object" &&
    "branding" in customization &&
    "colors" in customization &&
    "fonts" in customization &&
    "layout" in customization &&
    "homepage" in customization &&
    "pages" in customization &&
    "effects" in customization &&
    "typography" in customization &&
    "enhancedLayout" in customization &&
    "enhancedHomepage" in customization &&
    "productPage" in customization &&
    "categoryPage" in customization &&
    "cart" in customization &&
    "checkout" in customization &&
    "orderTracking" in customization &&
    "staticPages" in customization &&
    "seo" in customization &&
    "social" in customization &&
    "advanced" in customization
  );
};
