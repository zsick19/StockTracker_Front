/**
 * Cold-Boot Analytics Compiler for 10-Day 5-Minute Standard Horizontal Channels.
 * Calculates explicit floor-touch frequencies and ceiling distribution matrices.
 * 
 * @param {Object} planConfig - Core Mongoose plan holding channelTop and channelBottom coordinates
 * @param {Array} clean5MinHistory - Filtered regular hours 5-minute candle array
 * @returns {Object} Clean scalar parameters to inject into your memory metrics cache
 */
export function compileHistoricalStandardChannelBaselines(planConfig, clean5MinHistory) {
    const fallback = { staticHistoryTouchCount: 0, ceilingFatigueTouchCount: 0, isChannelHeightViable: false };
    const channel = planConfig.channelPattern;
    
    if (!channel || !clean5MinHistory || clean5MinHistory.length === 0) return fallback;

    const { channelBottom, channelTop } = channel;
    
    // Set precise institutional cushion bounds (0.25% proximity filter)
    const floorCushion = channelBottom * 0.0025;
    const ceilingCushion = channelTop * 0.0025;

    let floorTouches = 0;
    let ceilingTouches = 0;

    // Run a single loop pass down your multi-day timeline
    clean5MinHistory.forEach(candle => {
        // 1. Verify structural floor density
        const isNearFloor = Math.abs(candle.LowPrice - channelBottom) <= floorCushion;
        const didBodyHoldFloor = candle.ClosePrice >= (channelBottom - floorCushion);
        if (isNearFloor && didBodyHoldFloor) floorTouches++;

        // 2. Verify structural ceiling distribution fatigue
        const isNearCeiling = Math.abs(candle.HighPrice - channelTop) <= ceilingCushion;
        const didBodyRejectCeiling = candle.ClosePrice <= (channelTop + ceilingCushion);
        if (isNearCeiling && didBodyRejectCeiling) ceilingTouches++;
    });

    // 3. Verify if the mathematical channel width offers an acceptable profit margin
    // A standard large-cap stock needs a channel width >= 3.5% to clear spread costs and platform slippage
    const totalPercentageCorridorWidth = ((channelTop - channelBottom) / channelBottom) * 100;
    const heightViability = totalPercentageCorridorWidth >= 3.5;

    return {
        staticHistoryTouchCount: floorTouches,
        ceilingFatigueTouchCount: ceilingTouches,
        isChannelHeightViable: heightViability
    };
}
