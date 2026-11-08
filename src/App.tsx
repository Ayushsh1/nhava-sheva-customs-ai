/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shipment, User } from './types/shipment';
import { INITIAL_SHIPMENTS, SEED_USERS } from './data/seedData';
import { Navbar } from './components/Navbar';
import { ShipmentList } from './components/ShipmentList';
import { ReviewWorkspace } from './components/ReviewWorkspace';
import { CreateShipmentModal } from './components/CreateShipmentModal';
import { ExportModal } from './components/ExportModal';
import { ManagerDashboard } from './components/ManagerDashboard';
import { CheckCircle2, ShieldCheck, Ship, Info } from 'lucide-react';

export default function App() {
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[0]);
  const [activeTab, setActiveTab] = useState<'shipments' | 'analytics'>('shipments');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportTargetShipment, setExportTargetShipment] = useState<Shipment | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSelectShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateShipment = (updated: Shipment) => {
    setShipments(prev => prev.map(s => (s.id === updated.id ? updated : s)));
    setSelectedShipment(updated);
  };

  const handleShipmentCreated = (newShipment: Shipment) => {
    setShipments(prev => [newShipment, ...prev]);
    setIsCreateOpen(false);
    setSelectedShipment(newShipment);
    showNotification(`Shipment ${newShipment.id} created and extracted successfully!`);
  };

  const handleOpenExport = (shipment: Shipment) => {
    setExportTargetShipment(shipment);
    setIsExportOpen(true);
  };

  const handleExportSuccess = (filename: string, rowCount: number) => {
    if (!exportTargetShipment) return;

    const updated: Shipment = {
      ...exportTargetShipment,
      status: 'Exported',
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: currentUser.name,
        csvFilename: filename,
        rowCount
      },
      auditLog: [
        {
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'export_generated',
          fieldLabel: 'Customs CSV Export',
          newValue: filename,
          reason: `Generated ICEGATE import CSV with ${rowCount} line items for Port INNSA.`
        },
        ...exportTargetShipment.auditLog
      ]
    };

    handleUpdateShipment(updated);
    setIsExportOpen(false);
    showNotification(`Exported customs file: ${filename}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        users={SEED_USERS}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedShipment(null);
        }}
        onNewShipment={() => setIsCreateOpen(true)}
      />

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg border border-slate-800 flex items-center space-x-2 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {selectedShipment ? (
          <ReviewWorkspace
            shipment={selectedShipment}
            currentUser={currentUser}
            onBack={() => setSelectedShipment(null)}
            onUpdateShipment={handleUpdateShipment}
            onOpenExport={() => handleOpenExport(selectedShipment)}
          />
        ) : activeTab === 'shipments' ? (
          <ShipmentList
            shipments={shipments}
            onSelectShipment={handleSelectShipment}
            onNewShipment={() => setIsCreateOpen(true)}
            onExportShipment={handleOpenExport}
          />
        ) : (
          <ManagerDashboard
            shipments={shipments}
            currentUser={currentUser}
            onSelectShipment={handleSelectShipment}
          />
        )}
      </main>

      {/* Modals */}
      <CreateShipmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onShipmentCreated={handleShipmentCreated}
      />

      {exportTargetShipment && (
        <ExportModal
          shipment={exportTargetShipment}
          currentUser={currentUser}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          onExportSuccess={handleExportSuccess}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center space-x-2">
            <Ship className="w-4 h-4 text-slate-700" />
            <span className="font-medium text-slate-800">Company A</span>
            <span>·</span>
            <span>Customs Brokerage & Freight Forwarding (Port INNSA)</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
            <span>DPDP Act 2023 Compliant</span>
            <span>·</span>
            <span>ICEGATE Import v2.4 Layout</span>
            <span>·</span>
            <span>ISOCODE LABS Internship Assessment</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
