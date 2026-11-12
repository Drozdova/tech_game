# Сборка Windows-версии

## Требования

- Windows
- Python 3.10+
- Node.js и npm
- PyInstaller

Установите зависимости:

```powershell
python -m pip install -r game_engine/requirements.txt pyinstaller
cd web_ui
npm install
npm run build
cd ..
```

## Создание комплекта для запуска

Из корня проекта выполните:

```powershell
.\bundle.bat
```

Скрипт:

1. собирает бэкенд с помощью `build_exe.spec`;
2. помещает результат в `dist/tech-game/`;
3. копирует веб-интерфейс в `dist/web_ui/`;
4. создаёт команды запуска бэкенда и локального HTTP-сервера.

## Запуск собранной версии

В двух окнах терминала выполните:

```powershell
.\dist\run-game-server.bat
.\dist\run-http-server.bat
```

После этого откройте `http://localhost:5501`. Веб-интерфейс подключается к WebSocket-серверу на порту `8001`.

Каталоги `build/` и `dist/` создаются автоматически и не хранятся в Git.
