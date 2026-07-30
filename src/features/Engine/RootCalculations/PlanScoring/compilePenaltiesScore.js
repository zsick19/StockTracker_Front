import { logRuleTrack } from "../masterPrioritizer";
import { SCORING_WEIGHTS as W } from '../ScoringWeights'
import { toZonedTime } from "date-fns-tz";
import { isWithinInterval, parse, format, subMinutes, addMinutes, getDay, getMonth, getDate, differenceInMinutes, getHours, getMinutes, differenceInBusinessDays } from 'date-fns';

/**
 * PRODUCTION RISK SENTRY: Systemic Macro Deductions Compiler.
 * Aggregates all active corporate, cyclical, options-driven, and broad index 
 * distribution penalties completely headlessly inside your browser's memory [INDEX].
 * 
 * @param {Object} planEntity - Fully hydrated stock plan document from cache
 * @param {Array} todaysLiveCandles - Today's streaming regular session candle array [INDEX]
 * @param {Object} liveSpyPlan - The live macro Sentry metadata block from your macro store
 * @param {Object} liveRSPPlan - The raw macro market entity adapter dictionary [INDEX]
 * @returns {number} The absolute cumulative point penalties active (Returns a clean negative integer)
 */
export function compileSystemicMacroDeductions(planEntity, todaysLiveCandles, liveSpyPlan, liveRSPPlan, provideDescriptions, auditLedger)
{
    let totalPenalties = 0;
    const CATEGORYNAME = 'PENALTIES'
    const { dailyCalculatedValues, correlationValues, greatestCorrelation, spyBetaValue, patternClassification } = planEntity.planConfig;
    const stockAnalysisInfo = planEntity.stockInfo

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
    if (stockAnalysisInfo)
    {
        const RULENAME = 'Stock Info'
        if (stockAnalysisInfo.EarningsDate)
        {
            const daysTillEarnings = differenceInBusinessDays(new Date(), stockAnalysisInfo.EarningsDate)
            // A. Corporate Earnings Quiet Window Sentry (T-Minus 5 Days)
            if (daysTillEarnings <= 5 && daysTillEarnings > 0)
            {
                totalPenalties += W.systemicDeductions.preEarningsQuietWindowPenalty; // -15 Points
                if (provideDescriptions)
                {
                    const UIDescription = `Stock is within 5 days of releasing earnings report`
                    logRuleTrack(auditLedger, RULENAME, W.systemicDeductions.preEarningsQuietWindowPenalty, CATEGORYNAME, UIDescription)
                }
            }
        }

        // Audit Optionable Liquidity
        if (stockAnalysisInfo.HasOptions === false && patternClassification !== "continuation")
        {
            totalPenalties += W.stockSpecificCatalysts.illiquidStructurePenalty;
            if (provideDescriptions) 
            {
                const UIDescription = `Asset does not support listed options contracts.`
                logRuleTrack(auditLedger, RULENAME, W.stockSpecificCatalysts.illiquidStructurePenalty, CATEGORYNAME, UIDescription);
            }
        } // Apply Illiquid Structure Penalty


        // Audit 52-Week Structural Drift Location
        if (stockAnalysisInfo.PositionInRangePercent <= 15.0)
        {
            totalPenalties += W.systemicDeductions.structuralWeaknessPenalty;
            if (provideDescriptions)
            {
                const UIDescription = `Current asset price is trading within the bottom 15% of its annual range.`
                logRuleTrack(auditLedger, RULENAME, W.systemicDeductions.structuralWeaknessPenalty, CATEGORYNAME, UIDescription);
            }
        } // Severe structural weakness penalty


        // C. Micro-Cap Order Book Slippage Friction
        const rawMarketCap = stockAnalysisInfo.MarketCap || 0;
        if (rawMarketCap > 0 && rawMarketCap < 250000000)
        {
            totalPenalties += W.stockSpecificCatalysts.microCapSlippagePenalty;
            if (provideDescriptions)
            {
                const UIDescription = `Total equity valuation sits beneath a 250-million-dollar micro-cap ceiling.`
                logRuleTrack(auditLedger, RULENAME, W.stockSpecificCatalysts.microCapSlippagePenalty, CATEGORYNAME, UIDescription);
            }
        } // Micro-Cap Slippage Penalty
    }


    // =========================================================================
    // 🛡️ TRACK 2: BROAD INDEX DISTORTION & LIQUIDITY DRIFTS
    // =========================================================================
    if (liveSpyPlan && dailyCalculatedValues && correlationValues)
    {
        const isMarketInNegativeGammaRegime = liveSpyPlan.mostRecentPrice < liveSpyPlan.planData.gammaFlip;

        if (isMarketInNegativeGammaRegime)
        {
            const stockBeta = spyBetaValue || 1.0;
            const broadCorrelation = correlationValues.SPY?.correlation90Day || 0;
            if (stockBeta >= 1.40 && broadCorrelation >= 0.70)
            {
                totalPenalties += W.systemicGammaGates.highBetaVulnerabilityPenalty; // Severe -40 point protection pass
                const UIDescription = `Broad market is in a negative gamma regime; asset is high-beta and strongly correlated to SPY.`
                if (provideDescriptions) logRuleTrack(auditLedger, 'Systemic Gamma Gates', W.systemicGammaGates.highBetaVulnerabilityPenalty, CATEGORYNAME, UIDescription);
            }

            // High Flying Continuation Setup Vulnerability
            if (planEntity.planConfig.patternClassification === "continuation")
            {
                totalPenalties += W.systemicGammaGates.momentumContinuationRiskPenalty; // Penalize momentum setups
                const UIDescription = `Momentum breakout setup penalized due to high broad market volatility risk.`
                if (provideDescriptions) logRuleTrack(auditLedger, 'Systemic Gamma Gates', W.volumeProfileShelves.highCriticalCliff, CATEGORYNAME, UIDescription);
            }
        }
    }


    // =========================================================================
    // ⏱️ 6. OPTION EXPIRATION TIME-DECAY CYCLES & SEASONAL EVENTS (UPGRADED)
    // =========================================================================
    if (liveSpyPlan && liveSpyPlan.planData?.putWall && planEntity.optionsConfig)
    {

        const spyPutWallFloor = liveSpyPlan.planData?.putWall;
        // Verify if the broad market index is trading within a tight 0.15% cushion of its put wall [INDEX]
        const isSpyAtWeeklyPutWall = Math.abs(liveSpyPlan.mostRecentPrice - spyPutWallFloor) / spyPutWallFloor <= 0.0015;

        if (isSpyAtWeeklyPutWall)
        {
            // Core time calculations using native Date prototype methods to prevent ReferenceErrors
            const currentDayIndex = new Date().getDay(); // 1 = Monday, 2 = Tuesday, ..., 5 = Friday
            const isEarlyCycle = currentDayIndex === 1 || currentDayIndex === 2;
            const isLateCycle = currentDayIndex === 4 || currentDayIndex === 5;

            // Isolate asset-level metrics out of your pre-validated schema profiles

            const stockBeta = spyBetaValue || planEntity.stockInfo?.Beta1Y || 1.0;
            const broadCorrelation = correlationValues?.SPY?.correlation90Day || 0;
            const isCurrentlyDecoupled = correlationValues?.SPY?.isCurrentlyDecoupled || false;


            const liquidityFracture = 1
            // staticPreCompiledIndicators?.liquidityFractureRatio || 1.0;

            // Isolate individual stock options wall metrics [INDEX]
            const stockPutWall = planEntity.optionsConfig?.weekly?.putWall || 0;

            const isStockAtItsOwnPutWall = stockPutWall > 0 && (Math.abs(livePrice - stockPutWall) / stockPutWall <= 0.0035);

            // ─────────────────────────────────────────────────────────────────────
            // CONDITION 1: THE IDIOSYNCRATIC VELOCITY SHIELD (LOW BETA EXEMPTION) TIMING CORRIDOR ROUTING GATE
            // ─────────────────────────────────────────────────────────────────────
            const isIdiosyncraticHaven = isCurrentlyDecoupled || stockBeta <= 0.85;
            if (isEarlyCycle)
            {
                // If the stock is flagged as a safe haven, bypass the early-cycle penalty entirely [INDEX]
                if (!isIdiosyncraticHaven)
                {
                    // Check if the stock is a high-beta momentum name with an expanding liquid spread [INDEX]
                    const isHighBetaVulnerabilityActive = stockBeta >= 1.40 && broadCorrelation >= 0.70 && liquidityFracture >= 3.5;

                    if (isHighBetaVulnerabilityActive)
                    {
                        // CONDITION 3: HIGH-BETA LIQUIDITY FRACTURE RISK (THE AVALANCHE WARNING)
                        // Double the standard early-cycle penalty to protect capital from cascading flushes
                        totalPenalties += 80;
                        if (provideDescriptions)
                        {
                            const UIDescription = 'CRITICAL AVALANCHE WARNING: High-Beta + Fractured Order Book During Index Put Wall Test'
                            logRuleTrack(auditLedger, 'Index Put Wall Sentry', 80, CATEGORYNAME, UIDescription);
                        }
                    } else
                    {
                        // Standard early-cycle index vulnerability penalty
                        totalPenalties += 40;
                        if (provideDescriptions)
                        {
                            const UIDescription = 'Early-Cycle SPY Put Wall Test: Vulnerable Broad Market Structure'
                            logRuleTrack(auditLedger, 'Index Put Wall Sentry', 40, CATEGORYNAME, UIDescription);
                        }
                    }
                }
            }
        }
    }

    // =========================================================================
    // 🛡️ TRACK 3: BREADTH DECAY METRICS (SPY VS RSP FAKEOUTS)
    // =========================================================================
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
            // If headline market looks green but 400+ equal-weighted stocks are bleeding

            const betaValue = spyBetaValue || planEntity.stockInfo?.Beta1Y || 1
            if ((spyReturn - rspReturn) >= 0.75 && betaValue >= 1.15)
            {
                totalPenalties += W.systemicDeductions.breadthDecayPenalty; // -20 Points
                if (provideDescriptions)
                {
                    const UIDescription = 'SPY is falsely being elevated by MAG8 while equal weighted stocks are crashing.'
                    logRuleTrack(auditLedger, 'SPY vs RSP', W.systemicDeductions.breadthDecayPenalty, CATEGORYNAME, UIDescription);
                }
            }
        }
    }


    // =========================================================================
    // 🛡️ TRACK 4: CALENDAR EVENT TRAPS 
    // =========================================================================
    // B. Scheduled Macro Economic Volatility Gates (Fed / CPI Data Release Brackets)
    if (dailyCalculatedValues?.isMacroDataReleaseDay)
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
            if (provideDescriptions)
            {
                const UIDescription = 'Scheduled Macro Economic Volatility Gates (Fed / CPI Data Release Brackets)'
                logRuleTrack(auditLedger, 'Macro Data Release', 40, CATEGORYNAME, UIDescription);

            }
        }
    }

    // C. Institutional End-Of-Quarter Basket Portfolio Rebalancing (June / December)
    const systemDate = new Date();
    const currentMonth0Based = getMonth(systemDate);
    const currentDayOfMonth = getDate(systemDate);

    const isEndOfQuarterRebalancingWindow = (currentMonth0Based === 5 && currentDayOfMonth >= 15) || (currentMonth0Based === 11 && currentDayOfMonth >= 15);
    if (isEndOfQuarterRebalancingWindow)
    {
        if (planEntity.stockInfo?.InstitutionalSharePercent >= 85.0) 
        {
            totalPenalties += W.systemicDeductions.crowdedRebalancingRiskPenalty; // -10 Points
            if (provideDescriptions)
            {
                const UIDescription = 'Institutional End-Of-Quarter Basket Portfolio Rebalancing for high institutional share percent.'
                logRuleTrack(auditLedger, 'Index Put Wall Sentry', 40, CATEGORYNAME, UIDescription);

            }
        }


        totalPenalties += W.systemicDeductions.globalMacroHeadwindSentry; // -15 Points
        if (provideDescriptions)
        {
            const UIDescription = 'Institutional End-Of-Quarter Basket Portfolio Rebalancing'
            logRuleTrack(auditLedger, 'Index Put Wall Sentry', 40, CATEGORYNAME, UIDescription);

        }
    }

    return totalPenalties; // Returns accumulated negative values cleanly (e.g. -45)
}
