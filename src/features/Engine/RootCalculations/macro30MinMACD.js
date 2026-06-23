/**
 * In-Memory 30-Minute Macro MACD Compiler.
 * Compresses 5-minute regular hours candles into 30-minute intervals and computes
 * trailing MACD line, Signal line, and Histogram vectors for your Macro Adapter.
 * 
 * @param {Array} cleanRegularSessionCandles - Clean 5-minute regular hours bars from Step 1
 * @returns {Object} Clean scalar indicators to hydrate your macro metadata layer
 */
export function calculateMacroThirtyMinMacd(cleanRegularSessionCandles)
{
    const fallbackMetrics = { macdLine: 0, signalLine: 0, histogram: 0, isHistogramGrowingBearish: false };

    // We need sufficient structural depth (at least 156 five-minute bars to build a 26-period 30-min window)
    if (!cleanRegularSessionCandles || cleanRegularSessionCandles.length < 160)
    {
        return fallbackMetrics;
    }

    // A. DOWN-SAMPLE LOOP: Accumulate final 30-minute close steps
    const thirtyMinCloses = [];
    for (let i = 0; i < cleanRegularSessionCandles.length; i += 6)
    {
        thirtyMinCloses.push(cleanRegularSessionCandles[i].ClosePrice);
    }

    if (thirtyMinCloses.length < 26) return fallbackMetrics;

    // B. NATIVE MACO EMA COMPILER LOOP
    const calculateEma = (prices, period) =>
    {
        const k = 2 / (period + 1);
        let emaVal = prices[0]; // Seed initial average with the first element
        for (let i = 1; i < prices.length; i++)
        {
            emaVal = (prices[i] * k) + (emaVal * (1 - k));
        }
        return emaVal;
    };

    const currentPrices = thirtyMinCloses;
    const priorPrices = thirtyMinCloses.slice(0, -1); // Split trailing frame to detect momentum directions

    // 1. Current MACD Coordinates
    const currentFastEma = calculateEma(currentPrices, 12);
    const currentSlowEma = calculateEma(currentPrices, 26);
    const currentMacdLine = currentFastEma - currentSlowEma;

    // 2. Prior MACD Coordinates (Used to track if histogram is shrinking or expanding)
    const priorFastEma = calculateEma(priorPrices, 12);
    const priorSlowEma = calculateEma(priorPrices, 26);
    const priorMacdLine = priorFastEma - priorSlowEma;

    // 3. Signal Line Compilations (9-Period EMA approximation of the MACD lines)
    const currentSignalLine = calculateEma(currentPrices.map(() => currentMacdLine), 9);
    const priorSignalLine = calculateEma(priorPrices.map(() => priorMacdLine), 9);

    const currentHistogram = currentMacdLine - currentSignalLine;
    const priorHistogram = priorMacdLine - priorSignalLine;

    // Determine the direction of the broad market wave
    // True if MACD is under signal AND the bearish bars are actively expanding downward
    const isExpandingBearish = currentMacdLine <= currentSignalLine && currentHistogram <= priorHistogram;

    return {
        macdLine: parseFloat(currentMacdLine.toFixed(3)),
        signalLine: parseFloat(currentSignalLine.toFixed(3)),
        histogram: parseFloat(currentHistogram.toFixed(3)),
        isHistogramGrowingBearish: isExpandingBearish
    };
}


/**
 * Advanced Multi-Timeframe Macro MACD Compiler.
 * Ingests a mixed timeline array (5-minute history + 1-minute live bars),
 * down-samples the live portion to 5-minute blocks on-the-fly, and calculates 
 * the final 30-minute macro momentum histogram.
 */
export function calculateMacro30MinMacdFromOneMinCandles(frozen5MinHistory, raw1MinLiveBars) {
    const fallbackMetrics = { macdLine: 0, signalLine: 0, histogram: 0, isHistogramGrowingBearish: false };
    
    // 1. CHUNK TODAY'S ACTIVE LIVE DATA ON-THE-FLY
    const chunkedLive5MinCandles = [];
    if (raw1MinLiveBars && raw1MinLiveBars.length > 0) {
        const buckets = {};
        
        raw1MinLiveBars.forEach(candle => {
            const timeObj = new Date(candle.Timestamp);
            const slotFloor = Math.floor(timeObj.getUTCMinutes() / 5) * 5;
            timeObj.setUTCMinutes(slotFloor); timeObj.setUTCSeconds(0); timeObj.setUTCMilliseconds(0);
            const slotKey = timeObj.toISOString();

            if (!buckets[slotKey]) buckets[slotKey] = [];
            buckets[slotKey].push(candle);
        });

        Object.keys(buckets).forEach(slotKey => {
            const list = buckets[slotKey];
            chunkedLive5MinCandles.push({
                Timestamp: slotKey,
                ClosePrice: list[list.length - 1].ClosePrice
            });
        });
        
        // Sort chronologically to keep the timeline unbroken
        chunkedLive5MinCandles.sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));
    }

    // 2. CONCATENATE INTO A UNIFORM 5-MINUTE RUNWAY
    const uniformFiveMinTimeline = [...(frozen5MinHistory || []), ...chunkedLive5MinCandles];
    if (uniformFiveMinTimeline.length < 160) return fallbackMetrics;

    // 3. DOWN-SAMPLE TO 30-MINUTE CLOSES
    const thirtyMinCloses = [];
    for (let i = 0; i < uniformFiveMinTimeline.length; i += 6) {
        thirtyMinCloses.push(uniformFiveMinTimeline[i].ClosePrice);
    }

    if (thirtyMinCloses.length < 26) return fallbackMetrics;

    // 4. COMPUTE INSTITUTIONAL CONVERGENCE MATRICES
    const calculateEma = (prices, period) => {
        const k = 2 / (period + 1);
        let emaVal = prices[0];
        for (let i = 1; i < prices.length; i++) {
            emaVal = (prices[i] * k) + (emaVal * (1 - k));
        }
        return emaVal;
    };

    const currentPrices = thirtyMinCloses;
    const priorPrices = thirtyMinCloses.slice(0, -1);

    const currentFastEma = calculateEma(currentPrices, 12);
    const currentSlowEma = calculateEma(currentPrices, 26);
    const currentMacdLine = currentFastEma - currentSlowEma;

    const priorFastEma = calculateEma(priorPrices, 12);
    const priorSlowEma = calculateEma(priorPrices, 26);
    const priorMacdLine = priorFastEma - priorSlowEma;

    const currentSignalLine = calculateEma(currentPrices.map(() => currentMacdLine), 9);
    const priorSignalLine = calculateEma(priorPrices.map(() => priorMacdLine), 9);

    const currentHistogram = currentMacdLine - currentSignalLine;
    const priorHistogram = priorMacdLine - priorSignalLine;

    return {
        macdLine: parseFloat(currentMacdLine.toFixed(3)),
        signalLine: parseFloat(currentSignalLine.toFixed(3)),
        histogram: parseFloat(currentHistogram.toFixed(3)),
        isHistogramGrowingBearish: currentMacdLine <= currentSignalLine && currentHistogram <= priorHistogram
    };
}
