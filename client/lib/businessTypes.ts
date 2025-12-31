// 📁 ملف: /lib/businessTypes.ts

// ⭐⭐ واجهة النشاط الأساسي
export interface PrimaryBusinessType {
  id: string;
  name: { ar: string; en: string };
}

// ⭐⭐ واجهة النشاط الفرعي
export interface SubBusinessType {
  value: string;
  label: { ar: string; en: string };
}

// ⭐⭐ واجهة النشاط الكامل مع الفرعي
export interface BusinessTypeWithSub {
  value: string;
  label: { ar: string; en: string };
  subTypes: SubBusinessType[];
}

// ⭐⭐ البيانات الكاملة للأنشطة مع الفرعية
export const businessTypesWithSub: BusinessTypeWithSub[] = [
  {
    value: "food-beverages",
    label: { ar: "طعام ومشروبات", en: "Food & Beverages" },
    subTypes: [
      { value: "restaurant", label: { ar: "مطعم", en: "Restaurant" } },
      { value: "cafe", label: { ar: "مقهى", en: "Cafe" } },
      { value: "bakery", label: { ar: "مخبز", en: "Bakery" } },
      { value: "grocery", label: { ar: "بقالة", en: "Grocery" } },
      { value: "butcher", label: { ar: "جزارة", en: "Butcher" } },
      { value: "spices", label: { ar: "بهارات وتوابل", en: "Spices" } },
    ],
  },
  {
    value: "fashion-clothing",
    label: { ar: "أزياء وملابس", en: "Fashion & Clothing" },
    subTypes: [
      {
        value: "mens-fashion",
        label: { ar: "ملابس رجالية", en: "Men's Fashion" },
      },
      {
        value: "womens-fashion",
        label: { ar: "ملابس نسائية", en: "Women's Fashion" },
      },
      {
        value: "kids-fashion",
        label: { ar: "ملابس أطفال", en: "Kids' Fashion" },
      },
      {
        value: "yemeni-dress",
        label: { ar: "أزياء يمنية", en: "Yemeni Dress" },
      },
      { value: "shoes", label: { ar: "أحذية", en: "Shoes" } },
      { value: "accessories", label: { ar: "إكسسوارات", en: "Accessories" } },
    ],
  },
  {
    value: "electronics",
    label: { ar: "إلكترونيات وأجهزة", en: "Electronics & Devices" },
    subTypes: [
      { value: "mobiles", label: { ar: "موبايلات", en: "Mobiles" } },
      { value: "laptops", label: { ar: "لابتوبات", en: "Laptops" } },
      {
        value: "home-appliances",
        label: { ar: "أجهزة منزلية", en: "Home Appliances" },
      },
      { value: "tv", label: { ar: "تلفزيونات", en: "TVs" } },
      { value: "gaming", label: { ar: "ألعاب إلكترونية", en: "Gaming" } },
      {
        value: "solar-energy",
        label: { ar: "طاقة شمسية", en: "Solar Energy" },
      },
    ],
  },
  {
    value: "home-garden",
    label: { ar: "منزل وحديقة", en: "Home & Garden" },
    subTypes: [
      { value: "furniture", label: { ar: "أثاث", en: "Furniture" } },
      { value: "home-decor", label: { ar: "ديكور منزلي", en: "Home Decor" } },
      { value: "kitchen", label: { ar: "أدوات مطبخ", en: "Kitchen Tools" } },
      {
        value: "garden-tools",
        label: { ar: "أدوات حديقة", en: "Garden Tools" },
      },
      { value: "lighting", label: { ar: "إضاءة", en: "Lighting" } },
      { value: "carpets", label: { ar: "سجاد", en: "Carpets" } },
    ],
  },
  {
    value: "health-beauty",
    label: { ar: "صحة وجمال", en: "Health & Beauty" },
    subTypes: [
      {
        value: "cosmetics",
        label: { ar: "مستحضرات تجميل", en: "Cosmetics" },
      },
      { value: "skincare", label: { ar: "العناية بالبشرة", en: "Skincare" } },
      { value: "perfumes", label: { ar: "عطور", en: "Perfumes" } },
      {
        value: "hair-care",
        label: { ar: "العناية بالشعر", en: "Hair Care" },
      },
      { value: "makeup", label: { ar: "مكياج", en: "Makeup" } },
      {
        value: "medical-supplies",
        label: { ar: "مستلزمات طبية", en: "Medical Supplies" },
      },
    ],
  },
  {
    value: "agriculture",
    label: { ar: "زراعة ومواشي", en: "Agriculture & Livestock" },
    subTypes: [
      {
        value: "agricultural-products",
        label: { ar: "منتجات زراعية", en: "Agricultural Products" },
      },
      {
        value: "livestock",
        label: { ar: "مواشي ودواجن", en: "Livestock & Poultry" },
      },
      {
        value: "agricultural-tools",
        label: { ar: "أدوات زراعية", en: "Agricultural Tools" },
      },
      {
        value: "seeds-fertilizers",
        label: { ar: "بذور وأسمدة", en: "Seeds & Fertilizers" },
      },
    ],
  },
];

// ⭐⭐ الأنشطة الأساسية فقط (لصفحة إنشاء الحساب)
export const primaryBusinessTypes: PrimaryBusinessType[] = [
  {
    id: "food-beverages",
    name: { ar: "طعام ومشروبات", en: "Food & Beverages" },
  },
  {
    id: "fashion-clothing",
    name: { ar: "أزياء وملابس", en: "Fashion & Clothing" },
  },
  {
    id: "electronics",
    name: { ar: "إلكترونيات وأجهزة", en: "Electronics & Devices" },
  },
  { id: "home-garden", name: { ar: "منزل وحديقة", en: "Home & Garden" } },
  { id: "health-beauty", name: { ar: "صحة وجمال", en: "Health & Beauty" } },
  {
    id: "agriculture",
    name: { ar: "زراعة ومواشي", en: "Agriculture & Livestock" },
  },
  { id: "other", name: { ar: "أخرى", en: "Other" } },
];

// ⭐⭐ دالة مساعدة: الحصول على الأنشطة الفرعية بناءً على النشاط الأساسي
export function getSubBusinessTypes(primaryType: string): SubBusinessType[] {
  const businessType = businessTypesWithSub.find(
    (type) => type.value === primaryType,
  );
  return businessType?.subTypes || [];
}

// ⭐⭐ دالة مساعدة: الحصول على اسم النشاط الأساسي
export function getPrimaryBusinessName(
  primaryType: string,
  lang: "ar" | "en" = "ar",
): string {
  const businessType = primaryBusinessTypes.find(
    (type) => type.id === primaryType,
  );
  return businessType?.name[lang] || primaryType;
}

// ⭐⭐ دالة مساعدة: الحصول على اسم النشاط الفرعي
export function getSubBusinessName(
  primaryType: string,
  subType: string,
  lang: "ar" | "en" = "ar",
): string {
  const businessType = businessTypesWithSub.find(
    (type) => type.value === primaryType,
  );
  const subBusiness = businessType?.subTypes.find(
    (sub) => sub.value === subType,
  );
  return subBusiness?.label[lang] || subType;
}

// ⭐⭐ دالة: التحقق إذا كان النشاط الأساسي موجوداً
export function isValidPrimaryBusinessType(type: string): boolean {
  return (
    businessTypesWithSub.some((business) => business.value === type) ||
    type === "other"
  );
}

// ⭐⭐ دالة: التحقق إذا كان النشاط الفرعي صحيح للنشاط الأساسي
export function isValidSubBusinessType(
  primaryType: string,
  subType: string,
): boolean {
  const businessType = businessTypesWithSub.find(
    (type) => type.value === primaryType,
  );
  if (!businessType) return false;
  return businessType.subTypes.some((sub) => sub.value === subType);
}

// ⭐⭐ دالة: الحصول على جميع الأنشطة الفرعية كمصفوفة مسطحة
export function getAllSubBusinessTypes(): Array<{
  primaryType: string;
  primaryName: { ar: string; en: string };
  subType: string;
  subName: { ar: string; en: string };
}> {
  const allSubTypes: Array<{
    primaryType: string;
    primaryName: { ar: string; en: string };
    subType: string;
    subName: { ar: string; en: string };
  }> = [];

  businessTypesWithSub.forEach((primary) => {
    primary.subTypes.forEach((sub) => {
      allSubTypes.push({
        primaryType: primary.value,
        primaryName: primary.label,
        subType: sub.value,
        subName: sub.label,
      });
    });
  });

  return allSubTypes;
}
