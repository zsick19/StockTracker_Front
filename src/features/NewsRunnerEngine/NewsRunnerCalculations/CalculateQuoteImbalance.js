/**
 * Calculates real-time quote size imbalance acceleration to spot trend turns.
 * 
 * @param {Array} intervalQuotes - Fresh 5-second quote batch array from Alpaca
 * @param {number} previousImbalanceRatio - The imbalance ratio from the previous 5s interval
 * @returns {Object} { currentImbalanceRatio, quoteVelocity, quoteAcceleration }
 */
export function calculateQuoteImbalanceVelocity(intervalQuotes, previousImbalanceRatio = 0.5, previousVelocity)
{
    if (!intervalQuotes || intervalQuotes.length === 0)
    {
        return { currentImbalanceRatio: previousImbalanceRatio, quoteVelocity: 0, quoteAcceleration: 0 };
    }

    let totalBidSize = 0;
    let totalAskSize = 0;

    // 1. Accumulate total order book depth volume for this 5-second interval frame
    for (let i = 0; i < intervalQuotes.length; i++)
    {
        const quote = intervalQuotes[i];
        if (quote.BidSize && quote.AskSize)
        {
            totalBidSize += quote.BidSize;
            totalAskSize += quote.AskSize;
        }
    }

    const totalDepth = totalBidSize + totalAskSize;
    if (totalDepth === 0)
    {
        return { currentImbalanceRatio: 0.5, quoteVelocity: 0, quoteAcceleration: 0 };
    }

    // 2. Compute the current normalized Imbalance Ratio (scales between 0.0 and 1.0)
    // 1.0 = Book is 100% Bids (Extreme Buying Support)
    // 0.0 = Book is 100% Asks (Extreme Selling Pressure)
    const currentImbalanceRatio = totalBidSize / totalDepth;

    // 3. Compute First Derivative (Velocity of order depth changes)
    const quoteVelocity = currentImbalanceRatio - previousImbalanceRatio;

    return {
        currentImbalanceRatio: Number(currentImbalanceRatio.toFixed(4)),
        quoteVelocity: Number(quoteVelocity.toFixed(4)),
        quoteAcceleration: Number(quoteVelocity.toFixed(4)) - previousVelocity
    };
}
