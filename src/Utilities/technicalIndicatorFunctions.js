import { min, max } from "d3"

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
    return bars.map(bar =>
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
        return result
    });
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
                Timestamp:candle.Timestamp,
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
        histogram: macdLine[i] - signalLine[i]
    }))
}

export function calculateYAxisRange(macdData, paddingPercent = 0.15)
{
    let globalMax = 0;
    let globalMin = 0;

    macdData.forEach(item =>
    {
        // Check all three components to find the true extremes
        const localMax = Math.max(item.macd, item.signal, item.histogram);
        const localMin = Math.min(item.macd, item.signal, item.histogram);

        if (localMax > globalMax) globalMax = localMax;
        if (localMin < globalMin) globalMin = localMin;
    });

    // Find the absolute furthest point from zero to keep chart symmetrical
    const absoluteExtreme = Math.max(Math.abs(globalMax), Math.abs(globalMin));

    // Apply padding
    const paddedLimit = absoluteExtreme * (1 + paddingPercent);

    return {
        min: -paddedLimit, // Negative limit for the bottom
        max: paddedLimit,  // Positive limit for the top
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


export function calculateVortex(chartingData, timeBlock = 14)
{
    let trueRange = []
    let VMPlus = []
    let VMMinus = []
    for (let i = 1; i < chartingData.length - 1; i++)
    {
        let currentHighMinusCurrentLow1 = chartingData[i].HighPrice - chartingData[i].LowPrice
        let currentHighMinusPreviousClose2 = Math.abs(chartingData[i].HighPrice - chartingData[i - 1].ClosePrice)
        let currentLowMinusPreviousClose3 = Math.abs(chartingData[i].LowPrice - chartingData[i - 1].ClosePrice)

        let largest = Math.max(currentHighMinusCurrentLow1, currentHighMinusPreviousClose2, currentLowMinusPreviousClose3)

        trueRange.push(largest)
        VMPlus.push(chartingData[i].HighPrice - chartingData[i - 1].LowPrice)
        VMMinus.push(chartingData[i].LowPrice - chartingData[i - 1].HighPrice)

    }

    let vortexIndicatorPlus = []
    let vortexIndicatorMinus = []

    for (let i = 0; i < VMPlus.length; i++)
    {
        let slicedTR = trueRange.slice(i, i + timeBlock)
        let slicedVMPlus = VMPlus.slice(i, i + timeBlock)
        let slicedVMMinus = VMMinus.slice(i, i + timeBlock)

        let summedTR = slicedTR.reduce((partialSum, a) => partialSum + a, 0)
        let plus = slicedVMPlus.reduce((partialSum, a) => partialSum + a, 0) / summedTR
        let minus = slicedVMMinus.reduce((partialSum, a) => partialSum + a, 0) / summedTR

        vortexIndicatorPlus.push({ date: chartingData[i].Timestamp, value: plus })
        vortexIndicatorMinus.push({ date: chartingData[i].Timestamp, value: Math.abs(minus) })
    }
    //does the i get adjusted at all for the shift 

    return { vortexIndicatorPlus, vortexIndicatorMinus }
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