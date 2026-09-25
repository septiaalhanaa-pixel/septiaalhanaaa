import React, { useState, useEffect } from 'react';
import { 
  initDatabase, authService, onDataChange, 
  vesselService, bookingService, portService, routeService 
} from './services/db';
import { User, Booking, UserRole } from './types';

// Layout & Modals
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { LoginModal } from './components/auth/LoginModal';
import { LoginPage } from './components/auth/LoginPage';
import { DatabaseConnectorModal } from './components/database/DatabaseConnectorModal';

// Views
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';
import { MaritimeTrackingMap } from './components/tracking/MaritimeTrackingMap';
import { MasterVessels } from './components/master/MasterVessels';
import { MasterPorts } from './components/master/MasterPorts';
import { MasterRoutes } from './components/master/MasterRoutes';
import { MasterCommodities } from './components/master/MasterCommodities';
import { MasterCustomers } from './components/master/MasterCustomers';
import { TransactionBookings } from './components/transactions/TransactionBookings';
import { BillOfLadingView } from './components/transactions/BillOfLadingView';
import { VoyageLogsView } from './components/transactions/VoyageLogsView';
import { ReportsView } from './components/reports/ReportsView';
import { NotificationCenter } from './components/notifications/NotificationCenter';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Modals & Sub-views
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDbConfigModalOpen, setIsDbConfigModalOpen] = useState(false);
  const [selectedBookingForBL, setSelectedBookingForBL] = useState<Booking | null>(null);
  const [mapSearchBL, setMapSearchBL] = useState<string>('');

  // Initialize DB on first render
  useEffect(() => {
    initDatabase();
    setCurrentUser(authService.getCurrentUser());

    // Listen for multi-tab live data synchronization
    const unsubscribe = onDataChange(() => {
      setCurrentUser(authService.getCurrentUser());
    });

    return () => unsubscribe();
  }, []);

  const handleRoleSwitch = (role: UserRole) => {
    if (currentUser) {
      const updated = { ...currentUser, role };
      authService.setCurrentUser(updated);
      setCurrentUser(updated);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const handleSearchBL = (query: string) => {
    setMapSearchBL(query);
    setActiveTab('map_tracking');
  };

  const handleViewBL = (booking: Booking) => {
    setSelectedBookingForBL(booking);
  };

  // If user is not logged in, show the Login Page before entering the application
  if (!currentUser) {
    return (
      <>
        <LoginPage
          onLoginSuccess={(user) => {
            setCurrentUser(user);
          }}
          onOpenDbConfig={() => setIsDbConfigModalOpen(true)}
          onQuickTrack={(bl) => {
            setMapSearchBL(bl);
          }}
        />

        <DatabaseConnectorModal
          isOpen={isDbConfigModalOpen}
          onClose={() => setIsDbConfigModalOpen(false)}
          onDataResetOrImport={() => {
            setCurrentUser(authService.getCurrentUser());
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenDbConfig={() => setIsDbConfigModalOpen(true)}
        onOpenNotifications={() => setActiveTab('notifications')}
        onSearchBL={handleSearchBL}
        onSelectRole={handleRoleSwitch}
      />

      {/* Main Container with Sidebar */}
      <div className="flex-1 flex">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedBookingForBL(null); // Reset BL preview if navigating away
          }}
          userRole={currentUser?.role}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Mobile Toggle Button */}
        <div className="fixed bottom-5 right-5 z-30 lg:hidden">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-2xl flex items-center justify-center font-bold"
          >
            ☰
          </button>
        </div>

        {/* View Port Content Area */}
        <main className="flex-1 lg:pl-64 min-w-0 pb-12 overflow-x-hidden">
          {selectedBookingForBL ? (
            <BillOfLadingView
              booking={selectedBookingForBL}
              onBack={() => setSelectedBookingForBL(null)}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <AnalyticsDashboard
                  onNavigateToMap={(vesId) => {
                    setActiveTab('map_tracking');
                  }}
                  onNavigateToBookings={() => setActiveTab('trans_bookings')}
                  onNewBookingClick={() => setActiveTab('trans_bookings')}
                  onViewBL={handleViewBL}
                />
              )}

              {activeTab === 'map_tracking' && (
                <MaritimeTrackingMap
                  initialSearchBL={mapSearchBL}
                  onOpenBookingDetails={handleViewBL}
                />
              )}

              {/* Master Data */}
              {activeTab === 'master_vessels' && <MasterVessels />}
              {activeTab === 'master_ports' && <MasterPorts />}
              {activeTab === 'master_routes' && <MasterRoutes />}
              {activeTab === 'master_commodities' && <MasterCommodities />}
              {activeTab === 'master_customers' && <MasterCustomers />}

              {/* Transactions */}
              {activeTab === 'trans_bookings' && (
                <TransactionBookings
                  onViewBL={handleViewBL}
                  onOpenMapTrack={() => setActiveTab('map_tracking')}
                />
              )}
              {activeTab === 'trans_bl' && (
                <TransactionBookings
                  onViewBL={handleViewBL}
                  onOpenMapTrack={() => setActiveTab('map_tracking')}
                />
              )}
              {activeTab === 'trans_voyages' && (
                <VoyageLogsView onOpenMap={() => setActiveTab('map_tracking')} />
              )}

              {/* Reports & Analytics */}
              {activeTab === 'reports' && <ReportsView />}

              {/* Automated Notifications */}
              {activeTab === 'notifications' && <NotificationCenter />}

              {/* Real DB Connector Direct Tab */}
              {activeTab === 'database_settings' && (
                <div className="p-4 lg:p-8 max-w-4xl mx-auto">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-2">⚙️ Pengaturan Real Database & Multi-Cloud</h2>
                    <p className="text-xs text-slate-400 mb-6">
                      Aplikasi ini sudah terhubung ke mesin real persistent database lokal secara default, dan siap dikoneksikan ke Supabase, Neon DB PostgreSQL, atau Firebase.
                    </p>
                    <button
                      onClick={() => setIsDbConfigModalOpen(true)}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 flex items-center gap-2"
                    >
                      <span>Buka Panel Konfigurasi Real Database</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      <DatabaseConnectorModal
        isOpen={isDbConfigModalOpen}
        onClose={() => setIsDbConfigModalOpen(false)}
        onDataResetOrImport={() => {
          setCurrentUser(authService.getCurrentUser());
        }}
      />
    </div>
  );
}
