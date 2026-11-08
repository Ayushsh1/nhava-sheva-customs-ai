# Technical Design Document (TDD)
## AI Document Extraction & Cross-Check Tool for Import Shipments

**Client:** Company A, Navi Mumbai  
**Operating Location:** Port INNSA (Nhava Sheva Sea Port), Maharashtra, India  
**Industry:** Freight Forwarding & Customs Brokerage  
**Candidate Submission For:** Internship Role at ISOCODE LABS  
**Target Delivery Window:** 6 Weeks (MVP Core Slice)  
**Submission Date:** November 2026  

---

### Links & Metadata
- **Public GitHub Repository URL:** `https://github.com/Ayushsh1/nhava-sheva-customs-ai`
- **Primary Port Code:** `INNSA` (Jawaharlal Nehru Port Trust / Nhava Sheva Sea Port)

---

## 1. Executive Summary & Problem Context

Company A operates a freight forwarding and customs brokerage agency in Navi Mumbai handling **1,100 import consignments per month** with an 85-person staff, including a dedicated 14-person documentation team.

### The Problem
Importers submit Commercial Invoices (CI), Packing Lists (PL), and Bills of Lading (BL) in varying formats (PDFs, multi-page scans, phone camera photos). Documentation executives manually transcribe data into Excel checklists and subsequently into customs filing software (ICEGATE / Bill of Entry software). Discrepancies (e.g., invoice total arithmetic, weight mismatches between CI and PL, container number typos) are frequently detected late or after filing, requiring manual resolution through informal WhatsApp groups.

### Financial & Operational Impact (Brief Assumptions)
- **Manual Data-Entry Time:** 1,100 shipments/mo × 0.75 hrs × 12 mos = **9,900 hours/yr**
- **Labor Cost of Manual Entry:** 9,900 hrs × ₹350/hr = **₹34.65 Lakhs/yr**
- **Error-Related Discrepancies:** 13,200 shipments/yr × 3% = **396 penalty/amendment cases/yr**
- **Cost of Discrepancies & Amendments:** 396 cases × ₹9,000 = **₹35.64 Lakhs/yr**
- **Total Annual Cost Burden:** **₹70.29 Lakhs/year**

### Solution Delivered
A deterministic, AI-assisted document ingestion and multi-document verification tool that:
1. Ingests and processes multi-page CI, PL, and BL documents.
2. Extracts structured party, commodity, valuation, weight, and transport fields with field-level confidence scores.
3. Provides a side-by-side verification workspace with document visualization and human confirmation for low-confidence (<70%) values.
4. Executes a 5-point cross-document validation engine that halts export on critical discrepancies (e.g., the 45 kg gross-weight difference in test shipment SHP-24811).
5. Exports validated records into the client's customs filing CSV format (ICEGATE Port INNSA import layout).

---

## 2. Architecture & Rationale

### 2.1 System Architecture Overview

```
+-----------------------------------------------------------------------------+
|                                CLIENT TIER                                  |
|   React 19 + TypeScript SPA (Vite, Tailwind CSS, Lucide Icons, Motion)       |
|                                                                             |
|  [Shipment List & KPIs] <---> [Side-by-Side Review] <---> [Cross-Check View] |
|            ^                             ^                         ^        |
|            |                             |                         |        |
|     (Role: Executive)             (Role: Manager)            (CSV Export)   |
+-----------------------------------------------------------------------------+
                                      |
                     REST APIs (JSON / Multipart Base64)
                                      v
+-----------------------------------------------------------------------------+
|                           FULL-STACK SERVER TIER                            |
|                  Node.js Express Server (`server.ts`)                       |
|                                                                             |
|  +--------------------+  +----------------------+  +---------------------+  |
|  | /api/extract       |  | /api/health          |  | Vite Middleware     |  |
|  | Base64 Doc Stream  |  | Environment Status   |  | (HMR / SPA Dev)     |  |
|  +--------------------+  +----------------------+  +---------------------+  |
|            |                                                                |
|            v                                                                |
|  +-----------------------------------------------------------------------+  |
|  |                     VISION AI INGESTION ENGINE                        |  |
|  |      `@google/genai` TypeScript SDK (Server-Side Execution Only)      |  |
|  |      Active Model: `gemini-3.8-flash`                                 |  |
|  |      Payload: inlineData (base64) + Schema Structured JSON Output     |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  |               DETERMINISTIC 5-POINT CROSS-CHECK ENGINE                |  |
|  | 1. Invoice Arithmetic (Items Sum vs Total + Charges)                  |  |
|  | 2. Package Count Consistency across CI, PL, BL                         |  |
|  | 3. Gross Weight Cross-Verification (Highlights 45kg Mismatch)         |  |
|  | 4. Net Weight Cross-Verification                                       |  |
|  | 5. ISO 6346 Container Number Matching                                 |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  |                  AUDIT TRAIL & PERMISSION GATEWAY                     |  |
|  |  - Field-level mutation logs (User, Timestamp, Old/New Value, Reason) |  |
|  |  - Export blocker evaluator (Zero unresolved errors required)         |  |
|  +-----------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------+
```

### 2.2 Architectural Decisions & Trade-offs
1. **Server-Side AI API Proxying:**
   - *Decision:* The `@google/genai` SDK is called exclusively on the Express backend (`server.ts`).
   - *Rationale:* Completely prevents exposing `GEMINI_API_KEY` to the client browser, satisfies DPDP Act 2023 zero-client-leakage requirements, and enables server-authoritative payload validation.
2. **Deterministic Rules Engine Decoupled from Vision AI:**
   - *Decision:* Cross-document comparisons are executed by deterministic mathematical rules (`src/utils/validation.ts`) rather than asking the LLM if two numbers match.
   - *Rationale:* LLMs can hallucinate arithmetic parity or soften discrepancies. A pure code engine guarantees that a 45 kg weight difference (3,120 kg vs 3,165 kg) will **never** be silently overlooked.
3. **Structured Confidence Scoring (0.00 – 1.00):**
   - *Decision:* Every extracted field carries confidence score, source document tag, and confirmation status.
   - *Rationale:* Enforces the human-in-the-loop requirement: values <70% are highlighted in red and block export until explicitly confirmed by a human executive.
4. **Isolated Customs Export Adapter:**
   - *Decision:* Export logic is encapsulated in `src/utils/exportCsv.ts`.
   - *Rationale:* Allows easy adjustment when the client transitions from generic templates to their specific ICEGATE / Bill of Entry software layout without modifying UI or validation code.

---

## 3. Data Model

The data model is defined in `src/types/shipment.ts`:

### 3.1 Core Entities

```typescript
// Field-level wrapper
export interface ExtractedField<T = string> {
  value: T;
  confidence: number;      // 0.0 to 1.0 (e.g., 0.96)
  sourceDoc: 'invoice' | 'packing_list' | 'bill_of_lading';
  sourcePage?: number;
  confirmed: boolean;      // Human confirmed flag
  status: 'extracted' | 'low_confidence' | 'manual_entry' | 'confirmed' | 'corrected';
  originalValue?: T;
}

// Line Item
export interface LineItem {
  id: string;
  itemDescription: ExtractedField<string>;
  hsnCode: ExtractedField<string>;
  quantity: ExtractedField<number>;
  uom: ExtractedField<string>;
  unitPrice: ExtractedField<number>;
  lineAmount: ExtractedField<number>;
}

// Shipment Root Entity
export interface Shipment {
  id: string;                             // e.g., 'SHP-24811'
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: 'Draft' | 'Processing' | 'Needs Review' | 'Ready to Export' | 'Exported' | 'Manager Review';
  documents: {
    invoice?: DocumentUpload;
    packing_list?: DocumentUpload;
    bill_of_lading?: DocumentUpload;
  };
  parties: ShipmentParties;               // Exporter, Importer, IEC, Notify
  invoice: InvoiceDetails;                 // Inv No, Date, Incoterm, Total, LineItems
  packing: PackingDetails;                 // Packages, Net Wt, Gross Wt, Containers
  transport: TransportDetails;             // BL No, Date, Vessel, Loading & Discharge Ports
  crossChecks: CrossCheckRuleResult[];    // 5-Point Validation Outputs
  auditLog: AuditLogEntry[];              // Immutable Change History
  managerApproval?: {
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: string;
    remarks?: string;
  };
}
```

---

## 4. Main User Flows

### Flow 1: Shipment Creation & AI Extraction
1. User clicks **"Create & Extract Shipment"**.
2. User selects an assessment test preset (e.g. `SHP-24811` with the 45kg discrepancy) or uploads custom PDF/image files for CI, PL, and BL.
3. System validates file size (<= 15MB) and MIME types.
4. User clicks **"Run AI Extraction"**. The UI displays progress through 3 explicit stages:
   - Stage 1: Document Ingestion & Validation
   - Stage 2: Gemini Vision AI Field Extraction
   - Stage 3: Deterministic 5-Point Cross-Checks
5. Shipment opens automatically in the **Side-by-Side Review Workspace**.

### Flow 2: Side-by-Side Verification & Discrepancy Resolution
1. **Left Pane:** Displays high-resolution source document (with tabs to toggle between Invoice, Packing List, and Bill of Lading, page navigation, and zoom controls).
2. **Right Pane:** Displays extracted fields categorized into Parties, Commercial Invoice, Packing, and Transport.
3. **Discrepancy Surfacing:** If a cross-check fails (e.g. Gross Weight 3,120 kg vs 3,165 kg), a red alert banner appears both at the top of the workspace and directly on the Gross Weight field card.
4. **Resolution Modal:** Executive clicks **"Resolve Mismatch"**, reviews the competing source values, selects which document to adopt (e.g. Packing List 3,165 kg because pallet tare was included), enters a mandatory audit justification note, and saves.
5. System recalculates cross-checks; the check turns green (`PASSED (Human Reconciled)`); and the audit log records the user's name, timestamp, and explanation.

### Flow 3: Customs CSV Export
1. Executive clicks **"Export Customs CSV"**.
2. The export evaluator checks for blockers:
   - Unresolved failed cross-checks?
   - Unconfirmed low-confidence (<70%) fields?
   - Missing mandatory fields (IEC, Invoice No, BL No, Gross Wt)?
3. If blocked: Shows red warning with direct navigation to the offending fields.
4. If valid: Renders the preview of the Indian Customs ICEGATE Bill of Entry layout and enables **"Download Filing CSV"**.

### Flow 4: Manager Quality Assurance & Reporting
1. Manager switches role to **Rajesh Nair (Documentation Manager)**.
2. Navigates to **"Manager Analytics & Audit"** tab.
3. Reviews field-level accuracy graphs across historical 200 shipments (HSN 91.6%, Weights 94.8%, Invoices 99.4%).
4. Inspects the **Supplier Discrepancy Matrix** to identify chronic error sources (e.g., Company B China having frequent tare weight omissions).
5. Reviews and signs off on high-value or exception shipments.

---

## 5. AI Extraction Pipeline & Confidence Handling

- **Model Selected:** `gemini-3.8-flash` via `@google/genai`
- **Modality:** Multimodal document image / PDF base64 input with structured JSON schema output (`responseMimeType: "application/json"`).
- **Confidence Calibration:**
  - `High Confidence (>= 90%)`: Displayed in green. Eligible for bulk "Confirm All High-Confidence" action.
  - `Medium Confidence (70% - 89%)`: Displayed in amber.
  - `Low Confidence (< 70%)`: Displayed in red with an alert icon. **Blocks customs export until confirmed by an authorized human.**
- **Fault Tolerance:** If offline or if the API key is not yet set, the engine falls back gracefully to a deterministic extractor for the test presets so review and cross-check testing are 100% operational without breakage.

---

## 6. Deterministic Cross-Document Validation Logic

Section 6.5 of the brief mandates 5 checks. Implemented in `src/utils/validation.ts`:

| Check ID | Rule Name | Inputs Compared | Pass Criteria | Handling of Missing |
| :--- | :--- | :--- | :--- | :--- |
| `invoice_arithmetic` | Invoice Arithmetic Integrity | `invoiceTotal` vs `sum(lineItems) + freight + insurance` | Variance < 0.05 currency units | Marked `NOT_AVAILABLE` if lines or total absent. |
| `package_count` | Package Count Consistency | CI packages vs PL packages vs BL packages | All available values match exactly | Marked `NOT_AVAILABLE` if present on <2 documents. |
| `gross_weight` | Gross Weight Verification | CI Gross Wt vs PL Gross Wt vs BL Gross Wt | Variance <= tolerance (0 kg default) | Flags 45kg difference in SHP-24811; marked `NOT_AVAILABLE` if on <2 docs. |
| `net_weight` | Net Weight Verification | CI Net Wt vs PL Net Wt vs BL Net Wt | Variance <= tolerance (0 kg default) | Marked `NOT_AVAILABLE` if present on <2 documents. |
| `container_numbers` | Container ID Cross-Match | PL container array vs BL container array | Exact set equivalence (ISO 6346) | Marked `NOT_AVAILABLE` if containers absent on either doc. |

> **Critical Rule:** Missing values are **never silently treated as a match**. They are assigned the distinct status `NOT_AVAILABLE`, distinguishing them from `PASSED` and `FAILED`.

---

## 7. UI & UX Design Decisions

- **Color Palette & Visual Restraint:** Professional slate and navy foundation (`#0f172a`, `#1e293b`) with purposeful semantic accents (emerald for passed, rose for discrepancy, amber for review).
- **Side-by-Side Desktop Presence:** Designed specifically for documentation workstations in Navi Mumbai—document viewer on left (with zoom & tabs) and review cards on right.
- **Micro-Copy & Customs Nomenclature:** Uses authentic Indian customs terminology: Port INNSA (Nhava Sheva), Importer-Exporter Code (IEC), Home Consumption Bill of Entry (BE), and ICEGATE layout headers.
- **Zero Pill / Anti-AI Clutter:** Clean, structured cards with clear typographic hierarchy, avoiding floating widgets or chatbots.

---

## 8. Data Privacy, DPDP Act 2023 & Security Constraints

- **DPDP Act 2023 Compliance:** Importer and consignee names, addresses, and IEC numbers are handled as regulated commercial identity data. Client data is transmitted strictly over TLS.
- **Zero Model Training Retention:** System instructions and API configurations use enterprise terms where document inputs are never used to train foundational AI models.
- **Zero Secrets Committed:** All secrets are externalized to environment variables (`.env`). No API keys or credentials appear in frontend bundles or repository code.
- **Immutable Audit Trail:** All field modifications, resolutions, and approvals record user identity, timestamp, before/after values, and mandatory business justifications.

---

## 9. Explicitly Labelled Assumptions

As requested by Section 11 of the product brief:

1. **Assumption (Synthetic Test Data):** Reviewer demo accounts (`Priya Sharma` - Executive, `Rajesh Nair` - Manager) and test shipments (`SHP-24811`, `SHP-24812`, `SHP-24815`) use synthetic seed data representing Company A's live operational profile.
2. **Assumption (CSV Filing Template):** Until Company A connects directly to their proprietary EDI provider, the export engine produces standard Indian Customs ICEGATE Bill of Entry format for Port INNSA.
3. **Assumption (Multi-Item & Multi-Container Cargo):** The data model and UI support multi-line commodity manifests and multiple 20ft/40ft containers, even though the brief's Section 10 sample provided single-line items.
4. **Assumption (Gross Weight Discrepancy Tolerance):** Default tolerance between Commercial Invoice and Packing List is set to `0.0 kg` because Indian customs port weighment receipts require zero unrecorded variance.
5. **Assumption (Manager Approval Gate):** Managers can approve or reject exception consignments; export is blocked on unverified discrepancies regardless of role.

---

## 10. Scope Cuts & Future Roadmap

### Handled in Current Build (MVP Core Slice)
- Complete shipment lifecycle: Creation -> Document Upload -> AI Extraction -> Side-by-Side Review -> 5-Point Cross-Checks -> Discrepancy Resolution -> Customs CSV Export.
- Role-based permissions (Executive & Manager).
- Seeded test cases including SHP-24811 with the 45kg discrepancy.
- Comprehensive automated test suite (`validation.test.ts`).
- Historical accuracy and supplier risk analytics.

### Future Roadmap (Post-Internship Phase)
- **Direct ICEGATE EDI Gateway Integration:** Direct SFTP / API upload of XML Bill of Entry files into Indian Customs ICEGATE server.
- **Automated HSN Tariff Code Recommender:** Cross-referencing item descriptions with the 8-digit Indian Customs Tariff Schedule.
- **Multi-lingual OCR:** Support for Mandarin and Japanese packing slips with automated translation to English for Indian customs filing.
