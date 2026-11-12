# -*- mode: python ; coding: utf-8 -*-
# PyInstaller spec file for building tech-game executable

import os
import sys
from pathlib import Path

block_cipher = None

# Get absolute paths
# In PyInstaller spec, we need to use os.getcwd() or hardcode relative paths
project_root = Path(os.getcwd())
game_engine_dir = project_root / 'game_engine'

# Collect all data files
datas = [
    # Game resources only
    (str(game_engine_dir / 'resources'), 'resources'),
]

a = Analysis(
    ['run_game.py'],
    pathex=[str(project_root)],
    binaries=[],
    datas=datas,
    hiddenimports=[
        'aiohttp',
        'aiohttp.web',
        'aiohttp.web_ws',
        'asyncio',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,  # Don't bundle binaries into exe
    name='tech-game',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,  # Show console for logs
)

# Use onedir mode so data files are accessible as separate files
coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='tech-game',
)
