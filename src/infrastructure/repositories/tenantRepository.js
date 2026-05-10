import apiClient from "../api/apiClient";

export const tenantRepository = {
  /**
   * GET /api/tenants/planes/
   * Obtiene la lista de planes disponibles
   */
  async obtenerPlanes() {
    const { data } = await apiClient.get("tenants/planes/");
    return data;
  },

  /**
   * POST /api/tenants/crear-checkout-session/
   * Crea una sesión de pago en Stripe
   */
  async crearCheckoutSession(planData) {
    const { data } = await apiClient.post(
      "tenants/crear-checkout-session/",
      planData,
    );
    return data;
  },

  /**
   * GET /api/tenants/verificar-pago/?session_id=...
   * Verifica el pago y activa la suscripción
   */
  async verificarPago(sessionId) {
    const { data } = await apiClient.get("tenants/verificar-pago/", {
      params: { session_id: sessionId },
    });
    return data;
  },

  /**
   * GET /api/tenants/info/
   * Obtiene información del tenant actual
   */
  async obtenerInfo() {
    const { data } = await apiClient.get("tenants/info/");
    return data;
  },

  /**
   * POST /api/tenants/registro/
   * Registra un nuevo tenant (sin autenticación)
   */
  async registrarTenant(tenantData) {
    const { data } = await apiClient.post("tenants/registro/", tenantData);
    return data;
  },
};
