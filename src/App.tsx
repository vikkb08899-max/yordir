import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import TradingChart from './components/TradingChart';
import ExchangeInterface from './components/ExchangeInterface';
import CryptoFiat from './components/TRXAdvance';
import LiveStats from './components/LiveStats';
import Footer from './components/Footer';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsConditions from './components/TermsConditions';
import { TrendingUp, Zap, Shield, RefreshCw } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

function FeaturesGrid() {
  const { t } = useLanguage();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-2xl p-6 hover:border-blue-500/50 transition-all duration-300 group">
        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
          <TrendingUp className="w-6 h-6 text-blue-400" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">{t('features.globalCoverage.title')}</h3>
        <p className="text-slate-300 text-sm">
          {t('features.globalCoverage.description')}
        </p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 group">
        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-colors">
          <RefreshCw className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">{t('features.instantExchange.title')}</h3>
        <p className="text-slate-300 text-sm">
          {t('features.instantExchange.description')}
        </p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-2xl p-6 hover:border-red-500/50 transition-all duration-300 group">
        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
          <Shield className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">{t('features.bankGradeSecurity.title')}</h3>
        <p className="text-slate-300 text-sm">
          {t('features.bankGradeSecurity.description')}
        </p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-slate-700/30 shadow-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 group">
        <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-colors">
          <Zap className="w-6 h-6 text-cyan-400" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">{t('features.smartTrading.title')}</h3>
        <p className="text-slate-300 text-sm">
          {t('features.smartTrading.description')}
        </p>
      </div>
    </div>
  );
}

function HomePage() {
  const { t } = useLanguage();
  
  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6">
            {t('hero.title')}
            <span className="block text-red-500">{t('hero.subtitle')}</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            {t('hero.description')}
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 space-y-8">
        {/* Exchange and Advance Interface */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ExchangeInterface />
          <CryptoFiat />
        </section>

        {/* Compact Trading Chart Section */}
        <section className="w-full">
          <TradingChart />
        </section>

        {/* Live Statistics */}
        <section className="w-full">
          <LiveStats />
        </section>

        {/* Features Grid - moved here */}
        <section className="w-full">
          <FeaturesGrid />
        </section>
      </main>
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 relative overflow-hidden">
        {/* Динамический фон */}
        <div className="absolute inset-0">
          {/* Темный базовый фон */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-900"></div>
          
          {/* Темно-синие импульсы */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-indigo-900/15 animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-blue-800/10 via-transparent to-cyan-900/10 animate-pulse" style={{animationDelay: '2s', animationDuration: '6s'}}></div>
          
          {/* Зеленые импульсы */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/15 via-transparent to-green-900/10 animate-pulse" style={{animationDelay: '1s', animationDuration: '5s'}}></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-teal-900/10 via-transparent to-emerald-800/8 animate-pulse" style={{animationDelay: '3s', animationDuration: '7s'}}></div>
          
          {/* Красные импульсы */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/12 via-transparent to-rose-900/8 animate-pulse" style={{animationDelay: '0.5s', animationDuration: '4.5s'}}></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-red-800/8 via-transparent to-pink-900/6 animate-pulse" style={{animationDelay: '2.5s', animationDuration: '6.5s'}}></div>
          
          {/* Плавающие частицы */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-500/40 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-emerald-500/50 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '2.5s'}}></div>
            <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-red-500/45 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '3.5s'}}></div>
            <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-cyan-500/40 rounded-full animate-bounce" style={{animationDelay: '3s', animationDuration: '2.8s'}}></div>
            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-indigo-500/35 rounded-full animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4s'}}></div>
            <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-teal-500/45 rounded-full animate-bounce" style={{animationDelay: '2.5s', animationDuration: '3.2s'}}></div>
          </div>
          
          {/* Волновой эффект */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-800/30 to-transparent"></div>
        </div>
        
        {/* Анимированные размытые круги */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-emerald-900/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-red-900/12 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s', animationDuration: '9s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-indigo-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '11s' }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-cyan-900/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s', animationDuration: '7s' }}></div>
      <div className="relative z-10">
        <Header />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
        </Routes>

        <Footer />
      </div>
      </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;