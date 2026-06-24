import { SCORING_WEIGHTS as W } from '../ScoringWeights';

/**
 * Live Session Ingestion Engine: Penny Stock Channel Scalper.
 * Analyzes the most recent 1-minute regular session candles to detect 
 * stop-runs and sudden institutional volume walls in mid-air.
 * 
 * @param {Object} planEntity - Active plan configuration document from your Mongoose collection
 * @param {number} livePrice - Today's streaming sub-second market price
 * @param {Array} todaysLiveCandles - Today's streaming regular-session 1-minute candle array
 * @returns {number} High-velocity pattern structural score (Max 50 points)
 */
export function processPennyChannelLiveDelta(planEntity, livePrice, todaysLiveCandles)
{
    const channel = planEntity.patternConfig;
    const metrics = planEntity.liveAuctionMetrics;

    if (!channel || !todaysLiveCandles || todaysLiveCandles.length === 0) { return 0; }

    console.log(channel)
    const { channelBottom, entryStrikeBuffer, requiredVolumeMultiplier } = channel;
    let livePatternScore = 0;

    // --- GATE 1: THE BRACKET PRICE SENTRY ---
    // Price must be sitting within your lower buying corridor buffer to activate calculations
    if (livePrice > entryStrikeBuffer || livePrice < (channelBottom * 0.95)) { return 0; }

    // Award base points for sitting directly inside your target strike zone box
    livePatternScore += W.patterns.channel.insideStrikeBufferBonus; // +25 Base Points

    // --- ANCHOR A: SUB-MINUTE MANIPULATION FLUSH RECLAIM CHECK ---
    // Isolate only the last 5 candles (the past 5 minutes of live regular-session trading tape) [INDEX]
    const microPastFiveMinutesCluster = todaysLiveCandles.slice(-5);

    // Check if any of those recent 1-minute bars executed a sharp stop-run trap beneath support
    const didRecentCandleExecuteStopRun = microPastFiveMinutesCluster.some(candle =>
    {
        const didWickBreakFloor = candle.LowPrice < channelBottom;
        const didBodyReclaimFloor = candle.ClosePrice >= channelBottom;

        // Calculate internal candle wick balance (CLV)
        const spread = candle.HighPrice - candle.LowPrice;
        const clv = spread === 0 ? -1 : ((candle.ClosePrice - candle.LowPrice) - (candle.HighPrice - candle.ClosePrice)) / spread;

        // Returns true if market makers ran retail stops and immediately snapped it back inside
        return didWickBreakFloor && didBodyReclaimFloor && clv >= 0.60;
    });

    if (didRecentCandleExecuteStopRun)
    {
        livePatternScore += W.patterns.channel.floorSweepReclaimBonus; // +15 Points [INDEX]
    }

    // --- ANCHOR B: REAL-TIME VOLUMETRIC CLIMAX WALL OVERRIDE ---
    const currentActiveOneMinCandle = todaysLiveCandles[todaysLiveCandles.length - 1];

    // Read the static 'baselineAvgOneMinVolume' pre-compiled headlessly by your boot loader [INDEX]
    const targetVolumeClimaxBarrier = metrics.baselineAvgOneMinVolume * requiredVolumeMultiplier;

    // If the active 1-minute candle prints an enormous institutional volume spike right as it touches support,
    // it confirms that real institutional block buyers are actively filling the book! [INDEX]
    if (currentActiveOneMinCandle.Volume >= targetVolumeClimaxBarrier && currentActiveOneMinCandle.LowPrice <= entryStrikeBuffer)
    {
        livePatternScore += W.orderFlow.volumeClimaxWall; // +25 Points (Shared order-flow asset weights) [INDEX]
    }

    // --- ANCHOR C: RANGE REWARD STRUCTURAL VIABILITY ---
    // Pull the pre-compiled viability boolean built on application boot to check corridor width
    if (metrics.historicalAtr >= 0.02 && (channel.channelTop - channelBottom) >= (channelBottom * 0.08))
    {
        livePatternScore += W.patterns.channel.heightVolatilityBonus; // +10 Points
    }

    return livePatternScore;
}
