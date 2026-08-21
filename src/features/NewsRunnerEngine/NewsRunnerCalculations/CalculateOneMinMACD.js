/**
 * Calculates and evaluates the 1-Minute MACD from incoming minute candlesticks.
 * Matches the exact chronological timescale of your D3 index-band chart.
 * 
 * @param {Array} minuteCandles - Array of candles from your 30s poll: [{ OpenPrice, ClosePrice, ... }]
 * @returns {Object} Complete data block ready for D3 lines and your text summary engine
 */
export function calculateAndEvaluateNewsRunner1MinMACD(minuteCandles)
{
    if (!minuteCandles || minuteCandles.length < 26)
    {
        return {
            macdPoints: [],
            latestEvaluation: { status: 'INITIALIZING', conviction: 'NEUTRAL', alert: false }
        };
    }

    // 1. Sort chronologically (oldest to newest) to maintain scale timeline alignment
    const sortedCandles = [...minuteCandles].sort((a, b) => Date.parse(a.Timestamp) - Date.parse(b.Timestamp));
    const prices = sortedCandles.map(c => c.ClosePrice || c.close);

    const kFast = 2 / (12 + 1);
    const kSlow = 2 / (26 + 1);
    const kSignal = 2 / (9 + 1);

    // Seed the initial historical running averages
    let currentEma12 = prices.slice(0, 12).reduce((a, b) => a + b, 0) / 12;
    let currentEma26 = prices.slice(0, 26).reduce((a, b) => a + b, 0) / 26;

    const rawMacdLine = [];

    // Compute the continuous MACD line profile
    for (let i = 26; i < prices.length; i++)
    {
        currentEma12 = (prices[i] * kFast) + (currentEma12 * (1 - kFast));
        currentEma26 = (prices[i] * kSlow) + (currentEma26 * (1 - kSlow));
        rawMacdLine.push(currentEma12 - currentEma26);
    }

    // Smooth the signal line across the accumulated MACD line history
    let currentSignal = rawMacdLine.slice(0, 9).reduce((a, b) => a + b, 0) / 9;
    const macdPoints = [];

    for (let j = 9; j < rawMacdLine.length; j++)
    {
        currentSignal = (rawMacdLine[j] * kSignal) + (currentSignal * (1 - kSignal));

        const macdLineVal = rawMacdLine[j];
        const signalLineVal = currentSignal;
        const histogramVal = macdLineVal - signalLineVal;

        // Map each processed data index back to the index timescale of the candlesticks array
        const originalCandleIndex = j + 26;

        macdPoints.push({
            Timestamp: sortedCandles[originalCandleIndex].Timestamp,
            macd: Number(macdLineVal.toFixed(4)),
            signal: Number(signalLineVal.toFixed(4)),
            histogram: Number(histogramVal.toFixed(4))
        });
    }

    // 2. MOMENTUM CONVICTION EVALUATION LAYER
    if (macdPoints.length < 4)
    {
        return { macdPoints, latestEvaluation: { status: 'STABLE', conviction: 'NEUTRAL', alert: false } };
    }

    const latest = macdPoints[macdPoints.length - 1];
    const previous = macdPoints[macdPoints.length - 2];

    let status = 'CONSOLIDATING';
    let conviction = 'NEUTRAL';
    let alert = false;

    // Track Peak Crossovers and Directional Slopes
    const isCrossoverAbove = latest.macd > latest.signal;
    const isCrossoverBelow = latest.macd <= latest.signal;
    const isHistogramExpandingUp = latest.histogram > previous.histogram;
    const isHistogramCollapsingDown = latest.histogram < previous.histogram;

    if (isCrossoverAbove)
    {
        if (isHistogramExpandingUp)
        {
            status = 'BULL_ACCELERATION';
            conviction = 'STRONG_BUY_CONVICTION';
        } else if (isHistogramCollapsingDown)
        {
            status = 'BULL_MOMENTUM_FADING';
            conviction = 'WEAKNESS_DETECTED';
            alert = true; // Alerts your engine that momentum is slowing down even if the price is high
        }
    } else if (isCrossoverBelow)
    {
        if (isHistogramCollapsingDown)
        {
            status = 'BEAR_ACCELERATION';
            conviction = 'STRONG_SELL_CONVICTION';
            alert = true;
        } else if (isHistogramExpandingUp)
        {
            status = 'BEAR_MOMENTUM_FADING';
            conviction = 'MOMENTUM_RECOVERY';
        }
    }

    return {
        macdPoints, // Array containing [{ candleIndex, macd, signal, histogram }] for D3 paths
        latestEvaluation: { status, conviction, alert } // Plugs directly into your telemetry text banners
    };
}
