import { useState, useEffect } from 'react';
import api from '../api';

export default function useData(url) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setError(null);
    api.get(url)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}
