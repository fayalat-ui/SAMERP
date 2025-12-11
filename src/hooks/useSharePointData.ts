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

interface SharePointService {
  getItems: (listName: string, select?: string, filter?: string, orderBy?: string) => Promise<unknown[]>;
  createItem: (listName: string, item: Record<string, unknown>) => Promise<unknown>;
  updateItem: (listName: string, id: string, item: Record<string, unknown>) => Promise<unknown>;
  deleteItem: (listName: string, id: string) => Promise<void>;
}

export function useSharePointData<T = Record<string, unknown>>(
  service: SharePointService,
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
      setData(result as T[]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(errorMessage);
      console.error(`Error fetching data from ${options.listName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [service, options.listName, options.select, options.filter, options.orderBy, user]);

  const create = useCallback(async (item: Partial<T>): Promise<T> => {
    if (!service) throw new Error('Service not available');

    try {
      const result = await service.createItem(options.listName, item as Record<string, unknown>);
      await fetchData(); // Refresh data
      return result as T;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear elemento';
      throw new Error(errorMessage);
    }
  }, [service, options.listName, fetchData]);

  const update = useCallback(async (id: string, item: Partial<T>): Promise<T> => {
    if (!service) throw new Error('Service not available');

    try {
      const result = await service.updateItem(options.listName, id, item as Record<string, unknown>);
      await fetchData(); // Refresh data
      return result as T;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar elemento';
      throw new Error(errorMessage);
    }
  }, [service, options.listName, fetchData]);

  const remove = useCallback(async (id: string): Promise<void> => {
    if (!service) throw new Error('Service not available');

    try {
      await service.deleteItem(options.listName, id);
      await fetchData(); // Refresh data
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar elemento';
      throw new Error(errorMessage);
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