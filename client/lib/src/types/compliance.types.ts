import { ProductKind } from "../constants/product-kinds";

/**
 * قرارات نظام الامتثال
 */
export enum ComplianceDecision {
  ALLOW = "allow",
  REVIEW_REQUIRED = "review_required",
  BLOCK = "block",
}

/**
 * حالات المنتج في النظام
 */
export enum ProductStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  INACTIVE = "inactive",
  UNDER_REVIEW = "under_review",
  SUSPENDED = "suspended",
}

/**
 * حالات الامتثال
 */
export enum ComplianceStatus {
  COMPLIANT = "compliant",
  NON_COMPLIANT = "non_compliant",
  PENDING_REVIEW = "pending_review",
  EXEMPTED = "exempted",
}

/**
 * طرق الكشف عن نوع المنتج
 */
export enum DetectionMethod {
  AI = "ai",
  RULES = "rules",
  PATTERN = "pattern",
  MANUAL = "manual",
  HYBRID = "hybrid",
  NONE = "none",
  KIND_BASED = "kind_based",
}

/**
 * علم الامتثال (Compliance Flag)
 */
export interface ComplianceFlag {
  id: string;
  storeId: string;
  productId: string;
  issueType:
    | "activity_mismatch"
    | "missing_fields"
    | "price_violation"
    | "content_violation";
  severity: "low" | "medium" | "high" | "critical";
  details: any;
  status: "pending" | "reviewed" | "resolved" | "ignored";
  assignedTo?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * دلالات المنتج (Product Semantics)
 */
export interface ProductSemantics {
  productTypeId?: string;
  detectedActivity?: string;
  confidenceScore: number;
  complianceStatus: ComplianceStatus;
  metadata?: {
    isSensitive?: boolean;
    requiresLicense?: boolean;
    flags?: string[];
  };
  detectionMethod: DetectionMethod;
  lastDetection?: Date;
  detectionLog?: Array<{
    timestamp: Date;
    method: DetectionMethod;
    confidence: number;
    activity: string;
  }>;
  validationFlags?: string[];
  reviewedBy?: string;
  reviewedAt?: Date;
  exemptionReason?: string;
  shadowActions?: {
    hideFromStore?: boolean;
    hideFromSearch?: boolean;
    limitPurchase?: boolean;
  };
}

/**
 * نتيجة التحقق من الامتثال
 */
export interface ComplianceCheckResult {
  decision: ComplianceDecision;
  complianceStatus: ComplianceStatus;
  productStatus: ProductStatus;
  violations: string[];
  warnings: string[];
  shadowActions?: {
    hideFromStore?: boolean;
    hideFromSearch?: boolean;
    limitPurchase?: boolean;
  };
  requiredFields?: string[];
  suggestedActions: string[];
}

// ✅ تم نقلها بالكامل:
export interface ProductKindSelectionResult {
  kind: ProductKind;
  allowed: boolean;
  reason?: string;
  requiredFields: string[];
  hiddenFields: string[];
  suggestedFields: string[];
  complianceLevel: "low" | "medium" | "high";
  validationRules: {
    requireImages: boolean;
    minDescriptionLength: number;
    minPrice?: number;
    maxPrice?: number;
  };
  nextSteps: string[];
}

export interface FieldVisibility {
  showInventory: boolean;
  showShipping: boolean;
  showDimensions: boolean;
  showWeight: boolean;
  showExpiryDate: boolean;
  showDigitalDelivery: boolean;
  showServiceDetails: boolean;
  showWarranty: boolean;
  showSizeGuide: boolean;
}

export interface KindBasedValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}
