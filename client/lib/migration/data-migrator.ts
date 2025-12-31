// 📂 client/lib/migration/data-migrator.ts
/**
 * أداة ترحيل البيانات القديمة إلى النظام الموحد
 */

import {
  collection,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ============================================
// 🛠️ الإعدادات
// ============================================

const MIGRATION_CONFIG = {
  batchSize: 100,
  delayBetweenBatches: 1000,
};

// ============================================
// 🛠️ الأنواع
// ============================================

interface MigrationStats {
  totalDocuments: number;
  migratedDocuments: number;
  skippedDocuments: number;
  failedDocuments: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

// ============================================
// 🛠️ دوال المساعدة
// ============================================

/**
 * التحقق مما إذا كان المستند قد هُجر سابقاً
 */
function isAlreadyMigrated(data: any): boolean {
  return data.metadata?.version === 2 || data.migratedAt !== undefined;
}

/**
 * تحليل البيانات القديمة
 */
function analyzeLegacyData(data: any): {
  needsMigration: boolean;
  updates: Record<string, any>;
} {
  const updates: Record<string, any> = {};
  let needsMigration = false;

  // ✅ التحقق من الحقول المفقودة
  if (!data.merchantData?.address) {
    needsMigration = true;
    updates["merchantData.address"] = `${data.merchantData?.city || ""}, اليمن`;
  }

  if (data.merchantData?.emailVerified === undefined) {
    needsMigration = true;
    updates["merchantData.emailVerified"] = false;
  }

  if (!data.merchantData?.subBusinessTypes) {
    needsMigration = true;
    updates["merchantData.subBusinessTypes"] = [];
  }

  // ✅ تحديث البنية القديمة
  if (data.storeConfig && !data.storeConfig.customization) {
    needsMigration = true;
    updates["storeConfig.customization"] = {
      storeName:
        data.storeConfig.storeName || data.merchantData?.businessName || "",
      colors: {
        primary: "#3B82F6",
        secondary: "#10B981",
        background: "#FFFFFF",
      },
      subdomain: "",
    };
  }

  // ✅ إضافة بيانات التعريف
  if (!data.metadata) {
    needsMigration = true;
    updates["metadata"] = {
      version: 2,
      source: "migrated",
      migratedAt: Timestamp.now(),
    };
  }

  return { needsMigration, updates };
}

// ============================================
// 🚀 الدوال الرئيسية
// ============================================

/**
 * ترحيل جميع طلبات المتاجر القديمة
 */
export async function migrateAllStoreApplications(
  options: {
    dryRun?: boolean;
    logProgress?: boolean;
  } = {},
): Promise<MigrationStats> {
  const stats: MigrationStats = {
    totalDocuments: 0,
    migratedDocuments: 0,
    skippedDocuments: 0,
    failedDocuments: 0,
    startTime: new Date(),
  };

  try {
    console.log("🔄 بدء عملية ترحيل البيانات القديمة...");

    // ✅ جلب جميع طلبات المتاجر
    const applicationsRef = collection(db, "storeApplications");
    const q = query(applicationsRef, orderBy("submittedAt", "desc"));
    const querySnapshot = await getDocs(q);

    stats.totalDocuments = querySnapshot.size;

    if (stats.totalDocuments === 0) {
      console.log("✅ لا توجد بيانات للترحيل");
      return stats;
    }

    console.log(`📊 وجد ${stats.totalDocuments} مستند للترحيل`);

    // ✅ المعالجة
    const documents = querySnapshot.docs;

    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];

      try {
        const data = document.data();

        // ✅ تخطي البيانات المحدثة بالفعل
        if (isAlreadyMigrated(data)) {
          stats.skippedDocuments++;
          continue;
        }

        // ✅ تحليل البيانات
        const analysis = analyzeLegacyData(data);

        if (!analysis.needsMigration) {
          stats.skippedDocuments++;
          continue;
        }

        // ✅ تطبيق التحديثات
        if (!options.dryRun) {
          await updateDoc(doc(db, "storeApplications", document.id), {
            ...analysis.updates,
            migratedAt: Timestamp.now(),
          });
        }

        stats.migratedDocuments++;

        if (options.logProgress && i % 10 === 0) {
          console.log(`📈 التقدم: ${i + 1}/${documents.length}`);
        }
      } catch (error) {
        stats.failedDocuments++;
        console.error(`❌ فشل ترحيل المستند ${document.id}:`, error);
      }

      // ✅ تأخير بين المستندات لتجنب الضغط
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // ✅ إكمال العملية
    stats.endTime = new Date();
    stats.duration = stats.endTime.getTime() - stats.startTime.getTime();

    console.log("✅ اكتمال عملية الترحيل!");
    console.log("📊 الإحصائيات:", {
      إجمالي_المستندات: stats.totalDocuments,
      المهجَرة: stats.migratedDocuments,
      المتخطاة: stats.skippedDocuments,
      الفاشلة: stats.failedDocuments,
      المدة: `${(stats.duration / 1000).toFixed(2)} ثانية`,
    });

    return stats;
  } catch (error) {
    console.error("❌ فشل عملية الترحيل:", error);
    stats.endTime = new Date();
    return stats;
  }
}

/**
 * ترحيل مستند محدد
 */
export async function migrateSingleDocument(
  documentId: string,
  options: { dryRun?: boolean } = {},
): Promise<{ success: boolean; updates: Record<string, any> }> {
  try {
    console.log(`🔄 ترحيل المستند المحدد: ${documentId}`);

    const docRef = doc(db, "storeApplications", documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`المستند ${documentId} غير موجود`);
    }

    const data = docSnap.data();

    // ✅ تحليل البيانات
    const analysis = analyzeLegacyData(data);

    if (!analysis.needsMigration) {
      console.log(`⏭️ لا يحتاج المستند ${documentId} للترحيل`);
      return { success: true, updates: {} };
    }

    // ✅ تطبيق التحديثات
    if (!options.dryRun) {
      await updateDoc(docRef, {
        ...analysis.updates,
        migratedAt: Timestamp.now(),
      });
    }

    console.log(`✅ تم ترحيل المستند ${documentId}`);
    return { success: true, updates: analysis.updates };
  } catch (error) {
    console.error(`❌ فشل ترحيل المستند ${documentId}:`, error);
    return { success: false, updates: {} };
  }
}

/**
 * التحقق من حالة الترحيل
 */
export async function checkMigrationStatus(): Promise<{
  needsMigration: boolean;
  totalDocuments: number;
  migratedCount: number;
  legacyCount: number;
}> {
  try {
    console.log("🔍 التحقق من حالة الترحيل...");

    const applicationsRef = collection(db, "storeApplications");
    const querySnapshot = await getDocs(applicationsRef);

    let migratedCount = 0;
    let legacyCount = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      if (isAlreadyMigrated(data)) {
        migratedCount++;
      } else {
        legacyCount++;
      }
    });

    const needsMigration = legacyCount > 0;

    console.log("📊 نتيجة التحقق:", {
      needsMigration,
      totalDocuments: querySnapshot.size,
      migratedCount,
      legacyCount,
    });

    return {
      needsMigration,
      totalDocuments: querySnapshot.size,
      migratedCount,
      legacyCount,
    };
  } catch (error) {
    console.error("❌ فشل التحقق من حالة الترحيل:", error);
    throw error;
  }
}

// ============================================
// 📦 التصدير
// ============================================

export default {
  migrateAllStoreApplications,
  migrateSingleDocument,
  checkMigrationStatus,
};
