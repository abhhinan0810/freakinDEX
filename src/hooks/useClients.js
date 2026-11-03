import { useState, useEffect, useCallback } from 'react';
import { clientService } from '../services/clientService';
import { useAuth } from './useAuth';

export function useClients() {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async () => {
    if (!currentUser) {
      setClients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await clientService.getClients(currentUser.uid);
      setClients(data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
      setError(err.message || 'Failed to load client directory.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    refreshClients: fetchClients,
    totalCount: clients.length,
  };
}

