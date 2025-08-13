import React, { useState, useEffect } from 'react';
import { Activity, Users, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useExchangeRates } from '../services/ratesService';

interface Transaction {
  id: string;
  type: 'exchange' | 'advance';
  from: string;
  to: string;
  amount: number;
  timestamp: Date;
  location?: string;
}

const LiveStats: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalVolume: 12400000,
    activeUsers: 2847,
    totalExchanges: 1247,
    avgExchangeRate: 1.0821
  });
  const { t } = useLanguage();
  const { rates, lastUpdate, isLoading } = useExchangeRates();

  // Generate random crypto-fiat transactions
  useEffect(() => {
    const generateTransaction = (): Transaction => {
      const cryptos = ['TRX', 'USDT', 'BTC', 'ETH', 'USDC', 'SOL'];
      const fiats = ['EUR', 'USD', 'PLN', 'UAH'];
      const cities = [
        // Германия
        'Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig',
        // Франция
        'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille',
        // Италия
        'Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Bari', 'Catania',
        // Испания
        'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao',
        // Польша
        'Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Bydgoszcz', 'Lublin', 'Katowice',
        // Украина
        'Kyiv', 'Kharkiv', 'Odesa', 'Dnipro', 'Donetsk', 'Zaporizhzhia', 'Lviv', 'Kryvyi Rih', 'Mykolaiv', 'Mariupol'
      ];
      
      // Случайно выбираем направление: crypto->fiat или fiat->crypto
      const isCryptoToFiat = Math.random() > 0.5;
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      
      if (isCryptoToFiat) {
        // Crypto to Fiat
        const crypto = cryptos[Math.floor(Math.random() * cryptos.length)];
        const fiat = fiats[Math.floor(Math.random() * fiats.length)];
        return {
          id: Math.random().toString(36).substr(2, 9),
          type: 'exchange',
          from: crypto,
          to: fiat,
          amount: Math.random() * 249000 + 1000, // 1k - 250k equivalent
          timestamp: new Date(),
          location: randomCity
        };
      } else {
        // Fiat to Crypto
        const crypto = cryptos[Math.floor(Math.random() * cryptos.length)];
        const fiat = fiats[Math.floor(Math.random() * fiats.length)];
        return {
          id: Math.random().toString(36).substr(2, 9),
          type: 'exchange',
          from: fiat,
          to: crypto,
          amount: Math.random() * 249000 + 1000, // 1k - 250k
          timestamp: new Date(),
          location: randomCity
        };
      }
    };

    // Initial transactions
    const initialTransactions = Array.from({ length: 5 }, generateTransaction);
    setTransactions(initialTransactions);

    // Add new transactions every 3-8 seconds
    const interval = setInterval(() => {
      const newTransaction = generateTransaction();
      setTransactions(prev => [newTransaction, ...prev.slice(0, 9)]);
      
      // Update stats occasionally
      if (Math.random() > 0.7) {
        setStats(prev => ({
          totalVolume: prev.totalVolume + Math.random() * 50000,
          activeUsers: prev.activeUsers + Math.floor(Math.random() * 3),
          totalExchanges: prev.totalExchanges + (Math.random() > 0.8 ? 1 : 0),
          avgExchangeRate: prev.avgExchangeRate + (Math.random() - 0.5) * 0.01
        }));
      }
    }, Math.random() * 5000 + 3000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  return (
          <div id="stats" className="bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white">Live Statistics</h3>
            <p className="text-gray-400 text-xs md:text-sm">Real-time platform activity</p>
          </div>
        </div>
        
        {/* Индикатор источников курсов */}
        {lastUpdate && (
          <div className="flex items-center space-x-2">
            {isLoading && (
              <div className="flex items-center space-x-2 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Обновление...</span>
              </div>
            )}
            <div className="flex items-center space-x-2 px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs">
              <TrendingUp className="w-3 h-3" />
              <span>Coinpaprika API</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-gray-800/50 rounded-xl p-3 md:p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="text-lg md:text-2xl font-bold text-white mb-1">
            {formatCurrency(stats.totalVolume)}
          </div>
          <div className="text-xs text-gray-400">24h Volume</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-3 md:p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          </div>
          <div className="text-lg md:text-2xl font-bold text-white mb-1">
            {stats.activeUsers.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">Active Users</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-3 md:p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          </div>
          <div className="text-lg md:text-2xl font-bold text-white mb-1">
            {stats.totalExchanges}
          </div>
          <div className="text-xs text-gray-400">Total Exchanges</div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-3 md:p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          </div>
          <div className="text-lg md:text-2xl font-bold text-white mb-1">
            ${stats.avgExchangeRate.toFixed(4)}
          </div>
          <div className="text-xs text-gray-400">Avg Rate</div>
        </div>
      </div>

      {/* Live Transactions */}
      <div>
        <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Live Transactions</span>
        </h4>
        
        <div className="space-y-2 max-h-64 md:max-h-96 overflow-y-auto">
          {transactions.map((tx) => (
            <div 
              key={tx.id}
              className="flex items-center justify-between p-2 md:p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors animate-fadeIn"
            >
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center bg-blue-500/20">
                  <ArrowUpRight className={`w-3 h-3 md:w-4 md:h-4 ${
                    tx.from === 'EUR' ? 'text-green-400' : 'text-red-400'
                  }`} />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <span className="text-white font-medium text-sm md:text-base truncate">
                      {tx.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} {tx.from}
                    </span>
                    <ArrowUpRight className="w-2 h-2 md:w-3 md:h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm md:text-base">{tx.to}</span>
                  </div>
                                          <div className="text-xs text-gray-400">
                          {tx.from === 'EUR' || tx.from === 'USD' || tx.from === 'PLN' || tx.from === 'UAH' ? 'Fiat → Crypto' : 'Crypto → Fiat'} • {tx.location} • {tx.timestamp.toLocaleTimeString()}
                        </div>
                </div>
              </div>
              
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                tx.type === 'exchange' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'bg-purple-500/20 text-purple-400'
              }`}>
                {tx.type === 'exchange' ? 'Exchange' : 'Advance'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveStats;