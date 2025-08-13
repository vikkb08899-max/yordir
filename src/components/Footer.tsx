import React from 'react';
import { Shield, Zap, Users } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/80 backdrop-blur-lg border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/privacy" className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white transition-colors cursor-pointer">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>SSL Secured</span>
              </li>
              <li className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>99.9% Uptime</span>
              </li>
              <li className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>24/7 Support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-sm text-gray-400 mb-4 lg:mb-0">
              © 2025 CryptoXchange. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6">
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
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;