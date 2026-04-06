import { Link } from 'react-router-dom';
import { FiShield, FiCpu, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

export default function HomePage() {
  const plans = [
    { id: 1, name: 'Basico', price: '$25/mo', items: ['Cobertura inicial', 'Atencion digital', 'Soporte base'] },
    { id: 2, name: 'Plus', price: '$150/mo', items: ['Cobertura media', 'Analitica IA', 'Atencion prioritaria'] },
    { id: 3, name: 'Premium', price: '$350/mo', items: ['Cobertura integral', 'Monitoreo activo', 'Asesor premium'] },
  ];

  return (
    <main className='min-h-screen bg-[radial-gradient(circle_at_top,_#eef4ff_0%,_#f8fbff_42%,_#ffffff_100%)] text-slate-800'>
      <section className='mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20'>
        <div className='max-w-2xl'>
          <p className='mb-4 inline-flex items-center rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-700 shadow-sm'>
            Proteccion inteligente
          </p>

          <h1 className='text-balance text-4xl font-black leading-[0.95] tracking-tight text-blue-900 sm:text-5xl lg:text-6xl'>
            Tu futuro, protegido con inteligencia artificial
          </h1>

          <p className='mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg'>
            Cotiza, gestiona y sigue tu seguro de vida de forma inteligente y personalizada con SegurIA.
          </p>

          <div className='mt-8 flex flex-wrap gap-3'>
            <Link
              to='/login'
              className='inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-600'
            >
              Cotiza tu seguro hoy
              <FiArrowRight />
            </Link>

            <Link
              to='/login'
              className='inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-6 py-3 text-sm font-bold text-blue-800 transition hover:border-blue-300 hover:bg-blue-50'
            >
              Iniciar sesión
            </Link>
          </div>
        </div>

        <div className='relative'>
          <div className='absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-blue-200/50 via-white to-emerald-100/40 blur-2xl' />
          <div className='rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_20px_45px_-18px_rgba(15,23,42,0.35)] sm:p-6'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='rounded-2xl bg-blue-50 p-4'>
                <FiCpu className='mb-3 h-6 w-6 text-blue-700' />
                <p className='font-bold text-blue-900'>IA personalizada</p>
                <p className='text-sm text-slate-600'>Recomendaciones segun tu perfil</p>
              </div>

              <div className='rounded-2xl bg-cyan-50 p-4'>
                <FiShield className='mb-3 h-6 w-6 text-cyan-700' />
                <p className='font-bold text-cyan-900'>Cobertura integral</p>
                <p className='text-sm text-slate-600'>Proteccion completa y escalable</p>
              </div>

              <div className='rounded-2xl bg-emerald-50 p-4 sm:col-span-2'>
                <FiCheckCircle className='mb-3 h-6 w-6 text-emerald-700' />
                <p className='font-bold text-emerald-900'>Gestion simple</p>
                <p className='text-sm text-slate-600'>Panel claro para cliente, agente y admin</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id='beneficios' className='mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8'>
        <h2 className='text-2xl font-black tracking-tight text-slate-900 sm:text-3xl'>¿Por qué SegurIA?</h2>

        <div className='mt-6 grid gap-5 md:grid-cols-3'>
          {[
            {
              title: 'IA personalizada',
              desc: 'Analizamos el perfil del cliente para ofrecer propuestas más precisas y humanas.',
            },
            {
              title: 'Gestión digital simple',
              desc: 'Todo el flujo se controla desde web: clientes, agentes, planes y seguimiento.',
            },
            {
              title: 'Cobertura integral',
              desc: 'Un panel claro para cotizar, revisar y gestionar pólizas sin fricción.',
            },
          ].map((item) => (
            <article key={item.title} className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
              <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700'>
                <FiCheckCircle className='h-6 w-6' />
              </div>
              <h3 className='text-lg font-extrabold text-slate-900'>{item.title}</h3>
              <p className='mt-2 text-sm leading-relaxed text-slate-600'>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id='agentes' className='mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8'>
        <div className='grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1.2fr_0.8fr] lg:p-8'>
          <div>
            <p className='text-sm font-bold uppercase tracking-[0.2em] text-blue-700'>Agentes</p>
            <h2 className='mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl'>Una capa operativa para el equipo comercial</h2>
            <p className='mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base'>
              Los agentes gestionan clientes, cotizaciones y seguimiento desde un panel privado con sidebar.
              El acceso es por rol y se conecta directamente a tu backend Django.
            </p>
          </div>

          <div className='grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3'>
            <div className='rounded-2xl bg-blue-50 p-4 text-sm'>
              <p className='font-extrabold text-blue-900'>Clientes</p>
              <p className='mt-1 text-slate-600'>Gestión asignada por agente.</p>
            </div>
            <div className='rounded-2xl bg-cyan-50 p-4 text-sm'>
              <p className='font-extrabold text-cyan-900'>Bitácora</p>
              <p className='mt-1 text-slate-600'>Seguimiento de acciones y cambios.</p>
            </div>
            <div className='rounded-2xl bg-emerald-50 p-4 text-sm'>
              <p className='font-extrabold text-emerald-900'>Cotización</p>
              <p className='mt-1 text-slate-600'>Flujo rápido para registrar oportunidades.</p>
            </div>
          </div>
        </div>
      </section>

      <section id='sobre-nosotros' className='mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8'>
        <div className='rounded-[2rem] bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-8 text-white shadow-xl sm:px-8'>
          <p className='text-sm font-bold uppercase tracking-[0.2em] text-blue-100'>Sobre Nosotros</p>
          <h2 className='mt-2 text-2xl font-black tracking-tight sm:text-3xl'>SegurIA centraliza la experiencia de seguro en un solo sistema</h2>
          <p className='mt-4 max-w-3xl text-sm leading-relaxed text-blue-50 sm:text-base'>
            La aplicación integra el frontend en React con el backend Django para administrar usuarios,
            roles, permisos, clientes, agentes, bitácoras y tipos de seguro con una interfaz clara y responsive.
          </p>
        </div>
      </section>

      <section id='planes' className='mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8'>
        <h2 className='text-2xl font-black tracking-tight text-slate-900 sm:text-3xl'>Nuestros planes destacados</h2>

        <div className='mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
          {plans.map((plan) => (
            <article
              key={plan.id}
              className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg'
            >
              <h3 className='text-lg font-extrabold text-slate-900'>{plan.name}</h3>
              <p className='mt-1 text-3xl font-black text-blue-800'>{plan.price}</p>

              <ul className='mt-4 space-y-2 text-sm text-slate-600'>
                {plan.items.map((it) => (
                  <li key={it} className='flex gap-2'>
                    <span className='mt-2 h-2 w-2 rounded-full bg-emerald-500' />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>

              <button className='mt-6 w-full rounded-xl bg-blue-700 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800'>
                Ver más
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}