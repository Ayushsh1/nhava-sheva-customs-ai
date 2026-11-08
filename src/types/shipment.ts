/**
 * Types for Nhava Sheva Import Shipment AI Document Extraction & Cross-Check Tool
 * Corresponds to brief requirements for Company A, Navi Mumbai
 */

export type DocumentType = 'invoice' | 'packing_list' | 'bill_of_lading';

export type ShipmentStatus = 
  | 'Draft'
  | 'Processing'
  | 'Needs Review'
  | 'Ready to Export'
  | 'Exported'
  | 'Manager Review';

export type UserRole = 'executive' | 'manager';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  email: string;
}

export interface ExtractedField<T = string> {
  value: T;
  confidence: number; // 0.0 - 1.0
  sourceDoc: DocumentType;
  sourcePage?: number;
  confirmed: boolean;
  status: 'extracted' | 'low_confidence' | 'manual_entry' | 'confirmed' | 'corrected';
  originalValue?: T;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
  };
}

export interface LineItem {
  id: string;
  itemDescription: ExtractedField<string>;
  hsnCode: ExtractedField<string>;
  quantity: ExtractedField<number>;
  uom: ExtractedField<string>;
  unitPrice: ExtractedField<number>;
  lineAmount: ExtractedField<number>;
}

export interface DocumentUpload {
  type: DocumentType;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  previewUrl?: string;
  status: 'ready' | 'processing' | 'processed' | 'error';
  errorMessage?: string;
  pageCount?: number;
}

export interface ShipmentParties {
  shipmentRef: ExtractedField<string>;
  supplierName: ExtractedField<string>;
  supplierAddress: ExtractedField<string>;
  supplierCountry: ExtractedField<string>;
  importerName: ExtractedField<string>;
  importerIec: ExtractedField<string>;
  importerAddress: ExtractedField<string>;
  notifyParty: ExtractedField<string>;
}

export interface InvoiceDetails {
  invoiceNumber: ExtractedField<string>;
  invoiceDate: ExtractedField<string>;
  currency: ExtractedField<string>;
  incoterm: ExtractedField<string>;
  invoiceTotal: ExtractedField<number>;
  subtotal: ExtractedField<number>;
  freightCharges: ExtractedField<number>;
  insuranceCharges: ExtractedField<number>;
  lineItems: LineItem[];
}

export interface PackingDetails {
  packageCount: ExtractedField<number>;
  packageType: ExtractedField<string>;
  netWeightKg: ExtractedField<number>;
  grossWeightKg: ExtractedField<number>;
  dimensions?: ExtractedField<string>;
  containerNumbers: ExtractedField<string[]>;
}

export interface TransportDetails {
  blNumber: ExtractedField<string>;
  blDate: ExtractedField<string>;
  vesselName: ExtractedField<string>;
  portOfLoading: ExtractedField<string>;
  portOfDischarge: ExtractedField<string>; // INNSA - Nhava Sheva
  carrierName: ExtractedField<string>;
}

export type CrossCheckStatus = 'PASSED' | 'FAILED' | 'NOT_AVAILABLE';

export interface CrossCheckRuleResult {
  id: 'invoice_arithmetic' | 'package_count' | 'gross_weight' | 'net_weight' | 'container_numbers';
  title: string;
  category: 'Arithmetic' | 'Quantity' | 'Weight' | 'Equipment';
  status: CrossCheckStatus;
  description: string;
  severity: 'blocking' | 'warning';
  docValues: {
    invoice?: string | number;
    packing_list?: string | number;
    bill_of_lading?: string | number;
  };
  discrepancyDelta?: string;
  message: string;
  resolved: boolean;
  resolvedValue?: string | number;
  resolvedReason?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'field_edit' | 'field_confirm' | 'cross_check_resolve' | 'status_change' | 'export_generated' | 'manager_approval';
  fieldKey?: string;
  fieldLabel?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}

export interface Shipment {
  id: string; // e.g., SHP-24811
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: ShipmentStatus;
  documents: {
    invoice?: DocumentUpload;
    packing_list?: DocumentUpload;
    bill_of_lading?: DocumentUpload;
  };
  parties: ShipmentParties;
  invoice: InvoiceDetails;
  packing: PackingDetails;
  transport: TransportDetails;
  crossChecks: CrossCheckRuleResult[];
  auditLog: AuditLogEntry[];
  managerApproval?: {
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: string;
    remarks?: string;
  };
  exportMetadata?: {
    exportedAt?: string;
    exportedBy?: string;
    csvFilename?: string;
    rowCount?: number;
  };
}

export interface SupplierAnalytics {
  supplierName: string;
  country: string;
  shipmentCount: number;
  accuracyRate: number; // percentage
  avgDiscrepanciesPerShipment: number;
  commonIssues: string[];
}
