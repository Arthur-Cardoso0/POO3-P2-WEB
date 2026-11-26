import { useEffect, useState } from 'react';

export function useDebounce<T>(valor: T, atrasoMs = 400): T {
  const [debounced, setDebounced] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(valor), atrasoMs);
    return () => clearTimeout(t);
  }, [valor, atrasoMs]);
  return debounced;
}
