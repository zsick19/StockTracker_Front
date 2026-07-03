/**
 * PRODUCTION COMPILER: compileVolumeAccelerationDerivative
 * Computes the second derivative of intraday candle volume (d2V/dt2) 
 * to track real-time institutional momentum acceleration and deceleration [INDEX].
 * 
 * @param {Array} todaysLiveCandles - Array of streaming intraday regular session bars
 * @returns {Array} Flat JSON collection: [{ timeLabel: "09:36", acceleration: +4500 }]
 */
export function compileVolumeAccelerationDerivative(todaysLiveCandles) {
    if (!todaysLiveCandles || todaysLiveCandles.length < 6) return [];

    const cleanRthCandles = todaysLiveCandles.filter(candle => {
        const rawTimestamp = candle.Timestamp || candle.t || candle.timestamp;
        if (!rawTimestamp) return false;
        const timeStr = new Date(rawTimestamp).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false });
        return timeStr >= "09:30:00" && timeStr <= "10:30:00";
    });

    const accelerationCoordinates = [];
    
    // Step through the clean regular session timeline to process the double-derivative math
    for (let i = 2; i < cleanRthCandles.length; i++) {
        const timestamp = cleanRthCandles[i].Timestamp || cleanRthCandles[i].t || cleanRthCandles[i].timestamp;
        const timeLabel = new Date(timestamp).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit', hour12: false });

        const vCurrent = cleanRthCandles[i].Volume || cleanRthCandles[i].v || 0;
        const vPrior1 = cleanRthCandles[i - 1].Volume || cleanRthCandles[i - 1].v || 0;
        const vPrior2 = cleanRthCandles[i - 2].Volume || cleanRthCandles[i - 2].v || 0;

        // 📐 THE QUANT SECOND DERIVATIVE CALCULATION:
        // Velocity 1 (Current rate of change): vCurrent - vPrior1
        // Velocity 2 (Prior rate of change):   vPrior1 - vPrior2
        // Acceleration (Rate of change of velocity): Velocity 1 - Velocity 2
        const computedAcceleration = (vCurrent - vPrior1) - (vPrior1 - vPrior2);

        accelerationCoordinates.push({
            timeLabel,
            accelerationValue: computedAcceleration, // > 0 = Pacing Faster 🟢, < 0 = Pacing Slower 🔴
            rawPriceClose: cleanRthCandles[i].ClosePrice || cleanRthCandles[i].c
        });
    }

    return accelerationCoordinates;
}
