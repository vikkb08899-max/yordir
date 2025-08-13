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

function HomePage() {
  return (
    <>
      {/* Hero Section with Features */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6">
            Global Crypto Exchange
            <span className="block text-red-500">Trusted Worldwide</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Professional cryptocurrency exchange operating in major cities worldwide. 
            Instant crypto-to-crypto, crypto-to-fiat, and fiat-to-crypto exchanges with 
            competitive rates and 24/7 support.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-gray-800/50 p-6 hover:border-red-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
              <TrendingUp className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Global Coverage</h3>
            <p className="text-gray-400 text-sm">
              Operating in major cities worldwide with local payment methods and support
            </p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-gray-800/50 p-6 hover:border-red-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
              <RefreshCw className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Instant Exchange</h3>
            <p className="text-gray-400 text-sm">
              Lightning-fast crypto exchanges with real-time rates and minimal fees
            </p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-gray-800/50 p-6 hover:border-red-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Bank-Grade Security</h3>
            <p className="text-gray-400 text-sm">
              99.9% uptime, cold storage, and 24/7 monitoring for maximum security
            </p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-gray-800/50 p-6 hover:border-red-500/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
              <Zap className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Smart Trading</h3>
            <p className="text-gray-400 text-sm">
              Advanced algorithms for optimal rates and automated portfolio management
            </p>
          </div>
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
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Пульсирующий фон */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
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
  );
}

export default App;