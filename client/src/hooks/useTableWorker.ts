import { useEffect, useState, useRef } from 'react';

interface TableWorkerOptions {
  sortField: string;
  sortDirection: string;
  searchTerm: string;
  statusFilter: string;
}

interface ProcessResult {
  data: any[];
  count: number;
  processingTime: number;
}

/**
 * Hook para utilizar um Web Worker para processar dados de tabela
 * 
 * Este hook gerencia o ciclo de vida do worker e permite processar grandes
 * volumes de dados fora da thread principal, melhorando a performance da UI.
 */
export function useTableWorker() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const workerRef = useRef<Worker | null>(null);
  
  // Inicializar o worker
  useEffect(() => {
    try {
      // Tentar criar o worker apenas no lado do cliente
      if (typeof window !== 'undefined') {
        console.log('Inicializando Table Worker...');
        
        // Criar o worker
        const worker = new Worker(new URL('../workers/table-worker.js', import.meta.url), { type: 'module' });
        
        // Configurar o handler de mensagens
        worker.onmessage = (event) => {
          const { action, result, error } = event.data;
          
          switch (action) {
            case 'initialized':
              console.log('Worker inicializado com sucesso');
              setIsLoading(false);
              break;
              
            case 'processed':
              console.log(`Worker processou dados em ${result.processingTime.toFixed(2)}ms`);
              setResult(result);
              setIsLoading(false);
              break;
              
            case 'error':
              console.error('Erro no worker:', error);
              setError(new Error(error));
              setIsLoading(false);
              break;
          }
        };
        
        // Configurar o handler de erros
        worker.onerror = (error) => {
          console.error('Erro ao executar o worker:', error);
          setError(new Error('Erro ao executar o worker: ' + error.message));
          setIsLoading(false);
        };
        
        // Salvar a referência ao worker
        workerRef.current = worker;
        
        // Cleanup ao desmontar o componente
        return () => {
          console.log('Terminando Table Worker...');
          worker.terminate();
          workerRef.current = null;
        };
      }
    } catch (error) {
      console.error('Erro ao criar o worker:', error);
      setError(error instanceof Error ? error : new Error('Erro desconhecido ao criar o worker'));
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Função para processar os dados usando o worker
   */
  const processData = async (data: any[], options: TableWorkerOptions) => {
    if (!workerRef.current) {
      throw new Error('Worker não inicializado');
    }
    
    setIsLoading(true);
    setError(null);
    
    // Enviar os dados para o worker processar
    workerRef.current.postMessage({
      action: 'process',
      data,
      options
    });
    
    // O resultado será retornado via evento onmessage configurado no useEffect
  };
  
  return {
    processData,
    result: result?.data || [],
    count: result?.count || 0,
    processingTime: result?.processingTime || 0,
    isLoading,
    error
  };
}