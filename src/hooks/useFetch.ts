import { useCallback, useState, useEffect } from 'react';
import { ApiResponse } from '../types';
export function useFetch<T>(
  fetchFunction: () => Promise<{ data: T | null; error: any }>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await fetchFunction();
      if (error) {
        setError(error);
      } else {
        setData(data);
      }
      return { data, error };
    } catch (err) {
      setError(err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  return { data, loading, error, execute, setData, setError };
}

/**
 * Hook để gọi API mutation (POST, PUT, DELETE)
 */
export function useMutation<T>(
  mutationFunction: (payload?: any) => Promise<{ data: T | null; error: any }>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = useCallback(
    async (payload?: any) => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await mutationFunction(payload);
        if (error) {
          setError(error);
        } else {
          setData(data);
        }
        return { data, error };
      } catch (err) {
        setError(err);
        return { data: null, error: err };
      } finally {
        setLoading(false);
      }
    },
    [mutationFunction]
  );

  return { data, loading, error, mutate, setData, setError };
}

/**
 * Hook để quản lý async operations (loading, error, data)
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const execute = useCallback(async () => {
    setState({ data: null, error: null, loading: true });
    try {
      const response = await asyncFunction();
      setState({ data: response, error: null, loading: false });
      return response;
    } catch (error: any) {
      setState({
        data: null,
        error: {
          message: error.message || 'An error occurred',
          status: error.status || 500,
        },
        loading: false,
      });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}
