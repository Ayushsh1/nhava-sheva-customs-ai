/**
 * Seed data for Nhava Sheva Customs AI
 * Features sample shipments directly from Section 10 of brief, including SHP-24811's 45kg discrepancy
 */

import { Shipment, User, SupplierAnalytics } from '../types/shipment';
import { evaluateAllCrossChecks } from '../utils/validation';

export const SEED_USERS: User[] = [
  {
    id: 'usr_exec_01',
    name: 'Priya Sharma',
    role: 'executive',
    title: 'Senior Documentation Executive',
    email: 'priya.sharma@companya-logistics.in'
  },
  {
    id: 'usr_mgr_01',
    name: 'Rajesh Nair',
    role: 'manager',
    title: 'Customs Documentation Manager',
    email: 'rajesh.nair@companya-logistics.in'
  }
];

export const SUPPLIER_ANALYTICS: SupplierAnalytics[] = [
  {
    supplierName: 'Company B (China)',
    country: 'China',
    shipmentCount: 48,
    accuracyRate: 89.6,
    avgDiscrepanciesPerShipment: 1.4,
    commonIssues: ['Packing list tare weight omission', 'Unit price rounding variance', 'Carton count translation']
  },
  {
    supplierName: 'Company C (Sweden)',
    country: 'Sweden',
    shipmentCount: 31,
    accuracyRate: 98.2,
    avgDiscrepanciesPerShipment: 0.1,
    commonIssues: ['Incoterm DPU vs DAP distinction']
  },
  {
    supplierName: 'Solis Green Tech Co.',
    country: 'Vietnam',
    shipmentCount: 26,
    accuracyRate: 95.8,
    avgDiscrepanciesPerShipment: 0.4,
    commonIssues: ['Container seal number typographical differences']
  },
  {
    supplierName: 'Nippon Precision Hydraulics',
    country: 'Japan',
    shipmentCount: 19,
    accuracyRate: 99.1,
    avgDiscrepanciesPerShipment: 0.05,
    commonIssues: ['HSN 8-digit suffix formatting']
  }
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  // 1. SHP-24811: Sample from Section 10 of Brief
  {
    id: 'SHP-24811',
    createdAt: '2026-11-06T09:30:00Z',
    updatedAt: '2026-11-07T14:15:00Z',
    createdBy: 'Priya Sharma',
    status: 'Needs Review',
    documents: {
      invoice: {
        type: 'invoice',
        fileName: 'CI_24811_CompanyB_LED_Light.pdf',
        fileSize: 1420000,
        fileType: 'application/pdf',
        uploadedAt: '2026-11-06T09:31:00Z',
        status: 'processed',
        pageCount: 1
      },
      packing_list: {
        type: 'packing_list',
        fileName: 'PL_24811_CompanyB_Packing.pdf',
        fileSize: 980000,
        fileType: 'application/pdf',
        uploadedAt: '2026-11-06T09:31:30Z',
        status: 'processed',
        pageCount: 1
      },
      bill_of_lading: {
        type: 'bill_of_lading',
        fileName: 'BL_MEDU9912048_NhavaSheva.pdf',
        fileSize: 1150000,
        fileType: 'application/pdf',
        uploadedAt: '2026-11-06T09:32:00Z',
        status: 'processed',
        pageCount: 1
      }
    },
    parties: {
      shipmentRef: {
        value: 'SHP-24811',
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      supplierName: {
        value: 'Company B (China) - Foshan Bright Opto Co., Ltd.',
        confidence: 0.96,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      supplierAddress: {
        value: 'No. 18 Nanhai High-Tech Industrial Zone, Foshan, Guangdong, China',
        confidence: 0.94,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      supplierCountry: {
        value: 'CN',
        confidence: 0.98,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      importerName: {
        value: 'Apex Electricals India Private Limited',
        confidence: 0.95,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      importerIec: {
        value: '0308049182',
        confidence: 0.97,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      importerAddress: {
        value: 'Plot 44, MIDC Industrial Area, Turbhe, Navi Mumbai 400705, India',
        confidence: 0.92,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      notifyParty: {
        value: 'Same as Consignee / Company A Customs Brokerage, Nhava Sheva',
        confidence: 0.91,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      }
    },
    invoice: {
      invoiceNumber: {
        value: 'EXP-2026-8819',
        confidence: 0.98,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      invoiceDate: {
        value: '2026-10-24',
        confidence: 0.97,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      currency: {
        value: 'USD',
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      incoterm: {
        value: 'CIF NHAVA SHEVA',
        confidence: 0.95,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      invoiceTotal: {
        value: 16320.00,
        confidence: 0.98,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      subtotal: {
        value: 16320.00,
        confidence: 0.98,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      freightCharges: {
        value: 0.00,
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      insuranceCharges: {
        value: 0.00,
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      lineItems: [
        {
          id: 'item-24811-1',
          itemDescription: {
            value: 'LED panel light 40W 600x600mm Ultra-Slim 4000K',
            confidence: 0.96,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          },
          hsnCode: {
            value: '94054090',
            confidence: 0.65, // LOW CONFIDENCE - Flagged for human review!
            sourceDoc: 'invoice',
            confirmed: false,
            status: 'low_confidence'
          },
          quantity: {
            value: 2400,
            confidence: 0.99,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          },
          uom: {
            value: 'PCS',
            confidence: 0.98,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          },
          unitPrice: {
            value: 6.80,
            confidence: 0.97,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          },
          lineAmount: {
            value: 16320.00,
            confidence: 0.98,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          }
        }
      ]
    },
    packing: {
      packageCount: {
        value: 400,
        confidence: 0.98,
        sourceDoc: 'packing_list',
        confirmed: true,
        status: 'confirmed'
      },
      packageType: {
        value: 'CARTONS (6 PCS/CTN)',
        confidence: 0.95,
        sourceDoc: 'packing_list',
        confirmed: true,
        status: 'confirmed'
      },
      netWeightKg: {
        value: 2880.00,
        confidence: 0.94,
        sourceDoc: 'packing_list',
        confirmed: true,
        status: 'confirmed'
      },
      // Note: CI has 3,120 kg, Packing list has 3,165 kg!
      grossWeightKg: {
        value: 3120.00,
        confidence: 0.95,
        sourceDoc: 'invoice',
        confirmed: false,
        status: 'extracted'
      },
      containerNumbers: {
        value: ['MSCU8129482'],
        confidence: 0.99,
        sourceDoc: 'packing_list',
        confirmed: true,
        status: 'confirmed'
      }
    },
    transport: {
      blNumber: {
        value: 'MEDU9912048',
        confidence: 0.98,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      },
      blDate: {
        value: '2026-10-28',
        confidence: 0.97,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      },
      vesselName: {
        value: 'MSC REBECCA V.244E',
        confidence: 0.96,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      },
      portOfLoading: {
        value: 'CNSZN - Shenzhen, China',
        confidence: 0.98,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      },
      portOfDischarge: {
        value: 'INNSA - Nhava Sheva, India',
        confidence: 0.99,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      },
      carrierName: {
        value: 'Mediterranean Shipping Company (MSC)',
        confidence: 0.97,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      }
    },
    crossChecks: [
      {
        id: 'invoice_arithmetic',
        title: 'Invoice Arithmetic Integrity',
        category: 'Arithmetic',
        status: 'PASSED',
        severity: 'blocking',
        description: 'Verifies invoice total against calculated line items, freight, and insurance.',
        docValues: { invoice: 'USD 16,320.00' },
        message: 'Passed: Line items sum ($16,320.00) matches stated invoice total ($16,320.00).',
        resolved: false
      },
      {
        id: 'package_count',
        title: 'Package Count Consistency',
        category: 'Quantity',
        status: 'PASSED',
        severity: 'blocking',
        description: 'Cross-verifies package count across Commercial Invoice, Packing List, and Bill of Lading.',
        docValues: { invoice: '400 pkgs', packing_list: '400 pkgs', bill_of_lading: '400 pkgs' },
        message: 'Passed: All 3 documents confirm 400 cartons.',
        resolved: false
      },
      {
        id: 'gross_weight',
        title: 'Gross Weight Verification',
        category: 'Weight',
        status: 'FAILED',
        severity: 'blocking',
        description: 'Validates gross weight consistency across Commercial Invoice, Packing List, and Bill of Lading.',
        docValues: { invoice: '3,120 kg', packing_list: '3,165 kg', bill_of_lading: '3,120 kg' },
        discrepancyDelta: '45.0 kg discrepancy',
        message: 'Failed: Gross weight mismatch detected! Variance of 45.0 kg found between Invoice (3,120 kg) and Packing List (3,165 kg). Requires human confirmation.',
        resolved: false
      },
      {
        id: 'net_weight',
        title: 'Net Weight Verification',
        category: 'Weight',
        status: 'PASSED',
        severity: 'blocking',
        description: 'Checks net weight values between Commercial Invoice and Packing List.',
        docValues: { invoice: '2,880 kg', packing_list: '2,880 kg' },
        message: 'Passed: Net weight is consistent at 2,880 kg.',
        resolved: false
      },
      {
        id: 'container_numbers',
        title: 'Container Identification Cross-Match',
        category: 'Equipment',
        status: 'PASSED',
        severity: 'blocking',
        description: 'Verifies ISO container numbers between Packing List and Bill of Lading.',
        docValues: { packing_list: 'MSCU8129482', bill_of_lading: 'MSCU8129482' },
        message: 'Passed: Container numbers match exactly (MSCU8129482).',
        resolved: false
      }
    ],
    auditLog: [
      {
        id: 'aud_1',
        timestamp: '2026-11-06T09:33:00Z',
        userId: 'sys_ai',
        userName: 'Gemini Vision AI Engine',
        userRole: 'executive',
        action: 'status_change',
        fieldKey: 'status',
        fieldLabel: 'Shipment Status',
        previousValue: 'Draft',
        newValue: 'Needs Review',
        reason: 'Automated document extraction completed with 1 discrepancy and 1 low-confidence field.'
      }
    ]
  },

  // 2. SHP-24812: Sample 2 from Section 10 of Brief
  {
    id: 'SHP-24812',
    createdAt: '2026-11-06T11:00:00Z',
    updatedAt: '2026-11-07T10:20:00Z',
    createdBy: 'Priya Sharma',
    status: 'Needs Review',
    documents: {
      invoice: {
        type: 'invoice',
        fileName: 'CI_24812_CompanyC_Valves.pdf',
        fileSize: 840000,
        fileType: 'application/pdf',
        uploadedAt: '2026-11-06T11:01:00Z',
        status: 'processed',
        pageCount: 1
      },
      packing_list: {
        type: 'packing_list',
        fileName: 'PL_24812_CompanyC_Valves.pdf',
        fileSize: 720000,
        fileType: 'application/pdf',
        uploadedAt: '2026-11-06T11:01:40Z',
        status: 'processed',
        pageCount: 1
      },
      bill_of_lading: {
        type: 'bill_of_lading',
        fileName: 'BL_MAEU441920_NhavaSheva.pdf',
        fileSize: 1020000,
        fileType: 'application/pdf',
        uploadedAt: '2026-11-06T11:02:15Z',
        status: 'processed',
        pageCount: 1
      }
    },
    parties: {
      shipmentRef: {
        value: 'SHP-24812',
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      supplierName: {
        value: 'Company C (Sweden) - Nordic Flow Systems AB',
        confidence: 0.98,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      supplierAddress: {
        value: 'Industrivägen 14, SE-417 55 Göteborg, Sweden',
        confidence: 0.95,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      supplierCountry: {
        value: 'SE',
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      importerName: {
        value: 'Bharat Heavy Valves & Pipe Solutions LLP',
        confidence: 0.96,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      importerIec: {
        value: '0314058291',
        confidence: 0.97,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      importerAddress: {
        value: 'Sector 30-A, Vashi, Navi Mumbai, MH 400703',
        confidence: 0.94,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      notifyParty: {
        value: 'Bharat Heavy Valves / Clearing Agent Company A',
        confidence: 0.93,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      }
    },
    invoice: {
      invoiceNumber: {
        value: 'SE-INV-77102',
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      invoiceDate: {
        value: '2026-10-29',
        confidence: 0.98,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      currency: {
        value: 'EUR',
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      incoterm: {
        value: 'FOB GOTHENBURG',
        confidence: 0.96,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      invoiceTotal: {
        value: 7650.00,
        confidence: 0.98,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      subtotal: {
        value: 7650.00,
        confidence: 0.98,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      freightCharges: {
        value: 0.00,
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      insuranceCharges: {
        value: 0.00,
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      lineItems: [
        {
          id: 'item-24812-1',
          itemDescription: {
            value: 'Steel ball valve DN50 PN40 Flanged Stainless Steel 316',
            confidence: 0.98,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          },
          hsnCode: {
            value: '84818030',
            confidence: 0.95,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          },
          quantity: {
            value: 180,
            confidence: 0.99,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          },
          uom: {
            value: 'PCS',
            confidence: 0.98,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          },
          unitPrice: {
            value: 42.50,
            confidence: 0.98,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          },
          lineAmount: {
            value: 7650.00,
            confidence: 0.98,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          }
        }
      ]
    },
    packing: {
      packageCount: {
        value: 15,
        confidence: 0.97,
        sourceDoc: 'packing_list',
        confirmed: true,
        status: 'confirmed'
      },
      packageType: {
        value: 'WOODEN PALLETS',
        confidence: 0.95,
        sourceDoc: 'packing_list',
        confirmed: true,
        status: 'confirmed'
      },
      netWeightKg: {
        value: 1260.00,
        confidence: 0.94,
        sourceDoc: 'packing_list',
        confirmed: true,
        status: 'confirmed'
      },
      grossWeightKg: {
        value: 1460.00,
        confidence: 0.96,
        sourceDoc: 'packing_list',
        confirmed: true,
        status: 'confirmed'
      },
      containerNumbers: {
        value: ['TCLU4910283'],
        confidence: 0.97,
        sourceDoc: 'packing_list',
        confirmed: true,
        status: 'confirmed'
      }
    },
    transport: {
      blNumber: {
        value: 'MAEU441920',
        confidence: 0.97,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      },
      blDate: {
        value: '2026-11-01',
        confidence: 0.98,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      },
      vesselName: {
        value: 'MAERSK MC-KINNEY MOLLER',
        confidence: 0.96,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      },
      portOfLoading: {
        value: 'SEGOT - Gothenburg, Sweden',
        confidence: 0.98,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      },
      portOfDischarge: {
        value: 'INNSA - Nhava Sheva, India',
        confidence: 0.99,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      },
      carrierName: {
        value: 'Maersk Line A/S',
        confidence: 0.98,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      }
    },
    crossChecks: [
      {
        id: 'invoice_arithmetic',
        title: 'Invoice Arithmetic Integrity',
        category: 'Arithmetic',
        status: 'PASSED',
        severity: 'blocking',
        description: 'Verifies invoice total against calculated line items.',
        docValues: { invoice: 'EUR 7,650.00' },
        message: 'Passed: 180 pcs × EUR 42.50 = EUR 7,650.00 matches invoice total.',
        resolved: false
      },
      {
        id: 'package_count',
        title: 'Package Count Consistency',
        category: 'Quantity',
        status: 'PASSED',
        severity: 'blocking',
        description: 'Cross-verifies package count across documents.',
        docValues: { invoice: '15 pallets', packing_list: '15 pallets', bill_of_lading: '15 pallets' },
        message: 'Passed: 15 wooden pallets verified on all documents.',
        resolved: false
      },
      {
        id: 'gross_weight',
        title: 'Gross Weight Verification',
        category: 'Weight',
        status: 'PASSED',
        severity: 'blocking',
        description: 'Validates gross weight consistency.',
        docValues: { invoice: '1,460 kg', packing_list: '1,460 kg', bill_of_lading: '1,460 kg' },
        message: 'Passed: Gross weight is consistent across documents (1,460 kg).',
        resolved: false
      },
      {
        id: 'net_weight',
        title: 'Net Weight Verification',
        category: 'Weight',
        status: 'PASSED',
        severity: 'blocking',
        description: 'Checks net weight values.',
        docValues: { invoice: '1,260 kg', packing_list: '1,260 kg' },
        message: 'Passed: Net weight consistent (1,260 kg).',
        resolved: false
      },
      {
        id: 'container_numbers',
        title: 'Container Identification Cross-Match',
        category: 'Equipment',
        status: 'PASSED',
        severity: 'blocking',
        description: 'Verifies ISO container numbers.',
        docValues: { packing_list: 'TCLU4910283', bill_of_lading: 'TCLU4910283' },
        message: 'Passed: Container TCLU4910283 verified.',
        resolved: false
      }
    ],
    auditLog: []
  },

  // 3. SHP-24815: Fully Validated & Ready to Export Sample
  {
    id: 'SHP-24815',
    createdAt: '2026-11-05T08:10:00Z',
    updatedAt: '2026-11-07T16:00:00Z',
    createdBy: 'Priya Sharma',
    status: 'Ready to Export',
    documents: {
      invoice: {
        type: 'invoice',
        fileName: 'CI_24815_Solis_Solar_Panels.pdf',
        fileSize: 1820000,
        fileType: 'application/pdf',
        uploadedAt: '2026-11-05T08:12:00Z',
        status: 'processed',
        pageCount: 1
      },
      packing_list: {
        type: 'packing_list',
        fileName: 'PL_24815_Solis_Solar_Panels.pdf',
        fileSize: 1220000,
        fileType: 'application/pdf',
        uploadedAt: '2026-11-05T08:12:45Z',
        status: 'processed',
        pageCount: 2
      },
      bill_of_lading: {
        type: 'bill_of_lading',
        fileName: 'BL_HLCU992810_NhavaSheva.pdf',
        fileSize: 1450000,
        fileType: 'application/pdf',
        uploadedAt: '2026-11-05T08:13:30Z',
        status: 'processed',
        pageCount: 1
      }
    },
    parties: {
      shipmentRef: {
        value: 'SHP-24815',
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      supplierName: {
        value: 'Solis Green Tech Co., Ltd.',
        confidence: 0.98,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      supplierAddress: {
        value: 'Lot B4-2, VSIP II Industrial Park, Ben Cat, Binh Duong, Vietnam',
        confidence: 0.95,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      supplierCountry: {
        value: 'VN',
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      importerName: {
        value: 'Surya Renewable Energy Infra Private Limited',
        confidence: 0.97,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      importerIec: {
        value: '0319028814',
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      importerAddress: {
        value: 'Plot 18, TTC Industrial Area, Mahape, Navi Mumbai 400710',
        confidence: 0.96,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      notifyParty: {
        value: 'Surya Renewable / Company A Customs Brokerage',
        confidence: 0.95,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      }
    },
    invoice: {
      invoiceNumber: {
        value: 'SOLIS-EXP-9921',
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      invoiceDate: {
        value: '2026-10-31',
        confidence: 0.98,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      currency: {
        value: 'USD',
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      incoterm: {
        value: 'CIF NHAVA SHEVA',
        confidence: 0.97,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      invoiceTotal: {
        value: 52080.00,
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      subtotal: {
        value: 52080.00,
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      freightCharges: {
        value: 0.00,
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      insuranceCharges: {
        value: 0.00,
        confidence: 0.99,
        sourceDoc: 'invoice',
        confirmed: true,
        status: 'confirmed'
      },
      lineItems: [
        {
          id: 'item-24815-1',
          itemDescription: {
            value: 'Mono PERC Solar PV Modules 540W Silver Frame 144 Half-cut cells',
            confidence: 0.98,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          },
          hsnCode: {
            value: '85414300',
            confidence: 0.97,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          },
          quantity: {
            value: 620,
            confidence: 0.99,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          },
          uom: {
            value: 'PCS',
            confidence: 0.99,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          },
          unitPrice: {
            value: 84.00,
            confidence: 0.98,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          },
          lineAmount: {
            value: 52080.00,
            confidence: 0.99,
            sourceDoc: 'invoice',
            confirmed: true,
            status: 'confirmed'
          }
        }
      ]
    },
    packing: {
      packageCount: {
        value: 20,
        confidence: 0.98,
        sourceDoc: 'packing_list',
        confirmed: true,
        status: 'confirmed'
      },
      packageType: {
        value: 'CRATED PALLETS (31 PCS/PALLET)',
        confidence: 0.97,
        sourceDoc: 'packing_list',
        confirmed: true,
        status: 'confirmed'
      },
      netWeightKg: {
        value: 13950.00,
        confidence: 0.97,
        sourceDoc: 'packing_list',
        confirmed: true,
        status: 'confirmed'
      },
      grossWeightKg: {
        value: 14880.00,
        confidence: 0.98,
        sourceDoc: 'packing_list',
        confirmed: true,
        status: 'confirmed'
      },
      containerNumbers: {
        value: ['HLXU8821904', 'HLXU8821915'],
        confidence: 0.99,
        sourceDoc: 'packing_list',
        confirmed: true,
        status: 'confirmed'
      }
    },
    transport: {
      blNumber: {
        value: 'HLCU992810',
        confidence: 0.99,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      },
      blDate: {
        value: '2026-11-02',
        confidence: 0.98,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      },
      vesselName: {
        value: 'HAPAG-LLOYD COLOMBO EXPRESS',
        confidence: 0.97,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      },
      portOfLoading: {
        value: 'VNSGN - Ho Chi Minh City, Vietnam',
        confidence: 0.98,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      },
      portOfDischarge: {
        value: 'INNSA - Nhava Sheva, India',
        confidence: 0.99,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      },
      carrierName: {
        value: 'Hapag-Lloyd AG',
        confidence: 0.98,
        sourceDoc: 'bill_of_lading',
        confirmed: true,
        status: 'confirmed'
      }
    },
    crossChecks: [
      {
        id: 'invoice_arithmetic',
        title: 'Invoice Arithmetic Integrity',
        category: 'Arithmetic',
        status: 'PASSED',
        severity: 'blocking',
        description: 'Verifies invoice total against line items.',
        docValues: { invoice: 'USD 52,080.00' },
        message: 'Passed: 620 pcs × $84.00 = $52,080.00 matches invoice total.',
        resolved: false
      },
      {
        id: 'package_count',
        title: 'Package Count Consistency',
        category: 'Quantity',
        status: 'PASSED',
        severity: 'blocking',
        description: 'Cross-verifies package count.',
        docValues: { invoice: '20 pallets', packing_list: '20 pallets', bill_of_lading: '20 pallets' },
        message: 'Passed: 20 crated pallets verified across all documents.',
        resolved: false
      },
      {
        id: 'gross_weight',
        title: 'Gross Weight Verification',
        category: 'Weight',
        status: 'PASSED',
        severity: 'blocking',
        description: 'Validates gross weight consistency.',
        docValues: { invoice: '14,880 kg', packing_list: '14,880 kg', bill_of_lading: '14,880 kg' },
        message: 'Passed: 14,880 kg matches across all documents.',
        resolved: false
      },
      {
        id: 'net_weight',
        title: 'Net Weight Verification',
        category: 'Weight',
        status: 'PASSED',
        severity: 'blocking',
        description: 'Checks net weight values.',
        docValues: { invoice: '13,950 kg', packing_list: '13,950 kg' },
        message: 'Passed: Net weight consistent at 13,950 kg.',
        resolved: false
      },
      {
        id: 'container_numbers',
        title: 'Container Identification Cross-Match',
        category: 'Equipment',
        status: 'PASSED',
        severity: 'blocking',
        description: 'Verifies ISO container numbers.',
        docValues: { packing_list: 'HLXU8821904, HLXU8821915', bill_of_lading: 'HLXU8821904, HLXU8821915' },
        message: 'Passed: Both containers verified across Packing List and B/L.',
        resolved: false
      }
    ],
    auditLog: [
      {
        id: 'aud_ready',
        timestamp: '2026-11-07T15:58:00Z',
        userId: 'usr_exec_01',
        userName: 'Priya Sharma',
        userRole: 'executive',
        action: 'status_change',
        fieldKey: 'status',
        fieldLabel: 'Shipment Status',
        previousValue: 'Needs Review',
        newValue: 'Ready to Export',
        reason: 'All 5 cross-checks validated with zero blocking issues.'
      }
    ],
    managerApproval: {
      status: 'approved',
      reviewedBy: 'Rajesh Nair',
      reviewedAt: '2026-11-07T16:00:00Z',
      remarks: 'Validated for ICEGATE import filing.'
    }
  }
];
