import React, { useState, useEffect } from 'react';
import { TrendingUp, Menu, X, Wallet, Bell, User, Shield, FileText } from 'lucide-react';
import { useExchangeRates } from '../services/ratesService';
import { useLanguage } from '../contexts/LanguageContext';
// Импортируем иконки
import trxIcon from '/icon-trx.png';
import usdtIcon from '/icon-usdt.png';

const Header: React.FC = () => {
  const [change, setChange] = useState(2.45);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { rates, isLoading } = useExchangeRates();
  const { t } = useLanguage();

  // Вычисляем цену TRX в USDT
  const price = rates.TRX_TO_USDT;

  // Имитируем изменение процента каждые 3 секунды
  useEffect(() => {
    const interval = setInterval(() => {
      setChange(prev => prev + (Math.random() - 0.5) * 0.5);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white/10 backdrop-blur-2xl border-b border-white/20 sticky top-0 z-50 mx-4 mt-4 rounded-2xl shadow-2xl">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img src="/logo.png" alt="CryptoXchange" className="w-12 h-12 rounded-xl shadow-lg" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {t('header.title')}
              </h1>
              <p className="text-xs text-gray-400 font-medium tracking-wide">{t('header.tagline')}</p>
            </div>
          </div>

          {/* Price Ticker - Desktop */}
          <div className="hidden lg:flex items-center space-x-4 bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/20 shadow-lg">
            <div className="flex items-center space-x-2">
              <img src={trxIcon} alt="TRX" className="w-6 h-6" />
              <span className="text-gray-300 font-medium text-sm">TRX/USDT</span>
            </div>
            <div className="w-px h-4 bg-gray-700"></div>
            <div className="flex items-center space-x-3">
              <span className="text-lg font-bold text-white tracking-tight">
                ${price.toFixed(4)}
                {isLoading && <span className="text-xs text-blue-400 ml-1">•</span>}
              </span>
              <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </span>
              <div className={`w-2 h-2 rounded-full animate-pulse ${change >= 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
            </div>
          </div>

          {/* Navigation & Actions - Desktop */}
          <div className="hidden lg:flex items-center space-x-6">
            <nav className="flex items-center space-x-8">
              <a href="#exchange" className="text-gray-300 hover:text-white transition-all duration-300 font-medium relative group">
                {t('exchange.title')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#crypto-fiat" className="text-gray-300 hover:text-white transition-all duration-300 font-medium relative group">
                {t('cryptoFiat.title')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#stats" className="text-gray-300 hover:text-white transition-all duration-300 font-medium relative group">
                {t('liveStats.title')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="/privacy" className="text-gray-300 hover:text-white transition-all duration-300 font-medium relative group">
                {t('footer.privacy')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="/terms" className="text-gray-300 hover:text-white transition-all duration-300 font-medium relative group">
                {t('footer.terms')}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>
            
            <div className="flex items-center space-x-3">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/20 py-6 animate-fadeIn">
            <div className="flex flex-col space-y-6">
              {/* Mobile Price Ticker */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={trxIcon} alt="TRX" className="w-6 h-6" />
                    <span className="text-gray-300 font-medium">TRX/USDT</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      ${price.toFixed(4)}
                      {isLoading && <span className="text-xs text-blue-400 ml-1">•</span>}
                    </div>
                    <div className="flex items-center justify-end space-x-2">
                      <span className={`text-sm font-semibold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                      </span>
                      <div className={`w-2 h-2 rounded-full animate-pulse ${change >= 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-4">
                <a href="#exchange" className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-xl hover:bg-gray-800/50">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">{t('exchange.title')}</span>
                </a>
                <a href="#crypto-fiat" className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-xl hover:bg-gray-800/50">
                  <Wallet className="w-5 h-5" />
                  <span className="font-medium">{t('cryptoFiat.title')}</span>
                </a>
                <a href="#stats" className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-xl hover:bg-gray-800/50">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{t('liveStats.title')}</span>
                </a>
                <a href="/privacy" className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-xl hover:bg-gray-800/50">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">{t('footer.privacy')}</span>
                </a>
                <a href="/terms" className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors py-3 px-4 rounded-xl hover:bg-gray-800/50">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">{t('footer.terms')}</span>
                </a>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;