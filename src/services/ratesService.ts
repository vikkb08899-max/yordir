import { useState, useEffect } from 'react';

export interface ExchangeRates {
  TRX_TO_USDT: number; // 1 TRX = X USDT
  USDT_TO_TRX: number; // 1 USDT = Y TRX
}

export interface RatesResponse {
  success: boolean;
  rates: ExchangeRates;
  lastUpdate: string | null;
}

// Начальные значения курсов
const DEFAULT_RATES = {
  TRX_TO_USDT: 0.085,
  USDT_TO_TRX: 11.76
};

// Синглтон для обмена данными между компонентами
const ratesStore = {
  rates: { ...DEFAULT_RATES },
  lastUpdate: null as string | null,
  isLoading: false,
  listeners: new Set<() => void>(),

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
  }
};

// Функция для получения актуального курса с сервера
export async function fetchExchangeRates(): Promise<RatesResponse> {
  console.log(`[${new Date().toLocaleTimeString()}] 🔄 Получение курсов с сервера...`);
  
  try {
    ratesStore.setLoading(true);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 секунд таймаут
    
    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000');
    const response = await fetch(`${API_URL}/exchange-rates`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.exchangeRates) {
      // Извлекаем курсы TRX/USDT из новой структуры данных
      const trxToUsdt = data.exchangeRates['TRX-USDT'];
      const usdtToTrx = data.exchangeRates['USDT-TRX'];
      
      // Проверяем корректность полученных курсов
      if (trxToUsdt > 0 && usdtToTrx > 0) {
        const rates = {
          TRX_TO_USDT: trxToUsdt,
          USDT_TO_TRX: usdtToTrx
        };
        
        ratesStore.updateRates(rates, data.lastUpdate);
        console.log('✅ Курсы обмена обновлены:', {
          'TRX → USDT': rates.TRX_TO_USDT,
          'USDT → TRX': rates.USDT_TO_TRX,
          'Обновлено': data.lastUpdate ? new Date(data.lastUpdate).toLocaleTimeString() : 'неизвестно'
        });
        
        return {
          success: true,
          rates: rates,
          lastUpdate: data.lastUpdate
        };
      } else {
        throw new Error('Получены некорректные курсы обмена');
      }
    } else {
      throw new Error('Сервер вернул неуспешный ответ');
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('❌ Таймаут при получении курсов обмена');
    } else {
      console.error('❌ Ошибка при получении курсов обмена:', error.message);
    }
    
    return {
      success: false,
      rates: ratesStore.rates,
      lastUpdate: ratesStore.lastUpdate
    };
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

  // Запускаем обновление курсов каждую минуту
  useEffect(() => {
    const interval = setInterval(() => {
      fetchExchangeRates();
    }, 60 * 1000); // 1 минута
    
    return () => clearInterval(interval);
  }, []);

  return { 
    rates, 
    lastUpdate, 
    isLoading, 
    refreshRates: fetchExchangeRates 
  };
} 