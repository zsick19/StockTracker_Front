/**
 * Calculates the time-weighted effective spread leakage for a 5-second polling interval.
 * 
 * @param {Array} intervalTrades - Array of trades from the latest 5-second polling fetch
 * @param {Array} intervalQuotes - Array of quotes from the latest 5-second polling fetch
 * @returns {number} The time-weighted average leakage value for this 5-second block
 */
export function calculateNewsRunnerSpreadLeakage(intervalTrades, intervalQuotes)
{
    if (!intervalTrades || intervalTrades.length === 0 || !intervalQuotes || intervalQuotes.length === 0)
    {
        return 0;
    }

    let totalWeightTimeMs = 0;
    let weightedLeakageSum = 0;
    let activeQuotePointer = 0;

    // Ensure items are sorted chronologically to run pointer tracking loops
    const sortedTrades = [...intervalTrades].sort((a, b) => Date.parse(a.Timestamp) - Date.parse(b.Timestamp));
    const sortedQuotes = extractMatchedQuotesArray(sortedTrades, intervalQuotes);

    for (let i = 0; i < sortedTrades.length; i++)
    {
        const trade = sortedTrades[i];
        const tradeTime = Date.parse(trade.Timestamp);

        // 1. Line up the trade with the active quote block
        while (
            activeQuotePointer < sortedQuotes.length - 1 &&
            Date.parse(sortedQuotes[activeQuotePointer + 1].Timestamp) <= tradeTime
        )
        {
            activeQuotePointer++;
        }

        const quote = sortedQuotes[activeQuotePointer];
        if (!quote || !quote.AskPrice || !quote.BidPrice) continue;

        // 2. Compute spread differentials
        const rawSpread = quote.AskPrice - quote.BidPrice;
        const midpoint = (quote.BidPrice + quote.AskPrice) / 2;
        const effectiveSpread = 2 * Math.abs(trade.Price - midpoint);

        const tradeLeakage = Math.max(0, effectiveSpread - rawSpread);

        // 3. Time weighting calculation logic
        // We weight each trade by the duration between itself and the next execution print
        let weightDuration = 50; // Default fallback: 50ms for the final trade in a block
        if (i < sortedTrades.length - 1)
        {
            weightDuration = Math.max(1, Date.parse(sortedTrades[i + 1].Timestamp) - tradeTime);
        }

        totalWeightTimeMs += weightDuration;
        weightedLeakageSum += (tradeLeakage * weightDuration);
    }

    return totalWeightTimeMs > 0 ? (weightedLeakageSum / totalWeightTimeMs) : 0;
}

/**
 * Synchronizes a batch of fresh trades with their corresponding active market quotes.
 * Returns an array of matched quotes parallel to the incoming trades array.
 * 
 * @param {Array} intervalTrades - Fresh, unsorted 5-second trade batch from Alpaca
 * @param {Array} rollingQuotes - Your local stored quote cache (includes history to ensure early match)
 * @returns {Array} A parallel array of matched quote objects matching the size/indices of intervalTrades
 */
export function extractMatchedQuotesArray(intervalTrades, rollingQuotes)
{
    if (!intervalTrades || intervalTrades.length === 0 || !rollingQuotes || rollingQuotes.length === 0)
    {
        return [];
    }

    // 1. Ensure data streams are chronologically synchronized
    const sortedTrades = intervalTrades
    const sortedQuotes = [...rollingQuotes].sort((a, b) => Date.parse(a.Timestamp) - Date.parse(b.Timestamp));

    const matchedQuotesResult = [];
    let quotePointer = 0;

    // 2. Run a two-pointer linear synchronization scan across the feeds
    for (let i = 0; i < sortedTrades.length; i++)
    {
        const tradeTime = Date.parse(sortedTrades[i].Timestamp);

        // Advance the quote pointer until it finds the quote closest to, but not past, the trade timestamp
        while (
            quotePointer < sortedQuotes.length - 1 &&
            Date.parse(sortedQuotes[quotePointer + 1].Timestamp) <= tradeTime
        )
        {
            quotePointer++;
        }

        // Capture the quote active at this exact transaction millisecond
        const activeQuote = sortedQuotes[quotePointer];

        // Fallback safeguard: If no quotes exist yet, append a placeholder to preserve array length structure
        matchedQuotesResult.push(activeQuote || { BidPrice: 0, AskPrice: 0, Timestamp: sortedTrades[i].Timestamp });
    }

    // Returns an array of quotes that perfectly mirrors the indices of your trade array
    return matchedQuotesResult;
}
