import { logRuleTrack } from '../masterPrioritizer';
import { SCORING_WEIGHTS as W } from '../ScoringWeights'

/**
 * @param {Object} planEntity - Fully hydrated stock plan object from your entity adapter cache
 * @param {Array} todaysLiveCandles - Today's streaming regular session candle array [INDEX]
 * @param {Object} liveSpyPlan - The live macro Sentry metadata block from your macro store
 * @param {Object} macroEntities - The raw macro market entity adapter dictionary [INDEX]
 * @returns {number} The finalized cumulative Base Environment Score (Max 50 points base layout)
 */
export function compileSharedBaseEnvironmentMetrics(planEntity, todaysLiveCandles, liveSpyPlan, liveRSPPlan,
    liveSectorPlan, provideDescriptions, auditLedger)
{
    let baseScore = 0;
    const CATEGORYNAME = 'BASE'

    const { dailyCalculatedValues, correlationValues, spyBetaValue, greatestCorrelation, patternClassification } = planEntity.planConfig;
    const { vpSupportResistance } = planEntity.metricConfig
    const stockAnalysisInfo = planEntity.stockInfo

    if (!todaysLiveCandles || todaysLiveCandles.length === 0) return 0;

    const currentCandle = todaysLiveCandles[todaysLiveCandles.length - 1];
    const livePrice = planEntity.mostRecentPrice

    // =========================================================================
    // 📊 1. REAL-TIME INTRADAY TAPE & ORDER FLOW
    // =========================================================================
    if (livePrice)
    {
        const liveHigh = Math.max(...todaysLiveCandles.map(c => c.HighPrice));
        const liveLow = Math.min(...todaysLiveCandles.map(c => c.LowPrice));
        const liveSpread = liveHigh - liveLow;
        // Classic Candlestick Location Vector (CLV)
        const liveClv = liveSpread === 0 ? -1 : ((livePrice - liveLow) - (liveHigh - livePrice)) / liveSpread;

        if (liveClv >= 0.30)
        {

            baseScore += W.orderFlow.clvMildBounce;
            const UIDescription = `Price is closing inside the upper 65% of the daily session's trading range.`
            if (provideDescriptions) logRuleTrack(auditLedger, 'Candle Stick Location Vector', W.orderFlow.clvMildBounce, CATEGORYNAME, UIDescription)
        } else if (liveClv >= 0.65)
        {
            baseScore += W.orderFlow.clvExtremeBounce;
            const UIDescription = `Price is pinned inside the absolute top 17.5% of the daily session's range.`
            if (provideDescriptions) logRuleTrack(auditLedger, 'Candle Stick Location Vector', W.orderFlow.clvExtremeBounce, CATEGORYNAME, UIDescription)
        }

        if (livePrice > todaysLiveCandles[0].OpenPrice) 
        {
            baseScore += W.orderFlow.priceAboveOpen;
            const UIDescription = `Active session price is trading above today's regular hours opening auction print.`
            if (provideDescriptions) logRuleTrack(auditLedger, 'Opening Drive Bias', W.orderFlow.priceAboveOpen, CATEGORYNAME, UIDescription)
        }
    }

    // =========================================================================
    // 🧲 2. INSTUTITIONAL MA LINES & NIGHTLY HORIZONTAL SHELF ALIGNMENT
    // =========================================================================
    // Cross-check proximity to your pre-compiled EMAs seeded on boot [INDEX]
    if (dailyCalculatedValues && dailyCalculatedValues.ema50)
    {

        const distanceToEmaPct = Math.abs(livePrice - dailyCalculatedValues.ema50) / dailyCalculatedValues.ema50;
        if (distanceToEmaPct <= 0.0035)
        {
            baseScore += W.structuralMagnets.emaSupportProximity;
            const UIDescription = `Live price is trading within 0.35% of the daily 50 EMA cushion.`
            if (provideDescriptions) logRuleTrack(auditLedger, 'EMA-50 Institutional Magnet', W.structuralMagnets.emaSupportProximity, CATEGORYNAME, UIDescription);

        }
        else if (livePrice < (dailyCalculatedValues.ema50 * 0.99))
        {
            baseScore += W.systemicDeductions.emaTrendBrokenPenalty;
            const UIDescription = 'Price has breached more than 1.0% beneath the daily 50 EMA line.'
            if (provideDescriptions) logRuleTrack(auditLedger, 'EMA-50 Institutional Magnet', W.systemicDeductions.emaTrendBrokenPenalty, CATEGORYNAME, UIDescription);
        }
    }

    // AUDIT NIGHTLY 3-TIER HORIZONTAL PROTECTION RUNWAYS
    if (vpSupportResistance)
    {
        const shelves = vpSupportResistance.overHeadResistance || [];
        const priceAscShelves = [...shelves].sort((a, b) => a.priceLevel - b.priceLevel);

        // FIX B: Cleaned up empty fallback structure parameters to prevent schema corruption
        const immediateCeilingShelf = priceAscShelves.find(shelf => shelf.priceLevel > livePrice) || { frictionRating: "MILD", volumePct: 0 };

        if (immediateCeilingShelf.frictionRating === "MILD_VELOCITY_SHELF")
        {
            baseScore += W.volumeProfileShelves.mildVelocityShelf;
            const UIDescription = `Asymmetric Runway: Thin Overhead Supply`
            if (provideDescriptions) logRuleTrack(auditLedger, 'Volume Profile Shelves', W.volumeProfileShelves.mildVelocityShelf, CATEGORYNAME, UIDescription);
        }
        else if (immediateCeilingShelf.frictionRating === "HIGH_CRITICAL_CLIFF")
        {
            baseScore += W.volumeProfileShelves.highCriticalCliff;
            const UIDescription = `Trapped Supply Barrier: Overhead Institutional Cliff`
            if (provideDescriptions) logRuleTrack(auditLedger, 'Volume Profile Shelves', W.volumeProfileShelves.highCriticalCliff, CATEGORYNAME, UIDescription);
        }
    }


    // =========================================================================
    // 🚨 3. BROAD MARKET INDEX FLIPS & DEFENSIVE SENTRY FILTERS
    // =========================================================================
    if (liveSpyPlan && spyBetaValue && correlationValues)
    {
        // If the broad index breaks below its daily Gamma Flip line, toggle volatility gates
        const isMarketInNegativeGammaRegime = liveSpyPlan.mostRecentPrice < liveSpyPlan.planData.gammaFlip;

        if (isMarketInNegativeGammaRegime)
        {
            const stockBeta = spyBetaValue || 1.0;
            const broadCorrelation = correlationValues.SPY?.correlation90Day || 0;
            if (correlationValues.SPY?.isCurrentlyDecoupled || stockBeta <= 0.85)
            {
                baseScore += W.systemicGammaGates.idiosyncraticSafeHavenBonus; // Reward decoupling low-beta assets
                const UIDescription = `Asset exhibits a low beta or is currently actively decoupled from broad market index liquidations.`
                if (provideDescriptions) logRuleTrack(auditLedger, 'Systemic Gamma Gates', W.systemicGammaGates.idiosyncraticSafeHavenBonus, CATEGORYNAME, UIDescription);
            }

        }
    }

    // =========================================================================
    // 📊 4. STOCKANALYSIS DAILY METRICS & PRE-MARKET CATALYSTS
    // =========================================================================
    if (stockAnalysisInfo)
    {

        const RULENAME = 'Stock Specific Catalysts'
        // Audit Relative Volume Consensus
        if (stockAnalysisInfo.RelativeVolume >= 2.0)
        {
            baseScore += W.stockSpecificCatalysts.highRelativeVolumeBonus;
            const UIDescription = `Intraday volume pacing at ≥ 2.0x its 3-month trailing baseline.`
            if (provideDescriptions) logRuleTrack(auditLedger, RULENAME, W.stockSpecificCatalysts.highRelativeVolumeBonus, CATEGORYNAME, UIDescription);
        }
        else if (stockAnalysisInfo.RelativeVolume <= 0.5)
        {
            baseScore += W.stockSpecificCatalysts.lowRelativeVolumePenalty;
            const UIDescription = `Intraday volume choking at ≤ 0.5x its historical baseline.`
            if (provideDescriptions) logRuleTrack(auditLedger, RULENAME, W.stockSpecificCatalysts.lowRelativeVolumePenalty, CATEGORYNAME, UIDescription);
        }



        // Audit Long-Term Institutional Desertion
        if (stockAnalysisInfo.InstitutionalSharePercent <= 15.0)
        {
            baseScore += W.stockSpecificCatalysts.week52LowLiquidationPenalty;
            const UIDescription = `Long-term institutional asset ownership sits beneath a critical 15% threshold.`
            if (provideDescriptions) logRuleTrack(auditLedger, RULENAME, W.stockSpecificCatalysts.week52LowLiquidationPenalty, CATEGORYNAME, UIDescription);
        }


        // Audit Short-Squeeze Time Friction
        if (stockAnalysisInfo.ShortRatioDaysToCover >= 5.0)
        {
            baseScore += W.stockSpecificCatalysts.shortRatioDaysToCoverBonus;
            const UIDescription = `Short sellers require ≥ 5 full market sessions of volume to exit positions.`
            if (provideDescriptions) logRuleTrack(auditLedger, RULENAME, W.stockSpecificCatalysts.shortRatioDaysToCoverBonus, CATEGORYNAME, UIDescription);
        } // Assign Time Squeeze multiplier



        if (stockAnalysisInfo.PositionInRangePercent >= 90.0)
        {
            baseScore += W.stockSpecificCatalysts.positionInRangeTopBonus;
            const UIDescription = ``
            if (provideDescriptions) logRuleTrack(auditLedger, RULENAME, W.stockSpecificCatalysts.positionInRangeTopBonus, CATEGORYNAME, UIDescription);
        }



        // Ingest Day's Gap and Pre-Market Catalyst Variables [INDEX]
        if (stockAnalysisInfo.DaysGapPercent <= -3.0)
        {
            baseScore += W.stockSpecificCatalysts.gapTrapReversalPenalty;
            const UIDescription = `Stock has gapped down more than 3.0% below yesterday's session close.`
            if (provideDescriptions) logRuleTrack(auditLedger, RULENAME, W.stockSpecificCatalysts.gapTrapReversalPenalty, CATEGORYNAME, UIDescription);
        }
        const rawMarketCap = stockAnalysisInfo.MarketCap || 0;
        if (rawMarketCap >= 10000000000)
        {
            baseScore += W.stockSpecificCatalysts.largeCapInstitutionalBonus;
            const UIDescription = `Asset is a liquid large-cap giant exceeding 10 billion dollars.`
            if (provideDescriptions) logRuleTrack(auditLedger, RULENAME, W.stockSpecificCatalysts.largeCapInstitutionalBonus, CATEGORYNAME, UIDescription);
        } // Large-Cap Institutional Bonus



        //Audit Daily RSI Mean Reversion Exhaustion
        if (stockAnalysisInfo.DailyRsi <= 30.0 && planEntity.patternConfig.patternClassification === "channel")
        {
            if (planEntity.patternConfig.channelType === 'MULTIDAY_SPACED')
            {
                baseScore += W.stockSpecificCatalysts.extremeOversoldReversalBonus;
                const UIDescription = `Daily macro RSI has collapsed beneath a heavily oversold 30.0 line.`
                if (provideDescriptions) logRuleTrack(auditLedger, RULENAME, W.stockSpecificCatalysts.extremeOversoldReversalBonus, CATEGORYNAME, UIDescription);
            } // Extreme Oversold Reversal Bonus
        }

        // Audit Crowded Total Shares Shorting Matrix
        if (stockAnalysisInfo.ShortPercentOfShares >= 12.0)
        {
            baseScore += W.stockSpecificCatalysts.aggressiveCrowdedSharesShortBonus;
            const UIDescription = `Total shares sold short exceeds 12.0% of the active floating ledger.`
            if (provideDescriptions) logRuleTrack(auditLedger, RULENAME, W.stockSpecificCatalysts.aggressiveCrowdedSharesShortBonus, CATEGORYNAME, UIDescription);
        }

        // Compute Exact Percentage Extension from the Moving Average anchors
        const ma20 = stockAnalysisInfo.MA20Price;
        const ma200 = stockAnalysisInfo.MA200Price;
        if (ma20 && ma200 && livePrice > ma200)
        {
            const distanceToMa20Pct = (livePrice - ma20) / ma20;

            // If the stock is in a long-term bull trend but has pulled back tightly to its 20 MA line
            if (distanceToMa20Pct >= 0 && distanceToMa20Pct <= 0.02 && planEntity.patternConfig.patternClassification === "continuation")
            {
                baseScore += W.stockSpecificCatalysts.coiledPullbackBonus; // Coiled Pullback Bonus
                const UIDescription = `Price is coiling within 2.0% of its rising daily 20 moving average line.`
                if (provideDescriptions) logRuleTrack(auditLedger, RULENAME, W.stockSpecificCatalysts.coiledPullbackBonus, CATEGORYNAME, UIDescription);
            }
        }
    }





    // =========================================================================
    // 🏛️ 5. SECTOR ETF DIVERGENCE & MULTI-CORRELATION BREADTH
    // =========================================================================
    // if (liveSectorPlan && liveSectorPlan.mostRecentPrice)
    // {
    //     const sectorHistory = liveSectorPlan.historicCandle || [];

    //     if (sectorHistory.length > 0)
    //     {
    //         const sectorPriorClose = sectorHistory[sectorHistory.length - 1].ClosePrice;

    //         // Compute standard 30-minute relative strength outperformance ratio [INDEX]
    //         const stockReturnPct = ((livePrice - dailyCalculatedValues.ema200) / dailyCalculatedValues.ema200) * 100;
    //         const sectorReturnPct = ((liveSectorPlan.mostRecentPrice - sectorPriorClose) / sectorPriorClose) * 100;

    //         const relativeStrengthDelta = stockReturnPct - sectorReturnPct;
    //         if (relativeStrengthDelta >= 1.5) baseScore += 20; // Award Institutional Rotation Divergence Bonus
    //     }
    // }

    // =========================================================================
    // 🏛️ 5. SECTOR ETF DIVERGENCE & MULTI-CORRELATION BREADTH
    // =========================================================================
    if (liveSectorPlan && liveSectorPlan.mostRecentPrice && dailyCalculatedValues?.PrevDailyBar)
    {
        // Isolate a unified baseline starting anchor: Yesterday's official regular hours closing print [INDEX]
        const stockPriorClose = dailyCalculatedValues.PrevDailyBar.ClosePrice;

        // FIX B: Remapped path routing to point precisely to your schema's historical sector brackets
        const sectorPriorClose = liveSectorPlan.dailyTickerValues?.PrevDailyBar?.ClosePrice || liveSectorPlan.mostRecentPrice;

        if (stockPriorClose > 0 && sectorPriorClose > 0)
        {
            // FIX A: Corrected the mathematical formula to compare true apples-to-apples intraday returns [INDEX]
            const stockIntraDayReturnPct = ((livePrice - stockPriorClose) / stockPriorClose) * 100;
            const sectorIntraDayReturnPct = ((liveSectorPlan.mostRecentPrice - sectorPriorClose) / sectorPriorClose) * 100;

            // Isolate the pure, un-polluted institutional relative strength delta [INDEX]
            const relativeStrengthDelta = stockIntraDayReturnPct - sectorIntraDayReturnPct;

            if (relativeStrengthDelta >= 1.5)
            {
                baseScore += W.systemicGammaGates.etfDivergenceBreath;
                const UIDescription = `Institutional Sector Alpha: Outperforming Sector ETF by +${relativeStrengthDelta.toFixed(2)}%`
                if (provideDescriptions) logRuleTrack(auditLedger, 'Sector ETF Divergence', W.systemicGammaGates.etfDivergenceBreath, CATEGORYNAME, UIDescription);
            }
        }
    }







    // COMPUTE CAP-WEIGHTED VS EQUAL-WEIGHTED BREADTH DECAY (SPY vs RSP)
    // if (liveSpyPlan && liveRSPPlan)
    // {
    //     const spyPrice = liveSpyPlan.mostRecentPrice;
    //     const rspPrice = liveRSPPlan.mostRecentPrice;
    //     const spyHistory = liveSpyPlan.historicCandle || [];
    //     const rspHistory = liveRSPPlan.historicCandle || [];

    //     if (spyPrice && rspPrice && spyHistory.length > 0 && rspHistory.length > 0)
    //     {
    //         const spyReturn = ((spyPrice - spyHistory[spyHistory.length - 1].ClosePrice) / spyHistory[spyHistory.length - 1].ClosePrice) * 100;
    //         const rspReturn = ((rspPrice - rspHistory[rspHistory.length - 1].ClosePrice) / rspHistory[rspHistory.length - 1].ClosePrice) * 100;
    //         // If SPY is fake-pumping on Mag 8 while RSP decays, penalize high-beta long plans [INDEX]
    //         if ((spyReturn - rspReturn) >= 0.75 && spyBetaValue >= 1.15) { baseScore -= 20; }
    //     }
    // }

    // COMPUTE CAP-WEIGHTED VS EQUAL-WEIGHTED BREADTH DECAY (SPY vs RSP)
    if (liveSpyPlan && liveRSPPlan)
    {
        const spyPrice = liveSpyPlan.mostRecentPrice;
        const rspPrice = liveRSPPlan.mostRecentPrice;

        // FIX A: Remapped paths to use your schema's strict daily historical bar objects
        const spyPriorClose = liveSpyPlan.snapShot?.PrevDailyBar?.ClosePrice;
        const rspPriorClose = liveRSPPlan.snapShot?.PrevDailyBar?.ClosePrice;


        if (spyPrice && rspPrice && spyPriorClose > 0 && rspPriorClose > 0)
        {
            const spyReturn = ((spyPrice - spyPriorClose) / spyPriorClose) * 100;
            const rspReturn = ((rspPrice - rspPriorClose) / rspPriorClose) * 100;

            const broadMarketBreadthDivergence = spyReturn - rspReturn;

            // FIX B: Wrapped your target beta reference inside a safe local fallback shield
            const activeStockBeta = dailyCalculatedValues.spyBetaValue || planEntity.stockInfo?.Beta1Y || 1.0;

            // If SPY is fake-pumping on Mag 7 while RSP decays, penalize high-beta long plans
            if (broadMarketBreadthDivergence >= 0.75 && activeStockBeta >= 1.15)
            {
                baseScore += W.systemicDeductions.breadthDecayPenalty;
                const UIDescription = `Hollow Index Pump: SPY/RSP Divergence of +${broadMarketBreadthDivergence.toFixed(2)}%`
                if (provideDescriptions) logRuleTrack(auditLedger, 'Market Breadth Decay', W.systemicDeductions.breadthDecayPenalty, CATEGORYNAME, UIDescription);
            }
        }
    }


    // =========================================================================
    // ⏱️ 6. OPTION EXPIRATION TIME-DECAY CYCLES & SEASONAL EVENTS
    // =========================================================================
    if (liveSpyPlan && liveSpyPlan.planData?.weeklyEM?.iVolWeeklyEMLower)
    {
        const weeklyPutWall = liveSpyPlan.planData?.weeklyEM?.iVolWeeklyEMLower;
        const isSpyAtWeeklyWall = Math.abs(liveSpyPlan.mostRecentPrice - weeklyPutWall) / weeklyPutWall <= 0.0015;
        if (isSpyAtWeeklyWall)
        {
            const currentDayIndex = new Date().getDay();
            if (currentDayIndex === 1 || currentDayIndex === 2)
            {
                baseScore += W.optionsExpectedMoves.earlyCycleWeeklyLowerSDPenalty;
                const UIDescription = 'Early-Cycle Index Expected Move Breach'
                if (provideDescriptions) logRuleTrack(auditLedger, 'Options Expected Moves', W.optionsExpectedMoves.earlyCycleWeeklyLowerSDPenalty, CATEGORYNAME, UIDescription);

            }
            else if (currentDayIndex === 4 || currentDayIndex === 5)
            {
                baseScore += W.optionsExpectedMoves.lateCycleWeeklyLowerSDPinBonus;
                const UIDescription = 'Late-Cycle Index Market Maker Pinning Confluence'
                if (provideDescriptions) logRuleTrack(auditLedger, 'Options Expected Moves', W.optionsExpectedMoves.lateCycleWeeklyLowerSDPinBonus, CATEGORYNAME, UIDescription);
            }
        }
    }

    return baseScore;
}
