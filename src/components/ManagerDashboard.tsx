import React from 'react';
import { Shipment, User } from '../types/shipment';
import { SUPPLIER_ANALYTICS } from '../data/seedData';
import { 
  Building2, 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Zap, 
  History
} from 'lucide-react';

interface ManagerDashboardProps {
  shipments: Shipment[];
  currentUser: User;
  onSelectShipment: (shipment: Shipment) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  shipments,
  currentUser,
  onSelectShipment,
}) => {
  const pendingApproval = shipments.filter(s => s.status === 'Needs Review' || s.managerApproval?.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header Banner (Light, modern) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">Quality Assurance & Analytics</span>
              <span>·</span>
              <span>Company A · Port INNSA</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-0.5">
              Customs Documentation Accuracy & Analytics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervises field-level OCR accuracy, supplier discrepancy patterns, executive audit logs, and ROI metrics.
            </p>
          </div>
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-400 block text-[11px]">Logged in:</span>
            <span className="font-medium text-slate-900">{currentUser.name}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Historical Accuracy</span>
            <Zap className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-950 mt-1 font-mono">96.4%</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Exceeds &gt;95% Target (200 test shipments)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Data-Entry Turnaround</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-950 mt-1 font-mono">11.2 min</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Down from 45.0 min (75% time reduction)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Annual Savings Run-rate</span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-950 mt-1 font-mono">₹70.29 L</div>
          <div className="text-[11px] text-slate-500 mt-1">
            ₹34.65L hours + ₹35.64L error fines
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Pending Manager Review</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-950 mt-1 font-mono">
            {pendingApproval.length} Shipments
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Flagged for review / sign-off
          </div>
        </div>
      </div>

      {/* Field-Level Accuracy Breakdown & Supplier Discrepancy Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Field Level Accuracy */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-xs flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-600" />
              <span>Field-Level Extraction Accuracy</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">200 Test Batch</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Invoice Number & Date</span>
                <span className="font-mono font-semibold text-slate-900">99.4%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '99.4%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Invoice Line Amounts & Currency</span>
                <span className="font-mono font-semibold text-slate-900">98.8%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98.8%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Container Numbers (ISO 6346)</span>
                <span className="font-mono font-semibold text-slate-900">97.2%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-slate-800 h-full rounded-full" style={{ width: '97.2%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Package Counts & UOM</span>
                <span className="font-mono font-semibold text-slate-900">96.5%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-slate-800 h-full rounded-full" style={{ width: '96.5%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>Gross & Net Cargo Weights</span>
                <span className="font-mono font-semibold text-slate-900">94.8%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '94.8%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 mb-1">
                <span>HSN Classification (Printed Document)</span>
                <span className="font-mono font-semibold text-slate-900">91.6%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '91.6%' }}></div>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Low-confidence HSNs trigger mandatory human verification before customs submission.
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Discrepancy Matrix */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900 text-xs flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>Supplier-Level Discrepancy & Risk Matrix</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Historical Tracking</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Supplier / Exporter</th>
                  <th className="py-2.5 px-3">Origin</th>
                  <th className="py-2.5 px-3 text-center">Volume</th>
                  <th className="py-2.5 px-3 text-center">Accuracy</th>
                  <th className="py-2.5 px-3">Frequent Discrepancies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SUPPLIER_ANALYTICS.map((sup) => (
                  <tr key={sup.supplierName} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-medium text-slate-900">{sup.supplierName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{sup.country}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{sup.shipmentCount}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-medium ${
                        sup.accuracyRate >= 95 ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                      }`}>
                        {sup.accuracyRate}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <div className="flex flex-wrap gap-1">
                        {sup.commonIssues.map((issue, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Global Audit Log Stream */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-xs flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <span>Operational Audit Trail & User Corrections</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Immutable Compliance Log</span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {shipments.flatMap(s => s.auditLog.map(log => ({ ...log, shipmentId: s.id }))).map((entry) => (
            <div key={entry.id} className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-semibold text-slate-900">{entry.shipmentId}</span>
                  <span className="font-medium text-slate-800">{entry.userName} ({entry.userRole})</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">{entry.fieldLabel || entry.action}</span>
                </div>
                {entry.previousValue !== undefined && entry.newValue !== undefined && (
                  <div className="font-mono text-[11px] text-slate-600">
                    Changed: <span className="line-through text-rose-500">{entry.previousValue}</span> ➔ <span className="font-medium text-emerald-600">{entry.newValue}</span>
                  </div>
                )}
                {entry.reason && (
                  <div className="text-[11px] text-slate-500 italic">Justification: {entry.reason}</div>
                )}
              </div>
              <div className="text-[11px] font-mono text-slate-400 shrink-0">
                {new Date(entry.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
