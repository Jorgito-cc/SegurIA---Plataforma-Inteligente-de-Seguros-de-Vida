import { useState, useEffect } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { CrudTable } from '../../components/common/CrudTable';
import { notify } from '../../components/notifications/notify';
import { FiFolder, FiSearch, FiUploadCloud, FiCheckCircle, FiXCircle, FiX, FiFileText } from 'react-icons/fi';
import { useAuth } from '../../../application/context/AuthContext';
import { useForm } from 'react-hook-form';

export default function AgenteExpedientesPage() {
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [selectedExpediente, setSelectedExpediente] = useState(null);

  const fetchExpedientes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(ENDPOINTS.expedientes);
      setExpedientes(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching expedientes:', error);
      notify.error('Error al cargar expedientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpedientes();
  }, []);

  const handleValidar = async (id, isAprobado, observaciones) => {
    try {
      if (isAprobado) {
        await apiClient.post(`${ENDPOINTS.expedientes}${id}/validar/`);
      } else {
        await apiClient.post(`${ENDPOINTS.expedientes}${id}/rechazar/`, {
          motivo: observaciones
        });
      }
      notify.success(`Expediente ${isAprobado ? 'validado' : 'rechazado'}`);
      setShowValidateModal(false);
      fetchExpedientes();
    } catch (error) {
      notify.error(error.response?.data?.error || 'Error al evaluar el expediente');
    }
  };

  const columns = [
    { 
      key: 'id', 
      label: 'ID',
      render: (val) => <span className="font-mono text-xs font-bold text-slate-600">EXP-{val}</span>
    },
    { 
      key: 'cotizacion', 
      label: 'Cotización Base',
      render: (val) => val ? `COT-${val}` : 'N/A'
    },
    { 
      key: 'estado', 
      label: 'Validación',
      render: (_, item) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
          item.validado_por_analista ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {item.validado_por_analista ? 'Validado' : 'Pendiente'}
        </span>
      )
    },
    {
      key: 'documentos',
      label: 'Documentos',
      render: (_, item) => (
        <div className="flex gap-2">
          {item.ci_anverso_url && <a href={item.ci_anverso_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs">CI Anverso</a>}
          {item.ci_reverso_url && <a href={item.ci_reverso_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs">CI Reverso</a>}
          {item.domicilio_url && <a href={item.domicilio_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs">Domicilio</a>}
        </div>
      )
    }
  ];

  const filteredExpedientes = expedientes.filter(e => 
    e.id.toString().includes(searchTerm) || 
    (e.cotizacion && e.cotizacion.toString().includes(searchTerm))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <FiFolder className="text-blue-600" /> Expedientes KYC
          </h1>
          <p className="text-slate-500 font-medium">Gestión de documentación de clientes (KYC).</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black transition shadow-lg shadow-blue-200"
        >
          <FiUploadCloud /> Crear Expediente
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ID de expediente o cotización..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CrudTable
          columns={columns}
          data={filteredExpedientes}
          loading={loading}
          customActions={(item) => (
            <div className="flex gap-2">
              <button
                onClick={() => { setSelectedExpediente(item); setShowDocsModal(true); }}
                className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-200 transition"
                title="Ver Documentos"
              >
                <FiFileText size={18} />
              </button>
              <button
                onClick={() => { setSelectedExpediente(item); setShowUploadModal(true); }}
                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
                title="Cargar URLs"
              >
                <FiUploadCloud size={18} />
              </button>
              <button
                onClick={() => { setSelectedExpediente(item); setShowValidateModal(true); }}
                className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition"
                title="Evaluar Documentación"
              >
                <FiCheckCircle size={18} />
              </button>
            </div>
          )}
        />
      </div>

      {showCreateModal && (
        <CreateExpedienteModal 
          onClose={() => { setShowCreateModal(false); fetchExpedientes(); }} 
        />
      )}

      {showUploadModal && selectedExpediente && (
        <UploadDocsModal 
          expediente={selectedExpediente} 
          onClose={() => { setShowUploadModal(false); fetchExpedientes(); }} 
        />
      )}

      {showDocsModal && selectedExpediente && (
        <ViewDocsModal 
          expediente={selectedExpediente} 
          onClose={() => { setShowDocsModal(false); setSelectedExpediente(null); }} 
        />
      )}

      {showValidateModal && selectedExpediente && (
        <ValidateExpedienteModal 
          expediente={selectedExpediente}
          onClose={() => setShowValidateModal(false)}
          onEvaluar={handleValidar}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// Cloudinary Upload Helper
// ----------------------------------------------------
const uploadToCloudinary = async (file) => {
  const cloudName = 'dsxlwoyxt';
  const uploadPreset = 'smart_rescue';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Error al subir a Cloudinary');
  const data = await res.json();
  return data.secure_url;
};

// ----------------------------------------------------
// Modals Componentes Internos
// ----------------------------------------------------

function CreateExpedienteModal({ onClose }) {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [selectedCotizacion, setSelectedCotizacion] = useState('');
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState({ ci_anverso: null, ci_reverso: null, domicilio: null });

  useEffect(() => {
    const fetchCotizacionesAceptadas = async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.cotizaciones);
        let data = response.data.results || response.data;
        // Solo cotizaciones ACEPTADAS que aún NO tengan expediente creado
        data = data.filter(c => c.estado === 'ACEPTADA' && !c.expediente);
        setCotizaciones(data);
      } catch (error) {
        notify.error('Error al cargar cotizaciones');
      }
    };
    fetchCotizacionesAceptadas();
  }, []);

  const handleFileChange = (e, field) => {
    setFiles({ ...files, [field]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCotizacion || !files.ci_anverso || !files.ci_reverso || !files.domicilio) {
      return notify.error('Seleccione una cotización y adjunte todos los documentos requeridos.');
    }

    try {
      setUploading(true);
      notify.success('Subiendo documentos a Cloudinary, por favor espere...', { autoClose: 3000 });
      
      const ci_anverso_url = await uploadToCloudinary(files.ci_anverso);
      const ci_reverso_url = await uploadToCloudinary(files.ci_reverso);
      const domicilio_url = await uploadToCloudinary(files.domicilio);

      await apiClient.post(ENDPOINTS.expedientes, {
        cotizacion: selectedCotizacion,
        ci_anverso_url,
        ci_reverso_url,
        domicilio_url
      });
      
      notify.success('Expediente creado correctamente');
      onClose();
    } catch (error) {
      console.error(error);
      notify.error(error.response?.data?.error || 'Error al crear el expediente');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-6">
        <h2 className="text-xl font-black mb-1">Crear Nuevo Expediente</h2>
        <p className="text-xs text-slate-500 mb-4">Adjunte los documentos. Se subirán automáticamente a la nube.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Cotización Aceptada</label>
            <select 
              value={selectedCotizacion} 
              onChange={e => setSelectedCotizacion(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Seleccione Cotización --</option>
              {cotizaciones.map(c => (
                <option key={c.id} value={c.id}>COT-{c.id} - {c.cliente?.email} (${Number(c.capital_asegurado).toLocaleString()})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">CI Anverso (Imagen/PDF)</label>
            <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange(e, 'ci_anverso')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">CI Reverso (Imagen/PDF)</label>
            <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange(e, 'ci_reverso')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Comprobante Domicilio (Imagen/PDF)</label>
            <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange(e, 'domicilio')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl">Cancelar</button>
            <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
              {uploading ? 'Subiendo...' : 'Crear Expediente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UploadDocsModal({ expediente, onClose }) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState({ ci_anverso: null, ci_reverso: null, domicilio: null });

  const handleFileChange = (e, field) => {
    setFiles({ ...files, [field]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.ci_anverso && !files.ci_reverso && !files.domicilio) {
      return notify.error('Debe seleccionar al menos un documento para actualizar.');
    }

    try {
      setUploading(true);
      notify.success('Subiendo actualizaciones a Cloudinary...', { autoClose: 3000 });
      
      const payload = {};
      if (files.ci_anverso) payload.ci_anverso_url = await uploadToCloudinary(files.ci_anverso);
      if (files.ci_reverso) payload.ci_reverso_url = await uploadToCloudinary(files.ci_reverso);
      if (files.domicilio) payload.domicilio_url = await uploadToCloudinary(files.domicilio);

      await apiClient.patch(`${ENDPOINTS.expedientes}${expediente.id}/`, payload);
      notify.success('Documentos actualizados correctamente');
      onClose();
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data ? JSON.stringify(error.response.data) : 'Error al actualizar documentos';
      notify.error(errMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-6">
        <h2 className="text-xl font-black mb-1">Actualizar Documentos</h2>
        <p className="text-xs text-slate-500 mb-4">Seleccione solo los archivos que desea actualizar (se subirán a Cloudinary).</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nuevo CI Anverso</label>
            <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange(e, 'ci_anverso')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {expediente.ci_anverso_url && <a href={expediente.ci_anverso_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 mt-1 block hover:underline">Ver actual</a>}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nuevo CI Reverso</label>
            <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange(e, 'ci_reverso')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {expediente.ci_reverso_url && <a href={expediente.ci_reverso_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 mt-1 block hover:underline">Ver actual</a>}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Nuevo Comprobante Domicilio</label>
            <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange(e, 'domicilio')} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {expediente.domicilio_url && <a href={expediente.domicilio_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 mt-1 block hover:underline">Ver actual</a>}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl">Cancelar</button>
            <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
              {uploading ? 'Subiendo...' : 'Actualizar Documentos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Document Viewer Component
// ----------------------------------------------------
function DocumentViewer({ label, url }) {
  if (!url) return <div className="text-sm text-slate-400 italic p-4 bg-slate-50 rounded-xl border border-slate-100">No adjuntado</div>;
  const isPdf = url.toLowerCase().endsWith('.pdf');
  
  return (
    <div className="space-y-2">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center relative group min-h-[150px]">
        {isPdf ? (
          <div className="flex flex-col items-center p-6">
            <FiFileText size={40} className="text-red-500 mb-2" />
            <span className="text-sm font-bold text-slate-600">Documento PDF</span>
          </div>
        ) : (
          <img src={url} alt={label} className="w-full object-contain max-h-[300px]" />
        )}
        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <a href={url} target="_blank" rel="noreferrer" className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:scale-105 transition">
            Abrir en pestaña nueva
          </a>
        </div>
      </div>
    </div>
  );
}

function ViewDocsModal({ expediente, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Documentos del Expediente</h2>
            <p className="text-sm text-slate-500 mt-1">Cotización asociada: <span className="font-bold text-indigo-600">COT-{expediente.cotizacion}</span></p>
          </div>
          <button onClick={onClose} className="p-2 bg-white hover:bg-slate-100 text-slate-500 rounded-full transition shadow-sm border border-slate-200">
            <FiX size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DocumentViewer label="Carnet de Identidad (Anverso)" url={expediente.ci_anverso_url} />
            <DocumentViewer label="Carnet de Identidad (Reverso)" url={expediente.ci_reverso_url} />
            <div className="md:col-span-2">
              <DocumentViewer label="Comprobante de Domicilio" url={expediente.domicilio_url} />
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition shadow-md">
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>
  );
}

function ValidateExpedienteModal({ expediente, onEvaluar, onClose }) {
  const [observaciones, setObservaciones] = useState(expediente.observaciones_analista || '');
  const [decision, setDecision] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (decision === false && !observaciones) {
      return notify.error('Debe ingresar un motivo para el rechazo');
    }
    onEvaluar(expediente.id, decision, observaciones);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <div>
            <h2 className="text-2xl font-black text-indigo-900 flex items-center gap-2">
              <FiCheckCircle className="text-indigo-600" /> Evaluación KYC
            </h2>
            <p className="text-sm text-slate-500 mt-1">Revisión de documentos del expediente <span className="font-bold text-indigo-600">EXP-{expediente.id}</span></p>
          </div>
          <button onClick={onClose} className="p-2 bg-white hover:bg-slate-100 text-slate-500 rounded-full transition shadow-sm border border-slate-200">
            <FiX size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8 bg-slate-50/30">
          {/* Document Section */}
          <div className="flex-1 space-y-6">
            <h3 className="text-lg font-black text-slate-800 border-b border-slate-200 pb-2">Documentos Adjuntos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DocumentViewer label="CI Anverso" url={expediente.ci_anverso_url} />
              <DocumentViewer label="CI Reverso" url={expediente.ci_reverso_url} />
              <div className="md:col-span-2">
                <DocumentViewer label="Comprobante de Domicilio" url={expediente.domicilio_url} />
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="w-full lg:w-[350px] flex flex-col gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 mb-4">Resolución</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col gap-3">
                  <label className={`cursor-pointer flex items-center gap-3 p-4 rounded-xl border-2 transition ${decision === true ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-200'}`}>
                    <input type="radio" name="decision" checked={decision === true} onChange={() => setDecision(true)} className="w-5 h-5 text-green-600 accent-green-600" />
                    <div>
                      <span className="block font-bold text-slate-800">Aprobar Documentación</span>
                      <span className="block text-xs text-slate-500">Los documentos son válidos y legibles.</span>
                    </div>
                  </label>
                  
                  <label className={`cursor-pointer flex items-center gap-3 p-4 rounded-xl border-2 transition ${decision === false ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-red-200'}`}>
                    <input type="radio" name="decision" checked={decision === false} onChange={() => setDecision(false)} className="w-5 h-5 text-red-600 accent-red-600" />
                    <div>
                      <span className="block font-bold text-slate-800">Rechazar Documentación</span>
                      <span className="block text-xs text-slate-500">Hay problemas con los documentos.</span>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Observaciones / Motivo (Obligatorio si rechaza)</label>
                  <textarea 
                    rows="3" 
                    value={observaciones} 
                    onChange={e => setObservaciones(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                    placeholder="Escriba aquí los detalles..."
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={decision === null}
                    className={`w-full py-3.5 rounded-xl font-black text-white transition shadow-lg ${
                      decision === null ? 'bg-slate-300 cursor-not-allowed' :
                      decision === true ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 
                      'bg-red-600 hover:bg-red-700 shadow-red-200'
                    }`}
                  >
                    Confirmar Decisión
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}