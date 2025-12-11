import { useState, useEffect, useCallback } from 'react';
import { useSharePointAuth } from '@/contexts/SharePointAuthContext';

interface UseSharePointDataOptions {
  listName: string;
  select?: string;
  filter?: string;
  orderBy?: string;
  autoLoad?: boolean;
}

interface UseSharePointDataResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (item: Partial<T>) => Promise<T>;
  update: (id: string, item: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

export function useSharePointData<T = any>(
  service: any,
  options: UseSharePointDataOptions
): UseSharePointDataResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSharePointAuth();

  const fetchData = useCallback(async () => {
    if (!user || !service) return;

    setLoading(true);
    setError(null);

    try {
      const result = await service.getItems(
        options.listName,
        options.select,
        options.filter,
        options.orderBy
      );
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      console.error(`Error fetching data from ${options.listName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [service, options.listName, options.select, options.filter, options.orderBy, user]);

  const create = useCallback(async (item: Partial<T>): Promise<T> => {
    if (!service) throw new Error('Service not available');

    try {
      const result = await service.createItem(options.listName, item);
      await fetchData(); // Refresh data
      return result;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear elemento');
    }
  }, [service, options.listName, fetchData]);

  const update = useCallback(async (id: string, item: Partial<T>): Promise<T> => {
    if (!service) throw new Error('Service not available');

    try {
      const result = await service.updateItem(options.listName, id, item);
      await fetchData(); // Refresh data
      return result;
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar elemento');
    }
  }, [service, options.listName, fetchData]);

  const remove = useCallback(async (id: string): Promise<void> => {
    if (!service) throw new Error('Service not available');

    try {
      await service.deleteItem(options.listName, id);
      await fetchData(); // Refresh data
    } catch (err: any) {
      throw new Error(err.message || 'Error al eliminar elemento');
    }
  }, [service, options.listName, fetchData]);

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchData();
    }
  }, [fetchData, options.autoLoad]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create,
    update,
    remove
  };
}