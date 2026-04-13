import { useState, useCallback, useEffect } from 'react';

/**
 * Hook CRUD reutilizable para gestionar listas de entidades
 * @param {Object} repository - Repositorio con métodos list, create, update, delete
 * @param {Number} pageSize - Tamaño de página por defecto
 */
export function useCrudManager(repository, pageSize = 20) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const mapCrudError = useCallback((err, fallbackMessage) => {
    if (err?.status === 401) return 'Sesion vencida. Vuelve a iniciar sesion.';
    if (err?.status === 403) return 'No tienes permisos para esta operacion.';
    if (err?.status === 405) return 'Metodo no permitido en el endpoint consumido.';
    return err?.message || fallbackMessage;
  }, []);

  // Cargar lista
  const loadItems = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await repository.list(page, pageSize);
      const itemsArray = result.results || result;
      setItems(itemsArray);
      setTotalCount(result.count || result.length);
      setCurrentPage(page);
    } catch (err) {
      setError(mapCrudError(err, 'Error cargando datos'));
    } finally {
      setLoading(false);
    }
  }, [repository, pageSize, mapCrudError]);

  // Cargar al montar
  useEffect(() => {
    loadItems(1);
  }, [loadItems]);

  // Crear
  const handleCreate = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      await repository.create(payload);
      await loadItems(1);
      setShowForm(false);
      return true;
    } catch (err) {
      setError(mapCrudError(err, 'Error creando registro'));
      return false;
    } finally {
      setLoading(false);
    }
  }, [repository, loadItems, mapCrudError]);

  // Actualizar
  const handleUpdate = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 [useCrudManager.handleUpdate] ============');
      console.log('🔄 ID a actualizar:', id, '(tipo:', typeof id, ')');
      console.log('📦 Payload enviado:', JSON.stringify(payload, null, 2));
      
      // Llamar al backend
      const updatedItem = await repository.update(id, payload);
      console.log('✅ [useCrudManager] Respuesta del backend:', updatedItem);
      
      // Recargar la lista completa para asegurar sincronización (desde página 1)
      console.log('🔄 [useCrudManager] Recargando lista desde página 1');
      await loadItems(1);
      console.log('✅ [useCrudManager] Lista recargada');
      
      setEditingId(null);
      console.log('✅ [useCrudManager] handleUpdate completado');
      return true;
    } catch (err) {
      console.error('❌ [useCrudManager] Error completo:', err);
      console.error('❌ Status:', err?.response?.status);
      console.error('❌ Data:', err?.response?.data);
      console.error('❌ Message:', err?.message);
      setError(mapCrudError(err, 'Error actualizando registro'));
      return false;
    } finally {
      setLoading(false);
    }
  }, [repository, loadItems, mapCrudError]);

  // Eliminar
  const handleDeleteClick = useCallback((id) => {
    setDeleteConfirm({ open: true, id });
  }, []);

  const handleDeleteConfirm = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await repository.delete(id);
      await loadItems(currentPage);
      setDeleteConfirm({ open: false, id: null });
      return true;
    } catch (err) {
      setError(mapCrudError(err, 'Error eliminando registro'));
      return false;
    } finally {
      setLoading(false);
    }
  }, [repository, currentPage, loadItems, mapCrudError]);

  return {
    items,
    loading,
    error,
    currentPage,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    editingId,
    showForm,
    deleteConfirm,
    setEditingId,
    setShowForm,
    setDeleteConfirm,
    loadItems,
    handleCreate,
    handleUpdate,
    handleDeleteClick,
    handleDeleteConfirm,
  };
}
