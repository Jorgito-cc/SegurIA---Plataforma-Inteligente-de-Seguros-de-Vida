# Desarrollo Frontend SegurIA (React JSX + Tailwind + Clean Architecture)

Este documento esta pensado para que lo codifiques por partes, conectado a tu backend Django actual.

## 1. Resumen breve de arquitectura (clean)

Tu frontend quedara asi:

```text
src/
  domain/
    models/

  application/
    context/
      AuthContext.jsx
    hooks/
      useAuthActions.js
      useCrud.js
    use_cases/
      auth/
        loginUser.js
        registerClient.js
        requestPasswordReset.js
        confirmPasswordReset.js

  infrastructure/
    api/
      apiClient.js
      endpoints.js
    repositories/
      authRepository.js
      adminRepository.js
      agentRepository.js
      clientRepository.js
      roleRepository.js
      bitacoraRepository.js
      tipoSeguroRepository.js

  presentation/
    components/
      common/
        LoadingScreen.jsx
        ProtectedMessage.jsx
      sidebar/
        Sidebar.jsx
        sidebarData.js
      notifications/
        notify.js
    layouts/
      MainLayout.jsx
      DashboardLayout.jsx
    pages/
      public/
        HomePage.jsx
        LoginPage.jsx
        RegisterClientPage.jsx
        PasswordResetRequestPage.jsx
        PasswordResetConfirmPage.jsx
      admin/
        AdminDashboardPage.jsx
        AdminBitacoraPage.jsx
        AdminAgentesPage.jsx
        AdminClientesPage.jsx
        AdminPlanesPage.jsx
        AdminRolesPage.jsx
      agente/
        AgenteDashboardPage.jsx
        AgenteClientesPage.jsx
      cliente/
        ClienteDashboardPage.jsx
        ClientePerfilPage.jsx
    routes/
      AppRouter.jsx
      guards/
        RequireAuth.jsx
        RequireRole.jsx
        RedirectIfAuth.jsx

  App.jsx
  main.jsx
  index.css
```

Regla simple:
- domain: modelos puros.
- application: estado y casos de uso.
- infrastructure: axios + llamadas HTTP.
- presentation: layouts, router, paginas, sidebar, estilos.

---

## 2. Dependencias recomendadas

Ya tienes React, Axios y Tailwind. Agrega esto:

```bash
npm uninstall react-router
npm install react-router-dom react-toastify
```

Opcional util:

```bash
npm install clsx
```

---

## 3. .env para consumir Django

Archivo .env en client:

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_APP_NAME=SegurIA
```

Nota: en backend tus rutas estan bajo /api/, por eso el base URL recomendado termina en /api.

---

## 4. Endpoints reales de tu backend

Con tu codigo actual, este es el mapa principal:

- Auth:
  - POST /login/
  - POST /registro/
  - POST /logout/
  - POST /password-reset-request/
  - POST /password-reset-confirm/
  - POST /token/refresh/ (fuera de /api/ en tu core, queda /api/token/refresh/)

- Roles y permisos:
  - GET/POST /roles/
  - GET /permisos/

- Admin:
  - GET/POST /administrador/

- Agentes:
  - GET/POST /agentes/

- Clientes:
  - POST /registrar/ (autoregistro cliente)
  - CRUD /clientes/

- Bitacora:
  - GET /bitacoras/

- Tipos de seguro / planes base:
  - CRUD /tipo-seguros/

Importante:
- En varias vistas usas DjangoModelPermissions, asi que necesitas JWT y permisos de modelo para operar.

## 4.1 Mapa completo backend -> frontend (todo el proyecto)

Esta seccion te dice exactamente como consumir TODO tu backend con Clean Architecture.

### A) App usuarios (auth, roles, permisos)

- Endpoints backend:
  - /login/
  - /registro/
  - /logout/
  - /password-reset-request/
  - /password-reset-confirm/
  - /roles/
  - /permisos/
- Domain models sugeridos:
  - User.js
  - Role.js
  - Permission.js
- Repositories:
  - authRepository.js
  - roleRepository.js
- Use cases:
  - auth/loginUser.js
  - auth/registerClient.js
  - auth/requestPasswordReset.js
  - auth/confirmPasswordReset.js
  - auth/logoutUser.js
  - role/getRoles.js
  - role/createRole.js
  - role/getPermissions.js
- Presentation:
  - public/LoginPage.jsx
  - public/RegisterClientPage.jsx
  - public/PasswordResetRequestPage.jsx
  - public/PasswordResetConfirmPage.jsx
  - admin/AdminRolesPage.jsx

### B) App administrador

- Endpoint backend:
  - /administrador/
- Domain model sugerido:
  - Admin.js (o User.js con rol Administrador)
- Repository:
  - adminRepository.js
- Use cases:
  - admin/getAdmins.js
  - admin/createAdmin.js
  - admin/updateAdmin.js
  - admin/deleteAdmin.js
- Presentation:
  - admin/AdminDashboardPage.jsx
  - admin/AdminUsuariosPage.jsx

### C) App agentes

- Endpoint backend:
  - /agentes/
- Domain model sugerido:
  - Agent.js
- Repository:
  - agentRepository.js
- Use cases:
  - agent/getAgents.js
  - agent/createAgent.js
  - agent/updateAgent.js
  - agent/deleteAgent.js
- Presentation:
  - admin/AdminAgentesPage.jsx
  - agente/AgenteDashboardPage.jsx

### D) App clientes

- Endpoints backend:
  - /registrar/ (autoregistro cliente)
  - /clientes/
- Domain model sugerido:
  - Client.js
- Repository:
  - clientRepository.js
- Use cases:
  - client/getClients.js
  - client/getClientById.js
  - client/createClient.js
  - client/updateClient.js
  - client/deleteClient.js
- Presentation:
  - admin/AdminClientesPage.jsx
  - agente/AgenteClientesPage.jsx
  - cliente/ClienteDashboardPage.jsx
  - cliente/ClientePerfilPage.jsx

### E) App bitacoras

- Endpoint backend:
  - /bitacoras/ (solo lectura)
- Domain model sugerido:
  - BitacoraRecord.js
- Repository:
  - bitacoraRepository.js
- Use cases:
  - bitacora/getBitacoraRecords.js
- Presentation:
  - admin/AdminBitacoraPage.jsx
  - agente/AgenteBitacoraPage.jsx

### F) App tipo_de_seguro

- Endpoint backend:
  - /tipo-seguros/
- Domain model sugerido:
  - InsuranceType.js
- Repository:
  - tipoSeguroRepository.js
- Use cases:
  - tipoSeguro/getInsuranceTypes.js
  - tipoSeguro/createInsuranceType.js
  - tipoSeguro/updateInsuranceType.js
  - tipoSeguro/deleteInsuranceType.js
- Presentation:
  - admin/AdminPlanesPage.jsx
  - cliente/ClienteCotizacionPage.jsx

### G) App planes_de_seguro (estado actual)

- En tu backend existe la app planes_de_seguro, pero no esta expuesta en core/urls.py ahora mismo.
- Recomendacion:
  - Si vas a consumir planes reales desde frontend, crea urls.py + views.py en esa app y agrega include en core/urls.py.
  - Si no, usa /tipo-seguros/ como catalogo temporal.

### H) Flujo Clean por cada modulo

Para cualquier modulo (agentes, clientes, bitacora, etc.) usa siempre este flujo:

1. presentation/page llama hook o use_case.
2. application/use_case llama repository.
3. infrastructure/repository llama apiClient (axios).
4. respuesta HTTP se transforma a model domain.
5. presentation renderiza datos ya limpios.

### I) Contrato de modelos domain para todo el backend

Puedes estandarizar asi para que tu UI no dependa del JSON crudo:

```jsx
// src/domain/models/User.js
export class User {
  constructor(raw = {}) {
    this.id = raw.id ?? null;
    this.email = raw.email ?? '';
    this.username = raw.username ?? '';
    this.firstName = raw.first_name ?? '';
    this.lastName = raw.last_name ?? '';
    this.fullName = `${this.firstName} ${this.lastName}`.trim();
    this.role = raw.rol ?? 'Sin rol';
    this.ci = raw.ci ?? '';
    this.telefono = raw.telefono ?? '';
  }
}

// src/domain/models/Agent.js
import { User } from './User';

export class Agent extends User {
  constructor(raw = {}) {
    super(raw);
    this.codigoLicencia = raw.codigo_licencia ?? '';
    this.nivel = raw.nivel ?? '';
    this.sucursal = raw.sucursal ?? '';
    this.comisionBasePorcentaje = raw.comision_base_porcentaje ?? null;
  }
}

// src/domain/models/Client.js
import { User } from './User';

export class Client extends User {
  constructor(raw = {}) {
    super(raw);
    this.direccion = raw.direccion ?? '';
    this.fechaNacimiento = raw.fecha_nacimiento ?? null;
    this.profesionOficio = raw.profesion_oficio ?? '';
    this.esFumador = Boolean(raw.es_fumador);
    this.ingresosMensuales = raw.ingresos_mensuales ?? null;
  }
}

// src/domain/models/InsuranceType.js
export class InsuranceType {
  constructor(raw = {}) {
    this.id = raw.id ?? null;
    this.nombre = raw.nombre ?? '';
    this.descripcion = raw.descripcion ?? '';
    this.estado = raw.estado ?? '';
    this.codigoInterno = raw.codigo_interno ?? '';
  }
}

// src/domain/models/BitacoraRecord.js
export class BitacoraRecord {
  constructor(raw = {}) {
    this.id = raw.id ?? null;
    this.usuario = raw.usuario ?? null;
    this.accion = raw.accion ?? '';
    this.detalle = raw.detalle ?? '';
    this.fecha = raw.fecha ?? null;
    this.ip = raw.ip ?? '';
  }
}
```

### J) Reglas para que escale sin romperse

- No usar axios directo en pages.
- Toda llamada HTTP pasa por repositories.
- Toda transformacion de snake_case -> camelCase va en model o use_case.
- Sidebar y rutas se controlan por user.rol.
- Notificaciones globales con notify.js (exito/error/info) en login, registro y CRUD.
- Si una ruta requiere permiso de backend (DjangoModelPermissions), manejar 403 con notify.error('No tienes permiso').

---

## 5. Base de infraestructura

### 5.1 infrastructure/api/endpoints.js

```jsx
export const ENDPOINTS = {
  auth: {
    login: '/login/',
    register: '/registro/',
    registerClient: '/registrar/',
    logout: '/logout/',
    passwordResetRequest: '/password-reset-request/',
    passwordResetConfirm: '/password-reset-confirm/',
    refresh: '/token/refresh/',
    profile: '/perfil/',
  },
  admin: '/administrador/',
  agentes: '/agentes/',
  clientes: '/clientes/',
  bitacoras: '/bitacoras/',
  roles: '/roles/',
  permisos: '/permisos/',
  tipoSeguros: '/tipo-seguros/',
};
```

### 5.2 infrastructure/api/apiClient.js

```jsx
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
    }

    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.error ||
      'Error de red o servidor';

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
```

### 5.3 infrastructure/repositories/authRepository.js

```jsx
import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

export const authRepository = {
  async login(payload) {
    const { data } = await apiClient.post(ENDPOINTS.auth.login, payload);
    return data;
  },

  async registerClient(payload) {
    const { data } = await apiClient.post(ENDPOINTS.auth.registerClient, payload);
    return data;
  },

  async registerGeneric(payload) {
    const { data } = await apiClient.post(ENDPOINTS.auth.register, payload);
    return data;
  },

  async logout(refresh) {
    const { data } = await apiClient.post(ENDPOINTS.auth.logout, { refresh });
    return data;
  },

  async requestPasswordReset(email) {
    const { data } = await apiClient.post(ENDPOINTS.auth.passwordResetRequest, { email });
    return data;
  },

  async confirmPasswordReset(payload) {
    const { data } = await apiClient.post(ENDPOINTS.auth.passwordResetConfirm, payload);
    return data;
  },
};
```

---

## 6. Auth context + roles

### 6.1 application/context/AuthContext.jsx

```jsx
import { createContext, useContext, useMemo, useState } from 'react';
import { authRepository } from '../../infrastructure/repositories/authRepository';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  });

  const isAuthenticated = !!localStorage.getItem('access_token');

  const login = async (payload) => {
    const data = await authRepository.login(payload);

    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('auth_user', JSON.stringify(data.usuario));

    setUser(data.usuario);
    return data;
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) await authRepository.logout(refresh);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_user');
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({ user, isAuthenticated, login, logout, setUser }),
    [user, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
```

---

## 7. React Toastify global (notificaciones en todo)

### 7.1 presentation/components/notifications/notify.js

```jsx
import { toast } from 'react-toastify';

export const notify = {
  success: (msg) => toast.success(msg, { position: 'top-right' }),
  error: (msg) => toast.error(msg, { position: 'top-right' }),
  info: (msg) => toast.info(msg, { position: 'top-right' }),
  warn: (msg) => toast.warn(msg, { position: 'top-right' }),
};
```

### 7.2 main.jsx

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import App from './App';
import { AuthProvider } from './application/context/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <ToastContainer autoClose={2500} newestOnTop closeOnClick pauseOnHover theme='colored' />
    </AuthProvider>
  </StrictMode>
);
```

Uso recomendado:
- Login exitoso: notify.success('Bienvenido/a')
- Login fallido: notify.error(error.message)
- Registro exitoso: notify.success('Registro completado')
- Reset solicitado: notify.info('Revisa tu correo')

---

## 8. Guards (publico y privado)

### 8.1 presentation/routes/guards/RequireAuth.jsx

```jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';

export default function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  return <Outlet />;
}
```

### 8.2 presentation/routes/guards/RequireRole.jsx

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';

export default function RequireRole({ allow = [], children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to='/login' replace />;

  const role = (user?.rol || '').toLowerCase();
  const allowed = allow.map((x) => String(x).toLowerCase());

  if (!allowed.includes(role)) {
    return <Navigate to='/panel' replace />;
  }

  return children;
}
```

### 8.3 presentation/routes/guards/RedirectIfAuth.jsx

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';

export default function RedirectIfAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to='/panel' replace />;
  return children;
}
```

---

## 9. Sidebar en JSX (adaptado a tu ejemplo)

### 9.1 presentation/components/sidebar/sidebarData.js

```jsx
import {
  FaUsers,
  FaShieldAlt,
  FaFileAlt,
  FaUserShield,
  FaUserFriends,
  FaClipboardList,
  FaChartBar,
  FaLifeRing,
} from 'react-icons/fa';

export const BRAND = 'SegurIA Panel';

export const sidebarByRole = {
  Administrador: [
    {
      key: 'gestion',
      icon: <FaUserShield />,
      title: 'Gestion',
      items: [
        { label: 'Dashboard', to: '/admin/dashboard' },
        { label: 'Agentes', to: '/admin/agentes' },
        { label: 'Clientes', to: '/admin/clientes' },
        { label: 'Planes / Tipos', to: '/admin/planes' },
      ],
    },
    {
      key: 'seguridad',
      icon: <FaShieldAlt />,
      title: 'Seguridad',
      items: [
        { label: 'Roles', to: '/admin/roles' },
        { label: 'Permisos', to: '/admin/permisos' },
        { label: 'Bitacora', to: '/admin/bitacora' },
      ],
    },
  ],

  Agente: [
    {
      key: 'agente',
      icon: <FaUserFriends />,
      title: 'Clientes',
      items: [
        { label: 'Dashboard', to: '/agente/dashboard' },
        { label: 'Gestion de clientes', to: '/agente/clientes' },
      ],
    },
    {
      key: 'reportes',
      icon: <FaChartBar />,
      title: 'Seguimiento',
      items: [{ label: 'Bitacora', to: '/agente/bitacora' }],
    },
  ],

  Cliente: [
    {
      key: 'cliente',
      icon: <FaUsers />,
      title: 'Mi cuenta',
      items: [
        { label: 'Panel', to: '/cliente/dashboard' },
        { label: 'Mi perfil', to: '/cliente/perfil' },
        { label: 'Mis solicitudes', to: '/cliente/solicitudes' },
      ],
    },
    {
      key: 'ayuda',
      icon: <FaLifeRing />,
      title: 'Ayuda',
      items: [{ label: 'Soporte', to: '/cliente/soporte' }],
    },
  ],
};

export const soporteLink = { label: 'Soporte tecnico', to: '/soporte' };
```

### 9.2 presentation/components/sidebar/Sidebar.jsx

```jsx
import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaChevronDown, FaSignOutAlt } from 'react-icons/fa';
import { BRAND, sidebarByRole, soporteLink } from './sidebarData';
import { useAuth } from '../../../application/context/AuthContext';
import { notify } from '../notifications/notify';

const cn = (...c) => c.filter(Boolean).join(' ');

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [openKey, setOpenKey] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const sections = sidebarByRole[user?.rol] || [];

  useEffect(() => {
    const found = sections.find((s) =>
      s.items.some((i) => location.pathname.startsWith(i.to))
    );
    if (found) setOpenKey(found.key);
  }, [location.pathname, sections]);

  const handleLogout = async () => {
    await logout();
    notify.info('Sesion cerrada');
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'min-h-screen shrink-0 transition-all duration-300',
        isOpen ? 'w-72' : 'w-20',
        'relative bg-gradient-to-b from-blue-50 via-white to-cyan-50',
        'border-r border-blue-100 shadow-lg'
      )}
    >
      <button
        onClick={() => setIsOpen((v) => !v)}
        className='absolute -right-3 top-5 z-10 h-8 w-8 rounded-full bg-white border border-blue-100 shadow flex items-center justify-center'
        aria-label='toggle sidebar'
      >
        {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </button>

      <div className='flex items-center justify-between px-4 pt-5 pb-4'>
        <h1 className='font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-cyan-600'>
          {isOpen ? BRAND : 'SI'}
        </h1>
      </div>

      <div className='px-2 pb-4 overflow-y-auto'>
        {sections.map((sec) => {
          const expanded = openKey === sec.key;
          return (
            <div key={sec.key} className='mb-2'>
              <button
                onClick={() => setOpenKey(expanded ? null : sec.key)}
                className='w-full flex items-center justify-between rounded-xl px-3 py-2 bg-white border border-blue-100 hover:bg-blue-50 transition'
              >
                <span className='flex items-center gap-2 text-sm font-medium'>
                  <span className='text-lg'>{sec.icon}</span>
                  {isOpen && sec.title}
                </span>
                {isOpen && <FaChevronDown className={cn('transition-transform', expanded && 'rotate-180')} />}
              </button>

              <div className={cn('grid transition-[grid-template-rows] duration-300', expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                <div className='overflow-hidden'>
                  <ul className={cn('mt-2 pl-2 space-y-1', !isOpen && 'pl-0')}>
                    {sec.items.map((it) => (
                      <li key={it.to}>
                        <NavLink
                          to={it.to}
                          className={({ isActive }) =>
                            cn(
                              'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm border border-transparent transition',
                              'hover:bg-blue-50',
                              isActive && 'bg-blue-100/70 border-blue-200 text-blue-800 font-semibold'
                            )
                          }
                        >
                          <span className='w-1.5 h-1.5 rounded-full bg-blue-300' />
                          <span className={cn(!isOpen && 'sr-only')}>{it.label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}

        <NavLink
          to={soporteLink.to}
          className='mt-4 flex items-center gap-2 rounded-xl px-3 py-2 bg-white border border-blue-100 hover:bg-blue-50 transition'
        >
          <FaFileAlt className='text-lg' />
          <span className={cn(!isOpen && 'sr-only')}>{soporteLink.label}</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className='mt-3 w-full rounded-xl px-3 py-2 text-left bg-white border border-blue-100 hover:bg-red-50 transition text-sm font-medium text-red-600'
        >
          {isOpen ? 'Cerrar sesion' : <FaSignOutAlt />}
        </button>
      </div>
    </aside>
  );
}
```

---

## 10. Layouts

### 10.1 presentation/layouts/MainLayout.jsx

```jsx
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className='min-h-screen flex flex-col bg-slate-50 text-slate-900'>
      <header className='sticky top-0 z-20 border-b bg-white/90 backdrop-blur'>
        <div className='mx-auto max-w-7xl px-4 py-4 font-bold text-blue-800'>SegurIA</div>
      </header>

      <main className='flex-1'>
        <Outlet />
      </main>

      <footer className='border-t bg-white'>
        <div className='mx-auto max-w-7xl px-4 py-5 text-sm text-slate-500'>2026 SegurIA</div>
      </footer>
    </div>
  );
}
```

### 10.2 presentation/layouts/DashboardLayout.jsx

```jsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/sidebar/Sidebar';

export default function DashboardLayout() {
  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-cyan-50'>
      <div className='flex min-h-screen'>
        <Sidebar />

        <main className='flex-1 p-3 sm:p-4 md:p-6'>
          <div className='h-full min-h-[calc(100vh-1.5rem)] rounded-2xl bg-white/80 border border-blue-100 shadow-xl p-4 sm:p-5 md:p-6'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

## 11. Router publico + privado + por rol

### 11.1 presentation/routes/AppRouter.jsx

```jsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import RequireAuth from './guards/RequireAuth';
import RequireRole from './guards/RequireRole';
import RedirectIfAuth from './guards/RedirectIfAuth';

import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/public/LoginPage';
import RegisterClientPage from '../pages/public/RegisterClientPage';
import PasswordResetRequestPage from '../pages/public/PasswordResetRequestPage';
import PasswordResetConfirmPage from '../pages/public/PasswordResetConfirmPage';

import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminBitacoraPage from '../pages/admin/AdminBitacoraPage';
import AdminAgentesPage from '../pages/admin/AdminAgentesPage';
import AdminClientesPage from '../pages/admin/AdminClientesPage';
import AdminPlanesPage from '../pages/admin/AdminPlanesPage';
import AdminRolesPage from '../pages/admin/AdminRolesPage';

import AgenteDashboardPage from '../pages/agente/AgenteDashboardPage';
import AgenteClientesPage from '../pages/agente/AgenteClientesPage';

import ClienteDashboardPage from '../pages/cliente/ClienteDashboardPage';
import ClientePerfilPage from '../pages/cliente/ClientePerfilPage';

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
            <Route index element={<Navigate to='/cliente/dashboard' replace />} />
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
            <Route path='bitacora' element={<AdminBitacoraPage />} />
            <Route path='agentes' element={<AdminAgentesPage />} />
            <Route path='clientes' element={<AdminClientesPage />} />
            <Route path='planes' element={<AdminPlanesPage />} />
            <Route path='roles' element={<AdminRolesPage />} />
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
```

### 11.2 App.jsx

```jsx
import AppRouter from './presentation/routes/AppRouter';

function App() {
  return <AppRouter />;
}

export default App;
```

---

## 12. Home (imagen) en JSX responsive

### 12.1 presentation/pages/public/HomePage.jsx

```jsx
import { FiShield, FiCpu, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

export default function HomePage() {
  const plans = [
    { id: 1, name: 'Basico', price: '$25/mo', items: ['Cobertura inicial', 'Atencion digital', 'Soporte base'] },
    { id: 2, name: 'Plus', price: '$150/mo', items: ['Cobertura media', 'Analitica IA', 'Atencion prioritaria'] },
    { id: 3, name: 'Premium', price: '$350/mo', items: ['Cobertura integral', 'Monitoreo activo', 'Asesor premium'] },
  ];

  return (
    <main className='min-h-screen bg-[radial-gradient(circle_at_top,#eff6ff_0%,#f8fafc_45%,#ffffff_100%)] text-slate-800'>
      <section className='mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20'>
        <div>
          <h1 className='text-4xl sm:text-5xl font-black leading-tight text-blue-900'>
            Tu futuro, protegido con inteligencia artificial
          </h1>
          <p className='mt-4 text-slate-600 max-w-xl'>
            Cotiza, gestiona y sigue tu seguro de vida de forma inteligente y personalizada.
          </p>
          <button className='mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition'>
            Cotiza tu seguro
            <FiArrowRight />
          </button>
        </div>

        <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-xl'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='rounded-2xl bg-blue-50 p-4'>
              <FiCpu className='mb-2 h-6 w-6 text-blue-700' />
              <p className='font-bold text-blue-900'>IA personalizada</p>
              <p className='text-xs text-slate-600'>Recomendaciones segun perfil</p>
            </div>
            <div className='rounded-2xl bg-cyan-50 p-4'>
              <FiShield className='mb-2 h-6 w-6 text-cyan-700' />
              <p className='font-bold text-cyan-900'>Cobertura integral</p>
              <p className='text-xs text-slate-600'>Proteccion completa y escalable</p>
            </div>
            <div className='rounded-2xl bg-emerald-50 p-4 sm:col-span-2'>
              <FiCheckCircle className='mb-2 h-6 w-6 text-emerald-700' />
              <p className='font-bold text-emerald-900'>Gestion simple</p>
              <p className='text-xs text-slate-600'>Panel claro para cliente, agente y admin</p>
            </div>
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8'>
        <h2 className='text-2xl sm:text-3xl font-black text-slate-900'>Nuestros planes destacados</h2>
        <div className='mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
          {plans.map((plan) => (
            <article key={plan.id} className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition'>
              <h3 className='text-lg font-extrabold'>{plan.name}</h3>
              <p className='mt-1 text-3xl font-black text-blue-800'>{plan.price}</p>
              <ul className='mt-4 space-y-2 text-sm text-slate-600'>
                {plan.items.map((it) => (
                  <li key={it} className='flex gap-2'>
                    <span className='mt-2 h-2 w-2 rounded-full bg-emerald-500' />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
              <button className='mt-6 w-full rounded-xl bg-blue-700 py-2.5 text-sm font-bold text-white hover:bg-blue-800 transition'>
                Ver mas
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
```

---

## 13. Login / registro / reset con notificaciones

### 13.1 LoginPage.jsx (ejemplo)

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import { notify } from '../../components/notifications/notify';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await login(form);
      notify.success('Inicio de sesion correcto');

      const rol = data?.usuario?.rol;
      if (rol === 'Administrador') navigate('/admin/dashboard');
      else if (rol === 'Agente') navigate('/agente/dashboard');
      else navigate('/cliente/dashboard');
    } catch (error) {
      notify.error(error.message || 'No se pudo iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='mx-auto max-w-md px-4 py-12'>
      <h1 className='text-2xl font-black text-blue-900'>Iniciar sesion</h1>
      <form onSubmit={onSubmit} className='mt-6 space-y-4 rounded-2xl border bg-white p-6 shadow-sm'>
        <input name='email' type='email' placeholder='Correo' className='w-full rounded-xl border px-3 py-2' onChange={onChange} />
        <input name='password' type='password' placeholder='Contrasena' className='w-full rounded-xl border px-3 py-2' onChange={onChange} />
        <button disabled={loading} className='w-full rounded-xl bg-blue-700 py-2.5 font-bold text-white hover:bg-blue-800 transition'>
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>
    </section>
  );
}
```

La misma idea para registro y reset:
- Antes de llamada: estado loading.
- Exito: notify.success o notify.info.
- Error: notify.error.

---

## 14. Ejemplo pagina admin consumiendo backend

### 14.1 AdminAgentesPage.jsx

```jsx
import { useEffect, useState } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { notify } from '../../components/notifications/notify';

export default function AdminAgentesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(ENDPOINTS.agentes);
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      notify.error(e.message || 'No se pudo cargar agentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p>Cargando agentes...</p>;

  return (
    <div>
      <h1 className='text-2xl font-black text-slate-900'>Gestion de agentes</h1>
      <div className='mt-4 overflow-x-auto rounded-xl border'>
        <table className='min-w-full text-sm'>
          <thead className='bg-slate-50'>
            <tr>
              <th className='px-3 py-2 text-left'>Nombre</th>
              <th className='px-3 py-2 text-left'>Email</th>
              <th className='px-3 py-2 text-left'>Licencia</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className='border-t'>
                <td className='px-3 py-2'>{a.nombre_completo || a.username}</td>
                <td className='px-3 py-2'>{a.email}</td>
                <td className='px-3 py-2'>{a.codigo_licencia || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 15. Como interpretar el estilo Tailwind (rapido)

- Mobile first:
  - clases base = movil
  - sm:, md:, lg: = escalado para pantallas grandes

- Layout responsive:
  - grid-cols-1 lg:grid-cols-2 para pasar de 1 columna a 2 en escritorio
  - p-3 sm:p-4 md:p-6 para aumentar padding por breakpoint

- Sidebar usable:
  - w-72 / w-20 para expandido/colapsado
  - overflow-y-auto para no romper en pantallas bajas

- UI clara:
  - border + rounded-2xl + shadow = tarjetas limpias
  - hover:bg-... y hover:shadow... para feedback

---

## 16. Flujo recomendado de implementacion

1. Montar apiClient + endpoints + repositories.
2. Montar AuthContext + guards.
3. Montar MainLayout y DashboardLayout.
4. Montar Sidebar en JSX por rol.
5. Montar AppRouter publico/privado.
6. Conectar login, registro cliente, recuperar password con toast.
7. Crear paginas admin y consumir CRUD reales (agentes, clientes, roles, bitacora, tipo-seguros).
8. Crear paginas agente y cliente.
9. Ajustar responsive final en desktop + tablet + mobile.

---

## 17. Nota importante para tu backend actual

Tu endpoint /asignar-rol/ en usuarios esta pendiente (aun no asigna de verdad). Mientras tanto:
- el rol se asigna al crear usuario en serializers de cada app (Administrador, Agente, Cliente).
- para flujo completo de gestion de roles desde frontend, luego conviene implementar ese endpoint.

---

## 18. Que hace cada pieza clave (super breve)

- AuthContext: guarda sesion, expone login/logout/user.
- apiClient: agrega Bearer token y maneja errores comunes.
- RequireAuth: bloquea rutas si no hay token.
- RequireRole: bloquea rutas si el rol no coincide.
- Sidebar: menu dinamico segun rol y navegacion.
- DashboardLayout: estructura comun para paneles privados.
- notify.js + ToastContainer: feedback visual de exito/error en toda la app.

Con este documento puedes codificar por modulos sin perder orden de arquitectura.
