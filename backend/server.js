require('dotenv').config();
const express = require('express');
const cors = require('cors');
const TronWeb = require('tronweb');
const app = express();
const https = require('https');

// Добавляем поддержку fetch для Node.js
let fetch;
try {
  fetch = require('node-fetch');
} catch (error) {
  console.error('❌ Ошибка загрузки node-fetch:', error.message);
  // Fallback для Node.js 18+ где fetch доступен глобально
  if (typeof global.fetch === 'function') {
    fetch = global.fetch;
  } else {
    console.error('❌ fetch недоступен');
  }
}

// Telegram Bot
let bot = null;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (TELEGRAM_BOT_TOKEN) {
  const TelegramBot = require('node-telegram-bot-api');
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
  
  // Команда /start с выбором языка
  bot.onText(/\/start/, async (msg) => {
    try {
      const chatId = msg.chat.id;
      
      const message = '🌐 Выберите язык / Select language:';
      const inlineKeyboard = [
        [
          { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
          { text: '🇺🇸 English', callback_data: 'lang_en' }
        ]
      ];
      
      await bot.sendMessage(chatId, message, {
        reply_markup: {
          inline_keyboard: inlineKeyboard
        }
      });
    } catch (error) {
      console.error('❌ Ошибка в команде /start:', error);
    }
  });
  
  // Простая команда для тестирования
  bot.onText(/\/test/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '🤖 Бот работает! Команда /test получена.');
  });
  
  // Команда для показа всех наценок
  bot.onText(/\/rates/, (msg) => {
    const chatId = msg.chat.id;
    
    let message = '📊 *Текущие наценки:*\n\n';
    const inlineKeyboard = [];
    
    // Группируем наценки по валютам
    const groupedMargins = {};
    Object.entries(currentMargins).forEach(([pair, margin]) => {
      const [from, to] = pair.split('-');
      if (!groupedMargins[to]) groupedMargins[to] = [];
      groupedMargins[to].push({ pair, margin });
      message += `${pair}: ${margin}%\n`;
    });
    
    // Добавляем кнопки для отдельных пар
    Object.entries(currentMargins).forEach(([pair, margin]) => {
      inlineKeyboard.push([{
        text: `${pair} (${margin}%)`,
        callback_data: `rate_${pair}`
      }]);
    });
    
    // Добавляем кнопки для массового изменения
    inlineKeyboard.push([
      { text: '💰 Все к USD', callback_data: 'mass_usd' },
      { text: '💶 Все к EUR', callback_data: 'mass_eur' }
    ]);
    inlineKeyboard.push([
      { text: '🇵🇱 Все к PLN', callback_data: 'mass_pln' },
      { text: '🇺🇦 Все к UAH', callback_data: 'mass_uah' }
    ]);
    
    bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: inlineKeyboard
      }
    });
  });
  
  // Команда для установки наценки
  bot.onText(/\/rate (\S+) (\d+(?:\.\d+)?)/, (msg, match) => {
    const chatId = msg.chat.id;
    const pair = match[1].toUpperCase();
    const margin = parseFloat(match[2]);
    
    if (margin < 0 || margin > 50) {
      bot.sendMessage(chatId, '❌ Наценка должна быть от 0 до 50%');
      return;
    }
    
    currentMargins[pair] = margin;
    bot.sendMessage(chatId, `✅ Наценка для пары ${pair} установлена: ${margin}%`);
  });

  // Команда для массового изменения наценок
  bot.onText(/\/mass (\S+) (\d+(?:\.\d+)?)/, (msg, match) => {
    const chatId = msg.chat.id;
    const currency = match[1].toUpperCase();
    const margin = parseFloat(match[2]);
    
    if (margin < 0 || margin > 50) {
      bot.sendMessage(chatId, '❌ Наценка должна быть от 0 до 50%');
      return;
    }
    
    const cryptos = ['TRX', 'BTC', 'ETH', 'USDC', 'SOL', 'USDT'];
    let updatedCount = 0;
    
    cryptos.forEach(crypto => {
      if (crypto !== currency) {
        const pair = `${crypto}-${currency}`;
        const reversePair = `${currency}-${crypto}`;
        currentMargins[pair] = margin;
        currentMargins[reversePair] = margin;
        updatedCount += 2;
      }
    });
    
    bot.sendMessage(chatId, `✅ Наценка ${margin}% установлена для ${updatedCount} пар к ${currency}`);
  });
  
  // Обработка callback запросов
  bot.on('callback_query', async (callbackQuery) => {
    try {
      const message = callbackQuery.message;
      const data = callbackQuery.data;
    
    if (data.startsWith('lang_')) {
      const language = data.replace('lang_', '');
      
      // Удаляем сообщение с выбором языка
      try {
        await bot.deleteMessage(message.chat.id, message.message_id);
      } catch (error) {
        console.log('⚠️ Не удалось удалить сообщение:', error.message);
      }
      
      // Отправляем приветственное сообщение на выбранном языке
      let welcomeMessage, buttonText;
      if (language === 'ru') {
        welcomeMessage = 'Добро пожаловать в обменный сервис CryptoXchange!\n\nЧтобы начать пользоваться нашим сервисом, нажмите кнопку ниже.';
        buttonText = 'Открыть приложение';
      } else {
        welcomeMessage = 'Welcome to CryptoXchange exchange service!\n\nTo start using our service, click the button below.';
        buttonText = 'Open App';
      }
      
      const inlineKeyboard = [
        [{
          text: buttonText,
          web_app: { url: `https://cryptoxchange.click?lang=${language}` }
        }]
      ];
      
      await bot.sendMessage(message.chat.id, welcomeMessage, {
        reply_markup: {
          inline_keyboard: inlineKeyboard
        }
      });
    } else if (data.startsWith('rate_')) {
      const pair = data.replace('rate_', '');
      const currentMargin = currentMargins[pair] || 0;
      
      bot.sendMessage(message.chat.id, 
        `Текущая наценка для ${pair}: ${currentMargin}%\n\n` +
        `Для изменения используйте команду:\n` +
        `/rate ${pair} НОВАЯ_НАЦЕНКА`
      );
    } else if (data.startsWith('mass_')) {
      const currency = data.replace('mass_', '').toUpperCase();
      const currentMargin = 5; // По умолчанию 5%
      
      bot.sendMessage(message.chat.id, 
        `Для установки наценки ${currentMargin}% на все пары к ${currency} используйте команду:\n` +
        `/mass ${currency} ${currentMargin}\n\n` +
        `Или для установки другой наценки:\n` +
        `/mass ${currency} НОВАЯ_НАЦЕНКА`
      );
    }
    
    await bot.answerCallbackQuery(callbackQuery.id);
    } catch (error) {
      console.error('❌ Ошибка в обработке callback_query:', error);
      try {
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Произошла ошибка' });
      } catch (e) {
        console.error('❌ Не удалось ответить на callback_query:', e);
      }
    }
  });
  
  console.log('✅ Telegram бот инициализирован');
  console.log('🤖 Токен бота:', TELEGRAM_BOT_TOKEN ? 'Настроен' : 'Не настроен');
  console.log('📱 Chat ID:', TELEGRAM_CHAT_ID ? 'Настроен' : 'Не настроен');
} else {
  console.log('⚠️  Telegram бот не настроен (отсутствует TELEGRAM_BOT_TOKEN)');
  console.log('🔧 Для настройки бота добавьте TELEGRAM_BOT_TOKEN в .env файл');
}

// Конфигурация TronWeb (подключаемся к мейннету Tron)
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const USDT_CONTRACT = process.env.USDT_CONTRACT;

if (!PRIVATE_KEY || !WALLET_ADDRESS || !USDT_CONTRACT) {
  console.error('❌ Не заданы обязательные переменные окружения: PRIVATE_KEY, WALLET_ADDRESS, USDT_CONTRACT');
  process.exit(1);
}

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: PRIVATE_KEY
});

// Глобальные переменные для хранения курсов
let currentRates = {}; // Для совместимости
let currentExchangeRates = {}; // Прямые курсы пар

// Хранилище активных заявок на обмен
let activeExchanges = new Map(); // requestId -> exchangeData

let currentMargins = {
  // Крипто-EUR пары (единственные с автоматическими курсами)
  'TRX-EUR': 5, 'EUR-TRX': 7,
  'BTC-EUR': 2, 'EUR-BTC': 3,
  'ETH-EUR': 2, 'EUR-ETH': 3,
  'SOL-EUR': 2, 'EUR-SOL': 3,
  'USDC-EUR': 3, 'EUR-USDC': 5,
  'USDT-EUR': 3, 'EUR-USDT': 5
};

let lastRatesUpdate = null;
let lastCheckedBlock = 0; // Последний проверенный блок

// Функция для получения курсов с Binance
async function updateBinanceRates() {
  console.log(`[${new Date().toLocaleTimeString()}] Обновляем курсы с Binance...`);
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.binance.com',
      path: '/api/v3/ticker/price',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TRX-Exchange-Platform/1.0'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            console.error(`❌ Ошибка HTTP: ${res.statusCode}`);
            resolve();
            return;
          }

          const priceData = JSON.parse(data);
          
          // Ищем нужные пары
          priceData.forEach(item => {
            switch(item.symbol) {
              case 'TRXUSDT':
                currentExchangeRates['TRX-USDT'] = parseFloat(item.price);
                currentExchangeRates['USDT-TRX'] = 1 / parseFloat(item.price);
                break;
              case 'BTCUSDT':
                currentExchangeRates['BTC-USDT'] = parseFloat(item.price);
                currentExchangeRates['USDT-BTC'] = 1 / parseFloat(item.price);
                break;
              case 'ETHUSDT':
                currentExchangeRates['ETH-USDT'] = parseFloat(item.price);
                currentExchangeRates['USDT-ETH'] = 1 / parseFloat(item.price);
                break;
              case 'USDCUSDT':
                currentExchangeRates['USDC-USDT'] = parseFloat(item.price);
                currentExchangeRates['USDT-USDC'] = 1 / parseFloat(item.price);
                break;
              case 'SOLUSDT':
                currentExchangeRates['SOL-USDT'] = parseFloat(item.price);
                currentExchangeRates['USDT-SOL'] = 1 / parseFloat(item.price);
                break;
              case 'EURUSDT':
                currentExchangeRates['EUR-USDT'] = parseFloat(item.price);
                currentExchangeRates['USDT-EUR'] = 1 / parseFloat(item.price);
                break;
              case 'USDUSDT':
                currentExchangeRates['USD-USDT'] = parseFloat(item.price);
                currentExchangeRates['USDT-USD'] = 1 / parseFloat(item.price);
                break;
              case 'PLNUSDT':
                currentExchangeRates['PLN-USDT'] = parseFloat(item.price);
                currentExchangeRates['USDT-PLN'] = 1 / parseFloat(item.price);
                break;
              case 'UAHUSDT':
                currentExchangeRates['UAH-USDT'] = parseFloat(item.price);
                currentExchangeRates['USDT-UAH'] = 1 / parseFloat(item.price);
                break;

            }
          });

          // Вычисляем кросс-курсы через USDT
          if (currentExchangeRates['TRX-USDT'] && currentExchangeRates['EUR-USDT']) {
            currentExchangeRates['TRX-EUR'] = currentExchangeRates['TRX-USDT'] / currentExchangeRates['EUR-USDT'];
            currentExchangeRates['EUR-TRX'] = currentExchangeRates['EUR-USDT'] / currentExchangeRates['TRX-USDT'];
          }
          


          if (currentExchangeRates['BTC-USDT'] && currentExchangeRates['EUR-USDT']) {
            currentExchangeRates['BTC-EUR'] = currentExchangeRates['BTC-USDT'] / currentExchangeRates['EUR-USDT'];
            currentExchangeRates['EUR-BTC'] = currentExchangeRates['EUR-USDT'] / currentExchangeRates['BTC-USDT'];
          }

          if (currentExchangeRates['ETH-USDT'] && currentExchangeRates['EUR-USDT']) {
            currentExchangeRates['ETH-EUR'] = currentExchangeRates['ETH-USDT'] / currentExchangeRates['EUR-USDT'];
            currentExchangeRates['EUR-ETH'] = currentExchangeRates['EUR-USDT'] / currentExchangeRates['ETH-USDT'];
          }

          if (currentExchangeRates['USDC-USDT'] && currentExchangeRates['EUR-USDT']) {
            currentExchangeRates['USDC-EUR'] = currentExchangeRates['USDC-USDT'] / currentExchangeRates['EUR-USDT'];
            currentExchangeRates['EUR-USDC'] = currentExchangeRates['EUR-USDT'] / currentExchangeRates['USDC-USDT'];
          }

          if (currentExchangeRates['SOL-USDT'] && currentExchangeRates['EUR-USDT']) {
            currentExchangeRates['SOL-EUR'] = currentExchangeRates['SOL-USDT'] / currentExchangeRates['EUR-USDT'];
            currentExchangeRates['EUR-SOL'] = currentExchangeRates['EUR-USDT'] / currentExchangeRates['SOL-USDT'];
          }

          // Кросс-курсы будут вычислены после получения всех базовых курсов

          // Обновляем старые курсы для совместимости
          if (currentExchangeRates['TRX-USDT']) {
            currentRates = {
              TRX_TO_USDT: currentExchangeRates['TRX-USDT'],
              USDT_TO_TRX: currentExchangeRates['USDT-TRX']
            };
          }

          lastRatesUpdate = new Date();
          console.log(`✅ Курсы обновлены [${lastRatesUpdate.toLocaleTimeString()}]`);
          console.log(`   TRX/USDT: ${currentExchangeRates['TRX-USDT']?.toFixed(6) || 'N/A'}`);
          console.log(`   SOL/USDT: ${currentExchangeRates['SOL-USDT']?.toFixed(4) || 'N/A'}`);
          console.log(`   EUR/USDT: ${currentExchangeRates['EUR-USDT']?.toFixed(4) || 'N/A'}`);
          console.log(`   BTC/EUR: ${currentExchangeRates['BTC-EUR']?.toFixed(2) || 'N/A'}`);
          console.log(`   SOL/EUR: ${currentExchangeRates['SOL-EUR']?.toFixed(2) || 'N/A'}`);
          console.log(`   ETH/EUR: ${currentExchangeRates['ETH-EUR']?.toFixed(2) || 'N/A'}`);
          console.log(`   TRX/EUR: ${currentExchangeRates['TRX-EUR']?.toFixed(6) || 'N/A'}`);
          
          resolve();

        } catch (error) {
          console.error('❌ Ошибка при парсинге курсов:', error.message);
          resolve();
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Ошибка при запросе курсов:', error.message);
      resolve();
    });

    req.on('timeout', () => {
      console.error('❌ Таймаут при запросе курсов');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

// Функция для получения курсов с альтернативных источников
async function updateAlternativeRates() {
  console.log(`[${new Date().toLocaleTimeString()}] Обновляем курсы с альтернативных источников...`);
  
  try {
    // 1. Получаем курсы с ExchangeRate-API (бесплатный)
    await updateExchangeRateAPI();
    
    // 2. Получаем курсы с Fixer.io (бесплатный)
    await updateFixerAPI();
    
    // 3. Получаем курсы с CurrencyAPI (бесплатный)
    await updateCurrencyAPI();
    
  } catch (error) {
    console.error('❌ Ошибка при получении альтернативных курсов:', error.message);
  }
}

// ExchangeRate-API (бесплатный, 1000 запросов/месяц)
async function updateExchangeRateAPI() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.exchangerate-api.com',
      path: '/v4/latest/USD',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TRX-Exchange-Platform/1.0'
      },
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            console.log(`⚠️ ExchangeRate-API: HTTP ${res.statusCode}`);
            resolve();
            return;
          }

          const rateData = JSON.parse(data);
          
          // Обновляем курсы USD к другим валютам
          if (rateData.rates) {
            // EUR/USD
            if (rateData.rates.EUR) {
              currentExchangeRates['EUR-USD'] = rateData.rates.EUR;
              currentExchangeRates['USD-EUR'] = 1 / rateData.rates.EUR;
            }
            
            // PLN/USD
            if (rateData.rates.PLN) {
              currentExchangeRates['PLN-USD'] = rateData.rates.PLN;
              currentExchangeRates['USD-PLN'] = 1 / rateData.rates.PLN;
            }
            
            // UAH/USD
            if (rateData.rates.UAH) {
              currentExchangeRates['UAH-USD'] = rateData.rates.UAH;
              currentExchangeRates['USD-UAH'] = 1 / rateData.rates.UAH;
            }
            
            console.log('✅ ExchangeRate-API курсы обновлены');
          }
          
          resolve();
        } catch (error) {
          console.error('❌ Ошибка парсинга ExchangeRate-API:', error.message);
          resolve();
        }
      });
    });

    req.on('error', (error) => {
      console.log('⚠️ ExchangeRate-API недоступен:', error.message);
      resolve();
    });

    req.on('timeout', () => {
      console.log('⚠️ ExchangeRate-API таймаут');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

// Fixer.io API (бесплатный, 100 запросов/месяц)
async function updateFixerAPI() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.fixer.io',
      path: '/latest?base=USD&symbols=EUR,PLN,UAH',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TRX-Exchange-Platform/1.0'
      },
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            console.log(`⚠️ Fixer.io: HTTP ${res.statusCode}`);
            resolve();
            return;
          }

          const rateData = JSON.parse(data);
          
          // Обновляем курсы USD к другим валютам
          if (rateData.rates) {
            // EUR/USD
            if (rateData.rates.EUR) {
              currentExchangeRates['EUR-USD'] = rateData.rates.EUR;
              currentExchangeRates['USD-EUR'] = 1 / rateData.rates.EUR;
            }
            
            // PLN/USD
            if (rateData.rates.PLN) {
              currentExchangeRates['PLN-USD'] = rateData.rates.PLN;
              currentExchangeRates['USD-PLN'] = 1 / rateData.rates.PLN;
            }
            
            // UAH/USD
            if (rateData.rates.UAH) {
              currentExchangeRates['UAH-USD'] = rateData.rates.UAH;
              currentExchangeRates['USD-UAH'] = 1 / rateData.rates.UAH;
            }
            
            console.log('✅ Fixer.io курсы обновлены');
          }
          
          resolve();
        } catch (error) {
          console.error('❌ Ошибка парсинга Fixer.io:', error.message);
          resolve();
        }
      });
    });

    req.on('error', (error) => {
      console.log('⚠️ Fixer.io недоступен:', error.message);
      resolve();
    });

    req.on('timeout', () => {
      console.log('⚠️ Fixer.io таймаут');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

// CurrencyAPI (бесплатный, 1000 запросов/месяц)
async function updateCurrencyAPI() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.currencyapi.com',
      path: '/v3/latest?apikey=cur_live_1234567890&currencies=EUR,PLN,UAH&base_currency=USD',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TRX-Exchange-Platform/1.0'
      },
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            console.log(`⚠️ CurrencyAPI: HTTP ${res.statusCode}`);
            resolve();
            return;
          }

          const rateData = JSON.parse(data);
          
          // Обновляем курсы USD к другим валютам
          if (rateData.data) {
            // EUR/USD
            if (rateData.data.EUR) {
              currentExchangeRates['EUR-USD'] = rateData.data.EUR.value;
              currentExchangeRates['USD-EUR'] = 1 / rateData.data.EUR.value;
            }
            
            // PLN/USD
            if (rateData.data.PLN) {
              currentExchangeRates['PLN-USD'] = rateData.data.PLN.value;
              currentExchangeRates['USD-PLN'] = 1 / rateData.data.PLN.value;
            }
            
            // UAH/USD
            if (rateData.data.UAH) {
              currentExchangeRates['UAH-USD'] = rateData.data.UAH.value;
              currentExchangeRates['USD-UAH'] = 1 / rateData.data.UAH.value;
            }
            
            console.log('✅ CurrencyAPI курсы обновлены');
          }
          
          resolve();
        } catch (error) {
          console.error('❌ Ошибка парсинга CurrencyAPI:', error.message);
          resolve();
        }
      });
    });

    req.on('error', (error) => {
      console.log('⚠️ CurrencyAPI недоступен:', error.message);
      resolve();
    });

    req.on('timeout', () => {
      console.log('⚠️ CurrencyAPI таймаут');
      req.destroy();
      resolve();
    });

    req.end();
  });
}

// Функция для вычисления только крипто-EUR курсов
function calculateCrossRates() {
  console.log('🔄 Вычисляем крипто-EUR курсы...');
  
  const cryptos = ['TRX', 'BTC', 'ETH', 'USDC', 'SOL'];
  
  // Вычисляем только курсы криптовалют к EUR
  cryptos.forEach(crypto => {
    if (currentExchangeRates[`${crypto}-USDT`] && currentExchangeRates['EUR-USDT']) {
      currentExchangeRates[`${crypto}-EUR`] = currentExchangeRates[`${crypto}-USDT`] / currentExchangeRates['EUR-USDT'];
      currentExchangeRates[`EUR-${crypto}`] = currentExchangeRates['EUR-USDT'] / currentExchangeRates[`${crypto}-USDT`];
    }
  });
  
  console.log('✅ Крипто-EUR курсы вычислены');
}

// Основная функция для обновления курсов
async function updateExchangeRates() {
  console.log(`[${new Date().toLocaleTimeString()}] Обновляем курсы...`);
  
  // Сначала получаем курсы с Binance
  await updateBinanceRates();
  
  // Затем получаем недостающие курсы с альтернативных источников
  await updateAlternativeRates();
  
  // Вычисляем все кросс-курсы
  calculateCrossRates();
}

// Настройка CORS для продакшена
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://exchangeproj-5cfc1hrki-vikbs-projects.vercel.app',
  'https://vercel.app',
  '*' // Временно разрешаем все
];

// Временно разрешаем все CORS запросы для отладки
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true
}));

// Добавляем заголовки для работы с ngrok
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json());

// Логирование всех запросов для отладки
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} from ${req.get('Origin') || 'no-origin'}`);
  next();
});

// API для получения курса конкретной пары с наценкой
app.get('/crypto-fiat-rate/:from/:to', async (req, res) => {
  const { from, to } = req.params;
  const pair = `${from.toUpperCase()}-${to.toUpperCase()}`;
  
  try {
    const baseRate = currentExchangeRates[pair];
    const margin = currentMargins[pair] || 0;
    
    if (!baseRate) {
      return res.status(400).json({
        success: false,
        error: `Неподдерживаемая валютная пара: ${pair}`
      });
    }

    const finalRate = baseRate * (1 + margin / 100);
    
    res.json({
      success: true,
      pair: pair,
      baseRate: parseFloat(baseRate.toFixed(8)),
      margin: margin,
      finalRate: parseFloat(finalRate.toFixed(8)),
      lastUpdate: lastRatesUpdate
    });

  } catch (error) {
    console.error('Ошибка при получении курса:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// API для получения всех курсов
app.get('/exchange-rates', (req, res) => {
  res.json({
    success: true,
    exchangeRates: currentExchangeRates,
    margins: currentMargins,
    lastUpdate: lastRatesUpdate
  });
});

// Прокси для CoinGecko API
app.get('/coingecko/:cryptoId/:fiatCurrency', async (req, res) => {
  try {
    const { cryptoId, fiatCurrency } = req.params;
    
    console.log(`🔄 Проксирование запроса: ${cryptoId}/${fiatCurrency}`);
    
    // Проверяем доступность fetch
    if (typeof fetch !== 'function') {
      throw new Error('fetch недоступен на сервере');
    }
    
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=${fiatCurrency}`;
    console.log(`📡 URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CryptoXchange/1.0',
        'Accept': 'application/json'
      }
    });
    
    console.log(`📊 Статус ответа: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ CoinGecko API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Получены данные:`, data);
    
    res.json({
      success: true,
      data: data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Ошибка проксирования CoinGecko API:', error.message);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// Альтернативный прокси для CoinGecko API с использованием https модуля
app.get('/coingecko-alt/:cryptoId/:fiatCurrency', (req, res) => {
  const { cryptoId, fiatCurrency } = req.params;
  
  console.log(`🔄 Альтернативное проксирование: ${cryptoId}/${fiatCurrency}`);
  
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=${fiatCurrency}`;
  
  const request = https.get(url, {
    headers: {
      'User-Agent': 'CryptoXchange/1.0',
      'Accept': 'application/json'
    }
  }, (response) => {
    console.log(`📊 Статус ответа: ${response.statusCode} ${response.statusMessage}`);
    
    let data = '';
    
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    response.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log(`✅ Получены данные:`, jsonData);
        
        // Проверяем на ошибки CoinGecko API
        if (jsonData.status && jsonData.status.error_code) {
          console.error(`❌ CoinGecko API error: ${jsonData.status.error_code} - ${jsonData.status.error_message}`);
          res.status(500).json({
            success: false,
            error: `CoinGecko API error: ${jsonData.status.error_code}`,
            details: jsonData.status.error_message
          });
          return;
        }
        
        res.json({
          success: true,
          data: jsonData,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Ошибка парсинга JSON:', error.message);
        res.status(500).json({
          success: false,
          error: 'Ошибка парсинга ответа',
          details: error.message
        });
      }
    });
  });
  
  request.on('error', (error) => {
    console.error('❌ Ошибка HTTPS запроса:', error.message);
    res.status(500).json({
      success: false,
      error: 'Ошибка HTTPS запроса',
      details: error.message
    });
  });
  
  request.setTimeout(10000, () => {
    console.error('❌ Таймаут HTTPS запроса');
    request.destroy();
    res.status(500).json({
      success: false,
      error: 'Таймаут запроса'
    });
  });
});

// Прокси для Coinpaprika API (bulk quotes)
app.get('/coinpaprika/:cryptoId', async (req, res) => {
  try {
    const { cryptoId } = req.params;
    const quotesParam = (req.query.quotes || 'USD').toString().toUpperCase();

    console.log(`🔄 Проксирование Coinpaprika: ${cryptoId} quotes=${quotesParam}`);

    const url = `https://api.coinpaprika.com/v1/tickers/${cryptoId}?quotes=${encodeURIComponent(quotesParam)}`;
    console.log(`📡 URL: ${url}`);

    if (typeof fetch !== 'function') {
      throw new Error('fetch недоступен на сервере');
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CryptoXchange/1.0',
        'Accept': 'application/json'
      }
    });

    console.log(`📊 Статус ответа: ${response.status} ${response.statusText}`);

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('❌ Ошибка парсинга ответа Coinpaprika:', text);
      throw new Error('Invalid JSON from Coinpaprika');
    }

    if (!response.ok) {
      console.error(`❌ Coinpaprika API error: ${response.status} ${response.statusText}`, data);
      throw new Error(`Coinpaprika API error: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Получены данные Coinpaprika');
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('❌ Ошибка проксирования Coinpaprika API:', error.message);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ success: false, error: error.message, details: error.stack });
  }
});

// API для получения всех наценок
app.get('/margins', (req, res) => {
  res.json({
    success: true,
    margins: currentMargins,
    lastUpdate: lastRatesUpdate
  });
});

// API для установки наценки
app.post('/margins/:pair', (req, res) => {
  const { pair } = req.params;
  const { margin } = req.body;
  
  if (typeof margin !== 'number' || margin < 0 || margin > 50) {
    return res.status(400).json({
      success: false,
      error: 'Наценка должна быть числом от 0 до 50'
    });
  }
  
  currentMargins[pair.toUpperCase()] = margin;
  
  res.json({
    success: true,
    pair: pair.toUpperCase(),
    margin: margin
  });
});

// API для создания заявки на обмен
app.post('/crypto-fiat-request', async (req, res) => {
  try {
    const { 
      exchangeType, 
      fromCurrency, 
      toCurrency, 
      fromAmount, 
      toAmount, 
      country, 
      city, 
      telegram, 
      whatsapp 
    } = req.body;

    // Проверяем обязательные поля
    if (!fromCurrency || !toCurrency || !fromAmount || !toAmount) {
      return res.status(400).json({
        success: false,
        error: 'Отсутствуют обязательные поля: fromCurrency, toCurrency, fromAmount, toAmount'
      });
    }

    // Получаем курс для валютной пары
    const pair = `${fromCurrency.toUpperCase()}-${toCurrency.toUpperCase()}`;
    const baseRate = currentExchangeRates[pair];
    const margin = currentMargins[pair] || 0;
    const finalRate = baseRate ? baseRate * (1 + margin / 100) : 0;

    // Формируем сообщение для Telegram
    const message = `🔄 *Новая заявка на обмен*\n\n` +
      `📊 *Тип:* ${exchangeType === 'crypto-to-fiat' ? 'Crypto → Fiat' : 'Fiat → Crypto'}\n` +
      `💱 *Пара:* ${fromCurrency} → ${toCurrency}\n` +
      `💰 *Сумма:* ${fromAmount} ${fromCurrency} → ${toAmount} ${toCurrency}\n` +
      `📈 *Курс:* ${finalRate?.toFixed(6) || 'N/A'} (наценка: ${margin}%)\n\n` +
      `🌍 *Локация:* ${city}, ${country}\n\n` +
      `📞 *Контакты:*\n` +
      `• Telegram: ${telegram || 'не указан'}\n` +
      `• WhatsApp: ${whatsapp || 'не указан'}\n\n` +
      `⏰ *Время:* ${new Date().toLocaleString('ru-RU')}`;

    // Отправляем в Telegram, если бот настроен
    if (bot && TELEGRAM_CHAT_ID) {
      try {
        await bot.sendMessage(TELEGRAM_CHAT_ID, message, { 
          parse_mode: 'Markdown' 
        });
        console.log('📤 Заявка отправлена в Telegram');
      } catch (error) {
        console.error('❌ Ошибка отправки в Telegram:', error.message);
      }
    }

    res.json({
      success: true,
      message: 'Заявка успешно создана',
      requestId: Date.now().toString(),
      exchangeType,
      pair,
      fromAmount,
      toAmount,
      rate: finalRate,
      country,
      city,
      contacts: { telegram, whatsapp }
    });

  } catch (error) {
    console.error('Ошибка при создании заявки:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Старые API для совместимости
app.get('/rates', (req, res) => {
  res.json(currentRates);
});

// API для классического обмена TRX/USDT
app.post('/exchange', async (req, res) => {
  try {
    const { fromCurrency, toCurrency, fromAmount, destinationAddress } = req.body;
    
    // Валидация входных данных
    if (!fromCurrency || !toCurrency || !fromAmount || !destinationAddress) {
      return res.status(400).json({
        success: false,
        error: 'Отсутствуют обязательные поля'
      });
    }
    
    // Проверяем поддерживаемые валюты
    if (!['TRX', 'USDT'].includes(fromCurrency) || !['TRX', 'USDT'].includes(toCurrency)) {
      return res.status(400).json({
        success: false,
        error: 'Поддерживаются только TRX и USDT'
      });
    }
    
    // Проверяем что валюты разные
    if (fromCurrency === toCurrency) {
      return res.status(400).json({
        success: false,
        error: 'Валюты обмена должны быть разными'
      });
    }
    
    // Получаем актуальный курс
    const pair = `${fromCurrency}-${toCurrency}`;
    const baseRate = currentExchangeRates[pair];
    const margin = currentMargins[pair] || 0;
    const finalRate = baseRate ? baseRate * (1 + margin / 100) : 0;
    
    if (!finalRate) {
      return res.status(400).json({
        success: false,
        error: 'Курс обмена недоступен'
      });
    }
    
    const toAmount = parseFloat(fromAmount) * finalRate;
    
    // Генерируем уникальный ID (timestamp + случайные цифры)
    const requestId = `${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Добавляем копейки для идентификации (последние 4 цифры ID)
    const identifierCents = parseInt(requestId.slice(-4)) / 10000; // 0.0001 - 0.9999
    const exactAmountToSend = parseFloat(fromAmount) + identifierCents;
    
    const exchangeData = {
      requestId,
      fromCurrency,
      toCurrency,
      fromAmount: parseFloat(fromAmount),
      exactAmountToSend: parseFloat(exactAmountToSend.toFixed(4)),
      toAmount: parseFloat(toAmount.toFixed(6)),
      rate: finalRate,
      margin,
      destinationAddress,
      paymentAddress: tronWeb.address.fromPrivateKey(PRIVATE_KEY),
      status: 'pending',
      createdAt: new Date().toISOString(),
      expirationTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      txHashReceived: null,
      txHashSent: null
    };
    
    // Сохраняем заявку в памяти
    activeExchanges.set(requestId, exchangeData);
    
    console.log(`📝 Создана заявка ${requestId}: ${exactAmountToSend} ${fromCurrency} → ${toAmount} ${toCurrency}`);
    
    // TODO: Записать в Google Таблицы
    
    // Возвращаем детали обмена
    res.json({
      success: true,
      requestId,
      fromCurrency,
      toCurrency,
      fromAmount: parseFloat(fromAmount),
      exactAmountToSend: exactAmountToSend,
      toAmount: parseFloat(toAmount.toFixed(6)),
      rate: finalRate,
      margin,
      destinationAddress,
      paymentAddress: exchangeData.paymentAddress,
      expirationTime: exchangeData.expirationTime,
      status: 'pending',
      message: `Отправьте точно ${exactAmountToSend} ${fromCurrency} на указанный адрес`
    });

  } catch (error) {
    console.error('Ошибка при создании обмена:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// API для тестирования отправки (без реальной отправки)
app.post('/test-send', async (req, res) => {
  try {
    const { currency, amount, toAddress } = req.body;
    
    console.log(`🧪 ТЕСТ отправки: ${amount} ${currency} на ${toAddress}`);
    
    // Проверяем баланс
    const walletAddress = tronWeb.address.fromPrivateKey(PRIVATE_KEY);
    
    if (currency === 'TRX') {
      const balance = await tronWeb.trx.getBalance(walletAddress);
      const balanceTrx = tronWeb.fromSun(balance);
      console.log(`   Баланс TRX: ${balanceTrx}`);
    }
    
    // Имитируем успешную отправку
    const fakeHash = `test_tx_${Date.now()}`;
    
    res.json({
      success: true,
      message: `ТЕСТ: отправка ${amount} ${currency} на ${toAddress}`,
      txHash: fakeHash,
      note: 'Это тестовая транзакция, реальная отправка не выполнена'
    });
    
  } catch (error) {
    console.error('Ошибка при тесте отправки:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API для проверки статуса обмена
app.get('/exchange/:requestId/status', async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const exchangeData = activeExchanges.get(requestId);
    
    if (!exchangeData) {
      return res.status(404).json({
        success: false,
        error: 'Заявка не найдена'
      });
    }
    
    // Проверяем не истекла ли заявка
    if (new Date() > new Date(exchangeData.expirationTime)) {
      exchangeData.status = 'expired';
      activeExchanges.set(requestId, exchangeData);
    }
    
    res.json({
      success: true,
      requestId,
      status: exchangeData.status,
      fromCurrency: exchangeData.fromCurrency,
      toCurrency: exchangeData.toCurrency,
      fromAmount: exchangeData.fromAmount,
      exactAmountToSend: exchangeData.exactAmountToSend,
      toAmount: exchangeData.toAmount,
      destinationAddress: exchangeData.destinationAddress,
      paymentAddress: exchangeData.paymentAddress,
      expirationTime: exchangeData.expirationTime,
      txHashReceived: exchangeData.txHashReceived,
      txHashSent: exchangeData.txHashSent,
      message: getStatusMessage(exchangeData.status)
    });

  } catch (error) {
    console.error('Ошибка при проверке статуса:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Функция для получения сообщения статуса
function getStatusMessage(status) {
  switch (status) {
    case 'pending':
      return 'Ожидание поступления средств';
    case 'processing':
      return 'Обрабатываем ваш платеж';
    case 'completed':
      return 'Обмен завершен успешно';
    case 'failed':
      return 'Ошибка при обработке платежа';
    case 'expired':
      return 'Время заявки истекло';
    default:
      return 'Неизвестный статус';
  }
}

// Запуск сервера
const PORT = process.env.PORT || 3000;

// Инициализация
async function initializeServer() {
  console.log('🚀 Запуск сервера...');
  
  // Получаем адрес кошелька
  const address = tronWeb.address.fromPrivateKey(PRIVATE_KEY);
  console.log('💼 Адрес кошелька:', address);
  console.log('🔗 Адрес кошелька (HEX):', tronWeb.address.toHex(address));
  
  // Первое обновление курсов
  await updateExchangeRates();
  console.log('Первое обновление курсов завершено');
  
  // Проверяем подключение к Tron сети
  try {
    const currentBlock = await tronWeb.trx.getCurrentBlock();
    console.log(`🔗 Подключение к Tron сети успешно. Текущий блок: ${currentBlock.block_header.raw_data.number}`);
    lastCheckedBlock = Date.now() - (10 * 60 * 1000); // Начинаем с 10 минут назад (timestamp)
  } catch (tronError) {
    console.error('❌ Ошибка подключения к Tron сети:', tronError.message);
    lastCheckedBlock = Date.now() - (10 * 60 * 1000); // Fallback
  }
  
  // Запускаем сервер
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
  });
  
  // Обновляем курсы каждые 15 минут
  setInterval(updateExchangeRates, 15 * 60 * 1000);
  
  // Мониторим входящие транзакции каждые 30 секунд
  setInterval(monitorIncomingTransactions, 30000);
}

// Функция для мониторинга входящих транзакций через TronGrid API
async function monitorIncomingTransactions() {
  try {
    if (activeExchanges.size === 0) return; // Нет активных заявок
    
    console.log(`[${new Date().toLocaleTimeString()}] 🔍 Проверяем входящие транзакции... (активных заявок: ${activeExchanges.size})`);
    
    const walletAddress = tronWeb.address.fromPrivateKey(PRIVATE_KEY);
    console.log(`   Мониторим адрес: ${walletAddress}`);
    
    // Проверяем TRX транзакции
    await checkTRXTransactions(walletAddress);
    
    // Проверяем USDT транзакции
    await checkUSDTTransactions(walletAddress);
    
  } catch (error) {
    console.error('❌ Ошибка при мониторинге транзакций:', error);
  }
}

// Функция для проверки TRX транзакций через TronGrid API
async function checkTRXTransactions(walletAddress) {
  try {
    const response = await fetch(`https://api.trongrid.io/v1/accounts/${walletAddress}/transactions?limit=20&only_to=true`);
    
    if (!response.ok) {
      console.log('   TRX API недоступен');
      return;
    }
    
    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      console.log('   TRX транзакции не найдены');
      return;
    }
    
    console.log(`   Найдено TRX транзакций: ${data.data.length}`);
    
    for (const tx of data.data) {
      // Пропускаем уже обработанные
      if (tx.block_timestamp <= lastCheckedBlock) continue;
      
      // Проверяем только входящие TRX транзакции
      if (tx.raw_data && tx.raw_data.contract && tx.raw_data.contract[0]) {
        const contract = tx.raw_data.contract[0];
        
        if (contract.type === 'TransferContract') {
          const parameter = contract.parameter.value;
          const toAddress = tronWeb.address.fromHex(parameter.to_address);
          const amount = tronWeb.fromSun(parameter.amount);
          
          if (toAddress === walletAddress) {
            console.log(`   ✅ Входящая TRX: ${amount} TRX (${tx.txID})`);
            await checkExchangeMatch('TRX', parseFloat(amount), tx.txID);
          }
        }
      }
    }
    
    // Обновляем последний проверенный timestamp
    if (data.data.length > 0) {
      lastCheckedBlock = Math.max(lastCheckedBlock, ...data.data.map(tx => tx.block_timestamp));
    }
    
  } catch (error) {
    console.error('   ❌ Ошибка при проверке TRX транзакций:', error.message);
  }
}

// Функция для проверки USDT транзакций через TronGrid API
async function checkUSDTTransactions(walletAddress) {
  try {
    const response = await fetch(`https://api.trongrid.io/v1/accounts/${walletAddress}/transactions/trc20?limit=20&contract_address=${USDT_CONTRACT}`);
    
    if (!response.ok) {
      console.log('   USDT API недоступен');
      return;
    }
    
    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      console.log('   USDT транзакции не найдены');
      return;
    }
    
    console.log(`   Найдено USDT транзакций: ${data.data.length}`);
    
    for (const tx of data.data) {
      // Пропускаем уже обработанные
      if (tx.block_timestamp <= lastCheckedBlock) continue;
      
      // Проверяем только входящие USDT транзакции
      if (tx.to === walletAddress) {
        const amount = parseFloat(tx.value) / 1000000; // USDT имеет 6 десятичных знаков
        console.log(`   ✅ Входящая USDT: ${amount} USDT (${tx.transaction_id})`);
        await checkExchangeMatch('USDT', amount, tx.transaction_id);
      }
    }
    
    // Обновляем последний проверенный timestamp
    if (data.data.length > 0) {
      lastCheckedBlock = Math.max(lastCheckedBlock, ...data.data.map(tx => tx.block_timestamp));
    }
    
  } catch (error) {
    console.error('   ❌ Ошибка при проверке USDT транзакций:', error.message);
  }
}



// Функция для поиска соответствующей заявки на обмен
async function checkExchangeMatch(currency, amount, txHash) {
  console.log(`💰 Получена транзакция: ${amount} ${currency} (${txHash})`);
  
  // Ищем подходящую заявку
  for (const [requestId, exchangeData] of activeExchanges) {
    if (exchangeData.status !== 'pending') continue;
    if (exchangeData.fromCurrency !== currency) continue;
    
    // Проверяем точное совпадение суммы (с копейками до 4 знаков)
    const difference = Math.abs(amount - exchangeData.exactAmountToSend);
    
    if (difference < 0.0001) { // Погрешность в 0.0001 для 4 знаков
      console.log(`✅ Найдена заявка ${requestId} для транзакции ${txHash}`);
      
      // Обновляем статус заявки
      exchangeData.status = 'processing';
      exchangeData.txHashReceived = txHash;
      activeExchanges.set(requestId, exchangeData);
      
      // Отправляем средства клиенту
      await sendExchangeToClient(exchangeData);
      break;
    }
  }
}

// Функция для отправки средств клиенту
async function sendExchangeToClient(exchangeData) {
  try {
    console.log(`📤 Отправляем ${exchangeData.toAmount} ${exchangeData.toCurrency} на ${exchangeData.destinationAddress}`);
    
    let txHash = null;
    
    if (exchangeData.toCurrency === 'TRX') {
      // Отправляем TRX
      const transaction = await tronWeb.trx.sendTransaction(
        exchangeData.destinationAddress,
        tronWeb.toSun(exchangeData.toAmount)
      );
      txHash = transaction.txid;
      
    } else if (exchangeData.toCurrency === 'USDT') {
      // Отправляем USDT (TRC20)
      const contract = await tronWeb.contract().at(USDT_CONTRACT);
      const transaction = await contract.transfer(
        exchangeData.destinationAddress,
        Math.floor(exchangeData.toAmount * 1000000) // USDT имеет 6 десятичных знаков
      ).send();
      txHash = transaction;
    }
    
    if (txHash) {
      // Обновляем статус заявки
      exchangeData.status = 'completed';
      exchangeData.txHashSent = txHash;
      activeExchanges.set(exchangeData.requestId, exchangeData);
      
      console.log(`✅ Обмен ${exchangeData.requestId} завершен. TX: ${txHash}`);
      
      // Записываем в Google Таблицы
      await logExchangeToGoogleSheets(exchangeData);
      
    } else {
      throw new Error('Не удалось получить hash транзакции');
    }
    
  } catch (error) {
    console.error(`❌ Ошибка при отправке средств для заявки ${exchangeData.requestId}:`, error.message);
    
    // Помечаем заявку как неудачную
    exchangeData.status = 'failed';
    activeExchanges.set(exchangeData.requestId, exchangeData);
  }
}

// Функция для записи обмена в Google Sheets
async function logExchangeToGoogleSheets(exchangeData) {
  try {
    const { google } = require('googleapis');
    
    // Настройки Google Sheets (нужно настроить в .env)
    const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
    const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!GOOGLE_SHEETS_ID || !GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      console.log('📊 Google Sheets не настроен - логируем в консоль:', {
        requestId: exchangeData.requestId,
        date: new Date().toISOString(),
        fromCurrency: exchangeData.fromCurrency,
        toCurrency: exchangeData.toCurrency,
        fromAmount: exchangeData.fromAmount,
        toAmount: exchangeData.toAmount,
        rate: exchangeData.rate,
        margin: exchangeData.margin,
        txHashReceived: exchangeData.txHashReceived,
        txHashSent: exchangeData.txHashSent,
        status: exchangeData.status
      });
      return;
    }

    // Настройка аутентификации
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Данные для записи
    const row = [
      new Date().toISOString(), // Дата
      exchangeData.requestId, // ID заявки
      exchangeData.fromCurrency, // Из валюты
      exchangeData.toCurrency, // В валюту
      exchangeData.fromAmount, // Сумма отправки
      exchangeData.toAmount, // Сумма получения
      exchangeData.rate, // Курс
      exchangeData.margin + '%', // Маржа
      exchangeData.txHashReceived || '', // Hash получения
      exchangeData.txHashSent || '', // Hash отправки
      exchangeData.status, // Статус
      exchangeData.destinationAddress || '' // Адрес получателя
    ];

    // Запись в таблицу
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: 'A:L', // Столбцы A-L
      valueInputOption: 'RAW',
      resource: {
        values: [row],
      },
    });

    console.log('✅ Обмен записан в Google Sheets:', exchangeData.requestId);
    
  } catch (error) {
    console.error('❌ Ошибка при записи в Google Sheets:', error.message);
    
    // Fallback - логируем в консоль
    console.log('📊 Fallback - логируем в консоль:', {
      requestId: exchangeData.requestId,
      date: new Date().toISOString(),
      fromCurrency: exchangeData.fromCurrency,
      toCurrency: exchangeData.toCurrency,
      fromAmount: exchangeData.fromAmount,
      toAmount: exchangeData.toAmount,
      rate: exchangeData.rate,
      margin: exchangeData.margin,
      txHashReceived: exchangeData.txHashReceived,
      txHashSent: exchangeData.txHashSent,
      status: exchangeData.status
    });
  }
}

initializeServer().catch(console.error); 