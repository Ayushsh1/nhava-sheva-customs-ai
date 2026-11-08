import React, { useState } from 'react';
import { Shipment, DocumentType, User } from '../types/shipment';
import { DocumentViewer } from './DocumentViewer';
import { FieldReviewPanel } from './FieldReviewPanel';
import { CrossCheckSummary } from './CrossCheckSummary';
import { getExportBlockers, evaluateAllCrossChecks } from '../utils/validation';
import { 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  History, 
  Building2,
  Check
} from 'lucide-react';

interface ReviewWorkspaceProps {
  shipment: Shipment;
  currentUser: User;
  onBack: () => void;
  onUpdateShipment: (updated: Shipment) => void;
  onOpenExport: () => void;
}

export const ReviewWorkspace: React.FC<ReviewWorkspaceProps> = ({
  shipment,
  currentUser,
  onBack,
  onUpdateShipment,
  onOpenExport,
}) => {
  const [activeDoc, setActiveDoc] = useState<DocumentType>('invoice');
  const [activeTab, setActiveTab] = useState<'fields' | 'crosschecks' | 'audit'>('fields');
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | undefined>();
  const [autoOpenCheckId, setAutoOpenCheckId] = useState<string | null>(null);

  const blockers = getExportBlockers(shipment);

  // Field Edit Handler with Audit Logging
  const handleUpdateField = (category: string, key: string, newValue: any, reason: string) => {
    const updated = { ...shipment };
    const now = new Date().toISOString();

    let previousValue = '';

    if (category === 'parties') {
      const field = (updated.parties as any)[key];
      previousValue = String(field?.value ?? '');
      field.value = newValue;
      field.confirmed = true;
      field.status = 'corrected';
    } else if (category === 'invoice') {
      const field = (updated.invoice as any)[key];
      previousValue = String(field?.value ?? '');
      field.value = newValue;
      field.confirmed = true;
      field.status = 'corrected';
    } else if (category === 'packing') {
      const field = (updated.packing as any)[key];
      previousValue = String(field?.value ?? '');
      field.value = newValue;
      field.confirmed = true;
      field.status = 'corrected';
    } else if (category === 'transport') {
      const field = (updated.transport as any)[key];
      previousValue = String(field?.value ?? '');
      field.value = newValue;
      field.confirmed = true;
      field.status = 'corrected';
    }

    // Append to Audit Trail
    updated.auditLog.unshift({
      id: `aud_${Date.now()}`,
      timestamp: now,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'field_edit',
      fieldKey: `${category}.${key}`,
      fieldLabel: `${category.toUpperCase()} > ${key}`,
      previousValue,
      newValue: String(newValue),
      reason
    });

    // Re-evaluate cross checks with new values
    updated.crossChecks = evaluateAllCrossChecks(updated);

    // Update status if export blockers cleared
    const newBlockers = getExportBlockers(updated);
    if (newBlockers.isReadyForExport && updated.status === 'Needs Review') {
      updated.status = 'Ready to Export';
    }

    updated.updatedAt = now;
    onUpdateShipment(updated);
  };

  // Field Confirm Handler
  const handleConfirmField = (category: string, key: string) => {
    const updated = { ...shipment };
    const now = new Date().toISOString();

    if (category === 'lineItemHSN') {
      const item = updated.invoice.lineItems.find(i => i.id === key);
      if (item) {
        item.hsnCode.confirmed = true;
        item.hsnCode.status = 'confirmed';
      }
    } else if (category === 'parties') {
      (updated.parties as any)[key].confirmed = true;
    } else if (category === 'invoice') {
      (updated.invoice as any)[key].confirmed = true;
    } else if (category === 'packing') {
      (updated.packing as any)[key].confirmed = true;
    } else if (category === 'transport') {
      (updated.transport as any)[key].confirmed = true;
    }

    updated.auditLog.unshift({
      id: `aud_${Date.now()}`,
      timestamp: now,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'field_confirm',
      fieldKey: `${category}.${key}`,
      fieldLabel: `${category} > ${key}`,
      reason: 'Human verification by documentation executive'
    });

    const newBlockers = getExportBlockers(updated);
    if (newBlockers.isReadyForExport && updated.status === 'Needs Review') {
      updated.status = 'Ready to Export';
    }

    updated.updatedAt = now;
    onUpdateShipment(updated);
  };

  // Bulk Confirm High Confidence
  const handleConfirmAllHighConfidence = () => {
    const updated = { ...shipment };
    const now = new Date().toISOString();
    let confirmedCount = 0;

    const confirmIfHigh = (field: any) => {
      if (field && field.confidence >= 0.90 && !field.confirmed) {
        field.confirmed = true;
        confirmedCount++;
      }
    };

    Object.values(updated.parties).forEach(confirmIfHigh);
    Object.values(updated.invoice).forEach(confirmIfHigh);
    Object.values(updated.packing).forEach(confirmIfHigh);
    Object.values(updated.transport).forEach(confirmIfHigh);

    updated.invoice.lineItems.forEach(item => {
      confirmIfHigh(item.hsnCode);
      confirmIfHigh(item.quantity);
      confirmIfHigh(item.unitPrice);
      confirmIfHigh(item.lineAmount);
    });

    updated.auditLog.unshift({
      id: `aud_${Date.now()}`,
      timestamp: now,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'field_confirm',
      fieldLabel: 'Bulk Confirmation',
      reason: `Bulk confirmed ${confirmedCount} high-confidence fields (>90%)`
    });

    const newBlockers = getExportBlockers(updated);
    if (newBlockers.isReadyForExport && updated.status === 'Needs Review') {
      updated.status = 'Ready to Export';
    }

    updated.updatedAt = now;
    onUpdateShipment(updated);
  };

  // Resolve Discrepancy Handler
  const handleResolveCrossCheck = (checkId: string, resolvedValue: any, reason: string) => {
    const updated = { ...shipment };
    const now = new Date().toISOString();

    const targetCheck = updated.crossChecks.find(c => c.id === checkId);
    if (targetCheck) {
      targetCheck.status = 'PASSED';
      targetCheck.resolved = true;
      targetCheck.resolvedValue = resolvedValue;
      targetCheck.resolvedReason = reason;
      targetCheck.resolvedBy = `${currentUser.name} (${currentUser.title})`;
      targetCheck.resolvedAt = now;

      // If it was gross weight check, update gross weight
      if (checkId === 'gross_weight') {
        const numVal = parseFloat(String(resolvedValue).replace(/[^0-9.]/g, ''));
        if (!isNaN(numVal) && numVal > 0) {
          updated.packing.grossWeightKg.value = numVal;
          updated.packing.grossWeightKg.confirmed = true;
          updated.packing.grossWeightKg.status = 'corrected';
        }
      }

      updated.auditLog.unshift({
        id: `aud_${Date.now()}`,
        timestamp: now,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'cross_check_resolve',
        fieldKey: checkId,
        fieldLabel: `Resolved Discrepancy: ${targetCheck.title}`,
        newValue: String(resolvedValue),
        reason
      });

      const newBlockers = getExportBlockers(updated);
      if (newBlockers.isReadyForExport && updated.status === 'Needs Review') {
        updated.status = 'Ready to Export';
      }

      updated.updatedAt = now;
      onUpdateShipment(updated);
    }
  };

  // Manager Approval Action
  const handleManagerApproval = (approve: boolean) => {
    const updated = { ...shipment };
    const now = new Date().toISOString();

    updated.managerApproval = {
      status: approve ? 'approved' : 'rejected',
      reviewedBy: currentUser.name,
      reviewedAt: now,
      remarks: approve ? 'Reviewed and approved for customs filing.' : 'Requires executive re-examination.'
    };

    if (approve && updated.status === 'Needs Review') {
      updated.status = 'Ready to Export';
    }

    updated.auditLog.unshift({
      id: `aud_${Date.now()}`,
      timestamp: now,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'manager_approval',
      fieldLabel: 'Manager Review Sign-Off',
      newValue: approve ? 'Approved' : 'Rejected',
      reason: updated.managerApproval.remarks
    });

    updated.updatedAt = now;
    onUpdateShipment(updated);
  };

  return (
    <div className="space-y-4">
      {/* Top Workspace Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
            title="Return to Shipments List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-slate-900">{shipment.id}</span>
              <span className="text-slate-300">·</span>
              <span className="font-semibold text-slate-800 text-sm">{shipment.parties.supplierName.value}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Consignee: {shipment.parties.importerName.value} (IEC: {shipment.parties.importerIec.value})
            </p>
          </div>
        </div>

        {/* Tab Switcher & Export Trigger */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('fields')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'fields'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Extracted Fields
            </button>
            <button
              onClick={() => setActiveTab('crosschecks')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'crosschecks'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>5-Point Cross-Checks</span>
              {blockers.failedCount > 0 ? (
                <span className="bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {blockers.failedCount}
                </span>
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                activeTab === 'audit'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Log ({shipment.auditLog.length})</span>
            </button>
          </div>

          {/* Export Action Button */}
          <button
            onClick={onOpenExport}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center space-x-1.5 ${
              blockers.isReadyForExport
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{blockers.isReadyForExport ? 'Export Customs CSV' : 'Export Readiness'}</span>
          </button>
        </div>
      </div>

      {/* Manager Review Sign-Off Banner */}
      {currentUser.role === 'manager' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="font-semibold text-slate-900">Documentation Manager Authority:</span>
              <span className="text-slate-600 ml-1">
                {shipment.managerApproval?.status === 'approved'
                  ? `Approved by ${shipment.managerApproval.reviewedBy} at ${new Date(shipment.managerApproval.reviewedAt!).toLocaleTimeString()}`
                  : 'Review discrepancy resolutions and approve for Indian Customs filing.'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {shipment.managerApproval?.status !== 'approved' ? (
              <button
                onClick={() => handleManagerApproval(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve for Filing</span>
              </button>
            ) : (
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 font-medium px-2.5 py-1 rounded-md flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Manager Approved
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Side-by-Side Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[750px]">
        {/* Left Side: Document Viewer (6 cols on lg) */}
        <div className="lg:col-span-6 h-[780px] sticky top-20">
          <DocumentViewer
            shipment={shipment}
            activeDoc={activeDoc}
            onDocChange={setActiveDoc}
            selectedFieldKey={selectedFieldKey}
          />
        </div>

        {/* Right Side: Field Review / Cross-Checks / Audit Log (6 cols on lg) */}
        <div className="lg:col-span-6 h-[780px] overflow-y-auto pr-1">
          {activeTab === 'fields' && (
            <FieldReviewPanel
              shipment={shipment}
              currentUser={currentUser}
              onUpdateField={handleUpdateField}
              onConfirmField={handleConfirmField}
              onConfirmAllHighConfidence={handleConfirmAllHighConfidence}
              onSelectDoc={setActiveDoc}
              onResolveDiscrepancyClick={(checkId) => {
                setActiveTab('crosschecks');
                setAutoOpenCheckId(checkId);
              }}
            />
          )}

          {activeTab === 'crosschecks' && (
            <CrossCheckSummary
              shipment={shipment}
              currentUser={currentUser}
              onResolveCheck={handleResolveCrossCheck}
              onJumpToDoc={setActiveDoc}
              initialOpenCheckId={autoOpenCheckId}
              onModalClosed={() => setAutoOpenCheckId(null)}
            />
          )}

          {activeTab === 'audit' && (
            <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-600" />
                  <span>Shipment Audit Trail</span>
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  {shipment.auditLog.length} Records
                </span>
              </div>

              {shipment.auditLog.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No changes recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {shipment.auditLog.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">
                          {log.userName} <span className="font-normal text-slate-400">({log.userRole})</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] font-semibold text-slate-800">
                        {log.fieldLabel || log.fieldKey}
                      </div>
                      {log.previousValue !== undefined && log.newValue !== undefined && (
                        <div className="font-mono text-[11px] text-slate-600 bg-white p-1.5 rounded border border-slate-200">
                          <span className="line-through text-rose-600">{log.previousValue}</span>
                          <span className="mx-1.5 text-slate-400">➔</span>
                          <span className="text-emerald-700 font-semibold">{log.newValue}</span>
                        </div>
                      )}
                      {log.reason && (
                        <div className="text-[11px] text-slate-500 italic">
                          Reason: {log.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
