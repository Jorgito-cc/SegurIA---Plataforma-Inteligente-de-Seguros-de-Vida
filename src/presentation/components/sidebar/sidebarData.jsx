import {
  FaUsers,
  FaShieldAlt,
  FaUserShield,
  FaUserFriends,
  FaChartBar,
  FaLifeRing,
} from 'react-icons/fa';

export const BRAND = 'SegurIA Panel';

export const sidebarByRole = {
  Administrador: [
    {
      key: 'cuenta',
      icon: <FaUsers />,
      title: 'Cuenta',
      items: [
        { label: 'Mi Perfil', to: '/admin/perfil' },
      ],
    },
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