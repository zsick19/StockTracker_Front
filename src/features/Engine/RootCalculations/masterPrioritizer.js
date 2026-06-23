import { SCORING_WEIGHTS as W } from './scoringWeights';
import { getDay } from 'date-fns';
import { processCascadeLiveDelta, processStandardChannelLiveDelta, scorePennyChannelLiveDelta, processContinuationLiveDelta } from './livePatternEngines';

/**
 * TIER 1: CORE BASE ENVIRONMENT SCORER
 * Computes all shared macro indicators, systemic options gates, and pre-market 
 * catalysts completely on-the-fly inside your browser's memory.
 */
function compileSharedBaseEnvironmentMetrics(planEntity, todaysLiveCandles, liveSpyPlan) {
    let baseScore = 0;
    
    const { dailyTickerValues, correlationValues, optionsExpectedMoves } = planEntity;
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
    if (staticMetrics && staticMetrics.ema50Line) {
        const distanceToEmaPct = Math.abs(livePrice - staticMetrics.ema50Line) / staticMetrics.ema50Line;
        
        if (distanceToEmaPct <= 0.0035) {
            baseScore += W.structuralMagnets.emaSupportProximity;
        } else if (livePrice < (staticMetrics.ema50Line * 0.99)) {
            baseScore += W.structuralMagnets.emaTrendBrokenPenalty; // Apply trailing penalty
        }
    }

    // =========================================================================
    // 🚨 SECTION C: SYSTEMIC BROAD MARKET GAMMA GATES (SPY FILTERS)
    // =========================================================================
    if (liveSpyPlan && dailyTickerValues && correlationValues) {
        // If the broad index breaks below its daily Gamma Flip line, toggle volatility gates
        const isMarketInNegativeGammaRegime = liveSpyPlan.livePrice < liveSpyPlan.gammaFlipLine;

        if (isMarketInNegativeGammaRegime) {
            const stockBeta = dailyTickerValues.spyBetaValue || 1.0;
            const broadCorrelation = correlationValues.SPY?.correlation90Day || 0;

            if (stockBeta >= 1.40 && broadCorrelation >= 0.70) {
                baseScore += W.systemicGammaGates.highBetaVulnerabilityPenalty; // Severe -40 pass
            } else if (correlationValues.SPY?.isCurrentlyDecoupled || stockBeta <= 0.85) {
                baseScore += W.systemicGammaGates.idiosymmetricSafeHavenBonus; // Reward defensive names
            }

            if (planEntity.patternClassification === "TOOL_4_CONTINUATION_MOMENTUM") {
                baseScore += W.systemicGammaGates.momentumContinuationRiskPenalty;
            }
        }
    }

    // =========================================================================
    // 📊 SECTION D: PRE-MARKET CATALYSTS & STOCKANALYSIS STRUCTURAL DATA
    // =========================================================================
    if (dailyTickerValues) {
        if (dailyTickerValues.relativeVolume >= 2.0) baseScore += W.stockSpecificCatalysts.highRelativeVolumeBonus;
        else if (dailyTickerValues.relativeVolume <= 0.5) baseScore += W.stockSpecificCatalysts.lowRelativeVolumePenalty;

        if (dailyTickerValues.daysGapPercent <= -3.0) baseScore += W.stockSpecificCatalysts.gapTrapReversalPenalty;
        if (dailyTickerValues.positionInRangePercent >= 90.0) baseScore += W.stockSpecificCatalysts.positionInRangeTopBonus;
    }

    // =========================================================================
    // ⏱️ SECTION E: BROAD MARKET OPTION EXPECTED MOVE CYCLES
    // =========================================================================
    if (liveSpyPlan && optionsExpectedMoves?.weekly?.putWall) {
        const weeklyPutWall = optionsExpectedMoves.weekly.putWall;
        const isSpyAtWeeklyWall = Math.abs(liveSpyPlan.livePrice - weeklyPutWall) / weeklyPutWall <= 0.0015;

        if (isSpyAtWeeklyWall) {
            const currentDayIndex = getDay(new Date());
            // Check day-of-week decay weighting (Monday/Tuesday vs Thursday/Friday)
            if (currentDayIndex === 1 || currentDayIndex === 2) {
                baseScore += W.optionsExpectedMoves.earlyCycleWeeklyLowerSDPenalty;
            } else if (currentDayIndex === 4 || currentDayIndex === 5) {
                baseScore += W.optionsExpectedMoves.lateCycleWeeklyLowerSDPinBonus;
            }
        }
    }

    return baseScore;
}

/**
 * CENTRAL MASTER COMPILER ROUTER
 * Invoked continuously by your child UI layout panels to aggregate the complete score.
 */
export function calculateCentralPlanScore(planEntity, todaysLiveCandles, liveSpyPlan) {
    const patternClassification = planEntity.planConfig?.userSelectedPattern || planEntity.patternClassification;
    
    // Gating check: Default to 0% score if polling arrays are empty
    if (!todaysLiveCandles || todaysLiveCandles.length === 0) {
        return { matchScorePercent: 0, status: "AWAITING_INTRADAY_STREAM" };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP A: COMPUTE THE SHARED BASE ENVIRONMENT SCORE (TIER 1) [INDEX]
    // ─────────────────────────────────────────────────────────────────────────
    const baseEnvironmentScore = compileSharedBaseEnvironmentMetrics(planEntity, todaysLiveCandles, liveSpyPlan);

    const livePrice = todaysLiveCandles[todaysLiveCandles.length - 1].ClosePrice;
    let patternSpecificScore = 0;

    // ─────────────────────────────────────────────────────────────────────────
    // STEP B: ROUTE TO SPECIFIC PATTERN SUB-ENGINES (TIER 2) [INDEX]
    // ─────────────────────────────────────────────────────────────────────────
    switch (patternClassification) {
        case "TOOL_1_VERTICAL_CASCADER":
            patternSpecificScore = processCascadeLiveDelta(planEntity, todaysLiveCandles);
            break;
            
        case "TOOL_2_HORIZONTAL_CHANNEL":
            if (planEntity.channelPattern?.channelType === "SUB_ENGINE_PENNY_STOCK_SCALP") {
                patternSpecificScore = scorePennyChannelLiveDelta(planEntity, livePrice, todaysLiveCandles);
            } else {
                patternSpecificScore = processStandardChannelLiveDelta(planEntity, todaysLiveCandles);
            }
            break;
            
        case "TOOL_4_CONTINUATION_MOMENTUM":
            patternSpecificScore = processContinuationLiveDelta(planEntity, todaysLiveCandles);
            break;

        default:
            patternSpecificScore = 0;
            break;
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
