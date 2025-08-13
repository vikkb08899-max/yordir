import React from 'react';
import { FileText, AlertTriangle, CheckCircle, XCircle, Shield, Users } from 'lucide-react';

const TermsConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-400" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Terms & Conditions
              </h1>
            </div>
            <p className="text-gray-400 text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Content */}
          <div className="bg-gray-900/60 backdrop-blur-lg rounded-2xl border border-gray-800/50 p-8 space-y-8">
            
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using CryptoXchange's services, you agree to be bound by these 
                Terms and Conditions. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Service Description</h2>
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  CryptoXchange provides cryptocurrency exchange services including:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Crypto-to-crypto exchanges</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Fiat-to-crypto exchanges</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Crypto-to-fiat exchanges</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Portfolio management tools</span>
                  </div>
                </div>
              </div>
            </section>

            {/* User Eligibility */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. User Eligibility</h2>
              <div className="bg-gray-800/50 rounded-xl p-6">
                <p className="text-gray-300 leading-relaxed mb-4">
                  To use our services, you must:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Be at least 18 years old</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Reside in a supported jurisdiction</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Complete identity verification (KYC)</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Comply with applicable laws and regulations</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Prohibited Activities */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Prohibited Activities</h2>
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  You agree not to engage in any of the following activities:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Money laundering or terrorist financing</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Fraudulent transactions or scams</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Market manipulation or insider trading</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Unauthorized access to our systems</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Violation of intellectual property rights</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Providing false or misleading information</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Fees and Charges */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Fees and Charges</h2>
              <div className="bg-gray-800/50 rounded-xl p-6">
                <p className="text-gray-300 leading-relaxed mb-4">
                  Our fee structure includes:
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Trading fees</span>
                    <span className="text-white font-semibold">0.1% - 0.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Withdrawal fees</span>
                    <span className="text-white font-semibold">Network dependent</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Deposit fees</span>
                    <span className="text-white font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Fiat processing fees</span>
                    <span className="text-white font-semibold">1% - 3%</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-4">
                  * Fees may vary based on trading volume, payment method, and jurisdiction
                </p>
              </div>
            </section>

            {/* Security and Liability */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Security and Liability</h2>
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-3 flex items-center">
                    <Shield className="w-5 h-5 text-red-400 mr-2" />
                    Our Security Measures
                  </h3>
                  <ul className="text-gray-300 space-y-2">
                    <li>• Multi-signature cold storage for cryptocurrency assets</li>
                    <li>• Advanced encryption and security protocols</li>
                    <li>• Regular security audits and penetration testing</li>
                    <li>• 24/7 monitoring and threat detection</li>
                    <li>• Insurance coverage for digital assets</li>
                  </ul>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-3 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                    User Responsibilities
                  </h3>
                  <ul className="text-gray-300 space-y-2">
                    <li>• Maintain secure account credentials</li>
                    <li>• Enable two-factor authentication</li>
                    <li>• Keep personal information updated</li>
                    <li>• Report suspicious activity immediately</li>
                    <li>• Comply with all applicable laws</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Dispute Resolution */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Dispute Resolution</h2>
              <div className="bg-gray-800/50 rounded-xl p-6">
                <p className="text-gray-300 leading-relaxed mb-4">
                  In the event of any dispute arising from these terms or our services:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300">Contact our support team first for resolution</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300">Mediation may be required for complex disputes</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300">Arbitration may be used as a final resolution method</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-300">Legal proceedings may be initiated if necessary</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Account Termination</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We reserve the right to suspend or terminate your account for:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">Violation of Terms</h3>
                  <p className="text-gray-300 text-sm">
                    Breach of these terms or applicable laws
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">Suspicious Activity</h3>
                  <p className="text-gray-300 text-sm">
                    Fraudulent or suspicious transactions
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">Inactivity</h3>
                  <p className="text-gray-300 text-sm">
                    Extended period of account inactivity
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2">Legal Requirements</h3>
                  <p className="text-gray-300 text-sm">
                    Compliance with regulatory requirements
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Contact Information</h2>
              <div className="bg-gray-800/50 rounded-xl p-6">
                <p className="text-gray-300 leading-relaxed mb-4">
                  For questions about these Terms & Conditions:
                </p>
                <div className="space-y-2 text-gray-300">
                  <p>Email: legal@cryptoxchange.com</p>
                  <p>Support: support@cryptoxchange.com</p>
                  <p>Compliance: compliance@cryptoxchange.com</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions; 