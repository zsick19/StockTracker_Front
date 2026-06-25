import { SCORING_WEIGHTS as W } from './ScoringWeights'
import { getDay } from 'date-fns';
import { processPennyChannelLiveDelta } from './IntraDayAnalytics/pennyStockIntraDayCalc';
import { processCascadeLiveDelta } from './IntraDayAnalytics/cascadeIntraDayCalc';
import { processContinuationLiveDelta } from './IntraDayAnalytics/continuationIntraDayCalc';
import { processStandardChannelLiveDelta } from './IntraDayAnalytics/channelIntraDayCalc';

/**
 * TIER 1: CORE BASE ENVIRONMENT SCORER
 * Computes all shared macro indicators, systemic options gates, and pre-market 
 * catalysts completely on-the-fly inside your browser's memory.
 */
function compileSharedBaseEnvironmentMetrics(planEntity, todaysLiveCandles, liveSpyPlan)
{
    let baseScore = 0;

    const { dailyCalculatedValues, correlationValues, spyBetaValue } = planEntity.planConfig;
    const { optionsExpectedMoves } = planEntity;
    if (!todaysLiveCandles || todaysLiveCandles.length === 0) return 0;

    const currentCandle = todaysLiveCandles[todaysLiveCandles.length - 1];
    const livePrice = currentCandle.ClosePrice;

    // =========================================================================
    // 🛡️ SECTION A: INTRADAY TAPE ORDER-FLOW MATRIX
    // =========================================================================
    const liveHigh = Math.max(...todaysLiveCandles.map(c => c.HighPrice));
    const liveLow = Math.min(...todaysLiveCandles.map(c => c.LowPrice));
    const liveSpread = liveHigh - liveLow;
    const liveClv = liveSpread === 0 ? -1 : ((livePrice - liveLow) - (liveHigh - livePrice)) / liveSpread;

    // Track active wick reclaims and opening session baseline crosses
    if (liveClv >= 0.30) baseScore += W.orderFlow.clvMildBounce;
    if (liveClv >= 0.65) baseScore += W.orderFlow.clvExtremeBounce;
    if (livePrice > todaysLiveCandles[0].OpenPrice) baseScore += W.orderFlow.priceAboveOpen;

    // =========================================================================
    // 🧲 SECTION B: TECHNICAL HOURLY & DAILY LINES
    // =========================================================================
    const staticMetrics = planEntity.liveAuctionMetrics; // Pulls constants attached on boot
    if (dailyCalculatedValues && dailyCalculatedValues.ema50)
    {
        const distanceToEmaPct = Math.abs(livePrice - dailyCalculatedValues.ema50) / dailyCalculatedValues.ema50;

        if (distanceToEmaPct <= 0.0035)
        {
            baseScore += W.structuralMagnets.emaSupportProximity;
        } else if (livePrice < (staticMetrics.ema50Line * 0.99))
        {
            baseScore += W.structuralMagnets.emaTrendBrokenPenalty; // Apply trailing penalty
        }
    }

    // =========================================================================
    // 🚨 SECTION C: SYSTEMIC BROAD MARKET GAMMA GATES (SPY FILTERS)
    // =========================================================================
    if (liveSpyPlan && dailyCalculatedValues && correlationValues)
    {

        // If the broad index breaks below its daily Gamma Flip line, toggle volatility gates
        const isMarketInNegativeGammaRegime = liveSpyPlan.mostRecentPrice < liveSpyPlan.planData.gammaFlip;

        if (isMarketInNegativeGammaRegime)
        {
            const stockBeta = spyBetaValue || 1.0;
            const broadCorrelation = correlationValues.SPY?.correlation90Day || 0;

            if (stockBeta >= 1.40 && broadCorrelation >= 0.70)
            {
                baseScore += W.systemicGammaGates.highBetaVulnerabilityPenalty; // Severe -40 pass
            } else if (correlationValues.SPY?.isCurrentlyDecoupled || stockBeta <= 0.85)
            {
                baseScore += W.systemicGammaGates.idiosymmetricSafeHavenBonus; // Reward defensive names
            }

            if (planEntity.patternClassification === "continuation")
            {
                baseScore += W.systemicGammaGates.momentumContinuationRiskPenalty;
            }
        }
    }

    // =========================================================================
    // 📊 SECTION D: PRE-MARKET CATALYSTS & STOCKANALYSIS STRUCTURAL DATA
    // =========================================================================
    if (planEntity.stockInfo)
    {
        if (planEntity.stockInfo.RelativeVolume >= 2.0) baseScore += W.stockSpecificCatalysts.highRelativeVolumeBonus;
        else if (planEntity.stockInfo.RelativeVolume <= 0.5) baseScore += W.stockSpecificCatalysts.lowRelativeVolumePenalty;

        if (planEntity.stockInfo.DaysGapPercent <= -3.0) baseScore += W.stockSpecificCatalysts.gapTrapReversalPenalty;
        if (planEntity.stockInfo.PositionInRangePercent >= 90.0) baseScore += W.stockSpecificCatalysts.positionInRangeTopBonus;
    }

    // =========================================================================
    // ⏱️ SECTION E: BROAD MARKET OPTION EXPECTED MOVE CYCLES
    // =========================================================================
    if (liveSpyPlan && liveSpyPlan?.weeklyEM)
    {
        const weeklyPutWall = optionsExpectedMoves.weeklyEM?.iVolWeeklyEMLower;
        const isSpyAtWeeklyWall = Math.abs(liveSpyPlan.mostRecentPrice - weeklyPutWall) / weeklyPutWall <= 0.0015;

        if (isSpyAtWeeklyWall)
        {
            const currentDayIndex = getDay(new Date());
            // Check day-of-week decay weighting (Monday/Tuesday vs Thursday/Friday)
            if (currentDayIndex === 1 || currentDayIndex === 2)
            {
                baseScore += W.optionsExpectedMoves.earlyCycleWeeklyLowerSDPenalty;
            } else if (currentDayIndex === 4 || currentDayIndex === 5)
            {
                baseScore += W.optionsExpectedMoves.lateCycleWeeklyLowerSDPinBonus;
            }
        }
    }



    // =========================================================================
    // ⏱️ SECTION F: SUPPORT/RESISTANCE SHELVES 
    // =========================================================================
    // const supportShelves = planEntity.staticPreCompiledIndicators?.underlyingSupportShelves || [];
    // // Look up if today's price is currently drifting down into a known support shelf
    // const immediateSupportFloorBelow = supportShelves.find(shelf => shelf.priceLevel < livePrice);

    // if (immediateSupportFloorBelow)
    // {
    //     if (immediateSupportFloorBelow.frictionRating === "HIGH_CRITICAL_CLIFF")
    //     {
    //         // TODAY'S DRIFT IS CONTROLLED: A massive institutional buy cluster is sitting directly beneath the asset!
    //         // Maintain a neutral or slightly positive modifier to prevent emotional stop outs.
    //         baseEnvironmentScore += 10;
    //     } else if (immediateSupportFloorBelow.frictionRating === "MILD_VELOCITY_SHELF")
    //     {
    //         // LIQUIDITY VACUUM WARNING: The shelf below is paper-thin. 
    //         // If the current support cracks, the stock will free-fall rapidly to the next tier node.
    //         // Penalize the score heavily to act as an early protective risk warning!
    //         baseEnvironmentScore -= 15;
    //     }
    // }
    return baseScore;
}

/**
 * CENTRAL MASTER COMPILER ROUTER
 * Invoked continuously by your child UI layout panels to aggregate the complete score.
 */
export function calculateCentralPlanScore(planEntity, liveSpyPlan)
{
    const patternClassification = planEntity.patternConfig.patternClassification;
    const todaysLiveCandles = planEntity.todaysCandles
    // Gating check: Default to 0% score if polling arrays are empty
    if (!todaysLiveCandles || todaysLiveCandles.length === 0) { return { matchScorePercent: 0, status: "AWAITING_INTRADAY_STREAM", metrics: {} }; }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP A: COMPUTE THE SHARED BASE ENVIRONMENT SCORE (TIER 1) [INDEX]
    // ─────────────────────────────────────────────────────────────────────────
    const baseEnvironmentScore = compileSharedBaseEnvironmentMetrics(planEntity, todaysLiveCandles, liveSpyPlan);

    const livePrice = todaysLiveCandles[todaysLiveCandles.length - 1].ClosePrice;
    let patternSpecificScore = 0;

    // ─────────────────────────────────────────────────────────────────────────
    // STEP B: ROUTE TO SPECIFIC PATTERN SUB-ENGINES (TIER 2) [INDEX]
    // ─────────────────────────────────────────────────────────────────────────
    if (patternClassification === 'channel')
    {

        if (planEntity.patternConfig.channelType === "SUB_ENGINE_PENNY_STOCK_SCALP")
        {
            patternSpecificScore = processPennyChannelLiveDelta(planEntity, livePrice, todaysLiveCandles);
        } else if (planEntity.patternConfig.channelType === 'MULTIDAY_SPACED')
        {
            patternSpecificScore = processStandardChannelLiveDelta(planEntity, todaysLiveCandles);
        }
    } else if (patternClassification === 'continuation')
    {
        patternSpecificScore = processContinuationLiveDelta(planEntity, todaysLiveCandles);
    } else if (patternClassification === 'cascade')
    {
        patternSpecificScore = processCascadeLiveDelta(planEntity, todaysLiveCandles);
    }







    // ─────────────────────────────────────────────────────────────────────────
    // STEP C: MERGE AND FINALIZE ALPHA CONVICTION PERCENTAGE [INDEX]
    // ─────────────────────────────────────────────────────────────────────────
    const totalRawScore = baseEnvironmentScore + patternSpecificScore;
    const finalizedAlphaScore = Math.min(Math.max(totalRawScore, 0), 100);

    return {
        matchScorePercent: finalizedAlphaScore,
        status: finalizedAlphaScore >= 75 ? "🟢 HIGH_CONVICTION_ALERT" : "🔍 MONITORING_RADAR",

        metrics: {
            baseEnvironmentScore,
            patternSpecificScore,
            livePrice: parseFloat(livePrice.toFixed(2))
        }
    };
}
