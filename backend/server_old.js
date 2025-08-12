require('dotenv').config();
const express = require('express');
const cors = require('cors');
const TronWeb = require('tronweb');
const app = express();
const https = require('https');

// Конфигурация TronWeb (подключаемся к тестовой сети Shasta)
const PRIVATE_KEY = process.env.PRIVATE_KEY || '01234567890abcdef01234567890abcdef01234567890abcdef01234567890abc'; // Тестовый ключ
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || 'TW5PbcV4RumU9pZBZ4sB1gZf4VgaLR8DXK'; // Тестовый адрес
const USDT_CONTRACT = process.env.USDT_CONTRACT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // Контракт USDT в тестовой сети

const tronWeb = new TronWeb({
  fullHost: 'https://api.shasta.trongrid.io', // Тестовая сеть Shasta
  privateKey: PRIVATE_KEY
});

// Курсы обмена (фиксированные базовые значения)
const EXCHANGE_RATES = {
  TRX_TO_USDT: 0.085,  // 1 TRX = 0.085 USDT (будет обновлено)
  USDT_TO_TRX: 11.76   // 1 USDT = 11.76 TRX (будет обновлено)
};

// Курсы валютных пар (будут обновляться с Binance)
let currentExchangeRates = {
  // Crypto pairs
  'TRXUSDT': 0.085,
  'BTCUSDT': 43000,
  'ETHUSDT': 2500,
  'USDCUSDT': 1.0,
  // Fiat pairs (EUR/USD, GBP/USD)
  'EURUSD': 1.08,
  'GBPUSD': 1.26
};

// Наценки для торговых пар (в процентах)
const TRADING_MARGINS = {
  // Crypto to Fiat
  'TRX-EUR': 5,
  'TRX-USD': 5,
  'TRX-GBP': 5,
  'USDT-EUR': 3,
  'USDT-USD': 3,
  'USDT-GBP': 3,
  'BTC-EUR': 2,
  'BTC-USD': 2,
  'BTC-GBP': 2,
  'ETH-EUR': 2,
  'ETH-USD': 2,
  'ETH-GBP': 2,
  'USDC-EUR': 3,
  'USDC-USD': 3,
  'USDC-GBP': 3,
  // Fiat to Crypto (обратные пары)
  'EUR-TRX': 7,
  'USD-TRX': 7,
  'GBP-TRX': 7,
  'EUR-USDT': 5,
  'USD-USDT': 5,
  'GBP-USDT': 5,
  'EUR-BTC': 3,
  'USD-BTC': 3,
  'GBP-BTC': 3,
  'EUR-ETH': 3,
  'USD-ETH': 3,
  'GBP-ETH': 3,
  'EUR-USDC': 5,
  'USD-USDC': 5,
  'GBP-USDC': 5
};

// Последние курсы и время последнего обновления
let lastRatesUpdate = null;
let currentRates = { ...EXCHANGE_RATES };
let currentCryptoRates = { ...CRYPTO_RATES };
let currentFiatRates = { ...FIAT_RATES };
let currentMargins = { ...TRADING_MARGINS };

// Функция для получения актуальных курсов всех криптовалют и фиатных валют
async function updateExchangeRates() {
  console.log(`[${new Date().toLocaleTimeString()}] Начинаем обновление курсов всех валют...`);
  
  return new Promise((resolve, reject) => {
    // Получаем курсы криптовалют
    const cryptoOptions = {
      hostname: 'api.coingecko.com',
      path: '/api/v3/simple/price?ids=tron,bitcoin,ethereum,tether,usd-coin&vs_currencies=usd',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TRX-Exchange-Platform/1.0'
      },
      timeout: 10000
    };

    // Сначала получаем курсы криптовалют
    const cryptoReq = https.request(cryptoOptions, (res) => {
      let cryptoData = '';
      
      res.on('data', (chunk) => {
        cryptoData += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            console.error(`Ошибка HTTP: ${res.statusCode} при получении курсов криптовалют`);
            resolve({ currentRates, currentCryptoRates, currentFiatRates });
            return;
          }

          const cryptoPriceData = JSON.parse(cryptoData);
          console.log('📊 Получены курсы криптовалют:', cryptoPriceData);
          
          // Обновляем курсы криптовалют
          if (cryptoPriceData.tron?.usd) {
            currentCryptoRates.TRX = parseFloat(cryptoPriceData.tron.usd);
          }
          if (cryptoPriceData.bitcoin?.usd) {
            currentCryptoRates.BTC = parseFloat(cryptoPriceData.bitcoin.usd);
          }
          if (cryptoPriceData.ethereum?.usd) {
            currentCryptoRates.ETH = parseFloat(cryptoPriceData.ethereum.usd);
          }
          if (cryptoPriceData.tether?.usd) {
            currentCryptoRates.USDT = parseFloat(cryptoPriceData.tether.usd);
          }
          if (cryptoPriceData['usd-coin']?.usd) {
            currentCryptoRates.USDC = parseFloat(cryptoPriceData['usd-coin'].usd);
          }

          // Обновляем старые курсы для совместимости
          if (currentCryptoRates.TRX > 0) {
            const trxToUsdt = parseFloat(currentCryptoRates.TRX.toFixed(6));
            const usdtToTrx = parseFloat((1 / currentCryptoRates.TRX).toFixed(6));
            
            currentRates = {
              TRX_TO_USDT: trxToUsdt,
              USDT_TO_TRX: usdtToTrx
            };
          }

          // Теперь получаем курсы фиатных валют
          getFiatRates().then(() => {
            lastRatesUpdate = new Date();
            
            console.log(`✅ Все курсы обновлены [${lastRatesUpdate.toLocaleTimeString()}]:`);
            console.log(`   Криптовалюты:`, currentCryptoRates);
            console.log(`   Фиатные валюты:`, currentFiatRates);
            
            resolve({ currentRates, currentCryptoRates, currentFiatRates });
          }).catch(() => {
            resolve({ currentRates, currentCryptoRates, currentFiatRates });
          });
          
        } catch (error) {
          console.error('❌ Ошибка при парсинге курсов криптовалют:', error);
          resolve({ currentRates, currentCryptoRates, currentFiatRates });
        }
      });
    });
    
    cryptoReq.on('error', (error) => {
      console.error('❌ Ошибка сетевого запроса курсов криптовалют:', error.message);
      resolve({ currentRates, currentCryptoRates, currentFiatRates });
    });

    cryptoReq.on('timeout', () => {
      console.error('❌ Таймаут при получении курсов криптовалют');
      cryptoReq.destroy();
      resolve({ currentRates, currentCryptoRates, currentFiatRates });
    });
    
    cryptoReq.setTimeout(10000);
    cryptoReq.end();
  });
}

// Функция для получения курсов фиатных валют
async function getFiatRates() {
  return new Promise((resolve, reject) => {
    const fiatOptions = {
      hostname: 'api.exchangerate-api.com',
      path: '/v4/latest/USD',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TRX-Exchange-Platform/1.0'
      },
      timeout: 8000
    };

    const fiatReq = https.request(fiatOptions, (res) => {
      let fiatData = '';
      
      res.on('data', (chunk) => {
        fiatData += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            console.error(`Ошибка HTTP: ${res.statusCode} при получении курсов фиатных валют`);
            resolve(currentFiatRates);
            return;
          }

          const fiatPriceData = JSON.parse(fiatData);
          
          if (fiatPriceData.rates) {
            // Обновляем курсы фиатных валют (все к USD)
            // API возвращает: 1 USD = X EUR, но нам нужно: 1 EUR = Y USD
            currentFiatRates.USD = 1.0;
            if (fiatPriceData.rates.EUR) {
              currentFiatRates.EUR = 1 / parseFloat(fiatPriceData.rates.EUR); // 1 EUR = Y USD
            }
            if (fiatPriceData.rates.GBP) {
              currentFiatRates.GBP = 1 / parseFloat(fiatPriceData.rates.GBP); // 1 GBP = Y USD
            }

            console.log('💱 Курсы фиатных валют обновлены:', currentFiatRates);
            resolve(currentFiatRates);
          } else {
            console.error('❌ Не удалось получить курсы фиатных валют');
            resolve(currentFiatRates);
          }
        } catch (error) {
          console.error('❌ Ошибка при парсинге курсов фиатных валют:', error);
          resolve(currentFiatRates);
        }
      });
    });

    fiatReq.on('error', (error) => {
      console.error('❌ Ошибка сетевого запроса курсов фиатных валют:', error.message);
      resolve(currentFiatRates);
    });

    fiatReq.on('timeout', () => {
      console.error('❌ Таймаут при получении курсов фиатных валют');
      fiatReq.destroy();
      resolve(currentFiatRates);
    });
    
    fiatReq.setTimeout(8000);
    fiatReq.end();
  });
}

// Обновляем курсы при запуске и затем каждую минуту
updateExchangeRates()
  .then(() => {
    console.log('Первое обновление курсов завершено');
    // Запускаем периодическое обновление курсов каждую минуту
    setInterval(updateExchangeRates, 60 * 1000); // 1 минута
  })
  .catch(error => {
    console.error('Ошибка при первом обновлении курсов:', error);
  });

// Здесь храним заявки на обмен (в реальном приложении использовали бы базу данных)
const exchangeRequests = new Map();

// Функция для получения всех входящих транзакций с помощью TronGrid API
async function getIncomingTransactions(address) {
  return new Promise((resolve, reject) => {
    // Используем непосредственно HTTPS вместо axios для надежности
    const options = {
      hostname: 'api.shasta.trongrid.io',
      path: `/v1/accounts/${address}/transactions?only_to=true&limit=20`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'TRON-PRO-API-KEY': process.env.TRON_API_KEY || ''
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const transactions = JSON.parse(data);
          console.log(`Получено ${transactions.data ? transactions.data.length : 0} транзакций через TronGrid API`);
          resolve(transactions.data || []);
        } catch (error) {
          console.error('Ошибка при парсинге ответа TronGrid:', error);
          resolve([]);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Ошибка запроса TronGrid:', error);
      resolve([]);
    });
    
    req.end();
  });
}

// Функция для получения деталей TRC20 транзакций для адреса
async function getTRC20Transactions(address) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.shasta.trongrid.io',
      path: `/v1/accounts/${address}/transactions/trc20?limit=20`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'TRON-PRO-API-KEY': process.env.TRON_API_KEY || ''
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const transactions = JSON.parse(data);
          console.log(`Получено ${transactions.data ? transactions.data.length : 0} TRC20 транзакций через TronGrid API`);
          resolve(transactions.data || []);
        } catch (error) {
          console.error('Ошибка при парсинге ответа TRC20 TronGrid:', error);
          resolve([]);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Ошибка запроса TRC20 TronGrid:', error);
      resolve([]);
    });
    
    req.end();
  });
}

// Middleware
app.use(cors());
app.use(express.json());

// Информация о кошельке и балансе платформы
app.get('/wallet-info', async (req, res) => {
  try {
    const balance = await tronWeb.trx.getBalance(WALLET_ADDRESS);
    let usdtBalance = '0';
    
    try {
      const usdtContract = await tronWeb.contract().at(USDT_CONTRACT);
      const usdtResult = await usdtContract.balanceOf(WALLET_ADDRESS).call();
      usdtBalance = tronWeb.fromSun(usdtResult);
    } catch (usdtError) {
      console.error('Ошибка при получении баланса USDT:', usdtError);
    }
    
    res.json({
      success: true,
      address: WALLET_ADDRESS,
      hexAddress: tronWeb.address.toHex(WALLET_ADDRESS),
      trxBalance: tronWeb.fromSun(balance),
      usdtBalance,
      network: 'shasta testnet',
      isPrivateKeyValid: !!tronWeb.defaultPrivateKey
    });
  } catch (error) {
    console.error('Ошибка при получении информации о кошельке:', error);
    res.status(500).json({ error: error.message });
  }
});

// Проверка конкретной транзакции
app.post('/check-transaction', async (req, res) => {
  const { txHash, requestId } = req.body;
  
  if (!txHash) {
    return res.status(400).json({ error: 'Необходимо указать хэш транзакции' });
  }
  
  try {
    // Проверяем транзакцию по хешу
    const txInfo = await tronWeb.trx.getTransaction(txHash);
    console.log('Информация о транзакции:', JSON.stringify(txInfo));
    
    // Если транзакция найдена и есть requestId, пробуем обработать
    if (txInfo && requestId && exchangeRequests.has(requestId)) {
      const request = exchangeRequests.get(requestId);
      
      if (request.from === 'TRX') {
        await processTrxPayment(request, txInfo);
        return res.json({ 
          success: true, 
          message: 'Транзакция обработана',
          request: {
            status: request.status,
            txHash: request.txHash
          }
        });
      } else if (request.from === 'USDT') {
        await processUsdtPayment(request, { result: { to: WALLET_ADDRESS } });
        return res.json({ 
          success: true, 
          message: 'Транзакция обработана',
          request: {
            status: request.status,
            txHash: request.txHash
          }
        });
      }
    }
    
    // Просто возвращаем информацию о транзакции
    res.json({ success: true, transaction: txInfo });
  } catch (error) {
    console.error('Ошибка при проверке транзакции:', error);
    res.status(500).json({ error: error.message });
  }
});

// Временный метод для тестирования - симуляция получения платежа
app.post('/simulate-payment', async (req, res) => {
  const { requestId } = req.body;
  
  if (!requestId || !exchangeRequests.has(requestId)) {
    return res.status(404).json({ error: 'Заявка не найдена' });
  }
  
  const request = exchangeRequests.get(requestId);
  
  try {
    if (request.to === 'TRX') {
      // Отправляем TRX
      console.log(`Симулируем отправку ${request.toAmount} TRX на адрес ${request.destinationAddress}`);
      const tx = await tronWeb.trx.sendTransaction(
        request.destinationAddress,
        tronWeb.toSun(request.toAmount)
      );
      
      console.log(`TRX успешно отправлены: ${JSON.stringify(tx)}`);
      
      request.status = 'completed';
      request.txHash = tx.txid;
      exchangeRequests.set(requestId, request);
      
      res.json({ success: true, txHash: tx.txid });
    } else if (request.to === 'USDT') {
      console.log(`Симулируем отправку ${request.toAmount} USDT на адрес ${request.destinationAddress}`);
      const usdtContract = await tronWeb.contract().at(USDT_CONTRACT);
      
      // Отправляем USDT
      const tx = await usdtContract.transfer(
        request.destinationAddress,
        tronWeb.toSun(request.toAmount)
      ).send();
      
      console.log(`USDT успешно отправлены: ${tx}`);
      
      request.status = 'completed';
      request.txHash = tx;
      exchangeRequests.set(requestId, request);
      
      res.json({ success: true, txHash: tx });
    }
  } catch (error) {
    console.error('Ошибка при симуляции оплаты:', error);
    res.status(500).json({ error: error.message });
  }
});

// Маршруты API
app.post('/exchange-request', async (req, res) => {
  try {
    const { from, to, amount, destinationAddress } = req.body;
    
    // Валидация
    if (!from || !to || !amount || !destinationAddress) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }
    
    if (from !== 'TRX' && from !== 'USDT') {
      return res.status(400).json({ error: 'Поддерживаются только валюты TRX и USDT' });
    }
    
    if (to !== 'TRX' && to !== 'USDT') {
      return res.status(400).json({ error: 'Поддерживаются только валюты TRX и USDT' });
    }
    
    if (from === to) {
      return res.status(400).json({ error: 'Валюты отправления и получения должны отличаться' });
    }
    
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Сумма должна быть положительным числом' });
    }
    
    // Проверка адреса Tron
    if (!tronWeb.isAddress(destinationAddress)) {
      return res.status(400).json({ error: 'Некорректный адрес TRON' });
    }
    
    // Расчет суммы к получению с использованием актуальных курсов
    const amountFloat = parseFloat(amount);
    let toAmount;
    let exchangeRate;
    
    if (from === 'TRX' && to === 'USDT') {
      exchangeRate = currentRates.TRX_TO_USDT;
      toAmount = amountFloat * exchangeRate; // 1 TRX = X USDT
    } else {
      exchangeRate = currentRates.USDT_TO_TRX;
      toAmount = amountFloat * exchangeRate; // 1 USDT = Y TRX
    }
    
    // Генерация уникального идентификатора платежа для упрощения идентификации
    const paymentId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    // Точная сумма с "подписью"
    const exactAmount = parseFloat((amountFloat + parseFloat('0.' + paymentId)).toFixed(6));
    
    // Генерируем ID заявки
    const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // Сохраняем заявку
    const expirationTime = Date.now() + 15 * 60 * 1000; // 15 минут
    
    exchangeRequests.set(requestId, {
      id: requestId,
      from,
      to,
      fromAmount: exactAmount, // Используем точную сумму с "подписью"
      originalAmount: amountFloat, // Сохраняем оригинальную сумму
      toAmount,
      destinationAddress,
      status: 'pending',
      createdAt: Date.now(),
      expirationTime,
      txHash: null,
      paymentId // Сохраняем ID платежа
    });
    
    // Возвращаем данные для оплаты
    res.json({
      success: true,
      requestId,
      paymentDetails: {
        address: WALLET_ADDRESS,
        amount: exactAmount, // Точная сумма с "подписью"
        originalAmount: amountFloat, // Оригинальная сумма
        paymentId, // Уникальный ID для идентификации платежа
        currency: from,
        toReceive: toAmount.toFixed(6),
        toCurrency: to,
        exchangeRate: from === 'TRX' ? currentRates.TRX_TO_USDT : currentRates.USDT_TO_TRX,
        expirationTime: new Date(expirationTime).toISOString(),
        message: `Пожалуйста, отправьте точно указанную сумму ${exactAmount} в течение 15 минут для идентификации вашего платежа`
      }
    });
    
    // Запускаем немедленную проверку транзакций после создания заявки
    setTimeout(() => {
      checkTransactions().catch(error => {
        console.error('Ошибка при немедленной проверке транзакций:', error);
      });
    }, 5000); // Через 5 секунд после создания заявки
    
  } catch (error) {
    console.error('Ошибка при создании заявки:', error);
    res.status(500).json({ error: 'Произошла внутренняя ошибка сервера' });
  }
});

// API для получения всех курсов
app.get('/exchange-rates', (req, res) => {
  res.json({
    success: true,
    rates: currentRates,
    cryptoRates: currentCryptoRates,
    fiatRates: currentFiatRates,
    lastUpdate: lastRatesUpdate ? lastRatesUpdate.toISOString() : null
  });
});

// API для получения курса конкретной пары с наценкой
app.get('/crypto-fiat-rate/:from/:to', (req, res) => {
  const { from, to } = req.params;
  const pair = `${from.toUpperCase()}-${to.toUpperCase()}`;
  
  try {
    const fromRate = currentCryptoRates[from.toUpperCase()] || currentFiatRates[from.toUpperCase()];
    const toRate = currentFiatRates[to.toUpperCase()] || currentCryptoRates[to.toUpperCase()];
    const margin = currentMargins[pair] || 0;
    
    if (!fromRate || !toRate) {
      return res.status(400).json({
        success: false,
        error: 'Неподдерживаемая валютная пара'
      });
    }
    
    // Рассчитываем базовый курс
    let baseRate;
    
    // Специальная обработка для USDT/USDC (так как они ≈ USD)
    if ((from.toUpperCase() === 'USDT' || from.toUpperCase() === 'USDC') && to.toUpperCase() !== 'USD' && currentFiatRates[to.toUpperCase()]) {
      // USDT/USDC to Fiat: 1 USD / цена фиата в USD
      // Например: EUR = 1.17 USD/EUR -> 1 USDT = 1/1.17 = 0.853 EUR
      baseRate = 1 / toRate;
    } else if (from.toUpperCase() !== 'USD' && currentFiatRates[from.toUpperCase()] && (to.toUpperCase() === 'USDT' || to.toUpperCase() === 'USDC')) {
      // Fiat to USDT/USDC: цена фиата в USD / 1 USD
      // Например: EUR = 1.17 USD/EUR -> 1 EUR = 1.17 USDT
      baseRate = fromRate;
    } else if (currentCryptoRates[from.toUpperCase()] && currentFiatRates[to.toUpperCase()]) {
      // Crypto to Fiat: цена крипты в USD / цена фиата в USD
      // Например: TRX = 0.3 USD, EUR = 1.17 USD/EUR -> 1 TRX = 0.3/1.17 = 0.256 EUR
      baseRate = fromRate / toRate;
    } else if (currentFiatRates[from.toUpperCase()] && currentCryptoRates[to.toUpperCase()]) {
      // Fiat to Crypto: цена фиата в USD / цена крипты в USD  
      // Например: EUR = 1.17 USD/EUR, TRX = 0.3 USD -> 1 EUR = 1.17/0.3 = 3.9 TRX
      baseRate = fromRate / toRate;
    } else {
      baseRate = fromRate / toRate;
    }
    
    // Применяем наценку
    const finalRate = baseRate * (1 + margin / 100);
    
    res.json({
      success: true,
      pair,
      baseRate: parseFloat(baseRate.toFixed(8)),
      margin: margin,
      finalRate: parseFloat(finalRate.toFixed(8)),
      lastUpdate: lastRatesUpdate ? lastRatesUpdate.toISOString() : null
    });
  } catch (error) {
    console.error('Ошибка при расчете курса:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при расчете курса'
    });
  }
});

// API для управления наценками
app.get('/margins', (req, res) => {
  res.json({
    success: true,
    margins: currentMargins
  });
});

app.post('/margins/:pair', (req, res) => {
  const { pair } = req.params;
  const { margin } = req.body;
  
  if (typeof margin !== 'number' || margin < 0 || margin > 100) {
    return res.status(400).json({
      success: false,
      error: 'Наценка должна быть числом от 0 до 100'
    });
  }
  
  currentMargins[pair.toUpperCase()] = margin;
  
  console.log(`📊 Наценка для пары ${pair.toUpperCase()} установлена: ${margin}%`);
  
  res.json({
    success: true,
    pair: pair.toUpperCase(),
    margin: margin
  });
});

// API для создания заявки на Crypto-Fiat обмен
app.post('/crypto-fiat-request', async (req, res) => {
  try {
    const { 
      type, 
      country, 
      city, 
      crypto, 
      fiat, 
      amount, 
      contact 
    } = req.body;
    
    // Валидация
    if (!type || !country || !city || !crypto || !fiat || !amount || !contact) {
      return res.status(400).json({ 
        success: false, 
        error: 'Все поля обязательны для заполнения' 
      });
    }
    
    if (!contact.telegram && !contact.whatsapp) {
      return res.status(400).json({ 
        success: false, 
        error: 'Необходимо указать хотя бы один способ связи' 
      });
    }
    
    // Рассчитываем курс с наценкой
    const pair = type === 'crypto-to-fiat' ? 
      `${crypto.symbol}-${fiat.symbol}` : 
      `${fiat.symbol}-${crypto.symbol}`;
    
    const rateResponse = await fetch(`http://localhost:3000/crypto-fiat-rate/${crypto.symbol}/${fiat.symbol}`);
    const rateData = await rateResponse.json();
    
    let calculatedAmount = 0;
    if (rateData.success) {
      calculatedAmount = type === 'crypto-to-fiat' ? 
        amount * rateData.finalRate : 
        amount / rateData.finalRate;
    }
    
    // Генерируем ID заявки
    const requestId = 'CF-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    const request = {
      id: requestId,
      type,
      country,
      city,
      crypto,
      fiat,
      amount: parseFloat(amount),
      calculatedAmount: parseFloat(calculatedAmount.toFixed(6)),
      contact,
      rate: rateData.success ? rateData.finalRate : null,
      margin: rateData.success ? rateData.margin : null,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Отправляем заявку в Telegram группу
    console.log('📝 Новая заявка на Crypto-Fiat обмен:', request);
    
    if (global.sendCryptoFiatRequestToTelegram) {
      global.sendCryptoFiatRequestToTelegram(request);
    }
    
    res.json({
      success: true,
      requestId: request.id,
      message: 'Заявка успешно отправлена'
    });
    
  } catch (error) {
    console.error('Ошибка при создании Crypto-Fiat заявки:', error);
    res.status(500).json({
      success: false,
      error: 'Произошла внутренняя ошибка сервера'
    });
  }
});

// Эндпоинт для принудительной проверки USDT-транзакций
app.get('/check-usdt-transactions/:requestId?', async (req, res) => {
  try {
    const requestId = req.params.requestId;
    let request = null;
    
    if (requestId) {
      if (!exchangeRequests.has(requestId)) {
        return res.status(404).json({ error: 'Заявка не найдена' });
      }
      request = exchangeRequests.get(requestId);
      if (request.from !== 'USDT') {
        return res.status(400).json({ error: 'Указанная заявка не является заявкой на обмен USDT' });
      }
    }
    
    console.log(`Запущена ручная проверка USDT транзакций ${requestId ? 'для заявки ' + requestId : ''}`);
    
    // Получаем все TRC20 транзакции
    const trc20Transactions = await getTRC20Transactions(WALLET_ADDRESS);
    
    // Отладочная информация
    console.log(`Получено ${trc20Transactions.length} TRC20 транзакций`);
    const contractHex = tronWeb.address.toHex(USDT_CONTRACT);
    console.log(`USDT контракт: ${USDT_CONTRACT} (hex: ${contractHex})`);
    
    // Собираем найденные транзакции для ответа
    const foundTransactions = [];
    let matchedRequest = null;
    
    // Проверяем каждую TRC20 транзакцию
    for (const tx of trc20Transactions) {
      try {
        let isUsdtTx = false;
        let matchReason = '';
        
        if (tx.token_info) {
          // Проверяем по адресу контракта (с учетом возможных форматов)
          const tokenAddress = tx.token_info.address;
          const contractHexNoPrefix = contractHex.replace(/^41/, '');
          const tokenAddressNoPrefix = tokenAddress.replace(/^(41|0x)/, '');
          
          // Проверяем по символу (USDT) и/или имени токена
          const isSymbolUsdt = tx.token_info.symbol?.toUpperCase() === 'USDT';
          const isNameUsdt = tx.token_info.name?.toUpperCase().includes('USDT');
          
          if (tokenAddress === contractHex || tokenAddress === contractHex.replace(/^41/, '0x')) {
            isUsdtTx = true;
            matchReason = 'адрес контракта';
          } else if (tokenAddressNoPrefix === contractHexNoPrefix) {
            isUsdtTx = true;
            matchReason = 'адрес контракта (без префикса)';
          } else if (isSymbolUsdt) {
            isUsdtTx = true;
            matchReason = 'символ USDT';
          } else if (isNameUsdt) {
            isUsdtTx = true;
            matchReason = 'имя токена содержит USDT';
          }
        }
        
        // Если это транзакция USDT
        if (isUsdtTx) {
          // Получаем сумму и другие данные
          const decimals = tx.token_info.decimals || 6;
          const divisor = Math.pow(10, decimals);
          const amountUsdt = parseFloat(tx.value) / divisor;
          
          const transactionData = {
            transactionId: tx.transaction_id,
            from: tx.from,
            to: tx.to,
            amount: amountUsdt,
            symbol: tx.token_info.symbol,
            timestamp: new Date(tx.block_timestamp).toISOString(),
            matchReason,
            isIncoming: tx.to === WALLET_ADDRESS
          };
          
          foundTransactions.push(transactionData);
          
          // Если нам нужно проверить конкретную заявку
          if (request && tx.to === WALLET_ADDRESS) {
            const tolerance = 0.01; // Увеличенный допуск для сравнения сумм
            const difference = Math.abs(amountUsdt - request.fromAmount);
            
            if (difference < tolerance) {
              console.log(`Найдено соответствие для заявки ${request.id}: ${amountUsdt} USDT (погрешность: ${difference})`);
              await processUsdtPayment(request, { 
                txID: tx.transaction_id, 
                amount: amountUsdt 
              });
              matchedRequest = { 
                ...request, 
                matchDetails: { 
                  transactionId: tx.transaction_id,
                  expectedAmount: request.fromAmount,
                  actualAmount: amountUsdt,
                  difference
                } 
              };
            }
          }
        }
      } catch (err) {
        console.error(`Ошибка при обработке транзакции: ${err.message}`);
      }
    }
    
    res.json({
      success: true,
      transactions: foundTransactions,
      matchedRequest,
      totalFound: foundTransactions.length,
      requestId: request ? request.id : null
    });
  } catch (error) {
    console.error('Ошибка при проверке USDT транзакций:', error);
    res.status(500).json({ error: error.message });
  }
});

// Проверяем статус заявки
app.get('/exchange-status/:id', (req, res) => {
  const requestId = req.params.id;
  
  if (!exchangeRequests.has(requestId)) {
    return res.status(404).json({ error: 'Заявка не найдена' });
  }
  
  const request = exchangeRequests.get(requestId);
  
  // Проверяем, не истек ли срок действия заявки
  if (request.status === 'pending' && Date.now() > request.expirationTime) {
    request.status = 'expired';
    exchangeRequests.set(requestId, request);
  }
  
  res.json({
    success: true,
    request: {
      id: request.id,
      status: request.status,
      from: request.from,
      to: request.to,
      fromAmount: request.fromAmount,
      originalAmount: request.originalAmount,
      toAmount: request.toAmount,
      destinationAddress: request.destinationAddress,
      paymentId: request.paymentId,
      createdAt: new Date(request.createdAt).toISOString(),
      expirationTime: new Date(request.expirationTime).toISOString(),
      txHash: request.txHash
    }
  });
});

// Фоновая задача для проверки транзакций (выполняется каждые 30 секунд)
async function checkTransactions() {
  try {
    // Получаем все активные заявки
    const pendingRequests = Array.from(exchangeRequests.values())
      .filter(req => req.status === 'pending');
    
    if (pendingRequests.length === 0) return;
    
    console.log(`Проверяем ${pendingRequests.length} активных заявок...`);

    try {
      // Получаем все входящие TRX транзакции на адрес кошелька
      console.log(`Получение входящих TRX транзакций для адреса ${WALLET_ADDRESS}...`);
      const trxTransactions = await getIncomingTransactions(WALLET_ADDRESS);
      
      // Проверяем каждую транзакцию TRX
      for (const tx of trxTransactions) {
        try {
          // Проверяем только завершенные транзакции
          if (tx.ret && tx.ret[0].contractRet === 'SUCCESS') {
            // Проверяем только переводы TRX
            if (tx.raw_data.contract[0].type === 'TransferContract') {
              const txValue = tx.raw_data.contract[0].parameter.value;
              
              // Получаем сумму в TRX
              const amountTrx = tronWeb.fromSun(txValue.amount);
              console.log(`Найдена входящая TRX транзакция на сумму ${amountTrx} TRX (${tx.txID})`);
              
              // Ищем заявку с соответствующей суммой TRX
              for (const request of pendingRequests) {
                if (
                  request.from === 'TRX' && 
                  Math.abs(amountTrx - request.fromAmount) < 0.000001 &&
                  tx.raw_data.timestamp >= request.createdAt // Транзакция должна быть после создания заявки
                ) {
                  console.log(`Найдено точное соответствие для заявки ${request.id}: ${amountTrx} TRX`);
                  await processTrxPayment(request, tx);
                  break;
                }
              }
            }
          }
        } catch (txError) {
          console.error(`Ошибка при обработке TRX транзакции: ${txError.message}`);
        }
      }
      
      // Получаем все TRC20 (USDT) транзакции
      console.log(`Получение TRC20 транзакций для адреса ${WALLET_ADDRESS}...`);
      const trc20Transactions = await getTRC20Transactions(WALLET_ADDRESS);
      console.log(`Найдено ${trc20Transactions.length} TRC20 транзакций`);
      
      // Дебаг: выводим хекс-адрес USDT контракта для проверки
      const contractHex = tronWeb.address.toHex(USDT_CONTRACT);
      console.log(`Адрес USDT контракта: ${USDT_CONTRACT}`);
      console.log(`Hex USDT контракта: ${contractHex}`);
      console.log(`Hex USDT контракта (0x): ${contractHex.replace(/^41/, '0x')}`);
      
      // Проверяем каждую TRC20 транзакцию
      for (const tx of trc20Transactions) {
        try {
          console.log(`Проверяем TRC20 транзакцию: ${JSON.stringify(tx.token_info || {})}`);
          console.log(`Адрес токена: ${tx.token_info ? tx.token_info.address : 'нет данных'}`);
          
          // Проверяем USDT транзакции с более гибким подходом
          let isUsdtTx = false;
          
          if (tx.token_info) {
            // Проверяем по адресу контракта (с учетом возможных форматов)
            const tokenAddress = tx.token_info.address;
            const contractHexNoPrefix = contractHex.replace(/^41/, '');
            const tokenAddressNoPrefix = tokenAddress.replace(/^(41|0x)/, '');
            
            // Проверяем по символу (USDT) и/или имени токена
            const isSymbolUsdt = tx.token_info.symbol?.toUpperCase() === 'USDT';
            const isNameUsdt = tx.token_info.name?.toUpperCase().includes('USDT');
            
            isUsdtTx = 
              tokenAddress === contractHex || 
              tokenAddress === contractHex.replace(/^41/, '0x') ||
              tokenAddressNoPrefix === contractHexNoPrefix ||
              isSymbolUsdt || 
              isNameUsdt;
              
            console.log(`Это USDT транзакция? ${isUsdtTx} (${tx.token_info.symbol || 'нет символа'})`);
          }
          
          // Проверяем только USDT транзакции
          if (isUsdtTx) {
            // Проверяем только входящие транзакции
            if (tx.to === WALLET_ADDRESS) {
              // Получаем сумму в USDT
              const decimals = tx.token_info.decimals || 6;
              const divisor = Math.pow(10, decimals);
              const amountUsdt = parseFloat(tx.value) / divisor;
              
              console.log(`Найдена входящая USDT транзакция на сумму ${amountUsdt} USDT (${tx.transaction_id})`);
              console.log(`Проверяем соответствие заявкам (${pendingRequests.length} активных)...`);
              
              // Выводим все активные заявки для отладки
              pendingRequests.forEach(req => {
                if (req.from === 'USDT') {
                  console.log(`Заявка ${req.id}: ${req.fromAmount} USDT, разница: ${Math.abs(amountUsdt - req.fromAmount)}`);
                }
              });
              
              // Ищем заявку с соответствующей суммой USDT с увеличенным допуском на погрешность
              for (const request of pendingRequests) {
                // Увеличиваем допустимую погрешность для USDT
                const tolerance = 0.01; // Допускаем разницу до 0.01 USDT
                
                if (
                  request.from === 'USDT' && 
                  Math.abs(amountUsdt - request.fromAmount) < tolerance &&
                  tx.block_timestamp >= request.createdAt // Транзакция должна быть после создания заявки
                ) {
                  console.log(`Найдено соответствие для заявки ${request.id}: ${amountUsdt} USDT (погрешность: ${Math.abs(amountUsdt - request.fromAmount)})`);
                  await processUsdtPayment(request, { 
                    txID: tx.transaction_id, 
                    amount: amountUsdt 
                  });
                  break;
                }
              }
            } else {
              console.log(`Пропускаем USDT транзакцию - не входящая (to: ${tx.to})`);
            }
          }
        } catch (txError) {
          console.error(`Ошибка при обработке USDT транзакции: ${txError.message}`);
        }
      }
      
      // Резервный метод: проверяем через текущий блок
      try {
        const block = await tronWeb.trx.getCurrentBlock();
        console.log(`Получен текущий блок #${block.block_header.raw_data.number}`);
        
        if (block && block.transactions && block.transactions.length > 0) {
          console.log(`Найдено ${block.transactions.length} транзакций в блоке`);
          
          // Обрабатываем транзакции блока (как дополнительный метод проверки)
          for (const tx of block.transactions) {
            try {
              const contractType = tx.raw_data.contract[0].type;
              
              // Обрабатываем TRX переводы
              if (contractType === 'TransferContract') {
                const txData = tx.raw_data.contract[0].parameter.value;
                const toAddress = txData.to;
                const hexWalletAddress = tronWeb.address.toHex(WALLET_ADDRESS);
                
                // Проверяем, направлена ли транзакция на наш адрес
                if (toAddress === hexWalletAddress) {
                  const amount = txData.amount;
                  const amountTrx = tronWeb.fromSun(amount);
                  console.log(`Найдена транзакция TRX в текущем блоке: ${amountTrx} TRX`);
                  
                  // Ищем заявку, соответствующую этой транзакции
                  for (const request of pendingRequests) {
                    if (request.from === 'TRX' && Math.abs(amountTrx - request.fromAmount) < 0.000001) {
                      console.log(`Обнаружен платеж в текущем блоке для заявки ${request.id}`);
                      await processTrxPayment(request, tx);
                      break;
                    }
                  }
                }
              }
              // Проверяем также TRC20 (USDT) транзакции в текущем блоке
              else if (contractType === 'TriggerSmartContract') {
                // Это может быть TRC20 транзакция
                const txData = tx.raw_data.contract[0].parameter.value;
                const contractAddress = txData.contract_address;
                
                // Проверяем, это USDT контракт?
                const hexUsdtContract = tronWeb.address.toHex(USDT_CONTRACT).replace(/^41/, '');
                const hexContractAddress = contractAddress.replace(/^41/, '');
                
                if (hexContractAddress === hexUsdtContract) {
                  console.log(`Найдена транзакция USDT в текущем блоке`);
                  
                  try {
                    // Пытаемся декодировать данные для проверки суммы и адреса
                    // Это сложнее, поэтому для упрощения просто проверяем все активные USDT заявки
                    // через API напрямую
                    
                    const pendingUsdtRequests = pendingRequests.filter(req => req.from === 'USDT');
                    if (pendingUsdtRequests.length > 0) {
                      console.log(`Найдены ожидающие USDT заявки (${pendingUsdtRequests.length}). Проверяем через API...`);
                      // Запускаем дополнительную проверку TRC20 транзакций
                      const trc20Txs = await getTRC20Transactions(WALLET_ADDRESS);
                      // Обрабатываем их в стандартном цикле
                    }
                  } catch (innerError) {
                    console.error(`Ошибка при проверке USDT транзакции из блока: ${innerError.message}`);
                  }
                }
              }
            } catch (txError) {
              console.error(`Ошибка при обработке транзакции блока: ${txError.message}`);
            }
          }
        }
      } catch (blockError) {
        console.error('Ошибка при получении текущего блока:', blockError.message);
      }
      
      // Проверяем истекшие заявки
      const currentTime = Date.now();
      for (const request of pendingRequests) {
        if (currentTime > request.expirationTime) {
          request.status = 'expired';
          exchangeRequests.set(request.id, request);
          console.log(`Заявка ${request.id} истекла`);
        }
      }
    } catch (error) {
      console.error('Ошибка при проверке транзакций:', error.message);
    }
  } catch (error) {
    console.error('Ошибка в фоновом процессе:', error);
  }
}

// Обработка платежа в TRX
async function processTrxPayment(request, transaction) {
  try {
    // Проверяем, не была ли заявка уже обработана
    if (request.status !== 'pending') {
      console.log(`Заявка ${request.id} уже обработана (статус: ${request.status})`);
      return;
    }
    
    console.log(`Обработка TRX платежа для заявки ${request.id}`);
    
    // Если пользователь хочет получить USDT
    if (request.to === 'USDT') {
      try {
        const usdtContract = await tronWeb.contract().at(USDT_CONTRACT);
        
        // Правильно форматируем сумму для отправки USDT
        // USDT обычно имеет 6 десятичных знаков
        const decimals = 6;
        const amountInt = Math.floor(parseFloat(request.toAmount) * Math.pow(10, decimals));
        
        console.log(`Отправляем ${request.toAmount} USDT (${amountInt} микроюнитов) на адрес ${request.destinationAddress}`);
        
        // Отправляем USDT пользователю, используя точное целое число
        const tx = await usdtContract.transfer(
          request.destinationAddress,
          amountInt.toString() // Используем строковое представление целого числа
        ).send();
        
        console.log(`USDT отправлены пользователю: ${tx}`);
        
        // Обновляем статус заявки
        request.status = 'completed';
        request.txHash = tx;
        exchangeRequests.set(request.id, request);
        
        // Логируем успешный обмен
        console.log(`Обмен успешно завершен для заявки ${request.id}: ${request.fromAmount} ${request.from} -> ${request.toAmount} ${request.to}`);
      } catch (error) {
        console.error(`Ошибка при отправке USDT: ${error.message}`);
        request.status = 'error';
        request.error = error.message;
        exchangeRequests.set(request.id, request);
      }
    }
  } catch (error) {
    console.error('Ошибка при обработке TRX платежа:', error);
    request.status = 'error';
    request.error = error.message;
    exchangeRequests.set(request.id, request);
  }
}

// Обработка платежа в USDT
async function processUsdtPayment(request, event) {
  try {
    // Проверяем, не была ли заявка уже обработана
    if (request.status !== 'pending') {
      console.log(`Заявка ${request.id} уже обработана (статус: ${request.status})`);
      return;
    }
    
    console.log(`Обработка USDT платежа для заявки ${request.id}`);
    
    // Если пользователь хочет получить TRX
    if (request.to === 'TRX') {
      try {
        // Правильно форматируем сумму для отправки TRX
        const amountSun = Math.floor(parseFloat(request.toAmount) * 1000000);
        
        console.log(`Отправляем ${request.toAmount} TRX (${amountSun} сан) на адрес ${request.destinationAddress}`);
        
        // Отправляем TRX пользователю
        const tx = await tronWeb.trx.sendTransaction(
          request.destinationAddress,
          amountSun // Используем точное целое число в единицах SUN
        );
        
        console.log(`TRX отправлены пользователю: ${JSON.stringify(tx)}`);
        
        // Обновляем статус заявки
        request.status = 'completed';
        request.txHash = tx.txid;
        exchangeRequests.set(request.id, request);
        
        // Логируем успешный обмен
        console.log(`Обмен успешно завершен для заявки ${request.id}: ${request.fromAmount} ${request.from} -> ${request.toAmount} ${request.to}`);
      } catch (error) {
        console.error(`Ошибка при отправке TRX: ${error.message}`);
        request.status = 'error';
        request.error = error.message;
        exchangeRequests.set(request.id, request);
      }
    }
  } catch (error) {
    console.error('Ошибка при обработке USDT платежа:', error);
    request.status = 'error';
    request.error = error.message;
    exchangeRequests.set(request.id, request);
  }
}

// Изменяем интервал на 15 секунд для более быстрой реакции
setInterval(checkTransactions, 15000);

// Telegram Bot для управления наценками
const TelegramBot = require('node-telegram-bot-api');

// Токен бота (получить у @BotFather)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || ''; // ID чата администратора

let bot = null;

if (TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
  
  // Команда /rates - показать все наценки
  bot.onText(/\/rates/, (msg) => {
    const chatId = msg.chat.id;
    
    let message = '📊 *Текущие наценки по торговым парам:*\n\n';
    
    // Группируем пары по криптовалютам
    const cryptoGroups = {};
    Object.entries(currentMargins).forEach(([pair, margin]) => {
      const [from, to] = pair.split('-');
      if (!cryptoGroups[from]) {
        cryptoGroups[from] = [];
      }
      cryptoGroups[from].push({ to, margin, pair });
    });
    
    Object.entries(cryptoGroups).forEach(([crypto, pairs]) => {
      message += `*${crypto}:*\n`;
      pairs.forEach(({ to, margin, pair }) => {
        message += `  ${crypto} → ${to}: ${margin}%\n`;
      });
      message += '\n';
    });
    
    // Создаем inline клавиатуру для быстрого редактирования
    const keyboard = {
      inline_keyboard: []
    };
    
    // Добавляем кнопки по 3 в ряд
    const pairButtons = Object.entries(currentMargins).map(([pair, margin]) => ({
      text: `${pair}: ${margin}%`,
      callback_data: `edit_${pair}`
    }));
    
    for (let i = 0; i < pairButtons.length; i += 2) {
      keyboard.inline_keyboard.push(pairButtons.slice(i, i + 2));
    }
    
    bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  });
  
  // Команда /rate PAIR MARGIN - установить наценку
  bot.onText(/\/rate (\w+-\w+) (\d+(?:\.\d+)?)%?/, (msg, match) => {
    const chatId = msg.chat.id;
    const pair = match[1].toUpperCase();
    const margin = parseFloat(match[2]);
    
    if (margin < 0 || margin > 100) {
      bot.sendMessage(chatId, '❌ Наценка должна быть от 0 до 100%');
      return;
    }
    
    currentMargins[pair] = margin;
    
    bot.sendMessage(chatId, `✅ Наценка для пары *${pair}* установлена: *${margin}%*`, {
      parse_mode: 'Markdown'
    });
    
    console.log(`📊 Telegram: Наценка для пары ${pair} установлена: ${margin}%`);
  });
  
  // Обработка callback запросов от inline кнопок
  bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;
    
    if (data.startsWith('edit_')) {
      const pair = data.replace('edit_', '');
      const currentMargin = currentMargins[pair] || 0;
      
      bot.sendMessage(message.chat.id, 
        `Текущая наценка для пары *${pair}*: ${currentMargin}%\n\n` +
        `Отправьте новое значение в формате:\n` +
        `\`/rate ${pair} НОВАЯ_НАЦЕНКА\`\n\n` +
        `Например: \`/rate ${pair} 5\``,
        { parse_mode: 'Markdown' }
      );
    }
    
    // Подтверждаем callback
    bot.answerCallbackQuery(callbackQuery.id);
  });
  
  // Функция для отправки заявки в Telegram группу
  const sendCryptoFiatRequestToTelegram = (request) => {
    if (!ADMIN_CHAT_ID) return;
    
    const typeText = request.type === 'crypto-to-fiat' ? 
      '💰 Криптовалюта → Наличные' : '💳 Наличные → Криптовалюта';
    
    let message = `🆕 *Новая заявка на обмен*\n\n`;
    message += `${typeText}\n\n`;
    message += `🌍 *Страна:* ${request.country}\n`;
    message += `🏙 *Город:* ${request.city}\n\n`;
    
    if (request.type === 'crypto-to-fiat') {
      message += `📤 *Отдает:* ${request.amount} ${request.crypto.symbol}\n`;
      message += `📥 *Получает:* ~${request.calculatedAmount} ${request.fiat.symbol}\n`;
    } else {
      message += `📤 *Отдает:* ${request.amount} ${request.fiat.symbol}\n`;
      message += `📥 *Получает:* ~${request.calculatedAmount} ${request.crypto.symbol}\n`;
    }
    
    if (request.rate && request.margin) {
      message += `📊 *Курс:* ${request.rate.toFixed(6)}\n`;
      message += `📈 *Наценка:* ${request.margin}%\n`;
    }
    
    message += `\n📞 *Контакты:*\n`;
    if (request.contact.telegram) {
      message += `📱 Telegram: @${request.contact.telegram.replace('@', '')}\n`;
    }
    if (request.contact.whatsapp) {
      message += `📞 WhatsApp: ${request.contact.whatsapp}\n`;
    }
    message += `✅ *Предпочтительный:* ${request.contact.preferred === 'telegram' ? 'Telegram' : 'WhatsApp'}\n`;
    
    message += `\n🆔 *ID заявки:* \`${request.id}\``;
    message += `\n🕐 *Время:* ${new Date(request.createdAt).toLocaleString('ru-RU')}`;
    
    bot.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: 'Markdown' });
  };
  
  // Экспортируем функцию для использования в API
  global.sendCryptoFiatRequestToTelegram = sendCryptoFiatRequestToTelegram;
  
  console.log('🤖 Telegram бот запущен');
} else {
  console.log('⚠️  Telegram бот не настроен (отсутствует TELEGRAM_BOT_TOKEN)');
}

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`💼 Адрес кошелька: ${WALLET_ADDRESS}`);
  console.log(`🔗 Адрес кошелька (HEX): ${tronWeb.address.toHex(WALLET_ADDRESS)}`);
  
  if (TELEGRAM_BOT_TOKEN) {
    console.log('🤖 Telegram бот активен');
    console.log('📋 Доступные команды:');
    console.log('   /rates - показать все наценки');
    console.log('   /rate PAIR MARGIN - установить наценку (например: /rate TRX-EUR 5)');
  }
}); 