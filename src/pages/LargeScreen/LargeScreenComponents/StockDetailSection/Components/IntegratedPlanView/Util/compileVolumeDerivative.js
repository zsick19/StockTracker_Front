/**
 * PRODUCTION COMPILER: compileVolumeDerivativeData
 * Computes a rolling 1-minute rate-of-change (ROC) derivative over today's 
 * live candle array to track volume momentum acceleration and exhaustion.
 * 
 * @param {Array} todaysLiveCandles - Array of streaming intraday regular session bars
 * @returns {Array} Flat JSON collection of matching nodes: [{ timeLabel: "09:36", volumeVelocity: +15400 }]
 */
export function compileVolumeDerivative(todaysLiveCandles)
{
    if (!todaysLiveCandles || todaysLiveCandles.length < 4) return [];

    // Filter out overnight noise to anchor your time-series analysis to the RTH open cross
    const cleanRthCandles = todaysLiveCandles.filter(candle =>
    {
        const rawTimestamp = candle.Timestamp || candle.t || candle.timestamp;
        if (!rawTimestamp) return false;
        const timeStr = new Date(rawTimestamp).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false });
        return timeStr >= "09:30:00" && timeStr <= "10:30:00"; // Isolate the first opening hour
    });

    const derivativePlotCoordinates = [];
    const rollingSmoothPeriod = 3; // 3-bar moving frame to smooth out single random prints

    for (let i = rollingSmoothPeriod; i < cleanRthCandles.length; i++)
    {
        const timestamp = cleanRthCandles[i].Timestamp || cleanRthCandles[i].t || cleanRthCandles[i].timestamp;
        const timeLabel = new Date(timestamp).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit', hour12: false });

        // Calculate the derivative: Rate of Change (ROC) vs. the preceding 3-minute baseline block
        const currentVolume = cleanRthCandles[i].Volume || cleanRthCandles[i].v || 0;
        const priorVolumeBase = cleanRthCandles[i - rollingSmoothPeriod].Volume || cleanRthCandles[i - rollingSmoothPeriod].v || 0;

        // Velocity Delta is the absolute difference in share accumulation rate per minute
        const velocityDeltaChange = currentVolume - priorVolumeBase;

        derivativePlotCoordinates.push({
            timeLabel,
            volumeVelocity: velocityDeltaChange, // Positive = Accelerating 🟢, Negative = Exhaustion 🔴
            rawBarVolume: currentVolume
        });
    }

    return derivativePlotCoordinates;
}
