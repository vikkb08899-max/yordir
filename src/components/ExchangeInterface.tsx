import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpDown, Wallet, TrendingUp, Clock, CheckCircle, ExternalLink, QrCode, History, X, Trash2 } from 'lucide-react';
import { createExchangeRequest, checkExchangeStatus, Currency } from '../services/exchangeApi';
import { useExchangeRates, checkUsdtTransactions } from '../services/ratesService';
import { useLanguage } from '../contexts/LanguageContext';
import { ssEstimate, ssCreateExchange, ssGetStatus } from '../services/simpleSwapApi';
import type { SimpleSwapCurrency } from '../services/simpleSwapApi';

// Интерфейсы для истории сделок
interface ExchangeHistoryItem {
  id: string;
  requestId: string;
  fromCurrency: Currency | string;
  toCurrency: Currency | string;
  fromAmount: number;
  toAmount: number;
  destinationAddress: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
  txHash?: string;
  paymentAddress?: string;
  exactAmountToSend?: number;
  expirationTime?: string;
  provider?: 'internal' | 'simpleswap';
}

// Импортируем иконки
import trxIcon from '/icon-trx.png';
import usdtIcon from '/icon-usdt.png';
import solIcon from '/icon-sol.png';
import btcIcon from '/icon-btc.png';
import usdcIcon from '/icon-usdc.png';
import ethIcon from '/icons8-ethereum-512.png';
// Импортируем QR код
import QRCode from 'qrcode';

const ExchangeInterface: React.FC = () => {
  const { t } = useLanguage();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState<string>('TRX');
  const [toCurrency, setToCurrency] = useState<string>('USDT');
  const [isSwapped, setIsSwapped] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [exchangeStarted, setExchangeStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<'internal' | 'simpleswap' | null>(null);
  const [exchangeCompleted, setExchangeCompleted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { rates, isLoading: ratesLoading, refreshRates } = useExchangeRates();
  const [paymentDetails, setPaymentDetails] = useState({
    walletAddress: '',
    amountToSend: '',
    receivingAmount: '',
    expirationTime: ''
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 минут в секундах
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<ExchangeHistoryItem | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [ssCurrencies, setSsCurrencies] = useState<SimpleSwapCurrency[]>([]);
  const availableSymbols = React.useMemo(() => {
    const base = ['TRX','USDT','BTC','ETH','USDC','SOL'];
    const set = new Set<string>(base);
    ssCurrencies.forEach((c) => {
      if (c && c.symbol) set.add(c.symbol.toUpperCase());
    });
    return Array.from(set).sort();
  }, [ssCurrencies]);

  useEffect(() => {
    import('../services/simpleSwapApi').then(async ({ ssGetCurrencies }) => {
      try {
        const cur = await ssGetCurrencies();
        setSsCurrencies(cur);
      } catch (e) {
        console.warn('Не удалось загрузить валюты SimpleSwap:', e);
      }
    });
  }, []);

  // Загружаем историю сделок из localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('exchangeHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setExchangeHistory(history);
      } catch (error) {
        console.error('Ошибка при загрузке истории:', error);
        localStorage.removeItem('exchangeHistory');
      }
    }
  }, []);

  // Загружаем активный обмен из localStorage при инициализации
  useEffect(() => {
    const savedExchange = localStorage.getItem('activeExchange');
    if (savedExchange) {
      try {
        const exchangeData = JSON.parse(savedExchange);
        setRequestId(exchangeData.requestId);
        setFromCurrency(exchangeData.fromCurrency);
        setToCurrency(exchangeData.toCurrency);
        setFromAmount(exchangeData.fromAmount.toString());
        setToAmount(exchangeData.toAmount.toString());
        setDestinationAddress(exchangeData.destinationAddress);
        setPaymentDetails({
          walletAddress: exchangeData.paymentAddress,
          amountToSend: exchangeData.exactAmountToSend?.toString() || exchangeData.fromAmount.toString(),
          receivingAmount: exchangeData.toAmount.toString(),
          expirationTime: exchangeData.expirationTime
        });
        setExchangeStarted(true);
        setActiveProvider(exchangeData.provider || null);
        
        // Генерируем QR код для восстановленного обмена
        if (exchangeData.paymentAddress) {
          generateQRCode(exchangeData.paymentAddress);
        }
        
        console.log('Восстановлен активный обмен:', exchangeData.requestId);
      } catch (error) {
        console.error('Ошибка при восстановлении обмена:', error);
        localStorage.removeItem('activeExchange');
      }
    }
  }, []);

  // Используем актуальные курсы обмена из сервиса
  const exchangeRate = fromCurrency === 'TRX' ? 
    rates.TRX_TO_USDT : rates.USDT_TO_TRX;

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setIsSwapped(!isSwapped);
  };

  const handleFromAmountChange = async (value: string) => {
    setFromAmount(value);
    if (!value) {
      setToAmount('');
      return;
    }

    const isTrxUsdtPair =
      (fromCurrency === 'TRX' && toCurrency === 'USDT') ||
      (fromCurrency === 'USDT' && toCurrency === 'TRX');

    try {
      if (isTrxUsdtPair) {
        let calculatedAmount;
        if (fromCurrency === 'TRX' && toCurrency === 'USDT') {
          calculatedAmount = (parseFloat(value) * rates.TRX_TO_USDT).toFixed(6);
        } else {
          calculatedAmount = (parseFloat(value) * rates.USDT_TO_TRX).toFixed(6);
        }
        setToAmount(calculatedAmount);
      } else {
        const est = await ssEstimate(fromCurrency, toCurrency, value, false);
        setToAmount(est.estimated_amount);
      }
    } catch (e: any) {
      console.error('Ошибка расчета курса:', e);
      setToAmount('');
    }
  };
  
  const handleStartExchange = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError('Пожалуйста, введите корректную сумму');
      return;
    }

    if (!destinationAddress || destinationAddress.trim().length < 10) {
      setError('Пожалуйста, введите корректный адрес получателя');
      return;
    }

    setError(null);
    setLoading(true);

    const isTrxUsdtPair =
      (fromCurrency === 'TRX' && toCurrency === 'USDT') ||
      (fromCurrency === 'USDT' && toCurrency === 'TRX');

    try {
      if (isTrxUsdtPair) {
        // Внутренний провайдер (как было)
        const response = await createExchangeRequest({
          from: fromCurrency,
          to: toCurrency,
          amount: parseFloat(fromAmount),
          destinationAddress: destinationAddress.trim()
        });

        setRequestId(response.requestId);
        setActiveProvider('internal');

        setPaymentDetails({
          walletAddress: response.paymentDetails.address,
          amountToSend: response.paymentDetails.amount.toString(),
          receivingAmount: response.paymentDetails.toReceive,
          expirationTime: new Date(response.paymentDetails.expirationTime).toLocaleTimeString()
        });

        await generateQRCode(response.paymentDetails.address);

        setExchangeStarted(true);
        setExchangeCompleted(false);
        setTxHash(null);
        setTimeLeft(30 * 60);

        const historyItem: ExchangeHistoryItem = {
          id: Date.now().toString(),
          requestId: response.requestId,
          fromCurrency,
          toCurrency,
          fromAmount: parseFloat(fromAmount),
          toAmount: parseFloat(response.paymentDetails.toReceive),
          destinationAddress: destinationAddress.trim(),
          status: 'active',
          createdAt: new Date().toISOString(),
          paymentAddress: response.paymentDetails.address,
          exactAmountToSend: response.paymentDetails.amount,
          expirationTime: response.paymentDetails.expirationTime,
          provider: 'internal'
        };
        addToHistory(historyItem);

        const exchangeData = {
          requestId: response.requestId,
          fromCurrency,
          toCurrency,
          fromAmount: parseFloat(fromAmount),
          toAmount: parseFloat(response.paymentDetails.toReceive),
          destinationAddress: destinationAddress.trim(),
          paymentAddress: response.paymentDetails.address,
          exactAmountToSend: response.paymentDetails.amount,
          expirationTime: response.paymentDetails.expirationTime,
          createdAt: new Date().toISOString(),
          provider: 'internal'
        };
        localStorage.setItem('activeExchange', JSON.stringify(exchangeData));
      } else {
        // SimpleSwap провайдер
        const createResp = await ssCreateExchange({
          currency_from: fromCurrency,
          currency_to: toCurrency,
          amount: parseFloat(fromAmount),
          address_to: destinationAddress.trim(),
          fixed: false
        });

        const ss = createResp.exchange;
        const payinAddress = ss.payin_address || '';
        const toReceive = toAmount || ss.amount_to || '';

        setRequestId(ss.id);
        setActiveProvider('simpleswap');

        setPaymentDetails({
          walletAddress: payinAddress,
          amountToSend: fromAmount,
          receivingAmount: String(toReceive),
          expirationTime: new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString()
        });

        if (payinAddress) await generateQRCode(payinAddress);

        setExchangeStarted(true);
        setExchangeCompleted(false);
        setTxHash(null);
        setTimeLeft(30 * 60);

        const historyItem: ExchangeHistoryItem = {
          id: Date.now().toString(),
          requestId: ss.id,
          fromCurrency,
          toCurrency,
          fromAmount: parseFloat(fromAmount),
          toAmount: parseFloat(String(toReceive)) || 0,
          destinationAddress: destinationAddress.trim(),
          status: 'active',
          createdAt: new Date().toISOString(),
          paymentAddress: payinAddress,
          exactAmountToSend: parseFloat(fromAmount),
          expirationTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          provider: 'simpleswap'
        };
        addToHistory(historyItem);

        const exchangeData = {
          requestId: ss.id,
          fromCurrency,
          toCurrency,
          fromAmount: parseFloat(fromAmount),
          toAmount: parseFloat(String(toReceive)) || 0,
          destinationAddress: destinationAddress.trim(),
          paymentAddress: payinAddress,
          exactAmountToSend: parseFloat(fromAmount),
          expirationTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          provider: 'simpleswap'
        };
        localStorage.setItem('activeExchange', JSON.stringify(exchangeData));
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при создании заявки');
    } finally {
      setLoading(false);
    }
  };

  // Функция для тестирования - имитация платежа через API
  const handleSimulatePayment = async () => {
    if (!requestId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Вызываем API для симуляции платежа
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000');
      const response = await fetch(`${API_URL}/simulate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при симуляции платежа');
      }
      
      const result = await response.json();
      
      // Устанавливаем статус обмена как завершенный
      setExchangeCompleted(true);
      setTxHash(result.txHash);
      setExchangeStarted(false);
      
      // Уведомляем пользователя об успешной симуляции
      // alert(`Платеж успешно симулирован! Транзакция: ${result.txHash}`);
      
    } catch (err: any) {
      setError(err.message || 'Ошибка при симуляции платежа');
    } finally {
      setLoading(false);
    }
  };
  
  // Функция для проверки USDT-транзакций
  const handleCheckUsdt = async () => {
    if (!requestId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Вызываем API для проверки USDT транзакций
              const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000');
        const response = await fetch(`${API_URL}/check-usdt-transactions/${requestId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при проверке USDT-транзакций');
      }
      
      const result = await response.json();
      
      if (result.matchedRequest) {
        // Нашли соответствие, платеж был обработан
        setExchangeCompleted(true);
        setTxHash(result.matchedRequest.txHash);
        setExchangeStarted(false);
      } else if (result.transactions.length > 0) {
        // Транзакции USDT найдены, но нет соответствия с нашей заявкой
        setError(`Найдено ${result.transactions.length} USDT-транзакций, но ни одна не соответствует вашему платежу. Убедитесь, что вы отправили точную сумму.`);
      } else {
        // Транзакции USDT не найдены
        setError('USDT-транзакции не найдены. Пожалуйста, убедитесь, что вы отправили средства на указанный адрес.');
      }
      
    } catch (err: any) {
      setError(err.message || 'Ошибка при проверке USDT-транзакций');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setExchangeStarted(false);
    setRequestId(null);
    setQrCodeUrl('');
    setTimeLeft(30 * 60); // Сбрасываем таймер
    
    // Обновляем статус в истории
    if (requestId) {
      const activeItem = exchangeHistory.find(item => item.requestId === requestId && item.status === 'active');
      if (activeItem) {
        updateHistoryItem(activeItem.id, {
          status: 'cancelled',
          cancelledAt: new Date().toISOString()
        });
      }
    }
    
    // Очищаем активный обмен из localStorage при отмене
    localStorage.removeItem('activeExchange');
  };
  
  const handleStartNewExchange = () => {
    setExchangeCompleted(false);
    setTxHash(null);
    setFromAmount('');
    setToAmount('');
    setRequestId(null);
  };
  
  // Получение ссылки на транзакцию в TronScan
  const getTronScanUrl = (hash: string) => {
    return `https://tronscan.org/#/transaction/${hash}`;
  };

  // Функции для работы с историей сделок
  const addToHistory = (item: ExchangeHistoryItem) => {
    const newHistory = [item, ...exchangeHistory];
    setExchangeHistory(newHistory);
    localStorage.setItem('exchangeHistory', JSON.stringify(newHistory));
  };

  const updateHistoryItem = (id: string, updates: Partial<ExchangeHistoryItem>) => {
    const newHistory = exchangeHistory.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    setExchangeHistory(newHistory);
    localStorage.setItem('exchangeHistory', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setExchangeHistory([]);
    localStorage.removeItem('exchangeHistory');
  };

  const openHistoryModal = (item: ExchangeHistoryItem) => {
    setSelectedHistoryItem(item);
    setShowHistoryModal(true);
  };

  const closeHistoryModal = () => {
    setSelectedHistoryItem(null);
    setShowHistoryModal(false);
  };

  // Генерация QR кода для адреса кошелька
  const generateQRCode = async (address: string) => {
    try {
      const qrDataURL = await QRCode.toDataURL(address, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataURL);
    } catch (error) {
      console.error('Ошибка генерации QR кода:', error);
    }
  };
  
  // Таймер обратного отсчета
  useEffect(() => {
    if (exchangeStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [exchangeStarted, timeLeft]);

  // Форматирование времени
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Проверка статуса обмена каждые 10 секунд
  useEffect(() => {
    let interval: number | undefined;

    if (exchangeStarted && requestId) {
      interval = window.setInterval(async () => {
        try {
          if (activeProvider === 'simpleswap') {
            const statusData = await ssGetStatus(requestId);
            const status = statusData && (statusData.status || statusData.state || '').toLowerCase();
            if (status === 'finished' || status === 'completed' || status === 'success') {
              setError(null);
              setExchangeCompleted(true);
              setExchangeStarted(false);
              localStorage.removeItem('activeExchange');
              const activeItem = exchangeHistory.find(item => item.requestId === requestId && item.status === 'active');
              if (activeItem) {
                updateHistoryItem(activeItem.id, {
                  status: 'completed',
                  completedAt: new Date().toISOString(),
                  txHash: statusData.txid || statusData.tx_hash || undefined
                });
              }
            } else if (status === 'expired') {
              setError('Время ожидания платежа истекло');
              setExchangeStarted(false);
              const activeItem = exchangeHistory.find(item => item.requestId === requestId && item.status === 'active');
              if (activeItem) {
                updateHistoryItem(activeItem.id, { status: 'expired' });
              }
            }
          } else {
            const statusResponse = await checkExchangeStatus(requestId);
            if (statusResponse.request.status === 'completed') {
              setError(null);
              setTxHash(statusResponse.request.txHash);
              setExchangeCompleted(true);
              setExchangeStarted(false);
              localStorage.removeItem('activeExchange');
              const activeItem = exchangeHistory.find(item => item.requestId === requestId && item.status === 'active');
              if (activeItem) {
                updateHistoryItem(activeItem.id, {
                  status: 'completed',
                  completedAt: new Date().toISOString(),
                  txHash: statusResponse.request.txHash || undefined
                });
              }
            } else if (statusResponse.request.status === 'expired') {
              setError('Время ожидания платежа истекло');
              setExchangeStarted(false);
              const activeItem = exchangeHistory.find(item => item.requestId === requestId && item.status === 'active');
              if (activeItem) {
                updateHistoryItem(activeItem.id, { status: 'expired' });
              }
            } else if (statusResponse.request.status === 'error') {
              setError('Произошла ошибка при обработке платежа');
            }
          }
        } catch (err) {
          console.error('Ошибка при проверке статуса:', err);
        }
      }, 10000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [exchangeStarted, requestId, activeProvider]);
  
  // Обработчик горячих клавиш для отладки
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+U для принудительной проверки USDT транзакций
      if (e.ctrlKey && e.shiftKey && e.key === 'U' && requestId && fromCurrency === 'USDT' && exchangeStarted) {
        console.log('Debug: Manually checking USDT transactions');
        
        setLoading(true);
        checkUsdtTransactions(requestId)
          .then(result => {
            if (result.matchedRequest) {
              // Нашли соответствие, платеж был обработан
              setExchangeCompleted(true);
              setTxHash(result.matchedRequest.txHash);
              setExchangeStarted(false);
              console.log('Debug: USDT payment matched and processed', result.matchedRequest);
            } else if (result.transactions && result.transactions.length > 0) {
              console.log('Debug: USDT transactions found but no match', result.transactions);
            } else {
              console.log('Debug: No USDT transactions found');
            }
          })
          .catch(err => {
            console.error('Debug: Error checking USDT transactions', err);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [requestId, fromCurrency, exchangeStarted]);

  // Функция для получения иконки валюты
  const getCurrencyIcon = (currency: Currency | string) => {
    switch (currency) {
      case 'TRX':
        return trxIcon;
      case 'USDT':
        return usdtIcon;
      case 'SOL':
        return solIcon;
      case 'BTC':
        return btcIcon;
      case 'USDC':
        return usdcIcon;
      case 'ETH':
        return ethIcon;
      default:
        return usdtIcon;
    }
  };

  return (
    <div id="exchange" className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
            <ArrowUpDown className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white">{t('exchange.title')}</h3>
            <p className="text-gray-400 text-xs md:text-sm">{t('exchange.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-colors"
        >
          <History className="w-4 h-4" />
          <span className="text-sm font-medium">История</span>
          {exchangeHistory.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {exchangeHistory.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Отображаем ошибки, если они есть */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Экран успешного обмена */}
      {exchangeCompleted && txHash ? (
        <div className="space-y-6">
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 text-center">
            <div className="flex flex-col items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">{t('exchange.exchangeCompleted')}</h3>
              <p className="text-gray-300 mb-4">{t('exchange.fundsSent')}</p>
              
              <div className="bg-gray-800/50 rounded-xl p-4 w-full mb-4">
                <div className="text-gray-400 text-sm mb-2">{t('exchange.transactionHash')}:</div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-mono text-sm truncate mr-2">{txHash}</span>
                  <a 
                    href={getTronScanUrl(txHash)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              <button 
                onClick={handleStartNewExchange}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                {t('exchange.newExchange')}
              </button>
            </div>
          </div>
        </div>
      ) : !exchangeStarted ? (
        <div className="space-y-4">
          {/* From Currency */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <label className="text-gray-400 text-sm">{t('exchange.from')}</label>
              <select
                value={fromCurrency}
                onChange={async (e) => {
                  const val = e.target.value;
                  setFromCurrency(val);
                  if (fromAmount) await handleFromAmountChange(fromAmount);
                }}
                className="bg-gray-900/60 text-gray-200 text-sm rounded-md px-2 py-1 border border-gray-700/50"
              >
                {availableSymbols.map((sym) => (
                  <option key={sym} value={sym}>{sym}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-lg px-3 py-2 border border-white/20">
                <img 
                  src={getCurrencyIcon(fromCurrency)} 
                  alt={fromCurrency}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-white font-medium">{fromCurrency}</span>
              </div>
              <div className="flex-1 relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  className="w-full bg-transparent text-white text-xl font-bold placeholder-gray-500 focus:outline-none text-right pr-2"
                />
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <ArrowUpDown className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* To Currency */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <label className="text-gray-400 text-sm">{t('exchange.to')}</label>
              <select
                value={toCurrency}
                onChange={async (e) => {
                  const val = e.target.value;
                  setToCurrency(val);
                  if (fromAmount) await handleFromAmountChange(fromAmount);
                }}
                className="bg-gray-900/60 text-gray-200 text-sm rounded-md px-2 py-1 border border-gray-700/50"
              >
                {availableSymbols.map((sym) => (
                  <option key={sym} value={sym}>{sym}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-lg rounded-lg px-3 py-2 border border-white/20">
                <img 
                  src={getCurrencyIcon(toCurrency)} 
                  alt={toCurrency}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-white font-medium">{toCurrency}</span>
              </div>
              <div className="flex-1 relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={toAmount}
                  readOnly
                  className="w-full bg-transparent text-white text-xl font-bold placeholder-gray-500 focus:outline-none text-right pr-2"
                />
              </div>
            </div>
          </div>
          
          {/* Recipient Address Field */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="mb-3">
              <label className="text-gray-400 text-sm">{t('exchange.recipientAddress')}</label>
            </div>
            <input
              type="text"
              placeholder={t('exchange.recipientAddress')}
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              className="w-full bg-transparent text-white font-medium placeholder-gray-500 focus:outline-none"
            />
          </div>

          {/* Exchange Rate */}
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <span className="text-gray-400 text-sm">{t('liveStats.exchangeRate')}</span>
            <div className="flex items-center">
              <span className="text-white font-medium mr-1">1</span>
              <img src={getCurrencyIcon(fromCurrency)} alt={fromCurrency} className="w-4 h-4 mr-1" />
              <span className="text-white font-medium">=</span>
              <span className="text-white font-medium mx-1">
                {(
                  () => {
                    const isTrxUsdtPair =
                      (fromCurrency === 'TRX' && toCurrency === 'USDT') ||
                      (fromCurrency === 'USDT' && toCurrency === 'TRX');
                    if (isTrxUsdtPair) {
                      return (fromCurrency === 'TRX' ? rates.TRX_TO_USDT.toFixed(6) : rates.USDT_TO_TRX.toFixed(6)) as unknown as React.ReactNode;
                    }
                    if (fromAmount && toAmount) {
                      const f = parseFloat(fromAmount);
                      const t = parseFloat(toAmount);
                      if (f > 0 && !Number.isNaN(t)) {
                        return ((t / f).toFixed(6)) as unknown as React.ReactNode;
                      }
                    }
                    return '-' as unknown as React.ReactNode;
                  }
                )()}
              </span>
              <img src={getCurrencyIcon(toCurrency)} alt={toCurrency} className="w-4 h-4" />
              {ratesLoading && <span className="text-xs text-blue-400 ml-2">(Обновляется...)</span>}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-2 p-3 bg-gray-800/30 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Network Fee</span>
              <div className="flex items-center">
                <span className="text-white">0.1</span>
                <img src={trxIcon} alt="TRX" className="w-3 h-3 ml-1" />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Exchange Fee</span>
              <span className="text-white">0.25%</span>
            </div>
            <div className="flex justify-between text-sm font-medium border-t border-gray-700 pt-2">
              <span className="text-gray-400">You'll receive</span>
              <div className="flex items-center">
                <span className="text-green-400">{toAmount || '0.00'}</span>
                <img src={getCurrencyIcon(toCurrency)} alt={toCurrency} className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>

          {/* Exchange Button */}
          <button 
            onClick={handleStartExchange}
            disabled={loading}
            className={`w-full ${
              loading 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
            } text-white font-bold py-4 rounded-xl transition-all duration-300 transform ${
              !loading && 'hover:scale-[1.02]'
            } flex items-center justify-center space-x-2`}
          >
            {loading ? (
                              <span>{t('exchange.processing')}</span>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>{t('exchange.startExchange')}</span>
              </>
            )}
          </button>


        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h5 className="text-red-400 font-medium">{t('exchange.waitingForPayment')}</h5>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="text-red-400 font-bold text-lg">{formatTime(timeLeft)}</div>
                  <div className="text-red-300 text-sm">Осталось времени для оплаты</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-gray-400 text-sm">{t('exchange.sendToThisAddress')}</label>
              <div className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
                {t('exchange.important')}
              </div>
            </div>
            
            {/* QR код и адрес */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* QR код */}
              {qrCodeUrl && (
                <div className="flex-shrink-0">
                  <div className="bg-white p-2 sm:p-3 rounded-lg">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR код адреса" 
                      className="w-24 h-24 sm:w-32 sm:h-32 md:w-28 md:h-28"
                    />
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-2">{t('exchange.scanToPay')}</p>
                </div>
              )}
              
              {/* Адрес */}
              <div className="flex-1 min-w-0">
                <div className="p-3 bg-gray-800/70 rounded-lg break-all font-mono text-white text-sm">
                  {paymentDetails.walletAddress}
                </div>
              </div>
            </div>
            
            {/* Предупреждение о точной сумме */}
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="text-red-400 font-bold text-sm">⚠️ {t('exchange.sendExactAmount')}</div>
              </div>
              <div className="text-red-300 text-xs mt-1">
                {t('exchange.sendExactAmountDesc').replace('{amount}', paymentDetails.amountToSend).replace('{currency}', fromCurrency)}
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">{t('exchange.amountToSend')}:</span>
                <div className="flex items-center">
                  <span className="text-white font-bold">{paymentDetails.amountToSend}</span>
                  <img 
                    src={getCurrencyIcon(fromCurrency)} 
                    alt={fromCurrency}
                    className="w-4 h-4 ml-1"
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t('exchange.youWillReceive')}:</span>
                <div className="flex items-center">
                  <span className="text-green-400 font-bold">{paymentDetails.receivingAmount}</span>
                  <img 
                    src={getCurrencyIcon(toCurrency)} 
                    alt={toCurrency}
                    className="w-4 h-4 ml-1"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">{t('exchange.status')}:</span>
                <span className="text-yellow-400">{t('exchange.waitingForPayment')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t('exchange.toAddress')}:</span>
                <span className="text-white truncate max-w-[200px]">{destinationAddress}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleCancel}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 sm:py-4 rounded-xl transition-all duration-300 text-sm sm:text-base"
          >
            {t('exchange.cancelExchange')}
          </button>
        </div>
      )}

      {/* История сделок */}
      {showHistory && (
        <div className="mt-6 bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-white">История сделок</h4>
            <button
              onClick={clearHistory}
              className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Очистить</span>
            </button>
          </div>
          
          {exchangeHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">История сделок пуста</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {exchangeHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openHistoryModal(item)}
                  className="bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-3 cursor-pointer transition-colors border border-gray-700/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={getCurrencyIcon(item.fromCurrency as Currency | string)} alt={String(item.fromCurrency)} className="w-6 h-6" />
                      <span className="text-white font-medium">{item.fromAmount}</span>
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                      <img src={getCurrencyIcon(item.toCurrency as Currency | string)} alt={String(item.toCurrency)} className="w-6 h-6" />
                      <span className="text-white font-medium">{item.toAmount}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                        item.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {item.status === 'completed' ? 'Завершена' :
                         item.status === 'active' ? 'Активна' :
                         item.status === 'cancelled' ? 'Отменена' :
                         'Истекла'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Модальное окно с деталями сделки */}
      {showHistoryModal && selectedHistoryItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Детали сделки</h3>
              <button
                onClick={closeHistoryModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm">Обмен</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedHistoryItem.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    selectedHistoryItem.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                    selectedHistoryItem.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {selectedHistoryItem.status === 'completed' ? 'Завершена' :
                     selectedHistoryItem.status === 'active' ? 'Активна' :
                     selectedHistoryItem.status === 'cancelled' ? 'Отменена' :
                     'Истекла'}
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="text-center">
                    <img src={getCurrencyIcon(selectedHistoryItem.fromCurrency as Currency | string)} alt={String(selectedHistoryItem.fromCurrency)} className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-white font-bold">{selectedHistoryItem.fromAmount}</span>
                    <div className="text-gray-400 text-sm">{String(selectedHistoryItem.fromCurrency)}</div>
                  </div>
                  <ArrowUpDown className="w-6 h-6 text-gray-400" />
                  <div className="text-center">
                    <img src={getCurrencyIcon(selectedHistoryItem.toCurrency as Currency | string)} alt={String(selectedHistoryItem.toCurrency)} className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-white font-bold">{selectedHistoryItem.toAmount}</span>
                    <div className="text-gray-400 text-sm">{String(selectedHistoryItem.toCurrency)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">ID заявки:</span>
                  <span className="text-white font-mono">{selectedHistoryItem.requestId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Адрес получателя:</span>
                  <span className="text-white font-mono text-xs truncate max-w-[200px]">{selectedHistoryItem.destinationAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Создана:</span>
                  <span className="text-white">{new Date(selectedHistoryItem.createdAt).toLocaleString()}</span>
                </div>
                {selectedHistoryItem.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Завершена:</span>
                    <span className="text-white">{new Date(selectedHistoryItem.completedAt).toLocaleString()}</span>
                  </div>
                )}
                {selectedHistoryItem.cancelledAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Отменена:</span>
                    <span className="text-white">{new Date(selectedHistoryItem.cancelledAt).toLocaleString()}</span>
                  </div>
                )}
                {selectedHistoryItem.txHash && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Транзакция:</span>
                    <a 
                      href={getTronScanUrl(selectedHistoryItem.txHash)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs truncate max-w-[200px]"
                    >
                      {selectedHistoryItem.txHash}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeInterface;