/**
 * Calculates the resting book liquidity imbalance from a 5-second quote array.
 * 
 * @param {Array} intervalQuotes - Fresh quotes from your 5-second polling response
 * @returns {number} The Imbalance Ratio: ranges from -1.0 (Heavy Ask Wall) to +1.0 (Heavy Bid Floor)
 */
export function calculateQuoteAskBidImbalance(intervalQuotes)
{
    if (!intervalQuotes || intervalQuotes.length === 0) return 0;

    let totalBidSize = 0;
    let totalAskSize = 0;

    for (let i = 0; i < intervalQuotes.length; i++)
    {
        const q = intervalQuotes[i];
        if (!q.BidSize || !q.AskSize) continue;

        totalBidSize += q.BidSize;
        totalAskSize += q.AskSize;
    }

    const totalDepth = totalBidSize + totalAskSize;
    if (totalDepth === 0) return 0;

    // Normalized Index Formula: Output values scale precisely between -1.0 and +1.0
    return (totalBidSize - totalAskSize) / totalDepth;
}
