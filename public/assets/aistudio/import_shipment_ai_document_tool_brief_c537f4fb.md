# AI Document Extraction & Cross-Check Tool for Import Shipments

## Product brief

**Client:** Company A, Navi Mumbai\
**Industry:** Freight forwarding and customs brokerage\
**Location:** Nhava Sheva, India\
**Team:** 85 staff, including a 14-person documentation team\
**Project budget:** ₹7.5 lakh\
**Target delivery:** 6 weeks

------------------------------------------------------------------------

## 1. Problem statement

Importers currently send commercial invoices, packing lists, and bills
of lading as PDFs, scans, or photos. Documentation executives manually
retype the information into Excel checklists and then into customs
filing software. When a discrepancy is found, senior staff raise
questions through a WhatsApp group.

The client wants a tool that extracts shipment information from uploaded
documents, highlights uncertain values, identifies inconsistencies
across documents, and prepares a file for import into the existing
customs filing software. The existing filing software must remain
unchanged.

## 2. Business impact

The following figures are estimates supplied in the problem statement.

  -----------------------------------------------------------------------
  Metric                            Calculation   Estimated annual impact
  ------------------- ------------------------- -------------------------
  Manual data-entry     1,100 shipments/month ×               9,900 hours
  time                   0.75 hours × 12 months 

  Cost of data entry    9,900 hours × ₹350/hour               ₹34.65 lakh

  Error-related cases   13,200 shipments/year ×                 396 cases
                                             3% 

  Cost of                          396 × ₹9,000               ₹35.64 lakh
  error-related cases                           

  **Total estimated   ₹34.65 lakh + ₹35.64 lakh           **₹70.29 lakh**
  annual cost**                                 
  -----------------------------------------------------------------------

The figures are assumptions from the brief and should be validated with
the client before being treated as measured results.

## 3. Users and roles

  -----------------------------------------------------------------------
  User                                Responsibilities
  ----------------------------------- -----------------------------------
  Documentation executive             Creates shipment records, uploads
                                      documents, reviews extracted data,
                                      corrects fields, and resolves
                                      validation issues.

  Documentation manager               Reviews and approves shipment data,
                                      monitors exceptions, and views
                                      accuracy and correction reports.

  Importer                            Sends shipment documents and
                                      answers queries. Importer-facing
                                      messaging is outside the core
                                      build.

  Managing Director                   Business decision-maker who signs
                                      off on the purchase.
  -----------------------------------------------------------------------

The core build requires two application roles: **documentation
executive** and **documentation manager**.

## 4. Product goals

1.  Reduce manual shipment data-entry time from 45 minutes to under 15
    minutes.
2.  Achieve at least 95% field-level accuracy on a test set of 200
    historical shipments.
3.  Detect document mismatches before export.
4.  Reduce amended Bills of Entry by 50% within three months.
5.  Preserve the client's existing customs filing workflow by exporting
    data in its Excel/CSV import layout.

## 5. Scope

### Core build --- required

The candidate must deliver a working end-to-end slice in approximately
6--8 screens:

-   Shipment list and shipment status.
-   Shipment creation and document upload.
-   Upload of invoice, packing list, and bill of lading.
-   AI extraction of shipment fields with confidence scores.
-   Side-by-side document and field review.
-   Cross-document validation and mismatch highlighting.
-   CSV export after all blocking issues are resolved.
-   Role-based access for documentation executives and managers.
-   Realistic seeded sample data.

### Additional depth --- optional

The wider product request also mentions:

-   Edit history.
-   Accuracy reporting by field and supplier.
-   Manager approval workflow.
-   Supplier-level performance insights.

These are useful extensions, but should not compromise the quality of
the required core workflow.

### Explicitly out of scope

-   Filing directly on the customs portal.
-   HSN classification.
-   Customs duty calculation.
-   Customer tracking portal.
-   Real payment processing, external messaging, or integration with
    outside systems.

## 6. Functional requirements

### 6.1 Shipment management

-   Create and view shipment records.
-   Display shipment ID, supplier, document status, review status, and
    export status.
-   Support filtering or searching the shipment list.
-   Show clear states such as Draft, Processing, Needs Review, Ready to
    Export, and Exported.

### 6.2 Document upload

-   Allow users to upload an invoice, packing list, and bill of lading
    against a shipment.
-   Accept PDF files, scanned PDFs, and image files.
-   Associate each uploaded file with its document type.
-   Validate file type and size.
-   Show upload and processing progress.
-   Provide a useful error state for unsupported, corrupt, or unreadable
    files.

### 6.3 AI extraction

The vision AI model should extract the following information where
available:

**Shipment and parties** - Shipment ID or reference. - Supplier/exporter
name and address. - Importer/consignee name and address. - Notify party,
where present.

**Invoice details** - Invoice number. - Invoice date. - Currency. -
Incoterm. - Invoice total.

**Line items** - Item description. - HSN code as printed on the
document. - Quantity. - Unit of measure. - Unit price. - Line amount.

**Packing and transport details** - Number and type of packages. - Net
weight. - Gross weight. - Container number(s). - Bill of lading number
and date, where present.

The model must return a confidence score for each extracted field and
identify the source document/page when possible.

### 6.4 Review and correction

-   Display the source document beside the extracted fields.
-   Highlight low-confidence values clearly.
-   Show failed cross-checks next to the affected fields.
-   Allow users to edit extracted values.
-   Require human confirmation for low-confidence or mismatched values.
-   Record corrections with the user, timestamp, previous value, and
    corrected value.
-   Route unreadable pages or missing values to manual entry.

### 6.5 Cross-document checks

At minimum, implement these checks:

1.  **Invoice arithmetic:** Compare the invoice total with the sum of
    line-item amounts, accounting for any explicitly stated charges,
    discounts, taxes, or rounding where the document provides them.
2.  **Package count:** Compare package count and package descriptions
    across the invoice, packing list, and bill of lading wherever the
    values are present.
3.  **Gross weight:** Compare gross weight across the invoice, packing
    list, and bill of lading wherever the values are present.
4.  **Net weight:** Compare net weight across documents wherever the
    values are present.
5.  **Container numbers:** Compare container identifiers across the
    packing list and bill of lading wherever they are present.

Do not silently treat missing information as a match. Mark a check as
**Not available** when a required value is absent, and distinguish that
from **Passed** and **Failed**.

Use configurable tolerances only where justified by the source documents
or an explicitly labelled product assumption. Preserve the original
values so reviewers can see exactly what disagreed.

### 6.6 Export

-   Generate a CSV file in the agreed filing-software import layout.
-   Do not enable export while blocking low-confidence fields or failed
    checks remain unresolved.
-   Validate required fields before generating the file.
-   Show a clear export-ready state and provide a download action.
-   Keep the export format isolated so it can be adjusted to the
    client's actual import template.

### 6.7 Roles and access

-   Documentation executives can create shipments, upload documents,
    review and correct extracted fields, and export only when validation
    requirements are met.
-   Documentation managers can access manager review and reporting
    capabilities.
-   Enforce permissions on the backend, not only by hiding frontend
    controls.

## 7. AI behaviour and failure handling

The AI component must perform real document extraction; it must not
return hard-coded or fabricated results.

For every field, retain: - Extracted value. - Confidence score. - Source
document and page, where available. - Extraction status. -
Human-confirmation status. - Corrected value and correction history, if
changed.

### Required handling

  -----------------------------------------------------------------------
  Situation                           Expected behaviour
  ----------------------------------- -----------------------------------
  High-confidence extraction with     Display the value as extracted;
  passing checks                      allow normal review.

  Low-confidence extraction           Highlight the field and require
                                      human confirmation.

  Failed cross-check                  Show the conflicting source values
                                      and require a person to resolve the
                                      mismatch.

  Missing field                       Mark it as missing; allow manual
                                      entry if appropriate.

  Unreadable or skewed page           Flag the page for manual review or
                                      entry; do not invent values.

  AI provider error or timeout        Show a retryable error and preserve
                                      uploaded documents.

  Unsupported language or uncertain   Flag the affected fields for manual
  OCR                                 verification.

  Invalid or malformed model response Reject the response, log the
                                      failure, and offer a safe
                                      retry/manual path.
  -----------------------------------------------------------------------

No shipment may be exported until all blocking fields and checks have
been resolved by an authorised user.

## 8. UX and design direction

The client prefers a minimal, professional interface with generous
whitespace, a restrained colour palette, and clear typography. Every
visible control should serve a clear purpose.

### Key screens

1.  **Sign-in:** Simple, secure sign-in with role-aware access.
2.  **Shipment list:** Searchable list with shipment ID, supplier,
    status, last updated time, and clear next action.
3.  **Create shipment / upload:** Shipment details and clearly labelled
    upload areas for invoice, packing list, and bill of lading.
4.  **Extraction progress:** Processing state that explains what is
    happening and identifies failed documents.
5.  **Review workspace:** Main daily-use screen. Keep the document
    viewer and extracted fields side by side. Make uncertain fields and
    failed checks immediately visible.
6.  **Cross-check summary:** Present passed, failed, and unavailable
    checks with source values and a clear resolution action.
7.  **Export:** Show validation readiness, export format, and a clear
    CSV download action.
8.  **Manager / accuracy view:** Optional screen for approval, edit
    history, and accuracy summaries.

Although the client primarily uses desktop computers, the interface
should remain usable on smaller screens. Include loading, empty,
success, and error states.

## 9. Data, privacy, and security constraints

-   Host the application and its data in India.
-   Use role-based access control.
-   Use an AI provider whose terms and configuration ensure client data
    is not used to train its models.
-   Treat importer contact details as personal data under the Digital
    Personal Data Protection Act, 2023.
-   Do not place secrets, API keys, credentials, or real personal data
    in the public repository.
-   Validate uploaded files and user inputs.
-   Restrict access to shipment documents and exports by role.
-   Keep an audit trail for corrections and important actions.
-   Use secure transport and protect stored documents and database
    credentials.
-   Define retention and deletion practices with the client; do not
    assume a retention period that the brief does not specify.

## 10. Sample data supplied

  ------------------------------------------------------------------------------
  Shipment ID Document   Supplier   Item             Qty  Unit price       Gross
                                                                     weight (kg)
  ----------- ---------- ---------- -------- ----------- ----------- -----------
  SHP-24811   Invoice    Company B  LED            2,400    USD 6.80       3,120
                         (China)    panel                            
                                    light                            
                                    40W                              

  SHP-24811   Packing    Company B  LED            2,400         ---       3,165
              list       (China)    panel                            
                                    light                            
                                    40W                              

  SHP-24812   Invoice    Company C  Steel            180   EUR 42.50       1,460
                         (Sweden)   ball                             
                                    valve                            
                                    DN50                             
  ------------------------------------------------------------------------------

The supplied sample shows a 45 kg gross-weight difference between the
invoice and packing list for shipment **SHP-24811**. The product should
surface this as a discrepancy requiring human review, not automatically
choose one value.

The sample does not include a bill of lading or all fields needed for a
complete shipment. Any additional demo values must be clearly labelled
as synthetic seed data and must not be presented as facts from the
brief.

## 11. Assumptions and items to confirm

The brief explicitly asks candidates to label assumptions. The following
are implementation assumptions or open questions, not confirmed client
requirements:

-   **Assumption:** The initial demo can use synthetic users and
    synthetic shipment records.
-   **Assumption:** The CSV export column mapping will be represented by
    a configurable template until the client supplies the actual
    filing-software import layout.
-   **Assumption:** A shipment can contain multiple line items and
    multiple containers, even though the sample contains only one item
    per shipment.
-   **Assumption:** The application will store the original uploaded
    documents and link extracted fields to their source pages when the
    extraction provider supports it.
-   **Assumption:** The manager role can approve or reject a shipment
    before export; the exact approval policy needs client confirmation.
-   **To confirm:** Accepted file types, maximum file size, and maximum
    pages per document.
-   **To confirm:** The exact list of mandatory fields for export.
-   **To confirm:** Currency, weight, quantity, and rounding rules used
    by the client's filing software.
-   **To confirm:** Whether package and weight values must match exactly
    or can differ within an agreed tolerance.
-   **To confirm:** The actual Excel/CSV import template and its
    validation rules.
-   **To confirm:** The approved AI provider, India-region hosting
    arrangement, and data-retention terms.

## 12. Suggested acceptance criteria

The core build is complete when:

-   An authorised user can sign in.
-   An executive can create a shipment and upload its invoice, packing
    list, and bill of lading.
-   The application runs real AI extraction and stores field-level
    confidence scores.
-   The review screen displays the source document and extracted values
    together.
-   Low-confidence fields are visibly highlighted and require
    confirmation.
-   Cross-checks identify invoice arithmetic issues and differences in
    package and weight values across available documents.
-   Missing data is distinguished from a passed check.
-   A user can correct a field and the correction is recorded.
-   Export is blocked while blocking issues remain unresolved.
-   A valid shipment can be exported as CSV in the configured import
    layout.
-   The shipment list reflects the shipment's current status.
-   The most important extraction, validation, permission, and export
    rules have automated tests.
-   The interface includes loading, empty, and error states.
-   No secrets or real personal data are committed to the repository.

## 13. Delivery and evaluation

### Submission package

Submit one ZIP file, no larger than 25 MB, containing exactly:

1.  **Technical Design Document (TDD)** in PDF or Word format.
2.  **`deployment.md`** with local setup, deployment information,
    environment-variable names only, and reviewer demo credentials.

The TDD must place the public GitHub repository URL at the top and
include the live application URL if deployed.

### TDD contents

-   GitHub URL and live application URL.
-   Architecture and rationale.
-   Data model.
-   Main user flows.
-   AI extraction and confidence handling.
-   Cross-document validation logic.
-   UI and design decisions.
-   Scope cuts and future work.
-   Explicitly labelled assumptions.

### `deployment.md` contents

-   Local setup instructions, step by step.
-   Deployment architecture and process.
-   Required environment-variable names, never their values.
-   Demo login details for the reviewer.

### Project rules

-   Use only information in the selected problem statement; label every
    assumption in the TDD.
-   Preserve the Git commit history.
-   Do not commit secrets or real personal data.
-   Keep the repository public until review is complete.
-   Resubmissions are allowed until the deadline; the latest version is
    reviewed.

### Evaluation weights

  Area                Weight
  ----------------- --------
  Quality of work        50%
  Problem solving        30%
  Communication          20%

A strong submission should be a product the client can try, with clean
code, a purposeful interface, realistic sample data, working AI and
validation, clear handling of uncertainty, and honest documentation of
limitations.

## 14. Seven-day execution priority

The assignment allows seven days from the date the step opens.
Prioritise a complete, reliable core workflow over broad but unfinished
functionality.

1.  **Day 1 --- Foundation:** Define the data model, roles, project
    structure, sample records, and shipment list.
2.  **Day 2 --- Upload:** Implement shipment creation, document upload,
    file validation, and storage.
3.  **Day 3 --- Extraction:** Integrate the vision model, parse
    structured output, and persist confidence scores and source
    references.
4.  **Day 4 --- Review:** Build the side-by-side review workspace,
    editable fields, and manual confirmation.
5.  **Day 5 --- Cross-checks:** Implement deterministic validation
    rules, discrepancy states, and export blocking.
6.  **Day 6 --- Export and quality:** Implement CSV export, status
    updates, role checks, and critical automated tests.
7.  **Day 7 --- Polish and submission:** Seed realistic demo data, test
    edge cases, improve UI states, write the TDD and `deployment.md`,
    and prepare the ZIP.

**Priority principle:** Make one shipment flow work from upload through
extraction, human review, cross-check resolution, and CSV export before
spending time on optional reporting or integrations.
