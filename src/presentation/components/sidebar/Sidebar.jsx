import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaChevronDown, FaSignOutAlt, FaFileAlt } from 'react-icons/fa';
import { BRAND, sidebarByRole, soporteLink } from './sidebarData.jsx';
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