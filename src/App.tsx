/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar.js';
import { Navbar } from './components/Navbar.js';
import { ScanDetailModal } from './components/ScanDetailModal.js';
import { Dashboard } from './pages/Dashboard.js';
import { UrlScanner } from './pages/UrlScanner.js';
import { TextScanner } from './pages/TextScanner.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { ModelPerformancePage } from './pages/ModelPerformancePage.js';
import { CyberSafetyPage } from './pages/CyberSafetyPage.js';
import { AboutVivaPage } from './pages/AboutVivaPage.js';
import { ScanResult } from './types/index.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedScanForModal, setSelectedScanForModal] = useState<ScanResult | null>(null);

  const handleOpenAuditModal = (scan: ScanResult) => {
    setSelectedScanForModal(scan);
  };

  const handleCloseAuditModal = () => {
    setSelectedScanForModal(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navbar */}
        <Navbar
          onNavigateTab={setCurrentTab}
          onSearch={(term) => {
            setCurrentTab('history');
          }}
        />

        {/* Tab Pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigateTab={setCurrentTab}
              onSelectScan={handleOpenAuditModal}
            />
          )}

          {currentTab === 'url-scanner' && (
            <UrlScanner
              onOpenAuditModal={handleOpenAuditModal}
            />
          )}

          {currentTab === 'text-scanner' && (
            <TextScanner
              onOpenAuditModal={handleOpenAuditModal}
            />
          )}

          {currentTab === 'history' && (
            <HistoryPage
              onSelectScan={handleOpenAuditModal}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage />
          )}

          {currentTab === 'model-performance' && (
            <ModelPerformancePage />
          )}

          {currentTab === 'safety' && (
            <CyberSafetyPage />
          )}

          {currentTab === 'about' && (
            <AboutVivaPage />
          )}
        </main>
      </div>

      {/* Forensic Audit Detail Modal */}
      <ScanDetailModal
        scan={selectedScanForModal}
        onClose={handleCloseAuditModal}
      />
    </div>
  );
}
