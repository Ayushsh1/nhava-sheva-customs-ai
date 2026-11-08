import React, { useState } from 'react';
import { Shipment, ExtractedField, DocumentType, User } from '../types/shipment';
import { 
  Check, 
  AlertCircle, 
  Edit3, 
  Save, 
  X, 
  CheckCheck,
  AlertTriangle
} from 'lucide-react';

interface FieldReviewPanelProps {
  shipment: Shipment;
  currentUser: User;
  onUpdateField: (fieldCategory: string, fieldKey: string, newValue: any, reason: string) => void;
  onConfirmField: (fieldCategory: string, fieldKey: string) => void;
  onConfirmAllHighConfidence: () => void;
  onSelectDoc: (doc: DocumentType) => void;
  onResolveDiscrepancyClick: (checkId: string) => void;
}

export const FieldReviewPanel: React.FC<FieldReviewPanelProps> = ({
  shipment,
  currentUser,
  onUpdateField,
  onConfirmField,
  onConfirmAllHighConfidence,
  onSelectDoc,
  onResolveDiscrepancyClick,
}) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editReason, setEditReason] = useState<string>('');

  const startEdit = (key: string, currentVal: any) => {
    setEditingKey(key);
    setEditValue(String(currentVal ?? ''));
    setEditReason('Manual correction after reviewing physical document');
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
    setEditReason('');
  };

  const saveEdit = (category: string, key: string, isNumeric = false) => {
    if (!editReason.trim()) {
      alert('Please provide a reason for the audit log.');
      return;
    }
    const val = isNumeric ? parseFloat(editValue) || 0 : editValue;
    onUpdateField(category, key, val, editReason);
    cancelEdit();
  };

  const renderConfidenceBadge = (field: ExtractedField<any>) => {
    const pct = Math.round(field.confidence * 100);
    if (field.confirmed) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Verified ({pct}%)</span>
        </span>
      );
    }

    if (field.confidence >= 0.90) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span>{pct}% Conf</span>
        </span>
      );
    } else if (field.confidence >= 0.70) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>{pct}% Conf</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          <span>{pct}% · Review Needed</span>
        </span>
      );
    }
  };

  const renderFieldRow = (
    label: string,
    field: ExtractedField<any>,
    category: string,
    key: string,
    isNumeric = false,
    formatValue?: (val: any) => string
  ) => {
    const isEditing = editingKey === `${category}.${key}`;
    const displayVal = formatValue ? formatValue(field.value) : String(field.value ?? '');
    const isLowConfidence = field.confidence < 0.70 && !field.confirmed;

    return (
      <div 
        key={`${category}.${key}`}
        className={`p-3 rounded-lg border transition-all ${
          isLowConfidence 
            ? 'bg-rose-50/40 border-rose-200 shadow-xs' 
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between text-xs mb-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-slate-700">{label}</span>
            <button
              onClick={() => onSelectDoc(field.sourceDoc)}
              className="text-[10px] uppercase font-mono text-slate-400 hover:text-slate-800 transition-colors"
              title={`Jump to source document: ${field.sourceDoc}`}
            >
              [{field.sourceDoc}]
            </button>
          </div>
          <div className="flex items-center space-x-2">
            {renderConfidenceBadge(field)}
          </div>
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1 font-medium">Corrected Value:</label>
              <input
                type={isNumeric ? 'number' : 'text'}
                step={isNumeric ? 'any' : undefined}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full text-xs p-1.5 border border-slate-300 rounded font-mono bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1 font-medium">Audit Reason (Mandatory):</label>
              <input
                type="text"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="e.g. Verified with physical document copy"
                className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-1">
              <button
                onClick={cancelEdit}
                className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => saveEdit(category, key, isNumeric)}
                className="px-3 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded font-medium flex items-center gap-1 shadow-xs"
              >
                <Save className="w-3 h-3" /> Save Correction
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mt-1">
            <div className="font-mono text-xs text-slate-900 font-medium break-all">
              {displayVal || <span className="text-slate-400 italic">Empty</span>}
            </div>
            <div className="flex items-center space-x-1 shrink-0 ml-3">
              {!field.confirmed && (
                <button
                  onClick={() => onConfirmField(category, key)}
                  className="text-xs text-emerald-700 hover:bg-emerald-50 border border-emerald-300 font-medium px-2 py-0.5 rounded transition-colors flex items-center space-x-1"
                  title="Confirm this value"
                >
                  <Check className="w-3 h-3" />
                  <span>Verify</span>
                </button>
              )}
              <button
                onClick={() => startEdit(`${category}.${key}`, field.value)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded transition-colors"
                title="Edit field value"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const grossWtCheck = shipment.crossChecks.find(c => c.id === 'gross_weight');

  return (
    <div className="space-y-5">
      {/* Top Banner with Quick Actions */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="text-[11px] font-mono font-medium text-slate-400 uppercase tracking-wider">
            EXTRACTION WORKSPACE
          </span>
          <h3 className="text-sm font-semibold text-slate-900">
            Shipment <span className="font-mono">{shipment.id}</span>
          </h3>
        </div>

        <button
          onClick={onConfirmAllHighConfidence}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 shadow-xs"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Confirm All High-Confidence (&gt;90%)</span>
        </button>
      </div>

      {/* Discrepancy Banner if Failed Cross-Check Exists */}
      {grossWtCheck && grossWtCheck.status === 'FAILED' && !grossWtCheck.resolved && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-rose-950 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-rose-900">
                  Critical Discrepancy: {grossWtCheck.title} ({grossWtCheck.discrepancyDelta})
                </h4>
                <p className="text-xs text-rose-800 mt-0.5">
                  Invoice states <strong>{grossWtCheck.docValues.invoice}</strong>, but Packing List states <strong>{grossWtCheck.docValues.packing_list}</strong>. Customs filing is blocked until resolved.
                </p>
              </div>
            </div>
            <button
              onClick={() => onResolveDiscrepancyClick(grossWtCheck.id)}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shrink-0 transition-colors shadow-xs"
            >
              Resolve Discrepancy
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: Shipment & Parties */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-slate-700 border-b border-slate-200/80 pb-1.5">
          1. Shipment & Key Parties
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {renderFieldRow('Supplier / Exporter', shipment.parties.supplierName, 'parties', 'supplierName')}
          {renderFieldRow('Importer IEC Code', shipment.parties.importerIec, 'parties', 'importerIec')}
          {renderFieldRow('Importer / Consignee', shipment.parties.importerName, 'parties', 'importerName')}
          {renderFieldRow('Supplier Country', shipment.parties.supplierCountry, 'parties', 'supplierCountry')}
          {renderFieldRow('Importer Address', shipment.parties.importerAddress, 'parties', 'importerAddress')}
          {renderFieldRow('Notify Party', shipment.parties.notifyParty, 'parties', 'notifyParty')}
        </div>
      </div>

      {/* SECTION 2: Commercial Invoice Details */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-slate-700 border-b border-slate-200/80 pb-1.5">
          2. Commercial Invoice Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {renderFieldRow('Invoice Number', shipment.invoice.invoiceNumber, 'invoice', 'invoiceNumber')}
          {renderFieldRow('Invoice Date', shipment.invoice.invoiceDate, 'invoice', 'invoiceDate')}
          {renderFieldRow('Currency', shipment.invoice.currency, 'invoice', 'currency')}
          {renderFieldRow('Incoterm', shipment.invoice.incoterm, 'invoice', 'incoterm')}
          {renderFieldRow(
            'Invoice Total Amount', 
            shipment.invoice.invoiceTotal, 
            'invoice', 
            'invoiceTotal', 
            true, 
            (v) => `${shipment.invoice.currency.value || 'USD'} ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
          <h4 className="text-xs font-semibold text-slate-700">
            Consignment Line Items & HSN Codes
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            {shipment.invoice.lineItems.length} Line Item(s)
          </span>
        </div>

        <div className="space-y-2">
          {shipment.invoice.lineItems.map((item, idx) => {
            const isHsnLow = item.hsnCode.confidence < 0.70 && !item.hsnCode.confirmed;
            return (
              <div 
                key={item.id} 
                className={`p-3 rounded-lg border text-xs space-y-2 ${
                  isHsnLow ? 'bg-amber-50/40 border-amber-300' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-slate-400 text-[11px] mr-1.5">#{idx + 1}</span>
                    <span className="font-medium text-slate-900">{item.itemDescription.value}</span>
                  </div>
                  <div className="text-right font-mono font-medium text-slate-900">
                    {shipment.invoice.currency.value} {item.lineAmount.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-500 block">HSN / Tariff Code</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-semibold text-slate-900">{item.hsnCode.value}</span>
                      {!item.hsnCode.confirmed && (
                        <button
                          onClick={() => onConfirmField('lineItemHSN', item.id)}
                          className="text-[10px] text-emerald-700 hover:bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded font-medium"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block">Quantity & UOM</span>
                    <span className="font-mono text-slate-900 mt-0.5 block">
                      {item.quantity.value?.toLocaleString()} {item.uom.value}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block">Unit Price</span>
                    <span className="font-mono text-slate-900 mt-0.5 block">
                      {shipment.invoice.currency.value} {item.unitPrice.value?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Packing & Weights */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-slate-700 border-b border-slate-200/80 pb-1.5">
          3. Packing & Weights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {renderFieldRow('Package Count', shipment.packing.packageCount, 'packing', 'packageCount', true, (v) => `${v} Packages`)}
          {renderFieldRow('Package Type', shipment.packing.packageType, 'packing', 'packageType')}
          {renderFieldRow('Gross Weight (kg)', shipment.packing.grossWeightKg, 'packing', 'grossWeightKg', true, (v) => `${Number(v).toLocaleString()} kg`)}
          {renderFieldRow('Net Weight (kg)', shipment.packing.netWeightKg, 'packing', 'netWeightKg', true, (v) => `${Number(v).toLocaleString()} kg`)}
        </div>
      </div>

      {/* SECTION 4: Transport & Bill of Lading */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold text-slate-700 border-b border-slate-200/80 pb-1.5">
          4. Transport & Bill of Lading (B/L)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {renderFieldRow('Bill of Lading Number', shipment.transport.blNumber, 'transport', 'blNumber')}
          {renderFieldRow('B/L Date', shipment.transport.blDate, 'transport', 'blDate')}
          {renderFieldRow('Vessel Name', shipment.transport.vesselName, 'transport', 'vesselName')}
          {renderFieldRow('Carrier Name', shipment.transport.carrierName, 'transport', 'carrierName')}
          {renderFieldRow('Port of Loading', shipment.transport.portOfLoading, 'transport', 'portOfLoading')}
          {renderFieldRow('Port of Discharge (INNSA)', shipment.transport.portOfDischarge, 'transport', 'portOfDischarge')}
        </div>
      </div>
    </div>
  );
};
