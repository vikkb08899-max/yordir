require('dotenv').config();
const express = require('express');
const cors = require('cors');
const TronWeb = require('tronweb');
const app = express();
const https = require('https');

// Конфигурация TronWeb (подключаемся к тестовой сети Shasta)
const PRIVATE_KEY = process.env.PRIVATE_KEY || '01234567890abcdef01234567890abcdef01234567890abcdef01234567890abc';
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || 'TW5PbcV4RumU9pZBZ4sB1gZf4VgaLR8DXK';
const USDT_CONTRACT = process.env.USDT_CONTRACT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

const tronWeb = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io',
  privateKey: PRIVATE_KEY
});

// Глобальные переменные для хранения курсов
let currentRates = {}; // Для совместимости
let currentExchangeRates = {}; // Прямые курсы пар
let currentMargins = {
  'TRX-USDT': 2,
  'USDT-TRX': 3,
  'TRX-EUR': 5,
  'EUR-TRX': 7,
  'TRX-GBP': 4,
  'GBP-TRX': 6,
  'USDT-EUR': 3,
  'EUR-USDT': 5,
  'USDT-GBP': 4,
  'GBP-USDT': 6,
  'BTC-EUR': 2,
  'EUR-BTC': 3,
  'ETH-EUR': 2,
  'EUR-ETH': 3,
  'USDC-EUR': 3,
  'EUR-USDC': 5
};

let lastRatesUpdate = null;

// Функция для получения курсов с Binance
async function updateExchangeRates() {
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
              case 'EURUSDT':
                currentExchangeRates['EUR-USDT'] = parseFloat(item.price);
                currentExchangeRates['USDT-EUR'] = 1 / parseFloat(item.price);
                break;
              case 'GBPUSDT':
                currentExchangeRates['GBP-USDT'] = parseFloat(item.price);
                currentExchangeRates['USDT-GBP'] = 1 / parseFloat(item.price);
                break;
            }
          });

          // Вычисляем кросс-курсы через USDT
          if (currentExchangeRates['TRX-USDT'] && currentExchangeRates['EUR-USDT']) {
            currentExchangeRates['TRX-EUR'] = currentExchangeRates['TRX-USDT'] / currentExchangeRates['EUR-USDT'];
            currentExchangeRates['EUR-TRX'] = currentExchangeRates['EUR-USDT'] / currentExchangeRates['TRX-USDT'];
          }
          
          if (currentExchangeRates['TRX-USDT'] && currentExchangeRates['GBP-USDT']) {
            currentExchangeRates['TRX-GBP'] = currentExchangeRates['TRX-USDT'] / currentExchangeRates['GBP-USDT'];
            currentExchangeRates['GBP-TRX'] = currentExchangeRates['GBP-USDT'] / currentExchangeRates['TRX-USDT'];
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
          console.log(`   EUR/USDT: ${currentExchangeRates['EUR-USDT']?.toFixed(4) || 'N/A'}`);
          console.log(`   USDT/EUR: ${currentExchangeRates['USDT-EUR']?.toFixed(4) || 'N/A'}`);
          
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

// Настройка CORS и парсинга JSON
app.use(cors());
app.use(express.json());

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

// Старые API для совместимости
app.get('/rates', (req, res) => {
  res.json(currentRates);
});

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
  
  // Запускаем сервер
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
  });
  
  // Обновляем курсы каждую минуту
  setInterval(updateExchangeRates, 60000);
}

initializeServer().catch(console.error); 