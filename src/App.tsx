import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SaasRegistrationPage } from './features/auth/pages/SaasRegistrationPage';

// erick sprint 0
// Importar roles pages
import { RoleListPage } from './features/roles/pages/RoleListPage';
import { RoleFormPage } from './features/roles/pages/RoleFormPage';
import { RolePermissionsPage } from './features/roles/pages/RolePermissionsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<SaasRegistrationPage />} />
        
        {/* Rutas de Roles */}
        <Route path="/roles" element={<RoleListPage />} />
        <Route path="/roles/create" element={<RoleFormPage />} />
        <Route path="/roles/:id/edit" element={<RoleFormPage />} />
        <Route path="/roles/:id/permissions" element={<RolePermissionsPage />} />
        
        {/* Redirigir la raíz al registro temporalmente por el Sprint 1 */}
        <Route path="/" element={<Navigate to="/roles" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
