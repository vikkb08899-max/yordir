import { useState, useEffect } from 'react';

export interface ExchangeRates {
  TRX_TO_USDT: number; // 1 TRX = X USDT
  USDT_TO_TRX: number; // 1 USDT = Y TRX
  // Добавляем поддержку всех валютных пар
  [key: string]: number;
}

export interface RatesResponse {
  success: boolean;
  rates: ExchangeRates;
  lastUpdate: string | null;
}

// Начальные значения курсов
const DEFAULT_RATES: ExchangeRates = {
  TRX_TO_USDT: 0.085,
  USDT_TO_TRX: 11.76,
  // Добавляем статические курсы для фиатных валют
  'TRON-USD': 0.085,
  'TRON-EUR': 0.078,
  'TRON-PLN': 0.34,
  'TRON-UAH': 3.15,
  'USDT-USD': 1.0,
  'USDT-EUR': 0.92,
  'USDT-PLN': 4.0,
  'USDT-UAH': 37.0,
  'SOL-USD': 98.5,
  'SOL-EUR': 90.6,
  'SOL-PLN': 393.4,
  'SOL-UAH': 3645.5,
  'BTC-USD': 43250,
  'BTC-EUR': 39790,
  'BTC-PLN': 172800,
  'BTC-UAH': 1600000,
  'ETH-USD': 2650,
  'ETH-EUR': 2438,
  'ETH-PLN': 10585,
  'ETH-UAH': 98000,
  'USDC-USD': 1.0,
  'USDC-EUR': 0.92,
  'USDC-PLN': 4.0,
  'USDC-UAH': 37.0
};

// Конфигурация для CoinGecko API
const COINGECKO_CONFIG = {
  BASE_URL: 'https://api.coingecko.com/api/v3',
  UPDATE_INTERVAL: 15 * 60 * 1000, // 15 минут (увеличено из-за лимитов)
  BATCH_DELAY: 60 * 1000, // 60 секунд между батчами (увеличено)
  REQUEST_DELAY: 2000, // 2 секунды между запросами (увеличено)
  TIMEOUT: 10000, // 10 секунд таймаут
};

// Маппинг криптовалют к CoinGecko ID
const CRYPTO_IDS = {
  TRX: 'tron',
  USDT: 'tether',
  SOL: 'solana',
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDC: 'usd-coin'
};

// Маппинг криптовалют к Coinpaprika ID
const COINPAPRIKA_IDS = {
  TRX: 'trx-tron',
  USDT: 'usdt-tether',
  SOL: 'sol-solana',
  BTC: 'btc-bitcoin',
  ETH: 'eth-ethereum',
  USDC: 'usdc-usd-coin'
};

// Поддерживаемые фиатные валюты
const FIAT_CURRENCIES = ['usd', 'eur', 'pln', 'uah'];

// Синглтон для обмена данными между компонентами
const ratesStore = {
  rates: { ...DEFAULT_RATES },
  lastUpdate: null as string | null,
  isLoading: false,
  listeners: new Set<() => void>(),
  cache: new Map<string, { rate: number; timestamp: number }>(),

  // Метод для подписки на обновления
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },

  // Метод для обновления данных
  updateRates(rates: ExchangeRates, lastUpdate: string | null) {
    this.rates = rates;
    this.lastUpdate = lastUpdate;
    this.notifyListeners();
  },

  // Метод для уведомления подписчиков
  notifyListeners() {
    this.listeners.forEach(listener => listener());
  },

  // Метод для установки состояния загрузки
  setLoading(isLoading: boolean) {
    this.isLoading = isLoading;
    this.notifyListeners();
  },

  // Метод для кэширования курса
  cacheRate(key: string, rate: number) {
    this.cache.set(key, { rate, timestamp: Date.now() });
  },

  // Метод для получения кэшированного курса
  getCachedRate(key: string): number | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < COINGECKO_CONFIG.UPDATE_INTERVAL) {
      return cached.rate;
    }
    return null;
  },

  // Метод для проверки необходимости обновления
  needsUpdate(): boolean {
    if (!this.lastUpdate) return true;
    return Date.now() - new Date(this.lastUpdate).getTime() > COINGECKO_CONFIG.UPDATE_INTERVAL;
  }
};

// Функция для задержки
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Функция для получения курса с Coinpaprika через наш прокси
async function fetchCoinpaprikaRate(cryptoId: string, fiatCurrency: string): Promise<number | null> {
  const cacheKey = `${cryptoId}-${fiatCurrency}-paprika`;
  
  // Проверяем кэш
  const cachedRate = ratesStore.getCachedRate(cacheKey);
  if (cachedRate !== null) {
    return cachedRate;
  }

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), COINGECKO_CONFIG.TIMEOUT);

    const response = await fetch(
      `${API_URL}/coinpaprika/${cryptoId}/${fiatCurrency}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data && result.data.price) {
      const rate = result.data.price;

      if (rate && typeof rate === 'number') {
        ratesStore.cacheRate(cacheKey, rate);
        return rate;
      }
    }

    return null;
  } catch (error) {
    console.error(`❌ Ошибка получения курса Coinpaprika ${cryptoId}/${fiatCurrency}:`, error);
    return null;
  }
}

// Функция для получения курса с CoinGecko через наш прокси
async function fetchCoinGeckoRate(cryptoId: string, fiatCurrency: string): Promise<number | null> {
  const cacheKey = `${cryptoId}-${fiatCurrency}`;
  
  // Проверяем кэш
  const cachedRate = ratesStore.getCachedRate(cacheKey);
  if (cachedRate !== null) {
    return cachedRate;
  }

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000');

  // Пробуем основной эндпоинт
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), COINGECKO_CONFIG.TIMEOUT);

    const response = await fetch(
      `${API_URL}/coingecko/${cryptoId}/${fiatCurrency}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      const rate = result.data[cryptoId]?.[fiatCurrency];

      if (rate && typeof rate === 'number') {
        ratesStore.cacheRate(cacheKey, rate);
        return rate;
      }
    }

    return null;
  } catch (error) {
    console.error(`❌ Ошибка основного прокси ${cryptoId}/${fiatCurrency}:`, error);
    
    // Пробуем альтернативный эндпоинт
    try {
      console.log(`🔄 Пробуем альтернативный прокси для ${cryptoId}/${fiatCurrency}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), COINGECKO_CONFIG.TIMEOUT);

      const response = await fetch(
        `${API_URL}/coingecko-alt/${cryptoId}/${fiatCurrency}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const rate = result.data[cryptoId]?.[fiatCurrency];

        if (rate && typeof rate === 'number') {
          ratesStore.cacheRate(cacheKey, rate);
          return rate;
        }
      }

      return null;
    } catch (altError) {
      console.error(`❌ Ошибка альтернативного прокси ${cryptoId}/${fiatCurrency}:`, altError);
      
      // Используем статические курсы как fallback
      const staticKey = `${cryptoId.toUpperCase()}-${fiatCurrency.toUpperCase()}`;
      const staticRate = DEFAULT_RATES[staticKey];
      
      if (staticRate) {
        console.log(`📊 Используем статический курс для ${staticKey}: ${staticRate}`);
        ratesStore.cacheRate(cacheKey, staticRate);
        return staticRate;
      }
      
      return null;
    }
  }
}

// Функция для получения курсов батчами
async function fetchRatesBatch(cryptoIds: string[], fiatCurrencies: string[]): Promise<Map<string, number>> {
  const rates = new Map<string, number>();

  for (const cryptoId of cryptoIds) {
    for (const fiatCurrency of fiatCurrencies) {
      // Определяем, какой API использовать по формату ID
      const isCoinpaprikaId = cryptoId.includes('-');
      
      if (isCoinpaprikaId) {
        // Используем Coinpaprika
        const rate = await fetchCoinpaprikaRate(cryptoId, fiatCurrency);
        if (rate !== null) {
          // Преобразуем ID обратно в стандартный формат
          const standardId = cryptoId.split('-')[0]; // берем первую часть (trx, usdt, etc.)
          rates.set(`${standardId}-${fiatCurrency}`, rate);
        }
      } else {
        // Используем CoinGecko
        const rate = await fetchCoinGeckoRate(cryptoId, fiatCurrency);
        if (rate !== null) {
          rates.set(`${cryptoId}-${fiatCurrency}`, rate);
        }
      }
      
      // Задержка между запросами
      await delay(COINGECKO_CONFIG.REQUEST_DELAY);
    }
  }

  return rates;
}

// Функция для принудительного использования статических курсов
function useStaticRates(): RatesResponse {
  console.log('📊 Используем статические курсы из-за лимитов API');
  const lastUpdate = new Date().toISOString();
  ratesStore.updateRates(DEFAULT_RATES, lastUpdate);
  
  return {
    success: true,
    rates: DEFAULT_RATES,
    lastUpdate
  };
}

// Функция для получения всех курсов обмена
export async function fetchExchangeRates(): Promise<RatesResponse> {
  console.log(`[${new Date().toLocaleTimeString()}] 🔄 Проверка необходимости обновления курсов...`);
  
  // Проверяем, нужно ли обновление
  if (!ratesStore.needsUpdate()) {
    console.log('✅ Используем кэшированные курсы');
    return {
      success: true,
      rates: ratesStore.rates,
      lastUpdate: ratesStore.lastUpdate
    };
  }

  console.log('🔄 Начинаем обновление курсов...');
  ratesStore.setLoading(true);

  try {
    // Разбиваем криптовалюты на два батча
    const cryptoIds = Object.values(CRYPTO_IDS);
    const coinpaprikaIds = Object.values(COINPAPRIKA_IDS);
    const batch1 = cryptoIds.slice(0, Math.ceil(cryptoIds.length / 2));
    const batch2 = cryptoIds.slice(Math.ceil(cryptoIds.length / 2));
    const paprikaBatch1 = coinpaprikaIds.slice(0, Math.ceil(coinpaprikaIds.length / 2));
    const paprikaBatch2 = coinpaprikaIds.slice(Math.ceil(coinpaprikaIds.length / 2));

    console.log('📦 Батч 1 (CoinGecko):', batch1);
    console.log('📦 Батч 1 (Coinpaprika):', paprikaBatch1);
    const rates1 = await fetchRatesBatch(paprikaBatch1, FIAT_CURRENCIES);
    
    // Проверяем, получили ли мы хоть какие-то курсы
    if (rates1.size === 0) {
      console.log('⚠️ Первый батч не вернул курсов, используем статические');
      return useStaticRates();
    }
    
    console.log('⏳ Ожидание 60 секунд перед вторым батчем...');
    await delay(COINGECKO_CONFIG.BATCH_DELAY);
    
    console.log('📦 Батч 2 (CoinGecko):', batch2);
    console.log('📦 Батч 2 (Coinpaprika):', paprikaBatch2);
    const rates2 = await fetchRatesBatch(paprikaBatch2, FIAT_CURRENCIES);

    // Объединяем результаты
    const allRates = new Map([...rates1, ...rates2]);

    // Если получили слишком мало курсов, используем статические
    if (allRates.size < 5) {
      console.log(`⚠️ Получили только ${allRates.size} курсов, используем статические`);
      return useStaticRates();
    }

    // Формируем объект курсов
    const exchangeRates: ExchangeRates = { ...DEFAULT_RATES };

    // Добавляем основные курсы TRX/USDT
    const trxUsdRate = allRates.get('tron-usd');
    if (trxUsdRate) {
      exchangeRates.TRX_TO_USDT = trxUsdRate;
      exchangeRates.USDT_TO_TRX = 1 / trxUsdRate;
    }

    // Добавляем все остальные курсы
    allRates.forEach((rate, key) => {
      exchangeRates[key.toUpperCase()] = rate;
    });

    const lastUpdate = new Date().toISOString();
    ratesStore.updateRates(exchangeRates, lastUpdate);

    console.log('✅ Курсы обновлены:', {
      'TRX → USDT': exchangeRates.TRX_TO_USDT,
      'USDT → TRX': exchangeRates.USDT_TO_TRX,
      'Всего курсов': allRates.size,
      'Обновлено': new Date(lastUpdate).toLocaleTimeString()
    });

    return {
      success: true,
      rates: exchangeRates,
      lastUpdate
    };

  } catch (error: any) {
    console.error('❌ Ошибка при обновлении курсов:', error.message);
    
    // При любой ошибке используем статические курсы
    return useStaticRates();
  } finally {
    ratesStore.setLoading(false);
  }
}

// Проверка USDT-транзакций для конкретной заявки
export async function checkUsdtTransactions(requestId: string): Promise<any> {
  try {
    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000');
    const response = await fetch(`${API_URL}/check-usdt-transactions/${requestId}`);
    if (!response.ok) {
      throw new Error('Ошибка при проверке USDT-транзакций');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка при проверке USDT-транзакций:', error);
    throw error;
  }
}

// Хук для использования курсов в компонентах React
export function useExchangeRates() {
  const [rates, setRates] = useState<ExchangeRates>(ratesStore.rates);
  const [lastUpdate, setLastUpdate] = useState<string | null>(ratesStore.lastUpdate);
  const [isLoading, setIsLoading] = useState<boolean>(ratesStore.isLoading);

  useEffect(() => {
    // Подписываемся на обновления
    const unsubscribe = ratesStore.subscribe(() => {
      setRates(ratesStore.rates);
      setLastUpdate(ratesStore.lastUpdate);
      setIsLoading(ratesStore.isLoading);
    });

    // Получаем курсы при монтировании
    if (!ratesStore.lastUpdate) {
      fetchExchangeRates();
    }

    // Отписываемся при размонтировании
    return unsubscribe;
  }, []);

  // Запускаем обновление курсов каждые 15 минут
  useEffect(() => {
    const interval = setInterval(() => {
      fetchExchangeRates();
    }, COINGECKO_CONFIG.UPDATE_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  return { 
    rates, 
    lastUpdate, 
    isLoading, 
    refreshRates: fetchExchangeRates 
  };
} 