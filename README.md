# SegurIA Frontend

Frontend web de SegurIA construido con React, Vite y Tailwind CSS.

Este cliente consume el backend Django REST de SegurIA e implementa un flujo por roles:

- Administrador
- Agente
- Cliente

## Tecnologías

- React 19
- Vite 8
- Tailwind CSS 3
- React Router DOM
- Axios
- React Toastify
- React Icons

## Scripts

```bash
npm run dev
```

Inicia el frontend en desarrollo.

```bash
npm run build
```

Genera el build de producción.

```bash
npm run preview
```

Previsualiza el build de producción localmente.

```bash
npm run lint
```

Ejecuta eslint.

## Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Configurar variables de entorno en `.env`.

3. Levantar el proyecto:

```bash
npm run dev
```

## Variables de entorno

Ejemplo para desarrollo local:

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_APP_NAME=SegurIA
```

Ejemplo para backend desplegado:

```env
VITE_API_URL=https://backend-seguros-de-vida-production.up.railway.app/api
VITE_APP_NAME=SegurIA
```

## Nota importante de CORS

Si el frontend corre en localhost o Netlify y el backend está en Railway, el backend debe permitir ese origen con CORS.

Ejemplo en Django:

```python
CORS_ALLOWED_ORIGINS = [
		"http://localhost:5173",
		"http://localhost:3830",
		"https://tu-frontend.netlify.app",
]
```

## Estructura del proyecto

Arquitectura orientada a capas (clean architecture en frontend):

```text
src/
	domain/
		models/

	application/
		context/
		hooks/
		use_cases/

	infrastructure/
		api/
		repositories/

	presentation/
		components/
		layouts/
		pages/
		routes/

	App.jsx
	main.jsx
```

## Rutas principales

### Públicas

- `/`
- `/login`
- `/registro`
- `/recuperar-password`
- `/restablecer-password`

### Privadas por rol

- `/admin/*`
- `/agente/*`
- `/cliente/*`

Las rutas privadas usan guards de autenticación y rol:

- `RequireAuth`
- `RequireRole`
- `RedirectIfAuth`

## Flujo de autenticación

1. Login envía credenciales a `/api/login/`.
2. Se guardan tokens JWT en localStorage.
3. Axios inyecta `Authorization: Bearer <token>` automáticamente.
4. Se redirige según el rol del usuario:
	 - Administrador -> `/admin/dashboard`
	 - Agente -> `/agente/dashboard`
	 - Cliente -> `/cliente/dashboard`

## Registro de cliente

El formulario de registro está alineado con el serializer de backend para clientes.

Payload base esperado:

```json
{
	"username": "carlos_cliente1",
	"email": "carlos1@correo.com",
	"password": "PasswordSeguro123!",
	"first_name": "Carlos1",
	"last_name": "Mendoza1",
	"ci": "987654321",
	"telefono": "71122334",
	"direccion": "Av. Banzer, 4to Anillo"
}
```

## Estado actual

- Home pública responsive
- Header y footer personalizados
- Login conectado a backend
- Registro de cliente conectado a backend
- Router por rol (base)
- Estructura lista para continuar módulos admin/agente/cliente

## Recomendaciones para producción

- Definir `DEBUG=False` en backend
- Configurar `ALLOWED_HOSTS` reales
- Configurar CORS para dominio final del frontend
- Usar HTTPS en frontend y backend
- Revisar expiración y refresh de JWT
