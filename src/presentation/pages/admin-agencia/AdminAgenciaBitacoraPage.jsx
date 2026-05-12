import { useState, useEffect } from "react";
import { bitacoraRepository } from "../../../infrastructure/repositories/bitacoraRepository";
import { notify } from "../../components/notifications/notify";
import { FiLock, FiUnlock, FiFilter } from "react-icons/fi";

export default function AdminAgenciaBitacoraPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    usuario: "",
    accion: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  const ADMIN_PASSWORD = "12345678"; // En producción, esto debería estar en el backend

  const handleUnlock = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsUnlocked(true);
      notify.success("Bitácora desbloqueada");
      setPassword("");
      cargarBitacora();
    } else {
      notify.error("Contraseña incorrecta");
      setPassword("");
    }
  };

  const cargarBitacora = async () => {
    try {
      setLoading(true);
      console.log("[Bitácora] Intentando cargar datos con filtros:", filters);
      const data = await bitacoraRepository.obtenerTodos(filters);
      console.log("[Bitácora] Datos cargados exitosamente:", data);
      setRecords(data);
      notify.success("Bitácora cargada correctamente");
    } catch (error) {
      console.error("[Bitácora] Error completo:", error);

      // Mejorar mensaje de error
      let errorMsg = "Error al cargar bitácora";

      if (error.status === 403) {
        errorMsg = "Acceso denegado: No tienes permisos para ver la bitácora";
      } else if (error.status === 401) {
        errorMsg = "Sesión expirada. Por favor, inicia sesión nuevamente";
      } else if (error.message) {
        errorMsg = error.message;
      }

      notify.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    cargarBitacora();
  };

  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 p-4 rounded-full">
                <FiLock size={32} className="text-red-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Bitácora Protegida
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Ingresa la contraseña para acceder al registro de auditoría
            </p>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa la contraseña"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
              >
                Desbloquear
              </button>
            </form>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Nota:</strong> Solo los administradores deben acceder
                a esta sección.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiUnlock className="text-green-600" /> Bitácora de Auditoría
          (Desbloqueada)
        </h2>
        <button
          onClick={() => setIsUnlocked(false)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
        >
          Bloquear
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiFilter /> Filtros
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={filters.usuario}
              onChange={(e) => handleFilterChange("usuario", e.target.value)}
              placeholder="Buscar usuario"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acción
            </label>
            <select
              value={filters.accion}
              onChange={(e) => handleFilterChange("accion", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              <option value="CREATE">Crear</option>
              <option value="UPDATE">Actualizar</option>
              <option value="DELETE">Eliminar</option>
              <option value="LOGIN">Login</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={filters.fecha_inicio}
              onChange={(e) =>
                handleFilterChange("fecha_inicio", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={filters.fecha_fin}
              onChange={(e) => handleFilterChange("fecha_fin", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleApplyFilters}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
        >
          Aplicar Filtros
        </button>
      </div>

      {/* Records Table */}
      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">
                  Acción
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">
                  Modelo
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">
                  ID Objeto
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No hay registros en la bitácora
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {new Date(record.creado_en).toLocaleString("es-ES")}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {record.usuario || "Sistema"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          record.accion === "CREATE"
                            ? "bg-green-100 text-green-800"
                            : record.accion === "UPDATE"
                              ? "bg-blue-100 text-blue-800"
                              : record.accion === "DELETE"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {record.accion}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{record.modelo}</td>
                    <td className="px-6 py-4">{record.id_objeto}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {record.detalles || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>ℹ️ Info:</strong> Los registros de bitácora se conservan por
          90 días.
        </p>
      </div>
    </div>
  );
}
