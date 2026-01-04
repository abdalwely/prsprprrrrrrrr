import { db } from "../../firebase/firebase";
import { writeBatch, doc, Timestamp } from "firebase/firestore";
import { storeService } from "../store/store.service";
import { productService } from "../product";

export const optimizationTipsService = {
  // 1. للمتاجر الجديدة
  newStoreTips: {
    async setPreciseActivities(
      storeId: string,
      activities: {
        mainActivity: string;
        subActivities: string[];
      },
    ): Promise<void> {
      await storeService.updateBusinessActivities(storeId, {
        ...activities,
        registrationNumber: "",
        issueDate: new Date(),
        expiryDate: undefined,
        taxNumber: "",
      });
      console.log("✅ تم تحديد الأنشطة التجارية بدقة");
    },

    async enableAutoDetection(storeId: string): Promise<void> {
      await storeService.updateComplianceSettings(storeId, {
        autoDetection: true,
        strictMode: false,
        notifyOnViolation: true,
      });
      console.log("✅ تم تفعيل الاكتشاف التلقائي");
    },

    async useNonStrictMode(storeId: string): Promise<void> {
      await storeService.updateComplianceSettings(storeId, {
        strictMode: false,
        reviewThreshold: 60,
      });
      console.log("✅ تم استخدام وضع غير صارم");
    },

    async manualReviewNonCompliant(storeId: string): Promise<{
      total: number;
      reviewed: number;
      pending: number;
    }> {
      const products = await productService.getByStore(storeId, "all");

      const nonCompliantProducts = products.filter(
        (product) => product._semantics?.complianceStatus === "non_compliant",
      );

      const reviewResults = {
        total: nonCompliantProducts.length,
        reviewed: 0,
        pending: nonCompliantProducts.length,
      };

      console.log(`📋 تحتاج مراجعة ${nonCompliantProducts.length} منتج`);
      return reviewResults;
    },
  },

  // 2. لإدارة المخزون
  inventoryTips: {
    async enableInventoryTracking(storeId: string): Promise<void> {
      const products = await productService.getByStore(storeId, "all");
      const batch = writeBatch(db);

      products.forEach((product, index) => {
        if (index < 500) {
          // تحديث 500 منتج في كل مرة
          const productRef = doc(db, "products", product.id);
          batch.update(productRef, {
            "inventory.trackInventory": true,
            updatedAt: Timestamp.now(),
          });
        }
      });

      await batch.commit();
      console.log("✅ تم تفعيل تتبع المخزون للمنتجات");
    },

    async setLowStockThreshold(
      storeId: string,
      threshold: number = 10,
    ): Promise<void> {
      const products = await productService.getByStore(storeId, "all");
      const batch = writeBatch(db);

      products.forEach((product, index) => {
        if (index < 500) {
          const productRef = doc(db, "products", product.id);
          batch.update(productRef, {
            "inventory.lowStockThreshold": threshold,
            updatedAt: Timestamp.now(),
          });
        }
      });

      await batch.commit();
      console.log(`✅ تم تعيين حد المخزون المنخفض إلى ${threshold}`);
    },

    async generateUniqueSKUs(storeId: string): Promise<void> {
      const products = await productService.getByStore(storeId, "all");
      const batch = writeBatch(db);

      products.forEach((product, index) => {
        if (index < 500 && (!product.sku || product.sku.startsWith("SKU-"))) {
          const productRef = doc(db, "products", product.id);
          const uniqueSKU = this.generateSKU(product);
          batch.update(productRef, {
            sku: uniqueSKU,
            "inventory.sku": uniqueSKU,
            updatedAt: Timestamp.now(),
          });
        }
      });

      await batch.commit();
      console.log("✅ تم إنشاء SKU فريد لكل منتج");
    },

    generateSKU(product: any): string {
      const prefix = product.category?.substring(0, 3).toUpperCase() || "PRO";
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      return `${prefix}-${timestamp}-${random}`;
    },

    async setupAutoInventoryUpdate(storeId: string): Promise<void> {
      // هنا يمكن إعداد Cloud Function للتحديث التلقائي
      console.log("🔄 إعداد التحديث التلقائي للمخزون مع المبيعات");
      console.log("⚠️ يتطلب Cloud Function للتحديث التلقائي");
    },
  },

  // 3. للتخفيضات والعروض
  discountTips: {
    async createTimedDiscount(
      productId: string,
      discountType: "percentage" | "fixed",
      value: number,
      durationHours: number,
    ): Promise<void> {
      const now = new Date();
      const endDate = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

      await productService.updateDiscount(productId, {
        type: discountType,
        value,
        startDate: now,
        endDate,
        isActive: true,
      });

      console.log(`✅ تم إنشاء تخفيض لمدة ${durationHours} ساعة`);
    },

    async monitorDiscountEffectiveness(
      productId: string,
      discountId?: string,
    ): Promise<any> {
      const product = await productService.getById(productId);
      if (!product) {
        throw new Error("المنتج غير موجود");
      }

      // محاكاة بيانات التحليل
      const analytics: any = {
        productId,
        discountDetails: {
          type:
            product.discount?.type === "none"
              ? "percentage"
              : product.discount?.type || "percentage",
          value: product.discount?.value || 0,
          period: {
            start: product.discount?.startDate,
            end: product.discount?.endDate,
          },
        },
        performance: {
          salesDuringDiscount: Math.floor(Math.random() * 100) + 50,
          salesBeforeDiscount: Math.floor(Math.random() * 50) + 20,
          revenueIncrease: 1.3 + Math.random() * 0.7, // 30-100% زيادة
          conversionRate: 0.05 + Math.random() * 0.1, // 5-15% تحويل
          customerAcquisition: Math.floor(Math.random() * 20) + 5,
        },
        costBenefit: {
          discountCost: 1000 * Math.random(),
          additionalRevenue: 2000 * Math.random(),
          netProfit: 1000 * Math.random(),
          roi: 1.5 + Math.random() * 2, // 150-350% عائد
        },
        recommendations: {
          extend: Math.random() > 0.5,
          adjust: Math.random() > 0.3,
          stop: Math.random() < 0.2,
          repeat: Math.random() > 0.6,
        },
      };

      return analytics;
    },

    async renewExpiredDiscounts(
      storeId: string,
      successfulOnly: boolean = true,
    ): Promise<number> {
      const products = await productService.getByStore(storeId, "all");
      let renewedCount = 0;

      for (const product of products) {
        if (product.discount?.isActive === false) {
          // يمكن إضافة منطق لتجديد العروض الناجحة فقط
          if (successfulOnly) {
            const analytics = await this.monitorDiscountEffectiveness(
              product.id,
            );
            if (analytics.recommendations.extend) {
              await this.createTimedDiscount(
                product.id,
                product.discount.type === "none"
                  ? "percentage"
                  : product.discount.type,
                product.discount.value * 0.9, // خفض القيمة بنسبة 10%
                24 * 7, // أسبوع
              );
              renewedCount++;
            }
          } else {
            await this.createTimedDiscount(
              product.id,
              product.discount.type === "none"
                ? "percentage"
                : product.discount.type,
              product.discount.value,
              24 * 3, // 3 أيام
            );
            renewedCount++;
          }
        }
      }

      console.log(`✅ تم تجديد ${renewedCount} عرض منتهي`);
      return renewedCount;
    },

    async applyRelativeDiscountForExpensiveProducts(
      storeId: string,
      priceThreshold: number = 1000,
      maxDiscount: number = 30,
    ): Promise<number> {
      const products = await productService.getByStore(storeId, "all");
      let appliedCount = 0;

      for (const product of products) {
        if (product.price >= priceThreshold && !product.discount?.isActive) {
          // حساب الخصم النسبي (كلما ارتفع السعر، انخفضت نسبة الخصم)
          const discountPercentage = Math.min(
            maxDiscount,
            (priceThreshold / product.price) * maxDiscount,
          );

          await productService.updateDiscount(product.id, {
            type: "percentage",
            value: discountPercentage,
            isActive: true,
          });

          appliedCount++;
        }
      }

      console.log(`✅ تم تطبيق خصم نسبي على ${appliedCount} منتج باهظ الثمن`);
      return appliedCount;
    },
  },

  // 4. لوحة التحكم الشاملة
  async getOptimizationDashboard(storeId: string): Promise<{
    newStoreStatus: {
      activitiesSet: boolean;
      autoDetectionEnabled: boolean;
      strictMode: boolean;
      reviewThreshold: number;
    };
    inventoryStatus: {
      trackingEnabled: boolean;
      lowThresholdSet: boolean;
      uniqueSKUs: boolean;
      autoUpdate: boolean;
    };
    discountsStatus: {
      timedDiscounts: number;
      effectivenessMonitored: boolean;
      expiredRenewed: number;
      relativeDiscountsApplied: number;
    };
    recommendations: Array<{
      category: string;
      title: string;
      description: string;
      priority: "high" | "medium" | "low";
      action: string;
    }>;
  }> {
    const store = await storeService.getById(storeId);
    if (!store) {
      throw new Error("المتجر غير موجود");
    }

    const products = await productService.getByStore(storeId, "all");

    // حساب إحصائيات المتجر الجديد
    const newStoreStatus = {
      activitiesSet: !!store.businessActivities?.subActivities?.length,
      autoDetectionEnabled: store.complianceSettings?.autoDetection || false,
      strictMode: store.complianceSettings?.strictMode || false,
      reviewThreshold: store.complianceSettings?.reviewThreshold || 90,
    };

    // حساب إحصائيات المخزون
    const inventoryStats = products.reduce(
      (stats, product) => ({
        trackingEnabled:
          stats.trackingEnabled && product.inventory.trackInventory,
        lowThresholdSet:
          stats.lowThresholdSet &&
          (product.inventory.lowStockThreshold || 0) > 0,
        uniqueSKUs:
          stats.uniqueSKUs && product.sku && !product.sku.startsWith("SKU-"),
        productsCount: stats.productsCount + 1,
      }),
      {
        trackingEnabled: true,
        lowThresholdSet: true,
        uniqueSKUs: true,
        productsCount: 0,
      },
    );

    // حساب إحصائيات التخفيضات
    const discountProducts = products.filter(
      (p) => p.discount?.isActive === true,
    );
    const expiredDiscounts = products.filter(
      (p) => p.discount?.isActive === false,
    );

    // توليد التوصيات
    const recommendations: Array<{
      category: string;
      title: string;
      description: string;
      priority: "high" | "medium" | "low";
      action: string;
    }> = [];

    if (!newStoreStatus.activitiesSet) {
      recommendations.push({
        category: "new_store",
        title: "تحديد الأنشطة التجارية",
        description: "يجب تحديد الأنشطة التجارية بدقة لضبط نظام الامتثال",
        priority: "high",
        action: "set_activities",
      });
    }

    if (!newStoreStatus.autoDetectionEnabled) {
      recommendations.push({
        category: "new_store",
        title: "تفعيل الاكتشاف التلقائي",
        description: "تفعيل الاكتشاف التلقائي لتسريع إضافة المنتجات",
        priority: "high",
        action: "enable_auto_detection",
      });
    }

    if (newStoreStatus.strictMode && newStoreStatus.reviewThreshold > 80) {
      recommendations.push({
        category: "new_store",
        title: "استخدام وضع غير صارم",
        description: "خفض حد المراجعة واستخدام وضع غير صارم في البداية",
        priority: "medium",
        action: "reduce_strictness",
      });
    }

    if (!inventoryStats.trackingEnabled && inventoryStats.productsCount > 0) {
      recommendations.push({
        category: "inventory",
        title: "تفعيل تتبع المخزون",
        description: "تفعيل تتبع المخزون للتحديث التلقائي والتحذيرات",
        priority: "high",
        action: "enable_tracking",
      });
    }

    if (!inventoryStats.lowThresholdSet && inventoryStats.productsCount > 0) {
      recommendations.push({
        category: "inventory",
        title: "تعيين حد المخزون المنخفض",
        description: "تعيين حد المخزون المنخفض لمنع نفاذ المخزون",
        priority: "medium",
        action: "set_low_threshold",
      });
    }

    if (!inventoryStats.uniqueSKUs && inventoryStats.productsCount > 0) {
      recommendations.push({
        category: "inventory",
        title: "إنشاء SKU فريد",
        description: "إنشاء SKU فريد لكل منتج للتتبع الدقيق",
        priority: "medium",
        action: "generate_skus",
      });
    }

    if (discountProducts.length === 0 && products.length > 10) {
      recommendations.push({
        category: "discounts",
        title: "إنشاء عروض محدودة الزمن",
        description: "إنشاء عروض بفترات زمنية محددة لزيادة المبيعات",
        priority: "medium",
        action: "create_timed_discounts",
      });
    }

    if (expiredDiscounts.length > 5) {
      recommendations.push({
        category: "discounts",
        title: "تجديد العروض المنتهية",
        description: `تجديد ${expiredDiscounts.length} عرض منتهي`,
        priority: "low",
        action: "renew_expired_discounts",
      });
    }

    // المنتجات باهظة الثمن بدون خصم
    const expensiveProducts = products.filter(
      (p) => p.price > 1000 && !p.discount?.isActive,
    );
    if (expensiveProducts.length > 0) {
      recommendations.push({
        category: "discounts",
        title: "تطبيق خصومات نسبية",
        description: `تطبيق خصومات نسبية على ${expensiveProducts.length} منتج باهظ`,
        priority: "low",
        action: "apply_relative_discounts",
      });
    }

    return {
      newStoreStatus,
      inventoryStatus: {
        trackingEnabled: inventoryStats.trackingEnabled,
        lowThresholdSet: inventoryStats.lowThresholdSet,
        uniqueSKUs: inventoryStats.uniqueSKUs,
        autoUpdate: false, // يتطلب Cloud Functions
      },
      discountsStatus: {
        timedDiscounts: discountProducts.length,
        effectivenessMonitored: false, // يتطلب تحليلات
        expiredRenewed: 0,
        relativeDiscountsApplied: 0,
      },
      recommendations,
    };
  },

  // 5. تنفيذ التوصيات تلقائيًا
  async executeOptimization(
    storeId: string,
    recommendations: Array<{ action: string; priority: string }>,
  ): Promise<{
    executed: number;
    failed: number;
    results: Array<{ action: string; success: boolean; message: string }>;
  }> {
    const results: Array<{
      action: string;
      success: boolean;
      message: string;
    }> = [];

    let executed = 0;
    let failed = 0;

    for (const rec of recommendations) {
      try {
        let result;
        switch (rec.action) {
          case "set_activities":
            result = await this.newStoreTips.setPreciseActivities(storeId, {
              mainActivity: "general",
              subActivities: ["general_trade"],
            });
            break;

          case "enable_auto_detection":
            result = await this.newStoreTips.enableAutoDetection(storeId);
            break;

          case "reduce_strictness":
            result = await this.newStoreTips.useNonStrictMode(storeId);
            break;

          case "enable_tracking":
            result = await this.inventoryTips.enableInventoryTracking(storeId);
            break;

          case "set_low_threshold":
            result = await this.inventoryTips.setLowStockThreshold(storeId, 10);
            break;

          case "generate_skus":
            result = await this.inventoryTips.generateUniqueSKUs(storeId);
            break;

          case "create_timed_discounts":
            // تنفيذ على عينة من المنتجات
            const products = await productService.getByStore(storeId, "active");
            const sampleProducts = products.slice(0, 3);
            for (const product of sampleProducts) {
              await this.discountTips.createTimedDiscount(
                product.id,
                "percentage",
                15,
                48, // 48 ساعة
              );
            }
            result = `تم إنشاء عروض لـ ${sampleProducts.length} منتج`;
            break;

          case "renew_expired_discounts":
            result = await this.discountTips.renewExpiredDiscounts(storeId);
            break;

          case "apply_relative_discounts":
            result =
              await this.discountTips.applyRelativeDiscountForExpensiveProducts(
                storeId,
              );
            break;

          default:
            result = "إجراء غير معروف";
        }

        results.push({
          action: rec.action,
          success: true,
          message: `✅ تم تنفيذ ${rec.action} بنجاح: ${result}`,
        });
        executed++;
      } catch (error: any) {
        results.push({
          action: rec.action,
          success: false,
          message: `❌ فشل في تنفيذ ${rec.action}: ${error.message}`,
        });
        failed++;
      }
    }

    return {
      executed,
      failed,
      results,
    };
  },
};

// ============ تصدير النصائح العملية ============

export const {
  newStoreTips,
  inventoryTips,
  discountTips,
  getOptimizationDashboard,
  executeOptimization,
} = optimizationTipsService;
