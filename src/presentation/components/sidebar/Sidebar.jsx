import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { sidebarByRole, BRAND, soporteLink, ManualLink } from "./sidebarData";
import { useAuth } from "../../../application/context/AuthContext";
import { notify } from "../notifications/notify";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [openKey, setOpenKey] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Determinar rol y obtener secciones
  const userRole = user?.role || user?.rol || "Cliente";
  const sections = sidebarByRole[userRole] || sidebarByRole.Cliente;

  // Abrir sección según ruta
  useEffect(() => {
    const found = sections.find((s) =>
      s.items.some((i) => location.pathname.startsWith(i.to)),
    );
    if (found) setOpenKey(found.key);
  }, [location.pathname, sections]);

  const handleLogout = async () => {
    try {
      logout();
      navigate("/login");
      notify.success("Sesión cerrada");
    } catch (error) {
      notify.error("Error al cerrar sesión");
    }
  };

  return (
    <aside
      className={cn(
        "min-h-screen shrink-0 transition-all duration-300",
        isOpen ? "w-72" : "w-20",
        "relative",
        "bg-gradient-to-b from-indigo-50/60 via-white/50 to-purple-50/50",
        "dark:from-slate-900/70 dark:via-slate-900/60 dark:to-slate-900/70",
        "backdrop-blur-xl border-r",
        "border-indigo-100/70 dark:border-slate-800/70",
        "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)]",
      )}
    >
      {/* Botón plegar */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "absolute -right-3 top-5 z-10 h-8 w-8 rounded-full",
          "bg-white/70 dark:bg-slate-800/80",
          "border border-indigo-100/70 dark:border-slate-700",
          "shadow hover:scale-105 transition flex items-center justify-center",
          "text-indigo-600 dark:text-indigo-400",
        )}
        aria-label="toggle sidebar"
      >
        {isOpen ? <FaChevronLeft size={16} /> : <FaChevronRight size={16} />}
      </button>

      {/* Header brand */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-indigo-100/50 dark:border-slate-800/50">
        <h1 className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 dark:from-indigo-400 dark:to-fuchsia-400 text-2xl">
          {isOpen ? BRAND : "🛡️"}
        </h1>
        {isOpen && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {userRole}
          </p>
        )}
      </div>

      {/* Menú */}
      <div className="flex-1 px-2 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300/40 dark:scrollbar-thumb-slate-700/60">
        {sections.map((sec) => {
          const expanded = openKey === sec.key;
          return (
            <div key={sec.key} className="mb-3">
              <button
                onClick={() => setOpenKey(expanded ? null : sec.key)}
                className={cn(
                  "w-full flex items-center justify-between rounded-xl px-3 py-2.5",
                  "bg-white/70 dark:bg-slate-800/70",
                  "hover:bg-white/90 dark:hover:bg-slate-800",
                  "border border-indigo-100/70 dark:border-slate-700",
                  "transition text-slate-700 dark:text-slate-200",
                  "font-medium",
                )}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg text-indigo-600 dark:text-indigo-400">
                    {sec.icon}
                  </span>
                  {isOpen && <span className="text-sm">{sec.title}</span>}
                </span>
                {isOpen && (
                  <FaChevronDown
                    size={14}
                    className={cn(
                      "transition-transform",
                      expanded && "rotate-180",
                    )}
                  />
                )}
              </button>

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-in-out",
                  expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <ul className={cn("mt-2 pl-2 space-y-1", !isOpen && "pl-0")}>
                    {sec.items.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            cn(
                              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                              "border border-transparent transition",
                              "hover:bg-indigo-50/70 dark:hover:bg-slate-800/60",
                              isActive &&
                                "bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 border-indigo-200 dark:border-slate-700",
                              isActive &&
                                "text-indigo-700 dark:text-indigo-300 font-semibold",
                            )
                          }
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 group-hover:bg-indigo-400 dark:bg-slate-600 dark:group-hover:bg-slate-500" />
                          <span className={cn(!isOpen && "sr-only")}>
                            {item.label}
                          </span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}

        {/* Soporte */}
        <div className="mt-6 border-t border-indigo-100/50 dark:border-slate-800/50 pt-4">
          <NavLink
            to={soporteLink.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5",
                "bg-white/70 dark:bg-slate-800/70",
                "border border-indigo-100/70 dark:border-slate-700",
                "hover:bg-white/90 dark:hover:bg-slate-800",
                "transition text-slate-700 dark:text-slate-200",
                isActive &&
                  "ring-1 ring-inset ring-fuchsia-300/50 dark:ring-fuchsia-700/40",
              )
            }
          >
            <FaCog size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span className={cn(!isOpen && "sr-only", "text-sm font-medium")}>
              {soporteLink.label}
            </span>
          </NavLink>
        </div>

        {/* Manual */}
        <div className="mt-3">
          <NavLink
            to={ManualLink.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5",
                "bg-white/70 dark:bg-slate-800/70",
                "border border-indigo-100/70 dark:border-slate-700",
                "hover:bg-white/90 dark:hover:bg-slate-800",
                "transition text-slate-700 dark:text-slate-200",
                isActive &&
                  "ring-1 ring-inset ring-fuchsia-300/50 dark:ring-fuchsia-700/40",
              )
            }
          >
            <FaCog size={16} className="text-indigo-600 dark:text-indigo-400" />
            <span className={cn(!isOpen && "sr-only", "text-sm font-medium")}>
              {ManualLink.label}
            </span>
          </NavLink>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className={cn(
            "mt-6 w-full rounded-xl px-3 py-2.5 text-left",
            "bg-gradient-to-r from-red-500/10 to-red-600/10",
            "border border-red-200/70 dark:border-red-900/40",
            "hover:from-red-500/20 hover:to-red-600/20",
            "transition text-sm font-medium text-red-600 dark:text-red-400",
            "flex items-center gap-3",
          )}
          title="Cerrar sesión"
        >
          <FaSignOutAlt size={16} />
          {isOpen && "Cerrar sesión"}
        </button>
      </div>

      {/* Info usuario */}
      {isOpen && user && (
        <div className="p-4 border-t border-indigo-100/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-800/40 space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Conectado como
          </p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
            {user.email}
          </p>
          {user.tenant_nombre && (
            <p className="text-xs text-indigo-600 dark:text-indigo-400 truncate">
              {user.tenant_nombre}
            </p>
          )}
        </div>
      )}
    </aside>
  );
}
