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
 * @param {number} inflationRate - Expected inflation rate (as percentage, e.g., 6 for 6%)
 * 
 * @returns {Object} - Contains nominal and inflation-adjusted corpus values
 */
export function calculateRetirementCorpus({
  currentAge,
  retirementAge,
  monthlyContribution,
  expectedAnnualReturn,
  annualStepUp = 0,
  currentCorpus = 0,
  inflationRate = 6
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

  // Calculate inflation-adjusted corpus (real value in today's money)
  // Formula: RealValue = FutureValue / (1 + inflationRate)^years
  const inflationRateDecimal = inflationRate / 100;
  const inflationAdjustedCorpus = accumulatedCorpus / Math.pow(1 + inflationRateDecimal, yearsToRetirement);

  return {
    // Nominal corpus (future value without inflation adjustment)
    nominalCorpus: Math.round(accumulatedCorpus),
    totalCorpus: Math.round(accumulatedCorpus), // Keep for backward compatibility
    
    // Real corpus (inflation-adjusted value in today's money)
    inflationAdjustedCorpus: Math.round(inflationAdjustedCorpus),
    realCorpus: Math.round(inflationAdjustedCorpus), // Alias for clarity
    
    // Other details
    totalContributions: Math.round(totalContributions),
    totalReturns: Math.round(totalReturns),
    initialCorpus: currentCorpus,
    inflationRate,
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
 * Reverse Retirement Planning Calculator
 * Calculates required corpus and monthly contribution based on desired pension
 * 
 * @param {Object} params - Input parameters
 * @param {number} params.desiredMonthlyPension - Target monthly pension amount
 * @param {number} params.currentAge - Current age of the investor
 * @param {number} params.retirementAge - Target retirement age
 * @param {number} params.expectedReturn - Expected annual return rate (as percentage, e.g., 10 for 10%)
 * @param {number} params.inflationRate - Expected inflation rate (as percentage, e.g., 6 for 6%)
 * @param {number} params.annuityRate - Annuity rate for pension calculation (default: 6%)
 * @param {number} params.annualStepUp - Annual increase in contribution (default: 5%)
 * @param {number} params.currentCorpus - Existing corpus amount (default: 0)
 * 
 * @returns {Object} - Required corpus and monthly contribution with detailed breakdown
 */
export function calculateReverseRetirementPlan({
  desiredMonthlyPension,
  currentAge,
  retirementAge,
  expectedReturn,
  inflationRate = 6,
  annuityRate = 6,
  annualStepUp = 5,
  currentCorpus = 0
}) {
  // Validate inputs
  if (!desiredMonthlyPension || desiredMonthlyPension <= 0) {
    return {
      error: 'Desired monthly pension must be greater than zero',
      requiredCorpus: 0,
      requiredMonthlyContribution: 0
    };
  }

  if (retirementAge <= currentAge) {
    return {
      error: 'Retirement age must be greater than current age',
      requiredCorpus: 0,
      requiredMonthlyContribution: 0
    };
  }

  // ============================================================
  // STEP 1: Calculate Required Corpus from Desired Pension
  // ============================================================
  
  // Formula: Required Annuity Amount = (Monthly Pension × 12) / Annuity Rate
  // Since NPS mandates 40% for annuity, Total Corpus = Annuity Amount / 0.4
  
  const annualPension = desiredMonthlyPension * 12;
  const annuityRateDecimal = annuityRate / 100;
  
  // Calculate required annuity amount to generate desired pension
  const requiredAnnuityAmount = annualPension / annuityRateDecimal;
  
  // Calculate total corpus required (since 40% goes to annuity)
  const requiredNominalCorpus = requiredAnnuityAmount / 0.4;
  
  // Calculate the remaining 60% that will be lump sum
  const projectedLumpSum = requiredNominalCorpus * 0.6;

  // ============================================================
  // STEP 2: Adjust for Inflation (Future Value)
  // ============================================================
  
  // The corpus we calculated is in today's terms
  // We need to inflate it to future value at retirement
  const yearsToRetirement = retirementAge - currentAge;
  const inflationRateDecimal = inflationRate / 100;
  
  // Future Value = Present Value × (1 + inflation)^years
  const requiredFutureCorpus = requiredNominalCorpus * Math.pow(1 + inflationRateDecimal, yearsToRetirement);

  // ============================================================
  // STEP 3: Calculate Required Monthly Contribution
  // ============================================================
  
  // Use the existing calculateRequiredContribution function
  const requiredMonthlyContribution = calculateRequiredContribution({
    targetCorpus: requiredFutureCorpus,
    currentAge,
    retirementAge,
    expectedAnnualReturn: expectedReturn,
    annualStepUp,
    currentCorpus,
    inflationRate
  });

  // ============================================================
  // STEP 4: Verify with Forward Calculation
  // ============================================================
  
  // Calculate what corpus the required contribution will actually generate
  const verificationResult = calculateRetirementCorpus({
    currentAge,
    retirementAge,
    monthlyContribution: requiredMonthlyContribution,
    expectedAnnualReturn: expectedReturn,
    annualStepUp,
    currentCorpus,
    inflationRate
  });

  // ============================================================
  // STEP 5: Calculate Sustainability Metrics
  // ============================================================
  
  // Check how long the lump sum can sustain the desired expenses
  const sustainabilityResult = calculatePensionSustainability({
    lumpSumAmount: projectedLumpSum,
    monthlyExpense: desiredMonthlyPension,
    postRetirementReturn: 7,
    inflationRate
  });

  return {
    // Required amounts
    requiredCorpus: Math.round(requiredNominalCorpus),
    requiredFutureCorpus: Math.round(requiredFutureCorpus),
    requiredMonthlyContribution: Math.round(requiredMonthlyContribution),
    
    // Corpus breakdown
    annuityPortion: Math.round(requiredAnnuityAmount),
    lumpSumPortion: Math.round(projectedLumpSum),
    
    // Pension details
    desiredMonthlyPension: Math.round(desiredMonthlyPension),
    desiredAnnualPension: Math.round(annualPension),
    annuityRate,
    
    // Timeline
    yearsToRetirement,
    currentAge,
    retirementAge,
    
    // Inflation impact
    inflationRate,
    inflationMultiplier: parseFloat(Math.pow(1 + inflationRateDecimal, yearsToRetirement).toFixed(2)),
    
    // Verification
    projectedCorpus: verificationResult.nominalCorpus,
    achievementRatio: Math.round((verificationResult.nominalCorpus / requiredFutureCorpus) * 100),
    
    // Contribution details
    totalContributions: verificationResult.totalContributions,
    totalReturns: verificationResult.totalReturns,
    
    // Sustainability
    yearsSustainable: sustainabilityResult.yearsOfSustainability,
    sustainabilityScore: sustainabilityResult.sustainabilityScore,
    
    // Summary message
    summary: `To receive ₹${Math.round(desiredMonthlyPension).toLocaleString('en-IN')} monthly pension at retirement, you need a corpus of ₹${Math.round(requiredFutureCorpus).toLocaleString('en-IN')} (future value). This requires monthly contributions of ₹${Math.round(requiredMonthlyContribution).toLocaleString('en-IN')} for ${yearsToRetirement} years.`
  };
}

/**
 * Pension Estimation and Sustainability Simulation
 * Simulates year-by-year pension withdrawals with post-retirement returns
 * to determine how long the corpus will last
 * 
 * @param {number} totalCorpus - Total retirement corpus available
 * @param {number} postRetirementReturnRate - Expected return rate after retirement (as percentage, e.g., 7 for 7%)
 * @param {number} desiredMonthlyPension - Desired monthly pension amount
 * @param {number} retirementAge - Age at retirement
 * @param {number} lifeExpectancyAge - Expected life expectancy age
 * 
 * @returns {Object} - Sustainability analysis with status and projections
 */
export function simulatePensionSustainability({
  totalCorpus,
  postRetirementReturnRate,
  desiredMonthlyPension,
  retirementAge,
  lifeExpectancyAge
}) {
  // Validate inputs
  if (totalCorpus <= 0 || desiredMonthlyPension <= 0) {
    return {
      yearsSustainable: 0,
      sustainabilityStatus: 'Risky',
      remainingCorpusAtLifeExpectancy: 0,
      yearlyBreakdown: []
    };
  }

  if (lifeExpectancyAge <= retirementAge) {
    return {
      yearsSustainable: 0,
      sustainabilityStatus: 'Invalid',
      remainingCorpusAtLifeExpectancy: totalCorpus,
      yearlyBreakdown: []
    };
  }

  // Convert percentage to decimal for calculations
  const annualReturnRate = postRetirementReturnRate / 100;
  
  // Calculate annual pension requirement (monthly × 12)
  const annualPensionRequirement = desiredMonthlyPension * 12;
  
  // Calculate expected retirement span
  const expectedRetirementYears = lifeExpectancyAge - retirementAge;
  
  // Initialize simulation variables
  let remainingCorpus = totalCorpus;
  let currentAge = retirementAge;
  let yearsSustainable = 0;
  const yearlyBreakdown = [];

  // Store initial state (Year 0)
  yearlyBreakdown.push({
    year: 0,
    age: retirementAge,
    startingCorpus: totalCorpus,
    returnsEarned: 0,
    pensionWithdrawn: 0,
    endingCorpus: totalCorpus
  });

  // Simulate year by year until corpus depletes or life expectancy reached
  for (let year = 1; year <= expectedRetirementYears; year++) {
    currentAge = retirementAge + year;
    
    // Step 1: Apply post-retirement return on the corpus at the start of the year
    const returnsEarned = remainingCorpus * annualReturnRate;
    const corpusAfterReturns = remainingCorpus + returnsEarned;
    
    // Step 2: Withdraw annual pension requirement
    const pensionWithdrawn = Math.min(annualPensionRequirement, corpusAfterReturns);
    const corpusAfterWithdrawal = corpusAfterReturns - pensionWithdrawn;
    
    // Step 3: Check if corpus can sustain another year
    if (corpusAfterWithdrawal <= 0) {
      // Corpus depleted - record final year and break
      yearlyBreakdown.push({
        year,
        age: currentAge,
        startingCorpus: Math.round(remainingCorpus),
        returnsEarned: Math.round(returnsEarned),
        pensionWithdrawn: Math.round(pensionWithdrawn),
        endingCorpus: 0
      });
      
      yearsSustainable = year;
      remainingCorpus = 0;
      break;
    }
    
    // Step 4: Record year's data
    yearlyBreakdown.push({
      year,
      age: currentAge,
      startingCorpus: Math.round(remainingCorpus),
      returnsEarned: Math.round(returnsEarned),
      pensionWithdrawn: Math.round(pensionWithdrawn),
      endingCorpus: Math.round(corpusAfterWithdrawal)
    });
    
    // Step 5: Update remaining corpus for next iteration
    remainingCorpus = corpusAfterWithdrawal;
    yearsSustainable = year;
  }

  // Calculate remaining corpus at life expectancy
  const remainingCorpusAtLifeExpectancy = Math.round(remainingCorpus);

  // Determine sustainability status
  let sustainabilityStatus;
  const sustainabilityPercentage = (yearsSustainable / expectedRetirementYears) * 100;
  
  if (sustainabilityPercentage >= 100) {
    // Corpus lasts beyond life expectancy - Safe
    sustainabilityStatus = 'Safe';
  } else if (sustainabilityPercentage >= 75) {
    // Corpus lasts at least 75% of expected retirement - Moderate
    sustainabilityStatus = 'Moderate';
  } else {
    // Corpus depletes too early - Risky
    sustainabilityStatus = 'Risky';
  }

  // Calculate coverage percentage
  const coveragePercentage = Math.min(sustainabilityPercentage, 100);

  return {
    // Primary metrics
    yearsSustainable,
    sustainabilityStatus,
    remainingCorpusAtLifeExpectancy,
    
    // Additional analysis
    expectedRetirementYears,
    coveragePercentage: Math.round(coveragePercentage),
    annualPensionRequirement: Math.round(annualPensionRequirement),
    isCorpusSufficient: yearsSustainable >= expectedRetirementYears,
    
    // Detailed breakdown for visualization
    yearlyBreakdown
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
 * @param {number} inflationRate - Expected inflation rate (percentage)
 * 
 * @returns {number} - Required initial monthly contribution
 */
export function calculateRequiredContribution({
  targetCorpus,
  currentAge,
  retirementAge,
  expectedAnnualReturn,
  annualStepUp = 0,
  currentCorpus = 0,
  inflationRate = 6
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
      currentCorpus,
      inflationRate
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
 * Calculate Retirement Readiness Score
 * Comprehensive scoring system evaluating retirement preparedness
 * Based on replacement ratio, sustainability, and inflation-adjusted adequacy
 * 
 * @param {Object} params - Retirement parameters
 * @param {number} params.monthlyPension - Expected monthly pension amount
 * @param {number} params.lastMonthlySalary - Last monthly salary before retirement
 * @param {number} params.yearsSustainable - Years the corpus will sustain
 * @param {number} params.lifeExpectancyYears - Expected years post-retirement
 * @param {number} params.inflationAdjustedCorpus - Real value of corpus in today's money
 * @param {number} params.targetCorpus - Target corpus goal
 * @param {number} params.projectedCorpus - Projected corpus at retirement
 * 
 * @returns {Object} - Readiness score, label, and detailed explanation
 */
export function calculateRetirementReadiness({
  monthlyPension = 0,
  lastMonthlySalary = 0,
  yearsSustainable = 0,
  lifeExpectancyYears = 25,
  inflationAdjustedCorpus = 0,
  targetCorpus = 0,
  projectedCorpus = 0
}) {
  let totalScore = 0;
  const scoringBreakdown = [];
  const issues = [];
  const recommendations = [];

  // ============================================================
  // FACTOR 1: Replacement Ratio (35 points)
  // Measures if pension can replace pre-retirement income adequately
  // ============================================================
  let replacementScore = 0;
  let replacementRatio = 0;
  
  if (lastMonthlySalary > 0 && monthlyPension > 0) {
    replacementRatio = (monthlyPension / lastMonthlySalary) * 100;
    
    // Scoring logic:
    // 70%+ replacement = Excellent (35 points)
    // 50-70% replacement = Good (25-35 points)
    // 30-50% replacement = Moderate (15-25 points)
    // <30% replacement = Poor (<15 points)
    
    if (replacementRatio >= 70) {
      replacementScore = 35;
    } else if (replacementRatio >= 50) {
      replacementScore = 25 + ((replacementRatio - 50) / 20) * 10;
    } else if (replacementRatio >= 30) {
      replacementScore = 15 + ((replacementRatio - 30) / 20) * 10;
    } else {
      replacementScore = (replacementRatio / 30) * 15;
    }
    
    totalScore += replacementScore;
    scoringBreakdown.push({
      factor: 'Income Replacement Ratio',
      score: Math.round(replacementScore),
      maxScore: 35,
      value: `${Math.round(replacementRatio)}%`,
      status: replacementRatio >= 70 ? 'Excellent' : replacementRatio >= 50 ? 'Good' : replacementRatio >= 30 ? 'Moderate' : 'Poor'
    });
    
    // Provide feedback
    if (replacementRatio < 50) {
      issues.push(`Income replacement ratio is only ${Math.round(replacementRatio)}% (target: 70%+)`);
      recommendations.push('Increase monthly contributions or reduce post-retirement expenses');
    }
  } else {
    scoringBreakdown.push({
      factor: 'Income Replacement Ratio',
      score: 0,
      maxScore: 35,
      value: 'N/A',
      status: 'No Data'
    });
    issues.push('Last monthly salary not provided for replacement ratio calculation');
  }

  // ============================================================
  // FACTOR 2: Sustainability vs Life Expectancy (35 points)
  // Measures if corpus can last through expected retirement years
  // ============================================================
  let sustainabilityScore = 0;
  let sustainabilityRatio = 0;
  
  if (lifeExpectancyYears > 0 && yearsSustainable > 0) {
    sustainabilityRatio = (yearsSustainable / lifeExpectancyYears) * 100;
    
    // Scoring logic:
    // 100%+ coverage = Excellent (35 points)
    // 80-100% coverage = Good (28-35 points)
    // 60-80% coverage = Moderate (21-28 points)
    // <60% coverage = Poor (<21 points)
    
    if (sustainabilityRatio >= 100) {
      sustainabilityScore = 35;
    } else if (sustainabilityRatio >= 80) {
      sustainabilityScore = 28 + ((sustainabilityRatio - 80) / 20) * 7;
    } else if (sustainabilityRatio >= 60) {
      sustainabilityScore = 21 + ((sustainabilityRatio - 60) / 20) * 7;
    } else {
      sustainabilityScore = (sustainabilityRatio / 60) * 21;
    }
    
    totalScore += sustainabilityScore;
    scoringBreakdown.push({
      factor: 'Corpus Sustainability',
      score: Math.round(sustainabilityScore),
      maxScore: 35,
      value: `${yearsSustainable} of ${lifeExpectancyYears} years`,
      status: sustainabilityRatio >= 100 ? 'Excellent' : sustainabilityRatio >= 80 ? 'Good' : sustainabilityRatio >= 60 ? 'Moderate' : 'Poor'
    });
    
    // Provide feedback
    if (sustainabilityRatio < 100) {
      const shortfall = lifeExpectancyYears - yearsSustainable;
      issues.push(`Corpus may deplete ${shortfall} years before life expectancy`);
      recommendations.push('Increase retirement savings or reduce expected monthly expenses');
    }
  } else {
    scoringBreakdown.push({
      factor: 'Corpus Sustainability',
      score: 0,
      maxScore: 35,
      value: 'N/A',
      status: 'No Data'
    });
  }

  // ============================================================
  // FACTOR 3: Inflation-Adjusted Adequacy (30 points)
  // Measures if real corpus value meets retirement goals
  // ============================================================
  let adequacyScore = 0;
  let adequacyRatio = 0;
  
  if (targetCorpus > 0 && inflationAdjustedCorpus > 0) {
    adequacyRatio = (inflationAdjustedCorpus / targetCorpus) * 100;
    
    // Scoring logic based on real purchasing power:
    // 100%+ of target = Excellent (30 points)
    // 75-100% of target = Good (22-30 points)
    // 50-75% of target = Moderate (15-22 points)
    // <50% of target = Poor (<15 points)
    
    if (adequacyRatio >= 100) {
      adequacyScore = 30;
    } else if (adequacyRatio >= 75) {
      adequacyScore = 22 + ((adequacyRatio - 75) / 25) * 8;
    } else if (adequacyRatio >= 50) {
      adequacyScore = 15 + ((adequacyRatio - 50) / 25) * 7;
    } else {
      adequacyScore = (adequacyRatio / 50) * 15;
    }
    
    totalScore += adequacyScore;
    scoringBreakdown.push({
      factor: 'Inflation-Adjusted Adequacy',
      score: Math.round(adequacyScore),
      maxScore: 30,
      value: `${Math.round(adequacyRatio)}%`,
      status: adequacyRatio >= 100 ? 'Excellent' : adequacyRatio >= 75 ? 'Good' : adequacyRatio >= 50 ? 'Moderate' : 'Poor'
    });
    
    // Provide feedback
    if (adequacyRatio < 100) {
      issues.push(`Real corpus value is ${Math.round(adequacyRatio)}% of target (considering inflation)`);
      recommendations.push('Increase contributions or investment returns to combat inflation');
    }
  } else if (projectedCorpus > 0 && targetCorpus > 0) {
    // Fallback to nominal corpus if inflation-adjusted not available
    adequacyRatio = (projectedCorpus / targetCorpus) * 100;
    adequacyScore = Math.min((adequacyRatio / 100) * 30, 30);
    
    totalScore += adequacyScore;
    scoringBreakdown.push({
      factor: 'Corpus Adequacy (Nominal)',
      score: Math.round(adequacyScore),
      maxScore: 30,
      value: `${Math.round(adequacyRatio)}%`,
      status: adequacyRatio >= 100 ? 'Excellent' : adequacyRatio >= 75 ? 'Good' : 'Moderate'
    });
  } else {
    scoringBreakdown.push({
      factor: 'Inflation-Adjusted Adequacy',
      score: 0,
      maxScore: 30,
      value: 'N/A',
      status: 'No Data'
    });
  }

  // ============================================================
  // FINAL SCORE CALCULATION AND LABELING
  // ============================================================
  const finalScore = Math.round(totalScore);
  
  // Determine readiness label with color coding
  let readinessLabel;
  let readinessColor;
  let readinessStatus;
  
  if (finalScore >= 75) {
    readinessLabel = 'Green';
    readinessColor = '#10b981'; // Green
    readinessStatus = 'Excellent';
  } else if (finalScore >= 50) {
    readinessLabel = 'Yellow';
    readinessColor = '#f59e0b'; // Amber/Yellow
    readinessStatus = 'Moderate';
  } else {
    readinessLabel = 'Red';
    readinessColor = '#ef4444'; // Red
    readinessStatus = 'Needs Improvement';
  }

  // Generate explanation message
  let explanationMessage = '';
  
  if (finalScore >= 75) {
    explanationMessage = 'Excellent retirement readiness! You are well-prepared with adequate income replacement, sustainable corpus, and inflation-protected savings. Continue monitoring and adjusting your plan as needed.';
  } else if (finalScore >= 50) {
    explanationMessage = 'Moderate retirement readiness. You have a reasonable foundation, but there are areas that need attention. Consider increasing savings or adjusting retirement expectations to improve your score.';
  } else {
    explanationMessage = 'Your retirement plan needs significant improvement. Current projections show gaps in income replacement, corpus sustainability, or inflation protection. Take action now to strengthen your retirement security.';
  }

  // Add specific guidance if there are issues
  if (issues.length > 0) {
    explanationMessage += '\n\nKey concerns:\n• ' + issues.join('\n• ');
  }
  
  if (recommendations.length > 0) {
    explanationMessage += '\n\nRecommended actions:\n• ' + recommendations.join('\n• ');
  }

  return {
    // Primary metrics
    readinessScore: finalScore,
    readinessLabel,
    readinessColor,
    readinessStatus,
    
    // Detailed breakdown
    scoringBreakdown,
    replacementRatio: Math.round(replacementRatio),
    sustainabilityRatio: Math.round(sustainabilityRatio),
    adequacyRatio: Math.round(adequacyRatio),
    
    // Guidance
    explanationMessage,
    issues,
    recommendations
  };
}
