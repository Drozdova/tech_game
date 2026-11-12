/**
 * GameEngine - WebSocket client with callback-based RPC
 * 
 * Simple singleton that manages WebSocket connection and provides
 * callback-based API for calling server methods.
 */

type MessageCallback = (result: any, error: string | null) => void;

interface RPCMessage {
  id: number;
  method: string;
  args: any[];
}

interface RPCResponse { 
  id: number;
  result: any;
  error: string | null;
}

class GameEngineClass {
  private ws: WebSocket | null = null;
  private nextId = 1;
  private callbacks: Map<number, MessageCallback> = new Map();
  private connected = false;

  /**
   * Connect to WebSocket server
   * @param url WebSocket URL (e.g., 'ws://localhost:8001')
   * @param onConnected Callback when connection is established
   */
  connect(url: string, onConnected: () => void): void {
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('Connected to game server at', url);
      this.connected = true;
      onConnected();
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error connecting to', url, ':', error);
      console.error('Make sure:');
      console.error('1. Server is running and listening on 0.0.0.0 (not localhost)');
      console.error('2. Firewall allows connections on port 8001');
      console.error('3. Server address is correct');
    };

    this.ws.onclose = (event) => {
      console.log('Disconnected from game server');
      console.log('Close code:', event.code, 'Reason:', event.reason || 'No reason provided');
      this.connected = false;
    };
  }

  /**
   * Handle incoming message from server
   */
  private handleMessage(data: string): void {
    try {
      const response: RPCResponse = JSON.parse(data);
      console.log('Received:', response);

      const callback = this.callbacks.get(response.id);
      if (callback) {
        callback(response.result, response.error);
        this.callbacks.delete(response.id);
      }
    } catch (e) {
      console.error('Failed to parse message:', e);
    }
  }

  /**
   * Call a method on the server
   * @param method Method name
   * @param args Method arguments
   * @param callback Callback that receives (result, error)
   */
  call(method: string, args: any[], callback: MessageCallback): void {
    if (!this.connected || !this.ws) {
      callback(null, 'Not connected to server');
      return;
    }

    const id = this.nextId++;
    this.callbacks.set(id, callback);

    const message: RPCMessage = { id, method, args };
    console.log('Sending:', message);
    this.ws.send(JSON.stringify(message));
  }

  /**
   * Echo method - simple wrapper for testing
   * @param text Text to echo
   * @param callback Callback that receives (result, error)
   */
  echo(text: string, callback: (result: string | null, error: string | null) => void): void {
    this.call('echo', [text], callback);
  }
}

// Export singleton instance
export const GameEngine = new GameEngineClass();



