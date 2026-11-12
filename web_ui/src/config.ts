/**
 * Centralized configuration for game server
 * Change port here to update all connections
 * Host is automatically determined from current page location
 */

export const GAME_SERVER_PORT = 8001;

/**
 * Get game server host - uses current page hostname
 * This allows clients from different devices to connect to the same server
 */
function getGameServerHost(): string {
  return window.location.hostname;
}

// Helper functions to build URLs
export function getWebSocketUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${getGameServerHost()}:${GAME_SERVER_PORT}`;
}

export function getBaseUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  return `${protocol}//${getGameServerHost()}:${GAME_SERVER_PORT}`;
}

