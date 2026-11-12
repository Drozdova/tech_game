"""Game server entry point."""

import os
import sys
from pathlib import Path
from .app import App
from .server import GameServer
from .game import Game
from .transport import handle_game_message


def get_resources_folder() -> Path:
    """Get path to resources folder (works in dev and exe).

    Returns:
        Path to resources folder
    """
    if getattr(sys, 'frozen', False):
        # Running as exe (PyInstaller)
        # In onedir mode, resources are in _internal/resources/
        exe_dir = Path(sys.executable).parent

        # Try _internal/resources first (onedir mode)
        resources_internal = exe_dir / "_internal" / "resources"
        if resources_internal.exists():
            return resources_internal

        # Fallback to exe_dir/resources
        resources_root = exe_dir / "resources"
        if resources_root.exists():
            return resources_root

        # If not found, return expected path anyway (will show error)
        return resources_internal
    else:
        # Running as script
        # __file__ is in game_engine/, so resources are in game_engine/resources/
        return Path(__file__).parent / "resources"



def main():
    """Main entry point for the game server."""
    # Get host and port from environment variables or use defaults
    host = os.getenv("GAME_HOST", "0.0.0.0")
    port = int(os.getenv("GAME_PORT", "8001"))
    
    app = App()
    game = Game(resources_folder=get_resources_folder())
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
