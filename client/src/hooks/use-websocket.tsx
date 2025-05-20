import { useState, useEffect, useCallback, useRef } from 'react';

// Tipos de evento para o WebSocket
export type WSEventType = 'sales_update' | 'user_update' | 'ping' | 'pong';

// Interface para os eventos
export interface WSEvent {
  type: WSEventType;
  payload?: any;
  timestamp?: number;
}

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WSEvent | null>(null);
  const [lastPingTime, setLastPingTime] = useState(0);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const pongTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  
  // Função para criar uma nova conexão WebSocket
  const createWebSocketConnection = useCallback(() => {
    // Limpar timeout anterior se existir
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Configurar a conexão WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('Tentando conectar ao WebSocket:', wsUrl);
    
    try {
      const ws = new WebSocket(wsUrl);
      
      // Manipulador para quando a conexão é aberta
      ws.onopen = () => {
        console.log('Conexão WebSocket estabelecida');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // Resetar contador de tentativas
        // Enviar um ping para testar a conexão
        ws.send(JSON.stringify({ type: 'ping' }));
      };
      
      // Manipulador para quando uma mensagem é recebida
      ws.onmessage = (event) => {
        try {
          const data: WSEvent = JSON.parse(event.data);
          console.log('Evento WebSocket recebido:', data);
          
          // Lidar com mensagens pong (resposta aos pings)
          if (data.type === 'pong') {
            // Se temos um pong timeout pendente, limpe-o
            if (pongTimeoutRef.current) {
              clearTimeout(pongTimeoutRef.current);
              pongTimeoutRef.current = null;
            }
            
            // Calcular latência se temos um timestamp de ping
            if (lastPingTime > 0) {
              const now = performance.now();
              const latency = now - lastPingTime;
              setPingLatency(latency);
              console.log(`Latência WebSocket: ${latency.toFixed(2)}ms`);
            }
          }
          
          // Se for uma atualização de venda, atualizar os dados
          if (data.type === 'sales_update') {
            console.log('Recebida atualização de vendas via WebSocket');
            
            // Use importação dinâmica para acessar o queryClient do módulo diretamente
            // em vez de confiar na propriedade window.queryClient que pode não estar disponível
            import('../lib/queryClient').then(({ queryClient }) => {
              console.log('Invalidando consultas de vendas após atualização via WebSocket');
              
              // Invalidar todas as consultas de vendas
              queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
              
              // Também invalidar consultas específicas para vendedores (se houver)
              if (typeof window !== 'undefined' && window.currentUser) {
                const user = window.currentUser;
                if (user && user.role === 'vendedor') {
                  console.log('Invalidando consulta específica para o vendedor:', user.id);
                  queryClient.invalidateQueries({ 
                    queryKey: ['/api/sales', user.id]
                  });
                }
              }
              
              // Disparar um evento personalizado para notificar outros componentes
              const salesUpdateEvent = new CustomEvent('sales-update', {
                detail: { timestamp: new Date().getTime() }
              });
              window.dispatchEvent(salesUpdateEvent);
            }).catch(err => {
              console.error('Erro ao importar queryClient:', err);
            });
          }
          
          setLastEvent(data);
        } catch (error) {
          console.error('Erro ao processar mensagem do WebSocket:', error);
        }
      };
      
      // Manipulador para quando a conexão é fechada
      ws.onclose = () => {
        console.log('Conexão WebSocket fechada');
        setIsConnected(false);
        
        // Incrementar contador de tentativas
        reconnectAttemptsRef.current += 1;
        
        // Tentar reconectar após um intervalo que aumenta a cada tentativa (exponential backoff)
        const reconnectDelay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 30000);
        
        console.log(`Tentativa ${reconnectAttemptsRef.current}/${maxReconnectAttempts}: Tentando reconectar em ${reconnectDelay/1000}s...`);
        
        // Só tentar reconectar se não atingiu o limite máximo de tentativas
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            console.log('Executando reconexão...');
            createWebSocketConnection();
          }, reconnectDelay);
        } else {
          console.error('Número máximo de tentativas de reconexão atingido. Desistindo.');
        }
      };
      
      // Manipulador para erros
      ws.onerror = (error) => {
        console.error('Erro na conexão WebSocket:', error);
      };
      
      // Salvar a referência ao socket
      setSocket(ws);
      
      return ws;
    } catch (error) {
      console.error('Erro ao criar conexão WebSocket:', error);
      return null;
    }
  }, []);
  
  // Inicializar a conexão WebSocket
  useEffect(() => {
    const ws = createWebSocketConnection();
    
    // Configurar ping periódico para manter a conexão viva
    pingIntervalRef.current = window.setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log('Enviando ping para verificar conexão WebSocket...');
        
        // Armazenar o tempo para calcular latência quando o pong voltar
        setLastPingTime(performance.now());
        
        // Enviar o ping com timestamp
        ws.send(JSON.stringify({
          type: 'ping',
          timestamp: Date.now()
        }));
        
        // Definir um timeout para caso não recebamos o pong dentro de um tempo razoável
        // isso indica uma conexão quebrada mesmo que o socket pareça aberto
        pongTimeoutRef.current = window.setTimeout(() => {
          console.warn('Timeout de pong atingido! A conexão parece estar quebrada.');
          if (ws.readyState === WebSocket.OPEN) {
            console.log('Fechando conexão para forçar reconexão...');
            ws.close();
          }
        }, 5000); // 5 segundos para receber o pong
      }
    }, 30000); // ping a cada 30 segundos
    
    // Limpar ao desmontar
    return () => {
      console.log('Componente desmontado, fechando conexão WebSocket');
      
      // Limpar todos os timers
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (pingIntervalRef.current) {
        window.clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      
      if (pongTimeoutRef.current) {
        window.clearTimeout(pongTimeoutRef.current);
        pongTimeoutRef.current = null;
      }
      
      // Fechar websocket
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [createWebSocketConnection]);
  
  // Função para enviar mensagens
  const sendMessage = useCallback((type: WSEventType, payload?: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket não está conectado. Não foi possível enviar mensagem.');
    }
  }, [socket]);
  
  // Função para tentar reconectar manualmente
  const reconnect = useCallback(() => {
    if (socket) {
      if (socket.readyState === WebSocket.OPEN) {
        console.log('WebSocket já está conectado. Fechando para reconectar...');
        socket.close();
      } else {
        console.log('WebSocket não está aberto. Criando nova conexão...');
        createWebSocketConnection();
      }
    } else {
      console.log('Nenhum WebSocket anterior. Criando nova conexão...');
      createWebSocketConnection();
    }
  }, [socket, createWebSocketConnection]);
  
  return { 
    isConnected, 
    lastEvent, 
    sendMessage, 
    reconnect,
    pingLatency, // Latência da conexão (ms)
    lastPingTime // Último momento em que um ping foi enviado
  };
}