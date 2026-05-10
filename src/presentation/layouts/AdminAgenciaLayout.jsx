import { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../application/context/AuthContext";
import { notify } from "../components/notifications/notify";
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiHome,
  FiSettings,
  FiBarChart2,
  FiUsers,
  FiLock,
  FiChevronDown,
} from "react-icons/fi";

export default function AdminAgenciaLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (key) => {
    setExpandedMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    try {
      logout();
      navigate("/login");
      notify.success("Sesión cerrada");
    } catch (error) {
      notify.error("Error al cerrar sesión");
    }
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: FiHome,
      path: "/admin-agencia/dashboard",
    },
    {
      id: "gestion",
      label: "Gestión",
      icon: FiSettings,
      submenu: [
        { label: "Planes/Tipos", path: "/admin-agencia/planes", icon: FiSettings },
        { label: "Agentes", path: "/admin-agencia/agentes", icon: FiUsers },
      ],
    },
    {
      id: "seguridad",
      label: "Seguridad",
      icon: FiLock,
      submenu: [
        { label: "Bitácora", path: "/admin-agencia/bitacora", icon: FiLock },
      ],
    },
    {
      id: "reportes",
      label: "Reportes",
      icon: FiBarChart2,
      submenu: [
        { label: "Reportes", path: "/admin-agencia/reportes", icon: FiBarChart2 },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 overflow-hidden flex flex-col shadow-xl`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold">SegurIA</h1>
              <p className="text-xs text-slate-400">Admin Agencia</p>
              {user?.tenant_nombre && (
                <p className="text-xs text-slate-300 mt-1 truncate font-semibold">
                  {user.tenant_nombre}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenus[item.id];

            return (
              <div key={item.id}>
                {hasSubmenu ? (
                  // Grupo con submenu
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className="w-full flex items-center justify-between px-4 py-2 text-slate-300 hover:bg-slate-700 rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                    </div>
                    {sidebarOpen && (
                      <FiChevronDown
                        size={16}
                        className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>
                ) : (
                  // Item individual
                  <button
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition"
                  >
                    <Icon size={20} />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                )}

                {/* Submenu Items */}
                {hasSubmenu && isExpanded && sidebarOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-slate-600">
                    {item.submenu.map((subitem) => {
                      const SubIcon = subitem.icon;
                      return (
                        <button
                          key={subitem.path}
                          onClick={() => navigate(subitem.path)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition text-sm"
                        >
                          <SubIcon size={16} />
                          {subitem.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-slate-700 space-y-3">
            <div className="text-xs">
              <p className="text-slate-400">Conectado</p>
              <p className="font-semibold truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium"
            >
              <FiLogOut size={16} /> Cerrar Sesión
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.tenant_nombre}
              </h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="text-right text-sm text-gray-600 hidden md:block">
            <p className="font-semibold">{new Date().toLocaleDateString("es-ES")}</p>
            <p className="text-xs">AdminAgencia</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
      ],
    },
    {
      id: "seguridad",
      label: "Seguridad",
      icon: FiLock,
      submenu: [
        { label: "Bitácora", path: "/admin-agencia/bitacora", icon: FiLock },
      ],
    },
    {
      id: "reportes",
      label: "Reportes",
      icon: FiBarChart2,
      submenu: [
        { label: "Reportes", path: "/admin-agencia/reportes", icon: FiBarChart2 },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      logout();
      navigate("/login");
      notify.success("Sesión cerrada");
    } catch (error) {
      notify.error("Error al cerrar sesión");
    }
  };

  const isActive = (path) => location.pathname === path;
  const isSubmenuActive = (submenu) =>
    submenu?.some((item) => location.pathname === item.path);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col shadow-lg`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h2 className="text-xl font-bold">SegurIA</h2>
              <p className="text-xs text-slate-400">Admin Agencia</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Tenant Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-slate-700 bg-slate-700 bg-opacity-50">
            <p className="text-xs text-slate-400">Agencia</p>
            <p className="font-semibold truncate text-sm">
              {user?.tenant_nombre}
            </p>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.section}>
              {item.submenu ? (
                // Grupo con submenu
                <div>
                  {sidebarOpen && (
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
                      {item.label}
                    </p>
                  )}
                  {item.submenu.map((subitem) => {
                    const Icon = subitem.icon;
                    return (
                      <button
                        key={subitem.path}
                        onClick={() => navigate(subitem.path)}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                          isActive(subitem.path)
                            ? "bg-blue-600 text-white"
                            : "text-slate-300 hover:bg-slate-700"
                        }`}
                        title={!sidebarOpen ? subitem.label : ""}
                      >
                        <Icon size={20} className="flex-shrink-0" />
                        {sidebarOpen && (
                          <span className="text-sm">{subitem.label}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Item individual
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                    isActive(item.path)
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                  title={!sidebarOpen ? item.label : ""}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          {sidebarOpen && (
            <div className="text-xs">
              <p className="text-slate-400">Conectado como</p>
              <p className="font-semibold truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition"
            title={!sidebarOpen ? "Salir" : ""}
          >
            <FiLogOut size={20} />
            {sidebarOpen && <span className="text-sm">Salir</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard - Agencia {user?.tenant_nombre}
            </h1>
            <p className="text-sm text-gray-600">Bienvenido, {user?.email}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p className="font-semibold">{user?.tenant_nombre}</p>
            <p className="text-xs">{new Date().toLocaleDateString("es-ES")}</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
