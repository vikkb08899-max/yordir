# Настройка Google Sheets для логирования сделок

## Шаг 1: Создание Google Service Account

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google Sheets API:
   - Перейдите в "APIs & Services" > "Library"
   - Найдите "Google Sheets API" и включите его

## Шаг 2: Создание Service Account

1. Перейдите в "APIs & Services" > "Credentials"
2. Нажмите "Create Credentials" > "Service Account"
3. Заполните имя сервисного аккаунта (например, "exchange-logger")
4. Нажмите "Create and Continue"
5. Пропустите шаги с ролями (нажмите "Continue" и "Done")

## Шаг 3: Создание ключа

1. В списке Service Accounts нажмите на созданный аккаунт
2. Перейдите на вкладку "Keys"
3. Нажмите "Add Key" > "Create new key"
4. Выберите формат JSON и нажмите "Create"
5. Сохраните скачанный JSON файл

## Шаг 4: Создание Google Sheets таблицы

1. Создайте новую Google Sheets таблицу
2. В первой строке добавьте заголовки:
   - A1: Дата
   - B1: ID заявки
   - C1: Из валюты
   - D1: В валюту
   - E1: Сумма отправки
   - F1: Сумма получения
   - G1: Курс
   - H1: Маржа
   - I1: Hash получения
   - J1: Hash отправки
   - K1: Статус
   - L1: Адрес получателя

3. Скопируйте ID таблицы из URL (длинная строка между /d/ и /edit)

## Шаг 5: Предоставление доступа

1. В Google Sheets нажмите "Share" (Поделиться)
2. Добавьте email сервисного аккаунта из JSON файла (поле "client_email")
3. Дайте права "Editor" и нажмите "Send"

## Шаг 6: Настройка переменных окружения

Добавьте в файл `.env`:

```env
# Google Sheets настройки
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=email_из_json_файла
GOOGLE_PRIVATE_KEY="приватный_ключ_из_json_файла_в_кавычках"
```

**Важно:** Private key должен быть в кавычках и содержать все символы `\n` как есть.

## Пример переменных:

```env
GOOGLE_SHEETS_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
GOOGLE_SERVICE_ACCOUNT_EMAIL=exchange-logger@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANB...\n-----END PRIVATE KEY-----\n"
```

## Проверка работы

После настройки каждый завершенный обмен будет автоматически записываться в таблицу Google Sheets с полной информацией о сделке. 