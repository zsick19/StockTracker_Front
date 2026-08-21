import { extractMatchedQuotesArray } from "./SpreadLeakage";

/**
 * Calculates Hidden Iceberg Volume and Divergence ratios for a 5-second interval.
 * 
 * @param {Array} intervalTrades - Fresh trade array from the latest 5-second polling response
 * @param {Array} intervalQuotes - Fresh trade array from the latest 5-second polling response
 * @returns {Object} { icebergDetected: boolean, hiddenVolume: number, icebergRatio: number }
 */
export function calculateNewsRunnerIceberg(intervalTrades, intervalQuotes)
{

    let totalIntervalVolume = 0;
    let hiddenVolumeAccumulator = 0;
    const sortedTrades = [...intervalTrades].sort((a, b) => Date.parse(a.Timestamp) - Date.parse(b.Timestamp));

    const matchedQuotes = extractMatchedQuotesArray(sortedTrades, intervalQuotes);
    if (!intervalTrades || intervalTrades.length === 0 || !matchedQuotes || matchedQuotes.length === 0)
    {
        return { icebergDetected: false, hiddenVolume: 0, icebergRatio: 0 };
    }

    // Track the unique price levels where reloading behavior occurs in this 5s frame
    const askLevelTrackers = {};

    for (let i = 0; i < sortedTrades.length; i++)
    {
        const trade = sortedTrades[i];
        const quote = matchedQuotes[i];

        if (!quote || !quote.AskPrice || !quote.AskSize) continue;

        totalIntervalVolume += trade.Size;

        // We only care about trades executing EXACTLY at or above the visible Ask price
        if (trade.Price >= quote.AskPrice)
        {
            const priceKey = quote.AskPrice.toFixed(4);

            if (!askLevelTrackers[priceKey])
            {
                askLevelTrackers[priceKey] = {
                    accumulatedTradeVolume: 0,
                    initialVisibleSize: quote.AskSize
                };
            }

            askLevelTrackers[priceKey].accumulatedTradeVolume += trade.Size;
        }
    }

    // Evaluate if the total executed volume outpaced the visible book size
    const priceLevels = Object.keys(askLevelTrackers);
    for (let j = 0; j < priceLevels.length; j++)
    {
        const level = askLevelTrackers[priceLevels[j]];

        // Threshold Rule: If executed volume is 3x larger than the displayed book depth,
        // it confirms a hidden algorithm is reloading shares on an Iceberg.
        if (level.accumulatedTradeVolume > (level.initialVisibleSize * 3))
        {
            const hiddenShares = level.accumulatedTradeVolume - level.initialVisibleSize;
            hiddenVolumeAccumulator += hiddenShares;
        }
    }

    const icebergRatio = totalIntervalVolume > 0 ? (hiddenVolumeAccumulator / totalIntervalVolume) : 0;

    return {
        icebergDetected: hiddenVolumeAccumulator > 0,
        hiddenVolume: hiddenVolumeAccumulator,
        icebergRatio: icebergRatio // Percentage of interval volume that was "hidden" (0.0 to 1.0)
    };
}
