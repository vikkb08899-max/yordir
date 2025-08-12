import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useExchangeRates } from '../services/ratesService';
// Импортируем иконки
import trxIcon from '/icon-trx.png';
import usdtIcon from '/icon-usdt.png';

interface ChartDataPoint {
  time: string;
  price: number;
  volume: number;
}

const TradingChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeframe, setTimeframe] = useState('1H');
  const [priceChange, setPriceChange] = useState(2.45);
  const { rates, isLoading } = useExchangeRates();

  // Получаем актуальный курс TRX в USDT
  const currentPrice = rates.TRX_TO_USDT;

  useEffect(() => {
    // Generate initial chart data
    const generateData = () => {
      const data: ChartDataPoint[] = [];
      let basePrice = currentPrice;
      
      for (let i = 0; i < 50; i++) {
        const variation = (Math.random() - 0.5) * 0.005;
        basePrice += variation;
        data.push({
          time: new Date(Date.now() - (49 - i) * 60000).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: Math.max(0.05, basePrice),
          volume: Math.random() * 1000000 + 500000
        });
      }
      setChartData(data);
    };

    generateData();

    // Update chart data every 5 seconds
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev];
        const lastPrice = newData[newData.length - 1].price;
        const variation = (Math.random() - 0.5) * 0.008;
        const newPrice = Math.max(0.05, lastPrice + variation);
        
        newData.push({
          time: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: newPrice,
          volume: Math.random() * 1000000 + 500000
        });

        if (newData.length > 50) {
          newData.shift();
        }

        setPriceChange(((newPrice - prev[0].price) / prev[0].price) * 100);
        
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [timeframe, currentPrice]);

  const timeframes = ['1M', '5M', '15M', '1H', '4H', '1D'];

  return (
    <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-800 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <img src={trxIcon} alt="TRX" className="w-6 h-6" />
            <h2 className="text-2xl font-bold text-white">TRX/USDT</h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-white">
              ${currentPrice.toFixed(4)}
              {isLoading && <span className="text-xs text-blue-400 ml-1">•</span>}
            </span>
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
              priceChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {priceChange >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-medium">
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4 lg:mt-0">
          {timeframes.map((tf) => (
            <button
              key={tf}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis 
              domain={['dataMin - 0.005', 'dataMax + 0.005']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(4)}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={(value: number) => [`$${value.toFixed(4)}`, 'Price']}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#EF4444" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#EF4444' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800">
        <div className="flex items-center space-x-2 text-gray-400">
          <Activity className="w-4 h-4" />
          <span className="text-sm">Live Trading Data</span>
        </div>
        <div className="text-sm text-gray-400">
          <div className="flex items-center">
            <span className="mr-1">1</span>
            <img src={trxIcon} alt="TRX" className="w-3 h-3 mr-1" />
            <span className="mr-1">=</span>
            <span>{currentPrice.toFixed(6)}</span>
            <img src={usdtIcon} alt="USDT" className="w-3 h-3 mx-1" />
          </div>
          <div className="text-right">
          24h Volume: <span className="text-white font-medium">$12.4M</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingChart;