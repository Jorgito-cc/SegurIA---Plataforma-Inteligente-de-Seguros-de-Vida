import { useState, useEffect } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { notify } from '../../components/notifications/notify';
import { FiDollarSign, FiSearch, FiFileText, FiUser, FiActivity, FiArrowRight, FiX } from 'react-icons/fi';

export default function AgentePagosPage() {
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Detalle del cliente seleccionado
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [pagosCliente, setPagosCliente] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Cargar lista de clientes
  const fetchClientes = async () => {
    try {
      setLoadingClientes(true);
      const response = await apiClient.get(ENDPOINTS.clientes);
      setClientes(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching clientes:', error);
      notify.error('No se pudo cargar la lista de clientes');
    } finally {
      setLoadingClientes(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Cargar historial de pagos de un cliente
  const handleVerHistorial = async (cliente) => {
    setSelectedCliente(cliente);
    setShowModal(true);
    try {
      setLoadingPagos(true);
      const response = await apiClient.get(`${ENDPOINTS.pagos}?cliente=${cliente.id}`);
      setPagosCliente(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching pagos:', error);
      notify.error('No se pudo cargar el historial de pagos');
    } finally {
      setLoadingPagos(false);
    }
  };

  // Descargar el PDF del comprobante de pago
  const handleDescargarComprobante = async (pagoId, nroComprobante) => {
    try {
      notify.info('Generando comprobante...');
      const response = await apiClient.get(`${ENDPOINTS.pagos}${pagoId}/comprobante/`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `comprobante_${nroComprobante || pagoId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify.success('Comprobante descargado');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      notify.error('No se pudo descargar el comprobante');
    }
  };

  // Filtrar clientes por búsqueda
  const filteredClientes = clientes.filter(c => {
    const fullSearch = `${c.first_name || ''} ${c.last_name || ''} ${c.email || ''} ${c.ci || ''}`.toLowerCase();
    return fullSearch.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <FiDollarSign className="text-indigo-600" /> Control de Pagos
          </h1>
          <p className="text-slate-500">Visualiza clientes y controla el historial de pagos registrados en el sistema.</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre, email o cédula..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="p-4 pl-6">Cliente</th>
                <th className="p-4">Identificación</th>
                <th className="p-4">Contacto</th>
                <th className="p-4">Profesión</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loadingClientes ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    Cargando clientes...
                  </td>
                </tr>
              ) : filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400">
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              ) : (
                filteredClientes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 pl-6 font-bold text-slate-800">
                      {c.first_name} {c.last_name}
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        C.I. {c.ci || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-slate-600 text-xs">{c.email}</span>
                        <span className="text-slate-400 text-xs">{c.telefono || 'Sin teléfono'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">{c.profesion_oficio || 'No especificada'}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleVerHistorial(c)}
                        className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition px-3.5 py-2 rounded-xl font-bold border border-indigo-100"
                      >
                        Ver Pagos <FiArrowRight />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Historial de Pagos */}
      {showModal && selectedCliente && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
            {/* Header del modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <FiUser className="text-indigo-600" /> Pagos de {selectedCliente.first_name} {selectedCliente.last_name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">C.I.: {selectedCliente.ci || 'N/A'} | Correo: {selectedCliente.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setPagosCliente([]);
                }}
                className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {loadingPagos ? (
                <div className="py-12 text-center text-slate-400">Cargando pagos...</div>
              ) : pagosCliente.length === 0 ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <FiActivity size={32} className="text-slate-300" />
                  <span>Este cliente no tiene pagos registrados en el sistema.</span>
                </div>
              ) : (
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                        <th className="p-4 pl-6">Póliza</th>
                        <th className="p-4">Método</th>
                        <th className="p-4">Comprobante</th>
                        <th className="p-4">Monto</th>
                        <th className="p-4">Fecha</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 text-center">PDF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {pagosCliente.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 pl-6 font-semibold text-slate-800">
                            {p.poliza_nro || p.poliza?.numero_poliza || 'N/A'}
                          </td>
                          <td className="p-4">
                            <span className="capitalize">{p.metodo_pago?.toLowerCase()}</span>
                          </td>
                          <td className="p-4 text-slate-500 font-mono select-all">
                            {p.nro_comprobante || 'N/A'}
                          </td>
                          <td className="p-4 font-bold text-slate-900">
                            {p.monto} Bs
                          </td>
                          <td className="p-4 text-slate-400">
                            {new Date(p.fecha_pago).toLocaleDateString()} {new Date(p.fecha_pago).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full font-bold ${
                              p.estado === 'COMPLETADO' ? 'bg-green-100 text-green-700' :
                              p.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {p.estado}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {p.estado === 'COMPLETADO' && (
                              <button
                                onClick={() => handleDescargarComprobante(p.id, p.nro_comprobante)}
                                className="p-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-500 transition"
                                title="Descargar Comprobante PDF"
                              >
                                <FiFileText size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setPagosCliente([]);
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-6 py-2 rounded-xl transition text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
