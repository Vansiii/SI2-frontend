import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { PermissionGuard } from './components/guards/PermissionGuard';
import { SaasRegistrationPage } from './features/auth/pages/SaasRegistrationPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { TwoFactorPage } from './features/auth/pages/TwoFactorPage';
import { PasswordResetRequestPage } from './features/auth/pages/PasswordResetRequestPage';
import { PasswordResetConfirmPage } from './features/auth/pages/PasswordResetConfirmPage';
import { HomePage } from './features/home/pages/HomePage';
import { ProfilePage } from './features/profile/pages/ProfilePage';

// erick sprint 0
// Importar roles pages
import { RoleListPage } from './features/roles/pages/RoleListPage';
import { RoleFormPage } from './features/roles/pages/RoleFormPage';
import { RolePermissionsPage } from './features/roles/pages/RolePermissionsPage';

// Importar users pages
import { UserListPage } from './features/users/pages/UserListPage';
import { UserFormPage } from './features/users/pages/UserFormPage';
import { UserRolesPage } from './features/users/pages/UserRolesPage';

// Importar SaaS pages
import { TenantListPage } from './features/saas/pages/TenantListPage';
import { TenantDetailPage } from './features/saas/pages/TenantDetailPage';
import { SaaSDashboardPage } from './features/saas/pages/SaaSDashboardPage';
import PermissionListPage from './features/saas/pages/PermissionListPage';
import PermissionFormPage from './features/saas/pages/PermissionFormPage';
import PermissionCoveragePage from './features/saas/pages/PermissionCoveragePage';

// Importar página de gestión de permisos de roles
import RolePermissionManagementPage from './features/roles/pages/RolePermissionManagementPage';

import { LandingPage } from './features/home/pages/LandingPage';

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

          {/* Rutas de Roles */}
          <Route
            path="/roles"
            element={
              <ProtectedRoute>
                <RoleListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles/create"
            element={
              <ProtectedRoute>
                <RoleFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles/:id/edit"
            element={
              <ProtectedRoute>
                <RoleFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles/:id/permissions"
            element={
              <ProtectedRoute>
                <RolePermissionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles/:id/permissions/manage"
            element={
              <ProtectedRoute>
                <RolePermissionManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Rutas de Usuarios */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <PermissionGuard permission="users.view">
                  <UserListPage />
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/new"
            element={
              <ProtectedRoute>
                <PermissionGuard permission="users.create">
                  <UserFormPage />
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:userId/edit"
            element={
              <ProtectedRoute>
                <PermissionGuard permission="users.edit">
                  <UserFormPage />
                </PermissionGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:userId/roles"
            element={
              <ProtectedRoute>
                <PermissionGuard permission="users.assign_roles">
                  <UserRolesPage />
                </PermissionGuard>
              </ProtectedRoute>
            }
          />

          {/* Rutas de Panel SaaS (Solo para superadmins) */}
          <Route
            path="/saas/dashboard"
            element={
              <ProtectedRoute>
                <SaaSDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saas/tenants"
            element={
              <ProtectedRoute>
                <TenantListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saas/tenants/:tenantId"
            element={
              <ProtectedRoute>
                <TenantDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saas/permissions"
            element={
              <ProtectedRoute>
                <PermissionListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saas/permissions/new"
            element={
              <ProtectedRoute>
                <PermissionFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saas/permissions/:id/edit"
            element={
              <ProtectedRoute>
                <PermissionFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saas/permissions/coverage"
            element={
              <ProtectedRoute>
                <PermissionCoveragePage />
              </ProtectedRoute>
            }
          />
          
          {/* Redirigir la raíz al landing page */}
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
