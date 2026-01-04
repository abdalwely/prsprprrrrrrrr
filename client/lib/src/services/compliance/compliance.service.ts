import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  ComplianceFlag,
  ComplianceStatus,
  Product,
  ProductStatus,
} from "../../types";
import { productService } from "../product";
import { storeService } from "../store";
import { complianceSystem } from "../../compliance";
import { db } from "../../firebase/firebase";

export const complianceService = {
  async checkStoreCompliance(storeId: string): Promise<{
    storeCompliant: boolean;
    productStats: {
      total: number;
      compliant: number;
      nonCompliant: number;
      pendingReview: number;
    };
    violations: Array<{
      productId: string;
      productName: string;
      issue: string;
      severity: string;
    }>;
    complianceRate: number;
  }> {
    try {
      const store = await storeService.getById(storeId);
      if (!store) {
        throw new Error("المتجر غير موجود");
      }

      const products = await productService.getByStore(storeId, "all");

      let compliant = 0;
      let nonCompliant = 0;
      let pendingReview = 0;
      const violations: any[] = [];

      for (const product of products) {
        const complianceStatus = product._semantics?.complianceStatus;

        switch (complianceStatus) {
          case ComplianceStatus.COMPLIANT:
            compliant++;
            break;
          case ComplianceStatus.NON_COMPLIANT:
            nonCompliant++;
            violations.push({
              productId: product.id,
              productName: product.name,
              issue: "عدم تطابق النشاط",
              severity: "medium",
            });
            break;
          case ComplianceStatus.PENDING_REVIEW:
          default:
            pendingReview++;
            break;
        }
      }

      const total = products.length;
      const complianceRate = total > 0 ? (compliant / total) * 100 : 100;
      const storeCompliant =
        complianceRate >= (store.complianceSettings?.reviewThreshold || 90);

      return {
        storeCompliant,
        productStats: { total, compliant, nonCompliant, pendingReview },
        violations,
        complianceRate,
      };
    } catch (error) {
      console.error("❌ خطأ في فحص امتثال المتجر:", error);
      throw error;
    }
  },

  async reviewProduct(
    productId: string,
    decision: "approve" | "reject" | "exempt",
    reviewerId: string,
    notes?: string,
  ): Promise<void> {
    try {
      const product = await productService.getById(productId);
      if (!product) {
        throw new Error("المنتج غير موجود");
      }

      let updateData: Partial<Product> = {
        _semantics: {
          ...product._semantics,
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
        },
      };

      switch (decision) {
        case "approve":
          updateData.status = ProductStatus.ACTIVE;
          updateData._semantics!.complianceStatus = ComplianceStatus.COMPLIANT;
          updateData._semantics!.exemptionReason = undefined;
          break;
        case "reject":
          updateData.status = ProductStatus.SUSPENDED;
          updateData._semantics!.complianceStatus =
            ComplianceStatus.NON_COMPLIANT;
          updateData._semantics!.exemptionReason = notes;
          break;
        case "exempt":
          updateData.status = ProductStatus.ACTIVE;
          updateData._semantics!.complianceStatus = ComplianceStatus.EXEMPTED;
          updateData._semantics!.exemptionReason = notes;
          break;
      }

      await productService.update(productId, updateData);

      console.log(`✅ تم مراجعة المنتج ${productId}:`, {
        decision,
        reviewerId,
        newStatus: updateData.status,
      });
    } catch (error) {
      console.error("❌ خطأ في مراجعة المنتج:", error);
      throw error;
    }
  },

  async getComplianceFlags(
    storeId?: string,
    status?: ComplianceFlag["status"],
    limite: number = 50,
  ): Promise<ComplianceFlag[]> {
    try {
      const constraints: any[] = [];

      if (storeId) {
        constraints.push(where("storeId", "==", storeId));
      }

      if (status) {
        constraints.push(where("status", "==", status));
      }

      let q;
      if (constraints.length > 0) {
        q = query(
          collection(db, "complianceFlags"),
          ...constraints,
          orderBy("createdAt", "desc"),
          limit(limite),
        );
      } else {
        q = query(
          collection(db, "complianceFlags"),
          orderBy("createdAt", "desc"),
          limit(limite),
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data() as Record<string, any>;
        return {
          id: doc.id,
          ...data,
        } as ComplianceFlag;
      });
    } catch (error) {
      console.error("❌ خطأ في جلب مخالفات الامتثال:", error);
      return [];
    }
  },

  async updateFlagStatus(
    flagId: string,
    status: ComplianceFlag["status"],
    assignedTo?: string,
    resolutionNotes?: string,
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (status === "resolved") {
        updateData.resolvedAt = new Date();
      }

      if (assignedTo) {
        updateData.assignedTo = assignedTo;
      }

      if (resolutionNotes) {
        updateData.resolutionNotes = resolutionNotes;
      }

      await updateDoc(doc(db, "complianceFlags", flagId), updateData);

      console.log(`✅ تم تحديث حالة المخالفة ${flagId}:`, status);
    } catch (error) {
      console.error("❌ خطأ في تحديث حالة المخالفة:", error);
      throw error;
    }
  },

  async runScheduledComplianceChecks(): Promise<void> {
    try {
      const stores = await storeService.getAll();

      console.log(`🔄 بدء الفحص الدوري لـ ${stores.length} متجر`);

      for (const store of stores) {
        if (store.status === "active") {
          try {
            await complianceSystem.batchComplianceCheck(store.id);
            console.log(`✅ تم فحص امتثال المتجر ${store.name}`);
          } catch (error) {
            console.error(`❌ خطأ في فحص المتجر ${store.id}:`, error);
          }
        }
      }

      console.log("✅ اكتمل الفحص الدوري للامتثال");
    } catch (error) {
      console.error("❌ خطأ في الفحص الدوري:", error);
    }
  },
};

export const detectProductType = complianceSystem.detectProductType;
export const checkStoreCompliance = complianceService.checkStoreCompliance;
export const reviewProduct = complianceService.reviewProduct;
export const getComplianceFlags = complianceService.getComplianceFlags;
export const updateFlagStatus = complianceService.updateFlagStatus;
export const runScheduledComplianceChecks =
  complianceService.runScheduledComplianceChecks;
export const buildProductSemantics = complianceSystem.buildProductSemantics;
export const makeComplianceDecision = complianceSystem.makeComplianceDecision;
export const sanitizeProductData = complianceSystem.sanitizeProductData;
