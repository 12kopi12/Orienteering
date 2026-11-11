import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { PublicRacesPage } from './pages/PublicRacesPage';
import { PublicResultsPage } from './pages/PublicResultsPage';
import { LoginPage } from './pages/LoginPage';
import { AdminRacesPage } from './pages/AdminRacesPage';
import { AdminRaceDetailPage } from './pages/AdminRaceDetailPage';
import { AdminCompetitorsPage } from './pages/AdminCompetitorsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicRacesPage />} />
              <Route path="/results/:id" element={<PublicResultsPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminRacesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/races/:id"
                element={
                  <ProtectedRoute>
                    <AdminRaceDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/competitors"
                element={
                  <ProtectedRoute>
                    <AdminCompetitorsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4">
              <p>Orienteering Management System &bull; DCE Semestrální práce</p>
              <p className="mt-1">Python (Flask) &bull; PostgreSQL &bull; TypeScript (React + Vite)</p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
