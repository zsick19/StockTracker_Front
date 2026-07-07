import { logRuleTrack } from "../masterPrioritizer";
import { SCORING_WEIGHTS as W } from '../ScoringWeights'
import { toZonedTime } from "date-fns-tz";
import { isWithinInterval, parse, format, subMinutes, addMinutes, getDay, getMonth, getDate, differenceInMinutes, getHours, getMinutes, differenceInBusinessDays } from 'date-fns';

/**
 * @param {Object} planEntity - Fully hydrated stock plan object from your entity adapter cache
 * @param {Array} todaysLiveCandles - Today's streaming regular session candle array [INDEX]
 * @returns {number} The finalized cumulative Base Environment Score (Max 50 points base layout)
 */
export function compileTimeDependentMetrics(planEntity, todaysLiveCandles, provideDescriptions, auditLedger)
{
    let timeScore = 0;
    const CATEGORYNAME = 'TIME'
    const { extentProb, morningMetrics, morningVolume, extremeProbByFiveMin } = planEntity.metricConfig
    let livePrice = planEntity.mostRecentPrice

    if (!todaysLiveCandles || todaysLiveCandles.length === 0) return timeScore
    let sessionOpenPrice = todaysLiveCandles[0].OpenPrice

    const nyTime = toZonedTime(new Date(), 'America/New_York');
    const currentHour = getHours(nyTime);
    const currentMinute = getMinutes(nyTime);
    // Calculate exactly how many minutes have elapsed since the 09:30 AM opening bell
    const minutesElapsedSinceOpen = ((currentHour - 9) * 60) + (currentMinute - 30);

    // =========================================================================
    // 🥪 PHASE 1: THE MORNING OPEN HOUR (09:30 AM - 10:30 PM)
    // =========================================================================
    if (minutesElapsedSinceOpen >= 0 && minutesElapsedSinceOpen <= 60)
    {
        // 1. RECON A: THE POWER-HOUR REVERSAL TIME ALIGNMENT CHECK
        const downSideMetrics = morningMetrics?.downSide;
        if (downSideMetrics && downSideMetrics.averageTimeToBottom)
        {
            const targetHour = downSideMetrics.averageTimeToBottom.hour || 9;
            const targetMin = downSideMetrics.averageTimeToBottom.minute || 42;
            const targetMinutesSinceOpen = ((targetHour - 9) * 60) + (targetMin - 30);

            // If the current regular session clock is within a tight 5-minute cushion of the historical low print time
            const isInsideHistoricalReversalWindow = Math.abs(minutesElapsedSinceOpen - targetMinutesSinceOpen) <= 5;

            if (isInsideHistoricalReversalWindow && downSideMetrics.reboundProbability >= 0.65) 
            {
                timeScore += 15;
                if (provideDescriptions)
                {
                    const UIDescription = `Current price bottom timing is aligned within historical average time to bottom on down days.`
                    logRuleTrack(auditLedger, 'Open Hour', 15, CATEGORYNAME, UIDescription)
                }
            } // Award Power-Hour Time Alignment Bonus!
        }

        // 2. RECON B: HORIZONTAL EXTENT PROBABILITY SEGMENTATION
        // If today's open price is down from yesterday, track your openL probability threshold
        if (livePrice < sessionOpenPrice && extentProb)
        {
            if (extentProb.openL >= 0.70)
            {
                timeScore += 10;
                if (provideDescriptions)
                {
                    const UIDescription = `Daily low is highly likely to establish itself in the opening hour.`
                    logRuleTrack(auditLedger, 'Open Hour', 10, CATEGORYNAME, UIDescription)
                }
            }// Award Opening Low Statistical Cushion Bonus
        }

        // 3. RECON C: THE 5-MINUTE CANDLE INTERVAL LOW PRINT PROBABILITY
        // Calculate today's active 5-minute block index index (0 = 09:30, 1 = 09:35, 2 = 09:40...)
        const activeFiveMinBlockIndex = Math.floor(minutesElapsedSinceOpen / 5);
        if (extremeProbByFiveMin && extremeProbByFiveMin[activeFiveMinBlockIndex])
        {
            const liveBlockProbability = extremeProbByFiveMin[activeFiveMinBlockIndex].lowProb || 0;
            if (liveBlockProbability >= 0.65) 
            {
                timeScore += 20;
                if (provideDescriptions)
                {
                    const UIDescription = `High historical probability of daily low established in this time period.`
                    logRuleTrack(auditLedger, 'Open Hour', 20, CATEGORYNAME, UIDescription)
                }
            }// Award Statistical Floor Probability Multiplier!
        }

        // 4. RECON D: MORNING VOLUME VELOCITY RUNWAY COUNTER
        if (morningVolume && morningVolume.avgDownTotalVolToFirstHour > 0)
        {
            // Calculate the total combined volume executed across today's session candles so far
            const todaysRunningSessionVolume = todaysLiveCandles.reduce((sum, c) => sum + c.Volume, 0);
            // If we are only 20 minutes into the session, but volume already clears 60% of the full first-hour norm
            if (minutesElapsedSinceOpen <= 25 && todaysRunningSessionVolume >= (morningVolume.avgDownTotalVolToFirstHour * 0.60))
            {
                timeScore += 15;
                if (provideDescriptions)
                {
                    const UIDescription = `Above average volume in first 25 mins.`
                    logRuleTrack(auditLedger, 'Open Hour', 15, CATEGORYNAME, UIDescription)
                }
                // Award Volume Velocity Explosion Bonus!
            }
        }
    }
    // =========================================================================
    // 🥪 PHASE 2: THE MIDDAY LUNCHTIME CHURN CAGE (11:30 AM - 01:30 PM)
    // =========================================================================
    else if (minutesElapsedSinceOpen >= 120 && minutesElapsedSinceOpen <= 240)
    {
        // Severe penalty applied because institutional liquidity vanishes. 
        // Breakout continuations will fake out, and mean-reversion channels will break lower.
        timeScore -= 20;
        if (provideDescriptions)
        {
            const UIDescription = `Midday institutional liquidity vanishes.`
            logRuleTrack(auditLedger, 'Midday Churn', -20, CATEGORYNAME, UIDescription)
        }
        // Cross-check your whole-day trading stats from your schema mapping entries
        if (extentProb)
        {
            // If the stock's midday low probability is weak, increase the penalty safely
            if (extentProb.midL <= 0.35)
            {
                timeScore -= 5;
                if (provideDescriptions)
                {
                    const UIDescription = `Daily High/Low is historically unlikely to print in this period.`
                    logRuleTrack(auditLedger, 'Midday Churn', -5, CATEGORYNAME, UIDescription)
                }
            }
        }
    }
    // =========================================================================
    // ⚡ PHASE 3: THE AFTERNOON CLOSING POWER HOUR (03:00 PM - 04:00 PM)
    // =================────────────────────────────────────────────────────────
    else if (minutesElapsedSinceOpen >= 330 && minutesElapsedSinceOpen <= 390)
    {
        // Inward institutional volume returns to execute market-on-close (MOC) allocations
        timeScore += W.structuralMagnets.powerHourTimeBonus; // Award +15 Points Power Hour Bonus
        if (provideDescriptions)
        {

            const UIDescription = `Institutional volume returns to execute market-on-close (MOC) allocations.`
            logRuleTrack(auditLedger, 'Closing Hour', W.structuralMagnets.powerHourTimeBonus, CATEGORYNAME, UIDescription)
        }
        if (extentProb)
        {
            // If today's price is positive, check if the stock tends to close near its high
            if (livePrice > sessionOpenPrice && extentProb.closeH >= 0.70)
            {
                timeScore += 10; // Boost score for high-probability closing runners
                if (provideDescriptions)
                {
                    const UIDescription = `Daily High is historically likely to print in this period.`
                    logRuleTrack(auditLedger, 'Closing Hour', 10, CATEGORYNAME, UIDescription)
                }
            }
            // If running a mean-reversion play, verify the close-low historical cushion
            else if (livePrice < sessionOpenPrice && extentProb.closeL >= 0.65)
            {
                timeScore += 10;
                if (provideDescriptions)
                {
                    const UIDescription = `Daily low is historically unlikely to print in this period.`
                    logRuleTrack(auditLedger, 'Closing Hour', 10, CATEGORYNAME, UIDescription)
                }
            }
        }
    }

    return timeScore
}


