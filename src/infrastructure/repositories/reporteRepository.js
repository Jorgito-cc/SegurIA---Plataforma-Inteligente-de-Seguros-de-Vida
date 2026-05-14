import apiClient from "../api/apiClient";

const reporteRepository = {
  getMetadata: async () => {
    const response = await apiClient.get("/reportes/metadata/");
    return response.data;
  },

  getReporte: async (modelo, filtros = {}) => {
    const params = new URLSearchParams({ modelo, export: "json", ...filtros });
    const response = await apiClient.get(`/reportes/?${params.toString()}`);
    return response.data;
  },

  downloadReporte: async (modelo, format, filtros = {}) => {
    const params = new URLSearchParams({ modelo, export: format, ...filtros });
    const response = await apiClient.get(`/reportes/?${params.toString()}`, {
      responseType: "blob",
    });
    return response.data;
  },

  getVoiceIntent: async (text) => {
    const response = await apiClient.post("/reportes/voice-intent/", { text });
    return response.data;
  },

  downloadFromUrl: async (url) => {
    const response = await apiClient.get(url, { responseType: "blob" });
    return response.data;
  },
};

export default reporteRepository;