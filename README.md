# Tech Game

Браузерная командная викторина в формате «Своей игры», разработанная на Python и TypeScript. Команды по очереди выбирают категории и вопросы, получают или теряют очки, а после завершения игры видят итоговый рейтинг.

## Возможности

- создание нескольких команд и автоматическая смена хода;
- категории с уровнями сложности и категории с подкатегориями;
- загрузка вопросов и вариантов ответов из JSON-файлов;
- проверка ответов и подсчёт очков;
- скрытие уже использованных вопросов и категорий;
- сохранение и восстановление состояния игры;
- итоговая таблица результатов;
- работа в браузере через WebSocket;
- доступ к игре с других устройств в локальной сети;
- сборка Python-сервера в Windows-приложение с помощью PyInstaller.

## Технологии

- Python 3.10+
- TypeScript, HTML, CSS
- WebSocket (`websockets`)
- JSON
- Node.js и npm
- BrowserSync
- PyInstaller

## Архитектура

Проект состоит из двух частей:

1. `game_engine` — игровая логика и WebSocket-сервер на Python.
2. `web_ui` — пользовательский интерфейс на TypeScript.

Клиент отправляет серверу JSON-сообщения с названием метода и аргументами. Сервер вызывает соответствующий метод класса `Game` и возвращает результат или описание ошибки.

## Структура проекта

```text
tech-game/
├── game_engine/
│   ├── resources/game_questions/       # вопросы в формате JSON
│   ├── app.py                          # цикл асинхронных задач
│   ├── category_questions_controller.py # загрузка и управление вопросами
│   ├── game.py                         # игровая логика
│   ├── main.py                         # создание игры и сервера
│   ├── server.py                       # WebSocket-сервер
│   ├── transport.py                    # обработка JSON-сообщений
│   └── requirements.txt
├── web_ui/
│   ├── src/elements/                   # страницы и компоненты интерфейса
│   ├── src/game_engine.ts              # WebSocket-клиент
│   ├── static/index.css                # стили
│   ├── index.html
│   ├── index.ts
│   └── package.json
├── run_server.py                       # запуск Python-сервера
├── run_game.py                         # точка входа для сборки
├── build_exe.spec                      # конфигурация PyInstaller
└── tech-game.code-workspace
```

## Установка

Требуются Python 3.10+, Node.js и npm.

### Python

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r game_engine\requirements.txt
```

### Веб-интерфейс

```powershell
cd web_ui
npm install
```

## Запуск для разработки

Запустите сервер из корневой папки проекта:

```powershell
python run_server.py
```

По умолчанию WebSocket-сервер работает по адресу `ws://localhost:8001`.

Во втором терминале запустите веб-интерфейс:

```powershell
cd web_ui
npm run dev
```

BrowserSync соберёт TypeScript, запустит страницу на `http://localhost:5501` и будет следить за изменениями файлов.

После изменения Python-кода сервер нужно перезапустить. TypeScript и CSS обновляются автоматически.

## Настройки сервера

Адрес и порт Python-сервера можно задать переменными окружения:

```powershell
$env:GAME_HOST = "0.0.0.0"
$env:GAME_PORT = "8001"
python run_server.py
```

Для остановки процессов разработки веб-интерфейса выполните:

```powershell
cd web_ui
npm run kill
```

## Вопросы

Вопросы находятся в `game_engine/resources/game_questions`. Обычная категория содержит девять JSON-файлов, а категория с подкатегориями — вложенные папки по три вопроса.

Пример файла вопроса:

```json
{
  "title": "Какова временная сложность бинарного поиска?",
  "variants": ["O(n)", "O(log n)", "O(n²)", "O(1)"],
  "correct_answer": "O(log n)"
}
```

Стоимость вопроса определяется именем файла, например `100.json` или `900.json`.

## Сборка Windows-приложения

Сначала соберите TypeScript:

```powershell
cd web_ui
npm run build
cd ..
```

Затем установите PyInstaller и выполните сборку:

```powershell
pip install pyinstaller
pyinstaller build_exe.spec
```

Результат появится в `dist/tech-game/tech-game.exe`.
