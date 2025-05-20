import { useState, useEffect, useRef } from 'react';

/**
 * Hook para monitorar a performance da renderização
 */
export function usePerformanceMonitor() {
  const [renderRate, setRenderRate] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState({ usedJSHeapSize: 0, totalJSHeapSize: 0 });
  const [cpuUsage, setCpuUsage] = useState(0);
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number | null>(null);
  
  // Função para atualizar as métricas de performance
  const updateMetrics = () => {
    frameCountRef.current += 1;
    const now = performance.now();
    const elapsed = now - lastTimeRef.current;
    
    // Calcular a taxa de renderização a cada 1 segundo
    if (elapsed >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / elapsed);
      setRenderRate(fps);
      
      // Resetar contadores
      frameCountRef.current = 0;
      lastTimeRef.current = now;
      
      // Obter métricas de memória se disponíveis
      if (window.performance && 'memory' in window.performance) {
        // TypeScript não reconhece a propriedade memory por padrão
        const performance = window.performance as any;
        if (performance.memory) {
          setMemoryUsage({
            usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)),
            totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / (1024 * 1024))
          });
        }
      }
      
      // Em navegadores modernos, podemos usar a API reportingObserver
      // para métricas mais detalhadas (não implementado aqui por compatibilidade)
      console.log(`[Performance] Taxa de renderização: ${fps} fps`);
    }
    
    // Agendar a próxima atualização
    animationFrameRef.current = requestAnimationFrame(updateMetrics);
  };
  
  // Iniciar o monitoramento quando o componente montar
  useEffect(() => {
    // Iniciar o loop de monitoramento
    animationFrameRef.current = requestAnimationFrame(updateMetrics);
    
    // Limpar quando o componente desmontar
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Monitorar a taxa de renderização em linhas por segundo
  const monitorTableRendering = (itemCount: number, startTime: number) => {
    const elapsed = performance.now() - startTime;
    const itemsPerSecond = (itemCount / elapsed) * 1000;
    console.log(`[Performance] Taxa de renderização: ${itemsPerSecond.toFixed(2)} linhas/s`);
    return itemsPerSecond;
  };
  
  return {
    renderRate,
    memoryUsage,
    cpuUsage,
    monitorTableRendering
  };
}