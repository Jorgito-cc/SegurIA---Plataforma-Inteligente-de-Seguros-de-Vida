import { useState, useRef, useEffect } from "react";
import { notify } from "../../components/notifications/notify";
import { 
  FiMic, 
  FiMicOff, 
  FiBarChart2, 
  FiDownload, 
  FiFileText, 
  FiGrid, 
  FiCheckCircle, 
  FiAlertCircle,
  FiTrash2,
  FiFilter,
  FiSettings,
  FiRefreshCw
} from "react-icons/fi";
import apiClient from "../../../infrastructure/api/apiClient";
import { ENDPOINTS } from "../../../infrastructure/api/endpoints";
import { exportToPdf, exportToExcel, exportToHtml } from "../../utils/exportUtils";

export default function AdminAgenciaReportesPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [metadata, setMetadata] = useState({});
  const [selectedModelo, setSelectedModelo] = useState("");
  const [selectedFields, setSelectedFields] = useState([]);
  const [filters, setFilters] = useState({});
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);

  // Cargar metadatos del backend
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await apiClient.get(ENDPOINTS.reportes.metadata);
        setMetadata(res.data);
      } catch (error) {
        notify.error("Error al cargar modelos de reporte");
      }
    };
    fetchMetadata();
  }, []);

  // Inicializar Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "es-ES";
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => (prev + " " + finalTranscript).trim());
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Error de micrófono:", event.error);
        if (event.error === 'not-allowed') {
          notify.error("Debes permitir el acceso al micrófono en el navegador.");
        } else {
          notify.error("Error con el reconocimiento de voz.");
        }
        setIsListening(false);
      };
    } else {
      console.warn("El navegador no soporta reconocimiento de voz (Usa Chrome o Edge).");
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      return notify.error("Tu navegador no soporta control por voz. Usa Chrome o Microsoft Edge.");
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript("");
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Ya está iniciado", err);
      }
    }
  };

  const fetchReportData = async (modelo, campos, filtros) => {
    setLoading(true);
    try {
      const params = {
        modelo: modelo,
        campos: campos.join(','),
        limit: 10,
        ...filtros
      };
      const res = await apiClient.get(ENDPOINTS.reportes.base, { params });
      setReportData(res.data.data);
      notify.success("Vista de reporte generada exitosamente");
    } catch (error) {
      notify.error("Error al generar la vista del reporte");
    } finally {
      setLoading(false);
    }
  };

  const processVoiceCommand = async (text) => {
    if (!text.trim()) return notify.warning("No hay comando para procesar");
    try {
      setLoading(true);
      const res = await apiClient.post(ENDPOINTS.reportes.voice, { text });
      const { modelo_detectado, debug_ia } = res.data;
      
      if (modelo_detectado) {
        setSelectedModelo(modelo_detectado);
        let fields = [];
        if (metadata[modelo_detectado]) {
          fields = metadata[modelo_detectado].fields.map(f => f.name);
          setSelectedFields(fields);
        }
        const currentFilters = debug_ia.filtros || {};
        setFilters(currentFilters);
        notify.success(`IA detectó: ${metadata[modelo_detectado]?.verbose_name}`);
        
        // Auto-generar reporte inmediatamente
        await fetchReportData(modelo_detectado, fields, currentFilters);
      } else {
        notify.warning("La IA no pudo detectar un reporte válido. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Voice process error", error);
      notify.error("Error al procesar el comando de voz");
    } finally {
      setLoading(false);
    }
  };

  const handleModeloChange = (modelo) => {
    setSelectedModelo(modelo);
    if (metadata[modelo]) {
      setSelectedFields(metadata[modelo].fields.map(f => f.name));
    }
    setFilters({});
    setReportData(null);
  };

  const toggleField = (fieldName) => {
    setSelectedFields(prev => 
      prev.includes(fieldName) 
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName]
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const generatePreview = async () => {
    if (!selectedModelo) return notify.error("Seleccione un modelo");
    await fetchReportData(selectedModelo, selectedFields, filters);
  };

  const exportData = async (format) => {
    if (!selectedModelo) return;
    try {
      notify.info(`Generando archivo ${format.toUpperCase()}...`);
      const params = {
        modelo: selectedModelo,
        campos: selectedFields.join(','),
        export: 'json', // SIEMPRE pedimos JSON al backend
        ...filters
      };
      
      // Obtener todos los datos (sin límite)
      const res = await apiClient.get(ENDPOINTS.reportes.base, { params });
      const rawData = res.data.data || [];
      
      if (rawData.length === 0) {
        return notify.warning("No hay datos para exportar.");
      }

      const modelName = metadata[selectedModelo]?.verbose_name || "Reporte";
      const fileName = `Reporte_${modelName.replace(/\s+/g, '_')}_${new Date().getTime()}`;
      
      // Preparar columnas y filas para exportUtils
      const columns = selectedFields.map(f => 
        metadata[selectedModelo].fields.find(field => field.name === f)?.label || f
      );
      const rows = rawData.map(item => selectedFields.map(f => String(item[f] ?? '-')));

      // Generar localmente
      if (format === 'excel') {
        exportToExcel(fileName, modelName, rawData); // Excel utils espera array de objetos
      } else if (format === 'pdf') {
        exportToPdf(`Reporte: ${modelName}`, fileName, columns, rows);
      } else if (format === 'html') {
        exportToHtml(`Reporte: ${modelName}`, columns, rows);
      }
      
      notify.success(`Exportación a ${format.toUpperCase()} exitosa`);
    } catch (error) {
      console.error(error);
      notify.error("Error al exportar. Revisa si hay datos.");
    }
  };

  return (
    <div className="p-6 space-y-8 bg-slate-50/30 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FiBarChart2 className="text-blue-600" /> Generador de Reportes IA
          </h1>
          <p className="text-slate-500 font-medium">Control por voz con Gemini y exportación profesional.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Panel Izquierdo: Voz y Configuración */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Asistente IA</h3>
              {isListening && <span className="flex h-3 w-3 rounded-full bg-red-500 animate-ping"></span>}
            </div>
            
            <button
              onClick={toggleListening}
              className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all mb-4 ${
                isListening 
                  ? "bg-red-500 text-white shadow-lg shadow-red-200" 
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100"
              }`}
            >
              {isListening ? <FiMicOff size={22} /> : <FiMic size={22} />}
              {isListening ? "Escuchando..." : "Dictar Reporte"}
            </button>

            <div className="relative">
              <input 
                type="text" 
                placeholder="O escribe aquí (Ej: pólizas activas)"
                className="w-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-colors pr-12"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim() !== '') {
                    processVoiceCommand(e.target.value);
                    setTranscript(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <button 
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling;
                  if (input.value.trim() !== '') {
                    processVoiceCommand(input.value);
                    setTranscript(input.value);
                    input.value = '';
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200"
              >
                <FiCheckCircle />
              </button>
            </div>

            {transcript && (
              <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-xs text-slate-700 italic font-medium mb-4">
                  "{transcript}"
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => processVoiceCommand(transcript)}
                    disabled={loading}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
                  >
                    <FiCheckCircle />
                    Generar Reporte
                  </button>
                  <button
                    onClick={() => setTranscript("")}
                    disabled={loading}
                    className="p-3 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300 transition"
                    title="Borrar comando"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Selector de Modelo */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Fuente de Datos</h3>
            <div className="space-y-2">
              {Object.keys(metadata).map(modelKey => (
                <button
                  key={modelKey}
                  onClick={() => handleModeloChange(modelKey)}
                  className={`w-full p-4 rounded-2xl text-left font-bold transition-all border ${
                    selectedModelo === modelKey 
                      ? "bg-blue-50 border-blue-200 text-blue-700" 
                      : "bg-white border-slate-100 hover:border-slate-200 text-slate-600"
                  }`}
                >
                  {metadata[modelKey].verbose_name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Central: Filtros y Campos */}
        <div className="lg:col-span-3 space-y-6">
          {selectedModelo ? (
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <FiSettings className="text-slate-400" /> 
                  Configuración: {metadata[selectedModelo]?.verbose_name}
                </h2>
                <div className="flex gap-2">
                   <button 
                    onClick={generatePreview}
                    disabled={loading}
                    className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition"
                   >
                     {loading ? <FiRefreshCw className="animate-spin" /> : <FiBarChart2 />}
                     Previsualizar
                   </button>
                </div>
              </div>

              {/* Atributos */}
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">Campos a incluir</label>
                <div className="flex flex-wrap gap-2">
                  {metadata[selectedModelo]?.fields.map(field => (
                    <button
                      key={field.name}
                      onClick={() => toggleField(field.name)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedFields.includes(field.name)
                          ? "bg-blue-600 border-blue-600 text-white shadow-md"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {field.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtros Dinámicos */}
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">Filtros Activos</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.keys(filters).length === 0 ? (
                    <p className="text-sm text-slate-400 italic col-span-3">No hay filtros aplicados. Dicta uno para empezar.</p>
                  ) : (
                    Object.entries(filters).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <FiFilter className="text-blue-500" />
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">{key}</p>
                          <input 
                            type="text" 
                            value={value}
                            onChange={(e) => handleFilterChange(key, e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-700 outline-none w-full"
                          />
                        </div>
                        <button onClick={() => {
                          const newF = {...filters}; delete newF[key]; setFilters(newF);
                        }} className="text-slate-300 hover:text-red-500 transition">
                          <FiTrash2 />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Vista Previa de Tabla */}
              {reportData && (
                <div className="mt-8 border-t pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-slate-800">Vista Previa (Top 10)</h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => exportData('html')}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-blue-100 transition"
                      >
                        <FiGrid /> Exportar HTML
                      </button>
                      <button 
                        onClick={() => exportData('pdf')}
                        className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-red-100 transition"
                      >
                        <FiFileText /> Exportar PDF
                      </button>
                      <button 
                        onClick={() => exportData('excel')}
                        className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-emerald-100 transition"
                      >
                        <FiGrid /> Exportar Excel
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50">
                        <tr>
                          {selectedFields.map(f => (
                            <th key={f} className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase">
                              {metadata[selectedModelo].fields.find(field => field.name === f)?.label || f}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {reportData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition">
                            {selectedFields.map(f => (
                              <td key={f} className="px-4 py-3 text-xs text-slate-600 font-medium">
                                {String(row[f] ?? '-')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white h-[400px] rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 text-blue-500">
                <FiBarChart2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Inicie su reporte</h2>
              <p className="text-slate-400 font-medium max-w-md">
                Seleccione una fuente de datos a la izquierda o pulse el botón de micrófono y diga algo como 
                <span className="text-blue-600 block mt-2">"Reporte de clientes que ingresaron el mes pasado"</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
