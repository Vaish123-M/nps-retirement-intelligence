import { useState } from 'react'
import './App.css'

function App() {
  const [scenario, setScenario] = useState('moderate')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            NPS LifeMap – Retirement Intelligence Engine
          </h1>
          <p className="text-blue-100 text-sm md:text-base">
            Predictive retirement corpus and pension forecasting tool
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Input Controls */}
          <div className="space-y-6">
            
            {/* Basic Inputs Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Basic Inputs
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Age
                  </label>
                  <input
                    type="number"
                    placeholder="30"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retirement Age
                  </label>
                  <input
                    type="number"
                    placeholder="60"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Contribution (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="10,000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Corpus (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Scenario Selection Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Investment Scenario
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setScenario('conservative')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    scenario === 'conservative'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-xs mb-1">Conservative</div>
                  <div className="text-lg font-bold">8%</div>
                </button>
                <button
                  onClick={() => setScenario('moderate')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    scenario === 'moderate'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-xs mb-1">Moderate</div>
                  <div className="text-lg font-bold">10%</div>
                </button>
                <button
                  onClick={() => setScenario('aggressive')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    scenario === 'aggressive'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-xs mb-1">Aggressive</div>
                  <div className="text-lg font-bold">12%</div>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Expected annual return rate based on investment strategy
              </p>
            </div>

            {/* Goal-Based Reverse Planner Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Goal-Based Reverse Planner
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Retirement Corpus (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="1,00,00,000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                  Calculate Required Contribution
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Results Dashboard */}
          <div className="space-y-6">
            
            {/* Retirement Results Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Retirement Results
              </h2>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Corpus at Retirement</div>
                  <div className="text-3xl font-bold text-blue-700">₹ --</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Annuity Purchase (40%)</div>
                    <div className="text-lg font-semibold text-gray-800">₹ --</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Lump Sum (60%)</div>
                    <div className="text-lg font-semibold text-gray-800">₹ --</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pension Sustainability Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Pension Sustainability
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Pension</span>
                  <span className="text-xl font-bold text-green-600">₹ --</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pension Duration</span>
                  <span className="text-lg font-semibold text-gray-800">-- years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Life Expectancy</span>
                  <span className="text-lg font-semibold text-gray-800">-- years</span>
                </div>
                <div className="mt-4 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Pension coverage percentage
                </p>
              </div>
            </div>

            {/* Retirement Readiness Score Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Retirement Readiness Score
              </h2>
              <div className="flex flex-col items-center justify-center py-6">
                <div className="relative w-40 h-40">
                  <svg className="transform -rotate-90 w-40 h-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#3b82f6"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={`${0 * 4.4} ${440 - 0 * 4.4}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-800">--</div>
                      <div className="text-xs text-gray-500">out of 100</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Your retirement plan readiness
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Poor</div>
                  <div className="w-full h-2 bg-red-400 rounded"></div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Good</div>
                  <div className="w-full h-2 bg-yellow-400 rounded"></div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Excellent</div>
                  <div className="w-full h-2 bg-green-500 rounded"></div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2026 NPS LifeMap. Projections are estimates based on assumptions and may vary.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App

