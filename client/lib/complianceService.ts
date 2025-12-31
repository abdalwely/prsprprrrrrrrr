// ============ complianceService.ts المحدث ============

import { storeService, productService, orderService } from "./firestore";
import {
  Store,
  Product,
  ProductType,
  DEFAULT_PRODUCT_TYPES,
} from "./firestore";

// 🔥 واجهات النظام الجديد
export interface ChecklistItems {
  addProduct: boolean;
  addCategories: boolean;
  enableShipping: boolean;
  enablePayment: boolean;
  verification: boolean;
  customDomain: boolean;
  seoOptimization: boolean;
}

export interface RiskAssessment {
  score: number; // 0-100 (أعلى = أكثر أماناً)
  riskLevel: "low" | "medium" | "high";
  flags: string[];
  recommendedAction: "monitor" | "review" | "suspend";
  lastUpdated: Date;
}

export interface ComplianceLevelData {
  level: "basic" | "intermediate" | "advanced";
  features: string[];
  restrictions: string[];
  nextLevelThreshold: number;
}

// 🔥 واجهات جديدة للنظام الجديد
export interface ProductTypeSuggestion {
  id: string;
  name: string;
  activityId: string;
  confidence: number;
  matchedKeywords: string[];
  requiredFields?: string[];
  icon?: string;
  description?: string;
}

export interface ActivityComplianceCheck {
  allowed: boolean;
  needsReview: boolean;
  message?: string;
  activityId?: string;
  productTypeName?: string;
  storeActivities?: string[];
}

export interface ComplianceRecommendation {
  type: "warning" | "suggestion" | "requirement";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  action?: string;
  productTypeId?: string;
}

// 🔥 خدمة الامتثال الرئيسية المحدثة
class ComplianceService {
  // 🔄 تحديث Checklist وحساب Compliance Level تلقائياً
  async updateChecklistItem(
    storeId: string,
    itemId: keyof ChecklistItems,
    completed: boolean,
  ): Promise<{
    newChecklist: ChecklistItems;
    newComplianceLevel: "basic" | "intermediate" | "advanced";
    nextSteps: string[];
  }> {
    try {
      const store = await storeService.getById(storeId);
      if (!store) throw new Error("المتجر غير موجود");

      // الحصول على Checklist الحالي أو إنشاء واحد جديد
      const currentChecklist = store.checklist || this.getDefaultChecklist();

      // تحديث Checklist
      const updatedChecklist: ChecklistItems = {
        ...currentChecklist,
        [itemId]: completed,
      };

      // حساب النسبة المئوية للإكمال
      const completionRate = this.calculateCompletionRate(updatedChecklist);

      // تحديد Compliance Level الجديد
      const newComplianceLevel = this.calculateComplianceLevel(completionRate);

      // تحديث المتجر في Firestore
      await storeService.update(storeId, {
        checklist: updatedChecklist,
        complianceLevel: newComplianceLevel,
        updatedAt: new Date(),
      });

      // تسجيل الحدث
      await this.logComplianceEvent(storeId, "checklist_update", {
        itemId,
        completed,
        oldLevel: store.complianceLevel || "basic",
        newLevel: newComplianceLevel,
        completionRate,
      });

      console.log(
        `✅ [امتثال] ${itemId}: ${completed} -> ${newComplianceLevel} (${completionRate}%)`,
      );

      return {
        newChecklist: updatedChecklist,
        newComplianceLevel,
        nextSteps: this.getNextRecommendedSteps(updatedChecklist),
      };
    } catch (error) {
      console.error("❌ [امتثال] خطأ في تحديث checklist:", error);
      throw error;
    }
  }

  // 📊 حساب نسبة إكمال Checklist
  calculateCompletionRate(checklist: ChecklistItems): number {
    const items = Object.values(checklist);
    const completed = items.filter((item) => item === true).length;
    return Math.round((completed / items.length) * 100);
  }

  // 🎯 حساب Compliance Level بناءً على النسبة
  calculateComplianceLevel(
    completionRate: number,
  ): "basic" | "intermediate" | "advanced" {
    if (completionRate >= 70) return "advanced";
    if (completionRate >= 40) return "intermediate";
    return "basic";
  }

  // ============ 🔥 النظام الجديد: اقتراح أنواع المنتجات ============

  /**
   * اقتراح أنواع المنتجات بناءً على نص المنتج
   */
  async suggestProductTypes(
    name: string,
    description: string,
    tags: string[] = [],
    limit: number = 5,
  ): Promise<ProductTypeSuggestion[]> {
    try {
      const searchText = `${name} ${description} ${tags.join(" ")}`
        .toLowerCase()
        .replace(/[^\w\u0600-\u06FF\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (!searchText || searchText.length < 3) {
        // إرجاع الأنواع الأكثر شيوعاً
        return DEFAULT_PRODUCT_TYPES.slice(0, limit).map((pt) => ({
          id: pt.id,
          name: pt.name,
          activityId: pt.activityId,
          confidence: 0.1,
          matchedKeywords: [],
          requiredFields: pt.rules.requiredFields,
          icon: pt.metadata?.icon,
          description: pt.metadata?.description,
        }));
      }

      const suggestions: ProductTypeSuggestion[] = [];

      for (const productType of DEFAULT_PRODUCT_TYPES) {
        let score = 0;
        const matchedKeywords: string[] = [];

        // حساب النقاط من الكلمات المفتاحية
        for (const keyword of productType.keywords) {
          const keywordLower = keyword.toLowerCase();

          if (searchText.includes(keywordLower)) {
            score += 10; // تطابق كامل
            matchedKeywords.push(keyword);
          } else if (keywordLower.includes(" ")) {
            // تحقق من الكلمات الفردية للكلمات المركبة
            const words = keywordLower.split(" ");
            const matchedWords = words.filter(
              (word) => word.length > 3 && searchText.includes(word),
            );
            if (matchedWords.length > 0) {
              score += matchedWords.length * 3;
              matchedKeywords.push(keyword);
            }
          }
        }

        // إضافة النوع إذا كان لديه نقاط
        if (score > 0) {
          const confidence = Math.min(score / 100, 0.95); // الحد الأقصى 95%

          suggestions.push({
            id: productType.id,
            name: productType.name,
            activityId: productType.activityId,
            confidence,
            matchedKeywords,
            requiredFields: productType.rules.requiredFields,
            icon: productType.metadata?.icon,
            description: productType.metadata?.description,
          });
        }
      }

      // إذا لم يكن هناك اقتراحات، نضيف الأنواع الأكثر شيوعاً
      if (suggestions.length === 0) {
        DEFAULT_PRODUCT_TYPES.slice(0, limit).forEach((pt) => {
          suggestions.push({
            id: pt.id,
            name: pt.name,
            activityId: pt.activityId,
            confidence: 0.05, // ثقة منخفضة جداً
            matchedKeywords: [],
            requiredFields: pt.rules.requiredFields,
            icon: pt.metadata?.icon,
            description: pt.metadata?.description,
          });
        });
      }

      // ترتيب حسب الثقة (الأعلى أولاً)
      return suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, limit);
    } catch (error) {
      console.error("❌ [امتثال] خطأ في اقتراح أنواع المنتجات:", error);
      // إرجاع قائمة افتراضية في حالة الخطأ
      return DEFAULT_PRODUCT_TYPES.slice(0, limit).map((pt) => ({
        id: pt.id,
        name: pt.name,
        activityId: pt.activityId,
        confidence: 0.1,
        matchedKeywords: [],
        requiredFields: pt.rules.requiredFields,
        icon: pt.metadata?.icon,
        description: pt.metadata?.description,
      }));
    }
  }

  // ============ 🔥 النظام الجديد: التحقق من توافق النشاط ============

  /**
   * التحقق من توافق نوع المنتج مع نشاط المتجر
   */
  async checkProductActivityCompliance(
    storeId: string,
    productTypeId: string,
  ): Promise<{
    allowed: boolean;
    needsReview: boolean;
    message?: string;
    activityId?: string;
    productTypeName?: string;
    storeActivities?: string[];
  }> {
    try {
      const store = await storeService.getById(storeId);
      if (!store) {
        return {
          allowed: false,
          needsReview: false,
          message: "المتجر غير موجود",
        };
      }

      // الحصول على نوع المنتج
      const productType = DEFAULT_PRODUCT_TYPES.find(
        (pt) => pt.id === productTypeId,
      );
      if (!productType) {
        return {
          allowed: false,
          needsReview: false,
          message: "نوع المنتج غير معروف",
        };
      }

      const storeActivities = store.businessActivities?.subActivities || [];
      const productActivity = productType.activityId;

      if (!productActivity) {
        return {
          allowed: true,
          needsReview: false,
          message: "نوع المنتج لا يحتوي على نشاط محدد",
          productTypeName: productType.name,
        };
      }

      // التحقق من التطابق
      if (storeActivities.includes(productActivity)) {
        // ✅ نشاط مطابق تماماً
        return {
          allowed: true,
          needsReview: false,
          message: `النشاط مطابق: ${productActivity}`,
          activityId: productActivity,
          productTypeName: productType.name,
          storeActivities,
        };
      } else {
        // 🟡 نشاط غير مطابق - يحتاج مراجعة
        return {
          allowed: false,
          needsReview: true,
          message: `نشاط المنتج (${productActivity}) غير مسجل للمتجر. يحتاج مراجعة.`,
          activityId: productActivity,
          productTypeName: productType.name,
          storeActivities,
        };
      }
    } catch (error) {
      console.error("❌ [امتثال] خطأ في التحقق من توافق النشاط:", error);
      return {
        allowed: false,
        needsReview: true,
        message: "خطأ في التحقق من توافق النشاط",
      };
    }
  }

  // ============ 🔥 النظام الجديد: اقتراحات الامتثال ============

  /**
   * الحصول على اقتراحات الامتثال لمنتج محدد
   */
  async getComplianceRecommendations(
    productData: {
      name: string;
      description: string;
      tags?: string[];
      category?: string;
      specifications?: Record<string, string>;
    },
    storeId: string,
    selectedProductTypeId?: string,
  ): Promise<ComplianceRecommendation[]> {
    const recommendations: ComplianceRecommendation[] = [];

    try {
      const store = await storeService.getById(storeId);
      if (!store) return recommendations;

      // 1. اقتراح نوع المنتج إذا لم يتم اختياره
      if (!selectedProductTypeId) {
        const suggestions = await this.suggestProductTypes(
          productData.name,
          productData.description,
          productData.tags || [],
          3,
        );

        suggestions.forEach((suggestion) => {
          recommendations.push({
            type: "suggestion",
            title: `نوع مقترح: ${suggestion.name}`,
            description:
              suggestion.description || `نشاط: ${suggestion.activityId}`,
            priority: suggestion.confidence > 0.7 ? "high" : "medium",
            action: `اختر هذا النوع`,
            productTypeId: suggestion.id,
          });
        });
      } else {
        // 2. التحقق من توافق النشاط إذا تم اختيار نوع
        const complianceCheck = await this.checkProductActivityCompliance(
          storeId,
          selectedProductTypeId,
        );

        if (complianceCheck.needsReview) {
          recommendations.push({
            type: "warning",
            title: "نشاط غير مطابق",
            description: complianceCheck.message || "النشاط يحتاج مراجعة",
            priority: "high",
            action: "طلب إضافة النشاط أو تعديل المنتج",
          });
        }

        // 3. التحقق من الحقول المطلوبة
        const productType = DEFAULT_PRODUCT_TYPES.find(
          (pt) => pt.id === selectedProductTypeId,
        );
        if (productType?.rules.requiredFields) {
          const missingFields = productType.rules.requiredFields.filter(
            (field) => !productData.specifications?.[field],
          );

          if (missingFields.length > 0) {
            recommendations.push({
              type: "requirement",
              title: `حقول مطلوبة (${missingFields.length})`,
              description: `هذا النوع من المنتجات يتطلب: ${missingFields.join(", ")}`,
              priority: "medium",
              action: `أضف الحقول المطلوبة إلى مواصفات المنتج`,
            });
          }
        }
      }

      // 4. اقتراحات عامة
      if (
        !productData.description ||
        productData.description.trim().length < 50
      ) {
        recommendations.push({
          type: "suggestion",
          title: "وصف قصير",
          description:
            "الوصف الحالي قصير جداً. وصف مفصل يساعد في اكتشاف نوع المنتج تلقائياً.",
          priority: "medium",
          action: "أضف وصفاً أكثر تفصيلاً",
        });
      }

      if (!productData.tags || productData.tags.length < 3) {
        recommendations.push({
          type: "suggestion",
          title: "وسوم قليلة",
          description: "الوسوم تساعد في تصنيف المنتج واكتشاف نوعه تلقائياً.",
          priority: "low",
          action: "أضف وسوماً وصفيّة للمنتج",
        });
      }

      // 5. ترتيب التوصيات حسب الأولوية
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return recommendations.sort(
        (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority],
      );
    } catch (error) {
      console.error("❌ [امتثال] خطأ في الحصول على اقتراحات الامتثال:", error);
      return recommendations;
    }
  }

  // ============ 🔥 النظام الجديد: كشف النشاط من النص ============

  /**
   * كشف النشاط التجاري من نص المنتج
   */
  async detectActivityFromText(
    name: string,
    description: string,
    storeId?: string,
  ): Promise<{
    detectedActivity?: string;
    confidence: number;
    matchedProductTypes: Array<{
      id: string;
      name: string;
      activityId: string;
      confidence: number;
    }>;
    storeActivities?: string[];
    isCompatible?: boolean;
  }> {
    try {
      // الحصول على اقتراحات أنواع المنتجات
      const suggestions = await this.suggestProductTypes(
        name,
        description,
        [],
        3,
      );

      if (suggestions.length === 0) {
        return {
          confidence: 0,
          matchedProductTypes: [],
        };
      }

      // أفضل اقتراح
      const bestSuggestion = suggestions[0];
      let storeActivities: string[] = [];
      let isCompatible = false;

      // إذا كان هناك متجر، نتحقق من التوافق
      if (storeId) {
        const store = await storeService.getById(storeId);
        if (store?.businessActivities?.subActivities) {
          storeActivities = store.businessActivities.subActivities;
          isCompatible = storeActivities.includes(bestSuggestion.activityId);
        }
      }

      return {
        detectedActivity: bestSuggestion.activityId,
        confidence: bestSuggestion.confidence,
        matchedProductTypes: suggestions.map((s) => ({
          id: s.id,
          name: s.name,
          activityId: s.activityId,
          confidence: s.confidence,
        })),
        storeActivities,
        isCompatible,
      };
    } catch (error) {
      console.error("❌ [امتثال] خطأ في كشف النشاط من النص:", error);
      return {
        confidence: 0,
        matchedProductTypes: [],
      };
    }
  }

  // ============ 🔥 نظام تقييم المخاطر الآلي المحدث ============

  async assessStoreRisk(storeId: string): Promise<RiskAssessment> {
    try {
      const store = await storeService.getById(storeId);
      if (!store) throw new Error("المتجر غير موجود");

      let score = 100; // بداية من 100 نقطة
      const flags: string[] = [];

      // 1. تحقق من اكتمال البيانات (-10 لكل حقل ناقص)
      if (
        !store.contact?.address ||
        store.contact.address.includes("سيتم الإضافة")
      ) {
        score -= 10;
        flags.push("عنوان غير مكتمل");
      }

      if (!store.contact?.phone || store.contact.phone.length < 9) {
        score -= 15;
        flags.push("رقم هاتف غير صالح");
      }

      if (!store.taxNumber) {
        score -= 10;
        flags.push("لا يوجد رقم ضريبي");
      }

      // 2. 🔥 تحقق من النشاط التجاري (النظام الجديد)
      if (
        !store.businessActivities?.subActivities ||
        store.businessActivities.subActivities.length === 0
      ) {
        score -= 20;
        flags.push("لا توجد أنشطة تجارية محددة");
      }

      // 3. تحقق من سرعة النشاط
      const products = await productService.getByStore(storeId, "all");
      const storeAge = new Date().getTime() - store.createdAt.getTime();
      const ageInDays = storeAge / (1000 * 60 * 60 * 24);

      if (products.length > 50 && ageInDays < 7) {
        score -= 25;
        flags.push("نمو سريع غير طبيعي");
      }

      // 4. 🔥 التحقق من وجود منتجات غير ممتثلة (النظام الجديد)
      const nonCompliantProducts = products.filter(
        (p) => p._semantics?.complianceStatus === "non_compliant",
      ).length;

      if (nonCompliantProducts > 5) {
        score -= nonCompliantProducts * 5;
        flags.push(`يوجد ${nonCompliantProducts} منتج غير ممتثل`);
      }

      // 5. 🔥 تحقق من توافق المنتجات مع نشاط المتجر (النظام الجديد)
      if (store.businessActivities?.subActivities && products.length > 0) {
        let incompatibleCount = 0;

        for (const product of products.slice(0, 20)) {
          // تحقق من أول 20 منتج فقط
          if (product._semantics?.detectedActivity) {
            const isCompatible =
              store.businessActivities.subActivities.includes(
                product._semantics.detectedActivity,
              );
            if (!isCompatible) incompatibleCount++;
          }
        }

        if (incompatibleCount > 3) {
          score -= incompatibleCount * 3;
          flags.push(
            `يوجد ${incompatibleCount} منتج غير متوافق مع نشاط المتجر`,
          );
        }
      }

      // 6. تحقق من الطلبات والمبيعات (مؤشر إيجابي يرفع النقاط)
      const orders = await orderService.getByStore(storeId);
      const successfulOrders = orders.filter(
        (o) => o.orderStatus === "delivered",
      ).length;

      if (successfulOrders > 10) {
        score += Math.min(successfulOrders * 2, 30); // +2 نقطة لكل طلب ناجح حتى 30 نقطة
      }

      // تحديد مستوى الخطورة والإجراء الموصى به
      let riskLevel: "low" | "medium" | "high" = "low";
      let recommendedAction: "monitor" | "review" | "suspend" = "monitor";

      if (score >= 80) {
        riskLevel = "low";
        recommendedAction = "monitor";
      } else if (score >= 50) {
        riskLevel = "medium";
        recommendedAction = "review"; // 🔥 يحتاج مراجعة أدمن
      } else {
        riskLevel = "high";
        recommendedAction = "suspend"; // 🔥 تعليق تلقائي
      }

      return {
        score: Math.max(0, Math.min(100, score)),
        riskLevel,
        flags,
        recommendedAction,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("❌ [امتثال] خطأ في تقييم المخاطر:", error);
      return {
        score: 50,
        riskLevel: "medium",
        flags: ["خطأ في التقييم"],
        recommendedAction: "review",
        lastUpdated: new Date(),
      };
    }
  }

  // 🔍 التحقق من صلاحية الميزة حسب Compliance Level
  canAccessFeature(
    complianceLevel: "basic" | "intermediate" | "advanced",
    feature: string,
  ): { allowed: boolean; reason?: string } {
    // تعريف الميزات لكل مستوى
    const featureRules = {
      basic: [
        "view_dashboard",
        "add_product",
        "edit_product",
        "view_orders",
        "cash_on_delivery",
        "bank_transfer",
        "basic_analytics",
        "view_customers",
      ],

      intermediate: [
        "shipping_settings",
        "advanced_payment_methods",
        "order_tracking",
        "advanced_analytics",
        "discount_coupons",
        "email_notifications",
        "bulk_operations",
        "customer_management",
      ],

      advanced: [
        "electronic_payment",
        "custom_domain",
        "api_access",
        "advanced_reports",
        "affiliate_system",
        "verification_badge",
        "priority_support",
        "multi_currency",
      ],
    };

    // التحقق من وجود الميزة في المستوى الحالي أو الأعلى
    const allowedFeatures = [
      ...featureRules.basic,
      ...(complianceLevel === "intermediate" || complianceLevel === "advanced"
        ? featureRules.intermediate
        : []),
      ...(complianceLevel === "advanced" ? featureRules.advanced : []),
    ];

    const allowed = allowedFeatures.includes(feature);

    if (!allowed) {
      return {
        allowed: false,
        reason: `هذه الميزة متاحة فقط للمستوى ${this.getNextLevelForFeature(feature)} فما فوق`,
      };
    }

    return { allowed: true };
  }

  // 🎯 الحصول على الخطوات التالية المقترحة
  getNextRecommendedSteps(checklist: ChecklistItems): string[] {
    const steps: string[] = [];

    if (!checklist.addProduct) {
      steps.push("أضف أول منتج لبدء البيع");
    }

    if (checklist.addProduct && !checklist.enableShipping) {
      steps.push("قم بإعداد خيارات الشحن لتوسيع نطاق بيعك");
    }

    if (checklist.addProduct && !checklist.enablePayment) {
      steps.push("أضف طرق دفع إضافية لزيادة التحويل");
    }

    if (checklist.addProduct && !checklist.addCategories) {
      steps.push("نظم منتجاتك بأقسام لتحسين تجربة العملاء");
    }

    if (
      checklist.addProduct &&
      checklist.enableShipping &&
      checklist.enablePayment &&
      !checklist.verification
    ) {
      steps.push("قم بتوثيق حسابك للوصول إلى الميزات المتقدمة");
    }

    return steps;
  }

  // 📝 إنشاء Checklist افتراضي
  getDefaultChecklist(): ChecklistItems {
    return {
      addProduct: false,
      addCategories: false,
      enableShipping: false,
      enablePayment: false,
      verification: false,
      customDomain: false,
      seoOptimization: false,
    };
  }

  // 📊 الحصول على بيانات Compliance Level
  getComplianceLevelData(
    level: "basic" | "intermediate" | "advanced",
  ): ComplianceLevelData {
    const levels = {
      basic: {
        level: "basic" as const,
        features: [
          "إضافة منتجات (حد 20 منتج)",
          "الدفع عند الاستلام",
          "التحويل البنكي",
          "لوحة تحكم أساسية",
          "تقارير مبيعات أسبوعية",
        ],
        restrictions: [
          "لا يمكن استخدام الدفع الإلكتروني",
          "لا يمكن ربط نطاق مخصص",
          "محدودية عدد المنتجات",
          "تقارير محدودة",
        ],
        nextLevelThreshold: 40,
      },
      intermediate: {
        level: "intermediate" as const,
        features: [
          "إضافة منتجات (حد 100 منتج)",
          "إعدادات شحن متقدمة",
          "تتبع الطلبات",
          "تقارير تحليلية",
          "كوبونات الخصم",
          "إدارة العملاء",
        ],
        restrictions: [
          "يحتاج توثيق للوصول للمستوى المتقدم",
          "محدودية في واجهة برمجة التطبيقات",
        ],
        nextLevelThreshold: 70,
      },
      advanced: {
        level: "advanced" as const,
        features: [
          "إضافة منتجات غير محدودة",
          "بوابات دفع إلكترونية",
          "نطاق مخصص",
          "واجهة برمجة التطبيقات",
          "تقارير متقدمة",
          "نظام العمولات",
          "دعم فني مميز",
        ],
        restrictions: [],
        nextLevelThreshold: 100,
      },
    };

    return levels[level];
  }

  // ============ 🔥 دوال جديدة للنظام الجديد ============

  /**
   * الحصول على إحصائيات امتثال المنتجات للمتجر
   */
  async getStoreProductsComplianceStats(storeId: string): Promise<{
    total: number;
    compliant: number;
    needsReview: number;
    nonCompliant: number;
    byActivity: Record<
      string,
      {
        count: number;
        compliant: number;
        needsReview: number;
      }
    >;
    complianceRate: number;
  }> {
    try {
      const products = await productService.getByStore(storeId, "all");
      const store = await storeService.getById(storeId);
      const storeActivities = store?.businessActivities?.subActivities || [];

      let compliant = 0;
      let needsReview = 0;
      let nonCompliant = 0;
      const byActivity: Record<string, any> = {};

      // تهيئة الأنشطة
      storeActivities.forEach((activity) => {
        byActivity[activity] = { count: 0, compliant: 0, needsReview: 0 };
      });

      // تحليل المنتجات
      products.forEach((product) => {
        const activity = product._semantics?.detectedActivity;
        const status = product._semantics?.complianceStatus;
        const productStatus = product.status;

        if (status === "compliant") {
          compliant++;
        } else if (
          status === "non_compliant" ||
          productStatus === "under_review"
        ) {
          needsReview++;
        } else {
          nonCompliant++;
        }

        // تجميع حسب النشاط
        if (activity && byActivity[activity]) {
          byActivity[activity].count++;
          if (status === "compliant") {
            byActivity[activity].compliant++;
          } else if (
            status === "non_compliant" ||
            productStatus === "under_review"
          ) {
            byActivity[activity].needsReview++;
          }
        }
      });

      const total = products.length;
      const complianceRate = total > 0 ? (compliant / total) * 100 : 100;

      return {
        total,
        compliant,
        needsReview,
        nonCompliant,
        byActivity,
        complianceRate,
      };
    } catch (error) {
      console.error("❌ [امتثال] خطأ في جلب إحصائيات الامتثال:", error);
      return {
        total: 0,
        compliant: 0,
        needsReview: 0,
        nonCompliant: 0,
        byActivity: {},
        complianceRate: 0,
      };
    }
  }

  /**
   * اقتراح أنشطة تجارية جديدة للمتجر بناءً على منتجاته
   */
  async suggestNewActivitiesForStore(
    storeId: string,
    limit: number = 5,
  ): Promise<
    Array<{
      activityId: string;
      productTypeName: string;
      reason: string;
      productCount?: number;
      confidence: number;
    }>
  > {
    try {
      const products = await productService.getByStore(storeId, "all");
      const store = await storeService.getById(storeId);
      const currentActivities = store?.businessActivities?.subActivities || [];

      const activitySuggestions: Record<
        string,
        {
          activityId: string;
          productTypeName: string;
          reasons: string[];
          productCount: number;
          confidence: number;
        }
      > = {};

      // تحليل منتجات المتجر
      products.forEach((product) => {
        const detectedActivity = product._semantics?.detectedActivity;
        const productTypeId = product._semantics?.productTypeId;

        if (
          detectedActivity &&
          productTypeId &&
          !currentActivities.includes(detectedActivity)
        ) {
          const productType = DEFAULT_PRODUCT_TYPES.find(
            (pt) => pt.id === productTypeId,
          );

          if (productType) {
            if (!activitySuggestions[detectedActivity]) {
              activitySuggestions[detectedActivity] = {
                activityId: detectedActivity,
                productTypeName: productType.name,
                reasons: [],
                productCount: 0,
                confidence: 0,
              };
            }

            activitySuggestions[detectedActivity].productCount++;
            activitySuggestions[detectedActivity].reasons.push(
              `المنتج "${product.name}" تم اكتشافه كـ ${productType.name}`,
            );
          }
        }
      });

      // حساب الثقة بناءً على عدد المنتجات
      Object.values(activitySuggestions).forEach((suggestion) => {
        suggestion.confidence = Math.min(suggestion.productCount / 5, 1);
      });

      // تحويل إلى مصفوفة وترتيب
      return Object.values(activitySuggestions)
        .map((suggestion) => ({
          activityId: suggestion.activityId,
          productTypeName: suggestion.productTypeName,
          reason: suggestion.reasons[0] || "تم اكتشاف نشاط جديد",
          productCount: suggestion.productCount,
          confidence: suggestion.confidence,
        }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, limit);
    } catch (error) {
      console.error("❌ [امتثال] خطأ في اقتراح أنشطة جديدة:", error);
      return [];
    }
  }

  /**
   * فحص امتثال دفعة من المنتجات
   */
  async batchComplianceCheck(
    storeId: string,
    productIds?: string[],
  ): Promise<{
    checked: number;
    compliant: number;
    needsReview: number;
    nonCompliant: number;
    updated: number;
    errors: number;
  }> {
    try {
      let products: Product[] = [];

      if (productIds && productIds.length > 0) {
        // فحص منتجات محددة
        const productPromises = productIds.map((id) =>
          productService.getById(id),
        );
        const results = await Promise.all(productPromises);
        products = results.filter((p): p is Product => p !== null);
      } else {
        // فحص جميع منتجات المتجر
        products = await productService.getByStore(storeId, "all");
      }

      const store = await storeService.getById(storeId);
      if (!store) {
        throw new Error("المتجر غير موجود");
      }

      let compliant = 0;
      let needsReview = 0;
      let nonCompliant = 0;
      let updated = 0;
      let errors = 0;

      // فحص كل منتج
      for (const product of products) {
        try {
          const productType = product._semantics?.productTypeId
            ? DEFAULT_PRODUCT_TYPES.find(
                (pt) => pt.id === product._semantics?.productTypeId,
              )
            : undefined;

          const complianceDecision = await (
            window as any
          ).complianceSystem?.makeComplianceDecision?.(
            product,
            productType,
            store,
          );

          if (complianceDecision) {
            if (complianceDecision.decision === "allow") {
              compliant++;
            } else if (complianceDecision.decision === "review_required") {
              needsReview++;
            } else {
              nonCompliant++;
            }

            // تحديث حالة المنتج إذا تغيرت
            if (product.status !== complianceDecision.productStatus) {
              await productService.update(product.id, {
                status: complianceDecision.productStatus,
              } as Partial<Product>);
              updated++;
            }
          }
        } catch (error) {
          console.error(`❌ خطأ في فحص المنتج ${product.id}:`, error);
          errors++;
        }
      }

      console.log(`✅ تم فحص ${products.length} منتج للمتجر ${storeId}`);

      return {
        checked: products.length,
        compliant,
        needsReview,
        nonCompliant,
        updated,
        errors,
      };
    } catch (error) {
      console.error("❌ [امتثال] خطأ في الفحص الدفعي:", error);
      return {
        checked: 0,
        compliant: 0,
        needsReview: 0,
        nonCompliant: 0,
        updated: 0,
        errors: 1,
      };
    }
  }

  // 🔔 تسجيل أحداث الامتثال
  private async logComplianceEvent(
    storeId: string,
    eventType: string,
    data: any,
  ): Promise<void> {
    try {
      console.log(`📝 [امتثال-حدث] ${eventType}:`, {
        storeId,
        timestamp: new Date().toISOString(),
        ...data,
      });
    } catch (error) {
      // تجاهل الأخطاء في التسجيل
    }
  }

  // 🔍 تحديد المستوى المطلوب للميزة
  private getNextLevelForFeature(feature: string): string {
    if (
      feature.includes("electronic_payment") ||
      feature.includes("custom_domain")
    ) {
      return "المتقدم";
    } else if (
      feature.includes("shipping_settings") ||
      feature.includes("advanced_analytics")
    ) {
      return "المتوسط";
    }
    return "الأساسي";
  }

  // 🚨 تنبيهات النظام الآلي
  async checkAndSendAlerts(storeId: string): Promise<void> {
    try {
      const riskAssessment = await this.assessStoreRisk(storeId);
      const store = await storeService.getById(storeId);

      if (!store) return;

      // إرسال تنبيه إذا كانت المخاطر عالية
      if (riskAssessment.riskLevel === "high" && store.status === "active") {
        console.log(
          `🚨 [تنبيه] مخاطر عالية للمتجر ${store.name}:`,
          riskAssessment.flags,
        );

        await this.sendAlertToSupport(storeId, riskAssessment);
      }

      // تنبيه للمتاجر الجديدة التي لم تضيف منتجات
      if (store.checklist && !store.checklist.addProduct) {
        const storeAge = new Date().getTime() - store.createdAt.getTime();
        const ageInDays = storeAge / (1000 * 60 * 60 * 24);

        if (ageInDays > 3) {
          console.log(`ℹ️ [تذكير] المتجر ${store.name} لم يضف منتجات بعد`);
        }
      }

      // 🔥 تنبيه جديد: منتجات تحتاج مراجعة
      const complianceStats =
        await this.getStoreProductsComplianceStats(storeId);
      if (complianceStats.needsReview > 5) {
        console.log(
          `⚠️ [تنبيه] ${store.name} لديه ${complianceStats.needsReview} منتج يحتاج مراجعة`,
        );
      }
    } catch (error) {
      console.error("❌ [امتثال] خطأ في فحص التنبيهات:", error);
    }
  }

  // 📧 إرسال تنبيه للدعم
  private async sendAlertToSupport(
    storeId: string,
    risk: RiskAssessment,
  ): Promise<void> {
    console.log(`📧 [دعم] إشعار مخاطر للمتجر ${storeId}:`, {
      riskLevel: risk.riskLevel,
      score: risk.score,
      flags: risk.flags,
      time: new Date().toISOString(),
    });
  }

  // ============ 🔥 دوال تعليمية وإرشادية ============

  /**
   * الحصول على أمثلة لأنواع المنتجات
   */
  getProductTypeExamples(activityId?: string): Array<{
    id: string;
    name: string;
    exampleKeywords: string[];
    description: string;
    requiredFields?: string[];
  }> {
    let types = DEFAULT_PRODUCT_TYPES;

    if (activityId) {
      types = types.filter((pt) => pt.activityId === activityId);
    }

    return types.map((pt) => ({
      id: pt.id,
      name: pt.name,
      exampleKeywords: pt.keywords.slice(0, 5),
      description:
        pt.metadata?.description || `منتجات في مجال ${pt.activityId}`,
      requiredFields: pt.rules.requiredFields,
    }));
  }

  /**
   * إنشاء رسالة توضيحية لعدم تطابق النشاط
   */
  getActivityMismatchMessage(
    productActivity: string,
    storeActivities: string[],
  ): {
    title: string;
    message: string;
    suggestions: string[];
    actions: string[];
  } {
    return {
      title: "نشاط غير مسجل",
      message: `هذا المنتج ينتمي إلى نشاط "${productActivity}" الذي ليس من ضمن الأنشطة المسجلة لمتجرك.`,
      suggestions: [
        `يمكنك طلب إضافة النشاط "${productActivity}" إلى متجرك`,
        `يمكنك تعديل المنتج ليناسب أحد الأنشطة الحالية: ${storeActivities.join(", ")}`,
        `يمكنك نشر المنتج كمسودة وانتظار مراجعة الفريق`,
      ],
      actions: ["طلب إضافة نشاط جديد", "تعديل المنتج", "النشر كمسودة"],
    };
  }

  /**
   * التحقق من صحة بيانات المنتج قبل الإرسال
   */
  validateProductDataBeforeSubmit(
    productData: Partial<Product>,
    selectedProductTypeId?: string,
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 1. التحقق من الحقول الأساسية
    if (!productData.name || productData.name.trim().length < 2) {
      errors.push("اسم المنتج قصير جداً (يجب أن يكون على الأقل حرفين)");
    }

    if (
      !productData.description ||
      productData.description.trim().length < 10
    ) {
      warnings.push("وصف المنتج قصير جداً");
    }

    if (productData.price === undefined || productData.price <= 0) {
      errors.push("السعر غير صالح");
    }

    // 2. التحقق من نوع المنتج
    if (!selectedProductTypeId) {
      warnings.push("لم يتم اختيار نوع المنتج");
      suggestions.push("اختر نوع المنتج المناسب لتفعيل نظام الامتثال");
    }

    // 3. التحقق من الفئة
    if (!productData.category) {
      warnings.push("لم يتم اختيار فئة للمنتج");
    }

    // 4. التحقق من SKU
    if (!productData.sku || productData.sku.trim().length < 3) {
      warnings.push("رمز المنتج (SKU) قصير جداً");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }
}

// تصدير نسخة واحدة من الخدمة
export const complianceService = new ComplianceService();
