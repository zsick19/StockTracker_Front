/**
 * Cold-Boot Analytics Compiler for 10-Day 5-Minute Continuation Momentum Plans.
 * Extracts trend fanning health metrics and volume-dry pullback structures.
 * 
 * @param {Object} planConfig - Core Mongoose plan containing continuation parameter goals
 * @param {Array} clean5MinHistory - Filtered regular hours 5-minute candle array
 * @returns {Object} High-utility scalar constants to seed your memory metrics cache
 */
export function compileHistoricalContinuationBaselines(planConfig, clean5MinHistory)
{
    const fallback = { historicalTrendHealthScore: 50, isPullbackVolumeDry: false, baseBreakoutVelocity: 0 };

    if (!clean5MinHistory || clean5MinHistory.length < 50) return fallback;

    let totalUpwardVolume = 0;
    let totalDownwardVolume = 0;
    let upwardCandleCount = 0;
    let downwardCandleCount = 0;

    // 1. ANCHOR A: VOLUME INFLOW DISCOVERY
    // Scan the historical data blocks to evaluate volume characteristics split by candle type
    clean5MinHistory.forEach(candle =>
    {
        const isGreenCandle = candle.ClosePrice > candle.OpenPrice;

        if (isGreenCandle)
        {
            totalUpwardVolume += candle.Volume;
            upwardCandleCount++;
        } else
        {
            totalDownwardVolume += candle.Volume;
            downwardCandleCount++;
        }
    });

    // Compute average institutional volume size on expansion legs vs compression pullbacks
    const avgUpwardBarVolume = upwardCandleCount > 0 ? totalUpwardVolume / upwardCandleCount : 1;
    const avgDownwardBarVolume = downwardCandleCount > 0 ? totalDownwardVolume / downwardCandleCount : 1;

    // If the average volume on red consolidation bars is smaller than green expansion bars,
    // it mathematically proves that institutions are holding positions—supply is dry!
    const isPullbackDry = avgDownwardBarVolume < (avgUpwardBarVolume * 0.75);

    // 2. ANCHOR B: RECENT TREND STRUCTURE EXPANSION SPEED
    // Measure closing velocities across yesterday's session blocks
    const trailingCluster = clean5MinHistory.slice(-78); // Isolates roughly 1 regular session of 5-min bars
    let trendHealth = 50;

    if (trailingCluster.length > 0)
    {
        const firstClose = trailingCluster[0].ClosePrice;
        const finalClose = trailingCluster[trailingCluster.length - 1].ClosePrice;

        // Simple linear price slope velocity score
        const totalSessionDriftPct = ((finalClose - firstClose) / firstClose) * 100;

        if (totalSessionDriftPct > 0)
        {
            trendHealth = Math.min(Math.round(50 + (totalSessionDriftPct * 10)), 100);
        } else
        {
            trendHealth = Math.max(Math.round(50 + (totalSessionDriftPct * 10)), 10);
        }
    }

    return {
        historicalTrendHealthScore: trendHealth,
        isPullbackVolumeDry: isPullbackDry,
        baseBreakoutVelocity: parseFloat((avgUpwardBarVolume / avgDownwardBarVolume).toFixed(2))
    };
}
