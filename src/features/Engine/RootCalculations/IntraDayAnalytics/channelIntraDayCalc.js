import { SCORING_WEIGHTS as W } from '../ScoringWeights';
/**
 * Live Session Ingestion Engine: Standard Horizontal Channel.
 * Tracks live floor wicks and updates cumulative touch density values without array loops.
 */
export function processStandardChannelLiveDelta(planEntity, todaysLiveCandles)
{
    const channel = planEntity.patternConfig;
    const metrics = planEntity.liveAuctionMetrics;

    if (!channel || !todaysLiveCandles || todaysLiveCandles.length === 0) return 0;

    const { channelBottom, entryStrikeBuffer } = channel;

    const currentCandle = todaysLiveCandles[todaysLiveCandles.length - 1];
    const livePrice = currentCandle.ClosePrice;


    // Hard Sentry Gate: Price must stay inside your lower buying corridor bracket
    if (livePrice > entryStrikeBuffer || livePrice < channelBottom) return 0;

    let liveCumulativeScore = W.patterns.channel.insideStrikeBufferBonus; // +25 Base Points

    // 1. Evaluate your pre-compiled historical support density backing
    if (metrics.staticHistoryTouchCount >= 4 && metrics.isChannelHeightViable)
    {
        liveCumulativeScore += W.patterns.channel.heightVolatilityBonus; // +10 Points
    }

    // 2. Track real-time live floor sweeps (Lower shadow absorption walls)
    const supportCushion = channelBottom * 0.0025;
    const isLiveWickSweepingFloor = currentCandle.LowPrice < channelBottom;
    const isLiveBodyReclaimingFloor = currentCandle.ClosePrice >= (channelBottom - supportCushion);

    if (isLiveWickSweepingFloor && isLiveBodyReclaimingFloor)
    {
        liveCumulativeScore += W.patterns.channel.floorSweepReclaimBonus; // +15 Points
    }

    return liveCumulativeScore;
}
