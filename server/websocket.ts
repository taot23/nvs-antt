import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { log } from './vite';

// Tipos de eventos para o WebSocket
export type WSEventType = 'sales_update' | 'user_update' | 'ping' | 'pong';

// Interface para os eventos
export interface WSEvent {
  type: WSEventType;
  payload?: any;
  timestamp?: number;
}

// Armazenar as conexões ativas
const connections: WebSocket[] = [];

// Configurar o servidor WebSocket
export function setupWebsocket(httpServer: HttpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  log('WebSocket configurado no caminho /ws', 'websocket');

  wss.on('connection', (ws) => {
    log('Nova conexão WebSocket estabelecida', 'websocket');
    connections.push(ws);

    // Enviar uma mensagem de boas-vindas quando conectar
    const welcomeEvent: WSEvent = {
      type: 'ping',
      payload: { message: 'Conectado ao servidor em tempo real' }
    };
    ws.send(JSON.stringify(welcomeEvent));

    // Evento para quando o cliente envia uma mensagem
    ws.on('message', (message) => {
      try {
        const event: WSEvent = JSON.parse(message.toString());
        log(`Mensagem recebida: ${event.type}`, 'websocket');
        
        // Processar diferentes tipos de eventos
        if (event.type === 'ping') {
          // Responder com pong (não ping) para que o cliente possa calcular a latência
          ws.send(JSON.stringify({ 
            type: 'pong', 
            payload: { message: 'Pong resposta ao ping' },
            timestamp: Date.now() 
          }));
        }
      } catch (error) {
        log(`Erro ao processar mensagem: ${error}`, 'websocket');
      }
    });

    // Evento para quando a conexão é fechada
    ws.on('close', () => {
      const index = connections.indexOf(ws);
      if (index !== -1) {
        connections.splice(index, 1);
      }
      log('Conexão WebSocket fechada', 'websocket');
    });

    // Verificar periodicamente se a conexão ainda está ativa
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ 
            type: 'ping', 
            payload: { message: 'Ping periódico do servidor' },
            timestamp: Date.now() 
          }));
        } catch (error) {
          log(`Erro ao enviar ping: ${error}`, 'websocket');
          ws.terminate(); // Força o fechamento se houver erro
        }
      }
      if (ws.readyState !== WebSocket.OPEN) {
        clearInterval(interval);
      }
    }, 15000); // Ping a cada 15 segundos

    // Cleanup do intervalo quando a conexão fechar
    ws.on('close', () => {
      clearInterval(interval);
    });
  });

  return wss;
}

// Função para enviar eventos para todos os clientes conectados
export function broadcastEvent(event: WSEvent) {
  const message = JSON.stringify(event);
  
  log(`Broadcast de evento: ${event.type}`, 'websocket');
  
  connections.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Enviar evento de atualização de vendas
export function notifySalesUpdate() {
  broadcastEvent({
    type: 'sales_update',
    payload: { timestamp: Date.now() }
  });
}