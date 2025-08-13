import React from 'react';
import { Shield, Lock, Eye, Users, Database, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const PrivacyPolicy: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {t('privacy.title')}
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              {t('privacy.lastUpdated')}
            </p>
          </div>

          {/* Content */}
          <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-gray-800/50 p-8 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Lock className="w-6 h-6 text-red-400 mr-3" />
                Introduction
              </h2>
              <p className="text-gray-300 leading-relaxed">
                CryptoXchange ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                information when you use our cryptocurrency exchange services.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Database className="w-6 h-6 text-red-400 mr-3" />
                Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Personal Information</h3>
                  <ul className="text-gray-300 space-y-1 ml-4">
                    <li>• Full name and contact information</li>
                    <li>• Government-issued identification documents</li>
                    <li>• Proof of address and residency</li>
                    <li>• Financial information and banking details</li>
                    <li>• Cryptocurrency wallet addresses</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Technical Information</h3>
                  <ul className="text-gray-300 space-y-1 ml-4">
                    <li>• IP address and device information</li>
                    <li>• Browser type and version</li>
                    <li>• Operating system and platform</li>
                    <li>• Usage data and analytics</li>
                    <li>• Transaction history and patterns</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Eye className="w-6 h-6 text-red-400 mr-3" />
                How We Use Your Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">Service Provision</h3>
                  <p className="text-gray-300 text-sm">
                    Process transactions, verify identity, and provide customer support
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">Security & Compliance</h3>
                  <p className="text-gray-300 text-sm">
                    Prevent fraud, comply with regulations, and maintain platform security
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">Improvement</h3>
                  <p className="text-gray-300 text-sm">
                    Enhance services, develop new features, and optimize user experience
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">Communication</h3>
                  <p className="text-gray-300 text-sm">
                    Send important updates, security alerts, and service notifications
                  </p>
                </div>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Users className="w-6 h-6 text-red-400 mr-3" />
                Information Sharing
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. 
                We may share your information only in the following circumstances:
              </p>
              <ul className="text-gray-300 space-y-2 ml-4">
                <li>• With your explicit consent</li>
                <li>• To comply with legal obligations and regulations</li>
                <li>• To protect our rights, property, and safety</li>
                <li>• With trusted service providers who assist in our operations</li>
                <li>• In connection with business transfers or mergers</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Shield className="w-6 h-6 text-red-400 mr-3" />
                Data Security
              </h2>
              <div className="bg-gray-800/50 rounded-xl p-6">
                <p className="text-gray-300 leading-relaxed mb-4">
                  We implement industry-standard security measures to protect your information:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">End-to-end encryption for all data transmission</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">Multi-factor authentication and access controls</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">Regular security audits and penetration testing</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300 text-sm">Cold storage for cryptocurrency assets</span>
                  </div>
                </div>
              </div>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Globe className="w-6 h-6 text-red-400 mr-3" />
                International Data Transfers
              </h2>
              <p className="text-gray-300 leading-relaxed">
                As a global cryptocurrency exchange, your information may be transferred to 
                and processed in countries other than your own. We ensure that such transfers 
                comply with applicable data protection laws and implement appropriate safeguards.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">Access & Portability</h3>
                  <p className="text-gray-300 text-sm">
                    Request access to your personal data and receive it in a portable format
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">Correction</h3>
                  <p className="text-gray-300 text-sm">
                    Request correction of inaccurate or incomplete personal information
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">Deletion</h3>
                  <p className="text-gray-300 text-sm">
                    Request deletion of your personal data, subject to legal requirements
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">Objection</h3>
                  <p className="text-gray-300 text-sm">
                    Object to processing of your data for certain purposes
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <div className="bg-gray-800/50 rounded-xl p-6">
                <p className="text-gray-300 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our data practices, 
                  please contact us:
                </p>
                <div className="space-y-2 text-gray-300">
                  <p>Email: privacy@cryptoxchange.com</p>
                  <p>Support: support@cryptoxchange.com</p>
                  <p>Legal: legal@cryptoxchange.com</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 