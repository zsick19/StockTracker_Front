/**
 * Cold-Boot Analytics Compiler for 3-Day 1-Minute Penny Stock Plans.
 * Computes baseline 1-minute volume norms and historical trailing ATR [INDEX].
 * 
 * @param {Array} clean1MinHistory - Filtered regular hours 1-minute candle array
 * @returns {Object} Pure scalar constants to feed your sub-second live tape engines
 */
export function compileHistoricalOneMinPennyBaselines(clean1MinHistory)
{
    const fallback = { baselineAvgOneMinVolume: 0, historicalAtr: 0.0 };
    if (!clean1MinHistory || clean1MinHistory.length === 0) return fallback;

    // A. LAYER 1: MULTI-DAY VOLUME COMPRESSOR (SUM & DIVIDE) [INDEX]
    // Runs an atomic summation across all 3 days of 1-minute regular hours candles [INDEX]
    const cumulativeVolumeSum = clean1MinHistory.reduce((sum, candle) => sum + candle.Volume, 0);
    const calculatedAvgOneMinVolume = cumulativeVolumeSum / clean1MinHistory.length;

    // B. LAYER 2: HISTORICAL AVERAGE TRUE RANGE (ATR) VOLATILITY RADAR
    let cumulativeTrueRangeSum = 0;

    for (let i = 1; i < clean1MinHistory.length; i++)
    {
        const currentCandle = clean1MinHistory[i];
        const priorCandle = clean1MinHistory[i - 1];

        // Compute True Range across the boundary gap [INDEX]
        const tr1 = currentCandle.HighPrice - currentCandle.LowPrice;
        const tr2 = Math.abs(currentCandle.HighPrice - priorCandle.ClosePrice);
        const tr3 = Math.abs(currentCandle.LowPrice - priorCandle.ClosePrice);

        cumulativeTrueRangeSum += Math.max(tr1, tr2, tr3);
    }

    const computedAtr = clean1MinHistory.length > 1
        ? cumulativeTrueRangeSum / (clean1MinHistory.length - 1)
        : 0.05;

    return {
        // Round to clean scalar integers to maximize sub-second comparison processing speeds [INDEX]
        baselineAvgOneMinVolume: Math.round(calculatedAvgOneMinVolume),
        historicalAtr: parseFloat(computedAtr.toFixed(3))
    };
}
