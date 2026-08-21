/**
 * Reconstructs the order book timeline from bulk REST data by explicitly filtering out
 * elements that printed before the exact article published timestamp.
 * 
 * @param {Array} rawTrades - Bulk array of trades from getMultiTradesV2
 * @param {Array} rawQuotes - Bulk array of quotes from getMultiQuotesV2
 * @param {string|Date|number} articlePublishedTimestamp - The exact timestamp the press release dropped
 * @returns {Object} Complete analytical profile for the 350px telemetry panel
 */
export function reconstructOrderBookAbsorption(rawTrades, rawQuotes, articlePublishedTimestamp) {
  const trades = rawTrades || [];
  const quotes = rawQuotes || [];
  
  // 1. Establish our explicit millisecond filtering milestone baseline
  const filterMilestoneMs = Date.parse(articlePublishedTimestamp);
  
  if (isNaN(filterMilestoneMs)) {
    console.error("⚠️ Invalid articlePublishedTimestamp format provided to filter engine.");
    return { absorptionStyle: 'QUIET', icebergDetected: false, hiddenVolume: 0, quoteImbalance: 0 };
  }

  // 2. Parse, filter out historical data, and synchronize both streams chronologically
  const timeline = [
    ...quotes
      .map(q => ({ type: 'QUOTE', time: Date.parse(q.Timestamp), data: q }))
      .filter(item => item.time >= filterMilestoneMs), // Slices away pre-PR quotes
    
    ...trades
      .map(t => ({ type: 'TRADE', time: Date.parse(t.Timestamp), data: t }))
      .filter(item => item.time >= filterMilestoneMs)  // Slices away pre-PR trades
  ].sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time;
    // Tie-breaker: Process quotes first to ensure the trade maps to the proper active Ask level
    return a.type === 'QUOTE' ? -1 : 1;
  });

  // If everything was filtered out, exit cleanly with flat state vectors
  if (timeline.length === 0) {
    return { absorptionStyle: 'QUIET', icebergDetected: false, hiddenVolume: 0, quoteImbalance: 0 };
  }

  // 3. Initialize our Active Order Book State accumulators
  let currentBidPrice = 0, currentAskPrice = 0, currentBidSize = 0, currentAskSize = 0;
  
  let totalVolumeTradedAtAsk = 0;
  let activeAbsorptionPrice = null;
  let initialVisibleAskSize = 0;
  let maxHiddenVolumeUncovered = 0;
  let icebergRatio = 0;
  
  let netAggressionDelta = 0;
  let totalIntervalVolume = 0;

  // 4. Sequential Linear Scan Loop (Processes only post-news timeline data)
  for (let i = 0; i < timeline.length; i++) {
    const event = timeline[i];

    if (event.type === 'QUOTE') {
      // Overwrite our Active Order Book State with the latest quoting parameters
      currentBidPrice = event.data.BidPrice || currentBidPrice;
      currentAskPrice = event.data.AskPrice || currentAskPrice;
      currentBidSize = event.data.BidSize || currentBidSize;
      currentAskSize = event.data.AskSize || currentAskSize;
      
    } else if (event.type === 'TRADE') {
      const tradePrice = event.data.Price;
      const tradeSize = event.data.Size;

      totalIntervalVolume += tradeSize;

      // Check if the transaction executed exactly at or above the active Ask price layer
      if (currentAskPrice > 0 && tradePrice >= currentAskPrice) {
        netAggressionDelta += tradeSize; // Hit the Ask (Buying Aggression)

        // Track institutional reloading mechanics at this specific price coordinate
        if (activeAbsorptionPrice !== currentAskPrice) {
          activeAbsorptionPrice = currentAskPrice;
          initialVisibleAskSize = currentAskSize;
          totalVolumeTradedAtAsk = 0;
        }

        totalVolumeTradedAtAsk += tradeSize;

        // THE 3x RELOAD RULE CHECK
        if (totalVolumeTradedAtAsk > (initialVisibleAskSize * 3) && initialVisibleAskSize > 0) {
          const hiddenShares = totalVolumeTradedAtAsk - initialVisibleAskSize;
          if (hiddenShares > maxHiddenVolumeUncovered) {
            maxHiddenVolumeUncovered = hiddenShares;
          }
        }
      } else if (currentBidPrice > 0 && tradePrice <= currentBidPrice) {
        netAggressionDelta -= tradeSize; // Slammed the Bid (Selling Pressure)
        
        // Reset absorption tracker because the price level drifted away from the Ask wall
        activeAbsorptionPrice = null;
        totalVolumeTradedAtAsk = 0;
      }
    }
  }

  // 5. Calculate final book metrics from the end of the timeline
  const totalDepth = currentBidSize + currentAskSize;
  const finalQuoteImbalance = totalDepth > 0 ? (currentBidSize - currentAskSize) / totalDepth : 0;
  
  if (totalIntervalVolume > 0 && maxHiddenVolumeUncovered > 0) {
    icebergRatio = maxHiddenVolumeUncovered / totalIntervalVolume;
  }

  // 6. EVALUATE TARGET TRANSITION / ABSORPTION PROFILES
  let absorptionStyle = 'QUIET';

  if (maxHiddenVolumeUncovered > 0) {
    if (netAggressionDelta > 0 && finalQuoteImbalance > -0.50) {
      absorptionStyle = 'BULLISH_ACCUMULATION'; // Squeeze likely holding control
    } else {
      absorptionStyle = 'TOXIC_DISTRIBUTION';    // Pop & Fail trap forming
    }
  } else if (netAggressionDelta > (totalIntervalVolume * 0.4) && finalQuoteImbalance > 0.20) {
    absorptionStyle = 'LIQUIDITY_VACUUM';        // Sellers vanished, open running space
  }

  return {
    absorptionStyle,
    icebergDetected: maxHiddenVolumeUncovered > 0,
    hiddenVolume: maxHiddenVolumeUncovered,
    icebergRatio: Number(icebergRatio.toFixed(3)),
    quoteImbalance: Number(finalQuoteImbalance.toFixed(3)),
    netAggressionDelta,
    totalIntervalVolume,
    lastCalculatedAsk: currentAskPrice,
    lastCalculatedBid: currentBidPrice,
    filteredTimelineLength: timeline.length // Useful data tracking flag
  };
}
