import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import {
  Product,
  ProductInput,
  ProductUpdate,
  DiscountUpdate,
} from "../../types/product.types";
import { Store } from "../../types/store.types";
import {
  ProductKind,
  PRODUCT_KINDS,
  ProductType,
  DEFAULT_PRODUCT_TYPES,
  ProductTypeDetection,
} from "../../constants";

import { complianceSystem } from "../../compliance";
import { checkActivityCompatibility } from "../../constants/activity-map";
import { cleanFirestoreData } from "../../utils/clean-firestore";
import { storeService } from "../store/store.service";
import {
  ComplianceCheckResult,
  ComplianceDecision,
  ComplianceStatus,
  DetectionMethod,
  ProductStatus,
} from "../../types/compliance.types";

/**
 * خدمة إدارة المنتجات
 * مسؤولة عن جميع عمليات CRUD للمنتجات مع نظام الامتثال الذكي
 */
export class ProductService {
  // ============ دوال مساعدة داخلية ============

  /**
   * تحويل بيانات Firestore إلى كائن Product
   * @param id معرف المنتج
   * @param data بيانات Firestore
   * @param store بيانات المتجر (اختياري)
   * @returns كائن Product
   */
  private convertFirestoreDataToProduct(
    id: string,
    data: Record<string, any>,
    store?: Store,
  ): Product {
    const convertToDate = (timestamp: any): Date => {
      if (!timestamp) return new Date();
      if (timestamp.toDate) return timestamp.toDate();
      if (timestamp instanceof Date) return timestamp;
      return new Date(timestamp);
    };

    // ⭐ إنشاء دالة convertSemantics محلية
    const convertSemantics = (semanticsData: any): Product["_semantics"] => {
      if (!semanticsData) return undefined;

      const semantics: Product["_semantics"] = {
        productTypeId: semanticsData.productTypeId || undefined,
        detectedActivity: semanticsData.detectedActivity || undefined,
        confidenceScore: semanticsData.confidenceScore || 0,
        complianceStatus:
          semanticsData.complianceStatus || ComplianceStatus.PENDING_REVIEW,
        metadata: semanticsData.metadata || undefined,
        detectionMethod: semanticsData.detectionMethod || DetectionMethod.NONE,
        lastDetection: semanticsData.lastDetection
          ? convertToDate(semanticsData.lastDetection)
          : undefined,
        detectionLog: semanticsData.detectionLog || undefined,
        validationFlags: semanticsData.validationFlags || undefined,
        reviewedBy: semanticsData.reviewedBy || undefined,
        reviewedAt: semanticsData.reviewedAt
          ? convertToDate(semanticsData.reviewedAt)
          : undefined,
        exemptionReason: semanticsData.exemptionReason || undefined,
        shadowActions: semanticsData.shadowActions || undefined,
      };

      // ⭐ ⭐ ⭐ **التحديث المهم: نظام التوافق الذكي للمنتجات الزراعية**
      if (store && semantics.detectedActivity) {
        // استخراج أنشطة المتجر
        const storeActivities: string[] = [];
        // 1. من businessActivities الجديد
        if (store.businessActivities?.subActivities) {
          storeActivities.push(...store.businessActivities.subActivities);
        }
        // 2. من industry
        if (store.industry) {
          storeActivities.push(store.industry);
        }
        // 3. التحقق من التوافق
        const isCompatible = checkActivityCompatibility(
          semantics.detectedActivity,
          storeActivities,
        );
        if (isCompatible && semantics.detectedActivity === "agriculture") {
          semantics.complianceStatus = ComplianceStatus.COMPLIANT;
          // إزالة تحذير "غير مسجل للمتجر" من validationFlags
          if (semantics.validationFlags) {
            semantics.validationFlags = semantics.validationFlags.filter(
              (flag: string) => !flag.includes("غير مسجل للمتجر"),
            );
            // إزالة shadowActions إذا لم تعد هناك انتهاكات
            if (
              semantics.validationFlags.length === 0 &&
              semantics.shadowActions
            ) {
              semantics.shadowActions = undefined;
            }
          }
          console.log(`✅ تم تصحيح التوافق الزراعي: ${data.name}`, {
            detectedActivity: semantics.detectedActivity,
            storeActivities,
            storeName: store.name,
          });
        }
      }

      return semantics;
    };

    // ⭐ تحديث استدعاء convertSemantics
    const semantics = convertSemantics(data._semantics);

    return {
      id,
      storeId: data.storeId || "",
      ownerId: data.ownerId || "",
      name: data.name || "",
      description: data.description || "",
      shortDescription: data.shortDescription,
      category: data.category || "غير مصنف",
      subCategory: data.subCategory,
      _semantics: semantics, // ⭐ استخدام semantics المعدلة
      brand: data.brand,
      sku: data.sku || "",
      price: data.price || 0,
      comparePrice: data.comparePrice,
      costPrice: data.costPrice,
      discount: data.discount
        ? {
            ...data.discount,
            startDate: data.discount.startDate
              ? convertToDate(data.discount.startDate)
              : undefined,
            endDate: data.discount.endDate
              ? convertToDate(data.discount.endDate)
              : undefined,
          }
        : undefined,
      inventory: data.inventory || {
        quantity: 0,
        sku: "",
        trackInventory: true,
      },
      images: data.images || [],
      specifications: data.specifications || {},
      tags: data.tags || [],
      featured: data.featured || false,
      status: (data.status as ProductStatus) || ProductStatus.DRAFT,
      visibility: data.visibility,
      shipping: data.shipping,
      tax: data.tax,
      seo: data.seo || {
        title: "",
        description: "",
        keywords: [],
      },
      soldIndividually: data.soldIndividually,
      warranty: data.warranty,
      returnPolicy: data.returnPolicy,
      sizeGuide: data.sizeGuide,
      reviewsEnabled: data.reviewsEnabled,
      averageRating: data.averageRating,
      reviewCount: data.reviewCount,
      variants: data.variants || [],
      stats: data.stats || {
        views: 0,
        sales: 0,
        wishlistCount: 0,
      },
      createdAt: convertToDate(data.createdAt),
      updatedAt: convertToDate(data.updatedAt),
    };
  }

  /**
   * استخراج أنشطة المتجر
   * @param store كائن المتجر
   * @returns قائمة الأنشطة
   */
  private extractStoreActivities(store: Store): string[] {
    const activities: string[] = [];
    // 1. الأنشطة الرئيسية
    if (store.businessActivities?.mainActivity) {
      activities.push(store.businessActivities.mainActivity);
    }
    // 2. الأنشطة الفرعية
    if (store.businessActivities?.subActivities) {
      activities.push(...store.businessActivities.subActivities);
    }
    // 3. الصناعة
    if (store.industry && store.industry !== "general") {
      activities.push(store.industry);
    }
    // 4. الأنشطة القديمة
    if (store.customization) {
      if ("primaryBusinessType" in store.customization) {
        const oldActivity = (store.customization as any).primaryBusinessType;
        if (oldActivity && !activities.includes(oldActivity)) {
          activities.push(oldActivity);
        }
      }

      if ("subBusinessTypes" in store.customization) {
        const subTypes = (store.customization as any).subBusinessTypes || [];
        subTypes.forEach((type: string) => {
          if (!activities.includes(type)) {
            activities.push(type);
          }
        });
      }
    }

    // إرجاع الأنشطة فريدة
    return [...new Set(activities.map((a) => a.toLowerCase()))];
  }

  /**
   * تحديث إحصائيات امتثال المتجر
   * @param storeId معرف المتجر
   * @param isCompliant هل المنتج ممتثل؟
   * @param wasCompliant هل كان ممتثلًا سابقًا؟
   */
  private async updateStoreComplianceStats(
    storeId: string,
    isCompliant: boolean,
    wasCompliant?: boolean,
  ): Promise<void> {
    try {
      const store = await storeService.getById(storeId);
      if (!store) return;

      const currentStats = store.complianceStats || {
        totalProducts: 0,
        compliantProducts: 0,
        flaggedProducts: 0,
        lastCheck: new Date(),
        complianceRate: 100,
      };

      let newTotal = currentStats.totalProducts + 1;
      let newCompliant = currentStats.compliantProducts;
      let newFlagged = currentStats.flaggedProducts;

      if (isCompliant) {
        newCompliant += 1;
      } else {
        newFlagged += 1;
      }
      if (wasCompliant !== undefined) {
        newTotal -= 1;
        if (wasCompliant) {
          newCompliant -= 1;
        } else {
          newFlagged -= 1;
        }
      }

      const newRate = newTotal > 0 ? (newCompliant / newTotal) * 100 : 100;

      await storeService.update(storeId, {
        complianceStats: {
          totalProducts: newTotal,
          compliantProducts: newCompliant,
          flaggedProducts: newFlagged,
          lastCheck: new Date(),
          complianceRate: newRate,
        },
      });
    } catch (error) {
      console.error("❌ خطأ في تحديث إحصائيات المتجر:", error);
    }
  }

  /**
   * تحديث إحصائيات المتجر عند حذف منتج
   * @param storeId معرف المتجر
   * @param wasCompliant هل كان المنتج ممتثلاً؟
   */
  private async updateStoreComplianceStatsOnDelete(
    storeId: string,
    wasCompliant: boolean,
  ): Promise<void> {
    try {
      const store = await storeService.getById(storeId);
      if (!store || !store.complianceStats) return;

      const stats = store.complianceStats;
      const newTotal = Math.max(0, stats.totalProducts - 1);
      const newCompliant = wasCompliant
        ? Math.max(0, stats.compliantProducts - 1)
        : stats.compliantProducts;
      const newFlagged = !wasCompliant
        ? Math.max(0, stats.flaggedProducts - 1)
        : stats.flaggedProducts;
      const newRate = newTotal > 0 ? (newCompliant / newTotal) * 100 : 100;

      await storeService.update(storeId, {
        complianceStats: {
          totalProducts: newTotal,
          compliantProducts: newCompliant,
          flaggedProducts: newFlagged,
          lastCheck: new Date(),
          complianceRate: newRate,
        },
      });
    } catch (error) {
      console.error("❌ خطأ في تحديث إحصائيات المتجر بعد الحذف:", error);
    }
  }

  /**
   * تسجيل أحداث المنتج
   * @param productId معرف المنتج
   * @param eventType نوع الحدث
   * @param data بيانات إضافية
   */
  private async logProductEvent(
    productId: string,
    eventType: "create" | "update" | "delete" | "compliance_check",
    data: any,
  ): Promise<void> {
    try {
      const eventLog = {
        productId,
        eventType,
        timestamp: new Date().toISOString(),
        ...data,
      };

      console.log(`📝 حدث منتج: ${eventType}`, eventLog);
    } catch (error) {
      // تجاهل الأخطاء في التسجيل
    }
  }

  /**
   * الحصول على نوع المنتج الافتراضي حسب النوع الأساسي
   * @param kind نوع المنتج الأساسي
   * @param store بيانات المتجر (اختياري)
   * @returns نوع المنتج الافتراضي
   */
  private getDefaultProductTypeForKind(
    kind: ProductKind,
    store?: Store,
  ): ProductType {
    const kindInfo = PRODUCT_KINDS[kind];

    console.log("🔍 البحث عن النوع الافتراضي:", {
      kind: kindInfo.name,
      storeIndustry: store?.industry,
    });

    if (store?.industry === "agriculture" && kind === ProductKind.PHYSICAL) {
      const agricultureType = DEFAULT_PRODUCT_TYPES.find(
        (pt) =>
          pt.activityId === "agriculture" || pt.id === "pt_agriculture_011",
      );
      if (agricultureType) {
        console.log("✅ استخدام نوع منتج زراعي بناءً على نشاط المتجر");
        return agricultureType;
      }
    }

    const agricultureActivities = [
      "agriculture",
      "livestock",
      "fisheries",
      "food_processing",
    ];

    if (store?.industry && agricultureActivities.includes(store.industry)) {
      const agricultureCompatible = DEFAULT_PRODUCT_TYPES.find((pt) => {
        const isAgricultureRelated = agricultureActivities.includes(
          pt.activityId,
        );
        return (
          isAgricultureRelated &&
          kindInfo.suggestedActivities.includes(pt.activityId)
        );
      });

      if (agricultureCompatible) {
        console.log("🌱 استخدام نوع زراعي متوافق:", agricultureCompatible.name);
        return agricultureCompatible;
      }
    }

    const compatibleType = DEFAULT_PRODUCT_TYPES.find((pt) =>
      kindInfo.suggestedActivities.includes(pt.activityId),
    );

    if (compatibleType) {
      console.log("✅ استخدام نوع متوافق مع kind:", compatibleType.name);
      return compatibleType;
    }

    console.log("ℹ️ استخدام نوع افتراضي للـ kind");

    switch (kind) {
      case ProductKind.PHYSICAL:
        return (
          DEFAULT_PRODUCT_TYPES.find((pt) => pt.id === "pt_clothing_002") ||
          DEFAULT_PRODUCT_TYPES[0]
        );
      case ProductKind.SERVICE:
        return (
          DEFAULT_PRODUCT_TYPES.find((pt) => pt.id === "pt_books_006") ||
          DEFAULT_PRODUCT_TYPES[0]
        );
      case ProductKind.FOOD:
        return (
          DEFAULT_PRODUCT_TYPES.find((pt) => pt.id === "pt_food_003") ||
          DEFAULT_PRODUCT_TYPES[0]
        );
      case ProductKind.DIGITAL:
        return (
          DEFAULT_PRODUCT_TYPES.find((pt) => pt.id === "pt_books_006") ||
          DEFAULT_PRODUCT_TYPES[0]
        );
      default:
        return DEFAULT_PRODUCT_TYPES[0];
    }
  }

  /**
   * التحقق إذا كان المتجر زراعي
   * @param store كائن المتجر
   * @returns true إذا كان المتجر زراعي
   */
  private isStoreAgricultural(store: Store): boolean {
    const storeActivities = this.extractStoreActivities(store);
    // التحقق من الأنشطة الزراعية
    const agricultureKeywords = [
      "agricultur",
      "زراع",
      "مزارع",
      "محاصيل",
      "بذور",
      "اسمدة",
      "مبيدات",
      "مواشي",
      "دواجن",
      "أسماك",
      "ثروة",
      "نبات",
      "فلاح",
      "محصول",
      "شتل",
    ];

    const hasAgriculture = storeActivities.some((activity) =>
      agricultureKeywords.some((keyword) =>
        activity.toLowerCase().includes(keyword.toLowerCase()),
      ),
    );

    // التحقق من الصناعة
    const hasAgricultureIndustry =
      store.industry?.toLowerCase().includes("agricultur") || false;

    // التحقق من الأنشطة القديمة
    const hasOldAgriculture = this.checkOldAgricultureActivities(store);

    const result =
      hasAgriculture || hasAgricultureIndustry || hasOldAgriculture;

    console.log(`🔍 فحص النشاط الزراعي للمتجر ${store.name}:`, {
      storeActivities,
      hasAgriculture,
      hasAgricultureIndustry,
      hasOldAgriculture,
      result,
    });

    return result;
  }

  /**
   * التحقق من الأنشطة الزراعية القديمة
   * @param store كائن المتجر
   * @returns true إذا كان لديه أنشطة زراعية قديمة
   */
  private checkOldAgricultureActivities(store: Store): boolean {
    if (!store.customization) return false;

    let hasAgriculture = false;
    // التحقق من primaryBusinessType القديم
    if ("primaryBusinessType" in store.customization) {
      const oldType = (store.customization as any).primaryBusinessType;
      if (oldType && oldType.toLowerCase().includes("agricultur")) {
        hasAgriculture = true;
      }
    }
    // التحقق من subBusinessTypes القديم
    if ("subBusinessTypes" in store.customization) {
      const subTypes = (store.customization as any).subBusinessTypes || [];
      const agricultureSubTypes = [
        "agricultural-products",
        "livestock",
        "agricultural-tools",
        "seeds-fertilizers",
        "fisheries",
      ];

      if (subTypes.some((type: string) => agricultureSubTypes.includes(type))) {
        hasAgriculture = true;
      }
    }

    return hasAgriculture;
  }

  /**
   * إنشاء منتج جديد
   * @param productData بيانات المنتج
   * @param options خيارات إضافية
   * @returns نتيجة الإنشاء مع قرار الامتثال
   */
  async create(
    productData: any,
    options?: {
      forceProductTypeId?: string;
      skipCompliance?: boolean;
      skipKindValidation?: boolean;
    },
  ): Promise<{
    id: string;
    decision: ComplianceDecision;
    status: ProductStatus;
    warnings: string[];
    detectedActivity?: string;
    productType?: {
      id: string;
      name: string;
      activityId: string;
    };
    shadowActions?: {
      hideFromStore?: boolean;
      hideFromSearch?: boolean;
      limitPurchase?: boolean;
    };
    kind: ProductKind;
  }> {
    try {
      // 🔥 سجل تشخيصي مفصل للبيانات الواردة
      console.log("🚀 productService.create - البيانات المستلمة:", {
        // معلومات أساسية
        name: productData.name,
        kind: productData.kind,
        storeId: productData.storeId,

        // 🔍 تحقق من وجود metadata
        hasMetadata: "metadata" in productData,
        metadataType: typeof productData.metadata,
        metadataValue: productData.metadata,

        // 🔍 تحقق من الزراعة في metadata
        hasAgricultureData: productData.metadata?.agricultureSpecific
          ? true
          : false,
        agricultureFields: productData.metadata?.agricultureSpecific
          ? Object.keys(productData.metadata.agricultureSpecific)
          : [],

        // 🔍 تحقق من كامل الكائن
        totalKeys: Object.keys(productData).length,
        sampleKeys: Object.keys(productData).slice(0, 5),

        // 🔍 تحقق من قيم محددة
        agricultureTypeValue:
          productData.metadata?.agricultureSpecific?.agricultureType ||
          "غير موجود",
        isOrganicValue:
          productData.metadata?.agricultureSpecific?.isOrganic || "غير موجود",
        certificationValue:
          productData.metadata?.agricultureSpecific?.certification ||
          "غير موجود",
      });

      // 🔧 تحسين: تأكد من بنية metadata إذا كانت موجودة
      if (productData.metadata && typeof productData.metadata === "object") {
        console.log("📊 بنية metadata الأصلية:", {
          keys: Object.keys(productData.metadata),
          agricultureSpecific: productData.metadata.agricultureSpecific,
          agricultureSpecificType:
            typeof productData.metadata.agricultureSpecific,
          isAgricultureSpecificObject:
            typeof productData.metadata.agricultureSpecific === "object",
          agricultureSpecificKeys: productData.metadata.agricultureSpecific
            ? Object.keys(productData.metadata.agricultureSpecific)
            : [],
        });
      }

      console.log("🚀 بدء إنشاء منتج بالنظام الجديد مع kind:", {
        name: productData.name,
        kind: productData.kind,
        storeId: productData.storeId,
      });

      // 🔍 التحقق من وجود kind
      if (!productData.kind) {
        throw new Error("يجب تحديد نوع المنتج الأساسي");
      }

      const kindInfo = PRODUCT_KINDS[productData.kind as ProductKind];
      if (!kindInfo) {
        throw new Error("نوع المنتج غير معروف");
      }

      // 🔍 التحقق من صحة البيانات حسب النوع (ما لم يتم تخطي التحقق)
      if (!options?.skipKindValidation) {
        const validation = complianceSystem.validateProductDataByKind(
          productData,
          productData.kind as ProductKind,
        );

        if (!validation.isValid) {
          throw new Error(`بيانات غير صالحة: ${validation.errors.join(", ")}`);
        }

        if (validation.warnings.length > 0) {
          console.log("⚠️ تحذيرات التحقق:", validation.warnings);
        }
      }

      // 🔍 الحصول على بيانات المتجر
      const store = await storeService.getById(productData.storeId);
      if (!store) {
        throw new Error("المتجر غير موجود");
      }

      // 🔍 تنظيف البيانات
      const sanitizedData = complianceSystem.sanitizeProductData(productData);

      // 🔍 تحديد نوع المنتج التفصيلي
      let productType: ProductType | undefined;
      let detectionResult: ProductTypeDetection | null = null;

      if (options?.forceProductTypeId) {
        productType = DEFAULT_PRODUCT_TYPES.find(
          (pt) => pt.id === options.forceProductTypeId,
        );
        if (!productType) {
          throw new Error(`نوع المنتج ${options.forceProductTypeId} غير معروف`);
        }
        console.log("✅ استخدام نوع منتج محدد:", productType.name);
      } else {
        // اكتشاف النوع التفصيلي مع مراعاة kind
        detectionResult = await complianceSystem.detectDetailedProductType(
          sanitizedData,
          productData.kind as ProductKind,
        );
        productType = detectionResult?.productType || undefined;

        if (productType) {
          console.log("✅ تم كشف نوع المنتج تلقائياً:", {
            name: productType.name,
            confidence: detectionResult?.confidence,
            kind: productData.kind,
          });
        } else {
          // استخدام النوع الافتراضي المناسب لل kind
          const defaultType = this.getDefaultProductTypeForKind(
            productData.kind as ProductKind,
          );
          productType = defaultType;
          console.log("ℹ️ استخدام نوع منتج افتراضي:", productType?.name);
        }
      }

      // 🔍 بناء semantics مع kind
      const semantics = await complianceSystem.buildProductSemanticsWithKind(
        sanitizedData,
        productData.kind as ProductKind,
        store,
        productType,
      );

      // 🔍 اتخاذ قرار الامتثال
      let complianceDecision: ComplianceCheckResult;

      if (options?.skipCompliance) {
        complianceDecision = {
          decision: ComplianceDecision.ALLOW,
          complianceStatus: ComplianceStatus.COMPLIANT,
          productStatus: ProductStatus.ACTIVE,
          violations: [],
          warnings: [],
          suggestedActions: [],
        };
      } else {
        complianceDecision = await complianceSystem.makeComplianceDecision(
          sanitizedData,
          productType,
          store,
        );
      }

      // 🔍 معالجة الخصومات
      let finalPrice = sanitizedData.price;
      let finalComparePrice = sanitizedData.comparePrice;

      if (sanitizedData.discount && sanitizedData.discount.isActive) {
        const { type, value } = sanitizedData.discount;

        switch (type) {
          case "percentage":
            finalPrice = sanitizedData.price * (1 - value / 100);
            finalComparePrice = sanitizedData.price;
            break;
          case "fixed":
            finalPrice = sanitizedData.price - value;
            finalComparePrice = sanitizedData.price;
            break;
        }
      }

      // 🔍 إعداد بيانات المنتج النهائية
      const productToSave = {
        ...productData,
        _semantics: semantics,
        price: finalPrice,
        comparePrice: finalComparePrice,
        status: complianceDecision.productStatus,
        createdAt: serverTimestamp(), // ⭐ استبدل new Date()
        updatedAt: serverTimestamp(), // ⭐ استبدل new Date()
        // ⭐ إضافة تحقق إضافي
        _createdMethod: "product_service",
        _creationTime: new Date().toISOString(), // كنترول إضافي
      };

      // 🔥 السجل التشخيصي قبل التنظيف
      console.log("🔍 البيانات قبل cleanFirestoreData:", {
        hasMetadata: "metadata" in productToSave,
        metadata: productToSave.metadata,
        metadataType: typeof productToSave.metadata,
        isMetadataObject: typeof productToSave.metadata === "object",
        agricultureSpecific: productToSave.metadata?.agricultureSpecific,
        agricultureType:
          productToSave.metadata?.agricultureSpecific?.agricultureType,
        agricultureFields: productToSave.metadata?.agricultureSpecific
          ? Object.keys(productToSave.metadata.agricultureSpecific)
          : [],
        // تأكد من بنية metadata
        metadataKeys: productToSave.metadata
          ? Object.keys(productToSave.metadata)
          : [],
        metadataHasAgricultureSpecific:
          productToSave.metadata?.agricultureSpecific !== undefined,
      });

      // 🔍 تنظيف البيانات لل Firestore
      const cleanedData = cleanFirestoreData(productToSave);

      // ⭐ تأكد من أن createdAt موجود
      if (!cleanedData.createdAt) {
        console.log("⚠️ createdAt مفقود بعد التنظيف، إضافته...");
        cleanedData.createdAt = serverTimestamp();
        cleanedData._fixedCreatedAt = true;
      }

      console.log("✅ البيانات قبل الحفظ:", {
        hasCreatedAt: "createdAt" in cleanedData,
        createdAtType: cleanedData.createdAt?.constructor?.name,
      });

      // 🔥 السجل التشخيصي بعد التنظيف
      console.log("🔍 البيانات بعد cleanFirestoreData:", {
        hasMetadata: "metadata" in cleanedData,
        metadata: cleanedData?.metadata,
        metadataType: typeof cleanedData?.metadata,
        isMetadataObject: typeof cleanedData?.metadata === "object",
        agricultureSpecific: cleanedData?.metadata?.agricultureSpecific,
        agricultureType:
          cleanedData?.metadata?.agricultureSpecific?.agricultureType,
        agricultureFields: cleanedData?.metadata?.agricultureSpecific
          ? Object.keys(cleanedData.metadata.agricultureSpecific)
          : [],
        // تأكد من بنية metadata المخزنة
        metadataKeys: cleanedData?.metadata
          ? Object.keys(cleanedData.metadata)
          : [],
        metadataHasAgricultureSpecific:
          cleanedData?.metadata?.agricultureSpecific !== undefined,
        // تحقق من فقدان البيانات
        metadataLost:
          !("metadata" in cleanedData) && "metadata" in productToSave,
        agricultureSpecificLost:
          !cleanedData?.metadata?.agricultureSpecific &&
          productToSave.metadata?.agricultureSpecific,
      });

      // 🔧 إذا فقدت metadata، أعدها يدوياً
      let finalData = cleanedData;
      if (!cleanedData?.metadata && productToSave.metadata) {
        console.log("⚠️ metadata مفقودة بعد التنظيف، إضافتها يدوياً...");
        finalData = {
          ...cleanedData,
          metadata: productToSave.metadata,
        };
      }

      console.log("📤 البيانات المرسلة إلى Firestore:", {
        name: finalData.name,
        kind: finalData.kind,
        storeId: finalData.storeId,
        hasMetadata: "metadata" in finalData,
        metadataKeys: finalData.metadata ? Object.keys(finalData.metadata) : [],
        agricultureSpecificExists: !!finalData.metadata?.agricultureSpecific,
        agricultureSpecificKeys: finalData.metadata?.agricultureSpecific
          ? Object.keys(finalData.metadata.agricultureSpecific)
          : [],
      });

      // 🔍 حفظ المنتج في Firestore
      const docRef = await addDoc(collection(db, "products"), finalData);
      const productId = docRef.id;

      console.log("📝 تم إنشاء المنتج في Firestore مع ID:", productId);

      try {
        // انتظر قليلاً للتأكد من الحفظ
        await new Promise((resolve) => setTimeout(resolve, 800));

        // جلب البيانات المخزنة للتأكد - التصحيح هنا
        const savedDoc = await getDoc(docRef); // استخدم getDoc بدلاً من docRef.get()
        const savedData = savedDoc.data();

        console.log("🔍 التحقق من البيانات المخزنة فعلياً في Firestore:", {
          documentId: savedDoc.id,
          documentExists: savedDoc.exists(),
          // البيانات الأساسية
          name: savedData?.name,
          kind: savedData?.kind,
          storeId: savedData?.storeId,
          // التحقق من metadata
          hasMetadataInStored: "metadata" in savedData,
          storedMetadata: savedData?.metadata,
          storedMetadataType: typeof savedData?.metadata,
          // التحقق من agricultureSpecific
          hasAgricultureSpecific: !!savedData?.metadata?.agricultureSpecific,
          agricultureSpecific: savedData?.metadata?.agricultureSpecific,
          agricultureType:
            savedData?.metadata?.agricultureSpecific?.agricultureType,
          // قائمة كاملة بالحقول المحفوظة
          allStoredKeys: savedData ? Object.keys(savedData).sort() : [],
          // تحقق من فقدان metadata
          metadataMissing: !("metadata" in savedData),
          // مقارنة مع البيانات المرسلة
          metadataSent: "metadata" in finalData,
          agricultureSpecificSent: finalData.metadata?.agricultureSpecific,
        });

        if (!("metadata" in savedData) && finalData.metadata) {
          console.log(
            "⚠️ metadata غير موجودة في البيانات المخزنة، محاولة التحديث اليدوي...",
          );
          await updateDoc(docRef, {
            metadata: finalData.metadata,
          });
          console.log("✅ تم تحديث metadata يدوياً");
        }
      } catch (error) {
        console.error("❌ خطأ في التحقق من البيانات المخزنة:", error);
      }

      await this.updateStoreComplianceStats(
        productData.storeId,
        complianceDecision.decision === ComplianceDecision.ALLOW,
      );

      if (
        complianceDecision.decision === ComplianceDecision.REVIEW_REQUIRED ||
        complianceDecision.decision === ComplianceDecision.BLOCK
      ) {
        await complianceSystem.handleComplianceViolation(
          productId,
          productData.storeId,
          complianceDecision.decision === ComplianceDecision.BLOCK
            ? "blocked_product"
            : "review_required",
          {
            violations: complianceDecision.violations,
            severity:
              complianceDecision.decision === ComplianceDecision.BLOCK
                ? "high"
                : "medium",
            productName: sanitizedData.name,
            detectedActivity: semantics.detectedActivity,
            productType: productType?.name,
            productKind: productData.kind,
            storeActivities: store.businessActivities?.subActivities || [],
            decision: complianceDecision.decision,
          },
        );
      }

      await this.logProductEvent(productId, "create", {
        name: sanitizedData.name,
        kind: productData.kind,
        price: finalPrice,
        decision: complianceDecision.decision,
        productType: productType?.name,
        detectedActivity: semantics.detectedActivity,
      });

      console.log("✅ تم إنشاء المنتج بنجاح:", {
        id: productId,
        name: sanitizedData.name,
        kind: productData.kind,
        store: store.name,
        decision: complianceDecision.decision,
        productType: productType?.name,
        // 🔍 تأكد من حفظ البيانات الزراعية
        hasMetadataInResult: "metadata" in productToSave,
        metadataSaved: "metadata" in finalData,
        agricultureSpecificSaved: !!finalData.metadata?.agricultureSpecific,
      });

      // 🔍 إرجاع النتيجة
      return {
        id: productId,
        decision: complianceDecision.decision,
        status: complianceDecision.productStatus,
        warnings: complianceDecision.warnings,
        detectedActivity: semantics.detectedActivity,
        productType: productType
          ? {
              id: productType.id,
              name: productType.name,
              activityId: productType.activityId,
            }
          : undefined,
        shadowActions: complianceDecision.shadowActions,
        kind: productData.kind as ProductKind,
      };
    } catch (error: any) {
      console.error("❌ خطأ في إنشاء المنتج:", {
        message: error.message,
        stack: error.stack,
        productData: {
          name: productData?.name,
          kind: productData?.kind,
          hasMetadata: productData?.metadata ? true : false,
        },
      });
      throw new Error(`فشل إنشاء المنتج: ${error.message}`);
    }
  }

  /**
   * تحديث منتج موجود
   * @param productId معرف المنتج
   * @param data البيانات الجديدة
   * @param options خيارات إضافية
   * @returns نتيجة التحديث
   */
  async update(
    productId: string,
    data: Partial<Product>,
    options?: {
      forceProductTypeId?: string;
      skipCompliance?: boolean;
      preserveStatus?: boolean; // ⭐ إضافة خيار جديد
    },
  ): Promise<{
    success: boolean;
    decision?: ComplianceDecision;
    status?: ProductStatus;
    warnings: string[];
    detectedActivity?: string;
    productType?: {
      id: string;
      name: string;
      activityId: string;
    };
  }> {
    try {
      console.log("🔄 تحديث المنتج:", productId, {
        dataStatus: data.status,
        options,
      });

      const currentProduct = await this.getById(productId);
      if (!currentProduct) {
        throw new Error("المنتج غير موجود");
      }

      const sanitizedData = complianceSystem.sanitizeProductData(data);
      delete sanitizedData.businessType;
      delete sanitizedData.subBusinessType;

      sanitizedData.storeId = currentProduct.storeId;
      sanitizedData.ownerId = currentProduct.ownerId;

      const store = await storeService.getById(currentProduct.storeId);
      if (!store) {
        throw new Error("المتجر غير موجود");
      }

      const updatedProduct = { ...currentProduct, ...sanitizedData };
      let productType: ProductType | undefined;

      if (options?.forceProductTypeId) {
        productType = DEFAULT_PRODUCT_TYPES.find(
          (pt) => pt.id === options.forceProductTypeId,
        );
      } else if (currentProduct._semantics?.productTypeId) {
        productType = DEFAULT_PRODUCT_TYPES.find(
          (pt) => pt.id === currentProduct._semantics?.productTypeId,
        );
      }

      // 🔹 إعادة بناء semantics
      const semantics = await complianceSystem.buildProductSemantics(
        updatedProduct,
        store,
        productType,
      );

      let complianceDecision: ComplianceCheckResult;
      if (options?.skipCompliance) {
        complianceDecision = {
          decision: ComplianceDecision.ALLOW,
          complianceStatus: ComplianceStatus.COMPLIANT,
          productStatus: data.status || currentProduct.status, // ⭐ التعديل هنا
          violations: [],
          warnings: [],
          suggestedActions: [],
        };
      } else {
        complianceDecision = await complianceSystem.makeComplianceDecision(
          updatedProduct,
          productType,
          store,
        );
      }

      // ⭐ ⭐ ⭐ **التعديل المهم: أولوية حالة المنتج من البيانات المدخلة**
      const finalStatus =
        options?.preserveStatus && data.status
          ? data.status // ⭐ حالة المستخدم أولاً
          : complianceDecision.productStatus; // ⭐ ثم قرار الامتثال

      console.log("🎯 تحديد الحالة النهائية:", {
        dataStatus: data.status,
        complianceStatus: complianceDecision.productStatus,
        finalStatus,
        preserveStatus: options?.preserveStatus,
      });

      const updateData = {
        ...sanitizedData,
        _semantics: semantics,
        status: finalStatus, // ⭐ استخدام الحالة النهائية
        updatedAt: Timestamp.now(),
      };

      // ⭐ تأكد من إزالة الحقول غير الضرورية
      delete (updateData as any).id;
      delete (updateData as any).storeId;
      delete (updateData as any).ownerId;

      await updateDoc(
        doc(db, "products", productId),
        cleanFirestoreData(updateData),
      );

      if (currentProduct.status !== finalStatus) {
        const wasCompliant =
          currentProduct._semantics?.complianceStatus ===
          ComplianceStatus.COMPLIANT;
        const isCompliant =
          complianceDecision.decision === ComplianceDecision.ALLOW;

        if (wasCompliant !== isCompliant) {
          await this.updateStoreComplianceStats(
            currentProduct.storeId,
            isCompliant,
            wasCompliant,
          );
        }
      }

      await this.logProductEvent(productId, "update", {
        decision: complianceDecision.decision,
        newStatus: finalStatus,
        oldStatus: currentProduct.status,
        userSelectedStatus: data.status,
      });

      return {
        success: true,
        decision: complianceDecision.decision,
        status: finalStatus, // ⭐ إرجاع الحالة النهائية
        warnings: complianceDecision.warnings,
        detectedActivity: semantics.detectedActivity,
        productType: productType
          ? {
              id: productType.id,
              name: productType.name,
              activityId: productType.activityId,
            }
          : undefined,
      };
    } catch (error: any) {
      console.error("❌ خطأ في تحديث المنتج:", error.message);
      throw error;
    }
  }

  /**
   * جلب منتج بواسطة المعرف
   * @param productId معرف المنتج
   * @returns بيانات المنتج أو null
   */
  async getById(productId: string): Promise<Product | null> {
    try {
      const docSnap = await getDoc(doc(db, "products", productId));
      if (docSnap.exists()) {
        const data = docSnap.data() as Record<string, any>;
        return this.convertFirestoreDataToProduct(docSnap.id, data);
      }
      return null;
    } catch (error) {
      console.error("❌ خطأ في جلب المنتج:", error);
      return null;
    }
  }

  /**
   * جلب منتجات المتجر
   * @param storeId معرف المتجر
   * @param status حالة المنتج
   * @param filters عوامل التصفية
   * @returns قائمة المنتجات
   */
  async getByStore(
    storeId: string,
    status: "active" | "all" | "draft" | "under_review" = "active",
    filters?: {
      complianceStatus?: ComplianceStatus;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      productTypeId?: string;
    },
  ): Promise<Product[]> {
    try {
      console.log(
        `🔍 [getByStore] جلب منتجات المتجر: ${storeId}, الحالة: ${status}`,
      );
      console.log(`🔍 [getByStore] جلب بيانات المتجر: ${storeId}`);
      const store = await storeService.getById(storeId);
      console.log(`✅ [getByStore] بيانات المتجر:`, {
        id: store?.id,
        name: store?.name,
        hasCustomization: !!store?.customization,
        // ⭐ استخدام الخصائص الصحيحة من Store
        mainActivity: store?.businessActivities?.mainActivity,
        subActivities: store?.businessActivities?.subActivities,
        industry: store?.industry,
        businessActivities: store?.businessActivities,
      });

      const constraints: any[] = [where("storeId", "==", storeId)];

      // ⭐ ⭐ ⭐ **إصلاح: استخدام القيم الصحيحة من ProductStatus**
      if (status === "active") {
        constraints.push(where("status", "==", ProductStatus.ACTIVE));
      } else if (status === "draft") {
        constraints.push(where("status", "==", ProductStatus.DRAFT));
      } else if (status === "under_review") {
        constraints.push(where("status", "==", ProductStatus.UNDER_REVIEW));
      } else if (status === "all") {
        console.log(
          "📋 [getByStore] حالة 'all' - جلب جميع المنتجات بجميع الحالات",
        );
        // لا تضيف قيد للحالة
      }

      const allProductsQuery = query(
        collection(db, "products"),
        where("storeId", "==", storeId),
      );
      const allProductsSnapshot = await getDocs(allProductsQuery);
      console.log("🔍 [getByStore] استعلام بدون قيود:", {
        totalWithoutConstraints: allProductsSnapshot.docs.length,
        allStatuses: allProductsSnapshot.docs.slice(0, 10).map((doc) => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            name: data.name,
            status: data.status,
            hasStatus: !!data.status,
            hasCreatedAt: !!data.createdAt,
            createdAt: data.createdAt,
          };
        }),
      });

      let q;
      if (status === "all") {
        // ⭐ للحالة "all": لا تستخدم orderBy مؤقتاً
        q = query(collection(db, "products"), ...constraints);
        console.log(
          "🔄 [getByStore] استخدام استعلام بدون orderBy للحالة 'all'",
        );
      } else {
        q = query(
          collection(db, "products"),
          ...constraints,
          orderBy("createdAt", "desc"),
        );
      }

      console.log("🔍 [getByStore] تنفيذ الاستعلام مع القيود...");

      const querySnapshot = await getDocs(q);
      const statusBreakdown = {
        active: 0,
        draft: 0,
        under_review: 0,
        suspended: 0,
        noStatus: 0,
        emptyStatus: 0,
        nullStatus: 0,
        inactive: 0,
      };

      let hasCreatedAt = 0;
      let missingCreatedAt = 0;
      const missingCreatedAtSamples: any[] = [];

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data() as Record<string, any>;
        if (data.status === "active") statusBreakdown.active++;
        else if (data.status === "draft") statusBreakdown.draft++;
        else if (data.status === "under_review") statusBreakdown.under_review++;
        else if (data.status === "suspended") statusBreakdown.suspended++;
        else if (data.status === "inactive") statusBreakdown.inactive++;
        else if (!data.status) statusBreakdown.noStatus++;
        else if (data.status === "") statusBreakdown.emptyStatus++;
        else if (data.status === null) statusBreakdown.nullStatus++;

        // حساب createdAt
        if (data.createdAt) hasCreatedAt++;
        else {
          missingCreatedAt++;
          if (missingCreatedAtSamples.length < 3) {
            missingCreatedAtSamples.push({
              id: doc.id,
              name: data.name,
              status: data.status,
            });
          }
        }
      });

      console.log("🔍 [getByStore] تحقق مفصل من حالات المنتجات:", {
        total: querySnapshot.docs.length,
        statusBreakdown,
        hasCreatedAt,
        missingCreatedAt,
        missingCreatedAtSamples,
      });

      const products: Product[] = [];

      for (const doc of querySnapshot.docs) {
        try {
          const productData = doc.data() as Record<string, any>;

          if (
            !productData.status ||
            productData.status === "" ||
            productData.status === null
          ) {
            console.warn(`⚠️ [getByStore] منتج بدون حالة: ${doc.id}`, {
              name: productData.name,
              hasStatusField: "status" in productData,
              statusValue: productData.status,
            });
          }

          if (!productData.createdAt) {
            console.warn(`⚠️ [getByStore] منتج بدون createdAt: ${doc.id}`, {
              name: productData.name,
              status: productData.status,
              hasCreatedAtField: "createdAt" in productData,
            });
          }

          const product = this.convertFirestoreDataToProduct(
            doc.id,
            productData,
            store,
          );
          products.push(product);

          if (product._semantics?.detectedActivity === "agriculture") {
            const storeActivities = this.extractStoreActivities(store);
            const isCompatible = checkActivityCompatibility(
              "agriculture",
              storeActivities,
            );

            console.log(`🌱 منتج زراعي: ${product.name}`, {
              complianceStatus: product._semantics.complianceStatus,
              storeHasAgriculture: storeActivities.some((a) =>
                a.includes("agricultur"),
              ),
              storeMainActivity: store?.businessActivities?.mainActivity,
              storeSubActivities: store?.businessActivities?.subActivities,
              storeIndustry: store?.industry,
              isCompatible,
              agricultureActivities: storeActivities.filter(
                (a) =>
                  a.includes("agricultur") ||
                  a.includes("زراع") ||
                  a.includes("بذور"),
              ),
              // التوصية
              recommendation: isCompatible
                ? "✅ المنتج متوافق مع نشاط المتجر"
                : "⚠️ يحتاج إضافة نشاط زراعي",
            });

            if (
              isCompatible &&
              product._semantics.complianceStatus ===
                ComplianceStatus.NON_COMPLIANT
            ) {
              console.log(
                `🔄 ${product.name}: تم اكتشاف عدم تطابق - يجب تحديث حالة الامتثال`,
              );
            }
          }
        } catch (error) {
          console.error(`❌ خطأ في تحويل المنتج ${doc.id}:`, error);
          // ⭐ ⭐ ⭐ **إضافة: إنشاء منتج أساسي إذا فشل التحويل**
          const data = doc.data() as Record<string, any>;
          const basicProduct: Product = {
            id: doc.id,
            name: data.name || "",
            description: data.description || "",
            price: data.price || 0,
            category: data.category || "",
            subCategory: data.subCategory || "",
            tags: data.tags || [],
            images: data.images || [],
            inventory: data.inventory || { quantity: 0, lowStockThreshold: 10 },
            status: data.status || "active",
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            storeId: data.storeId || storeId,
            ownerId: data.ownerId || "",
            sku: data.sku || "",
            featured: data.featured || false,
            seo: data.seo || { title: "", description: "", keywords: [] },
            _semantics: data._semantics,
          } as Product;
          products.push(basicProduct);
        }
      }

      console.log(`✅ [getByStore] تحويل ${products.length} منتج بنجاح`);

      const missingProducts = allProductsSnapshot.docs
        .filter((doc) => {
          const data = doc.data() as Record<string, any>;
          return !products.some((p) => p.id === doc.id);
        })
        .slice(0, 10);

      console.log("🔍 [getByStore] مقارنة مع جميع المنتجات:", {
        allProductsCount: allProductsSnapshot.docs.length,
        filteredProductsCount: products.length,
        difference: allProductsSnapshot.docs.length - products.length,
        missingProductsCount: missingProducts.length,
        missingProducts: missingProducts.map((doc) => {
          const data = doc.data() as Record<string, any>;
          return {
            id: doc.id,
            name: data.name,
            status: data.status,
            hasStatus: !!data.status,
            statusValue: data.status,
            hasCreatedAt: !!data.createdAt,
            createdAt: data.createdAt,
            price: data.price,
            category: data.category,
            storeId: data.storeId,
          };
        }),
      });

      return products;
    } catch (error) {
      console.error("❌ خطأ في جلب منتجات المتجر:", error);
      return [];
    }
  }

  /**
   * البحث في منتجات المتجر
   * @param storeId معرف المتجر
   * @param searchTerm مصطلح البحث
   * @returns قائمة المنتجات المطابقة
   */
  async search(storeId: string, searchTerm: string): Promise<Product[]> {
    try {
      // الحصول على جميع منتجات المتجر النشطة
      const products = await this.getByStore(storeId, "active");
      // تطبيق البحث يدوياً
      return products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          ) ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    } catch (error) {
      console.error("❌ خطأ في البحث:", error);
      return [];
    }
  }

  /**
   * حذف منتج
   * @param productId معرف المنتج
   * @returns نتيجة الحذف
   */
  async delete(
    productId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const product = await this.getById(productId);
      if (!product) {
        return { success: false, message: "المنتج غير موجود" };
      }

      // تحديث إحصائيات المتجر
      await this.updateStoreComplianceStatsOnDelete(
        product.storeId,
        product._semantics?.complianceStatus === ComplianceStatus.COMPLIANT,
      );

      // حذف المنتج
      await deleteDoc(doc(db, "products", productId));

      // تسجيل الحدث
      await this.logProductEvent(productId, "delete", {
        name: product.name,
        storeId: product.storeId,
      });

      return { success: true, message: "تم حذف المنتج بنجاح" };
    } catch (error: any) {
      console.error("❌ خطأ في حذف المنتج:", error);
      return { success: false, message: `خطأ في الحذف: ${error.message}` };
    }
  }

  /**
   * تحديث خصم المنتج
   * @param productId معرف المنتج
   * @param discountData بيانات الخصم الجديدة
   */
  async updateDiscount(
    productId: string,
    discountData: DiscountUpdate,
  ): Promise<void> {
    try {
      const product = await this.getById(productId);
      if (!product) {
        throw new Error("المنتج غير موجود");
      }

      let salePrice = product.price;
      let comparePrice = product.comparePrice;

      if (discountData.isActive && discountData.type !== "none") {
        const originalPrice = product.comparePrice || product.price;

        switch (discountData.type) {
          case "percentage":
            salePrice = originalPrice * (1 - discountData.value / 100);
            comparePrice = originalPrice;
            break;
          case "fixed":
            salePrice = originalPrice - discountData.value;
            comparePrice = originalPrice;
            break;
        }
      } else {
        salePrice = product.comparePrice || product.price;
        comparePrice = undefined;
      }

      const updateData = {
        discount: discountData.isActive
          ? {
              ...discountData,
              originalPrice: product.comparePrice || product.price,
              salePrice: salePrice,
            }
          : null,
        price: salePrice,
        comparePrice: discountData.isActive ? comparePrice : undefined,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(
        doc(db, "products", productId),
        cleanFirestoreData(updateData),
      );
    } catch (error) {
      console.error("❌ خطأ في تحديث التخفيض:", error);
      throw error;
    }
  }

  /**
   * جلب المنتجات المميزة
   * @param storeId معرف المتجر
   * @param limitCount الحد الأقصى
   * @returns قائمة المنتجات المميزة
   */
  async getFeatured(
    storeId: string,
    limitCount: number = 8,
  ): Promise<Product[]> {
    try {
      const products = await this.getByStore(storeId, "active");
      return products
        .filter((product) => product.featured)
        .slice(0, limitCount);
    } catch (error) {
      console.error("❌ خطأ في جلب المنتجات المميزة:", error);
      return [];
    }
  }

  /**
   * جلب المنتجات المخفضة
   * @param storeId معرف المتجر
   * @param limitCount الحد الأقصى
   * @returns قائمة المنتجات المخفضة
   */
  async getDiscountedProducts(
    storeId: string,
    limitCount?: number,
  ): Promise<Product[]> {
    try {
      const products = await this.getByStore(storeId, "active");
      const discountedProducts = products.filter(
        (product) => product.discount?.isActive === true,
      );

      if (limitCount) {
        return discountedProducts.slice(0, limitCount);
      }

      return discountedProducts;
    } catch (error) {
      console.error("❌ خطأ في جلب المنتجات المخفضة:", error);
      return [];
    }
  }

  /**
   * تحديث إحصائيات المنتج
   * @param productId معرف المنتج
   * @param stats الإحصائيات الجديدة
   */
  async updateStats(
    productId: string,
    stats: {
      views?: number;
      sales?: number;
      wishlistCount?: number;
    },
  ): Promise<void> {
    try {
      const product = await this.getById(productId);
      if (!product) return;

      const currentStats = product.stats || {
        views: 0,
        sales: 0,
        wishlistCount: 0,
      };

      const updatedStats = {
        views: (currentStats.views || 0) + (stats.views || 0),
        sales: (currentStats.sales || 0) + (stats.sales || 0),
        wishlistCount:
          (currentStats.wishlistCount || 0) + (stats.wishlistCount || 0),
      };

      await updateDoc(doc(db, "products", productId), {
        stats: updatedStats,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("❌ خطأ في تحديث إحصائيات المنتج:", error);
      throw error;
    }
  }

  /**
   * تحديث المخزون
   * @param productId معرف المنتج
   * @param quantity الكمية
   * @param operation نوع العملية
   * @returns نتيجة التحديث
   */
  async updateInventory(
    productId: string,
    quantity: number,
    operation: "set" | "increment" | "decrement" = "set",
  ): Promise<{ success: boolean; newQuantity: number }> {
    try {
      const product = await this.getById(productId);
      if (!product) {
        throw new Error("المنتج غير موجود");
      }

      let newQuantity = quantity;

      if (operation === "increment") {
        newQuantity = product.inventory.quantity + quantity;
      } else if (operation === "decrement") {
        newQuantity = Math.max(0, product.inventory.quantity - quantity);
      }

      await updateDoc(doc(db, "products", productId), {
        "inventory.quantity": newQuantity,
        updatedAt: Timestamp.now(),
      });

      return { success: true, newQuantity };
    } catch (error) {
      console.error("❌ خطأ في تحديث المخزون:", error);
      throw error;
    }
  }

  /**
   * جلب المنتجات ذات أعلى تخفيض
   * @param storeId معرف المتجر
   * @param limitCount الحد الأقصى
   * @returns قائمة المنتجات
   */
  async getTopDiscountedProducts(
    storeId: string,
    limitCount: number = 6,
  ): Promise<Product[]> {
    try {
      const discountedProducts = await this.getDiscountedProducts(storeId);

      // حساب نسبة التخفيض
      const productsWithDiscount = discountedProducts.map((product) => {
        let discountPercentage = 0;

        if (product.discount && product.comparePrice) {
          if (product.discount.type === "percentage") {
            discountPercentage = product.discount.value;
          } else if (
            product.discount.type === "fixed" &&
            product.comparePrice
          ) {
            const discountAmount = product.comparePrice - product.price;
            discountPercentage = Math.round(
              (discountAmount / product.comparePrice) * 100,
            );
          }
        }

        return { product, discountPercentage };
      });

      // الترتيب تنازلياً
      productsWithDiscount.sort(
        (a, b) => b.discountPercentage - a.discountPercentage,
      );

      return productsWithDiscount
        .slice(0, limitCount)
        .map((item) => item.product);
    } catch (error) {
      console.error("❌ خطأ في جلب المنتجات ذات أعلى تخفيض:", error);
      return [];
    }
  }

  /**
   * جلب إحصائيات منتجات المتجر
   * @param storeId معرف المتجر
   * @returns إحصائيات المنتجات
   */
  async getProductStats(storeId: string): Promise<{
    totalProducts: number;
    activeProducts: number;
    draftProducts: number;
    underReviewProducts: number;
    compliantProducts: number;
    nonCompliantProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
  }> {
    try {
      const products = await this.getByStore(storeId, "all");

      return {
        totalProducts: products.length,
        activeProducts: products.filter(
          (p) => p.status === ProductStatus.ACTIVE,
        ).length,
        draftProducts: products.filter((p) => p.status === ProductStatus.DRAFT)
          .length,
        underReviewProducts: products.filter(
          (p) => p.status === ProductStatus.UNDER_REVIEW,
        ).length,
        compliantProducts: products.filter(
          (p) => p._semantics?.complianceStatus === ComplianceStatus.COMPLIANT,
        ).length,
        nonCompliantProducts: products.filter(
          (p) =>
            p._semantics?.complianceStatus === ComplianceStatus.NON_COMPLIANT,
        ).length,
        outOfStockProducts: products.filter(
          (p) => p.inventory.trackInventory && p.inventory.quantity <= 0,
        ).length,
        lowStockProducts: products.filter(
          (p) =>
            p.inventory.trackInventory &&
            p.inventory.lowStockThreshold &&
            p.inventory.quantity <= p.inventory.lowStockThreshold,
        ).length,
      };
    } catch (error) {
      console.error("❌ خطأ في جلب إحصائيات المنتجات:", error);
      return {
        totalProducts: 0,
        activeProducts: 0,
        draftProducts: 0,
        underReviewProducts: 0,
        compliantProducts: 0,
        nonCompliantProducts: 0,
        outOfStockProducts: 0,
        lowStockProducts: 0,
      };
    }
  }

  /**
   * اقتراح أنواع المنتجات
   * @param name اسم المنتج
   * @param description وصف المنتج
   * @param tags وسوم المنتج
   * @param limit الحد الأقصى
   * @returns أنواع مقترحة
   */
  async suggestProductTypes(
    name: string,
    description: string,
    tags: string[] = [],
    limit: number = 5,
  ): Promise<
    Array<{
      id: string;
      name: string;
      activityId: string;
      confidence: number;
      matchedKeywords: string[];
      requiredFields?: string[];
      icon?: string;
    }>
  > {
    try {
      const detection = await complianceSystem.detectProductType({
        name,
        description,
        tags,
      });

      if (!detection.productType) {
        const text = `${name} ${description} ${tags.join(" ")}`.toLowerCase();
        const suggestions: any[] = [];

        for (const productType of DEFAULT_PRODUCT_TYPES.slice(0, limit)) {
          let score = 0;
          const matchedKeywords: string[] = [];

          for (const keyword of productType.keywords.slice(0, 10)) {
            if (text.includes(keyword.toLowerCase())) {
              score += 5;
              matchedKeywords.push(keyword);
            }
          }

          if (score > 0 || suggestions.length === 0) {
            suggestions.push({
              id: productType.id,
              name: productType.name,
              activityId: productType.activityId,
              confidence: Math.min(score / 50, 0.5),
              matchedKeywords,
              requiredFields: productType.rules.requiredFields,
              icon: productType.metadata?.icon,
            });
          }
        }

        return suggestions.sort((a, b) => b.confidence - a.confidence);
      } else {
        const suggestions = [
          {
            id: detection.productType.id,
            name: detection.productType.name,
            activityId: detection.productType.activityId,
            confidence: detection.confidence,
            matchedKeywords: detection.matchedKeywords,
            requiredFields: detection.productType.rules.requiredFields,
            icon: detection.productType.metadata?.icon,
          },
        ];

        const otherTypes = DEFAULT_PRODUCT_TYPES.filter(
          (pt) => pt.id !== detection.productType?.id,
        )
          .slice(0, limit - 1)
          .map((pt) => ({
            id: pt.id,
            name: pt.name,
            activityId: pt.activityId,
            confidence: 0.3,
            matchedKeywords: [],
            requiredFields: pt.rules.requiredFields,
            icon: pt.metadata?.icon,
          }));

        return [...suggestions, ...otherTypes];
      }
    } catch (error) {
      console.error("❌ خطأ في اقتراح أنواع المنتجات:", error);
      return DEFAULT_PRODUCT_TYPES.slice(0, limit).map((pt) => ({
        id: pt.id,
        name: pt.name,
        activityId: pt.activityId,
        confidence: 0.1,
        matchedKeywords: [],
        requiredFields: pt.rules.requiredFields,
        icon: pt.metadata?.icon,
      }));
    }
  }

  /**
   * التحقق من امتثال المنتج
   * @param productId معرف المنتج
   * @param forceRecheck فرض إعادة الفحص
   * @returns نتيجة الامتثال
   */
  async checkProductCompliance(
    productId: string,
    forceRecheck: boolean = false,
  ): Promise<{
    compliant: boolean;
    decision: ComplianceDecision;
    violations: string[];
    warnings: string[];
    productType?: {
      id: string;
      name: string;
      activityId: string;
    };
    detectedActivity?: string;
    storeActivities?: string[];
    needsReview: boolean;
  }> {
    try {
      const product = await this.getById(productId);
      if (!product) {
        throw new Error("المنتج غير موجود");
      }

      const store = await storeService.getById(product.storeId);
      if (!store) {
        throw new Error("المتجر غير موجود");
      }

      // إذا كان المنتج لديه semantics حديثة ولا نريد إعادة الفحص
      if (
        !forceRecheck &&
        product._semantics?.lastDetection &&
        new Date().getTime() - product._semantics.lastDetection.getTime() <
          24 * 60 * 60 * 1000
      ) {
        return {
          compliant:
            product._semantics.complianceStatus === ComplianceStatus.COMPLIANT,
          decision:
            product.status === ProductStatus.UNDER_REVIEW
              ? ComplianceDecision.REVIEW_REQUIRED
              : product.status === ProductStatus.SUSPENDED
                ? ComplianceDecision.BLOCK
                : ComplianceDecision.ALLOW,
          violations: product._semantics.validationFlags || [],
          warnings: [],
          productType: product._semantics.productTypeId
            ? {
                id: product._semantics.productTypeId,
                name:
                  DEFAULT_PRODUCT_TYPES.find(
                    (pt) => pt.id === product._semantics?.productTypeId,
                  )?.name || "",
                activityId: product._semantics.detectedActivity || "",
              }
            : undefined,
          detectedActivity: product._semantics.detectedActivity,
          storeActivities: store.businessActivities?.subActivities || [],
          needsReview: product.status === ProductStatus.UNDER_REVIEW,
        };
      }

      // إعادة فحص الامتثال
      const productType = product._semantics?.productTypeId
        ? DEFAULT_PRODUCT_TYPES.find(
            (pt) => pt.id === product._semantics?.productTypeId,
          )
        : undefined;

      const complianceDecision = await complianceSystem.makeComplianceDecision(
        product,
        productType,
        store,
      );

      // تحديث حالة المنتج إذا تغيرت
      if (product.status !== complianceDecision.productStatus) {
        await this.update(productId, {
          status: complianceDecision.productStatus,
          _semantics: {
            ...product._semantics,
            complianceStatus: complianceDecision.complianceStatus,
            validationFlags: complianceDecision.violations,
            lastDetection: new Date(),
          },
        } as any);
      }

      return {
        compliant: complianceDecision.decision === ComplianceDecision.ALLOW,
        decision: complianceDecision.decision,
        violations: complianceDecision.violations,
        warnings: complianceDecision.warnings,
        productType: productType
          ? {
              id: productType.id,
              name: productType.name,
              activityId: productType.activityId,
            }
          : undefined,
        detectedActivity: product._semantics?.detectedActivity,
        storeActivities: store.businessActivities?.subActivities || [],
        needsReview:
          complianceDecision.decision === ComplianceDecision.REVIEW_REQUIRED,
      };
    } catch (error) {
      console.error("❌ خطأ في فحص امتثال المنتج:", error);
      throw error;
    }
  }

  /**
   * إصلاح مشاكل الامتثال للمنتجات الزراعية
   * @param storeId معرف المتجر
   * @returns عدد المنتجات المصلحة
   */
  async fixAgricultureProductsCompliance(storeId: string): Promise<number> {
    try {
      const store = await storeService.getById(storeId);
      if (!store) {
        console.log(`❌ المتجر غير موجود: ${storeId}`);
        return 0;
      }

      // التحقق إذا كان المتجر زراعي
      const isStoreAgricultural = this.isStoreAgricultural(store);
      if (!isStoreAgricultural) {
        console.log(`ℹ️ المتجر ${storeId} ليس زراعي، لا حاجة للإصلاح`);
        return 0;
      }

      console.log(
        `🌱 متجر زراعي تم اكتشافه: ${store.name}، بدء إصلاح المنتجات...`,
      );

      // جلب جميع المنتجات
      const products = await this.getByStore(storeId, "all");
      const agricultureProducts = products.filter(
        (p) =>
          p._semantics?.detectedActivity === "agriculture" &&
          p._semantics.complianceStatus === ComplianceStatus.NON_COMPLIANT,
      );

      console.log(
        `🔧 العثور على ${agricultureProducts.length} منتج زراعي يحتاج إصلاح`,
      );

      if (agricultureProducts.length === 0) {
        console.log("✅ لا توجد منتجات زراعية تحتاج إصلاح");
        return 0;
      }

      let fixedCount = 0;
      const batch = writeBatch(db);

      for (const product of agricultureProducts) {
        try {
          // تحديث حالة الامتثال
          const updateData: any = {
            "_semantics.complianceStatus": ComplianceStatus.COMPLIANT,
            "_semantics.updatedAt": new Date(),
            updatedAt: new Date(),
          };

          // إزالة تحذيرات "غير مسجل للمتجر"
          if (product._semantics?.validationFlags) {
            const newFlags = product._semantics.validationFlags.filter(
              (flag: string) => !flag.includes("غير مسجل للمتجر"),
            );
            updateData["_semantics.validationFlags"] = newFlags;

            // إزالة shadowActions إذا لم تعد هناك انتهاكات
            if (newFlags.length === 0 && product._semantics?.shadowActions) {
              updateData["_semantics.shadowActions"] = null;
            }
          }

          // تحديث حالة المنتج إذا كان under_review أو suspended
          if (
            product.status === ProductStatus.UNDER_REVIEW ||
            product.status === ProductStatus.SUSPENDED
          ) {
            updateData["status"] = ProductStatus.ACTIVE;
          }

          const productRef = doc(db, "products", product.id);
          batch.update(productRef, updateData);
          fixedCount++;

          console.log(`✅ تم إصلاح المنتج: ${product.name}`);
        } catch (error) {
          console.error(`❌ خطأ في إصلاح المنتج ${product.id}:`, error);
        }
      }

      if (fixedCount > 0) {
        await batch.commit();
        console.log(`✅ تم إصلاح ${fixedCount} منتج زراعي بنجاح`);
      }

      return fixedCount;
    } catch (error) {
      console.error("❌ خطأ في إصلاح المنتجات الزراعية:", error);
      return 0;
    }
  }
}

export async function fixProductsMissingCreatedAt(storeId: string): Promise<{
  success: boolean;
  fixedCount: number;
  errors: string[];
  details: Array<{ id: string; name: string; fixed: boolean; error?: string }>;
}> {
  try {
    console.log(`🔧 بدء إصلاح المنتجات بدون createdAt للمتجر: ${storeId}`);

    const results = {
      success: true,
      fixedCount: 0,
      errors: [] as string[],
      details: [] as Array<{
        id: string;
        name: string;
        fixed: boolean;
        error?: string;
      }>,
    };

    // 1. جلب جميع منتجات المتجر
    const productsQuery = query(
      collection(db, "products"),
      where("storeId", "==", storeId),
    );

    const snapshot = await getDocs(productsQuery);
    console.log(`🔍 فحص ${snapshot.docs.length} منتج للمتجر ${storeId}`);

    // 2. التحقق من كل منتج
    const productsToFix = snapshot.docs.filter((doc) => {
      const data = doc.data();
      return !data.createdAt;
    });

    console.log(`⚠️ وجد ${productsToFix.length} منتج بدون createdAt`);

    if (productsToFix.length === 0) {
      console.log("✅ لا توجد منتجات تحتاج إصلاح");
      return results;
    }

    // 3. إصلاح كل منتج
    for (const doc of productsToFix) {
      try {
        const data = doc.data();
        const productId = doc.id;
        const productName = data.name || "بدون اسم";

        console.log(`🔄 معالجة المنتج: ${productName} (${productId})`);

        // تحديد تاريخ مناسب للإصلاح
        let fixedDate: Date;

        if (data.updatedAt) {
          // إذا كان هناك updatedAt، استخدمه
          fixedDate = data.updatedAt.toDate();
          console.log(`📅 استخدام updatedAt: ${fixedDate}`);
        } else if (data.lastModified) {
          // أو أي حقل تاريخ آخر
          fixedDate = data.lastModified.toDate();
          console.log(`📅 استخدام lastModified: ${fixedDate}`);
        } else {
          // استخدام تاريخ افتراضي (قبل 30 يوم)
          fixedDate = new Date();
          fixedDate.setDate(fixedDate.getDate() - 30);
          console.log(`📅 استخدام تاريخ افتراضي: ${fixedDate}`);
        }

        // تحديث المنتج
        await updateDoc(doc.ref, {
          createdAt: Timestamp.fromDate(fixedDate),
          updatedAt: Timestamp.fromDate(new Date()), // تحديث updatedAt أيضاً
          _lastFixed: {
            date: new Date(),
            reason: "إصلاح حقل createdAt المفقود",
            fixedBy: "system",
          },
        });

        results.fixedCount++;
        results.details.push({
          id: productId,
          name: productName,
          fixed: true,
        });

        console.log(`✅ تم إصلاح: ${productName}`);
      } catch (error: any) {
        const errorMsg = `❌ خطأ في المنتج ${doc.id}: ${error.message}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
        results.success = false;

        results.details.push({
          id: doc.id,
          name: doc.data().name || "بدون اسم",
          fixed: false,
          error: error.message,
        });
      }
    }

    // 4. تسجيل النتائج
    console.log(`🎉 إصلاح المنتجات اكتمل!`, {
      totalChecked: snapshot.docs.length,
      totalFixed: results.fixedCount,
      totalErrors: results.errors.length,
      success: results.success,
    });

    return results;
  } catch (error: any) {
    console.error("❌ خطأ عام في إصلاح المنتجات:", error);
    return {
      success: false,
      fixedCount: 0,
      errors: [`خطأ عام: ${error.message}`],
      details: [],
    };
  }
}

// دالة للتحقق من المنتجات التي تحتاج إصلاح
export async function checkProductsMissingCreatedAt(storeId: string): Promise<{
  totalProducts: number;
  missingCreatedAt: number;
  products: Array<{
    id: string;
    name: string;
    status: string;
    price: number;
    hasCreatedAt: boolean;
    hasUpdatedAt: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }>;
}> {
  try {
    const productsQuery = query(
      collection(db, "products"),
      where("storeId", "==", storeId),
    );

    const snapshot = await getDocs(productsQuery);

    const productsWithMissingCreatedAt = snapshot.docs
      .filter((doc) => !doc.data().createdAt)
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "بدون اسم",
          status: data.status || "unknown",
          price: data.price || 0,
          hasCreatedAt: !!data.createdAt,
          hasUpdatedAt: !!data.updatedAt,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        };
      });

    return {
      totalProducts: snapshot.docs.length,
      missingCreatedAt: productsWithMissingCreatedAt.length,
      products: productsWithMissingCreatedAt,
    };
  } catch (error: any) {
    console.error("❌ خطأ في التحقق من المنتجات:", error);
    throw error;
  }
}

export const productService = new ProductService();

export const createProduct = productService.create;
export const getProductById = productService.getById;
export const getProductsByStoreId = productService.getByStore;
export const updateProduct = productService.update;
export const deleteProduct = productService.delete;
