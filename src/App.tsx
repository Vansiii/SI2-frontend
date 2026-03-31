import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { PermissionGuard } from './components/guards/PermissionGuard';

const SaasRegistrationPage = lazy(() =>
  import('./features/auth/pages/SaasRegistrationPage').then((module) => ({
    default: module.SaasRegistrationPage,
  }))
);
const LoginPage = lazy(() =>
  import('./features/auth/pages/LoginPage').then((module) => ({
    default: module.LoginPage,
  }))
);
const TwoFactorPage = lazy(() =>
  import('./features/auth/pages/TwoFactorPage').then((module) => ({
    default: module.TwoFactorPage,
  }))
);
const PasswordResetRequestPage = lazy(() =>
  import('./features/auth/pages/PasswordResetRequestPage').then((module) => ({
    default: module.PasswordResetRequestPage,
  }))
);
const PasswordResetConfirmPage = lazy(() =>
  import('./features/auth/pages/PasswordResetConfirmPage').then((module) => ({
    default: module.PasswordResetConfirmPage,
  }))
);
const HomePage = lazy(() =>
  import('./features/home/pages/HomePage').then((module) => ({
    default: module.HomePage,
  }))
);
const ProfilePage = lazy(() =>
  import('./features/profile/pages/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  }))
);

// erick sprint 0
// Importar roles pages
const RoleListPage = lazy(() =>
  import('./features/roles/pages/RoleListPage').then((module) => ({
    default: module.RoleListPage,
  }))
);
const RoleFormPage = lazy(() =>
  import('./features/roles/pages/RoleFormPage').then((module) => ({
    default: module.RoleFormPage,
  }))
);
const RolePermissionsPage = lazy(() =>
  import('./features/roles/pages/RolePermissionsPage').then((module) => ({
    default: module.RolePermissionsPage,
  }))
);

// Importar users pages
const UserListPage = lazy(() =>
  import('./features/users/pages/UserListPage').then((module) => ({
    default: module.UserListPage,
  }))
);
const UserFormPage = lazy(() =>
  import('./features/users/pages/UserFormPage').then((module) => ({
    default: module.UserFormPage,
  }))
);
const UserRolesPage = lazy(() =>
  import('./features/users/pages/UserRolesPage').then((module) => ({
    default: module.UserRolesPage,
  }))
);

// Importar SaaS pages
const TenantListPage = lazy(() =>
  import('./features/saas/pages/TenantListPage').then((module) => ({
    default: module.TenantListPage,
  }))
);
const TenantDetailPage = lazy(() =>
  import('./features/saas/pages/TenantDetailPage').then((module) => ({
    default: module.TenantDetailPage,
  }))
);
const SaaSDashboardPage = lazy(() =>
  import('./features/saas/pages/SaaSDashboardPage').then((module) => ({
    default: module.SaaSDashboardPage,
  }))
);
const PermissionListPage = lazy(() => import('./features/saas/pages/PermissionListPage'));
const PermissionFormPage = lazy(() => import('./features/saas/pages/PermissionFormPage'));
const PermissionCoveragePage = lazy(() => import('./features/saas/pages/PermissionCoveragePage'));

// Importar página de gestión de permisos de roles
const RolePermissionManagementPage = lazy(
  () => import('./features/roles/pages/RolePermissionManagementPage')
);

const LandingPage = lazy(() =>
  import('./features/home/pages/LandingPage').then((module) => ({
    default: module.LandingPage,
  }))
);

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center text-slate-500">
      Cargando...
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<RouteFallback />}>
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
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
