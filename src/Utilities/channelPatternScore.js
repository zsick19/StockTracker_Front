import { SCORING_WEIGHTS as W } from './scoringWeights';

// =========================================================================
// SUB-TOOL 2: THE HORIZONTAL CHANNEL MATH
// =========================================================================
function scoreChannelPattern(planEntity, livePrice, todaysLiveCandles)
{
    const channel = planEntity.channelPattern;
    if (!channel) return 0;

    const { channelBottom, entryStrikeBuffer, channelTop, channelHeight } = channel;
    let patternScore = 0;

    // A. Check if price has drifted down into your buying buffer bracket
    const isInsideStrikeZone = livePrice <= entryStrikeBuffer && livePrice >= channelBottom;
    if (isInsideStrikeZone)
    {
        patternScore += W.patterns.channel.insideStrikeBufferBonus;
    }

    // B. Check for active floor sweeps (lower wicks breaking support and bouncing)
    const currentCandle = todaysLiveCandles[todaysLiveCandles.length - 1];
    const wasFloorSwept = currentCandle.LowPrice < channelBottom && currentCandle.ClosePrice >= channelBottom;
    if (wasFloorSwept)
    {
        patternScore += W.patterns.channel.floorSweepReclaimBonus;
    }

    // C. Reward high-utility setups with wide ranges
    if (channelHeight >= (livePrice * 0.04))
    {
        patternScore += W.patterns.channel.heightVolatilityBonus;
    }

    return patternScore;
}
