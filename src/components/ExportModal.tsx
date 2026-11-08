import React, { useState } from 'react';
import { Shipment, User } from '../types/shipment';
import { getExportBlockers } from '../utils/validation';
import { generateCustomsCsv, downloadCsvFile } from '../utils/exportCsv';
import { 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  FileSpreadsheet, 
  X,
  Check
} from 'lucide-react';

interface ExportModalProps {
  shipment: Shipment;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onExportSuccess: (filename: string, rowCount: number) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  shipment,
  currentUser,
  isOpen,
  onClose,
  onExportSuccess,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const blockers = getExportBlockers(shipment);
  const exportResult = blockers.isReadyForExport
    ? generateCustomsCsv(shipment, `${currentUser.name} (${currentUser.title})`)
    : null;

  const handleDownload = () => {
    if (!exportResult || !exportResult.csvContent || !exportResult.filename) return;
    downloadCsvFile(exportResult.csvContent, exportResult.filename);
    onExportSuccess(exportResult.filename, exportResult.rowCount || 1);
  };

  const handleCopy = () => {
    if (!exportResult || !exportResult.csvContent) return;
    navigator.clipboard.writeText(exportResult.csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-800">
              <FileSpreadsheet className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Customs Filing Software Export (CSV)</h3>
              <p className="text-xs text-slate-500">
                Port INNSA (Nhava Sheva) · ICEGATE Bill of Entry Import Template
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Readiness Status Card */}
          {blockers.isReadyForExport ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-emerald-950">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-emerald-900">
                  Ready for Customs Export
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  All 5 cross-checks passed, low-confidence fields verified by documentation executive, and mandatory customs identifiers validated.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 flex items-start gap-3 text-rose-950">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-rose-900">
                  Export Blocked — Resolution Required (Brief Section 6.6)
                </h4>
                <p className="text-xs text-rose-800 mt-0.5">
                  Customs regulations prohibit generating filing files with unverified discrepancies or low-confidence values:
                </p>
                <ul className="mt-2 space-y-1 text-xs list-disc list-inside text-rose-900 bg-white/70 p-2.5 rounded border border-rose-200 font-mono">
                  {blockers.blockingReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Validation Checklist Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="flex items-center space-x-2">
              {blockers.failedCount === 0 ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <X className="w-4 h-4 text-rose-600" />
              )}
              <span className="text-slate-700">
                Cross-Checks: <strong>{blockers.failedCount === 0 ? '5/5 Passed' : `${blockers.failedCount} Failed`}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {blockers.unconfirmedLowConfidenceCount === 0 ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <span className="text-slate-700">
                Low Confidence: <strong>{blockers.unconfirmedLowConfidenceCount === 0 ? '0 Pending' : `${blockers.unconfirmedLowConfidenceCount} Pending`}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-700">
                Port: <strong>INNSA</strong>
              </span>
            </div>
          </div>

          {/* CSV Preview (If Ready) */}
          {blockers.isReadyForExport && exportResult && exportResult.csvContent && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-700 font-mono text-[11px]">
                  Customs CSV Preview ({exportResult.rowCount} item)
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {exportResult.filename}
                </span>
              </div>
              <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
                <pre>{exportResult.csvContent}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-slate-500 text-xs">
            {blockers.isReadyForExport ? 'Ready for import into customs filing software' : 'Fix blockers in the review workspace'}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              Close
            </button>

            {blockers.isReadyForExport && (
              <>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied' : 'Copy CSV'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Filing CSV</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
