import { useState, useEffect } from 'react'
import './App.css'
import {
  calculateRetirementCorpus,
  calculateNPSWithdrawal,
  calculatePensionSustainability,
  calculateRequiredContribution,
  calculateRetirementReadiness
} from './utils/retirementCalculator'

function App() {
  // Scenario selection state
  const [scenario, setScenario] = useState('moderate')
  
  // Input states
  const [inputs, setInputs] = useState({
    currentAge: 30,
    retirementAge: 60,
    monthlyContribution: 10000,
    currentCorpus: 0,
    annualStepUp: 5,
    inflationRate: 6,
    expectedMonthlyExpense: 50000,
    targetCorpus: 10000000
  })

  // Calculation results state
  const [results, setResults] = useState({
    totalCorpus: 0,
    annuityAmount: 0,
    lumpSumAmount: 0,
    monthlyPension: 0,
    yearsOfSustainability: 0,
    sustainabilityScore: 0,
    readinessScore: 0,
    readinessLevel: 'Poor',
    yearlyProjection: []
  })

  // Scenario return rates
  const scenarioRates = {
    conservative: 8,
    moderate: 10,
    aggressive: 12
  }

  // Calculate results whenever inputs or scenario changes
  useEffect(() => {
    calculateResults()
  }, [inputs, scenario])

  const calculateResults = () => {
    const expectedAnnualReturn = scenarioRates[scenario]

    // Step 1: Calculate retirement corpus
    const corpusResult = calculateRetirementCorpus({
      currentAge: inputs.currentAge,
      retirementAge: inputs.retirementAge,
      monthlyContribution: inputs.monthlyContribution,
      expectedAnnualReturn,
      annualStepUp: inputs.annualStepUp,
      currentCorpus: inputs.currentCorpus,
      inflationRate: inputs.inflationRate
    })

    // Step 2: Calculate NPS withdrawal breakdown
    const withdrawalResult = calculateNPSWithdrawal(corpusResult.totalCorpus)

    // Step 3: Calculate pension sustainability
    const sustainabilityResult = calculatePensionSustainability({
      lumpSumAmount: withdrawalResult.lumpSumAmount,
      monthlyExpense: inputs.expectedMonthlyExpense,
      postRetirementReturn: 7,
      inflationRate: inputs.inflationRate
    })

    // Step 4: Calculate retirement readiness score
    const readinessResult = calculateRetirementReadiness({
      currentAge: inputs.currentAge,
      retirementAge: inputs.retirementAge,
      projectedCorpus: corpusResult.totalCorpus,
      targetCorpus: inputs.targetCorpus,
      monthlyPension: withdrawalResult.monthlyPension,
      expectedMonthlyExpense: inputs.expectedMonthlyExpense,
      yearsOfSustainability: sustainabilityResult.yearsOfSustainability
    })

    // Update results state
    setResults({
      nominalCorpus: corpusResult.nominalCorpus,
      inflationAdjustedCorpus: corpusResult.inflationAdjustedCorpus,
      totalCorpus: corpusResult.totalCorpus,
      totalContributions: corpusResult.totalContributions,
      totalReturns: corpusResult.totalReturns,
      annuityAmount: withdrawalResult.annuityAmount,
      lumpSumAmount: withdrawalResult.lumpSumAmount,
      monthlyPension: withdrawalResult.monthlyPension,
      yearsOfSustainability: sustainabilityResult.yearsOfSustainability,
      sustainabilityScore: sustainabilityResult.sustainabilityScore,
      readinessScore: readinessResult.score,
      readinessLevel: readinessResult.readinessLevel,
      yearlyProjection: corpusResult.yearlyProjection
    })
  }

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }))
  }

  const handleReverseCalculation = () => {
    const expectedAnnualReturn = scenarioRates[scenario]
    
    const requiredContribution = calculateRequiredContribution({
      targetCorpus: inputs.targetCorpus,
      currentAge: inputs.currentAge,
      retirementAge: inputs.retirementAge,
      expectedAnnualReturn,
      annualStepUp: inputs.annualStepUp,
      currentCorpus: inputs.currentCorpus,
      inflationRate: inputs.inflationRate
    })

    setInputs(prev => ({
      ...prev,
      monthlyContribution: requiredContribution
    }))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const lifeExpectancy = inputs.retirementAge + 25

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg">
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
                    value={inputs.currentAge}
                    onChange={(e) => handleInputChange('currentAge', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retirement Age
                  </label>
                  <input
                    type="number"
                    value={inputs.retirementAge}
                    onChange={(e) => handleInputChange('retirementAge', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Contribution (₹)
                  </label>
                  <input
                    type="number"
                    value={inputs.monthlyContribution}
                    onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Corpus (₹)
                  </label>
                  <input
                    type="number"
                    value={inputs.currentCorpus}
                    onChange={(e) => handleInputChange('currentCorpus', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Step-up (%)
                  </label>
                  <input
                    type="number"
                    value={inputs.annualStepUp}
                    onChange={(e) => handleInputChange('annualStepUp', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Yearly increase in contribution
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inflation Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputs.inflationRate}
                    onChange={(e) => handleInputChange('inflationRate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Expected annual inflation rate
                  </p>
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
                    value={inputs.targetCorpus}
                    onChange={(e) => handleInputChange('targetCorpus', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Monthly Expense (₹)
                  </label>
                  <input
                    type="number"
                    value={inputs.expectedMonthlyExpense}
                    onChange={(e) => handleInputChange('expectedMonthlyExpense', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Expected monthly expenses after retirement
                  </p>
                </div>
                <button 
                  onClick={handleReverseCalculation}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
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
                {/* Nominal Corpus (Future Value) */}
                <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Nominal Corpus (Future Value)</div>
                  <div className="text-3xl font-bold text-blue-700">
                    {formatCurrency(results.nominalCorpus || results.totalCorpus)}
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    At age {inputs.retirementAge} • {inputs.retirementAge - inputs.currentAge} years
                  </div>
                </div>

                {/* Inflation-Adjusted Corpus (Real Value) */}
                <div className="bg-linear-to-r from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
                  <div className="text-sm text-gray-600 mb-1 flex items-center justify-between">
                    <span>Real Value (Today's Money)</span>
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                      @ {inputs.inflationRate}% inflation
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-green-700">
                    {formatCurrency(results.inflationAdjustedCorpus || 0)}
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    Purchasing power equivalent in today's terms
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Annuity Purchase (40%)</div>
                    <div className="text-lg font-semibold text-gray-800">
                      {formatCurrency(results.annuityAmount)}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Lump Sum (60%)</div>
                    <div className="text-lg font-semibold text-gray-800">
                      {formatCurrency(results.lumpSumAmount)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                  <div>
                    <div className="text-xs text-gray-500">Total Invested</div>
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(results.totalContributions || 0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Total Returns</div>
                    <div className="text-sm font-semibold text-blue-600">
                      {formatCurrency(results.totalReturns || 0)}
                    </div>
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
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(results.monthlyPension)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Expected Expense</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {formatCurrency(inputs.expectedMonthlyExpense)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Pension Coverage</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {inputs.expectedMonthlyExpense > 0 
                      ? Math.round((results.monthlyPension / inputs.expectedMonthlyExpense) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Corpus Sustainability</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {results.yearsOfSustainability} years
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Life Expectancy</span>
                  <span className="text-lg font-semibold text-gray-800">{lifeExpectancy} years</span>
                </div>
                <div className="mt-4 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-green-500 h-full transition-all duration-500" 
                    style={{ width: `${Math.min(results.sustainabilityScore, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Pension coverage: {results.sustainabilityScore}% of retirement span
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
                      stroke={results.readinessScore >= 75 ? '#10b981' : results.readinessScore >= 50 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={`${results.readinessScore * 4.4} ${440 - results.readinessScore * 4.4}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-800">{results.readinessScore}</div>
                      <div className="text-xs text-gray-500">out of 100</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className={`text-lg font-semibold mb-1 ${
                    results.readinessLevel === 'Excellent' ? 'text-green-600' :
                    results.readinessLevel === 'Good' ? 'text-yellow-600' :
                    results.readinessLevel === 'Fair' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {results.readinessLevel}
                  </div>
                  <p className="text-sm text-gray-600">
                    Your retirement plan readiness
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Poor</div>
                  <div className="w-full h-2 bg-red-400 rounded"></div>
                  <div className="text-xs text-gray-400 mt-1">0-30</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Good</div>
                  <div className="w-full h-2 bg-yellow-400 rounded"></div>
                  <div className="text-xs text-gray-400 mt-1">30-75</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Excellent</div>
                  <div className="w-full h-2 bg-green-500 rounded"></div>
                  <div className="text-xs text-gray-400 mt-1">75-100</div>
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

