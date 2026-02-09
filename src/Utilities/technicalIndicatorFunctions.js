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


export const calculateRSI = (chartingData, averageBlock = 14) =>
{
    let upwardMovement = []
    let downwardMovement = []
    let averageUpwardMovement = []
    let averageDownwardMovement = []
    let rsi = []

    for (let i = 0; i < chartingData.length - 1; i++)
    {
        if (chartingData[i + 1].ClosePrice > chartingData[i].ClosePrice)
            upwardMovement.push(chartingData[i + 1].ClosePrice - chartingData[i].ClosePrice)
        else upwardMovement.push(0)

        if (chartingData[i + 1].ClosePrice < chartingData[i].ClosePrice)
            downwardMovement.push(chartingData[i].ClosePrice - chartingData[i + 1].ClosePrice)
        else downwardMovement.push(0)
    }

    for (let i = averageBlock - 1; i < upwardMovement.length - 1; i++)
    {
        let sumUp = 0
        let sumDown = 0
        for (let j = 0; j < i; j++)
        {
            sumUp = sumUp + upwardMovement[j]
            sumDown = sumDown + downwardMovement[j]
        }
        averageUpwardMovement.push(sumUp / averageBlock)
        averageDownwardMovement.push(sumDown / averageBlock)
    }

    for (let i = 0; i < averageUpwardMovement.length - 1; i++)
    {
        let relative = averageUpwardMovement[i] / averageDownwardMovement[i]
        rsi.push({ x: chartingData[i + averageBlock].Timestamp, y: 100 - (100 / (relative + 1)) })
    }
    return rsi
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