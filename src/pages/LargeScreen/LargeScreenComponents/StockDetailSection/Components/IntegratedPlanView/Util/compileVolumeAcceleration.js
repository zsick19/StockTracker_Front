/**
 * PRODUCTION COMPILER: compileVolumeAccelerationDerivative
 * Computes the second derivative of intraday candle volume (d2V/dt2) 
 * to track real-time institutional momentum acceleration and deceleration [INDEX].
 * 
 * @param {Array} todaysLiveCandles - Array of streaming intraday regular session bars
 * @returns {Array} Flat JSON collection: [{ timeLabel: "09:36", acceleration: +4500 }]
 */
export function compileVolumeAccelerationDerivative(todaysLiveCandles)
{
    if (!todaysLiveCandles || todaysLiveCandles.length < 6) return [];

    const accelerationCoordinates = [];

    // Step through the clean regular session timeline to process the double-derivative math
    for (let i = 2; i < todaysLiveCandles.length; i++)
    {
        const timestamp = todaysLiveCandles[i].Timestamp || todaysLiveCandles[i].t || todaysLiveCandles[i].timestamp;
        const timeLabel = new Date(timestamp).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit', hour12: false });

        const vCurrent = todaysLiveCandles[i].Volume || todaysLiveCandles[i].v || 0;
        const vPrior1 = todaysLiveCandles[i - 1].Volume || todaysLiveCandles[i - 1].v || 0;
        const vPrior2 = todaysLiveCandles[i - 2].Volume || todaysLiveCandles[i - 2].v || 0;

        // 📐 THE QUANT SECOND DERIVATIVE CALCULATION:
        // Velocity 1 (Current rate of change): vCurrent - vPrior1
        // Velocity 2 (Prior rate of change):   vPrior1 - vPrior2
        // Acceleration (Rate of change of velocity): Velocity 1 - Velocity 2
        const computedAcceleration = (vCurrent - vPrior1) - (vPrior1 - vPrior2);

        accelerationCoordinates.push({
            timeLabel,
            accelerationValue: computedAcceleration, // > 0 = Pacing Faster 🟢, < 0 = Pacing Slower 🔴
            rawPriceClose: todaysLiveCandles[i].ClosePrice || todaysLiveCandles[i].c
        });
    }

    return accelerationCoordinates;
}
