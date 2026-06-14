import { min, max } from "d3"
import { differenceInBusinessDays, isToday } from "date-fns";

export const calculateEMADataPoints = (candleData, period, lastCandleData) =>
{
    let emaArray = []
    let results = []
    var k = 2 / (period + 1);
    emaArray = [candleData[0].ClosePrice];
    for (var i = 1; i < candleData.length; i++) { emaArray.push(candleData[i].ClosePrice * k + emaArray[i - 1] * (1 - k)); }

    for (var i = 0; i < emaArray.length; i++) { results.push({ date: candleData[i].Timestamp, value: emaArray[i] }); }

    if (lastCandleData)
    {
        let emaValue = lastCandleData.ClosePrice * k + (emaArray.at(-1) * (1 - k))
        results.push({ date: lastCandleData.Timestamp, value: emaValue })
    }

    return results
}

export function rsiCalc(chartingData, period = 14)
{
    const rsiValues = []
    for (let i = 0; i < chartingData.length; i++)
    {
        if (i < period)
        {
            rsiValues.push(null)
            continue;
        }

        let avgUpwardChange = 0;
        let avgDownwardChange = 0;

        if (i === period)
        {
            for (let j = 1; j <= period; j++)
            {
                const priceChange = chartingData[j].ClosePrice - chartingData[j - 1].ClosePrice
                avgUpwardChange += Math.max(0, priceChange)
                avgDownwardChange += Math.max(0, -priceChange)
            }
            avgUpwardChange /= period;
            avgDownwardChange /= period;
        } else
        {
            // Calculate smoothed average gain and loss for subsequent days
            const previousAvgUpwardChange = rsiValues[i - 1].avgUpwardChange; // Assuming previousAvgUpwardChange is part of the stored RSI data
            const previousAvgDownwardChange = rsiValues[i - 1].avgDownwardChange; // Assuming previousAvgDownwardChange is part of the stored RSI data

            const priceChange = chartingData[i].ClosePrice - chartingData[i - 1].ClosePrice;
            const upwardChange = Math.max(0, priceChange);
            const downwardChange = Math.max(0, -priceChange);

            avgUpwardChange = (previousAvgUpwardChange * (period - 1) + upwardChange) / period;
            avgDownwardChange = (previousAvgDownwardChange * (period - 1) + downwardChange) / period;
        }

        const rs = avgUpwardChange / avgDownwardChange;
        const rsi = 100 - (100 / (1 + rs));

        rsiValues.push({
            rsi: rsi,
            avgUpwardChange: avgUpwardChange, // Storing for subsequent smoothed calculations
            avgDownwardChange: avgDownwardChange // Storing for subsequent smoothed calculations
        });
    }

    return rsiValues.slice(period);
}

export function calculateCurrentRSI(chartingData, lastCandleData, period = 14)
{
    if (chartingData.length <= period) return null;

    // Extract closing prices
    const prices = chartingData.map(c => c.ClosePrice);
    prices.push(lastCandleData.ClosePrice)
    let gains = 0;
    let losses = 0;

    // 1. Initial Average: First 'period' intervals
    for (let i = 1; i <= period; i++)
    {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    // 2. Wilder's Smoothing: Remaining intervals up to the latest
    for (let i = period + 1; i < prices.length; i++)
    {
        const diff = prices[i] - prices[i - 1];
        const currentGain = diff >= 0 ? diff : 0;
        const currentLoss = diff < 0 ? -diff : 0;

        avgGain = (avgGain * (period - 1) + currentGain) / period;
        avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

/**
 * Calculates traditional cumulative VWAP from Alpaca bar data.
 * @param {Array} bars - Array of Alpaca bar objects { t, vw, v, ... }
 * @returns {Array} - The bars array with an added 'cumulativeVwap' property
 */
export function calculateTraditionalVWAP(bars, mostRecentBar)
{
    let cumulativeDollarVolume = 0;
    let cumulativeVolume = 0;
    let lastDate = null;

    let result = []
    bars.forEach(bar =>
    {
        const currentDate = new Date(bar.Timestamp).toDateString();

        // Reset cumulative totals if it's a new trading day
        if (lastDate !== null && currentDate !== lastDate)
        {
            cumulativeDollarVolume = 0;
            cumulativeVolume = 0;
        }
        lastDate = currentDate;

        // Standard formula: (Bar VWAP * Bar Volume)
        // Alpaca's 'vw' is the pre-calculated typical price/avg for that bar
        const barDollarVolume = bar.VWAP * bar.Volume;

        cumulativeDollarVolume += barDollarVolume;
        cumulativeVolume += bar.Volume;

        // Add traditional VWAP value to the bar object
        result.push({
            Timestamp: bar.Timestamp,
            traditionalVWAP: cumulativeVolume > 0 ? (cumulativeDollarVolume / cumulativeVolume) : bar.VWAP
        });

        if (mostRecentBar)
        {
            const currentDate = new Date(mostRecentBar.Timestamp).toDateString();

            // Reset cumulative totals if it's a new trading day
            if (lastDate !== null && currentDate !== lastDate)
            {
                cumulativeDollarVolume = 0;
                cumulativeVolume = 0;
            }
            lastDate = currentDate;

            // Standard formula: (Bar VWAP * Bar Volume)
            // Alpaca's 'vw' is the pre-calculated typical price/avg for that bar
            const barDollarVolume = mostRecentBar.VWAP * mostRecentBar.Volume;

            cumulativeDollarVolume += barDollarVolume;
            cumulativeVolume += bar.Volume;

            // Add traditional VWAP value to the bar object
            result.push({
                Timestamp: mostRecentBar.Timestamp,
                traditionalVWAP: cumulativeVolume > 0 ? (cumulativeDollarVolume / cumulativeVolume) : mostRecentBar.VWAP
            });
        }
    });

    return result
}


/**
 * Generates Anchored VWAP values starting from a specific date.
 * @param {string|Date} anchorDate - The date to start the VWAP calculation.
 * @param {Array} candles - Array of candlestick objects.
 * @returns {Array} - The candles with an added 'avwap' property.
 */
export function calculateAnchoredVWAP(anchorDate, candles)
{
    const anchorTime = new Date(anchorDate).getTime();
    let cumulativePV = 0;
    let cumulativeVolume = 0;
    let started = false;

    return candles.map(candle =>
    {
        const currentTime = new Date(candle.Timestamp).getTime();

        // Start accumulating once we reach or pass the anchor date
        if (!started && currentTime >= anchorTime) { started = true; }

        if (started)
        {
            // 1. Calculate Typical Price: (H + L + C) / 3
            const typicalPrice = (candle.HighPrice + candle.LowPrice + candle.ClosePrice) / 3;

            // 2. Accumulate Price * Volume
            cumulativePV += typicalPrice * candle.Volume;

            // 3. Accumulate Total Volume
            cumulativeVolume += candle.Volume;

            // 4. Result = Cumulative PV / Cumulative Volume
            return {
                Timestamp: candle.Timestamp,
                avwap: cumulativeVolume !== 0 ? (cumulativePV / cumulativeVolume) : null
            };
        }

        // Return candle without AVWAP if before the anchor date
        return { ...candle, avwap: null };
    });
}










export function MACDCalc(chartingData, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9)
{
    const prices = chartingData.map(d => d.ClosePrice)

    const calculateEMA = (mPrices, period) =>
    {
        const k = 2 / (period + 1);
        let emaArray = [mPrices[0]]; // Start with the first price
        for (let i = 1; i < mPrices.length; i++) { emaArray.push(mPrices[i] * k + emaArray[i - 1] * (1 - k)); }
        return emaArray;
    };

    const fastEMA = calculateEMA(prices, fastPeriod)
    const slowEMA = calculateEMA(prices, slowPeriod)

    const macdLine = fastEMA.map((f, i) => f - slowEMA[i])

    const signalLine = calculateEMA(macdLine, signalPeriod)


    return chartingData.map((item, i) => ({
        Timestamp: item.Timestamp,
        macd: macdLine[i],
        signal: signalLine[i],
        histogram: signalLine[i] - macdLine[i]
    }))
}


export function calculateMACDOptimized(candles, fastLength = 12, slowLength = 26, signalLength = 9)
{
    const len = candles.length;
    const minRequired = slowLength + signalLength - 1;
    if (len < minRequired) return [];

    const result = new Array(len - minRequired + 1);
    const kFast = 2 / (fastLength + 1);
    const kSlow = 2 / (slowLength + 1);
    const kSignal = 2 / (signalLength + 1);

    // 1. Compute baseline SMA for Fast and Slow EMAs
    let fastEma = 0;
    let slowEma = 0;
    for (let i = 0; i < slowLength; i++)
    {
        const close = candles[i].ClosePrice;
        if (i < fastLength) fastEma += close;
        slowEma += close;
    }
    fastEma /= fastLength;
    slowEma /= slowLength;

    // 2. Pre-fill MACD buffer to establish the initial Signal SMA
    // Size needed to get the first valid Signal point is exactly signalLength
    const macdBuffer = new Array(signalLength);
    macdBuffer[0] = fastEma - slowEma; // FIXED: Changed from macdBuffer = ...
    let signalEma = macdBuffer[0];

    let bufIdx = 1;
    for (let i = slowLength; i < minRequired; i++)
    {
        const close = candles[i].ClosePrice;
        fastEma = (close * kFast) + (fastEma * (1 - kFast));
        slowEma = (close * kSlow) + (slowEma * (1 - kSlow));

        const macd = fastEma - slowEma;
        macdBuffer[bufIdx++] = macd;
        signalEma += macd;
    }
    signalEma /= signalLength; // Initial Signal SMA

    // 3. Single-pass loop for remaining data (outputting directly to results)
    let outIdx = 0;

    // Record the very first fully formed MACD point
    const firstMacd = macdBuffer[signalLength - 1];
    result[outIdx++] = {
        Timestamp: candles[minRequired - 1].Timestamp,
        macd: firstMacd,
        signal: signalEma,
        histogram: firstMacd - signalEma
    };

    for (let i = minRequired; i < len; i++)
    {
        const close = candles[i].ClosePrice;

        // Inline EMA streaming calculations
        fastEma = (close * kFast) + (fastEma * (1 - kFast));
        slowEma = (close * kSlow) + (slowEma * (1 - kSlow));

        const macd = fastEma - slowEma;
        signalEma = (macd * kSignal) + (signalEma * (1 - kSignal));

        result[outIdx++] = {
            Timestamp: candles[i].Timestamp,
            macd: macd,
            signal: signalEma,
            histogram: macd - signalEma
        };
    }

    return result;
}






















export function calculateYAxisRange(macdData, paddingPercent = 0.15)
{
    let globalMax = 0;
    let globalMin = 0;

    let histogramMax = 0
    let histogramMin = 0

    macdData.forEach(item =>
    {
        // Check all three components to find the true extremes
        const localMax = Math.max(item.macd, item.signal);
        const localMin = Math.min(item.macd, item.signal);

        if (localMax > globalMax) globalMax = localMax;
        if (localMin < globalMin) globalMin = localMin;
        if (item.histogram > histogramMax) histogramMax = item.histogram
        else if (item.histogram < histogramMin) histogramMin = item.histogram
    });

    // Find the absolute furthest point from zero to keep chart symmetrical
    const absoluteExtreme = Math.max(Math.abs(globalMax), Math.abs(globalMin));

    // Apply padding
    const paddedLimit = absoluteExtreme * (1 + paddingPercent);

    return {
        min: -paddedLimit, // Negative limit for the bottom
        max: paddedLimit,  // Positive limit for the top
        histogramExtremes: [histogramMin, histogramMax],
        suggestedTicks: [-paddedLimit, 0, paddedLimit]
    };
}

export function calculateVWAP(data, resetDaily = true)
{
    let cumulativeTypicalPriceVolume = 0;
    let cumulativeVolume = 0;
    let lastDate = null;

    return data.map((candle) =>
    {
        const { HighPrice, LowPrice, ClosePrice, Volume, Timestamp } = candle;

        // 1. Determine if we are in a new day (if resetDaily is enabled)
        const currentDate = new Date(Timestamp).getUTCDate();
        if (resetDaily && lastDate !== null && currentDate !== lastDate)
        {
            cumulativeTypicalPriceVolume = 0;
            cumulativeVolume = 0;
        }
        lastDate = currentDate;

        // 2. Calculate Typical Price
        const typicalPrice = (HighPrice + LowPrice + ClosePrice) / 3;

        // 3. Accumulate values
        cumulativeTypicalPriceVolume += typicalPrice * Volume;
        cumulativeVolume += Volume;

        // 4. Calculate VWAP
        const vwapValue = cumulativeTypicalPriceVolume / cumulativeVolume;

        return {
            Timestamp, vwap: vwapValue,            //typicalPrice: typicalPrice // Useful for debugging or other indicators
        };
    });
}




export function calculateVortex(candles, period = 14)
{
    if (candles.length <= period) return [];

    let vortexValues = [];

    // 1. Calculate daily movements (VM+, VM-) and True Range (TR)
    let dailyMetrics = [];
    for (let i = 1; i < candles.length; i++)
    {
        const current = candles[i];
        const previous = candles[i - 1];

        // Absolute vertical movement between extreme points
        const vmPlus = Math.abs(current.HighPrice - previous.LowPrice);
        const vmMinus = Math.abs(current.LowPrice - previous.HighPrice);

        // True Range calculation
        const tr1 = current.HighPrice - current.LowPrice;
        const tr2 = Math.abs(current.HighPrice - previous.ClosePrice);
        const tr3 = Math.abs(current.LowPrice - previous.ClosePrice);
        const trueRange = Math.max(tr1, tr2, tr3);

        dailyMetrics.push({
            date: current.Timestamp,
            vmPlus,
            vmMinus,
            trueRange
        });
    }

    // 2. Rolling sum over the lookback period
    for (let i = period - 1; i < dailyMetrics.length; i++)
    {
        const window = dailyMetrics.slice(i - period + 1, i + 1);

        const sumVmPlus = window.reduce((sum, item) => sum + item.vmPlus, 0);
        const sumVmMinus = window.reduce((sum, item) => sum + item.vmMinus, 0);
        const sumTR = window.reduce((sum, item) => sum + item.trueRange, 0);

        // Prevent division by zero if the asset is completely flat
        if (sumTR === 0)
        {
            vortexValues.push({ date: dailyMetrics[i].date, viPlus: 1.0, viMinus: 1.0 });
            continue;
        }

        // Calculate final +VI and -VI ratios
        const viPlus = sumVmPlus / sumTR;
        const viMinus = sumVmMinus / sumTR;

        vortexValues.push({
            date: dailyMetrics[i].date,
            viPlus: parseFloat(viPlus.toFixed(4)),
            viMinus: parseFloat(viMinus.toFixed(4))
        });
    }

    return vortexValues;
}











export function calculateVolumeProfile(data, binsCount = 50)
{
    if (!data || data.length === 0) return null;

    // 1. Find the total price range for the period
    const highs = data.map(d => d.HighPrice);
    const lows = data.map(d => d.LowPrice);
    const minPrice = Math.min(...lows);
    const maxPrice = Math.max(...highs);
    const priceRange = maxPrice - minPrice;

    // 2. Calculate dynamic bin width (Row Height)
    // Higher price = larger bin width automatically
    const binWidth = priceRange / binsCount;

    // 3. Initialize profile buckets
    const bins = {};
    for (let i = 0; i < binsCount; i++)
    {
        const level = minPrice + (i * binWidth) + (binWidth / 2);
        // Use a fixed precision to avoid floating point key issues
        bins[level.toFixed(4)] = 0;
    }

    // 4. Distribute volume
    data.forEach(candle =>
    {
        // For simple profile, assign volume to the bin containing the 'close' price
        // For accuracy, we find which bin the close price belongs to
        const binIndex = Math.floor((candle.ClosePrice - minPrice) / binWidth);
        const cappedIndex = Math.min(Math.max(binIndex, 0), binsCount - 1);
        const levelKey = (minPrice + (cappedIndex * binWidth) + (binWidth / 2)).toFixed(4);

        bins[levelKey] += candle.Volume;
    });

    // 5. Format results and find Point of Control (POC)
    const profile = Object.keys(bins).map(price => ({
        price: parseFloat(price),
        volume: bins[price]
    })).sort((a, b) => a.price - b.price);

    const poc = profile.reduce((prev, current) =>
        (prev.volume > current.volume) ? prev : current
    );

    return { profile, poc };
}

export function calculateCorrelation(dataA, dataB, window = 20)
{
    const result = [];
    const pricesA = dataA.map(d => d.ClosePrice);
    const pricesB = dataB.map(d => d.ClosePrice);


    for (let i = window; i <= pricesA.length; i++)
    {
        const sliceA = pricesA.slice(i - window, i);
        const sliceB = pricesB.slice(i - window, i);
        const corr = calculatePearson(sliceA, sliceB);
        result.push({ x: dataA[i - 1].Timestamp, y: corr.toFixed(2) });
    }
    return result;


    function calculatePearson(a, b)
    {
        const n = a.length;
        const meanA = a.reduce((s, v) => s + v) / n;
        const meanB = b.reduce((s, v) => s + v) / n;
        let num = 0, denA = 0, denB = 0;
        for (let i = 0; i < n; i++)
        {
            const dA = a[i] - meanA, dB = b[i] - meanB;
            num += dA * dB;
            denA += dA ** 2;
            denB += dB ** 2;
        }
        return num / Math.sqrt(denA * denB) || 0;
    }

}


export function calculateStochastic(chartingData, timeBlock = 14)
{
    let currentCloseMinusLowestLowOverBlock = []
    let highestHighMinusLowestLowOverBlock = []
    let percentKFastOverBlock = []

    for (let i = 0; i < chartingData.length - 1 - timeBlock; i++)
    {

        let blockPeriodOfData = chartingData.slice(i, i + timeBlock - 1)

        let lowExtents = min(blockPeriodOfData.map((trade) => { return (trade.LowPrice) }))
        let closeMinusLow = chartingData[timeBlock + i].ClosePrice - lowExtents


        let highExtents = max(blockPeriodOfData.map((trade) => { return (trade.HighPrice) }))
        let highestHighMinusLowestLow = highExtents - lowExtents

        let percentKFast = (closeMinusLow / highestHighMinusLowestLow) * 100

        currentCloseMinusLowestLowOverBlock.push(closeMinusLow)
        highestHighMinusLowestLowOverBlock.push(highestHighMinusLowestLow)
        percentKFastOverBlock.push(percentKFast)
    }

    let slowPercentK = []
    for (let i = 0; i < percentKFastOverBlock.length - 3; i++)
    {
        let sumCloseMinusLow = 0
        let sumHighMinusLow = 0
        for (let j = i + 2; j < i + 5; j++)
        {
            sumCloseMinusLow = sumCloseMinusLow + currentCloseMinusLowestLowOverBlock[j]
            sumHighMinusLow = sumHighMinusLow + highestHighMinusLowestLowOverBlock[j]
        }
        slowPercentK.push((sumCloseMinusLow / sumHighMinusLow) * 100)
    }

    let signalLine = []
    for (let i = 0; i < slowPercentK.length - 3; i++)
    {
        let average = 0
        for (let j = i + 2; j < i + 5; j++)
        {
            average = average + slowPercentK[j]
        }
        signalLine.push(average / 3)
    }
    let percentDResults = []
    let percentKResults = []
    for (let i = 0; i < signalLine.length - 1; i++)
    {

        percentDResults.push({ date: chartingData[i + 13 + 2 + 2].Timestamp, value: signalLine[i] })
        percentKResults.push({ date: chartingData[i + 13 + 2].Timestamp, value: percentKFastOverBlock[i] })
    }

    return { percentK: percentKResults, percentD: percentDResults }
}


export function calculateStochastic2(candles, periodK = 14, periodD = 3)
{
    if (candles.length < periodK) return [];

    let stochValues = [];

    // 1. Calculate raw %K for each possible window
    for (let i = periodK - 1; i < candles.length; i++)
    {
        const window = candles.slice(i - periodK + 1, i + 1);

        const lows = window.map(c => c.LowPrice);
        const highs = window.map(c => c.HighPrice);

        const currentClose = candles[i].ClosePrice;
        const lowestLow = Math.min(...lows);
        const highestHigh = Math.max(...highs);

        // Prevent division by zero if high equals low
        const denominator = highestHigh - lowestLow;
        const rawK = denominator === 0 ? 50 : ((currentClose - lowestLow) / denominator) * 100;

        stochValues.push({
            date: candles[i].Timestamp,
            rawK: rawK
        });
    }

    // 2. Calculate Simple Moving Average (%D) of %K
    for (let i = periodD - 1; i < stochValues.length; i++)
    {
        const windowK = stochValues.slice(i - periodD + 1, i + 1);
        const sumK = windowK.reduce((sum, item) => sum + item.rawK, 0);
        const smoothD = sumK / periodD;

        stochValues[i].k = stochValues[i].rawK; // Fast %K
        stochValues[i].d = smoothD;             // Fast %D (Slow %K)
    }

    // Clean up temporary rawK property from final output
    return stochValues
        .filter(item => item.d !== undefined)
        .map(({ date, k, d }) => ({ date, k, d }));
}

export function stochasticCalc(candleData, kPeriod = 14, dPeriod = 3)
{
    const stochasticValues = [];

    for (let i = kPeriod - 1; i < candleData.length; i++)
    {
        let highestHigh = -Infinity;
        let lowestLow = Infinity;

        // Find the highest high and lowest low within the lookback period
        for (let j = i - kPeriod + 1; j <= i; j++)
        {
            highestHigh = Math.max(highestHigh, candleData[j].HighPrice);
            lowestLow = Math.min(lowestLow, candleData[j].LowPrice);
        }

        // Calculate %K
        const currentClose = candleData[i].ClosePrice;
        const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;

        // Calculate %D (moving average of %K)
        let d = null;
        if (i >= kPeriod + dPeriod - 2)
        {
            let sumK = 0;
            for (let j = i - dPeriod + 1; j <= i; j++)
            {
                const kValue = (((candleData[j].ClosePrice - candleData.slice(i - kPeriod + 1, i + 1).reduce((acc, curr) => Math.min(acc, curr.LowPrice), Infinity))) / (candleData.slice(i - kPeriod + 1, i + 1).reduce((acc, curr) => Math.max(acc, curr.HighPrice), -Infinity) - candleData.slice(i - kPeriod + 1, i + 1).reduce((acc, curr) => Math.min(acc, curr.LowPrice), Infinity))) * 100;


                sumK += kValue;
            }
            d = sumK / dPeriod;
        }

        stochasticValues.push({
            // Assuming you have an array of dates corresponding to your closing prices
            k: k,
            d: d,
        });
    }

    return stochasticValues.slice(2);
}

export function calculateStockStandardDeviation(prices)
{
    if (!prices || prices.length === 0) return 0;

    // 1. Calculate the mean (average price)
    const n = prices.length;
    const mean = prices.reduce((sum, price) => sum + price, 0) / n;

    // 2. Calculate the sum of squared differences from the mean
    const squaredDifferencesSum = prices.reduce((sum, price) =>
    {
        const diff = price - mean;
        return sum + (diff * diff);
    }, 0);

    // 3. Calculate variance (average of squared differences)
    // Use (n - 1) for sample standard deviation or (n) for population
    const variance = squaredDifferencesSum / n;

    // 4. Return the square root of the variance
    return Math.sqrt(variance);
}





//  Calculates Average True Range (ATR)
//  @param {Array} candles - Array of objects {high: number, low: number, close: number}
//  @param {number} period - The lookback period (typically 14)
//  @returns {Array} - Array of ATR values (null for early periods) 
export function calculateATR(candles, period = 14)
{
    if (candles.length < period) return [];

    let atr = new Array(candles.length).fill(null);
    let tr = new Array(candles.length);

    // 1. Calculate True Range (TR) for each candle
    for (let i = 0; i < candles.length; i++)
    {
        const current = candles[i];
        if (i === 0)
        {
            tr[i] = current.high - current.low; // First candle has no previous close
        } else
        {
            const prevClose = candles[i - 1].close;
            tr[i] = Math.max(
                current.high - current.low,
                Math.abs(current.high - prevClose),
                Math.abs(current.low - prevClose)
            );
        }
    }

    // 2. Calculate initial ATR (Simple Moving Average of first 'n' TR values)
    let sumTR = 0;
    for (let i = 0; i < period; i++)
    {
        sumTR += tr[i];
    }
    atr[period - 1] = sumTR / period;

    // 3. Calculate subsequent ATR values using Wilder's Smoothing
    // Formula: ATR_new = ((ATR_prev * (n - 1)) + TR_current) / n
    for (let i = period; i < candles.length; i++)
    {
        atr[i] = (atr[i - 1] * (period - 1) + tr[i]) / period;
    }

    return atr;
}









/** 
* Evaluates 5-minute intraday candles to calculate Volume Efficiency and highlight Churn. 
* @param {Array} candles - Array of objects containing OpenPrice, ClosePrice, HighPrice, LowPrice, Volume,Timestamp 
* @param {number} lookback - The window size to calculate average volume and efficiency baselines (default: 20 candles)
* @returns {Array} The enriched candle data array with efficiency metrics and visual classification tags 
*/
export function calculateVolumeEfficiency(candles, lookback = 20)
{
    if (!candles || candles.length < lookback) { throw new Error(`Insufficient data. Need at least ${lookback} candles.`); }
    const institutionalCandles = []
    return {
        candles:
            candles.map((candle, index, array) =>
            {
                // 1. Core Component: Absolute price movement (Spread)

                const priceSpread = Math.abs(candle.ClosePrice - candle.OpenPrice);
                const volume = candle.Volume; // Prevent division by zero on flat / illiquid candles 
                const rawEfficiency = volume === 0 ? 0 : priceSpread / volume; // Initialize output object with structural metadata


                const enrichedCandle = {
                    ...candle,
                    rawEfficiency: rawEfficiency,
                    priceSpread: priceSpread,
                    isInstitutionalHour: false,
                    classification: "CLEAN_MOVE", // Default category 
                    visualColor: candle.ClosePrice > candle.OpenPrice ? "green" : "red" // Neon Green/Red 
                };
                // // 2. IdentifyTime of Day(Checking if candle falls in the final 60 minutes) 
                const date = new Date(candle.Timestamp);
                const nyTimeStr = date.toLocaleString('en-US', { timeZone: "America/New_York" })
                const nyDate = new Date(nyTimeStr)
                const hours = nyDate.getHours();
                const minutes = nyDate.getMinutes();

                let volumeMultiplier = 2
                if (hours === 9 || (hours === 10 && minutes <= 30)) { volumeMultiplier = 4 }
                if (hours === 15 || (hours === 16 && minutes === 0)) { enrichedCandle.isInstitutionalHour = true; }
                //We need a trailing window baseline to calculate if a spike or churn is statistically significant 
                if (index < lookback) return enrichedCandle; // Skip normalization for early candles without enough history        

                // 3. Slice trailing lookback window for comparative context
                const window = array.slice(index - lookback, index);
                const avgVolume = window.reduce((sum, c) => sum + c.Volume, 0) / lookback;
                const avgSpread = window.reduce((sum, c) => sum + Math.abs(c.ClosePrice - c.OpenPrice), 0) / lookback; // 4. Determine Dynamic Thresholds 
                const isVolumeSpike = volume > (avgVolume * volumeMultiplier); // 2x baseline volume
                const isCompressedSpread = priceSpread < (avgSpread * 0.5); // Spread is under half the average // 

                // 5. Visual Trend Classification Matrix 
                if (isVolumeSpike && isCompressedSpread)
                { // High Effort + No Result =Institutional Churn Node 
                    enrichedCandle.classification = "CHURN_NODE";
                    enrichedCandle.visualColor = hours === 9 ? '#00FFFF' : "#FFFF00"; // Bright Neon Yellow 
                    let daysBetween = differenceInBusinessDays(new Date(), enrichedCandle.Timestamp)
                    if (daysBetween < 20 && enrichedCandle.isInstitutionalHour) institutionalCandles.push(enrichedCandle)

                } else if (!isVolumeSpike && priceSpread > avgSpread)
                {
                    // Low Effort + Clean Result = Low resistance continuation 
                    enrichedCandle.classification = "EFFICIENT_DRIVE";
                    enrichedCandle.visualColor = candle.ClosePrice > candle.OpenPrice ? "green" : "red"; // Neon Green/Red 
                }
                return enrichedCandle;

            }), institutionalCandles: institutionalCandles.reverse()
    }

}


/**
 * Processes multiple days of 5-minute candles to map out the historical 
 * volume distribution and identify institutional volume clustering.
 * 
 * @param {Array} candles - Array of objects: { Timestamp (UTC string), Volume, ... }
 * @returns {Array} An array of time buckets (09:30 to 16:00) with localized NY time and volume percentages
 */
export function calculateIntradayVolumeDistribution(candles)
{
    if (!candles || candles.length === 0) return [];

    // 1. Group raw data into 5-minute time slots (e.g., "09:35", "15:45")
    const timeSlots = {};
    const dailyTotals = {};

    candles.forEach(candle =>
    {
        // Convert UTC timestamp to New York Market Time
        const dateObj = new Date(candle.Timestamp);
        const nyString = dateObj.toLocaleString("en-US", { timeZone: "America/New_York" });
        const nyDate = new Date(nyString);

        // Isolate the trading date and the specific 5-minute clock time
        const dateKey = nyDate.toISOString().split('T')[0];
        const hours = String(nyDate.getHours()).padStart(2, '0');
        const minutes = String(nyDate.getMinutes()).padStart(2, '0');
        const timeKey = `${hours}:${minutes}`;

        // Exclude pre-market and after-hours data points
        if (timeKey < "09:30" || timeKey > "16:00") return;

        // Accumulate volume for this specific time slot across history
        if (!timeSlots[timeKey]) { timeSlots[timeKey] = { totalVolume: 0, sampleCount: 0 }; }
        timeSlots[timeKey].totalVolume += candle.Volume;
        timeSlots[timeKey].sampleCount += 1;

        // Keep track of the total volume per day for normalization calculations
        if (!dailyTotals[dateKey]) dailyTotals[dateKey] = 0;
        dailyTotals[dateKey] += candle.Volume;
    });

    // 2. Compute the average absolute volume for each 5-minute interval
    const profile = Object.keys(timeSlots).map(time =>
    {
        const bucket = timeSlots[time];
        return {
            timeLabel: time,
            averageVolume: Math.round(bucket.totalVolume / bucket.sampleCount),
            distributionPercentage: 0 // Will be calculated in the next step
        };
    });

    // Sort chronologically from market open (09:30) to market close (16:00)
    profile.sort((a, b) => a.timeLabel.localeCompare(b.timeLabel));

    // 3. Normalize: Convert absolute averages into a total share of the daily volume pie
    const totalProfileVolume = profile.reduce((sum, bucket) => sum + bucket.averageVolume, 0);

    return profile.map(bucket =>
    {
        // Percentage of the regular trading day's volume that flows through this exact 5 minutes
        const pct = (bucket.averageVolume / totalProfileVolume) * 100;

        // 4. Attach UI visual triggers directly to the data payload
        let sessionZone = "MID_DAY";
        let dashboardColor = "#444444"; // Matte gray for low-impact midday chop

        if (bucket.timeLabel <= "10:30")
        {
            sessionZone = "MORNING_STRIKE";
            dashboardColor = "#00FFFF"; // Cyan block marker
        } else if (bucket.timeLabel >= "15:00")
        {
            sessionZone = "CLOSING_STRIKE";
            dashboardColor = "#FFFF00"; // Yellow block marker
        }

        return {
            time: bucket.timeLabel,
            avgVolume: bucket.averageVolume,
            volumeSharePercent: parseFloat(pct.toFixed(3)),
            sessionZone: sessionZone,
            visualAnchorColor: dashboardColor
        };
    });
}

/**
 * Processes multiple days of 5-minute candles to calculate the historical probability
 * of the daily high or daily low printing during specific 5-minute intervals.
 * 
 * @param {Array} candles - Array of objects: { Timestamp (UTC string), HighPrice, LowPrice, ... }
 * @returns {Array} An array of time buckets (09:30 to 16:00) with localized NY time and high/low print probabilities
 */
export function calculateHighLowTimeDistribution(candles)
{
    if (!candles || candles.length === 0) return [];

    // 1. Group candles by trading day (New York Time)
    const daysData = {};

    candles.forEach(candle =>
    {
        const dateObj = new Date(candle.Timestamp);
        const nyString = dateObj.toLocaleString("en-US", { timeZone: "America/New_York" });
        const nyDate = new Date(nyString);

        const dateKey = nyString.split(',')[0]; // Isolate date string: e.g., "6/2/2026"
        const hours = String(nyDate.getHours()).padStart(2, '0');
        const minutes = String(nyDate.getMinutes()).padStart(2, '0');
        const timeKey = `${hours}:${minutes}`;

        // Exclude pre-market and after-hours data points
        if (timeKey < "09:30" || timeKey > "16:00") return;

        if (!daysData[dateKey])
        {
            daysData[dateKey] = [];
        }

        daysData[dateKey].push({
            time: timeKey,
            high: candle.HighPrice,
            low: candle.LowPrice
        });
    });

    // 2. Track tally of hits for each 5-minute slot across history
    const timeBucketStats = {};
    let totalValidDays = 0;

    // Initialize all possible regular session time keys to ensure smooth rendering
    for (let h = 9; h <= 16; h++)
    {
        const startM = (h === 9) ? 30 : 0;
        const endM = (h === 16) ? 0 : 55;
        for (let m = startM; m <= endM; m += 5)
        {
            const timeKey = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            timeBucketStats[timeKey] = { highCount: 0, lowCount: 0 };
        }
    }

    // 3. Scan day by day to isolate the exact time of the daily high and daily low
    Object.keys(daysData).forEach(dateKey =>
    {
        const dayCandles = daysData[dateKey];
        if (dayCandles.length === 0) return;

        totalValidDays++;

        let dailyHigh = -Infinity;
        let dailyLow = Infinity;
        let timeOfHigh = "";
        let timeOfLow = "";

        // Find the absolute highest high and lowest low for this trading day
        dayCandles.forEach(candle =>
        {
            if (candle.high > dailyHigh)
            {
                dailyHigh = candle.high;
                timeOfHigh = candle.time;
            }
            if (candle.low < dailyLow)
            {
                dailyLow = candle.low;
                timeOfLow = candle.time;
            }
        });

        // Increment the counts for the specific time slots that caught the extreme pivots
        if (timeBucketStats[timeOfHigh]) timeBucketStats[timeOfHigh].highCount++;
        if (timeBucketStats[timeOfLow]) timeBucketStats[timeOfLow].lowCount++;
    });

    // 4. Normalize absolute tallies into raw percentage probabilities
    const resultProfile = Object.keys(timeBucketStats).map(timeKey =>
    {
        const stats = timeBucketStats[timeKey];

        // Combined probability that EITHER the high or low of the day forms in this 5 minutes
        const highProb = (stats.highCount / totalValidDays) * 100;
        const lowProb = (stats.lowCount / totalValidDays) * 100;
        const combinedProb = highProb + lowProb;

        // Visual categorization matching the "Traffic Light" dashboard layout
        let sessionZone = "MID_DAY";
        let visualAnchorColor = "#333333"; // Matte gray background for low-prob zones

        if (timeKey <= "10:30" || timeKey >= "15:00")
        {
            sessionZone = "STRIKE_ZONE";
            visualAnchorColor = "#FF3366"; // Vibrant crimson for high probability time bands
        }

        return {
            time: timeKey,
            highPrintProbability: parseFloat(highProb.toFixed(2)),
            lowPrintProbability: parseFloat(lowProb.toFixed(2)),
            combinedProbability: parseFloat(combinedProb.toFixed(2)),
            sessionZone: sessionZone,
            visualAnchorColor: visualAnchorColor
        };
    });

    // Return chronologically sorted data array ready for D3 component rendering
    return resultProfile.sort((a, b) => a.time.localeCompare(b.time));
}



/**
 * Calculates the exact historical percentage of days where the daily high and daily low
 * were established during the Morning, Midday, or Closing sessions (New York Market Time).
 * 
 * @param {Array} candles - Array of 5-minute candle objects: { Timestamp, HighPrice, LowPrice, ... }
 * @returns {Object} Comprehensive session statistics ready for visual dashboard rendering
 */
export function calculateExtendedSessionProbabilities(candles)
{
    if (!candles || candles.length === 0)
    {
        return { totalDaysAnalyzed: 0, stats: null };
    }

    // 1. Group the 5-minute candles by day (using New York market time strings)
    const daysData = {};

    candles.forEach(candle =>
    {
        const dateObj = new Date(candle.Timestamp);
        // Safely convert UTC to New York Market time
        const nyString = dateObj.toLocaleString("en-US", { timeZone: "America/New_York" });

        // Extract distinct date and clock time
        const [datePart, timePart] = nyString.split(", ");
        const [rawTime, ampm] = timePart.split(" ");
        let [hours, minutes] = rawTime.split(":");

        // Normalize to a clean 24-hour HH:MM format for strict string comparison
        let hourNum = parseInt(hours);
        if (ampm === "PM" && hourNum !== 12) hourNum += 12;
        if (ampm === "AM" && hourNum === 12) hourNum = 0;
        const timeKey = `${String(hourNum).padStart(2, "0")}:${minutes.padStart(2, "0")}`;

        // Filter out pre-market and after-hours data points
        if (timeKey < "09:30" || timeKey > "16:00") return;

        if (!daysData[datePart])
        {
            daysData[datePart] = [];
        }

        daysData[datePart].push({
            time: timeKey,
            high: candle.HighPrice,
            low: candle.LowPrice
        });
    });

    // 2. Initialize our historical session counter variables
    let totalDays = 0;

    let morningHighs = 0;   // 09:30 - 10:30 AM
    let morningLows = 0;

    let closingHighs = 0;   // 15:00 - 16:00 PM (3:00 - 4:00 PM)
    let closingLows = 0;

    let middayHighs = 0;    // 10:31 AM - 14:59 PM (The middle chop zone)
    let middayLows = 0;

    // 3. Process each trading day individually
    Object.keys(daysData).forEach(dateKey =>
    {
        const dayCandles = daysData[dateKey];
        if (dayCandles.length === 0) return;

        totalDays++;

        let dailyHigh = -Infinity;
        let dailyLow = Infinity;
        let timeOfHigh = "";
        let timeOfLow = "";

        // Track down the exact 5-minute coordinate of the daily extremes
        dayCandles.forEach(candle =>
        {
            if (candle.high > dailyHigh)
            {
                dailyHigh = candle.high;
                timeOfHigh = candle.time;
            }
            if (candle.low < dailyLow)
            {
                dailyLow = candle.low;
                timeOfLow = candle.time;
            }
        });

        // Evaluate the HIGH time slot matrix
        if (timeOfHigh >= "09:30" && timeOfHigh <= "10:30")
        {
            morningHighs++;
        } else if (timeOfHigh >= "15:00" && timeOfHigh <= "16:00")
        {
            closingHighs++;
        } else
        {
            middayHighs++;
        }

        // Evaluate the LOW time slot matrix
        if (timeOfLow >= "09:30" && timeOfLow <= "10:30")
        {
            morningLows++;
        } else if (timeOfLow >= "15:00" && timeOfLow <= "16:00")
        {
            closingLows++;
        } else
        {
            middayLows++;
        }
    });

    if (totalDays === 0) return { totalDaysAnalyzed: 0, stats: null };

    // Helper utility to convert raw numbers safely into rounded percentages
    const toPercent = (count) => parseFloat(((count / totalDays) * 100).toFixed(2));

    // 4. package up the statistical coordinates
    return {
        totalDaysAnalyzed: totalDays,
        morningSession: {
            timeFrame: "09:30 AM - 10:30 AM ET",
            highPrintedPercent: toPercent(morningHighs),
            lowPrintedPercent: toPercent(morningLows)
        },
        middaySession: {
            timeFrame: "10:31 AM - 02:59 PM ET",
            highPrintedPercent: toPercent(middayHighs),
            lowPrintedPercent: toPercent(middayLows)
        },
        closingSession: {
            timeFrame: "03:00 PM - 04:00 PM ET",
            highPrintedPercent: toPercent(closingHighs),
            lowPrintedPercent: toPercent(closingLows)
        }
    };
}


/**
 * Layers the Reversal Vulnerability Score (RVS) with a Multi-Day Contingency Matrix.
 * Compares a standard percentage drop against a drop that also features an open "Air Pocket" above it.
 * 
 * @param {Array} dailyCandles - Daily candles: [{ Timestamp, ClosePrice }, ...]
 * @param {Array} intradayCandles - Full array of historical 5-minute candles containing Volume and ClosePrice
 * @param {number} dropThreshold - Daily drop trigger (e.g., -0.03 for a 3% drop)
 * @param {number} lowRvsMaxThreshold - The maximum allowed RVS score to qualify as a "Clean Air Pocket" (default: 35%)
 */
export function evaluateRvsWinRateBoost(dailyCandles, intradayCandles, dropThreshold = -0.03, lowRvsMaxThreshold = 35.0)
{
    const targetDrop = dropThreshold > 0 ? -dropThreshold : dropThreshold;

    // Track metrics for ALL setups (Baseline) vs ONLY Low RVS setups (Our Edge)
    const baselineStats = { totalSetups: 0, day2UpCount: 0, day2DownCount: 0, totalDay2Return: 0 };
    const lowRvsStats = { totalSetups: 0, day2UpCount: 0, day2DownCount: 0, totalDay2Return: 0 };

    // Group intraday 5-minute candles by day for instant historical lookup
    const intradayByDay = {};
    intradayCandles.forEach(candle =>
    {
        const dateKey = candle.Timestamp.split('T')[0]; // Extract YYYY-MM-DD
        if (!intradayByDay[dateKey]) intradayByDay[dateKey] = [];
        intradayByDay[dateKey].push(candle);
    });

    // Loop through the daily candle dataset, stopping before the end to allow for a 2-day forward check
    for (let i = 5; i < dailyCandles.length - 2; i++)
    {
        const previousClose = dailyCandles[i - 1].ClosePrice;
        const currentClose = dailyCandles[i].ClosePrice;
        const currentDailyDate = dailyCandles[i].Timestamp.split('T')[0];

        const dailyMove = (currentClose - previousClose) / previousClose;

        // Condition 1: A sudden percentage drop occurs
        if (dailyMove <= targetDrop)
        {
            baselineStats.totalSetups++;

            // Track what happens exactly 2 days later relative to today's daily close
            const closeDay2 = dailyCandles[i + 2].ClosePrice;
            const returnDay2 = (closeDay2 - currentClose) / currentClose;

            baselineStats.totalDay2Return += returnDay2;
            if (returnDay2 > 0) baselineStats.day2UpCount++;
            else baselineStats.day2DownCount++;

            // Condition 2: Deep dive into the intraday volume profile up to this specific historical day
            // We isolate the pattern by slicing the intraday data from 5 days prior up to the current drop day close
            let historicalPatternIntraday = [];
            for (let j = i - 5; j <= i; j++)
            {
                const pastDateKey = dailyCandles[j].Timestamp.split('T')[0];
                if (intradayByDay[pastDateKey])
                {
                    historicalPatternIntraday = historicalPatternIntraday.concat(intradayByDay[pastDateKey]);
                }
            }

            if (historicalPatternIntraday.length > 0)
            {
                // Run the RVS calculation code directly on this historical snapshot
                const rvsMetrics = calculateHistoricalRvs(historicalPatternIntraday);

                // Check if this historical drop possessed a highly efficient "Air Pocket" sitting overhead
                if (rvsMetrics.rvsScorePercent <= lowRvsMaxThreshold)
                {
                    lowRvsStats.totalSetups++;
                    lowRvsStats.totalDay2Return += returnDay2;

                    if (returnDay2 > 0) lowRvsStats.day2UpCount++;
                    else lowRvsStats.day2DownCount++;
                }
            }
        }
    }

    // Helper to calculate percentages safely
    const calcWinRate = (stats) => stats.totalSetups === 0 ? 0 : parseFloat(((stats.day2UpCount / stats.totalSetups) * 100).toFixed(2));
    const calcAvgReturn = (stats) => stats.totalSetups === 0 ? 0 : parseFloat(((stats.totalDay2Return / stats.totalSetups) * 100).toFixed(2));

    const baselineWinRate = calcWinRate(baselineStats);
    const filteredWinRate = calcWinRate(lowRvsStats);

    return {
        dropThresholdAnalyzed: `${(targetDrop * 100).toFixed(2)}%`,
        rvsFilterThreshold: `<=${lowRvsMaxThreshold}%`,
        baselinePerformance: {
            totalSetupsFound: baselineStats.totalSetups,
            day2WinRatePercent: baselineWinRate,
            day2AverageReturnPercent: calcAvgReturn(baselineStats)
        },
        lowRvsFilteredPerformance: {
            totalSetupsFound: lowRvsStats.totalSetups,
            day2WinRatePercent: filteredWinRate,
            day2AverageReturnPercent: calcAvgReturn(lowRvsStats)
        },
        statisticalEdgeBoostPercent: parseFloat((filteredWinRate - baselineWinRate).toFixed(2))
    };
}

/**
 * Stripped down, fast helper to calculate RVS on a historical array segment
 */
function calculateHistoricalRvs(candles, binSizeCents = 0.50)
{
    const currentPrice = candles[candles.length - 1].ClosePrice;
    const volumeProfile = {};
    let totalVolumeAbove = 0;
    let overheadFrictionVolume = 0;

    candles.forEach(c =>
    {
        const bin = Math.floor(c.ClosePrice / binSizeCents) * binSizeCents;
        volumeProfile[bin] = (volumeProfile[bin] || 0) + c.Volume;
    });

    Object.keys(volumeProfile).forEach(binStr =>
    {
        const binPrice = parseFloat(binStr);
        if (binPrice > currentPrice)
        {
            totalVolumeAbove += volumeProfile[binStr];
            if (binPrice <= currentPrice * 1.02) overheadFrictionVolume += volumeProfile[binStr];
        }
    });

    const frictionRatio = totalVolumeAbove === 0 ? 0 : (overheadFrictionVolume / totalVolumeAbove);
    const prices = candles.map(c => c.ClosePrice);
    const position = (currentPrice - Math.min(...prices)) / (Math.max(...prices) - Math.min(...prices) || 1);

    return { rvsScorePercent: ((frictionRatio * 0.70) + (1 - Math.abs(position - 0.5) * 0.30)) * 100 };
}


/**
 * Advanced Multi-Directional Morning Stretch & Rebound Engine.
 * Calculates positive/negative opening extensions, average time of morning extremes,
 * and subsequent intraday rebound probabilities.
 * 
 * @param {Array} candles - Array of 5-minute candle objects: { Timestamp, OpenPrice, ClosePrice, HighPrice, LowPrice }
 * @returns {Object} Complete data report for dashboard time-gating and target mapping
 */
export function calculateCompleteMorningMetrics(candles)
{
    if (!candles || candles.length === 0)
    {
        return { totalDaysAnalyzed: 0, statistics: null };
    }

    // 1. Group the 5-minute candles by day (New York Market Time)
    const daysData = {};

    candles.forEach(candle =>
    {
        const dateObj = new Date(candle.Timestamp);
        const nyString = dateObj.toLocaleString("en-US", { timeZone: "America/New_York" });

        const [datePart, timePart] = nyString.split(", ");
        const [rawTime, ampm] = timePart.split(" ");
        let [hours, minutes] = rawTime.split(":");

        let hourNum = parseInt(hours);
        if (ampm === "PM" && hourNum !== 12) hourNum += 12;
        if (ampm === "AM" && hourNum === 12) hourNum = 0;
        const timeKey = `${String(hourNum).padStart(2, "0")}:${minutes.padStart(2, "0")}`;

        // Focus strictly on regular market hours (9:30 AM to 4:00 PM ET)
        if (timeKey < "09:30" || timeKey > "16:00") return;

        if (!daysData[datePart])
        {
            daysData[datePart] = [];
        }

        daysData[datePart].push({
            time: timeKey,
            open: candle.OpenPrice,
            high: candle.HighPrice,
            low: candle.LowPrice,
            close: candle.ClosePrice
        });
    });

    // 2. Trackers for Downward Openings (Downside Stretch & Rebound)
    let downOpeningDaysCount = 0;
    let downReboundSuccessCount = 0;
    let totalDownStretchPercent = 0;
    let totalDownReboundSizePercent = 0;
    let downBottomMinutesSum = 0; // For tracking average time of the low

    // Trackers for Upward Openings (Upside Stretch & Pullback)
    let upOpeningDaysCount = 0;
    let upPullbackSuccessCount = 0;
    let totalUpStretchPercent = 0;
    let totalUpPullbackSizePercent = 0;
    let upPeakMinutesSum = 0; // For tracking average time of the high

    // Helper to convert HH:MM string to absolute minutes from midnight
    const timeToMinutes = (timeStr) =>
    {
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
    };

    // Helper to convert absolute minutes back to an HH:MM AM/PM string for display
    const minutesToTimeString = (totalMinutes) =>
    {
        let h = Math.floor(totalMinutes / 60);
        let m = Math.round(totalMinutes % 60);
        let ampm = h >= 12 ? "PM" : "AM";
        h = h % 12;
        h = h ? h : 12; // Convert 0 to 12
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
    };

    // 3. Evaluate Day-by-Day Sequences
    Object.keys(daysData).forEach(dateKey =>
    {
        const dayCandles = daysData[dateKey];
        if (dayCandles.length === 0) return;

        // Enforce strict chronological tracking
        dayCandles.sort((a, b) => a.time.localeCompare(b.time));

        const dayOpenPrice = dayCandles[0].open;
        const morningSession = dayCandles.filter(c => c.time <= "10:30");

        // --- SECTION A: ANALYZE THE MORNING CORES (09:30 - 10:30 AM) ---
        let morningLow = Infinity;
        let timeOfMorningLow = "";
        let morningHigh = -Infinity;
        let timeOfMorningHigh = "";

        morningSession.forEach(candle =>
        {
            if (candle.low < morningLow)
            {
                morningLow = candle.low;
                timeOfMorningLow = candle.time;
            }
            if (candle.high > morningHigh)
            {
                morningHigh = candle.high;
                timeOfMorningHigh = candle.time;
            }
        });

        // --- SECTION B: DOWNSIDE ANALYSIS (Selling Stretch & Rebound) ---
        if (morningLow < dayOpenPrice)
        {
            downOpeningDaysCount++;

            // Calculate absolute size of the initial downside flush
            const downStretch = ((dayOpenPrice - morningLow) / dayOpenPrice) * 100;
            totalDownStretchPercent += downStretch;
            downBottomMinutesSum += timeToMinutes(timeOfMorningLow);

            // Scan the remaining candles AFTER the morning bottom to check for a full rebound
            let brokeOpenPrice = false;
            let maxHighAfterLow = -Infinity;
            const postLowCandles = dayCandles.filter(c => c.time > timeOfMorningLow);

            postLowCandles.forEach(c =>
            {
                if (c.high > dayOpenPrice) brokeOpenPrice = true;
                if (c.high > maxHighAfterLow) maxHighAfterLow = c.high;
            });

            if (brokeOpenPrice)
            {
                downReboundSuccessCount++;
                const reboundSize = ((maxHighAfterLow - morningLow) / morningLow) * 100;
                totalDownReboundSizePercent += reboundSize;
            }
        }

        // --- SECTION C: UPSIDE ANALYSIS (Buying Stretch & Pullback) ---
        if (morningHigh > dayOpenPrice)
        {
            upOpeningDaysCount++;

            // Calculate absolute size of the initial upside spike
            const upStretch = ((morningHigh - dayOpenPrice) / dayOpenPrice) * 100;
            totalUpStretchPercent += upStretch;
            upPeakMinutesSum += timeToMinutes(timeOfMorningHigh);

            // Scan the remaining candles AFTER the morning peak to check for a reversal drop below open
            let brokeBelowOpenPrice = false;
            let minLowAfterHigh = Infinity;
            const postHighCandles = dayCandles.filter(c => c.time > timeOfMorningHigh);

            postHighCandles.forEach(c =>
            {
                if (c.low < dayOpenPrice) brokeBelowOpenPrice = true;
                if (c.low < minLowAfterHigh) minLowAfterHigh = c.low;
            });

            if (brokeBelowOpenPrice)
            {
                upPullbackSuccessCount++;
                const pullbackSize = ((morningHigh - minLowAfterHigh) / morningHigh) * 100;
                totalUpPullbackSizePercent += pullbackSize;
            }
        }
    });

    const totalDays = Object.keys(daysData).length;
    if (totalDays === 0) return { totalDaysAnalyzed: 0 };

    // 4. package up the unified statistical coordinates
    return {
        totalDaysScanned: totalDays,

        downsideMetrics: {
            sampleSizeDays: downOpeningDaysCount,
            averageInitialDropStretch: parseFloat((totalDownStretchPercent / (downOpeningDaysCount || 1)).toFixed(2)) + "%",
            averageTimeToBottom: downOpeningDaysCount ? minutesToTimeString(downBottomMinutesSum / downOpeningDaysCount) : "N/A",
            reboundProbability: parseFloat(((downReboundSuccessCount / (downOpeningDaysCount || 1)) * 100).toFixed(2)) + "%",
            averageSuccessfulReboundExpansion: downReboundSuccessCount ? parseFloat((totalDownReboundSizePercent / downReboundSuccessCount).toFixed(2)) + "%" : "N/A"
        },

        upsideMetrics: {
            sampleSizeDays: upOpeningDaysCount,
            averageInitialRallyStretch: parseFloat((totalUpStretchPercent / (upOpeningDaysCount || 1)).toFixed(2)) + "%",
            averageTimeToPeak: upOpeningDaysCount ? minutesToTimeString(upPeakMinutesSum / upOpeningDaysCount) : "N/A",
            pullbackBelowOpenProbability: parseFloat(((upPullbackSuccessCount / (upOpeningDaysCount || 1)) * 100).toFixed(2)) + "%",
            averageSuccessfulPullbackSize: upPullbackSuccessCount ? parseFloat((totalUpPullbackSizePercent / upPullbackSuccessCount).toFixed(2)) + "%" : "N/A"
        }
    };
}
/**
 * Aggregates 1-minute candle objects into sequential 5-minute time blocks starting at 09:30 AM ET,
 * completely halting collection after 10:30 AM ET.
 * 
 * @param {Array} oneMinCandles - Array of 1-min candles: { Timestamp, OpenPrice, ClosePrice, HighPrice, LowPrice, Volume }
 * @returns {Array} Array of exactly 13 aggregated 5-minute candle objects per trading day
 */
export function chunkOneMinToFiveMinCandles(oneMinCandles, preMarket)
{
    if (!oneMinCandles || oneMinCandles.length === 0) return [];

    const daysData = {};

    oneMinCandles.forEach(candle =>
    {

        const dateObj = new Date(candle.Timestamp);
        if (!isToday(dateObj)) return
        // Safely align the UTC timestamp with New York Stock Market Time
        const nyString = dateObj.toLocaleString("en-US", { timeZone: "America/New_York" });

        const [datePart, timePart] = nyString.split(", ");
        const [rawTime, ampm] = timePart.split(" ");
        let [hours, minutes] = rawTime.split(":");

        let hourNum = parseInt(hours);
        if (ampm === "PM" && hourNum !== 12) hourNum += 12;
        if (ampm === "AM" && hourNum === 12) hourNum = 0;

        const timeKey = `${String(hourNum).padStart(2, "0")}:${minutes.padStart(2, "0")}`;

        // CRITICAL UPDATE: Hard gate that rejects anything before 09:30 AM and strictly stops adding after 10:30 AM
        if (timeKey < "09:30" && !preMarket || timeKey > "10:30") return;
        if (timeKey > "09:30" && preMarket) return;

        if (!daysData[datePart]) { daysData[datePart] = []; }

        daysData[datePart].push({
            ...candle,
            timeKey: timeKey,
            hour: hourNum,
            minute: parseInt(minutes)
        });
    });

    const finalizedFiveMinCandles = [];

    // Process each isolated day up to the 10:30 AM hard stop
    Object.keys(daysData).forEach(dateKey =>
    {
        const dayCandles = daysData[dateKey];
        dayCandles.sort((a, b) => a.timeKey.localeCompare(b.timeKey));

        const fiveMinBuckets = {};

        dayCandles.forEach(candle =>
        {
            // Calculate absolute elapsed minutes from the 09:30 AM open anchor
            const elapsedMinutesSinceOpen = (candle.hour * 60 + candle.minute) - (9 * 60 + 30);

            // Map the elapsed timeline into distinct 5-minute chunk bins
            const bucketIndex = Math.floor(elapsedMinutesSinceOpen / 5);
            const startMinutesFromOpen = bucketIndex * 5;

            const bucketHour = 9 + Math.floor((30 + startMinutesFromOpen) / 60);
            const bucketMinute = (30 + startMinutesFromOpen) % 60;
            const bucketTimeKey = `${String(bucketHour).padStart(2, "0")}:${String(bucketMinute).padStart(2, "0")}`;

            if (!fiveMinBuckets[bucketTimeKey])
            {
                fiveMinBuckets[bucketTimeKey] = [];
            }
            fiveMinBuckets[bucketTimeKey].push(candle);
        });

        // Flatten the localized 5-minute segments into standard candlestick formats
        Object.keys(fiveMinBuckets).sort().forEach(timeKey =>
        {
            const bucketCandles = fiveMinBuckets[timeKey];

            const openPrice = bucketCandles[0].OpenPrice;
            const closePrice = bucketCandles[bucketCandles.length - 1].ClosePrice;
            const highPrice = Math.max(...bucketCandles.map(c => c.HighPrice));
            const lowPrice = Math.min(...bucketCandles.map(c => c.LowPrice));

            // Tally the total cumulative volume field executed across this specific 5-min block
            const totalCumulativeVolume = bucketCandles.reduce((sum, c) => sum + c.Volume, 0);

            finalizedFiveMinCandles.push({
                Timestamp: bucketCandles[0].Timestamp,
                Volume: totalCumulativeVolume
            });
        });
    });

    return finalizedFiveMinCandles;
}




export function chunkOneMinCandlesWithZeroFill(candles)
{
    if (!candles || candles.length === 0)
    {
        return { preMarket: [], mainMarket: [] };
    }

    // 1. Establish the boundary times based strictly on TODAY's date
    const today = new Date();

    const preMarketStart = new Date(today);
    preMarketStart.setHours(4, 0, 0, 0);

    const marketOpen = new Date(today);
    marketOpen.setHours(9, 30, 0, 0);

    const marketCutoff = new Date(today);
    marketCutoff.setHours(10, 30, 0, 0);

    const preMarketBins = {};
    const mainMarketBins = {};

    // 2. Pre-populate all 30-minute pre-market intervals for today
    let currentPreTime = new Date(preMarketStart);
    while (currentPreTime < marketOpen)
    {
        preMarketBins[currentPreTime.toISOString()] = {
            Timestamp: currentPreTime.toISOString(),
            Volume: 0
        };
        currentPreTime.setMinutes(currentPreTime.getMinutes() + 30);
    }

    // 3. Pre-populate all 5-minute main-market intervals for today
    let currentMainTime = new Date(marketOpen);
    while (currentMainTime <= marketCutoff)
    {
        mainMarketBins[currentMainTime.toISOString()] = {
            Timestamp: currentMainTime.toISOString(),
            Volume: 0
        };
        currentMainTime.setMinutes(currentMainTime.getMinutes() + 5);
    }

    // 4. Aggregate actual data, ignoring older days
    candles.forEach(candle =>
    {
        const time = new Date(candle.Timestamp);

        // Strict filter: Ignore any data that is not from today
        if (time.toDateString() !== today.toDateString()) return;

        // Filter out anything before 4:00 AM or after 10:30 AM
        if (time < preMarketStart || time > marketCutoff) return;

        if (time < marketOpen)
        {
            // Find the corresponding 30-minute block
            const minutes = Math.floor(time.getMinutes() / 30) * 30;
            const binTime = new Date(time);
            binTime.setMinutes(minutes, 0, 0);
            const binStr = binTime.toISOString();

            if (preMarketBins[binStr])
            {
                preMarketBins[binStr].Volume += candle.Volume;
            }
        } else
        {
            // Find the corresponding 5-minute block
            const minutes = Math.floor(time.getMinutes() / 5) * 5;
            const binTime = new Date(time);
            binTime.setMinutes(minutes, 0, 0);
            const binStr = binTime.toISOString();

            if (mainMarketBins[binStr])
            {
                mainMarketBins[binStr].Volume += candle.Volume;
            }
        }
    });

    // Helper to turn map objects back into sorted arrays
    const convertAndSort = (binsObject) =>
    {
        return Object.values(binsObject).sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));
    };

    return {
        preMarket: convertAndSort(preMarketBins),
        mainMarket: convertAndSort(mainMarketBins)
    };
}
