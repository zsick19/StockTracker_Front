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


    const derivativePlotCoordinates = [];
    const rollingSmoothPeriod = 3; // 3-bar moving frame to smooth out single random prints

    for (let i = rollingSmoothPeriod; i < todaysLiveCandles.length; i++)
    {
        const timestamp = todaysLiveCandles[i].Timestamp || todaysLiveCandles[i].t || todaysLiveCandles[i].timestamp;
        const timeLabel = new Date(timestamp).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit', hour12: false });

        // Calculate the derivative: Rate of Change (ROC) vs. the preceding 3-minute baseline block
        const currentVolume = todaysLiveCandles[i].Volume || todaysLiveCandles[i].v || 0;
        const priorVolumeBase = todaysLiveCandles[i - rollingSmoothPeriod].Volume || todaysLiveCandles[i - rollingSmoothPeriod].v || 0;

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
