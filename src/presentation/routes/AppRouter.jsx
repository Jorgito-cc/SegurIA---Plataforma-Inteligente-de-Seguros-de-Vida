import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import RequireAuth from './guards/RequireAuth';
import RequireRole from './guards/RequireRole';
import RedirectIfAuth from './guards/RedirectIfAuth';
import { getDashboardRouteByRole } from './roleUtils';
import { useAuth } from '../../application/context/AuthContext';

import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/public/LoginPage';
import RegisterClientPage from '../pages/public/RegisterClientPage';
import PasswordResetRequestPage from '../pages/public/PasswordResetRequestPage';
import PasswordResetConfirmPage from '../pages/public/PasswordResetConfirmPage';

import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminBitacoraPage from '../pages/admin/AdminBitacoraPage';
import AdminAgentesPage from '../pages/admin/AdminAgentesPage';
import AdminClientesPage from '../pages/admin/AdminClientesPage';
import AdminUsuariosPage from '../pages/admin/AdminUsuariosPage';
import AdminPlanesPage from '../pages/admin/AdminPlanesPage';
import AdminRolesPage from '../pages/admin/AdminRolesPage';
import AdminPermisosPage from '../pages/admin/AdminPermisosPage';
import AdminProfilePage from '../pages/admin/AdminProfilePage';

import AgenteDashboardPage from '../pages/agente/AgenteDashboardPage';
import AgenteClientesPage from '../pages/agente/AgenteClientesPage';

import ClienteDashboardPage from '../pages/client/ClienteDashboardPage';
import ClientePerfilPage from '../pages/client/ClientePerfilPage';

function PanelIndexRedirect() {
  const { user } = useAuth();
  return <Navigate to={getDashboardRouteByRole(user?.rol)} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Publicas */}
        <Route element={<MainLayout />}>
          <Route path='/' element={<HomePage />} />
          <Route
            path='/login'
            element={
              <RedirectIfAuth>
                <LoginPage />
              </RedirectIfAuth>
            }
          />
          <Route path='/registro' element={<RegisterClientPage />} />
          <Route path='/recuperar-password' element={<PasswordResetRequestPage />} />
          <Route path='/restablecer-password' element={<PasswordResetConfirmPage />} />
        </Route>

        {/* Privadas */}
        <Route element={<RequireAuth />}>
          <Route path='/panel' element={<DashboardLayout />}>
            <Route index element={<PanelIndexRedirect />} />
          </Route>

          {/* Admin */}
          <Route
            path='/admin'
            element={
              <RequireRole allow={['Administrador']}>
                <DashboardLayout />
              </RequireRole>
            }
          >
            <Route path='dashboard' element={<AdminDashboardPage />} />
            <Route path='perfil' element={<AdminProfilePage />} />
            <Route path='usuarios' element={<AdminUsuariosPage />} />
            <Route path='bitacora' element={<AdminBitacoraPage />} />
            <Route path='agentes' element={<AdminAgentesPage />} />
            <Route path='clientes' element={<AdminClientesPage />} />
            <Route path='planes' element={<AdminPlanesPage />} />
            <Route path='roles' element={<AdminRolesPage />} />
            <Route path='permisos' element={<AdminPermisosPage />} />
          </Route>

          {/* Agente */}
          <Route
            path='/agente'
            element={
              <RequireRole allow={['Agente']}>
                <DashboardLayout />
              </RequireRole>
            }
          >
            <Route path='dashboard' element={<AgenteDashboardPage />} />
            <Route path='clientes' element={<AgenteClientesPage />} />
          </Route>

          {/* Cliente */}
          <Route
            path='/cliente'
            element={
              <RequireRole allow={['Cliente']}>
                <DashboardLayout />
              </RequireRole>
            }
          >
            <Route path='dashboard' element={<ClienteDashboardPage />} />
            <Route path='perfil' element={<ClientePerfilPage />} />
          </Route>
        </Route>

        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
}