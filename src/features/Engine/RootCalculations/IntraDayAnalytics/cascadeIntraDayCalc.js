import { SCORING_WEIGHTS as W } from '../ScoringWeights';

/**
 * Live Session Ingestion Engine: Vertical Cascader.
 * Evaluates the fresh candle stream to determine slope deceleration in mid-air.
 */
export function processCascadeLiveDelta(planEntity, todaysLiveCandles)
{
    const cascade = planEntity.cascadePattern;
    const metrics = planEntity.liveAuctionMetrics;

    if (!cascade || !todaysLiveCandles || todaysLiveCandles.length === 0) return 0;

    const { priceFloor, priceCeiling, priceIdeal } = cascade.projection;
    const currentCandle = todaysLiveCandles[todaysLiveCandles.length - 1];
    const livePrice = currentCandle.ClosePrice;

    // Hard Sentry Gate: Price must sit inside your macro target buy block
    if (livePrice < priceFloor || livePrice > priceCeiling) return 0;

    let liveCumulativeScore = W.patterns.cascade.insideTargetBoxBonus; // +25 Base Points

    // 1. Verify proximity to your optimized institutional value coordinate
    const distanceToIdealPct = Math.abs(livePrice - priceIdeal) / priceIdeal;
    if (distanceToIdealPct <= 0.005)
    {
        liveCumulativeScore += W.patterns.cascade.approachingIdealPriceBonus; // +15 Points
    }

    // 2. Compute live session slope velocity versus your static historical cliff
    if (todaysLiveCandles.length >= 6)
    {
        const openingPriceOfSession = todaysLiveCandles[0].OpenPrice;
        const currentSessionDropDelta = Math.abs(openingPriceOfSession - livePrice);

        // If today's intraday cascade speed is structurally smaller than yesterday's historical drop velocity,
        // it mathematically confirms the velocity is exhausting—unlocking the air pocket bonus!
        if (currentSessionDropDelta < metrics.trailingDescentVelocity)
        {
            liveCumulativeScore += W.patterns.cascade.vacuumAirPocketBonus; // +10 Points
        }
    }

    return liveCumulativeScore;
}
