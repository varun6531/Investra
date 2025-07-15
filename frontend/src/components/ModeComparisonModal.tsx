/*
ModeComparisonModal.tsx

What is this file for: Modal component that explains the difference between Base and Ultra modes to help users choose their preferred experience.

What the flow of the functions are: Component renders conditionally based on isOpen prop, displays feature comparison between modes with visual indicators, and onClose() saves user preference to localStorage to prevent future displays.

How this service is used: Shown to new users on first visit to explain the application's dual-mode functionality and help them understand which mode suits their needs.
*/

import React from 'react';

interface ModeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModeComparisonModal: React.FC<ModeComparisonModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-all duration-500 ease-in-out">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 transition-all duration-500 ease-in-out">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                Investra
                <span className="inline-block px-3 py-1 rounded bg-zinc-900 text-green-400 font-semibold text-2xl align-middle">Ultra</span>
              </h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Choose Your Experience</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Investra offers two powerful modes to help you with your financial questions. Select the mode that best fits your needs.
            </p>
          </div>

          {/* Mode Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Base Mode */}
            <div className="bg-blue-900/80 rounded-xl border border-blue-600 p-6 hover:border-blue-400 transition-all duration-500 ease-in-out">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Base Mode</h3>
                  <p className="text-blue-400 text-sm font-medium">Document-Based AI</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Pre-loaded financial document</p>
                    <p className="text-gray-400 text-sm">Access to "The Basics for Investing in Stocks" guide</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Smart citations</p>
                    <p className="text-gray-400 text-sm">Clickable page references with source links</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Focused responses</p>
                    <p className="text-gray-400 text-sm">Answers based solely on the loaded document</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-700 rounded-lg">
                <p className="text-gray-100 text-sm">
                  <span className="font-semibold text-blue-200">Perfect for:</span> Learning investment basics, understanding stock fundamentals, and getting reliable information from trusted sources.
                </p>
              </div>
            </div>

            {/* Ultra Mode */}
            <div className="bg-black rounded-xl border border-green-600 p-6 hover:border-green-400 transition-all duration-500 ease-in-out">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-black border-2 border-green-400 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block px-3 py-1 rounded bg-zinc-900 text-green-400 font-semibold text-xl align-middle">Ultra</span>
                  <h3 className="text-xl font-bold text-green-400">Mode</h3>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Everything from Base mode</p>
                    <p className="text-gray-400 text-sm">Includes document RAG, smart citations, and focused responses</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="8" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Real-time stock data</p>
                    <p className="text-purple-400 text-sm">Live stock prices, charts, and market information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <rect width="16" height="8" x="2" y="6" rx="2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Web search integration</p>
                    <p className="text-blue-400 text-sm">Access to latest financial news and market trends</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Comprehensive analysis</p>
                    <p className="text-gray-400 text-sm">Combines document knowledge with current market data</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-black border border-green-600 rounded-lg">
                <p className="text-green-300 text-sm">
                  <span className="font-semibold text-green-400">Perfect for:</span> Active investors, market research, current events analysis, and getting the most up-to-date financial information.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Get Started with Investra
            </button>
            <p className="text-gray-400 text-sm mt-3">
              You can switch between modes anytime using the toggle in the top-right corner
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeComparisonModal; 