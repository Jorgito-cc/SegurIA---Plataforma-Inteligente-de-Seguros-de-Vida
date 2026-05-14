import axios from "axios";

const FALLBACK_API_BASE =
  "https://backendseguros-production.up.railway.app/api";
const rawApiBase = import.meta.env.VITE_API_BASE || FALLBACK_API_BASE;
const API_BASE = rawApiBase.replace(/\/+$/, "");

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  // Agregar token JWT si existe
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Agregar X-Tenant-Slug si existe (para que el middleware pueda encontrar el tenant)
  const tenantSlug = localStorage.getItem("tenant_slug");
  if (tenantSlug) {
    config.headers["X-Tenant-Slug"] = tenantSlug;
    console.log("[API] X-Tenant-Slug enviado:", tenantSlug);
  } else {
    // Si no existe tenant_slug directo, intentar obtenerlo del auth_user
    const authUser = localStorage.getItem("auth_user");
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        if (user.tenant_slug) {
          config.headers["X-Tenant-Slug"] = user.tenant_slug;
          localStorage.setItem("tenant_slug", user.tenant_slug);
          console.log(
            "[API] X-Tenant-Slug obtenido de auth_user:",
            user.tenant_slug,
          );
        } else {
          console.warn("[API] auth_user no tiene tenant_slug");
        }
      } catch (e) {
        console.error("[API] Error parsing auth_user:", e);
      }
    } else {
      console.warn("[API] No hay auth_user o tenant_slug en localStorage");
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";

    if (status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("tenant_slug");
    }

    let data = error?.response?.data;

    // Si el error viene como un Blob (común en endpoints que devuelven archivos), intentamos leerlo como JSON
    if (data instanceof Blob && data.type === "application/json") {
      try {
        const text = await data.text();
        data = JSON.parse(text);
      } catch (e) {
        console.error("Error parsing Blob error data", e);
      }
    }

    let message = "Error de red o servidor";

    if (typeof data === "string" && data.trim()) {
      message = data;
    } else if (data?.detail) {
      message = data.detail;
    } else if (data?.error) {
      message = data.error;
    } else if (data && typeof data === "object") {
      const fieldErrors = Object.entries(data)
        .map(([field, value]) => {
          const text = Array.isArray(value) ? value.join(", ") : String(value);
          return `${field}: ${text}`;
        })
        .join(" | ");

      if (fieldErrors) {
        message = fieldErrors;
      }
    }

    if (
      status === 401 &&
      /agentes|clientes|administrador|bitacoras/i.test(requestUrl)
    ) {
      message = "Sesión expirada o inválida. Inicia sesión nuevamente.";
    } else if (status === 403) {
      message = "No tienes permisos para realizar esta acción.";
    } else if (status === 405) {
      message = "Método HTTP no permitido para este endpoint.";
    }

    const apiError = new Error(message);
    apiError.status = status;
    apiError.data = data;
    apiError.url = requestUrl;

    console.error(`API Error [${status}]: ${requestUrl}`, data);

    return Promise.reject(apiError);
  },
);

export default apiClient;
