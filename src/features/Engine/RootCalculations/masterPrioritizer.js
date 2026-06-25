import { SCORING_WEIGHTS as W } from './ScoringWeights'
import { processPennyChannelLiveDelta } from './IntraDayAnalytics/pennyStockIntraDayCalc';
import { processCascadeLiveDelta } from './IntraDayAnalytics/cascadeIntraDayCalc';
import { processContinuationLiveDelta } from './IntraDayAnalytics/continuationIntraDayCalc';
import { processStandardChannelLiveDelta } from './IntraDayAnalytics/channelIntraDayCalc';
import { getDay, getMonth, getDate, differenceInMinutes, getHours, getMinutes } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

/**
 * @param {Object} planEntity - Fully hydrated stock plan object from your entity adapter cache
 * @param {Array} todaysLiveCandles - Today's streaming regular session candle array [INDEX]
 * @param {Object} liveSpyPlan - The live macro Sentry metadata block from your macro store
 * @param {Object} macroEntities - The raw macro market entity adapter dictionary [INDEX]
 * @returns {number} The finalized cumulative Base Environment Score (Max 50 points base layout)
 */
export function compileSharedBaseEnvironmentMetrics(planEntity, todaysLiveCandles, liveSpyPlan, liveRSPPlan, liveSectorPlan)
{
    let baseScore = 0;

    const { dailyCalculatedValues, correlationValues, spyBetaValue, greatestCorrelation, patternClassification } = planEntity.planConfig;
    const { vpSupportResistance } = planEntity.metricConfig
    const stockAnalysisInfo = planEntity.stockInfo

    if (!todaysLiveCandles || todaysLiveCandles.length === 0) return 0;

    const currentCandle = todaysLiveCandles[todaysLiveCandles.length - 1];
    const livePrice = planEntity.mostRecentPrice

    // =========================================================================
    // 📊 1. REAL-TIME INTRADAY TAPE & ORDER FLOW
    // =========================================================================
    if (livePrice)
    {
        const liveHigh = Math.max(...todaysLiveCandles.map(c => c.HighPrice));
        const liveLow = Math.min(...todaysLiveCandles.map(c => c.LowPrice));
        const liveSpread = liveHigh - liveLow;
        // Classic Candlestick Location Vector (CLV)
        const liveClv = liveSpread === 0 ? -1 : ((livePrice - liveLow) - (liveHigh - livePrice)) / liveSpread;

        if (liveClv >= 0.30) baseScore += W.orderFlow.clvMildBounce;
        if (liveClv >= 0.65) baseScore += W.orderFlow.clvExtremeBounce;
        if (livePrice > todaysLiveCandles[0].OpenPrice) baseScore += W.orderFlow.priceAboveOpen;
    }

    // =========================================================================
    // 🧲 2. INSTUTITIONAL MA LINES & NIGHTLY HORIZONTAL SHELF ALIGNMENT
    // =========================================================================
    // Cross-check proximity to your pre-compiled EMAs seeded on boot [INDEX]
    if (dailyCalculatedValues && dailyCalculatedValues.ema50)
    {
        const distanceToEmaPct = Math.abs(livePrice - dailyCalculatedValues.ema50) / dailyCalculatedValues.ema50;
        if (distanceToEmaPct <= 0.0035) { baseScore += W.structuralMagnets.emaSupportProximity; }
        else if (livePrice < (dailyCalculatedValues.ema50Line * 0.99)) { baseScore += W.structuralMagnets.emaTrendBrokenPenalty; }
    }

    // AUDIT NIGHTLY 3-TIER HORIZONTAL PROTECTION RUNWAYS
    if (vpSupportResistance)
    {
        const shelves = vpSupportResistance?.overHeadResistance || [];
        const priceAscShelves = [...shelves].sort((a, b) => a.priceLevel - b.priceLevel)
        const immediateCeilingShelf = priceAscShelves.find(shelf => shelf.priceLevel > livePrice) || { frictionRating: "MILD", scoringWeight: 0 };
        if (immediateCeilingShelf.frictionRating === "MILD_VELOCITY_SHELF")
        {
            baseScore += 15; // Award Asymmetric Runway Bonus: Thin supply immediately overhead [INDEX]
        } else if (immediateCeilingShelf.frictionRating === "HIGH_CRITICAL_CLIFF")
        {
            baseScore += immediateCeilingShelf.scoringWeight; // Apply severe -25 point trapped supply penalty [INDEX]
        }
    }

    // =========================================================================
    // 🚨 3. BROAD MARKET INDEX FLIPS & DEFENSIVE SENTRY FILTERS
    // =========================================================================
    if (liveSpyPlan && spyBetaValue && correlationValues)
    {
        // If the broad index breaks below its daily Gamma Flip line, toggle volatility gates
        const isMarketInNegativeGammaRegime = liveSpyPlan.mostRecentPrice < liveSpyPlan.planData.gammaFlip;

        if (isMarketInNegativeGammaRegime)
        {
            const stockBeta = spyBetaValue || 1.0;
            const broadCorrelation = correlationValues.SPY?.correlation90Day || 0;
            if (stockBeta >= 1.40 && broadCorrelation >= 0.70)
            {
                baseScore += W.systemicGammaGates.highBetaVulnerabilityPenalty; // Severe -40 point protection pass
            } else if (correlationValues.SPY?.isCurrentlyDecoupled || stockBeta <= 0.85)
            {
                baseScore += W.systemicGammaGates.idiosymmetricSafeHavenBonus; // Reward decoupling low-beta assets
            }

            if (planEntity.planConfig.patternClassification === "continuation")
            {
                baseScore += W.systemicGammaGates.momentumContinuationRiskPenalty; // Penalize momentum setups
            }
        }
    }

    // =========================================================================
    // 📊 4. STOCKANALYSIS DAILY METRICS & PRE-MARKET CATALYSTS
    // =========================================================================
    if (stockAnalysisInfo)
    {
        // Audit Relative Volume Consensus
        if (stockAnalysisInfo.RelativeVolume >= 2.0) baseScore += W.stockSpecificCatalysts.highRelativeVolumeBonus;
        else if (stockAnalysisInfo.RelativeVolume <= 0.5) baseScore += W.stockSpecificCatalysts.lowRelativeVolumePenalty;

        // Audit Long-Term Institutional Desertion
        if (stockAnalysisInfo.sharesChangeYoYPercent <= -15.0) baseScore += W.stockSpecificCatalysts.week52LowLiquidationPenalty; // Custom metadata penalty

        // Audit Short-Squeeze Time Friction
        if (stockAnalysisInfo.ShortRatioDaysToCover >= 5.0) baseScore += W.stockSpecificCatalysts.positionInRangeTopBonus; // Assign Time Squeeze multiplier

        // Audit 52-Week Structural Drift Location
        if (stockAnalysisInfo.PositionInRangePercent <= 15.0) baseScore -= 15; // Severe structural weakness penalty

        // Ingest Day's Gap and Pre-Market Catalyst Variables [INDEX]
        if (stockAnalysisInfo.DaysGapPercent <= -3.0) baseScore += W.stockSpecificCatalysts.gapTrapReversalPenalty;
        if (stockAnalysisInfo.PositionInRangePercent >= 90.0) baseScore += W.stockSpecificCatalysts.positionInRangeTopBonus;

        // Audit Optionable Liquidity
        if (stockAnalysisInfo.HasOptions === false && patternClassification !== "continuation") baseScore -= 15; // Apply Illiquid Structure Penalty

        //Audit Market Cap Liquidity Framework
        const rawMarketCap = stockAnalysisInfo.MarketCap || 0;
        if (rawMarketCap > 0)
        {
            if (rawMarketCap < 250000000) baseScore -= 10; // Micro-Cap Slippage Penalty
            else if (rawMarketCap >= 10000000000) baseScore += 10; // Large-Cap Institutional Bonus
        }

        //Audit Daily RSI Mean Reversion Exhaustion
        if (stockAnalysisInfo.DailyRsi <= 30.0 && planEntity.patternConfig.patternClassification === "channel")
        {
            if (planEntity.patternConfig.channelType === 'MULTIDAY_SPACED') baseScore += 15; // Extreme Oversold Reversal Bonus
        }

        // Audit Crowded Total Shares Shorting Matrix
        if (stockAnalysisInfo.ShortPercentOfShares >= 12.0) baseScore += 10; // Aggressive Squeeze Bonus        

        // Compute Exact Percentage Extension from the Moving Average anchors
        const ma20 = stockAnalysisInfo.MA20Price;
        const ma200 = stockAnalysisInfo.MA200Price;
        if (ma20 && ma200 && livePrice > ma200)
        {
            const distanceToMa20Pct = (livePrice - ma20) / ma20;

            // If the stock is in a long-term bull trend but has pulled back tightly to its 20 MA line
            if (distanceToMa20Pct >= 0 && distanceToMa20Pct <= 0.02 && planEntity.patternConfig.patternClassification === "continuation")
            {
                baseScore += 15; // Coiled Pullback Bonus
            }
        }


    }


    // =========================================================================
    // 🏛️ 5. SECTOR ETF DIVERGENCE & MULTI-CORRELATION BREADTH
    // =========================================================================
    if (liveSectorPlan && liveSectorPlan.mostRecentPrice)
    {
        const sectorHistory = liveSectorPlan.historicCandle || [];

        if (sectorHistory.length > 0)
        {
            const sectorPriorClose = sectorHistory[sectorHistory.length - 1].ClosePrice;

            // Compute standard 30-minute relative strength outperformance ratio [INDEX]
            const stockReturnPct = ((livePrice - dailyCalculatedValues.ema200) / dailyCalculatedValues.ema200) * 100;
            const sectorReturnPct = ((liveSectorPlan.mostRecentPrice - sectorPriorClose) / sectorPriorClose) * 100;

            const relativeStrengthDelta = stockReturnPct - sectorReturnPct;
            if (relativeStrengthDelta >= 1.5) baseScore += 20; // Award Institutional Rotation Divergence Bonus
        }
    }


    // COMPUTE CAP-WEIGHTED VS EQUAL-WEIGHTED BREADTH DECAY (SPY vs RSP)
    if (liveSpyPlan && liveRSPPlan)
    {
        const spyPrice = liveSpyPlan.mostRecentPrice;
        const rspPrice = liveRSPPlan.mostRecentPrice;
        const spyHistory = liveSpyPlan.historicCandle || [];
        const rspHistory = liveRSPPlan.historicCandle || [];

        if (spyPrice && rspPrice && spyHistory.length > 0 && rspHistory.length > 0)
        {
            const spyReturn = ((spyPrice - spyHistory[spyHistory.length - 1].ClosePrice) / spyHistory[spyHistory.length - 1].ClosePrice) * 100;
            const rspReturn = ((rspPrice - rspHistory[rspHistory.length - 1].ClosePrice) / rspHistory[rspHistory.length - 1].ClosePrice) * 100;
            // If SPY is fake-pumping on Mag 8 while RSP decays, penalize high-beta long plans [INDEX]
            if ((spyReturn - rspReturn) >= 0.75 && spyBetaValue >= 1.15) { baseScore -= 20; }
        }
    }

    // =========================================================================
    // ⏱️ 6. OPTION EXPIRATION TIME-DECAY CYCLES & SEASONAL EVENTS
    // =========================================================================
    if (liveSpyPlan && liveSpyPlan.planData?.weeklyEM?.iVolWeeklyEMLower)
    {
        const weeklyPutWall = liveSpyPlan.planData?.weeklyEM?.iVolWeeklyEMLower;

        const isSpyAtWeeklyWall = Math.abs(liveSpyPlan.mostRecentPrice - weeklyPutWall) / weeklyPutWall <= 0.0015;

        if (isSpyAtWeeklyWall)
        {
            const currentDayIndex = getDay(new Date());
            if (currentDayIndex === 1 || currentDayIndex === 2) baseScore += W.optionsExpectedMoves.earlyCycleWeeklyLowerSDPenalty;
            else if (currentDayIndex === 4 || currentDayIndex === 5) baseScore += W.optionsExpectedMoves.lateCycleWeeklyLowerSDPinBonus;
        }
    }


    // AUDIT SYSTEMIC CALENDAR REBALANCING WINDOWS (June / December Portfolio Drifts)
    const systemDate = new Date();
    const currentMonth0Based = getMonth(systemDate);
    const currentDayOfMonth = getDate(systemDate);

    const isEndofQuarterRebalancingWindow = (currentMonth0Based === 5 && currentDayOfMonth >= 15) || (currentMonth0Based === 11 && currentDayOfMonth >= 15);
    if (isEndofQuarterRebalancingWindow)
    {
        if (stockAnalysisInfo?.InstitutionalSharePercent >= 85.0) baseScore -= 10; // Crowded basket selling penalty
        baseScore -= 15; // Global seasonal headwind cushion
    }

    return baseScore;
}





/**
 * @param {Object} planEntity - Fully hydrated stock plan object from your entity adapter cache
 * @param {Array} todaysLiveCandles - Today's streaming regular session candle array [INDEX]
 * @returns {number} The finalized cumulative Base Environment Score (Max 50 points base layout)
 */
export function compileTimeDependentMetrics(planEntity, todaysLiveCandles)
{
    let timeScore = 0;
    const { extentProb, morningMetrics, morningVolume, extremeProbByFiveMin } = planEntity.metricConfig
    let livePrice = planEntity.mostRecentPrice

    if (!todaysLiveCandles || todaysLiveCandles.length === 0) return timeScore
    let sessionOpenPrice = todaysLiveCandles[0].OpenPrice

    const nyTime = toZonedTime(new Date(), 'America/New_York');
    const currentHour = getHours(nyTime);
    const currentMinute = getMinutes(nyTime);
    // Calculate exactly how many minutes have elapsed since the 09:30 AM opening bell
    const minutesElapsedSinceOpen = ((currentHour - 9) * 60) + (currentMinute - 30);

    // =========================================================================
    // 🥪 PHASE 1: THE MORNING OPEN HOUR (09:30 AM - 10:30 PM)
    // =========================================================================
    if (minutesElapsedSinceOpen >= 0 && minutesElapsedSinceOpen <= 60)
    {

        // 1. RECON A: THE POWER-HOUR REVERSAL TIME ALIGNMENT CHECK
        const downSideMetrics = morningMetrics?.downSide;
        if (downSideMetrics && downSideMetrics.averageTimeToBottom)
        {
            const targetHour = downSideMetrics.averageTimeToBottom.hour || 9;
            const targetMin = downSideMetrics.averageTimeToBottom.minute || 42;
            const targetMinutesSinceOpen = ((targetHour - 9) * 60) + (targetMin - 30);

            // If the current regular session clock is within a tight 5-minute cushion of the historical low print time
            const isInsideHistoricalReversalWindow = Math.abs(minutesElapsedSinceOpen - targetMinutesSinceOpen) <= 5;

            if (isInsideHistoricalReversalWindow && downSideMetrics.reboundProbability >= 0.65) timeScore += 15; // Award Power-Hour Time Alignment Bonus!
        }

        // 2. RECON B: HORIZONTAL EXTENT PROBABILITY SEGMENTATION
        // If today's open price is down from yesterday, track your openL probability threshold
        if (livePrice < sessionOpenPrice && extentProb)
            if (extentProb.openL >= 0.70) timeScore += 10; // Award Opening Low Statistical Cushion Bonus

        // 3. RECON C: THE 5-MINUTE CANDLE INTERVAL LOW PRINT PROBABILITY
        // Calculate today's active 5-minute block index index (0 = 09:30, 1 = 09:35, 2 = 09:40...)
        const activeFiveMinBlockIndex = Math.floor(minutesElapsedSinceOpen / 5);
        if (extremeProbByFiveMin && extremeProbByFiveMin[activeFiveMinBlockIndex])
        {
            const liveBlockProbability = extremeProbByFiveMin[activeFiveMinBlockIndex].lowProb || 0;
            if (liveBlockProbability >= 0.65) timeScore += 20; // Award Statistical Floor Probability Multiplier!
        }

        // 4. RECON D: MORNING VOLUME VELOCITY RUNWAY COUNTER
        if (morningVolume && morningVolume.avgDownTotalVolToFirstHour > 0)
        {
            // Calculate the total combined volume executed across today's session candles so far
            const todaysRunningSessionVolume = todaysLiveCandles.reduce((sum, c) => sum + c.Volume, 0);
            // If we are only 20 minutes into the session, but volume already clears 60% of the full first-hour norm
            if (minutesElapsedSinceOpen <= 25 && todaysRunningSessionVolume >= (morningVolume.avgDownTotalVolToFirstHour * 0.60))
            {
                timeScore += 15; // Award Volume Velocity Explosion Bonus!
            }
        }
    }
    // =========================================================================
    // 🥪 PHASE 2: THE MIDDAY LUNCHTIME CHURN CAGE (11:30 AM - 01:30 PM)
    // =========================================================================
    else if (minutesElapsedSinceOpen >= 120 && minutesElapsedSinceOpen <= 240)
    {
        // Severe penalty applied because institutional liquidity vanishes. 
        // Breakout continuations will fake out, and mean-reversion channels will break lower.
        timeScore -= 20;

        // Cross-check your whole-day trading stats from your schema mapping entries
        if (extentProb)
        {
            // If the stock's midday low probability is weak, increase the penalty safely
            if (extentProb.midL <= 0.35) timeScore -= 5;
        }
    }
    // =========================================================================
    // ⚡ PHASE 3: THE AFTERNOON CLOSING POWER HOUR (03:00 PM - 04:00 PM)
    // =================────────────────────────────────────────────────────────
    else if (minutesElapsedSinceOpen >= 330 && minutesElapsedSinceOpen <= 390)
    {
        // Inward institutional volume returns to execute market-on-close (MOC) allocations
        timeScore += W.structuralMagnets.powerHourTimeBonus; // Award +15 Points Power Hour Bonus

        if (extentProb)
        {
            // If today's price is positive, check if the stock tends to close near its high
            if (livePrice > sessionOpenPrice && extentProb.closeH >= 0.70)
            {
                timeScore += 10; // Boost score for high-probability closing runners
            }
            // If running a mean-reversion play, verify the close-low historical cushion
            else if (livePrice < sessionOpenPrice && extentProb.closeL >= 0.65)
            {
                timeScore += 10;
            }
        }
    }

    return timeScore
}



import { getMonth, getDate, getMinutes, getHours, isWithinInterval, parse, format, subMinutes, addMinutes } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { SCORING_WEIGHTS as W } from './scoringWeights';

/**
 * PRODUCTION RISK SENTRY: Systemic Macro Deductions Compiler.
 * Aggregates all active corporate, cyclical, options-driven, and broad index 
 * distribution penalties completely headlessly inside your browser's memory [INDEX].
 * 
 * @param {Object} planEntity - Fully hydrated stock plan document from cache
 * @param {Array} todaysLiveCandles - Today's streaming regular session candle array [INDEX]
 * @param {Object} liveSpyPlan - The live macro Sentry metadata block from your macro store
 * @param {Object} macroEntities - The raw macro market entity adapter dictionary [INDEX]
 * @returns {number} The absolute cumulative point penalties active (Returns a clean negative integer)
 */
export function compileSystemicMacroDeductions(planEntity, todaysLiveCandles, liveSpyPlan, macroEntities)
{
    let totalPenalties = 0;

    const { dailyTickerValues, correlationValues } = planEntity;
    if (!todaysLiveCandles || todaysLiveCandles.length === 0) return 0;

    const currentCandle = todaysLiveCandles[todaysLiveCandles.length - 1];
    const livePrice = currentCandle.ClosePrice;

    const nyTime = toZonedTime(new Date(), 'America/New_York');
    const currentHour = getHours(nyTime);
    const currentMinute = getMinutes(nyTime);
    const minutesElapsedSinceOpen = ((currentHour - 9) * 60) + (currentMinute - 30);

    // =========================================================================
    // 🛡️ TRACK 1: INDIVIDUAL ASSET CRITICAL RISK PENALTIES
    // =========================================================================
    if (dailyTickerValues)
    {
        // A. Corporate Earnings Quiet Window Sentry (T-Minus 5 Days)
        if (dailyTickerValues.daysUntilNextEarnings <= 5 && dailyTickerValues.daysUntilNextEarnings > 0)
        {
            totalPenalties += W.systemicDeductions.preEarningsQuietWindowPenalty; // -15 Points
        }

        // B. Lack of Optionable Liquidity or Hedging Tracks
        if (dailyTickerValues.hasOptions === false && planEntity.patternClassification !== "TOOL_4_CONTINUATION_MOMENTUM")
        {
            totalPenalties += W.systemicDeductions.illiquidStructurePenalty; // -15 Points
        }

        // C. Micro-Cap Order Book Slippage Friction
        const rawMarketCap = dailyTickerValues.marketCap || 0;
        if (rawMarketCap > 0 && rawMarketCap < 250000000)
        {
            totalPenalties += W.systemicDeductions.microCapSlippagePenalty; // -10 Points
        }

        // D. 52-Week Structural Weakness Trap (Scrubbed unified field name)
        if (dailyTickerValues.positionInRangePercent <= 15.0)
        {
            totalPenalties += W.systemicDeductions.structuralWeaknessPenalty; // -15 Points
        }
    }

    // =========================================================================
    // 🛡️ TRACK 2: BROAD INDEX DISTORTION & LIQUIDITY DRIFTS
    // =========================================================================
    if (liveSpyPlan && dailyTickerValues && correlationValues)
    {
        const isMarketInNegativeGammaRegime = liveSpyPlan.lastPrice < liveSpyPlan.gammaFlipLine;

        if (isMarketInNegativeGammaRegime)
        {
            const stockBeta = dailyTickerValues.spyBetaValue || 1.0;
            const broadCorrelation = correlationValues.SPY?.correlation90Day || 0;

            // Large Cap High-Beta Inflow Crash Risk
            if (stockBeta >= 1.40 && broadCorrelation >= 0.70)
            {
                totalPenalties += W.systemicDeductions.highBetaVulnerabilityPenalty; // -40 Points
            }

            // High Flying Continuation Setup Vulnerability
            if (planEntity.patternClassification === "TOOL_4_CONTINUATION_MOMENTUM")
            {
                totalPenalties += W.systemicDeductions.momentumContinuationRiskPenalty; // -25 Points
            }
        }

        // Broad Market Index Option Put Wall Breach
        if (optionsExpectedMoves?.weekly?.putWall)
        {
            const weeklyPutWall = optionsExpectedMoves.weekly.putWall;
            const isPutWallBreachedLower = liveSpyPlan.lastPrice < weeklyPutWall;

            if (isPutWallBreachedLower)
            {
                totalPenalties += W.systemicDeductions.putWallBreachLiquidityDrain; // -20 Points
            }
        }
    }

    // =========================================================================
    // 🛡️ TRACK 3: BREADTH DECAY METRICS (SPY VS RSP FAKEOUTS)
    // =========================================================================
    if (macroEntities && macroEntities['SPY'] && macroEntities['RSP'])
    {
        const spyPrice = macroEntities['SPY'].macroTideSentry?.lastPrice;
        const rspPrice = macroEntities['RSP'].macroTideSentry?.lastPrice;
        const spyHistory = macroEntities['SPY'].historicalCandles || [];
        const rspHistory = macroEntities['RSP'].historicalCandles || [];

        if (spyPrice && rspPrice && spyHistory.length > 0 && rspHistory.length > 0)
        {
            const spyReturn = ((spyPrice - spyHistory[spyHistory.length - 1].ClosePrice) / spyHistory[spyHistory.length - 1].ClosePrice) * 100;
            const rspReturn = ((rspPrice - rspHistory[rspHistory.length - 1].ClosePrice) / rspHistory[rspHistory.length - 1].ClosePrice) * 100;

            // If headline market looks green but 400+ equal-weighted stocks are bleeding
            if ((spyReturn - rspReturn) >= 0.75 && dailyTickerValues?.spyBetaValue >= 1.15)
            {
                totalPenalties += W.systemicDeductions.breadthDecayPenalty; // -20 Points
            }
        }
    }

    // =========================================================================
    // 🛡️ TRACK 4: CALENDAR EVENT TRAPS & INTRADAY TIME LOCKOUTS
    // =========================================================================

    // A. The Midday Lunchtime Churn Cage (11:30 AM - 01:30 PM Eastern Window)
    if (minutesElapsedSinceOpen >= 120 && minutesElapsedSinceOpen <= 240)
    {
        totalPenalties += W.systemicDeductions.middayLunchtimeChurnCage; // -20 Points

        if (planEntity.extentProb && planEntity.extentProb.midL <= 0.35)
        {
            totalPenalties += W.systemicDeductions.middayLowProbabilityPenalty; // -5 Points
        }
    }

    // B. Scheduled Macro Economic Volatility Gates (Fed / CPI Data Release Brackets)
    if (dailyTickerValues?.isMacroDataReleaseDay)
    {
        const formatDayStr = format(nyTime, 'yyyy-MM-dd');
        // Anchor standard 02:00 PM Eastern FOMC announcement time
        const macroReleaseEventTime = parse(`${formatDayStr} 14:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date());

        const lockoutStartBoundary = subMinutes(macroReleaseEventTime, 60);
        const lockoutEndBoundary = addMinutes(macroReleaseEventTime, 30);

        const isInsideDangerousVolatilityWindow = isWithinInterval(nyTime, {
            start: lockoutStartBoundary,
            end: lockoutEndBoundary
        });

        if (isInsideDangerousVolatilityWindow)
        {
            totalPenalties += W.systemicDeductions.systemicMacroLockout; // -50 Points
        }
    }

    // C. Institutional End-Of-Quarter Basket Portfolio Rebalancing (June / December)
    const currentMonth0Based = getMonth(nyTime);
    const currentDayOfMonth = getDate(nyTime);

    const isEndofQuarterRebalancingWindow =
        (currentMonth0Based === 5 && currentDayOfMonth >= 15) ||
        (currentMonth0Based === 11 && currentDayOfMonth >= 15);

    if (isEndofQuarterRebalancingWindow)
    {
        totalPenalties += W.systemicDeductions.globalMacroHeadwindSentry; // -15 Points

        // If asset is crowded by pension fund capital holdings, apply the secondary layer
        if (dailyTickerValues?.sharesInstitutionsPercent >= 85.0)
        {
            totalPenalties += W.systemicDeductions.crowdedRebalancingRiskPenalty; // -10 Points
        }
    }

    return totalPenalties; // Returns accumulated negative values cleanly (e.g. -45)
}




/**
 * CENTRAL MASTER COMPILER ROUTER
 * Invoked continuously by your child UI layout panels to aggregate the complete score.
 */
export function calculateCentralPlanScore(planEntity, liveSpyPlan, liveRSPPlan, liveSectorPlan)
{
    const patternClassification = planEntity.patternConfig.patternClassification;
    const todaysLiveCandles = planEntity.todaysCandles
    // Gating check: Default to 0% score if polling arrays are empty
    if (!todaysLiveCandles || todaysLiveCandles.length === 0) { return { matchScorePercent: 0, status: "AWAITING_INTRADAY_STREAM", metrics: {} }; }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP A: COMPUTE THE SHARED BASE ENVIRONMENT SCORE (TIER 1) [INDEX]
    // ─────────────────────────────────────────────────────────────────────────
    const baseEnvironmentScore = compileSharedBaseEnvironmentMetrics(planEntity, todaysLiveCandles, liveSpyPlan, liveRSPPlan, liveSectorPlan);
    const timeDependentScore = compileTimeDependentMetrics(planEntity, todaysLiveCandles)
    const combinedBaseTime = Math.min((baseEnvironmentScore + timeDependentScore), 50)



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


    const patternScore = Math.min(patternSpecificScore, 50)


    // =======================================================================
    // STEP 3: AGGREGATE SYSTEMIC DEDUCTIONS (MACRO RISK FILTERS)
    // =========================================================================
    // Accumulate all active macro penalties (Fed meetings, negative gamma, breadth decays, lunch hours)
    let totalActiveSystemicPenalties = compileSystemicMacroDeductions(planEntity, todaysLiveCandles, liveSpyPlan, macroEntities);

    // =========================================================================
    // STEP 4: THE ALPHA CONVICTION PERCENTAGE RESOLUTION
    // =========================================================================
    // Combine your two perfectly balanced halves and subtract your risk penalties
    const rawCompiledTotal = combinedBaseTime + patternScore - Math.abs(totalActiveSystemicPenalties);

    // ENFORCE FINAL HARD BOUNDARY CAPPING (Strictly between 0% and 100%)
    const finalizedAlphaScore = Math.min(Math.max(rawCompiledTotal, 0), 100);


    return {
        matchScorePercent: finalizedAlphaScore,
        status: finalizedAlphaScore >= 75 ? "🟢 HIGH_CONVICTION_ALERT" : "🔍 MONITORING_RADAR",

        metrics: {
            baseEnvironmentScore,
            timeDependentScore,
            patternSpecificScore,
            systemicPenaltiesApplied: totalActiveSystemicPenalties,

            livePrice: parseFloat(livePrice.toFixed(2))
        }
    };
}
