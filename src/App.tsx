import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { SharePointAuthProvider } from '@/contexts/SharePointAuthContext';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { Dashboard } from '@/pages/Dashboard';
import { Trabajadores } from '@/pages/Trabajadores';
import { Clientes } from '@/pages/Clientes';
import { Servicios } from '@/pages/Servicios';
import { Contratos } from '@/pages/Contratos';
import { Cursos } from '@/pages/Cursos';
import { Vacaciones } from '@/pages/Vacaciones';
import { Directivas } from '@/pages/Directivas';
import { Usuarios } from '@/pages/Usuarios';
import { Roles } from '@/pages/Roles';
import { SharePointTest } from '@/components/SharePointTest';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <SharePointAuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/test-sharepoint" element={<SharePointTest />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Módulo RR.HH */}
              <Route path="trabajadores" element={
                <ProtectedRoute module="rrhh" level="lectura">
                  <Trabajadores />
                </ProtectedRoute>
              } />
              <Route path="vacaciones" element={
                <ProtectedRoute module="rrhh" level="lectura">
                  <Vacaciones />
                </ProtectedRoute>
              } />
              
              {/* Módulo Administradores */}
              <Route path="clientes" element={
                <ProtectedRoute module="administradores" level="lectura">
                  <Clientes />
                </ProtectedRoute>
              } />
              
              {/* Módulo OSP */}
              <Route path="servicios" element={
                <ProtectedRoute module="osp" level="lectura">
                  <Servicios />
                </ProtectedRoute>
              } />
              <Route path="contratos" element={
                <ProtectedRoute module="osp" level="lectura">
                  <Contratos />
                </ProtectedRoute>
              } />
              <Route path="cursos" element={
                <ProtectedRoute module="osp" level="lectura">
                  <Cursos />
                </ProtectedRoute>
              } />
              <Route path="directivas" element={
                <ProtectedRoute module="osp" level="lectura">
                  <Directivas />
                </ProtectedRoute>
              } />
              
              {/* Administración de Usuarios */}
              <Route path="usuarios" element={
                <ProtectedRoute module="usuarios" level="administracion">
                  <Usuarios />
                </ProtectedRoute>
              } />
              <Route path="roles" element={
                <ProtectedRoute module="usuarios" level="administracion">
                  <Roles />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
          <Toaster />
        </div>
      </Router>
    </SharePointAuthProvider>
  );
}

export default App;