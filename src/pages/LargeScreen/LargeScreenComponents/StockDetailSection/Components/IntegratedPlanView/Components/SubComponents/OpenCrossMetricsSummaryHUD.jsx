import React from 'react';
import { useSelector } from 'react-redux';

export const OpenCrossMetricsSummaryHUD = ({ planData, livePrice }) =>
{
    if (!planData || !planData.metricConfig.openCross) return null;
    const metrics = planData.metricConfig.openCross;
    const todayCross = metrics.todaysOpenCross || {};
    const biasMatrix = metrics.sixDayBias || {};

    const auctionAnchorPrice = todayCross.officialAuctionCrossPrice || 0;
    const auctionBlockShares = todayCross.maximumBlockSizeFound || 0;

    // Read the centralized active task string straight out of your Redux slice [INDEX]
    const activeTaskId = useSelector((state) => state.sessionClock?.activeTaskId);

    if (auctionAnchorPrice === 0)
    {
        return (
            <div style={{ background: '#111219', padding: '15px', borderRadius: '4px', border: '1px dashed #333', textAlign: 'center', fontSize: '11px', color: '#6272a4' }}>
                ⏳ Awaiting 09:31 AM background server calculation pass to inject today's institutional anchors...
            </div>
        );
    }

    // 📐 THE REAL-TIME HOVER BALANCE GATE [INDEX]
    const isPriceHoldingAboveAnchor = livePrice >= auctionAnchorPrice;

    // Evaluate if the stock is testing your manual channel buy box [INDEX]
    const floor = planData.channelPattern?.channelBottom || 0;
    const buffer = planData.channelPattern?.entryStrikeBuffer || 0;
    const isInsideBuyBox = livePrice >= floor && livePrice <= buffer;

    // Resolve structural color maps based on institutional trend biases
    const isBullishBias = biasMatrix.auctionTrendBias === "BULLISH_AUCTION_CONVEXITY";
    const isDecelerationActive = biasMatrix.auctionDecelerationAlert === true;

    return (
        <div style={{ background: '#111219', padding: '20px', borderRadius: '4px', border: '1px solid #222', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: '15px' }}>

            {/* PANEL HEADLINER CONTAINER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e1f29', paddingBottom: '10px' }}>
                <h4 style={{ margin: 0, color: '#00ffff', fontSize: '11px', letterSpacing: '1px' }}>🏛️ INSTITUTIONAL AUCTION BIAS SENTINEL</h4>
                <span style={{
                    fontSize: '10px',
                    background: isPriceHoldingAboveAnchor ? 'rgba(80,250,123,0.1)' : 'rgba(255,85,85,0.1)',
                    color: isPriceHoldingAboveAnchor ? '#50fa7b' : '#ff5555',
                    padding: '3px 8px',
                    borderRadius: '2px',
                    fontWeight: 'bold'
                }}>
                    {isPriceHoldingAboveAnchor ? "📈 NET-ACCUMULATION VECTOR" : "📉 NET-DISTRIBUTION VECTOR"}
                </span>
            </div>

            {/* TWO-COLUMN QUANT CORRIDOR WORKSPACE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>

                {/* COLUMN 1: TODAY'S LIVE SESSION TARGET ANCHOR */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ background: '#181922', padding: '10px', borderRadius: '3px', borderLeft: isPriceHoldingAboveAnchor ? '3px solid #50fa7b' : '3px solid #ff5555' }}>
                        <div style={{ fontSize: '10px', color: '#6272a4' }}>OFFICIAL 09:30 AM AUCTION CROSS</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>
                            ${auctionAnchorPrice.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '9px', color: '#888', marginTop: '4px' }}>
                            Volume Weight: {auctionBlockShares.toLocaleString()} shares
                        </div>
                    </div>

                    <div style={{ fontSize: '10px', color: isPriceHoldingAboveAnchor ? '#50fa7b' : '#ff5555', lineHeight: '1.3', padding: '2px 5px' }}>
                        {isInsideBuyBox
                            ? "📥 REVERSAL INTERDICTION MET: Stock is testing your channel floor. Open cross penalty is dynamically muted [INDEX]."
                            : (isPriceHoldingAboveAnchor
                                ? "🟢 Demand is actively trapping and absorbing supply above today's fair-value baseline."
                                : "🔴 Trapped block positions overhead will act as a heavy supply ceiling on relief rallies [INDEX].")}
                    </div>
                </div>

                {/* COLUMN 2: MULTI-DAY TIME-SERIES DERIVATIVES */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                    {/* ACCELERATION TREND ROW */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', borderBottom: '1px dashed #1a1a24', paddingBottom: '4px' }}>
                        <span style={{ color: '#6272a4' }}>6-DAY AUCTION VECTOR:</span>
                        <span style={{ color: isBullishBias ? '#50fa7b' : '#ff5555', fontWeight: 'bold' }}>
                            {biasMatrix.auctionTrendBias || 'NEUTRAL'}
                        </span>
                    </div>

                    {/* SLOPE COEFFICIENT ROW */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', borderBottom: '1px dashed #1a1a24', paddingBottom: '4px' }}>
                        <span style={{ color: '#6272a4' }}>REGRESSION SLOPE VALUE:</span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>
                            {biasMatrix.auctionSlopeCoefficient > 0 ? '+' : ''}{(biasMatrix.auctionSlopeCoefficient || 0).toFixed(3)}
                        </span>
                    </div>

                    {/* DECELERATION CRITICAL BADGE ROW */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', borderBottom: '1px dashed #1a1a24', paddingBottom: '4px' }}>
                        <span style={{ color: '#6272a4' }}>SELLING SECTOR EXHAUSTION:</span>
                        <span style={{ color: isDecelerationActive ? '#00ffff' : '#fff', fontWeight: 'bold' }}>
                            {isDecelerationActive ? "✅ EXHAUSTED (SHRINKING)" : "❌ EXPANDING VELOCITY"}
                        </span>
                    </div>

                    <div style={{ fontSize: '9px', color: '#888', marginTop: '4px', lineHeight: '1.2' }}>
                        {isDecelerationActive
                            ? "🟢 SUCCESS: Daily opening auctions are dropping significantly closer together. Downward institutional pressure is completely empty."
                            : "⬜ RATING: Trend waves are matching standard congruent momentum indices."}
                    </div>
                </div>

            </div>

            {/* DYNAMIC TIMING SENTRY CONTEXT FOOTER */}
            <div style={{ background: '#090a0f', padding: '10px', borderRadius: '3px', border: '1px solid #1a1a24', textAlign: 'center', fontSize: '10px', color: '#6272a4' }}>
                Clock Sentry: System is currently executing inside the <span style={{ color: '#ffb86c', fontWeight: 'bold' }}>{activeTaskId.replace('_', ' ')}</span> block corridor.
            </div>

        </div>
    );
};
