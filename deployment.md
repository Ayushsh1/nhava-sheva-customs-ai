# Deployment & Local Setup Guide

## Nhava Sheva Customs AI — Import Shipment Document Extraction & Cross-Check Tool
**Client:** Company A, Navi Mumbai  
**Submission For:** ISOCODE LABS Internship Assessment  

---

## 1. Quick Reviewer Demo Credentials

The application includes an in-app **Role Switcher** located in the top-right corner of the navigation bar. You can switch instantly between these realistic roles:

| User Name | Role | Access Level | Primary Review Focus |
| :--- | :--- | :--- | :--- |
| **Priya Sharma** | `executive` (Documentation Executive) | Create shipments, upload documents, review extracted fields, resolve cross-checks, export CSV | Try resolving the 45kg discrepancy in `SHP-24811` and exporting `SHP-24815` |
| **Rajesh Nair** | `manager` (Documentation Manager) | Review discrepancy resolutions, sign off / approve shipments, inspect field-level accuracy & supplier analytics | Access the **"Manager Analytics & Audit"** dashboard to view the 200-shipment accuracy benchmark |

---

## 2. Environment Variables

Create a `.env` file in the project root based on `.env.example`. 

> **Important Security Notice:** As per the project brief instructions, only environment variable *names* are documented here, never their secret values.

| Variable Name | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Optional / Recommended | API key for server-side Google GenAI Vision document extraction (`gemini-3.8-flash`). In AI Studio, this is injected automatically from the Secrets panel. | *Injected at runtime* |
| `PORT` | Optional | Port on which the Express server listens. | `3000` |
| `NODE_ENV` | Optional | Set to `production` or `development`. | `development` |
| `APP_URL` | Optional | The URL where the app is hosted (injected in AI Studio). | `http://localhost:3000` |

*Note:* If `GEMINI_API_KEY` is not provided, the application runs seamlessly in offline/demonstration mode using high-fidelity deterministic extractors for all test datasets (including `SHP-24811` with the 45kg discrepancy).

---

## 3. Local Setup Instructions (Step-by-Step)

### Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **npm:** v9.0.0 or higher
- **Git**

### Step 1: Clone the Repository
```bash
git clone https://github.com/ayushshende202/nhava-sheva-customs-ai.git
cd nhava-sheva-customs-ai
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
```bash
cp .env.example .env
# Optional: Add your GEMINI_API_KEY in .env if testing live AI extraction on personal documents
```

### Step 4: Run Automated Verification Tests
Run the deterministic cross-check logic tests (Node.js test runner via `tsx`):
```bash
npm test
```
*Expected Result:* 7 passed tests covering the 45kg weight discrepancy detection, arithmetic validation, container matching, and export gating.

### Step 5: Start the Development Server
```bash
npm run dev
```
The server will start at:
```
http://localhost:3000
```
Open this URL in any modern web browser (Google Chrome, Firefox, Safari, Edge).

---

## 4. Production Build & Deployment

### Step 1: Build the Frontend Bundle
```bash
npm run build
```
This produces an optimized production bundle in the `dist` directory.

### Step 2: Run Production Server
```bash
npm run start
```
The Express server (`server.ts`) will serve the static files and handle API endpoints on the configured `PORT`.

---

## 5. Verification Checklist for Evaluator

1. **Verify Section 10 Sample (SHP-24811):**
   - Click on `SHP-24811` in the shipments table.
   - Observe the prominent red banner: `Gross Weight Mismatch: 45.0 kg discrepancy`.
   - Toggle between **Commercial Invoice** (states `3,120 kg`) and **Packing List** (states `3,165 kg`) in the side-by-side document viewer.
   - Click **"Export Readiness"** to verify that export is **strictly blocked** while this mismatch remains unresolved.
   - Switch to the **"5-Point Cross-Checks"** tab, click **"Resolve Mismatch"**, select the confirmed weight, enter an audit justification, and confirm.
   - Verify that the status updates to `Ready to Export`.

2. **Verify Customs CSV Export:**
   - Select shipment `SHP-24815` (Solar PV Modules).
   - Click **"Export Customs CSV"**.
   - Review the generated ICEGATE import format with Port INNSA headers.
   - Click **"Download Filing CSV"** to receive the `.csv` file.

3. **Verify Manager Dashboard:**
   - Switch role to **Rajesh Nair (Documentation Manager)** in the top bar.
   - Click on the **"Manager Analytics & Audit"** navigation tab.
   - Review the field accuracy distribution across 200 historical consignments and the supplier discrepancy matrix.
