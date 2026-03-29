import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { SaasRegistrationPage } from './features/auth/pages/SaasRegistrationPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { TwoFactorPage } from './features/auth/pages/TwoFactorPage';
import { PasswordResetRequestPage } from './features/auth/pages/PasswordResetRequestPage';
import { PasswordResetConfirmPage } from './features/auth/pages/PasswordResetConfirmPage';
import { HomePage } from './features/home/pages/HomePage';
import { ProfilePage } from './features/profile/pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/register" element={<SaasRegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/2fa" element={<TwoFactorPage />} />
          <Route path="/forgot-password" element={<PasswordResetRequestPage />} />
          <Route path="/reset-password" element={<PasswordResetConfirmPage />} />
          
          {/* Rutas protegidas */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          
          {/* Redirigir la raíz al login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
