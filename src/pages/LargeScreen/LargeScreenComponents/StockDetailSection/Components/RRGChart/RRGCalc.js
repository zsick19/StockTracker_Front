/**
 * Calculates the Exponential Moving Average (EMA) of an array.
 * @param {number[]} data - Array of numerical values.
 * @param {number} period - The EMA window length.
 * @returns {number[]} Array of the same length with EMA values (null for prepended warm-up periods).
 */
function calculateEMA(data, period)
{
    const ema = new Array(data.length).fill(null);
    if (data.length < period) return ema;

    const k = 2 / (period + 1);

    // Initialize first data point with Simple Moving Average (SMA)
    let sum = 0;
    for (let i = 0; i < period; i++)
    {
        sum += data[i];
    }
    let currentEma = sum / period;
    ema[period - 1] = currentEma;

    // Calculate remaining values
    for (let i = period; i < data.length; i++)
    {
        currentEma = data[i] * k + currentEma * (1 - k);
        ema[i] = currentEma;
    }
    return ema;
}

/**
 * Transforms raw Alpaca daily candles into RRG (RS-Ratio / RS-Momentum) coordinates.
 * @param {Object[]} sectorCandles - Array of sector bars: [{ t, c }, ...] (t: time/date, c: close price)
 * @param {Object[]} spyCandles - Array of SPY benchmark bars: [{ t, c }, ...]
 * @param {number} [shortPeriod=12] - Short-term trend smoothing window.
 * @param {number} [longPeriod=26] - Long-term trend baseline window.
 * @param {number} [rocPeriod=14] - Momentum lookback window.
 * @returns {Object[]} Tail history containing [{ date, x (RS-Ratio), y (RS-Momentum) }]
 */
export function calculateRRGCoordinates(sectorCandles, spyCandles, shortPeriod = 12, longPeriod = 26, rocPeriod = 14)
{
    // 1. Align data by date matching to ensure mathematical integrity
    const spyMap = new Map(spyCandles.map(c => [c.Timestamp, c.ClosePrice]));
    const alignedData = sectorCandles
        .filter(c => spyMap.has(c.Timestamp))
        .map(c => ({
            date: c.Timestamp,
            sectorClose: c.ClosePrice,
            spyClose: spyMap.get(c.Timestamp)
        }));

    if (alignedData.length < longPeriod + rocPeriod)
    {
        throw new Error(`Insufficient data. Received ${alignedData.length} aligned bars, need at least ${longPeriod + rocPeriod}.`);
    }

    // 2. Compute Raw Relative Strength (Raw RS)
    const rawRS = alignedData.map(d => d.sectorClose / d.spyClose);

    // 3. Smooth Raw RS to generate RS-Ratio (X-Axis)
    // Double-smoothing standardizes trends and centers them around an index value of 100
    const shortEMA = calculateEMA(rawRS, shortPeriod);
    const longEMA = calculateEMA(rawRS, longPeriod);

    const rsRatio = alignedData.map((d, i) =>
    {
        if (shortEMA[i] === null || longEMA[i] === null) return null;
        // Normalize around a base of 100
        return (shortEMA[i] / longEMA[i]) * 100;
    });

    // 4. Calculate Rate of Change (RoC) on RS-Ratio to get RS-Momentum (Y-Axis)
    const rrgCoordinates = alignedData.map((d, i) =>
    {
        // Ensure we have a valid baseline ratio and a historical ratio to compare against
        const currentRatio = rsRatio[i];
        const historicalRatio = rsRatio[i - rocPeriod];

        if (currentRatio === null || historicalRatio === null || !historicalRatio)
        {
            return null;
        }

        // Rate of change formula shifted to fluctuate around a baseline of 100
        const momentum = ((currentRatio - historicalRatio) / historicalRatio) * 100 + 100;

        return {
            Symbol: sectorCandles[0].Symbol,
            x: parseFloat(currentRatio.toFixed(2)),   // RS-Ratio
            y: parseFloat(momentum.toFixed(2))       // RS-Momentum
        };
    }).filter(coord => coord !== null); // Strip out calculation warm-up periods

    return rrgCoordinates;
}
