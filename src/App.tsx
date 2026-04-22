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
const PlanListPage = lazy(() =>
  import('./features/saas/pages/PlanListPage').then((module) => ({
    default: module.PlanListPage,
  }))
);
const PlanFormPage = lazy(() =>
  import('./features/saas/pages/PlanFormPage').then((module) => ({
    default: module.PlanFormPage,
  }))
);
const PlanDetailPage = lazy(() =>
  import('./features/saas/pages/PlanDetailPage').then((module) => ({
    default: module.PlanDetailPage,
  }))
);

// Importar Clients pages
const ClientListPage = lazy(() =>
  import('./features/clients/pages/ClientListPage').then((module) => ({
    default: module.ClientListPage,
  }))
);
const ClientFormPage = lazy(() =>
  import('./features/clients/pages/ClientFormPage').then((module) => ({
    default: module.ClientFormPage,
  }))
);

// Importar Products pages
const ProductListPage = lazy(() =>
  import('./features/products/pages/ProductListPage').then((module) => ({
    default: module.ProductListPage,
  }))
);
const ProductFormPage = lazy(() =>
  import('./features/products/pages/ProductFormPage').then((module) => ({
    default: module.ProductFormPage,
  }))
);

// Importar Branches page
const BranchListPage = lazy(() =>
  import('./features/branches/pages/BranchListPage').then((module) => ({
    default: module.BranchListPage,
  }))
);

// Importar Subscription pages
const SubscriptionPlansPage = lazy(() => import('./features/saas/pages/SubscriptionPlansPage'));
const CurrentSubscriptionPage = lazy(() => import('./features/saas/pages/CurrentSubscriptionPage'));
const CheckoutPage = lazy(() => import('./features/saas/pages/CheckoutPage'));
const SubscriptionSuccessPage = lazy(() => import('./features/saas/pages/SubscriptionSuccessPage'));

// Importar Loan pages
const LoanApplicationListPage = lazy(() => import('./features/loans/pages/LoanApplicationListPage'));
const LoanApplicationFormPage = lazy(() => import('./features/loans/pages/LoanApplicationFormPage'));
const LoanApplicationDetailPage = lazy(() => import('./features/loans/pages/LoanApplicationDetailPage'));

// Importar Audit pages
const AuditDashboard = lazy(() =>
  import('./features/audit/pages/AuditDashboard').then((module) => ({
    default: module.AuditDashboard,
  }))
);
const AuditLogsPage = lazy(() =>
  import('./features/audit/pages/AuditLogsPage').then((module) => ({
    default: module.AuditLogsPage,
  }))
);
const SecurityEventsPage = lazy(() =>
  import('./features/audit/pages/SecurityEventsPage').then((module) => ({
    default: module.SecurityEventsPage,
  }))
);

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

            {/* Rutas de Clientes */}
            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="clients.view">
                    <ClientListPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients/new"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="clients.create">
                    <ClientFormPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients/:clientId/edit"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="clients.edit">
                    <ClientFormPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />

            {/* Rutas de Productos */}
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="products.view">
                    <ProductListPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/new"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="products.create">
                    <ProductFormPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:productId/edit"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="products.edit">
                    <ProductFormPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />

            {/* Rutas de Sucursales */}
            <Route
              path="/branches"
              element={
                <ProtectedRoute>
                  <BranchListPage />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Suscripciones */}
            <Route
              path="/subscription/plans"
              element={
                <ProtectedRoute>
                  <SubscriptionPlansPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription/current"
              element={
                <ProtectedRoute>
                  <CurrentSubscriptionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription/checkout/:planId"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription/success"
              element={
                <ProtectedRoute>
                  <SubscriptionSuccessPage />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Solicitudes de Crédito */}
            <Route
              path="/loans"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="loans.view">
                    <LoanApplicationListPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans/new"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="loans.create">
                    <LoanApplicationFormPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans/:id"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="loans.view">
                    <LoanApplicationDetailPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/loans/:id/edit"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="loans.edit">
                    <LoanApplicationFormPage />
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
            <Route
              path="/saas/plans"
              element={
                <ProtectedRoute>
                  <PlanListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saas/plans/new"
              element={
                <ProtectedRoute>
                  <PlanFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saas/plans/:planId"
              element={
                <ProtectedRoute>
                  <PlanDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saas/plans/:planId/edit"
              element={
                <ProtectedRoute>
                  <PlanFormPage />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Auditoría y Seguridad (Solo para superadmins) */}
            <Route
              path="/audit/dashboard"
              element={
                <ProtectedRoute>
                  <AuditDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit/logs"
              element={
                <ProtectedRoute>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit/security-events"
              element={
                <ProtectedRoute>
                  <SecurityEventsPage />
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
