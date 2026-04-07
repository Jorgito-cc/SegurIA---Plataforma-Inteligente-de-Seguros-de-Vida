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

  // Cargar lista
  const loadItems = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await repository.list(page, pageSize);
      setItems(result.results || result);
      setTotalCount(result.count || result.length);
      setCurrentPage(page);
    } catch (err) {
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
    setLoading(true);
    setError(null);
    try {
      await repository.update(id, payload);
      await loadItems(currentPage);
      setEditingId(null);
      return true;
    } catch (err) {
      setError(err.message || 'Error actualizando registro');
      return false;
    } finally {
      setLoading(false);
    }
  }, [repository, currentPage, loadItems]);

  // Eliminar
  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este registro?')) return;
    setLoading(true);
    setError(null);
    try {
      await repository.delete(id);
      await loadItems(currentPage);
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
    setEditingId,
    setShowForm,
    loadItems,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
