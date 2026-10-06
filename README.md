# Чат WhatsApp на React + GREEN-API

Тестовое задание: простой интерфейс для **отправки и получения текстовых сообщений** в WhatsApp через [GREEN-API](https://green-api.com/). Внешний вид приближен к веб-чату MAX: тёмная панель чатов слева, переписка справа, минимум функций.

## Что умеет приложение

1. Вход по `idInstance` и `apiTokenInstance` из кабинета GREEN-API.
2. Создание чата по номеру телефона получателя.
3. Отправка текста методом [SendMessage](https://green-api.com/docs/api/sending/SendMessage/).
4. Получение входящих текстов методом HTTP API: [ReceiveNotification](https://green-api.com/docs/api/receiving/technology-http-api/ReceiveNotification/) и [DeleteNotification](https://green-api.com/docs/api/receiving/technology-http-api/DeleteNotification/).

`apiUrl` берётся автоматически: `https://{первые 4 цифры idInstance}.api.green-api.com`.

## Подготовка GREEN-API

1. Зарегистрируйтесь в [кабинете GREEN-API](https://console.green-api.com/).
2. Создайте инстанс WhatsApp и скопируйте `idInstance` и `apiTokenInstance`.
3. Авторизуйте инстанс: отсканируйте QR-код телефоном с WhatsApp.
4. В настройках инстанса **очистите Webhook URL**. HTTP API не работает, если webhook задан.
5. Включите уведомления о входящих сообщениях.

## Локальный запуск

Нужны Node.js 18+ и npm.

```bash
git clone <url-репозитория>
cd green-api-wa-chat
npm install
npm run dev
```

Откройте адрес из терминала, обычно http://localhost:5173

1. Введите `idInstance` и `apiTokenInstance`, нажмите **Войти**.
2. Введите номер получателя в международном формате без `+`, например `79001234567`, нажмите **Создать**.
3. Напишите текстовое сообщение и отправьте.
4. Ответьте с телефона получателя в WhatsApp — сообщение появится в чате.

## Сборка

```bash
npm run build
npm run preview
```

## Важно

- Работает только текст. Медиа, статусы и группы в интерфейсе не обрабатываются.
- Учётные данные хранятся только в `sessionStorage` браузера и не отправляются никуда, кроме GREEN-API.
- Если вход не проходит, проверьте, что инстанс в статусе `authorized`, а поле webhook пустое.
