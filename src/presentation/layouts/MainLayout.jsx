import { Link, NavLink, Outlet } from 'react-router-dom';
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaTelegramPlane, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

export default function MainLayout() {
  return (
    <div className='min-h-screen flex flex-col bg-slate-50 text-slate-900'>
      <header className='sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur'>
        <div className='mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8'>
          <Link to='/' className='text-2xl font-black tracking-tight text-blue-800'>
            SegurIA
          </Link>

          <nav className='hidden items-center gap-8 text-sm font-semibold text-slate-700 md:flex'>
            <NavLink to='/' className='transition hover:text-blue-800'>Inicio</NavLink>
            <a href='#planes' className='transition hover:text-blue-800'>Nuestros Planes</a>
            <a href='#beneficios' className='transition hover:text-blue-800'>Agentes</a>
            <a href='#sobre-nosotros' className='transition hover:text-blue-800'>Sobre Nosotros</a>
          </nav>

          <div className='flex items-center gap-3'>
            <Link
              to='/login'
              className='inline-flex items-center rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-900'
            >
              Iniciar Sesión
            </Link>
            <div className='hidden h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700 ring-1 ring-sky-200 sm:flex'>
              <span className='text-lg font-black'>☺</span>
            </div>
          </div>
        </div>
      </header>

      <main className='flex-1'>
        <Outlet />
      </main>

      <footer className='relative overflow-hidden bg-gradient-to-r from-[#1d4f91] via-[#245b9b] to-[#2f6ab3] text-white'>
        <div className='absolute right-6 top-1/2 hidden h-20 w-20 -translate-y-1/2 rounded-[1.5rem] bg-white/15 rotate-45 lg:block' />

        <div className='mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] lg:px-8'>
          <div>
            <Link to='/' className='inline-flex items-center gap-2 text-3xl font-black tracking-tight'>
              <span className='text-4xl'>🛡</span>
              SegurIA
            </Link>

            <div className='mt-5 flex items-center gap-3 text-lg'>
              <a href='https://facebook.com' className='grid h-9 w-9 place-items-center rounded-full bg-white/15 transition hover:bg-white/25' aria-label='Facebook'>
                <FaFacebookF />
              </a>
              <a href='https://linkedin.com' className='grid h-9 w-9 place-items-center rounded-full bg-white/15 transition hover:bg-white/25' aria-label='LinkedIn'>
                <FaLinkedinIn />
              </a>
              <a href='https://twitter.com' className='grid h-9 w-9 place-items-center rounded-full bg-white/15 transition hover:bg-white/25' aria-label='Twitter'>
                <FaTwitter />
              </a>
              <a href='https://telegram.org' className='grid h-9 w-9 place-items-center rounded-full bg-white/15 transition hover:bg-white/25' aria-label='Telegram'>
                <FaTelegramPlane />
              </a>
            </div>
          </div>

          <div>
            <h3 className='text-lg font-extrabold'>Servicios</h3>
            <ul className='mt-4 space-y-2 text-sm text-blue-50/95'>
              <li><a className='transition hover:text-white' href='#planes'>Cotizaciones</a></li>
              <li><a className='transition hover:text-white' href='#beneficios'>Reclamaciones</a></li>
              <li><a className='transition hover:text-white' href='#planes'>Beneficios</a></li>
            </ul>
          </div>

          <div>
            <h3 className='text-lg font-extrabold'>Empresa</h3>
            <ul className='mt-4 space-y-2 text-sm text-blue-50/95'>
              <li><a className='transition hover:text-white' href='#sobre-nosotros'>Sobre Nosotros</a></li>
              <li><a className='transition hover:text-white' href='#sobre-nosotros'>Carreras</a></li>
              <li><a className='transition hover:text-white' href='#contacto'>Contacto</a></li>
            </ul>
          </div>

          <div id='contacto'>
            <h3 className='text-lg font-extrabold'>Legal y contacto</h3>
            <ul className='mt-4 space-y-3 text-sm text-blue-50/95'>
              <li><a className='transition hover:text-white' href='#'>Términos de Servicio</a></li>
              <li><a className='transition hover:text-white' href='#'>Política de Privacidad</a></li>
              <li><a className='transition hover:text-white' href='#'>Preguntas Frecuentes</a></li>
            </ul>

            <div className='mt-5 space-y-3 text-sm text-blue-50/95'>
              <p className='flex items-center gap-2'><FaPhoneAlt className='shrink-0' /> (282) 275-7899</p>
              <p className='flex items-center gap-2'><FaEnvelope className='shrink-0' /> info@seguriaseguria.com</p>
              <p className='max-w-xs'>© 2026 SegurIA. Todos los derechos reservados. Cochabamba, Bolivia</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}