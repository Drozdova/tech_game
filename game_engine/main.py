"""Game server entry point."""

from .app import App
from .server import GameServer
from .game import Game
from .transport import handle_game_message


def main():
    """Main entry point for the game server."""
    app = App()
    game = Game()
    server = GameServer(game, host="localhost", port=8000)
    
    # Register message handler
    server.on_message(lambda msg: handle_game_message(msg, game)) 
    
    print("Server starting at ws://localhost:8000")
    print("Press Ctrl+C to stop")
    app.add_task(server.start()) 
    app.exec()  # Blocks here like tkinter mainloop


if __name__ == "__main__":
    main()
