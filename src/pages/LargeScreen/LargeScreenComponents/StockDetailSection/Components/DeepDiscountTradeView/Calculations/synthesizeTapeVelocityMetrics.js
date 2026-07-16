/**
 * PRODUCTION COMPILER: synthesizeTapeVelocityMetrics
 * Aggregates high-frequency quote and trade arrays to extract real-time 
 * institutional footprints and output plain-language visual takeaways [INDEX].
 * 
 * @param {Array} tradesArray - Rolling 3-minute Time & Sales ticker collection [INDEX]
 * @param {Array} quotesArray - Rolling 5-minute quote width collection [INDEX]
 * @param {number} latestBidSize - The most recent BidSize integer from the live stream
 * @param {number} latestAskSize - The most recent AskSize integer from the live stream
 * @returns {Object} Explicit text indicators and matching color configurations for the HUD
 */
export function synthesizeTapeVelocityMetrics(tradesArray, quotesArray, latestBidSize, latestAskSize)
{
    const fallback = {
        volumetricBias: "AWAITING_TAPE",
        spreadStatus: "SCANNING_SPREAD",
        bookPressure: "BALANCED_BOOK",
        isTideTurning: false
    };

    if (!tradesArray || !quotesArray) return fallback;

    // 📐 REGIME 1: EVALUATE VOLUMETRIC BIAS (TRADE ARRAY OVERVIEW) [INDEX]
    let aggressiveBuyVolume = 0;
    let aggressiveSellVolume = 0;

    tradesArray.forEach(trade =>
    {
        // Institutional Filter: Evaluate blocks only to screen out minor odd-lot retail noise [INDEX]
        if (trade.size >= 100)
        {
            // Check your internal database schema markers to see where the transaction executed
            if (trade.fillType === 'ASK_SWEEP' || trade.isUpTick)
            {
                aggressiveBuyVolume += trade.size;
            } else
            {
                aggressiveSellVolume += trade.size;
            }
        }
    });

    let calculatedBiasString = "NEUTRAL_CHURN";
    if (aggressiveBuyVolume > 0 && aggressiveSellVolume === 0)
    {
        calculatedBiasString = "ACCUMULATION_SWEEP";
    } else if (aggressiveBuyVolume > 0 && (aggressiveBuyVolume / (aggressiveSellVolume || 1)) >= 2.5)
    {
        calculatedBiasString = "ACCUMULATION_SWEEP"; // Institutional buyers dominate the tape [INDEX]
    } else if (aggressiveSellVolume > 0 && (aggressiveSellVolume / (aggressiveBuyVolume || 1)) >= 2.5)
    {
        calculatedBiasString = "WATERFALL_SELLING";
    }

    // 📐 REGIME 2: EVALUATE SPREAD COMPRESSION (QUOTE ARRAY OVERVIEW) [INDEX]
    const totalQuotePoints = quotesArray.length;
    let spreadStatusString = "VARIABLE_CHOP";

    if (totalQuotePoints >= 10)
    {
        const latestSpreadNode = quotesArray[totalQuotePoints - 1].spread;

        // Compute trailing mean baseline to measure real-time elasticity contraction [INDEX]
        let trailingSpreadSum = 0;
        quotesArray.forEach(q => trailingSpreadSum += q.spread);
        const averageTrailingSpread = trailingSpreadSum / totalQuotePoints;

        if (latestSpreadNode <= averageTrailingSpread * 0.40)
        {
            spreadStatusString = "LOCKED_CORRIDOR"; // Spread has completely compressed [INDEX]
        } else if (latestSpreadNode >= averageTrailingSpread * 1.60)
        {
            spreadStatusString = "SPREAD_DILATION_RISK";
        }
    }

    // 📐 REGIME 3: EVALUATE BOOK DENSITY PRESSURE
    let bookPressureString = "BALANCED_POOL";
    const rawImbalanceRatio = latestAskSize > 0 ? (latestBidSize / latestAskSize) : 1.0;

    if (rawImbalanceRatio >= 2.5)
    {
        bookPressureString = "BID_FLOOR_SUPPORT"; // Ironclad buy wall deployed beneath the price [INDEX]
    } else if (rawImbalanceRatio <= 0.35)
    {
        bookPressureString = "ASK_CEILING_OVERHEAD";
    }

    // 🟢 COGNITIVE SYNCHRONICITY: Determine if all three checkboxes confirm the reversal [INDEX]
    const isTideTurning = calculatedBiasString === "ACCUMULATION_SWEEP" &&
        spreadStatusString === "LOCKED_CORRIDOR" &&
        bookPressureString === "BID_FLOOR_SUPPORT";

    return {
        volumetricBias: calculatedBiasString,
        spreadStatus: spreadStatusString,
        bookPressure: bookPressureString,
        isTideTurning
    };
}
