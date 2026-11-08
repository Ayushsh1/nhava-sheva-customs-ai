import React, { useState } from 'react';
import { CrossCheckRuleResult, Shipment, User } from '../types/shipment';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Scale, 
  Calculator, 
  Package, 
  Container, 
  ArrowRight,
  Check,
  X
} from 'lucide-react';

interface CrossCheckSummaryProps {
  shipment: Shipment;
  currentUser: User;
  onResolveCheck: (checkId: string, resolvedValue: any, reason: string) => void;
  onJumpToDoc: (docType: 'invoice' | 'packing_list' | 'bill_of_lading') => void;
  initialOpenCheckId?: string | null;
  onModalClosed?: () => void;
}

export const CrossCheckSummary: React.FC<CrossCheckSummaryProps> = ({
  shipment,
  currentUser,
  onResolveCheck,
  onJumpToDoc,
  initialOpenCheckId,
  onModalClosed,
}) => {
  const [resolvingCheck, setResolvingCheck] = useState<CrossCheckRuleResult | null>(null);
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [customValue, setCustomValue] = useState<string>('');
  const [resolutionReason, setResolutionReason] = useState<string>('');

  React.useEffect(() => {
    if (initialOpenCheckId) {
      const target = shipment.crossChecks.find(c => c.id === initialOpenCheckId && c.status === 'FAILED');
      if (target) {
        openResolveModal(target);
      }
    }
  }, [initialOpenCheckId, shipment]);

  const openResolveModal = (check: CrossCheckRuleResult) => {
    setResolvingCheck(check);
    const validValues = Object.values(check.docValues).filter(v => v !== undefined && v !== null);
    const firstVal = validValues[0];
    setSelectedValue(String(firstVal ?? ''));
    setCustomValue('');
    setResolutionReason('Reconciled after supplier confirmation & physical document review.');
  };

  const closeModal = () => {
    setResolvingCheck(null);
    if (onModalClosed) onModalClosed();
  };

  const handleConfirmResolution = () => {
    if (!resolvingCheck) return;
    const finalVal = selectedValue === '__custom__' ? customValue : selectedValue;
    if (!finalVal) {
      alert('Please select or specify a reconciled value.');
      return;
    }
    if (!resolutionReason.trim()) {
      alert('Please provide an audit reason for resolving this cross-check.');
      return;
    }

    onResolveCheck(resolvingCheck.id, finalVal, resolutionReason);
    setResolvingCheck(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Arithmetic':
        return <Calculator className="w-3.5 h-3.5 text-slate-500" />;
      case 'Quantity':
        return <Package className="w-3.5 h-3.5 text-slate-500" />;
      case 'Weight':
        return <Scale className="w-3.5 h-3.5 text-slate-500" />;
      case 'Equipment':
        return <Container className="w-3.5 h-3.5 text-slate-500" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const passedCount = shipment.crossChecks.filter((c) => c.status === 'PASSED').length;
  const failedCount = shipment.crossChecks.filter((c) => c.status === 'FAILED' && !c.resolved).length;
  const naCount = shipment.crossChecks.filter((c) => c.status === 'NOT_AVAILABLE').length;

  return (
    <div className="space-y-4">
      {/* Overview Stat Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-slate-900 text-xs">
              5-Point Cross-Document Integrity
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Brief Sec 6.5
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Cross-verifies Commercial Invoice, Packing List, and Bill of Lading.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-medium">
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{passedCount} Passed</span>
          </div>

          <div className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 border ${
            failedCount > 0 
              ? 'bg-rose-50 text-rose-700 border-rose-200' 
              : 'bg-slate-50 text-slate-400 border-slate-200'
          }`}>
            <XCircle className={`w-3.5 h-3.5 ${failedCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>{failedCount} Discrepancies</span>
          </div>

          {naCount > 0 && (
            <div className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{naCount} Missing Doc</span>
            </div>
          )}
        </div>
      </div>

      {/* Rules Cards List */}
      <div className="space-y-2.5">
        {shipment.crossChecks.map((check) => {
          const isPassed = check.status === 'PASSED';
          const isFailed = check.status === 'FAILED';
          const isNA = check.status === 'NOT_AVAILABLE';

          return (
            <div
              key={check.id}
              className={`rounded-xl border p-3.5 transition-all shadow-xs ${
                isFailed
                  ? 'bg-rose-50/40 border-rose-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                    {getCategoryIcon(check.category)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-slate-900 text-xs">{check.title}</h4>
                      <span className="text-[10px] uppercase font-mono text-slate-400">
                        {check.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{check.description}</p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  {isPassed && (
                    <span className="text-emerald-700 bg-emerald-50 text-xs px-2 py-0.5 rounded border border-emerald-200 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Passed {check.resolved ? '(Reconciled)' : ''}
                    </span>
                  )}
                  {isFailed && (
                    <span className="text-rose-700 bg-rose-50 text-xs px-2 py-0.5 rounded border border-rose-200 font-medium flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      Mismatch
                    </span>
                  )}
                  {isNA && (
                    <span className="text-amber-700 bg-amber-50 text-xs px-2 py-0.5 rounded border border-amber-200 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      Doc Missing
                    </span>
                  )}
                </div>
              </div>

              {/* Document Values Grid */}
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                {['invoice', 'packing_list', 'bill_of_lading'].map((docKey) => {
                  const val = check.docValues[docKey as keyof typeof check.docValues];
                  const hasVal = val !== undefined;

                  return (
                    <div
                      key={docKey}
                      className={`p-2 rounded-lg border ${
                        hasVal ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-50/30 border-dashed border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="text-[10px] uppercase text-slate-400 font-sans font-medium mb-0.5 flex justify-between">
                        <span>{docKey.replace('_', ' ')}</span>
                        {hasVal && (
                          <button
                            onClick={() => onJumpToDoc(docKey as any)}
                            className="text-slate-600 hover:text-slate-900 text-[10px]"
                          >
                            View
                          </button>
                        )}
                      </div>
                      <div className="font-semibold text-slate-800 truncate text-[11px]">
                        {hasVal ? String(val) : '—'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message & Action Row */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="text-slate-600 flex items-start gap-1.5 flex-1">
                  <span className="font-medium text-slate-900 shrink-0">Finding:</span>
                  <span className={isFailed ? 'text-rose-800 font-medium' : 'text-slate-600'}>
                    {check.message}
                  </span>
                </div>

                {isFailed && !check.resolved && (
                  <button
                    onClick={() => openResolveModal(check)}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1 shadow-xs"
                  >
                    <span>Resolve Mismatch</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Discrepancy Resolution Modal */}
      {resolvingCheck && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-slate-700" />
                  <span>Resolve Cross-Check Discrepancy</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Shipment {shipment.id} · {resolvingCheck.title}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-rose-50/60 border border-rose-200 rounded-lg p-3 text-rose-900">
                <span className="font-medium block mb-0.5">Mismatched Values Detected:</span>
                <p className="text-rose-800 text-[11px]">{resolvingCheck.message}</p>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-2">
                  Select Confirmed Value for Customs Filing:
                </label>
                <div className="space-y-2">
                  {Object.entries(resolvingCheck.docValues)
                    .filter(([_, val]) => val !== undefined && val !== null)
                    .map(([doc, val]) => (
                    <label
                      key={doc}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        selectedValue === String(val)
                          ? 'bg-slate-50 border-slate-900'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="radio"
                          name="resolutionChoice"
                          value={String(val)}
                          checked={selectedValue === String(val)}
                          onChange={(e) => setSelectedValue(e.target.value)}
                          className="text-slate-900 focus:ring-slate-900"
                        />
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-mono block">
                            {doc.replace('_', ' ')}
                          </span>
                          <span className="font-mono text-xs text-slate-900 font-semibold">{String(val)}</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500">Adopt value</span>
                    </label>
                  ))}

                  <label
                    className={`flex items-center p-2.5 rounded-lg border cursor-pointer transition-all ${
                      selectedValue === '__custom__'
                        ? 'bg-slate-50 border-slate-900'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="resolutionChoice"
                      value="__custom__"
                      checked={selectedValue === '__custom__'}
                      onChange={() => setSelectedValue('__custom__')}
                      className="text-slate-900 focus:ring-slate-900 mr-2.5"
                    />
                    <span className="font-medium text-slate-700">Enter custom reconciled value</span>
                  </label>

                  {selectedValue === '__custom__' && (
                    <div className="pl-6 pt-1">
                      <input
                        type="text"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        placeholder="e.g. 3,165.00 kg"
                        className="w-full text-xs p-2 border border-slate-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Justification / Audit Reason (Required for Compliance):
                </label>
                <textarea
                  rows={2}
                  value={resolutionReason}
                  onChange={(e) => setResolutionReason(e.target.value)}
                  placeholder="e.g. Verified with supplier: Packing list includes 45kg wooden pallet tare weight."
                  className="w-full text-xs p-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={closeModal}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolution}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Resolution</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
