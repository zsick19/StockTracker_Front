import { SCORING_WEIGHTS as W } from './ScoringWeights'
import { processPennyChannelLiveDelta } from './IntraDayAnalytics/pennyStockIntraDayCalc';
import { processCascadeLiveDelta } from './IntraDayAnalytics/cascadeIntraDayCalc';
import { processContinuationLiveDelta } from './IntraDayAnalytics/continuationIntraDayCalc';
import { processStandardChannelLiveDelta } from './IntraDayAnalytics/channelIntraDayCalc';
import { isWithinInterval, parse, format, subMinutes, addMinutes, getDay, getMonth, getDate, differenceInMinutes, getHours, getMinutes, differenceInBusinessDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { compileSharedBaseEnvironmentMetrics } from './PlanScoring/compileBaseScore';
import { compileTimeDependentMetrics } from './PlanScoring/compileTimeScore';
import { compileSystemicMacroDeductions } from './PlanScoring/compilePenaltiesScore';
import { compilePatternSpecificScore } from './PlanScoring/compileStrategyScore';


/**
 * CENTRAL MASTER COMPILER ROUTER
 * Invoked continuously by your child UI layout panels to aggregate the complete score.
 */
export function calculateCentralPlanScore(planEntity, liveSpyPlan, liveRSPPlan, liveSectorPlan, provideDescriptions)
{
    const auditLedger = { BASE: [], TIME: [], STRATEGY: [], PENALTIES: [], OFF_RADAR: [] }
    const patternClassification = planEntity.patternConfig.patternClassification;
    const todaysLiveCandles = planEntity.todaysCandles
    const livePrice = planEntity.mostRecentPrice || todaysLiveCandles[todaysLiveCandles.length - 1].ClosePrice;

    // =========================================================================
    // 🛑 DYNAMIC GATING RADAR SENTRY: OMIT OFF-TARGET UI OVER-STIMULATION
    // =========================================================================
    if (!planEntity.todaysCandles || planEntity.todaysCandles.length === 0)
    {
        logRuleTrack(auditLedger, 'Missing Information', 0, 'OFF_RADAR', 'Missing Intra Day Candles')
        return { matchScorePercent: 0, status: "AWAITING_INTRADAY_STREAM", metrics: {} };
    }

    const lowerAllowedBoundary = planEntity.planConfig.plan.stopLossPrice;
    const upperAllowedBoundary = planEntity.planConfig.plan.exitPrice * 1.02;
    if (livePrice < lowerAllowedBoundary || livePrice > upperAllowedBoundary)
    {
        let reason
        if (livePrice < lowerAllowedBoundary) reason = `Price $${livePrice} is below the stoploss price $${lowerAllowedBoundary.toFixed(2)}.`
        else if (livePrice > upperAllowedBoundary) reason = `Price $${livePrice} has exceeded the planned exit price $${upperAllowedBoundary.toFixed(2)}.`

        logRuleTrack(auditLedger, 'Out Of Target Range', 0, 'OFF_RADAR', reason)

        return {
            matchScorePercent: 0,
            status: "RADAR_STANDBY: OFF_TARGET_ZONE",
            metrics: {
                baseEnvironmentScore: 0,
                patternSpecificScore: 0,
                systemicPenaltiesApplied: 0,
                livePrice: parseFloat(livePrice.toFixed(2)),
            },
            positionPricingMetrics: null,
            auditLedger
        };
    }





    // ─────────────────────────────────────────────────────────────────────────
    // STEP A: COMPUTE THE SHARED BASE ENVIRONMENT SCORE (TIER 1) 
    // ─────────────────────────────────────────────────────────────────────────
    const baseEnvironmentScore = compileSharedBaseEnvironmentMetrics(planEntity, todaysLiveCandles, liveSpyPlan, liveRSPPlan, liveSectorPlan, provideDescriptions, auditLedger);
    const timeDependentScore = compileTimeDependentMetrics(planEntity, todaysLiveCandles, provideDescriptions, auditLedger);
    // ─────────────────────────────────────────────────────────────────────────
    // STEP B: ROUTE TO SPECIFIC PATTERN SUB-ENGINES (TIER 2) 
    // ─────────────────────────────────────────────────────────────────────────
    const strategyScore = compilePatternSpecificScore(planEntity, todaysLiveCandles, liveSpyPlan, provideDescriptions, auditLedger)
    // =======================================================================
    // STEP C: AGGREGATE SYSTEMIC DEDUCTIONS (MACRO RISK FILTERS)
    // =========================================================================
    const totalActiveSystemicPenalties = compileSystemicMacroDeductions(planEntity, todaysLiveCandles, liveSpyPlan, liveRSPPlan, provideDescriptions, auditLedger);





    // =========================================================================
    // STEP C: RUNTIME ASYMMETRIC RISK/REWARD POSITION SIZER
    // =========================================================================
    // Locate the first major volume shelf blocking our upside runway
    const targetFloorLine = planEntity.planConfig.plan.stopLossPrice
    const targetCeilingLine = planEntity.planConfig.plan.exitPrice
    const shelves = planEntity.metricConfig?.vpSupportResistance.overHeadResistance || [];
    const priceAscendingShelves = [...shelves].sort((a, b) => a.priceLevel - b.priceLevel);
    const immediateCeilingShelf = priceAscendingShelves.find(shelf => shelf.priceLevel > livePrice) || { priceLevel: livePrice * 1.05 };

    // Calculate percentage deltas relative to current price ticks [INDEX]
    const rewardPct = ((immediateCeilingShelf.priceLevel - livePrice) / livePrice) * 100;
    const riskPct = targetFloorLine > 0 ? ((livePrice - targetFloorLine) / livePrice) * 100 : 0;

    // Calculate absolute dollar metrics based on a standard $1,000 total trade position [INDEX]
    const allocationBaseline = 1000;
    const totalSharesAllocated = allocationBaseline / livePrice;

    const dollarAmountReward = (immediateCeilingShelf.priceLevel - livePrice) * totalSharesAllocated;
    const dollarAmountRisk = targetFloorLine > 0 ? (livePrice - targetFloorLine) * totalSharesAllocated : 0;


    // =========================================================================
    // STEP 4: THE ALPHA CONVICTION PERCENTAGE RESOLUTION
    // =========================================================================    
    const combinedBaseTime = Math.min((baseEnvironmentScore + timeDependentScore), 50)
    const patternScore = Math.min(strategyScore, 50)
    const rawCompiledTotal = combinedBaseTime + patternScore - Math.abs(totalActiveSystemicPenalties);

    // ENFORCE FINAL HARD BOUNDARY CAPPING (Strictly between 0% and 100%)
    const finalizedAlphaScore = Math.min(Math.max(rawCompiledTotal, 0), 100);
    return {
        matchScorePercent: finalizedAlphaScore,
        status: finalizedAlphaScore >= 75 ? "HIGH CONVICTION" : "MONITORING",
        metrics: {
            baseEnvironmentScore,
            timeDependentScore,
            patternSpecificScore: patternScore,
            systemicPenaltiesApplied: totalActiveSystemicPenalties,
            livePrice: parseFloat(livePrice.toFixed(2))
        },
        positionPricingMetrics: {
            immediateResistanceLevel: parseFloat(immediateCeilingShelf.priceLevel.toFixed(2)),
            rewardPercentageDelta: parseFloat(rewardPct.toFixed(2)),
            riskPercentageDelta: parseFloat(riskPct.toFixed(2)),
            rewardDollarAllocation: parseFloat(dollarAmountReward.toFixed(2)),
            riskDollarAllocation: parseFloat(dollarAmountRisk.toFixed(2))
        },
        auditLedger
    };

}
export function logRuleTrack(auditLedger, ruleName, pointsApplied, category, details) { auditLedger[category].push({ ruleName, pointsApplied, details }) }
