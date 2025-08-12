import React from 'react';
import Header from './components/Header';
import TradingChart from './components/TradingChart';
import ExchangeInterface from './components/ExchangeInterface';
import CryptoFiat from './components/TRXAdvance';
import LiveStats from './components/LiveStats';
import Footer from './components/Footer';
import { TrendingUp, Zap, Shield, RefreshCw } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />
      
      {/* Hero Section with Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6">
            Профессиональная торговля
            <span className="block text-red-500">TRX/USDT</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Мгновенные обмены, TRX авансы и профессиональные торговые инструменты 
            в одной современной платформе
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-gray-800/50 p-6 hover:border-red-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
              <TrendingUp className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">ТРХ вперед</h3>
            <p className="text-gray-400 text-sm">
              Получайте TRX мгновенно под залог USDT с минимальными процентами
            </p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-gray-800/50 p-6 hover:border-red-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
              <RefreshCw className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Автоматический обмен</h3>
            <p className="text-gray-400 text-sm">
              Мгновенные обмены TRX ⇄ USDT по лучшим курсам без задержек
            </p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-gray-800/50 p-6 hover:border-red-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Будь всегда в строю</h3>
            <p className="text-gray-400 text-sm">
              99.9% аптайм, надежная защита средств и круглосуточная поддержка
            </p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-gray-800/50 p-6 hover:border-red-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
              <Zap className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Автоматическое пополнение</h3>
            <p className="text-gray-400 text-sm">
              Умные алгоритмы для автоматического пополнения и управления балансом
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 space-y-8">
        {/* Compact Trading Chart Section */}
        <section className="w-full">
          <TradingChart />
        </section>

        {/* Exchange and Advance Interface */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ExchangeInterface />
          <CryptoFiat />
        </section>

        {/* Live Statistics */}
        <section className="w-full">
          <LiveStats />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;