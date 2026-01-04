import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  ProductKind,
  ProductKindInfo,
  PRODUCT_KINDS,
  ProductType,
  DEFAULT_PRODUCT_TYPES,
  ProductTypeDetection,
} from "../constants";
import {
  ComplianceDecision,
  ProductStatus,
  ComplianceStatus,
  DetectionMethod,
  ProductSemantics,
  ComplianceCheckResult,
  ProductKindSelectionResult,
  FieldVisibility,
  KindBasedValidation,
  ComplianceFlag,
} from "../types";
import { Store } from "../types/store.types";
import { Product } from "../types/product.types";
import { productService } from "../services/product";
import { checkActivityCompatibility } from "../constants/activity-map";
import { ACTIVITY_COMPATIBILITY_MAP } from "../constants";
import { storeService } from "../services/store/store.service";
import { db } from "../firebase/firebase";

/**
 * نظام الامتثال الرئيسي
 * مسؤول عن التحقق من توافق المنتجات مع أنشطة المتجر
 * واتخاذ قرارات الامتثال التلقائية
 */
export const complianceSystem = {
  // 🔥 1. اختيار نوع المنتج الأساسي (الخطوة الأولى للتاجر)
  async handleProductKindSelection(
    kind: ProductKind,
    storeId: string,
  ): Promise<ProductKindSelectionResult> {
    try {
      const kindInfo = PRODUCT_KINDS[kind];
      const store = await storeService.getById(storeId);

      if (!store) {
        return {
          kind,
          allowed: false,
          reason: "المتجر غير موجود",
          requiredFields: [],
          hiddenFields: [],
          suggestedFields: [],
          complianceLevel: "high",
          validationRules: kindInfo.validationRules,
          nextSteps: ["إنشاء متجر أولاً"],
        };
      }

      // 🔍 التحقق البسيط من التوافق مع نشاط المتجر
      const storeActivities = store.businessActivities?.subActivities || [];
      const hasSuggestedActivity = kindInfo.suggestedActivities.some(
        (activity) => storeActivities.includes(activity),
      );

      let reason: string | undefined;
      let nextSteps: string[] = [];

      // ⚠️ التحذير فقط (لا المنع) عند عدم التوافق
      if (!hasSuggestedActivity && storeActivities.length > 0) {
        reason = `هذا النوع من المنتجات يتطلب نشاطًا تجاريًا مثل: ${kindInfo.suggestedActivities.slice(0, 3).join(", ")}`;
        nextSteps = [
          "يمكنك إضافة نشاط تجاري مناسب من إعدادات المتجر",
          "أو متابعة إضافة المنتج وسيتم مراجعته يدويًا",
        ];
      }

      // ✅ السماح دائمًا (المراجعة تكون في خطوات لاحقة)
      return {
        kind,
        allowed: true, // ✅ دائماً مسموح في البداية
        reason,
        requiredFields: this.getRequiredFieldsByKind(kindInfo),
        hiddenFields: this.getHiddenFieldsByKind(kindInfo),
        suggestedFields: this.getSuggestedFieldsByKind(kindInfo),
        complianceLevel: kindInfo.requires.complianceLevel,
        validationRules: kindInfo.validationRules,
        nextSteps,
      };
    } catch (error) {
      console.error("❌ خطأ في معالجة نوع المنتج:", error);
      return {
        kind,
        allowed: false,
        reason: "خطأ في النظام",
        requiredFields: [],
        hiddenFields: [],
        suggestedFields: [],
        complianceLevel: "high",
        validationRules: PRODUCT_KINDS[kind].validationRules,
        nextSteps: ["حاول مرة أخرى لاحقًا"],
      };
    }
  },

  // 🔥 2. الحصول على الحقول المطلوبة بناءً على النوع
  getRequiredFieldsByKind(kindInfo: ProductKindInfo): string[] {
    const required: string[] = ["name", "description", "price"];

    if (kindInfo.requires.inventory) {
      required.push("inventory.quantity");
    }

    if (kindInfo.requires.shipping) {
      required.push("shipping.requiresShipping");
    }

    if (kindInfo.requires.expiryDate) {
      required.push("expiryInfo.hasExpiryDate");
    }

    if (kindInfo.requires.digitalDelivery) {
      required.push("digitalDelivery.enabled");
    }

    if (kindInfo.requires.customerContact) {
      required.push("serviceDetails.requiresCustomerInfo");
    }

    return required;
  },

  // 🔥 3. الحقول التي يجب إخفاؤها
  getHiddenFieldsByKind(kindInfo: ProductKindInfo): string[] {
    const hidden: string[] = [];

    if (!kindInfo.requires.inventory) {
      hidden.push("inventory", "stock", "lowStockThreshold", "backorders");
    }

    if (!kindInfo.requires.shipping) {
      hidden.push("shipping", "weight", "dimensions", "shippingClass");
    }

    if (!kindInfo.requires.dimensions) {
      hidden.push("dimensions");
    }

    if (!kindInfo.requires.weight) {
      hidden.push("weight");
    }

    if (!kindInfo.requires.digitalDelivery) {
      hidden.push(
        "digitalDelivery",
        "downloadLinks",
        "fileSize",
        "accessDuration",
      );
    }

    if (!kindInfo.requires.customerContact) {
      hidden.push("serviceDetails", "communicationMethod", "preparationTime");
    }

    if (!kindInfo.requires.expiryDate) {
      hidden.push(
        "expiryInfo",
        "shelfLife",
        "storageInstructions",
        "allergens",
      );
    }

    // إخفاء الحقول غير المناسبة
    if (
      kindInfo.id === ProductKind.DIGITAL ||
      kindInfo.id === ProductKind.SERVICE
    ) {
      hidden.push("warranty", "sizeGuide", "weight");
    }

    if (kindInfo.id === ProductKind.PHYSICAL) {
      hidden.push("digitalDelivery", "serviceDetails", "expiryInfo");
    }

    return hidden;
  },

  // 🔥 4. الحقول المقترحة (ليست مطلوبة، لكن مفيدة)
  getSuggestedFieldsByKind(kindInfo: ProductKindInfo): string[] {
    const suggested: string[] = [];

    if (kindInfo.id === ProductKind.PHYSICAL) {
      suggested.push("brand", "specifications", "warranty", "sizeGuide");
    }

    if (kindInfo.id === ProductKind.SERVICE) {
      suggested.push(
        "serviceDetails.estimatedDuration",
        "serviceDetails.communicationMethod",
      );
    }

    if (kindInfo.id === ProductKind.FOOD) {
      suggested.push(
        "expiryInfo.shelfLife",
        "expiryInfo.storageInstructions",
        "allergens",
      );
    }

    if (kindInfo.id === ProductKind.DIGITAL) {
      suggested.push(
        "digitalDelivery.fileFormat",
        "digitalDelivery.accessDuration",
      );
    }

    return suggested;
  },

  // 🔥 5. الحصول على إعدادات العرض للحقول
  getFieldVisibility(kind: ProductKind): FieldVisibility {
    const kindInfo = PRODUCT_KINDS[kind];

    return {
      showInventory: kindInfo.requires.inventory,
      showShipping: kindInfo.requires.shipping,
      showDimensions: kindInfo.requires.dimensions,
      showWeight: kindInfo.requires.weight,
      showExpiryDate: kindInfo.requires.expiryDate,
      showDigitalDelivery: kindInfo.requires.digitalDelivery,
      showServiceDetails: kindInfo.requires.customerContact,
      showWarranty: kindInfo.id === ProductKind.PHYSICAL,
      showSizeGuide: kindInfo.id === ProductKind.PHYSICAL,
    };
  },

  // 🔥 6. التحقق من صحة البيانات حسب النوع
  validateProductDataByKind(
    productData: any,
    kind: ProductKind,
  ): KindBasedValidation {
    const kindInfo = PRODUCT_KINDS[kind];
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 🔴 التحقق من الحقول المطلوبة للجميع
    if (!productData.name || productData.name.trim().length < 2) {
      errors.push("اسم المنتج قصير جداً (يجب أن يكون على الأقل حرفين)");
    }

    if (
      !productData.description ||
      productData.description.trim().length <
        kindInfo.validationRules.minDescriptionLength
    ) {
      errors.push(
        `الوصف قصير جداً (يجب أن يكون على الأقل ${kindInfo.validationRules.minDescriptionLength} حرف)`,
      );
    }

    if (productData.price === undefined || productData.price < 0) {
      errors.push("السعر غير صالح");
    }

    if (
      kindInfo.validationRules.minPrice &&
      productData.price < kindInfo.validationRules.minPrice
    ) {
      warnings.push(
        `السعر منخفض جداً (الحد الأدنى المقترح: ${kindInfo.validationRules.minPrice})`,
      );
    }

    // 🔴 التحقق من الحقول المطلوبة حسب النوع
    if (
      kindInfo.requires.inventory &&
      (!productData.inventory || productData.inventory.quantity < 0)
    ) {
      errors.push("كمية المخزون مطلوبة لهذا النوع من المنتجات");
    }

    if (
      kindInfo.requires.shipping &&
      productData.shipping?.requiresShipping === undefined
    ) {
      errors.push("يجب تحديد ما إذا كان المنتج يحتاج شحن");
    }

    // 🔴 إصلاح: استخدام شرط اختياري للتحقق من expiryInfo
    if (kindInfo.requires.expiryDate) {
      if (
        !productData.expiryInfo ||
        productData.expiryInfo.hasExpiryDate === undefined
      ) {
        errors.push("يجب تحديد ما إذا كان المنتج له صلاحية");
      }
    }

    if (
      kindInfo.requires.digitalDelivery &&
      productData.digitalDelivery?.enabled === undefined
    ) {
      errors.push("يجب تحديد طريقة التسليم الرقمي");
    }

    if (
      kindInfo.requires.customerContact &&
      productData.serviceDetails?.requiresCustomerInfo === undefined
    ) {
      errors.push("يجب تحديد ما إذا كانت الخدمة تتطلب معلومات العميل");
    }

    // 🟡 التحذيرات
    if (
      kindInfo.validationRules.requireImages &&
      (!productData.images || productData.images.length === 0)
    ) {
      warnings.push("ينصح بإضافة صور للمنتج");
    }

    if (!productData.category) {
      warnings.push("ينصح بإضافة فئة للمنتج");
    }

    if (!productData.tags || productData.tags.length === 0) {
      suggestions.push("إضافة وسوم تساعد في اكتشاف المنتج");
    }

    // 🟢 الاقتراحات
    if (
      kindInfo.id === ProductKind.FOOD &&
      productData.expiryInfo &&
      !productData.expiryInfo.storageInstructions
    ) {
      suggestions.push("إضافة تعليمات التخزين للمنتج الغذائي");
    }

    if (
      kindInfo.id === ProductKind.SERVICE &&
      productData.serviceDetails &&
      !productData.serviceDetails.estimatedDuration
    ) {
      suggestions.push("تحديد المدة المتوقعة لإنجاز الخدمة");
    }

    if (
      kindInfo.id === ProductKind.DIGITAL &&
      productData.digitalDelivery &&
      !productData.digitalDelivery.accessDuration
    ) {
      suggestions.push("تحديد مدة الوصول للمنتج الرقمي");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  },

  // 🔥 7. تحديث detectDetailedProductType لدعم الزراعة بشكل أفضل
  async detectDetailedProductType(
    productData: any,
    kind: ProductKind,
  ): Promise<ProductTypeDetection> {
    console.log("🔍 بدء الكشف التفصيلي:", {
      name: productData.name,
      kind: kind,
    });

    // استدعاء الدالة الأساسية أولاً
    const detection = await this.detectProductType(productData);

    // 🔥 تحسين خاص للزراعة: إذا كان المنتج زراعي والنوع مادي
    const isAgricultureByName = [
      "سماد",
      "بذور",
      "زراعة",
      "نبات",
      "مبيد",
      "اسمدة",
    ].some((keyword) =>
      (productData.name || "").toLowerCase().includes(keyword.toLowerCase()),
    );

    console.log("🌱 التحقق من الزراعة:", {
      isAgricultureByName,
      name: productData.name,
      detectionType: detection.productType?.name,
    });

    if (isAgricultureByName && kind === ProductKind.PHYSICAL) {
      const agricultureType = DEFAULT_PRODUCT_TYPES.find(
        (pt) => pt.id === "pt_agriculture_011",
      );

      if (
        agricultureType &&
        (!detection.productType ||
          detection.productType.id !== "pt_agriculture_011")
      ) {
        console.log("🌱 إجبار النوع الزراعي:", productData.name);
        return {
          productType: agricultureType,
          confidence: 0.95, // ثقة عالية جداً
          method: DetectionMethod.PATTERN,
          matchedKeywords: ["سماد", "زراعة"],
          suggestedCategories: agricultureType.rules.allowedCategories,
        };
      }
    }

    // إذا كان النوع المتوافق مع kind، زد الثقة
    if (detection.productType) {
      const kindInfo = PRODUCT_KINDS[kind];
      console.log("📊 تحليل التوافق مع kind:", {
        productType: detection.productType.activityId,
        kindSuggestedActivities: kindInfo.suggestedActivities,
      });

      // تحقق من التوافق مع kind
      const isCompatible = kindInfo.suggestedActivities.includes(
        detection.productType.activityId,
      );

      if (isCompatible) {
        // زيادة الثقة عند التوافق
        detection.confidence = Math.min(detection.confidence * 1.3, 0.95);
        detection.method = DetectionMethod.HYBRID;
        console.log("✅ النشاط متوافق مع kind");
      } else {
        // تقليل الثقة عند عدم التوافق
        detection.confidence = detection.confidence * 0.6;
        detection.method = DetectionMethod.RULES;
        console.log("⚠️ النشاط غير متوافق مع kind");

        // محاولة إيجاد نوع متوافق مع kind
        const compatibleTypes = DEFAULT_PRODUCT_TYPES.filter((pt) =>
          kindInfo.suggestedActivities.includes(pt.activityId),
        );

        console.log("🔍 البحث عن أنواع متوافقة:", {
          compatibleCount: compatibleTypes.length,
          kind: kindInfo.name,
        });

        if (compatibleTypes.length > 0) {
          // 🔥 إعطاء الأولوية للنوع الزراعي إذا كان اسم المنتج زراعي
          if (isAgricultureByName) {
            const agricultureCompatible = compatibleTypes.find(
              (pt) => pt.id === "pt_agriculture_011",
            );
            if (agricultureCompatible) {
              console.log("🌱 استخدام نوع زراعي متوافق");
              detection.productType = agricultureCompatible;
              detection.confidence = 0.8;
              detection.method = DetectionMethod.KIND_BASED;
              detection.matchedKeywords.push(
                `نوع معدل ليناسب ${kindInfo.name} (زراعي)`,
              );
              return detection;
            }
          }

          // اقتراح أول نوع متوافق
          detection.productType = compatibleTypes[0];
          detection.confidence = 0.4; // ثقة متوسطة
          detection.method = DetectionMethod.KIND_BASED;
          detection.matchedKeywords.push(`نوع معدل ليناسب ${kindInfo.name}`);
          console.log(
            "🔄 تغيير النوع ليتوافق مع kind:",
            detection.productType.name,
          );
        }
      }
    }

    console.log("🎯 النتيجة النهائية للكشف التفصيلي:", {
      productType: detection.productType?.name,
      confidence: detection.confidence,
      method: detection.method,
    });

    return detection;
  },

  // 🔥 8. تحضير بيانات المنتج للحفظ
  prepareProductDataForSaving(
    rawData: any,
    kind: ProductKind,
    storeId: string,
    ownerId: string,
  ): any {
    console.log("📥 البيانات الواردة إلى prepareProductDataForSaving:", {
      rawDataKeys: Object.keys(rawData),
      hasAgricultureType: "agricultureType" in rawData,
      hasIsOrganic: "isOrganic" in rawData,
      // ⭐ ⭐ ⭐ **أضف تحقق من الحقول الزمنية**
      hasCreatedAt: "createdAt" in rawData,
      hasUpdatedAt: "updatedAt" in rawData,
      createdAtValue: rawData.createdAt,
      updatedAtValue: rawData.updatedAt,
      rawDataPreview: JSON.stringify(rawData).substring(0, 300),
    });

    // ⭐ ⭐ ⭐ **الحفاظ على الحقول الزمنية إذا كانت موجودة**
    const timestampsToPreserve: any = {};

    // تحقق من createdAt
    if (rawData.createdAt) {
      timestampsToPreserve.createdAt = rawData.createdAt;
      console.log("✅ الحفاظ على createdAt من rawData:", rawData.createdAt);
    } else {
      // إذا لم يكن موجوداً، أضف timestamp جديد
      timestampsToPreserve.createdAt = new Date();
      console.log("➕ إضافة createdAt جديد:", timestampsToPreserve.createdAt);
    }

    // تحقق من updatedAt
    if (rawData.updatedAt) {
      timestampsToPreserve.updatedAt = rawData.updatedAt;
      console.log("✅ الحفاظ على updatedAt من rawData:", rawData.updatedAt);
    } else {
      // إذا لم يكن موجوداً، أضف timestamp جديد
      timestampsToPreserve.updatedAt = new Date();
      console.log("➕ إضافة updatedAt جديد:", timestampsToPreserve.updatedAt);
    }
    // استخدام any مؤقتاً
    const kindInfo = PRODUCT_KINDS[kind];
    // البيانات الأساسية المشتركة
    const baseData: any = {
      storeId,
      ownerId,
      kind,
      name: rawData.name?.trim() || "",
      description: rawData.description?.trim() || "",
      shortDescription: rawData.shortDescription?.trim(),
      category: rawData.category,
      subCategory: rawData.subCategory,
      brand: rawData.brand,
      sku: rawData.sku?.trim() || `SKU-${Date.now()}`,
      price: Number(rawData.price) || 0,
      comparePrice: rawData.comparePrice
        ? Number(rawData.comparePrice)
        : undefined,
      costPrice: rawData.costPrice ? Number(rawData.costPrice) : undefined,
      images:
        rawData.images?.length > 0
          ? rawData.images
          : ["/placeholder-product.jpg"],
      specifications: rawData.specifications || {},
      tags: rawData.tags || [],
      featured: rawData.featured || false,
      status: rawData.status || ProductStatus.DRAFT,
      visibility: rawData.visibility || "visible",
      seo: {
        title: rawData.seoTitle || rawData.name?.substring(0, 60) || "",
        description:
          rawData.seoDescription ||
          rawData.description?.substring(0, 160) ||
          "",
        keywords: rawData.seoKeywords || rawData.tags || [],
      },
      soldIndividually: rawData.soldIndividually || false,
      warranty: rawData.warranty,
      returnPolicy: rawData.returnPolicy,
      sizeGuide: rawData.sizeGuide,
      reviewsEnabled: rawData.enableReviews ?? true,
      averageRating: 0,
      reviewCount: 0,
      variants: [],
      stats: { views: 0, sales: 0, wishlistCount: 0 },

      // 🔥 **تأكد من وجود حقل metadata فارغ من البداية**
      metadata: {},

      // ⭐ ⭐ ⭐ **أضف هذا في النهاية: الحقول الزمنية المحفوظة**
      ...timestampsToPreserve,
    };

    const hasAgricultureData =
      rawData.agricultureType ||
      rawData.isOrganic !== undefined ||
      rawData.certification ||
      rawData.usageInstructions ||
      rawData.shelfLifeMonths;

    if (hasAgricultureData) {
      baseData.metadata = {
        ...baseData.metadata,
        agricultureSpecific: {
          agricultureType: rawData.agricultureType || "",
          isOrganic: Boolean(rawData.isOrganic) || false,
          usageInstructions: rawData.usageInstructions || "",
          shelfLifeMonths: Number(rawData.shelfLifeMonths) || 12,
          certification: rawData.certification || "",
          // يمكن إضافة حقول زراعية إضافية هنا
          addedAt: new Date().toISOString(),
          source: "AddProduct form",
        },
      };

      // 🔥 أيضًا يمكن إضافة tags تلقائية للمنتجات الزراعية
      if (
        !baseData.tags.includes("زراعة") &&
        !baseData.tags.includes("زراعي")
      ) {
        baseData.tags = [...(baseData.tags || []), "زراعة", "منتج زراعي"];
      }
    }

    // 🔥 إضافة الحقول الشرطية حسب النوع
    if (kindInfo.requires.inventory && rawData.inventory) {
      baseData.inventory = {
        quantity: Number(rawData.inventory.quantity) || 0,
        sku: rawData.sku?.trim() || `SKU-${Date.now()}`,
        trackInventory: rawData.trackInventory !== false,
        lowStockThreshold: rawData.lowStockThreshold || 5,
        backorders: rawData.allowBackorders || false,
      };
    }

    if (kindInfo.requires.shipping && rawData.shipping) {
      baseData.shipping = {
        weight: rawData.weight ? Number(rawData.weight) : undefined,
        dimensions: rawData.dimensions
          ? {
              length: rawData.length ? Number(rawData.length) : undefined,
              width: rawData.width ? Number(rawData.width) : undefined,
              height: rawData.height ? Number(rawData.height) : undefined,
            }
          : undefined,
        requiresShipping: rawData.requiresShipping !== false,
        shippingClass: rawData.shippingClass || "standard",
      };
    }

    if (kindInfo.requires.digitalDelivery && rawData.digitalDelivery) {
      baseData.digitalDelivery = {
        enabled: rawData.digitalDelivery.enabled !== false,
        files: rawData.digitalFiles || [],
        downloadLinks: rawData.downloadLinks || [],
        autoSend: rawData.autoSend || true,
        accessDuration: rawData.accessDuration || 365, // سنة افتراضياً
        fileSize: rawData.fileSize,
        fileFormat: rawData.fileFormat,
      };
    }

    if (kindInfo.requires.customerContact && rawData.serviceDetails) {
      baseData.serviceDetails = {
        estimatedDuration: rawData.estimatedDuration || "",
        requiresCustomerInfo: rawData.requiresCustomerInfo !== false,
        communicationMethod: rawData.communicationMethod || "whatsapp",
        preparationTime: rawData.preparationTime,
        maxOrdersPerDay: rawData.maxOrdersPerDay,
      };
    }

    if (kindInfo.requires.expiryDate && rawData.expiryInfo) {
      baseData.expiryInfo = {
        hasExpiryDate: rawData.hasExpiryDate || false,
        expiryDate: rawData.expiryDate
          ? new Date(rawData.expiryDate)
          : undefined,
        shelfLife: rawData.shelfLife,
        storageInstructions: rawData.storageInstructions,
        allergens: rawData.allergens || [],
      };
    }

    // الضرائب
    if (rawData.taxable !== undefined) {
      baseData.tax = {
        taxable: rawData.taxable,
        taxClass: rawData.taxClass || "standard",
      };
    }
    // 🔥 **أضف هذا: تسجيل البيانات المحضرة للتشخيص - مُعدّل**
    console.log("🔄 تحضير بيانات المنتج للحفظ (المُعدّل):", {
      name: baseData.name,
      kind: baseData.kind,
      hasAgricultureData: hasAgricultureData,
      metadataExists: !!baseData.metadata,
      agricultureSpecificExists: !!baseData.metadata?.agricultureSpecific,
      agricultureFields: baseData.metadata?.agricultureSpecific
        ? Object.keys(baseData.metadata.agricultureSpecific)
        : [],
      agricultureDataPreview: baseData.metadata?.agricultureSpecific
        ? JSON.stringify(baseData.metadata.agricultureSpecific).substring(
            0,
            150,
          )
        : "لا توجد",
      tags: baseData.tags,
      // ⭐ ⭐ ⭐ **أضف تحقق من timestamps**
      hasCreatedAt: "createdAt" in baseData,
      hasUpdatedAt: "updatedAt" in baseData,
      timestampsPreserved: timestampsToPreserve,
    });

    // 🔥 **تحقق من أن كائن metadata كامل قبل الإرجاع**
    console.log("📋 كامل كائن baseData قبل الإرجاع:", {
      keys: Object.keys(baseData),
      hasMetadata: "metadata" in baseData,
      metadataType: typeof baseData.metadata,
      metadataKeys: baseData.metadata ? Object.keys(baseData.metadata) : [],
      // ⭐ ⭐ ⭐ **أضف تحقق من الحقول الزمنية**
      hasCreatedAt: "createdAt" in baseData,
      hasUpdatedAt: "updatedAt" in baseData,
      createdAt: baseData.createdAt,
      updatedAt: baseData.updatedAt,
    });

    return baseData;
  },

  // 🔥 9. بناء semantics مع مراعاة kind
  async buildProductSemanticsWithKind(
    productData: any,
    kind: ProductKind,
    store?: Store,
    forceProductType?: ProductType,
  ): Promise<ProductSemantics> {
    const semantics: ProductSemantics = {
      confidenceScore: 0,
      complianceStatus: ComplianceStatus.PENDING_REVIEW,
      detectionMethod: DetectionMethod.NONE,
    };

    try {
      // الكشف عن نوع المنتج التفصيلي
      const detection = forceProductType
        ? {
            productType: forceProductType,
            confidence: 1,
            method: DetectionMethod.MANUAL,
            matchedKeywords: [],
          }
        : await this.detectDetailedProductType(productData, kind);

      if (detection.productType) {
        semantics.productTypeId = detection.productType.id;
        semantics.detectedActivity = detection.productType.activityId;
        semantics.confidenceScore = detection.confidence;
        semantics.detectionMethod = detection.method;
        semantics.lastDetection = new Date();

        // تسجيل تاريخ الكشف
        semantics.detectionLog = [
          {
            timestamp: new Date(),
            method: detection.method,
            confidence: detection.confidence,
            activity: detection.productType.activityId,
          },
        ];

        // التحقق من التوافق مع kind
        const kindInfo = PRODUCT_KINDS[kind];
        const isActivityCompatible = kindInfo.suggestedActivities.includes(
          detection.productType.activityId,
        );

        semantics.metadata = {
          isSensitive: detection.productType.metadata?.isSensitive,
          requiresLicense: detection.productType.metadata?.requiresLicense,
          flags: [
            `نوع أساسي: ${kindInfo.name}`,
            ...(isActivityCompatible
              ? ["النشاط متوافق مع نوع المنتج"]
              : ["النشاط غير متوافق مع نوع المنتج"]),
            ...(detection.matchedKeywords.length > 0
              ? [`تم الكشف بـ ${detection.matchedKeywords.length} كلمة مفتاحية`]
              : []),
          ],
        };

        // التحقق من الامتثال مع المتجر
        if (store) {
          const complianceCheck = await this.checkComplianceWithStore(
            productData,
            detection.productType,
            store,
          );

          semantics.complianceStatus = complianceCheck.complianceStatus;
          semantics.validationFlags = complianceCheck.violations;

          // تعديل حالة الامتثال بناءً على التوافق مع kind
          if (!isActivityCompatible) {
            semantics.complianceStatus = ComplianceStatus.NON_COMPLIANT;
            semantics.validationFlags = [
              ...(semantics.validationFlags || []),
              `نوع المنتج (${kindInfo.name}) لا يتوافق مع النشاط المكتشف (${detection.productType.activityId})`,
            ];
          }

          if (complianceCheck.shadowActions) {
            semantics.shadowActions = complianceCheck.shadowActions;
          }
        }
      }

      return semantics;
    } catch (error) {
      console.error("❌ خطأ في بناء دلالات المنتج مع kind:", error);
      return semantics;
    }
  },

  // 🔥 10. دوال مساعدة
  getKindInfo(kind: ProductKind): ProductKindInfo {
    return PRODUCT_KINDS[kind];
  },

  getAllKinds(): ProductKindInfo[] {
    return Object.values(PRODUCT_KINDS);
  },

  getKindByActivity(activityId: string): ProductKind | null {
    for (const [kind, info] of Object.entries(PRODUCT_KINDS)) {
      if (info.suggestedActivities.includes(activityId)) {
        return kind as ProductKind;
      }
    }
    return null;
  },

  // استمرار compliance/system.ts - الجزء الثاني (11-20+)
  // 🔹 11. لا تثق في البيانات القادمة من العميل - محسنة
  sanitizeProductData(productData: any): any {
    const sanitized = { ...productData };

    // ❗ حذف _semantics القادمة من الواجهة تمامًا
    delete sanitized._semantics;

    // ❗ حذف حقول النشاط التجاري (يتم اكتشافها تلقائياً)
    delete sanitized.businessType;
    delete sanitized.subBusinessType;
    delete sanitized.businessActivities;

    // تنظيف البيانات الأخرى
    delete sanitized.id;
    delete sanitized.createdAt;
    delete sanitized.updatedAt;
    delete sanitized.ownerId; // يجب أن يأتي من السيرفر

    return sanitized;
  },

  // 🔹 12. بناء semantics في السيرفر فقط - محسنة
  async buildProductSemantics(
    productData: Partial<Product>,
    store?: Store,
    forceProductType?: ProductType,
  ): Promise<ProductSemantics> {
    const semantics: ProductSemantics = {
      confidenceScore: 0,
      complianceStatus: ComplianceStatus.PENDING_REVIEW,
      detectionMethod: DetectionMethod.NONE,
    };

    try {
      // الكشف عن نوع المنتج
      const detection = forceProductType
        ? {
            productType: forceProductType,
            confidence: 1,
            method: DetectionMethod.MANUAL,
            matchedKeywords: [],
          }
        : await this.detectProductType(productData);

      if (detection.productType) {
        semantics.productTypeId = detection.productType.id;
        semantics.detectedActivity = detection.productType.activityId;
        semantics.confidenceScore = detection.confidence;
        semantics.detectionMethod = detection.method as DetectionMethod;
        semantics.lastDetection = new Date();

        // تسجيل تاريخ الكشف
        semantics.detectionLog = [
          {
            timestamp: new Date(),
            method: detection.method as DetectionMethod,
            confidence: detection.confidence,
            activity: detection.productType.activityId,
          },
        ];

        // إضافة metadata من نوع المنتج
        semantics.metadata = {
          isSensitive: detection.productType.metadata?.isSensitive,
          requiresLicense: detection.productType.metadata?.requiresLicense,
          flags:
            detection.matchedKeywords.length > 0
              ? [`تم الكشف بـ ${detection.matchedKeywords.length} كلمة مفتاحية`]
              : undefined,
        };

        // التحقق من الامتثال مع المتجر
        if (store) {
          const complianceCheck = await this.checkComplianceWithStore(
            productData,
            detection.productType,
            store,
          );

          semantics.complianceStatus = complianceCheck.complianceStatus;
          semantics.validationFlags = complianceCheck.violations;

          if (complianceCheck.shadowActions) {
            semantics.shadowActions = complianceCheck.shadowActions;
          }
        }
      }

      return semantics;
    } catch (error) {
      console.error("❌ خطأ في بناء دلالات المنتج:", error);
      return semantics;
    }
  },

  // 🔹 13. نظام قرارات ثلاثي محسَن
  async makeComplianceDecision(
    productData: Partial<Product>,
    productType: ProductType | null,
    store?: Store,
  ): Promise<ComplianceCheckResult> {
    // ⭐ احترام حالة المنتج المحددة من قبل المستخدم
    const userSelectedStatus = productData.status;

    const result: ComplianceCheckResult = {
      decision: ComplianceDecision.ALLOW,
      complianceStatus: ComplianceStatus.COMPLIANT,
      productStatus: userSelectedStatus || ProductStatus.ACTIVE, // ⭐ أولوية حالة المستخدم
      violations: [],
      warnings: [],
      suggestedActions: [],
    };

    try {
      // 1. تحقق من وجود بيانات زراعية كاملة
      const hasAgricultureData = productData.metadata?.agricultureSpecific;
      const agricultureComplete =
        hasAgricultureData &&
        hasAgricultureData.agricultureType &&
        hasAgricultureData.isOrganic !== undefined;

      // 🔥 التعديل: احترام حالة المستخدم أولاً
      if (userSelectedStatus) {
        console.log("🎯 احترام حالة المستخدم المحددة:", userSelectedStatus);
        result.productStatus = userSelectedStatus;
      }

      // 🔥 المنتج الزراعي المكتمل - الموافقة مع الحفاظ على الحالة
      if (productType?.activityId === "agriculture" && agricultureComplete) {
        console.log("🌱 منتج زراعي مكتمل - الموافقة مع الحالة الحالية");
        result.productStatus = userSelectedStatus || ProductStatus.ACTIVE;
        return result;
      }

      // 2. حالات المنع المباشر (block) - تبقى كما هي
      const blockReasons = this.checkBlockConditions(productData, store);
      if (blockReasons.length > 0) {
        return {
          decision: ComplianceDecision.BLOCK,
          complianceStatus: ComplianceStatus.NON_COMPLIANT,
          productStatus: ProductStatus.SUSPENDED, // ⭐ حالة ثابتة للمنع
          violations: blockReasons,
          warnings: [],
          suggestedActions: ["الاتصال بالدعم"],
        };
      }

      // 3. 🔥 تعديل: عدم تطابق النشاط = تحذير فقط
      if (productType && store) {
        const storeActivities = store.businessActivities?.subActivities || [];
        const productActivity = productType.activityId;

        if (productActivity && !storeActivities.includes(productActivity)) {
          result.warnings.push(
            `نشاط المنتج (${productActivity}) غير مسجل للمتجر - ينصح بإضافة النشاط`,
          );
          result.suggestedActions.push(
            "يمكنك طلب إضافة هذا النشاط إلى متجرك من إعدادات المتجر",
          );

          // ⭐ لا تغيير الحالة عند عدم تطابق النشاط
          // فقط تحذير
        }
      }

      // 4. التحقق من البيانات المطلوبة
      if (productType) {
        const missingFields = this.checkRequiredFields(
          productData,
          productType,
        );
        if (missingFields.length > 0) {
          // ⭐ المنتجات الحساسة تحتاج مراجعة
          if (productType.metadata?.isSensitive) {
            result.decision = ComplianceDecision.REVIEW_REQUIRED;
            result.complianceStatus = ComplianceStatus.NON_COMPLIANT;
            result.productStatus =
              userSelectedStatus || ProductStatus.UNDER_REVIEW;
            result.violations.push(
              `هناك ${missingFields.length} حقل مطلوب غير مكتمل لمنتج حساس`,
            );
          } else {
            result.warnings.push(
              `هناك ${missingFields.length} حقل مطلوب غير مكتمل`,
            );
          }
          result.suggestedActions.push(`إضافة: ${missingFields.join(", ")}`);
        }
      }

      // 5. 🔥 تأكيد حالة المستخدم للمنتجات العادية
      if (result.decision === ComplianceDecision.ALLOW) {
        result.complianceStatus = ComplianceStatus.COMPLIANT;
        // ⭐ الحفاظ على حالة المستخدم إذا كانت محددة
        if (!userSelectedStatus) {
          result.productStatus = ProductStatus.ACTIVE;
        }

        // تأكيد خاص للمنتجات الزراعية
        if (productType?.activityId === "agriculture") {
          console.log(
            "✅ منتج زراعي - تمت الموافقة مع الحالة:",
            result.productStatus,
          );
        }
      }

      return result;
    } catch (error) {
      console.error("❌ خطأ في اتخاذ قرار الامتثال:", error);
      return {
        decision: ComplianceDecision.REVIEW_REQUIRED,
        complianceStatus: ComplianceStatus.PENDING_REVIEW,
        productStatus: userSelectedStatus || ProductStatus.UNDER_REVIEW, // ⭐ حالة المستخدم أولاً
        violations: ["خطأ في التحقق من الامتثال"],
        warnings: ["حاول مرة أخرى لاحقًا"],
        suggestedActions: [],
      };
    }
  },

  // 🔹 14. كشف نوع المنتج محسَن
  async detectProductType(
    productData: Partial<Product>,
  ): Promise<ProductTypeDetection> {
    try {
      const searchText = [
        productData.name || "",
        productData.description || "",
        productData.shortDescription || "",
        ...(productData.tags || []),
        productData.brand || "",
        productData.category || "",
      ]
        .filter((text) => text && text.trim())
        .join(" ")
        .toLowerCase()
        .replace(/[^\w\u0600-\u06FF\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!searchText || searchText.length < 3) {
        return {
          productType: null,
          confidence: 0,
          method: DetectionMethod.NONE,
          matchedKeywords: [],
        };
      }

      // 🔥 🔥 🔥 التحديث الجديد: إعطاء أولوية عالية للزراعة 🔥 🔥 🔥
      console.log("🔍 نص البحث للكشف:", searchText);

      let bestMatch: ProductType | null = null;
      let highestScore = 0;
      let matchedKeywords: string[] = [];
      let detectionMethod = DetectionMethod.RULES;

      // 🔥 الخطوة 1: البحث عن الزراعة أولاً (أولوية قصوى)
      const agricultureKeywords = [
        "سماد",
        "بذور",
        "زراعة",
        "نبات",
        "شجرة",
        "فاكهة",
        "خضروات",
        "محصول",
        "ري",
        "تربة",
        "مبيد",
        "اسمدة",
        "زراعي",
        "فلاحة",
        "ثمار",
        "حبوب",
        "قمح",
        "شعير",
        "ذرة",
        "أرز",
        "قطن",
        "عضوي",
        "طبيعي",
        "بيئة",
        "محاصيل",
        "تسميد",
        "نمو",
        "شتلة",
        "شتلات",
      ];

      const agricultureType = DEFAULT_PRODUCT_TYPES.find(
        (pt) => pt.id === "pt_agriculture_011",
      );

      if (agricultureType) {
        let agricultureScore = 0;
        const agricultureMatched: string[] = [];

        // تحقق من الكلمات الزراعية في نص البحث
        for (const keyword of agricultureKeywords) {
          if (searchText.includes(keyword.toLowerCase())) {
            agricultureScore += 20; // زيادة كبيرة للزراعة
            agricultureMatched.push(keyword);
          }
        }

        // زيادة إضافية إذا كان الاسم يحتوي على كلمات زراعية مباشرة
        const productName = (productData.name || "").toLowerCase();
        if (productName.includes("سماد")) {
          agricultureScore += 40; // زيادة هائلة لكلمة "سماد"
        }
        if (productName.includes("بذور")) {
          agricultureScore += 35;
        }
        if (productName.includes("زراعة")) {
          agricultureScore += 30;
        }

        // إذا كان هناك تطابق زراعي قوي
        if (agricultureScore > 0) {
          console.log(`🌱 اكتشاف زراعي: ${agricultureScore} نقطة`, {
            matched: agricultureMatched,
            name: productData.name,
          });

          if (agricultureScore > highestScore) {
            highestScore = agricultureScore;
            bestMatch = agricultureType;
            matchedKeywords = agricultureMatched;
            detectionMethod = DetectionMethod.PATTERN;
          }
        }
      }

      // 🔥 الخطوة 2: البحث في باقي الأنواع (إذا لم يكن هناك تطابق زراعي قوي)
      if (!bestMatch || highestScore < 30) {
        for (const productType of DEFAULT_PRODUCT_TYPES) {
          // تخطي الزراعة إذا تم معالجتها مسبقاً
          if (
            productType.id === "pt_agriculture_011" &&
            bestMatch?.id === "pt_agriculture_011"
          ) {
            continue;
          }

          let score = 0;
          const typeMatchedKeywords: string[] = [];

          // الكشف بالكلمات المفتاحية
          for (const keyword of productType.keywords) {
            const keywordLower = keyword.toLowerCase();

            // تطابق كامل
            if (searchText.includes(keywordLower)) {
              score += 10;
              typeMatchedKeywords.push(keyword);
            }
            // تطابق جزئي
            else if (
              keywordLower.includes(" ") &&
              keywordLower
                .split(" ")
                .some((word) => word.length > 3 && searchText.includes(word))
            ) {
              score += 5;
              typeMatchedKeywords.push(keyword);
            }
          }

          // تطابق مع الفئة
          if (productData.category && productType.rules.allowedCategories) {
            const categoryLower = productData.category.toLowerCase();
            const matchesCategory = productType.rules.allowedCategories.some(
              (cat) => categoryLower.includes(cat.toLowerCase()),
            );
            if (matchesCategory) {
              score += 15;
            }
          }

          // تطابق مع العلامة التجارية (لكل نوع)
          if (productData.brand) {
            const brandLower = productData.brand.toLowerCase();
            const electronicsBrands = ["سامسونج", "أبل", "شاومي", "هواوي"];
            const clothingBrands = ["زارا", "h&m", "نايك", "أديداس"];

            if (
              productType.activityId === "electronics" &&
              electronicsBrands.some((b) =>
                brandLower.includes(b.toLowerCase()),
              )
            ) {
              score += 10;
            }
            if (
              productType.activityId === "fashion" &&
              clothingBrands.some((b) => brandLower.includes(b.toLowerCase()))
            ) {
              score += 10;
            }
          }

          // تحديث أفضل تطابق
          if (score > highestScore) {
            highestScore = score;
            bestMatch = productType;
            matchedKeywords = typeMatchedKeywords;
            detectionMethod =
              score > 30 ? DetectionMethod.AI : DetectionMethod.RULES;
          }
        }
      }

      // 🔥 الخطوة 3: إذا لم يتم العثور على تطابق قوي
      if (!bestMatch || highestScore < 20) {
        // محاولة الكشف بالأنماط مع أولوية الزراعة
        const patterns = [
          {
            pattern: /(سماد|بذور|زراعة|نبات|تربة|مبيد|اسمدة|زراعي|فلاحة)/i,
            typeId: "pt_agriculture_011",
            priority: 100, // 🔥 أعلى أولوية
          },
          {
            pattern: /(لحم|لحوم|دجاج|بيض|حليب|ألبان|أسماك|مأكولات بحرية)/i,
            typeId: "pt_livestock_012",
            priority: 90,
          },
          {
            pattern: /(هاتف|جوال|موبايل|سمارت فون|iphone|android)/i,
            typeId: "pt_electronics_001",
            priority: 80,
          },
          {
            pattern: /(عباية|حجاب|غطاء|خمار|قميص|بنطال|فستان)/i,
            typeId: "pt_clothing_002",
            priority: 80,
          },
          {
            pattern: /(طعام|أكل|وجبة|مطعم|سفري|بيتزا|برجر)/i,
            typeId: "pt_food_003",
            priority: 80,
          },
          {
            pattern: /(مكياج|كريم|مستحضر|تجميل|عطر)/i,
            typeId: "pt_cosmetics_004",
            priority: 80,
          },
        ];

        // ترتيب الأنماط حسب الأولوية
        patterns.sort((a, b) => b.priority - a.priority);

        for (const { pattern, typeId } of patterns) {
          if (pattern.test(searchText)) {
            bestMatch =
              DEFAULT_PRODUCT_TYPES.find((pt) => pt.id === typeId) || null;
            if (bestMatch) {
              highestScore = 25;
              detectionMethod = DetectionMethod.PATTERN;
              matchedKeywords = [pattern.toString()];
              console.log(`🎯 تم الكشف بالنمط: ${typeId}`, pattern);
              break;
            }
          }
        }
      }

      const confidence = Math.min(highestScore / 50, 1);

      // 🔥 تسجيل النتيجة النهائية
      console.log("🎯 نتيجة الكشف النهائية:", {
        productType: bestMatch?.name,
        confidence,
        method: detectionMethod,
        matchedKeywords,
        score: highestScore,
      });

      // اقتراح فئات بناءً على نوع المنتج
      let suggestedCategories: string[] = [];
      if (bestMatch?.rules.allowedCategories) {
        suggestedCategories = bestMatch.rules.allowedCategories;
      }

      return {
        productType: bestMatch,
        confidence,
        method: detectionMethod,
        matchedKeywords,
        suggestedCategories,
      };
    } catch (error) {
      console.error("❌ خطأ في اكتشاف نوع المنتج:", error);
      return {
        productType: null,
        confidence: 0,
        method: DetectionMethod.NONE,
        matchedKeywords: [],
      };
    }
  },

  // 🔹 15. التحقق من التوافق مع المتجر (المُحسَّن للنظام الذكي)
  async checkComplianceWithStore(
    productData: Partial<Product>,
    productType: ProductType,
    store: Store,
  ): Promise<{
    isCompliant: boolean;
    complianceStatus: ComplianceStatus;
    violations: string[];
    suggestedActions: string[];
    shadowActions?: {
      hideFromStore?: boolean;
      hideFromSearch?: boolean;
      limitPurchase?: boolean;
    };
  }> {
    const violations: string[] = [];
    const suggestedActions: string[] = [];
    let shadowActions;

    // 🔧 دالة مساعدة للحصول على تسمية النشاط
    const getActivityLabel = (activity: string): string => {
      const activityLabels: Record<string, string> = {
        agriculture: "زراعة",
        "agricultural-products": "منتجات زراعية",
        "seeds-fertilizers": "بذور وأسمدة",
        livestock: "مواشي ودواجن",
        fisheries: "ثروة سمكية",
        food: "طعام ومشروبات",
        fashion: "أزياء وملابس",
        electronics: "إلكترونيات",
        "home-garden": "منزل وحديقة",
        cosmetics: "صحة وجمال",
        books: "كتب",
        sports: "رياضة",
        toys: "ألعاب",
        automotive: "سيارات",
        jewelry: "مجوهرات",
      };

      return activityLabels[activity] || activity;
    };

    // 🔧 دالة مساعدة للعثور على النشاط الرئيسي
    const findMainActivity = (activity: string): string => {
      for (const [mainActivity, compatibleActivities] of Object.entries(
        ACTIVITY_COMPATIBILITY_MAP,
      )) {
        if (compatibleActivities.includes(activity)) {
          return mainActivity;
        }
      }
      return activity;
    };

    // 1. 🔍 التحقق من تطابق النشاط باستخدام النظام الذكي
    const storeActivities = store.businessActivities?.subActivities || [];
    const productActivity = productType.activityId;

    if (productActivity) {
      // 🔥 استخدام نظام التوافق الذكي
      const isCompatible = checkActivityCompatibility(
        productActivity,
        storeActivities,
      );

      if (!isCompatible) {
        violations.push(
          `نشاط المنتج (${getActivityLabel(productActivity)}) غير متوافق مع أنشطة المتجر`,
        );
        suggestedActions.push(
          `يمكنك إضافة نشاط "${getActivityLabel(findMainActivity(productActivity))}" إلى متجرك`,
        );

        shadowActions = {
          hideFromSearch: true,
          limitPurchase: true,
          showWarning: true,
        };

        console.log(`⚠️ عدم تطابق النشاط: ${productActivity}`, {
          storeActivities,
          productType: productType.name,
          isCompatible,
          compatibilityCheck: checkActivityCompatibility(
            productActivity,
            storeActivities,
          ),
        });
      } else {
        console.log(`✅ نشاط متوافق: ${productActivity}`, {
          storeActivities,
          productType: productType.name,
        });
      }
    }

    // 2. ⭐⭐ التحديث المهم: التحقق من الفئات باستخدام اسم التصنيف وليس ID
    if (productData.category) {
      try {
        // 🔥 جلب معلومات التصنيف من قاعدة البيانات
        const categoryDoc = await getDoc(
          doc(db, "categories", productData.category),
        );

        if (categoryDoc.exists()) {
          const categoryData = categoryDoc.data();
          const categoryName = categoryData.name || "";
          const categorySlug = categoryData.slug || "";

          // التحقق من الفئات المسموحة
          if (productType.rules.allowedCategories) {
            const isCategoryAllowed = productType.rules.allowedCategories.some(
              (allowedCat) => {
                // تحقق من slug إذا كان موجوداً، وإلا فتحقق من الاسم
                if (categorySlug) {
                  return categorySlug
                    .toLowerCase()
                    .includes(allowedCat.toLowerCase());
                } else {
                  return categoryName
                    .toLowerCase()
                    .includes(allowedCat.toLowerCase());
                }
              },
            );

            if (!isCategoryAllowed) {
              violations.push(
                `فئة "${categoryName}" غير مناسبة لهذا النوع من المنتجات`,
              );
              suggestedActions.push(
                `اختر فئة من: ${productType.rules.allowedCategories.join(", ")}`,
              );
            }
          }
        } else {
          // إذا لم يتم العثور على التصنيف، تحقق مباشرة من القيمة
          if (productType.rules.allowedCategories) {
            const isCategoryAllowed = productType.rules.allowedCategories.some(
              (cat) =>
                productData.category!.toLowerCase().includes(cat.toLowerCase()),
            );

            if (!isCategoryAllowed) {
              violations.push(
                `التصنيف المحدد غير مناسب لهذا النوع من المنتجات`,
              );
            }
          }
        }
      } catch (error) {
        console.warn("⚠️ خطأ في جلب معلومات التصنيف:", error);
        // في حالة الخطأ، تخطي التحقق من الفئة
      }
    }

    // 3. التحقق من الحقول المطلوبة حسب نوع المنتج
    if (productType.rules?.requiredFields) {
      for (const field of productType.rules.requiredFields) {
        if (
          !productData.specifications?.[field] &&
          !(productData as any)[field]
        ) {
          violations.push(`الحقل المطلوب ${field} مفقود`);
          suggestedActions.push(`أضف حقل ${field} إلى مواصفات المنتج`);
        }
      }
    }

    const isCompliant = violations.length === 0;
    const complianceStatus = isCompliant
      ? ComplianceStatus.COMPLIANT
      : violations.some((v) => v.includes("غير مسجل"))
        ? ComplianceStatus.NON_COMPLIANT
        : ComplianceStatus.PENDING_REVIEW;

    return {
      isCompliant,
      complianceStatus,
      violations,
      suggestedActions,
      shadowActions,
    };
  },

  // 🔹 16. التحقق من الحقول المطلوبة محسَن
  checkRequiredFields(
    productData: Partial<Product>,
    productType: ProductType,
  ): string[] {
    const missingFields: string[] = [];

    // الحقول الأساسية المطلوبة لجميع المنتجات
    const baseRequired = ["name", "price", "description"];
    for (const field of baseRequired) {
      if (
        !productData[field as keyof Product] ||
        (typeof productData[field as keyof Product] === "string" &&
          (productData[field as keyof Product] as string).trim() === "")
      ) {
        missingFields.push(field);
      }
    }

    // ⭐ تحديث: الحقول المطلوبة حسب نوع المنتج (خاص بالزراعة)
    if (productType?.rules?.requiredFields) {
      const isAgriculture = productType.activityId === "agriculture";

      for (const field of productType.rules.requiredFields) {
        let fieldExists = false;

        // 1. البحث في الحقول المباشرة للمنتج
        const directFieldValue = (productData as any)[field];
        if (directFieldValue && directFieldValue.toString().trim() !== "") {
          fieldExists = true;
        }

        // 2. البحث في المواصفات
        if (!fieldExists && productData.specifications?.[field]) {
          fieldExists = true;
        }

        // 3. ⭐ البحث في agricultureSpecific للمنتجات الزراعية
        if (
          !fieldExists &&
          isAgriculture &&
          productData.metadata?.agricultureSpecific
        ) {
          const agriField = productData.metadata.agricultureSpecific[field];
          if (agriField && agriField.toString().trim() !== "") {
            fieldExists = true;
          }
        }

        if (!fieldExists) {
          missingFields.push(field);
        }
      }
    }

    return missingFields;
  },

  // 🔹 17. باقي الدوال الحالية (مع تعديلات طفيفة)
  checkBlockConditions(productData: Partial<Product>, store?: Store): string[] {
    const blockReasons: string[] = [];

    // 1. المنتج غير قانوني حسب البلد
    const illegalProducts = [
      "مخدرات",
      "أسلحة",
      "كحول",
      "تبغ",
      "ممنوع",
      "محظور",
    ];
    const productName = (productData.name || "").toLowerCase();
    const productDesc = (productData.description || "").toLowerCase();

    for (const illegal of illegalProducts) {
      if (productName.includes(illegal) || productDesc.includes(illegal)) {
        blockReasons.push(`المنتج غير قانوني (${illegal})`);
        break;
      }
    }

    // 2. نقص بيانات إلزامية حرجة
    if (!productData.name || productData.name.trim().length < 2) {
      blockReasons.push("اسم المنتج غير صالح (يجب أن يكون على الأقل حرفين)");
    }

    if (productData.price === undefined || productData.price < 0) {
      blockReasons.push("السعر غير صالح");
    }

    // 3. محاولة تلاعب (مثل إرسال _semantics مزيفة)
    if ((productData as any)._semantics) {
      blockReasons.push("محاولة تلاعب في بيانات الامتثال");
    }

    // 4. مخالفة صريحة لقوانين المنصة
    const forbiddenTerms = ["احتيال", "نصب", "خداع", "مزور", "مقلد"];
    for (const term of forbiddenTerms) {
      if (productName.includes(term) || productDesc.includes(term)) {
        blockReasons.push("ينتهي شروط وأحكام المنصة");
        break;
      }
    }

    // 5. منتجات حساسة بدون تراخيص
    const productType = DEFAULT_PRODUCT_TYPES.find(
      (pt) => pt.id === (productData as any)?.productTypeId,
    );
    if (
      productType?.metadata?.requiresLicense &&
      !store?.commercialRegistration
    ) {
      blockReasons.push("المنتج يحتاج تراخيص والمتجر غير مرخص");
    }

    return blockReasons;
  },

  // 🔹 18. تطبيق الإجراءات الخفية
  applyShadowActions: function (
    productId: string,
    shadowActions: {
      hideFromStore?: boolean;
      hideFromSearch?: boolean;
      limitPurchase?: boolean;
    },
  ): void {
    console.log("🔄 تطبيق إجراءات خفية:", {
      productId,
      actions: shadowActions,
    });
  },

  // ============ معالجة المخالفات ============

  // 🔹 19. معالجة مخالفة الامتثال
  async handleComplianceViolation(
    productId: string,
    storeId: string,
    violationType: string,
    details: any,
  ): Promise<void> {
    try {
      const product = await productService.getById(productId);
      if (!product) return;

      // إنشاء مخالفة
      const complianceFlag: Omit<ComplianceFlag, "id"> = {
        storeId,
        productId,
        issueType: violationType as any,
        severity: details.severity || "medium",
        details,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, "complianceFlags"), complianceFlag);

      console.log(`⚠️ تم تسجيل مخالفة للمنتج ${productId}:`, violationType);
    } catch (error) {
      console.error("❌ خطأ في معالجة المخالفة:", error);
    }
  },

  // ============ فحص دفعي ============

  // 🔹 20. فحص امتثال دفعي للمتجر
  async batchComplianceCheck(storeId: string): Promise<{
    checked: number;
    compliant: number;
    nonCompliant: number;
    errors: number;
  }> {
    try {
      const products = await productService.getByStore(storeId, "all");
      let compliant = 0;
      let nonCompliant = 0;
      let errors = 0;

      for (const product of products) {
        try {
          // إعادة بناء semantics في السيرفر
          const store = await storeService.getById(storeId);
          const semantics = await this.buildProductSemantics(product, store);

          // اتخاذ قرار الامتثال
          const decision = await this.makeComplianceDecision(
            product,
            DEFAULT_PRODUCT_TYPES.find(
              (pt) => pt.id === semantics.productTypeId,
            ),
            store,
          );

          // تحديث حالة المنتج
          await productService.update(product.id, {
            _semantics: semantics,
            status: decision.productStatus,
          } as Partial<Product>);

          if (decision.decision === ComplianceDecision.ALLOW) {
            compliant++;
          } else {
            nonCompliant++;
          }
        } catch (error) {
          console.error(`❌ خطأ في تحقق المنتج ${product.id}:`, error);
          errors++;
        }
      }

      // تحديث إحصائيات المتجر
      const total = products.length;
      const complianceRate = total > 0 ? (compliant / total) * 100 : 100;

      await storeService.update(storeId, {
        complianceStats: {
          totalProducts: total,
          compliantProducts: compliant,
          flaggedProducts: nonCompliant,
          lastCheck: new Date(),
          complianceRate,
        },
      });

      return {
        checked: products.length,
        compliant,
        nonCompliant,
        errors,
      };
    } catch (error) {
      console.error("❌ خطأ في الفحص الدفعي:", error);
      return {
        checked: 0,
        compliant: 0,
        nonCompliant: 0,
        errors: 1,
      };
    }
  },
};
