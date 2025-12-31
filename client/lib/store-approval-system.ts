// // D:\New folder (2)\store\client\lib\store-approval-system.ts
// import {
//   collection,
//   addDoc,
//   updateDoc,
//   doc,
//   getDocs,
//   query,
//   where,
//   getDoc,
//   serverTimestamp,
//   orderBy,
//   DocumentData,
//   Timestamp,
//   limit,
//   writeBatch,
// } from "firebase/firestore";
// import { db } from "./firebase";

// // استيراد الأنواع والواجهات من firestore.ts
// import {
//   Store,
//   ShippingZone,
//   ShippingMethod,
//   SocialMedia,
//   ComplianceStatus,
//   ProductStatus,
//   DetectionMethod,
// } from "./firestore";

// // استيراد StoreCustomization من المكان الصحيح
// import { StoreCustomization } from "./enhanced-templates";

// // ============================================
// // 📦 الأنواع المساعدة (Helper Types) - تم تحديثها لتتوافق مع enhanced-templates
// // ============================================

// export interface MerchantData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   city: string;
//   address: string;
//   businessName: string;
//   businessType: string;
//   emailVerified?: boolean;
//   subBusinessTypes?: string[];
// }

// export interface StoreConfig {
//   template: string;
//   customization: {
//     storeName: string;
//     storeDescription?: string;
//     colors: {
//       primary: string;
//       secondary: string;
//       background: string;
//       text: string;
//       accent: string;
//       headerBackground: string;
//       footerBackground: string;
//       cardBackground?: string;
//       borderColor?: string;
//     };
//     subdomain: string;
//     customDomain?: string;
//     entityType: string;
//     logo?: string;
//   };
// }

// export interface StoreSettings {
//   currency: string;
//   language: string;
//   timezone?: string;
//   shipping: {
//     enabled: boolean;
//     defaultCost?: number;
//   };
//   payment: {
//     cashOnDelivery: boolean;
//     bankTransfer: boolean;
//     creditCard?: boolean;
//     paypal?: boolean;
//     stripe?: boolean;
//     mada?: boolean;
//     mobileWallet?: boolean;
//   };
//   notifications?: {
//     emailNotifications: boolean;
//     pushNotifications: boolean;
//     smsNotifications: boolean;
//   };
//   taxes?: {
//     enabled: boolean;
//     includeInPrice: boolean;
//     rate: number;
//   };
// }

// export interface VerificationData {
//   status: "not_started" | "pending" | "verified" | "rejected";
//   documents?: {
//     commercialLicense?: string;
//     nationalId?: string;
//     addressProof?: string;
//     bankInfo?: {
//       bankName?: string;
//       accountNumber?: string;
//       iban?: string;
//     };
//   };
//   submittedAt?: Date | Timestamp;
//   verifiedAt?: Date | Timestamp;
//   reviewerId?: string;
//   rejectionReason?: string;
// }

// // ============================================
// // 🏗️ الواجهات الرئيسية (Main Interfaces)
// // ============================================

// export interface StoreApplication {
//   id: string;
//   merchantId: string;
//   merchantData: MerchantData;
//   storeConfig: StoreConfig;
//   settings: StoreSettings;
//   ownerId: string;
//   industry?: string;
//   verification: VerificationData;
//   status: "pending" | "approved" | "rejected" | "under_review";
//   submittedAt: Timestamp;
//   reviewedAt?: Timestamp;
//   reviewedBy?: string;
//   rejectionReason?: string;
//   notes?: string;
//   emailVerified?: boolean;
//   activatedStoreId?: string;
//   activatedAt?: Timestamp;
// }

// export interface FirestoreApplication {
//   merchantId: string;
//   merchantData: MerchantData;
//   storeConfig: StoreConfig;
//   settings: StoreSettings;
//   ownerId: string;
//   industry?: string;
//   verification: VerificationData;
//   status: StoreApplication["status"];
//   submittedAt: Timestamp;
//   reviewedAt?: Timestamp;
//   reviewedBy?: string;
//   rejectionReason?: string;
//   notes: string;
//   emailVerified?: boolean;
//   activatedStoreId?: string;
//   activatedAt?: Timestamp;
// }

// // ============================================
// // 🛡️ دوال مساعدة لمعالجة الأخطاء
// // ============================================

// interface ErrorWithMessage {
//   message: string;
// }

// function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
//   return (
//     typeof error === "object" &&
//     error !== null &&
//     "message" in error &&
//     typeof (error as Record<string, unknown>).message === "string"
//   );
// }

// function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
//   if (isErrorWithMessage(maybeError)) return maybeError;

//   try {
//     return new Error(JSON.stringify(maybeError));
//   } catch {
//     return new Error(String(maybeError));
//   }
// }

// function getErrorMessage(error: unknown) {
//   return toErrorWithMessage(error).message;
// }

// // ============================================
// // 🔄 دوال التحويل والمساعدة المتوافقة
// // ============================================

// /**
//  * تحويل طلب متجر إلى بيانات متجر فعلي - متوافق تماماً مع Store interface و enhanced-templates
//  */
// export const convertApplicationToStore = (
//   application: StoreApplication,
// ): Omit<Store, "id" | "createdAt" | "updatedAt"> => {
//   console.log("🔄 [CONVERT] تحويل الطلب إلى متجر متوافق...");

//   const baseCustomization = application.storeConfig.customization;

//   // إنشاء كائن StoreCustomization متوافق تماماً مع enhanced-templates
//   const storeCustomization: StoreCustomization = {
//     // ✅ الحقول الإضافية
//     subBusinessTypes: application.merchantData.subBusinessTypes || [],
//     primaryBusinessType: application.merchantData.businessType || "",

//     // ✅ الألوان - متوافقة مع BasicColors
//     colors: {
//       primary: baseCustomization.colors.primary || "#FF6B35",
//       secondary: baseCustomization.colors.secondary || "#4A90E2",
//       background: baseCustomization.colors.background || "#FFFFFF",
//       text: baseCustomization.colors.text || "#333333",
//       accent: baseCustomization.colors.accent || "#F8F9FA",
//       headerBackground: baseCustomization.colors.headerBackground || "#FFFFFF",
//       footerBackground: baseCustomization.colors.footerBackground || "#F8F9FA",
//       cardBackground: "#FFFFFF",
//       borderColor: "#E5E5E5",
//     },

//     // ✅ الخطوط - متوافقة مع BasicFonts
//     fonts: {
//       heading: "Cairo",
//       body: "Inter",
//       size: {
//         small: "0.875rem",
//         medium: "1rem",
//         large: "1.125rem",
//         xlarge: "1.25rem",
//       },
//     },

//     // ✅ التخطيط - متوافق مع BasicLayout
//     layout: {
//       headerStyle: "fixed",
//       footerStyle: "detailed",
//       productGridColumns: 4,
//       containerWidth: "1200px",
//       borderRadius: "medium",
//       spacing: "normal",
//     },

//     // ✅ الصفحة الرئيسية - متوافقة مع BasicHomepage
//     homepage: {
//       showHeroSlider: true,
//       showFeaturedProducts: true,
//       showCategories: true,
//       showNewsletter: true,
//       showTestimonials: true,
//       showStats: false,
//       showBrands: true,
//       heroImages: [],
//       heroTexts: [],
//       sectionsOrder: [],
//     },

//     // ✅ الصفحات - متوافقة مع BasicPages
//     pages: {
//       enableBlog: false,
//       enableReviews: true,
//       enableWishlist: true,
//       enableCompare: false,
//       enableLiveChat: true,
//       enableFAQ: true,
//       enableAboutUs: true,
//       enableContactUs: true,
//     },

//     // ✅ المؤثرات
//     effects: {
//       animations: true,
//       gradients: true,
//       shadows: true,
//       transitions: true,
//     },

//     // ✅ العلامة التجارية
//     branding: {
//       logo: baseCustomization.logo || "",
//       favicon: "",
//       brandName: baseCustomization.storeName,
//       brandDescription: {
//         ar:
//           baseCustomization.storeDescription ||
//           `متجر ${baseCustomization.storeName}`,
//         en:
//           baseCustomization.storeDescription ||
//           `Store ${baseCustomization.storeName}`,
//       },
//       brandColors: {
//         primary: baseCustomization.colors.primary || "#FF6B35",
//         secondary: baseCustomization.colors.secondary || "#4A90E2",
//         accent: "#F8F9FA",
//         background: "#FFFFFF",
//         text: "#333333",
//         textSecondary: "#666666",
//         border: "#E5E5E5",
//         success: "#10B981",
//         warning: "#F59E0B",
//         error: "#EF4444",
//       },
//       showPoweredBy: true,
//       watermark: "",
//     },

//     // ✅ الطباعة
//     typography: {
//       primaryFont: "Cairo",
//       secondaryFont: "Inter",
//       fontSizes: {
//         xs: "0.75rem",
//         sm: "0.875rem",
//         base: "1rem",
//         lg: "1.125rem",
//         xl: "1.25rem",
//         "2xl": "1.5rem",
//         "3xl": "1.875rem",
//         "4xl": "2.25rem",
//       },
//     },

//     // ✅ التخطيط المحسن
//     enhancedLayout: {
//       containerWidth: "container",
//       headerStyle: "fixed",
//       footerStyle: "detailed",
//       sidebarEnabled: true,
//       breadcrumbsEnabled: true,
//       megaMenuEnabled: true,
//     },

//     // ✅ الصفحة الرئيسية المحسنة
//     enhancedHomepage: {
//       heroSection: {
//         enabled: true,
//         style: "slideshow",
//         backgroundImage: "",
//         backgroundVideo: "",
//         overlay: true,
//         overlayOpacity: 0.4,
//         textAlignment: "center",
//         content: {
//           title: { ar: "مرحباً بك في متجرنا", en: "Welcome to Our Store" },
//           subtitle: {
//             ar: "اكتشف أفضل المنتجات بأسعار مميزة",
//             en: "Discover the best products at amazing prices",
//           },
//           ctaText: { ar: "تسوق الآن", en: "Shop Now" },
//           ctaLink: "/products",
//         },
//       },
//       featuredProducts: {
//         enabled: true,
//         title: { ar: "المنتجات المميزة", en: "Featured Products" },
//         limit: 8,
//         layout: "grid",
//         columns: 4,
//         showPrices: true,
//         showRatings: true,
//         showQuickView: true,
//       },
//       categories: {
//         enabled: true,
//         title: { ar: "التصنيفات", en: "Categories" },
//         style: "grid",
//         showImages: true,
//         showProductCount: true,
//         limit: 6,
//       },
//       banners: {
//         enabled: true,
//         banners: [],
//       },
//       testimonials: {
//         enabled: true,
//         title: { ar: "آراء العملاء", en: "Customer Reviews" },
//         testimonials: [],
//         layout: "carousel",
//       },
//       newsletter: {
//         enabled: true,
//         title: {
//           ar: "اشترك في النشرة الإخبارية",
//           en: "Subscribe to Newsletter",
//         },
//         description: {
//           ar: "احصل على أحدث العروض والمنتجات",
//           en: "Get latest offers and products",
//         },
//         placeholder: { ar: "أدخل بريدك الإلكتروني", en: "Enter your email" },
//         buttonText: { ar: "اشتراك", en: "Subscribe" },
//         style: "inline",
//       },
//       aboutSection: {
//         enabled: true,
//         title: { ar: "عن متجرنا", en: "About Our Store" },
//         content: { ar: "", en: "" },
//         image: "",
//         features: [],
//       },
//     },

//     // ✅ صفحة المنتج
//     productPage: {
//       layout: "sidebar",
//       imageGallery: {
//         style: "thumbnails",
//         showZoom: true,
//         showFullscreen: true,
//         showVideo: true,
//       },
//       productInfo: {
//         showSKU: true,
//         showAvailability: true,
//         showShipping: true,
//         showWishlist: true,
//         showCompare: true,
//         showShare: true,
//         showReviews: true,
//         showRelatedProducts: true,
//         showRecommendations: true,
//       },
//       reviews: {
//         enabled: true,
//         requirePurchase: false,
//         moderationEnabled: true,
//         allowPhotos: true,
//         showVerifiedBadge: true,
//       },
//     },

//     // ✅ صفحة التصنيف
//     categoryPage: {
//       layout: "sidebar",
//       productsPerPage: 20,
//       gridColumns: 4,
//       listView: true,
//       sortOptions: ["newest", "price-low", "price-high", "rating", "popular"],
//       filters: {
//         priceRange: true,
//         brand: true,
//         color: true,
//         size: true,
//         rating: true,
//         availability: true,
//         customAttributes: true,
//       },
//       pagination: "numbers",
//     },

//     // ✅ سلة التسوق
//     cart: {
//       style: "sidebar",
//       showThumbnails: true,
//       showContinueShopping: true,
//       showShippingCalculator: true,
//       showCouponCode: true,
//       showEstimatedTotal: true,
//       saveForLater: true,
//       quickCheckout: true,
//     },

//     // ✅ عملية الدفع
//     checkout: {
//       layout: "multi-step",
//       guestCheckout: true,
//       accountCreation: "optional",
//       addressValidation: true,
//       showOrderSummary: true,
//       showTrustBadges: true,
//       showSecurityInfo: true,
//       paymentMethods: {
//         cashOnDelivery: true,
//         bankTransfer: true,
//         creditCard: true,
//         digitalWallet: true,
//         installments: false,
//       },
//     },

//     // ✅ تتبع الطلب
//     orderTracking: {
//       enabled: true,
//       showMap: true,
//       showEstimatedDelivery: true,
//       emailNotifications: true,
//       smsNotifications: true,
//       statusSteps: [
//         {
//           key: "pending",
//           title: { ar: "قيد المراجعة", en: "Under Review" },
//           description: {
//             ar: "تم استلام طلبك وهو قيد المراجعة",
//             en: "Your order has been received and is under review",
//           },
//         },
//         {
//           key: "confirmed",
//           title: { ar: "تم التأكيد", en: "Confirmed" },
//           description: {
//             ar: "تم تأكيد طلبك وجاري التجهيز",
//             en: "Your order has been confirmed and is being prepared",
//           },
//         },
//         {
//           key: "shipped",
//           title: { ar: "تم الشحن", en: "Shipped" },
//           description: {
//             ar: "تم شحن طلبك وهو في الطريق إليك",
//             en: "Your order has been shipped and is on the way",
//           },
//         },
//         {
//           key: "delivered",
//           title: { ar: "تم التوصيل", en: "Delivered" },
//           description: {
//             ar: "تم توصيل طلبك بنجاح",
//             en: "Your order has been delivered successfully",
//           },
//         },
//       ],
//     },

//     // ✅ الصفحات الثابتة
//     staticPages: {
//       aboutUs: {
//         enabled: true,
//         content: { ar: "", en: "" },
//       },
//       privacyPolicy: {
//         enabled: true,
//         content: { ar: "", en: "" },
//       },
//       termsOfService: {
//         enabled: true,
//         content: { ar: "", en: "" },
//       },
//       returnPolicy: {
//         enabled: true,
//         content: { ar: "", en: "" },
//       },
//       shippingInfo: {
//         enabled: true,
//         content: { ar: "", en: "" },
//       },
//       faq: {
//         enabled: true,
//         faqs: [],
//       },
//       contactUs: {
//         enabled: true,
//         showMap: true,
//         showContactForm: true,
//         content: { ar: "", en: "" },
//       },
//     },

//     // ✅ إعدادات SEO
//     seo: {
//       metaTitle: {
//         ar: baseCustomization.storeName,
//         en: baseCustomization.storeName,
//       },
//       metaDescription: {
//         ar:
//           baseCustomization.storeDescription ||
//           `متجر ${baseCustomization.storeName}`,
//         en:
//           baseCustomization.storeDescription ||
//           `Store ${baseCustomization.storeName}`,
//       },
//       keywords: { ar: [], en: [] },
//       ogImage: "",
//       structuredData: true,
//       sitemap: true,
//       robotsTxt: "",
//       analytics: {
//         googleAnalytics: "",
//         facebookPixel: "",
//         customCode: "",
//       },
//     },

//     // ✅ وسائل التواصل الاجتماعي
//     social: {
//       enabled: true,
//       platforms: {
//         facebook: "",
//         instagram: "",
//         twitter: "",
//         youtube: "",
//         tiktok: "",
//         snapchat: "",
//         whatsapp: "",
//       },
//       showInHeader: true,
//       showInFooter: true,
//       socialLogin: true,
//       socialSharing: true,
//     },

//     // ✅ الميزات المتقدمة
//     advanced: {
//       multiLanguage: true,
//       multiCurrency: false,
//       darkMode: true,
//       rtlSupport: true,
//       pwa: true,
//       lazyLoading: true,
//       imageOptimization: true,
//       caching: true,
//       cdnEnabled: false,
//       customCSS: "",
//       customJS: "",
//     },
//   };

//   // إنشاء كائن Store كامل ومتوافق
//   const storeData: Omit<Store, "id" | "createdAt" | "updatedAt"> = {
//     // ✅ الحقول الأساسية المطلوبة في Store
//     ownerId: application.ownerId || application.merchantId,
//     name: baseCustomization.storeName,
//     description:
//       baseCustomization.storeDescription ||
//       `متجر ${baseCustomization.storeName}`,
//     logo: baseCustomization.logo || "",
//     subdomain: baseCustomization.subdomain,
//     customDomain: baseCustomization.customDomain || "",
//     template: application.storeConfig.template || "modern-comprehensive",
//     industry: application.merchantData.businessType || "",

//     // ✅ النشاطات التجارية (مهم لنظام الامتثال)
//     businessActivities: {
//       mainActivity: application.merchantData.businessType || "general",
//       subActivities: application.merchantData.subBusinessTypes || [],
//       registrationNumber: "",
//       issueDate: new Date(),
//       expiryDate: undefined,
//       taxNumber: "",
//     },

//     // ✅ إعدادات الامتثال (مطلوبة في firestore)
//     complianceSettings: {
//       autoDetection: true,
//       strictMode: false,
//       notifyOnViolation: true,
//       allowedDeviations: [],
//       reviewThreshold: 10,
//     },

//     // ✅ العملة والإعدادات العامة
//     currency: application.settings.currency || "YER",
//     timezone: application.settings.timezone || "Asia/Sana'a",
//     language: application.settings.language || "ar",

//     // ✅ معلومات تجارية
//     taxNumber: "",
//     commercialRegistration: "",

//     // ✅ Customization - متوافق مع enhanced-templates
//     customization: storeCustomization,

//     // ✅ إعدادات المتجر الكاملة
//     settings: {
//       currency: application.settings.currency || "YER",
//       language: application.settings.language || "ar",
//       timezone: application.settings.timezone || "Asia/Sana'a",

//       notifications: application.settings.notifications || {
//         emailNotifications: true,
//         pushNotifications: true,
//         smsNotifications: false,
//       },

//       shipping: {
//         enabled: application.settings.shipping.enabled ?? true,
//         freeShippingThreshold: 0,
//         shippingCost: application.settings.shipping.defaultCost || 0,
//         defaultCost: application.settings.shipping.defaultCost || 0,
//         zones: [] as ShippingZone[],
//         methods: [] as ShippingMethod[],
//       },

//       payment: {
//         cashOnDelivery: application.settings.payment.cashOnDelivery ?? true,
//         bankTransfer: application.settings.payment.bankTransfer ?? true,
//         creditCard: application.settings.payment.creditCard || false,
//         paypal: application.settings.payment.paypal || false,
//         stripe: application.settings.payment.stripe || false,
//         mada: false,
//         mobileWallet: false,
//       },

//       taxes: application.settings.taxes || {
//         enabled: false,
//         includeInPrice: false,
//         rate: 0,
//       },
//     },

//     // ✅ بيانات الاتصال
//     contact: {
//       phone: application.merchantData.phone || "",
//       email: application.merchantData.email || "",
//       address: application.merchantData.address || "",
//       city: application.merchantData.city || "",
//       governorate: "",
//       country: "السعودية",
//       zipCode: "",
//       originalCity: application.merchantData.city || "",
//     },

//     // ✅ وسائل التواصل الاجتماعي
//     socialMedia: {} as SocialMedia,

//     // ✅ إحصائيات الامتثال
//     complianceStats: {
//       totalProducts: 0,
//       compliantProducts: 0,
//       flaggedProducts: 0,
//       lastCheck: new Date(),
//       complianceRate: 100,
//     },

//     // ✅ حالة المتجر
//     status: "active",
//   };

//   console.log("✅ [CONVERT] تم إنشاء بيانات المتجر المتوافقة:", {
//     storeName: storeData.name,
//     ownerId: storeData.ownerId,
//     hasBusinessActivities: !!storeData.businessActivities,
//     subActivitiesCount:
//       storeData.businessActivities?.subActivities?.length || 0,
//     hasComplianceSettings: !!storeData.complianceSettings,
//     hasCustomization: !!storeData.customization,
//     hasSubBusinessTypes: storeData.customization.subBusinessTypes?.length || 0,
//   });

//   return storeData;
// };

// // ============================================
// // 🚀 الوظائف الرئيسية (Core Functions)
// // ============================================

// /**
//  * إرسال طلب إنشاء متجر جديد - متوافق مع enhanced-templates
//  */
// export const submitStoreApplication = async (
//   merchantId: string,
//   merchantData: MerchantData,
//   storeConfig: StoreConfig,
//   settings?: Partial<StoreSettings>,
//   industry?: string,
//   isEmailVerified: boolean = false,
// ): Promise<string> => {
//   try {
//     console.log("🔄 جاري إرسال طلب المتجر إلى Firestore...", {
//       merchantId,
//       merchantData,
//       storeConfig,
//       settings,
//       industry,
//       isEmailVerified,
//     });

//     // ✅ التحقق من merchantId
//     if (!merchantId || merchantId.trim() === "" || merchantId === "undefined") {
//       console.error("❌ merchantId غير صالح:", merchantId);
//       throw new Error(
//         `merchantId غير صالح: "${merchantId}". يرجى تسجيل الدخول مرة أخرى.`,
//       );
//     }

//     // ✅ التحقق من البيانات الأساسية
//     if (!merchantData || !merchantData.email) {
//       throw new Error("بيانات التاجر غير مكتملة");
//     }

//     // ✅ تجهيز البيانات الكاملة مع الألوان المكتملة لتتوافق مع BasicColors
//     const applicationData: FirestoreApplication = {
//       merchantId: merchantId,
//       merchantData: {
//         firstName: merchantData.firstName || "",
//         lastName: merchantData.lastName || "",
//         email: merchantData.email || "",
//         phone: merchantData.phone || "",
//         city: merchantData.city || "",
//         address: merchantData.address || "",
//         businessName: merchantData.businessName || "",
//         businessType: merchantData.businessType || "",
//         emailVerified: isEmailVerified,
//         subBusinessTypes: merchantData.subBusinessTypes || [],
//       },
//       storeConfig: {
//         template: storeConfig.template || "modern-comprehensive",
//         customization: {
//           storeName: storeConfig.customization.storeName || "",
//           storeDescription: storeConfig.customization.storeDescription || "",
//           colors: {
//             primary: storeConfig.customization.colors?.primary || "#FF6B35",
//             secondary: storeConfig.customization.colors?.secondary || "#4A90E2",
//             background:
//               storeConfig.customization.colors?.background || "#FFFFFF",
//             text: storeConfig.customization.colors?.text || "#333333",
//             accent: storeConfig.customization.colors?.accent || "#F8F9FA",
//             headerBackground:
//               storeConfig.customization.colors?.headerBackground || "#FFFFFF",
//             footerBackground:
//               storeConfig.customization.colors?.footerBackground || "#F8F9FA",
//             cardBackground: "#FFFFFF",
//             borderColor: "#E5E5E5",
//           },
//           subdomain: storeConfig.customization.subdomain || "",
//           customDomain: storeConfig.customization.customDomain || "",
//           entityType: storeConfig.customization.entityType || "",
//           logo: storeConfig.customization.logo || "",
//         },
//       },
//       settings: {
//         currency: settings?.currency || "YER",
//         language: settings?.language || "ar",
//         timezone: settings?.timezone || "Asia/Sana'a",
//         shipping: {
//           enabled: settings?.shipping?.enabled ?? true,
//           defaultCost: settings?.shipping?.defaultCost || 0,
//         },
//         payment: {
//           cashOnDelivery: settings?.payment?.cashOnDelivery ?? true,
//           bankTransfer: settings?.payment?.bankTransfer ?? true,
//           creditCard: false,
//           paypal: false,
//           stripe: false,
//           mada: false,
//           mobileWallet: false,
//         },
//         notifications: {
//           emailNotifications: true,
//           pushNotifications: true,
//           smsNotifications: false,
//         },
//         taxes: {
//           enabled: false,
//           includeInPrice: false,
//           rate: 0,
//         },
//       },
//       ownerId: merchantId,
//       industry: industry || merchantData.businessType || "",
//       verification: {
//         status: "not_started",
//       },
//       status: "pending",
//       submittedAt: serverTimestamp() as Timestamp,
//       notes: "تم إرسال الطلب في انتظار المراجعة",
//       emailVerified: isEmailVerified,
//     };

//     console.log("✅ البيانات قبل الإرسال:", {
//       merchantId: applicationData.merchantId,
//       email: applicationData.merchantData.email,
//       businessName: applicationData.merchantData.businessName,
//       subBusinessTypes: applicationData.merchantData.subBusinessTypes,
//     });

//     const docRef = await addDoc(
//       collection(db, "storeApplications"),
//       applicationData,
//     );

//     console.log("✅ تم إرسال طلب المتجر بنجاح. المعرف:", docRef.id);
//     return docRef.id;
//   } catch (error) {
//     console.error("❌ خطأ في إرسال طلب المتجر:", error);
//     throw new Error(`فشل في إرسال طلب المتجر: ${getErrorMessage(error)}`);
//   }
// };

// /**
//  * الموافقة على طلب متجر وإنشاء المتجر الفعلي - متوافق
//  */
// export const approveStoreApplication = async (
//   applicationId: string,
//   reviewerId: string,
//   notes?: string,
// ): Promise<{ success: boolean; storeId?: string; message?: string }> => {
//   try {
//     console.log("🔄 [APPROVE] الموافقة على الطلب:", applicationId);

//     // 1. جلب بيانات الطلب
//     const application = await getStoreApplicationById(applicationId);
//     if (!application) {
//       throw new Error("طلب المتجر غير موجود");
//     }

//     // 2. تحويل الطلب إلى بيانات متجر متوافقة
//     const storeData = convertApplicationToStore(application);

//     // 3. إضافة الحقول المطلوبة
//     const completeStoreData: Omit<Store, "id"> = {
//       ...storeData,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };

//     // 4. استخدام service من firestore.ts لإنشاء المتجر
//     const { storeService } = await import("./firestore");

//     console.log("🛠️ [APPROVE] إنشاء المتجر عبر storeService...");
//     const storeId = await storeService.create(completeStoreData);

//     // 5. تحديث حالة الطلب
//     const appRef = doc(db, "storeApplications", applicationId);
//     await updateDoc(appRef, {
//       status: "approved",
//       reviewedAt: serverTimestamp(),
//       reviewedBy: reviewerId,
//       activatedStoreId: storeId,
//       activatedAt: serverTimestamp(),
//       notes: notes || `تمت الموافقة وإنشاء المتجر ${storeId}`,
//     });

//     console.log("✅ [APPROVE] تمت العملية بنجاح:", {
//       applicationId,
//       storeId,
//       storeName: storeData.name,
//       subBusinessTypes: storeData.customization.subBusinessTypes,
//     });

//     return {
//       success: true,
//       storeId,
//       message: `تم إنشاء المتجر "${storeData.name}" بنجاح`,
//     };
//   } catch (error) {
//     console.error("❌ [APPROVE] خطأ:", error);
//     return {
//       success: false,
//       message: `فشل في الموافقة: ${getErrorMessage(error)}`,
//     };
//   }
// };

// // ============================================
// // 📞 بقية الدوال - تم تحديثها
// // ============================================

// /**
//  * جلب جميع طلبات المتاجر مع إمكانية التصفية حسب الحالة
//  */
// export const getStoreApplications = async (
//   status?: StoreApplication["status"],
// ): Promise<StoreApplication[]> => {
//   try {
//     console.log("🔄 جاري جلب طلبات المتاجر...", { status });

//     let q;
//     if (status) {
//       q = query(
//         collection(db, "storeApplications"),
//         where("status", "==", status),
//         orderBy("submittedAt", "desc"),
//       );
//     } else {
//       q = query(
//         collection(db, "storeApplications"),
//         orderBy("submittedAt", "desc"),
//       );
//     }

//     const querySnapshot = await getDocs(q);
//     const applications: StoreApplication[] = [];

//     querySnapshot.forEach((doc) => {
//       const data = doc.data() as FirestoreApplication;
//       applications.push({
//         id: doc.id,
//         merchantId: data.merchantId,
//         merchantData: data.merchantData,
//         storeConfig: data.storeConfig,
//         settings: data.settings,
//         ownerId: data.ownerId,
//         industry: data.industry,
//         verification: data.verification,
//         status: data.status,
//         submittedAt: data.submittedAt,
//         reviewedAt: data.reviewedAt,
//         reviewedBy: data.reviewedBy,
//         rejectionReason: data.rejectionReason,
//         notes: data.notes || "",
//         emailVerified: data.emailVerified,
//         activatedStoreId: data.activatedStoreId,
//         activatedAt: data.activatedAt,
//       });
//     });

//     console.log(`✅ تم العثور على ${applications.length} طلب متجر`);
//     return applications;
//   } catch (error) {
//     console.error("❌ خطأ في جلب طلبات المتاجر:", error);
//     throw new Error(`فشل في جلب طلبات المتاجر: ${getErrorMessage(error)}`);
//   }
// };

// /**
//  * جلب طلب متجر بواسطة المعرف
//  */
// export const getStoreApplicationById = async (
//   id: string,
// ): Promise<StoreApplication | null> => {
//   try {
//     console.log("🔄 جاري جلب طلب المتجر بواسطة المعرف:", id);

//     const docRef = doc(db, "storeApplications", id);
//     const docSnap = await getDoc(docRef);

//     if (docSnap.exists()) {
//       const data = docSnap.data() as FirestoreApplication;
//       const application: StoreApplication = {
//         id: docSnap.id,
//         merchantId: data.merchantId,
//         merchantData: data.merchantData,
//         storeConfig: data.storeConfig,
//         settings: data.settings,
//         ownerId: data.ownerId,
//         industry: data.industry,
//         verification: data.verification,
//         status: data.status,
//         submittedAt: data.submittedAt,
//         reviewedAt: data.reviewedAt,
//         reviewedBy: data.reviewedBy,
//         rejectionReason: data.rejectionReason,
//         notes: data.notes,
//         emailVerified: data.emailVerified,
//         activatedStoreId: data.activatedStoreId,
//         activatedAt: data.activatedAt,
//       };

//       console.log("✅ تم العثور على طلب المتجر:", application);
//       return application;
//     } else {
//       console.log("❌ لم يتم العثور على طلب المتجر بالمعرف:", id);
//       return null;
//     }
//   } catch (error) {
//     console.error("❌ خطأ في جلب طلب المتجر بواسطة المعرف:", error);
//     throw new Error(`فشل في جلب طلب المتجر: ${getErrorMessage(error)}`);
//   }
// };

// /**
//  * جلب طلب متجر بواسطة معرف التاجر
//  */
// export const getStoreApplicationByMerchantId = async (
//   merchantId: string,
// ): Promise<StoreApplication | null> => {
//   try {
//     console.log("🔄 جاري جلب طلب المتجر بواسطة معرف التاجر:", merchantId);

//     const q = query(
//       collection(db, "storeApplications"),
//       where("merchantId", "==", merchantId),
//       orderBy("submittedAt", "desc"),
//       limit(1),
//     );

//     const querySnapshot = await getDocs(q);

//     if (!querySnapshot.empty) {
//       const doc = querySnapshot.docs[0];
//       const data = doc.data() as FirestoreApplication;
//       const application: StoreApplication = {
//         id: doc.id,
//         merchantId: data.merchantId,
//         merchantData: data.merchantData,
//         storeConfig: data.storeConfig,
//         settings: data.settings,
//         ownerId: data.ownerId,
//         industry: data.industry,
//         verification: data.verification,
//         status: data.status,
//         submittedAt: data.submittedAt,
//         reviewedAt: data.reviewedAt,
//         reviewedBy: data.reviewedBy,
//         rejectionReason: data.rejectionReason,
//         notes: data.notes,
//         emailVerified: data.emailVerified,
//         activatedStoreId: data.activatedStoreId,
//         activatedAt: data.activatedAt,
//       };

//       console.log("✅ تم العثور على طلب المتجر للتاجر:", application);
//       return application;
//     } else {
//       console.log("❌ لم يتم العثور على طلب متجر لمعرف التاجر:", merchantId);
//       return null;
//     }
//   } catch (error) {
//     console.error("❌ خطأ في جلب طلب المتجر بواسطة معرف التاجر:", error);
//     throw new Error(`فشل في جلب طلب المتجر للتاجر: ${getErrorMessage(error)}`);
//   }
// };

// /**
//  * رفض طلب متجر
//  */
// export const rejectStoreApplication = async (
//   applicationId: string,
//   reviewerId: string,
//   reason: string,
//   notes?: string,
// ): Promise<boolean> => {
//   try {
//     console.log("🔄 جاري رفض طلب المتجر:", applicationId);

//     const appRef = doc(db, "storeApplications", applicationId);

//     await updateDoc(appRef, {
//       status: "rejected",
//       reviewedAt: serverTimestamp(),
//       reviewedBy: reviewerId,
//       rejectionReason: reason,
//       notes: notes || `تم رفض الطلب: ${reason}`,
//     });

//     console.log("✅ تم رفض طلب المتجر");
//     return true;
//   } catch (error) {
//     console.error("❌ خطأ في رفض طلب المتجر:", error);
//     return false;
//   }
// };

// /**
//  * تحديث حالة التوثيق في طلب المتجر
//  */
// export const updateApplicationVerification = async (
//   applicationId: string,
//   verificationData: Partial<VerificationData>,
//   reviewerId?: string,
// ): Promise<boolean> => {
//   try {
//     console.log("🔄 جاري تحديث حالة التوثيق:", applicationId);

//     const appRef = doc(db, "storeApplications", applicationId);
//     const updateData: any = {
//       "verification.status": verificationData.status,
//     };

//     if (verificationData.documents) {
//       updateData["verification.documents"] = verificationData.documents;
//     }

//     if (verificationData.status === "verified") {
//       updateData["verification.verifiedAt"] = serverTimestamp();
//       updateData["verification.reviewerId"] = reviewerId;
//     } else if (verificationData.status === "rejected") {
//       updateData["verification.rejectionReason"] =
//         verificationData.rejectionReason;
//     }

//     await updateDoc(appRef, updateData);

//     console.log("✅ تم تحديث حالة التوثيق");
//     return true;
//   } catch (error) {
//     console.error("❌ خطأ في تحديث حالة التوثيق:", error);
//     return false;
//   }
// };

// /**
//  * تحديث حالة طلب المتجر
//  */
// export const updateStoreApplicationStatus = async (
//   applicationId: string,
//   status: StoreApplication["status"],
//   reviewerId?: string,
//   notes?: string,
// ): Promise<boolean> => {
//   try {
//     console.log("🔄 جاري تحديث حالة طلب المتجر:", {
//       applicationId,
//       status,
//     });

//     const appRef = doc(db, "storeApplications", applicationId);
//     const updateData: any = {
//       status,
//       notes: notes || `تم تحديث الحالة إلى: ${status}`,
//     };

//     if (reviewerId && (status === "approved" || status === "rejected")) {
//       updateData.reviewedAt = serverTimestamp();
//       updateData.reviewedBy = reviewerId;
//     }

//     await updateDoc(appRef, updateData);

//     console.log("✅ تم تحديث حالة طلب المتجر");
//     return true;
//   } catch (error) {
//     console.error("❌ خطأ في تحديث حالة طلب المتجر:", error);
//     return false;
//   }
// };

// /**
//  * جلب إحصائيات الطلبات
//  */
// export const getApplicationStats = async () => {
//   try {
//     console.log("🔄 جاري جلب إحصائيات الطلبات...");

//     const applications = await getStoreApplications();

//     const stats = {
//       total: applications.length,
//       pending: applications.filter((app) => app.status === "pending").length,
//       approved: applications.filter((app) => app.status === "approved").length,
//       rejected: applications.filter((app) => app.status === "rejected").length,
//       under_review: applications.filter((app) => app.status === "under_review")
//         .length,
//       verification_pending: applications.filter(
//         (app) => app.verification.status === "pending",
//       ).length,
//       verified: applications.filter(
//         (app) => app.verification.status === "verified",
//       ).length,
//     };

//     console.log("✅ إحصائيات الطلبات:", stats);
//     return stats;
//   } catch (error) {
//     console.error("❌ خطأ في جلب إحصائيات الطلبات:", error);
//     return {
//       total: 0,
//       pending: 0,
//       approved: 0,
//       rejected: 0,
//       under_review: 0,
//       verification_pending: 0,
//       verified: 0,
//     };
//   }
// };

// /**
//  * البحث في طلبات المتاجر
//  */
// export const searchStoreApplications = async (
//   searchTerm: string,
// ): Promise<StoreApplication[]> => {
//   try {
//     console.log("🔄 جاري البحث في طلبات المتاجر:", searchTerm);

//     const allApplications = await getStoreApplications();
//     const searchLower = searchTerm.toLowerCase();

//     const filteredApplications = allApplications.filter(
//       (app) =>
//         app.merchantData.firstName.toLowerCase().includes(searchLower) ||
//         app.merchantData.lastName.toLowerCase().includes(searchLower) ||
//         app.merchantData.email.toLowerCase().includes(searchLower) ||
//         app.merchantData.businessName.toLowerCase().includes(searchLower) ||
//         app.merchantData.city.toLowerCase().includes(searchLower) ||
//         app.storeConfig.customization.storeName
//           .toLowerCase()
//           .includes(searchLower) ||
//         app.status.toLowerCase().includes(searchLower) ||
//         app.verification.status.toLowerCase().includes(searchLower),
//     );

//     console.log(
//       `✅ تم العثور على ${filteredApplications.length} طلب مطابق للبحث`,
//     );
//     return filteredApplications;
//   } catch (error) {
//     console.error("❌ خطأ في البحث في طلبات المتاجر:", error);
//     return [];
//   }
// };

// /**
//  * التحقق من اكتمال نقل البيانات
//  */
// export const verifyDataTransfer = async (
//   applicationId: string,
//   storeId: string,
// ): Promise<{
//   complete: boolean;
//   missingFields: string[];
//   differences: Record<string, any>;
// }> => {
//   try {
//     const application = await getStoreApplicationById(applicationId);
//     const { storeService } = await import("./firestore");
//     const store = await storeService.getById(storeId);

//     if (!application || !store) {
//       return {
//         complete: false,
//         missingFields: ["طلب أو متجر غير موجود"],
//         differences: {},
//       };
//     }

//     const missingFields: string[] = [];
//     const differences: Record<string, any> = {};

//     // التحقق من النشاطات التجارية
//     if (
//       application.merchantData.subBusinessTypes &&
//       (!store.businessActivities?.subActivities ||
//         store.businessActivities.subActivities.length === 0)
//     ) {
//       missingFields.push("businessActivities.subActivities");
//       differences.subBusinessTypes = {
//         application: application.merchantData.subBusinessTypes,
//         store: store.businessActivities?.subActivities || [],
//       };
//     }

//     // التحقق من التخصيص
//     if (!store.customization) {
//       missingFields.push("customization");
//     }

//     // التحقق من subBusinessTypes في customization
//     if (!store.customization?.subBusinessTypes) {
//       missingFields.push("customization.subBusinessTypes");
//     }

//     // التحقق من primaryBusinessType في customization
//     if (!store.customization?.primaryBusinessType) {
//       missingFields.push("customization.primaryBusinessType");
//     }

//     // التحقق من إعدادات الامتثال
//     if (!store.complianceSettings) {
//       missingFields.push("complianceSettings");
//     }

//     // التحقق من الإعدادات
//     if (!store.settings) {
//       missingFields.push("settings");
//     }

//     // التحقق من الإحصائيات
//     if (!store.complianceStats) {
//       missingFields.push("complianceStats");
//     }

//     return {
//       complete: missingFields.length === 0,
//       missingFields,
//       differences,
//     };
//   } catch (error) {
//     console.error("❌ خطأ في التحقق:", error);
//     return {
//       complete: false,
//       missingFields: ["خطأ في التحقق"],
//       differences: {},
//     };
//   }
// };

// /**
//  * تحقق مما إذا كان التاجر لديه طلب نشط
//  */
// export const hasActiveStoreApplication = async (
//   merchantId: string,
// ): Promise<boolean> => {
//   try {
//     const application = await getStoreApplicationByMerchantId(merchantId);
//     return (
//       application !== null &&
//       (application.status === "pending" ||
//         application.status === "under_review" ||
//         application.status === "approved")
//     );
//   } catch (error) {
//     console.error("❌ خطأ في التحقق من وجود طلب نشط:", error);
//     return false;
//   }
// };

// /**
//  * جلب حالة طلب المتجر للتاجر
//  */
// export const getMerchantApplicationStatus = async (
//   merchantId: string,
// ): Promise<{
//   hasApplication: boolean;
//   application?: StoreApplication;
//   status?: string;
//   storeId?: string;
// }> => {
//   try {
//     const application = await getStoreApplicationByMerchantId(merchantId);

//     if (!application) {
//       return { hasApplication: false };
//     }

//     return {
//       hasApplication: true,
//       application,
//       status: application.status,
//       storeId: application.activatedStoreId,
//     };
//   } catch (error) {
//     console.error("❌ خطأ في جلب حالة طلب التاجر:", error);
//     return { hasApplication: false };
//   }
// };

// /**
//  * تحديث بيانات المتجر بالنشاطات الفرعية
//  */
// export const updateStoreWithSubBusinessTypes = async (
//   storeId: string,
//   subBusinessTypes: string[],
//   businessType: string,
// ): Promise<boolean> => {
//   try {
//     const { storeService } = await import("./firestore");
//     const store = await storeService.getById(storeId);

//     if (!store) {
//       throw new Error("المتجر غير موجود");
//     }

//     // تحديث businessActivities
//     await storeService.update(storeId, {
//       businessActivities: {
//         ...store.businessActivities,
//         mainActivity: businessType,
//         subActivities: subBusinessTypes,
//       },
//       industry: businessType,
//     });

//     // تحديث customization أيضاً
//     await storeService.update(storeId, {
//       customization: {
//         ...store.customization,
//         subBusinessTypes: subBusinessTypes,
//         primaryBusinessType: businessType,
//       },
//     });

//     console.log("✅ تم تحديث المتجر بالنشاطات الفرعية:", {
//       storeId,
//       businessType,
//       subBusinessTypes,
//     });

//     return true;
//   } catch (error) {
//     console.error("❌ خطأ في تحديث النشاطات الفرعية:", error);
//     return false;
//   }
// };

// /**
//  * اختبار تحويل البيانات
//  */
// export const testDataConversion = (
//   applicationData: Partial<StoreApplication>,
// ) => {
//   const mockApplication: StoreApplication = {
//     id: "test-" + Date.now(),
//     merchantId: "test-merchant",
//     merchantData: {
//       firstName: "اختبار",
//       lastName: "المستخدم",
//       email: "test@example.com",
//       phone: "123456789",
//       city: "صنعاء",
//       address: "شارع الاختبار",
//       businessName: "متجر الاختبار",
//       businessType: "electronics",
//       subBusinessTypes: ["laptops", "mobiles", "tv", "gaming"],
//     },
//     storeConfig: {
//       template: "modern-comprehensive",
//       customization: {
//         storeName: "متجر الاختبار الإلكتروني",
//         storeDescription: "متجر متخصص في الإلكترونيات",
//         colors: {
//           primary: "#FF6B35",
//           secondary: "#4A90E2",
//           background: "#FFFFFF",
//           text: "#333333",
//           accent: "#F8F9FA",
//           headerBackground: "#FFFFFF",
//           footerBackground: "#F8F9FA",
//           cardBackground: "#FFFFFF",
//           borderColor: "#E5E5E5",
//         },
//         subdomain: "test-store",
//         customDomain: "",
//         entityType: "individual",
//         logo: "",
//       },
//     },
//     settings: {
//       currency: "YER",
//       language: "ar",
//       timezone: "Asia/Sana'a",
//       shipping: {
//         enabled: true,
//         defaultCost: 0,
//       },
//       payment: {
//         cashOnDelivery: true,
//         bankTransfer: true,
//         creditCard: false,
//         paypal: false,
//         stripe: false,
//         mada: false,
//         mobileWallet: false,
//       },
//       notifications: {
//         emailNotifications: true,
//         pushNotifications: true,
//         smsNotifications: false,
//       },
//       taxes: {
//         enabled: false,
//         includeInPrice: false,
//         rate: 0,
//       },
//     },
//     ownerId: "test-merchant",
//     industry: "electronics",
//     verification: {
//       status: "not_started",
//     },
//     status: "pending",
//     submittedAt: Timestamp.now(),
//     notes: "طلب اختبار",
//     emailVerified: false,
//     ...applicationData,
//   };

//   console.log("🧪 بدء اختبار تحويل البيانات...");
//   const storeData = convertApplicationToStore(mockApplication);

//   console.log("✅ نتيجة الاختبار:", {
//     storeName: storeData.name,
//     businessActivities: storeData.businessActivities,
//     customization: {
//       hasSubBusinessTypes:
//         storeData.customization.subBusinessTypes?.length || 0,
//       hasPrimaryBusinessType: !!storeData.customization.primaryBusinessType,
//       colors: storeData.customization.colors,
//     },
//     complianceSettings: storeData.complianceSettings,
//     complianceStats: storeData.complianceStats,
//   });

//   return storeData;
// };

import { Store, storeService } from "./firestore";
import { complianceService } from "./complianceService";

export interface StoreApplicationResult {
  storeId: string;
  checklist: any;
  complianceLevel: "basic" | "intermediate" | "advanced";
  riskScore: number;
}

export async function submitStoreApplication(
  merchantId: string,
  merchantData: any,
  storeConfig: any,
  settings: any,
  industry?: string,
): Promise<StoreApplicationResult> {
  if (!merchantId) {
    throw new Error("❌ merchantId غير صالح أو غير موجود");
  }

  try {
    // 🔥 1. التحقق من البيانات الأساسية
    if (!merchantData.phone || merchantData.phone.length < 9) {
      throw new Error("رقم الهاتف غير صالح");
    }

    if (!merchantData.email || !merchantData.email.includes("@")) {
      throw new Error("البريد الإلكتروني غير صالح");
    }

    // 🔥 2. إنشاء بيانات المتجر
    const storeData: any = {
      ownerId: merchantId,
      name: storeConfig.customization.storeName,
      description:
        storeConfig.customization.storeDescription ||
        "متجر إلكتروني على المنصة",
      logo: storeConfig.customization.logo || "",
      subdomain: storeConfig.customization.subdomain,
      customDomain: storeConfig.customization.customDomain || "",
      template: storeConfig.template || "modern-yemeni",
      industry: industry || "retail",

      // 🔥 نظام الامتثال التدريجي
      checklist: complianceService.getDefaultChecklist(),
      complianceLevel: "basic" as const,
      legalStatus: "unverified" as const,

      // الأنشطة التجارية
      businessActivities: {
        mainActivity: merchantData.businessType || "retail",
        subActivities: merchantData.subBusinessTypes || [],
        registrationNumber: `TEMP-${Date.now()}`,
        taxNumber: "",
        issueDate: new Date(),
      },

      // إعدادات التوافق (مرنة للبداية)
      complianceSettings: {
        autoDetection: false,
        strictMode: false,
        notifyOnViolation: false,
        allowedDeviations: ["all"],
        reviewThreshold: 50,
      },

      // العملة واللغة (يمنية)
      currency: "YER",
      timezone: "Asia/Aden",
      language: "ar",

      // التخصيص
      customization: {
        colors: storeConfig.customization.colors || {
          primary: "#FF6B35",
          secondary: "#2E5AAC",
          background: "#FFFFFF",
        },
        branding: {
          logo: storeConfig.customization.logo || "",
          favicon: "",
        },
        layout: "standard",
      },

      // الإعدادات التشغيلية
      settings: {
        currency: "YER",
        language: "ar",
        timezone: "Asia/Aden",

        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
        },

        shipping: {
          enabled: false,
          freeShippingThreshold: 0,
          shippingCost: 0,
          defaultCost: 0,
          zones: [],
          methods: [],
        },

        payment: {
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
          },
        },

        taxes: {
          enabled: false,
          includeInPrice: false,
          rate: 0,
        },
      },

      // بيانات الاتصال
      contact: {
        phone: merchantData.phone || "",
        email: merchantData.email || "",
        address: merchantData.address || "سيتم الإضافة لاحقاً",
        city: merchantData.city || "",
        governorate: merchantData.city || "",
        country: "اليمن",
        zipCode: "",
        originalCity: merchantData.city || "",
      },

      // إحصائيات التوافق
      complianceStats: {
        totalProducts: 0,
        compliantProducts: 0,
        flaggedProducts: 0,
        lastCheck: new Date(),
        complianceRate: 100,
      },

      // 🔥 الحالة: active مباشرة (نظام التخزين المباشر)
      status: "active" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 🔥 3. الحفظ في Firestore
    const storeId = await storeService.create(storeData);

    // 🔥 4. تقييم المخاطر الأولي
    const riskAssessment = await complianceService.assessStoreRisk(storeId);

    console.log("✅ [مباشر] تم إنشاء متجر بنظام التخزين المباشر:", {
      storeId,
      name: storeData.name,
      subdomain: storeData.subdomain,
      complianceLevel: "basic",
      riskScore: riskAssessment.score,
      checklistItems: 0,
    });

    return {
      storeId,
      checklist: storeData.checklist,
      complianceLevel: "basic",
      riskScore: riskAssessment.score,
    };
  } catch (error: any) {
    console.error("❌ [مباشر] خطأ في إنشاء المتجر:", error);
    throw new Error(`فشل إنشاء المتجر: ${error.message}`);
  }
}

// في نهاية ملف store-approval-system.ts
export async function getStoreApplicationByMerchantId(merchantId: string) {
  try {
    if (!merchantId) {
      throw new Error("❌ merchantId غير صالح");
    }

    // تنفيذ منطق جلب طلب المتجر
    const storeApplication = await storeService.getByMerchantId(merchantId);

    if (!storeApplication) {
      return null;
    }

    return {
      ...storeApplication,
      id: storeApplication.id,
      createdAt: storeApplication.createdAt,
      updatedAt: storeApplication.updatedAt,
    };
  } catch (error: any) {
    console.error("❌ خطأ في جلب طلب المتجر:", error);
    throw new Error(`فشل جلب طلب المتجر: ${error.message}`);
  }
}

// 🔥 أضف هذه الدوال في نهاية store-approval-system.ts

export async function getStoreApplications(): Promise<any[]> {
  try {
    // جلب جميع الطلبات من localStorage أو Firestore
    const applications = localStorage.getItem("store_applications");
    if (applications) {
      return JSON.parse(applications);
    }

    // إذا كان لديك Firestore، استخدم:
    // return await storeService.getAllApplications();

    return []; // القيمة الافتراضية
  } catch (error) {
    console.error("خطأ في جلب طلبات المتاجر:", error);
    return [];
  }
}

export async function approveStoreApplication(
  applicationId: string,
  adminId: string,
): Promise<boolean> {
  try {
    console.log(
      `✅ [موافقة] الموافقة على الطلب ${applicationId} بواسطة ${adminId}`,
    );

    // 1. جلب الطلب
    const applications = await getStoreApplications();
    const application = applications.find(
      (app: any) => app.id === applicationId,
    );

    if (!application) {
      console.error(`❌ الطلب غير موجود: ${applicationId}`);
      return false;
    }

    // 2. تحديث حالة الطلب
    const updatedApplications = applications.map((app: any) => {
      if (app.id === applicationId) {
        return {
          ...app,
          status: "approved",
          approvedBy: adminId,
          approvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return app;
    });

    // 3. حفظ في localStorage
    localStorage.setItem(
      "store_applications",
      JSON.stringify(updatedApplications),
    );

    // 4. إذا كنت تستخدم Firestore، أضف هذا:
    // await storeService.updateApplication(applicationId, {
    //   status: 'approved',
    //   approvedBy: adminId,
    //   approvedAt: new Date()
    // });

    console.log(`✅ تمت الموافقة على الطلب ${applicationId}`);
    return true;
  } catch (error) {
    console.error("❌ خطأ في الموافقة على الطلب:", error);
    return false;
  }
}

// 🔥 دالة لإنشاء بيانات تجريبية إذا لم تكن موجودة
export function initializeSampleApplications() {
  const sampleApplications = [
    {
      id: "app_1",
      merchantId: "user_1",
      merchantData: {
        firstName: "أحمد",
        lastName: "اليمني",
        email: "ahmed@example.com",
        phone: "771234567",
        businessType: "retail",
      },
      storeConfig: {
        customization: {
          storeName: "متجر أحمد للأجهزة",
          storeDescription: "متجر متخصص في الأجهزة الإلكترونية",
        },
      },
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "app_2",
      merchantId: "user_2",
      merchantData: {
        firstName: "فاطمة",
        lastName: "الشرعبي",
        email: "fatima@example.com",
        phone: "778765432",
        businessType: "fashion",
      },
      storeConfig: {
        customization: {
          storeName: "بوتيك فاطمة",
          storeDescription: "أزياء وملابس نسائية",
        },
      },
      status: "approved",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedBy: "admin_1",
      approvedAt: new Date().toISOString(),
    },
  ];

  // حفظ البيانات التجريبية
  localStorage.setItem(
    "store_applications",
    JSON.stringify(sampleApplications),
  );
  return sampleApplications;
}
