import React, { useState } from 'react';
import { DocumentType, Shipment } from '../types/shipment';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye
} from 'lucide-react';

interface DocumentViewerProps {
  shipment: Shipment;
  activeDoc: DocumentType;
  onDocChange: (doc: DocumentType) => void;
  selectedFieldKey?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  shipment,
  activeDoc,
  onDocChange,
  selectedFieldKey,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showAiBoxes, setShowAiBoxes] = useState<boolean>(true);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(150, Math.max(75, prev + delta)));
  };

  const getDocName = (type: DocumentType) => {
    switch (type) {
      case 'invoice':
        return 'Commercial Invoice';
      case 'packing_list':
        return 'Packing List';
      case 'bill_of_lading':
        return 'Bill of Lading (B/L)';
    }
  };

  const getFileMeta = (type: DocumentType) => {
    const doc = shipment.documents[type];
    if (!doc) return 'Simulated Source Document';
    return `${doc.fileName} (${(doc.fileSize / 1024 / 1024).toFixed(2)} MB)`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xs">
      {/* Document Header & Tab Navigation */}
      <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1">
          {(['invoice', 'packing_list', 'bill_of_lading'] as DocumentType[]).map((type) => {
            const hasDoc = Boolean(shipment.documents[type]);
            return (
              <button
                key={type}
                onClick={() => onDocChange(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                  activeDoc === type
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{getDocName(type)}</span>
                {hasDoc && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
              </button>
            );
          })}
        </div>

        {/* Zoom & Overlay Controls */}
        <div className="flex items-center space-x-2 text-xs text-slate-300">
          <button
            onClick={() => setShowAiBoxes(!showAiBoxes)}
            className={`px-2 py-1 rounded-md flex items-center gap-1 font-medium transition-colors ${
              showAiBoxes ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'text-slate-500'
            }`}
            title="Toggle OCR Bounding Overlays"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Overlays</span>
          </button>

          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => handleZoom(-10)}
              className="p-1 hover:bg-slate-700 rounded text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-300 font-medium">{zoomLevel}%</span>
            <button
              onClick={() => handleZoom(10)}
              className="p-1 hover:bg-slate-700 rounded text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="p-1 hover:bg-slate-700 rounded text-slate-400 ml-0.5"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Sub-bar */}
      <div className="bg-slate-900/90 px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="truncate max-w-xs">{getFileMeta(activeDoc)}</span>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 hidden sm:inline">Port INNSA verified</span>
          <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono text-[10px]">Page 1 / 1</span>
        </div>
      </div>

      {/* Document Viewer Body (Scrollable & Zoomable) */}
      <div className="flex-1 overflow-auto p-4 bg-slate-950 flex items-start justify-center">
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150 ease-out"
        >
          {/* Simulated Authentic Indian Customs Port Import Document Canvas */}
          <div className="w-[620px] min-h-[840px] bg-white text-slate-900 shadow-xl rounded-lg p-8 font-sans text-xs relative select-none border border-slate-300">
            {/* Top Customs Stamp / Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-mono text-slate-400 font-semibold">
                  OFFICIAL CUSTOMS CLEARANCE DOCUMENT
                </span>
                <h2 className="text-lg font-bold tracking-tight uppercase text-slate-900 mt-0.5">
                  {getDocName(activeDoc)}
                </h2>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  PORT OF DISCHARGE: <strong>INNSA (NHAVA SHEVA, INDIA)</strong>
                </div>
              </div>

              {/* Verified Nhava Sheva Stamp */}
              <div className="border border-dashed border-red-500 rounded p-1.5 text-center text-red-600 rotate-[-3deg] opacity-85">
                <div className="text-[9px] font-bold tracking-wider uppercase font-mono">CUSTOMS BROKERAGE</div>
                <div className="text-[10px] font-bold uppercase">NHAVA SHEVA INNSA</div>
                <div className="text-[8px] font-mono text-red-500">{shipment.id} · VERIFIED</div>
              </div>
            </div>

            {/* Document Content based on active tab */}
            {activeDoc === 'invoice' && (
              <div className="mt-4 space-y-4">
                {/* Invoice Meta Grid */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase font-mono">EXPORTER / SHIPPER</div>
                    <div className="font-semibold text-slate-900 relative">
                      {shipment.parties.supplierName.value}
                      {showAiBoxes && (
                        <span className="absolute -inset-1 border border-blue-400 bg-blue-500/10 rounded pointer-events-none text-[9px] text-blue-600 font-mono top-0 right-0 px-1">
                          96%
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600">{shipment.parties.supplierAddress.value}</div>
                    <div className="text-[11px] text-slate-600">Origin: {shipment.parties.supplierCountry.value || 'China (CN)'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase font-mono">CONSIGNEE / IMPORTER (INDIA)</div>
                    <div className="font-semibold text-slate-900">{shipment.parties.importerName.value}</div>
                    <div className="text-[11px] font-mono text-slate-700 font-semibold">IEC: {shipment.parties.importerIec.value}</div>
                    <div className="text-[11px] text-slate-600">{shipment.parties.importerAddress.value}</div>
                  </div>
                </div>

                {/* Reference Numbers Table */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200 text-center font-mono">
                  <div className="bg-slate-100 p-1.5 rounded">
                    <div className="text-[9px] text-slate-500 uppercase">INVOICE NO.</div>
                    <div className="font-semibold text-slate-900 text-xs">{shipment.invoice.invoiceNumber.value}</div>
                  </div>
                  <div className="bg-slate-100 p-1.5 rounded">
                    <div className="text-[9px] text-slate-500 uppercase">INVOICE DATE</div>
                    <div className="font-semibold text-slate-900 text-xs">{shipment.invoice.invoiceDate.value}</div>
                  </div>
                  <div className="bg-slate-100 p-1.5 rounded">
                    <div className="text-[9px] text-slate-500 uppercase">INCOTERM</div>
                    <div className="font-semibold text-slate-900 text-xs">{shipment.invoice.incoterm.value}</div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase font-mono mb-1.5">
                    BILL OF ENTRY COMMODITY BREAKDOWN
                  </div>
                  <table className="w-full text-left border border-slate-200">
                    <thead className="bg-slate-100 text-[10px] font-semibold text-slate-600 uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-2">Item Description</th>
                        <th className="p-2 text-center">HSN Code</th>
                        <th className="p-2 text-right">Qty</th>
                        <th className="p-2 text-right">Unit Price</th>
                        <th className="p-2 text-right">Amount ({shipment.invoice.currency.value})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {shipment.invoice.lineItems.map((item) => (
                        <tr key={item.id} className="text-slate-800">
                          <td className="p-2 font-medium">{item.itemDescription.value}</td>
                          <td className="p-2 text-center font-mono relative">
                            {item.hsnCode.value}
                            {showAiBoxes && item.hsnCode.confidence < 0.70 && (
                              <span className="absolute -inset-0.5 border border-rose-500 bg-rose-500/10 rounded text-[8px] text-rose-700 font-semibold px-1 flex items-center justify-center">
                                65% Review
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-right font-mono">{item.quantity.value.toLocaleString()} {item.uom.value}</td>
                          <td className="p-2 text-right font-mono">{item.unitPrice.value.toFixed(2)}</td>
                          <td className="p-2 text-right font-mono font-semibold text-slate-900">{item.lineAmount.value.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals & Stated Weight Section */}
                <div className="flex justify-between items-start pt-2">
                  <div className="space-y-1 text-slate-600">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase font-mono">WEIGHT AS STATED ON INVOICE</div>
                    <div className="font-mono text-xs font-semibold text-slate-900 relative inline-block">
                      Gross Weight: <strong>3,120.00 KG</strong>
                      {showAiBoxes && shipment.id === 'SHP-24811' && (
                        <span className="ml-2 text-[9px] text-rose-600 font-medium bg-rose-50 border border-rose-200 px-1 py-0.5 rounded">
                          CI Gross Wt
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-slate-500">
                      Net Weight: 2,880.00 KG
                    </div>
                  </div>

                  <div className="w-56 bg-slate-50 p-3 rounded-lg border border-slate-200 text-right space-y-1 font-mono">
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Subtotal:</span>
                      <span>{shipment.invoice.currency.value} {shipment.invoice.invoiceTotal.value.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Freight & Insurance:</span>
                      <span>0.00</span>
                    </div>
                    <div className="flex justify-between font-semibold text-slate-900 text-xs border-t border-slate-200 pt-1">
                      <span>TOTAL:</span>
                      <span className="text-slate-950 font-bold">{shipment.invoice.currency.value} {shipment.invoice.invoiceTotal.value.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Content for Packing List */}
            {activeDoc === 'packing_list' && (
              <div className="mt-4 space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase font-mono">PACKING LIST FOR SHIPMENT</div>
                    <div className="font-semibold text-slate-900">{shipment.parties.supplierName.value}</div>
                    <div className="text-[11px] text-slate-600">Consignee: {shipment.parties.importerName.value}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-[10px] text-slate-400 uppercase">REF / INVOICE NO</div>
                    <div className="font-semibold text-slate-800">{shipment.invoice.invoiceNumber.value}</div>
                    <div className="text-[11px] text-slate-500">Date: {shipment.invoice.invoiceDate.value}</div>
                  </div>
                </div>

                {/* Package & Weight Breakdown Box */}
                <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="text-[11px] font-semibold text-slate-900 uppercase font-mono flex items-center justify-between">
                    <span>PACKAGE SPECIFICATIONS & CONTAINER MANIFEST</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                      CONTAINERIZED CARGO
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-slate-100 p-2.5 rounded">
                      <div className="text-[9px] text-slate-500 uppercase">TOTAL PACKAGES</div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {shipment.packing.packageCount.value} {shipment.packing.packageType.value}
                      </div>
                    </div>

                    <div className="bg-slate-100 p-2.5 rounded">
                      <div className="text-[9px] text-slate-500 uppercase">CONTAINER NO. (ISO 6346)</div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {(shipment.packing.containerNumbers.value || []).join(', ')}
                      </div>
                    </div>

                    <div className="bg-slate-100 p-2.5 rounded">
                      <div className="text-[9px] text-slate-500 uppercase">NET WEIGHT (N.W.)</div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {shipment.packing.netWeightKg.value.toLocaleString()} KG
                      </div>
                    </div>

                    {/* Prominent Gross Weight Box showing the 3,165 kg vs 3,120 kg mismatch */}
                    <div className={`p-2.5 rounded relative ${shipment.id === 'SHP-24811' ? 'bg-rose-50 border border-rose-300 text-rose-900' : 'bg-slate-100'}`}>
                      <div className="text-[9px] text-slate-500 uppercase font-semibold">GROSS WEIGHT (G.W.)</div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{shipment.id === 'SHP-24811' ? '3,165.00 KG' : `${shipment.packing.grossWeightKg.value.toLocaleString()} KG`}</span>
                        {shipment.id === 'SHP-24811' && (
                          <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded font-sans font-semibold">
                            +45 KG vs Invoice
                          </span>
                        )}
                      </div>
                      {shipment.id === 'SHP-24811' && (
                        <div className="text-[9px] text-rose-700 font-sans mt-0.5">
                          Commercial Invoice states 3,120 kg.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                    <p className="font-semibold text-slate-900 mb-0.5">Packing Manifest Note:</p>
                    <p className="text-[11px] leading-relaxed text-slate-600">
                      All cartons palletized and shrink-wrapped with waterproof polythene liner. Pallet tare weight: 45 kg included in total gross weight calculation for port weighing receipt.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Document Content for Bill of Lading */}
            {activeDoc === 'bill_of_lading' && (
              <div className="mt-4 space-y-4">
                <div className="border border-slate-900 p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="text-[9px] font-mono font-semibold text-slate-500">OCEAN BILL OF LADING</div>
                    <div className="text-sm font-bold text-slate-900">{shipment.transport.carrierName.value}</div>
                    <div className="text-xs text-slate-600 font-mono">B/L NO: <strong>{shipment.transport.blNumber.value}</strong></div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <div>Date: <strong>{shipment.transport.blDate.value}</strong></div>
                    <div>Vessel: <strong>{shipment.transport.vesselName.value}</strong></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border border-slate-200 p-3 rounded-lg text-xs">
                  <div>
                    <span className="text-[9px] font-semibold text-slate-400 font-mono">PORT OF LOADING</span>
                    <p className="font-medium text-slate-900">{shipment.transport.portOfLoading.value}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-slate-400 font-mono">PORT OF DISCHARGE (INDIA)</span>
                    <p className="font-semibold text-slate-900">{shipment.transport.portOfDischarge.value}</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 space-y-2 font-mono text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">Declared Packages:</span>
                    <span className="font-semibold">{shipment.packing.packageCount.value} Cartons</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">Container Numbers:</span>
                    <span className="font-semibold text-slate-900">{(shipment.packing.containerNumbers.value || []).join(', ')}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">Gross Cargo Weight:</span>
                    <span className="font-semibold">{shipment.packing.grossWeightKg.value.toLocaleString()} KG</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Notify Party:</span>
                    <span className="font-semibold text-right truncate max-w-xs">{shipment.parties.notifyParty.value}</span>
                  </div>
                </div>

                <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>CARRIER AUTHORIZED SIGNATORY</span>
                  <span>CUSTOMS TERMINAL: JNPT / BMCT NHAVA SHEVA</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
