import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkGrossWeight,
  checkInvoiceArithmetic,
  checkPackageCount,
  checkNetWeight,
  checkContainerNumbers,
  getExportBlockers,
  numbersMatch
} from './validation';
import { Shipment } from '../types/shipment';

test('numbersMatch returns true within tolerance and false outside', () => {
  assert.equal(numbersMatch(3120, 3120), true);
  assert.equal(numbersMatch(3120, 3120.005, 0.01), true);
  assert.equal(numbersMatch(3120, 3165, 0.01), false);
});

test('checkGrossWeight flags the exact 45kg difference in SHP-24811 from brief', () => {
  // Invoice has 3,120 kg, Packing list has 3,165 kg
  const result = checkGrossWeight(3120, 3165, undefined, 0.0);
  assert.equal(result.status, 'FAILED');
  assert.equal(result.discrepancyDelta, '45.0 kg discrepancy');
  assert.match(result.message, /Variance of 45.0 kg found/);
});

test('checkGrossWeight passes when weights match across all documents', () => {
  const result = checkGrossWeight(1460, 1460, 1460, 0.0);
  assert.equal(result.status, 'PASSED');
  assert.equal(result.discrepancyDelta, undefined);
  assert.match(result.message, /consistent across documents/);
});

test('checkGrossWeight returns NOT_AVAILABLE when only one document has weight', () => {
  const result = checkGrossWeight(1460, undefined, undefined);
  assert.equal(result.status, 'NOT_AVAILABLE');
  assert.match(result.message, /fewer than 2 documents/);
});

test('checkInvoiceArithmetic flags discrepancies between invoice total and line items', () => {
  const mockShipment = {
    invoice: {
      currency: { value: 'USD' },
      invoiceTotal: { value: 16320.00, confidence: 0.95 },
      freightCharges: { value: 0 },
      insuranceCharges: { value: 0 },
      lineItems: [
        {
          quantity: { value: 2400 },
          unitPrice: { value: 6.80 },
          lineAmount: { value: 16320.00 }
        }
      ]
    }
  } as unknown as Shipment;

  const passResult = checkInvoiceArithmetic(mockShipment);
  assert.equal(passResult.status, 'PASSED');

  // Introduce arithmetic error
  const failingShipment = {
    invoice: {
      currency: { value: 'USD' },
      invoiceTotal: { value: 17000.00, confidence: 0.95 }, // $680 higher
      freightCharges: { value: 0 },
      insuranceCharges: { value: 0 },
      lineItems: [
        {
          quantity: { value: 2400 },
          unitPrice: { value: 6.80 },
          lineAmount: { value: 16320.00 }
        }
      ]
    }
  } as unknown as Shipment;

  const failResult = checkInvoiceArithmetic(failingShipment);
  assert.equal(failResult.status, 'FAILED');
  assert.equal(failResult.discrepancyDelta, '680.00 USD variance');
});

test('checkContainerNumbers verifies container identifiers across PL and BL', () => {
  // Matching containers
  const matchResult = checkContainerNumbers(['MSCU8129482'], ['MSCU8129482']);
  assert.equal(matchResult.status, 'PASSED');

  // Mismatched containers
  const mismatchResult = checkContainerNumbers(['MSCU8129482'], ['TCLU9982310']);
  assert.equal(mismatchResult.status, 'FAILED');
  assert.match(mismatchResult.message, /Missing in B\/L/);

  // Missing documents
  const missingResult = checkContainerNumbers([], ['TCLU9982310']);
  assert.equal(missingResult.status, 'NOT_AVAILABLE');
});

test('getExportBlockers blocks export when unresolved failed checks or unconfirmed low confidence fields exist', () => {
  const testShipment = {
    id: 'SHP-TEST',
    parties: {
      supplierName: { value: 'Company B', confidence: 0.95, confirmed: true },
      importerIec: { value: '0388049102', confidence: 0.95, confirmed: true }
    },
    invoice: {
      invoiceNumber: { value: 'INV-9021', confidence: 0.95, confirmed: true },
      invoiceTotal: { value: 16320, confidence: 0.62, confirmed: false }, // Low confidence & unconfirmed!
      lineItems: []
    },
    packing: {
      packageCount: { value: 100, confidence: 0.95, confirmed: true },
      grossWeightKg: { value: 3120, confidence: 0.95, confirmed: true }
    },
    transport: {
      blNumber: { value: 'BL-88129', confidence: 0.95, confirmed: true }
    },
    crossChecks: [
      {
        id: 'gross_weight',
        title: 'Gross Weight Verification',
        status: 'FAILED',
        resolved: false,
        discrepancyDelta: '45 kg discrepancy'
      }
    ]
  } as unknown as Shipment;

  const summary = getExportBlockers(testShipment);
  assert.equal(summary.isReadyForExport, false);
  assert.equal(summary.failedCount, 1);
  assert.equal(summary.unconfirmedLowConfidenceCount, 1);
  assert.ok(summary.blockingReasons.some(r => r.includes('Gross Weight Verification')));
  assert.ok(summary.blockingReasons.some(r => r.includes('Unconfirmed Low Confidence')));
});
