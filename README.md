# Nhava Sheva Customs AI

Import shipment document extraction and cross-checking tool for customs documentation teams in Navi Mumbai.

The application provides a shipment review workspace for extracting, validating, resolving, and exporting data from:

- Commercial invoices
- Packing lists
- Bills of lading

It includes document field review, cross-document discrepancy detection, audit history, role-based demo views, manager analytics, and ICEGATE-oriented CSV export.

## Features

- Shipment list with seeded demonstration consignments
- Gemini Vision document extraction through the server-side API
- Deterministic offline/demo extraction when no Gemini API key is configured
- Field-level confidence, source document, and confirmation status
- Cross-checks for weights, quantities, values, containers, and transport details
- Audit trail for field edits and discrepancy resolutions
- Executive and manager role switcher
- Manager analytics and supplier discrepancy views
- Customs CSV export with export-readiness validation

## Requirements

- Node.js 18 or newer (Node.js 20+ recommended)
- npm 9 or newer
- A Google Gemini API key for live document extraction

## Installation

```bash
npm install
```

Create a `.env` file in the project root using `.env.example` as a template:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
NODE_ENV=development
```

`GEMINI_API_KEY` is optional for the seeded demo experience. Without it, the application continues to run with its deterministic demonstration data and extraction fallback. Never commit a real API key.

## Running locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The development server combines Express and Vite. It serves the React application and exposes the API from the same origin.

> **Windows note:** If the project is located in a directory whose name contains `&`, run the command from a shell that correctly quotes the working directory, or move/rename the project directory to avoid shell path parsing issues.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Express/Vite development server |
| `npm run build` | Create the production frontend bundle in `dist` |
| `npm start` | Start the production server |
| `npm run preview` | Preview the Vite production build |
| `npm test` | Run validation tests |
| `npm run lint` | Run the TypeScript compiler without emitting files |
| `npm run clean` | Remove the `dist` directory |

For a step-by-step deployment and evaluator walkthrough, see [deployment.md](./deployment.md).

## API endpoints

### `GET /api/health`

Returns server status and whether `GEMINI_API_KEY` is configured.

Example:

```json
{
  "status": "ok",
  "hasGeminiKey": false
}
```

### `POST /api/extract`

Accepts shipment documents as base64-encoded content and returns structured extracted shipment data.

The request may include:

- `documents`: invoice, packing list, and/or bill of lading files
- `shipmentRef`: optional shipment reference
- `presetType`: optional demonstration preset

The server accepts JSON request bodies up to 50 MB. See [server.ts](./server.ts) for the complete request handling and response schema.

## Project structure

```text
src/
  components/       React UI components
  data/             Seed shipments and demo users
  types/            Shared TypeScript types
  utils/            Validation and CSV export helpers
  App.tsx           Application shell and state management
server.ts           Express API and Vite integration
vite.config.ts      Vite and Tailwind configuration
```

## Demo workflow

1. Select a shipment from the shipment list.
2. Review extracted fields and their source documents.
3. Open the cross-checks tab to inspect discrepancies.
4. Resolve any blocking discrepancy with an audit justification.
5. Export the shipment only after it becomes export-ready.
6. Switch to the manager role to inspect analytics and audit information.

The seeded shipment `SHP-24811` demonstrates a gross-weight discrepancy, while `SHP-24815` can be used to review the customs CSV export flow. Additional evaluator details are available in [deployment.md](./deployment.md).

## Production

Build the frontend and start the Express server:

```bash
npm run build
NODE_ENV=production npm start
```

The server listens on `PORT`, defaulting to `3000`, serves the built `dist` directory, and retains the `/api/health` and `/api/extract` endpoints.
