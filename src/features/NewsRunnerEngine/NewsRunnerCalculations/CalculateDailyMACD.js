/**
 * Processes 6 months of daily candles to calculate the current Daily MACD profile.
 * 
 * @param {Array} dailyCandles - Historical candles formatted as { ClosePrice, Timestamp }
 * @returns {Object} Macro technical profile: { macdLine, signalLine, histogram, crossoverStatus }
 */
export function calculateNewsRunnerDailyMacdProfile(dailyCandles)
{
    // Ensure we have enough trading days to calculate a valid 26-period EMA anchor
    if (!dailyCandles || dailyCandles.length < 35)
    {
        return { macdLine: 0, signalLine: 0, histogram: 0, crossoverStatus: 'INSUFFICIENT_DATA' };
    }

    // 1. Ensure historical array is sorted sequentially (oldest to newest)
    const sortedCandles = [...dailyCandles].sort((a, b) => Date.parse(a.Timestamp) - Date.parse(b.Timestamp));
    const closePrices = sortedCandles.map(c => c.ClosePrice || c.close);

    // 2. Initialize EMA Multiplier Weight Factors
    const kFast = 2 / (12 + 1);
    const kSlow = 2 / (26 + 1);
    const kSignal = 2 / (9 + 1);

    // Use simple averages of the earliest periods to seed the running arrays
    let currentEma12 = closePrices.slice(0, 12).reduce((a, b) => a + b, 0) / 12;
    let currentEma26 = closePrices.slice(0, 26).reduce((a, b) => a + b, 0) / 26;

    const macdHistory = [];

    // 3. Compute continuous historical EMAs and calculate the MACD line
    for (let i = 26; i < closePrices.length; i++)
    {
        currentEma12 = (closePrices[i] * kFast) + (currentEma12 * (1 - kFast));
        currentEma26 = (closePrices[i] * kSlow) + (currentEma26 * (1 - kSlow));

        macdHistory.push(currentEma12 - currentEma26);
    }

    // 4. Calculate the 9-day Signal Line smoothing ribbon across the MACD history
    let currentSignal = macdHistory.slice(0, 9).reduce((a, b) => a + b, 0) / 9;

    for (let j = 9; j < macdHistory.length; j++)
    {
        currentSignal = (macdHistory[j] * kSignal) + (currentSignal * (1 - kSignal));
    }

    // Isolate the absolute latest historical tracking points
    const latestMacdLine = macdHistory[macdHistory.length - 1];
    const previousMacdLine = macdHistory[macdHistory.length - 2];
    const latestSignalLine = currentSignal;
    const latestHistogram = latestMacdLine - latestSignalLine;

    // 5. Run Macro Trend Evaluation Alignment Checks
    let crossoverStatus = 'BEARISH_ZONE';

    if (latestMacdLine > latestSignalLine)
    {
        // If the MACD line crossed above the signal line within the last 48 hours
        if (previousMacdLine <= macdHistory[macdHistory.length - 2])
        {
            crossoverStatus = 'BULLISH_CROSSOVER_ACTIVE'; // Optimal setting for an all-day runner
        } else
        {
            crossoverStatus = 'BULLISH_TREND_SUSTAINED';
        }
    } else if (previousMacdLine > macdHistory[macdHistory.length - 2] && latestMacdLine <= latestSignalLine)
    {
        crossoverStatus = 'BEARISH_CROSSOVER_TRIGGERED';
    }

    return {
        macdLine: Number(latestMacdLine.toFixed(4)),
        signalLine: Number(latestSignalLine.toFixed(4)),
        histogram: Number(latestHistogram.toFixed(4)),
        crossoverStatus
    };
}
