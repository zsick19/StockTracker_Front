import React from 'react'
import { format, differenceInCalendarDays } from 'date-fns';


function StockInfoView({ plan })
{
    const stockData = plan.stockInfo
    const today = new Date();

    // =========================================================================
    // 🏛️ THRESHOLD RULE A: DYNAMIC EARNINGS RISK CLAMPS
    // =========================================================================
    const earningsDateRaw = stockData?.NextEarnings || stockData?.EarningsDate || stockData?.LastEarnings || undefined;
    let earningsRiskStatus = { label: "SAFE WINDOW", isCritical: false, text: "No imminent earnings volatility gaps present." };
    console.log(earningsDateRaw)
    if (earningsDateRaw)
    {
        const daysToEarnings = differenceInCalendarDays(new Date(earningsDateRaw), today);
        if (daysToEarnings >= 0 && daysToEarnings <= 7)
        {
            earningsRiskStatus = {
                label: "CRITICAL RISK",
                isCritical: true,
                text: `🚨 EARNINGS IN ${daysToEarnings} DAYS: High gap risk. Strategy rules restrict market orders.`
            };
        } else if (daysToEarnings > 7)
        {
            earningsRiskStatus = {
                label: "WINDOW STABLE",
                isCritical: false,
                text: `Next Corporate Earnings: ${format(new Date(earningsDateRaw), 'yyyy-MM-dd')} (${daysToEarnings} days out).`
            };
        }
    }

    // =========================================================================
    // 📐 THRESHOLD BINDINGS MATRIX
    // =========================================================================
    const betaValue = stockData?.Beta1Y || 1.0;
    const isHighBeta = betaValue >= 1.30; // Threshold: High-velocity market amplifier

    const rangePosition = stockData?.PositionInRangePercent || 0;
    const isDeepValueFloor = rangePosition <= 15.0; // Threshold: Bottom 15% of annual channel

    const shortPctFloat = stockData?.ShortPercentOfFloat || 0;
    const isShortPowderKeg = shortPctFloat >= 15.0; // Threshold: Heavy short crowd overcrowding

    const daysToCover = stockData?.ShortRatioDaysToCover || 0;
    const isHighDaysToCover = daysToCover >= 4.0; // Threshold: Squeeze potential duration metrics

    return (
        <div style={{ background: '#111219', padding: '22px', borderRadius: '4px', border: '1px solid #222', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* PROFILE HEADLINER TOP BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e1f29', paddingBottom: '12px' }}>
                <div>
                    <h3 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                        {stockData.Symbol} <span style={{ fontSize: '13px', color: '#6272a4', fontWeight: 'normal' }}>| {stockData.CompanyName}</span>
                    </h3>
                    <div style={{ fontSize: '11px', color: '#00ffff' }}>{stockData.Sector} ──► {stockData.Industry} ──► {stockData.Website} </div>
                </div>
                <div style={{ textAlign: 'right', background: '#181922', padding: '6px 12px', borderRadius: '3px', border: '1px solid #222' }}>
                    <div style={{ fontSize: '9px', color: '#6272a4' }}>INSTITUTIONAL OWNERSHIP</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#50fa7b', marginTop: '2px' }}>{(stockData.InstitutionalSharePercent || 0).toFixed(1)}%</div>
                </div>
            </div>

            {/* DUAL-COLUMN DATA WORKSPACE WITH EXBEDDED CHEAT-SHEETS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

                {/* COLUMN A: STRUCTURAL MACRO ANCHORS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* FIELD A1: VOLATILITY BETA */}
                    <div style={{ padding: '10px', background: isHighBeta ? 'rgba(255,184,108,0.03)' : '#181922', borderRadius: '3px', borderLeft: isHighBeta ? '3px solid #ffb86c' : '3px solid #6272a4' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
                            <span style={{ color: '#6272a4' }}>VOLATILITY BETA (1Y)</span>
                            <span style={{ color: isHighBeta ? '#ffb86c' : '#fff' }}>{betaValue.toFixed(2)}</span>
                        </div>
                        <div style={{ fontSize: '9px', color: '#888', marginTop: '4px', lineHeight: '1.2' }}>
                            {isHighBeta ? "🟢 RATING: HIGH VELOCITY. Stock gains 1.3x speed vs SPY moves. Maximizes reward multiplier." :
                                "⬜ RATING: NORMAL VELOCITY. Tracking index beta closely."}
                        </div>
                    </div>

                    {/* FIELD A2: 52W RANGE POSITION */}
                    <div style={{ padding: '10px', background: isDeepValueFloor ? 'rgba(80,250,123,0.03)' : '#181922', borderRadius: '3px', borderLeft: isDeepValueFloor ? '3px solid #50fa7b' : '3px solid #6272a4' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
                            <span style={{ color: '#6272a4' }}>52W ANNUAL RANGE POSITION</span>
                            <span style={{ color: isDeepValueFloor ? '#50fa7b' : '#fff' }}>{rangePosition.toFixed(1)}%</span>
                        </div>
                        <div style={{ fontSize: '9px', color: '#888', marginTop: '4px', lineHeight: '1.2' }}>
                            {isDeepValueFloor ? "🟢 THRESHOLD MET (≤15%): Asset is trading at deep annual value floor. Peak institutional support zone." :
                                "⬜ THRESHOLD OUT: Mid-range trading structure. Verify channel limits."}
                        </div>
                    </div>

                </div>

                {/* COLUMN B: LIQUIDITY POWDER KEG INDICATORS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* FIELD B1: SHORT FLOAT PERCENT */}
                    <div style={{ padding: '10px', background: isShortPowderKeg ? 'rgba(255,85,85,0.03)' : '#181922', borderRadius: '3px', borderLeft: isShortPowderKeg ? '3px solid #ff5555' : '3px solid #6272a4' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
                            <span style={{ color: '#6272a4' }}>SHORT INT PERCENT OF FLOAT</span>
                            <span style={{ color: isShortPowderKeg ? '#ff5555' : '#fff' }}>{shortPctFloat.toFixed(1)}%</span>
                        </div>
                        <div style={{ fontSize: '9px', color: '#888', marginTop: '4px', lineHeight: '1.2' }}>
                            {isShortPowderKeg ? "🔴 THRESHOLD MET (≥15%): POWDER KEG. Crowded short crowd creates explosive fuel for short squeeze." :
                                "⬜ RATING: LOW SHORT PROFILE. Standard equity liquidity distribution."}
                        </div>
                    </div>

                    {/* FIELD B2: DAYS TO COVER */}
                    <div style={{ padding: '10px', background: isHighDaysToCover ? 'rgba(255,234,0,0.03)' : '#181922', borderRadius: '3px', borderLeft: isHighDaysToCover ? '3px solid #ffea00' : '3px solid #6272a4' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
                            <span style={{ color: '#6272a4' }}>SHORT RATIO (DAYS TO COVER)</span>
                            <span style={{ color: isHighDaysToCover ? '#ffea00' : '#fff' }}>{daysToCover.toFixed(1)} DAYS</span>
                        </div>
                        <div style={{ fontSize: '9px', color: '#888', marginTop: '4px', lineHeight: '1.2' }}>
                            {isHighDaysToCover ? "🟡 THRESHOLD MET (≥4.0 DAYS): Short sellers require 4 sessions of volume to exit. Squeeze has long-term duration legs." :
                                "⬜ RATING: FAST EXIT. Sellers can cover positions quickly without crashing order book."}
                        </div>
                    </div>

                </div>

            </div>

            {/* UPCOMING RISK RISK SENTRY SKEW CONTAINER */}
            <div style={{ background: '#090a0f', padding: '12px', borderRadius: '3px', border: '1px solid #1a1a24', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: earningsRiskStatus.isCritical ? '#ff5555' : '#00ffff' }}>
                    {earningsRiskStatus.isCritical ? "⚠️ CRITICAL SYSTEM INTERDICTION ACTIVE" : "📅 EARNINGS SYSTEM LOG"}
                </div>
                <div style={{ fontSize: '10px', color: '#fff' }}>{earningsRiskStatus.text}</div>
            </div>

        </div>
    );
};



export default StockInfoView