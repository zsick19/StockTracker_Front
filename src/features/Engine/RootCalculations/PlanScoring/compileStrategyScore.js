import { logRuleTrack } from "../masterPrioritizer";
import { SCORING_WEIGHTS as W } from '../ScoringWeights'
import { toZonedTime } from "date-fns-tz";
import { isWithinInterval, parse, format, subMinutes, addMinutes, getDay, getMonth, getDate, differenceInMinutes, getHours, getMinutes, differenceInBusinessDays } from 'date-fns';
import { processPennyChannelLiveDelta } from "../IntraDayAnalytics/pennyStockIntraDayCalc";
import { processStandardChannelLiveDelta } from "../IntraDayAnalytics/channelIntraDayCalc";
import { processContinuationLiveDelta } from "../IntraDayAnalytics/continuationIntraDayCalc";
import { processCascadeLiveDelta } from "../IntraDayAnalytics/cascadeIntraDayCalc";


/**
 * PRODUCTION RISK SENTRY: Systemic Macro Deductions Compiler.
 * Aggregates all active corporate, cyclical, options-driven, and broad index 
 * distribution penalties completely headlessly inside your browser's memory [INDEX].
 * 
 * @param {Object} planEntity - Fully hydrated stock plan document from cache
 * @param {Array} todaysLiveCandles - Today's streaming regular session candle array [INDEX]
 * @returns {number} The absolute cumulative point penalties active (Returns a clean negative integer)
 */
export function compilePatternSpecificScore(planEntity, todaysLiveCandles, liveSpyPlan, provideDescriptions, auditLedger)
{
    const CATEGORYNAME = 'STRATEGY'
    const { dailyCalculatedValues, correlationValues, greatestCorrelation, spyBetaValue } = planEntity.planConfig;
    const { patternClassification } = planEntity.patternConfig
    const stockAnalysisInfo = planEntity.stockInfo

    const livePrice = todaysLiveCandles[todaysLiveCandles.length - 1].ClosePrice;
    let patternStrategyScore = 0;

    if (patternClassification === 'channel')
    {

        if (planEntity.patternConfig.channelType === "PENNY_STOCK_SCALP")
        {
            patternStrategyScore = processPennyChannelLiveDelta(planEntity, livePrice, todaysLiveCandles, provideDescriptions, auditLedger);

        } else if (planEntity.patternConfig.channelType === 'MULTIDAY_SPACED')
        {
            patternStrategyScore = processStandardChannelLiveDelta(planEntity, todaysLiveCandles);
        }
    } else if (patternClassification === 'continuation')
    {
        patternStrategyScore = processContinuationLiveDelta(planEntity, todaysLiveCandles);
    } else if (patternClassification === 'cascade')
    {
        patternStrategyScore = processCascadeLiveDelta(planEntity, todaysLiveCandles);
    }


    // =========================================================================
    // ⏱️ 6. OPTION EXPIRATION TIME-DECAY CYCLES 
    // =========================================================================
    if (patternStrategyScore !== 0 && liveSpyPlan && dailyCalculatedValues && correlationValues)
    {
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


                const liquidityFracture = staticPreCompiledIndicators?.liquidityFractureRatio || 1.0;

                // Isolate individual stock options wall metrics [INDEX]
                const stockPutWall = planEntity.optionsConfig?.weekly?.putWall || 0;

                const isStockAtItsOwnPutWall = stockPutWall > 0 && (Math.abs(livePrice - stockPutWall) / stockPutWall <= 0.0035);



                // ─────────────────────────────────────────────────────────────────────
                // CONDITION 1: THE IDIOSYNCRATIC VELOCITY SHIELD (LOW BETA EXEMPTION) [INDEX]
                // ─────────────────────────────────────────────────────────────────────
                const isIdiosyncraticHaven = isCurrentlyDecoupled || stockBeta <= 0.85;

                if (isIdiosyncraticHaven)
                {
                    // Asset is insulated from broad index liquidations. Award protection bonus straight to strategyTotal! [INDEX]
                    patternStrategyScore += 15;
                    if (provideDescriptions)
                    {
                        const UIDescription = 'Idiosyncratic Shield: Low-Beta Asset Insulated from Index Volatility [INDEX]'
                        logRuleTrack(auditLedger, 'Index Put Wall Sentry', 15, 'STRATEGY', UIDescription);
                    }
                    // If it is early in the week, this shield completely bypasses the macro penalty!
                }

                // ─────────────────────────────────────────────────────────────────────
                // TIMING CORRIDOR ROUTING GATE
                // ─────────────────────────────────────────────────────────────────────
                if (isLateCycle)
                {
                    // Thursday or Friday: Time-decay leverage forces a defensive pinning floor [INDEX]
                    let lateCyclePinningBonus = 15; // Baseline institutional backing value

                    // ─────────────────────────────────────────────────────────────────────
                    // CONDITION 2: THE COALIGNED PUT WALL CONVERGENCE (DUAL-WALL LOCK) [INDEX]
                    // ─────────────────────────────────────────────────────────────────────
                    if (isStockAtItsOwnPutWall)
                    {
                        // Both stock and index strike options support walls simultaneously. Double the reward asymmetry! [INDEX]
                        lateCyclePinningBonus += 15; // Total cumulative bonus scales to +30 points [INDEX]

                        patternStrategyScore += lateCyclePinningBonus; // FIXED: Routed directly to strategyTotal instead of penalties! [INDEX]
                        if (provideDescriptions)
                        {
                            const UIDescription = 'DUAL-WALL LOCK: SPY and Individual Stock striking Put Walls Simultaneously [INDEX]'
                            logRuleTrack(auditLedger, 'Index Put Wall Sentry', lateCyclePinningBonus, 'STRATEGY', UIDescription);
                        }
                    } else
                    {
                        // Standard late-week market maker pinning support
                        patternStrategyScore += lateCyclePinningBonus; // FIXED: Routed directly to strategyTotal instead of penalties! [INDEX]
                        if (provideDescriptions)
                        {
                            const UIDescription = 'Late-Cycle SPY Put Wall Pinning: Market-Maker Institutional Floor Support'
                            logRuleTrack(auditLedger, 'Index Put Wall Sentry', lateCyclePinningBonus, 'STRATEGY', UIDescription);
                        }
                    }
                }
            }
        }

    }



    return patternStrategyScore
}