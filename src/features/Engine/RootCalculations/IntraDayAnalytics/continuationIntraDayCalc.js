import { SCORING_WEIGHTS as W } from '../scoringWeights';

/**
 * Live Session Ingestion Engine: Continuation Momentum.
 * Evaluates trigger breach velocity and combines it with pre-compiled volume dry flags.
 */
export function processContinuationLiveDelta(planEntity, todaysLiveCandles)
{
    const continuation = planEntity.patternConfig;
    const metrics = planEntity.liveAuctionMetrics;

    if (!continuation || !todaysLiveCandles || todaysLiveCandles.length === 0) return 0;
    
    const { entryTrigger, invalidationStop } = continuation;
    const currentCandle = todaysLiveCandles[todaysLiveCandles.length - 1];
    const livePrice = currentCandle.ClosePrice;

    // Hard Failure Risk: If price falls beneath your trailing stop, the trend is broken
    if (livePrice <= invalidationStop) return 0;

    let liveCumulativeScore = 0;

    // 1. Verify if momentum has programmatically breached the breakout gate line
    if (livePrice >= entryTrigger)
    {
        liveCumulativeScore += W.patterns.continuation.triggerBreachBonus; // +30 Points
    }

    // 2. Incorporate your pre-compiled historical trend fanning health and dry supply constraints
    if (metrics.historicalTrendHealthScore >= 75)
    {
        liveCumulativeScore += W.patterns.continuation.strongTrendHealthBonus; // +10 Points
    }

    if (metrics.isPullbackVolumeDry && metrics.baseBreakoutVelocity >= 1.50)
    {
        liveCumulativeScore += W.patterns.continuation.highGrowthVelocityBonus; // +10 Points
    }

    return liveCumulativeScore;
}
