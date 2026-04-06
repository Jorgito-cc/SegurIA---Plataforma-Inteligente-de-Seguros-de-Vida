# Diseno de arquitectura frontend (React + JS + JSX + Tailwind)

## 1) Analisis rapido de tu frontend actual

### Dependencias actuales en package.json
- react: base de UI
- react-dom: render al DOM
- axios: cliente HTTP para consumir API Django
- react-hook-form: manejo de formularios
- react-icons: iconografia
- react-router: libreria de enrutado

### Observaciones clave
1. Para aplicacion web con navegador, normalmente se usa react-router-dom en vez de react-router.
2. Tailwind ya esta bien configurado (tailwind.config.js + postcss + directivas en src/index.css).
3. Tu estructura de carpetas ya esta alineada con Clean Architecture, solo falta poblarla.

### Recomendacion de dependencias
Ejecuta esto en client:

```bash
npm uninstall react-router
npm install react-router-dom
```

Si prefieres mantener react-router por ahora, tambien funciona para logica base, pero para BrowserRouter y componentes web la opcion recomendada es react-router-dom.

---

## 2) Conexion con backend Django usando .env

Crea/edita archivo .env en client:

```env
VITE_API_URL=http://localhost:8000
```

Opcional si versionas ejemplo:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=SegurIA
```

Regla Vite: solo variables que empiezan con VITE_ estan disponibles en frontend.

---

## 3) Estructura final recomendada (Clean Architecture)

```text
client/
  src/
    domain/
      models/
        User.js
        Plan.js
        Quote.js

    application/
      hooks/
        usePlans.js
        useQuote.js
      context/
        AuthContext.jsx
      use_cases/
        getPlans.js
        createQuote.js

    infrastructure/
      api/
        apiClient.js
      repositories/
        PlanRepository.js
        QuoteRepository.js
        AuthRepository.js

    presentation/
      components/
        layout/
          Navbar.jsx
          Footer.jsx
        home/
          HeroSection.jsx
          WhyUsSection.jsx
          FeaturedPlansSection.jsx
      pages/
        HomePage.jsx
        PlansPage.jsx
        LoginPage.jsx
      routes/
        AppRouter.jsx

    App.jsx
    main.jsx
    index.css
```

### Responsabilidad por capa
1. domain: define entidades/modelos del negocio. No depende de React ni Axios.
2. application: coordina casos de uso y estado (hooks/context). No dibuja UI.
3. infrastructure: habla con API externa (Django), transforma datos HTTP.
4. presentation: JSX + Tailwind + router. Solo UI y eventos de usuario.

### Regla de dependencia (importante)
- presentation puede usar application y domain.
- application puede usar domain e interfaces/repositorios.
- infrastructure implementa repositorios para application.
- domain no depende de nadie.

---

## 4) Flujo recomendado desde UI hasta Django API

1. Usuario hace click en un boton de una pagina (presentation).
2. Un hook de application llama un caso de uso.
3. El caso de uso usa un repositorio (infrastructure).
4. El repositorio usa apiClient (axios) y llama endpoint Django.
5. Respuesta vuelve al caso de uso, luego al hook, luego a la UI.
6. La UI renderiza datos y estados (loading, error, success).

---

## 5) Codigo base sugerido por capa

## 5.1 infrastructure/api/apiClient.js

```jsx
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.detail || 'Error de red o servidor';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
```

Que hace:
- baseURL: centraliza URL de tu backend Django desde .env.
- timeout: evita esperas infinitas.
- interceptor: normaliza errores para no repetir logica en toda la app.

## 5.2 infrastructure/repositories/PlanRepository.js

```jsx
import apiClient from '../api/apiClient';

export const PlanRepository = {
  async getFeaturedPlans() {
    const { data } = await apiClient.get('/api/planes-destacados/');
    return data;
  },
};
```

Que hace:
- encapsula endpoint real del backend.
- presentation nunca llama axios directo, llama use cases/hooks.

## 5.3 application/use_cases/getPlans.js

```jsx
export async function getFeaturedPlans(planRepository) {
  const plans = await planRepository.getFeaturedPlans();
  return plans.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    precioMensual: p.precio_mensual,
    beneficios: p.beneficios || [],
  }));
}
```

Que hace:
- adapta shape backend a shape que necesita UI.
- mantiene la logica de transformacion fuera del componente visual.

## 5.4 application/hooks/usePlans.js

```jsx
import { useEffect, useState } from 'react';
import { getFeaturedPlans } from '../use_cases/getPlans';
import { PlanRepository } from '../../infrastructure/repositories/PlanRepository';

export function usePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const result = await getFeaturedPlans(PlanRepository);
        if (mounted) setPlans(result);
      } catch (err) {
        if (mounted) setError(err.message || 'No se pudo cargar planes');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { plans, loading, error };
}
```

Que hace:
- maneja estado de pantalla (loading/error/data).
- deja a los componentes de UI limpios y enfocados en render.

---

## 6) Router y bootstrap de app

## 6.1 presentation/routes/AppRouter.jsx

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import PlansPage from '../pages/PlansPage';
import LoginPage from '../pages/LoginPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/planes' element={<PlansPage />} />
        <Route path='/iniciar-sesion' element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 6.2 App.jsx

```jsx
import AppRouter from './presentation/routes/AppRouter';

function App() {
  return <AppRouter />;
}

export default App;
```

---

## 7) Diseno Home responsive con Tailwind (basado en tu imagen)

## 7.1 Estructura HTML/JSX principal

```jsx
<main className='min-h-screen bg-slate-50 text-slate-800'>
  <header>{/* Navbar */}</header>

  <section>{/* Hero: titulo, texto, CTA, imagen */}</section>

  <section>{/* Why Us: 3 cards de beneficios */}</section>

  <section>{/* Planes destacados: grid cards */}</section>

  <footer>{/* Footer con columnas y contacto */}</footer>
</main>
```

Como leer la estructura:
- main: contenedor global de la pagina.
- header: navegacion fija de marca y links.
- section: bloques de contenido semanticos y reutilizables.
- footer: cierre con enlaces y datos de contacto.

## 7.2 Ejemplo completo HomePage.jsx

```jsx
import { ShieldCheck, Brain, BadgeCheck, Smartphone, ChevronRight } from 'react-icons/fi';

export default function HomePage() {
  const plans = [
    { id: 1, nombre: 'Basico', precio: '$25/mo', bullets: ['Cobertura inicial', 'Asistencia digital', 'Soporte basico'] },
    { id: 2, nombre: 'Plus', precio: '$150/mo', bullets: ['Mejor cobertura', 'Analitica IA', 'Atencion prioritaria'] },
    { id: 3, nombre: 'Premium', precio: '$350/mo', bullets: ['Cobertura total', 'Gestion avanzada', 'Acompanamiento experto'] },
  ];

  return (
    <main className='min-h-screen bg-[radial-gradient(circle_at_top,#eff6ff_0%,#f8fafc_45%,#ffffff_100%)] text-slate-800'>
      <header className='sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur'>
        <nav className='mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center gap-2'>
            <ShieldCheck className='h-8 w-8 text-blue-700' />
            <span className='text-2xl font-extrabold tracking-tight text-blue-900'>SegurIA</span>
          </div>

          <ul className='hidden items-center gap-8 text-sm font-semibold md:flex'>
            <li><a className='transition hover:text-blue-700' href='#'>Inicio</a></li>
            <li><a className='transition hover:text-blue-700' href='#'>Nuestros Planes</a></li>
            <li><a className='transition hover:text-blue-700' href='#'>Agentes</a></li>
            <li><a className='transition hover:text-blue-700' href='#'>Sobre Nosotros</a></li>
          </ul>

          <button className='rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800'>
            Iniciar sesion
          </button>
        </nav>
      </header>

      <section className='mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:px-8'>
        <div>
          <p className='mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700'>
            Proteccion inteligente
          </p>
          <h1 className='text-balance text-4xl font-black leading-tight text-blue-900 sm:text-5xl'>
            Tu futuro, protegido con inteligencia artificial
          </h1>
          <p className='mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg'>
            Cotiza, gestiona y da seguimiento a tu seguro de vida de forma simple, clara y personalizada.
          </p>

          <div className='mt-8 flex flex-wrap gap-3'>
            <button className='inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-600'>
              Cotiza tu seguro
              <ChevronRight className='h-4 w-4' />
            </button>
            <button className='rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700'>
              Ver planes
            </button>
          </div>
        </div>

        <div className='relative'>
          <div className='absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-blue-200/50 to-emerald-200/40 blur-2xl' />
          <div className='rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='rounded-2xl bg-blue-50 p-4'>
                <Brain className='mb-2 h-6 w-6 text-blue-700' />
                <p className='text-sm font-bold text-blue-900'>Analisis IA</p>
                <p className='text-xs text-slate-600'>Evaluacion de riesgo automatizada</p>
              </div>
              <div className='rounded-2xl bg-emerald-50 p-4'>
                <BadgeCheck className='mb-2 h-6 w-6 text-emerald-700' />
                <p className='text-sm font-bold text-emerald-900'>Cobertura activa</p>
                <p className='text-xs text-slate-600'>Monitoreo constante de tu plan</p>
              </div>
              <div className='rounded-2xl bg-sky-50 p-4 sm:col-span-2'>
                <Smartphone className='mb-2 h-6 w-6 text-sky-700' />
                <p className='text-sm font-bold text-sky-900'>Gestion digital simple</p>
                <p className='text-xs text-slate-600'>Todo desde web y movil sin friccion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8'>
        <h2 className='text-2xl font-black text-slate-900 sm:text-3xl'>Por que SegurIA</h2>
        <div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {[
            { title: 'IA personalizada', desc: 'Recomendaciones adaptadas a tu perfil.' },
            { title: 'Gestion simple', desc: 'Procesos claros para cotizar y contratar.' },
            { title: 'Cobertura integral', desc: 'Planes para diferentes etapas de vida.' },
          ].map((item) => (
            <article key={item.title} className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
              <h3 className='text-base font-extrabold text-slate-900'>{item.title}</h3>
              <p className='mt-2 text-sm text-slate-600'>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className='mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8'>
        <h2 className='text-2xl font-black text-slate-900 sm:text-3xl'>Nuestros planes destacados</h2>

        <div className='mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
          {plans.map((plan) => (
            <article key={plan.id} className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg'>
              <h3 className='text-lg font-extrabold text-slate-900'>{plan.nombre}</h3>
              <p className='mt-1 text-3xl font-black text-blue-800'>{plan.precio}</p>
              <ul className='mt-4 space-y-2 text-sm text-slate-600'>
                {plan.bullets.map((b) => (
                  <li key={b} className='flex items-start gap-2'>
                    <span className='mt-1 h-2 w-2 rounded-full bg-emerald-500' />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <button className='mt-6 w-full rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800'>
                Ver mas
              </button>
            </article>
          ))}
        </div>
      </section>

      <footer className='bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white'>
        <div className='mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8'>
          <div>
            <h3 className='text-2xl font-black'>SegurIA</h3>
            <p className='mt-3 text-sm text-blue-100'>Proteccion de vida con tecnologia y cercania humana.</p>
          </div>
          <div>
            <p className='text-sm font-extrabold uppercase tracking-wide text-blue-100'>Servicios</p>
            <ul className='mt-3 space-y-2 text-sm'>
              <li>Cotizaciones</li>
              <li>Reclamaciones</li>
              <li>Beneficios</li>
            </ul>
          </div>
          <div>
            <p className='text-sm font-extrabold uppercase tracking-wide text-blue-100'>Empresa</p>
            <ul className='mt-3 space-y-2 text-sm'>
              <li>Sobre nosotros</li>
              <li>Carreras</li>
              <li>Contacto</li>
            </ul>
          </div>
          <div>
            <p className='text-sm font-extrabold uppercase tracking-wide text-blue-100'>Contacto</p>
            <ul className='mt-3 space-y-2 text-sm'>
              <li>(282) 275-7899</li>
              <li>info@seguria.com</li>
              <li>Cochabamba, Bolivia</li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}
```

---

## 8) Explicacion de Tailwind usado (seccion por seccion)

### Layout global
- min-h-screen: alto minimo del viewport completo.
- bg-[radial-gradient(...)]: fondo con gradiente radial suave para profundidad.
- text-slate-800: color base de texto legible.

### Navbar
- sticky top-0 z-40: cabecera fija al hacer scroll.
- bg-white/85 backdrop-blur: efecto vidrio (frosted) sin perder legibilidad.
- max-w-7xl mx-auto: contenido centrado y ancho maximo consistente.
- hidden md:flex: menu desktop visible desde md, oculto en movil.

### Hero responsive
- grid-cols-1 lg:grid-cols-2: una columna en movil, dos en escritorio.
- text-4xl sm:text-5xl: escala tipografica por breakpoint.
- flex flex-wrap gap-3: botones se acomodan en varias lineas si falta ancho.

### Tarjetas y bloques
- rounded-2xl + border + shadow-sm: look moderno y limpio.
- hover:-translate-y-1 hover:shadow-lg: feedback visual al pasar mouse.
- space-y-2: separacion vertical uniforme en listas.

### Footer
- bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700: cierre visual fuerte.
- grid md:grid-cols-2 lg:grid-cols-4: adapta columnas por ancho.

---

## 9) HTML semantico que debes mantener

1. header para navegacion principal.
2. main como contenedor de contenido principal.
3. section para cada bloque funcional (hero, beneficios, planes).
4. article para cards independientes (planes, ventajas).
5. footer para enlaces secundarios y contacto.

Esto mejora accesibilidad, SEO y mantenimiento.

---

## 10) Orden de implementacion recomendado

1. Configurar .env y apiClient.js.
2. Crear repositories segun endpoints reales Django.
3. Crear use_cases y hooks (loading/error/data).
4. Construir AppRouter y paginas base.
5. Construir HomePage con componentes reutilizables.
6. Conectar datos reales en vez de mocks.
7. Ajustar responsive final (mobile first).

---

## 11) Checklist de calidad (antes de seguir)

- Cada componente de presentation no llama axios directo.
- Toda URL de API sale de import.meta.env.VITE_API_URL.
- No hay logica de negocio pesada dentro de JSX.
- Los breakpoints de Tailwind se prueban en movil y escritorio.
- Errores de API muestran mensaje amigable en pantalla.

Si quieres, en el siguiente paso te puedo armar una version 100% conectada a tus endpoints reales de Django (rutas exactas) para que solo pegues y ejecutes.
