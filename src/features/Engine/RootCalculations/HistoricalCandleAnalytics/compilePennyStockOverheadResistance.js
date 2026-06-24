/**
 * Cold-Boot Analytics Compiler: 3-Tier Penny Stock Resistance Finder.
 * Slices high-resolution 1-minute history into 1-cent horizontal buckets to map 
 * the top 3 micro-cap overhead trapped supply shelves.
 * 
 * @param {Object} planConfig - Active plan containing your channel/cascade floors
 * @param {Array} clean1MinHistory - Filtered regular hours 1-minute candle array
 * @returns {Array} List of the top 3 structured penny resistance boundaries
 */
export function compileThreeTierPennyResistance(planConfig, clean1MinHistory) {
    const fallback = [
        { priceLevel: 0, volumePct: 0, frictionRating: "MILD", scoringWeight: 0 },
        { priceLevel: 0, volumePct: 0, frictionRating: "MILD", scoringWeight: 0 },
        { priceLevel: 0, volumePct: 0, frictionRating: "MILD", scoringWeight: 0 }
    ];

    if (!clean1MinHistory || clean1MinHistory.length === 0) return fallback;

    // Isolate your penny channel floor line from the Mongoose schema
    const targetFloorLine = planConfig.channelPattern?.channelBottom || planConfig.cascadePattern?.projection?.priceFloor || 0;
    if (targetFloorLine === 0) return fallback;

    // 1. Establish your high-resolution horizontal bucket sizing (1-Cent Resolution)
    const bucketSizeCents = 0.01;
    const volumeBucketsMap = {};
    let totalAccumulatedVolume = 0;

    // 2. HIGH-RESOLUTION HORIZONTAL PROFILE LOOP PASS
    clean1MinHistory.forEach(candle => {
        // Evaluate ONLY overhead supply trapping short-term scalp momentum
        if (candle.ClosePrice > targetFloorLine) {
            // Snap the 1-minute close price straight to its nearest 1-cent horizontal bucket floor
            const bucketPriceTier = Math.floor(candle.ClosePrice / bucketSizeCents) * bucketSizeCents;
            const cleanKey = bucketPriceTier.toFixed(2);

            if (!volumeBucketsMap[cleanKey]) {
                volumeBucketsMap[cleanKey] = 0;
            }
            volumeBucketsMap[cleanKey] += candle.Volume;
            totalAccumulatedVolume += candle.Volume;
        }
    });

    if (totalAccumulatedVolume === 0) return fallback;

    // 3. COMPILE AND RANK ACCUMULATION NODES BY VOLUME PERCENTAGE CONCENTRATION
    const sortedPennyShelves = Object.keys(volumeBucketsMap).map(priceStr => {
        const shelfVolume = volumeBucketsMap[priceStr];
        const volumePercentage = (shelfVolume / totalAccumulatedVolume) * 100;
        const priceLevel = parseFloat(priceStr);

        // Penny-Specific Institutional Friction Rating Assignment
        let friction = "MILD";
        let scorePenalty = 0;
        
        // Penny stock shelves holding more than 20% of the entire 3-day volume 
        // represent massive historical retail breakout traps or institutional block walls.
        if (volumePercentage >= 20.0) {
            friction = "HIGH_CRITICAL_CLIFF"; // Major retail trap or short wall
            scorePenalty = -25;
        } else if (volumePercentage >= 10.0 && volumePercentage < 20.0) {
            friction = "MODERATE_TRAFFIC_NODE"; // Normal intraday resistance churn
            scorePenalty = -10;
        } else {
            friction = "MILD_VELOCITY_SHELF"; // Thin spread, momentum can cleanly splice it
            scorePenalty = -2;
        }

        return {
            priceLevel,
            volumePct: parseFloat(volumePercentage.toFixed(1)),
            frictionRating: friction,
            scoringWeight: scorePenalty
        };
    }).sort((a, b) => b.volumePct - a.volumePct); // Order from heaviest micro-shelf to lightest

    // 4. STRIP THE TOP 3 DOMINANT ACCUMULATION CEILINGS
    const finalThreeShelves = sortedPennyShelves.slice(0, 3);

    // Pad with empty fallbacks if the asset is brand new or lacks 3 distinct tiers
    while (finalThreeShelves.length < 3) {
        finalThreeShelves.push({ priceLevel: 0, volumePct: 0, frictionRating: "MILD", scoringWeight: 0 });
    }

    return finalThreeShelves;
}
