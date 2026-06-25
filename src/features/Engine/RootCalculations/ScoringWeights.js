/**
 * Authoritative Quantitative Scoring Matrix Weights & Parameters.
 * Centralized registry to adjust parameter impact across all strategies in one spot.
 * Enforces a strict 50-Point Tier 1 Base and 50-Point Tier 2 Strategy boundary line.
 */
export const SCORING_WEIGHTS = {
    // =========================================================================
    // TIER 1: THE GLOBAL BASE ENVIRONMENT MATRIX (MAX 50 COLD POINTS)
    // =========================================================================

    // 1. Core Intraday Order-Flow Metrics 
    orderFlow: {
        clvMildBounce: 10,                 // Price closed in lower-middle wick tier (CLV >= 0.30)
        clvExtremeBounce: 5,               // Price closed in absolute lower wick tier (CLV >= 0.65)
        priceAboveOpen: 5,                 // Price has crossed and sits above today's regular session open
        volumeClimaxWall: 15               // Today's total volume crosses 2.0x average historical candle volume
    },

    // 2. Structural Magnets & Hourly Lines
    structuralMagnets: {
        emaSupportProximity: 10,           // Bonus applied if price sits within +/-0.35% cushion of a daily EMA
        powerHourTimeBonus: 10             // Reward for triggering inside 03:00-04:00 PM closing power hour
    },

    // 3. StockAnalysis Pre-Market Catalysts & Extended Layout Features
    stockSpecificCatalysts: {
        // A. Pure Volume & Supply Consensus Dynamics
        highRelativeVolumeBonus: 10,       // Relative Volume >= 2.0 (Institutional volume confirmation)
        lowRelativeVolumePenalty: -15,     // Relative Volume <= 0.5 (Complete lack of institutional interest)
        lowFloatSqueezeBonus: 15,          // Shares Float <= 50M AND Short % Float >= 15% (Low supply powder keg)
        shortRatioDaysToCoverBonus: 10,    // Short Ratio >= 5.0 days (High time-friction short covering tailwind)
        aggressiveCrowdedSharesShortBonus: 10, // Short % Shares >= 12% (Shorts aggressively blocking insider supply)

        // B. Price Extensions, Gaps, & Range Topology Boundaries
        gapTrapReversalPenalty: -20,       // Days Gap (%) <= -3.0% (Indicates severe overnight liquidation)
        positionInRangeTopBonus: 10,       // Position in Range (%) >= 90% (Blue-sky runway breakout)
        structuralWeaknessPenalty: -15,    // Position in Range (%) <= 15% (Trapped at 52-week lows; tax-loss selling)
        coiledPullbackBonus: 15,           // Price trading above 200 MA, but within a tight 2% cushion of 20 MA line
        extremeOversoldReversalBonus: 10,  // DailyRsi <= 30.0 (High-probability short-term capitulation exhaustion)

        // C. Corporate Risk, Liquidity Frameworks, & Market Caps
        largeCapInstitutionalBonus: 5,     // MarketCap >= $10 Billion (Highly institutional, clean order book depth)
        microCapSlippagePenalty: -10,      // MarketCap < $250 Million (High slippage risk, thin order books)
        illiquidStructurePenalty: -15,     // HasOptions === false (Lacks derivative pinning/hedging mechanics)
        preMarketStructureValidation: 5,   // PreMarket Volume / PreMarket % Change matches historical patterns
        earningsCircuitBreakerScore: 0,    // Hard circuit breaker that zeros out score on live earnings days
        preEarningsQuietWindowPenalty: -15, // Next Earnings Date is <= 5 trading days away (Block size freeze)
        week52LowLiquidationPenalty: -20,     // Shares Change (YoY) <= -15.0% (Severe institutional fund desertion)
        crowdedRebalancingRiskPenalty: -10 // Shares Institutions >= 85% during end-of-quarter rebalancing weeks
    },

    // 4. Time-of-Day Morning & Afternoon Probability Extensions
    timeProbabilityGating: {
        morningTimeAlignmentBonus: 10,     // Price strikes floor within +/-5 mins of averageTimeToBottom
        openingLowCushionBonus: 5,         // Live price lower than open, but protected by extentProb.openL >= 0.70
        statisticalIntervalLowBonus: 15,   // extremeProbByFiveMin[index].lowProb >= 0.65 (High-prob low print window)
        volumeVelocityExplosionBonus: 10,  // Running session volume >= 60% of avgDownTotalVolToFirstHour by 09:50 AM
        closingRunnerBonus: 10             // Live price positive AND extentProb.closeH >= 0.70 inside closing power hour
    },

    // =========================================================================
    // SYSTEMIC MACRO DEDUCTIONS & PENALTY SENTRIES (APPLIED TO BASE ENV)
    // =========================================================================
    systemicDeductions: {
        emaTrendBrokenPenalty: -20,        // Price cracks below institutional 50 EMA line by > 1%
        highBetaVulnerabilityPenalty: -40, // Applied to high-beta stocks closely tied to SPY below gamma flip line
        momentumContinuationRiskPenalty: -25,// Applied to continuation setups if broad index liquidity drops
        lowRelativeVolumePenalty: -15,     // Relative Volume <= 0.5 (Lack of institutional consensus)
        gapTrapReversalPenalty: -20,       // Applied if stock gaps down more than 3% right on the open cross
        illiquidStructurePenalty: -15,     // HasOptions === false (Asset lacks pinning or gamma hedging mechanics)
        microCapSlippagePenalty: -10,      // MarketCap < $250 Million (High bid-ask spread friction)
        structuralWeaknessPenalty: -15,    // Position in Range (%) <= 15% (Trapped at 52-week lows)
        crowdedRebalancingRiskPenalty: -10,// Shares Institutions >= 85% during end-of-quarter portfolio shifts
        globalMacroHeadwindSentry: -15,    // Seasonal calendar lockout applied between June 15-30 or Sept 1-30
        preEarningsQuietWindowPenalty: -15,// Trailing distance to next earnings release is <= 5 trading days
        decliningMa5DayPenalty: -15,       // Broad market index price is trading beneath a declining 5-day SMA
        putWallBreachLiquidityDrain: -20,  // SPY cracks beneath its daily options put wall level
        breadthDecayPenalty: -20,          // SPY fake-pumping on Mag 8 while equal-weight RSP is dropping
        systemicMacroLockout: -50,         // Session clock inside a T-Minus 60m / T-Plus 30m Fed or CPI release window
        middayLunchtimeChurnCage: -20,     // Active session clock between 11:30 AM and 01:30 PM (Dead liquidity zone)
        middayLowProbabilityPenalty: -5    // ExtentProb.midL <= 0.35 inside the lunchtime churn cage
    },

    // =========================================================================
    // TIER 2: STRATEGY PATTERN TRACKS (MAX 50 STRATEGY POINTS PER TOOL)
    // =========================================================================
    patterns: {
        // TOOL 1: THE VERTICAL CASCADER
        cascade: {
            insideTargetBoxBonus: 25,      // Price sitting cleanly between priceCeiling and priceFloor
            volumetricClimaxMatch: 15,     // Live price trading below yesterday's historical volume climax bar high
            descentVelocityDecel: 10       // Today's intraday cascade speed is lower than trailingDescentVelocity
        },

        // TOOL 2: THE HORIZONTAL CHANNEL (LARGE-CAP / STANDARD STOCKS)
        standardChannel: {
            insideStrikeBufferBonus: 25,   // Price sitting between entryStrikeBuffer and channelBottom
            floorSweepReclaimBonus: 15,    // Live lower wicks swept beneath channelBottom and closed back above
            asymmetricRunwayBonus: 10      // Immediate overhead resistance shelf is rated "MILD_VELOCITY_SHELF"
        },

        // TOOL 2: THE PENNY STOCK CHANNEL SCALPER (1-MINUTE HIGH VELOCITY TAPE)
        pennyChannel: {
            insideStrikeBufferBonus: 25,   // Price sitting inside the high-resolution buying buffer bracket
            stopRunReclaimBonus: 15,       // A 1-minute lower wick sweeps beneath channelBottom and instantly reclaims it
            volumetricAbsorptionWall: 10   // Active 1-minute candle volume >= 3.5x baselineAvgOneMinVolume
        },

        // TOOL 4: THE CONTINUATION MOMENTUM
        continuation: {
            triggerBreachBonus: 25,        // Price programmatically crosses above tomorrowEntryTriggerPrice
            strongTrendHealthBonus: 15,    // historicalTrendHealthScore >= 75
            coiledPullbackBonus: 10,       // Live price floats within a tight 2% cushion above its 20 MA line
            trailingStopBreachPenalty: -50  // Price falls beneath trailingInvalidationStopPrice (Hard Failure)
        }
    },

    // 6. OPTIONS EXPECTED MOVE BOUNDARY DYNAMICS (2-3 DAY SWING CYCLES)
    optionsExpectedMoves: {
        earlyCycleWeeklyLowerSDPenalty: -15, // Testing weekly lower limits on Monday/Tuesday (High continuation risk)
        lateCycleWeeklyLowerSDPinBonus: 20,  // Testing weekly lower limits on Thursday/Friday (High short-covering pin probability)
        dualExpectedMoveExhaustion: 20       // Price breaches weekly expected low AND hits daily implied low simultaneously
    }
};
