/**
 * Computes velocity and acceleration metrics for an active ticker.
 * 
 * @param {Object} freshMetrics - The output bucket from your processPollingInterval function
 * @param {Array} historyArray - Your existing state array: state.activeMonitors[ticker].historicalChartIntervals
 * @returns {Object} Complete payload containing pre-calculated derivatives
 */
export function calculateNewsRunnerTradeQuoteDerivatives(freshMetrics, historyArray)
{
    const len = historyArray.length;

    // Default fallbacks if there isn't enough historical context yet
    let largeVelocity = 0;
    let largeAcceleration = 0;
    let smallVelocity = 0;
    let smallAcceleration = 0;

    // 1. Calculate First Derivatives (Velocity) if at least 1 historical block exists
    if (len >= 1)
    {
        const prevInterval = historyArray[len - 1];
        largeVelocity = freshMetrics.largeVolume - prevInterval.largeVolume;
        smallVelocity = freshMetrics.smallVolume - prevInterval.smallVolume;
    }

    // 2. Calculate Second Derivatives (Acceleration) if at least 2 historical blocks exist
    if (len >= 2)
    {
        const prevInterval = historyArray[len - 1];
        // Grab the previous velocity that was already calculated and stored in your state
        const prevLargeVelocity = prevInterval.largeVelocity || 0;
        const prevSmallVelocity = prevInterval.smallVelocity || 0;

        largeAcceleration = largeVelocity - prevLargeVelocity;
        smallAcceleration = smallVelocity - prevSmallVelocity;
    }

    return {
        largeVelocity,
        largeAcceleration,
        smallVelocity,
        smallAcceleration
    };
}
