import { useState, useRef, useEffect } from "react";
import { notify } from "../../components/notifications/notify";
import { FiMic, FiMicOff, FiBarChart2, FiDownload } from "react-icons/fi";

export default function AdminAgenciaReportesPage() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [selectedTables, setSelectedTables] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);

  // Lista de tablas disponibles en el backend
  const availableTables = [
    { id: "usuarios", label: "Usuarios", icon: "👤" },
    { id: "clientes", label: "Clientes", icon: "👥" },
    { id: "polizas", label: "Pólizas", icon: "📋" },
    { id: "cotizaciones", label: "Cotizaciones", icon: "💰" },
    { id: "ordenes_medicas", label: "Órdenes Médicas", icon: "🏥" },
    { id: "comisiones", label: "Comisiones", icon: "💵" },
    { id: "bitacora", label: "Bitácora", icon: "📊" },
  ];

  // Inicializar Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "es-ES";
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + transcript + " ");
          } else {
            interimTranscript += transcript;
          }
        }
        if (interimTranscript) {
          setTranscript(
            (prev) =>
              prev.split(" ").slice(0, -1).join(" ") + " " + interimTranscript,
          );
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        notify.error(`Error: ${event.error}`);
        setIsListening(false);
      };
    } else {
      notify.error("Tu navegador no soporta reconocimiento de voz");
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleTableToggle = (tableId) => {
    setSelectedTables((prev) =>
      prev.includes(tableId)
        ? prev.filter((id) => id !== tableId)
        : [...prev, tableId],
    );
  };

  const generateReport = async () => {
    if (selectedTables.length === 0) {
      notify.error("Selecciona al menos una tabla");
      return;
    }

    try {
      setLoading(true);
      // Simular generación de reporte (en producción, llamaría al backend)
      // const data = await reporteRepository.generarReporte({
      //   tablas: selectedTables,
      //   filtros: transcript,
      // });

      // Por ahora, mostrar datos simulados
      setReportData({
        timestamp: new Date().toLocaleString("es-ES"),
        tables: selectedTables,
        filtros: transcript || "Sin filtros",
        rows: Math.floor(Math.random() * 1000) + 100,
      });

      notify.success("Reporte generado");
    } catch (error) {
      notify.error("Error al generar reporte");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) return;

    const csvContent = `
REPORTE GENERADO
${new Date().toLocaleString("es-ES")}

Tablas: ${reportData.tables.join(", ")}
Filtros: ${reportData.filtros}
Total de filas: ${reportData.rows}

Instrucción de voz: "${transcript}"
    `.trim();

    const blob = new Blob([csvContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte-${Date.now()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <FiBarChart2 /> Generador de Reportes (Con Comando de Voz)
      </h2>

      {/* Voice Command Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiMic /> Comando de Voz
        </h3>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={startListening}
              disabled={isListening}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition font-semibold"
            >
              <FiMic size={20} /> Iniciar Grabación
            </button>
            <button
              onClick={stopListening}
              disabled={!isListening}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition font-semibold"
            >
              <FiMicOff size={20} /> Detener
            </button>
          </div>

          {isListening && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                Escuchando...
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transcripción
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="La transcripción de voz aparecerá aquí... Puedes editar manualmente también"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows="4"
            />
          </div>

          <p className="text-xs text-gray-500">
            💡 Ejemplo: "Mostrar reportes de usuarios activos en mayo" o "Listar
            todas las comisiones del mes"
          </p>
        </div>
      </div>

      {/* Table Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Selecciona Tablas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {availableTables.map((table) => (
            <button
              key={table.id}
              onClick={() => handleTableToggle(table.id)}
              className={`p-4 rounded-lg border-2 transition flex items-center gap-2 ${
                selectedTables.includes(table.id)
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedTables.includes(table.id)}
                onChange={() => {}}
                className="w-5 h-5 rounded cursor-pointer"
              />
              <div className="text-left flex-1">
                <p className="text-sm font-semibold">{table.label}</p>
              </div>
              <span className="text-xl">{table.icon}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={generateReport}
            disabled={loading || selectedTables.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition font-semibold"
          >
            {loading ? "Generando..." : "Generar Reporte"}
          </button>

          <button
            onClick={() => {
              setSelectedTables([]);
              setTranscript("");
              setReportData(null);
            }}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg transition font-semibold"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            ✓ Reporte Generado
          </h3>

          <div className="space-y-2 text-sm mb-4">
            <p>
              <strong>Fecha:</strong> {reportData.timestamp}
            </p>
            <p>
              <strong>Tablas:</strong> {reportData.tables.join(", ")}
            </p>
            <p>
              <strong>Filtros (voz):</strong> {reportData.filtros}
            </p>
            <p>
              <strong>Filas encontradas:</strong> {reportData.rows}
            </p>
          </div>

          <button
            onClick={downloadReport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition font-semibold"
          >
            <FiDownload /> Descargar Reporte
          </button>
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p>
          <strong>ℹ️ Cómo funciona:</strong> Habilita el micrófono, usa comandos
          de voz para describir qué datos quieres, selecciona las tablas y
          genera el reporte. Los datos se descargarán en formato que puedas
          abrir en Excel o cualquier editor.
        </p>
      </div>
    </div>
  );
}
