/**
 * Isolated Authoritative Trade Array Processor.
 * Ingests a raw array of Alpaca REST trades, extracts true velocity 
 * and volume metrics over the real data footprint, and returns pure scalar values.
 * 
 * @param {Array} alpacaTradesArray - Raw historical trade prints: [{ p: Number, s: Number, t: String }]
 * @returns {Object} Clean, calculated execution constants for your cache overwrite
 */
export function processAuthoritativeTradesArray(alpacaTradesArray)
{
    if (alpacaTradesArray.length === 0)
    {
        return {
            auditedTicksPerSecond: 0.0,
            auditedRollingVolume: 0,
            lastTradePrice: 0.00,
            hasDataFootprint: false
        };
    }

    let totalVolumeAccumulated = 0;
    const totalTicksCount = alpacaTradesArray.length;

    // 1. Accumulate total share volume size via a fast loop pass
    alpacaTradesArray.forEach(trade => { totalVolumeAccumulated += trade.Size; });

    // Extract the most recent settled print to act as your live price anchor
    const lastTradeIndex = totalTicksCount - 1;
    const latestTradePrice = alpacaTradesArray[lastTradeIndex].Price; // 'p' is Price

    // 2. COMPUTE THE TRUE ACTIVE TIME FOOTPRINT
    const earliestTimestampMS = new Date(alpacaTradesArray[0].Timestamp).getTime(); // 't' is Timestamp
    const latestTimestampMS = new Date(alpacaTradesArray[lastTradeIndex].Timestamp).getTime();

    // Calculate total seconds elapsed between the first and last printed trade inside the file
    const elapsedSecondsDistance = (latestTimestampMS - earliestTimestampMS) / 1000;

    // Defensive Cushion: If all trades occurred in the same second, default the window to 1.0 to prevent a Divide-by-Zero crash
    const trueActiveWindowSeconds = elapsedSecondsDistance > 0 ? elapsedSecondsDistance : 1.0;

    // 3. EXTRACT TRUE VELOCITY (Ticks Per Second)
    const exactTicksPerSecond = totalTicksCount / trueActiveWindowSeconds;

    return {
        auditedTicksPerSecond: parseFloat(exactTicksPerSecond.toFixed(1)),
        auditedRollingVolume: totalVolumeAccumulated,
        lastTradePrice: parseFloat(latestTradePrice.toFixed(2)),
        hasDataFootprint: true
    };
}

