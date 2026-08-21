/**
 * Calculates the Sweep-to-Volume Ratio for a 5-second polling interval.
 * 
 * @param {Array} intervalTrades - Fresh trade array from the latest 5-second polling response
 * @returns {Object} { totalIntervalVolume, sweepVolume, sweepRatio }
 */
export function calculateNewsRunnerSweepToVolume(intervalTrades) {
  if (!intervalTrades || intervalTrades.length === 0) {
    return { totalIntervalVolume: 0, sweepVolume: 0, sweepRatio: 0 };
  }

  let totalIntervalVolume = 0;
  const timestampGroups = {};

  // 1. Group trade sizes and prices by their exact millisecond timestamp string
  for (let i = 0; i < intervalTrades.length; i++) {
    const trade = intervalTrades[i];
    const timeKey = trade.Timestamp; // Alpaca provides sub-millisecond ISO strings
    const price = trade.Price;
    const size = trade.Size;

    totalIntervalVolume += size;

    if (!timestampGroups[timeKey]) {
      timestampGroups[timeKey] = {
        totalVolume: 0,
        prices: new Set()
      };
    }

    timestampGroups[timeKey].totalVolume += size;
    timestampGroups[timeKey].prices.add(price);
  }

  let totalSweepVolume = 0;

  // 2. Identify blocks where the price changed within the same millisecond timestamp
  const keys = Object.keys(timestampGroups);
  for (let j = 0; j < keys.length; j++) {
    const group = timestampGroups[keys[j]];
    
    // An institutional sweep MUST hit more than 1 distinct price layer instantly
    if (group.prices.size > 1) {
      totalSweepVolume += group.totalVolume;
    }
  }

  // 3. Compute final ratio percentage
  const sweepRatio = totalIntervalVolume > 0 ? (totalSweepVolume / totalIntervalVolume) : 0;

  return {
    totalIntervalVolume,
    sweepVolume: totalSweepVolume,
    sweepRatio: sweepRatio // Dynamic decimal value between 0.0 and 1.0 (e.g., 0.45 = 45%)
  };
}
