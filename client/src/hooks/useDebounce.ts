import { useState, useEffect } from 'react';

/**
 * Hook que debounce um valor
 * 
 * Útil para evitar chamadas repetidas a funções caras, como 
 * filtragem, ordenação ou chamadas de API durante digitação.
 * 
 * @param value O valor a ser debounced
 * @param delay Tempo de espera em ms
 * @returns O valor após o tempo de debounce
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    // Configurar timer para atualizar o valor
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Limpar timer em caso de mudança no valor ou desmontagem do componente
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}