"""WebSocket game server."""

import asyncio
from typing import Callable, Optional
import websockets
from websockets.server import WebSocketServerProtocol


class GameServer:
    """WebSocket server that handles game communication.
    
    The server accepts JSON-RPC style messages and calls a registered
    message handler (which should be a synchronous function).
    """
    
    def __init__(self, game, host: str = "localhost", port: int = 8000):
        """Initialize the game server.
        
        Args:
            game: Game instance
            host: Server host
            port: Server port
        """
        self.game = game
        self.host = host
        self.port = port
        self.on_message_callback: Optional[Callable[[str], str]] = None
        self.server = None
    
    def on_message(self, callback: Callable[[str], str]) -> None:
        """Register a message handler callback.
        
        Args:
            callback: Function that takes a message string and returns response string
        """
        self.on_message_callback = callback
    
    async def _handler(self, websocket: WebSocketServerProtocol, path: str) -> None:
        """Handle WebSocket connection.
        
        Args:
            websocket: WebSocket connection
            path: Request path
        """
        print(f"Client connected from {websocket.remote_address}")
        
        try:
            async for message in websocket:
                # Decode message if it's bytes
                if isinstance(message, bytes):
                    message_str = message.decode('utf-8')
                else:
                    message_str = message
                
                # Call the registered callback (synchronous function)
                response = None
                if self.on_message_callback:
                    response = self.on_message_callback(message_str)
                
                if response:
                    await websocket.send(response)
                    
        except websockets.exceptions.ConnectionClosed:
            print(f"Client disconnected from {websocket.remote_address}")
    
    async def start(self) -> None:
        """Start the WebSocket server and wait indefinitely.
        
        This is an async method that should be added to the App event loop.
        """
        # Allow connections from any origin (for local network access)
        self.server = await websockets.serve(
            self._handler, 
            self.host, 
            self.port,
            ping_interval=None,  # Disable ping to avoid connection issues
            ping_timeout=None
        )
        display_host = "localhost" if self.host == "0.0.0.0" else self.host
        print(f"Server started at ws://{display_host}:{self.port}")
        print(f"Listening on {self.host}:{self.port} (accessible from network)")
        await self.server.wait_closed()

