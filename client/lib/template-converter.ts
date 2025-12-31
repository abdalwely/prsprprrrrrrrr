// store/client/lib/template-converter.ts

import { StoreTemplate } from "./templates";
import {
  EnhancedStoreTemplate,
  StoreCustomization,
} from "./enhanced-templates";
import {
  defaultStoreCustomization,
  createStoreCustomization,
} from "./storeDefaults";

// تحويل من StoreTemplate البسيط إلى EnhancedStoreTemplate الشامل
export function convertTemplateToStoreConfig(
  template: any,
  customizationOverrides?: any,
): any {
  // ⭐ استخدم any
  const customization: any = {
    ...template.customization,
    ...customizationOverrides,
  };
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    industry: "general",
    preview: {
      desktop: template.preview,
      tablet: template.preview,
      mobile: template.preview,
    },
    thumbnail: template.thumbnail,
    features: template.features,
    difficulty: "beginner",
    customization: createStoreCustomization({
      // استخدام الألوان من القالب البسيط
      colors: {
        primary: template.customization.colors.primary,
        secondary: template.customization.colors.secondary,
        background: template.customization.colors.background,
        text: template.customization.colors.text,
        accent: template.customization.colors.accent,
        headerBackground: template.customization.colors.background,
        footerBackground: "#F9FAFB",
        cardBackground: "#FFFFFF",
        borderColor: "#E5E7EB",
      },
      // استخدام الخطوط من القالب البسيط
      fonts: {
        heading: template.customization.fonts.primary,
        body: template.customization.fonts.primary,
        size: {
          small: "0.875rem",
          medium: "1rem",
          large: "1.125rem",
          xlarge: "1.25rem",
        },
      },
      // استخدام التخطيط من القالب البسيط
      layout: {
        headerStyle: "fixed",
        footerStyle: "detailed",
        productGridColumns:
          template.customization.components.productGrid.columns,
        containerWidth: "1200px",
        borderRadius: "medium",
        spacing:
          template.customization.components.productGrid.spacing === "tight"
            ? "compact"
            : template.customization.components.productGrid.spacing === "loose"
              ? "spacious"
              : "normal",
      },
      // استخدام إعدادات الصفحة الرئيسية من القالب البسيط
      homepage: {
        showHeroSlider: template.customization.layout.heroSection,
        showFeaturedProducts: template.customization.layout.featuredProducts,
        showCategories: template.customization.layout.showCategories,
        showNewsletter: template.customization.layout.newsletter,
        heroImages: [],
        heroTexts: [],
        showTestimonials: false,
        showStats: false,
        showBrands: false,
      },
      pages: {
        enableBlog: false,
        enableReviews: true,
        enableWishlist: template.customization.layout.showWishlist,
        enableCompare: false,
        enableLiveChat: false,
        enableFAQ: false,
        enableAboutUs: false,
        enableContactUs: false,
      },
      // إعدادات المنتج
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
          showWishlist: template.customization.layout.showWishlist,
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
      // إعدادات الصفحة الرئيسية المحسنة
      enhancedHomepage: {
        heroSection: {
          enabled: template.customization.layout.heroSection,
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
          enabled: template.customization.layout.featuredProducts,
          title: { ar: "المنتجات المميزة", en: "Featured Products" },
          limit: 8,
          layout: "grid",
          columns: template.customization.components.productGrid.columns,
          showPrices: true,
          showRatings: true,
          showQuickView:
            template.customization.components.productGrid.showQuickView,
        },
        categories: {
          enabled: template.customization.layout.showCategories,
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
          enabled: template.customization.layout.testimonials,
          title: { ar: "آراء العملاء", en: "Customer Reviews" },
          testimonials: [],
          layout: "carousel",
        },
        newsletter: {
          enabled: template.customization.layout.newsletter,
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
      // إعدادات العربة
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
    }),
    demoUrl: `/demo/${template.id}`,
    isPremium: false,
    price: 0,
  };
}

// في template-converter.ts - أضف في نهاية الملف قبل التصدير

/**
 * تحويل القالب إلى تنسيق Enhanced
 */
export function convertToEnhancedTemplate(template: any): any {
  if (!template) {
    return null;
  }

  // إذا كان القالب يحتوي بالفعل على customization كامل
  if (template.customization && template.customization.enhancedLayout) {
    return template;
  }

  // إنشاء customization كامل إذا كان غير موجود
  const enhancedCustomization = {
    // الخصائص الأساسية
    colors: template.customization?.colors || {
      primary: "#FF6B35",
      secondary: "#4A90E2",
      background: "#FFFFFF",
      text: "#333333",
      accent: "#F8F9FA",
      headerBackground: "#FFFFFF",
      footerBackground: "#F8F9FA",
      cardBackground: "#FFFFFF",
      borderColor: "#E5E5E5",
    },
    fonts: template.customization?.fonts || {
      heading: "Cairo",
      body: "Inter",
      size: {
        small: "0.875rem",
        medium: "1rem",
        large: "1.125rem",
        xlarge: "1.25rem",
      },
    },
    layout: template.customization?.layout || {
      headerStyle: "fixed",
      footerStyle: "simple",
      productGridColumns: 4,
      containerWidth: "1200px",
      borderRadius: "medium",
      spacing: "normal",
    },
    homepage: template.customization?.homepage || {
      showHeroSlider: true,
      showFeaturedProducts: true,
      showCategories: true,
      showNewsletter: true,
      showTestimonials: false,
      showStats: false,
      showBrands: false,
      heroImages: [],
      heroTexts: [],
    },
    pages: template.customization?.pages || {
      enableBlog: false,
      enableReviews: true,
      enableWishlist: true,
      enableCompare: false,
      enableLiveChat: false,
      enableFAQ: false,
      enableAboutUs: false,
      enableContactUs: true,
    },
    effects: template.customization?.effects || {
      animations: true,
      gradients: false,
      shadows: true,
      transitions: true,
    },
    branding: template.customization?.branding || {
      logo: template.customization?.logo || "",
      favicon: "",
      brandName: template.name?.ar || template.name?.en || "",
      brandDescription: {
        ar: template.description?.ar || "",
        en: template.description?.en || "",
      },
      brandColors: {
        primary: "#FF6B35",
        secondary: "#4A90E2",
        accent: "#F8F9FA",
        background: "#FFFFFF",
        text: "#333333",
        textSecondary: "#666666",
        border: "#E5E5E5",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      showPoweredBy: true,
      watermark: "",
    },

    // الخصائص الموسعة
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
          title: { ar: "مرحباً بك في متجرنا", en: "Welcome to Our Store" },
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
        title: { ar: "", en: "" },
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
        placeholder: { ar: "أدخل بريدك الإلكتروني", en: "Enter your email" },
        buttonText: { ar: "اشتراك", en: "Subscribe" },
        style: "inline",
      },
      aboutSection: {
        enabled: false,
        title: { ar: "", en: "" },
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
        creditCard: true,
        digitalWallet: true,
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
      aboutUs: { enabled: true, content: { ar: "", en: "" } },
      privacyPolicy: { enabled: true, content: { ar: "", en: "" } },
      termsOfService: { enabled: true, content: { ar: "", en: "" } },
      returnPolicy: { enabled: true, content: { ar: "", en: "" } },
      shippingInfo: { enabled: true, content: { ar: "", en: "" } },
      faq: { enabled: true, faqs: [] },
      contactUs: {
        enabled: true,
        showMap: true,
        showContactForm: true,
        content: { ar: "", en: "" },
      },
    },
    seo: {
      metaTitle: { ar: template.name?.ar || "", en: template.name?.en || "" },
      metaDescription: {
        ar: template.description?.ar || "",
        en: template.description?.en || "",
      },
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

  return {
    ...template,
    customization: enhancedCustomization,
  };
}

// تحويل مباشر من StoreTemplate إلى StoreCustomization
export const convertTemplateToCustomization = (
  template: StoreTemplate,
): StoreCustomization => {
  const enhancedTemplate = convertToEnhancedTemplate(template);
  return enhancedTemplate.customization;
};
