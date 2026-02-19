import { useState, useEffect } from 'react'
import './App.css'
import {
  calculateRetirementCorpus,
  calculateNPSWithdrawal,
  calculatePensionSustainability,
  simulatePensionSustainability,
  calculateRequiredContribution,
  calculateRetirementReadiness,
  calculateReverseRetirementPlan
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
    lastMonthlySalary: 100000,
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

  // Reverse planning results state
  const [reversePlanResults, setReversePlanResults] = useState(null)

  // Scenario comparison results state
  const [scenarioComparison, setScenarioComparison] = useState({
    conservative: null,
    moderate: null,
    aggressive: null
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
    calculateAllScenariosComparison()
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

    // Step 4: Calculate retirement readiness score with enhanced metrics
    const lifeExpectancyYears = (inputs.retirementAge + 25) - inputs.retirementAge;
    const readinessResult = calculateRetirementReadiness({
      monthlyPension: withdrawalResult.monthlyPension,
      lastMonthlySalary: inputs.lastMonthlySalary,
      yearsSustainable: sustainabilityResult.yearsOfSustainability,
      lifeExpectancyYears,
      inflationAdjustedCorpus: corpusResult.inflationAdjustedCorpus,
      targetCorpus: inputs.targetCorpus,
      projectedCorpus: corpusResult.totalCorpus
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
      readinessScore: readinessResult.readinessScore,
      readinessLabel: readinessResult.readinessLabel,
      readinessColor: readinessResult.readinessColor,
      readinessStatus: readinessResult.readinessStatus,
      readinessExplanation: readinessResult.explanationMessage,
      scoringBreakdown: readinessResult.scoringBreakdown,
      yearlyProjection: corpusResult.yearlyProjection
    })
  }

  const calculateAllScenariosComparison = () => {
    const scenarios = ['conservative', 'moderate', 'aggressive']
    const comparisonResults = {}

    scenarios.forEach(scenarioName => {
      const expectedAnnualReturn = scenarioRates[scenarioName]

      // Calculate corpus for this scenario
      const corpusResult = calculateRetirementCorpus({
        currentAge: inputs.currentAge,
        retirementAge: inputs.retirementAge,
        monthlyContribution: inputs.monthlyContribution,
        expectedAnnualReturn,
        annualStepUp: inputs.annualStepUp,
        currentCorpus: inputs.currentCorpus,
        inflationRate: inputs.inflationRate
      })

      // Calculate NPS withdrawal
      const withdrawalResult = calculateNPSWithdrawal(corpusResult.totalCorpus)

      // Store the results
      comparisonResults[scenarioName] = {
        returnRate: expectedAnnualReturn,
        nominalCorpus: corpusResult.totalCorpus,
        inflationAdjustedCorpus: corpusResult.inflationAdjustedCorpus,
        totalContributions: corpusResult.totalContributions,
        totalReturns: corpusResult.totalReturns,
        monthlyPension: withdrawalResult.monthlyPension,
        annuityAmount: withdrawalResult.annuityAmount,
        lumpSumAmount: withdrawalResult.lumpSumAmount
      }
    })

    setScenarioComparison(comparisonResults)
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

  const handleReversePensionPlanner = () => {
    const expectedAnnualReturn = scenarioRates[scenario]
    
    // Calculate reverse plan based on desired monthly pension
    const reversePlan = calculateReverseRetirementPlan({
      desiredMonthlyPension: inputs.expectedMonthlyExpense,
      currentAge: inputs.currentAge,
      retirementAge: inputs.retirementAge,
      expectedReturn: expectedAnnualReturn,
      inflationRate: inputs.inflationRate,
      annualStepUp: inputs.annualStepUp,
      currentCorpus: inputs.currentCorpus
    })

    setReversePlanResults(reversePlan)
    
    // Optionally update the inputs with calculated values
    setInputs(prev => ({
      ...prev,
      targetCorpus: reversePlan.requiredFutureCorpus,
      monthlyContribution: reversePlan.requiredMonthlyContribution
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Monthly Salary (₹)
                  </label>
                  <input
                    type="number"
                    value={inputs.lastMonthlySalary}
                    onChange={(e) => handleInputChange('lastMonthlySalary', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Salary before retirement (for replacement ratio)
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

          </div>

          {/* Scenario Comparison Section - Full Width */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Scenario Comparison
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Compare retirement outcomes across different risk-return profiles
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Conservative Scenario */}
              {scenarioComparison.conservative && (
                <div className="relative bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-5 border-2 border-blue-300 hover:shadow-lg transition-shadow">
                  <div className="absolute top-3 right-3">
                    <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      Low Risk
                    </span>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-blue-800 mb-1">Conservative</h3>
                    <div className="text-3xl font-bold text-blue-900">
                      {scenarioComparison.conservative.returnRate}%
                    </div>
                    <div className="text-xs text-blue-700 mt-1">Expected Return</div>
                  </div>
                  
                  <div className="space-y-3 border-t border-blue-300 pt-3">
                    <div>
                      <div className="text-xs text-blue-700 mb-1">Retirement Corpus</div>
                      <div className="text-xl font-bold text-blue-900">
                        {formatCurrency(scenarioComparison.conservative.nominalCorpus)}
                      </div>
                      <div className="text-xs text-blue-600 mt-0.5">
                        Real: {formatCurrency(scenarioComparison.conservative.inflationAdjustedCorpus)}
                      </div>
                    </div>
                    
                    <div className="bg-white bg-opacity-60 rounded p-2">
                      <div className="text-xs text-blue-700 mb-1">Monthly Pension</div>
                      <div className="text-lg font-semibold text-blue-900">
                        {formatCurrency(scenarioComparison.conservative.monthlyPension)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-blue-600">Invested</div>
                        <div className="font-semibold text-blue-800">
                          {formatCurrency(scenarioComparison.conservative.totalContributions)}
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-600">Returns</div>
                        <div className="font-semibold text-green-700">
                          {formatCurrency(scenarioComparison.conservative.totalReturns)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-blue-300">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-700">Risk Level</span>
                      <div className="flex gap-1">
                        <div className="w-6 h-2 bg-blue-600 rounded"></div>
                        <div className="w-6 h-2 bg-gray-300 rounded"></div>
                        <div className="w-6 h-2 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Moderate Scenario */}
              {scenarioComparison.moderate && (
                <div className="relative bg-linear-to-br from-green-50 to-green-100 rounded-lg p-5 border-2 border-green-400 hover:shadow-xl transition-all transform hover:scale-105">
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      Balanced
                    </span>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-green-800 mb-1">Moderate</h3>
                    <div className="text-3xl font-bold text-green-900">
                      {scenarioComparison.moderate.returnRate}%
                    </div>
                    <div className="text-xs text-green-700 mt-1">Expected Return</div>
                  </div>
                  
                  <div className="space-y-3 border-t border-green-300 pt-3">
                    <div>
                      <div className="text-xs text-green-700 mb-1">Retirement Corpus</div>
                      <div className="text-xl font-bold text-green-900">
                        {formatCurrency(scenarioComparison.moderate.nominalCorpus)}
                      </div>
                      <div className="text-xs text-green-600 mt-0.5">
                        Real: {formatCurrency(scenarioComparison.moderate.inflationAdjustedCorpus)}
                      </div>
                    </div>
                    
                    <div className="bg-white bg-opacity-70 rounded p-2 ring-2 ring-green-400">
                      <div className="text-xs text-green-700 mb-1">Monthly Pension</div>
                      <div className="text-lg font-semibold text-green-900">
                        {formatCurrency(scenarioComparison.moderate.monthlyPension)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-green-600">Invested</div>
                        <div className="font-semibold text-green-800">
                          {formatCurrency(scenarioComparison.moderate.totalContributions)}
                        </div>
                      </div>
                      <div>
                        <div className="text-green-600">Returns</div>
                        <div className="font-semibold text-green-700">
                          {formatCurrency(scenarioComparison.moderate.totalReturns)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-green-300">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-700 font-semibold">Risk Level</span>
                      <div className="flex gap-1">
                        <div className="w-6 h-2 bg-green-600 rounded"></div>
                        <div className="w-6 h-2 bg-green-600 rounded"></div>
                        <div className="w-6 h-2 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aggressive Scenario */}
              {scenarioComparison.aggressive && (
                <div className="relative bg-linear-to-br from-orange-50 to-red-100 rounded-lg p-5 border-2 border-orange-400 hover:shadow-lg transition-shadow">
                  <div className="absolute top-3 right-3">
                    <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      High Risk
                    </span>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-orange-800 mb-1">Aggressive</h3>
                    <div className="text-3xl font-bold text-orange-900">
                      {scenarioComparison.aggressive.returnRate}%
                    </div>
                    <div className="text-xs text-orange-700 mt-1">Expected Return</div>
                  </div>
                  
                  <div className="space-y-3 border-t border-orange-300 pt-3">
                    <div>
                      <div className="text-xs text-orange-700 mb-1">Retirement Corpus</div>
                      <div className="text-xl font-bold text-orange-900">
                        {formatCurrency(scenarioComparison.aggressive.nominalCorpus)}
                      </div>
                      <div className="text-xs text-orange-600 mt-0.5">
                        Real: {formatCurrency(scenarioComparison.aggressive.inflationAdjustedCorpus)}
                      </div>
                    </div>
                    
                    <div className="bg-white bg-opacity-60 rounded p-2">
                      <div className="text-xs text-orange-700 mb-1">Monthly Pension</div>
                      <div className="text-lg font-semibold text-orange-900">
                        {formatCurrency(scenarioComparison.aggressive.monthlyPension)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-orange-600">Invested</div>
                        <div className="font-semibold text-orange-800">
                          {formatCurrency(scenarioComparison.aggressive.totalContributions)}
                        </div>
                      </div>
                      <div>
                        <div className="text-orange-600">Returns</div>
                        <div className="font-semibold text-green-700">
                          {formatCurrency(scenarioComparison.aggressive.totalReturns)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-orange-300">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-orange-700">Risk Level</span>
                      <div className="flex gap-1">
                        <div className="w-6 h-2 bg-red-600 rounded"></div>
                        <div className="w-6 h-2 bg-red-600 rounded"></div>
                        <div className="w-6 h-2 bg-red-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Risk-Return Tradeoff Message */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚖️</div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Risk-Return Tradeoff</h4>
                  <p className="text-sm text-gray-600">
                    Higher returns come with higher risk. Conservative investments offer stability with lower growth,
                    while aggressive strategies may yield higher corpus but with greater market volatility.
                    The moderate approach balances growth potential with manageable risk.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Left Column - Inputs */}
          <div className="space-y-6">

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
                <button 
                  onClick={handleReverseCalculation}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  Calculate Required Contribution
                </button>

                <div className="border-t border-gray-200 my-4"></div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desired Monthly Pension (₹)
                  </label>
                  <input
                    type="number"
                    value={inputs.expectedMonthlyExpense}
                    onChange={(e) => handleInputChange('expectedMonthlyExpense', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Target monthly pension after retirement
                  </p>
                </div>
                <button 
                  onClick={handleReversePensionPlanner}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  Calculate Corpus & Contribution from Pension
                </button>

                {/* Reverse Planning Results */}
                {reversePlanResults && !reversePlanResults.error && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-sm font-semibold text-purple-800 mb-3">
                      Reverse Planning Results:
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Required Corpus:</span>
                        <span className="font-semibold text-gray-800">
                          {formatCurrency(reversePlanResults.requiredFutureCorpus)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Contribution:</span>
                        <span className="font-semibold text-purple-700">
                          {formatCurrency(reversePlanResults.requiredMonthlyContribution)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total to Invest:</span>
                        <span className="font-semibold text-gray-800">
                          {formatCurrency(reversePlanResults.totalContributions)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Returns:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(reversePlanResults.totalReturns)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-purple-200">
                        {reversePlanResults.summary}
                      </div>
                    </div>
                  </div>
                )}
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
                      stroke={results.readinessColor || '#3b82f6'}
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={`${(results.readinessScore || 0) * 4.4} ${440 - (results.readinessScore || 0) * 4.4}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-800">{results.readinessScore || 0}</div>
                      <div className="text-xs text-gray-500">out of 100</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  {/* Color-coded label badge */}
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{backgroundColor: results.readinessColor || '#9ca3af'}}
                    ></div>
                    <div className="text-lg font-bold" style={{color: results.readinessColor || '#6b7280'}}>
                      {results.readinessLabel || 'N/A'} Zone
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {results.readinessStatus || 'Calculating...'}
                  </p>
                </div>
              </div>

              {/* Scoring Breakdown */}
              {results.scoringBreakdown && results.scoringBreakdown.length > 0 && (
                <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Score Breakdown:</div>
                  {results.scoringBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex-1">
                        <div className="font-medium text-gray-700">{item.factor}</div>
                        <div className="text-gray-500">{item.value} • {item.status}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-800">{item.score}</span>
                        <span className="text-gray-500">/{item.maxScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Color Legend */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Red</div>
                  <div className="w-full h-2 bg-red-500 rounded"></div>
                  <div className="text-xs text-gray-400 mt-1">0-50</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Yellow</div>
                  <div className="w-full h-2 bg-yellow-500 rounded"></div>
                  <div className="text-xs text-gray-400 mt-1">50-75</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">Green</div>
                  <div className="w-full h-2 bg-green-500 rounded"></div>
                  <div className="text-xs text-gray-400 mt-1">75-100</div>
                </div>
              </div>

              {/* Explanation Message */}
              {results.readinessExplanation && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-700 whitespace-pre-line">
                    {results.readinessExplanation}
                  </p>
                </div>
              )}
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

