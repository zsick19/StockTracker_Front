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


// Inside your existing setAllHistoricalPlans entity transformation loop:
const patternType = data.plan?.patternClassification;

let baselineIndicators = {};

if (patternType === "TOOL_4_CONTINUATION_MOMENTUM") {
    // 1. Route to the Continuation Momentum history engine
    baselineIndicators = compileHistoricalContinuationBaselines(data.plan, cleanRegularHoursCandles);
} 
else if (patternType === "TOOL_2_HORIZONTAL_CHANNEL") {
    // Double Check: Run penny stock math or standard stock math based on type [INDEX]
    if (data.plan?.channelPattern?.channelType === "SUB_ENGINE_PENNY_STOCK_SCALP") {
        baselineIndicators = compileHistoricalOneMinPennyBaselines(cleanRegularHoursCandles);
    } else {
        // 2. Route to the Standard Large-Cap Horizontal Channel history engine
        baselineIndicators = compileHistoricalStandardChannelBaselines(data.plan, cleanRegularHoursCandles);
    }
} 
else {
    // Fallback default routing to your Vertical Cascader engine
    baselineIndicators = compileHistoricalFiveMinPlanBaselines(data.plan, cleanRegularHoursCandles);
}

// Map the outputs safely into your liveAuctionMetrics layout parameters
return {
    tickerSymbol: symbol,
    planConfig: data.plan,
    historicalCandles: cleanRegularHoursCandles,
    todaysCandles: [],
    compiledExecutionCandles: cleanRegularHoursCandles,

    liveAuctionMetrics: {
        lastTradePrice: closePrices.length > 0 ? closePrices[closePrices.length - 1] : 0.00,
        auditedRollingVolume: 0,
        liveTicksPerSecond: 0.0,
        
        // SEED ALL CORE CONSTANTS HEADLESSLY ONTO THE STATE OBJECT
        staticHistoryTouchCount: baselineIndicators.staticHistoryTouchCount || 0,
        ceilingFatigueTouchCount: baselineIndicators.ceilingFatigueTouchCount || 0,
        isChannelHeightViable: baselineIndicators.isChannelHeightViable || false,
        
        historicalTrendHealthScore: baselineIndicators.historicalTrendHealthScore || 50,
        isPullbackVolumeDry: baselineIndicators.isPullbackVolumeDry || false,
        baseBreakoutVelocity: baselineIndicators.baseBreakoutVelocity || 0,

        volumeCliffPrice: baselineIndicators.volumeCliffPrice || 0,
        baselineAvgOneMinVolume: baselineIndicators.baselineAvgOneMinVolume || 0,
        historicalAtr: baselineIndicators.historicalAtr || 0.0
    }
};
