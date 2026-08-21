/**
 * Processes the initial 10-second historical seed block of trades and quotes.
 * Splits the data into two 5-second intervals to generate an instant baseline trend.
 * 
 * @param {Object} params
 * @param {Array} params.trades - Historical trades, pre-filtered to match or follow press release time
 * @param {Array} params.quotes - Historical quotes, pre-filtered to match or follow press release time
 * @param {number} params.sharesFloat - The stock's total float from your database schema
 * @param {number} params.currentPrice - Current execution price of the stock
 * @returns {Object} Hydration payload containing thresholds, cursors, and initial chart intervals
 */
export function processInitialSeedBatchSafe( trades, quotes, sharesFloat, currentPrice, pressReleaseTimeISO )
{
  // 1. Establish the Dynamic Large Order Threshold
  let largeOrderThreshold = 0;
  if (currentPrice < 1.0)
  {
    largeOrderThreshold = Math.min((sharesFloat * 0.0005), 25000);
    if (largeOrderThreshold < 2500) largeOrderThreshold = 2500;
  } else
  {
    largeOrderThreshold = Math.ceil(100000 / currentPrice);
  }

  // Ensure arrays are chronologically sorted
  const sortedTrades = [...(trades || [])].sort((a, b) => Date.parse(a.Timestamp) - Date.parse(b.Timestamp));
  const sortedQuotes = [...(quotes || [])].sort((a, b) => Date.parse(a.Timestamp) - Date.parse(b.Timestamp));

  // Safe fallback cursor extraction (Edge Case 3 Guardrail)
  const lastProcessedTradeTimestamp = sortedTrades.length > 0 ? sortedTrades[sortedTrades.length - 1].Timestamp : pressReleaseTimeISO;
  const lastProcessedQuoteTimestamp = sortedQuotes.length > 0 ? sortedQuotes[sortedQuotes.length - 1].Timestamp : pressReleaseTimeISO;

  // Handle absolute total data blackout (Edge Case 3)
  if (sortedTrades.length === 0 && sortedQuotes.length === 0)
  {
    return createEmptyHydrationPayload(largeOrderThreshold, lastProcessedTradeTimestamp, lastProcessedQuoteTimestamp, currentPrice);
  }

  // 2. Establish Anchor Time Safely (Edge Case 2 Guardrail)
  const startTime = sortedTrades.length > 0 ? Date.parse(sortedTrades[0].Timestamp) : Date.parse(pressReleaseTimeISO);
  const midPointTime = startTime + 5000;

  const intervals = [
    { largeVolume: 0, smallVolume: 0, aggressionDelta: 0, trades: [] },
    { largeVolume: 0, smallVolume: 0, aggressionDelta: 0, trades: [] }
  ];

  sortedTrades.forEach(trade =>
  {
    const idx = Date.parse(trade.Timestamp) < midPointTime ? 0 : 1;
    intervals[idx].trades.push(trade);
  });

  // 3. Process Intervals with Midpoint Check Safety
  let lastKnownPrice = sortedTrades.length > 0 ? sortedTrades[0].Price : currentPrice;
  let activeQuotePointer = 0;

  const chartPoints = intervals.map((interval) =>
  {
    let intervalDelta = 0;
    let intervalLargeVolume = 0;
    let intervalSmallVolume = 0;

    interval.trades.forEach((trade) =>
    {
      const tradeTime = Date.parse(trade.Timestamp);
      const tradeSize = trade.Size;
      const tradePrice = trade.Price;

      if (tradeSize >= largeOrderThreshold)
      {
        intervalLargeVolume += tradeSize;
      } else
      {
        intervalSmallVolume += tradeSize;
      }

      // Sync quote pointer
      while (
        activeQuotePointer < sortedQuotes.length - 1 &&
        Date.parse(sortedQuotes[activeQuotePointer + 1].Timestamp) <= tradeTime
      )
      {
        activeQuotePointer++;
      }

      const matchedQuote = sortedQuotes[activeQuotePointer];

      // Edge Case 1 Fix: Verify matchedQuote exists before extracting properties
      if (matchedQuote && matchedQuote.BidPrice && matchedQuote.AskPrice)
      {
        const midPrice = (matchedQuote.BidPrice + matchedQuote.AskPrice) / 2;

        if (tradePrice > midPrice)
        {
          intervalDelta += tradeSize;
        } else if (tradePrice < midPrice)
        {
          intervalDelta -= tradeSize;
        } else
        {
          // Midpoint matching Tick Test
          if (tradePrice > lastKnownPrice) intervalDelta += tradeSize;
          else if (tradePrice < lastKnownPrice) intervalDelta -= tradeSize;
        }
      } else
      {
        // FALLBACK TO RAW TICK TEST ONLY (If quotes are totally empty)
        if (tradePrice > lastKnownPrice) intervalDelta += tradeSize;
        else if (tradePrice < lastKnownPrice) intervalDelta -= tradeSize;
      }

      lastKnownPrice = tradePrice;
    });

    return {
      largeVolume: intervalLargeVolume,
      smallVolume: intervalSmallVolume,
      aggressionDelta: intervalDelta,
      lastPrice: lastKnownPrice
    };
  });

  return {
    largeOrderThreshold,
    cursors: {
      tradeTimestamp: lastProcessedTradeTimestamp,
      quoteTimestamp: lastProcessedQuoteTimestamp,
      lastTradePrice: lastKnownPrice
    },
    chartData: chartPoints,
    rawCache: {
      trades: sortedTrades.slice(-30),
      quotes: sortedQuotes.slice(-30)
    }
  };
}

function createEmptyHydrationPayload(threshold, tradeTime, quoteTime, fallbackPrice)
{
  return {
    largeOrderThreshold: threshold,
    cursors: { tradeTimestamp: tradeTime, quoteTimestamp: quoteTime, lastTradePrice: fallbackPrice },
    chartData: [
      { largeVolume: 0, smallVolume: 0, aggressionDelta: 0, lastPrice: fallbackPrice },
      { largeVolume: 0, smallVolume: 0, aggressionDelta: 0, lastPrice: fallbackPrice }
    ],
    rawCache: { trades: [], quotes: [] }
  };
}
