import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpDown, Wallet, TrendingUp, Clock, CheckCircle, ExternalLink, QrCode } from 'lucide-react';
import { createExchangeRequest, checkExchangeStatus, Currency } from '../services/exchangeApi';
import { useExchangeRates, checkUsdtTransactions } from '../services/ratesService';
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
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState<Currency>('TRX');
  const [toCurrency, setToCurrency] = useState<Currency>('USDT');
  const [isSwapped, setIsSwapped] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [exchangeStarted, setExchangeStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
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

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value) {
      // Используем корректные курсы для расчета
      let calculatedAmount;
      if (fromCurrency === 'TRX' && toCurrency === 'USDT') {
        calculatedAmount = (parseFloat(value) * rates.TRX_TO_USDT).toFixed(6);
      } else {
        calculatedAmount = (parseFloat(value) * rates.USDT_TO_TRX).toFixed(6);
      }
      setToAmount(calculatedAmount);
    } else {
      setToAmount('');
    }
  };
  
  const handleStartExchange = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError('Пожалуйста, введите корректную сумму');
      return;
    }
    
    if (!destinationAddress || destinationAddress.trim().length < 34) {
      setError('Пожалуйста, введите корректный адрес получателя');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      // Отправляем запрос на создание заявки
      const response = await createExchangeRequest({
        from: fromCurrency,
        to: toCurrency,
        amount: parseFloat(fromAmount),
        destinationAddress: destinationAddress.trim()
      });
      
      setRequestId(response.requestId);
      
      // Устанавливаем данные для оплаты
      setPaymentDetails({
        walletAddress: response.paymentDetails.address,
        amountToSend: response.paymentDetails.amount.toString(),
        receivingAmount: response.paymentDetails.toReceive,
        expirationTime: new Date(response.paymentDetails.expirationTime).toLocaleTimeString()
      });

      // Генерируем QR код для адреса
      await generateQRCode(response.paymentDetails.address);
      
      setExchangeStarted(true);
      setExchangeCompleted(false);
      setTxHash(null);

      // Сохраняем активный обмен в localStorage
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
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('activeExchange', JSON.stringify(exchangeData));
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
  
  // Проверка статуса обмена каждые 10 секунд
  useEffect(() => {
    let interval: number | undefined;
    
    if (exchangeStarted && requestId) {
      interval = window.setInterval(async () => {
        try {
          const statusResponse = await checkExchangeStatus(requestId);
          
          if (statusResponse.request.status === 'completed') {
            setError(null);
            // Сохраняем хэш транзакции и устанавливаем статус обмена как завершенный
            setTxHash(statusResponse.request.txHash);
            setExchangeCompleted(true);
            setExchangeStarted(false);
            
            // Очищаем активный обмен из localStorage
            localStorage.removeItem('activeExchange');
            
            // Сохраняем завершенный обмен в историю
            const completedExchange = {
              requestId: requestId,
              fromCurrency,
              toCurrency,
              fromAmount: parseFloat(fromAmount),
              toAmount: parseFloat(toAmount),
              destinationAddress,
              txHash: statusResponse.request.txHash,
              completedAt: new Date().toISOString(),
              status: 'completed'
            };
            
            const history = JSON.parse(localStorage.getItem('exchangeHistory') || '[]');
            history.unshift(completedExchange); // Добавляем в начало
            localStorage.setItem('exchangeHistory', JSON.stringify(history.slice(0, 10))); // Храним последние 10
          } else if (statusResponse.request.status === 'expired') {
            setError('Время ожидания платежа истекло');
            setExchangeStarted(false);
          } else if (statusResponse.request.status === 'error') {
            setError('Произошла ошибка при обработке платежа');
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
  }, [exchangeStarted, requestId]);
  
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
  const getCurrencyIcon = (currency: Currency) => {
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
    <div id="exchange" className="bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center space-x-3 mb-4 md:mb-6">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
          <ArrowUpDown className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-bold text-white">Exchange</h3>
          <p className="text-gray-400 text-xs md:text-sm">Instant crypto trading</p>
        </div>
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
              <h3 className="text-2xl font-bold text-white mb-2">Обмен успешно завершен!</h3>
              <p className="text-gray-300 mb-4">Ваши средства успешно отправлены на указанный адрес</p>
              
              <div className="bg-gray-800/50 rounded-xl p-4 w-full mb-4">
                <div className="text-gray-400 text-sm mb-2">Хеш транзакции:</div>
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
                Начать новый обмен
              </button>
            </div>
          </div>
        </div>
      ) : !exchangeStarted ? (
        <div className="space-y-4">
          {/* From Currency */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-gray-400 text-sm">From</label>
              <span className="text-gray-400 text-sm">{fromCurrency}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-700/50 rounded-lg px-3 py-2">
                <img 
                  src={getCurrencyIcon(fromCurrency)} 
                  alt={fromCurrency}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-white font-medium">{fromCurrency}</span>
              </div>
              <input
                type="number"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                className="flex-1 bg-transparent text-white text-xl font-bold placeholder-gray-500 focus:outline-none"
              />
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
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-gray-400 text-sm">To</label>
              <span className="text-gray-400 text-sm">{toCurrency}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-700/50 rounded-lg px-3 py-2">
                <img 
                  src={getCurrencyIcon(toCurrency)} 
                  alt={toCurrency}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-white font-medium">{toCurrency}</span>
              </div>
              <input
                type="number"
                placeholder="0.00"
                value={toAmount}
                readOnly
                className="flex-1 bg-transparent text-white text-xl font-bold placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>
          
          {/* Recipient Address Field */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="mb-3">
              <label className="text-gray-400 text-sm">Адрес получателя</label>
            </div>
            <input
              type="text"
              placeholder="TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              className="w-full bg-transparent text-white font-medium placeholder-gray-500 focus:outline-none"
            />
          </div>

          {/* Exchange Rate */}
          <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <span className="text-gray-400 text-sm">Exchange Rate</span>
            <div className="flex items-center">
              <span className="text-white font-medium mr-1">1</span>
              <img src={getCurrencyIcon(fromCurrency)} alt={fromCurrency} className="w-4 h-4 mr-1" />
              <span className="text-white font-medium">=</span>
              <span className="text-white font-medium mx-1">
                {
                  fromCurrency === 'TRX' ? 
                    rates.TRX_TO_USDT.toFixed(6) : 
                    rates.USDT_TO_TRX.toFixed(6)
                }
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
              <span>Обработка...</span>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Start Exchange</span>
              </>
            )}
          </button>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {['25%', '50%', '75%', '100%'].map((percent) => (
              <button
                key={percent}
                onClick={() => handleFromAmountChange((1234.56 * parseInt(percent) / 100).toString())}
                className="py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-lg text-sm transition-colors"
              >
                {percent}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h5 className="text-red-400 font-medium">Ожидание оплаты</h5>
                <p className="text-gray-300 text-sm mt-1">
                  У вас есть 1 час для отправки средств. Заявка истекает в {paymentDetails.expirationTime}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-gray-400 text-sm">Отправьте на этот адрес</label>
              <div className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
                Важно!
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
                  <p className="text-center text-xs text-gray-400 mt-2">Сканируйте для оплаты</p>
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
                <div className="text-red-400 font-bold text-sm">⚠️ ПЕРЕВОДИТЕ ТОЧНУЮ СУММУ:</div>
              </div>
              <div className="text-red-300 text-xs mt-1">
                Переводите именно {paymentDetails.amountToSend} {fromCurrency}. Неточная сумма может привести к потере средств!
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Сумма к отправке:</span>
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
                <span className="text-gray-400">Вы получите:</span>
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
                <span className="text-gray-400">Статус:</span>
                <span className="text-yellow-400">Ожидание оплаты</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">На адрес:</span>
                <span className="text-white truncate max-w-[200px]">{destinationAddress}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleCancel}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 sm:py-4 rounded-xl transition-all duration-300 text-sm sm:text-base"
          >
            Отменить обмен
          </button>
        </div>
      )}
    </div>
  );
};

export default ExchangeInterface;