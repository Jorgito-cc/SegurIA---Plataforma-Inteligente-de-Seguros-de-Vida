import { useEffect, useState } from 'react';
import apiClient from '../../../infrastructure/api/apiClient';
import { ENDPOINTS } from '../../../infrastructure/api/endpoints';
import { notify } from '../../components/notifications/notify';

export default function AdminAgentesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(ENDPOINTS.agentes);
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      notify.error(e.message || 'No se pudo cargar agentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p>Cargando agentes...</p>;

  return (
    <div>
      <h1 className='text-2xl font-black text-slate-900'>Gestion de agentes</h1>
      <div className='mt-4 overflow-x-auto rounded-xl border'>
        <table className='min-w-full text-sm'>
          <thead className='bg-slate-50'>
            <tr>
              <th className='px-3 py-2 text-left'>Nombre</th>
              <th className='px-3 py-2 text-left'>Email</th>
              <th className='px-3 py-2 text-left'>Licencia</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className='border-t'>
                <td className='px-3 py-2'>{a.nombre_completo || a.username}</td>
                <td className='px-3 py-2'>{a.email}</td>
                <td className='px-3 py-2'>{a.codigo_licencia || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}