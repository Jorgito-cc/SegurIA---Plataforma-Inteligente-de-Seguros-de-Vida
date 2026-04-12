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

  // Cargar lista
  const loadItems = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[loadItems] Fetching page ${page} with pageSize ${pageSize}`);
      const result = await repository.list(page, pageSize);
      console.log(`[loadItems] Got result:`, result);
      const itemsArray = result.results || result;
      console.log(`[loadItems] Setting items array:`, itemsArray);
      setItems(itemsArray);
      setTotalCount(result.count || result.length);
      setCurrentPage(page);
      console.log(`[loadItems] Items state updated`);
    } catch (err) {
      console.error(`[loadItems] Error:`, err);
      setError(err.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, [repository, pageSize]);

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
      setError(err.message || 'Error creando registro');
      return false;
    } finally {
      setLoading(false);
    }
  }, [repository, loadItems]);

  // Actualizar
  const handleUpdate = useCallback(async (id, payload) => {
    console.log(`[handleUpdate] Starting update for id=${id} with payload:`, payload);
    setLoading(true);
    setError(null);
    try {
      console.log(`[handleUpdate] Calling repository.update(${id}, ...)`);
      const updateResult = await repository.update(id, payload);
      console.log(`[handleUpdate] Update response:`, updateResult);
      
      console.log(`[handleUpdate] Now calling loadItems(${currentPage})`);
      await loadItems(currentPage);
      console.log(`[handleUpdate] loadItems returned, setting editingId to null`);
      
      setEditingId(null);
      console.log(`[handleUpdate] Update completed successfully`);
      return true;
    } catch (err) {
      console.error(`[handleUpdate] Error:`, err);
      setError(err.message || 'Error actualizando registro');
      return false;
    } finally {
      setLoading(false);
    }
  }, [repository, currentPage, loadItems]);

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
      setError(err.message || 'Error eliminando registro');
      return false;
    } finally {
      setLoading(false);
    }
  }, [repository, currentPage, loadItems]);

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
