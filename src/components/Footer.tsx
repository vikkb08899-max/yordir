import React from 'react';
import { TrendingUp, Shield, Zap, Users } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/80 backdrop-blur-lg border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src="/logo.png" alt="CryptoXchange" className="w-10 h-10 rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-white">CryptoXchange</h1>
                <p className="text-xs text-gray-400">Global Crypto Exchange</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Professional cryptocurrency exchange operating worldwide with instant 
              crypto-to-crypto, crypto-to-fiat, and fiat-to-crypto exchanges.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white transition-colors cursor-pointer">Crypto Exchange</li>
              <li className="hover:text-white transition-colors cursor-pointer">Fiat Exchange</li>
              <li className="hover:text-white transition-colors cursor-pointer">Trading API</li>
              <li className="hover:text-white transition-colors cursor-pointer">Portfolio Management</li>
              <li className="hover:text-white transition-colors cursor-pointer">Mobile Trading</li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</li>
              <li className="hover:text-white transition-colors cursor-pointer">AML Policy</li>
              <li className="hover:text-white transition-colors cursor-pointer">KYC Policy</li>
              <li className="hover:text-white transition-colors cursor-pointer">Compliance</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white transition-colors cursor-pointer">Help Center</li>
              <li className="hover:text-white transition-colors cursor-pointer">Live Chat</li>
              <li className="hover:text-white transition-colors cursor-pointer">Email Support</li>
              <li className="hover:text-white transition-colors cursor-pointer">API Documentation</li>
              <li className="hover:text-white transition-colors cursor-pointer">Status Page</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 lg:mb-0">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>99.9% Uptime</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Users className="w-4 h-4 text-blue-400" />
                <span>24/7 Support</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              © 2025 CryptoXchange. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;