// import {
//   collection,
//   doc,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   getDoc,
//   getDocs,
//   getCountFromServer, // ✅ إضافة هذا
//   query,
//   where,
//   orderBy,
//   limit,
//   startAfter,
//   Timestamp,
//   QueryDocumentSnapshot,
//   DocumentData,
//   writeBatch,
//   setDoc,
//   serverTimestamp,
//   getFirestore,
// } from "firebase/firestore";
// import {
//   ref,
//   uploadBytes,
//   getDownloadURL,
//   deleteObject,
// } from "firebase/storage";
// import app, { auth, db, storage } from "./firebase";
// import {
//   BusinessActivities,
//   ensureEnhancedCustomization,
//   StoreCustomizationEnhanced as StoreCustomization,
//   StoreCustomizationEnhanced,
// } from "./types/store";
// import { ExtendedStore } from "@/pages/merchant/merchant-dashboard/types";

// // استيراد التعريفات من enhanced-templates

// // ============ الواجهات المساعدة ============

// export interface SocialMedia {
//   whatsapp?: string;
//   instagram?: string;
//   twitter?: string;
//   snapchat?: string;
//   tiktok?: string;
//   facebook?: string;
//   youtube?: string;
//   linkedin?: string;
// }

// // ============ قاموس التوافق بين الأنشطة ============

// export const ACTIVITY_COMPATIBILITY_MAP: Record<string, string[]> = {
//   // 🌱 الأنشطة الزراعية ومشتقاتها
//   agriculture: [
//     "agriculture",
//     "agricultural",
//     "agricultural-products",
//     "seeds-fertilizers",
//     "livestock",
//     "fisheries",
//     "agricultural-tools",
//   ],

//   // 🍔 الطعام والمشروبات
//   food: [
//     "food",
//     "food-beverages",
//     "restaurant",
//     "cafe",
//     "bakery",
//     "grocery",
//     "butcher",
//     "spices",
//     "food_processing",
//     "food-delivery",
//   ],

//   // 👕 الأزياء والملابس
//   fashion: [
//     "fashion",
//     "fashion-clothing",
//     "mens-fashion",
//     "womens-fashion",
//     "kids-fashion",
//     "yemeni-dress",
//     "clothing",
//     "apparel",
//   ],

//   // 📱 الإلكترونيات
//   electronics: [
//     "electronics",
//     "mobiles",
//     "laptops",
//     "home-appliances",
//     "tv",
//     "gaming",
//     "solar-energy",
//     "tech",
//     "gadgets",
//   ],

//   // 🏡 المنزل والحديقة
//   "home-garden": [
//     "home-garden",
//     "furniture",
//     "home-decor",
//     "kitchen",
//     "garden-tools",
//     "lighting",
//     "carpets",
//     "home",
//     "garden",
//   ],

//   // 💄 الصحة والجمال
//   cosmetics: [
//     "health-beauty",
//     "cosmetics",
//     "skincare",
//     "perfumes",
//     "hair-care",
//     "makeup",
//     "medical-supplies",
//     "beauty",
//     "health",
//   ],

//   // 📚 الكتب
//   books: ["books", "stationery", "education", "publishing"],

//   // ⚽ الرياضة
//   sports: ["sports", "fitness", "outdoors", "recreation"],

//   // 🧸 الألعاب
//   toys: ["toys", "games", "children", "hobbies"],

//   // 🚗 السيارات
//   automotive: ["automotive", "cars", "vehicles", "auto-parts"],

//   // 💍 المجوهرات
//   jewelry: ["jewelry", "watches", "accessories", "luxury"],

//   // 🐟 الثروة السمكية
//   fisheries: ["fisheries", "fish", "seafood", "marine"],
// };

// // 🔍 دالة مساعدة للتحقق من التوافق
// export const checkActivityCompatibility = (
//   productActivity: string,
//   storeActivities: string[],
// ): boolean => {
//   if (!productActivity || storeActivities.length === 0) return true;

//   // البحث عن المجموعة التي ينتمي إليها نشاط المنتج
//   for (const [mainActivity, compatibleActivities] of Object.entries(
//     ACTIVITY_COMPATIBILITY_MAP,
//   )) {
//     if (compatibleActivities.includes(productActivity)) {
//       // التحقق إذا كان المتجر لديه أي من الأنشطة المتوافقة
//       const isCompatible = storeActivities.some((storeActivity) =>
//         compatibleActivities.some(
//           (compatibleActivity) =>
//             storeActivity
//               .toLowerCase()
//               .includes(compatibleActivity.toLowerCase()) ||
//             compatibleActivity
//               .toLowerCase()
//               .includes(storeActivity.toLowerCase()),
//         ),
//       );

//       if (isCompatible) {
//         console.log(`✅ نشاط متوافق: ${productActivity} → ${mainActivity}`);
//         return true;
//       }
//     }
//   }

//   // البحث المباشر
//   const directMatch = storeActivities.some(
//     (storeActivity) =>
//       storeActivity.toLowerCase().includes(productActivity.toLowerCase()) ||
//       productActivity.toLowerCase().includes(storeActivity.toLowerCase()),
//   );

//   return directMatch;
// };

// // ============ الطبقة الجديدة: Product Semantics Layer ============

// export interface ProductType {
//   id: string;
//   name: string;
//   description?: string;
//   activityId: string;
//   keywords: string[];
//   rules?: {
//     requiredFields?: string[];
//     validationRules?: Record<string, any>;
//     complianceRules?: Record<string, any>;
//     allowedCategories?: string[];
//   };
//   metadata?: {
//     isSensitive?: boolean; // منتج حساس
//     requiresLicense?: boolean; // يحتاج ترخيص
//     description?: string; // وصف للنوع
//     icon?: string; // أيقونة للنوع
//   };
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// // ✅ نتيجة كشف نوع المنتج
// export interface ProductTypeDetection {
//   productType: ProductType | null;
//   confidence: number; // 0-1
//   method: DetectionMethod;
//   matchedKeywords: string[];
//   suggestedCategories?: string[];
// }

// export interface ComplianceFlag {
//   id: string;
//   storeId: string;
//   productId: string;
//   issueType:
//     | "activity_mismatch"
//     | "missing_fields"
//     | "price_violation"
//     | "content_violation";
//   severity: "low" | "medium" | "high" | "critical";
//   details: any;
//   status: "pending" | "reviewed" | "resolved" | "ignored";
//   assignedTo?: string;
//   resolvedAt?: Date;
//   createdAt: Date;
//   updatedAt: Date;
// }

// // ============ مجموعة أنواع المنتجات الافتراضية ============

// // ============ قاعدة بيانات أنواع المنتجات ============

// export const DEFAULT_PRODUCT_TYPES: ProductType[] = [
//   {
//     id: "pt_electronics_001",
//     name: "هواتف محمولة",
//     activityId: "electronics",
//     keywords: [
//       "هاتف",
//       "جوال",
//       "موبايل",
//       "سمارت فون",
//       "أيفون",
//       "سامسونج",
//       "شاومي",
//       "ريدمي",
//       "نوكيا",
//       "أوبو",
//       "فيفو",
//       "ريلمي",
//       "هواوي",
//       "شاحن",
//       "سماعات",
//       "كابل",
//       "جراب",
//       "حافظة",
//     ],
//     rules: {
//       requiredFields: ["imei", "warranty_period", "storage_capacity", "ram"],
//       allowedCategories: ["هواتف", "إلكترونيات", "تكنولوجيا", "اكسسوارات"],
//     },
//     metadata: {
//       isSensitive: false,
//       requiresLicense: false,
//       description: "الهواتف المحمولة والأجهزة الذكية والاكسسوارات",
//       icon: "📱",
//     },
//   },
//   {
//     id: "pt_clothing_002",
//     name: "ملابس",
//     activityId: "fashion",
//     keywords: [
//       "قميص",
//       "بنطال",
//       "فستان",
//       "عباية",
//       "حجاب",
//       "ملابس",
//       "تيشرت",
//       "جاكيت",
//       "كارديجان",
//       "بلوزة",
//       "تنورة",
//       "سروال",
//       "شورت",
//       "ملابس داخلية",
//       "بيجاما",
//       "بدلة",
//       "كاجوال",
//       "رياضي",
//     ],
//     rules: {
//       requiredFields: ["size", "color", "material", "care_instructions"],
//       allowedCategories: [
//         "ملابس",
//         "أزياء",
//         "موضة",
//         "ملابس نسائية",
//         "ملابس رجالية",
//       ],
//     },
//     metadata: {
//       isSensitive: false,
//       requiresLicense: false,
//       description: "الملابس بأنواعها المختلفة",
//       icon: "👕",
//     },
//   },
//   {
//     id: "pt_food_003",
//     name: "طعام ومشروبات",
//     activityId: "food",
//     keywords: [
//       "طعام",
//       "أكل",
//       "وجبة",
//       "مطعم",
//       "بيتزا",
//       "برجر",
//       "ساندويتش",
//       "حلويات",
//       "معجنات",
//       "مشروبات",
//       "عصير",
//       "قهوة",
//       "شاي",
//       "سفري",
//       "تيك أواي",
//       "توصيل",
//       "مشويات",
//       "أرز",
//       "معكرونة",
//     ],
//     rules: {
//       requiredFields: [
//         "expiry_date",
//         "ingredients",
//         "weight",
//         "storage_instructions",
//       ],
//       allowedCategories: ["طعام", "مأكولات", "مشروبات", "حلويات", "مخبوزات"],
//     },
//     metadata: {
//       isSensitive: true,
//       requiresLicense: true,
//       description: "المنتجات الغذائية والمشروبات (تتطلب تراخيص صحية)",
//       icon: "🍔",
//     },
//   },
//   {
//     id: "pt_cosmetics_004",
//     name: "مستحضرات تجميل",
//     activityId: "cosmetics",
//     keywords: [
//       "مكياج",
//       "كريم",
//       "مستحضر",
//       "تجميل",
//       "عطر",
//       "بارفان",
//       "شامبو",
//       "بلسم",
//       "سيروم",
//       "تونر",
//       "ماسك",
//       "مقشر",
//       "مرطب",
//       "واقي شمس",
//       "أحمر شفاه",
//       "آيلاينر",
//       "ماسكرا",
//       "ظل عيون",
//       "بودرة",
//     ],
//     rules: {
//       requiredFields: [
//         "ingredients",
//         "expiry_date",
//         "skin_type",
//         "usage_instructions",
//       ],
//       allowedCategories: [
//         "مستحضرات تجميل",
//         "عناية بالبشرة",
//         "عطور",
//         "عناية بالشعر",
//       ],
//     },
//     metadata: {
//       isSensitive: true,
//       requiresLicense: true,
//       description: "مستحضرات التجميل والعناية الشخصية",
//       icon: "💄",
//     },
//   },
//   {
//     id: "pt_furniture_005",
//     name: "أثاث منزلي",
//     activityId: "furniture",
//     keywords: [
//       "أريكة",
//       "طاولة",
//       "كرسي",
//       "سرير",
//       "خزانة",
//       "رف",
//       "دولاب",
//       "كنبة",
//       "مقعد",
//       "منضدة",
//       "طاولة طعام",
//       "طاولة مكتب",
//       "رف كتب",
//       "مكتب",
//       "سجادة",
//       "ستائر",
//       "إضاءة",
//       "لمبة",
//       "ثريات",
//     ],
//     rules: {
//       requiredFields: ["dimensions", "material", "weight", "assembly_required"],
//       allowedCategories: ["أثاث", "ديكور", "منزل", "مكتب", "حديقة"],
//     },
//     metadata: {
//       isSensitive: false,
//       requiresLicense: false,
//       description: "الأثاث المنزلي والمكتبي",
//       icon: "🛋️",
//     },
//   },
//   {
//     id: "pt_books_006",
//     name: "كتب وقرطاسية",
//     activityId: "books",
//     keywords: [
//       "كتاب",
//       "رواية",
//       "قصة",
//       "مجلة",
//       "دفتر",
//       "قلم",
//       "ممحاة",
//       "مسطرة",
//       "مقص",
//       "غراء",
//       "ألوان",
//       "فرشاة",
//       "ورق",
//       "طباعة",
//       "تغليف",
//       "هدايا",
//       "بطاقات",
//       "مذكرات",
//       "تقويم",
//     ],
//     rules: {
//       requiredFields: ["author", "publisher", "pages", "language"],
//       allowedCategories: ["كتب", "قرطاسية", "أدوات مكتبية", "تعليم", "ثقافة"],
//     },
//     metadata: {
//       isSensitive: false,
//       requiresLicense: false,
//       description: "الكتب والمواد القرطاسية",
//       icon: "📚",
//     },
//   },
//   {
//     id: "pt_sports_007",
//     name: "معدات رياضية",
//     activityId: "sports",
//     keywords: [
//       "كرة",
//       "حذاء رياضي",
//       "ملابس رياضية",
//       "معدات",
//       "أوزان",
//       "دراجة",
//       "سكوتر",
//       "زلاجة",
//       "تزلج",
//       "سباحة",
//       "غطس",
//       "مشد",
//       "حبل قفز",
//       "يوجا",
//       "بيلاتس",
//       "كروس فت",
//       "لياقة",
//       "تمارين",
//     ],
//     rules: {
//       requiredFields: ["weight", "material", "usage", "safety_instructions"],
//       allowedCategories: ["رياضة", "لياقة", "ألعاب", "هوايات"],
//     },
//     metadata: {
//       isSensitive: false,
//       requiresLicense: false,
//       description: "المعدات الرياضية وأدوات اللياقة",
//       icon: "⚽",
//     },
//   },
//   {
//     id: "pt_toys_008",
//     name: "ألعاب أطفال",
//     activityId: "toys",
//     keywords: [
//       "لعبة",
//       "دمية",
//       "سيارة",
//       "قطار",
//       "ليجو",
//       "بازل",
//       "ألعاب تعليمية",
//       "ألعاب إلكترونية",
//       "ألعاب فيديو",
//       "كونسول",
//       "عربة",
//       "مشاية",
//       "أرجوحة",
//       "زلاجة",
//       "دراجة أطفال",
//       "حضانة",
//       "مستلزمات أطفال",
//     ],
//     rules: {
//       requiredFields: [
//         "age_range",
//         "safety_warnings",
//         "material",
//         "battery_required",
//       ],
//       allowedCategories: ["ألعاب", "أطفال", "ترفيه", "تعليم"],
//     },
//     metadata: {
//       isSensitive: true,
//       requiresLicense: true,
//       description: "ألعاب الأطفال (تتطلب شهادات سلامة)",
//       icon: "🧸",
//     },
//   },
//   {
//     id: "pt_automotive_009",
//     name: "قطع سيارات",
//     activityId: "automotive",
//     keywords: [
//       "إطار",
//       "بطارية",
//       "زيت",
//       "فلتر",
//       "فرامل",
//       "شمعات",
//       "محرك",
//       "عجلة",
//       "مقعد",
//       "مرآة",
//       "مكيف",
//       "راديو",
//       "سماعات",
//       "إضاءة",
//       "مصابيح",
//       "صدام",
//       "طلاء",
//       "تنظيف",
//       "صيانة",
//       "اكسسوارات",
//     ],
//     rules: {
//       requiredFields: ["car_model", "year", "part_number", "warranty"],
//       allowedCategories: ["سيارات", "قطع غيار", "اكسسوارات", "صيانة"],
//     },
//     metadata: {
//       isSensitive: false,
//       requiresLicense: true,
//       description: "قطع غيار واكسسوارات السيارات",
//       icon: "🚗",
//     },
//   },
//   {
//     id: "pt_jewelry_010",
//     name: "مجوهرات وإكسسوارات",
//     activityId: "jewelry",
//     keywords: [
//       "ساعة",
//       "سوار",
//       "خاتم",
//       "قلادة",
//       "أقراط",
//       "دبلة",
//       "أساور",
//       "سلاسل",
//       "أحجار كريمة",
//       "ذهب",
//       "فضة",
//       "ماس",
//       "لؤلؤ",
//       "كريستال",
//       "إكسسوارات",
//       "نظارات",
//       "حقائب",
//       "أحزمة",
//     ],
//     rules: {
//       requiredFields: ["material", "karat", "weight", "gem_type"],
//       allowedCategories: ["مجوهرات", "إكسسوارات", "ساعات", "حقائب"],
//     },
//     metadata: {
//       isSensitive: true,
//       requiresLicense: true,
//       description: "المجوهرات والإكسسوارات الثمينة",
//       icon: "💍",
//     },
//   },
//   // أضف هذه الأنواع الزراعية بعد الأنواع الحالية:

//   // أضف هذه الأنواع الزراعية
//   {
//     id: "pt_agriculture_011",
//     name: "منتجات زراعية وبذور",
//     activityId: "agriculture",
//     keywords: [
//       "سماد",
//       "بذور",
//       "زراعة",
//       "نبات",
//       "شجرة",
//       "فاكهة",
//       "خضروات",
//       "محصول",
//       "ري",
//       "تربة",
//       "مبيد",
//       "اسمدة",
//       "زراعي",
//       "فلاحة",
//       "ثمار",
//       "حبوب",
//       "قمح",
//       "شعير",
//       "ذرة",
//       "أرز",
//       "قطن",
//       "زيتون",
//       "تمور",
//       "عسل",
//       "بيوت محمية",
//       "صوبات",
//       "شبكة ري",
//       "منتجات عضوية",
//       "شتلات",
//       "أسمدة كيماوية",
//       "أسمدة طبيعية",
//       "محلول مغذي",
//       "مبيدات حشرية",
//       "مبيدات فطرية",
//       "أدوات زراعية",
//       "معول",
//       "مجرفة",
//       "منجل",
//       "محراث",
//     ],
//     rules: {
//       requiredFields: ["expiry_date", "weight", "usage_instructions", "type"],
//       allowedCategories: [
//         "زراعة",
//         "حدائق",
//         "نباتات",
//         "زراعي",
//         "بستنة",
//         "فلاحة",
//       ],
//     },
//     metadata: {
//       isSensitive: false,
//       requiresLicense: true,
//       description: "منتجات زراعية، بذور، أسمدة، مبيدات، أدوات زراعية",
//       icon: "🌱",
//     },
//   },

//   {
//     id: "pt_livestock_012",
//     name: "ثروة حيوانية ولحوم",
//     activityId: "livestock",
//     keywords: [
//       "لحم",
//       "لحوم",
//       "دجاج",
//       "بيض",
//       "حليب",
//       "ألبان",
//       "أجبان",
//       "أسماك",
//       "مأكولات بحرية",
//       "طيور",
//       "خراف",
//       "ماعز",
//       "أبقار",
//       "جمال",
//       "عسل",
//       "نحل",
//       "مزارع",
//       "تسمين",
//       "ذبح",
//       "تجهيز",
//       "أعلاف",
//       "تبن",
//       "شعير",
//       "ذرة",
//       "علف",
//       "مكملات علفية",
//       "فيتامينات حيوانية",
//       "مستلزمات حيوانات",
//       "أقفاص",
//       "سلال",
//       "مسالخ",
//     ],
//     rules: {
//       requiredFields: ["expiry_date", "weight", "storage_temp", "source"],
//       allowedCategories: ["لحوم", "دواجن", "أسماك", "ألبان", "ثروة حيوانية"],
//     },
//     metadata: {
//       isSensitive: true,
//       requiresLicense: true,
//       description: "منتجات الثروة الحيوانية، لحوم، ألبان، أعلاف",
//       icon: "🐄",
//     },
//   },

//   {
//     id: "pt_food_processing_013",
//     name: "تصنيع غذائي",
//     activityId: "food_processing",
//     keywords: [
//       "تعليب",
//       "تغليف",
//       "تعبئة",
//       "تحميص",
//       "طحن",
//       "عصير",
//       "مركزات",
//       "مربى",
//       "مخلل",
//       "معجون",
//       "صلصة",
//       "بهارات",
//       "توابل",
//       "بهار",
//       "كركم",
//       "زعفران",
//       "قهوة",
//       "شاي",
//       "سكر",
//       "ملح",
//       "دقيق",
//       "زيت",
//       "سمن",
//       "حلاوة",
//       "طحينة",
//       "مكسرات",
//       "فواكه مجففة",
//       "تمور معبأة",
//       "عسل معبأ",
//     ],
//     rules: {
//       requiredFields: [
//         "expiry_date",
//         "manufacturing_date",
//         "batch_number",
//         "ingredients",
//       ],
//       allowedCategories: ["تصنيع غذائي", "مواد غذائية", "معلبات", "مشروبات"],
//     },
//     metadata: {
//       isSensitive: true,
//       requiresLicense: true,
//       description: "منتجات التصنيع الغذائي، تعليب، تغليف، معالجة",
//       icon: "🏭",
//     },
//   },

//   {
//     id: "pt_fisheries_014",
//     name: "صيد وأسماك",
//     activityId: "fisheries",
//     keywords: [
//       "سمك",
//       "أسماك",
//       "مأكولات بحرية",
//       "جمبري",
//       "روبيان",
//       "كابوريا",
//       "محار",
//       "صدف",
//       "أخطبوط",
//       "حبار",
//       "قريدس",
//       "سلمون",
//       "تونة",
//       "سردين",
//       "ماكريل",
//       "صيد",
//       "شباك",
//       "صنارة",
//       "قارب",
//       "ثلاجات سمك",
//       "تجميد",
//       "تبريد",
//       "مزارع سمكية",
//       "أقفاص سمك",
//     ],
//     rules: {
//       requiredFields: ["catch_date", "weight", "storage_temp", "origin"],
//       allowedCategories: ["أسماك", "مأكولات بحرية", "صيد", "مزارع سمكية"],
//     },
//     metadata: {
//       isSensitive: true,
//       requiresLicense: true,
//       description: "منتجات الصيد والأسماك والمأكولات البحرية",
//       icon: "🐟",
//     },
//   },
// ];

// // ============ مناطق الشحن ============

// export interface ShippingZone {
//   id: string;
//   name: string;
//   governorates: string[];
//   cost: number;
//   estimatedDays: string;
//   enabled: boolean;
// }

// export interface ShippingMethod {
//   id: string;
//   name: string;
//   cost: number;
//   days: string;
//   enabled: boolean;
// }

// // export interface ShippingAddress {
// //   street: string;
// //   city: string;
// //   state: string;
// //   governorate?: string;
// //   zipCode: string;
// //   country: string;
// // }

// // ============ نظام قرارات الامتثال ============

// export enum ComplianceDecision {
//   ALLOW = "allow",
//   REVIEW_REQUIRED = "review_required",
//   BLOCK = "block",
// }

// export enum ProductStatus {
//   DRAFT = "draft",
//   ACTIVE = "active",
//   INACTIVE = "inactive",
//   UNDER_REVIEW = "under_review",
//   SUSPENDED = "suspended",
// }

// export enum ComplianceStatus {
//   COMPLIANT = "compliant",
//   NON_COMPLIANT = "non_compliant",
//   PENDING_REVIEW = "pending_review",
//   EXEMPTED = "exempted",
// }

// export enum DetectionMethod {
//   AI = "ai",
//   RULES = "rules",
//   PATTERN = "pattern", // ✅ أضف هذا
//   MANUAL = "manual",
//   HYBRID = "hybrid",
//   NONE = "none",
//   KIND_BASED = "kind_based",
// }

// export interface ProductSemantics {
//   productTypeId?: string;
//   detectedActivity?: string;
//   confidenceScore: number;
//   complianceStatus: ComplianceStatus;
//   metadata?: {
//     isSensitive?: boolean;
//     requiresLicense?: boolean;
//     flags?: string[];
//   };
//   detectionMethod: DetectionMethod;
//   lastDetection?: Date;
//   detectionLog?: Array<{
//     timestamp: Date;
//     method: DetectionMethod;
//     confidence: number;
//     activity: string;
//   }>;
//   validationFlags?: string[];
//   reviewedBy?: string;
//   reviewedAt?: Date;
//   exemptionReason?: string;
//   shadowActions?: {
//     hideFromStore?: boolean;
//     hideFromSearch?: boolean;
//     limitPurchase?: boolean;
//   };
// }

// // ============ نتيجة التحقق من الامتثال ============

// export interface ComplianceCheckResult {
//   decision: ComplianceDecision;
//   complianceStatus: ComplianceStatus;
//   productStatus: ProductStatus;
//   violations: string[];
//   warnings: string[];
//   shadowActions?: {
//     hideFromStore?: boolean;
//     hideFromSearch?: boolean;
//     limitPurchase?: boolean;
//   };
//   requiredFields?: string[];
//   suggestedActions: string[];
// }

// // ============ واجهة Store الرئيسية المحدثة ============

// // في واجهة Store، أضف هذه الحقول بعد الحقل `complianceStats`:

// export interface Store {
//   id: string;
//   ownerId: string;
//   name: string;
//   description: string;
//   logo: string;
//   subdomain: string;
//   customDomain?: string;
//   template: string;
//   industry?: string;

//   businessActivities?: BusinessActivities;

//   complianceSettings?: {
//     autoDetection: boolean; // الكشف التلقائي للنوع
//     strictMode: boolean; // وضع صارم
//     notifyOnViolation: boolean; // إشعار بالمخالفات
//     allowedDeviations?: string[]; // انحرافات مسموحة
//     reviewThreshold?: number; // حد المراجعة
//   };

//   currency?: string;
//   timezone?: string;
//   language?: string;

//   taxNumber?: string;
//   commercialRegistration?: string;

//   customization: StoreCustomization;

//   settings: {
//     currency: string;
//     language: string;
//     timezone?: string;

//     notifications?: {
//       emailNotifications: boolean;
//       pushNotifications: boolean;
//       smsNotifications: boolean;
//     };

//     shipping: {
//       enabled: boolean;
//       freeShippingThreshold: number;
//       shippingCost: number;
//       defaultCost?: number;
//       zones?: ShippingZone[];
//       methods?: ShippingMethod[];
//     };

//     payment: {
//       cashOnDelivery: boolean;
//       bankTransfer: boolean;
//       creditCard: boolean;
//       paypal?: boolean;
//       stripe?: boolean;
//       mada?: boolean;
//       mobileWallet?: boolean;
//       bankInfo?: {
//         bankName: string;
//         accountNumber: string;
//         accountName: string;
//         iban?: string;
//         swiftCode?: string;
//       };
//     };

//     taxes?: {
//       enabled: boolean;
//       includeInPrice: boolean;
//       rate: number;
//     };
//   };

//   contact: {
//     phone: string;
//     email: string;
//     address: string;
//     city: string;
//     governorate?: string;
//     country?: string;
//     zipCode?: string;
//     originalCity?: string;
//   };

//   socialMedia?: SocialMedia;

//   complianceStats?: {
//     totalProducts: number;
//     compliantProducts: number;
//     flaggedProducts: number;
//     lastCheck: Date;
//     complianceRate: number;
//   };

//   // 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥
//   // إضافة الحقول الجديدة لنظام الامتثال التدريجي
//   checklist?: {
//     addProduct: boolean;
//     addCategories: boolean;
//     enableShipping: boolean;
//     enablePayment: boolean;
//     verification: boolean;
//     customDomain: boolean;
//     seoOptimization: boolean;
//   };

//   complianceLevel?: "basic" | "intermediate" | "advanced";
//   legalStatus?: "unverified" | "pending" | "verified";
//   riskScore?: number; // درجة المخاطر من 0-100
//   // 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥 🔥

//   status: "pending" | "active" | "suspended" | "under_review";
//   createdAt: Date;
//   updatedAt: Date;
// }

// // ============ واجهات جديدة مبسطة ============
// export interface ShippingAddress {
//   street: string;
//   city: string;
//   district: string;
//   state: string;
//   governorate: string;
//   zipCode: string;
//   country: string;
// }

// export interface Customer {
//   uid: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   phone?: string;
//   shippingAddress?: ShippingAddress;
//   lastOrderAt?: Date;
//   lastVisit: Date;
//   firstVisit: Date;
//   isActive: boolean;
//   storeId: string; // 🔥 الجديد
// }

// // في واجهة StoreCustomer في firestore.ts
// export interface StoreCustomer extends Customer {
//   id: string;
//   totalOrders?: number;
//   totalSpent?: number;
//   notes?: string;
//   isVerified?: boolean; // ✅ أضف هذا السطر
// }

// // ============ الأنواع الأساسية الأربعة (Top-Level Product Kinds) ============

// // ============ الأنواع الأساسية الأربعة (Product Kinds) ============

// export enum ProductKind {
//   PHYSICAL = "physical",
//   SERVICE = "service",
//   FOOD = "food",
//   DIGITAL = "digital",
// }

// export interface ProductKindInfo {
//   id: ProductKind;
//   name: string;
//   description: string;
//   icon: string;
//   color: string;
//   requires: {
//     inventory: boolean;
//     shipping: boolean;
//     dimensions: boolean;
//     weight: boolean;
//     expiryDate: boolean;
//     digitalDelivery: boolean;
//     customerContact: boolean;
//     complianceLevel: "low" | "medium" | "high";
//   };
//   suggestedActivities: string[];
//   validationRules: {
//     minPrice?: number;
//     maxPrice?: number;
//     requireImages: boolean;
//     minDescriptionLength: number;
//   };
// }

// export const PRODUCT_KINDS: Record<ProductKind, ProductKindInfo> = {
//   [ProductKind.PHYSICAL]: {
//     id: ProductKind.PHYSICAL,
//     name: "منتج ملموس",
//     description:
//       "منتجات جاهزة يمكن شحنها أو استلامها يدويًا (ملابس، أجهزة، أدوات منزلية)",
//     icon: "📦",
//     color: "blue",
//     requires: {
//       inventory: true,
//       shipping: true,
//       dimensions: true,
//       weight: true,
//       expiryDate: false,
//       digitalDelivery: false,
//       customerContact: false,
//       complianceLevel: "medium",
//     },
//     suggestedActivities: [
//       "electronics",
//       "fashion",
//       "furniture",
//       "automotive",
//       "toys",
//       "jewelry",
//       "home_goods",
//       "home-garden",
//       "sports",
//       "books",
//       "agriculture", // ✅ أضف هذا
//       "livestock", // ✅ أضف هذا
//       "fisheries", // ✅ أضف هذا
//     ],
//     validationRules: {
//       requireImages: true,
//       minDescriptionLength: 50,
//     },
//   },
//   [ProductKind.SERVICE]: {
//     id: ProductKind.SERVICE,
//     name: "خدمة حسب الطلب",
//     description: "خدمة تُنفّذ بعد الطلب (تصميم، كتابة، صيانة، طباعة، تدريب)",
//     icon: "🔧",
//     color: "purple",
//     requires: {
//       inventory: false,
//       shipping: false,
//       dimensions: false,
//       weight: false,
//       expiryDate: false,
//       digitalDelivery: true,
//       customerContact: true,
//       complianceLevel: "low",
//     },
//     suggestedActivities: [
//       "design",
//       "writing",
//       "printing",
//       "maintenance",
//       "consulting",
//       "training",
//       "photography",
//       "programming",
//       "marketing",
//     ],
//     validationRules: {
//       requireImages: false,
//       minDescriptionLength: 100,
//     },
//   },
//   [ProductKind.FOOD]: {
//     id: ProductKind.FOOD,
//     name: "أكل ومشروبات",
//     description: "منتجات غذائية تتطلب شروط خاصة (توصيل، صلاحية، تراخيص صحية)",
//     icon: "🍔",
//     color: "green",
//     requires: {
//       inventory: true,
//       shipping: true,
//       dimensions: false,
//       weight: true,
//       expiryDate: true,
//       digitalDelivery: false,
//       customerContact: true,
//       complianceLevel: "high",
//     },
//     suggestedActivities: [
//       "restaurant",
//       "cafe",
//       "bakery",
//       "grocery",
//       "catering",
//       "food_delivery",
//       "juice_bar",
//       "sweets",
//       "food_processing", // ✅ أضف هذا
//       "livestock", // ✅ أضف هذا
//       "fisheries",
//     ],
//     validationRules: {
//       minPrice: 1000,
//       requireImages: true,
//       minDescriptionLength: 80,
//     },
//   },
//   [ProductKind.DIGITAL]: {
//     id: ProductKind.DIGITAL,
//     name: "منتج رقمي",
//     description:
//       "محتوى غير ملموس يُسلّم إلكترونيًا (كتب إلكترونية، دورات، ملفات، برامج)",
//     icon: "💾",
//     color: "orange",
//     requires: {
//       inventory: false,
//       shipping: false,
//       dimensions: false,
//       weight: false,
//       expiryDate: false,
//       digitalDelivery: true,
//       customerContact: false,
//       complianceLevel: "low",
//     },
//     suggestedActivities: [
//       "education",
//       "software",
//       "design_files",
//       "e-books",
//       "digital_art",
//       "templates",
//       "music",
//       "video_content",
//     ],
//     validationRules: {
//       requireImages: false,
//       minDescriptionLength: 30,
//     },
//   },
// };

// // ============ واجهات البيانات المشتقة ============

// export interface ProductKindSelectionResult {
//   kind: ProductKind;
//   allowed: boolean;
//   reason?: string;
//   requiredFields: string[];
//   hiddenFields: string[];
//   suggestedFields: string[];
//   complianceLevel: "low" | "medium" | "high";
//   validationRules: {
//     requireImages: boolean;
//     minDescriptionLength: number;
//     minPrice?: number;
//     maxPrice?: number;
//   };
//   nextSteps: string[];
// }

// export interface FieldVisibility {
//   showInventory: boolean;
//   showShipping: boolean;
//   showDimensions: boolean;
//   showWeight: boolean;
//   showExpiryDate: boolean;
//   showDigitalDelivery: boolean;
//   showServiceDetails: boolean;
//   showWarranty: boolean;
//   showSizeGuide: boolean;
// }

// export interface KindBasedValidation {
//   isValid: boolean;
//   errors: string[];
//   warnings: string[];
//   suggestions: string[];
// }

// // ============ واجهة Product المحدثة ============

// export interface Product {
//   id: string;
//   storeId: string;
//   ownerId: string;

//   name: string;
//   description: string;
//   shortDescription?: string;

//   category?: string;
//   subCategory?: string;

//   // businessType?: string;
//   // subBusinessType?: string;

//   _semantics?: ProductSemantics;

//   brand?: string;
//   sku: string;

//   price: number;
//   comparePrice?: number;
//   costPrice?: number;

//   discount?: {
//     type: "percentage" | "fixed" | "none";
//     value: number;
//     startDate?: Date;
//     endDate?: Date;
//     isActive: boolean;
//     originalPrice: number;
//     salePrice: number;
//   };

//   inventory?: {
//     quantity: number;
//     sku: string;
//     trackInventory: boolean;
//     lowStockThreshold?: number;
//     backorders?: boolean;
//   };

//   images: string[];

//   specifications?: Record<string, string>;

//   tags: string[];

//   featured: boolean;
//   status: ProductStatus;
//   visibility?: "visible" | "hidden" | "catalog" | "search";

//   shipping?: {
//     weight?: number;
//     dimensions?: {
//       length?: number;
//       width?: number;
//       height?: number;
//     };
//     requiresShipping?: boolean;
//     shippingClass?: string;
//   };

//   digitalDelivery?: {
//     enabled: boolean;
//     files?: string[];
//     autoSend?: boolean;
//     accessDuration?: number;
//   };

//   metadata?: {
//     agricultureSpecific?: {
//       agricultureType?: string;
//       isOrganic?: boolean;
//       certification?: string;
//       usageInstructions?: string;
//       shelfLifeMonths?: number;
//       addedAt?: string;
//       source?: string;
//       [key: string]: any;
//     };
//   };

//   serviceDetails?: {
//     estimatedDuration: string;
//     requiresCustomerInfo: boolean;
//     communicationMethod: string;
//   };

//   tax?: {
//     taxable?: boolean;
//     taxClass?: string;
//   };

//   seo: {
//     title: string;
//     description: string;
//     keywords: string[];
//   };

//   soldIndividually?: boolean;

//   warranty?: string;
//   returnPolicy?: string;
//   sizeGuide?: string;

//   reviewsEnabled?: boolean;
//   averageRating?: number;
//   reviewCount?: number;

//   variants?: Array<{
//     id?: string;
//     name: string;
//     options: string[];
//     price?: number;
//     comparePrice?: number;
//     sku?: string;
//     quantity?: number;
//   }>;

//   stats?: {
//     views: number;
//     sales: number;
//     wishlistCount: number;
//   };

//   // ⭐ معلومات الصلاحية (مُهيكلة للنظام)
//   expiryInfo?: {
//     hasExpiryDate: boolean;
//     expiryDate?: Date;
//     shelfLife?: string;
//     storageInstructions?: string;
//     allergens?: string[];
//   };

//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface DiscountUpdate {
//   type: "percentage" | "fixed" | "none";
//   value: number;
//   startDate?: Date;
//   endDate?: Date;
//   isActive: boolean;
// }

// // 🔥 واجهة جزئية للمنتج (للإدخال)
// export interface ProductInput
//   extends Omit<Product, "id" | "createdAt" | "updatedAt"> {
//   // يمكن إضافة حقول إضافية للإدخال
// }

// // 🔥 واجهة جزئية لتحديث المنتج
// export interface ProductUpdate
//   extends Partial<
//     Omit<Product, "id" | "storeId" | "ownerId" | "createdAt" | "updatedAt">
//   > {
//   // حقول التحديث
// }

// // ============ واجهة Order ============

// // ============ أنواع الطلبات ============
// export interface OrderItem {
//   productId: string;
//   variantId?: string;
//   name: string;
//   price: number;
//   quantity: number;
//   image?: string;
//   weight?: number;
//   digitalFileUrl?: string;
// }

// export interface Order {
//   id: string;
//   storeId: string;
//   customerId: string;
//   customerSnapshot: {
//     uid?: string;
//     email: string;
//     firstName: string;
//     lastName: string;
//     phone: string;
//     shippingAddress: ShippingAddress;
//   };
//   items: OrderItem[];
//   subtotal: number;
//   shipping: number;
//   tax: number;
//   discount?: number;
//   discountCode?: string;
//   total: number;
//   shippingAddress: ShippingAddress;
//   billingAddress?: ShippingAddress;
//   paymentMethod: "cod" | "bank_transfer" | "online" | "wallet";
//   paymentStatus:
//     | "pending"
//     | "paid"
//     | "failed"
//     | "refunded"
//     | "partially_refunded";
//   paymentDetails?: {
//     transactionId?: string;
//     paymentGateway?: string;
//     paidAt?: Date;
//   };
//   orderStatus:
//     | "pending"
//     | "processing"
//     | "shipped"
//     | "delivered"
//     | "cancelled"
//     | "returned";
//   fulfillmentStatus?: "unfulfilled" | "partially_fulfilled" | "fulfilled";
//   notes?: string;
//   customerNotes?: string;
//   trackingNumber?: string;
//   carrier?: string;
//   estimatedDelivery?: Date;
//   deliveredAt?: Date;
//   cancelledAt?: Date;
//   refundedAt?: Date;
//   createdAt: Date;
//   updatedAt: Date;
//   firestoreId?: string;
// }

// export interface StoreOrder extends Order {
//   customer?: StoreCustomer;
//   store?: Store;
// }

// // ============ واجهة Category المحدثة ============

// export interface Category {
//   id: string;
//   storeId: string;
//   name: string;
//   description: string;

//   uiProperties?: {
//     displayOrder?: number;
//     isFeatured?: boolean;
//     isSeasonal?: boolean;
//     isSaleCategory?: boolean;
//     showInMenu?: boolean;
//     showInFooter?: boolean;
//     badgeText?: string;
//     badgeColor?: string;
//     customSlug?: string;
//     seoTitle?: string;
//     seoDescription?: string;
//   };

//   image?: string;
//   parentId?: string;
//   order: number;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface CategoryUpdateData {
//   name?: string;
//   description?: string;
//   image?: string;
//   order?: number;
//   isActive?: boolean;
//   parentId?: string;
//   uiProperties?: Category["uiProperties"];
// }

// export interface CreateCategoryData {
//   name: string;
//   description?: string;
//   storeId: string;
//   image?: string;
//   order?: number;
//   parentId?: string;
//   isActive?: boolean;
//   uiProperties?: Category["uiProperties"];
// }

// export interface ImportCategoriesData {
//   categories: Array<{
//     name: string;
//     description?: string;
//     order?: number;
//     uiProperties?: Category["uiProperties"];
//   }>;
// }

// export interface ExportCategoriesResult {
//   id: string;
//   name: string;
//   description: string;
//   order: number;
//   isActive: boolean;
//   createdAt: Date;
//   productCount: number;
//   uiProperties?: Category["uiProperties"];
// }

// export interface MergeCategoriesData {
//   sourceCategoryId: string;
//   targetCategoryId: string;
//   moveProducts?: boolean;
// }

// export interface SubBusinessCategory {
//   id: string;
//   storeId: string;
//   subBusinessType: string;
//   categories: {
//     id: string;
//     name: string;
//     description?: string;
//     image?: string;
//     order: number;
//     isActive: boolean;
//   }[];
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface Customer {
//   id: string;
//   uid: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   phone?: string;
//   userType: "customer";
//   shippingAddress?: ShippingAddress;
//   lastOrderAt?: Date;
//   createdAt: Date;
//   updatedAt: Date;
//   isActive: boolean;
// }

// export interface CartItem {
//   productId: string;
//   quantity: number;
//   addedAt: Date;
//   product?: Product;
// }

// export interface FavoriteItem {
//   id: string;
//   productId: string;
//   customerId: string;
//   storeId: string;
//   createdAt: Date;
// }

// export interface Cart {
//   id: string;
//   customerId: string;
//   storeId: string;
//   items: CartItem[];
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface Favorite {
//   id: string;
//   customerId: string;
//   storeId: string;
//   productId: string;
//   addedAt: Date;
// }

// export interface CustomerCart {
//   id: string;
//   customerId: string;
//   storeId: string;
//   items: CartItem[];
//   updatedAt: Date;
// }

// export interface CustomerFavorites {
//   id: string;
//   customerId: string;
//   storeId: string;
//   items: FavoriteItem[];
//   updatedAt: Date;
// }

// // ============ دوال جديدة: نصائح الاستخدام الأمثل ============

// export interface OptimizationTips {
//   newStoreTips: {
//     preciseActivities: string;
//     enableAutoDetection: string;
//     useNonStrictMode: string;
//     manualReview: string;
//   };
//   inventoryTips: {
//     enableTracking: string;
//     setLowThreshold: string;
//     uniqueSKU: string;
//     autoUpdate: string;
//   };
//   discountTips: {
//     useTimePeriods: string;
//     monitorEffectiveness: string;
//     renewExpired: string;
//     relativeDiscounts: string;
//   };
// }

// export const OPTIMIZATION_TIPS: OptimizationTips = {
//   newStoreTips: {
//     preciseActivities:
//       "تحديد الأنشطة التجارية بدقة لزيادة دقة الاكتشاف وتقليل المراجعات اليدوية",
//     enableAutoDetection:
//       "تفعيل الاكتشاف التلقائي لتسريع إضافة المنتجات وضمان اتساق البيانات",
//     useNonStrictMode:
//       "استخدام وضع غير صارم في البداية لإعطاء وقت للتعديل والتعلم",
//     manualReview:
//       "مراجعة المنتجات غير الممتثلة يدويًا لاتخاذ القرار المناسب لكل حالة",
//   },
//   inventoryTips: {
//     enableTracking: "تفعيل تتبع المخزون للتحديث التلقائي والتحذيرات الذكية",
//     setLowThreshold:
//       "تحديد حد المخزون المنخفض بناءً على معدل البيع لمنع نفاذ المخزون",
//     uniqueSKU: "استخدام SKU فريد لكل منتج للتتبع الدقيق وتحليل الأداء",
//     autoUpdate: "تحديث المخزون تلقائيًا مع المبيعات للحفاظ على دقة البيانات",
//   },
//   discountTips: {
//     useTimePeriods: "استخدام فترات زمنية محددة للعروض لخلق إحساس بالاستعجال",
//     monitorEffectiveness:
//       "مراقبة فعالية العروض بانتظام لتحسين استراتيجية التخفيضات",
//     renewExpired:
//       "تجديد العروض المنتهية التي أثبتت فعاليتها بضبط القيم والفترات",
//     relativeDiscounts:
//       "استخدام خصومات نسبية للمنتجات باهظة الثمن للحفاظ على القيمة المتصورة",
//   },
// };

// // ============ دوال النصائح العملية ============

// export interface StockThresholds {
//   fastMoving: {
//     lowThreshold: number;
//     reorderPoint: number;
//     safetyStock: number;
//   };
//   slowMoving: {
//     lowThreshold: number;
//     reorderPoint: number;
//     safetyStock: number;
//   };
//   seasonal: {
//     lowThreshold: number;
//     reorderPoint: number;
//     safetyStock: number;
//   };
// }

// export interface DiscountPeriods {
//   flashSale: {
//     duration: number;
//     bestFor: string[];
//   };
//   weekendSale: {
//     duration: number;
//     bestFor: string[];
//   };
//   monthlySale: {
//     duration: number;
//     bestFor: string[];
//   };
//   seasonal: {
//     duration: number;
//     bestFor: string[];
//   };
// }

// export interface DiscountAnalytics {
//   productId: string;
//   discountDetails: {
//     type: "percentage" | "fixed";
//     value: number;
//     period: {
//       start?: Date;
//       end?: Date;
//     };
//   };
//   performance: {
//     salesDuringDiscount: number;
//     salesBeforeDiscount: number;
//     revenueIncrease: number;
//     conversionRate: number;
//     customerAcquisition: number;
//   };
//   costBenefit: {
//     discountCost: number;
//     additionalRevenue: number;
//     netProfit: number;
//     roi: number;
//   };
//   recommendations: {
//     extend: boolean;
//     adjust: boolean;
//     stop: boolean;
//     repeat: boolean;
//   };
// }

// // ============ دالة تنظيف البيانات ============

// // ============ دالة تنظيف البيانات المعدلة ============

// const cleanFirestoreData = (data: any): any => {
//   // 🔧 أضف سجلات التشخيص
//   const debug = false; // غيّر إلى true لتفعيل السجلات

//   if (debug) {
//     console.log("🧹 cleanFirestoreData المدخل:", {
//       data,
//       type: typeof data,
//       isObject: typeof data === "object" && data !== null,
//       isArray: Array.isArray(data),
//       // تحقق من metadata إذا كان موجوداً
//       hasMetadata: data?.metadata !== undefined,
//       metadata: data?.metadata,
//       agricultureSpecific: data?.metadata?.agricultureSpecific,
//     });
//   }

//   if (data === null || data === undefined) {
//     if (debug) console.log("🧹 إرجاع null لبيانات null/undefined");
//     return null;
//   }

//   if (Array.isArray(data)) {
//     if (data.length === 0) {
//       if (debug) console.log("🧹 إرجاع مصفوفة فارغة");
//       return [];
//     }
//     const cleanedArray = data.map(cleanFirestoreData);
//     if (debug) console.log("🧹 تنظيف المصفوفة، الطول:", cleanedArray.length);
//     return cleanedArray;
//   }

//   if (
//     typeof data === "object" &&
//     !(data instanceof Date) &&
//     !(data instanceof Timestamp)
//   ) {
//     const cleaned: any = {};
//     let hasValidFields = false;

//     for (const [key, value] of Object.entries(data)) {
//       if (value !== undefined) {
//         const cleanedValue = cleanFirestoreData(value);

//         // 🔧 التعديل المهم: احتفظ بالكائنات حتى لو أصبحت فارغة بعد التنظيف
//         // هذا مهم لكائنات مثل metadata التي قد تحتوي على كائنات فرعية
//         if (cleanedValue !== null && cleanedValue !== undefined) {
//           // إذا كانت القيمة كائنًا فارغًا، احتفظ بها فقط إذا كانت metadata
//           // لأن metadata قد تبدأ فارغة وتُملأ لاحقاً
//           if (
//             typeof cleanedValue === "object" &&
//             !Array.isArray(cleanedValue) &&
//             Object.keys(cleanedValue).length === 0
//           ) {
//             if (key === "metadata" || key === "agricultureSpecific") {
//               cleaned[key] = cleanedValue; // احتفظ بالكائن الفارغ
//               hasValidFields = true;
//               if (debug) console.log(`🧹 احتفظ بـ ${key} ككائن فارغ`);
//             } else {
//               if (debug) console.log(`🧹 تخطي ${key} (كائن فارغ)`);
//             }
//           } else {
//             cleaned[key] = cleanedValue;
//             hasValidFields = true;
//             if (
//               debug &&
//               (key === "metadata" || key === "agricultureSpecific")
//             ) {
//               console.log(`🧹 احتفظ بـ ${key}:`, cleanedValue);
//             }
//           }
//         } else {
//           if (debug) console.log(`🧹 تخطي ${key} (قيمة null بعد التنظيف)`);
//         }
//       } else {
//         if (debug) console.log(`🧹 تخطي ${key} (undefined)`);
//       }
//     }

//     if (debug) {
//       console.log("🧹 cleanFirestoreData المخرجات:", {
//         keys: Object.keys(cleaned),
//         hasMetadata: "metadata" in cleaned,
//         metadata: cleaned.metadata,
//         agricultureSpecific: cleaned.metadata?.agricultureSpecific,
//       });
//     }

//     return hasValidFields ? cleaned : null;
//   }

//   // القيم البدائية (أرقام، نصوص، تواريخ، إلخ)
//   if (debug) console.log("🧹 إرجاع قيمة بدائية:", data);
//   return data;
// };

// // ============ نظام الامتثال الرئيسي ============

// // ============ نظام الامتثال الرئيسي المحدث ============

// export const complianceSystem = {
//   // 🔥 1. اختيار نوع المنتج الأساسي (الخطوة الأولى للتاجر)
//   async handleProductKindSelection(
//     kind: ProductKind,
//     storeId: string,
//   ): Promise<ProductKindSelectionResult> {
//     try {
//       const kindInfo = PRODUCT_KINDS[kind];
//       const store = await storeService.getById(storeId);

//       if (!store) {
//         return {
//           kind,
//           allowed: false,
//           reason: "المتجر غير موجود",
//           requiredFields: [],
//           hiddenFields: [],
//           suggestedFields: [],
//           complianceLevel: "high",
//           validationRules: kindInfo.validationRules,
//           nextSteps: ["إنشاء متجر أولاً"],
//         };
//       }

//       // 🔍 التحقق البسيط من التوافق مع نشاط المتجر
//       const storeActivities = store.businessActivities?.subActivities || [];
//       const hasSuggestedActivity = kindInfo.suggestedActivities.some(
//         (activity) => storeActivities.includes(activity),
//       );

//       let reason: string | undefined;
//       let nextSteps: string[] = [];

//       // ⚠️ التحذير فقط (لا المنع) عند عدم التوافق
//       if (!hasSuggestedActivity && storeActivities.length > 0) {
//         reason = `هذا النوع من المنتجات يتطلب نشاطًا تجاريًا مثل: ${kindInfo.suggestedActivities.slice(0, 3).join(", ")}`;
//         nextSteps = [
//           "يمكنك إضافة نشاط تجاري مناسب من إعدادات المتجر",
//           "أو متابعة إضافة المنتج وسيتم مراجعته يدويًا",
//         ];
//       }

//       // ✅ السماح دائمًا (المراجعة تكون في خطوات لاحقة)
//       return {
//         kind,
//         allowed: true, // ✅ دائماً مسموح في البداية
//         reason,
//         requiredFields: this.getRequiredFieldsByKind(kindInfo),
//         hiddenFields: this.getHiddenFieldsByKind(kindInfo),
//         suggestedFields: this.getSuggestedFieldsByKind(kindInfo),
//         complianceLevel: kindInfo.requires.complianceLevel,
//         validationRules: kindInfo.validationRules,
//         nextSteps,
//       };
//     } catch (error) {
//       console.error("❌ خطأ في معالجة نوع المنتج:", error);
//       return {
//         kind,
//         allowed: false,
//         reason: "خطأ في النظام",
//         requiredFields: [],
//         hiddenFields: [],
//         suggestedFields: [],
//         complianceLevel: "high",
//         validationRules: PRODUCT_KINDS[kind].validationRules,
//         nextSteps: ["حاول مرة أخرى لاحقًا"],
//       };
//     }
//   },

//   // 🔥 2. الحصول على الحقول المطلوبة بناءً على النوع
//   getRequiredFieldsByKind(kindInfo: ProductKindInfo): string[] {
//     const required: string[] = ["name", "description", "price"];

//     if (kindInfo.requires.inventory) {
//       required.push("inventory.quantity");
//     }

//     if (kindInfo.requires.shipping) {
//       required.push("shipping.requiresShipping");
//     }

//     if (kindInfo.requires.expiryDate) {
//       required.push("expiryInfo.hasExpiryDate");
//     }

//     if (kindInfo.requires.digitalDelivery) {
//       required.push("digitalDelivery.enabled");
//     }

//     if (kindInfo.requires.customerContact) {
//       required.push("serviceDetails.requiresCustomerInfo");
//     }

//     return required;
//   },

//   // 🔥 3. الحقول التي يجب إخفاؤها
//   getHiddenFieldsByKind(kindInfo: ProductKindInfo): string[] {
//     const hidden: string[] = [];

//     if (!kindInfo.requires.inventory) {
//       hidden.push("inventory", "stock", "lowStockThreshold", "backorders");
//     }

//     if (!kindInfo.requires.shipping) {
//       hidden.push("shipping", "weight", "dimensions", "shippingClass");
//     }

//     if (!kindInfo.requires.dimensions) {
//       hidden.push("dimensions");
//     }

//     if (!kindInfo.requires.weight) {
//       hidden.push("weight");
//     }

//     if (!kindInfo.requires.digitalDelivery) {
//       hidden.push(
//         "digitalDelivery",
//         "downloadLinks",
//         "fileSize",
//         "accessDuration",
//       );
//     }

//     if (!kindInfo.requires.customerContact) {
//       hidden.push("serviceDetails", "communicationMethod", "preparationTime");
//     }

//     if (!kindInfo.requires.expiryDate) {
//       hidden.push(
//         "expiryInfo",
//         "shelfLife",
//         "storageInstructions",
//         "allergens",
//       );
//     }

//     // إخفاء الحقول غير المناسبة
//     if (
//       kindInfo.id === ProductKind.DIGITAL ||
//       kindInfo.id === ProductKind.SERVICE
//     ) {
//       hidden.push("warranty", "sizeGuide", "weight");
//     }

//     if (kindInfo.id === ProductKind.PHYSICAL) {
//       hidden.push("digitalDelivery", "serviceDetails", "expiryInfo");
//     }

//     return hidden;
//   },

//   // 🔥 4. الحقول المقترحة (ليست مطلوبة، لكن مفيدة)
//   getSuggestedFieldsByKind(kindInfo: ProductKindInfo): string[] {
//     const suggested: string[] = [];

//     if (kindInfo.id === ProductKind.PHYSICAL) {
//       suggested.push("brand", "specifications", "warranty", "sizeGuide");
//     }

//     if (kindInfo.id === ProductKind.SERVICE) {
//       suggested.push(
//         "serviceDetails.estimatedDuration",
//         "serviceDetails.communicationMethod",
//       );
//     }

//     if (kindInfo.id === ProductKind.FOOD) {
//       suggested.push(
//         "expiryInfo.shelfLife",
//         "expiryInfo.storageInstructions",
//         "allergens",
//       );
//     }

//     if (kindInfo.id === ProductKind.DIGITAL) {
//       suggested.push(
//         "digitalDelivery.fileFormat",
//         "digitalDelivery.accessDuration",
//       );
//     }

//     return suggested;
//   },

//   // 🔥 5. الحصول على إعدادات العرض للحقول
//   getFieldVisibility(kind: ProductKind): FieldVisibility {
//     const kindInfo = PRODUCT_KINDS[kind];

//     return {
//       showInventory: kindInfo.requires.inventory,
//       showShipping: kindInfo.requires.shipping,
//       showDimensions: kindInfo.requires.dimensions,
//       showWeight: kindInfo.requires.weight,
//       showExpiryDate: kindInfo.requires.expiryDate,
//       showDigitalDelivery: kindInfo.requires.digitalDelivery,
//       showServiceDetails: kindInfo.requires.customerContact,
//       showWarranty: kindInfo.id === ProductKind.PHYSICAL,
//       showSizeGuide: kindInfo.id === ProductKind.PHYSICAL,
//     };
//   },

//   // 🔥 6. التحقق من صحة البيانات حسب النوع - إصلاح الخطأ هنا
//   validateProductDataByKind(
//     productData: any, // استخدام any بدلاً من Partial<Product> لتجنب الأخطاء
//     kind: ProductKind,
//   ): KindBasedValidation {
//     const kindInfo = PRODUCT_KINDS[kind];
//     const errors: string[] = [];
//     const warnings: string[] = [];
//     const suggestions: string[] = [];

//     // 🔴 التحقق من الحقول المطلوبة للجميع
//     if (!productData.name || productData.name.trim().length < 2) {
//       errors.push("اسم المنتج قصير جداً (يجب أن يكون على الأقل حرفين)");
//     }

//     if (
//       !productData.description ||
//       productData.description.trim().length <
//         kindInfo.validationRules.minDescriptionLength
//     ) {
//       errors.push(
//         `الوصف قصير جداً (يجب أن يكون على الأقل ${kindInfo.validationRules.minDescriptionLength} حرف)`,
//       );
//     }

//     if (productData.price === undefined || productData.price < 0) {
//       errors.push("السعر غير صالح");
//     }

//     if (
//       kindInfo.validationRules.minPrice &&
//       productData.price < kindInfo.validationRules.minPrice
//     ) {
//       warnings.push(
//         `السعر منخفض جداً (الحد الأدنى المقترح: ${kindInfo.validationRules.minPrice})`,
//       );
//     }

//     // 🔴 التحقق من الحقول المطلوبة حسب النوع
//     if (
//       kindInfo.requires.inventory &&
//       (!productData.inventory || productData.inventory.quantity < 0)
//     ) {
//       errors.push("كمية المخزون مطلوبة لهذا النوع من المنتجات");
//     }

//     if (
//       kindInfo.requires.shipping &&
//       productData.shipping?.requiresShipping === undefined
//     ) {
//       errors.push("يجب تحديد ما إذا كان المنتج يحتاج شحن");
//     }

//     // 🔴 إصلاح: استخدام شرط اختياري للتحقق من expiryInfo
//     if (kindInfo.requires.expiryDate) {
//       if (
//         !productData.expiryInfo ||
//         productData.expiryInfo.hasExpiryDate === undefined
//       ) {
//         errors.push("يجب تحديد ما إذا كان المنتج له صلاحية");
//       }
//     }

//     if (
//       kindInfo.requires.digitalDelivery &&
//       productData.digitalDelivery?.enabled === undefined
//     ) {
//       errors.push("يجب تحديد طريقة التسليم الرقمي");
//     }

//     if (
//       kindInfo.requires.customerContact &&
//       productData.serviceDetails?.requiresCustomerInfo === undefined
//     ) {
//       errors.push("يجب تحديد ما إذا كانت الخدمة تتطلب معلومات العميل");
//     }

//     // 🟡 التحذيرات
//     if (
//       kindInfo.validationRules.requireImages &&
//       (!productData.images || productData.images.length === 0)
//     ) {
//       warnings.push("ينصح بإضافة صور للمنتج");
//     }

//     if (!productData.category) {
//       warnings.push("ينصح بإضافة فئة للمنتج");
//     }

//     if (!productData.tags || productData.tags.length === 0) {
//       suggestions.push("إضافة وسوم تساعد في اكتشاف المنتج");
//     }

//     // 🟢 الاقتراحات
//     if (
//       kindInfo.id === ProductKind.FOOD &&
//       productData.expiryInfo &&
//       !productData.expiryInfo.storageInstructions
//     ) {
//       suggestions.push("إضافة تعليمات التخزين للمنتج الغذائي");
//     }

//     if (
//       kindInfo.id === ProductKind.SERVICE &&
//       productData.serviceDetails &&
//       !productData.serviceDetails.estimatedDuration
//     ) {
//       suggestions.push("تحديد المدة المتوقعة لإنجاز الخدمة");
//     }

//     if (
//       kindInfo.id === ProductKind.DIGITAL &&
//       productData.digitalDelivery &&
//       !productData.digitalDelivery.accessDuration
//     ) {
//       suggestions.push("تحديد مدة الوصول للمنتج الرقمي");
//     }

//     return {
//       isValid: errors.length === 0,
//       errors,
//       warnings,
//       suggestions,
//     };
//   },

//   // 🔥 تحديث detectDetailedProductType لدعم الزراعة بشكل أفضل
//   async detectDetailedProductType(
//     productData: any,
//     kind: ProductKind,
//   ): Promise<ProductTypeDetection> {
//     console.log("🔍 بدء الكشف التفصيلي:", {
//       name: productData.name,
//       kind: kind,
//     });

//     // استدعاء الدالة الأساسية أولاً
//     const detection = await this.detectProductType(productData);

//     // 🔥 تحسين خاص للزراعة: إذا كان المنتج زراعي والنوع مادي
//     const isAgricultureByName = [
//       "سماد",
//       "بذور",
//       "زراعة",
//       "نبات",
//       "مبيد",
//       "اسمدة",
//     ].some((keyword) =>
//       (productData.name || "").toLowerCase().includes(keyword.toLowerCase()),
//     );

//     console.log("🌱 التحقق من الزراعة:", {
//       isAgricultureByName,
//       name: productData.name,
//       detectionType: detection.productType?.name,
//     });

//     if (isAgricultureByName && kind === ProductKind.PHYSICAL) {
//       const agricultureType = DEFAULT_PRODUCT_TYPES.find(
//         (pt) => pt.id === "pt_agriculture_011",
//       );

//       if (
//         agricultureType &&
//         (!detection.productType ||
//           detection.productType.id !== "pt_agriculture_011")
//       ) {
//         console.log("🌱 إجبار النوع الزراعي:", productData.name);
//         return {
//           productType: agricultureType,
//           confidence: 0.95, // ثقة عالية جداً
//           method: DetectionMethod.PATTERN,
//           matchedKeywords: ["سماد", "زراعة"],
//           suggestedCategories: agricultureType.rules.allowedCategories,
//         };
//       }
//     }

//     // إذا كان النوع المتوافق مع kind، زد الثقة
//     if (detection.productType) {
//       const kindInfo = PRODUCT_KINDS[kind];
//       console.log("📊 تحليل التوافق مع kind:", {
//         productType: detection.productType.activityId,
//         kindSuggestedActivities: kindInfo.suggestedActivities,
//       });

//       // تحقق من التوافق مع kind
//       const isCompatible = kindInfo.suggestedActivities.includes(
//         detection.productType.activityId,
//       );

//       if (isCompatible) {
//         // زيادة الثقة عند التوافق
//         detection.confidence = Math.min(detection.confidence * 1.3, 0.95);
//         detection.method = DetectionMethod.HYBRID;
//         console.log("✅ النشاط متوافق مع kind");
//       } else {
//         // تقليل الثقة عند عدم التوافق
//         detection.confidence = detection.confidence * 0.6;
//         detection.method = DetectionMethod.RULES;
//         console.log("⚠️ النشاط غير متوافق مع kind");

//         // محاولة إيجاد نوع متوافق مع kind
//         const compatibleTypes = DEFAULT_PRODUCT_TYPES.filter((pt) =>
//           kindInfo.suggestedActivities.includes(pt.activityId),
//         );

//         console.log("🔍 البحث عن أنواع متوافقة:", {
//           compatibleCount: compatibleTypes.length,
//           kind: kindInfo.name,
//         });

//         if (compatibleTypes.length > 0) {
//           // 🔥 إعطاء الأولوية للنوع الزراعي إذا كان اسم المنتج زراعي
//           if (isAgricultureByName) {
//             const agricultureCompatible = compatibleTypes.find(
//               (pt) => pt.id === "pt_agriculture_011",
//             );
//             if (agricultureCompatible) {
//               console.log("🌱 استخدام نوع زراعي متوافق");
//               detection.productType = agricultureCompatible;
//               detection.confidence = 0.8;
//               detection.method = DetectionMethod.KIND_BASED;
//               detection.matchedKeywords.push(
//                 `نوع معدل ليناسب ${kindInfo.name} (زراعي)`,
//               );
//               return detection;
//             }
//           }

//           // اقتراح أول نوع متوافق
//           detection.productType = compatibleTypes[0];
//           detection.confidence = 0.4; // ثقة متوسطة
//           detection.method = DetectionMethod.KIND_BASED;
//           detection.matchedKeywords.push(`نوع معدل ليناسب ${kindInfo.name}`);
//           console.log(
//             "🔄 تغيير النوع ليتوافق مع kind:",
//             detection.productType.name,
//           );
//         }
//       }
//     }

//     console.log("🎯 النتيجة النهائية للكشف التفصيلي:", {
//       productType: detection.productType?.name,
//       confidence: detection.confidence,
//       method: detection.method,
//     });

//     return detection;
//   },
//   prepareProductDataForSaving(
//     rawData: any,
//     kind: ProductKind,
//     storeId: string,
//     ownerId: string,
//   ): any {
//     console.log("📥 البيانات الواردة إلى prepareProductDataForSaving:", {
//       rawDataKeys: Object.keys(rawData),
//       hasAgricultureType: "agricultureType" in rawData,
//       hasIsOrganic: "isOrganic" in rawData,
//       // ⭐ ⭐ ⭐ **أضف تحقق من الحقول الزمنية**
//       hasCreatedAt: "createdAt" in rawData,
//       hasUpdatedAt: "updatedAt" in rawData,
//       createdAtValue: rawData.createdAt,
//       updatedAtValue: rawData.updatedAt,
//       rawDataPreview: JSON.stringify(rawData).substring(0, 300),
//     });

//     // ⭐ ⭐ ⭐ **الحفاظ على الحقول الزمنية إذا كانت موجودة**
//     const timestampsToPreserve: any = {};

//     // تحقق من createdAt
//     if (rawData.createdAt) {
//       timestampsToPreserve.createdAt = rawData.createdAt;
//       console.log("✅ الحفاظ على createdAt من rawData:", rawData.createdAt);
//     } else {
//       // إذا لم يكن موجوداً، أضف timestamp جديد
//       timestampsToPreserve.createdAt = new Date();
//       console.log("➕ إضافة createdAt جديد:", timestampsToPreserve.createdAt);
//     }

//     // تحقق من updatedAt
//     if (rawData.updatedAt) {
//       timestampsToPreserve.updatedAt = rawData.updatedAt;
//       console.log("✅ الحفاظ على updatedAt من rawData:", rawData.updatedAt);
//     } else {
//       // إذا لم يكن موجوداً، أضف timestamp جديد
//       timestampsToPreserve.updatedAt = new Date();
//       console.log("➕ إضافة updatedAt جديد:", timestampsToPreserve.updatedAt);
//     }
//     // استخدام any مؤقتاً
//     const kindInfo = PRODUCT_KINDS[kind];
//     // البيانات الأساسية المشتركة
//     const baseData: any = {
//       storeId,
//       ownerId,
//       kind,
//       name: rawData.name?.trim() || "",
//       description: rawData.description?.trim() || "",
//       shortDescription: rawData.shortDescription?.trim(),
//       category: rawData.category,
//       subCategory: rawData.subCategory,
//       brand: rawData.brand,
//       sku: rawData.sku?.trim() || `SKU-${Date.now()}`,
//       price: Number(rawData.price) || 0,
//       comparePrice: rawData.comparePrice
//         ? Number(rawData.comparePrice)
//         : undefined,
//       costPrice: rawData.costPrice ? Number(rawData.costPrice) : undefined,
//       images:
//         rawData.images?.length > 0
//           ? rawData.images
//           : ["/placeholder-product.jpg"],
//       specifications: rawData.specifications || {},
//       tags: rawData.tags || [],
//       featured: rawData.featured || false,
//       status: rawData.status || ProductStatus.DRAFT,
//       visibility: rawData.visibility || "visible",
//       seo: {
//         title: rawData.seoTitle || rawData.name?.substring(0, 60) || "",
//         description:
//           rawData.seoDescription ||
//           rawData.description?.substring(0, 160) ||
//           "",
//         keywords: rawData.seoKeywords || rawData.tags || [],
//       },
//       soldIndividually: rawData.soldIndividually || false,
//       warranty: rawData.warranty,
//       returnPolicy: rawData.returnPolicy,
//       sizeGuide: rawData.sizeGuide,
//       reviewsEnabled: rawData.enableReviews ?? true,
//       averageRating: 0,
//       reviewCount: 0,
//       variants: [],
//       stats: { views: 0, sales: 0, wishlistCount: 0 },

//       // 🔥 **تأكد من وجود حقل metadata فارغ من البداية**
//       metadata: {},

//       // ⭐ ⭐ ⭐ **أضف هذا في النهاية: الحقول الزمنية المحفوظة**
//       ...timestampsToPreserve,
//     };

//     const hasAgricultureData =
//       rawData.agricultureType ||
//       rawData.isOrganic !== undefined ||
//       rawData.certification ||
//       rawData.usageInstructions ||
//       rawData.shelfLifeMonths;

//     if (hasAgricultureData) {
//       baseData.metadata = {
//         ...baseData.metadata,
//         agricultureSpecific: {
//           agricultureType: rawData.agricultureType || "",
//           isOrganic: Boolean(rawData.isOrganic) || false,
//           usageInstructions: rawData.usageInstructions || "",
//           shelfLifeMonths: Number(rawData.shelfLifeMonths) || 12,
//           certification: rawData.certification || "",
//           // يمكن إضافة حقول زراعية إضافية هنا
//           addedAt: new Date().toISOString(),
//           source: "AddProduct form",
//         },
//       };

//       // 🔥 أيضًا يمكن إضافة tags تلقائية للمنتجات الزراعية
//       if (
//         !baseData.tags.includes("زراعة") &&
//         !baseData.tags.includes("زراعي")
//       ) {
//         baseData.tags = [...(baseData.tags || []), "زراعة", "منتج زراعي"];
//       }
//     }

//     // 🔥 إضافة الحقول الشرطية حسب النوع
//     if (kindInfo.requires.inventory && rawData.inventory) {
//       baseData.inventory = {
//         quantity: Number(rawData.inventory.quantity) || 0,
//         sku: rawData.sku?.trim() || `SKU-${Date.now()}`,
//         trackInventory: rawData.trackInventory !== false,
//         lowStockThreshold: rawData.lowStockThreshold || 5,
//         backorders: rawData.allowBackorders || false,
//       };
//     }

//     if (kindInfo.requires.shipping && rawData.shipping) {
//       baseData.shipping = {
//         weight: rawData.weight ? Number(rawData.weight) : undefined,
//         dimensions: rawData.dimensions
//           ? {
//               length: rawData.length ? Number(rawData.length) : undefined,
//               width: rawData.width ? Number(rawData.width) : undefined,
//               height: rawData.height ? Number(rawData.height) : undefined,
//             }
//           : undefined,
//         requiresShipping: rawData.requiresShipping !== false,
//         shippingClass: rawData.shippingClass || "standard",
//       };
//     }

//     if (kindInfo.requires.digitalDelivery && rawData.digitalDelivery) {
//       baseData.digitalDelivery = {
//         enabled: rawData.digitalDelivery.enabled !== false,
//         files: rawData.digitalFiles || [],
//         downloadLinks: rawData.downloadLinks || [],
//         autoSend: rawData.autoSend || true,
//         accessDuration: rawData.accessDuration || 365, // سنة افتراضياً
//         fileSize: rawData.fileSize,
//         fileFormat: rawData.fileFormat,
//       };
//     }

//     if (kindInfo.requires.customerContact && rawData.serviceDetails) {
//       baseData.serviceDetails = {
//         estimatedDuration: rawData.estimatedDuration || "",
//         requiresCustomerInfo: rawData.requiresCustomerInfo !== false,
//         communicationMethod: rawData.communicationMethod || "whatsapp",
//         preparationTime: rawData.preparationTime,
//         maxOrdersPerDay: rawData.maxOrdersPerDay,
//       };
//     }

//     if (kindInfo.requires.expiryDate && rawData.expiryInfo) {
//       baseData.expiryInfo = {
//         hasExpiryDate: rawData.hasExpiryDate || false,
//         expiryDate: rawData.expiryDate
//           ? new Date(rawData.expiryDate)
//           : undefined,
//         shelfLife: rawData.shelfLife,
//         storageInstructions: rawData.storageInstructions,
//         allergens: rawData.allergens || [],
//       };
//     }

//     // الضرائب
//     if (rawData.taxable !== undefined) {
//       baseData.tax = {
//         taxable: rawData.taxable,
//         taxClass: rawData.taxClass || "standard",
//       };
//     }
//     // 🔥 **أضف هذا: تسجيل البيانات المحضرة للتشخيص - مُعدّل**
//     console.log("🔄 تحضير بيانات المنتج للحفظ (المُعدّل):", {
//       name: baseData.name,
//       kind: baseData.kind,
//       hasAgricultureData: hasAgricultureData,
//       metadataExists: !!baseData.metadata,
//       agricultureSpecificExists: !!baseData.metadata?.agricultureSpecific,
//       agricultureFields: baseData.metadata?.agricultureSpecific
//         ? Object.keys(baseData.metadata.agricultureSpecific)
//         : [],
//       agricultureDataPreview: baseData.metadata?.agricultureSpecific
//         ? JSON.stringify(baseData.metadata.agricultureSpecific).substring(
//             0,
//             150,
//           )
//         : "لا توجد",
//       tags: baseData.tags,
//       // ⭐ ⭐ ⭐ **أضف تحقق من timestamps**
//       hasCreatedAt: "createdAt" in baseData,
//       hasUpdatedAt: "updatedAt" in baseData,
//       timestampsPreserved: timestampsToPreserve,
//     });

//     // 🔥 **تحقق من أن كائن metadata كامل قبل الإرجاع**
//     console.log("📋 كامل كائن baseData قبل الإرجاع:", {
//       keys: Object.keys(baseData),
//       hasMetadata: "metadata" in baseData,
//       metadataType: typeof baseData.metadata,
//       metadataKeys: baseData.metadata ? Object.keys(baseData.metadata) : [],
//       // ⭐ ⭐ ⭐ **أضف تحقق من الحقول الزمنية**
//       hasCreatedAt: "createdAt" in baseData,
//       hasUpdatedAt: "updatedAt" in baseData,
//       createdAt: baseData.createdAt,
//       updatedAt: baseData.updatedAt,
//     });

//     return baseData;
//   },

//   // 🔥 9. بناء semantics مع مراعاة kind
//   async buildProductSemanticsWithKind(
//     productData: any, // استخدام any
//     kind: ProductKind,
//     store?: Store,
//     forceProductType?: ProductType,
//   ): Promise<ProductSemantics> {
//     const semantics: ProductSemantics = {
//       confidenceScore: 0,
//       complianceStatus: ComplianceStatus.PENDING_REVIEW,
//       detectionMethod: DetectionMethod.NONE,
//     };

//     try {
//       // الكشف عن نوع المنتج التفصيلي
//       const detection = forceProductType
//         ? {
//             productType: forceProductType,
//             confidence: 1,
//             method: DetectionMethod.MANUAL,
//             matchedKeywords: [],
//           }
//         : await this.detectDetailedProductType(productData, kind);

//       if (detection.productType) {
//         semantics.productTypeId = detection.productType.id;
//         semantics.detectedActivity = detection.productType.activityId;
//         semantics.confidenceScore = detection.confidence;
//         semantics.detectionMethod = detection.method;
//         semantics.lastDetection = new Date();

//         // تسجيل تاريخ الكشف
//         semantics.detectionLog = [
//           {
//             timestamp: new Date(),
//             method: detection.method,
//             confidence: detection.confidence,
//             activity: detection.productType.activityId,
//           },
//         ];

//         // التحقق من التوافق مع kind
//         const kindInfo = PRODUCT_KINDS[kind];
//         const isActivityCompatible = kindInfo.suggestedActivities.includes(
//           detection.productType.activityId,
//         );

//         semantics.metadata = {
//           isSensitive: detection.productType.metadata?.isSensitive,
//           requiresLicense: detection.productType.metadata?.requiresLicense,
//           flags: [
//             `نوع أساسي: ${kindInfo.name}`,
//             ...(isActivityCompatible
//               ? ["النشاط متوافق مع نوع المنتج"]
//               : ["النشاط غير متوافق مع نوع المنتج"]),
//             ...(detection.matchedKeywords.length > 0
//               ? [`تم الكشف بـ ${detection.matchedKeywords.length} كلمة مفتاحية`]
//               : []),
//           ],
//         };

//         // التحقق من الامتثال مع المتجر
//         if (store) {
//           const complianceCheck = await this.checkComplianceWithStore(
//             productData,
//             detection.productType,
//             store,
//           );

//           semantics.complianceStatus = complianceCheck.complianceStatus;
//           semantics.validationFlags = complianceCheck.violations;

//           // تعديل حالة الامتثال بناءً على التوافق مع kind
//           if (!isActivityCompatible) {
//             semantics.complianceStatus = ComplianceStatus.NON_COMPLIANT;
//             semantics.validationFlags = [
//               ...(semantics.validationFlags || []),
//               `نوع المنتج (${kindInfo.name}) لا يتوافق مع النشاط المكتشف (${detection.productType.activityId})`,
//             ];
//           }

//           if (complianceCheck.shadowActions) {
//             semantics.shadowActions = complianceCheck.shadowActions;
//           }
//         }
//       }

//       return semantics;
//     } catch (error) {
//       console.error("❌ خطأ في بناء دلالات المنتج مع kind:", error);
//       return semantics;
//     }
//   },

//   // 🔥 10. دوال مساعدة
//   getKindInfo(kind: ProductKind): ProductKindInfo {
//     return PRODUCT_KINDS[kind];
//   },

//   getAllKinds(): ProductKindInfo[] {
//     return Object.values(PRODUCT_KINDS);
//   },

//   getKindByActivity(activityId: string): ProductKind | null {
//     for (const [kind, info] of Object.entries(PRODUCT_KINDS)) {
//       if (info.suggestedActivities.includes(activityId)) {
//         return kind as ProductKind;
//       }
//     }
//     return null;
//   },
//   // 🔹 1. لا تثق في البيانات القادمة من العميل - محسنة
//   sanitizeProductData(productData: any): any {
//     const sanitized = { ...productData };

//     // ❗ حذف _semantics القادمة من الواجهة تمامًا
//     delete sanitized._semantics;

//     // ❗ حذف حقول النشاط التجاري (يتم اكتشافها تلقائياً)
//     delete sanitized.businessType;
//     delete sanitized.subBusinessType;
//     delete sanitized.businessActivities;

//     // تنظيف البيانات الأخرى
//     delete sanitized.id;
//     delete sanitized.createdAt;
//     delete sanitized.updatedAt;
//     delete sanitized.ownerId; // يجب أن يأتي من السيرفر

//     return sanitized;
//   },

//   // 🔹 2. بناء semantics في السيرفر فقط - محسنة
//   async buildProductSemantics(
//     productData: Partial<Product>,
//     store?: Store,
//     forceProductType?: ProductType,
//   ): Promise<ProductSemantics> {
//     const semantics: ProductSemantics = {
//       confidenceScore: 0,
//       complianceStatus: ComplianceStatus.PENDING_REVIEW,
//       detectionMethod: DetectionMethod.NONE,
//     };

//     try {
//       // الكشف عن نوع المنتج
//       const detection = forceProductType
//         ? {
//             productType: forceProductType,
//             confidence: 1,
//             method: DetectionMethod.MANUAL,
//             matchedKeywords: [],
//           }
//         : await this.detectProductType(productData);

//       if (detection.productType) {
//         semantics.productTypeId = detection.productType.id;
//         semantics.detectedActivity = detection.productType.activityId;
//         semantics.confidenceScore = detection.confidence;
//         semantics.detectionMethod = detection.method as DetectionMethod;
//         semantics.lastDetection = new Date();

//         // تسجيل تاريخ الكشف
//         semantics.detectionLog = [
//           {
//             timestamp: new Date(),
//             method: detection.method as DetectionMethod,
//             confidence: detection.confidence,
//             activity: detection.productType.activityId,
//           },
//         ];

//         // إضافة metadata من نوع المنتج
//         semantics.metadata = {
//           isSensitive: detection.productType.metadata?.isSensitive,
//           requiresLicense: detection.productType.metadata?.requiresLicense,
//           flags:
//             detection.matchedKeywords.length > 0
//               ? [`تم الكشف بـ ${detection.matchedKeywords.length} كلمة مفتاحية`]
//               : undefined,
//         };

//         // التحقق من الامتثال مع المتجر
//         if (store) {
//           const complianceCheck = await this.checkComplianceWithStore(
//             productData,
//             detection.productType,
//             store,
//           );

//           semantics.complianceStatus = complianceCheck.complianceStatus;
//           semantics.validationFlags = complianceCheck.violations;

//           if (complianceCheck.shadowActions) {
//             semantics.shadowActions = complianceCheck.shadowActions;
//           }
//         }
//       }

//       return semantics;
//     } catch (error) {
//       console.error("❌ خطأ في بناء دلالات المنتج:", error);
//       return semantics;
//     }
//   },

//   // 🔹 3. نظام قرارات ثلاثي محسَن
//   async makeComplianceDecision(
//     productData: Partial<Product>,
//     productType: ProductType | null,
//     store?: Store,
//   ): Promise<ComplianceCheckResult> {
//     const result: ComplianceCheckResult = {
//       decision: ComplianceDecision.ALLOW,
//       complianceStatus: ComplianceStatus.COMPLIANT,
//       productStatus: ProductStatus.ACTIVE, // ✅ افتراضياً active
//       violations: [],
//       warnings: [],
//       suggestedActions: [],
//     };

//     try {
//       // 1. تحقق من وجود بيانات زراعية كاملة
//       const hasAgricultureData = productData.metadata?.agricultureSpecific;
//       const agricultureComplete =
//         hasAgricultureData &&
//         hasAgricultureData.agricultureType &&
//         hasAgricultureData.isOrganic !== undefined;

//       // 🔥 التعديل المهم: إذا كان المنتج زراعي وبياناته مكتملة
//       if (productType?.activityId === "agriculture" && agricultureComplete) {
//         console.log("🌱 منتج زراعي مكتمل - الموافقة المباشرة");
//         return {
//           decision: ComplianceDecision.ALLOW,
//           complianceStatus: ComplianceStatus.COMPLIANT,
//           productStatus: ProductStatus.ACTIVE, // ✅ نشط مباشرة
//           violations: [],
//           warnings: [],
//           suggestedActions: [],
//         };
//       }

//       // 2. حالات المنع المباشر (block) - تبقى كما هي
//       const blockReasons = this.checkBlockConditions(productData, store);
//       if (blockReasons.length > 0) {
//         return {
//           decision: ComplianceDecision.BLOCK,
//           complianceStatus: ComplianceStatus.NON_COMPLIANT,
//           productStatus: ProductStatus.SUSPENDED,
//           violations: blockReasons,
//           warnings: [],
//           suggestedActions: ["الاتصال بالدعم"],
//         };
//       }

//       // 3. 🔥 تعديل: عدم تطابق النشاط = تحذير فقط، ليس مراجعة
//       if (productType && store) {
//         const storeActivities = store.businessActivities?.subActivities || [];
//         const productActivity = productType.activityId;

//         if (productActivity && !storeActivities.includes(productActivity)) {
//           // ⚠️ تغيير: تحذير فقط، ليس مراجعة
//           result.warnings.push(
//             `نشاط المنتج (${productActivity}) غير مسجل للمتجر - ينصح بإضافة النشاط`,
//           );
//           result.suggestedActions.push(
//             "يمكنك طلب إضافة هذا النشاط إلى متجرك من إعدادات المتجر",
//           );
//         }
//       }

//       // 4. التحقق من البيانات المطلوبة
//       if (productType) {
//         const missingFields = this.checkRequiredFields(
//           productData,
//           productType,
//         );
//         if (missingFields.length > 0) {
//           // ⚠️ تحذير فقط للمنتجات العادية، منع للمنتجات الحساسة
//           if (productType.metadata?.isSensitive) {
//             result.decision = ComplianceDecision.REVIEW_REQUIRED;
//             result.complianceStatus = ComplianceStatus.NON_COMPLIANT;
//             result.productStatus = ProductStatus.UNDER_REVIEW;
//             result.violations.push(
//               `هناك ${missingFields.length} حقل مطلوب غير مكتمل لمنتج حساس`,
//             );
//           } else {
//             result.warnings.push(
//               `هناك ${missingFields.length} حقل مطلوب غير مكتمل`,
//             );
//           }
//           result.suggestedActions.push(`إضافة: ${missingFields.join(", ")}`);
//         }
//       }

//       // 5. 🔥 التعديل الأخير: تأكيد النشاط للمنتجات الزراعية المكتملة
//       if (result.decision === ComplianceDecision.ALLOW) {
//         result.productStatus = ProductStatus.ACTIVE;
//         result.complianceStatus = ComplianceStatus.COMPLIANT;

//         // تأكيد خاص للمنتجات الزراعية
//         if (productType?.activityId === "agriculture") {
//           console.log("✅ منتج زراعي مكتمل - تمت الموافقة تلقائياً");
//         }
//       }

//       return result;
//     } catch (error) {
//       console.error("❌ خطأ في اتخاذ قرار الامتثال:", error);
//       return {
//         decision: ComplianceDecision.REVIEW_REQUIRED,
//         complianceStatus: ComplianceStatus.PENDING_REVIEW,
//         productStatus: ProductStatus.UNDER_REVIEW,
//         violations: ["خطأ في التحقق من الامتثال"],
//         warnings: ["حاول مرة أخرى لاحقًا"],
//         suggestedActions: [],
//       };
//     }
//   },

//   // 🔹 9. كشف نوع المنتج محسَن
//   // 🔹 تحديث الدالة في complianceSystem (ابحث عن هذه الدالة في الملف)
//   async detectProductType(
//     productData: Partial<Product>,
//   ): Promise<ProductTypeDetection> {
//     try {
//       const searchText = [
//         productData.name || "",
//         productData.description || "",
//         productData.shortDescription || "",
//         ...(productData.tags || []),
//         productData.brand || "",
//         productData.category || "",
//       ]
//         .filter((text) => text && text.trim())
//         .join(" ")
//         .toLowerCase()
//         .replace(/[^\w\u0600-\u06FF\s]/g, " ")
//         .replace(/\s+/g, " ")
//         .trim();

//       if (!searchText || searchText.length < 3) {
//         return {
//           productType: null,
//           confidence: 0,
//           method: DetectionMethod.NONE,
//           matchedKeywords: [],
//         };
//       }

//       // 🔥 🔥 🔥 التحديث الجديد: إعطاء أولوية عالية للزراعة 🔥 🔥 🔥
//       console.log("🔍 نص البحث للكشف:", searchText);

//       let bestMatch: ProductType | null = null;
//       let highestScore = 0;
//       let matchedKeywords: string[] = [];
//       let detectionMethod = DetectionMethod.RULES;

//       // 🔥 الخطوة 1: البحث عن الزراعة أولاً (أولوية قصوى)
//       const agricultureKeywords = [
//         "سماد",
//         "بذور",
//         "زراعة",
//         "نبات",
//         "شجرة",
//         "فاكهة",
//         "خضروات",
//         "محصول",
//         "ري",
//         "تربة",
//         "مبيد",
//         "اسمدة",
//         "زراعي",
//         "فلاحة",
//         "ثمار",
//         "حبوب",
//         "قمح",
//         "شعير",
//         "ذرة",
//         "أرز",
//         "قطن",
//         "عضوي",
//         "طبيعي",
//         "بيئة",
//         "محاصيل",
//         "تسميد",
//         "نمو",
//         "شتلة",
//         "شتلات",
//       ];

//       const agricultureType = DEFAULT_PRODUCT_TYPES.find(
//         (pt) => pt.id === "pt_agriculture_011",
//       );

//       if (agricultureType) {
//         let agricultureScore = 0;
//         const agricultureMatched: string[] = [];

//         // تحقق من الكلمات الزراعية في نص البحث
//         for (const keyword of agricultureKeywords) {
//           if (searchText.includes(keyword.toLowerCase())) {
//             agricultureScore += 20; // زيادة كبيرة للزراعة
//             agricultureMatched.push(keyword);
//           }
//         }

//         // زيادة إضافية إذا كان الاسم يحتوي على كلمات زراعية مباشرة
//         const productName = (productData.name || "").toLowerCase();
//         if (productName.includes("سماد")) {
//           agricultureScore += 40; // زيادة هائلة لكلمة "سماد"
//         }
//         if (productName.includes("بذور")) {
//           agricultureScore += 35;
//         }
//         if (productName.includes("زراعة")) {
//           agricultureScore += 30;
//         }

//         // إذا كان هناك تطابق زراعي قوي
//         if (agricultureScore > 0) {
//           console.log(`🌱 اكتشاف زراعي: ${agricultureScore} نقطة`, {
//             matched: agricultureMatched,
//             name: productData.name,
//           });

//           if (agricultureScore > highestScore) {
//             highestScore = agricultureScore;
//             bestMatch = agricultureType;
//             matchedKeywords = agricultureMatched;
//             detectionMethod = DetectionMethod.PATTERN;
//           }
//         }
//       }

//       // 🔥 الخطوة 2: البحث في باقي الأنواع (إذا لم يكن هناك تطابق زراعي قوي)
//       if (!bestMatch || highestScore < 30) {
//         for (const productType of DEFAULT_PRODUCT_TYPES) {
//           // تخطي الزراعة إذا تم معالجتها مسبقاً
//           if (
//             productType.id === "pt_agriculture_011" &&
//             bestMatch?.id === "pt_agriculture_011"
//           ) {
//             continue;
//           }

//           let score = 0;
//           const typeMatchedKeywords: string[] = [];

//           // الكشف بالكلمات المفتاحية
//           for (const keyword of productType.keywords) {
//             const keywordLower = keyword.toLowerCase();

//             // تطابق كامل
//             if (searchText.includes(keywordLower)) {
//               score += 10;
//               typeMatchedKeywords.push(keyword);
//             }
//             // تطابق جزئي
//             else if (
//               keywordLower.includes(" ") &&
//               keywordLower
//                 .split(" ")
//                 .some((word) => word.length > 3 && searchText.includes(word))
//             ) {
//               score += 5;
//               typeMatchedKeywords.push(keyword);
//             }
//           }

//           // تطابق مع الفئة
//           if (productData.category && productType.rules.allowedCategories) {
//             const categoryLower = productData.category.toLowerCase();
//             const matchesCategory = productType.rules.allowedCategories.some(
//               (cat) => categoryLower.includes(cat.toLowerCase()),
//             );
//             if (matchesCategory) {
//               score += 15;
//             }
//           }

//           // تطابق مع العلامة التجارية (لكل نوع)
//           if (productData.brand) {
//             const brandLower = productData.brand.toLowerCase();
//             const electronicsBrands = ["سامسونج", "أبل", "شاومي", "هواوي"];
//             const clothingBrands = ["زارا", "h&m", "نايك", "أديداس"];

//             if (
//               productType.activityId === "electronics" &&
//               electronicsBrands.some((b) =>
//                 brandLower.includes(b.toLowerCase()),
//               )
//             ) {
//               score += 10;
//             }
//             if (
//               productType.activityId === "fashion" &&
//               clothingBrands.some((b) => brandLower.includes(b.toLowerCase()))
//             ) {
//               score += 10;
//             }
//           }

//           // تحديث أفضل تطابق
//           if (score > highestScore) {
//             highestScore = score;
//             bestMatch = productType;
//             matchedKeywords = typeMatchedKeywords;
//             detectionMethod =
//               score > 30 ? DetectionMethod.AI : DetectionMethod.RULES;
//           }
//         }
//       }

//       // 🔥 الخطوة 3: إذا لم يتم العثور على تطابق قوي
//       if (!bestMatch || highestScore < 20) {
//         // محاولة الكشف بالأنماط مع أولوية الزراعة
//         const patterns = [
//           {
//             pattern: /(سماد|بذور|زراعة|نبات|تربة|مبيد|اسمدة|زراعي|فلاحة)/i,
//             typeId: "pt_agriculture_011",
//             priority: 100, // 🔥 أعلى أولوية
//           },
//           {
//             pattern: /(لحم|لحوم|دجاج|بيض|حليب|ألبان|أسماك|مأكولات بحرية)/i,
//             typeId: "pt_livestock_012",
//             priority: 90,
//           },
//           {
//             pattern: /(هاتف|جوال|موبايل|سمارت فون|iphone|android)/i,
//             typeId: "pt_electronics_001",
//             priority: 80,
//           },
//           {
//             pattern: /(عباية|حجاب|غطاء|خمار|قميص|بنطال|فستان)/i,
//             typeId: "pt_clothing_002",
//             priority: 80,
//           },
//           {
//             pattern: /(طعام|أكل|وجبة|مطعم|سفري|بيتزا|برجر)/i,
//             typeId: "pt_food_003",
//             priority: 80,
//           },
//           {
//             pattern: /(مكياج|كريم|مستحضر|تجميل|عطر)/i,
//             typeId: "pt_cosmetics_004",
//             priority: 80,
//           },
//         ];

//         // ترتيب الأنماط حسب الأولوية
//         patterns.sort((a, b) => b.priority - a.priority);

//         for (const { pattern, typeId } of patterns) {
//           if (pattern.test(searchText)) {
//             bestMatch =
//               DEFAULT_PRODUCT_TYPES.find((pt) => pt.id === typeId) || null;
//             if (bestMatch) {
//               highestScore = 25;
//               detectionMethod = DetectionMethod.PATTERN;
//               matchedKeywords = [pattern.toString()];
//               console.log(`🎯 تم الكشف بالنمط: ${typeId}`, pattern);
//               break;
//             }
//           }
//         }
//       }

//       const confidence = Math.min(highestScore / 50, 1);

//       // 🔥 تسجيل النتيجة النهائية
//       console.log("🎯 نتيجة الكشف النهائية:", {
//         productType: bestMatch?.name,
//         confidence,
//         method: detectionMethod,
//         matchedKeywords,
//         score: highestScore,
//       });

//       // اقتراح فئات بناءً على نوع المنتج
//       let suggestedCategories: string[] = [];
//       if (bestMatch?.rules.allowedCategories) {
//         suggestedCategories = bestMatch.rules.allowedCategories;
//       }

//       return {
//         productType: bestMatch,
//         confidence,
//         method: detectionMethod,
//         matchedKeywords,
//         suggestedCategories,
//       };
//     } catch (error) {
//       console.error("❌ خطأ في اكتشاف نوع المنتج:", error);
//       return {
//         productType: null,
//         confidence: 0,
//         method: DetectionMethod.NONE,
//         matchedKeywords: [],
//       };
//     }
//   },

//   // 🔹 10. التحقق من التوافق مع المتجر (المُحسَّن للنظام الذكي)
//   async checkComplianceWithStore(
//     productData: Partial<Product>,
//     productType: ProductType,
//     store: Store,
//   ): Promise<{
//     isCompliant: boolean;
//     complianceStatus: ComplianceStatus;
//     violations: string[];
//     suggestedActions: string[];
//     shadowActions?: {
//       hideFromStore?: boolean;
//       hideFromSearch?: boolean;
//       limitPurchase?: boolean;
//     };
//   }> {
//     const violations: string[] = [];
//     const suggestedActions: string[] = [];
//     let shadowActions;

//     // 🔧 دالة مساعدة للحصول على تسمية النشاط
//     const getActivityLabel = (activity: string): string => {
//       const activityLabels: Record<string, string> = {
//         agriculture: "زراعة",
//         "agricultural-products": "منتجات زراعية",
//         "seeds-fertilizers": "بذور وأسمدة",
//         livestock: "مواشي ودواجن",
//         fisheries: "ثروة سمكية",
//         food: "طعام ومشروبات",
//         fashion: "أزياء وملابس",
//         electronics: "إلكترونيات",
//         "home-garden": "منزل وحديقة",
//         cosmetics: "صحة وجمال",
//         books: "كتب",
//         sports: "رياضة",
//         toys: "ألعاب",
//         automotive: "سيارات",
//         jewelry: "مجوهرات",
//       };

//       return activityLabels[activity] || activity;
//     };

//     // 🔧 دالة مساعدة للعثور على النشاط الرئيسي
//     const findMainActivity = (activity: string): string => {
//       for (const [mainActivity, compatibleActivities] of Object.entries(
//         ACTIVITY_COMPATIBILITY_MAP,
//       )) {
//         if (compatibleActivities.includes(activity)) {
//           return mainActivity;
//         }
//       }
//       return activity;
//     };

//     // 1. 🔍 التحقق من تطابق النشاط باستخدام النظام الذكي
//     const storeActivities = store.businessActivities?.subActivities || [];
//     const productActivity = productType.activityId;

//     if (productActivity) {
//       // 🔥 استخدام نظام التوافق الذكي
//       const isCompatible = checkActivityCompatibility(
//         productActivity,
//         storeActivities,
//       );

//       if (!isCompatible) {
//         violations.push(
//           `نشاط المنتج (${getActivityLabel(productActivity)}) غير متوافق مع أنشطة المتجر`,
//         );
//         suggestedActions.push(
//           `يمكنك إضافة نشاط "${getActivityLabel(findMainActivity(productActivity))}" إلى متجرك`,
//         );

//         shadowActions = {
//           hideFromSearch: true,
//           limitPurchase: true,
//           showWarning: true,
//         };

//         console.log(`⚠️ عدم تطابق النشاط: ${productActivity}`, {
//           storeActivities,
//           productType: productType.name,
//           isCompatible,
//           compatibilityCheck: checkActivityCompatibility(
//             productActivity,
//             storeActivities,
//           ),
//         });
//       } else {
//         console.log(`✅ نشاط متوافق: ${productActivity}`, {
//           storeActivities,
//           productType: productType.name,
//         });
//       }
//     }

//     // 2. ⭐⭐ التحديث المهم: التحقق من الفئات باستخدام اسم التصنيف وليس ID
//     if (productData.category) {
//       try {
//         // 🔥 جلب معلومات التصنيف من قاعدة البيانات
//         const categoryDoc = await getDoc(
//           doc(db, "categories", productData.category),
//         );

//         if (categoryDoc.exists()) {
//           const categoryData = categoryDoc.data();
//           const categoryName = categoryData.name || "";
//           const categorySlug = categoryData.slug || "";

//           // التحقق من الفئات المسموحة
//           if (productType.rules.allowedCategories) {
//             const isCategoryAllowed = productType.rules.allowedCategories.some(
//               (allowedCat) => {
//                 // تحقق من slug إذا كان موجوداً، وإلا فتحقق من الاسم
//                 if (categorySlug) {
//                   return categorySlug
//                     .toLowerCase()
//                     .includes(allowedCat.toLowerCase());
//                 } else {
//                   return categoryName
//                     .toLowerCase()
//                     .includes(allowedCat.toLowerCase());
//                 }
//               },
//             );

//             if (!isCategoryAllowed) {
//               violations.push(
//                 `فئة "${categoryName}" غير مناسبة لهذا النوع من المنتجات`, // ⭐ عرض الاسم وليس ID
//               );
//               suggestedActions.push(
//                 `اختر فئة من: ${productType.rules.allowedCategories.join(", ")}`,
//               );
//             }
//           }
//         } else {
//           // إذا لم يتم العثور على التصنيف، تحقق مباشرة من القيمة
//           if (productType.rules.allowedCategories) {
//             const isCategoryAllowed = productType.rules.allowedCategories.some(
//               (cat) =>
//                 productData.category!.toLowerCase().includes(cat.toLowerCase()),
//             );

//             if (!isCategoryAllowed) {
//               violations.push(
//                 `التصنيف المحدد غير مناسب لهذا النوع من المنتجات`,
//               );
//             }
//           }
//         }
//       } catch (error) {
//         console.warn("⚠️ خطأ في جلب معلومات التصنيف:", error);
//         // في حالة الخطأ، تخطي التحقق من الفئة
//       }
//     }

//     // 3. التحقق من الحقول المطلوبة حسب نوع المنتج
//     if (productType.rules?.requiredFields) {
//       for (const field of productType.rules.requiredFields) {
//         if (
//           !productData.specifications?.[field] &&
//           !(productData as any)[field]
//         ) {
//           violations.push(`الحقل المطلوب ${field} مفقود`);
//           suggestedActions.push(`أضف حقل ${field} إلى مواصفات المنتج`);
//         }
//       }
//     }

//     const isCompliant = violations.length === 0;
//     const complianceStatus = isCompliant
//       ? ComplianceStatus.COMPLIANT
//       : violations.some((v) => v.includes("غير مسجل"))
//         ? ComplianceStatus.NON_COMPLIANT
//         : ComplianceStatus.PENDING_REVIEW;

//     return {
//       isCompliant,
//       complianceStatus,
//       violations,
//       suggestedActions,
//       shadowActions,
//     };
//   },

//   // 🔹 11. التحقق من الحقول المطلوبة محسَن
//   checkRequiredFields(
//     productData: Partial<Product>,
//     productType: ProductType,
//   ): string[] {
//     const missingFields: string[] = [];

//     // الحقول الأساسية المطلوبة لجميع المنتجات
//     const baseRequired = ["name", "price", "description"];
//     for (const field of baseRequired) {
//       if (
//         !productData[field as keyof Product] ||
//         (typeof productData[field as keyof Product] === "string" &&
//           (productData[field as keyof Product] as string).trim() === "")
//       ) {
//         missingFields.push(field);
//       }
//     }

//     // ⭐ تحديث: الحقول المطلوبة حسب نوع المنتج (خاص بالزراعة)
//     if (productType?.rules?.requiredFields) {
//       const isAgriculture = productType.activityId === "agriculture";

//       for (const field of productType.rules.requiredFields) {
//         let fieldExists = false;

//         // 1. البحث في الحقول المباشرة للمنتج
//         const directFieldValue = (productData as any)[field];
//         if (directFieldValue && directFieldValue.toString().trim() !== "") {
//           fieldExists = true;
//         }

//         // 2. البحث في المواصفات
//         if (!fieldExists && productData.specifications?.[field]) {
//           fieldExists = true;
//         }

//         // 3. ⭐ البحث في agricultureSpecific للمنتجات الزراعية
//         if (
//           !fieldExists &&
//           isAgriculture &&
//           productData.metadata?.agricultureSpecific
//         ) {
//           const agriField = productData.metadata.agricultureSpecific[field];
//           if (agriField && agriField.toString().trim() !== "") {
//             fieldExists = true;
//           }
//         }

//         if (!fieldExists) {
//           missingFields.push(field);
//         }
//       }
//     }

//     return missingFields;
//   },

//   // 🔹 12. باقي الدوال الحالية (مع تعديلات طفيفة)
//   checkBlockConditions(productData: Partial<Product>, store?: Store): string[] {
//     const blockReasons: string[] = [];

//     // 1. المنتج غير قانوني حسب البلد
//     const illegalProducts = [
//       "مخدرات",
//       "أسلحة",
//       "كحول",
//       "تبغ",
//       "ممنوع",
//       "محظور",
//     ];
//     const productName = (productData.name || "").toLowerCase();
//     const productDesc = (productData.description || "").toLowerCase();

//     for (const illegal of illegalProducts) {
//       if (productName.includes(illegal) || productDesc.includes(illegal)) {
//         blockReasons.push(`المنتج غير قانوني (${illegal})`);
//         break;
//       }
//     }

//     // 2. نقص بيانات إلزامية حرجة
//     if (!productData.name || productData.name.trim().length < 2) {
//       blockReasons.push("اسم المنتج غير صالح (يجب أن يكون على الأقل حرفين)");
//     }

//     if (productData.price === undefined || productData.price < 0) {
//       blockReasons.push("السعر غير صالح");
//     }

//     // 3. محاولة تلاعب (مثل إرسال _semantics مزيفة)
//     if ((productData as any)._semantics) {
//       blockReasons.push("محاولة تلاعب في بيانات الامتثال");
//     }

//     // 4. مخالفة صريحة لقوانين المنصة
//     const forbiddenTerms = ["احتيال", "نصب", "خداع", "مزور", "مقلد"];
//     for (const term of forbiddenTerms) {
//       if (productName.includes(term) || productDesc.includes(term)) {
//         blockReasons.push("ينتهي شروط وأحكام المنصة");
//         break;
//       }
//     }

//     // 5. منتجات حساسة بدون تراخيص
//     const productType = DEFAULT_PRODUCT_TYPES.find(
//       (pt) => pt.id === (productData as any)?.productTypeId,
//     );
//     if (
//       productType?.metadata?.requiresLicense &&
//       !store?.commercialRegistration
//     ) {
//       blockReasons.push("المنتج يحتاج تراخيص والمتجر غير مرخص");
//     }

//     return blockReasons;
//   },

//   // ... باقي الدوال الحالية مع تعديلات بسيطة
//   applyShadowActions: function (
//     productId: string,
//     shadowActions: {
//       hideFromStore?: boolean;
//       hideFromSearch?: boolean;
//       limitPurchase?: boolean;
//     },
//   ): void {
//     console.log("🔄 تطبيق إجراءات خفية:", {
//       productId,
//       actions: shadowActions,
//     });
//   },

//   // ============ معالجة المخالفات ============

//   async handleComplianceViolation(
//     productId: string,
//     storeId: string,
//     violationType: string,
//     details: any,
//   ): Promise<void> {
//     try {
//       const product = await productService.getById(productId);
//       if (!product) return;

//       // إنشاء مخالفة
//       const complianceFlag: Omit<ComplianceFlag, "id"> = {
//         storeId,
//         productId,
//         issueType: violationType as any,
//         severity: details.severity || "medium",
//         details,
//         status: "pending",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       await addDoc(collection(db, "complianceFlags"), complianceFlag);

//       console.log(`⚠️ تم تسجيل مخالفة للمنتج ${productId}:`, violationType);
//     } catch (error) {
//       console.error("❌ خطأ في معالجة المخالفة:", error);
//     }
//   },

//   // ============ فحص دفعي ============
//   async batchComplianceCheck(storeId: string): Promise<{
//     checked: number;
//     compliant: number;
//     nonCompliant: number;
//     errors: number;
//   }> {
//     try {
//       const products = await productService.getByStore(storeId, "all");
//       let compliant = 0;
//       let nonCompliant = 0;
//       let errors = 0;

//       for (const product of products) {
//         try {
//           // إعادة بناء semantics في السيرفر
//           const store = await storeService.getById(storeId);
//           const semantics = await this.buildProductSemantics(product, store);

//           // اتخاذ قرار الامتثال
//           const decision = await this.makeComplianceDecision(
//             product,
//             DEFAULT_PRODUCT_TYPES.find(
//               (pt) => pt.id === semantics.productTypeId,
//             ),
//             store,
//           );

//           // تحديث حالة المنتج
//           await productService.update(product.id, {
//             _semantics: semantics,
//             status: decision.productStatus,
//           } as Partial<Product>);

//           if (decision.decision === ComplianceDecision.ALLOW) {
//             compliant++;
//           } else {
//             nonCompliant++;
//           }
//         } catch (error) {
//           console.error(`❌ خطأ في تحقق المنتج ${product.id}:`, error);
//           errors++;
//         }
//       }

//       // تحديث إحصائيات المتجر
//       const total = products.length;
//       const complianceRate = total > 0 ? (compliant / total) * 100 : 100;

//       await storeService.update(storeId, {
//         complianceStats: {
//           totalProducts: total,
//           compliantProducts: compliant,
//           flaggedProducts: nonCompliant,
//           lastCheck: new Date(),
//           complianceRate,
//         },
//       });

//       return {
//         checked: products.length,
//         compliant,
//         nonCompliant,
//         errors,
//       };
//     } catch (error) {
//       console.error("❌ خطأ في الفحص الدفعي:", error);
//       return {
//         checked: 0,
//         compliant: 0,
//         nonCompliant: 0,
//         errors: 1,
//       };
//     }
//   },
// };

// // ============ Store Services ============

// export const storeService = {
//   async create(
//     storeData: Omit<Store, "id" | "createdAt" | "updatedAt"> | Partial<Store>, // ✅ اسمح بكل من Omit وPartial
//   ): Promise<string> {
//     try {
//       // 🔥 1. القيم الافتراضية الأساسية
//       const defaultStore: Omit<Store, "id" | "createdAt" | "updatedAt"> = {
//         // الحقول المطلوبة
//         ownerId: "",
//         name: "",
//         description: "",
//         logo: "",
//         subdomain: "",
//         template: "simple",
//         industry: "general",

//         // 🔥 نظام الامتثال التدريجي (الجديد)
//         checklist: {
//           addProduct: false,
//           addCategories: false,
//           enableShipping: false,
//           enablePayment: false,
//           verification: false,
//           customDomain: false,
//           seoOptimization: false,
//         },
//         complianceLevel: "basic",
//         legalStatus: "unverified",
//         riskScore: 0,

//         // الأنشطة التجارية
//         businessActivities: {
//           mainActivity: "general",
//           subActivities: [],
//           registrationNumber: `REG-${Date.now()}`,
//           taxNumber: "",
//           issueDate: new Date(),
//           expiryDate: undefined,
//           businessType: "retail",
//           industry: "general",
//           legalStructure: "sole_proprietorship",
//         },

//         // إعدادات الامتثال
//         complianceSettings: {
//           autoDetection: true,
//           strictMode: false,
//           notifyOnViolation: true,
//           allowedDeviations: [],
//           reviewThreshold: 10,
//         },

//         // العملة واللغة
//         currency: "YER",
//         timezone: "Asia/Aden",
//         language: "ar",

//         // التخصيص
//         customization: ensureEnhancedCustomization({
//           colors: undefined,
//           fonts: undefined,
//           layout: undefined,
//           homepage: undefined,
//           pages: undefined,
//           effects: undefined,
//           branding: undefined,
//         }),

//         // الإعدادات التشغيلية
//         settings: {
//           currency: "YER",
//           language: "ar",
//           timezone: "Asia/Aden",

//           notifications: {
//             emailNotifications: true,
//             pushNotifications: true,
//             smsNotifications: false,
//           },

//           shipping: {
//             enabled: false,
//             freeShippingThreshold: 0,
//             shippingCost: 0,
//             defaultCost: 0,
//             zones: [],
//             methods: [],
//           },

//           payment: {
//             cashOnDelivery: true,
//             bankTransfer: false,
//             creditCard: false,
//             paypal: false,
//             stripe: false,
//             mada: false,
//             mobileWallet: false,
//             bankInfo: {
//               bankName: "",
//               accountNumber: "",
//               accountName: "",
//             },
//           },

//           taxes: {
//             enabled: false,
//             includeInPrice: false,
//             rate: 0,
//           },
//         },

//         // بيانات الاتصال
//         contact: {
//           phone: "",
//           email: "",
//           address: "",
//           city: "",
//           governorate: "",
//           country: "اليمن",
//           zipCode: "",
//           originalCity: "",
//         },

//         // وسائل التواصل
//         socialMedia: {},

//         // إحصائيات الامتثال
//         complianceStats: {
//           totalProducts: 0,
//           compliantProducts: 0,
//           flaggedProducts: 0,
//           lastCheck: new Date(),
//           complianceRate: 100,
//         },

//         // حالة المتجر
//         status: "pending",
//       };

//       // 🔥 2. دمج البيانات الواردة مع القيم الافتراضية
//       const mergedData: Omit<Store, "id" | "createdAt" | "updatedAt"> = {
//         ...defaultStore,
//         ...storeData, // البيانات الواردة تتجاوز الافتراضيات

//         // 🔥 معالجة businessActivities بشكل خاص
//         businessActivities: storeData.businessActivities
//           ? {
//               ...defaultStore.businessActivities,
//               ...storeData.businessActivities,
//               // تأكد من أن subActivities هي array
//               subActivities: Array.isArray(
//                 storeData.businessActivities.subActivities,
//               )
//                 ? storeData.businessActivities.subActivities
//                 : defaultStore.businessActivities.subActivities,
//             }
//           : defaultStore.businessActivities,

//         // 🔥 معالجة customization
//         customization: storeData.customization
//           ? ensureEnhancedCustomization(storeData.customization)
//           : defaultStore.customization,

//         // 🔥 معالجة checklist (لنظام الامتثال الجديد)
//         checklist: storeData.checklist
//           ? { ...defaultStore.checklist, ...storeData.checklist }
//           : defaultStore.checklist,

//         // 🔥 معالجة complianceSettings
//         complianceSettings: storeData.complianceSettings
//           ? {
//               ...defaultStore.complianceSettings,
//               ...storeData.complianceSettings,
//             }
//           : defaultStore.complianceSettings,

//         // 🔥 معالجة settings
//         settings: storeData.settings
//           ? {
//               ...defaultStore.settings,
//               ...storeData.settings,
//               // دمج payment بشكل خاص
//               payment: storeData.settings?.payment
//                 ? {
//                     ...defaultStore.settings.payment,
//                     ...storeData.settings.payment,
//                   }
//                 : defaultStore.settings.payment,
//               // دمج shipping بشكل خاص
//               shipping: storeData.settings?.shipping
//                 ? {
//                     ...defaultStore.settings.shipping,
//                     ...storeData.settings.shipping,
//                   }
//                 : defaultStore.settings.shipping,
//             }
//           : defaultStore.settings,

//         // 🔥 معالجة contact
//         contact: storeData.contact
//           ? { ...defaultStore.contact, ...storeData.contact }
//           : defaultStore.contact,
//       };

//       // 🔥 3. التحقق من الحقول المطلوبة
//       if (!mergedData.name || mergedData.name.trim() === "") {
//         throw new Error("❌ اسم المتجر مطلوب");
//       }

//       if (!mergedData.subdomain || mergedData.subdomain.trim() === "") {
//         throw new Error("❌ رابط المتجر مطلوب");
//       }

//       if (!mergedData.ownerId || mergedData.ownerId.trim() === "") {
//         throw new Error("❌ معرف المالك مطلوب");
//       }

//       // 🔥 4. تنظيف البيانات وإضافة التواريخ
//       const storeDataToSave = {
//         ...mergedData,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       const cleanedData = cleanFirestoreData(storeDataToSave);

//       // 🔥 5. الحفظ في Firestore
//       const docRef = await addDoc(collection(db, "stores"), cleanedData);

//       console.log("✅ تم إنشاء متجر بنظام 3 خطوات:", {
//         storeId: docRef.id,
//         name: mergedData.name,
//         subdomain: mergedData.subdomain,
//         checklist: mergedData.checklist,
//         status: mergedData.status,
//         time: "60-90 ثانية",
//       });

//       return docRef.id;
//     } catch (error) {
//       console.error("❌ خطأ في إنشاء المتجر:", error);
//       throw error;
//     }
//   },
//   // ⭐ أضف هذه الدالة المساعدة لاستخراج businessActivities
//   async extractAndUpdateBusinessActivities(
//     storeId: string,
//     newData?: {
//       mainActivity?: string;
//       subActivities?: string[];
//       businessType?: string;
//       industry?: string;
//     },
//   ): Promise<void> {
//     try {
//       const store = await this.getById(storeId);
//       if (!store) {
//         throw new Error("المتجر غير موجود");
//       }

//       let businessActivities: BusinessActivities;

//       if (store.businessActivities) {
//         // تحديث البيانات الحالية
//         businessActivities = {
//           ...store.businessActivities,
//           ...newData,
//           subActivities:
//             newData?.subActivities ||
//             store.businessActivities.subActivities ||
//             [],
//         };
//       } else {
//         // إنشاء جديد
//         businessActivities = {
//           mainActivity: newData?.mainActivity || store.industry || "retail",
//           subActivities: newData?.subActivities || [],
//           registrationNumber:
//             store.businessActivities?.registrationNumber || `REG-${Date.now()}`,
//           taxNumber: store.businessActivities?.taxNumber || "",
//           issueDate: store.businessActivities?.issueDate || new Date(),
//           expiryDate: store.businessActivities?.expiryDate,
//           businessType: newData?.businessType || store.industry || "retail",
//           industry: newData?.industry || store.industry || "general",
//           legalStructure: "sole_proprietorship",
//         };
//       }

//       await this.update(storeId, { businessActivities });

//       console.log("✅ تم تحديث الأنشطة التجارية:", {
//         storeId,
//         mainActivity: businessActivities.mainActivity,
//         subActivitiesCount: businessActivities.subActivities.length,
//       });
//     } catch (error) {
//       console.error("❌ خطأ في تحديث الأنشطة التجارية:", error);
//       throw error;
//     }
//   },

//   // تحديث دالة updateBusinessActivities الموجودة
//   async updateBusinessActivities(
//     storeId: string,
//     activities: Partial<BusinessActivities>,
//   ): Promise<void> {
//     try {
//       const store = await this.getById(storeId);
//       if (!store) {
//         throw new Error("المتجر غير موجود");
//       }

//       const currentActivities = store.businessActivities || {
//         mainActivity: "retail",
//         subActivities: [],
//         registrationNumber: `REG-${Date.now()}`,
//         taxNumber: "",
//         issueDate: new Date(),
//         expiryDate: undefined,
//         businessType: "retail",
//         industry: "general",
//         legalStructure: "sole_proprietorship",
//       };

//       const updatedActivities: BusinessActivities = {
//         ...currentActivities,
//         ...activities,
//         // تأكد من أن subActivities هي array
//         subActivities: Array.isArray(activities.subActivities)
//           ? activities.subActivities
//           : currentActivities.subActivities,
//         // الحفاظ على issueDate ما لم يتم تحديثه
//         issueDate: activities.issueDate || currentActivities.issueDate,
//       };

//       await this.update(storeId, {
//         businessActivities: updatedActivities,
//       });

//       console.log("✅ تم تحديث الأنشطة التجارية:", {
//         storeId,
//         mainActivity: updatedActivities.mainActivity,
//         subActivities: updatedActivities.subActivities,
//       });

//       // إذا كان هناك نظام امتثال، نفذ فحص الامتثال
//       if (complianceSystem) {
//         await complianceSystem.batchComplianceCheck(storeId);
//       }
//     } catch (error) {
//       console.error("❌ خطأ في تحديث الأنشطة التجارية:", error);
//       throw error;
//     }
//   },

//   // ⭐ دالة مساعدة لمعالجة البيانات القديمة
//   async migrateStoreBusinessData(storeId: string): Promise<void> {
//     try {
//       const store = await this.getById(storeId);
//       if (!store) {
//         throw new Error("المتجر غير موجود");
//       }

//       // التحقق إذا كان يحتاج إلى تحديث
//       const needsMigration =
//         !store.businessActivities ||
//         (store.customization &&
//           ("primaryBusinessType" in store.customization ||
//             "subBusinessTypes" in store.customization));

//       if (needsMigration) {
//         console.log(`🔄 جارٍ تحديث بيانات الأنشطة التجارية للمتجر: ${storeId}`);

//         // استخراج البيانات من مصادر مختلفة
//         let mainActivity = "retail";
//         let subActivities: string[] = [];

//         // 1. من customization القديم
//         if (store.customization) {
//           const cust = store.customization;
//           if ("primaryBusinessType" in cust) {
//             mainActivity = (cust as any).primaryBusinessType;
//           }
//           if ("subBusinessTypes" in cust) {
//             subActivities = (cust as any).subBusinessTypes || [];
//           }
//         }

//         // 2. من industry
//         if (store.industry && store.industry !== "general") {
//           mainActivity = store.industry;
//         }

//         // إنشاء/تحديث businessActivities
//         const businessActivities: BusinessActivities = {
//           mainActivity: mainActivity,
//           subActivities: subActivities,
//           registrationNumber:
//             store.businessActivities?.registrationNumber ||
//             `MIGR-${Date.now()}`,
//           taxNumber: store.businessActivities?.taxNumber || "",
//           issueDate: store.businessActivities?.issueDate || new Date(),
//           expiryDate: store.businessActivities?.expiryDate,
//           businessType: store.industry || "retail",
//           industry: store.industry || "general",
//           legalStructure:
//             store.businessActivities?.legalStructure || "sole_proprietorship",
//         };

//         // تنظيف customization (إزالة الخصائص المكررة)
//         let cleanedCustomization = store.customization;
//         if (
//           cleanedCustomization &&
//           ("primaryBusinessType" in cleanedCustomization ||
//             "subBusinessTypes" in cleanedCustomization)
//         ) {
//           const { primaryBusinessType, subBusinessTypes, ...rest } =
//             cleanedCustomization as any;
//           cleanedCustomization = rest;
//         }

//         // تحديث المتجر
//         await this.update(storeId, {
//           businessActivities,
//           customization: cleanedCustomization,
//         });

//         console.log(`✅ تم تحديث بيانات الأنشطة التجارية للمتجر: ${storeId}`, {
//           mainActivity,
//           subActivitiesCount: subActivities.length,
//         });
//       }
//     } catch (error) {
//       console.error(
//         `❌ خطأ في تحديث بيانات الأنشطة التجارية للمتجر ${storeId}:`,
//         error,
//       );
//     }
//   },

//   async getById(storeId: string): Promise<Store | null> {
//     try {
//       const docSnap = await getDoc(doc(db, "stores", storeId));
//       if (docSnap.exists()) {
//         const data = docSnap.data();
//         return { id: docSnap.id, ...data } as Store;
//       }
//       return null;
//     } catch (error) {
//       console.error("❌ خطأ في جلب المتجر:", error);
//       return null;
//     }
//   },

//   async getBySubdomain(subdomain: string): Promise<Store | null> {
//     try {
//       const q = query(
//         collection(db, "stores"),
//         where("subdomain", "==", subdomain),
//       );
//       const querySnapshot = await getDocs(q);
//       if (!querySnapshot.empty) {
//         const doc = querySnapshot.docs[0];
//         return { id: doc.id, ...doc.data() } as Store;
//       }
//       return null;
//     } catch (error) {
//       console.error("Error getting store by subdomain:", error);
//       return null;
//     }
//   },

//   async getByOwner(ownerId: string): Promise<Store[]> {
//     try {
//       const q = query(
//         collection(db, "stores"),
//         where("ownerId", "==", ownerId),
//       );
//       const querySnapshot = await getDocs(q);

//       return querySnapshot.docs.map(
//         (doc) => ({ id: doc.id, ...doc.data() }) as Store,
//       );
//     } catch (error) {
//       console.error("Error getting stores by owner:", error);
//       return [];
//     }
//   },

//   async update(storeId: string, data: Partial<Store>): Promise<void> {
//     const cleanedData = cleanFirestoreData({
//       ...data,
//       updatedAt: new Date(),
//     });

//     await updateDoc(doc(db, "stores", storeId), cleanedData);
//   },

//   async delete(storeId: string): Promise<void> {
//     await deleteDoc(doc(db, "stores", storeId));
//   },

//   async getAll(page = 1, pageSize = 20): Promise<Store[]> {
//     try {
//       const q = query(
//         collection(db, "stores"),
//         orderBy("createdAt", "desc"),
//         limit(pageSize),
//       );
//       const querySnapshot = await getDocs(q);

//       return querySnapshot.docs.map(
//         (doc) => ({ id: doc.id, ...doc.data() }) as Store,
//       );
//     } catch (error) {
//       console.error("Error getting all stores:", error);
//       return [];
//     }
//   },

//   async updateComplianceSettings(
//     storeId: string,
//     settings: Partial<Store["complianceSettings"]>,
//   ): Promise<void> {
//     try {
//       const store = await this.getById(storeId);
//       if (!store) {
//         throw new Error("المتجر غير موجود");
//       }

//       await updateDoc(doc(db, "stores", storeId), {
//         complianceSettings: {
//           ...store.complianceSettings,
//           ...settings,
//         },
//         updatedAt: new Date(),
//       });
//     } catch (error) {
//       console.error("❌ خطأ في تحديث إعدادات الامتثال:", error);
//       throw error;
//     }
//   },

//   // async updateBusinessActivities(
//   //   storeId: string,
//   //   activities: Store["businessActivities"],
//   // ): Promise<void> {
//   //   try {
//   //     await updateDoc(doc(db, "stores", storeId), {
//   //       businessActivities: cleanFirestoreData(activities),
//   //       updatedAt: new Date(),
//   //     });
//   //
//   //     await complianceSystem.batchComplianceCheck(storeId);
//   //   } catch (error) {
//   //     console.error("❌ خطأ في تحديث الأنشطة التجارية:", error);
//   //     throw error;
//   //   }
//   // },

//   async updateContactWithGovernorate(
//     storeId: string,
//     contactData: Partial<Store["contact"]>,
//   ): Promise<void> {
//     try {
//       const store = await this.getById(storeId);
//       if (!store) {
//         throw new Error("المتجر غير موجود");
//       }

//       await updateDoc(doc(db, "stores", storeId), {
//         contact: {
//           ...store.contact,
//           ...contactData,
//         },
//         updatedAt: new Date(),
//       });
//     } catch (error) {
//       console.error("❌ خطأ في تحديث بيانات الاتصال:", error);
//       throw error;
//     }
//   },

//   async updateBusinessInfo(
//     storeId: string,
//     businessInfo: {
//       taxNumber?: string;
//       commercialRegistration?: string;
//     },
//   ): Promise<void> {
//     try {
//       await updateDoc(doc(db, "stores", storeId), {
//         ...businessInfo,
//         updatedAt: new Date(),
//       });
//     } catch (error) {
//       console.error("❌ خطأ في تحديث المعلومات التجارية:", error);
//       throw error;
//     }
//   },

//   async updateYemeniPaymentSettings(
//     storeId: string,
//     paymentSettings: {
//       mada?: boolean;
//       mobileWallet?: boolean;
//       bankInfo?: {
//         bankName: string;
//         accountNumber: string;
//         accountName: string;
//         iban?: string;
//         swiftCode?: string;
//       };
//     },
//   ): Promise<void> {
//     try {
//       const store = await this.getById(storeId);
//       if (!store) {
//         throw new Error("المتجر غير موجود");
//       }

//       await updateDoc(doc(db, "stores", storeId), {
//         settings: {
//           ...store.settings,
//           payment: {
//             ...store.settings.payment,
//             ...paymentSettings,
//           },
//         },
//         updatedAt: new Date(),
//       });
//     } catch (error) {
//       console.error("❌ خطأ في تحديث إعدادات الدفع:", error);
//       throw error;
//     }
//   },

//   async updateShippingConfig(
//     storeId: string,
//     shippingConfig: {
//       zones?: ShippingZone[];
//       methods?: ShippingMethod[];
//     },
//   ): Promise<void> {
//     try {
//       const store = await this.getById(storeId);
//       if (!store) {
//         throw new Error("المتجر غير موجود");
//       }

//       await updateDoc(doc(db, "stores", storeId), {
//         settings: {
//           ...store.settings,
//           shipping: {
//             ...store.settings.shipping,
//             ...shippingConfig,
//           },
//         },
//         updatedAt: new Date(),
//       });
//     } catch (error) {
//       console.error("❌ خطأ في تحديث إعدادات الشحن:", error);
//       throw error;
//     }
//   },

//   async getByMerchantId(merchantId: string): Promise<Store | null> {
//     try {
//       // ✅ استخدام الإصدار 9 بشكل صحيح
//       const storesRef = collection(db, "stores");
//       const q = query(storesRef, where("ownerId", "==", merchantId));
//       const querySnapshot = await getDocs(q);

//       if (querySnapshot.empty) {
//         return null;
//       }

//       const docSnap = querySnapshot.docs[0];
//       return {
//         id: docSnap.id,
//         ...docSnap.data(),
//       } as Store;
//     } catch (error) {
//       console.error("Error getting store by merchant ID:", error);
//       throw error;
//     }
//   },
// };

// // ============ Product Services ============

// // ============ Product Service الكامل والمحدث ============

// // ============ Product Service الكامل والمحدث (Class Version) ============

// export class ProductService {
//   // دوال مساعدة داخلية
//   private convertFirestoreDataToProduct(
//     id: string,
//     data: Record<string, any>,
//     store?: Store, // ⭐ أضف هذا المعامل
//   ): Product {
//     const convertToDate = (timestamp: any): Date => {
//       if (!timestamp) return new Date();
//       if (timestamp.toDate) return timestamp.toDate();
//       if (timestamp instanceof Date) return timestamp;
//       return new Date(timestamp);
//     };
//     // ⭐ إنشاء دالة convertSemantics محلية
//     const convertSemantics = (semanticsData: any): Product["_semantics"] => {
//       if (!semanticsData) return undefined;

//       const semantics: Product["_semantics"] = {
//         productTypeId: semanticsData.productTypeId || undefined,
//         detectedActivity: semanticsData.detectedActivity || undefined,
//         confidenceScore: semanticsData.confidenceScore || 0,
//         complianceStatus:
//           semanticsData.complianceStatus || ComplianceStatus.PENDING_REVIEW,
//         metadata: semanticsData.metadata || undefined,
//         detectionMethod: semanticsData.detectionMethod || DetectionMethod.NONE,
//         lastDetection: semanticsData.lastDetection
//           ? convertToDate(semanticsData.lastDetection)
//           : undefined,
//         detectionLog: semanticsData.detectionLog || undefined,
//         validationFlags: semanticsData.validationFlags || undefined,
//         reviewedBy: semanticsData.reviewedBy || undefined,
//         reviewedAt: semanticsData.reviewedAt
//           ? convertToDate(semanticsData.reviewedAt)
//           : undefined,
//         exemptionReason: semanticsData.exemptionReason || undefined,
//         shadowActions: semanticsData.shadowActions || undefined,
//       };

//       // ⭐ ⭐ ⭐ **التحديث المهم: نظام التوافق الذكي للمنتجات الزراعية**
//       if (store && semantics.detectedActivity) {
//         // استخراج أنشطة المتجر
//         const storeActivities: string[] = [];

//         // 1. من businessActivities الجديد
//         if (store.businessActivities?.subActivities) {
//           storeActivities.push(...store.businessActivities.subActivities);
//         }

//         // 2. من industry
//         if (store.industry) {
//           storeActivities.push(store.industry);
//         }

//         // 3. التحقق من التوافق
//         const isCompatible = checkActivityCompatibility(
//           semantics.detectedActivity,
//           storeActivities,
//         );

//         if (isCompatible && semantics.detectedActivity === "agriculture") {
//           semantics.complianceStatus = ComplianceStatus.COMPLIANT;

//           // إزالة تحذير "غير مسجل للمتجر" من validationFlags
//           if (semantics.validationFlags) {
//             semantics.validationFlags = semantics.validationFlags.filter(
//               (flag: string) => !flag.includes("غير مسجل للمتجر"),
//             );

//             // إزالة shadowActions إذا لم تعد هناك انتهاكات
//             if (
//               semantics.validationFlags.length === 0 &&
//               semantics.shadowActions
//             ) {
//               semantics.shadowActions = undefined;
//             }
//           }

//           console.log(`✅ تم تصحيح التوافق الزراعي: ${data.name}`, {
//             detectedActivity: semantics.detectedActivity,
//             storeActivities,
//             storeName: store.name,
//           });
//         }
//       }

//       return semantics;
//     };

//     // ⭐ تحديث استدعاء convertSemantics
//     const semantics = convertSemantics(data._semantics);

//     return {
//       id,
//       storeId: data.storeId || "",
//       ownerId: data.ownerId || "",
//       name: data.name || "",
//       description: data.description || "",
//       shortDescription: data.shortDescription,
//       category: data.category || "غير مصنف",
//       subCategory: data.subCategory,
//       _semantics: semantics, // ⭐ استخدام semantics المعدلة
//       brand: data.brand,
//       sku: data.sku || "",
//       price: data.price || 0,
//       comparePrice: data.comparePrice,
//       costPrice: data.costPrice,
//       discount: data.discount
//         ? {
//             ...data.discount,
//             startDate: data.discount.startDate
//               ? convertToDate(data.discount.startDate)
//               : undefined,
//             endDate: data.discount.endDate
//               ? convertToDate(data.discount.endDate)
//               : undefined,
//           }
//         : undefined,
//       inventory: data.inventory || {
//         quantity: 0,
//         sku: "",
//         trackInventory: true,
//       },
//       images: data.images || [],
//       specifications: data.specifications || {},
//       tags: data.tags || [],
//       featured: data.featured || false,
//       status: (data.status as ProductStatus) || ProductStatus.DRAFT,
//       visibility: data.visibility,
//       shipping: data.shipping,
//       tax: data.tax,
//       seo: data.seo || {
//         title: "",
//         description: "",
//         keywords: [],
//       },
//       soldIndividually: data.soldIndividually,
//       warranty: data.warranty,
//       returnPolicy: data.returnPolicy,
//       sizeGuide: data.sizeGuide,
//       reviewsEnabled: data.reviewsEnabled,
//       averageRating: data.averageRating,
//       reviewCount: data.reviewCount,
//       variants: data.variants || [],
//       stats: data.stats || {
//         views: 0,
//         sales: 0,
//         wishlistCount: 0,
//       },
//       createdAt: convertToDate(data.createdAt),
//       updatedAt: convertToDate(data.updatedAt),
//     };
//   }

//   private extractStoreActivities(store: Store): string[] {
//     const activities: string[] = [];
//     // 1. الأنشطة الرئيسية
//     if (store.businessActivities?.mainActivity) {
//       activities.push(store.businessActivities.mainActivity);
//     }
//     // 2. الأنشطة الفرعية
//     if (store.businessActivities?.subActivities) {
//       activities.push(...store.businessActivities.subActivities);
//     }
//     // 3. الصناعة
//     if (store.industry && store.industry !== "general") {
//       activities.push(store.industry);
//     }
//     // 4. الأنشطة القديمة
//     if (store.customization) {
//       if ("primaryBusinessType" in store.customization) {
//         const oldActivity = (store.customization as any).primaryBusinessType;
//         if (oldActivity && !activities.includes(oldActivity)) {
//           activities.push(oldActivity);
//         }
//       }

//       if ("subBusinessTypes" in store.customization) {
//         const subTypes = (store.customization as any).subBusinessTypes || [];
//         subTypes.forEach((type: string) => {
//           if (!activities.includes(type)) {
//             activities.push(type);
//           }
//         });
//       }
//     }

//     // إرجاع الأنشطة فريدة
//     return [...new Set(activities.map((a) => a.toLowerCase()))];
//   }

//   private findMainActivity(activity: string): string {
//     for (const [mainActivity, compatibleActivities] of Object.entries(
//       ACTIVITY_COMPATIBILITY_MAP,
//     )) {
//       if (compatibleActivities.includes(activity)) {
//         return mainActivity;
//       }
//     }
//     return activity;
//   }

//   private getActivityLabel(activity: string): string {
//     const activityLabels: Record<string, string> = {
//       agriculture: "زراعة",
//       "agricultural-products": "منتجات زراعية",
//       "seeds-fertilizers": "بذور وأسمدة",
//       livestock: "مواشي ودواجن",
//       fisheries: "ثروة سمكية",
//       food: "طعام ومشروبات",
//       fashion: "أزياء وملابس",
//       electronics: "إلكترونيات",
//       "home-garden": "منزل وحديقة",
//       cosmetics: "صحة وجمال",
//       books: "كتب",
//       sports: "رياضة",
//       toys: "ألعاب",
//       automotive: "سيارات",
//       jewelry: "مجوهرات",
//     };

//     return activityLabels[activity] || activity;
//   }

//   private async updateStoreComplianceStats(
//     storeId: string,
//     isCompliant: boolean,
//     wasCompliant?: boolean,
//   ): Promise<void> {
//     try {
//       const store = await storeService.getById(storeId);
//       if (!store) return;

//       const currentStats = store.complianceStats || {
//         totalProducts: 0,
//         compliantProducts: 0,
//         flaggedProducts: 0,
//         lastCheck: new Date(),
//         complianceRate: 100,
//       };

//       let newTotal = currentStats.totalProducts + 1;
//       let newCompliant = currentStats.compliantProducts;
//       let newFlagged = currentStats.flaggedProducts;

//       if (isCompliant) {
//         newCompliant += 1;
//       } else {
//         newFlagged += 1;
//       }
//       if (wasCompliant !== undefined) {
//         newTotal -= 1;
//         if (wasCompliant) {
//           newCompliant -= 1;
//         } else {
//           newFlagged -= 1;
//         }
//       }

//       const newRate = newTotal > 0 ? (newCompliant / newTotal) * 100 : 100;

//       await storeService.update(storeId, {
//         complianceStats: {
//           totalProducts: newTotal,
//           compliantProducts: newCompliant,
//           flaggedProducts: newFlagged,
//           lastCheck: new Date(),
//           complianceRate: newRate,
//         },
//       });
//     } catch (error) {
//       console.error("❌ خطأ في تحديث إحصائيات المتجر:", error);
//     }
//   }

//   private async updateStoreComplianceStatsOnDelete(
//     storeId: string,
//     wasCompliant: boolean,
//   ): Promise<void> {
//     try {
//       const store = await storeService.getById(storeId);
//       if (!store || !store.complianceStats) return;

//       const stats = store.complianceStats;
//       const newTotal = Math.max(0, stats.totalProducts - 1);
//       const newCompliant = wasCompliant
//         ? Math.max(0, stats.compliantProducts - 1)
//         : stats.compliantProducts;
//       const newFlagged = !wasCompliant
//         ? Math.max(0, stats.flaggedProducts - 1)
//         : stats.flaggedProducts;
//       const newRate = newTotal > 0 ? (newCompliant / newTotal) * 100 : 100;

//       await storeService.update(storeId, {
//         complianceStats: {
//           totalProducts: newTotal,
//           compliantProducts: newCompliant,
//           flaggedProducts: newFlagged,
//           lastCheck: new Date(),
//           complianceRate: newRate,
//         },
//       });
//     } catch (error) {
//       console.error("❌ خطأ في تحديث إحصائيات المتجر بعد الحذف:", error);
//     }
//   }

//   private async logProductEvent(
//     productId: string,
//     eventType: "create" | "update" | "delete" | "compliance_check",
//     data: any,
//   ): Promise<void> {
//     try {
//       const eventLog = {
//         productId,
//         eventType,
//         timestamp: new Date().toISOString(),
//         ...data,
//       };

//       console.log(`📝 حدث منتج: ${eventType}`, eventLog);
//     } catch (error) {
//       // تجاهل الأخطاء في التسجيل
//     }
//   }

//   async create(
//     productData: any,
//     options?: {
//       forceProductTypeId?: string;
//       skipCompliance?: boolean;
//       skipKindValidation?: boolean;
//     },
//   ): Promise<{
//     id: string;
//     decision: ComplianceDecision;
//     status: ProductStatus;
//     warnings: string[];
//     detectedActivity?: string;
//     productType?: {
//       id: string;
//       name: string;
//       activityId: string;
//     };
//     shadowActions?: {
//       hideFromStore?: boolean;
//       hideFromSearch?: boolean;
//       limitPurchase?: boolean;
//     };
//     kind: ProductKind;
//   }> {
//     try {
//       // 🔥 سجل تشخيصي مفصل للبيانات الواردة
//       console.log("🚀 productService.create - البيانات المستلمة:", {
//         // معلومات أساسية
//         name: productData.name,
//         kind: productData.kind,
//         storeId: productData.storeId,

//         // 🔍 تحقق من وجود metadata
//         hasMetadata: "metadata" in productData,
//         metadataType: typeof productData.metadata,
//         metadataValue: productData.metadata,

//         // 🔍 تحقق من الزراعة في metadata
//         hasAgricultureData: productData.metadata?.agricultureSpecific
//           ? true
//           : false,
//         agricultureFields: productData.metadata?.agricultureSpecific
//           ? Object.keys(productData.metadata.agricultureSpecific)
//           : [],

//         // 🔍 تحقق من كامل الكائن
//         totalKeys: Object.keys(productData).length,
//         sampleKeys: Object.keys(productData).slice(0, 5),

//         // 🔍 تحقق من قيم محددة
//         agricultureTypeValue:
//           productData.metadata?.agricultureSpecific?.agricultureType ||
//           "غير موجود",
//         isOrganicValue:
//           productData.metadata?.agricultureSpecific?.isOrganic || "غير موجود",
//         certificationValue:
//           productData.metadata?.agricultureSpecific?.certification ||
//           "غير موجود",
//       });

//       // 🔧 تحسين: تأكد من بنية metadata إذا كانت موجودة
//       if (productData.metadata && typeof productData.metadata === "object") {
//         console.log("📊 بنية metadata الأصلية:", {
//           keys: Object.keys(productData.metadata),
//           agricultureSpecific: productData.metadata.agricultureSpecific,
//           agricultureSpecificType:
//             typeof productData.metadata.agricultureSpecific,
//           isAgricultureSpecificObject:
//             typeof productData.metadata.agricultureSpecific === "object",
//           agricultureSpecificKeys: productData.metadata.agricultureSpecific
//             ? Object.keys(productData.metadata.agricultureSpecific)
//             : [],
//         });
//       }

//       console.log("🚀 بدء إنشاء منتج بالنظام الجديد مع kind:", {
//         name: productData.name,
//         kind: productData.kind,
//         storeId: productData.storeId,
//       });

//       // 🔍 التحقق من وجود kind
//       if (!productData.kind) {
//         throw new Error("يجب تحديد نوع المنتج الأساسي");
//       }

//       const kindInfo = PRODUCT_KINDS[productData.kind as ProductKind];
//       if (!kindInfo) {
//         throw new Error("نوع المنتج غير معروف");
//       }

//       // 🔍 التحقق من صحة البيانات حسب النوع (ما لم يتم تخطي التحقق)
//       if (!options?.skipKindValidation) {
//         const validation = complianceSystem.validateProductDataByKind(
//           productData,
//           productData.kind as ProductKind,
//         );

//         if (!validation.isValid) {
//           throw new Error(`بيانات غير صالحة: ${validation.errors.join(", ")}`);
//         }

//         if (validation.warnings.length > 0) {
//           console.log("⚠️ تحذيرات التحقق:", validation.warnings);
//         }
//       }

//       // 🔍 الحصول على بيانات المتجر
//       const store = await storeService.getById(productData.storeId);
//       if (!store) {
//         throw new Error("المتجر غير موجود");
//       }

//       // 🔍 تنظيف البيانات
//       const sanitizedData = complianceSystem.sanitizeProductData(productData);

//       // 🔍 تحديد نوع المنتج التفصيلي
//       let productType: ProductType | undefined;
//       let detectionResult: ProductTypeDetection | null = null;

//       if (options?.forceProductTypeId) {
//         productType = DEFAULT_PRODUCT_TYPES.find(
//           (pt) => pt.id === options.forceProductTypeId,
//         );
//         if (!productType) {
//           throw new Error(`نوع المنتج ${options.forceProductTypeId} غير معروف`);
//         }
//         console.log("✅ استخدام نوع منتج محدد:", productType.name);
//       } else {
//         // اكتشاف النوع التفصيلي مع مراعاة kind
//         detectionResult = await complianceSystem.detectDetailedProductType(
//           sanitizedData,
//           productData.kind as ProductKind,
//         );
//         productType = detectionResult?.productType || undefined;

//         if (productType) {
//           console.log("✅ تم كشف نوع المنتج تلقائياً:", {
//             name: productType.name,
//             confidence: detectionResult?.confidence,
//             kind: productData.kind,
//           });
//         } else {
//           // استخدام النوع الافتراضي المناسب لل kind
//           const defaultType = this.getDefaultProductTypeForKind(
//             productData.kind as ProductKind,
//           );
//           productType = defaultType;
//           console.log("ℹ️ استخدام نوع منتج افتراضي:", productType?.name);
//         }
//       }

//       // 🔍 بناء semantics مع kind
//       const semantics = await complianceSystem.buildProductSemanticsWithKind(
//         sanitizedData,
//         productData.kind as ProductKind,
//         store,
//         productType,
//       );

//       // 🔍 اتخاذ قرار الامتثال
//       let complianceDecision: ComplianceCheckResult;

//       if (options?.skipCompliance) {
//         complianceDecision = {
//           decision: ComplianceDecision.ALLOW,
//           complianceStatus: ComplianceStatus.COMPLIANT,
//           productStatus: ProductStatus.ACTIVE,
//           violations: [],
//           warnings: [],
//           suggestedActions: [],
//         };
//       } else {
//         complianceDecision = await complianceSystem.makeComplianceDecision(
//           sanitizedData,
//           productType,
//           store,
//         );
//       }

//       // 🔍 معالجة الخصومات
//       let finalPrice = sanitizedData.price;
//       let finalComparePrice = sanitizedData.comparePrice;

//       if (sanitizedData.discount && sanitizedData.discount.isActive) {
//         const { type, value } = sanitizedData.discount;

//         switch (type) {
//           case "percentage":
//             finalPrice = sanitizedData.price * (1 - value / 100);
//             finalComparePrice = sanitizedData.price;
//             break;
//           case "fixed":
//             finalPrice = sanitizedData.price - value;
//             finalComparePrice = sanitizedData.price;
//             break;
//         }
//       }
//       // 🔍 إعداد بيانات المنتج النهائية
//       const productToSave = {
//         ...productData,
//         _semantics: semantics,
//         price: finalPrice,
//         comparePrice: finalComparePrice,
//         status: complianceDecision.productStatus,
//         createdAt: serverTimestamp(), // ⭐ استبدل new Date()
//         updatedAt: serverTimestamp(), // ⭐ استبدل new Date()
//         // ⭐ إضافة تحقق إضافي
//         _createdMethod: "product_service",
//         _creationTime: new Date().toISOString(), // كنترول إضافي
//       };

//       // 🔥 السجل التشخيصي قبل التنظيف
//       console.log("🔍 البيانات قبل cleanFirestoreData:", {
//         hasMetadata: "metadata" in productToSave,
//         metadata: productToSave.metadata,
//         metadataType: typeof productToSave.metadata,
//         isMetadataObject: typeof productToSave.metadata === "object",
//         agricultureSpecific: productToSave.metadata?.agricultureSpecific,
//         agricultureType:
//           productToSave.metadata?.agricultureSpecific?.agricultureType,
//         agricultureFields: productToSave.metadata?.agricultureSpecific
//           ? Object.keys(productToSave.metadata.agricultureSpecific)
//           : [],
//         // تأكد من بنية metadata
//         metadataKeys: productToSave.metadata
//           ? Object.keys(productToSave.metadata)
//           : [],
//         metadataHasAgricultureSpecific:
//           productToSave.metadata?.agricultureSpecific !== undefined,
//       });

//       // 🔍 تنظيف البيانات لل Firestore
//       const cleanedData = cleanFirestoreData(productToSave);
//       // ⭐ تأكد من أن createdAt موجود
//       if (!cleanedData.createdAt) {
//         console.log("⚠️ createdAt مفقود بعد التنظيف، إضافته...");
//         cleanedData.createdAt = serverTimestamp();
//         cleanedData._fixedCreatedAt = true;
//       }

//       console.log("✅ البيانات قبل الحفظ:", {
//         hasCreatedAt: "createdAt" in cleanedData,
//         createdAtType: cleanedData.createdAt?.constructor?.name,
//       });

//       // 🔥 السجل التشخيصي بعد التنظيف
//       console.log("🔍 البيانات بعد cleanFirestoreData:", {
//         hasMetadata: "metadata" in cleanedData,
//         metadata: cleanedData?.metadata,
//         metadataType: typeof cleanedData?.metadata,
//         isMetadataObject: typeof cleanedData?.metadata === "object",
//         agricultureSpecific: cleanedData?.metadata?.agricultureSpecific,
//         agricultureType:
//           cleanedData?.metadata?.agricultureSpecific?.agricultureType,
//         agricultureFields: cleanedData?.metadata?.agricultureSpecific
//           ? Object.keys(cleanedData.metadata.agricultureSpecific)
//           : [],
//         // تأكد من بنية metadata المخزنة
//         metadataKeys: cleanedData?.metadata
//           ? Object.keys(cleanedData.metadata)
//           : [],
//         metadataHasAgricultureSpecific:
//           cleanedData?.metadata?.agricultureSpecific !== undefined,
//         // تحقق من فقدان البيانات
//         metadataLost:
//           !("metadata" in cleanedData) && "metadata" in productToSave,
//         agricultureSpecificLost:
//           !cleanedData?.metadata?.agricultureSpecific &&
//           productToSave.metadata?.agricultureSpecific,
//       });

//       // 🔧 إذا فقدت metadata، أعدها يدوياً
//       let finalData = cleanedData;
//       if (!cleanedData?.metadata && productToSave.metadata) {
//         console.log("⚠️ metadata مفقودة بعد التنظيف، إضافتها يدوياً...");
//         finalData = {
//           ...cleanedData,
//           metadata: productToSave.metadata,
//         };
//       }

//       console.log("📤 البيانات المرسلة إلى Firestore:", {
//         name: finalData.name,
//         kind: finalData.kind,
//         storeId: finalData.storeId,
//         hasMetadata: "metadata" in finalData,
//         metadataKeys: finalData.metadata ? Object.keys(finalData.metadata) : [],
//         agricultureSpecificExists: !!finalData.metadata?.agricultureSpecific,
//         agricultureSpecificKeys: finalData.metadata?.agricultureSpecific
//           ? Object.keys(finalData.metadata.agricultureSpecific)
//           : [],
//       });

//       // 🔍 حفظ المنتج في Firestore
//       const docRef = await addDoc(collection(db, "products"), finalData);
//       const productId = docRef.id;

//       console.log("📝 تم إنشاء المنتج في Firestore مع ID:", productId);
//       try {
//         // انتظر قليلاً للتأكد من الحفظ
//         await new Promise((resolve) => setTimeout(resolve, 800));

//         // جلب البيانات المخزنة للتأكد - التصحيح هنا
//         const savedDoc = await getDoc(docRef); // استخدم getDoc بدلاً من docRef.get()
//         const savedData = savedDoc.data();

//         console.log("🔍 التحقق من البيانات المخزنة فعلياً في Firestore:", {
//           documentId: savedDoc.id,
//           documentExists: savedDoc.exists(),
//           // البيانات الأساسية
//           name: savedData?.name,
//           kind: savedData?.kind,
//           storeId: savedData?.storeId,
//           // التحقق من metadata
//           hasMetadataInStored: "metadata" in savedData,
//           storedMetadata: savedData?.metadata,
//           storedMetadataType: typeof savedData?.metadata,
//           // التحقق من agricultureSpecific
//           hasAgricultureSpecific: !!savedData?.metadata?.agricultureSpecific,
//           agricultureSpecific: savedData?.metadata?.agricultureSpecific,
//           agricultureType:
//             savedData?.metadata?.agricultureSpecific?.agricultureType,
//           // قائمة كاملة بالحقول المحفوظة
//           allStoredKeys: savedData ? Object.keys(savedData).sort() : [],
//           // تحقق من فقدان metadata
//           metadataMissing: !("metadata" in savedData),
//           // مقارنة مع البيانات المرسلة
//           metadataSent: "metadata" in finalData,
//           agricultureSpecificSent: finalData.metadata?.agricultureSpecific,
//         });
//         if (!("metadata" in savedData) && finalData.metadata) {
//           console.log(
//             "⚠️ metadata غير موجودة في البيانات المخزنة، محاولة التحديث اليدوي...",
//           );
//           await updateDoc(docRef, {
//             metadata: finalData.metadata,
//           });
//           console.log("✅ تم تحديث metadata يدوياً");
//         }
//       } catch (error) {
//         console.error("❌ خطأ في التحقق من البيانات المخزنة:", error);
//       }
//       await this.updateStoreComplianceStats(
//         productData.storeId,
//         complianceDecision.decision === ComplianceDecision.ALLOW,
//       );

//       if (
//         complianceDecision.decision === ComplianceDecision.REVIEW_REQUIRED ||
//         complianceDecision.decision === ComplianceDecision.BLOCK
//       ) {
//         await complianceSystem.handleComplianceViolation(
//           productId,
//           productData.storeId,
//           complianceDecision.decision === ComplianceDecision.BLOCK
//             ? "blocked_product"
//             : "review_required",
//           {
//             violations: complianceDecision.violations,
//             severity:
//               complianceDecision.decision === ComplianceDecision.BLOCK
//                 ? "high"
//                 : "medium",
//             productName: sanitizedData.name,
//             detectedActivity: semantics.detectedActivity,
//             productType: productType?.name,
//             productKind: productData.kind,
//             storeActivities: store.businessActivities?.subActivities || [],
//             decision: complianceDecision.decision,
//           },
//         );
//       }
//       await this.logProductEvent(productId, "create", {
//         name: sanitizedData.name,
//         kind: productData.kind,
//         price: finalPrice,
//         decision: complianceDecision.decision,
//         productType: productType?.name,
//         detectedActivity: semantics.detectedActivity,
//       });

//       console.log("✅ تم إنشاء المنتج بنجاح:", {
//         id: productId,
//         name: sanitizedData.name,
//         kind: productData.kind,
//         store: store.name,
//         decision: complianceDecision.decision,
//         productType: productType?.name,
//         // 🔍 تأكد من حفظ البيانات الزراعية
//         hasMetadataInResult: "metadata" in productToSave,
//         metadataSaved: "metadata" in finalData,
//         agricultureSpecificSaved: !!finalData.metadata?.agricultureSpecific,
//       });

//       // 🔍 إرجاع النتيجة
//       return {
//         id: productId,
//         decision: complianceDecision.decision,
//         status: complianceDecision.productStatus,
//         warnings: complianceDecision.warnings,
//         detectedActivity: semantics.detectedActivity,
//         productType: productType
//           ? {
//               id: productType.id,
//               name: productType.name,
//               activityId: productType.activityId,
//             }
//           : undefined,
//         shadowActions: complianceDecision.shadowActions,
//         kind: productData.kind as ProductKind,
//       };
//     } catch (error: any) {
//       console.error("❌ خطأ في إنشاء المنتج:", {
//         message: error.message,
//         stack: error.stack,
//         productData: {
//           name: productData?.name,
//           kind: productData?.kind,
//           hasMetadata: productData?.metadata ? true : false,
//         },
//       });
//       throw new Error(`فشل إنشاء المنتج: ${error.message}`);
//     }
//   }

//   private getDefaultProductTypeForKind(
//     kind: ProductKind,
//     store?: ExtendedStore,
//   ): ProductType {
//     const kindInfo = PRODUCT_KINDS[kind];

//     console.log("🔍 البحث عن النوع الافتراضي:", {
//       kind: kindInfo.name,
//       storeIndustry: store?.industry,
//     });
//     if (store?.industry === "agriculture" && kind === ProductKind.PHYSICAL) {
//       const agricultureType = DEFAULT_PRODUCT_TYPES.find(
//         (pt) =>
//           pt.activityId === "agriculture" || pt.id === "pt_agriculture_011",
//       );
//       if (agricultureType) {
//         console.log("✅ استخدام نوع منتج زراعي بناءً على نشاط المتجر");
//         return agricultureType;
//       }
//     }
//     const agricultureActivities = [
//       "agriculture",
//       "livestock",
//       "fisheries",
//       "food_processing",
//     ];

//     if (store?.industry && agricultureActivities.includes(store.industry)) {
//       const agricultureCompatible = DEFAULT_PRODUCT_TYPES.find((pt) => {
//         const isAgricultureRelated = agricultureActivities.includes(
//           pt.activityId,
//         );
//         return (
//           isAgricultureRelated &&
//           kindInfo.suggestedActivities.includes(pt.activityId)
//         );
//       });

//       if (agricultureCompatible) {
//         console.log("🌱 استخدام نوع زراعي متوافق:", agricultureCompatible.name);
//         return agricultureCompatible;
//       }
//     }
//     const compatibleType = DEFAULT_PRODUCT_TYPES.find((pt) =>
//       kindInfo.suggestedActivities.includes(pt.activityId),
//     );

//     if (compatibleType) {
//       console.log("✅ استخدام نوع متوافق مع kind:", compatibleType.name);
//       return compatibleType;
//     }

//     console.log("ℹ️ استخدام نوع افتراضي للـ kind");

//     switch (kind) {
//       case ProductKind.PHYSICAL:
//         return (
//           DEFAULT_PRODUCT_TYPES.find((pt) => pt.id === "pt_clothing_002") ||
//           DEFAULT_PRODUCT_TYPES[0]
//         );
//       case ProductKind.SERVICE:
//         return (
//           DEFAULT_PRODUCT_TYPES.find((pt) => pt.id === "pt_books_006") ||
//           DEFAULT_PRODUCT_TYPES[0]
//         );
//       case ProductKind.FOOD:
//         return (
//           DEFAULT_PRODUCT_TYPES.find((pt) => pt.id === "pt_food_003") ||
//           DEFAULT_PRODUCT_TYPES[0]
//         );
//       case ProductKind.DIGITAL:
//         return (
//           DEFAULT_PRODUCT_TYPES.find((pt) => pt.id === "pt_books_006") ||
//           DEFAULT_PRODUCT_TYPES[0]
//         );
//       default:
//         return DEFAULT_PRODUCT_TYPES[0];
//     }
//   }

//   async update(
//     productId: string,
//     data: Partial<Product>,
//     options?: {
//       forceProductTypeId?: string;
//       skipCompliance?: boolean;
//     },
//   ): Promise<{
//     success: boolean;
//     decision?: ComplianceDecision;
//     status?: ProductStatus;
//     warnings: string[];
//     detectedActivity?: string;
//     productType?: {
//       id: string;
//       name: string;
//       activityId: string;
//     };
//   }> {
//     try {
//       console.log("🔄 تحديث المنتج:", productId);

//       const currentProduct = await this.getById(productId);
//       if (!currentProduct) {
//         throw new Error("المنتج غير موجود");
//       }
//       const sanitizedData = complianceSystem.sanitizeProductData(data);
//       delete sanitizedData.businessType;
//       delete sanitizedData.subBusinessType;

//       sanitizedData.storeId = currentProduct.storeId;
//       sanitizedData.ownerId = currentProduct.ownerId;

//       const store = await storeService.getById(currentProduct.storeId);
//       if (!store) {
//         throw new Error("المتجر غير موجود");
//       }

//       const updatedProduct = { ...currentProduct, ...sanitizedData };
//       let productType: ProductType | undefined;

//       if (options?.forceProductTypeId) {
//         productType = DEFAULT_PRODUCT_TYPES.find(
//           (pt) => pt.id === options.forceProductTypeId,
//         );
//       } else if (currentProduct._semantics?.productTypeId) {
//         productType = DEFAULT_PRODUCT_TYPES.find(
//           (pt) => pt.id === currentProduct._semantics?.productTypeId,
//         );
//       }

//       // 🔹 7. إعادة بناء semantics
//       const semantics = await complianceSystem.buildProductSemantics(
//         updatedProduct,
//         store,
//         productType,
//       );

//       let complianceDecision: ComplianceCheckResult;
//       if (options?.skipCompliance) {
//         complianceDecision = {
//           decision: ComplianceDecision.ALLOW,
//           complianceStatus: ComplianceStatus.COMPLIANT,
//           productStatus: currentProduct.status,
//           violations: [],
//           warnings: [],
//           suggestedActions: [],
//         };
//       } else {
//         complianceDecision = await complianceSystem.makeComplianceDecision(
//           updatedProduct,
//           productType,
//           store,
//         );
//       }
//       const updateData = {
//         ...sanitizedData,
//         _semantics: semantics,
//         status: complianceDecision.productStatus,
//         updatedAt: Timestamp.now(),
//       };

//       await updateDoc(
//         doc(db, "products", productId),
//         cleanFirestoreData(updateData),
//       );
//       if (currentProduct.status !== complianceDecision.productStatus) {
//         const wasCompliant =
//           currentProduct._semantics?.complianceStatus ===
//           ComplianceStatus.COMPLIANT;
//         const isCompliant =
//           complianceDecision.decision === ComplianceDecision.ALLOW;

//         if (wasCompliant !== isCompliant) {
//           await this.updateStoreComplianceStats(
//             currentProduct.storeId,
//             isCompliant,
//             wasCompliant,
//           );
//         }
//       }
//       await this.logProductEvent(productId, "update", {
//         decision: complianceDecision.decision,
//         newStatus: complianceDecision.productStatus,
//         oldStatus: currentProduct.status,
//       });

//       return {
//         success: true,
//         decision: complianceDecision.decision,
//         status: complianceDecision.productStatus,
//         warnings: complianceDecision.warnings,
//         detectedActivity: semantics.detectedActivity,
//         productType: productType
//           ? {
//               id: productType.id,
//               name: productType.name,
//               activityId: productType.activityId,
//             }
//           : undefined,
//       };
//     } catch (error: any) {
//       console.error("❌ خطأ في تحديث المنتج:", error.message);
//       throw error;
//     }
//   }

//   async getById(productId: string): Promise<Product | null> {
//     try {
//       const docSnap = await getDoc(doc(db, "products", productId));
//       if (docSnap.exists()) {
//         const data = docSnap.data() as Record<string, any>;
//         return this.convertFirestoreDataToProduct(docSnap.id, data);
//       }
//       return null;
//     } catch (error) {
//       console.error("❌ خطأ في جلب المنتج:", error);
//       return null;
//     }
//   }

//   async getByStore(
//     storeId: string,
//     status: "active" | "all" | "draft" | "under_review" = "active",
//     filters?: {
//       complianceStatus?: ComplianceStatus;
//       category?: string;
//       minPrice?: number;
//       maxPrice?: number;
//       productTypeId?: string;
//     },
//   ): Promise<Product[]> {
//     try {
//       console.log(
//         `🔍 [getByStore] جلب منتجات المتجر: ${storeId}, الحالة: ${status}`,
//       );
//       console.log(`🔍 [getByStore] جلب بيانات المتجر: ${storeId}`);
//       const store = await storeService.getById(storeId);
//       console.log(`✅ [getByStore] بيانات المتجر:`, {
//         id: store?.id,
//         name: store?.name,
//         hasCustomization: !!store?.customization,
//         // ⭐ استخدام الخصائص الصحيحة من Store
//         mainActivity: store?.businessActivities?.mainActivity,
//         subActivities: store?.businessActivities?.subActivities,
//         industry: store?.industry,
//         businessActivities: store?.businessActivities,
//       });

//       const constraints: any[] = [where("storeId", "==", storeId)];

//       // ⭐ ⭐ ⭐ **إصلاح: استخدام القيم الصحيحة من ProductStatus**
//       if (status === "active") {
//         constraints.push(where("status", "==", ProductStatus.ACTIVE));
//       } else if (status === "draft") {
//         constraints.push(where("status", "==", ProductStatus.DRAFT));
//       } else if (status === "under_review") {
//         constraints.push(where("status", "==", ProductStatus.UNDER_REVIEW));
//       } else if (status === "all") {
//         console.log(
//           "📋 [getByStore] حالة 'all' - جلب جميع المنتجات بجميع الحالات",
//         );
//         // لا تضيف قيد للحالة
//       }
//       const allProductsQuery = query(
//         collection(db, "products"),
//         where("storeId", "==", storeId),
//       );
//       const allProductsSnapshot = await getDocs(allProductsQuery);
//       console.log("🔍 [getByStore] استعلام بدون قيود:", {
//         totalWithoutConstraints: allProductsSnapshot.docs.length,
//         allStatuses: allProductsSnapshot.docs.slice(0, 10).map((doc) => {
//           const data = doc.data() as Record<string, any>;
//           return {
//             id: doc.id,
//             name: data.name,
//             status: data.status,
//             hasStatus: !!data.status,
//             hasCreatedAt: !!data.createdAt,
//             createdAt: data.createdAt,
//           };
//         }),
//       });
//       let q;
//       if (status === "all") {
//         // ⭐ للحالة "all": لا تستخدم orderBy مؤقتاً
//         q = query(collection(db, "products"), ...constraints);
//         console.log(
//           "🔄 [getByStore] استخدام استعلام بدون orderBy للحالة 'all'",
//         );
//       } else {
//         q = query(
//           collection(db, "products"),
//           ...constraints,
//           orderBy("createdAt", "desc"),
//         );
//       }

//       console.log("🔍 [getByStore] تنفيذ الاستعلام مع القيود...");

//       const querySnapshot = await getDocs(q);
//       const statusBreakdown = {
//         active: 0,
//         draft: 0,
//         under_review: 0,
//         suspended: 0,
//         noStatus: 0,
//         emptyStatus: 0,
//         nullStatus: 0,
//         inactive: 0,
//       };

//       let hasCreatedAt = 0;
//       let missingCreatedAt = 0;
//       const missingCreatedAtSamples: any[] = [];

//       querySnapshot.docs.forEach((doc) => {
//         const data = doc.data() as Record<string, any>;
//         if (data.status === "active") statusBreakdown.active++;
//         else if (data.status === "draft") statusBreakdown.draft++;
//         else if (data.status === "under_review") statusBreakdown.under_review++;
//         else if (data.status === "suspended") statusBreakdown.suspended++;
//         else if (data.status === "inactive") statusBreakdown.inactive++;
//         else if (!data.status) statusBreakdown.noStatus++;
//         else if (data.status === "") statusBreakdown.emptyStatus++;
//         else if (data.status === null) statusBreakdown.nullStatus++;

//         // حساب createdAt
//         if (data.createdAt) hasCreatedAt++;
//         else {
//           missingCreatedAt++;
//           if (missingCreatedAtSamples.length < 3) {
//             missingCreatedAtSamples.push({
//               id: doc.id,
//               name: data.name,
//               status: data.status,
//             });
//           }
//         }
//       });

//       console.log("🔍 [getByStore] تحقق مفصل من حالات المنتجات:", {
//         total: querySnapshot.docs.length,
//         statusBreakdown,
//         hasCreatedAt,
//         missingCreatedAt,
//         missingCreatedAtSamples,
//       });

//       const products: Product[] = [];

//       for (const doc of querySnapshot.docs) {
//         try {
//           const productData = doc.data() as Record<string, any>;

//           if (
//             !productData.status ||
//             productData.status === "" ||
//             productData.status === null
//           ) {
//             console.warn(`⚠️ [getByStore] منتج بدون حالة: ${doc.id}`, {
//               name: productData.name,
//               hasStatusField: "status" in productData,
//               statusValue: productData.status,
//             });
//           }
//           if (!productData.createdAt) {
//             console.warn(`⚠️ [getByStore] منتج بدون createdAt: ${doc.id}`, {
//               name: productData.name,
//               status: productData.status,
//               hasCreatedAtField: "createdAt" in productData,
//             });
//           }
//           const product = this.convertFirestoreDataToProduct(
//             doc.id,
//             productData,
//             store,
//           );
//           products.push(product);
//           if (product._semantics?.detectedActivity === "agriculture") {
//             const storeActivities = this.extractStoreActivities(store);
//             const isCompatible = checkActivityCompatibility(
//               "agriculture",
//               storeActivities,
//             );

//             console.log(`🌱 منتج زراعي: ${product.name}`, {
//               complianceStatus: product._semantics.complianceStatus,
//               storeHasAgriculture: storeActivities.some((a) =>
//                 a.includes("agricultur"),
//               ),
//               storeMainActivity: store?.businessActivities?.mainActivity,
//               storeSubActivities: store?.businessActivities?.subActivities,
//               storeIndustry: store?.industry,
//               isCompatible,
//               agricultureActivities: storeActivities.filter(
//                 (a) =>
//                   a.includes("agricultur") ||
//                   a.includes("زراع") ||
//                   a.includes("بذور"),
//               ),
//               // التوصية
//               recommendation: isCompatible
//                 ? "✅ المنتج متوافق مع نشاط المتجر"
//                 : "⚠️ يحتاج إضافة نشاط زراعي",
//             });

//             if (
//               isCompatible &&
//               product._semantics.complianceStatus ===
//                 ComplianceStatus.NON_COMPLIANT
//             ) {
//               console.log(
//                 `🔄 ${product.name}: تم اكتشاف عدم تطابق - يجب تحديث حالة الامتثال`,
//               );
//             }
//           }
//         } catch (error) {
//           console.error(`❌ خطأ في تحويل المنتج ${doc.id}:`, error);
//           // ⭐ ⭐ ⭐ **إضافة: إنشاء منتج أساسي إذا فشل التحويل**
//           const data = doc.data() as Record<string, any>;
//           const basicProduct: Product = {
//             id: doc.id,
//             name: data.name || "",
//             description: data.description || "",
//             price: data.price || 0,
//             category: data.category || "",
//             subCategory: data.subCategory || "",
//             tags: data.tags || [],
//             images: data.images || [],
//             inventory: data.inventory || { quantity: 0, lowStockThreshold: 10 },
//             status: data.status || "active",
//             createdAt: data.createdAt?.toDate() || new Date(),
//             updatedAt: data.updatedAt?.toDate() || new Date(),
//             storeId: data.storeId || storeId,
//             ownerId: data.ownerId || "",
//             sku: data.sku || "",
//             featured: data.featured || false,
//             seo: data.seo || { title: "", description: "", keywords: [] },
//             _semantics: data._semantics,
//           } as Product;
//           products.push(basicProduct);
//         }
//       }

//       console.log(`✅ [getByStore] تحويل ${products.length} منتج بنجاح`);

//       const missingProducts = allProductsSnapshot.docs
//         .filter((doc) => {
//           const data = doc.data() as Record<string, any>;
//           return !products.some((p) => p.id === doc.id);
//         })
//         .slice(0, 10);

//       console.log("🔍 [getByStore] مقارنة مع جميع المنتجات:", {
//         allProductsCount: allProductsSnapshot.docs.length,
//         filteredProductsCount: products.length,
//         difference: allProductsSnapshot.docs.length - products.length,
//         missingProductsCount: missingProducts.length,
//         missingProducts: missingProducts.map((doc) => {
//           const data = doc.data() as Record<string, any>;
//           return {
//             id: doc.id,
//             name: data.name,
//             status: data.status,
//             hasStatus: !!data.status,
//             statusValue: data.status,
//             hasCreatedAt: !!data.createdAt,
//             createdAt: data.createdAt,
//             price: data.price,
//             category: data.category,
//             storeId: data.storeId,
//           };
//         }),
//       });

//       return products;
//     } catch (error) {
//       console.error("❌ خطأ في جلب منتجات المتجر:", error);
//       return [];
//     }
//   }

//   async search(storeId: string, searchTerm: string): Promise<Product[]> {
//     try {
//       // الحصول على جميع منتجات المتجر النشطة
//       const products = await this.getByStore(storeId, "active");
//       // تطبيق البحث يدوياً
//       return products.filter(
//         (product) =>
//           product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           product.description
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase()) ||
//           product.tags.some((tag) =>
//             tag.toLowerCase().includes(searchTerm.toLowerCase()),
//           ) ||
//           product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
//       );
//     } catch (error) {
//       console.error("❌ خطأ في البحث:", error);
//       return [];
//     }
//   }

//   async delete(
//     productId: string,
//   ): Promise<{ success: boolean; message: string }> {
//     try {
//       const product = await this.getById(productId);
//       if (!product) {
//         return { success: false, message: "المنتج غير موجود" };
//       }
//       // تحديث إحصائيات المتجر
//       await this.updateStoreComplianceStatsOnDelete(
//         product.storeId,
//         product._semantics?.complianceStatus === ComplianceStatus.COMPLIANT,
//       );
//       // حذف المنتج
//       await deleteDoc(doc(db, "products", productId));
//       // تسجيل الحدث
//       await this.logProductEvent(productId, "delete", {
//         name: product.name,
//         storeId: product.storeId,
//       });

//       return { success: true, message: "تم حذف المنتج بنجاح" };
//     } catch (error: any) {
//       console.error("❌ خطأ في حذف المنتج:", error);
//       return { success: false, message: `خطأ في الحذف: ${error.message}` };
//     }
//   }

//   async updateDiscount(
//     productId: string,
//     discountData: DiscountUpdate,
//   ): Promise<void> {
//     try {
//       const product = await this.getById(productId);
//       if (!product) {
//         throw new Error("المنتج غير موجود");
//       }

//       let salePrice = product.price;
//       let comparePrice = product.comparePrice;

//       if (discountData.isActive && discountData.type !== "none") {
//         const originalPrice = product.comparePrice || product.price;

//         switch (discountData.type) {
//           case "percentage":
//             salePrice = originalPrice * (1 - discountData.value / 100);
//             comparePrice = originalPrice;
//             break;
//           case "fixed":
//             salePrice = originalPrice - discountData.value;
//             comparePrice = originalPrice;
//             break;
//         }
//       } else {
//         salePrice = product.comparePrice || product.price;
//         comparePrice = undefined;
//       }

//       const updateData = {
//         discount: discountData.isActive
//           ? {
//               ...discountData,
//               originalPrice: product.comparePrice || product.price,
//               salePrice: salePrice,
//             }
//           : null,
//         price: salePrice,
//         comparePrice: discountData.isActive ? comparePrice : undefined,
//         updatedAt: Timestamp.now(),
//       };

//       await updateDoc(
//         doc(db, "products", productId),
//         cleanFirestoreData(updateData),
//       );
//     } catch (error) {
//       console.error("❌ خطأ في تحديث التخفيض:", error);
//       throw error;
//     }
//   }

//   async getFeatured(
//     storeId: string,
//     limitCount: number = 8,
//   ): Promise<Product[]> {
//     try {
//       const products = await this.getByStore(storeId, "active");
//       return products
//         .filter((product) => product.featured)
//         .slice(0, limitCount);
//     } catch (error) {
//       console.error("❌ خطأ في جلب المنتجات المميزة:", error);
//       return [];
//     }
//   }

//   async getDiscountedProducts(
//     storeId: string,
//     limitCount?: number,
//   ): Promise<Product[]> {
//     try {
//       const products = await this.getByStore(storeId, "active");
//       const discountedProducts = products.filter(
//         (product) => product.discount?.isActive === true,
//       );

//       if (limitCount) {
//         return discountedProducts.slice(0, limitCount);
//       }

//       return discountedProducts;
//     } catch (error) {
//       console.error("❌ خطأ في جلب المنتجات المخفضة:", error);
//       return [];
//     }
//   }

//   async updateStats(
//     productId: string,
//     stats: {
//       views?: number;
//       sales?: number;
//       wishlistCount?: number;
//     },
//   ): Promise<void> {
//     try {
//       const product = await this.getById(productId);
//       if (!product) return;

//       const currentStats = product.stats || {
//         views: 0,
//         sales: 0,
//         wishlistCount: 0,
//       };

//       const updatedStats = {
//         views: (currentStats.views || 0) + (stats.views || 0),
//         sales: (currentStats.sales || 0) + (stats.sales || 0),
//         wishlistCount:
//           (currentStats.wishlistCount || 0) + (stats.wishlistCount || 0),
//       };

//       await updateDoc(doc(db, "products", productId), {
//         stats: updatedStats,
//         updatedAt: Timestamp.now(),
//       });
//     } catch (error) {
//       console.error("❌ خطأ في تحديث إحصائيات المنتج:", error);
//       throw error;
//     }
//   }

//   async updateInventory(
//     productId: string,
//     quantity: number,
//     operation: "set" | "increment" | "decrement" = "set",
//   ): Promise<{ success: boolean; newQuantity: number }> {
//     try {
//       const product = await this.getById(productId);
//       if (!product) {
//         throw new Error("المنتج غير موجود");
//       }

//       let newQuantity = quantity;

//       if (operation === "increment") {
//         newQuantity = product.inventory.quantity + quantity;
//       } else if (operation === "decrement") {
//         newQuantity = Math.max(0, product.inventory.quantity - quantity);
//       }

//       await updateDoc(doc(db, "products", productId), {
//         "inventory.quantity": newQuantity,
//         updatedAt: Timestamp.now(),
//       });

//       return { success: true, newQuantity };
//     } catch (error) {
//       console.error("❌ خطأ في تحديث المخزون:", error);
//       throw error;
//     }
//   }

//   async getTopDiscountedProducts(
//     storeId: string,
//     limitCount: number = 6,
//   ): Promise<Product[]> {
//     try {
//       const discountedProducts = await this.getDiscountedProducts(storeId);

//       // حساب نسبة التخفيض
//       const productsWithDiscount = discountedProducts.map((product) => {
//         let discountPercentage = 0;

//         if (product.discount && product.comparePrice) {
//           if (product.discount.type === "percentage") {
//             discountPercentage = product.discount.value;
//           } else if (
//             product.discount.type === "fixed" &&
//             product.comparePrice
//           ) {
//             const discountAmount = product.comparePrice - product.price;
//             discountPercentage = Math.round(
//               (discountAmount / product.comparePrice) * 100,
//             );
//           }
//         }

//         return { product, discountPercentage };
//       });

//       // الترتيب تنازلياً
//       productsWithDiscount.sort(
//         (a, b) => b.discountPercentage - a.discountPercentage,
//       );

//       return productsWithDiscount
//         .slice(0, limitCount)
//         .map((item) => item.product);
//     } catch (error) {
//       console.error("❌ خطأ في جلب المنتجات ذات أعلى تخفيض:", error);
//       return [];
//     }
//   }

//   async getProductStats(storeId: string): Promise<{
//     totalProducts: number;
//     activeProducts: number;
//     draftProducts: number;
//     underReviewProducts: number;
//     compliantProducts: number;
//     nonCompliantProducts: number;
//     outOfStockProducts: number;
//     lowStockProducts: number;
//   }> {
//     try {
//       const products = await this.getByStore(storeId, "all");

//       return {
//         totalProducts: products.length,
//         activeProducts: products.filter(
//           (p) => p.status === ProductStatus.ACTIVE,
//         ).length,
//         draftProducts: products.filter((p) => p.status === ProductStatus.DRAFT)
//           .length,
//         underReviewProducts: products.filter(
//           (p) => p.status === ProductStatus.UNDER_REVIEW,
//         ).length,
//         compliantProducts: products.filter(
//           (p) => p._semantics?.complianceStatus === ComplianceStatus.COMPLIANT,
//         ).length,
//         nonCompliantProducts: products.filter(
//           (p) =>
//             p._semantics?.complianceStatus === ComplianceStatus.NON_COMPLIANT,
//         ).length,
//         outOfStockProducts: products.filter(
//           (p) => p.inventory.trackInventory && p.inventory.quantity <= 0,
//         ).length,
//         lowStockProducts: products.filter(
//           (p) =>
//             p.inventory.trackInventory &&
//             p.inventory.lowStockThreshold &&
//             p.inventory.quantity <= p.inventory.lowStockThreshold,
//         ).length,
//       };
//     } catch (error) {
//       console.error("❌ خطأ في جلب إحصائيات المنتجات:", error);
//       return {
//         totalProducts: 0,
//         activeProducts: 0,
//         draftProducts: 0,
//         underReviewProducts: 0,
//         compliantProducts: 0,
//         nonCompliantProducts: 0,
//         outOfStockProducts: 0,
//         lowStockProducts: 0,
//       };
//     }
//   }

//   async suggestProductTypes(
//     name: string,
//     description: string,
//     tags: string[] = [],
//     limit: number = 5,
//   ): Promise<
//     Array<{
//       id: string;
//       name: string;
//       activityId: string;
//       confidence: number;
//       matchedKeywords: string[];
//       requiredFields?: string[];
//       icon?: string;
//     }>
//   > {
//     try {
//       const detection = await complianceSystem.detectProductType({
//         name,
//         description,
//         tags,
//       });

//       if (!detection.productType) {
//         const text = `${name} ${description} ${tags.join(" ")}`.toLowerCase();
//         const suggestions: any[] = [];

//         for (const productType of DEFAULT_PRODUCT_TYPES.slice(0, limit)) {
//           let score = 0;
//           const matchedKeywords: string[] = [];

//           for (const keyword of productType.keywords.slice(0, 10)) {
//             if (text.includes(keyword.toLowerCase())) {
//               score += 5;
//               matchedKeywords.push(keyword);
//             }
//           }

//           if (score > 0 || suggestions.length === 0) {
//             suggestions.push({
//               id: productType.id,
//               name: productType.name,
//               activityId: productType.activityId,
//               confidence: Math.min(score / 50, 0.5),
//               matchedKeywords,
//               requiredFields: productType.rules.requiredFields,
//               icon: productType.metadata?.icon,
//             });
//           }
//         }

//         return suggestions.sort((a, b) => b.confidence - a.confidence);
//       } else {
//         const suggestions = [
//           {
//             id: detection.productType.id,
//             name: detection.productType.name,
//             activityId: detection.productType.activityId,
//             confidence: detection.confidence,
//             matchedKeywords: detection.matchedKeywords,
//             requiredFields: detection.productType.rules.requiredFields,
//             icon: detection.productType.metadata?.icon,
//           },
//         ];

//         const otherTypes = DEFAULT_PRODUCT_TYPES.filter(
//           (pt) => pt.id !== detection.productType?.id,
//         )
//           .slice(0, limit - 1)
//           .map((pt) => ({
//             id: pt.id,
//             name: pt.name,
//             activityId: pt.activityId,
//             confidence: 0.3,
//             matchedKeywords: [],
//             requiredFields: pt.rules.requiredFields,
//             icon: pt.metadata?.icon,
//           }));

//         return [...suggestions, ...otherTypes];
//       }
//     } catch (error) {
//       console.error("❌ خطأ في اقتراح أنواع المنتجات:", error);
//       return DEFAULT_PRODUCT_TYPES.slice(0, limit).map((pt) => ({
//         id: pt.id,
//         name: pt.name,
//         activityId: pt.activityId,
//         confidence: 0.1,
//         matchedKeywords: [],
//         requiredFields: pt.rules.requiredFields,
//         icon: pt.metadata?.icon,
//       }));
//     }
//   }

//   async checkProductCompliance(
//     productId: string,
//     forceRecheck: boolean = false,
//   ): Promise<{
//     compliant: boolean;
//     decision: ComplianceDecision;
//     violations: string[];
//     warnings: string[];
//     productType?: {
//       id: string;
//       name: string;
//       activityId: string;
//     };
//     detectedActivity?: string;
//     storeActivities?: string[];
//     needsReview: boolean;
//   }> {
//     try {
//       const product = await this.getById(productId);
//       if (!product) {
//         throw new Error("المنتج غير موجود");
//       }

//       const store = await storeService.getById(product.storeId);
//       if (!store) {
//         throw new Error("المتجر غير موجود");
//       }

//       // إذا كان المنتج لديه semantics حديثة ولا نريد إعادة الفحص
//       if (
//         !forceRecheck &&
//         product._semantics?.lastDetection &&
//         new Date().getTime() - product._semantics.lastDetection.getTime() <
//           24 * 60 * 60 * 1000
//       ) {
//         return {
//           compliant:
//             product._semantics.complianceStatus === ComplianceStatus.COMPLIANT,
//           decision:
//             product.status === ProductStatus.UNDER_REVIEW
//               ? ComplianceDecision.REVIEW_REQUIRED
//               : product.status === ProductStatus.SUSPENDED
//                 ? ComplianceDecision.BLOCK
//                 : ComplianceDecision.ALLOW,
//           violations: product._semantics.validationFlags || [],
//           warnings: [],
//           productType: product._semantics.productTypeId
//             ? {
//                 id: product._semantics.productTypeId,
//                 name:
//                   DEFAULT_PRODUCT_TYPES.find(
//                     (pt) => pt.id === product._semantics?.productTypeId,
//                   )?.name || "",
//                 activityId: product._semantics.detectedActivity || "",
//               }
//             : undefined,
//           detectedActivity: product._semantics.detectedActivity,
//           storeActivities: store.businessActivities?.subActivities || [],
//           needsReview: product.status === ProductStatus.UNDER_REVIEW,
//         };
//       }
//       // إعادة فحص الامتثال
//       const productType = product._semantics?.productTypeId
//         ? DEFAULT_PRODUCT_TYPES.find(
//             (pt) => pt.id === product._semantics?.productTypeId,
//           )
//         : undefined;

//       const complianceDecision = await complianceSystem.makeComplianceDecision(
//         product,
//         productType,
//         store,
//       );
//       // تحديث حالة المنتج إذا تغيرت
//       if (product.status !== complianceDecision.productStatus) {
//         await this.update(productId, {
//           status: complianceDecision.productStatus,
//           _semantics: {
//             ...product._semantics,
//             complianceStatus: complianceDecision.complianceStatus,
//             validationFlags: complianceDecision.violations,
//             lastDetection: new Date(),
//           },
//         } as any);
//       }

//       return {
//         compliant: complianceDecision.decision === ComplianceDecision.ALLOW,
//         decision: complianceDecision.decision,
//         violations: complianceDecision.violations,
//         warnings: complianceDecision.warnings,
//         productType: productType
//           ? {
//               id: productType.id,
//               name: productType.name,
//               activityId: productType.activityId,
//             }
//           : undefined,
//         detectedActivity: product._semantics?.detectedActivity,
//         storeActivities: store.businessActivities?.subActivities || [],
//         needsReview:
//           complianceDecision.decision === ComplianceDecision.REVIEW_REQUIRED,
//       };
//     } catch (error) {
//       console.error("❌ خطأ في فحص امتثال المنتج:", error);
//       throw error;
//     }
//   }

//   async fixAgricultureProductsCompliance(storeId: string): Promise<number> {
//     try {
//       const store = await storeService.getById(storeId);
//       if (!store) {
//         console.log(`❌ المتجر غير موجود: ${storeId}`);
//         return 0;
//       }
//       // التحقق إذا كان المتجر زراعي
//       const isStoreAgricultural = this.isStoreAgricultural(store);
//       if (!isStoreAgricultural) {
//         console.log(`ℹ️ المتجر ${storeId} ليس زراعي، لا حاجة للإصلاح`);
//         return 0;
//       }
//       console.log(
//         `🌱 متجر زراعي تم اكتشافه: ${store.name}، بدء إصلاح المنتجات...`,
//       );
//       // جلب جميع المنتجات
//       const products = await this.getByStore(storeId, "all");
//       const agricultureProducts = products.filter(
//         (p) =>
//           p._semantics?.detectedActivity === "agriculture" &&
//           p._semantics.complianceStatus === ComplianceStatus.NON_COMPLIANT,
//       );
//       console.log(
//         `🔧 العثور على ${agricultureProducts.length} منتج زراعي يحتاج إصلاح`,
//       );

//       if (agricultureProducts.length === 0) {
//         console.log("✅ لا توجد منتجات زراعية تحتاج إصلاح");
//         return 0;
//       }

//       let fixedCount = 0;
//       const batch = writeBatch(db);

//       for (const product of agricultureProducts) {
//         try {
//           // تحديث حالة الامتثال
//           const updateData: any = {
//             "_semantics.complianceStatus": ComplianceStatus.COMPLIANT,
//             "_semantics.updatedAt": new Date(),
//             updatedAt: new Date(),
//           };
//           // إزالة تحذيرات "غير مسجل للمتجر"
//           if (product._semantics?.validationFlags) {
//             const newFlags = product._semantics.validationFlags.filter(
//               (flag: string) => !flag.includes("غير مسجل للمتجر"),
//             );
//             updateData["_semantics.validationFlags"] = newFlags;
//             // إزالة shadowActions إذا لم تعد هناك انتهاكات
//             if (newFlags.length === 0 && product._semantics?.shadowActions) {
//               updateData["_semantics.shadowActions"] = null;
//             }
//           }
//           // تحديث حالة المنتج إذا كان under_review أو suspended
//           if (
//             product.status === ProductStatus.UNDER_REVIEW ||
//             product.status === ProductStatus.SUSPENDED
//           ) {
//             updateData["status"] = ProductStatus.ACTIVE;
//           }

//           const productRef = doc(db, "products", product.id);
//           batch.update(productRef, updateData);
//           fixedCount++;

//           console.log(`✅ تم إصلاح المنتج: ${product.name}`);
//         } catch (error) {
//           console.error(`❌ خطأ في إصلاح المنتج ${product.id}:`, error);
//         }
//       }

//       if (fixedCount > 0) {
//         await batch.commit();
//         console.log(`✅ تم إصلاح ${fixedCount} منتج زراعي بنجاح`);
//       }

//       return fixedCount;
//     } catch (error) {
//       console.error("❌ خطأ في إصلاح المنتجات الزراعية:", error);
//       return 0;
//     }
//   }

//   private isStoreAgricultural(store: Store): boolean {
//     const storeActivities = this.extractStoreActivities(store);
//     // التحقق من الأنشطة الزراعية
//     const agricultureKeywords = [
//       "agricultur",
//       "زراع",
//       "مزارع",
//       "محاصيل",
//       "بذور",
//       "اسمدة",
//       "مبيدات",
//       "مواشي",
//       "دواجن",
//       "أسماك",
//       "ثروة",
//       "نبات",
//       "فلاح",
//       "محصول",
//       "شتل",
//     ];

//     const hasAgriculture = storeActivities.some((activity) =>
//       agricultureKeywords.some((keyword) =>
//         activity.toLowerCase().includes(keyword.toLowerCase()),
//       ),
//     );

//     // التحقق من الصناعة
//     const hasAgricultureIndustry =
//       store.industry?.toLowerCase().includes("agricultur") || false;

//     // التحقق من الأنشطة القديمة
//     const hasOldAgriculture = this.checkOldAgricultureActivities(store);

//     const result =
//       hasAgriculture || hasAgricultureIndustry || hasOldAgriculture;

//     console.log(`🔍 فحص النشاط الزراعي للمتجر ${store.name}:`, {
//       storeActivities,
//       hasAgriculture,
//       hasAgricultureIndustry,
//       hasOldAgriculture,
//       result,
//     });

//     return result;
//   }

//   private checkOldAgricultureActivities(store: Store): boolean {
//     if (!store.customization) return false;

//     let hasAgriculture = false;
//     // التحقق من primaryBusinessType القديم
//     if ("primaryBusinessType" in store.customization) {
//       const oldType = (store.customization as any).primaryBusinessType;
//       if (oldType && oldType.toLowerCase().includes("agricultur")) {
//         hasAgriculture = true;
//       }
//     }
//     // التحقق من subBusinessTypes القديم
//     if ("subBusinessTypes" in store.customization) {
//       const subTypes = (store.customization as any).subBusinessTypes || [];
//       const agricultureSubTypes = [
//         "agricultural-products",
//         "livestock",
//         "agricultural-tools",
//         "seeds-fertilizers",
//         "fisheries",
//       ];

//       if (subTypes.some((type: string) => agricultureSubTypes.includes(type))) {
//         hasAgriculture = true;
//       }
//     }

//     return hasAgriculture;
//   }
// }

// export async function fixProductsMissingCreatedAt(storeId: string): Promise<{
//   success: boolean;
//   fixedCount: number;
//   errors: string[];
//   details: Array<{ id: string; name: string; fixed: boolean; error?: string }>;
// }> {
//   try {
//     console.log(`🔧 بدء إصلاح المنتجات بدون createdAt للمتجر: ${storeId}`);

//     const results = {
//       success: true,
//       fixedCount: 0,
//       errors: [] as string[],
//       details: [] as Array<{
//         id: string;
//         name: string;
//         fixed: boolean;
//         error?: string;
//       }>,
//     };

//     // 1. جلب جميع منتجات المتجر
//     const productsQuery = query(
//       collection(db, "products"),
//       where("storeId", "==", storeId),
//     );

//     const snapshot = await getDocs(productsQuery);
//     console.log(`🔍 فحص ${snapshot.docs.length} منتج للمتجر ${storeId}`);

//     // 2. التحقق من كل منتج
//     const productsToFix = snapshot.docs.filter((doc) => {
//       const data = doc.data();
//       return !data.createdAt;
//     });

//     console.log(`⚠️ وجد ${productsToFix.length} منتج بدون createdAt`);

//     if (productsToFix.length === 0) {
//       console.log("✅ لا توجد منتجات تحتاج إصلاح");
//       return results;
//     }

//     // 3. إصلاح كل منتج
//     for (const doc of productsToFix) {
//       try {
//         const data = doc.data();
//         const productId = doc.id;
//         const productName = data.name || "بدون اسم";

//         console.log(`🔄 معالجة المنتج: ${productName} (${productId})`);

//         // تحديد تاريخ مناسب للإصلاح
//         let fixedDate: Date;

//         if (data.updatedAt) {
//           // إذا كان هناك updatedAt، استخدمه
//           fixedDate = data.updatedAt.toDate();
//           console.log(`📅 استخدام updatedAt: ${fixedDate}`);
//         } else if (data.lastModified) {
//           // أو أي حقل تاريخ آخر
//           fixedDate = data.lastModified.toDate();
//           console.log(`📅 استخدام lastModified: ${fixedDate}`);
//         } else {
//           // استخدام تاريخ افتراضي (قبل 30 يوم)
//           fixedDate = new Date();
//           fixedDate.setDate(fixedDate.getDate() - 30);
//           console.log(`📅 استخدام تاريخ افتراضي: ${fixedDate}`);
//         }

//         // تحديث المنتج
//         await updateDoc(doc.ref, {
//           createdAt: Timestamp.fromDate(fixedDate),
//           updatedAt: Timestamp.fromDate(new Date()), // تحديث updatedAt أيضاً
//           _lastFixed: {
//             date: new Date(),
//             reason: "إصلاح حقل createdAt المفقود",
//             fixedBy: "system",
//           },
//         });

//         results.fixedCount++;
//         results.details.push({
//           id: productId,
//           name: productName,
//           fixed: true,
//         });

//         console.log(`✅ تم إصلاح: ${productName}`);
//       } catch (error: any) {
//         const errorMsg = `❌ خطأ في المنتج ${doc.id}: ${error.message}`;
//         console.error(errorMsg);
//         results.errors.push(errorMsg);
//         results.success = false;

//         results.details.push({
//           id: doc.id,
//           name: doc.data().name || "بدون اسم",
//           fixed: false,
//           error: error.message,
//         });
//       }
//     }

//     // 4. تسجيل النتائج
//     console.log(`🎉 إصلاح المنتجات اكتمل!`, {
//       totalChecked: snapshot.docs.length,
//       totalFixed: results.fixedCount,
//       totalErrors: results.errors.length,
//       success: results.success,
//     });

//     return results;
//   } catch (error: any) {
//     console.error("❌ خطأ عام في إصلاح المنتجات:", error);
//     return {
//       success: false,
//       fixedCount: 0,
//       errors: [`خطأ عام: ${error.message}`],
//       details: [],
//     };
//   }
// }

// // دالة للتحقق من المنتجات التي تحتاج إصلاح
// export async function checkProductsMissingCreatedAt(storeId: string): Promise<{
//   totalProducts: number;
//   missingCreatedAt: number;
//   products: Array<{
//     id: string;
//     name: string;
//     status: string;
//     price: number;
//     hasCreatedAt: boolean;
//     hasUpdatedAt: boolean;
//     createdAt?: Date;
//     updatedAt?: Date;
//   }>;
// }> {
//   try {
//     const productsQuery = query(
//       collection(db, "products"),
//       where("storeId", "==", storeId),
//     );

//     const snapshot = await getDocs(productsQuery);

//     const productsWithMissingCreatedAt = snapshot.docs
//       .filter((doc) => !doc.data().createdAt)
//       .map((doc) => {
//         const data = doc.data();
//         return {
//           id: doc.id,
//           name: data.name || "بدون اسم",
//           status: data.status || "unknown",
//           price: data.price || 0,
//           hasCreatedAt: !!data.createdAt,
//           hasUpdatedAt: !!data.updatedAt,
//           createdAt: data.createdAt?.toDate(),
//           updatedAt: data.updatedAt?.toDate(),
//         };
//       });

//     return {
//       totalProducts: snapshot.docs.length,
//       missingCreatedAt: productsWithMissingCreatedAt.length,
//       products: productsWithMissingCreatedAt,
//     };
//   } catch (error: any) {
//     console.error("❌ خطأ في التحقق من المنتجات:", error);
//     throw error;
//   }
// }

// // إنشاء نسخة واحدة من الخدمة للتصدير
// export const productService = new ProductService();

// // ============ الدوال الأساسية ============

// /**
//  * 🔥 تأكد من وجود عميل في متجر محدد
//  */
// export async function ensureStoreCustomer(
//   storeId: string,
//   uid: string,
// ): Promise<StoreCustomer> {
//   try {
//     const customerRef = doc(db, "stores", storeId, "customers", uid);
//     const snap = await getDoc(customerRef);

//     if (!snap.exists()) {
//       // جلب بيانات المستخدم من Firebase Auth أو users collection
//       let userEmail = "";
//       let userName = "";

//       try {
//         const user = auth.currentUser;
//         if (user) {
//           userEmail = user.email || "";
//           userName = user.displayName || "";
//         } else {
//           const userDoc = await getDoc(doc(db, "users", uid));
//           if (userDoc.exists()) {
//             const userData = userDoc.data();
//             userEmail = userData.email || "";
//             userName =
//               `${userData.firstName || ""} ${userData.lastName || ""}`.trim();
//           }
//         }
//       } catch (err) {
//         console.warn("⚠️ لم يتم جلب بيانات المستخدم:", err);
//       }

//       const [firstName, ...lastNameParts] = userName.split(" ");
//       const lastName = lastNameParts.join(" ") || "";

//       const newCustomer: Omit<StoreCustomer, "id"> = {
//         uid,
//         email: userEmail,
//         firstName,
//         lastName,
//         phone: "",
//         storeId,
//         isActive: true,
//         firstVisit: new Date(),
//         lastVisit: new Date(),
//         shippingAddress: {
//           street: "",
//           city: "",
//           district: "",
//           governorate: "",
//           zipCode: "",
//           country: "اليمن",
//           state: "",
//         },
//         createdAt: undefined,
//         updatedAt: undefined,
//         userType: "customer",
//       };

//       await setDoc(customerRef, {
//         ...newCustomer,
//         firstVisit: serverTimestamp(),
//         lastVisit: serverTimestamp(),
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       });

//       console.log(`✅ تم إنشاء عميل في المتجر ${storeId}: ${uid}`);
//       return { id: uid, ...newCustomer };
//     }

//     // تحديث آخر زيارة
//     await updateDoc(customerRef, {
//       lastVisit: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     });

//     const customerData = snap.data();
//     return {
//       id: uid,
//       ...customerData,
//       firstVisit: customerData.firstVisit?.toDate() || new Date(),
//       lastVisit: customerData.lastVisit?.toDate() || new Date(),
//     } as StoreCustomer;
//   } catch (error) {
//     console.error("❌ خطأ في ensureStoreCustomer:", error);
//     throw error;
//   }
// }

// /**
//  * 🔥 الحصول على أو إنشاء معرف العميل للمتجر
//  */
// export async function getOrCreateCustomerIdForStore(
//   storeId: string,
// ): Promise<string> {
//   try {
//     const user = auth.currentUser;

//     // 1. مستخدم مسجل
//     if (user && user.uid) {
//       await ensureStoreCustomer(storeId, user.uid);
//       return user.uid;
//     }

//     // 2. ضيف
//     const storageKey = `visitor_${storeId}`;
//     let visitorId = localStorage.getItem(storageKey);

//     if (!visitorId) {
//       visitorId = `vis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//       localStorage.setItem(storageKey, visitorId);

//       // إنشاء سجل الضيف (اختياري)
//       try {
//         const visitorRef = doc(db, "stores", storeId, "visitors", visitorId);
//         await setDoc(visitorRef, {
//           visitorId,
//           storeId,
//           firstVisit: serverTimestamp(),
//           lastActivity: serverTimestamp(),
//           isGuest: true,
//           userAgent: navigator.userAgent.substring(0, 100),
//           ipAddress: "", // يمكن إضافته من خلال API
//         });
//       } catch (err) {
//         console.warn("⚠️ لم يتم حفظ بيانات الضيف:", err);
//       }
//     } else {
//       // تحديث آخر نشاط
//       try {
//         const visitorRef = doc(db, "stores", storeId, "visitors", visitorId);
//         await updateDoc(visitorRef, {
//           lastActivity: serverTimestamp(),
//         });
//       } catch (err) {
//         console.warn("⚠️ لم يتم تحديث نشاط الضيف:", err);
//       }
//     }

//     return `guest_${visitorId}`;
//   } catch (error) {
//     console.error("❌ خطأ في getOrCreateCustomerIdForStore:", error);
//     return `guest_temp_${Date.now()}`;
//   }
// }

// /**
//  * 🔥 ربط الضيف بالمستخدم المسجل
//  */
// export async function linkVisitorToCustomer(
//   storeId: string,
//   visitorId: string,
//   uid: string,
// ): Promise<void> {
//   try {
//     console.log(`🔗 ربط الضيف ${visitorId} بـ ${uid} في المتجر ${storeId}`);

//     // 1. إنشاء/تأكيد حساب العميل
//     await ensureStoreCustomer(storeId, uid);

//     // 2. نقل السلة (إذا كانت cartService موجودة)
//     try {
//       const guestCustomerId = `guest_${visitorId}`;
//       // افتراض أن cartService موجود
//       if ((window as any).cartService) {
//         const cartService = (window as any).cartService;
//         const guestCart = await cartService.getCustomerCart(
//           guestCustomerId,
//           storeId,
//         );

//         if (guestCart && guestCart.items.length > 0) {
//           const userCart = await cartService.getCustomerCart(uid, storeId);

//           if (userCart) {
//             // دمج العناصر
//             const mergedItems = [...userCart.items];
//             guestCart.items.forEach((guestItem: CartItem) => {
//               const existingIndex = mergedItems.findIndex(
//                 (item: CartItem) => item.productId === guestItem.productId,
//               );
//               if (existingIndex > -1) {
//                 mergedItems[existingIndex].quantity += guestItem.quantity;
//               } else {
//                 mergedItems.push(guestItem);
//               }
//             });

//             await cartService.updateCart(userCart.id, mergedItems);
//           } else {
//             await cartService.createCartWithItems(
//               uid,
//               storeId,
//               guestCart.items,
//             );
//           }

//           // مسح سلة الضيف
//           await cartService.clearCart(guestCart.id);
//         }
//       }
//     } catch (cartError) {
//       console.warn("⚠️ لم يتم نقل السلة:", cartError);
//     }

//     // 3. تحديث سجل الضيف
//     const visitorRef = doc(db, "stores", storeId, "visitors", visitorId);
//     await updateDoc(visitorRef, {
//       linkedToUid: uid,
//       linkedAt: serverTimestamp(),
//       isGuest: false,
//     });

//     // 4. تحديث الطلبات القديمة
//     const ordersQuery = query(
//       collection(db, "orders"),
//       where("storeId", "==", storeId),
//       where("customerId", "==", `guest_${visitorId}`),
//     );

//     const ordersSnapshot = await getDocs(ordersQuery);
//     const batch = writeBatch(db);

//     ordersSnapshot.docs.forEach((orderDoc) => {
//       batch.update(orderDoc.ref, {
//         customerId: uid,
//         "customerSnapshot.uid": uid,
//       });
//     });

//     if (ordersSnapshot.docs.length > 0) {
//       await batch.commit();
//       console.log(`✅ تم تحديث ${ordersSnapshot.docs.length} طلب`);
//     }

//     // 5. نقل المفضلات
//     try {
//       const favoritesQuery = query(
//         collection(db, "customerFavorites"),
//         where("customerId", "==", `guest_${visitorId}`),
//         where("storeId", "==", storeId),
//       );

//       const favoritesSnapshot = await getDocs(favoritesQuery);
//       const favBatch = writeBatch(db);

//       favoritesSnapshot.docs.forEach((favDoc) => {
//         favBatch.update(favDoc.ref, {
//           customerId: uid,
//         });
//       });

//       if (favoritesSnapshot.docs.length > 0) {
//         await favBatch.commit();
//         console.log(`✅ تم نقل ${favoritesSnapshot.docs.length} منتج مفضل`);
//       }
//     } catch (favError) {
//       console.warn("⚠️ لم يتم نقل المفضلات:", favError);
//     }

//     // 6. تنظيف localStorage
//     localStorage.removeItem(`visitor_${storeId}`);

//     console.log(`✅ تم الربط بنجاح`);
//   } catch (error) {
//     console.error("❌ خطأ في linkVisitorToCustomer:", error);
//     throw error;
//   }
// }

// // ============ Category Services ============

// export const categoryService = {
//   async create(
//     categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">,
//   ): Promise<string> {
//     const cleanedData = cleanFirestoreData({
//       ...categoryData,
//       uiProperties: categoryData.uiProperties || {},
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });

//     console.log("📝 إنشاء فئة جديدة:", {
//       name: categoryData.name,
//       storeId: categoryData.storeId,
//       hasUIProperties: !!cleanedData.uiProperties,
//     });

//     const docRef = await addDoc(collection(db, "categories"), cleanedData);
//     return docRef.id;
//   },

//   async getById(categoryId: string): Promise<Category | null> {
//     try {
//       const docSnap = await getDoc(doc(db, "categories", categoryId));
//       if (docSnap.exists()) {
//         const data = docSnap.data();
//         return { id: docSnap.id, ...data } as Category;
//       }
//       return null;
//     } catch (error) {
//       console.error("Error getting category by ID:", error);
//       return null;
//     }
//   },

//   async getByStore(
//     storeId: string,
//     filters?: {
//       parentId?: string;
//       includeInactive?: boolean;
//       uiProperty?: {
//         key: keyof Category["uiProperties"];
//         value: any;
//       };
//     },
//   ): Promise<Category[]> {
//     try {
//       const constraints: any[] = [where("storeId", "==", storeId)];

//       if (!filters?.includeInactive) {
//         constraints.push(where("isActive", "==", true));
//       }

//       if (filters?.parentId !== undefined) {
//         constraints.push(where("parentId", "==", filters.parentId));
//       }

//       const q = query(collection(db, "categories"), ...constraints);
//       const querySnapshot = await getDocs(q);

//       let categories = querySnapshot.docs.map(
//         (doc) => ({ id: doc.id, ...doc.data() }) as Category,
//       );

//       if (filters?.uiProperty) {
//         const { key, value } = filters.uiProperty;
//         categories = categories.filter(
//           (category) => category.uiProperties?.[key] === value,
//         );
//       }

//       categories = categories.sort((a, b) => a.order - b.order);

//       return categories;
//     } catch (error) {
//       console.error("Error getting categories by store:", error);
//       return [];
//     }
//   },

//   async update(categoryId: string, data: Partial<Category>): Promise<void> {
//     try {
//       const currentCategory = await this.getById(categoryId);
//       if (!currentCategory) {
//         throw new Error("الفئة غير موجودة");
//       }

//       if (data.name && data.name !== currentCategory.name) {
//         const existingCategories = await this.getByStore(
//           currentCategory.storeId,
//           { includeInactive: true },
//         );

//         const nameExists = existingCategories.some(
//           (cat) => cat.name === data.name && cat.id !== categoryId,
//         );

//         if (nameExists) {
//           throw new Error("هذا الاسم مستخدم بالفعل");
//         }
//       }

//       const cleanedData = cleanFirestoreData({
//         ...data,
//         updatedAt: new Date(),
//       });

//       await updateDoc(doc(db, "categories", categoryId), cleanedData);

//       console.log("✅ تم تحديث الفئة:", {
//         categoryId,
//         name: data.name || currentCategory.name,
//       });
//     } catch (error) {
//       console.error("❌ خطأ في تحديث الفئة:", error);
//       throw error;
//     }
//   },

//   async delete(categoryId: string): Promise<void> {
//     try {
//       const currentCategory = await this.getById(categoryId);
//       if (!currentCategory) {
//         throw new Error("الفئة غير موجودة");
//       }

//       const products = await productService.getByStore(
//         currentCategory.storeId,
//         "all",
//       );
//       const productsInCategory = products.filter(
//         (product) => product.category === categoryId,
//       );

//       if (productsInCategory.length > 0) {
//         throw new Error(
//           `لا يمكن حذف الفئة لأنها تحتوي على ${productsInCategory.length} منتج`,
//         );
//       }

//       const subCategories = await this.getByStore(currentCategory.storeId, {
//         parentId: categoryId,
//         includeInactive: true,
//       });

//       if (subCategories.length > 0) {
//         throw new Error(
//           `لا يمكن حذف الفئة لأنها تحتوي على ${subCategories.length} فئة فرعية`,
//         );
//       }

//       await deleteDoc(doc(db, "categories", categoryId));

//       console.log("✅ تم حذف الفئة:", {
//         categoryId,
//         name: currentCategory.name,
//       });
//     } catch (error) {
//       console.error("❌ خطأ في حذف الفئة:", error);
//       throw error;
//     }
//   },

//   async deleteSafely(
//     categoryId: string,
//     moveToCategoryId?: string,
//   ): Promise<void> {
//     try {
//       const currentCategory = await this.getById(categoryId);
//       if (!currentCategory) {
//         throw new Error("الفئة غير موجودة");
//       }

//       if (moveToCategoryId) {
//         const targetCategory = await this.getById(moveToCategoryId);
//         if (!targetCategory) {
//           throw new Error("الفئة الهدف غير موجودة");
//         }

//         const products = await productService.getByStore(
//           currentCategory.storeId,
//           "all",
//         );
//         const productsToUpdate = products.filter(
//           (product) => product.category === categoryId,
//         );

//         const batch = writeBatch(db);
//         for (const product of productsToUpdate) {
//           const productRef = doc(db, "products", product.id);
//           batch.update(productRef, {
//             category: moveToCategoryId,
//             updatedAt: Timestamp.now(),
//           });
//         }

//         if (productsToUpdate.length > 0) {
//           await batch.commit();
//           console.log(
//             `📦 تم نقل ${productsToUpdate.length} منتج إلى الفئة الجديدة`,
//           );
//         }
//       }

//       await deleteDoc(doc(db, "categories", categoryId));

//       console.log("✅ تم حذف الفئة بأمان:", {
//         categoryId,
//         name: currentCategory.name,
//       });
//     } catch (error) {
//       console.error("❌ خطأ في الحذف الآمن للفئة:", error);
//       throw error;
//     }
//   },

//   async getAllCategoriesWithDetails(
//     storeId: string,
//   ): Promise<Array<Category & { productCount: number }>> {
//     try {
//       // استخدام getStoreCategoriesByStoreId مباشرة
//       const categories = await getStoreCategoriesByStoreId(storeId, {
//         includeInactive: true,
//       });

//       const products = await productService.getByStore(storeId, "all");

//       const categoriesWithCounts = categories.map((category) => {
//         const productCount = products.filter(
//           (product) => product.category === category.id,
//         ).length;

//         return {
//           ...category,
//           productCount,
//         };
//       });

//       return categoriesWithCounts;
//     } catch (error) {
//       console.error("❌ خطأ في جلب الفئات مع التفاصيل:", error);
//       return [];
//     }
//   },

//   async updateCategoriesOrder(
//     storeId: string,
//     categoryOrder: Array<{ id: string; order: number }>,
//   ): Promise<void> {
//     try {
//       const batch = writeBatch(db);

//       for (const { id, order } of categoryOrder) {
//         const categoryRef = doc(db, "categories", id);
//         batch.update(categoryRef, {
//           order,
//           updatedAt: new Date(),
//         });
//       }

//       await batch.commit();
//     } catch (error) {
//       console.error("❌ خطأ في تحديث ترتيب الفئات:", error);
//       throw error;
//     }
//   },

//   async toggleCategoryStatus(
//     categoryId: string,
//     isActive: boolean,
//   ): Promise<void> {
//     try {
//       const currentCategory = await this.getById(categoryId);
//       if (!currentCategory) {
//         throw new Error("الفئة غير موجودة");
//       }

//       if (!isActive) {
//         const products = await productService.getByStore(
//           currentCategory.storeId,
//           "all",
//         );
//         const productsInCategory = products.filter(
//           (product) => product.category === categoryId,
//         );

//         if (productsInCategory.length > 0) {
//           throw new Error(
//             `لا يمكن تعطيل الفئة لأنها تحتوي على ${productsInCategory.length} منتج`,
//           );
//         }
//       }

//       await updateDoc(doc(db, "categories", categoryId), {
//         isActive,
//         updatedAt: new Date(),
//       });

//       console.log("✅ تم تغيير حالة الفئة:", {
//         categoryId,
//         name: currentCategory.name,
//         newStatus: isActive ? "نشطة" : "معطلة",
//       });
//     } catch (error) {
//       console.error("❌ خطأ في تغيير حالة الفئة:", error);
//       throw error;
//     }
//   },

//   async mergeCategories(
//     sourceCategoryId: string,
//     targetCategoryId: string,
//   ): Promise<void> {
//     try {
//       const sourceCategory = await this.getById(sourceCategoryId);
//       const targetCategory = await this.getById(targetCategoryId);

//       if (!sourceCategory || !targetCategory) {
//         throw new Error("إحدى الفئات غير موجودة");
//       }

//       if (sourceCategory.storeId !== targetCategory.storeId) {
//         throw new Error("الفئات تابعة لمتاجر مختلفة");
//       }

//       const products = await productService.getByStore(
//         sourceCategory.storeId,
//         "all",
//       );
//       const productsToUpdate = products.filter(
//         (product) => product.category === sourceCategoryId,
//       );

//       const batch = writeBatch(db);
//       for (const product of productsToUpdate) {
//         const productRef = doc(db, "products", product.id);
//         batch.update(productRef, {
//           category: targetCategoryId,
//           updatedAt: Timestamp.now(),
//         });
//       }

//       const subCategories = await this.getByStore(sourceCategory.storeId, {
//         parentId: sourceCategoryId,
//         includeInactive: true,
//       });

//       for (const subCategory of subCategories) {
//         const subCategoryRef = doc(db, "categories", subCategory.id);
//         batch.update(subCategoryRef, {
//           parentId: targetCategoryId,
//           updatedAt: new Date(),
//         });
//       }

//       batch.delete(doc(db, "categories", sourceCategoryId));

//       await batch.commit();

//       console.log("✅ تم دمج الفئات:", {
//         sourceCategory: sourceCategory.name,
//         targetCategory: targetCategory.name,
//         movedProducts: productsToUpdate.length,
//       });
//     } catch (error) {
//       console.error("❌ خطأ في دمج الفئات:", error);
//       throw error;
//     }
//   },

//   async createSubCategory(
//     parentCategoryId: string,
//     categoryData: Omit<Category, "id" | "createdAt" | "updatedAt" | "parentId">,
//   ): Promise<string> {
//     try {
//       const parentCategory = await this.getById(parentCategoryId);
//       if (!parentCategory) {
//         throw new Error("الفئة الرئيسية غير موجودة");
//       }

//       const subCategoryData: Omit<Category, "id" | "createdAt" | "updatedAt"> =
//         {
//           ...categoryData,
//           parentId: parentCategoryId,
//           storeId: parentCategory.storeId,
//         };

//       return await this.create(subCategoryData);
//     } catch (error) {
//       console.error("❌ خطأ في إنشاء الفئة الفرعية:", error);
//       throw error;
//     }
//   },

//   async importFromTemplate(
//     storeId: string,
//     categories: Array<{
//       name: string;
//       description?: string;
//       order?: number;
//       uiProperties?: Category["uiProperties"];
//     }>,
//   ): Promise<string[]> {
//     try {
//       const createdIds: string[] = [];

//       for (const cat of categories) {
//         const categoryId = await this.create({
//           storeId,
//           name: cat.name,
//           description: cat.description || "",
//           order: cat.order || 0,
//           uiProperties: cat.uiProperties,
//           isActive: true,
//         });

//         createdIds.push(categoryId);
//       }

//       console.log("✅ تم استيراد الفئات:", {
//         storeId,
//         count: createdIds.length,
//       });

//       return createdIds;
//     } catch (error) {
//       console.error("❌ خطأ في استيراد الفئات:", error);
//       throw error;
//     }
//   },

//   async exportCategories(storeId: string): Promise<
//     Array<{
//       id: string;
//       name: string;
//       description: string;
//       order: number;
//       isActive: boolean;
//       createdAt: Date;
//       productCount: number;
//       uiProperties?: Category["uiProperties"];
//     }>
//   > {
//     try {
//       const categories = await this.getByStore(storeId, {
//         includeInactive: true,
//       });
//       const products = await productService.getByStore(storeId, "all");

//       const result = categories.map((category) => {
//         const productCount = products.filter(
//           (product) => product.category === category.id,
//         ).length;

//         return {
//           id: category.id,
//           name: category.name,
//           description: category.description,
//           order: category.order,
//           isActive: category.isActive,
//           createdAt: category.createdAt,
//           productCount,
//           uiProperties: category.uiProperties,
//         };
//       });

//       return result;
//     } catch (error) {
//       console.error("❌ خطأ في تصدير الفئات:", error);
//       return [];
//     }
//   },
// };

// // ============ Compliance Service ============

// export const complianceService = {
//   async checkStoreCompliance(storeId: string): Promise<{
//     storeCompliant: boolean;
//     productStats: {
//       total: number;
//       compliant: number;
//       nonCompliant: number;
//       pendingReview: number;
//     };
//     violations: Array<{
//       productId: string;
//       productName: string;
//       issue: string;
//       severity: string;
//     }>;
//     complianceRate: number;
//   }> {
//     try {
//       const store = await storeService.getById(storeId);
//       if (!store) {
//         throw new Error("المتجر غير موجود");
//       }

//       const products = await productService.getByStore(storeId, "all");

//       let compliant = 0;
//       let nonCompliant = 0;
//       let pendingReview = 0;
//       const violations: any[] = [];

//       for (const product of products) {
//         const complianceStatus = product._semantics?.complianceStatus;

//         switch (complianceStatus) {
//           case ComplianceStatus.COMPLIANT:
//             compliant++;
//             break;
//           case ComplianceStatus.NON_COMPLIANT:
//             nonCompliant++;
//             violations.push({
//               productId: product.id,
//               productName: product.name,
//               issue: "عدم تطابق النشاط",
//               severity: "medium",
//             });
//             break;
//           case ComplianceStatus.PENDING_REVIEW:
//           default:
//             pendingReview++;
//             break;
//         }
//       }

//       const total = products.length;
//       const complianceRate = total > 0 ? (compliant / total) * 100 : 100;
//       const storeCompliant =
//         complianceRate >= (store.complianceSettings?.reviewThreshold || 90);

//       return {
//         storeCompliant,
//         productStats: { total, compliant, nonCompliant, pendingReview },
//         violations,
//         complianceRate,
//       };
//     } catch (error) {
//       console.error("❌ خطأ في فحص امتثال المتجر:", error);
//       throw error;
//     }
//   },

//   async reviewProduct(
//     productId: string,
//     decision: "approve" | "reject" | "exempt",
//     reviewerId: string,
//     notes?: string,
//   ): Promise<void> {
//     try {
//       const product = await productService.getById(productId);
//       if (!product) {
//         throw new Error("المنتج غير موجود");
//       }

//       let updateData: Partial<Product> = {
//         _semantics: {
//           ...product._semantics,
//           reviewedBy: reviewerId,
//           reviewedAt: new Date(),
//         },
//       };

//       switch (decision) {
//         case "approve":
//           updateData.status = ProductStatus.ACTIVE;
//           updateData._semantics!.complianceStatus = ComplianceStatus.COMPLIANT;
//           updateData._semantics!.exemptionReason = undefined;
//           break;
//         case "reject":
//           updateData.status = ProductStatus.SUSPENDED;
//           updateData._semantics!.complianceStatus =
//             ComplianceStatus.NON_COMPLIANT;
//           updateData._semantics!.exemptionReason = notes;
//           break;
//         case "exempt":
//           updateData.status = ProductStatus.ACTIVE;
//           updateData._semantics!.complianceStatus = ComplianceStatus.EXEMPTED;
//           updateData._semantics!.exemptionReason = notes;
//           break;
//       }

//       await productService.update(productId, updateData);

//       console.log(`✅ تم مراجعة المنتج ${productId}:`, {
//         decision,
//         reviewerId,
//         newStatus: updateData.status,
//       });
//     } catch (error) {
//       console.error("❌ خطأ في مراجعة المنتج:", error);
//       throw error;
//     }
//   },

//   async getComplianceFlags(
//     storeId?: string,
//     status?: ComplianceFlag["status"],
//     limite: number = 50,
//   ): Promise<ComplianceFlag[]> {
//     try {
//       const constraints: any[] = [];

//       if (storeId) {
//         constraints.push(where("storeId", "==", storeId));
//       }

//       if (status) {
//         constraints.push(where("status", "==", status));
//       }

//       let q;
//       if (constraints.length > 0) {
//         q = query(
//           collection(db, "complianceFlags"),
//           ...constraints,
//           orderBy("createdAt", "desc"),
//           limit(limite),
//         );
//       } else {
//         q = query(
//           collection(db, "complianceFlags"),
//           orderBy("createdAt", "desc"),
//           limit(limite),
//         );
//       }

//       const querySnapshot = await getDocs(q);
//       return querySnapshot.docs.map((doc) => {
//         const data = doc.data() as Record<string, any>;
//         return {
//           id: doc.id,
//           ...data,
//         } as ComplianceFlag;
//       });
//     } catch (error) {
//       console.error("❌ خطأ في جلب مخالفات الامتثال:", error);
//       return [];
//     }
//   },

//   async updateFlagStatus(
//     flagId: string,
//     status: ComplianceFlag["status"],
//     assignedTo?: string,
//     resolutionNotes?: string,
//   ): Promise<void> {
//     try {
//       const updateData: any = {
//         status,
//         updatedAt: new Date(),
//       };

//       if (status === "resolved") {
//         updateData.resolvedAt = new Date();
//       }

//       if (assignedTo) {
//         updateData.assignedTo = assignedTo;
//       }

//       if (resolutionNotes) {
//         updateData.resolutionNotes = resolutionNotes;
//       }

//       await updateDoc(doc(db, "complianceFlags", flagId), updateData);

//       console.log(`✅ تم تحديث حالة المخالفة ${flagId}:`, status);
//     } catch (error) {
//       console.error("❌ خطأ في تحديث حالة المخالفة:", error);
//       throw error;
//     }
//   },

//   async runScheduledComplianceChecks(): Promise<void> {
//     try {
//       const stores = await storeService.getAll(1, 100);

//       console.log(`🔄 بدء الفحص الدوري لـ ${stores.length} متجر`);

//       for (const store of stores) {
//         if (store.status === "active") {
//           try {
//             await complianceSystem.batchComplianceCheck(store.id);
//             console.log(`✅ تم فحص امتثال المتجر ${store.name}`);
//           } catch (error) {
//             console.error(`❌ خطأ في فحص المتجر ${store.id}:`, error);
//           }
//         }
//       }

//       console.log("✅ اكتمل الفحص الدوري للامتثال");
//     } catch (error) {
//       console.error("❌ خطأ في الفحص الدوري:", error);
//     }
//   },
// };

// // دالة للحصول على المتجر بواسطة المالك
// export const getStoreByOwnerId = async (
//   ownerId: string,
// ): Promise<Store | null> => {
//   const stores = await storeService.getByOwner(ownerId);
//   return stores.length > 0 ? stores[0] : null;
// };

// // أضف هذه الدوال في مكان مناسب في firestore.ts

// /**
//  * 🔍 التحقق من توفر النطاق الفرعي
//  */
// export const checkSubdomainAvailability = async (
//   subdomain: string,
// ): Promise<boolean> => {
//   try {
//     if (!subdomain || subdomain.trim().length < 3) {
//       return false;
//     }

//     // تنظيف النطاق
//     const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");

//     // التحقق من النطاقات المحجوزة
//     const reservedSubdomains = [
//       "admin",
//       "dashboard",
//       "api",
//       "support",
//       "blog",
//       "help",
//       "store",
//       "shop",
//       "merchant",
//       "seller",
//       "platform",
//     ];

//     if (reservedSubdomains.includes(cleanSubdomain)) {
//       return false;
//     }

//     // التحقق من Firestore
//     const q = query(
//       collection(db, "stores"),
//       where("subdomain", "==", cleanSubdomain),
//     );

//     const querySnapshot = await getDocs(q);
//     return querySnapshot.empty; // true إذا كان متاحًا
//   } catch (error) {
//     console.error("❌ خطأ في التحقق من النطاق الفرعي:", error);
//     return false;
//   }
// };

// /**
//  * ✨ اقتراح subdomain تلقائي من اسم المتجر
//  */
// export const suggestSubdomain = (storeName: string): string => {
//   if (!storeName || storeName.trim().length === 0) {
//     return "";
//   }

//   return storeName
//     .toLowerCase()
//     .replace(/\s+/g, "-")
//     .replace(/[^\w\u0600-\u06FF-]/g, "") // السماح بالعربية والإنجليزية
//     .replace(/-+/g, "-")
//     .replace(/^-+|-+$/g, "")
//     .substring(0, 25);
// };

// // ============ Order Services ============

// // ============ Order Services المحدثة ============

// // ============ خدمات البيانات ============

// export const customerService = {
//   // جلب عميل محدد من متجر محدد
//   async getStoreCustomer(
//     storeId: string,
//     uid: string,
//   ): Promise<StoreCustomer | null> {
//     try {
//       const customerRef = doc(db, "stores", storeId, "customers", uid);
//       const snap = await getDoc(customerRef);

//       if (snap.exists()) {
//         const data = snap.data();
//         return {
//           id: uid,
//           ...data,
//           firstVisit: data.firstVisit?.toDate() || new Date(),
//           lastVisit: data.lastVisit?.toDate() || new Date(),
//         } as StoreCustomer;
//       }
//       return null;
//     } catch (error) {
//       console.error("❌ خطأ في getStoreCustomer:", error);
//       return null;
//     }
//   },

//   // جلب جميع عملاء المتجر
//   async getByStore(storeId: string): Promise<StoreCustomer[]> {
//     try {
//       const customersRef = collection(db, "stores", storeId, "customers");
//       const q = query(customersRef, orderBy("lastVisit", "desc"));
//       const querySnapshot = await getDocs(q);

//       const customers: StoreCustomer[] = [];

//       for (const docSnap of querySnapshot.docs) {
//         const data = docSnap.data();
//         customers.push({
//           id: docSnap.id,
//           ...data,
//           firstVisit: data.firstVisit?.toDate() || new Date(),
//           lastVisit: data.lastVisit?.toDate() || new Date(),
//         } as StoreCustomer);
//       }

//       // جلب إحصائيات الطلبات
//       try {
//         const orders = await orderService.getByStore(storeId);
//         customers.forEach((customer) => {
//           const customerOrders = orders.filter(
//             (o) => o.customerId === customer.uid,
//           );
//           customer.totalOrders = customerOrders.length;
//           customer.totalSpent = customerOrders.reduce(
//             (sum, o) => sum + o.total,
//             0,
//           );
//         });
//       } catch (ordersError) {
//         console.warn("⚠️ لم يتم جلب إحصائيات الطلبات:", ordersError);
//       }

//       return customers;
//     } catch (error) {
//       console.error("❌ خطأ في getByStore:", error);
//       return [];
//     }
//   },

//   // تحديث بيانات العميل
//   async update(customerId: string, data: Partial<Customer>): Promise<void> {
//     try {
//       const storeId = data.storeId;
//       if (!storeId) throw new Error("storeId مطلوب");

//       const customerRef = doc(db, "stores", storeId, "customers", customerId);
//       await updateDoc(customerRef, {
//         ...data,
//         updatedAt: serverTimestamp(),
//       });

//       // إذا كان هناك عنوان شحن، تحديثه أيضاً
//       if (data.shippingAddress) {
//         await updateDoc(customerRef, {
//           shippingAddress: data.shippingAddress,
//         });
//       }
//     } catch (error) {
//       console.error("❌ خطأ في تحديث العميل:", error);
//       throw error;
//     }
//   },

//   // دالة التوافق مع النظام القديم
//   async getByUid(uid: string): Promise<Customer | null> {
//     try {
//       // محاولة العثور في أي متجر
//       const stores = await storeService.getAll();

//       for (const store of stores) {
//         const customer = await this.getStoreCustomer(store.id, uid);
//         if (customer) return customer;
//       }

//       return null;
//     } catch (error) {
//       console.error("❌ خطأ في getByUid:", error);
//       return null;
//     }
//   },

//   // البحث عن عملاء
//   async search(storeId: string, searchTerm: string): Promise<StoreCustomer[]> {
//     try {
//       const customers = await this.getByStore(storeId);

//       return customers.filter(
//         (customer) =>
//           customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           customer.phone?.includes(searchTerm),
//       );
//     } catch (error) {
//       console.error("❌ خطأ في البحث:", error);
//       return [];
//     }
//   },
// };

// export const orderService = {
//   // إنشاء طلب جديد
//   async create(orderData: Omit<Order, "id">): Promise<string> {
//     try {
//       const orderWithTimestamp = {
//         ...orderData,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       };

//       const docRef = await addDoc(collection(db, "orders"), orderWithTimestamp);
//       console.log("✅ تم إنشاء الطلب:", docRef.id);

//       // تحديث آخر طلب للعميل
//       if (orderData.customerId && !orderData.customerId.startsWith("guest_")) {
//         try {
//           const customerRef = doc(
//             db,
//             "stores",
//             orderData.storeId,
//             "customers",
//             orderData.customerId,
//           );
//           await updateDoc(customerRef, {
//             lastOrderAt: serverTimestamp(),
//             updatedAt: serverTimestamp(),
//           });
//         } catch (custError) {
//           console.warn("⚠️ لم يتم تحديث تاريخ آخر طلب للعميل:", custError);
//         }
//       }

//       return docRef.id;
//     } catch (error) {
//       console.error("❌ خطأ في إنشاء الطلب:", error);
//       throw error;
//     }
//   },

//   // جلب طلب بواسطة ID
//   async getById(orderId: string): Promise<Order | null> {
//     try {
//       const orderRef = doc(db, "orders", orderId);
//       const orderSnap = await getDoc(orderRef);

//       if (orderSnap.exists()) {
//         const data = orderSnap.data();
//         // ✅ بناء كامل لكائن Order
//         const order: Order = {
//           id: orderSnap.id,
//           storeId: data.storeId || "",
//           customerId: data.customerId || "",
//           customerSnapshot: data.customerSnapshot || {
//             email: "",
//             firstName: "",
//             lastName: "",
//             phone: "",
//             shippingAddress: {
//               street: "",
//               city: "",
//               district: "",
//               governorate: "",
//               zipCode: "",
//               country: "اليمن",
//             },
//           },
//           items: data.items || [],
//           subtotal: data.subtotal || 0,
//           shipping: data.shipping || 0,
//           tax: data.tax || 0,
//           discount: data.discount || 0, // ✅ تم إضافته
//           total: data.total || 0,
//           shippingAddress: data.shippingAddress || {
//             street: "",
//             city: "",
//             district: "",
//             governorate: "",
//             zipCode: "",
//             country: "اليمن",
//           },
//           billingAddress: data.billingAddress,
//           paymentMethod: data.paymentMethod || "cod",
//           paymentStatus: data.paymentStatus || "pending",
//           orderStatus: data.orderStatus || "pending",
//           notes: data.notes || "",
//           trackingNumber: data.trackingNumber || "",
//           estimatedDelivery: data.estimatedDelivery?.toDate(),
//           createdAt: data.createdAt?.toDate() || new Date(),
//           updatedAt: data.updatedAt?.toDate() || new Date(),
//           // الخصائص الاختيارية
//           discountCode: data.discountCode,
//           paymentDetails: data.paymentDetails,
//           fulfillmentStatus: data.fulfillmentStatus,
//           customerNotes: data.customerNotes,
//           deliveredAt: data.deliveredAt?.toDate(),
//           cancelledAt: data.cancelledAt?.toDate(),
//           refundedAt: data.refundedAt?.toDate(),
//           firestoreId: orderSnap.id,
//         };
//         return order; // ✅ لا حاجة لـ "as Order"
//       }
//       return null;
//     } catch (error) {
//       console.error("❌ خطأ في جلب الطلب:", error);
//       return null;
//     }
//   },

//   // جلب طلبات المتجر
//   async getByStore(storeId: string): Promise<Order[]> {
//     try {
//       const q = query(
//         collection(db, "orders"),
//         where("storeId", "==", storeId),
//         orderBy("createdAt", "desc"),
//       );

//       const querySnapshot = await getDocs(q);
//       // ✅ الحل: بناء كائن Order بشكل صريح وكامل
//       return querySnapshot.docs.map((doc) => {
//         const data = doc.data();
//         // قم ببناء كائن الطلب مع كل الخصائص المطلوبة في واجهتك
//         const order: Order = {
//           id: doc.id,
//           // استخرج جميع الخصائص المطلوبة من data أو عيّن قيم افتراضية
//           storeId: data.storeId || "",
//           customerId: data.customerId || "",
//           customerSnapshot: data.customerSnapshot || {
//             email: "",
//             firstName: "",
//             lastName: "",
//             phone: "",
//             shippingAddress: {
//               street: "",
//               city: "",
//               district: "",
//               governorate: "",
//               zipCode: "",
//               country: "",
//             },
//           },
//           items: data.items || [],
//           subtotal: data.subtotal || 0,
//           shipping: data.shipping || 0,
//           tax: data.tax || 0,
//           discount: data.discount || 0,
//           total: data.total || 0,
//           shippingAddress: data.shippingAddress || {
//             street: "",
//             city: "",
//             district: "",
//             governorate: "",
//             zipCode: "",
//             country: "",
//           },
//           paymentMethod: data.paymentMethod || "cod",
//           paymentStatus: data.paymentStatus || "pending",
//           orderStatus: data.orderStatus || "pending",
//           notes: data.notes || "",
//           trackingNumber: data.trackingNumber || "",
//           // تحويل الطوابع الزمنية
//           createdAt: data.createdAt?.toDate() || new Date(),
//           updatedAt: data.updatedAt?.toDate() || new Date(),
//           estimatedDelivery: data.estimatedDelivery?.toDate(),
//         };
//         return order;
//       });
//     } catch (error) {
//       console.error("❌ خطأ في جلب طلبات المتجر:", error);
//       return [];
//     }
//   },

//   // جلب طلبات العميل
//   async getByCustomer(customerId: string): Promise<Order[]> {
//     try {
//       const q = query(
//         collection(db, "orders"),
//         where("customerId", "==", customerId),
//         orderBy("createdAt", "desc"),
//       );

//       const querySnapshot = await getDocs(q);
//       // ✅ الحل: بناء كائن Order بشكل صريح وكامل
//       return querySnapshot.docs.map((doc) => {
//         const data = doc.data();
//         // قم ببناء كائن الطلب مع كل الخصائص المطلوبة في واجهتك
//         const order: Order = {
//           id: doc.id,
//           // استخرج جميع الخصائص المطلوبة من data أو عيّن قيم افتراضية
//           storeId: data.storeId || "",
//           customerId: data.customerId || "",
//           customerSnapshot: data.customerSnapshot || {
//             email: "",
//             firstName: "",
//             lastName: "",
//             phone: "",
//             shippingAddress: {
//               street: "",
//               city: "",
//               district: "",
//               governorate: "",
//               zipCode: "",
//               country: "",
//             },
//           },
//           items: data.items || [],
//           subtotal: data.subtotal || 0,
//           shipping: data.shipping || 0,
//           tax: data.tax || 0,
//           discount: data.discount || 0,
//           total: data.total || 0,
//           shippingAddress: data.shippingAddress || {
//             street: "",
//             city: "",
//             district: "",
//             governorate: "",
//             zipCode: "",
//             country: "",
//           },
//           paymentMethod: data.paymentMethod || "cod",
//           paymentStatus: data.paymentStatus || "pending",
//           orderStatus: data.orderStatus || "pending",
//           notes: data.notes || "",
//           trackingNumber: data.trackingNumber || "",
//           // تحويل الطوابع الزمنية
//           createdAt: data.createdAt?.toDate() || new Date(),
//           updatedAt: data.updatedAt?.toDate() || new Date(),
//           estimatedDelivery: data.estimatedDelivery?.toDate(),
//         };
//         return order;
//       });
//     } catch (error) {
//       console.error("❌ خطأ في جلب طلبات العميل:", error);
//       return [];
//     }
//   },

//   // تحديث الطلب
//   async update(orderId: string, data: Partial<Order>): Promise<void> {
//     try {
//       const orderRef = doc(db, "orders", orderId);
//       await updateDoc(orderRef, {
//         ...data,
//         updatedAt: serverTimestamp(),
//       });
//     } catch (error) {
//       console.error("❌ خطأ في تحديث الطلب:", error);
//       throw error;
//     }
//   },

//   // حذف الطلب
//   async delete(orderId: string): Promise<void> {
//     try {
//       const orderRef = doc(db, "orders", orderId);
//       await deleteDoc(orderRef);
//     } catch (error) {
//       console.error("❌ خطأ في حذف الطلب:", error);
//       throw error;
//     }
//   },

//   // إحصائيات الطلبات
//   async getStats(storeId: string): Promise<{
//     totalOrders: number;
//     totalRevenue: number;
//     pendingOrders: number;
//     averageOrderValue: number;
//   }> {
//     try {
//       const orders = await this.getByStore(storeId);

//       const totalOrders = orders.length;
//       const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
//       const pendingOrders = orders.filter(
//         (o) => o.orderStatus === "pending",
//       ).length;
//       const averageOrderValue =
//         totalOrders > 0 ? totalRevenue / totalOrders : 0;

//       return {
//         totalOrders,
//         totalRevenue,
//         pendingOrders,
//         averageOrderValue,
//       };
//     } catch (error) {
//       console.error("❌ خطأ في إحصائيات الطلبات:", error);
//       return {
//         totalOrders: 0,
//         totalRevenue: 0,
//         pendingOrders: 0,
//         averageOrderValue: 0,
//       };
//     }
//   },
// };

// export const cartService = {
//   // إنشاء سلة جديدة
//   async createCart(customerId: string, storeId: string): Promise<string> {
//     try {
//       const cartRef = await addDoc(collection(db, "customerCarts"), {
//         customerId,
//         storeId,
//         items: [],
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       });

//       return cartRef.id;
//     } catch (error) {
//       console.error("❌ خطأ في إنشاء السلة:", error);
//       throw error;
//     }
//   },

//   // إنشاء سلة مع عناصر
//   async createCartWithItems(
//     customerId: string,
//     storeId: string,
//     items: CartItem[],
//   ): Promise<string> {
//     try {
//       const cartRef = await addDoc(collection(db, "customerCarts"), {
//         customerId,
//         storeId,
//         items,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//       });

//       return cartRef.id;
//     } catch (error) {
//       console.error("❌ خطأ في إنشاء السلة مع عناصر:", error);
//       throw error;
//     }
//   },

//   // جلب سلة العميل
//   async getCustomerCart(
//     customerId: string,
//     storeId: string,
//   ): Promise<Cart | null> {
//     try {
//       const q = query(
//         collection(db, "customerCarts"),
//         where("customerId", "==", customerId),
//         where("storeId", "==", storeId),
//         limit(1),
//       );

//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         const doc = querySnapshot.docs[0];
//         const data = doc.data();
//         return {
//           id: doc.id,
//           ...data,
//           createdAt: data.createdAt?.toDate() || new Date(),
//           updatedAt: data.updatedAt?.toDate() || new Date(),
//         } as Cart;
//       }

//       return null;
//     } catch (error) {
//       console.error("❌ خطأ في جلب سلة العميل:", error);
//       return null;
//     }
//   },

//   // تحديث السلة
//   async updateCart(cartId: string, items: CartItem[]): Promise<void> {
//     try {
//       const cartRef = doc(db, "customerCarts", cartId);
//       await updateDoc(cartRef, {
//         items,
//         updatedAt: serverTimestamp(),
//       });
//     } catch (error) {
//       console.error("❌ خطأ في تحديث السلة:", error);
//       throw error;
//     }
//   },

//   // مسح السلة
//   async clearCart(cartId: string): Promise<void> {
//     try {
//       const cartRef = doc(db, "customerCarts", cartId);
//       await updateDoc(cartRef, {
//         items: [],
//         updatedAt: serverTimestamp(),
//       });
//     } catch (error) {
//       console.error("❌ خطأ في مسح السلة:", error);
//       throw error;
//     }
//   },

//   // إضافة منتج للسلة
//   async addToCart(
//     cartId: string,
//     productId: string,
//     quantity: number = 1,
//   ): Promise<void> {
//     try {
//       const cartRef = doc(db, "customerCarts", cartId);
//       const cartSnap = await getDoc(cartRef);

//       if (!cartSnap.exists()) {
//         throw new Error("السلة غير موجودة");
//       }

//       const cart = cartSnap.data() as Cart;
//       const existingItemIndex = cart.items.findIndex(
//         (item) => item.productId === productId,
//       );

//       let newItems: CartItem[];
//       if (existingItemIndex > -1) {
//         newItems = [...cart.items];
//         newItems[existingItemIndex].quantity += quantity;
//         newItems[existingItemIndex].addedAt = new Date();
//       } else {
//         newItems = [
//           ...cart.items,
//           {
//             productId,
//             quantity,
//             addedAt: new Date(),
//           },
//         ];
//       }

//       await updateDoc(cartRef, {
//         items: newItems,
//         updatedAt: serverTimestamp(),
//       });
//     } catch (error) {
//       console.error("❌ خطأ في إضافة المنتج للسلة:", error);
//       throw error;
//     }
//   },

//   // إزالة منتج من السلة
//   async removeFromCart(cartId: string, productId: string): Promise<void> {
//     try {
//       const cartRef = doc(db, "customerCarts", cartId);
//       const cartSnap = await getDoc(cartRef);

//       if (!cartSnap.exists()) {
//         throw new Error("السلة غير موجودة");
//       }

//       const cart = cartSnap.data() as Cart;
//       const newItems = cart.items.filter(
//         (item) => item.productId !== productId,
//       );

//       await updateDoc(cartRef, {
//         items: newItems,
//         updatedAt: serverTimestamp(),
//       });
//     } catch (error) {
//       console.error("❌ خطأ في إزالة المنتج من السلة:", error);
//       throw error;
//     }
//   },

//   // تحديث كمية المنتج
//   async updateQuantity(
//     cartId: string,
//     productId: string,
//     quantity: number,
//   ): Promise<void> {
//     try {
//       if (quantity <= 0) {
//         await this.removeFromCart(cartId, productId);
//         return;
//       }

//       const cartRef = doc(db, "customerCarts", cartId);
//       const cartSnap = await getDoc(cartRef);

//       if (!cartSnap.exists()) {
//         throw new Error("السلة غير موجودة");
//       }

//       const cart = cartSnap.data() as Cart;
//       const existingItemIndex = cart.items.findIndex(
//         (item) => item.productId === productId,
//       );

//       if (existingItemIndex === -1) {
//         throw new Error("المنتج غير موجود في السلة");
//       }

//       const newItems = [...cart.items];
//       newItems[existingItemIndex].quantity = quantity;
//       newItems[existingItemIndex].addedAt = new Date();

//       await updateDoc(cartRef, {
//         items: newItems,
//         updatedAt: serverTimestamp(),
//       });
//     } catch (error) {
//       console.error("❌ خطأ في تحديث الكمية:", error);
//       throw error;
//     }
//   },
// };

// export const favoritesService = {
//   // إضافة منتج للمفضلة
//   async addFavorite(
//     customerId: string,
//     storeId: string,
//     productId: string,
//   ): Promise<string> {
//     try {
//       // التحقق من عدم وجود المنتج بالفعل
//       const existing = await this.getFavorite(customerId, storeId, productId);
//       if (existing) {
//         return existing.id;
//       }

//       const favRef = await addDoc(collection(db, "customerFavorites"), {
//         customerId,
//         storeId,
//         productId,
//         addedAt: serverTimestamp(),
//       });

//       return favRef.id;
//     } catch (error) {
//       console.error("❌ خطأ في إضافة المفضلة:", error);
//       throw error;
//     }
//   },

//   // جلب منتج مفضل
//   async getFavorite(
//     customerId: string,
//     storeId: string,
//     productId: string,
//   ): Promise<Favorite | null> {
//     try {
//       const q = query(
//         collection(db, "customerFavorites"),
//         where("customerId", "==", customerId),
//         where("storeId", "==", storeId),
//         where("productId", "==", productId),
//         limit(1),
//       );

//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         const doc = querySnapshot.docs[0];
//         const data = doc.data();
//         return {
//           id: doc.id,
//           ...data,
//           addedAt: data.addedAt?.toDate() || new Date(),
//         } as Favorite;
//       }

//       return null;
//     } catch (error) {
//       console.error("❌ خطأ في جلب المفضلة:", error);
//       return null;
//     }
//   },

//   // جلب جميع المفضلات
//   async getFavorites(customerId: string, storeId: string): Promise<Favorite[]> {
//     try {
//       const q = query(
//         collection(db, "customerFavorites"),
//         where("customerId", "==", customerId),
//         where("storeId", "==", storeId),
//         orderBy("addedAt", "desc"),
//       );

//       const querySnapshot = await getDocs(q);

//       return querySnapshot.docs.map((doc) => {
//         const data = doc.data();
//         return {
//           id: doc.id,
//           ...data,
//           addedAt: data.addedAt?.toDate() || new Date(),
//         } as Favorite;
//       });
//     } catch (error) {
//       console.error("❌ خطأ في جلب المفضلات:", error);
//       return [];
//     }
//   },

//   // إزالة من المفضلة
//   async removeFavorite(favoriteId: string): Promise<void> {
//     try {
//       const favRef = doc(db, "customerFavorites", favoriteId);
//       await deleteDoc(favRef);
//     } catch (error) {
//       console.error("❌ خطأ في إزالة المفضلة:", error);
//       throw error;
//     }
//   },

//   // إزالة منتج من المفضلة
//   async removeFavoriteByProduct(
//     customerId: string,
//     storeId: string,
//     productId: string,
//   ): Promise<void> {
//     try {
//       const favorite = await this.getFavorite(customerId, storeId, productId);
//       if (favorite) {
//         await this.removeFavorite(favorite.id);
//       }
//     } catch (error) {
//       console.error("❌ خطأ في إزالة المفضلة:", error);
//       throw error;
//     }
//   },

//   // التحقق إذا كان المنتج مفضلاً
//   async isFavorite(
//     customerId: string,
//     storeId: string,
//     productId: string,
//   ): Promise<boolean> {
//     try {
//       const favorite = await this.getFavorite(customerId, storeId, productId);
//       return !!favorite;
//     } catch (error) {
//       console.error("❌ خطأ في التحقق من المفضلة:", error);
//       return false;
//     }
//   },
// };

// // ============ Upload Service ============

// export const uploadService = {
//   async uploadImage(file: File, path: string): Promise<string> {
//     const fileRef = ref(storage, `images/${path}/${Date.now()}_${file.name}`);
//     await uploadBytes(fileRef, file);
//     return await getDownloadURL(fileRef);
//   },

//   async deleteImage(url: string): Promise<void> {
//     const fileRef = ref(storage, url);
//     await deleteObject(fileRef);
//   },
// };

// // ============ SubBusiness Category Services ============

// export const subBusinessCategoryService = {
//   async createOrUpdate(
//     storeId: string,
//     subBusinessType: string,
//     categories: Array<{
//       name: string;
//       description?: string;
//       image?: string;
//       order?: number;
//     }>,
//   ): Promise<string> {
//     try {
//       const q = query(
//         collection(db, "subBusinessCategories"),
//         where("storeId", "==", storeId),
//         where("subBusinessType", "==", subBusinessType),
//       );

//       const querySnapshot = await getDocs(q);

//       const categoryData: Omit<SubBusinessCategory, "id"> = {
//         storeId,
//         subBusinessType,
//         categories: categories.map((cat, index) => ({
//           id: `cat_${Date.now()}_${index}`,
//           name: cat.name,
//           description: cat.description || "",
//           image: cat.image || "",
//           order: cat.order || index,
//           isActive: true,
//         })),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       if (!querySnapshot.empty) {
//         const docRef = querySnapshot.docs[0];
//         await updateDoc(docRef.ref, {
//           categories: categoryData.categories,
//           updatedAt: new Date(),
//         });
//         return docRef.id;
//       } else {
//         const docRef = await addDoc(
//           collection(db, "subBusinessCategories"),
//           categoryData,
//         );
//         return docRef.id;
//       }
//     } catch (error) {
//       console.error("❌ خطأ في إنشاء/تحديث فئات النشاط الفرعي:", error);
//       throw error;
//     }
//   },

//   async getBySubBusinessType(
//     storeId: string,
//     subBusinessType: string,
//   ): Promise<SubBusinessCategory | null> {
//     try {
//       const q = query(
//         collection(db, "subBusinessCategories"),
//         where("storeId", "==", storeId),
//         where("subBusinessType", "==", subBusinessType),
//       );

//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         const doc = querySnapshot.docs[0];
//         return { id: doc.id, ...doc.data() } as SubBusinessCategory;
//       }
//       return null;
//     } catch (error) {
//       console.error("❌ خطأ في جلب فئات النشاط الفرعي:", error);
//       return null;
//     }
//   },

//   async updateCategoryInSubBusiness(
//     storeId: string,
//     subBusinessType: string,
//     categoryId: string,
//     updates: Partial<{
//       name: string;
//       description: string;
//       image: string;
//       order: number;
//       isActive: boolean;
//     }>,
//   ): Promise<void> {
//     try {
//       const q = query(
//         collection(db, "subBusinessCategories"),
//         where("storeId", "==", storeId),
//         where("subBusinessType", "==", subBusinessType),
//       );

//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         const docRef = querySnapshot.docs[0];
//         const data = docRef.data() as SubBusinessCategory;

//         const updatedCategories = data.categories.map((cat) =>
//           cat.id === categoryId ? { ...cat, ...updates } : cat,
//         );

//         await updateDoc(docRef.ref, {
//           categories: updatedCategories,
//           updatedAt: new Date(),
//         });

//         console.log("✅ تم تحديث الفئة في النشاط الفرعي:", {
//           storeId,
//           subBusinessType,
//           categoryId,
//           updates,
//         });
//       }
//     } catch (error) {
//       console.error("❌ خطأ في تحديث الفئة في النشاط الفرعي:", error);
//       throw error;
//     }
//   },

//   async deleteCategoryFromSubBusiness(
//     storeId: string,
//     subBusinessType: string,
//     categoryId: string,
//   ): Promise<void> {
//     try {
//       const q = query(
//         collection(db, "subBusinessCategories"),
//         where("storeId", "==", storeId),
//         where("subBusinessType", "==", subBusinessType),
//       );

//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         const docRef = querySnapshot.docs[0];
//         const data = docRef.data() as SubBusinessCategory;

//         const updatedCategories = data.categories.filter(
//           (cat) => cat.id !== categoryId,
//         );

//         await updateDoc(docRef.ref, {
//           categories: updatedCategories,
//           updatedAt: new Date(),
//         });

//         console.log("✅ تم حذف الفئة من النشاط الفرعي:", {
//           storeId,
//           subBusinessType,
//           categoryId,
//         });
//       }
//     } catch (error) {
//       console.error("❌ خطأ في حذف الفئة من النشاط الفرعي:", error);
//       throw error;
//     }
//   },

//   async addCategoryToSubBusiness(
//     storeId: string,
//     subBusinessType: string,
//     category: {
//       name: string;
//       description?: string;
//       image?: string;
//       order?: number;
//     },
//   ): Promise<string> {
//     try {
//       const q = query(
//         collection(db, "subBusinessCategories"),
//         where("storeId", "==", storeId),
//         where("subBusinessType", "==", subBusinessType),
//       );

//       const querySnapshot = await getDocs(q);

//       const newCategory = {
//         id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//         name: category.name,
//         description: category.description || "",
//         image: category.image || "",
//         order: category.order || 0,
//         isActive: true,
//       };

//       if (!querySnapshot.empty) {
//         const docRef = querySnapshot.docs[0];
//         const data = docRef.data() as SubBusinessCategory;

//         const updatedCategories = [...data.categories, newCategory];

//         await updateDoc(docRef.ref, {
//           categories: updatedCategories,
//           updatedAt: new Date(),
//         });

//         return newCategory.id;
//       } else {
//         const categoryData: Omit<SubBusinessCategory, "id"> = {
//           storeId,
//           subBusinessType,
//           categories: [newCategory],
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         };

//         const docRef = await addDoc(
//           collection(db, "subBusinessCategories"),
//           categoryData,
//         );

//         return newCategory.id;
//       }
//     } catch (error) {
//       console.error("❌ خطأ في إضافة فئة إلى النشاط الفرعي:", error);
//       throw error;
//     }
//   },

//   async getAllByStore(storeId: string): Promise<SubBusinessCategory[]> {
//     try {
//       const q = query(
//         collection(db, "subBusinessCategories"),
//         where("storeId", "==", storeId),
//       );

//       const querySnapshot = await getDocs(q);
//       return querySnapshot.docs.map(
//         (doc) => ({ id: doc.id, ...doc.data() }) as SubBusinessCategory,
//       );
//     } catch (error) {
//       console.error("❌ خطأ في جلب فئات الأنشطة الفرعية:", error);
//       return [];
//     }
//   },
// };

// // ============ دوال مساعدة لتعديل الفئات ============

// export async function updateCategoryComprehensive(
//   categoryId: string,
//   updateData: CategoryUpdateData,
// ): Promise<void> {
//   try {
//     const category = await categoryService.getById(categoryId);
//     if (!category) {
//       throw new Error("الفئة غير موجودة");
//     }

//     await categoryService.update(categoryId, updateData);

//     console.log("✅ تم التحديث الشامل للفئة:", {
//       categoryId,
//       name: updateData.name || category.name,
//     });
//   } catch (error) {
//     console.error("❌ خطأ في التحديث الشامل للفئة:", error);
//     throw error;
//   }
// }

// export async function createCategoryWithValidation(
//   categoryData: CreateCategoryData,
// ): Promise<string> {
//   try {
//     const existingCategories = await categoryService.getByStore(
//       categoryData.storeId,
//       { includeInactive: true },
//     );

//     const duplicate = existingCategories.find(
//       (cat) => cat.name.toLowerCase() === categoryData.name.toLowerCase(),
//     );

//     if (duplicate) {
//       throw new Error("هذا الاسم مستخدم بالفعل");
//     }

//     const categoryId = await categoryService.create({
//       ...categoryData,
//       isActive: categoryData.isActive ?? true,
//       order: categoryData.order || 0,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     } as Omit<Category, "id">);

//     console.log("✅ تم إنشاء فئة جديدة:", {
//       categoryId,
//       name: categoryData.name,
//       storeId: categoryData.storeId,
//     });

//     return categoryId;
//   } catch (error) {
//     console.error("❌ خطأ في إنشاء الفئة:", error);
//     throw error;
//   }
// }

// export async function importCategoriesWithValidation(
//   storeId: string,
//   importData: ImportCategoriesData,
// ): Promise<string[]> {
//   try {
//     const existingCategories = await categoryService.getByStore(storeId, {
//       includeInactive: true,
//     });

//     const existingNames = new Set(
//       existingCategories.map((cat) => cat.name.toLowerCase()),
//     );

//     const uniqueCategories = importData.categories.filter(
//       (cat) => !existingNames.has(cat.name.toLowerCase()),
//     );

//     if (uniqueCategories.length === 0) {
//       throw new Error("جميع الفئات موجودة بالفعل");
//     }

//     const importedIds = await categoryService.importFromTemplate(
//       storeId,
//       uniqueCategories,
//     );

//     console.log("✅ تم استيراد الفئات:", {
//       storeId,
//       imported: importedIds.length,
//       skipped: importData.categories.length - uniqueCategories.length,
//     });

//     return importedIds;
//   } catch (error) {
//     console.error("❌ خطأ في استيراد الفئات:", error);
//     throw error;
//   }
// }

// export async function exportCategoriesFormatted(
//   storeId: string,
//   format: "json" | "csv" | "excel" = "json",
// ): Promise<any> {
//   try {
//     const categories = await categoryService.exportCategories(storeId);

//     switch (format) {
//       case "json":
//         return {
//           storeId,
//           categories,
//           exportDate: new Date(),
//           totalCategories: categories.length,
//           totalProducts: categories.reduce(
//             (sum, cat) => sum + cat.productCount,
//             0,
//           ),
//         };

//       case "csv":
//         const headers = [
//           "ID",
//           "الاسم",
//           "الوصف",
//           "الترتيب",
//           "الحالة",
//           "عدد المنتجات",
//           "تاريخ الإنشاء",
//         ];
//         const rows = categories.map((cat) => [
//           cat.id,
//           cat.name,
//           cat.description,
//           cat.order,
//           cat.isActive ? "نشطة" : "معطلة",
//           cat.productCount,
//           cat.createdAt.toISOString(),
//         ]);

//         return {
//           headers,
//           rows,
//           total: categories.length,
//         };

//       case "excel":
//         return {
//           storeId,
//           categories,
//           message: "تنسيق Excel متاح مع إضافة مكتبة مناسبة",
//         };

//       default:
//         return categories;
//     }
//   } catch (error) {
//     console.error("❌ خطأ في تصدير الفئات:", error);
//     throw error;
//   }
// }

// export async function mergeCategoriesWithValidation(
//   mergeData: MergeCategoriesData,
// ): Promise<void> {
//   try {
//     const sourceCategory = await categoryService.getById(
//       mergeData.sourceCategoryId,
//     );
//     const targetCategory = await categoryService.getById(
//       mergeData.targetCategoryId,
//     );

//     if (!sourceCategory || !targetCategory) {
//       throw new Error("إحدى الفئات غير موجودة");
//     }

//     if (sourceCategory.storeId !== targetCategory.storeId) {
//       throw new Error("الفئات تابعة لمتاجر مختلفة");
//     }

//     await categoryService.mergeCategories(
//       mergeData.sourceCategoryId,
//       mergeData.targetCategoryId,
//     );

//     console.log("✅ تم دمج الفئات:", {
//       source: sourceCategory.name,
//       target: targetCategory.name,
//       storeId: sourceCategory.storeId,
//     });
//   } catch (error) {
//     console.error("❌ خطأ في دمج الفئات:", error);
//     throw error;
//   }
// }

// export async function copyCategoriesToSubBusiness(
//   storeId: string,
//   sourceSubBusinessType: string,
//   targetSubBusinessType: string,
// ): Promise<string[]> {
//   try {
//     const sourceCategories = await categoryService.getByStore(storeId, {
//       includeInactive: true,
//     });

//     if (sourceCategories.length === 0) {
//       throw new Error("لا توجد فئات في النشاط الفرعي المصدر");
//     }

//     const createdIds: string[] = [];

//     for (const sourceCat of sourceCategories) {
//       const categoryId = await categoryService.create({
//         storeId,
//         name: sourceCat.name,
//         description: sourceCat.description,
//         image: sourceCat.image,
//         order: sourceCat.order,
//         parentId: sourceCat.parentId,
//         isActive: sourceCat.isActive,
//       });

//       createdIds.push(categoryId);
//     }

//     console.log("✅ تم نسخ الفئات:", {
//       storeId,
//       from: sourceSubBusinessType,
//       to: targetSubBusinessType,
//       count: createdIds.length,
//     });

//     return createdIds;
//   } catch (error) {
//     console.error("❌ خطأ في نسخ الفئات:", error);
//     throw error;
//   }
// }

// export async function getCategoriesForSubBusinessType(
//   storeId: string,
//   subBusinessType: string,
// ): Promise<Array<{ id: string; name: string; description?: string }>> {
//   try {
//     const subBusinessCat =
//       await subBusinessCategoryService.getBySubBusinessType(
//         storeId,
//         subBusinessType,
//       );

//     if (subBusinessCat && subBusinessCat.categories.length > 0) {
//       return subBusinessCat.categories.map((cat) => ({
//         id: cat.id,
//         name: cat.name,
//         description: cat.description,
//       }));
//     }

//     const regularCategories = await categoryService.getByStore(storeId, {
//       includeInactive: true,
//     });

//     if (regularCategories.length > 0) {
//       return regularCategories.map((cat) => ({
//         id: cat.id,
//         name: cat.name,
//         description: cat.description,
//       }));
//     }

//     const defaultCategories: Record<
//       string,
//       Array<{ name: string; description?: string }>
//     > = {
//       restaurant: [
//         { name: "أطباق رئيسية", description: "الأطباق الرئيسية في المطعم" },
//         { name: "مقبلات", description: "مقبلات ووجبات خفيفة" },
//         { name: "حلويات", description: "حلويات ومشروبات حلوة" },
//         { name: "مشروبات", description: "مشروبات ساخنة وباردة" },
//       ],
//       cafe: [
//         { name: "مشروبات ساخنة", description: "قهوة، شاي، مشروبات ساخنة" },
//         { name: "مشروبات باردة", description: "عصائر، مشروبات مثلجة" },
//         { name: "حلويات", description: "حلويات وكيكات" },
//         { name: "وجبات خفيفة", description: "سناك ومقبلات" },
//       ],
//       grocery: [
//         { name: "معلبات", description: "أغذية معلبة" },
//         { name: "مشروبات", description: "مشروبات متنوعة" },
//         { name: "سناكات", description: "وجبات خفيفة" },
//         { name: "بهارات", description: "بهارات وتوابل" },
//       ],
//     };

//     const categories = defaultCategories[subBusinessType] || [
//       { name: "عام", description: "فئة عامة" },
//       { name: "مميز", description: "منتجات مميزة" },
//       { name: "جديد", description: "منتجات جديدة" },
//       { name: "غير مصنف", description: "بدون تصنيف" },
//     ];

//     return categories.map((cat, index) => ({
//       id: `default_${subBusinessType}_${index}`,
//       ...cat,
//     }));
//   } catch (error) {
//     console.error("❌ خطأ في جلب الفئات للنشاط الفرعي:", error);
//     return [
//       { id: "default_1", name: "عام", description: "فئة عامة" },
//       { id: "default_2", name: "مميز", description: "منتجات مميزة" },
//     ];
//   }
// }

// export async function saveCustomCategoriesForSubBusinessType(
//   storeId: string,
//   subBusinessType: string,
//   categories: Array<{ name: string; description?: string }>,
// ): Promise<string> {
//   return subBusinessCategoryService.createOrUpdate(
//     storeId,
//     subBusinessType,
//     categories,
//   );
// }

// export async function initializeStoreCategories(
//   storeId: string,
//   subBusinessTypes: string[],
// ): Promise<void> {
//   try {
//     console.log("🔄 تهيئة الفئات للنشاطات الفرعية:", subBusinessTypes);

//     for (const subType of subBusinessTypes) {
//       const defaultCategories = await getCategoriesForSubBusinessType(
//         storeId,
//         subType,
//       );

//       if (defaultCategories.length > 0) {
//         await saveCustomCategoriesForSubBusinessType(
//           storeId,
//           subType,
//           defaultCategories.map((cat) => ({
//             name: cat.name,
//             description: cat.description,
//           })),
//         );

//         for (const cat of defaultCategories) {
//           await categoryService.create({
//             storeId,
//             name: cat.name,
//             description: cat.description || "",
//             order: defaultCategories.indexOf(cat),
//             isActive: true,
//           });
//         }
//       }
//     }

//     console.log("✅ تم تهيئة الفئات للنشاطات الفرعية");
//   } catch (error) {
//     console.error("❌ خطأ في تهيئة الفئات:", error);
//   }
// }

// // ============ دوال جديدة: النصائح العملية ============

// export const optimizationTipsService = {
//   // 1. للمتاجر الجديدة
//   newStoreTips: {
//     async setPreciseActivities(
//       storeId: string,
//       activities: {
//         mainActivity: string;
//         subActivities: string[];
//       },
//     ): Promise<void> {
//       await storeService.updateBusinessActivities(storeId, {
//         ...activities,
//         registrationNumber: "",
//         issueDate: new Date(),
//         expiryDate: undefined,
//         taxNumber: "",
//       });
//       console.log("✅ تم تحديد الأنشطة التجارية بدقة");
//     },

//     async enableAutoDetection(storeId: string): Promise<void> {
//       await storeService.updateComplianceSettings(storeId, {
//         autoDetection: true,
//         strictMode: false,
//         notifyOnViolation: true,
//       });
//       console.log("✅ تم تفعيل الاكتشاف التلقائي");
//     },

//     async useNonStrictMode(storeId: string): Promise<void> {
//       await storeService.updateComplianceSettings(storeId, {
//         strictMode: false,
//         reviewThreshold: 60,
//       });
//       console.log("✅ تم استخدام وضع غير صارم");
//     },

//     async manualReviewNonCompliant(storeId: string): Promise<{
//       total: number;
//       reviewed: number;
//       pending: number;
//     }> {
//       const products = await productService.getByStore(storeId, "all", {
//         complianceStatus: ComplianceStatus.NON_COMPLIANT,
//       });

//       const reviewResults = {
//         total: products.length,
//         reviewed: 0,
//         pending: 0,
//       };

//       console.log(`📋 تحتاج مراجعة ${products.length} منتج`);
//       return reviewResults;
//     },
//   },

//   // 2. لإدارة المخزون
//   inventoryTips: {
//     async enableInventoryTracking(storeId: string): Promise<void> {
//       const products = await productService.getByStore(storeId, "all");
//       const batch = writeBatch(db);

//       products.forEach((product, index) => {
//         if (index < 500) {
//           // تحديث 500 منتج في كل مرة
//           const productRef = doc(db, "products", product.id);
//           batch.update(productRef, {
//             "inventory.trackInventory": true,
//             updatedAt: Timestamp.now(),
//           });
//         }
//       });

//       await batch.commit();
//       console.log("✅ تم تفعيل تتبع المخزون للمنتجات");
//     },

//     async setLowStockThreshold(
//       storeId: string,
//       threshold: number = 10,
//     ): Promise<void> {
//       const products = await productService.getByStore(storeId, "all");
//       const batch = writeBatch(db);

//       products.forEach((product, index) => {
//         if (index < 500) {
//           const productRef = doc(db, "products", product.id);
//           batch.update(productRef, {
//             "inventory.lowStockThreshold": threshold,
//             updatedAt: Timestamp.now(),
//           });
//         }
//       });

//       await batch.commit();
//       console.log(`✅ تم تعيين حد المخزون المنخفض إلى ${threshold}`);
//     },

//     async generateUniqueSKUs(storeId: string): Promise<void> {
//       const products = await productService.getByStore(storeId, "all");
//       const batch = writeBatch(db);

//       products.forEach((product, index) => {
//         if (index < 500 && (!product.sku || product.sku.startsWith("SKU-"))) {
//           const productRef = doc(db, "products", product.id);
//           const uniqueSKU = this.generateSKU(product);
//           batch.update(productRef, {
//             sku: uniqueSKU,
//             "inventory.sku": uniqueSKU,
//             updatedAt: Timestamp.now(),
//           });
//         }
//       });

//       await batch.commit();
//       console.log("✅ تم إنشاء SKU فريد لكل منتج");
//     },

//     generateSKU(product: Product): string {
//       const prefix = product.category?.substring(0, 3).toUpperCase() || "PRO";
//       const timestamp = Date.now().toString().slice(-6);
//       const random = Math.random().toString(36).substr(2, 4).toUpperCase();
//       return `${prefix}-${timestamp}-${random}`;
//     },

//     async setupAutoInventoryUpdate(storeId: string): Promise<void> {
//       // هنا يمكن إعداد Cloud Function للتحديث التلقائي
//       console.log("🔄 إعداد التحديث التلقائي للمخزون مع المبيعات");
//       console.log("⚠️ يتطلب Cloud Function للتحديث التلقائي");
//     },
//   },

//   // 3. للتخفيضات والعروض
//   discountTips: {
//     async createTimedDiscount(
//       productId: string,
//       discountType: "percentage" | "fixed",
//       value: number,
//       durationHours: number,
//     ): Promise<void> {
//       const now = new Date();
//       const endDate = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

//       await productService.updateDiscount(productId, {
//         type: discountType,
//         value,
//         startDate: now,
//         endDate,
//         isActive: true,
//       });

//       console.log(`✅ تم إنشاء تخفيض لمدة ${durationHours} ساعة`);
//     },

//     async monitorDiscountEffectiveness(
//       productId: string,
//       discountId?: string,
//     ): Promise<DiscountAnalytics> {
//       const product = await productService.getById(productId);
//       if (!product) {
//         throw new Error("المنتج غير موجود");
//       }

//       // محاكاة بيانات التحليل
//       const analytics: DiscountAnalytics = {
//         productId,
//         discountDetails: {
//           type:
//             product.discount?.type === "none"
//               ? "percentage"
//               : product.discount?.type || "percentage",
//           value: product.discount?.value || 0,
//           period: {
//             start: product.discount?.startDate,
//             end: product.discount?.endDate,
//           },
//         },
//         performance: {
//           salesDuringDiscount: Math.floor(Math.random() * 100) + 50,
//           salesBeforeDiscount: Math.floor(Math.random() * 50) + 20,
//           revenueIncrease: 1.3 + Math.random() * 0.7, // 30-100% زيادة
//           conversionRate: 0.05 + Math.random() * 0.1, // 5-15% تحويل
//           customerAcquisition: Math.floor(Math.random() * 20) + 5,
//         },
//         costBenefit: {
//           discountCost: 1000 * Math.random(),
//           additionalRevenue: 2000 * Math.random(),
//           netProfit: 1000 * Math.random(),
//           roi: 1.5 + Math.random() * 2, // 150-350% عائد
//         },
//         recommendations: {
//           extend: Math.random() > 0.5,
//           adjust: Math.random() > 0.3,
//           stop: Math.random() < 0.2,
//           repeat: Math.random() > 0.6,
//         },
//       };

//       return analytics;
//     },

//     async renewExpiredDiscounts(
//       storeId: string,
//       successfulOnly: boolean = true,
//     ): Promise<number> {
//       const products = await productService.getByStore(storeId, "all");
//       let renewedCount = 0;

//       for (const product of products) {
//         if (product.discount?.isActive === false) {
//           // يمكن إضافة منطق لتجديد العروض الناجحة فقط
//           if (successfulOnly) {
//             const analytics = await this.monitorDiscountEffectiveness(
//               product.id,
//             );
//             if (analytics.recommendations.extend) {
//               await this.createTimedDiscount(
//                 product.id,
//                 product.discount.type === "none"
//                   ? "percentage"
//                   : product.discount.type,
//                 product.discount.value * 0.9, // خفض القيمة بنسبة 10%
//                 24 * 7, // أسبوع
//               );
//               renewedCount++;
//             }
//           } else {
//             await this.createTimedDiscount(
//               product.id,
//               product.discount.type === "none"
//                 ? "percentage"
//                 : product.discount.type,
//               product.discount.value,
//               24 * 3, // 3 أيام
//             );
//             renewedCount++;
//           }
//         }
//       }

//       console.log(`✅ تم تجديد ${renewedCount} عرض منتهي`);
//       return renewedCount;
//     },

//     async applyRelativeDiscountForExpensiveProducts(
//       storeId: string,
//       priceThreshold: number = 1000,
//       maxDiscount: number = 30,
//     ): Promise<number> {
//       const products = await productService.getByStore(storeId, "all");
//       let appliedCount = 0;

//       for (const product of products) {
//         if (product.price >= priceThreshold && !product.discount?.isActive) {
//           // حساب الخصم النسبي (كلما ارتفع السعر، انخفضت نسبة الخصم)
//           const discountPercentage = Math.min(
//             maxDiscount,
//             (priceThreshold / product.price) * maxDiscount,
//           );

//           await productService.updateDiscount(product.id, {
//             type: "percentage",
//             value: discountPercentage,
//             isActive: true,
//           });

//           appliedCount++;
//         }
//       }

//       console.log(`✅ تم تطبيق خصم نسبي على ${appliedCount} منتج باهظ الثمن`);
//       return appliedCount;
//     },
//   },

//   // 4. لوحة التحكم الشاملة
//   async getOptimizationDashboard(storeId: string): Promise<{
//     newStoreStatus: {
//       activitiesSet: boolean;
//       autoDetectionEnabled: boolean;
//       strictMode: boolean;
//       reviewThreshold: number;
//     };
//     inventoryStatus: {
//       trackingEnabled: boolean;
//       lowThresholdSet: boolean;
//       uniqueSKUs: boolean;
//       autoUpdate: boolean;
//     };
//     discountsStatus: {
//       timedDiscounts: number;
//       effectivenessMonitored: boolean;
//       expiredRenewed: number;
//       relativeDiscountsApplied: number;
//     };
//     recommendations: Array<{
//       category: string;
//       title: string;
//       description: string;
//       priority: "high" | "medium" | "low";
//       action: string;
//     }>;
//   }> {
//     const store = await storeService.getById(storeId);
//     if (!store) {
//       throw new Error("المتجر غير موجود");
//     }

//     const products = await productService.getByStore(storeId, "all");

//     // حساب إحصائيات المتجر الجديد
//     const newStoreStatus = {
//       activitiesSet: !!store.businessActivities?.subActivities?.length,
//       autoDetectionEnabled: store.complianceSettings?.autoDetection || false,
//       strictMode: store.complianceSettings?.strictMode || false,
//       reviewThreshold: store.complianceSettings?.reviewThreshold || 90,
//     };

//     // حساب إحصائيات المخزون
//     const inventoryStats = products.reduce(
//       (stats, product) => ({
//         trackingEnabled:
//           stats.trackingEnabled && product.inventory.trackInventory,
//         lowThresholdSet:
//           stats.lowThresholdSet &&
//           (product.inventory.lowStockThreshold || 0) > 0,
//         uniqueSKUs:
//           stats.uniqueSKUs && product.sku && !product.sku.startsWith("SKU-"),
//         productsCount: stats.productsCount + 1,
//       }),
//       {
//         trackingEnabled: true,
//         lowThresholdSet: true,
//         uniqueSKUs: true,
//         productsCount: 0,
//       },
//     );

//     // حساب إحصائيات التخفيضات
//     const discountProducts = products.filter(
//       (p) => p.discount?.isActive === true,
//     );
//     const expiredDiscounts = products.filter(
//       (p) => p.discount?.isActive === false,
//     );

//     // توليد التوصيات
//     const recommendations: Array<{
//       category: string;
//       title: string;
//       description: string;
//       priority: "high" | "medium" | "low";
//       action: string;
//     }> = [];

//     if (!newStoreStatus.activitiesSet) {
//       recommendations.push({
//         category: "new_store",
//         title: "تحديد الأنشطة التجارية",
//         description: "يجب تحديد الأنشطة التجارية بدقة لضبط نظام الامتثال",
//         priority: "high",
//         action: "set_activities",
//       });
//     }

//     if (!newStoreStatus.autoDetectionEnabled) {
//       recommendations.push({
//         category: "new_store",
//         title: "تفعيل الاكتشاف التلقائي",
//         description: "تفعيل الاكتشاف التلقائي لتسريع إضافة المنتجات",
//         priority: "high",
//         action: "enable_auto_detection",
//       });
//     }

//     if (newStoreStatus.strictMode && newStoreStatus.reviewThreshold > 80) {
//       recommendations.push({
//         category: "new_store",
//         title: "استخدام وضع غير صارم",
//         description: "خفض حد المراجعة واستخدام وضع غير صارم في البداية",
//         priority: "medium",
//         action: "reduce_strictness",
//       });
//     }

//     if (!inventoryStats.trackingEnabled && inventoryStats.productsCount > 0) {
//       recommendations.push({
//         category: "inventory",
//         title: "تفعيل تتبع المخزون",
//         description: "تفعيل تتبع المخزون للتحديث التلقائي والتحذيرات",
//         priority: "high",
//         action: "enable_tracking",
//       });
//     }

//     if (!inventoryStats.lowThresholdSet && inventoryStats.productsCount > 0) {
//       recommendations.push({
//         category: "inventory",
//         title: "تعيين حد المخزون المنخفض",
//         description: "تعيين حد المخزون المنخفض لمنع نفاذ المخزون",
//         priority: "medium",
//         action: "set_low_threshold",
//       });
//     }

//     if (!inventoryStats.uniqueSKUs && inventoryStats.productsCount > 0) {
//       recommendations.push({
//         category: "inventory",
//         title: "إنشاء SKU فريد",
//         description: "إنشاء SKU فريد لكل منتج للتتبع الدقيق",
//         priority: "medium",
//         action: "generate_skus",
//       });
//     }

//     if (discountProducts.length === 0 && products.length > 10) {
//       recommendations.push({
//         category: "discounts",
//         title: "إنشاء عروض محدودة الزمن",
//         description: "إنشاء عروض بفترات زمنية محددة لزيادة المبيعات",
//         priority: "medium",
//         action: "create_timed_discounts",
//       });
//     }

//     if (expiredDiscounts.length > 5) {
//       recommendations.push({
//         category: "discounts",
//         title: "تجديد العروض المنتهية",
//         description: `تجديد ${expiredDiscounts.length} عرض منتهي`,
//         priority: "low",
//         action: "renew_expired_discounts",
//       });
//     }

//     // المنتجات باهظة الثمن بدون خصم
//     const expensiveProducts = products.filter(
//       (p) => p.price > 1000 && !p.discount?.isActive,
//     );
//     if (expensiveProducts.length > 0) {
//       recommendations.push({
//         category: "discounts",
//         title: "تطبيق خصومات نسبية",
//         description: `تطبيق خصومات نسبية على ${expensiveProducts.length} منتج باهظ`,
//         priority: "low",
//         action: "apply_relative_discounts",
//       });
//     }

//     return {
//       newStoreStatus,
//       inventoryStatus: {
//         trackingEnabled: inventoryStats.trackingEnabled,
//         lowThresholdSet: inventoryStats.lowThresholdSet,
//         uniqueSKUs: inventoryStats.uniqueSKUs,
//         autoUpdate: false, // يتطلب Cloud Functions
//       },
//       discountsStatus: {
//         timedDiscounts: discountProducts.length,
//         effectivenessMonitored: false, // يتطلب تحليلات
//         expiredRenewed: 0,
//         relativeDiscountsApplied: 0,
//       },
//       recommendations,
//     };
//   },

//   // 5. تنفيذ التوصيات تلقائيًا
//   async executeOptimization(
//     storeId: string,
//     recommendations: Array<{ action: string; priority: string }>,
//   ): Promise<{
//     executed: number;
//     failed: number;
//     results: Array<{ action: string; success: boolean; message: string }>;
//   }> {
//     const results: Array<{
//       action: string;
//       success: boolean;
//       message: string;
//     }> = [];

//     let executed = 0;
//     let failed = 0;

//     for (const rec of recommendations) {
//       try {
//         let result;
//         switch (rec.action) {
//           case "set_activities":
//             result = await this.newStoreTips.setPreciseActivities(storeId, {
//               mainActivity: "general",
//               subActivities: ["general_trade"],
//             });
//             break;

//           case "enable_auto_detection":
//             result = await this.newStoreTips.enableAutoDetection(storeId);
//             break;

//           case "reduce_strictness":
//             result = await this.newStoreTips.useNonStrictMode(storeId);
//             break;

//           case "enable_tracking":
//             result = await this.inventoryTips.enableInventoryTracking(storeId);
//             break;

//           case "set_low_threshold":
//             result = await this.inventoryTips.setLowStockThreshold(storeId, 10);
//             break;

//           case "generate_skus":
//             result = await this.inventoryTips.generateUniqueSKUs(storeId);
//             break;

//           case "create_timed_discounts":
//             // تنفيذ على عينة من المنتجات
//             const products = await productService.getByStore(storeId, "active");
//             const sampleProducts = products.slice(0, 3);
//             for (const product of sampleProducts) {
//               await this.discountTips.createTimedDiscount(
//                 product.id,
//                 "percentage",
//                 15,
//                 48, // 48 ساعة
//               );
//             }
//             result = `تم إنشاء عروض لـ ${sampleProducts.length} منتج`;
//             break;

//           case "renew_expired_discounts":
//             result = await this.discountTips.renewExpiredDiscounts(storeId);
//             break;

//           case "apply_relative_discounts":
//             result =
//               await this.discountTips.applyRelativeDiscountForExpensiveProducts(
//                 storeId,
//               );
//             break;

//           default:
//             result = "إجراء غير معروف";
//         }

//         results.push({
//           action: rec.action,
//           success: true,
//           message: `✅ تم تنفيذ ${rec.action} بنجاح: ${result}`,
//         });
//         executed++;
//       } catch (error: any) {
//         results.push({
//           action: rec.action,
//           success: false,
//           message: `❌ فشل في تنفيذ ${rec.action}: ${error.message}`,
//         });
//         failed++;
//       }
//     }

//     return {
//       executed,
//       failed,
//       results,
//     };
//   },
// };

// // ============ تصدير النصائح العملية ============

// export const {
//   newStoreTips,
//   inventoryTips,
//   discountTips,
//   getOptimizationDashboard,
//   executeOptimization,
// } = optimizationTipsService;

// // ============ دوال التصدير المحدثة ============

// export const createStore = storeService.create;
// export const getStoreById = storeService.getById;
// export const getStoreBySubdomain = storeService.getBySubdomain;
// export const updateStore = storeService.update;
// export const deleteStore = storeService.delete;

// export const createProduct = productService.create;
// export const getProductById = productService.getById;
// export const getProductsByStoreId = productService.getByStore;
// export const updateProduct = productService.update;
// export const deleteProduct = productService.delete;

// export const createCategory = categoryService.create;
// export const getCategoryById = categoryService.getById;
// export const getStoreCategoriesByStoreId = categoryService.getByStore;
// // ⭐ هذا هو التصحيح المهم:
// export const updateCategory = categoryService.update.bind(categoryService);
// export const deleteCategory = categoryService.delete.bind(categoryService);
// export const deleteCategorySafely =
//   categoryService.deleteSafely.bind(categoryService);
// export const toggleCategoryStatus =
//   categoryService.toggleCategoryStatus.bind(categoryService);
// export const updateCategoriesOrder =
//   categoryService.updateCategoriesOrder.bind(categoryService);
// export const getAllCategoriesWithDetails =
//   categoryService.getAllCategoriesWithDetails;
// export const createSubCategory = categoryService.createSubCategory;
// export const mergeCategories = categoryService.mergeCategories;
// export const importCategories = categoryService.importFromTemplate;
// export const exportCategories = categoryService.exportCategories;

// export const detectProductType = complianceSystem.detectProductType;
// export const checkStoreCompliance = complianceService.checkStoreCompliance;
// export const reviewProduct = complianceService.reviewProduct;
// export const getComplianceFlags = complianceService.getComplianceFlags;
// export const updateFlagStatus = complianceService.updateFlagStatus;
// export const runScheduledComplianceChecks =
//   complianceService.runScheduledComplianceChecks;

// export const updateStoreComplianceSettings =
//   storeService.updateComplianceSettings;
// export const updateStoreBusinessActivities =
//   storeService.updateBusinessActivities;

// // تصدير الدوال المساعدة
// export const getSubBusinessCategories =
//   subBusinessCategoryService.getBySubBusinessType;
// export const addCategoryToSubBusiness =
//   subBusinessCategoryService.addCategoryToSubBusiness;
// export const updateCategoryInSubBusiness =
//   subBusinessCategoryService.updateCategoryInSubBusiness;
// export const deleteCategoryFromSubBusiness =
//   subBusinessCategoryService.deleteCategoryFromSubBusiness;

// export const updateOrderShippingAddressWithGovernorate = orderService.update;
// export const updateCustomerShippingAddress = customerService.update;

// // ============ تصدير دوال النظام الأساسي ============

// // export {
// //   ComplianceDecision,
// //   ProductStatus,
// //   ComplianceStatus,
// //   DetectionMethod,
// // };

// export const buildProductSemantics = complianceSystem.buildProductSemantics;
// export const makeComplianceDecision = complianceSystem.makeComplianceDecision;
// export const sanitizeProductData = complianceSystem.sanitizeProductData;

// /**
//  * 🔧 إصلاح دفعي للمنتجات الزراعية غير المتوافقة
//  */
// export async function fixAgricultureComplianceIssues(storeId: string): Promise<{
//   success: boolean;
//   fixedProducts: number;
//   failedProducts: number;
//   details: Array<{
//     productId: string;
//     productName: string;
//     oldStatus: ComplianceStatus;
//     newStatus: ComplianceStatus;
//     fixed: boolean;
//     error?: string;
//   }>;
// }> {
//   try {
//     console.log(`🔧 بدء إصلاح المشاكل الزراعية للمتجر: ${storeId}`);

//     const results = {
//       success: true,
//       fixedProducts: 0,
//       failedProducts: 0,
//       details: [] as Array<{
//         productId: string;
//         productName: string;
//         oldStatus: ComplianceStatus;
//         newStatus: ComplianceStatus;
//         fixed: boolean;
//         error?: string;
//       }>,
//     };

//     // جلب المتجر
//     const store = await storeService.getById(storeId);
//     if (!store) {
//       throw new Error("المتجر غير موجود");
//     }

//     // جلب جميع المنتجات
//     const products = await productService.getByStore(storeId, "all");

//     // استخراج أنشطة المتجر
//     const storeActivities = (() => {
//       const activities: string[] = [];
//       if (store.businessActivities?.mainActivity)
//         activities.push(store.businessActivities.mainActivity);
//       if (store.businessActivities?.subActivities)
//         activities.push(...store.businessActivities.subActivities);
//       if (store.industry) activities.push(store.industry);
//       return activities.map((a) => a.toLowerCase());
//     })();

//     console.log(
//       `🔍 فحص ${products.length} منتج لأنشطة المتجر:`,
//       storeActivities,
//     );

//     // معالجة كل منتج
//     for (const product of products) {
//       try {
//         const productId = product.id;
//         const productName = product.name;
//         const oldStatus =
//           product._semantics?.complianceStatus ||
//           ComplianceStatus.PENDING_REVIEW;

//         // التحقق إذا كان المنتج زراعي
//         const isAgricultureProduct =
//           product._semantics?.detectedActivity === "agriculture" ||
//           product.name?.toLowerCase().includes("بذور") ||
//           product.name?.toLowerCase().includes("زراع") ||
//           product.name?.toLowerCase().includes("سماد") ||
//           (product.tags || []).some((tag) => tag.includes("زراعة"));

//         if (isAgricultureProduct) {
//           // التحقق من التوافق
//           const isCompatible = checkActivityCompatibility(
//             "agriculture",
//             storeActivities,
//           );

//           let newStatus = oldStatus;

//           if (isCompatible && oldStatus === ComplianceStatus.NON_COMPLIANT) {
//             // المنتج زراعي والمتجر زراعي - تصحيح الحالة
//             newStatus = ComplianceStatus.COMPLIANT;

//             // تحديث المنتج
//             await productService.update(productId, {
//               _semantics: {
//                 ...product._semantics,
//                 complianceStatus: newStatus,
//                 validationFlags: (
//                   product._semantics?.validationFlags || []
//                 ).filter((flag: string) => !flag.includes("غير مسجل للمتجر")),
//                 updatedAt: new Date(),
//               },
//             } as any);

//             results.fixedProducts++;

//             console.log(`✅ تم إصلاح: ${productName}`, {
//               oldStatus,
//               newStatus,
//               storeActivities,
//             });
//           }

//           results.details.push({
//             productId,
//             productName,
//             oldStatus,
//             newStatus,
//             fixed: isCompatible && oldStatus === ComplianceStatus.NON_COMPLIANT,
//           });
//         }
//       } catch (error: any) {
//         results.failedProducts++;
//         results.success = false;

//         results.details.push({
//           productId: product.id,
//           productName: product.name,
//           oldStatus:
//             product._semantics?.complianceStatus ||
//             ComplianceStatus.PENDING_REVIEW,
//           newStatus:
//             product._semantics?.complianceStatus ||
//             ComplianceStatus.PENDING_REVIEW,
//           fixed: false,
//           error: error.message,
//         });

//         console.error(`❌ خطأ في إصلاح المنتج ${product.id}:`, error);
//       }
//     }

//     console.log(`🎉 اكتمل الإصلاح الزراعي:`, {
//       storeId,
//       totalProducts: products.length,
//       fixed: results.fixedProducts,
//       failed: results.failedProducts,
//     });

//     return results;
//   } catch (error: any) {
//     console.error("❌ خطأ عام في إصلاح المشاكل الزراعية:", error);
//     return {
//       success: false,
//       fixedProducts: 0,
//       failedProducts: 0,
//       details: [],
//     };
//   }
// }
