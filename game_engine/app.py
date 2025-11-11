"""Application event loop wrapper."""

import asyncio
from typing import Coroutine, List


class App:
    """Event loop wrapper that hides async complexity.
    
    Usage:
        app = App()
        app.add_task(some_coroutine())
        app.exec()  # Blocks like tkinter mainloop
    """
    
    def __init__(self):
        """Initialize the application with a new event loop."""
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        self.tasks: List[asyncio.Task] = []
    
    def add_task(self, coro: Coroutine) -> None:
        """Add an async task to the event loop.
        
        Args:
            coro: Coroutine to run
        """
        task = self.loop.create_task(coro)
        self.tasks.append(task)
    
    def exec(self) -> None:
        """Start the event loop and block until interrupted.
        
        This method blocks like Qt's app.exec() or tkinter's mainloop().
        Press Ctrl+C to stop.
        """
        try:
            self.loop.run_forever()
        except KeyboardInterrupt:
            print("\nShutting down...")
        finally:
            # Cancel all tasks
            for task in self.tasks:
                task.cancel()
            
            # Clean up
            self.loop.run_until_complete(self.loop.shutdown_asyncgens())
            self.loop.close()

