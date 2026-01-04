// التصدير من constants إذا كان موجودًا
// أو تعريف جديد إذا لم يكن

export interface OptimizationTips {
  newStoreTips: {
    preciseActivities: string;
    enableAutoDetection: string;
    useNonStrictMode: string;
    manualReview: string;
  };
  inventoryTips: {
    enableTracking: string;
    setLowThreshold: string;
    uniqueSKU: string;
    autoUpdate: string;
  };
  discountTips: {
    useTimePeriods: string;
    monitorEffectiveness: string;
    renewExpired: string;
    relativeDiscounts: string;
  };
}

export const OPTIMIZATION_TIPS: OptimizationTips = {
  newStoreTips: {
    preciseActivities:
      "تحديد الأنشطة التجارية بدقة لزيادة دقة الاكتشاف وتقليل المراجعات اليدوية",
    enableAutoDetection:
      "تفعيل الاكتشاف التلقائي لتسريع إضافة المنتجات وضمان اتساق البيانات",
    useNonStrictMode:
      "استخدام وضع غير صارم في البداية لإعطاء وقت للتعديل والتعلم",
    manualReview:
      "مراجعة المنتجات غير الممتثلة يدويًا لاتخاذ القرار المناسب لكل حالة",
  },
  inventoryTips: {
    enableTracking: "تفعيل تتبع المخزون للتحديث التلقائي والتحذيرات الذكية",
    setLowThreshold:
      "تحديد حد المخزون المنخفض بناءً على معدل البيع لمنع نفاذ المخزون",
    uniqueSKU: "استخدام SKU فريد لكل منتج للتتبع الدقيق وتحليل الأداء",
    autoUpdate: "تحديث المخزون تلقائيًا مع المبيعات للحفاظ على دقة البيانات",
  },
  discountTips: {
    useTimePeriods: "استخدام فترات زمنية محددة للعروض لخلق إحساس بالاستعجال",
    monitorEffectiveness:
      "مراقبة فعالية العروض بانتظام لتحسين استراتيجية التخفيضات",
    renewExpired:
      "تجديد العروض المنتهية التي أثبتت فعاليتها بضبط القيم والفترات",
    relativeDiscounts:
      "استخدام خصومات نسبية للمنتجات باهظة الثمن للحفاظ على القيمة المتصورة",
  },
};

export interface StockThresholds {
  fastMoving: {
    lowThreshold: number;
    reorderPoint: number;
    safetyStock: number;
  };
  slowMoving: {
    lowThreshold: number;
    reorderPoint: number;
    safetyStock: number;
  };
  seasonal: {
    lowThreshold: number;
    reorderPoint: number;
    safetyStock: number;
  };
}

export interface DiscountPeriods {
  flashSale: {
    duration: number;
    bestFor: string[];
  };
  weekendSale: {
    duration: number;
    bestFor: string[];
  };
  monthlySale: {
    duration: number;
    bestFor: string[];
  };
  seasonal: {
    duration: number;
    bestFor: string[];
  };
}

export interface DiscountAnalytics {
  productId: string;
  discountDetails: {
    type: "percentage" | "fixed";
    value: number;
    period: {
      start?: Date;
      end?: Date;
    };
  };
  performance: {
    salesDuringDiscount: number;
    salesBeforeDiscount: number;
    revenueIncrease: number;
    conversionRate: number;
    customerAcquisition: number;
  };
  costBenefit: {
    discountCost: number;
    additionalRevenue: number;
    netProfit: number;
    roi: number;
  };
  recommendations: {
    extend: boolean;
    adjust: boolean;
    stop: boolean;
    repeat: boolean;
  };
}
