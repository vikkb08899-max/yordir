import React, { useEffect } from 'react';

const ExchangeInterface: React.FC = () => {
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

  return (
    <div id="exchange" className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 h-full">
      <div className="w-full">
        <iframe
          id="iframe-widget"
          src="https://changenow.io/embeds/exchange-widget/v2/widget.html?FAQ=false&amount=0.1&amountFiat&backgroundColor=2B2B35&darkMode=true&from=btc&horizontal=false&isFiat=false&lang=en-US&link_id=7f03f71701827c&locales=true&logo=false&primaryColor=e20c0c&to=eth&toTheMoon=false"
          style={{ height: '356px', width: '100%', border: 'none' }}
        />
      </div>
    </div>
  );
};

export default ExchangeInterface;
