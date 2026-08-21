/**
 * Processes incoming incremental 5-second polling updates for trades and quotes.
 * 
 * @param {Object} params
 * @param {Array} params.newTrades - Incremental trades fetched from the latest polling window
 * @param {Array} params.newQuotes - Incremental quotes fetched from the latest polling window
 * @param {Object} params.currentMonitorState - The current state object pulled from your local cache/Redux store
 * @returns {Object} Analytical payload containing updated cursors, structural caches, and fresh chart intervals
 */
export function processNewsRunnerTradeAndQuoteInterval(newTrades, newQuotes, currentMonitorState)
{
    const {
        largeOrderThreshold,
        tradeCursor,
        quoteCursor,
        lastKnownPrice,
        tradeCache = [],
        quoteCache = []
    } = currentMonitorState;

    // 1. Array Optimization & Ingestion (Clean up inputs and preserve continuity)
    const incomingTrades = [...(newTrades || [])];
    const incomingQuotes = [...(newQuotes || [])];

    // Combine historical memory caches with newly arrived ticks
    let combinedTrades = [...tradeCache, ...incomingTrades].sort((a, b) => Date.parse(a.Timestamp) - Date.parse(b.Timestamp));
    let combinedQuotes = [...quoteCache, ...incomingQuotes].sort((a, b) => Date.parse(a.Timestamp) - Date.parse(b.Timestamp));

    // Edge Case 2 Fix: Dedup incoming arrays using strict greater-than filter against existing cursors
    if (tradeCursor)
    {
        const cutoffTime = Date.parse(tradeCursor);
        // Keep only elements that are chronologically strictly newer than our state anchor tracker
        combinedTrades = combinedTrades.filter(t => Date.parse(t.Timestamp) > cutoffTime);
    }
    if (quoteCursor)
    {
        const cutoffTime = Date.parse(quoteCursor);
        combinedQuotes = combinedQuotes.filter(q => Date.parse(q.Timestamp) > cutoffTime);
    }

    // 2. Edge Case 1 Handling: No fresh volume printed this cycle
    if (combinedTrades.length === 0)
    {
        return {
            hasUpdates: false,
            cursors: {
                tradeTimestamp: tradeCursor, // Preserve old cursor baseline tracking
                quoteTimestamp: incomingQuotes.length > 0 ? incomingQuotes[incomingQuotes.length - 1].Timestamp : quoteCursor,
                lastTradePrice: lastKnownPrice
            },
            newIntervalMetrics: { largeVolume: 0, smallVolume: 0, aggressionDelta: 0, lastPrice: lastKnownPrice,totalVolume:0 },
            updatedCache: {
                trades: tradeCache.slice(-30),
                quotes: combinedQuotes.slice(-30) // Update quote cache even if trade cache stays flat
            }
        };
    }

    // Extract fresh tracking string metrics to pass forward to the next cycle anchor loop
    const newTradeCursor = combinedTrades[combinedTrades.length - 1].Timestamp;
    const newQuoteCursor = combinedQuotes.length > 0 ? combinedQuotes[combinedQuotes.length - 1].Timestamp : quoteCursor;

    // 3. Execution Integration Matrix Loops
    let intervalDelta = 0;
    let intervalLargeVolume = 0;
    let intervalSmallVolume = 0;
    let activePricePointer = lastKnownPrice;

    // Pivot quote pointer relative to the baseline cache layer
    let activeQuotePointer = 0;

    combinedTrades.forEach((trade) =>
    {
        const tradeTime = Date.parse(trade.Timestamp);
        const tradeSize = trade.Size;
        const tradePrice = trade.Price;

        // A. Separate size allocations into relative histogram segments
        if (tradeSize >= largeOrderThreshold)
        {
            intervalLargeVolume += tradeSize;
        } else
        {
            intervalSmallVolume += tradeSize;
        }

        // B. Linear scan pointer matching logic to bind trade to the appropriate quote interval
        while (
            activeQuotePointer < combinedQuotes.length - 1 &&
            Date.parse(combinedQuotes[activeQuotePointer + 1].Timestamp) <= tradeTime
        )
        {
            activeQuotePointer++;
        }

        const matchedQuote = combinedQuotes[activeQuotePointer];

        // C. Structural Center-Line Aggression Evaluation
        if (matchedQuote && matchedQuote.BidPrice && matchedQuote.AskPrice)
        {
            const midPrice = (matchedQuote.BidPrice + matchedQuote.AskPrice) / 2;

            if (tradePrice > midPrice)
            {
                intervalDelta += tradeSize; // Hit the Ask
            } else if (tradePrice < midPrice)
            {
                intervalDelta -= tradeSize; // Hit the Bid
            } else
            {
                // Exact Midpoint Executions (The Tick Test Rule)
                if (activePricePointer !== null)
                {
                    if (tradePrice > activePricePointer) intervalDelta += tradeSize; // Up-Tick
                    else if (tradePrice < activePricePointer) intervalDelta -= tradeSize; // Down-Tick
                }
            }
        } else
        {
            // Fallback Raw Tick Test if Quotes collection is temporarily disconnected
            if (activePricePointer !== null)
            {
                if (tradePrice > activePricePointer) intervalDelta += tradeSize;
                else if (tradePrice < activePricePointer) intervalDelta -= tradeSize;
            }
        }

        activePricePointer = tradePrice;
    });

    return {
        hasUpdates: true,
        cursors: {
            tradeTimestamp: newTradeCursor,
            quoteTimestamp: newQuoteCursor,
            lastTradePrice: activePricePointer
        },
        // The metric payload passed straight to your chart's append method
        newIntervalMetrics: {
            largeVolume: intervalLargeVolume,
            smallVolume: intervalSmallVolume,
            aggressionDelta: intervalDelta,
            lastPrice: activePricePointer,
            totalVolume:intervalLargeVolume+intervalSmallVolume
        },
        // Edge Case 3 Fix: Enforce sliding memory truncation boundaries to block leaks
        updatedCache: {
            trades: combinedTrades.slice(-30),
            quotes: combinedQuotes.slice(-30)
        }
    };
}
