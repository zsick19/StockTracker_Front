/**
 * Intercepts incoming 5-second data blocks to detect institutional abandonment
 * and generates a raw data proof transcript for the Exit HUD UI.
 * 
 * @param {Object} params
 * @param {Array} params.newTrades - Raw trades array from Alpaca's 5s REST block
 * @param {Array} params.newQuotes - Raw quotes array from Alpaca's 5s REST block
 * @param {Object} params.calculatedIntervalMetrics - The largeVolume, sweepRatio, etc., from your active engine
 * @returns {Object|null} Exit payload data proof structure, or null if trend is structurally stable
 */
export function checkInstitutionalAbandonment({
    newTrades = [],
    newQuotes = [],
    calculatedIntervalMetrics = {}
})
{
    const {
        largeVolume = 0,
        smallVolume = 0,
        sweepRatio = 0,
        quoteImbalance = 0,
        executionSlippage = 0,
        lastCalculatedAsk = 0,
        lastCalculatedBid = 0
    } = calculatedIntervalMetrics;

    if (newTrades.length === 0) return null;

    // 🚨 1. THE ABSOLUTE OPERATIONAL EXIT CRITERIA MARKS
    // Trigger if small retail volume spikes but large institutional block volume hits zero,
    // OR if a severe bid-slamming negative slippage wall forms alongside an Ask-heavy book.
    const isInstitutionalVolumeDead = largeVolume === 0 && smallVolume > 5000;
    const isSevereSlippageBreached = executionSlippage < 0 && Math.abs(executionSlippage) >= (lastCalculatedAsk * 0.02);
    const isAskWallStacked = quoteImbalance < -0.70; // Ask represents > 85% of total depth

    const isExitTriggered = isInstitutionalVolumeDead || (isSevereSlippageBreached && isAskWallStacked);

    if (!isExitTriggered) return null; // Exit early if the institutional trend remains valid

    // 🚨 2. GENERATE THE SUB-SECOND TAPE TRANSCRIPT PROOF
    // Combine, sort, and slice the absolute latest 4 transactions to verify the print footprint
    const combinedTimeline = [
        ...newQuotes.map(q => ({ type: 'QUOTE', time: Date.parse(q.Timestamp), displayTime: q.Timestamp.slice(11, 23), data: q })),
        ...newTrades.map(t => ({ type: 'TRADE', time: Date.parse(t.Timestamp), displayTime: t.Timestamp.slice(11, 23), data: t }))
    ].sort((a, b) => b.time - a.time); // Reverse sorting (newest first) for top-down scrolling ticker

    const proofTapeTranscript = combinedTimeline.slice(0, 4).map(item =>
    {
        if (item.type === 'QUOTE')
        {
            return {
                timestamp: item.displayTime,
                type: 'QUOTE',
                details: `Bid: $${item.data.BidPrice.toFixed(4)} (${item.data.BidSize}) | Ask: $${item.data.AskPrice.toFixed(4)} (${item.data.AskSize})`
            };
        } else
        {
            // Check if the trade executed at the Bid or the Ask to verify selling execution damage
            const isBidHit = item.data.Price <= lastCalculatedBid;
            return {
                timestamp: item.displayTime,
                type: 'TRADE',
                details: `${item.data.Size.toLocaleString()} Shrs @ $${item.data.Price.toFixed(4)} (${isBidHit ? 'BID HIT' : 'ASK LIFT'})`
            };
        }
    });

    // 🚨 3. RETURN THE COMPILED VISUAL DATA SCHEMAS
    let reasonString = "EXECUTION SLIPPAGE THRESHOLD CAP BREACHED";
    if (isInstitutionalVolumeDead)
    {
        reasonString = "INSTITUTIONAL VOLUME DISCONNECT: LARGE ORDERS FLOOD DROP -100%";
    }

    return {
        isExitOverrideActive: true,
        timestamp: new Date().toLocaleTimeString(),
        headline: "⚠️ VELOCITY DIVERGENCE TRIGGERED",
        reason: reasonString,
        slippageDamage: executionSlippage,
        quoteImbalancePct: Math.round(Math.abs(quoteImbalance) * 100),
        tapeProof: proofTapeTranscript
    };
}
