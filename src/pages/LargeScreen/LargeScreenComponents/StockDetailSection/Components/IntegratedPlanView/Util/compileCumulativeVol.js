/**
 * PRODUCTION COMPILER: compileCumulativeChartData
 * Converts interval bars into running cumulative totals and pairs them 
 * directly with live session volume strings for D3 chart injection [INDEX].
 * 
 * @param {Array} todaysLiveCandles - Array of streaming intraday regular session bars
 * @param {Object} planEntity - Fully hydrated MongoDB stock document tracking your historical arrays [INDEX]
 * @returns {Array} Flat JSON array array of matching coordinates: [{ label: "09:35", baseVolume: 50000, liveVolume: 62000 }]
 */
export function compileCumulativeChartData(todaysLiveCandles, fiveMinUpDay, fiveMinDownDay)
{

    const rawHistoricalIntervalArray = fiveMinUpDay
    const rawHistoricalIntervalArrayDown = fiveMinDownDay

    if (rawHistoricalIntervalArray.length === 0) return [];

    // 2. BUILD THE CUMULATIVE HISTORICAL TIMELINE BASELINE [INDEX]
    const cumulativeHistoricalBaselines = [];
    let runningHistoricalSum = 0;
    const cumulativeHistoricalBaselinesDown = [];
    let runningHistoricalSumDown = 0;

    for (let i = 0; i < rawHistoricalIntervalArray.length; i++)
    {
        runningHistoricalSum += rawHistoricalIntervalArray[i];
        cumulativeHistoricalBaselines.push(runningHistoricalSum);
    }
    for (let i = 0; i < rawHistoricalIntervalArrayDown.length; i++)
    {
        runningHistoricalSumDown += rawHistoricalIntervalArrayDown[i];
        cumulativeHistoricalBaselinesDown.push(runningHistoricalSumDown);
    }

    return {
        baseLineUp: cumulativeHistoricalBaselines,
        baseLineDown: cumulativeHistoricalBaselinesDown
    }


}
