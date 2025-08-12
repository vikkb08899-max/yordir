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
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TRX Exchange</h1>
                <p className="text-xs text-gray-400">Professional Trading</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              The most advanced TRX/USDT trading platform with instant exchanges, 
              secure lending, and professional-grade tools.
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white transition-colors cursor-pointer">Instant Exchange</li>
              <li className="hover:text-white transition-colors cursor-pointer">TRX Advance</li>
              <li className="hover:text-white transition-colors cursor-pointer">Live Trading Chart</li>
              <li className="hover:text-white transition-colors cursor-pointer">Real-time Stats</li>
              <li className="hover:text-white transition-colors cursor-pointer">Mobile App</li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h3 className="text-white font-semibold mb-4">Security</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white transition-colors cursor-pointer">Cold Storage</li>
              <li className="hover:text-white transition-colors cursor-pointer">2FA Authentication</li>
              <li className="hover:text-white transition-colors cursor-pointer">Insurance Coverage</li>
              <li className="hover:text-white transition-colors cursor-pointer">Audit Reports</li>
              <li className="hover:text-white transition-colors cursor-pointer">Bug Bounty</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white transition-colors cursor-pointer">Help Center</li>
              <li className="hover:text-white transition-colors cursor-pointer">API Documentation</li>
              <li className="hover:text-white transition-colors cursor-pointer">Contact Us</li>
              <li className="hover:text-white transition-colors cursor-pointer">Community</li>
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
              © 2025 TRX Exchange. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;