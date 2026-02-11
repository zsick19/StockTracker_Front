import { min, max } from "d3"

export const calculateEMADataPoints = (candleData, period) =>
{
    let emaArray = []
    let results = []
    var k = 2 / (period + 1);
    emaArray = [candleData[0].ClosePrice];
    for (var i = 1; i < candleData.length; i++) { emaArray.push(candleData[i].ClosePrice * k + emaArray[i - 1] * (1 - k)); }
    let emaLength = emaArray.length
    for (var i = 0; i < emaLength - 1; i++)
    {
        if (i > emaLength - 50) results.push({ date: candleData[i].Timestamp, value: emaArray[i] })
        else if (i % 5 === 0) results.push({ date: candleData[i].Timestamp, value: emaArray[i] });
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











export const calculateVolumeProfileDataPoints = (chartingData, binSize) =>
{
    // Initialize volume profile
    const volumeProfile = {};
    let comp = []

    for (let i = 0; i < chartingData.length; i++)
    {
        distributeVolume(chartingData[i].HighPrice, chartingData[i].LowPrice, chartingData[i].Volume, binSize);
    }

    for (const [price, volume] of Object.entries(volumeProfile))
    {
        comp.push({ x: parseFloat(price), y: volume })
    }

    function distributeVolume(high, low, volume, binSize)   
    {
        const startBin = getBin(low, binSize);
        const endBin = getBin(high, binSize);

        let totalBins = (endBin - startBin) / binSize + 1;
        const volumePerBin = volume / totalBins;

        for (let bin = startBin; bin <= endBin; bin += binSize)
        {
            if (volumeProfile[bin])
            {
                volumeProfile[bin] += volumePerBin;
            } else
            {
                volumeProfile[bin] = volumePerBin;
            }
        }
        // Function to calculate the bin for a given price
        function getBin(price, binSize) { return Math.floor(price / binSize) * binSize; }
    }
    // Extract bins (prices) and corresponding volumes from volumeProfile
    return comp.sort((a, b) => a.x - b.x)
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