import { differenceInMinutes, startOfDay } from 'date-fns';
import React from 'react'

function VolumeStatus({
    liveCandles5Min,        // Regular hour chunked candles array from RTK Query / Stream
    livePreMarket30Min,     // Pre-market chunked candles array (11 elements, 04:00 - 09:30)
    historicalMetrics,      // Pre-seeded complete historical database JSON document
})
{
    console.log(historicalMetrics)
    // 1. Establish absolute time coordinates
    const currentTotalMinutes = differenceInMinutes(new Date(), startOfDay(new Date()));
    const preMarketStart = 4 * 60;       // 04:00 AM ET
    const marketOpen = 9 * 60 + 30;     // 09:30 AM ET
    const whiplashBuffer = 9 * 60 + 45; // 09:45 AM ET
    const sessionHourEnd = 10 * 60 + 30; // 10:30 AM ET

    // Hard Gate: Scanner idle outside the structural testing windows
    //if (currentTotalMinutes < preMarketStart || currentTotalMinutes > sessionHourEnd) { return <div className="status-idle">
    // Pre-Market & Opening Hour Scanner Idle

    
    // </div>; }

    // 2. Initialize tracking variables for the unified renderer
    let sessionPhaseLabel = "";
    let liveVolumeToCompare = 0;
    let historicalBaselineVolume = 0;
    let timeBlockLabel = "";
    let macroBlockCompare = null; // Holds 10-min or 30-min secondary metrics

    // --- PHASE A: PRE-MARKET TRACKING MODE (04:00 AM - 09:30 AM) ---
    if (currentTotalMinutes < marketOpen)
    {
        sessionPhaseLabel = "PRE-MARKET AUCTION ANALYSIS";
        const preMarketElapsed = currentTotalMinutes - preMarketStart;
        const index30Min = Math.floor(preMarketElapsed / 30);

        // Prevent array overshooting during live boundary changes
        const safeIndex = Math.min(Math.max(index30Min, 0), 10);

        const blockStartHour = 4 + Math.floor((safeIndex * 30) / 60);
        const blockStartMinute = (safeIndex * 30) % 60;
        timeBlockLabel = `Active 30-Min Block: [${String(blockStartHour).padStart(2, "0")}:${String(blockStartMinute).padStart(2, "0")} ET]`;

        // Extract streaming live volume for the active 30-min block
        liveVolumeToCompare = livePreMarket30Min[safeIndex]?.Volume || 0;

        // Pre-market direction is unknown; average the Up and Down historical pre-market profiles
        const historicalUpPremarket = historicalMetrics.preMarketUpThirtyMinBlocks[safeIndex] || 0;
        const historicalDownPremarket = historicalMetrics.preMarketDownThirtyMinBlocks[safeIndex] || 0;

        historicalBaselineVolume = (historicalUpPremarket + historicalDownPremarket) / 2;
    }
    // --- PHASE B: REGULAR HOUR TRACKING MODE (09:30 AM - 10:30 AM) ---
    else
    {
        const regularElapsed = currentTotalMinutes - marketOpen;
        const index5Min = Math.min(Math.max(Math.floor(regularElapsed / 5), 0), 12);
        const index10Min = Math.min(Math.max(Math.floor(regularElapsed / 10), 0), 5);

        const activeLiveCandle = liveCandles5Min[index5Min];
        const initial930Candle = liveCandles5Min[0];

        if (!activeLiveCandle || !initial930Candle) return null;

        liveVolumeToCompare = activeLiveCandle.Volume;

        // Sub-Phase B1: Whiplash Zone (09:30 AM - 09:45 AM)
        if (currentTotalMinutes < whiplashBuffer)
        {
            sessionPhaseLabel = "REGULAR OPEN: REBALANCING WHIPLASH ZONE";
            timeBlockLabel = `Active 5-Min Slot: [Index ${index5Min}]`;

            const up5MinBaseline = historicalMetrics.fiveMinUpDay[index5Min] || 0;
            const down5MinBaseline = historicalMetrics.fiveMinDownDay[index5Min] || 0;
            historicalBaselineVolume = (up5MinBaseline + down5MinBaseline) / 2;

            // Compute temporary blended 10-minute block data
            const up10MinBlock = historicalMetrics.tenMinUpDay[index10Min] || 0;
            const down10MinBlock = historicalMetrics.tenMinDownDay[index10Min] || 0;
            const live10MinVolume = liveCandles5Min.slice(index10Min * 2, (index10Min * 2) + 2).reduce((sum, c) => sum + (c?.Volume || 0), 0);

            macroBlockCompare = { label: `10-Min Block [Slot ${index10Min}]`, live: live10MinVolume, historical: (up10MinBlock + down10MinBlock) / 2 };
        }
        // Sub-Phase B2: Direction Settled Track (09:45 AM - 10:30 AM)
        else
        {
            const isUpDayRegime = activeLiveCandle.ClosePrice >= initial930Candle.OpenPrice;
            sessionPhaseLabel = isUpDayRegime ? "REGULAR HOUR: RECOVERY MODE (UP)" : "REGULAR HOUR: CASCADING LIQUIDATION (DOWN)";
            timeBlockLabel = `Active 5-Min Slot: [Index ${index5Min}]`;
            const activeProfile = isUpDayRegime ? historicalMetrics.fiveMinUpDay : historicalMetrics.fiveMinDownDay;
            const activeProfileTen = isUpDayRegime ? historicalMetrics.tenMinUpDay : historicalMetrics.tenMinDownDay
            historicalBaselineVolume = activeProfile[index5Min] || 0;

            // Calculate exact live total volume executed in the current 10-minute institutional wave
            const startSlice = index10Min * 2;
            const live10MinVolume = liveCandles5Min.slice(startSlice, startSlice + 2).reduce((sum, c) => sum + (c?.Volume || 0), 0);

            macroBlockCompare = {
                label: `Active 10-Min Wave [Slot ${index10Min}]`,
                live: live10MinVolume,
                historical: activeProfileTen[index10Min] || 0
            };
        }
    }

    // 3. Generate Relative Volume (RVOL) Scores
    const segmentRvol = historicalBaselineVolume === 0 ? 0 : liveVolumeToCompare / historicalBaselineVolume;

    let macroRvol = 0;
    if (macroBlockCompare && macroBlockCompare.historical > 0) { macroRvol = macroBlockCompare.live / macroBlockCompare.historical; }

    // 4. Assign Visual Color Threshold Anchors
    const getConvictionMetadata = (rvol) =>
    {
        if (rvol >= 2.0) return { color: "#00FFFF", tier: "INSTITUTIONAL DRIVE (EXPECT CONTINUATION)" }; // Cyan
        if (rvol < 1.0) return { color: "#FF0055", tier: "LIQUIDITY EXHAUSTION (EXPECT REVERSAL)" };   // Crimson
        return { color: "#E5E5E5", tier: "NORMAL AUCTION PARTICIPATION" };                           // Matte Platinum
    };

    const segmentMeta = getConvictionMetadata(segmentRvol);
    const macroMeta = macroBlockCompare ? getConvictionMetadata(macroRvol) : null;

    return (
        <div className="advanced-volume-status-dashboard" style={{ backgroundColor: "#121212", padding: "16px", borderRadius: "8px", color: "#FFFFFF", fontFamily: "monospace" }}>

            {/* Header Identity Row */}
            <div style={{ display: "flex", justifyContent: "between", borderBottom: "1px solid #222", paddingBottom: "8px", marginBottom: "12px" }}>
                <span style={{ color: "#FFB300", fontWeight: "bold" }}>⚡ {sessionPhaseLabel}</span>
                <span style={{ color: "#888", marginLeft: "auto" }}>{timeBlockLabel}</span>
            </div>

            {/* Core Segment Monitoring Metrics Panel */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "16px" }}>
                <div style={{ background: "#1A1A1A", padding: "10px", borderRadius: "4px" }}>
                    <div style={{ color: "#888", fontSize: "11px" }}>LIVE TRACKED VOLUME</div>
                    <div style={{ fontSize: "18px", fontWeight: "bold" }}>{liveVolumeToCompare.toLocaleString()}</div>
                </div>
                <div style={{ background: "#1A1A1A", padding: "10px", borderRadius: "4px" }}>
                    <div style={{ color: "#888", fontSize: "11px" }}>HISTORICAL BASELINE</div>
                    <div style={{ fontSize: "18px", fontWeight: "bold" }}>{Math.round(historicalBaselineVolume).toLocaleString()}</div>
                </div>
                <div style={{ background: "#1A1A1A", padding: "10px", borderRadius: "4px", borderRight: `3px solid ${segmentMeta.color}` }}>
                    <div style={{ color: "#888", fontSize: "11px" }}>SEGMENT RVOL</div>
                    <div style={{ fontSize: "18px", fontWeight: "bold", color: segmentMeta.color }}>{segmentRvol.toFixed(2)}x</div>
                </div>
            </div>

            {/* Secondary Macro Interval Panel (10-Min Wave or 30-Min Pre-Market Stats) */}
            {macroBlockCompare && (
                <div style={{ background: "#161616", padding: "12px", borderRadius: "6px", borderLeft: `4px solid ${macroMeta.color}`, marginBottom: "12px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "bold", color: "#888", marginBottom: "6px" }}>MACRO BLOCK RE-EVALUATION: {macroBlockCompare.label}</div>
                    <div style={{ display: "flex", gap: "24px" }}>
                        <div>Live Grouped Vol: <strong>{macroBlockCompare.live.toLocaleString()}</strong></div>
                        <div>Hist Grouped Vol: <strong>{Math.round(macroBlockCompare.historical).toLocaleString()}</strong></div>
                        <div>Block RVOL: <strong style={{ color: macroMeta.color }}>{macroRvol.toFixed(2)}x</strong></div>
                    </div>
                </div>
            )}

            {/* Final Target Lock Signal Output Footer */}
            <div style={{ padding: "10px", borderRadius: "4px", backgroundColor: `${segmentMeta.color}15`, color: segmentMeta.color, border: `1px solid ${segmentMeta.color}30`, fontSize: "12px" }}>
                <strong>CONVICTION PATHWAY:</strong> {segmentMeta.tier}
            </div>
        </div>
    );
};

export default VolumeStatus




