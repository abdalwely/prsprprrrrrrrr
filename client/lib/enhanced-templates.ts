// // ====== تعريفات إضافية من StoreCustomization.tsx ======
// interface BasicColors {
//   primary: string;
//   secondary: string;
//   background: string;
//   text: string;
//   accent: string;
//   headerBackground: string;
//   footerBackground: string;
//   cardBackground: string;
//   borderColor: string;
// }

// interface BasicFontSizes {
//   small: string;
//   medium: string;
//   large: string;
//   xlarge: string;
// }

// interface BasicFonts {
//   heading: string;
//   body: string;
//   size: BasicFontSizes;
// }

// interface HeroText {
//   title: string;
//   subtitle: string;
//   buttonText: string;
// }

// interface BasicLayout {
//   headerStyle: string;
//   footerStyle: string;
//   productGridColumns: number;
//   containerWidth: string;
//   borderRadius: "small" | "medium" | "large" | "full" | "none";
//   spacing: string;
// }

// // في enhanced-templates.ts - تحديث الواجهات الأساسية:

// interface BasicHomepage {
//   showHeroSlider: boolean;
//   showFeaturedProducts: boolean;
//   showCategories: boolean;
//   showNewsletter: boolean;
//   showTestimonials: boolean; // ⭐ إضافة
//   showStats: boolean; // ⭐ إضافة
//   showBrands: boolean; // ⭐ إضافة
//   heroImages: string[];
//   heroTexts: HeroText[];
//   sectionsOrder?: string[]; // ⭐ إضافة اختيارية
// }

// interface BasicPages {
//   enableBlog: boolean;
//   enableReviews: boolean;
//   enableWishlist: boolean;
//   enableCompare: boolean;
//   enableLiveChat: boolean; // ⭐ إضافة
//   enableFAQ: boolean; // ⭐ إضافة
//   enableAboutUs: boolean; // ⭐ إضافة
//   enableContactUs: boolean; // ⭐ إضافة
// }
// // ====== نهاية التعريفات الإضافية ======

// export interface StoreCustomization {
//   // Visual Identity - مع إضافة الخصائص المفقودة
//   // ⭐⭐ إضافة: النشاطات الفرعية للمتجر (NEW FIELD)
//   subBusinessTypes?: string[];

//   // ⭐ إضافة: النشاط الرئيسي الدقيق (للتوافق مع businessType في storeApplications)
//   primaryBusinessType?: string;
//   branding: {
//     logo: string;
//     favicon: string;
//     brandName: string;
//     brandDescription: { ar: string; en: string };
//     brandColors: {
//       primary: string;
//       secondary: string;
//       accent: string;
//       background: string;
//       text: string;
//       textSecondary: string;
//       border: string;
//       success: string;
//       warning: string;
//       error: string;
//     };
//     showPoweredBy: boolean;
//     watermark: string;
//   };

//   // الخصائص الأساسية من StoreCustomization.tsx
//   colors: BasicColors;
//   fonts: BasicFonts;
//   layout: BasicLayout;
//   homepage: BasicHomepage;
//   pages: BasicPages;

//   effects: {
//     animations: boolean;
//     gradients: boolean;
//     shadows: boolean;
//     transitions: boolean;
//   };

//   // Typography
//   typography: {
//     primaryFont: string;
//     secondaryFont: string;
//     fontSizes: {
//       xs: string;
//       sm: string;
//       base: string;
//       lg: string;
//       xl: string;
//       "2xl": string;
//       "3xl": string;
//       "4xl": string;
//     };
//   };

//   // Layout and Structure (Enhanced)
//   enhancedLayout: {
//     containerWidth: "container" | "full" | "wide";
//     headerStyle: "fixed" | "static" | "transparent" | "minimal";
//     footerStyle: "simple" | "detailed" | "minimal" | "corporate";
//     sidebarEnabled: boolean;
//     breadcrumbsEnabled: boolean;
//     megaMenuEnabled: boolean;
//   };

//   // Homepage Components (Enhanced)
//   enhancedHomepage: {
//     heroSection: {
//       enabled: boolean;
//       style: "banner" | "video" | "slideshow" | "split" | "minimal";
//       backgroundImage: string;
//       backgroundVideo: string;
//       overlay: boolean;
//       overlayOpacity: number;
//       textAlignment: "left" | "center" | "right";
//       content: {
//         title: { ar: string; en: string };
//         subtitle: { ar: string; en: string };
//         ctaText: { ar: string; en: string };
//         ctaLink: string;
//       };
//     };

//     featuredProducts: {
//       enabled: boolean;
//       title: { ar: string; en: string };
//       limit: number;
//       layout: "grid" | "carousel" | "masonry";
//       columns: number;
//       showPrices: boolean;
//       showRatings: boolean;
//       showQuickView: boolean;
//     };

//     categories: {
//       enabled: boolean;
//       title: { ar: string; en: string };
//       style: "grid" | "carousel" | "list" | "tiles";
//       showImages: boolean;
//       showProductCount: boolean;
//       limit: number;
//     };

//     banners: {
//       enabled: boolean;
//       banners: Array<{
//         id: string;
//         image: string;
//         title: { ar: string; en: string };
//         description: { ar: string; en: string };
//         link: string;
//         position: "top" | "middle" | "bottom";
//       }>;
//     };

//     testimonials: {
//       enabled: boolean;
//       title: { ar: string; en: string };
//       testimonials: Array<{
//         id: string;
//         name: string;
//         rating: number;
//         comment: { ar: string; en: string };
//         avatar: string;
//         location: string;
//       }>;
//       layout: "carousel" | "grid";
//     };

//     newsletter: {
//       enabled: boolean;
//       title: { ar: string; en: string };
//       description: { ar: string; en: string };
//       placeholder: { ar: string; en: string };
//       buttonText: { ar: string; en: string };
//       style: "simple" | "popup" | "inline" | "footer";
//     };

//     aboutSection: {
//       enabled: boolean;
//       title: { ar: string; en: string };
//       content: { ar: string; en: string };
//       image: string;
//       features: Array<{
//         icon: string;
//         title: { ar: string; en: string };
//         description: { ar: string; en: string };
//       }>;
//     };
//   };

//   // Product Pages
//   productPage: {
//     layout: "sidebar" | "full-width" | "tabs";
//     imageGallery: {
//       style: "thumbnails" | "dots" | "stack" | "zoom";
//       showZoom: boolean;
//       showFullscreen: boolean;
//       showVideo: boolean;
//     };
//     productInfo: {
//       showSKU: boolean;
//       showAvailability: boolean;
//       showShipping: boolean;
//       showWishlist: boolean;
//       showCompare: boolean;
//       showShare: boolean;
//       showReviews: boolean;
//       showRelatedProducts: boolean;
//       showRecommendations: boolean;
//     };
//     reviews: {
//       enabled: boolean;
//       requirePurchase: boolean;
//       moderationEnabled: boolean;
//       allowPhotos: boolean;
//       showVerifiedBadge: boolean;
//     };
//   };

//   // Category Pages
//   categoryPage: {
//     layout: "sidebar" | "top-filters" | "no-filters";
//     productsPerPage: number;
//     gridColumns: number;
//     listView: boolean;
//     sortOptions: string[];
//     filters: {
//       priceRange: boolean;
//       brand: boolean;
//       color: boolean;
//       size: boolean;
//       rating: boolean;
//       availability: boolean;
//       customAttributes: boolean;
//     };
//     pagination: "numbers" | "loadMore" | "infinite";
//   };

//   // Shopping Cart
//   cart: {
//     style: "sidebar" | "page" | "popup";
//     showThumbnails: boolean;
//     showContinueShopping: boolean;
//     showShippingCalculator: boolean;
//     showCouponCode: boolean;
//     showEstimatedTotal: boolean;
//     saveForLater: boolean;
//     quickCheckout: boolean;
//   };

//   // Checkout Process
//   checkout: {
//     layout: "single-page" | "multi-step" | "accordion";
//     guestCheckout: boolean;
//     accountCreation: "required" | "optional" | "disabled";
//     addressValidation: boolean;
//     showOrderSummary: boolean;
//     showTrustBadges: boolean;
//     showSecurityInfo: boolean;
//     paymentMethods: {
//       cashOnDelivery: boolean;
//       bankTransfer: boolean;
//       creditCard: boolean;
//       digitalWallet: boolean;
//       installments: boolean;
//     };
//   };

//   // Order Tracking
//   orderTracking: {
//     enabled: boolean;
//     showMap: boolean;
//     showEstimatedDelivery: boolean;
//     emailNotifications: boolean;
//     smsNotifications: boolean;
//     statusSteps: Array<{
//       key: string;
//       title: { ar: string; en: string };
//       description: { ar: string; en: string };
//     }>;
//   };

//   // Static Pages
//   staticPages: {
//     aboutUs: {
//       enabled: boolean;
//       content: { ar: string; en: string };
//     };
//     privacyPolicy: {
//       enabled: boolean;
//       content: { ar: string; en: string };
//     };
//     termsOfService: {
//       enabled: boolean;
//       content: { ar: string; en: string };
//     };
//     returnPolicy: {
//       enabled: boolean;
//       content: { ar: string; en: string };
//     };
//     shippingInfo: {
//       enabled: boolean;
//       content: { ar: string; en: string };
//     };
//     faq: {
//       enabled: boolean;
//       faqs: Array<{
//         question: { ar: string; en: string };
//         answer: { ar: string; en: string };
//         category: string;
//       }>;
//     };
//     contactUs: {
//       enabled: boolean;
//       showMap: boolean;
//       showContactForm: boolean;
//       content: { ar: string; en: string };
//     };
//   };

//   // SEO Settings
//   seo: {
//     metaTitle: { ar: string; en: string };
//     metaDescription: { ar: string; en: string };
//     keywords: { ar: string[]; en: string[] };
//     ogImage: string;
//     structuredData: boolean;
//     sitemap: boolean;
//     robotsTxt: string;
//     analytics: {
//       googleAnalytics: string;
//       facebookPixel: string;
//       customCode: string;
//     };
//   };

//   // Social Media
//   social: {
//     enabled: boolean;
//     platforms: {
//       facebook: string;
//       instagram: string;
//       twitter: string;
//       youtube: string;
//       tiktok: string;
//       snapchat: string;
//       whatsapp: string;
//     };
//     showInHeader: boolean;
//     showInFooter: boolean;
//     socialLogin: boolean;
//     socialSharing: boolean;
//   };

//   // Advanced Features
//   advanced: {
//     multiLanguage: boolean;
//     multiCurrency: boolean;
//     darkMode: boolean;
//     rtlSupport: boolean;
//     pwa: boolean;
//     lazyLoading: boolean;
//     imageOptimization: boolean;
//     caching: boolean;
//     cdnEnabled: boolean;
//     customCSS: string;
//     customJS: string;
//   };
// }

// export interface EnhancedStoreTemplate {
//   id: string;
//   name: { ar: string; en: string };
//   description: { ar: string; en: string };
//   category: "modern" | "classic" | "minimal" | "bold" | "luxury" | "creative";
//   industry:
//     | "general"
//     | "fashion"
//     | "electronics"
//     | "food"
//     | "beauty"
//     | "sports"
//     | "books"
//     | "home";
//   preview: {
//     desktop: string;
//     tablet: string;
//     mobile: string;
//   };
//   thumbnail: string;
//   features: string[];
//   difficulty: "beginner" | "intermediate" | "advanced";
//   customization: StoreCustomization;
//   demoUrl: string;
//   isPremium: boolean;
//   price?: number;
// }

// export const enhancedStoreTemplates: EnhancedStoreTemplate[] = [
//   {
//     id: "modern-comprehensive",
//     name: { ar: "متجر شامل عصري", en: "Modern Comprehensive Store" },
//     description: {
//       ar: "قالب شامل وعصري مع جميع الميزات المتقدمة للتجارة الإلكترونية",
//       en: "Comprehensive modern template with all advanced e-commerce features",
//     },
//     category: "modern",
//     industry: "general",
//     preview: {
//       desktop: "/templates/modern-comprehensive/desktop.jpg",
//       tablet: "/templates/modern-comprehensive/tablet.jpg",
//       mobile: "/templates/modern-comprehensive/mobile.jpg",
//     },
//     thumbnail: "/templates/modern-comprehensive/thumb.jpg",
//     features: [
//       "responsive-design",
//       "seo-optimized",
//       "multi-language",
//       "advanced-filters",
//       "wishlist",
//       "quick-view",
//       "mega-menu",
//       "ajax-cart",
//       "product-zoom",
//       "reviews-system",
//       "newsletter",
//       "social-login",
//       "order-tracking",
//       "multi-payment",
//     ],
//     difficulty: "intermediate",
//     customization: {
//       // ⭐⭐ إضافة: النشاطات الفرعية إلى القالب
//       subBusinessTypes: [],

//       // ⭐ إضافة: النشاط الرئيسي
//       primaryBusinessType: "",
//       // الخصائص الجديدة
//       colors: {
//         primary: "#FF6B35",
//         secondary: "#4A90E2",
//         background: "#FFFFFF",
//         text: "#333333",
//         accent: "#F8F9FA",
//         headerBackground: "#FFFFFF",
//         footerBackground: "#F8F9FA",
//         cardBackground: "#FFFFFF",
//         borderColor: "#E5E5E5",
//       },
//       fonts: {
//         heading: "Cairo",
//         body: "Inter",
//         size: {
//           small: "0.875rem",
//           medium: "1rem",
//           large: "1.125rem",
//           xlarge: "1.25rem",
//         },
//       },
//       layout: {
//         headerStyle: "fixed",
//         footerStyle: "detailed",
//         productGridColumns: 4,
//         containerWidth: "1200px",
//         borderRadius: "medium",
//         spacing: "normal",
//       },
//       // في كائن القالب modern-comprehensive (حوالي السطر 491 و499)
//       homepage: {
//         showHeroSlider: true,
//         showFeaturedProducts: true,
//         showCategories: true,
//         showNewsletter: true,
//         // إضافة الخصائص الجديدة
//         showTestimonials: true, // إضافة
//         showStats: false, // إضافة
//         showBrands: true, // إضافة
//         heroImages: [],
//         heroTexts: [],
//         sectionsOrder: [], // ⭐ إضافة اختيارية
//       },
//       pages: {
//         enableBlog: false,
//         enableReviews: true,
//         enableWishlist: true,
//         enableCompare: false,
//         // إضافة الخصائص الجديدة
//         enableLiveChat: true, // إضافة
//         enableFAQ: true, // إضافة
//         enableAboutUs: true, // إضافة
//         enableContactUs: true, // إضافة
//       },

//       effects: {
//         animations: true,
//         gradients: true,
//         shadows: true,
//         transitions: true,
//       },

//       // الخصائص الأساسية
//       branding: {
//         logo: "",
//         favicon: "",
//         brandName: "",
//         brandDescription: { ar: "", en: "" },
//         brandColors: {
//           primary: "#FF6B35",
//           secondary: "#4A90E2",
//           accent: "#F8F9FA",
//           background: "#FFFFFF",
//           text: "#333333",
//           textSecondary: "#666666",
//           border: "#E5E5E5",
//           success: "#10B981",
//           warning: "#F59E0B",
//           error: "#EF4444",
//         },
//         showPoweredBy: true,
//         watermark: "",
//       },
//       typography: {
//         primaryFont: "Cairo",
//         secondaryFont: "Inter",
//         fontSizes: {
//           xs: "0.75rem",
//           sm: "0.875rem",
//           base: "1rem",
//           lg: "1.125rem",
//           xl: "1.25rem",
//           "2xl": "1.5rem",
//           "3xl": "1.875rem",
//           "4xl": "2.25rem",
//         },
//       },
//       enhancedLayout: {
//         containerWidth: "container",
//         headerStyle: "fixed",
//         footerStyle: "detailed",
//         sidebarEnabled: true,
//         breadcrumbsEnabled: true,
//         megaMenuEnabled: true,
//       },
//       enhancedHomepage: {
//         heroSection: {
//           enabled: true,
//           style: "slideshow",
//           backgroundImage: "",
//           backgroundVideo: "",
//           overlay: true,
//           overlayOpacity: 0.4,
//           textAlignment: "center",
//           content: {
//             title: { ar: "مرحباً بك في متجرنا", en: "Welcome to Our Store" },
//             subtitle: {
//               ar: "اكتشف أفضل المنتجات بأسعار مميزة",
//               en: "Discover the best products at amazing prices",
//             },
//             ctaText: { ar: "تسوق الآن", en: "Shop Now" },
//             ctaLink: "/products",
//           },
//         },
//         featuredProducts: {
//           enabled: true,
//           title: { ar: "المنتجات المميزة", en: "Featured Products" },
//           limit: 8,
//           layout: "grid",
//           columns: 4,
//           showPrices: true,
//           showRatings: true,
//           showQuickView: true,
//         },
//         categories: {
//           enabled: true,
//           title: { ar: "التصنيفات", en: "Categories" },
//           style: "grid",
//           showImages: true,
//           showProductCount: true,
//           limit: 6,
//         },
//         banners: {
//           enabled: true,
//           banners: [],
//         },
//         testimonials: {
//           enabled: true,
//           title: { ar: "آراء العملاء", en: "Customer Reviews" },
//           testimonials: [],
//           layout: "carousel",
//         },
//         newsletter: {
//           enabled: true,
//           title: {
//             ar: "اشترك في النشرة الإخبارية",
//             en: "Subscribe to Newsletter",
//           },
//           description: {
//             ar: "احصل على أحدث العروض والمنتجات",
//             en: "Get latest offers and products",
//           },
//           placeholder: { ar: "أدخل بريدك الإلكتروني", en: "Enter your email" },
//           buttonText: { ar: "اشتراك", en: "Subscribe" },
//           style: "inline",
//         },
//         aboutSection: {
//           enabled: true,
//           title: { ar: "عن متجرنا", en: "About Our Store" },
//           content: { ar: "", en: "" },
//           image: "",
//           features: [],
//         },
//       },
//       productPage: {
//         layout: "sidebar",
//         imageGallery: {
//           style: "thumbnails",
//           showZoom: true,
//           showFullscreen: true,
//           showVideo: true,
//         },
//         productInfo: {
//           showSKU: true,
//           showAvailability: true,
//           showShipping: true,
//           showWishlist: true,
//           showCompare: true,
//           showShare: true,
//           showReviews: true,
//           showRelatedProducts: true,
//           showRecommendations: true,
//         },
//         reviews: {
//           enabled: true,
//           requirePurchase: false,
//           moderationEnabled: true,
//           allowPhotos: true,
//           showVerifiedBadge: true,
//         },
//       },
//       categoryPage: {
//         layout: "sidebar",
//         productsPerPage: 20,
//         gridColumns: 4,
//         listView: true,
//         sortOptions: ["newest", "price-low", "price-high", "rating", "popular"],
//         filters: {
//           priceRange: true,
//           brand: true,
//           color: true,
//           size: true,
//           rating: true,
//           availability: true,
//           customAttributes: true,
//         },
//         pagination: "numbers",
//       },
//       cart: {
//         style: "sidebar",
//         showThumbnails: true,
//         showContinueShopping: true,
//         showShippingCalculator: true,
//         showCouponCode: true,
//         showEstimatedTotal: true,
//         saveForLater: true,
//         quickCheckout: true,
//       },
//       checkout: {
//         layout: "multi-step",
//         guestCheckout: true,
//         accountCreation: "optional",
//         addressValidation: true,
//         showOrderSummary: true,
//         showTrustBadges: true,
//         showSecurityInfo: true,
//         paymentMethods: {
//           cashOnDelivery: true,
//           bankTransfer: true,
//           creditCard: true,
//           digitalWallet: true,
//           installments: false,
//         },
//       },
//       orderTracking: {
//         enabled: true,
//         showMap: true,
//         showEstimatedDelivery: true,
//         emailNotifications: true,
//         smsNotifications: true,
//         statusSteps: [
//           {
//             key: "pending",
//             title: { ar: "قيد المراجعة", en: "Under Review" },
//             description: {
//               ar: "تم استلام طلبك وهو قيد المراجعة",
//               en: "Your order has been received and is under review",
//             },
//           },
//           {
//             key: "confirmed",
//             title: { ar: "تم التأكيد", en: "Confirmed" },
//             description: {
//               ar: "تم تأكيد طلبك وجاري التجهيز",
//               en: "Your order has been confirmed and is being prepared",
//             },
//           },
//           {
//             key: "shipped",
//             title: { ar: "تم الشحن", en: "Shipped" },
//             description: {
//               ar: "تم شحن طلبك وهو في الطريق إليك",
//               en: "Your order has been shipped and is on the way",
//             },
//           },
//           {
//             key: "delivered",
//             title: { ar: "تم التوصيل", en: "Delivered" },
//             description: {
//               ar: "تم توصيل طلبك بنجاح",
//               en: "Your order has been delivered successfully",
//             },
//           },
//         ],
//       },
//       staticPages: {
//         aboutUs: {
//           enabled: true,
//           content: { ar: "", en: "" },
//         },
//         privacyPolicy: {
//           enabled: true,
//           content: { ar: "", en: "" },
//         },
//         termsOfService: {
//           enabled: true,
//           content: { ar: "", en: "" },
//         },
//         returnPolicy: {
//           enabled: true,
//           content: { ar: "", en: "" },
//         },
//         shippingInfo: {
//           enabled: true,
//           content: { ar: "", en: "" },
//         },
//         faq: {
//           enabled: true,
//           faqs: [],
//         },
//         contactUs: {
//           enabled: true,
//           showMap: true,
//           showContactForm: true,
//           content: { ar: "", en: "" },
//         },
//       },
//       seo: {
//         metaTitle: { ar: "", en: "" },
//         metaDescription: { ar: "", en: "" },
//         keywords: { ar: [], en: [] },
//         ogImage: "",
//         structuredData: true,
//         sitemap: true,
//         robotsTxt: "",
//         analytics: {
//           googleAnalytics: "",
//           facebookPixel: "",
//           customCode: "",
//         },
//       },
//       social: {
//         enabled: true,
//         platforms: {
//           facebook: "",
//           instagram: "",
//           twitter: "",
//           youtube: "",
//           tiktok: "",
//           snapchat: "",
//           whatsapp: "",
//         },
//         showInHeader: true,
//         showInFooter: true,
//         socialLogin: true,
//         socialSharing: true,
//       },
//       advanced: {
//         multiLanguage: true,
//         multiCurrency: false,
//         darkMode: true,
//         rtlSupport: true,
//         pwa: true,
//         lazyLoading: true,
//         imageOptimization: true,
//         caching: true,
//         cdnEnabled: false,
//         customCSS: "",
//         customJS: "",
//       },
//     },
//     demoUrl: "/demo/modern-comprehensive",
//     isPremium: false,
//     price: 0,
//   },
//   // Additional templates would go here...
// ];

// // Template management functions
// export const getEnhancedTemplateById = (
//   id: string,
// ): EnhancedStoreTemplate | null => {
//   return enhancedStoreTemplates.find((template) => template.id === id) || null;
// };

// export const getTemplatesByIndustry = (
//   industry: string,
// ): EnhancedStoreTemplate[] => {
//   return enhancedStoreTemplates.filter(
//     (template) =>
//       template.industry === industry || template.industry === "general",
//   );
// };

// export const applyTemplateCustomization = (
//   baseTemplate: EnhancedStoreTemplate,
//   customization: Partial<StoreCustomization>,
// ): EnhancedStoreTemplate => {
//   return {
//     ...baseTemplate,
//     customization: {
//       ...baseTemplate.customization,
//       ...customization,
//     },
//   };
// };

// export const generateStoreCSS = (customization: StoreCustomization): string => {
//   const { branding, typography } = customization;

//   return `
//     :root {
//       /* Brand Colors */
//       --brand-primary: ${branding.brandColors.primary};
//       --brand-secondary: ${branding.brandColors.secondary};
//       --brand-accent: ${branding.brandColors.accent};
//       --brand-background: ${branding.brandColors.background};
//       --brand-text: ${branding.brandColors.text};
//       --brand-text-secondary: ${branding.brandColors.textSecondary};
//       --brand-border: ${branding.brandColors.border};
//       --brand-success: ${branding.brandColors.success};
//       --brand-warning: ${branding.brandColors.warning};
//       --brand-error: ${branding.brandColors.error};

//       /* Typography */
//       --font-primary: '${typography.primaryFont}', -apple-system, BlinkMacSystemFont, sans-serif;
//       --font-secondary: '${typography.secondaryFont}', -apple-system, BlinkMacSystemFont, sans-serif;
//       --font-size-xs: ${typography.fontSizes.xs};
//       --font-size-sm: ${typography.fontSizes.sm};
//       --font-size-base: ${typography.fontSizes.base};
//       --font-size-lg: ${typography.fontSizes.lg};
//       --font-size-xl: ${typography.fontSizes.xl};
//       --font-size-2xl: ${typography.fontSizes["2xl"]};
//       --font-size-3xl: ${typography.fontSizes["3xl"]};
//       --font-size-4xl: ${typography.fontSizes["4xl"]};
//     }

//     body {
//       font-family: var(--font-primary);
//       color: var(--brand-text);
//       background-color: var(--brand-background);
//       direction: ${customization.advanced.rtlSupport ? "rtl" : "ltr"};
//     }

//     .btn-primary {
//       background-color: var(--brand-primary);
//       border-color: var(--brand-primary);
//       color: white;
//     }

//     .btn-secondary {
//       background-color: var(--brand-secondary);
//       border-color: var(--brand-secondary);
//       color: white;
//     }

//     .text-primary {
//       color: var(--brand-primary) !important;
//     }

//     .bg-primary {
//       background-color: var(--brand-primary) !important;
//     }

//     .border-primary {
//       border-color: var(--brand-primary) !important;
//     }
//   `;
// };

// enhanced-templates.ts
// enhanced-templates.ts
import {
  StoreCustomizationEnhanced,
  StoreCustomizationBasic,
  BasicColors,
  BasicFonts,
  BasicHomepage,
  BasicPages,
  BasicLayout,
  createBasicCustomization,
} from "./types/store";

// تصدير النوع الاتحادي
export type StoreCustomization = StoreCustomizationEnhanced;

// إبقاء التعريف الأصلي للمكوّنات القديمة
export interface EnhancedStoreTemplate {
  id: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  category: "modern" | "classic" | "minimal" | "bold" | "luxury" | "creative";
  industry:
    | "general"
    | "fashion"
    | "electronics"
    | "food"
    | "beauty"
    | "sports"
    | "books"
    | "home";
  preview: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  thumbnail: string;
  features: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  customization: StoreCustomizationEnhanced; // تأكد أنه Enhanced
  demoUrl: string;
  isPremium: boolean;
  price?: number;
}

export const enhancedStoreTemplates: EnhancedStoreTemplate[] = [
  {
    id: "modern-comprehensive",
    name: { ar: "متجر شامل عصري", en: "Modern Comprehensive Store" },
    description: {
      ar: "قالب شامل وعصري مع جميع الميزات المتقدمة للتجارة الإلكترونية",
      en: "Comprehensive modern template with all advanced e-commerce features",
    },
    category: "modern",
    industry: "general",
    preview: {
      desktop: "/templates/modern-comprehensive/desktop.jpg",
      tablet: "/templates/modern-comprehensive/tablet.jpg",
      mobile: "/templates/modern-comprehensive/mobile.jpg",
    },
    thumbnail: "/templates/modern-comprehensive/thumb.jpg",
    features: [
      "responsive-design",
      "seo-optimized",
      "multi-language",
      "advanced-filters",
      "wishlist",
      "quick-view",
      "mega-menu",
      "ajax-cart",
      "product-zoom",
      "reviews-system",
      "newsletter",
      "social-login",
      "order-tracking",
      "multi-payment",
    ],
    difficulty: "intermediate",
    customization: {
      // الخصائص الأساسية من createBasicCustomization
      ...createBasicCustomization({
        colors: {
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
        fonts: {
          heading: "Cairo",
          body: "Inter",
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
          showTestimonials: true,
          showStats: false,
          showBrands: true,
          heroImages: [],
          heroTexts: [],
          sectionsOrder: [],
        },
        pages: {
          enableBlog: false,
          enableReviews: true,
          enableWishlist: true,
          enableCompare: false,
          enableLiveChat: true,
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
        branding: {
          logo: "",
          favicon: "",
        },
      }),

      branding: {
        logo: "",
        favicon: "",
        brandName: "",
        brandDescription: { ar: "", en: "" },
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
    },
    demoUrl: "/demo/modern-comprehensive",
    isPremium: false,
    price: 0,
  },

  // قالب إضافي كمثال
  {
    id: "minimal-elegant",
    name: { ar: "متجر أنيق بسيط", en: "Minimal Elegant Store" },
    description: {
      ar: "تصميم بسيط وأنيق يركز على تجربة المستخدم",
      en: "Simple and elegant design focused on user experience",
    },
    category: "minimal",
    industry: "general",
    preview: {
      desktop: "/templates/minimal-elegant/desktop.jpg",
      tablet: "/templates/minimal-elegant/tablet.jpg",
      mobile: "/templates/minimal-elegant/mobile.jpg",
    },
    thumbnail: "/templates/minimal-elegant/thumb.jpg",
    features: [
      "responsive-design",
      "seo-optimized",
      "clean-layout",
      "fast-loading",
      "minimal-design",
      "user-friendly",
    ],
    difficulty: "beginner",
    customization: {
      // الخصائص الأساسية
      ...createBasicCustomization({
        colors: {
          primary: "#2C3E50",
          secondary: "#7F8C8D",
          background: "#FFFFFF",
          text: "#2C3E50",
          accent: "#ECF0F1",
          headerBackground: "#FFFFFF",
          footerBackground: "#2C3E50",
          cardBackground: "#FFFFFF",
          borderColor: "#BDC3C7",
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
          headerStyle: "minimal",
          footerStyle: "simple",
          productGridColumns: 3,
          containerWidth: "1000px",
          borderRadius: "small",
          spacing: "compact",
        },
        homepage: {
          showHeroSlider: false,
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
          enableFAQ: true,
          enableAboutUs: true,
          enableContactUs: true,
        },
        effects: {
          animations: false,
          gradients: false,
          shadows: false,
          transitions: true,
        },
        branding: {
          logo: "",
          favicon: "",
        },
      }),

      branding: {
        logo: "",
        favicon: "",
        brandName: "",
        brandDescription: { ar: "", en: "" },
        brandColors: {
          primary: "#2C3E50",
          secondary: "#7F8C8D",
          accent: "#ECF0F1",
          background: "#FFFFFF",
          text: "#2C3E50",
          textSecondary: "#7F8C8D",
          border: "#BDC3C7",
          success: "#27AE60",
          warning: "#F39C12",
          error: "#E74C3C",
        },
        showPoweredBy: false,
        watermark: "",
      },

      typography: {
        primaryFont: "Cairo",
        secondaryFont: "Tajawal",
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
        headerStyle: "minimal",
        footerStyle: "minimal",
        sidebarEnabled: false,
        breadcrumbsEnabled: true,
        megaMenuEnabled: false,
      },

      enhancedHomepage: {
        heroSection: {
          enabled: false,
          style: "minimal",
          backgroundImage: "",
          backgroundVideo: "",
          overlay: false,
          overlayOpacity: 0,
          textAlignment: "center",
          content: {
            title: { ar: "", en: "" },
            subtitle: { ar: "", en: "" },
            ctaText: { ar: "", en: "" },
            ctaLink: "",
          },
        },
        featuredProducts: {
          enabled: true,
          title: { ar: "المنتجات المميزة", en: "Featured Products" },
          limit: 6,
          layout: "grid",
          columns: 3,
          showPrices: true,
          showRatings: true,
          showQuickView: false,
        },
        categories: {
          enabled: true,
          title: { ar: "التصنيفات", en: "Categories" },
          style: "grid",
          showImages: true,
          showProductCount: true,
          limit: 4,
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
            ar: "اشترك في النشرة",
            en: "Subscribe to Newsletter",
          },
          description: {
            ar: "ابقَ على اطلاع بأحدث المنتجات",
            en: "Stay updated with latest products",
          },
          placeholder: { ar: "البريد الإلكتروني", en: "Email" },
          buttonText: { ar: "اشتراك", en: "Subscribe" },
          style: "simple",
        },
        aboutSection: {
          enabled: false,
          title: { ar: "", en: "" },
          content: { ar: "", en: "" },
          image: "",
          features: [],
        },
      },

      // فقط الخصائpecs الأساسية للمكونات الأخرى
      productPage: {
        layout: "full-width",
        imageGallery: {
          style: "stack",
          showZoom: false,
          showFullscreen: true,
          showVideo: false,
        },
        productInfo: {
          showSKU: true,
          showAvailability: true,
          showShipping: true,
          showWishlist: true,
          showCompare: false,
          showShare: false,
          showReviews: true,
          showRelatedProducts: true,
          showRecommendations: false,
        },
        reviews: {
          enabled: true,
          requirePurchase: true,
          moderationEnabled: true,
          allowPhotos: false,
          showVerifiedBadge: true,
        },
      },

      categoryPage: {
        layout: "top-filters",
        productsPerPage: 12,
        gridColumns: 3,
        listView: false,
        sortOptions: ["newest", "price-low", "price-high"],
        filters: {
          priceRange: true,
          brand: false,
          color: true,
          size: true,
          rating: true,
          availability: false,
          customAttributes: false,
        },
        pagination: "loadMore",
      },

      cart: {
        style: "page",
        showThumbnails: true,
        showContinueShopping: true,
        showShippingCalculator: false,
        showCouponCode: true,
        showEstimatedTotal: true,
        saveForLater: false,
        quickCheckout: false,
      },

      checkout: {
        layout: "single-page",
        guestCheckout: true,
        accountCreation: "optional",
        addressValidation: false,
        showOrderSummary: true,
        showTrustBadges: false,
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
        enabled: false,
        showMap: false,
        showEstimatedDelivery: true,
        emailNotifications: true,
        smsNotifications: false,
        statusSteps: [],
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
          showMap: false,
          showContactForm: true,
          content: { ar: "", en: "" },
        },
      },

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
        showInHeader: false,
        showInFooter: true,
        socialLogin: false,
        socialSharing: true,
      },

      advanced: {
        multiLanguage: false,
        multiCurrency: false,
        darkMode: false,
        rtlSupport: true,
        pwa: false,
        lazyLoading: true,
        imageOptimization: true,
        caching: true,
        cdnEnabled: false,
        customCSS: "",
        customJS: "",
      },
    },
    demoUrl: "/demo/minimal-elegant",
    isPremium: false,
    price: 0,
  },
];

// Template management functions
export const getEnhancedTemplateById = (
  id: string,
): EnhancedStoreTemplate | null => {
  return enhancedStoreTemplates.find((template) => template.id === id) || null;
};

export const getTemplatesByIndustry = (
  industry: string,
): EnhancedStoreTemplate[] => {
  return enhancedStoreTemplates.filter(
    (template) =>
      template.industry === industry || template.industry === "general",
  );
};

export const applyTemplateCustomization = (
  baseTemplate: EnhancedStoreTemplate,
  customization: Partial<StoreCustomizationEnhanced>,
): EnhancedStoreTemplate => {
  return {
    ...baseTemplate,
    customization: {
      ...baseTemplate.customization,
      ...customization,
    },
  };
};

export const generateStoreCSS = (
  customization: StoreCustomizationEnhanced,
): string => {
  const { branding, typography } = customization;

  return `
    :root {
      /* Brand Colors */
      --brand-primary: ${branding.brandColors.primary};
      --brand-secondary: ${branding.brandColors.secondary};
      --brand-accent: ${branding.brandColors.accent};
      --brand-background: ${branding.brandColors.background};
      --brand-text: ${branding.brandColors.text};
      --brand-text-secondary: ${branding.brandColors.textSecondary};
      --brand-border: ${branding.brandColors.border};
      --brand-success: ${branding.brandColors.success};
      --brand-warning: ${branding.brandColors.warning};
      --brand-error: ${branding.brandColors.error};

      /* Typography */
      --font-primary: '${typography.primaryFont}', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-secondary: '${typography.secondaryFont}', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-size-xs: ${typography.fontSizes.xs};
      --font-size-sm: ${typography.fontSizes.sm};
      --font-size-base: ${typography.fontSizes.base};
      --font-size-lg: ${typography.fontSizes.lg};
      --font-size-xl: ${typography.fontSizes.xl};
      --font-size-2xl: ${typography.fontSizes["2xl"]};
      --font-size-3xl: ${typography.fontSizes["3xl"]};
      --font-size-4xl: ${typography.fontSizes["4xl"]};
    }

    body {
      font-family: var(--font-primary);
      color: var(--brand-text);
      background-color: var(--brand-background);
      direction: ${customization.advanced.rtlSupport ? "rtl" : "ltr"};
    }

    .btn-primary {
      background-color: var(--brand-primary);
      border-color: var(--brand-primary);
      color: white;
    }

    .btn-secondary {
      background-color: var(--brand-secondary);
      border-color: var(--brand-secondary);
      color: white;
    }

    .text-primary {
      color: var(--brand-primary) !important;
    }

    .bg-primary {
      background-color: var(--brand-primary) !important;
    }

    .border-primary {
      border-color: var(--brand-primary) !important;
    }
  `;
};

// وظيفة لتحويل التخصيص الموسع إلى أساسي للاستخدام في store-approval-system
export function toBasicCustomization(
  enhanced: StoreCustomizationEnhanced,
): StoreCustomizationEnhanced {
  // هذه الوظيفة تحول التخصيص الموسع إلى نسخة تتوافق مع النوع الأساسي
  // مع الاحتفاظ بالخواص الموسعة
  return enhanced;
}
