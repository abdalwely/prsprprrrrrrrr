/**
 * خرائط التوافق بين الأنشطة التجارية
 * تحدد العلاقات بين الأنشطة الرئيسية والفرعية
 */
export const ACTIVITY_COMPATIBILITY_MAP: Record<string, string[]> = {
  // 🌱 الأنشطة الزراعية ومشتقاتها
  agriculture: [
    "agriculture",
    "agricultural",
    "agricultural-products",
    "seeds-fertilizers",
    "livestock",
    "fisheries",
    "agricultural-tools",
  ],

  // 🍔 الطعام والمشروبات
  food: [
    "food",
    "food-beverages",
    "restaurant",
    "cafe",
    "bakery",
    "grocery",
    "butcher",
    "spices",
    "food_processing",
    "food-delivery",
  ],

  // 👕 الأزياء والملابس
  fashion: [
    "fashion",
    "fashion-clothing",
    "mens-fashion",
    "womens-fashion",
    "kids-fashion",
    "yemeni-dress",
    "clothing",
    "apparel",
  ],

  // 📱 الإلكترونيات
  electronics: [
    "electronics",
    "mobiles",
    "laptops",
    "home-appliances",
    "tv",
    "gaming",
    "solar-energy",
    "tech",
    "gadgets",
  ],

  // 🏡 المنزل والحديقة
  "home-garden": [
    "home-garden",
    "furniture",
    "home-decor",
    "kitchen",
    "garden-tools",
    "lighting",
    "carpets",
    "home",
    "garden",
  ],

  // 💄 الصحة والجمال
  cosmetics: [
    "health-beauty",
    "cosmetics",
    "skincare",
    "perfumes",
    "hair-care",
    "makeup",
    "medical-supplies",
    "beauty",
    "health",
  ],

  // 📚 الكتب
  books: ["books", "stationery", "education", "publishing"],

  // ⚽ الرياضة
  sports: ["sports", "fitness", "outdoors", "recreation"],

  // 🧸 الألعاب
  toys: ["toys", "games", "children", "hobbies"],

  // 🚗 السيارات
  automotive: ["automotive", "cars", "vehicles", "auto-parts"],

  // 💍 المجوهرات
  jewelry: ["jewelry", "watches", "accessories", "luxury"],

  // 🐟 الثروة السمكية
  fisheries: ["fisheries", "fish", "seafood", "marine"],
};

/**
 * 🔍 دالة مساعدة للتحقق من التوافق
 * @param productActivity نشاط المنتج
 * @param storeActivities أنشطة المتجر
 * @returns true إذا كان هناك توافق
 */
export const checkActivityCompatibility = (
  productActivity: string,
  storeActivities: string[],
): boolean => {
  if (!productActivity || storeActivities.length === 0) return true;

  // البحث عن المجموعة التي ينتمي إليها نشاط المنتج
  for (const [mainActivity, compatibleActivities] of Object.entries(
    ACTIVITY_COMPATIBILITY_MAP,
  )) {
    if (compatibleActivities.includes(productActivity)) {
      // التحقق إذا كان المتجر لديه أي من الأنشطة المتوافقة
      const isCompatible = storeActivities.some((storeActivity) =>
        compatibleActivities.some(
          (compatibleActivity) =>
            storeActivity
              .toLowerCase()
              .includes(compatibleActivity.toLowerCase()) ||
            compatibleActivity
              .toLowerCase()
              .includes(storeActivity.toLowerCase()),
        ),
      );

      if (isCompatible) {
        console.log(`✅ نشاط متوافق: ${productActivity} → ${mainActivity}`);
        return true;
      }
    }
  }

  // البحث المباشر
  const directMatch = storeActivities.some(
    (storeActivity) =>
      storeActivity.toLowerCase().includes(productActivity.toLowerCase()) ||
      productActivity.toLowerCase().includes(storeActivity.toLowerCase()),
  );

  return directMatch;
};
