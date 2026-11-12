"""Entry point script for PyInstaller build."""

import sys
from pathlib import Path

# Add game_engine to path if running from exe
if getattr(sys, 'frozen', False):
    # Running as exe
    exe_dir = Path(sys.executable).parent
    # game_engine should be in _internal in onedir mode
    if (exe_dir / '_internal').exists():
        sys.path.insert(0, str(exe_dir / '_internal'))
else:
    # Running as script - add project root to path
    project_root = Path(__file__).parent
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))

# Now import and run main
from game_engine.main import main

if __name__ == "__main__":
    main()
