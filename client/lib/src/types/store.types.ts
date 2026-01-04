import { Timestamp } from "firebase/firestore";
import {
  SocialMedia,
  ShippingZone,
  ShippingMethod,
  ShippingAddress,
} from "./shared.types";

// ============================================
// 📦 أنواع البيانات الموحدة للمتاجر
// ============================================

// بيانات التاجر الموحدة
export interface MerchantData {
  // الحقول الأساسية
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  businessName: string;
  businessType: string;

  // الحقول الجديدة
  address: string;
  emailVerified: boolean;
  subBusinessTypes: string[];

  // حقول إضافية
  country?: string;
  zipCode?: string;
  userId?: string;
}

// إعدادات المتجر الموحدة
export interface StoreConfig {
  storeName: string;
  templateId: string;

  customization: {
    storeDescription?: string;
    logo?: string;
    entityType?: string;
    colors: {
      primary?: string;
      secondary?: string;
      background?: string;
      text?: string;
    };
    subdomain?: string;
    customDomain?: string;
    industry?: string;
  };
}

// الإعدادات التشغيلية الموحدة
export interface StoreSettings {
  currency: string;
  language: string;
  timezone?: string;

  shipping: {
    enabled: boolean;
    freeShippingThreshold: number;
    shippingCost: number;
    defaultCost?: number;
    zones?: any[];
  };

  payment: {
    cashOnDelivery: boolean;
    bankTransfer: boolean;
    creditCard: boolean;
    paypal?: boolean;
    stripe?: boolean;
  };

  notifications?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };

  taxes?: {
    enabled: boolean;
    includeInPrice: boolean;
    rate: number;
  };
}

// طلب إنشاء متجر موحد
export interface StoreApplication {
  id: string;
  merchantId: string;
  merchantData: MerchantData;
  storeConfig: StoreConfig;
  settings?: StoreSettings;
  status: "pending" | "approved" | "rejected" | "in_review";
  submittedAt: Timestamp | string;
  reviewedAt?: Timestamp | string;
  reviewedBy?: string;
  notes?: string;
  reviewNotes?: string; // ✅ أضف هذه
  rejectionReason?: string;
  convertedStoreId?: string;
  convertedAt?: Timestamp | string;
  verification?: {
    status: "not_started" | "pending" | "verified" | "rejected";
    documents?: any;
  };

  // ✅ أضف الخصائص الجديدة التي يحتاجها AdminStoreApprovals.tsx
  selectedTemplate?: {
    id: string;
    name: { ar: string; en: string };
    description: { ar: string; en: string };
    thumbnail: string;
    category: string;
    industry: string;
    isPremium: boolean;
  };
}

// ====== الأنواع الأساسية ======
export interface BasicColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  headerBackground: string;
  footerBackground: string;
  cardBackground: string;
  borderColor: string;
}

export interface BasicFontSizes {
  small: string;
  medium: string;
  large: string;
  xlarge: string;
}

export interface BasicFonts {
  heading: string;
  body: string;
  size: BasicFontSizes;
}
export interface HeroText {
  title: string;
  subtitle: string;
  buttonText: string;
}
export type BorderRadius = "small" | "medium" | "large" | "full" | "none";

export interface BasicLayout {
  headerStyle: string;
  footerStyle: string;
  productGridColumns: number;
  containerWidth: string;
  borderRadius: BorderRadius;
  spacing: string;
}

export interface BasicHomepage {
  showHeroSlider: boolean;
  showFeaturedProducts: boolean;
  showCategories: boolean;
  showNewsletter: boolean;
  showTestimonials: boolean;
  showStats: boolean;
  showBrands: boolean;
  heroImages: string[];
  heroTexts: HeroText[];
  sectionsOrder?: string[];
}

export interface BasicPages {
  enableBlog: boolean;
  enableReviews: boolean;
  enableWishlist: boolean;
  enableCompare: boolean;
  enableLiveChat: boolean;
  enableFAQ: boolean;
  enableAboutUs: boolean;
  enableContactUs: boolean;
}

export interface BasicEffects {
  animations: boolean;
  gradients: boolean;
  shadows: boolean;
  transitions: boolean;
}

export interface BasicBranding {
  logo: string;
  favicon: string;
}

export interface BusinessActivities {
  mainActivity: string;
  subActivities: string[];
  registrationNumber: string;
  taxNumber?: string;
  issueDate: Date;
  expiryDate?: Date;
  // يمكن إضافة المزيد من الخصائص المشتركة
  businessType?: string; // للنوع العام (retail, wholesale, etc.)
  industry?: string; // للصناعة (fashion, electronics, etc.)
  legalStructure?: string; // للهيكل القانوني (LLC, Sole Proprietorship, etc.)
}
// ====== تعريف التخصيص الأساسي ======
export interface StoreCustomizationBasic {
  colors: BasicColors;
  fonts: BasicFonts;
  layout: BasicLayout;
  homepage: BasicHomepage;
  pages: BasicPages;
  effects: BasicEffects;
  branding: BasicBranding;
}
// ====== الأنواع الموسعة ======
export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}
export interface EnhancedBranding {
  logo: string;
  favicon: string;
  brandName: string;
  brandDescription: { ar: string; en: string };
  brandColors: BrandColors;
  showPoweredBy: boolean;
  watermark: string;
}

export interface FontSizes {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  "4xl": string;
}

export interface EnhancedTypography {
  primaryFont: string;
  secondaryFont: string;
  fontSizes: FontSizes;
}

export interface EnhancedLayout {
  containerWidth: "container" | "full" | "wide";
  headerStyle: "fixed" | "static" | "transparent" | "minimal";
  footerStyle: "simple" | "detailed" | "minimal" | "corporate";
  sidebarEnabled: boolean;
  breadcrumbsEnabled: boolean;
  megaMenuEnabled: boolean;
}

export interface HeroSection {
  enabled: boolean;
  style: "banner" | "video" | "slideshow" | "split" | "minimal";
  backgroundImage: string;
  backgroundVideo: string;
  overlay: boolean;
  overlayOpacity: number;
  textAlignment: "left" | "center" | "right";
  content: {
    title: { ar: string; en: string };
    subtitle: { ar: string; en: string };
    ctaText: { ar: string; en: string };
    ctaLink: string;
  };
}

export interface FeaturedProducts {
  enabled: boolean;
  title: { ar: string; en: string };
  limit: number;
  layout: "grid" | "carousel" | "masonry";
  columns: number;
  showPrices: boolean;
  showRatings: boolean;
  showQuickView: boolean;
}

export interface CategoriesSection {
  enabled: boolean;
  title: { ar: string; en: string };
  style: "grid" | "carousel" | "list" | "tiles";
  showImages: boolean;
  showProductCount: boolean;
  limit: number;
}

export interface Banner {
  id: string;
  image: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  link: string;
  position: "top" | "middle" | "bottom";
}

export interface BannersSection {
  enabled: boolean;
  banners: Banner[];
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: { ar: string; en: string };
  avatar: string;
  location: string;
}

export interface TestimonialsSection {
  enabled: boolean;
  title: { ar: string; en: string };
  testimonials: Testimonial[];
  layout: "carousel" | "grid";
}

export interface NewsletterSection {
  enabled: boolean;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  placeholder: { ar: string; en: string };
  buttonText: { ar: string; en: string };
  style: "simple" | "popup" | "inline" | "footer";
}

export interface Feature {
  icon: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
}

export interface AboutSection {
  enabled: boolean;
  title: { ar: string; en: string };
  content: { ar: string; en: string };
  image: string;
  features: Feature[];
}

export interface EnhancedHomepage {
  heroSection: HeroSection;
  featuredProducts: FeaturedProducts;
  categories: CategoriesSection;
  banners: BannersSection;
  testimonials: TestimonialsSection;
  newsletter: NewsletterSection;
  aboutSection: AboutSection;
}

export interface ImageGallery {
  style: "thumbnails" | "dots" | "stack" | "zoom";
  showZoom: boolean;
  showFullscreen: boolean;
  showVideo: boolean;
}

export interface ProductInfo {
  showSKU: boolean;
  showAvailability: boolean;
  showShipping: boolean;
  showWishlist: boolean;
  showCompare: boolean;
  showShare: boolean;
  showReviews: boolean;
  showRelatedProducts: boolean;
  showRecommendations: boolean;
}

export interface ReviewsSettings {
  enabled: boolean;
  requirePurchase: boolean;
  moderationEnabled: boolean;
  allowPhotos: boolean;
  showVerifiedBadge: boolean;
}

export interface ProductPage {
  layout: "sidebar" | "full-width" | "tabs";
  imageGallery: ImageGallery;
  productInfo: ProductInfo;
  reviews: ReviewsSettings;
}

export interface Filters {
  priceRange: boolean;
  brand: boolean;
  color: boolean;
  size: boolean;
  rating: boolean;
  availability: boolean;
  customAttributes: boolean;
}

export interface CategoryPage {
  layout: "sidebar" | "top-filters" | "no-filters";
  productsPerPage: number;
  gridColumns: number;
  listView: boolean;
  sortOptions: string[];
  filters: Filters;
  pagination: "numbers" | "loadMore" | "infinite";
}

export interface CartSettings {
  style: "sidebar" | "page" | "popup";
  showThumbnails: boolean;
  showContinueShopping: boolean;
  showShippingCalculator: boolean;
  showCouponCode: boolean;
  showEstimatedTotal: boolean;
  saveForLater: boolean;
  quickCheckout: boolean;
}

export interface PaymentMethods {
  cashOnDelivery: boolean;
  bankTransfer: boolean;
  creditCard: boolean;
  digitalWallet: boolean;
  installments: boolean;
}

export interface CheckoutSettings {
  layout: "single-page" | "multi-step" | "accordion";
  guestCheckout: boolean;
  accountCreation: "required" | "optional" | "disabled";
  addressValidation: boolean;
  showOrderSummary: boolean;
  showTrustBadges: boolean;
  showSecurityInfo: boolean;
  paymentMethods: PaymentMethods;
}

export interface StatusStep {
  key: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
}

export interface OrderTracking {
  enabled: boolean;
  showMap: boolean;
  showEstimatedDelivery: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  statusSteps: StatusStep[];
}

export interface StaticPage {
  enabled: boolean;
  content: { ar: string; en: string };
}

export interface FAQ {
  question: { ar: string; en: string };
  answer: { ar: string; en: string };
  category: string;
}

export interface FAQSettings {
  enabled: boolean;
  faqs: FAQ[];
}

export interface ContactUsSettings {
  enabled: boolean;
  showMap: boolean;
  showContactForm: boolean;
  content: { ar: string; en: string };
}

export interface StaticPages {
  aboutUs: StaticPage;
  privacyPolicy: StaticPage;
  termsOfService: StaticPage;
  returnPolicy: StaticPage;
  shippingInfo: StaticPage;
  faq: FAQSettings;
  contactUs: ContactUsSettings;
}

export interface Analytics {
  googleAnalytics: string;
  facebookPixel: string;
  customCode: string;
}

export interface SEOSettings {
  metaTitle: { ar: string; en: string };
  metaDescription: { ar: string; en: string };
  keywords: { ar: string[]; en: string[] };
  ogImage: string;
  structuredData: boolean;
  sitemap: boolean;
  robotsTxt: string;
  analytics: Analytics;
}

export interface SocialPlatforms {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  snapchat: string;
  whatsapp: string;
}

export interface SocialSettings {
  enabled: boolean;
  platforms: SocialPlatforms;
  showInHeader: boolean;
  showInFooter: boolean;
  socialLogin: boolean;
  socialSharing: boolean;
}

export interface AdvancedSettings {
  multiLanguage: boolean;
  multiCurrency: boolean;
  darkMode: boolean;
  rtlSupport: boolean;
  pwa: boolean;
  lazyLoading: boolean;
  imageOptimization: boolean;
  caching: boolean;
  cdnEnabled: boolean;
  customCSS: string;
  customJS: string;
}
// ====== تعريف التخصيص الموسع ======
export interface StoreCustomizationEnhanced {
  // الخصائص الأساسية
  colors: BasicColors;
  fonts: BasicFonts;
  layout: BasicLayout;
  homepage: BasicHomepage;
  pages: BasicPages;
  effects: BasicEffects;
  branding: EnhancedBranding;
  typography: EnhancedTypography;
  enhancedLayout: EnhancedLayout;
  enhancedHomepage: EnhancedHomepage;
  productPage: ProductPage;
  categoryPage: CategoryPage;
  cart: CartSettings;
  checkout: CheckoutSettings;
  orderTracking: OrderTracking;
  staticPages: StaticPages;
  seo: SEOSettings;
  social: SocialSettings;
  advanced: AdvancedSettings;
}
// ====== نوع اتحادي للتخصيص ======
export type StoreCustomization =
  | StoreCustomizationBasic
  | StoreCustomizationEnhanced;

/**
 * واجهة تمثل المتجر التجاري بالكامل
 * تحتوي على جميع بيانات المتجر وإعداداته
 */
export interface Store {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  logo: string;
  subdomain: string;
  customDomain?: string;
  template: string;
  industry?: string;

  businessActivities?: BusinessActivities;

  complianceSettings?: {
    autoDetection: boolean;
    strictMode: boolean;
    notifyOnViolation: boolean;
    allowedDeviations?: string[];
    reviewThreshold?: number;
  };

  currency?: string;
  timezone?: string;
  language?: string;

  taxNumber?: string;
  commercialRegistration?: string;

  customization: StoreCustomizationEnhanced;

  settings: {
    currency: string;
    language: string;
    timezone?: string;

    notifications?: {
      emailNotifications: boolean;
      pushNotifications: boolean;
      smsNotifications: boolean;
    };

    shipping: {
      enabled: boolean;
      freeShippingThreshold: number;
      shippingCost: number;
      defaultCost?: number;
      zones?: ShippingZone[];
      methods?: ShippingMethod[];
    };

    payment: {
      cashOnDelivery: boolean;
      bankTransfer: boolean;
      creditCard: boolean;
      paypal?: boolean;
      stripe?: boolean;
      mada?: boolean;
      mobileWallet?: boolean;
      bankInfo?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
        iban?: string;
        swiftCode?: string;
      };
    };

    taxes?: {
      enabled: boolean;
      includeInPrice: boolean;
      rate: number;
    };
  };

  contact: {
    phone: string;
    email: string;
    address: string;
    city: string;
    governorate?: string;
    country?: string;
    zipCode?: string;
    originalCity?: string;
  };

  socialMedia?: SocialMedia;

  complianceStats?: {
    totalProducts: number;
    compliantProducts: number;
    flaggedProducts: number;
    lastCheck: Date;
    complianceRate: number;
  };

  // 🔥 نظام الامتثال التدريجي
  checklist?: {
    addProduct: boolean;
    addCategories: boolean;
    enableShipping: boolean;
    enablePayment: boolean;
    verification: boolean;
    customDomain: boolean;
    seoOptimization: boolean;
  };

  complianceLevel?: "basic" | "intermediate" | "advanced";
  legalStatus?: "unverified" | "pending" | "verified";
  riskScore?: number;

  status: "pending" | "active" | "suspended" | "under_review";
  createdAt: Date;
  updatedAt: Date;
}

// إحصائيات لوحة تحكم المسؤول
export interface AdminDashboardStats {
  totalStores: number;
  pendingApprovals: number;
  activeStores: number;
  suspendedStores: number;
  todayRegistrations: number;
  revenueToday: number;
  revenueMonth: number;
  topCategories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
}

// إجراء مراجعة
export interface ReviewAction {
  applicationId: string;
  action: "approve" | "reject" | "request_changes";
  notes: string;
  templateChanges?: any;
}

// تصدير الأنواع
export type {
  MerchantData as IMerchantData,
  StoreConfig as IStoreConfig,
  StoreApplication as IStoreApplication,
  Store as IStore,
};

// ====== وظائف مساعدة ======
export function isEnhancedCustomization(
  customization: StoreCustomization,
): customization is StoreCustomizationEnhanced {
  return (
    "enhancedLayout" in customization && "enhancedHomepage" in customization
  );
}

export function getBasicCustomization(
  customization: StoreCustomization,
): StoreCustomizationBasic {
  if (isEnhancedCustomization(customization)) {
    return {
      colors: customization.colors,
      fonts: customization.fonts,
      layout: customization.layout,
      homepage: customization.homepage,
      pages: customization.pages,
      effects: customization.effects,
      branding: {
        logo: customization.branding.logo,
        favicon: customization.branding.favicon,
      },
    };
  }
  return customization;
}

export function createBasicCustomization(
  override?: Partial<StoreCustomizationBasic>,
): StoreCustomizationBasic {
  return {
    colors: {
      primary: "#FF6B35",
      secondary: "#2E5AAC",
      background: "#FFFFFF",
      text: "#333333",
      accent: "#FF6B35",
      headerBackground: "#FFFFFF",
      footerBackground: "#F8F9FA",
      cardBackground: "#FFFFFF",
      borderColor: "#E5E7EB",
    },
    fonts: {
      heading: "Cairo",
      body: "Tajawal",
      size: {
        small: "0.875rem",
        medium: "1rem",
        large: "1.125rem",
        xlarge: "1.25rem",
      },
    },
    layout: {
      headerStyle: "fixed",
      footerStyle: "simple",
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
      showTestimonials: false,
      showStats: false,
      showBrands: false,
      heroImages: [],
      heroTexts: [],
    },
    pages: {
      enableBlog: false,
      enableReviews: true,
      enableWishlist: true,
      enableCompare: false,
      enableLiveChat: false,
      enableFAQ: false,
      enableAboutUs: false,
      enableContactUs: true,
    },
    effects: {
      animations: true,
      gradients: false,
      shadows: true,
      transitions: true,
    },
    branding: {
      logo: "",
      favicon: "",
    },
    ...override,
  };
}
// في types/store.ts - أضف هذه الدوال المساعدة
export function createDefaultBusinessActivities(
  override?: Partial<BusinessActivities>,
): BusinessActivities {
  return {
    mainActivity: "retail",
    subActivities: [],
    registrationNumber: `TEMP-${Date.now()}`,
    taxNumber: "",
    issueDate: new Date(),
    expiryDate: undefined,
    businessType: "retail",
    industry: "general",
    legalStructure: "sole_proprietorship",
    ...override,
  };
}

export function updateBusinessActivities(
  current: BusinessActivities,
  updates: {
    mainActivity?: string;
    subActivities?: string[];
    registrationNumber?: string;
    taxNumber?: string;
    businessType?: string;
    industry?: string;
  },
): BusinessActivities {
  return {
    ...current,
    ...updates,
    subActivities: updates.subActivities || current.subActivities,
    issueDate: current.issueDate, // لا تتغير
  };
}
// وظيفة للتحويل من الخصائص القديمة
export function migrateOldBusinessData(oldData: {
  primaryBusinessType?: string;
  subBusinessTypes?: string[];
  businessType?: string;
  industry?: string;
}): Partial<BusinessActivities> {
  return {
    mainActivity:
      oldData.primaryBusinessType || oldData.businessType || "retail",
    subActivities: oldData.subBusinessTypes || [],
    businessType: oldData.businessType,
    industry: oldData.industry,
  };
}
// دالة لتحويل أي customization إلى Enhanced
export function ensureEnhancedCustomization(
  customization: StoreCustomization,
  defaults?: Partial<StoreCustomizationEnhanced>,
): StoreCustomizationEnhanced {
  // إذا كان بالفعل Enhanced، أرجعها
  if (isEnhancedCustomization(customization)) {
    return customization;
  }

  // تحويل Basic إلى Enhanced
  const basic = customization;

  // إنشاء Enhanced مع القيم الافتراضية
  const enhanced: StoreCustomizationEnhanced = {
    ...basic,
    // إضافة الخصائpecs الإضافية
    branding: {
      logo: basic.branding?.logo || "",
      favicon: basic.branding?.favicon || "",
      brandName: defaults?.branding?.brandName || "",
      brandDescription: defaults?.branding?.brandDescription || {
        ar: "",
        en: "",
      },
      brandColors: defaults?.branding?.brandColors || {
        primary: basic.colors?.primary || "#FF6B35",
        secondary: basic.colors?.secondary || "#4A90E2",
        accent: "#F8F9FA",
        background: basic.colors?.background || "#FFFFFF",
        text: basic.colors?.text || "#333333",
        textSecondary: "#666666",
        border: basic.colors?.borderColor || "#E5E5E5",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      showPoweredBy: defaults?.branding?.showPoweredBy ?? true,
      watermark: defaults?.branding?.watermark || "",
    },
    typography: defaults?.typography || {
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
    enhancedLayout: defaults?.enhancedLayout || {
      containerWidth: "container",
      headerStyle: "fixed",
      footerStyle: "detailed",
      sidebarEnabled: true,
      breadcrumbsEnabled: true,
      megaMenuEnabled: true,
    },
    enhancedHomepage: defaults?.enhancedHomepage || {
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
        enabled: true,
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
        enabled: true,
        title: { ar: "عن متجرنا", en: "About Our Store" },
        content: { ar: "", en: "" },
        image: "",
        features: [],
      },
    },
    productPage: defaults?.productPage || {
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
    categoryPage: defaults?.categoryPage || {
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
    cart: defaults?.cart || {
      style: "sidebar",
      showThumbnails: true,
      showContinueShopping: true,
      showShippingCalculator: true,
      showCouponCode: true,
      showEstimatedTotal: true,
      saveForLater: true,
      quickCheckout: true,
    },
    checkout: defaults?.checkout || {
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
    orderTracking: defaults?.orderTracking || {
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
    staticPages: defaults?.staticPages || {
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
    seo: defaults?.seo || {
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
    social: defaults?.social || {
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
    advanced: defaults?.advanced || {
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

  return enhanced;
}
