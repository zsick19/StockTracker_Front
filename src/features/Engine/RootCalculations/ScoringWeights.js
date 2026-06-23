/**
 * Global Quantitative Scoring Matrix Weights & Parameters.
 * Centralized registry to adjust parameter impact across all strategies in one spot.
 */
export const SCORING_WEIGHTS = {
    // 1. Core Intraday Order-Flow Metrics (Max 65 Base Points)
    orderFlow: {
        clvMildBounce: 25,          // Price closed in lower-middle wick tier (CLV >= 0.30)
        clvExtremeBounce: 10,       // Price closed in absolute lower wick tier (CLV >= 0.65)
        buyerDominanceCluster: 25,  // Green volume exceeds red volume by 1.5x in recent 30-min window
        priceAboveOpen: 15,         // Price has crossed and sits above today's regular session open
        volumeClimaxWall: 25        // Today's total volume crosses 2.0x average historical candle volume
    },

    // 2. Structural & Macro Magnet Modifiers
    structuralMagnets: {
        emaSupportProximity: 15,    // Bonus applied if price sits within +/-0.35% cushion of a daily EMA
        emaTrendBrokenPenalty: -20, // Severe penalty applied if price cracks below an institutional line by > 1%
        powerHourTimeBonus: 15,     // Reward for triggering inside 09:30-10:30 AM or 03:00-04:00 PM ET
    },

    // 3. Systemic Options Market Filters (SPY Gamma Gates)
    systemicGammaGates: {
        highBetaVulnerabilityPenalty: -40, // Applied to high-beta stocks closely tied to SPY below gamma flip line
        idiosymmetricSafeHavenBonus: 15,   // Applied to decoupled/low-beta assets during market crashes
        momentumContinuationRiskPenalty: -25 // Applied to high-flying continuation setups if broad liquidity drops
    },

    // 4. Stock-Specific Structural Catalysts (StockAnalysis Downloads)
    stockSpecificCatalysts: {
        lowFloatSqueezeBonus: 20,       // Float <= 50M shares AND short interest >= 15.0%
        week52LowLiquidationPenalty: -20,  // Deducted from channel setups trading within 3% of 52-week lows
        blueSkyRunwayBonus: 10,         // Applied to continuation trends holding within 4% of 52-week highs
        highRelativeVolumeBonus: 15,    // Relative Volume >= 2.0
        lowRelativeVolumePenalty: -15,  // Relative Volume <= 0.5
        gapTrapReversalPenalty: -20,    // Applied if stock gaps down more than 3% right on the open cross
        positionInRangeTopBonus: 15,    // Position in Range >= 90%
        earningsCircuitBreakerScore: 0  // Hard overwrite that completely zeros out final score if earnings is live
    },

    // 5. Macro Momentum Waves
    macroMomentumWaves: {
        min30MacdBullishExpansion: 20,       // MACD crossed cleanly over Signal line on 30-min down-sample
        min30MacdBearishConvergenceTurning: 10, // Histogram is below zero but actively shrinking back up
        min30MacdBearishExpansionDanger: - 25  // MACD below signal and histogram bars growing larger negative
    },

    // 6. Options Expected Move Boundaries
    optionsExpectedMoves: {
        earlyCycleWeeklyLowerSDPenalty: -15, // Testing weekly lower limits on Monday or Tuesday
        lateCycleWeeklyLowerSDPinBonus: 20   // Testing weekly lower limits / put walls on Thursday or Friday
    },

    // 7. PATTERN STRATEGY STRUCTURE WEIGHTS (Max 50 Points Per Tool)
    patterns: {
        cascade: {
            insideTargetBoxBonus: 25,     // Price sitting between priceCeiling and priceFloor
            approachingIdealPriceBonus: 15, // Price within tight 0.5% cushion of priceIdeal
            vacuumAirPocketBonus: 10,     // Liquidity vacuum air pocket verified above entry price
            breakdownFloorBrokenPenalty: -30 // Price breaks below priceFloor / stop zone
        },
        channel: {
            insideStrikeBufferBonus: 25,  // Price sitting between entryStrikeBuffer and channelBottom
            floorSweepReclaimBonus: 15,   // Live wicks swept beneath channelBottom and closed back above
            heightVolatilityBonus: 10,    // Channel height is wide enough to accommodate profitable swing
            ceilingBreakoutBonus: 10      // Price breaking above channelTop with high relative volume
        },
        continuation: {
            triggerBreachBonus: 30,       // Price crosses tightly above tomorrowEntryTriggerPrice
            strongTrendHealthBonus: 10,   // trendHealthScore >= 80%
            highGrowthVelocityBonus: 10,  // calculatedDailyGrowthRate >= 2.5%
            trailingStopBreachPenalty: -40 // Price falls beneath trailingInvalidationStopPrice
        }
    }


};
