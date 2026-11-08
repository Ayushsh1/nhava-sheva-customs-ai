import React from 'react';
import { User } from '../types/shipment';
import { Ship, UserCheck, FileSpreadsheet, BarChart3, Plus, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  users: User[];
  activeTab: 'shipments' | 'analytics';
  onTabChange: (tab: 'shipments' | 'analytics') => void;
  onNewShipment: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onUserChange,
  users,
  activeTab,
  onTabChange,
  onNewShipment,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onTabChange('shipments')}
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-600 transition-colors">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base tracking-tight text-slate-900">
                  Nhava Sheva Customs AI
                </span>
                <span className="bg-slate-100 text-slate-600 text-[11px] px-1.5 py-0.5 rounded font-mono font-medium border border-slate-200">
                  INNSA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Company A • Import Extraction & Multi-Doc Verification
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onTabChange('shipments')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'shipments'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Shipments</span>
            </button>
            <button
              onClick={() => onTabChange('analytics')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-slate-100 text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Manager Analytics & Audit</span>
            </button>
          </nav>

          {/* User Role Switcher & New Shipment Action */}
          <div className="flex items-center space-x-3">
            {/* Role Switcher */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
              <span className="text-slate-400 mr-1.5 hidden sm:inline">Role:</span>
              <select
                aria-label="Switch User Role"
                value={currentUser.id}
                onChange={(e) => {
                  const u = users.find((item) => item.id === e.target.value);
                  if (u) onUserChange(u);
                }}
                className="bg-transparent text-slate-800 text-xs font-medium focus:outline-none cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'executive' ? 'Executive' : 'Manager'})
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={onNewShipment}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-xs transition-all flex items-center space-x-1.5 active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Shipment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-bar: Minimal, clean, informational */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-4 py-1.5 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-slate-700">Port INNSA Active Node</span>
            <span className="text-slate-300">·</span>
            <span>DPDP Act 2023 Compliant</span>
            <span className="text-slate-300">·</span>
            <span className="hidden sm:inline">Zero Model Retention</span>
          </div>
          <div className="hidden sm:flex items-center space-x-3 text-slate-500 font-mono text-[11px]">
            <span>ICEGATE Import v2.4</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-sans font-medium">Avg Turnaround: 11.2m</span>
          </div>
        </div>
      </div>
    </header>
  );
};
