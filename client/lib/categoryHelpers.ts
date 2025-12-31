import { SubBusinessType, businessTypesWithSub } from "./businessTypes";

// واجهة الفئة المقترحة
export interface SuggestedCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  subCategories?: string[];
}

// الفئات المخصصة لكل نشاط فرعي
const subBusinessTypeCategories: Record<string, SuggestedCategory[]> = {
  // ============ طعام ومشروبات ============
  restaurant: [
    {
      id: "main-dishes",
      name: "أطباق رئيسية",
      description: "الأطباق الرئيسية في المطعم",
    },
    { id: "appetizers", name: "مقبلات", description: "مقبلات ووجبات خفيفة" },
    { id: "desserts", name: "حلويات", description: "حلويات ومشروبات حلوة" },
    { id: "drinks", name: "مشروبات", description: "مشروبات ساخنة وباردة" },
    { id: "salads", name: "سلطات", description: "سلطات متنوعة" },
    { id: "sandwiches", name: "سندويشات", description: "سندويشات وشطائر" },
  ],

  cafe: [
    {
      id: "hot-drinks",
      name: "مشروبات ساخنة",
      description: "قهوة، شاي، مشروبات ساخنة",
    },
    {
      id: "cold-drinks",
      name: "مشروبات باردة",
      description: "عصائر، مشروبات مثلجة",
    },
    { id: "desserts", name: "حلويات", description: "حلويات وكيكات" },
    { id: "snacks", name: "وجبات خفيفة", description: "سناك ومقبلات" },
    {
      id: "yemeni-coffee",
      name: "قهوة يمنية",
      description: "أنواع القهوة اليمنية",
    },
  ],

  bakery: [
    { id: "bread", name: "خبز", description: "أنواع الخبز المختلفة" },
    { id: "pastries", name: "معجنات", description: "معجنات وحلويات" },
    { id: "cakes", name: "كيكات", description: "كيكات وتورتات" },
    { id: "cookies", name: "بسكويت", description: "بسكويت وحلويات جافة" },
    {
      id: "traditional",
      name: "مخبوزات تقليدية",
      description: "مخبوزات يمنية تقليدية",
    },
  ],

  grocery: [
    { id: "canned-food", name: "معلبات", description: "أغذية معلبة" },
    { id: "drinks", name: "مشروبات", description: "مشروبات متنوعة" },
    { id: "snacks", name: "سناكات", description: "وجبات خفيفة" },
    { id: "spices", name: "بهارات", description: "بهارات وتوابل" },
    { id: "cleaning", name: "مواد تنظيف", description: "منظفات ومواد تنظيف" },
  ],

  butcher: [
    { id: "beef", name: "لحم بقر", description: "لحم بقر طازج" },
    { id: "chicken", name: "دجاج", description: "دجاج طازج" },
    { id: "lamb", name: "لحم ضأن", description: "لحم ضأن وماعز" },
    { id: "processed", name: "لحوم مصنعة", description: "نقانق ومرتديلا" },
    { id: "yemeni-meat", name: "لحوم يمنية", description: "لحوم يمنية خاصة" },
  ],

  spices: [
    {
      id: "yemeni-spices",
      name: "بهارات يمنية",
      description: "بهارات يمنية تقليدية",
    },
    {
      id: "general-spices",
      name: "بهارات عامة",
      description: "بهارات وتوابل متنوعة",
    },
    { id: "herbs", name: "أعشاب", description: "أعشاب طبية وطبيعية" },
    { id: "tea", name: "شاي", description: "أنواع الشاي المختلفة" },
    { id: "coffee-beans", name: "حبوب قهوة", description: "حبوب قهوة يمنية" },
  ],

  // ============ أزياء وملابس ============
  "mens-fashion": [
    { id: "shirts", name: "قمصان", description: "قمصان رجالية" },
    { id: "pants", name: "بناطيل", description: "بناطيل رجالية" },
    { id: "suits", name: "بدلات", description: "بدلات رسمية" },
    {
      id: "traditional",
      name: "ملابس تقليدية",
      description: "ملابس يمنية رجالية",
    },
    { id: "jackets", name: "جاكتات", description: "جاكتات ومعاطف" },
  ],

  "womens-fashion": [
    { id: "dresses", name: "فساتين", description: "فساتين نسائية" },
    { id: "abayas", name: "عبايات", description: "عبايات نسائية" },
    { id: "blouses", name: "بلوزات", description: "بلوزات وقمصان" },
    { id: "skirts", name: "تنانير", description: "تنانير نسائية" },
    {
      id: "yemeni-dress",
      name: "أزياء يمنية",
      description: "أزياء يمنية نسائية",
    },
  ],

  "kids-fashion": [
    { id: "boys-clothes", name: "ملابس أولاد", description: "ملابس للأولاد" },
    { id: "girls-clothes", name: "ملابس بنات", description: "ملابس للبنات" },
    { id: "babies", name: "ملابس أطفال", description: "ملابس للأطفال الرضع" },
    { id: "school-uniforms", name: "ملابس مدرسية", description: "زي مدرسي" },
  ],

  "yemeni-dress": [
    {
      id: "mens-traditional",
      name: "ملابس رجالية يمنية",
      description: "ملابس يمنية للرجال",
    },
    {
      id: "womens-traditional",
      name: "ملابس نسائية يمنية",
      description: "ملابس يمنية للنساء",
    },
    {
      id: "accessories",
      name: "إكسسوارات تقليدية",
      description: "إكسسوارات يمنية",
    },
    { id: "fabrics", name: "أقمشة يمنية", description: "أقمشة تقليدية" },
  ],

  shoes: [
    { id: "mens-shoes", name: "أحذية رجالية", description: "أحذية للرجال" },
    { id: "womens-shoes", name: "أحذية نسائية", description: "أحذية للنساء" },
    { id: "kids-shoes", name: "أحذية أطفال", description: "أحذية للأطفال" },
    { id: "sports-shoes", name: "أحذية رياضية", description: "أحذية رياضية" },
  ],

  accessories: [
    { id: "bags", name: "حقائب", description: "حقائب يد ومحافظ" },
    { id: "watches", name: "ساعات", description: "ساعات ومعاصم" },
    { id: "belts", name: "أحزمة", description: "أحزمة جلدية" },
    { id: "jewelry", name: "مجوهرات", description: "ذهب وفضة" },
  ],

  // ============ إلكترونيات وأجهزة ============
  mobiles: [
    { id: "smartphones", name: "هواتف ذكية", description: "هواتف ذكية حديثة" },
    { id: "tablets", name: "تابلت", description: "أجهزة لوحية" },
    {
      id: "accessories",
      name: "إكسسوارات",
      description: "شواحن، سماعات، أغلفة",
    },
    { id: "smart-watches", name: "ساعات ذكية", description: "ساعات ذكية" },
  ],

  laptops: [
    {
      id: "gaming-laptops",
      name: "لابتوبات ألعاب",
      description: "لابتوبات للألعاب",
    },
    {
      id: "business-laptops",
      name: "لابتوبات أعمال",
      description: "لابتوبات للعمل",
    },
    {
      id: "student-laptops",
      name: "لابتوبات طلاب",
      description: "لابتوبات للدراسة",
    },
    { id: "accessories", name: "إكسسوارات", description: "حقائب، شواحن، ماوس" },
  ],

  "home-appliances": [
    {
      id: "kitchen-appliances",
      name: "أجهزة مطبخ",
      description: "ثلاجات، غسالات أطباق",
    },
    { id: "laundry", name: "أجهزة غسيل", description: "غسالات، نشافات" },
    { id: "air-conditioners", name: "مكيفات", description: "مكيفات هواء" },
    { id: "water-heaters", name: "سخانات ماء", description: "سخانات كهربائية" },
  ],

  tv: [
    { id: "smart-tv", name: "تلفزيونات ذكية", description: "تلفزيونات ذكية" },
    { id: "led-tv", name: "تلفزيونات LED", description: "تلفزيونات LED" },
    {
      id: "accessories",
      name: "إكسسوارات",
      description: "حوامل، أسلاك، أجهزة",
    },
  ],

  gaming: [
    { id: "consoles", name: "أجهزة ألعاب", description: "بلايستيشن، إكس بوكس" },
    { id: "games", name: "ألعاب", description: "ألعاب فيديو" },
    { id: "accessories", name: "إكسسوارات", description: "أجهزة تحكم، سماعات" },
  ],

  "solar-energy": [
    {
      id: "solar-panels",
      name: "ألواح شمسية",
      description: "ألواح طاقة شمسية",
    },
    { id: "batteries", name: "بطاريات", description: "بطاريات تخزين" },
    { id: "inverters", name: "انفرترات", description: "محولات تيار" },
    { id: "accessories", name: "إكسسوارات", description: "كابلات، حوامل" },
  ],

  // ============ منزل وحديقة ============
  furniture: [
    { id: "living-room", name: "غرفة المعيشة", description: "أثاث صالة" },
    { id: "bedroom", name: "غرفة النوم", description: "أثاث غرفة نوم" },
    {
      id: "dining-room",
      name: "غرفة الطعام",
      description: "طاولات وكراسي طعام",
    },
    { id: "office", name: "مكتب", description: "أثاث مكتبي" },
  ],

  "home-decor": [
    { id: "wall-decor", name: "ديكور حوائط", description: "لوحات، ساعات حائط" },
    { id: "vases", name: "مزهريات", description: "مزهريات وزهور" },
    { id: "cushions", name: "وسائد", description: "وسائد ديكور" },
    { id: "candles", name: "شموع", description: "شموع معطرة" },
  ],

  kitchen: [
    { id: "cookware", name: "أواني طهي", description: "قدور، مقلاة" },
    { id: "cutlery", name: "أدوات مائدة", description: "سكاكين، شوك، ملاعق" },
    { id: "storage", name: "تخزين", description: "حاويات تخزين" },
    {
      id: "small-appliances",
      name: "أجهزة صغيرة",
      description: "خلاطات، محامص",
    },
  ],

  "garden-tools": [
    { id: "hand-tools", name: "أدوات يدوية", description: "مجرفة، مقصات" },
    { id: "watering", name: "ري", description: "خراطيم، رشاشات" },
    { id: "pots", name: "أصص", description: "أصص نباتات" },
    { id: "seeds", name: "بذور نباتات", description: "بذور زراعية" },
  ],

  lighting: [
    {
      id: "ceiling-lights",
      name: "إضاءة سقف",
      description: "ثريات، سبوت لايت",
    },
    {
      id: "wall-lights",
      name: "إضاءة حائط",
      description: "أباجورات، وحدات إضاءة",
    },
    { id: "floor-lamps", name: "أعمدة إضاءة", description: "أعمدة إنارة" },
    { id: "led-lights", name: "إضاءة LED", description: "شرائط LED" },
  ],

  carpets: [
    {
      id: "persian-carpets",
      name: "سجاد فارسي",
      description: "سجاد فارسي تقليدي",
    },
    { id: "modern-carpets", name: "سجاد حديث", description: "سجاد معاصر" },
    {
      id: "yemeni-carpets",
      name: "سجاد يمني",
      description: "سجاد يمني تقليدي",
    },
    { id: "prayer-mats", name: "سجاد صلاة", description: "سجاد للصلاة" },
  ],

  // ============ صحة وجمال ============
  cosmetics: [
    { id: "makeup", name: "مكياج", description: "مستحضرات تجميل" },
    { id: "skincare", name: "عناية بالبشرة", description: "كريمات، مقشرات" },
    {
      id: "nail-care",
      name: "عناية بالأظافر",
      description: "طلاء أظافر، أدوات",
    },
    { id: "brushes", name: "فرش مكياج", description: "فرش وأدوات تجميل" },
  ],

  skincare: [
    {
      id: "face-care",
      name: "عناية بالوجه",
      description: "منتجات العناية بالوجه",
    },
    { id: "body-care", name: "عناية بالجسم", description: "كريمات الجسم" },
    { id: "sun-care", name: "حماية من الشمس", description: "واقي شمس" },
    {
      id: "natural-products",
      name: "منتجات طبيعية",
      description: "منتجات عضوية",
    },
  ],

  perfumes: [
    { id: "mens-perfumes", name: "عطور رجالية", description: "عطور للرجال" },
    { id: "womens-perfumes", name: "عطور نسائية", description: "عطور للنساء" },
    { id: "oud", name: "عود", description: "عود وعطور يمنية" },
    { id: "bakhoor", name: "بخور", description: "بخور ومعطرات" },
  ],

  "hair-care": [
    { id: "shampoo", name: "شامبو", description: "شامبو وبلسم" },
    { id: "hair-oil", name: "زيوت شعر", description: "زيوت العناية بالشعر" },
    { id: "styling", name: "تصفيف", description: "جيل، موس، شمع" },
    {
      id: "natural-oils",
      name: "زيوت طبيعية",
      description: "زيت زيتون، أركان",
    },
  ],

  makeup: [
    { id: "foundation", name: "فونديشن", description: "أساسات وكونسيلر" },
    { id: "lipstick", name: "أحمر شفاه", description: "أحمر شفاه وجلوس" },
    { id: "eyes", name: "عيون", description: "أيشادو، ماسكارا" },
    { id: "kohl", name: "كحل", description: "كحل يمني تقليدي" },
  ],

  "medical-supplies": [
    { id: "first-aid", name: "إسعافات أولية", description: "ضمادات، لصقات" },
    { id: "medical-devices", name: "أجهزة طبية", description: "أجهزة قياس" },
    { id: "personal-care", name: "عناية شخصية", description: "قطن، كحول" },
    {
      id: "yemeni-herbs",
      name: "أعشاب يمنية",
      description: "أعشاب طبية يمنية",
    },
  ],

  // ============ زراعة ومواشي ============
  "agricultural-products": [
    { id: "fruits", name: "فواكه", description: "فواكه طازجة" },
    { id: "vegetables", name: "خضروات", description: "خضروات طازجة" },
    { id: "grains", name: "حبوب", description: "قمح، ذرة، أرز" },
    { id: "dates", name: "تمور", description: "تمور يمنية" },
  ],

  livestock: [
    { id: "cattle", name: "مواشي", description: "أبقار، أغنام، ماعز" },
    { id: "poultry", name: "دواجن", description: "دجاج، بط، رومي" },
    { id: "animal-feed", name: "أعلاف", description: "علف حيواني" },
    { id: "veterinary", name: "أدوية بيطرية", description: "أدوية وعلاجات" },
  ],

  "agricultural-tools": [
    { id: "hand-tools", name: "أدوات يدوية", description: "مناجل، فؤوس" },
    { id: "machinery", name: "آلات زراعية", description: "جرارات، معدات" },
    { id: "irrigation", name: "ري", description: "أنظمة ري" },
    { id: "storage", name: "تخزين", description: "صوامع، حاويات" },
  ],

  "seeds-fertilizers": [
    { id: "seeds", name: "بذور", description: "بذور زراعية" },
    { id: "fertilizers", name: "أسمدة", description: "أسمدة كيماوية وطبيعية" },
    { id: "pesticides", name: "مبيدات", description: "مبيدات حشرية" },
    { id: "organic", name: "عضوي", description: "منتجات زراعية عضوية" },
  ],
};

// الفئات الافتراضية العامة
const defaultCategories: SuggestedCategory[] = [
  { id: "general", name: "عام", description: "فئة عامة للمنتجات" },
  { id: "featured", name: "مميز", description: "منتجات مميزة" },
  { id: "new-arrivals", name: "وصل حديثاً", description: "منتجات جديدة" },
  { id: "best-sellers", name: "الأكثر مبيعاً", description: "منتجات رائجة" },
  { id: "uncategorized", name: "غير مصنف", description: "منتجات بدون تصنيف" },
];

// ============ الدوال المساعدة ============

/**
 * جلب الفئات المقترحة للنشاط الفرعي
 */
export function getSuggestedCategoriesForSubBusinessType(
  subBusinessType: string,
): SuggestedCategory[] {
  // الحصول على الفئات المخصصة للنشاط الفرعي
  const specificCategories = subBusinessTypeCategories[subBusinessType] || [];

  // إضافة الفئات العامة
  return [...defaultCategories, ...specificCategories];
}

/**
 * جلب الفئات بناءً على النشاط الأساسي والفرعي
 */
export function getCategoriesForBusinessType(
  primaryType: string,
  subBusinessType: string,
): SuggestedCategory[] {
  // إذا كان هناك نشاط فرعي محدد
  if (subBusinessType) {
    return getSuggestedCategoriesForSubBusinessType(subBusinessType);
  }

  // إذا لم يكن هناك نشاط فرعي، جلب فئات النشاط الأساسي
  const businessType = businessTypesWithSub.find(
    (type) => type.value === primaryType,
  );

  if (businessType) {
    // جمع جميع الفئات من جميع الأنشطة الفرعية لهذا النشاط الأساسي
    const allCategories: SuggestedCategory[] = [];
    businessType.subTypes.forEach((subType) => {
      const categories = subBusinessTypeCategories[subType.value] || [];
      allCategories.push(...categories);
    });

    // إزالة التكرارات
    const uniqueCategories = allCategories.filter(
      (cat, index, self) => index === self.findIndex((c) => c.id === cat.id),
    );

    return [...defaultCategories, ...uniqueCategories];
  }

  // إذا لم يتم العثور على نشاط، استخدام الفئات العامة
  return defaultCategories;
}

/**
 * جلب الفئات بناءً على قيمة النشاط الفرعي (القيمة المخزنة في المتجر)
 */
export function getCategoriesBySubBusinessValue(
  subBusinessValue: string,
): SuggestedCategory[] {
  return getSuggestedCategoriesForSubBusinessType(subBusinessValue);
}

/**
 * تهيئة الفئات للنشاطات الفرعية للمتجر
 */
export function initializeCategoriesForStore(
  storeId: string,
  subBusinessTypes: string[],
): Array<{ subBusinessType: string; categories: SuggestedCategory[] }> {
  return subBusinessTypes.map((subType) => ({
    subBusinessType: subType,
    categories: getSuggestedCategoriesForSubBusinessType(subType),
  }));
}

/**
 * الحصول على جميع الفئات المتاحة
 */
export function getAllCategories(): SuggestedCategory[] {
  const allCategories: SuggestedCategory[] = [...defaultCategories];

  // جمع الفئات من جميع الأنشطة الفرعية
  Object.values(subBusinessTypeCategories).forEach((categories) => {
    allCategories.push(...categories);
  });

  // إزالة التكرارات
  return allCategories.filter(
    (cat, index, self) => index === self.findIndex((c) => c.id === cat.id),
  );
}

/**
 * البحث عن فئات بناءً على اسم النشاط الفرعي
 */
export function findCategoriesBySubBusinessName(
  subBusinessName: string,
): SuggestedCategory[] {
  // البحث عن قيمة النشاط الفرعي بناءً على الاسم
  for (const [key, categories] of Object.entries(subBusinessTypeCategories)) {
    // يمكن إضافة منطق البحث باللغة العربية أو الإنجليزية هنا
    if (key.includes(subBusinessName.toLowerCase())) {
      return categories;
    }
  }

  return defaultCategories;
}

/**
 * إنشاء فئة مخصصة
 */
export function createCustomCategory(
  name: string,
  description?: string,
  parentId?: string,
): SuggestedCategory {
  return {
    id: `custom_${Date.now()}`,
    name,
    description: description || `فئة مخصصة: ${name}`,
    icon: "custom",
  };
}

/**
 * الحصول على الفئات المنظمة حسب النشاط الفرعي
 */
export function getCategorizedBySubBusinessType(): Record<
  string,
  SuggestedCategory[]
> {
  return subBusinessTypeCategories;
}

/**
 * التحقق إذا كان النشاط الفرعي له فئات مخصصة
 */
export function hasCustomCategories(subBusinessType: string): boolean {
  return (
    !!subBusinessTypeCategories[subBusinessType] &&
    subBusinessTypeCategories[subBusinessType].length > 0
  );
}
