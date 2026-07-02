/**
 * PRODUCTION COMPILER: compileCumulativeChartData
 * Converts interval bars into running cumulative totals and pairs them 
 * directly with live session volume strings for D3 chart injection [INDEX].
 * 
 * @param {Array} todaysLiveCandles - Array of streaming intraday regular session bars
 * @param {Object} planEntity - Fully hydrated MongoDB stock document tracking your historical arrays [INDEX]
 * @returns {Array} Flat JSON array array of matching coordinates: [{ label: "09:35", baseVolume: 50000, liveVolume: 62000 }]
 */
export function compileCumulativeChartData(todaysLiveCandles, planEntity)
{
    if (!planEntity) return [];

    const morningVolMetrics = planEntity.morningVolumeMetrics || {};
    const isAssetUpOnDay = todaysLiveCandles?.[todaysLiveCandles.length - 1]?.ClosePrice >= planEntity.dailyTickerValues?.PrevDailyBar?.ClosePrice;

    // 1. Isolate your raw 5-minute interval array based on daily direction [INDEX]
    const rawHistoricalIntervalArray = isAssetUpOnDay
        ? (morningVolMetrics.fiveMinUpDay || [])
        : (morningVolMetrics.fiveMinDownDay || []);

    if (rawHistoricalIntervalArray.length === 0) return [];

    // 2. BUILD THE CUMULATIVE HISTORICAL TIMELINE BASELINE [INDEX]
    const cumulativeHistoricalBaselines = [];
    let runningHistoricalSum = 0;

    for (let i = 0; i < rawHistoricalIntervalArray.length; i++)
    {
        runningHistoricalSum += rawHistoricalIntervalArray[i];
        cumulativeHistoricalBaselines.push(runningHistoricalSum);
    }

    // 3. BUILD TODAY'S LIVE RUNNING CUMULATIVE TIMELINE
    const cleanRthCandles = (todaysLiveCandles || []).filter(candle =>
    {
        const rawTimestamp = candle.Timestamp || candle.t || candle.timestamp;
        if (!rawTimestamp) return false;
        const timeStr = new Date(rawTimestamp).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false });
        return timeStr >= "09:30:00" && timeStr <= "16:00:00";
    });

    // 4. MAP AND ALIGN CODES INTO 5-MINUTE TIME COORDINATE BLOCKS [INDEX]
    const chartCoordinatePayload = cumulativeHistoricalBaselines.map((historicalCumulativeSum, index) =>
    {
        const minutesElapsed = (index + 1) * 5;

        // Calculate timestamp label string (e.g., index 0 = 5 mins elapsed = "09:35")
        const targetHour = Math.floor((570 + minutesElapsed) / 60);
        const targetMinute = (570 + minutesElapsed) % 60;
        const timeLabel = `${targetHour}:${targetMinute < 10 ? '0' + targetMinute : targetMinute}`;

        // Accumulate today's live volume up to this exact 5-minute slice [INDEX]
        const candleSliceLimit = Math.min(cleanRthCandles.length, minutesElapsed);
        let liveCumulativeSum = 0;

        for (let j = 0; j < candleSliceLimit; j++)
        {
            liveCumulativeSum += (cleanRthCandles[j].Volume || cleanRthCandles[j].v || 0);
        }

        return {
            timeLabel,
            historicalBaselineVolume: historicalCumulativeSum, // Plotted as background Bar pillars [INDEX]
            // Plotted as foreground Line points. Set to null if the session clock hasn't reached it yet [INDEX]
            liveVolumeToday: cleanRthCandles.length >= minutesElapsed ? liveCumulativeSum : null
        };
    });

    return chartCoordinatePayload;
}
