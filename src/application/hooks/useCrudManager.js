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

  const normalizeValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value).trim();
  };

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
      const previousItem = items.find((item) => item.id === id);
      const payloadKeys = Object.keys(payload || {}).filter((key) => key !== 'password');
      const changedKeys = previousItem
        ? payloadKeys.filter(
            (key) => normalizeValue(previousItem[key]) !== normalizeValue(payload[key])
          )
        : payloadKeys;

      const updatedItem = await repository.update(id, payload);

      let syncedItem = updatedItem;
      if (typeof repository.getById === 'function') {
        try {
          syncedItem = await repository.getById(id);
        } catch {
          // Si falla el GET puntual, mantenemos la respuesta del PATCH.
        }
      }

      if (changedKeys.length > 0 && syncedItem) {
        const nonPersistedKeys = changedKeys.filter(
          (key) => normalizeValue(syncedItem[key]) !== normalizeValue(payload[key])
        );

        if (nonPersistedKeys.length === changedKeys.length) {
          throw new Error('El servidor no aplico los cambios enviados. Verifica permisos o campos editables.');
        }
      }

      // Reflejar de inmediato en UI para evitar listas visualmente desfasadas.
      if (syncedItem && syncedItem.id != null) {
        setItems((prevItems) =>
          prevItems.map((item) => (item.id === id ? { ...item, ...payload, ...syncedItem } : item))
        );
      }

      setEditingId(null);

      // Sincroniza con backend para reflejar cambios externos (ej. Postman).
      await loadItems(currentPage);

      return true;
    } catch (err) {
      setError(err.message || 'Error actualizando registro');
      return false;
    } finally {
      setLoading(false);
    }
  }, [repository, loadItems, currentPage, items]);

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
