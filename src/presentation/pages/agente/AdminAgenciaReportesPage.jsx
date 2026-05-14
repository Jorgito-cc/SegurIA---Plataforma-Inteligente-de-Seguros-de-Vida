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
  FiTrash2
} from "react-icons/fi";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import apiClient from "../../../infrastructure/api/apiClient";
import { ENDPOINTS } from "../../../infrastructure/api/endpoints";

export default function AdminAgenciaReportesPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [selectedTables, setSelectedTables] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);

  // Diccionario de tablas y sus atributos
  const tableConfig = {
    usuarios: {
      label: "Usuarios",
      icon: "👤",
      attributes: [
        { id: "id", label: "ID" },
        { id: "email", label: "Email" },
        { id: "first_name", label: "Nombre" },
        { id: "last_name", label: "Apellido" },
        { id: "ci", label: "Documento" },
        { id: "telefono", label: "Teléfono" },
        { id: "is_active", label: "Estado" }
      ]
    },
    clientes: {
      label: "Clientes",
      icon: "👥",
      attributes: [
        { id: "id", label: "ID" },
        { id: "email", label: "Email" },
        { id: "ci", label: "CI" },
        { id: "profesion_oficio", label: "Profesión" },
        { id: "ingresos_mensuales", label: "Ingresos" }
      ]
    },
    polizas: {
      label: "Pólizas",
      icon: "📋",
      attributes: [
        { id: "numero_poliza", label: "Nro Póliza" },
        { id: "estado", label: "Estado" },
        { id: "fecha_vencimiento", label: "Vencimiento" },
        { id: "prima_final_facturada", label: "Prima" }
      ]
    },
    cotizaciones: {
      label: "Cotizaciones",
      icon: "💰",
      attributes: [
        { id: "id", label: "ID" },
        { id: "capital_asegurado", label: "Capital" },
        { id: "nivel_riesgo", label: "Riesgo" },
        { id: "estado", label: "Estado" },
        { id: "prima_ajustada_anual", label: "Prima Anual" }
      ]
    },
    ordenes_medicas: {
      label: "Órdenes Médicas",
      icon: "🏥",
      attributes: [
        { id: "id", label: "ID" },
        { id: "clinica_asignada", label: "Clínica" },
        { id: "estado", label: "Estado" },
        { id: "fecha_emision", label: "Fecha" }
      ]
    },
    bitacora: {
      label: "Bitácora",
      icon: "📊",
      attributes: [
        { id: "accion", label: "Acción" },
        { id: "modulo", label: "Módulo" },
        { id: "fecha", label: "Fecha" },
        { id: "descripcion", label: "Detalle" }
      ]
    }
  };

  const availableTables = Object.keys(tableConfig).map(key => ({
    id: key,
    ...tableConfig[key]
  }));

  // Inicializar Web Speech API con mejoras
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
        console.error("Speech Error:", event.error);
        if (event.error !== 'no-speech') notify.error(`Error de voz: ${event.error}`);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      recognitionRef.current?.start();
    }
  };

  const handleTableToggle = (tableId) => {
    setSelectedTables(prev => {
      const isSelected = prev.includes(tableId);
      if (isSelected) {
        const newTables = prev.filter(id => id !== tableId);
        const newAttrs = { ...selectedAttributes };
        delete newAttrs[tableId];
        setSelectedAttributes(newAttrs);
        return newTables;
      } else {
        // Al seleccionar, marcamos todos sus atributos por defecto
        setSelectedAttributes(prevAttrs => ({
          ...prevAttrs,
          [tableId]: tableConfig[tableId].attributes.map(a => a.id)
        }));
        return [...prev, tableId];
      }
    });
  };

  const handleAttributeToggle = (tableId, attrId) => {
    setSelectedAttributes(prev => {
      const attrs = prev[tableId] || [];
      const newAttrs = attrs.includes(attrId)
        ? attrs.filter(id => id !== attrId)
        : [...attrs, attrId];
      return { ...prev, [tableId]: newAttrs };
    });
  };

  const generateReportData = async () => {
    if (selectedTables.length === 0) return notify.error("Selecciona al menos una tabla");
    
    setLoading(true);
    try {
      // Simulación de datos basada en los atributos seleccionados
      const simulatedData = {};
      
      for (const tableId of selectedTables) {
        const rows = [];
        for (let i = 0; i < 10; i++) {
          const row = {};
          selectedAttributes[tableId].forEach(attr => {
            row[attr] = `${tableConfig[tableId].label} ${attr} ${i + 1}`;
          });
          rows.push(row);
        }
        simulatedData[tableId] = rows;
      }

      setReportData(simulatedData);
      notify.success("Datos de reporte preparados");
    } catch (error) {
      notify.error("Error al obtener datos del servidor");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!reportData) return;
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(20);
    doc.text("Reporte Inteligente SegurIA", 14, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, yPos);
    doc.text(`Filtros aplicados: ${transcript || "Ninguno"}`, 14, yPos + 5);
    yPos += 20;

    Object.keys(reportData).forEach((tableId) => {
      const headers = selectedAttributes[tableId].map(attrId => 
        tableConfig[tableId].attributes.find(a => a.id === attrId).label
      );
      const rows = reportData[tableId].map(row => Object.values(row));

      doc.setFontSize(14);
      doc.text(`Tabla: ${tableConfig[tableId].label}`, 14, yPos);
      
      doc.autoTable({
        startY: yPos + 5,
        head: [headers],
        body: rows,
        theme: 'striped',
        headStyles: { fillStyle: [30, 41, 59] }
      });
      
      yPos = doc.lastAutoTable.finalY + 20;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.save(`reporte_seguria_${Date.now()}.pdf`);
  };

  const exportExcel = () => {
    if (!reportData) return;
    const wb = XLSX.utils.book_new();

    Object.keys(reportData).forEach((tableId) => {
      const ws = XLSX.utils.json_to_sheet(reportData[tableId]);
      XLSX.utils.book_append_sheet(wb, ws, tableConfig[tableId].label);
    });

    XLSX.writeFile(wb, `reporte_seguria_${Date.now()}.xlsx`);
  };

  return (
    <div className="p-6 space-y-8 bg-slate-50/30 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FiBarChart2 className="text-blue-600" /> Generador de Reportes
          </h1>
          <p className="text-slate-500 font-medium">Usa comandos de voz y selección granular para reportes precisos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel de Control de Voz y Filtros */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-800">Comando de Voz</h3>
              {isListening && <span className="flex h-3 w-3 rounded-full bg-red-500 animate-ping"></span>}
            </div>
            
            <button
              onClick={toggleListening}
              className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${
                isListening 
                  ? "bg-red-500 text-white shadow-lg shadow-red-200" 
                  : "bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-200"
              }`}
            >
              {isListening ? <FiMicOff size={22} /> : <FiMic size={22} />}
              {isListening ? "Detener Escucha" : "Activar Micrófono"}
            </button>

            <div className="mt-6">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Intención Detectada</label>
              <div className="min-h-[100px] p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 italic">
                {transcript || "Diga algo como: 'Reporte de pólizas activas'"}
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-100">
            <h4 className="font-black mb-2">Instrucciones</h4>
            <p className="text-sm text-blue-100 leading-relaxed opacity-80">
              Seleccione las tablas de origen y marque los atributos específicos que desea incluir. Use el comando de voz para aplicar filtros semánticos.
            </p>
          </div>
        </div>

        {/* Selección de Datos */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-6">Configuración de Reporte</h3>
            
            <div className="space-y-8">
              {/* Tablas */}
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">Tablas Disponibles</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableTables.map(table => (
                    <button
                      key={table.id}
                      onClick={() => handleTableToggle(table.id)}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                        selectedTables.includes(table.id)
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-100 bg-white hover:border-slate-200 text-slate-500"
                      }`}
                    >
                      <span className="text-xl">{table.icon}</span>
                      <span className="text-xs font-black">{table.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Atributos */}
              {selectedTables.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">Atributos por Tabla</span>
                  <div className="space-y-4">
                    {selectedTables.map(tableId => (
                      <div key={tableId} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{tableConfig[tableId].icon}</span>
                          <span className="text-sm font-black text-slate-700">{tableConfig[tableId].label}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tableConfig[tableId].attributes.map(attr => (
                            <button
                              key={attr.id}
                              onClick={() => handleAttributeToggle(tableId, attr.id)}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                                (selectedAttributes[tableId] || []).includes(attr.id)
                                  ? "bg-blue-600 text-white"
                                  : "bg-white text-slate-400 border border-slate-100 hover:border-slate-200"
                              }`}
                            >
                              {attr.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón de Generación */}
              <div className="pt-4 border-t border-slate-50">
                <button
                  onClick={generateReportData}
                  disabled={loading || selectedTables.length === 0}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-emerald-600 transition flex items-center justify-center gap-3 shadow-xl shadow-slate-200 disabled:opacity-50"
                >
                  {loading ? <FiRefreshCw className="animate-spin" /> : <FiBarChart2 />}
                  Preparar Datos de Reporte
                </button>
              </div>
            </div>
          </div>

          {/* Resultados y Exportación */}
          {reportData && (
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-emerald-100 animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-500" /> Vista Previa Lista
                  </h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">
                    {Object.keys(reportData).length} tablas procesadas correctamente.
                  </p>
                </div>
                <button 
                  onClick={() => setReportData(null)}
                  className="p-2 text-slate-300 hover:text-red-500 transition"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={exportPDF}
                  className="p-6 rounded-3xl bg-red-50 border border-red-100 hover:bg-red-100 transition flex flex-col items-center gap-3 group"
                >
                  <FiFileText size={32} className="text-red-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-black text-red-700">Exportar como PDF</span>
                </button>
                <button
                  onClick={exportExcel}
                  className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition flex flex-col items-center gap-3 group"
                >
                  <FiGrid size={32} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-black text-emerald-700">Exportar como Excel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
