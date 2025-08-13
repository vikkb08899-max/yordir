const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? '/api' 
    : 'http://localhost:3000');

export type Currency = 'TRX' | 'USDT' | 'SOL' | 'BTC' | 'USDC' | 'ETH';

export interface ExchangeRequest {
  from: Currency;
  to: Currency;
  amount: number;
  destinationAddress: string;
}

export interface PaymentDetails {
  address: string;
  amount: number;
  originalAmount: number;
  paymentId: string;
  currency: Currency;
  toReceive: string;
  toCurrency: Currency;
  exchangeRate: number;
  expirationTime: string;
  message: string;
}

export interface ExchangeResponse {
  success: boolean;
  requestId: string;
  paymentDetails: PaymentDetails;
}

export interface ExchangeStatus {
  id: string;
  status: 'pending' | 'completed' | 'expired' | 'error';
  from: Currency;
  to: Currency;
  fromAmount: number;
  originalAmount: number;
  toAmount: number;
  destinationAddress: string;
  paymentId: string;
  createdAt: string;
  expirationTime: string;
  txHash: string | null;
}

export interface StatusResponse {
  success: boolean;
  request: ExchangeStatus;
}

export interface ExchangeRates {
  TRX_TO_USDT: number;
  USDT_TO_TRX: number;
}

export interface RatesResponse {
  success: boolean;
  rates: ExchangeRates;
  lastUpdate: string | null;
}

// Создание новой заявки на обмен
export const createExchangeRequest = async (data: ExchangeRequest): Promise<ExchangeResponse> => {
  try {
    const response = await fetch(`${API_URL}/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromCurrency: data.from,
        toCurrency: data.to,
        fromAmount: data.amount,
        destinationAddress: data.destinationAddress,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Ошибка при создании заявки на обмен');
    }

    // Преобразуем ответ к ожидаемому формату
    return {
      success: true,
      requestId: result.requestId,
      paymentDetails: {
        address: result.paymentAddress,
        amount: result.exactAmountToSend || result.fromAmount,
        originalAmount: result.fromAmount,
        paymentId: result.requestId,
        currency: result.fromCurrency,
        toReceive: result.toAmount.toString(),
        toCurrency: result.toCurrency,
        exchangeRate: result.rate,
        expirationTime: result.expirationTime,
        message: result.message || `Отправьте точно ${result.exactAmountToSend || result.fromAmount} ${result.fromCurrency} на указанный адрес`
      }
    };
  } catch (error) {
    console.error('Ошибка API:', error);
    throw error;
  }
};

// Проверка статуса заявки
export const checkExchangeStatus = async (requestId: string): Promise<StatusResponse> => {
  try {
    const response = await fetch(`${API_URL}/exchange/${requestId}/status`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Ошибка при проверке статуса');
    }

    // Преобразуем ответ к ожидаемому формату
    return {
      success: true,
      request: {
        id: result.requestId,
        status: result.status,
        from: result.fromCurrency || 'TRX',
        to: result.toCurrency || 'USDT',
        fromAmount: result.fromAmount || 0,
        originalAmount: result.fromAmount || 0,
        toAmount: result.toAmount || 0,
        destinationAddress: result.destinationAddress || '',
        paymentId: result.requestId,
        createdAt: new Date().toISOString(),
        expirationTime: result.expirationTime || new Date().toISOString(),
        txHash: result.txHashSent || null
      }
    };
  } catch (error) {
    console.error('Ошибка API:', error);
    throw error;
  }
};

// Получение актуальных курсов обмена
export const getExchangeRates = async (): Promise<RatesResponse> => {
  try {
    const response = await fetch(`${API_URL}/exchange-rates`);

    if (!response.ok) {
      throw new Error('Ошибка при получении курсов обмена');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка при получении курсов:', error);
    throw error;
  }
}; 