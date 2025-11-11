# Tech Game - Учебный проект с WebSocket

Простая игра на Python с веб-интерфейсом. Проект создан для обучения программированию - вся архитектура прозрачна и понятна, без сложных фреймворков.

## Архитектура

Проект состоит из двух частей:

1. **Backend (Python)** - игровая логика и WebSocket сервер
2. **Frontend (TypeScript)** - веб-интерфейс в браузере

Общение между ними происходит через WebSocket с простыми JSON сообщениями.

## Структура проекта

```
tech-game/
├── game_engine/          # Backend на Python
│   ├── game.py          # Базовый класс Game
│   ├── dummy_game.py    # Тестовая реализация
│   ├── app.py           # Event loop обёртка
│   ├── server.py        # WebSocket сервер
│   ├── transport.py     # Обработка сообщений
│   └── requirements.txt # Зависимости Python
│
├── web_ui/              # Frontend на TypeScript
│   ├── src/
│   │   ├── game_engine.ts       # WebSocket клиент
│   │   ├── template_manager.ts  # Загрузчик шаблонов
│   │   ├── elements/
│   │   │   └── echo_element.ts  # Компонент Echo
│   │   └── templates/
│   │       └── echo_test_element.html
│   ├── static/
│   │   └── index.css    # Стили
│   ├── dist/            # Скомпилированный JS
│   ├── index.html       # Главная страница
│   ├── index.ts         # Точка входа
│   ├── package.json
│   └── tsconfig.json
│
└── main.py              # Запуск сервера
```

## Установка

### 1. Установить Python зависимости

```bash
pip install -r game_engine/requirements.txt
```

### 2. Установить Node.js зависимости

```bash
cd web_ui
npm install
```

### 3. Скомпилировать TypeScript

```bash
cd web_ui
npm run build
```

Эта команда скомпилирует все `.ts` файлы в папку `dist/`.

## Запуск

### Запуск Backend (Python сервер)

В корневой папке проекта:

```bash
python run_server.py
```

Или в VS Code просто нажмите **F5** (Run and Debug).

Вы увидите:
```
Server starting at ws://localhost:8000
Press Ctrl+C to stop
Server started at ws://localhost:8000
```

Сервер работает и ждёт подключений. Для остановки нажмите `Ctrl+C`.

### Запуск Frontend (веб-интерфейс)

1. Откройте папку `web_ui` в VS Code:
   ```bash
   cd web_ui
   code .
   ```

2. Установите расширение **Live Server** в VS Code (если ещё не установлено)

3. Откройте файл `index.html`

4. Нажмите правой кнопкой мыши и выберите **"Open with Live Server"**

Браузер откроется автоматически на `http://localhost:5500`

## Тестирование

1. Убедитесь, что Python сервер запущен
2. Откройте веб-интерфейс через Live Server
3. Вы увидите поле ввода и кнопку "Send"
4. Введите любой текст и нажмите "Send"
5. Сервер вернёт "echo: ваш текст"

В консоли Python сервера вы увидите логи:
```
Client connected from ('127.0.0.1', 12345)
Received: {"id":1,"method":"echo","args":["hello"]}
Sending: {"id":1,"result":"echo: hello","error":null}
```

## Разработка

### Автоматическая пересборка TypeScript

Вместо `npm run build` можно использовать watch режим:

```bash
cd web_ui
npm run watch
```

TypeScript будет автоматически пересобираться при изменении файлов.

### Структура сообщений

Все сообщения между клиентом и сервером - это JSON.

**Запрос от клиента:**
```json
{
  "id": 1,
  "method": "echo",
  "args": ["hello"]
}
```

**Ответ от сервера:**
```json
{
  "id": 1,
  "result": "echo: hello",
  "error": null
}
```

**Ответ с ошибкой:**
```json
{
  "id": 1,
  "result": null,
  "error": "Method not found"
}
```

## Как добавить новый метод в игру

### 1. Добавить метод в `game.py`

```python
class Game:
    def my_method(self, arg1: str, arg2: int) -> str:
        raise NotImplementedError
```

### 2. Реализовать в `dummy_game.py`

```python
class DummyGame(Game):
    def my_method(self, arg1: str, arg2: int) -> str:
        return f"Got {arg1} and {arg2}"
```

### 3. Вызвать из TypeScript

```typescript
GameEngine.call('my_method', ['hello', 42], (result, error) => {
  if (error) {
    console.error(error);
  } else {
    console.log(result); // "Got hello and 42"
  }
});
```

Всё! Никакой дополнительной настройки не нужно.

## Как создать новый UI элемент

### 1. Создать HTML шаблон

Создайте файл `web_ui/src/templates/my_element.html`:

```html
<div class="my-element">
  <button class="my-button">Click me</button>
  <div class="my-output"></div>
</div>
```

### 2. Создать TypeScript класс

Создайте файл `web_ui/src/elements/my_element.ts`:

```typescript
import { GameEngine } from '../game_engine.js';
import { TemplateManager } from '../template_manager.js';

export class MyElement {
  el: HTMLElement;
  private button: HTMLButtonElement;
  private output: HTMLElement;

  constructor() {
    this.el = TemplateManager.getTemplate('my_element')!;
    this.button = this.el.querySelector('.my-button')!;
    this.output = this.el.querySelector('.my-output')!;

    this.button.onclick = () => this.onClick();
  }

  private onClick(): void {
    GameEngine.call('my_method', ['test'], (result, error) => {
      this.output.textContent = error || result;
    });
  }
}
```

### 3. Использовать в `index.ts`

```typescript
import { MyElement } from './src/elements/my_element.js';

// В callback после загрузки шаблонов:
TemplateManager.loadTemplates(['echo_test_element', 'my_element'], () => {
  const myElement = new MyElement();
  appContainer.appendChild(myElement.el);
});
```

## Принципы проекта

1. **Простота** - никакой магии, всё явно и понятно
2. **Прозрачность** - можно посмотреть логи и увидеть все сообщения
3. **Callbacks вместо async/await** - проще для новичков
4. **Модульность** - каждый компонент независим
5. **Расширяемость** - легко добавлять новые методы и UI элементы

## Следующие шаги

Теперь можно:

1. Заменить `DummyGame` на настоящую игровую логику
2. Создать новые UI компоненты
3. Улучшить стили в `static/index.css`
4. Добавить новые методы в класс `Game`

Удачи в разработке! 🚀


