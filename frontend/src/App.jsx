/**
 * Main App — React Router setup with protected routes and theme/auth providers.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import Layout from './components/Layout';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Main pages (7 core)
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Contracts from './pages/Contracts';
import ContractAnalysis from './pages/ContractAnalysis';
import LegalChat from './pages/LegalChat';
import Negotiate from './pages/Negotiate';
import Compliance from './pages/Compliance';
import VendorIntel from './pages/VendorIntel';
import CompareContracts from './pages/CompareContracts';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

// Public route (redirect if already logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Protected routes inside Layout */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="upload" element={<Upload />} />
        <Route path="contracts" element={<Contracts />} />
        <Route path="contracts/:id" element={<ContractAnalysis />} />
        <Route path="chat" element={<LegalChat />} />
        <Route path="negotiate" element={<Negotiate />} />
        <Route path="compliance" element={<Compliance />} />
        <Route path="vendor" element={<VendorIntel />} />
        <Route path="compare" element={<CompareContracts />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
              },
            }}
          />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
