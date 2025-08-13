import React, { useState } from 'react';
import { Banknote, MapPin, Phone, Send, Globe, CheckCircle } from 'lucide-react';
// Импортируем иконки
import trxIcon from '/icon-trx.png';
import usdtIcon from '/icon-usdt.png';
import solIcon from '/icon-sol.png';
import btcIcon from '/icon-btc.png';
import usdcIcon from '/icon-usdc.png';
import ethIcon from '/icons8-ethereum-512.png';

interface Country {
  code: string;
  name: string;
  flag: string;
  cities: string[];
}

interface CryptoOption {
  symbol: string;
  name: string;
  icon: string;
}

interface FiatOption {
  symbol: string;
  name: string;
  icon: string;
}

const CryptoFiat: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption | null>(null);
  const [selectedFiat, setSelectedFiat] = useState<FiatOption | null>(null);
  const [exchangeType, setExchangeType] = useState<'crypto-to-fiat' | 'fiat-to-crypto'>('crypto-to-fiat');
  const [amount, setAmount] = useState('');
  const [calculatedAmount, setCalculatedAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(0);
  const [margin, setMargin] = useState(0);
  const [loading, setLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    telegram: '',
    whatsapp: '',
    preferredContact: 'telegram' as 'telegram' | 'whatsapp'
  });
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Доступные страны и города
  const countries: Country[] = [
    {
      code: 'DE',
      name: 'Германия',
      flag: '🇩🇪',
      cities: ['Берлин', 'Мюнхен', 'Гамбург', 'Франкфурт', 'Кёльн', 'Дюссельдорф', 'Штутгарт', 'Дортмунд', 'Эссен', 'Лейпциг']
    },
    {
      code: 'FR',
      name: 'Франция',
      flag: '🇫🇷',
      cities: ['Париж', 'Лион', 'Марсель', 'Тулуза', 'Ницца', 'Страсбург', 'Монпелье', 'Бордо', 'Лилль', 'Нант']
    },
    {
      code: 'IT',
      name: 'Италия',
      flag: '🇮🇹',
      cities: ['Рим', 'Милан', 'Неаполь', 'Турин', 'Флоренция', 'Венеция', 'Палермо', 'Генуя', 'Болонья', 'Бари']
    },
    {
      code: 'ES',
      name: 'Испания',
      flag: '🇪🇸',
      cities: ['Мадрид', 'Барселона', 'Валенсия', 'Севилья', 'Бильбао', 'Малага', 'Сарагоса', 'Мурсия', 'Пальма', 'Лас-Пальмас']
    },
    {
      code: 'PL',
      name: 'Польша',
      flag: '🇵🇱',
      cities: ['Варшава', 'Краков', 'Лодзь', 'Вроцлав', 'Познань', 'Гданьск', 'Щецин', 'Быдгощ', 'Люблин', 'Катовице']
    },
    {
      code: 'UA',
      name: 'Украина',
      flag: '🇺🇦',
      cities: ['Киев', 'Харьков', 'Одесса', 'Днепр', 'Донецк', 'Запорожье', 'Львов', 'Кривой Рог', 'Николаев', 'Мариуполь']
    }
  ];

  // Функция для получения иконки криптовалюты
  const getCryptoIcon = (symbol: string) => {
    switch (symbol) {
      case 'TRX':
        return trxIcon;
      case 'USDT':
        return usdtIcon;
      case 'SOL':
        return solIcon;
      case 'BTC':
        return btcIcon;
      case 'ETH':
        return ethIcon;
      case 'USDC':
        return usdcIcon;
      default:
        return usdtIcon;
    }
  };

  // Доступные криптовалюты
  const cryptoOptions: CryptoOption[] = [
    { symbol: 'TRX', name: 'Tron', icon: trxIcon },
    { symbol: 'USDT', name: 'Tether USD', icon: usdtIcon },
    { symbol: 'SOL', name: 'Solana', icon: solIcon },
    { symbol: 'BTC', name: 'Bitcoin', icon: btcIcon },
    { symbol: 'ETH', name: 'Ethereum', icon: ethIcon },
    { symbol: 'USDC', name: 'USD Coin', icon: usdcIcon }
  ];

  // Доступные фиатные валюты
  const fiatOptions: FiatOption[] = [
    { symbol: 'EUR', name: 'Евро', icon: '€' },
    { symbol: 'USD', name: 'Доллар США', icon: '$' },
    { symbol: 'PLN', name: 'Польский злотый', icon: 'zł' },
    { symbol: 'UAH', name: 'Украинская гривна', icon: '₴' }
  ];

  // Функция для получения курса и расчета суммы
  const calculateAmount = async (inputAmount: string) => {
    if (!selectedCrypto || !selectedFiat || !inputAmount || parseFloat(inputAmount) <= 0) {
      setCalculatedAmount('');
      setExchangeRate(0);
      setMargin(0);
      return;
    }

    try {
      const fromSymbol = exchangeType === 'crypto-to-fiat' ? selectedCrypto.symbol : selectedFiat.symbol;
      const toSymbol = exchangeType === 'crypto-to-fiat' ? selectedFiat.symbol : selectedCrypto.symbol;
      
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000');
      const response = await fetch(`${API_URL}/crypto-fiat-rate/${fromSymbol}/${toSymbol}`);
      const data = await response.json();
      
      if (data.success) {
        setExchangeRate(data.finalRate);
        setMargin(data.margin);
        
        const calculated = parseFloat(inputAmount) * data.finalRate;
        setCalculatedAmount(calculated.toFixed(6));
      } else {
        console.error('Ошибка получения курса:', data.error);
        setCalculatedAmount('');
        setExchangeRate(0);
        setMargin(0);
      }
    } catch (error) {
      console.error('Ошибка при расчете суммы:', error);
      setCalculatedAmount('');
      setExchangeRate(0);
      setMargin(0);
    }
  };

  // Обновляем расчет при изменении параметров
  React.useEffect(() => {
    if (amount) {
      calculateAmount(amount);
    }
  }, [selectedCrypto, selectedFiat, exchangeType, amount]);

  const handleSubmitRequest = async () => {
    if (!selectedCountry || !selectedCity || !selectedCrypto || !selectedFiat || !amount || (!contactInfo.telegram && !contactInfo.whatsapp)) {
      alert('Пожалуйста, заполните все обязательные поля и укажите хотя бы один способ связи');
      return;
    }

    setLoading(true);

    try {
      // Отправляем заявку на сервер
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000');
      const response = await fetch(`${API_URL}/crypto-fiat-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exchangeType: exchangeType,
          fromCurrency: exchangeType === 'crypto-to-fiat' ? selectedCrypto?.symbol : selectedFiat?.symbol,
          toCurrency: exchangeType === 'crypto-to-fiat' ? selectedFiat?.symbol : selectedCrypto?.symbol,
          fromAmount: amount,
          toAmount: calculatedAmount,
          country: selectedCountry.name,
          city: selectedCity,
          telegram: contactInfo.telegram,
          whatsapp: contactInfo.whatsapp
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setRequestSubmitted(true);
      } else {
        alert('Ошибка при отправке заявки: ' + result.error);
      }
    } catch (error) {
      console.error('Ошибка при отправке заявки:', error);
      alert('Ошибка при отправке заявки. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRequestSubmitted(false);
    setSelectedCountry(null);
    setSelectedCity('');
    setSelectedCrypto(null);
    setSelectedFiat({ symbol: 'EUR', name: 'Евро', icon: '€' }); // EUR по умолчанию
    setAmount('');
    setCalculatedAmount('');
    setExchangeRate(0);
    setMargin(0);
    setContactInfo({ telegram: '', whatsapp: '', preferredContact: 'telegram' });
  };

  // Устанавливаем EUR по умолчанию при загрузке
  React.useEffect(() => {
    if (!selectedFiat) {
      setSelectedFiat({ symbol: 'EUR', name: 'Евро', icon: '€' });
    }
  }, []);

  if (requestSubmitted) {
    return (
      <div id="crypto-fiat" className="bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-800 p-6">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Заявка отправлена!</h3>
          <p className="text-gray-300 mb-6">
            Ваша заявка на обмен {exchangeType === 'crypto-to-fiat' ? 'криптовалюты на наличные' : 'наличных на криптовалюту'} 
            получена. Мы свяжемся с вами в ближайшее время через указанный контакт.
          </p>
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <div className="text-sm text-gray-400 space-y-1">
              <div>Страна: <span className="text-white">{selectedCountry?.name}</span></div>
              <div>Город: <span className="text-white">{selectedCity}</span></div>
              <div>
                {exchangeType === 'crypto-to-fiat' ? 'Отдаете' : 'Получаете'}: 
                <span className="text-white ml-1">{amount} {selectedCrypto?.symbol}</span>
              </div>
              <div>
                {exchangeType === 'crypto-to-fiat' ? 'Получаете' : 'Отдаете'}: 
                <span className="text-white ml-1">{selectedFiat?.symbol}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={resetForm}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            Создать новую заявку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="crypto-fiat" className="bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
          <Banknote className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Crypto ⇄ Fiat</h3>
          <p className="text-gray-400 text-sm">Обмен криптовалют на наличные</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Тип обмена */}
        <div>
          <label className="block text-gray-400 text-sm mb-3">Тип обмена</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setExchangeType('crypto-to-fiat')}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                exchangeType === 'crypto-to-fiat'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Crypto → Fiat
            </button>
            <button
              onClick={() => setExchangeType('fiat-to-crypto')}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                exchangeType === 'fiat-to-crypto'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Fiat → Crypto
            </button>
          </div>
        </div>

        {/* Выбор страны */}
        <div>
          <label className="block text-gray-400 text-sm mb-3">Страна</label>
          <div className="grid grid-cols-1 gap-2">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => {
                  setSelectedCountry(country);
                  setSelectedCity(''); // Сбрасываем город при смене страны
                }}
                className={`flex items-center space-x-3 p-3 rounded-lg text-sm transition-colors ${
                  selectedCountry?.code === country.code
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <span className="text-lg">{country.flag}</span>
                <span>{country.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Выбор города */}
        {selectedCountry && (
          <div>
            <label className="block text-gray-400 text-sm mb-3">Город</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-gray-800/50 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Выберите город</option>
              {selectedCountry.cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        )}

        {/* Условный рендеринг секций валют в зависимости от типа обмена */}
        {exchangeType === 'crypto-to-fiat' ? (
          <>
            {/* Выбор криптовалюты (отдаете) */}
            <div>
              <label className="block text-gray-400 text-sm mb-3">Криптовалюта (отдаете)</label>
              <div className="grid grid-cols-2 gap-2">
                {cryptoOptions.map((crypto) => (
                  <button
                    key={crypto.symbol}
                    onClick={() => setSelectedCrypto(crypto)}
                    className={`flex items-center space-x-2 p-3 rounded-lg text-sm transition-colors ${
                      selectedCrypto?.symbol === crypto.symbol
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <img src={crypto.icon} alt={crypto.symbol} className="w-5 h-5" />
                    <span>{crypto.symbol}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Выбор фиатной валюты (получаете) */}
            <div>
              <label className="block text-gray-400 text-sm mb-3">Фиатная валюта (получаете)</label>
              <div className="grid grid-cols-1 gap-2">
                {fiatOptions.map((fiat) => (
                  <button
                    key={fiat.symbol}
                    onClick={() => setSelectedFiat(fiat)}
                    className={`flex items-center space-x-2 p-3 rounded-lg text-sm transition-colors ${
                      selectedFiat?.symbol === fiat.symbol
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="text-lg">{fiat.icon}</span>
                    <span>{fiat.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Выбор фиатной валюты (отдаете) */}
            <div>
              <label className="block text-gray-400 text-sm mb-3">Фиатная валюта (отдаете)</label>
              <div className="grid grid-cols-1 gap-2">
                {fiatOptions.map((fiat) => (
                  <button
                    key={fiat.symbol}
                    onClick={() => setSelectedFiat(fiat)}
                    className={`flex items-center space-x-2 p-3 rounded-lg text-sm transition-colors ${
                      selectedFiat?.symbol === fiat.symbol
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="text-lg">{fiat.icon}</span>
                    <span>{fiat.symbol}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Выбор криптовалюты (получаете) */}
            <div>
              <label className="block text-gray-400 text-sm mb-3">Криптовалюта (получаете)</label>
              <div className="grid grid-cols-2 gap-2">
                {cryptoOptions.map((crypto) => (
                  <button
                    key={crypto.symbol}
                    onClick={() => setSelectedCrypto(crypto)}
                    className={`flex items-center space-x-2 p-3 rounded-lg text-sm transition-colors ${
                      selectedCrypto?.symbol === crypto.symbol
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-800/50 text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <img src={crypto.icon} alt={crypto.symbol} className="w-5 h-5" />
                    <span>{crypto.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Сумма */}
        <div>
          <label className="block text-gray-400 text-sm mb-3">
            Сумма {exchangeType === 'crypto-to-fiat' ? selectedCrypto?.symbol || 'криптовалюты' : selectedFiat?.symbol || 'фиата'}
          </label>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                calculateAmount(e.target.value);
              }}
              className="w-full bg-transparent text-white text-xl font-bold placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Расчетная сумма */}
        {calculatedAmount && (
          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">
                {exchangeType === 'crypto-to-fiat' ? 'Вы получите' : 'Вам потребуется'}
              </span>
              {margin > 0 && (
                <span className="text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded-full">
                  Наценка: {margin}%
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-green-400">
              {calculatedAmount} {exchangeType === 'crypto-to-fiat' ? selectedFiat?.symbol : selectedCrypto?.symbol}
            </div>
            {exchangeRate > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Курс: 1 {exchangeType === 'crypto-to-fiat' ? selectedCrypto?.symbol : selectedFiat?.symbol} = {exchangeRate.toFixed(6)} {exchangeType === 'crypto-to-fiat' ? selectedFiat?.symbol : selectedCrypto?.symbol}
              </div>
            )}
          </div>
        )}

        {/* Контактная информация */}
        <div>
          <label className="block text-gray-400 text-sm mb-3">Контактная информация (укажите хотя бы один)</label>
          <div className="space-y-3">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Send className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Telegram</span>
              </div>
              <input
                type="text"
                placeholder="@username"
                value={contactInfo.telegram}
                onChange={(e) => setContactInfo({...contactInfo, telegram: e.target.value})}
                className="w-full bg-gray-800/50 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Phone className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">WhatsApp</span>
              </div>
              <input
                type="text"
                placeholder="+1234567890"
                value={contactInfo.whatsapp}
                onChange={(e) => setContactInfo({...contactInfo, whatsapp: e.target.value})}
                className="w-full bg-gray-800/50 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-2">Предпочтительный способ связи</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setContactInfo({...contactInfo, preferredContact: 'telegram'})}
                  className={`flex-1 p-2 rounded-lg text-sm transition-colors ${
                    contactInfo.preferredContact === 'telegram'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white'
                  }`}
                >
                  Telegram
                </button>
                <button
                  onClick={() => setContactInfo({...contactInfo, preferredContact: 'whatsapp'})}
                  className={`flex-1 p-2 rounded-lg text-sm transition-colors ${
                    contactInfo.preferredContact === 'whatsapp'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white'
                  }`}
                >
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Информационное сообщение */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Globe className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h5 className="text-blue-400 font-medium text-sm">Как это работает</h5>
              <p className="text-gray-300 text-xs mt-1">
                После отправки заявки наш оператор свяжется с вами для согласования деталей обмена. 
                Мы работаем только в указанных городах и гарантируем безопасность сделки.
              </p>
            </div>
          </div>
        </div>

        {/* Кнопка отправки */}
        <button 
          onClick={handleSubmitRequest}
          disabled={loading || !calculatedAmount}
          className={`w-full ${
            loading || !calculatedAmount
              ? 'bg-gray-700 cursor-not-allowed' 
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
          } text-white font-bold py-4 rounded-xl transition-all duration-300 transform ${
            !loading && calculatedAmount && 'hover:scale-[1.02]'
          } flex items-center justify-center space-x-2`}
        >
          <Send className="w-5 h-5" />
          <span>{loading ? 'Отправка...' : 'Отправить заявку'}</span>
        </button>
      </div>
    </div>
  );
};

export default CryptoFiat;