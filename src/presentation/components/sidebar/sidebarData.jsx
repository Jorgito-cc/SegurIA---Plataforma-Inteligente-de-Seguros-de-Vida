import React from "react";
import {
  FaUsers,
  FaShieldAlt,
  FaUserShield,
  FaUserFriends,
  FaChartBar,
  FaLifeRing,
  FaHome,
  FaCog,
  FaClipboardList,
} from "react-icons/fa";

export const BRAND = "SegurIA";

export const sidebarByRole = {
  Administrador: [
    {
      key: "admin",
      icon: <FaHome />,
      title: "Dashboard",
      items: [{ label: "Dashboard", to: "/admin/dashboard" }],
    },
    {
      key: "gestion",
      icon: <FaUserShield />,
      title: "Gestión",
      items: [
        { label: "Usuarios", to: "/admin/usuarios" },
        { label: "Agentes", to: "/admin/agentes" },
        { label: "Clientes", to: "/admin/clientes" },
        { label: "Planes/Tipos", to: "/admin/planes" },
      ],
    },
    {
      key: "seguridad",
      icon: <FaShieldAlt />,
      title: "Seguridad",
      items: [
        { label: "Roles", to: "/admin/roles" },
        { label: "Permisos", to: "/admin/permisos" },
        { label: "Bitácora", to: "/admin/bitacora" },
      ],
    },
  ],

  AdminAgencia: [
    {
      key: "dashboard",
      icon: <FaHome />,
      title: "Dashboard",
      items: [{ label: "Inicio", to: "/admin-agencia/dashboard" }],
    },
    {
      key: "gestion",
      icon: <FaCog />,
      title: "Gestión",
      items: [
        { label: "Planes/Tipos", to: "/admin-agencia/planes" },
        { label: "Agentes", to: "/admin-agencia/agentes" },
      ],
    },
    {
      key: "seguridad",
      icon: <FaShieldAlt />,
      title: "Seguridad",
      items: [{ label: "Bitácora", to: "/admin-agencia/bitacora" }],
    },
    {
      key: "reportes",
      icon: <FaChartBar />,
      title: "Reportes",
      items: [{ label: "Reportes", to: "/admin-agencia/reportes" }],
    },
  ],

  Agente: [
    {
      key: "agente",
      icon: <FaUserFriends />,
      title: "Clientes",
      items: [
        { label: "Dashboard", to: "/agente/dashboard" },
        { label: "Gestión de clientes", to: "/agente/clientes" },
      ],
    },
    {
      key: "reportes",
      icon: <FaChartBar />,
      title: "Seguimiento",
      items: [{ label: "Bitácora", to: "/agente/bitacora" }],
    },
  ],

  Cliente: [
    {
      key: "cliente",
      icon: <FaUsers />,
      title: "Mi cuenta",
      items: [
        { label: "Panel", to: "/cliente/dashboard" },
        { label: "Mi perfil", to: "/cliente/perfil" },
        { label: "Mis solicitudes", to: "/cliente/solicitudes" },
      ],
    },
    {
      key: "ayuda",
      icon: <FaLifeRing />,
      title: "Ayuda",
      items: [{ label: "Soporte", to: "/cliente/soporte" }],
    },
  ],
};

export const soporteLink = { label: "Soporte técnico", to: "/soporte" };
export const ManualLink = { label: "Manual", to: "/manual" };
