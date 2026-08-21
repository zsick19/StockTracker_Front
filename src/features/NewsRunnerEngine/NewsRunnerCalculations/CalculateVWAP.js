/**
 * Processes a raw 5-second trade array to calculate Interval VWAP and update Anchored Session VWAP.
 * 
 * @param {Object} params
 * @param {Array} params.intervalTrades - The fresh array of trades from the latest 5-second polling response
 * @param {number} params.previousCumulativeVolume - The total shares traded across all intervals since startup
 * @param {number} params.previousCumulativeVwapValue - The running cumulative (Price * Size) value from the previous state
 * @returns {Object} Analytical payload containing metrics to append to your Redux/D3 dataset
 */
export function calculateNewsRunnerVWAPMetrics(
    intervalTrades,
    previousCumulativeVolume = 0,
    previousCumulativeVwapValue = 0
)
{
    // If a stock goes dead or halts for 5 seconds, fall back cleanly to 0 volume and copy forward
    if (!intervalTrades || intervalTrades.length === 0)
    {
        return {
            intervalVolume: 0,
            intervalVwap: 0,
            cumulativeVolume: previousCumulativeVolume,
            anchoredSessionVwap: previousCumulativeVolume > 0
                ? previousCumulativeVwapValue / previousCumulativeVolume
                : 0,
            cumulativeVwapValue: previousCumulativeVwapValue
        };
    }

    let intervalTotalVolume = 0;
    let intervalWeightedPriceSum = 0;

    // 1. Loop through the 5-second trade array to compute interval metrics
    for (let i = 0; i < intervalTrades.length; i++)
    {
        const trade = intervalTrades[i];
        const price = trade.Price;
        const size = trade.Size;

        intervalTotalVolume += size;
        intervalWeightedPriceSum += (price * size);
    }

    // Calculate the Volume-Weighted Average Price for just this 5-second snapshot block
    const intervalVwap = intervalTotalVolume > 0 ? (intervalWeightedPriceSum / intervalTotalVolume) : 0;

    // 2. Accumulate running metrics since inception to calculate the Anchored Session VWAP
    const currentCumulativeVolume = previousCumulativeVolume + intervalTotalVolume;
    const currentCumulativeVwapValue = previousCumulativeVwapValue + intervalWeightedPriceSum;

    const anchoredSessionVwap = currentCumulativeVolume > 0
        ? (currentCumulativeVwapValue / currentCumulativeVolume)
        : 0;

    return {
        intervalVolume: intervalTotalVolume,
        intervalVwap: intervalVwap,                       // Used to compare against lastPrice for instant slippage
        cumulativeVolume: currentCumulativeVolume,         // Passed forward to the next 5s interval loop
        anchoredSessionVwap: anchoredSessionVwap,         // Plotted as a line directly on your D3 price chart
        cumulativeVwapValue: currentCumulativeVwapValue    // Passed forward to the next 5s interval loop
    };
}
