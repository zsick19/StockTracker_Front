// =========================================================================
// SUB-TOOL 4: THE CONTINUATION MOMENTUM MATH
// =========================================================================
function scoreContinuationPattern(planEntity, livePrice)
{
    const continuation = planEntity.continuationPattern;
    if (!continuation) return 0;

    const { entryTrigger, invalidationStop, trendHealthScore, calculatedDailyGrowthRate } = continuation;
    let patternScore = 0;

    // A. Trigger fires the exact millisecond momentum clears the breakout gate line
    if (livePrice >= entryTrigger)
    {
        patternScore += W.patterns.continuation.triggerBreachBonus;
    }

    // B. Check the underlying fundamental structure velocity
    if (trendHealthScore >= 80) patternScore += W.patterns.continuation.strongTrendHealthBonus;
    if (calculatedDailyGrowthRate >= 2.5) patternScore += W.patterns.continuation.highGrowthVelocityBonus;

    // C. Hard Trailing Failure Stop Filter
    if (livePrice <= invalidationStop)
    {
        patternScore += W.patterns.continuation.trailingStopBreachPenalty;
    }

    return patternScore;
}
