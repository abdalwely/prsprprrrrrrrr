import { Timestamp } from "firebase/firestore";

// ============ دالة تنظيف البيانات المعدلة ============

const cleanFirestoreData = (data: any): any => {
  // 🔧 أضف سجلات التشخيص
  const debug = false; // غيّر إلى true لتفعيل السجلات

  if (debug) {
    console.log("🧹 cleanFirestoreData المدخل:", {
      data,
      type: typeof data,
      isObject: typeof data === "object" && data !== null,
      isArray: Array.isArray(data),
      // تحقق من metadata إذا كان موجوداً
      hasMetadata: data?.metadata !== undefined,
      metadata: data?.metadata,
      agricultureSpecific: data?.metadata?.agricultureSpecific,
    });
  }

  if (data === null || data === undefined) {
    if (debug) console.log("🧹 إرجاع null لبيانات null/undefined");
    return null;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      if (debug) console.log("🧹 إرجاع مصفوفة فارغة");
      return [];
    }
    const cleanedArray = data.map(cleanFirestoreData);
    if (debug) console.log("🧹 تنظيف المصفوفة، الطول:", cleanedArray.length);
    return cleanedArray;
  }

  if (
    typeof data === "object" &&
    !(data instanceof Date) &&
    !(data instanceof Timestamp)
  ) {
    const cleaned: any = {};
    let hasValidFields = false;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        const cleanedValue = cleanFirestoreData(value);

        // 🔧 التعديل المهم: احتفظ بالكائنات حتى لو أصبحت فارغة بعد التنظيف
        // هذا مهم لكائنات مثل metadata التي قد تحتوي على كائنات فرعية
        if (cleanedValue !== null && cleanedValue !== undefined) {
          // إذا كانت القيمة كائنًا فارغًا، احتفظ بها فقط إذا كانت metadata
          // لأن metadata قد تبدأ فارغة وتُملأ لاحقاً
          if (
            typeof cleanedValue === "object" &&
            !Array.isArray(cleanedValue) &&
            Object.keys(cleanedValue).length === 0
          ) {
            if (key === "metadata" || key === "agricultureSpecific") {
              cleaned[key] = cleanedValue; // احتفظ بالكائن الفارغ
              hasValidFields = true;
              if (debug) console.log(`🧹 احتفظ بـ ${key} ككائن فارغ`);
            } else {
              if (debug) console.log(`🧹 تخطي ${key} (كائن فارغ)`);
            }
          } else {
            cleaned[key] = cleanedValue;
            hasValidFields = true;
            if (
              debug &&
              (key === "metadata" || key === "agricultureSpecific")
            ) {
              console.log(`🧹 احتفظ بـ ${key}:`, cleanedValue);
            }
          }
        } else {
          if (debug) console.log(`🧹 تخطي ${key} (قيمة null بعد التنظيف)`);
        }
      } else {
        if (debug) console.log(`🧹 تخطي ${key} (undefined)`);
      }
    }

    if (debug) {
      console.log("🧹 cleanFirestoreData المخرجات:", {
        keys: Object.keys(cleaned),
        hasMetadata: "metadata" in cleaned,
        metadata: cleaned.metadata,
        agricultureSpecific: cleaned.metadata?.agricultureSpecific,
      });
    }

    return hasValidFields ? cleaned : null;
  }

  // القيم البدائية (أرقام، نصوص، تواريخ، إلخ)
  if (debug) console.log("🧹 إرجاع قيمة بدائية:", data);
  return data;
};

export { cleanFirestoreData };
