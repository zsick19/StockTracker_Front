/**
 * Core Scalar EMA Calculator.
 */
export function calculateArrayEma(pricesArray, period)
{
    if (!pricesArray || pricesArray.length === 0) return 0;
    const k = 2 / (period + 1);
    let emaVal = pricesArray[0];
    for (let i = 1; i < pricesArray.length; i++)
    {
        emaVal = (pricesArray[i] * k) + (emaVal * (1 - k));
    }
    return parseFloat(emaVal.toFixed(2));
}



setAllHistoricalPlans: (state, action) =>
{
    // Expects raw incoming backend multi-horizon payload: { AMD: { plan: {}, candles: [] }, ... }
    const backendPayload = action.payload;

    const transformedEntities = Object.keys(backendPayload).map(symbol =>
    {
        const data = backendPayload[symbol];
        const rawCandlesArray = data.candles || [];

        // 1. PHASE A: Strip away all pre-market / after-hours candles immediately [INDEX]
        const cleanRegularHoursCandles = filterRegularSessionCandles(rawCandlesArray);

        // 2. PHASE B: Detect asset class and run your targeted historical profile function [INDEX]
        const isPennyScalp = data.plan?.patternClassification === "TOOL_4_CONTINUATION_MOMENTUM" ||
            data.plan?.channelPattern?.channelType === "SUB_ENGINE_PENNY_STOCK_SCALP";

        let baselineIndicators = {};

        if (isPennyScalp)
        {
            // Process the 3-day 1-minute historical array [INDEX]
            baselineIndicators = compileHistoricalOneMinPennyBaselines(cleanRegularHoursCandles);
        } else
        {
            // Process the 10-day 5-minute historical array [INDEX]
            baselineIndicators = compileHistoricalFiveMinPlanBaselines(data.plan, cleanRegularHoursCandles);
        }

        // 3. PHASE C: Compile clean arrays to extract standard daily indicator averages
        const closePrices = cleanRegularHoursCandles.map(c => c.ClosePrice);

        return {
            tickerSymbol: symbol,
            planConfig: data.plan, // Your static Mongoose indicator configurations
            historicalCandles: cleanRegularHoursCandles, // Pure, frozen baseline [INDEX]
            todaysCandles: [], // Blank on application boot
            compiledExecutionCandles: cleanRegularHoursCandles,

            // INJECT PRE-COMPILED SCALAR indicator FIELDS DIRECTLY INTO MEMORY METRICS CACHE
            // This ensures your 1-minute live loops run instant mathematical calculations
            // without ever needing to execute an array loop pass during session hours! [INDEX]
            liveAuctionMetrics: {
                lastTradePrice: closePrices.length > 0 ? closePrices[closePrices.length - 1] : 0.00,
                auditedRollingVolume: 0,
                liveTicksPerSecond: 0.0,

                // Mount our calculated historical constants safely onto the plan entity
                staticHistoryTouchCount: baselineIndicators.staticHistoryTouchCount || 0,
                volumeCliffPrice: baselineIndicators.volumeCliffPrice || 0,
                baselineAvgOneMinVolume: baselineIndicators.baselineAvgOneMinVolume || 0,
                historicalAtr: baselineIndicators.historicalAtr || 0.0,

                // Seed baseline averages
                ema50Line: calculateArrayEma(closePrices, 50),
                ema200Line: calculateArrayEma(closePrices, 200)
            }
        };
    });

    // Hydrate your central Plan Entity Adapter cache dictionary with flawless structural safety [INDEX]
    candlesAdapter.setAll(state, transformedEntities);
    console.log("🚀 Cold-Boot Pipeline Completed: All 1-min and 5-min baselines fully compiled and cached.");
}
