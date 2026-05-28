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
const TenantBrandingPage = lazy(() =>
  import('./features/branding/pages/TenantBrandingPage').then((module) => ({
    default: module.TenantBrandingPage,
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
const ProductDetailPage = lazy(() =>
  import('./features/products/pages/ProductDetailPage').then((module) => ({
    default: module.ProductDetailPage,
  }))
);
const ProductParametersViewPage = lazy(() =>
  import('./features/products/pages/ProductParametersViewPage').then((module) => ({
    default: module.ProductParametersViewPage,
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
const IncomingApplicationsPage = lazy(() =>
  import('./features/loans/pages/IncomingApplicationsPage').then((module) => ({
    default: module.IncomingApplicationsPage,
  }))
);
const LoanDossierPage = lazy(() =>
  import('./features/loans/pages/LoanDossierPage').then((module) => ({
    default: module.LoanDossierPage,
  }))
);

// Importar Client Loan pages (CU-07: Timeline para clientes)
const MyApplicationsPage = lazy(() =>
  import('./features/loans/pages/MyApplicationsPage').then((module) => ({
    default: module.MyApplicationsPage,
  }))
);
const ClientApplicationDetailPage = lazy(() =>
  import('./features/loans/pages/ClientApplicationDetailPage').then((module) => ({
    default: module.ClientApplicationDetailPage,
  }))
);

// Importar Document pages (CU-12)
const DocumentManagementPage = lazy(() =>
  import('./features/documents/pages/DocumentManagementPage').then((module) => ({
    default: module.DocumentManagementPage,
  }))
);
const StaffDocumentsPage = lazy(() =>
  import('./features/documents/pages/StaffDocumentsPage').then((module) => ({
    default: module.StaffDocumentsPage,
  }))
);

// Importar Rule pages (CU-09)
const RulesManagementPage = lazy(() =>
  import('./features/rules/pages/RulesManagementPage').then((module) => ({
    default: module.RulesManagementPage,
  }))
);
const RuleSetListPage = lazy(() =>
  import('./features/rules/pages/RuleSetListPage').then((module) => ({
    default: module.RuleSetListPage,
  }))
);
const RuleSetAuditPage = lazy(() =>
  import('./features/rules/pages/RuleSetAuditPage').then((module) => ({
    default: module.RuleSetAuditPage,
  }))
);
const EligibilityRuleListPage = lazy(() =>
  import('./features/rules/pages/EligibilityRuleListPage').then((module) => ({
    default: module.EligibilityRuleListPage,
  }))
);
const ProductParameterListPage = lazy(() =>
  import('./features/rules/pages/ProductParameterListPage')
);
// DocumentRequirementListPage - DEPRECATED: Ya no se usa, los documentos se gestionan en productos

// Importar Backup pages
const TenantBackupsPage = lazy(() =>
  import('./features/saas/pages/TenantBackupsPage').then((module) => ({
    default: module.TenantBackupsPage,
  }))
);

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

// Importar Reports pages (CU-39)
const ReportsPage = lazy(() =>
  import('./features/reports/pages/ReportsPage').then((module) => ({
    default: module.ReportsPage,
  }))
);
const ReportBuilderPage = lazy(() =>
  import('./features/reports/pages/ReportBuilderPage').then((module) => ({
    default: module.ReportBuilderPage,
  }))
);
const VoiceReportPage = lazy(() =>
  import('./features/reports/pages/VoiceReportPage').then((module) => ({
    default: module.VoiceReportPage,
  }))
);
const TemplatesPage = lazy(() =>
  import('./features/reports/pages/TemplatesPage').then((module) => ({
    default: module.TemplatesPage,
  }))
);
const HistoryPage = lazy(() =>
  import('./features/reports/pages/HistoryPage').then((module) => ({
    default: module.HistoryPage,
  }))
);
const ManualReportsIndependentPage = lazy(() =>
  import('./features/reports/pages/ManualReportsIndependentPage').then((module) => ({
    default: module.ManualReportsIndependentPage,
  }))
);

// Importar Garantias pages
const CollateralListPage = lazy(() =>
  import('./features/garantias/pages/CollateralListPage').then((module) => ({
    default: module.CollateralListPage,
  }))
);
const CollateralDetailPage = lazy(() =>
  import('./features/garantias/pages/CollateralDetailPage').then((module) => ({
    default: module.CollateralDetailPage,
  }))
);
const CollateralFormPage = lazy(() =>
  import('./features/garantias/pages/CollateralFormPage').then((module) => ({
    default: module.CollateralFormPage,
  }))
);
const GuarantorListPage = lazy(() =>
  import('./features/garantias/pages/GuarantorListPage').then((module) => ({
    default: module.GuarantorListPage,
  }))
);
const GuarantorDetailPage = lazy(() =>
  import('./features/garantias/pages/GuarantorDetailPage').then((module) => ({
    default: module.GuarantorDetailPage,
  }))
);
const GuarantorFormPage = lazy(() =>
  import('./features/garantias/pages/GuarantorFormPage').then((module) => ({
    default: module.GuarantorFormPage,
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
              path="/products/:productId"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="products.view">
                    <ProductDetailPage />
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
            <Route
              path="/products/:productId/parameters"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="products.view">
                    <ProductParametersViewPage />
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

            <Route
              path="/branding"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="institution.edit">
                    <TenantBrandingPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />

            {/* Rutas de Solicitudes de Crédito - Staff/Admin */}
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
              path="/loans/incoming"
              element={
                <ProtectedRoute>
                  <IncomingApplicationsPage />
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
            <Route
              path="/loans/:id/dossier"
              element={
                <ProtectedRoute>
                  <LoanDossierPage />
                </ProtectedRoute>
              }
            />

            {/* Rutas legacy / credit-applications - Redirigir o mantener por compatibilidad */}
            <Route
              path="/credit-applications"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="loans.view">
                    <LoanApplicationListPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/credit-applications/new"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="loans.create">
                    <LoanApplicationFormPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/credit-applications/:id"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="loans.view">
                    <LoanApplicationDetailPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/credit-applications/:id/edit"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="loans.edit">
                    <LoanApplicationFormPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />

            {/* Rutas de Solicitudes de Crédito - Cliente (CU-07: Timeline) */}
            <Route
              path="/my-applications"
              element={
                <ProtectedRoute>
                  <MyApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-applications/:id"
              element={
                <ProtectedRoute>
                  <ClientApplicationDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Rutas de Documentos (CU-12) - Staff revisa documentos en WEB */}
            <Route
              path="/admin/documents"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="loans.review_loan_documents">
                    <DocumentManagementPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            {/* Ruta legacy - mantener por compatibilidad */}
            <Route
              path="/staff/documents"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="loans.review_loan_documents">
                    <StaffDocumentsPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />

            {/* Rutas de Garantías */}
            <Route
              path="/garantias"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="collaterals.view">
                    <CollateralListPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/garantias/new"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="collaterals.create">
                    <CollateralFormPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/garantias/guarantors"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="guarantors.view">
                    <GuarantorListPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/garantias/guarantors/new"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="guarantors.create">
                    <GuarantorFormPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/garantias/guarantors/:guarantorId/edit"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="guarantors.edit">
                    <GuarantorFormPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/garantias/guarantors/:guarantorId"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="guarantors.view">
                    <GuarantorDetailPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/garantias/:collateralId/edit"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="collaterals.edit">
                    <CollateralFormPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/garantias/:collateralId"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="collaterals.view">
                    <CollateralDetailPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />

            {/* Rutas de Administración de Reglas (CU-09) - Administradores configuran reglas en WEB */}
            <Route
              path="/admin/credit-rules"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="loans.manage_credit_rules">
                    <RulesManagementPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            {/* Rutas individuales - mantener por compatibilidad y navegación directa */}
            <Route
              path="/admin/rules"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="loans.manage_credit_rules">
                    <RuleSetListPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rules/:id/audit"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="loans.manage_credit_rules">
                    <RuleSetAuditPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/eligibility-rules"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="loans.manage_credit_rules">
                    <EligibilityRuleListPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/product-parameters"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="loans.manage_credit_rules">
                    <ProductParameterListPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            {/* 
              RUTA ELIMINADA: /admin/document-requirements
              Los documentos requeridos ahora se gestionan directamente en cada producto.
              Ver: RESUMEN_ELIMINACION_DOCUMENT_REQUIREMENT.md
            */}

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

            {/* Rutas de Backups */}
            <Route
              path="/saas/tenants/:tenantId/backups"
              element={
                <ProtectedRoute>
                  <TenantBackupsPage />
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

            {/* Rutas de Reportes (CU-39) */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="reports.view_report_catalog">
                    <ReportsPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/builder"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="reports.generate_report">
                    <ReportBuilderPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/builder/:reportType"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="reports.generate_report">
                    <ReportBuilderPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/voice"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="reports.use_voice_reports">
                    <VoiceReportPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/templates"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="reports.manage_templates">
                    <TemplatesPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/history"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="reports.view_report_catalog">
                    <HistoryPage />
                  </PermissionGuard>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/manual"
              element={
                <ProtectedRoute>
                  <PermissionGuard permission="reports.generate_report">
                    <ManualReportsIndependentPage />
                  </PermissionGuard>
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
