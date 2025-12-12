"""Game server entry point."""

import os
from .app import App
from .server import GameServer
from .game import Game
from .transport import handle_game_message


def main():
    """Main entry point for the game server."""
    # Get host and port from environment variables or use defaults
    host = os.getenv("GAME_HOST", "0.0.0.0")
    port = int(os.getenv("GAME_PORT", "8000"))
    
    app = App()
    game = Game()
    server = GameServer(game, host=host, port=port)
    
    # Register message handler
    server.on_message(lambda msg: handle_game_message(msg, game)) 
    
    # Show actual server address
    display_host = "localhost" if host == "0.0.0.0" else host
    print(f"Server starting at ws://{display_host}:{port}")
    print("Press Ctrl+C to stop")
    app.add_task(server.start()) 
    app.exec()  # Blocks here like tkinter mainloop


if __name__ == "__main__":
    main()
