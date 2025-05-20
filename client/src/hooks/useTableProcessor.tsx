import { useState, useEffect, useMemo, useRef } from 'react';

interface TableProcessorOptions {
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  searchTerm?: string;
  statusFilter?: string;
  pageSize?: number;
  processingDelay?: number;
}

interface ProcessingMetrics {
  itemsPerSecond: number;
  totalRenderTime: number;
  memoryUsage?: number;
}

/**
 * Hook especializado para processar dados de tabela com optimização avançada
 * Gerencia automaticamente o uso de workers e cache de dados.
 */
export function useTableProcessor<T>(
  data: T[],
  options: TableProcessorOptions = {}
) {
  // Valores padrão para as opções
  const {
    sortField = 'id',
    sortDirection = 'asc',
    searchTerm = '',
    statusFilter = '',
    pageSize = 50,
    processingDelay = 0 // Atraso para simular processamento pesado (apenas para testes)
  } = options;
  
  // Estados para os dados processados e controle de carregamento
  const [processedData, setProcessedData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [renderProgress, setRenderProgress] = useState(0);
  const [metrics, setMetrics] = useState<ProcessingMetrics | null>(null);
  
  // Referências para controle de tempo
  const startTimeRef = useRef(performance.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Worker para processamento em thread separada (se disponível)
  const workerRef = useRef<Worker | null>(null);
  const workerSupportedRef = useRef<boolean | null>(null);
  
  // Tentar usar Web Worker se disponível no navegador
  useEffect(() => {
    // Verificar se Workers são suportados
    if (typeof Worker !== 'undefined' && workerSupportedRef.current === null) {
      try {
        const blob = new Blob([
          `self.onmessage = function(e) {
            const { data, options } = e.data;
            
            // Função para filtrar os dados
            function filterData(data, searchTerm, statusFilter) {
              if (!searchTerm && !statusFilter) return data;
              
              return data.filter(item => {
                // Filtro por termo de busca (pesquisa em várias propriedades)
                const matchesSearch = !searchTerm || 
                  Object.values(item).some(value => 
                    value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                  );
                
                // Filtro por status
                const matchesStatus = !statusFilter || 
                  (item.status && item.status === statusFilter);
                
                return matchesSearch && matchesStatus;
              });
            }
            
            // Função para ordenar os dados
            function sortData(data, field, direction) {
              if (!field) return data;
              
              return [...data].sort((a, b) => {
                const valueA = a[field];
                const valueB = b[field];
                
                // Lidar com diferentes tipos de valores
                if (valueA === valueB) return 0;
                if (valueA === null || valueA === undefined) return 1;
                if (valueB === null || valueB === undefined) return -1;
                
                // Ordenação baseada no tipo de dado
                const modifier = direction === 'asc' ? 1 : -1;
                
                if (typeof valueA === 'number' && typeof valueB === 'number') {
                  return (valueA - valueB) * modifier;
                }
                
                return String(valueA).localeCompare(String(valueB)) * modifier;
              });
            }
            
            // Processar os dados
            const { searchTerm, statusFilter, sortField, sortDirection } = options;
            
            // Filtrar primeiro
            const filtered = filterData(data, searchTerm, statusFilter);
            
            // Depois ordenar
            const sorted = sortData(filtered, sortField, sortDirection);
            
            // Enviar o resultado de volta
            self.postMessage({
              processedData: sorted,
              totalItems: sorted.length,
              processingTime: performance.now() - e.data.startTime
            });
          }`
        ], { type: 'application/javascript' });
        
        const workerUrl = URL.createObjectURL(blob);
        workerRef.current = new Worker(workerUrl);
        workerSupportedRef.current = true;
        
        // Configurar handler para receber mensagens do worker
        workerRef.current.onmessage = (e) => {
          const { processedData, totalItems, processingTime } = e.data;
          
          // Simular renderização progressiva
          if (processedData.length > 500) {
            // Para conjuntos grandes, exibir progressivamente
            const chunkSize = Math.ceil(processedData.length / 10);
            let currentChunk = 0;
            
            const renderNextChunk = () => {
              const endIdx = Math.min((currentChunk + 1) * chunkSize, processedData.length);
              setProcessedData(processedData.slice(0, endIdx));
              
              // Atualizar progresso
              currentChunk++;
              setRenderProgress(Math.min((currentChunk * 100) / 10, 100));
              
              if (currentChunk < 10) {
                // Continuar renderizando os próximos chunks
                setTimeout(renderNextChunk, 30);
              } else {
                // Finalizado
                setIsLoading(false);
                setRenderProgress(100);
                
                // Calcular métricas
                const endTime = performance.now();
                const totalTime = endTime - startTimeRef.current;
                setMetrics({
                  itemsPerSecond: processedData.length / (totalTime / 1000),
                  totalRenderTime: totalTime
                });
              }
            };
            
            // Iniciar renderização progressiva
            renderNextChunk();
          } else {
            // Para conjuntos pequenos, renderizar de uma vez
            setProcessedData(processedData);
            setIsLoading(false);
            setRenderProgress(100);
            
            // Calcular métricas
            const endTime = performance.now();
            const totalTime = endTime - startTimeRef.current;
            setMetrics({
              itemsPerSecond: processedData.length / (totalTime / 1000),
              totalRenderTime: totalTime
            });
          }
        };
        
        workerRef.current.onerror = (error) => {
          console.error('Erro no worker:', error);
          setError(new Error('Erro ao processar dados em segundo plano'));
          setIsLoading(false);
          workerSupportedRef.current = false;
        };
        
        console.log('[TableProcessor] Web Worker iniciado com sucesso');
      } catch (error) {
        console.error('Erro ao criar Web Worker:', error);
        workerSupportedRef.current = false;
      }
    }
    
    // Limpar worker quando o componente for desmontado
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // Processar os dados quando as dependências mudarem
  useEffect(() => {
    // Resetar estado de carregamento
    setIsLoading(true);
    setRenderProgress(0);
    startTimeRef.current = performance.now();
    
    // Limpar qualquer timer anterior
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Função para processar os dados diretamente se não puder usar worker
    const processDataDirectly = () => {
      // Filtrar dados
      let filtered = data;
      
      if (searchTerm || statusFilter) {
        filtered = data.filter((item: any) => {
          // Filtro por termo de busca
          const matchesSearch = !searchTerm || 
            Object.values(item).some(value => 
              value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
          
          // Filtro por status
          const matchesStatus = !statusFilter || 
            (item.status && item.status === statusFilter);
          
          return matchesSearch && matchesStatus;
        });
      }
      
      // Ordenar dados
      let processed = [...filtered];
      
      if (sortField) {
        processed.sort((a: any, b: any) => {
          const valueA = a[sortField];
          const valueB = b[sortField];
          
          // Lidar com diferentes tipos de valores
          if (valueA === valueB) return 0;
          if (valueA === null || valueA === undefined) return 1;
          if (valueB === null || valueB === undefined) return -1;
          
          // Ordenação baseada no tipo de dado
          const modifier = sortDirection === 'asc' ? 1 : -1;
          
          if (typeof valueA === 'number' && typeof valueB === 'number') {
            return (valueA - valueB) * modifier;
          }
          
          return String(valueA).localeCompare(String(valueB)) * modifier;
        });
      }
      
      // Simular renderização progressiva para conjuntos grandes de dados
      if (processed.length > 500) {
        const chunkSize = Math.ceil(processed.length / 10);
        let currentChunk = 0;
        
        const renderNextChunk = () => {
          const endIdx = Math.min((currentChunk + 1) * chunkSize, processed.length);
          setProcessedData(processed.slice(0, endIdx));
          
          // Atualizar progresso
          currentChunk++;
          setRenderProgress(Math.min((currentChunk * 100) / 10, 100));
          
          if (currentChunk < 10) {
            // Continuar renderizando os próximos chunks
            timerRef.current = setTimeout(renderNextChunk, 30);
          } else {
            // Finalizado
            setIsLoading(false);
            setRenderProgress(100);
            
            // Calcular métricas
            const endTime = performance.now();
            const totalTime = endTime - startTimeRef.current;
            setMetrics({
              itemsPerSecond: processed.length / (totalTime / 1000),
              totalRenderTime: totalTime
            });
          }
        };
        
        // Iniciar renderização progressiva
        renderNextChunk();
      } else {
        // Para conjuntos pequenos, renderizar de uma vez
        setProcessedData(processed);
        setIsLoading(false);
        setRenderProgress(100);
        
        // Calcular métricas
        const endTime = performance.now();
        const totalTime = endTime - startTimeRef.current;
        setMetrics({
          itemsPerSecond: processed.length / (totalTime / 1000),
          totalRenderTime: totalTime
        });
      }
    };
    
    // Usar Web Worker se disponível, caso contrário processar diretamente
    if (workerRef.current && workerSupportedRef.current) {
      // Processar usando worker
      workerRef.current.postMessage({
        data,
        options: {
          searchTerm,
          statusFilter,
          sortField,
          sortDirection
        },
        startTime: performance.now()
      });
    } else {
      // Adicionar um pequeno atraso para não bloquear a UI
      timerRef.current = setTimeout(processDataDirectly, processingDelay);
    }
    
  }, [data, searchTerm, statusFilter, sortField, sortDirection, processingDelay]);
  
  return {
    data: processedData,
    isLoading,
    error,
    renderProgress,
    metrics
  };
}