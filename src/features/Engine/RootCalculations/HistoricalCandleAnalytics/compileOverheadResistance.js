/**
 * Cold-Boot Analytics Compiler: 3-Tier Reversal Resistance Finder.
 * Slices 10-day history horizontally to map the top 3 overhead volume shelves
 * and ranks their expected friction intensity completely headlessly on boot [INDEX].
 * 
 * @param {Object} planConfig - Active plan containing your channel/cascade floors
 * @param {Array} clean5MinHistory - Filtered regular hours 5-minute candle array
 * @returns {Array} List of the top 3 structured resistance boundaries
 */
export function compileThreeTierOverheadResistance(planConfig, clean5MinHistory)
{
    const fallback = [
        { priceLevel: 0, volumePct: 0, frictionRating: "MILD", scoringWeight: 0 },
        { priceLevel: 0, volumePct: 0, frictionRating: "MILD", scoringWeight: 0 },
        { priceLevel: 0, volumePct: 0, frictionRating: "MILD", scoringWeight: 0 }
    ];

    if (!clean5MinHistory || clean5MinHistory.length === 0) return fallback;

    const targetFloorLine = planConfig.channelPattern?.channelBottom || planConfig.cascadePattern?.projection?.priceFloor || 0;
    if (targetFloorLine === 0) return fallback;

    // 1. Establish your horizontal bucket sizing (e.g., 25-cent resolution increments)
    const bucketSizeCents = 0.25;
    const volumeBucketsMap = {};
    let totalAccumulatedVolume = 0;

    // 2. HORIZONTAL PROFILE LOOP PASS
    clean5MinHistory.forEach(candle =>
    {
        // Evaluate ONLY overhead supply (ignore volume already executed below or at your floor) [INDEX]
        if (candle.ClosePrice > targetFloorLine)
        {
            // Round the price cleanly to its nearest horizontal 25-cent slot bracket floor
            const bucketPriceTier = Math.floor(candle.ClosePrice / bucketSizeCents) * bucketSizeCents;
            const cleanKey = bucketPriceTier.toFixed(2);

            if (!volumeBucketsMap[cleanKey])
            {
                volumeBucketsMap[cleanKey] = 0;
            }
            volumeBucketsMap[cleanKey] += candle.Volume;
            totalAccumulatedVolume += candle.Volume;
        }
    });

    if (totalAccumulatedVolume === 0) return fallback;

    // 3. COMPILE AND SORT HORIZONTAL PRICE NODES BY VOLUME CONCENTRATION
    const sortedVolumeShelves = Object.keys(volumeBucketsMap).map(priceStr =>
    {
        const shelfVolume = volumeBucketsMap[priceStr];
        const volumePercentage = (shelfVolume / totalAccumulatedVolume) * 100;
        const priceLevel = parseFloat(priceStr);

        // Institutional Friction Rating Assignment [INDEX]
        let friction = "MILD";
        let scorePenalty = 0;

        if (volumePercentage >= 25.0)
        {
            friction = "HIGH_CRITICAL_CLIFF"; // Major trapped institutional supply [INDEX]
            scorePenalty = -25;
        } else if (volumePercentage >= 12.0 && volumePercentage < 25.0)
        {
            friction = "MODERATE_TRAFFIC_NODE"; // Standard profit-taking congestion
            scorePenalty = -10;
        } else
        {
            friction = "MILD_VELOCITY_SHELF"; // Thin liquidity layer, easily cut through [INDEX]
            scorePenalty = -2;
        }

        return {
            priceLevel,
            volumePct: parseFloat(volumePercentage.toFixed(1)),
            frictionRating: friction,
            scoringWeight: scorePenalty
        };
    }).sort((a, b) => b.volumePct - a.volumePct); // Order from heaviest shelf to lightest [INDEX]

    // 4. STRIP OUT AND RETURN THE TOP 3 SIGIFICANT OVERHEAD SHELVES
    const finalThreeShelves = sortedVolumeShelves.slice(0, 3);

    // If fewer than 3 shelves populated, pad with empty fallbacks to keep typing uniform
    while (finalThreeShelves.length < 3)
    {
        finalThreeShelves.push({ priceLevel: 0, volumePct: 0, frictionRating: "MILD", scoringWeight: 0 });
    }

    return finalThreeShelves;
}
