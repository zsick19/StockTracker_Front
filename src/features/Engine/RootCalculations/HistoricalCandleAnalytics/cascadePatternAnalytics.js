/**
 * Cold-Boot Analytics Compiler for 10-Day 5-Minute Swing Plans.
 * Extracts support touch densities, descent speeds, and volume cliffs.
 * 
 * @param {Object} planConfig - Core Mongoose plan definition holding your target entry/exit lines
 * @param {Array} clean5MinHistory - Filtered regular hours 5-minute candle array
 * @returns {Object} Static baseline constants to seed your memory metrics cache
 */
export function compileHistoricalFiveMinPlanBaselines(planConfig, clean5MinHistory)
{
    const fallback = { staticHistoryTouchCount: 0, volumeCliffPrice: 0, trailingDescentVelocity: 0 };
    if (!clean5MinHistory || clean5MinHistory.length === 0) return fallback;

    // A. LAYER 1: MULTI-DAY SUPPORT TOUCH DENSITY COMPILER
    let touchCount = 0;
    const targetFloorLine = planConfig.channelPattern?.channelBottom || planConfig.cascadePattern?.projection?.priceFloor || 0;
    const proximityCushionCents = targetFloorLine * 0.0020; // 0.20% tight buffer check

    if (targetFloorLine > 0)
    {
        clean5MinHistory.forEach(candle =>
        {
            const isNearFloor = Math.abs(candle.LowPrice - targetFloorLine) <= proximityCushionCents;
            const didBodyHold = candle.ClosePrice >= (targetFloorLine - proximityCushionCents);
            if (isNearFloor && didBodyHold) touchCount++;
        });
    }

    // B. LAYER 2: OVERHEAD VOLUME CONCENTRATION CLIFF LOCATOR
    let maxHistoricalVolume = 0;
    let volumeClimaxPrice = clean5MinHistory[clean5MinHistory.length - 1].ClosePrice;

    clean5MinHistory.forEach(candle =>
    {
        if (candle.Volume > maxHistoricalVolume)
        {
            maxHistoricalVolume = candle.Volume;
            volumeClimaxPrice = candle.ClosePrice;
        }
    });

    // C. LAYER 3: HISTORICAL SLOPE MOMENTUM SPEED (Last 2 hours of yesterday)
    let descentVelocity = 0;
    if (clean5MinHistory.length >= 24)
    {
        const lastTwoHoursCluster = clean5MinHistory.slice(-24);
        const openingPriceOfCluster = lastTwoHoursCluster[0].OpenPrice;
        const closingPriceOfCluster = lastTwoHoursCluster[lastTwoHoursCluster.length - 1].ClosePrice;
        descentVelocity = parseFloat((openingPriceOfCluster - closingPriceOfCluster).toFixed(2));
    }

    return {
        staticHistoryTouchCount: touchCount,
        volumeCliffPrice: parseFloat(volumeClimaxPrice.toFixed(2)),
        trailingDescentVelocity: descentVelocity
    };
}
