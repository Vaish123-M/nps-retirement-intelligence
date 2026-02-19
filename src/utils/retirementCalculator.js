/**
 * Retirement Corpus Calculator
 * Calculates the accumulated retirement corpus based on regular contributions,
 * compound growth, and annual step-up increases.
 */

/**
 * Calculate retirement corpus with compound growth and annual step-up
 * 
 * @param {number} currentAge - Current age of the investor
 * @param {number} retirementAge - Target retirement age
 * @param {number} monthlyContribution - Initial monthly contribution in INR
 * @param {number} expectedAnnualReturn - Expected annual return rate (as percentage, e.g., 10 for 10%)
 * @param {number} annualStepUp - Annual increase in contribution (as percentage, e.g., 5 for 5%)
 * @param {number} currentCorpus - Existing corpus amount (default: 0)
 * 
 * @returns {Object} - Contains totalCorpus and yearlyProjection array
 */
export function calculateRetirementCorpus({
  currentAge,
  retirementAge,
  monthlyContribution,
  expectedAnnualReturn,
  annualStepUp = 0,
  currentCorpus = 0
}) {
  // Validate inputs
  if (retirementAge <= currentAge) {
    return {
      totalCorpus: currentCorpus,
      yearlyProjection: [],
      error: 'Retirement age must be greater than current age'
    };
  }

  if (monthlyContribution < 0 || expectedAnnualReturn < 0) {
    return {
      totalCorpus: 0,
      yearlyProjection: [],
      error: 'Contributions and returns cannot be negative'
    };
  }

  // Calculate number of years until retirement
  const yearsToRetirement = retirementAge - currentAge;

  // Convert percentages to decimal for calculations
  const annualReturnRate = expectedAnnualReturn / 100;
  const stepUpRate = annualStepUp / 100;

  // Initialize variables
  let accumulatedCorpus = currentCorpus; // Start with existing corpus if any
  let currentAnnualContribution = monthlyContribution * 12; // Convert monthly to annual
  const yearlyProjection = [];

  // Store initial values (year 0)
  yearlyProjection.push({
    year: currentAge,
    age: currentAge,
    yearNumber: 0,
    contribution: 0,
    corpusBeforeReturn: accumulatedCorpus,
    returns: 0,
    corpusAfterReturn: accumulatedCorpus,
    cumulativeContributions: 0
  });

  let totalContributions = 0;

  // Calculate corpus growth year by year
  for (let year = 1; year <= yearsToRetirement; year++) {
    // Step 1: Add this year's contribution at the beginning of the year
    // We assume contributions are made at the start of the year (Beginning of Period)
    const corpusBeforeReturn = accumulatedCorpus + currentAnnualContribution;
    
    // Track total contributions made
    totalContributions += currentAnnualContribution;

    // Step 2: Apply annual return on the total corpus (including new contribution)
    // This simulates compound growth over the year
    const yearlyReturn = corpusBeforeReturn * annualReturnRate;
    const corpusAfterReturn = corpusBeforeReturn + yearlyReturn;

    // Step 3: Update accumulated corpus for next iteration
    accumulatedCorpus = corpusAfterReturn;

    // Step 4: Store projection data for this year
    yearlyProjection.push({
      year: currentAge + year,
      age: currentAge + year,
      yearNumber: year,
      contribution: currentAnnualContribution,
      corpusBeforeReturn: corpusBeforeReturn,
      returns: yearlyReturn,
      corpusAfterReturn: corpusAfterReturn,
      cumulativeContributions: totalContributions
    });

    // Step 5: Increase contribution for next year based on step-up percentage
    // This simulates salary increases and inflation adjustment
    currentAnnualContribution = currentAnnualContribution * (1 + stepUpRate);
  }

  // Calculate total returns earned
  const totalReturns = accumulatedCorpus - totalContributions - currentCorpus;

  return {
    totalCorpus: Math.round(accumulatedCorpus),
    totalContributions: Math.round(totalContributions),
    totalReturns: Math.round(totalReturns),
    initialCorpus: currentCorpus,
    yearlyProjection,
    yearsToRetirement,
    finalAge: retirementAge
  };
}

/**
 * Calculate monthly pension from annuity
 * Based on NPS rules, 40% of corpus must be used to purchase annuity
 * 
 * @param {number} annuityAmount - Amount used to purchase annuity
 * @param {number} annuityRate - Annual annuity rate (as percentage, e.g., 6 for 6%)
 * 
 * @returns {number} - Monthly pension amount
 */
export function calculateMonthlyPension(annuityAmount, annuityRate = 6) {
  // Convert annual rate to decimal
  const rate = annuityRate / 100;
  
  // Calculate annual pension
  const annualPension = annuityAmount * rate;
  
  // Convert to monthly
  const monthlyPension = annualPension / 12;
  
  return Math.round(monthlyPension);
}

/**
 * Calculate NPS withdrawals based on standard rules
 * - 40% must be used for annuity purchase (generates pension)
 * - 60% can be withdrawn as lump sum
 * 
 * @param {number} totalCorpus - Total retirement corpus
 * @param {number} annuityRate - Annual annuity rate percentage
 * 
 * @returns {Object} - Breakdown of annuity and lump sum
 */
export function calculateNPSWithdrawal(totalCorpus, annuityRate = 6) {
  // NPS mandates 40% for annuity, 60% as lump sum
  const annuityAmount = totalCorpus * 0.4;
  const lumpSumAmount = totalCorpus * 0.6;
  
  // Calculate monthly pension from annuity
  const monthlyPension = calculateMonthlyPension(annuityAmount, annuityRate);
  
  return {
    annuityAmount: Math.round(annuityAmount),
    lumpSumAmount: Math.round(lumpSumAmount),
    monthlyPension,
    annualPension: monthlyPension * 12,
    annuityRate
  };
}

/**
 * Calculate pension sustainability
 * Determines how long the lump sum can sustain monthly expenses
 * 
 * @param {number} lumpSumAmount - Available lump sum corpus
 * @param {number} monthlyExpense - Expected monthly expense
 * @param {number} postRetirementReturn - Expected return on invested lump sum (percentage)
 * @param {number} inflationRate - Expected inflation rate (percentage)
 * 
 * @returns {Object} - Sustainability analysis
 */
export function calculatePensionSustainability({
  lumpSumAmount,
  monthlyExpense,
  postRetirementReturn = 7,
  inflationRate = 6
}) {
  // If no monthly expense provided, can't calculate
  if (!monthlyExpense || monthlyExpense <= 0) {
    return {
      yearsOfSustainability: 0,
      sustainabilityScore: 0
    };
  }

  const returnRate = postRetirementReturn / 100 / 12; // Monthly return
  const inflationMonthlyRate = inflationRate / 100 / 12; // Monthly inflation
  
  let remainingCorpus = lumpSumAmount;
  let currentExpense = monthlyExpense;
  let months = 0;
  const maxMonths = 100 * 12; // Cap at 100 years

  // Simulate month by month until corpus depletes
  while (remainingCorpus > 0 && months < maxMonths) {
    // Apply monthly return to remaining corpus
    remainingCorpus = remainingCorpus * (1 + returnRate);
    
    // Withdraw monthly expense (adjusted for inflation)
    remainingCorpus = remainingCorpus - currentExpense;
    
    // Increase expense for next month due to inflation
    currentExpense = currentExpense * (1 + inflationMonthlyRate);
    
    months++;
  }

  const years = Math.floor(months / 12);
  
  // Calculate sustainability score (assuming life expectancy of 85 years)
  const lifeExpectancyYears = 30; // Typical 30 years post retirement
  const sustainabilityScore = Math.min((years / lifeExpectancyYears) * 100, 100);

  return {
    yearsOfSustainability: years,
    monthsOfSustainability: months,
    sustainabilityScore: Math.round(sustainabilityScore)
  };
}

/**
 * Calculate required monthly contribution to achieve target corpus
 * Reverse calculation for goal-based planning
 * 
 * @param {number} targetCorpus - Desired retirement corpus
 * @param {number} currentAge - Current age
 * @param {number} retirementAge - Target retirement age
 * @param {number} expectedAnnualReturn - Expected annual return rate (percentage)
 * @param {number} annualStepUp - Annual increase in contribution (percentage)
 * @param {number} currentCorpus - Existing corpus amount
 * 
 * @returns {number} - Required initial monthly contribution
 */
export function calculateRequiredContribution({
  targetCorpus,
  currentAge,
  retirementAge,
  expectedAnnualReturn,
  annualStepUp = 0,
  currentCorpus = 0
}) {
  // Binary search to find the required contribution
  let low = 0;
  let high = targetCorpus / 12; // Maximum theoretical monthly contribution
  let requiredContribution = 0;
  const tolerance = 1000; // Tolerance of ₹1000

  // Use binary search for efficiency
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    
    const result = calculateRetirementCorpus({
      currentAge,
      retirementAge,
      monthlyContribution: mid,
      expectedAnnualReturn,
      annualStepUp,
      currentCorpus
    });

    if (Math.abs(result.totalCorpus - targetCorpus) <= tolerance) {
      requiredContribution = mid;
      break;
    } else if (result.totalCorpus < targetCorpus) {
      low = mid + 1;
    } else {
      high = mid - 1;
      requiredContribution = mid;
    }
  }

  return Math.round(requiredContribution);
}

/**
 * Calculate retirement readiness score
 * Evaluates overall retirement preparedness on a scale of 0-100
 * 
 * @param {Object} params - Various retirement parameters
 * @returns {Object} - Readiness score and breakdown
 */
export function calculateRetirementReadiness({
  currentAge,
  retirementAge,
  projectedCorpus,
  targetCorpus,
  monthlyPension,
  expectedMonthlyExpense,
  yearsOfSustainability
}) {
  let score = 0;
  const factors = [];

  // Factor 1: Corpus Achievement (40 points)
  if (targetCorpus > 0) {
    const corpusRatio = Math.min(projectedCorpus / targetCorpus, 1);
    const corpusScore = corpusRatio * 40;
    score += corpusScore;
    factors.push({
      name: 'Corpus Achievement',
      score: Math.round(corpusScore),
      maxScore: 40
    });
  }

  // Factor 2: Pension Coverage (30 points)
  if (expectedMonthlyExpense > 0 && monthlyPension > 0) {
    const pensionCoverage = Math.min(monthlyPension / expectedMonthlyExpense, 1);
    const pensionScore = pensionCoverage * 30;
    score += pensionScore;
    factors.push({
      name: 'Pension Coverage',
      score: Math.round(pensionScore),
      maxScore: 30
    });
  }

  // Factor 3: Time to Retirement (15 points)
  const yearsToRetirement = retirementAge - currentAge;
  let timeScore = 0;
  if (yearsToRetirement >= 20) timeScore = 15;
  else if (yearsToRetirement >= 15) timeScore = 12;
  else if (yearsToRetirement >= 10) timeScore = 9;
  else if (yearsToRetirement >= 5) timeScore = 6;
  else timeScore = 3;
  
  score += timeScore;
  factors.push({
    name: 'Time to Retirement',
    score: timeScore,
    maxScore: 15
  });

  // Factor 4: Sustainability (15 points)
  if (yearsOfSustainability) {
    const sustainScore = Math.min((yearsOfSustainability / 30) * 15, 15);
    score += sustainScore;
    factors.push({
      name: 'Sustainability',
      score: Math.round(sustainScore),
      maxScore: 15
    });
  }

  // Determine readiness level
  let readinessLevel = 'Poor';
  if (score >= 75) readinessLevel = 'Excellent';
  else if (score >= 50) readinessLevel = 'Good';
  else if (score >= 30) readinessLevel = 'Fair';

  return {
    score: Math.round(score),
    readinessLevel,
    factors
  };
}
