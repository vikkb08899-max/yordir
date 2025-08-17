import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Shield, Zap, TrendingUp, Globe } from 'lucide-react';

const ExchangeInterface: React.FC = () => {
  const { language } = useLanguage();

  useEffect(() => {
    const scriptSrc = 'https://changenow.io/embeds/exchange-widget/v2/stepper-connector.js';
    const existing = document.querySelector(`script[src="${scriptSrc}"]`);
    if (!existing) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const text = {
    title: language === 'ru' ? 'О сервисе обмена' : 'About the exchange',
    subtitle: language === 'ru'
      ? 'Надежный и удобный обмен криптовалют с прозрачными условиями'
      : 'Reliable and convenient crypto exchange with transparent terms',
    security: language === 'ru'
      ? 'Банковский уровень безопасности и мониторинг 24/7'
      : 'Bank‑grade security and 24/7 monitoring',
    speed: language === 'ru'
      ? 'Быстрое создание заявки и мгновенное подтверждение'
      : 'Quick order creation and instant confirmation',
    rate: language === 'ru'
      ? 'Курс фиксируется на время платежа'
      : 'The rate is locked during the payment window',
    coverage: language === 'ru'
      ? 'Работаем в ключевых регионах по миру'
      : 'Operating across key regions worldwide',
    howTitle: language === 'ru' ? 'Как это работает' : 'How it works',
    step1: language === 'ru' ? 'Выберите направление и сумму' : 'Choose direction and amount',
    step2: language === 'ru' ? 'Отправьте средства на указанный адрес' : 'Send funds to the provided address',
    step3: language === 'ru' ? 'Получите зачисление на ваш кошелек' : 'Receive funds to your wallet',
    note: language === 'ru'
      ? 'Отправляйте точную сумму и проверяйте сеть перед переводом. Поддержка 24/7.'
      : 'Send the exact amount and verify the network before transfer. 24/7 support.'
  } as const;

  return (
    <div id="exchange" className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
      <div className="w-full">
        <iframe
          id="iframe-widget"
          src="https://changenow.io/embeds/exchange-widget/v2/widget.html?FAQ=false&amount=0.1&amountFiat&backgroundColor=00000000&transparentBackground=true&darkMode=true&from=btc&horizontal=false&isFiat=false&lang=en-US&link_id=7f03f71701827c&locales=true&logo=false&primaryColor=e20c0c&to=eth&toTheMoon=false"
          style={{ height: '356px', width: '100%', border: 'none', background: 'transparent' }}
        />
      </div>

      {/* Desktop-only info block */}
      <div className="hidden lg:block mt-6 space-y-4">
        <div>
          <h4 className="text-white font-semibold text-lg">{text.title}</h4>
          <p className="text-gray-300 text-sm mt-1">{text.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start space-x-3">
            <Shield className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div className="text-sm text-gray-200">{text.security}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start space-x-3">
            <Zap className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div className="text-sm text-gray-200">{text.speed}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-red-400 mt-0.5" />
            <div className="text-sm text-gray-200">{text.rate}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-start space-x-3">
            <Globe className="w-5 h-5 text-cyan-400 mt-0.5" />
            <div className="text-sm text-gray-200">{text.coverage}</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-gray-300 text-sm font-medium mb-2">{text.howTitle}</div>
          <ol className="list-decimal list-inside text-sm text-gray-300 space-y-1">
            <li>{text.step1}</li>
            <li>{text.step2}</li>
            <li>{text.step3}</li>
          </ol>
          <div className="text-xs text-gray-400 mt-3">{text.note}</div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeInterface;
