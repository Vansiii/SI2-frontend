import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SaasRegistrationPage } from './features/auth/pages/SaasRegistrationPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<SaasRegistrationPage />} />
        
        {/* Redirigir la raíz al registro temporalmente por el Sprint 1 */}
        <Route path="/" element={<Navigate to="/register" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
