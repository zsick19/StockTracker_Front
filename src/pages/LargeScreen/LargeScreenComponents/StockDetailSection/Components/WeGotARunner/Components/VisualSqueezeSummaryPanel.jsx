import React from 'react';
import { useSelector } from 'react-redux';
import { selectNewsRunnerById, selectNewsRunnerPriceChangeById, selectNewsRunnerSummaryExecutionById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice';

export function VisualSqueezePanel({ ticker })
{
    const { status, headline, meters, floatTurnover, quoteImbalance, institutionalPct } = useSelector((state) => selectNewsRunnerSummaryExecutionById(state, ticker))

    // 1. Dynamic Chromatic Theme Mapping Framework (Using native Hex codes)
    const themeMap = {
        CRITICAL: { bg: '#2d1616', border: '#ef4444', text: '#fca5a5', badgeBg: '#ef4444', badgeText: '#ffffff' },
        EXHAUSTION: { bg: '#2d2013', border: '#f59e0b', text: '#fde047', badgeBg: '#f59e0b', badgeText: '#000000' },
        VACUUM: { bg: '#21153b', border: '#a855f7', text: '#d8b4fe', badgeBg: '#a855f7', badgeText: '#ffffff' },
        RUNNING: { bg: '#102a1e', border: '#10b981', text: '#6ee7b7', badgeBg: '#10b981', badgeText: '#000000' },
        QUIET: { bg: '#111827', border: '#374151', text: '#9ca3af', badgeBg: '#4b5563', badgeText: '#f3f4f6' }
    };

    const theme = themeMap[status] || themeMap.QUIET;

    // 2. Base Container Style Matrix
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        height: '350px',
        width: '350px',
        padding: '16px',
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
        backgroundColor: theme.bg,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        boxSizing: 'border-box',
        justifyContent: 'space-between',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
    };

    return (
        <div style={containerStyle}>

            {/* SECTION 1: HEADER & STATUS BADGE CARD PANEL */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', trackingWidth: '0.05em', color: '#ebebeb' }}>
                    {ticker}
                </p>

                <p style={{ fontSize: '10px', fontWeight: '900', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.1em', backgroundColor: theme.badgeBg, color: theme.badgeText }}>
                    {status}
                </p>
            </div>

            {/* SECTION 2: THE 5-WORD HEADLINE ACTION CONTAINER */}
            <div style={{ minHeight: '44px', display: 'flex', alignItems: 'center', margin: '4px 0' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', margin: 0, letterSpacing: '0.02em', color: theme.text, lineHeight: '1.3' }}>
                    {headline}
                </h2>
            </div>

            {/* SECTION 3: FLOAT TURNOVER & BOOK LIQUIDITY BLOCKS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '6px', border: '1px solid #1f2937' }}>

                {/* Row A: Float Turnover Accumulator */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Float Rotation</span>
                    <span style={{ fontSize: '11px', fontWeight: '900', fontFamily: 'monospace', color: floatTurnover >= 1.0 ? '#c084fc' : '#e5e7eb' }}>
                        {(floatTurnover * 100).toFixed(1)}% Turned
                    </span>
                </div>

                {/* Row B: Order Book Resting Liquidity Depth Gauge */}
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '700', color: '#6b7280', marginBottom: '3px' }}>
                        <span>LIT BOOK DEPTH</span>
                        <span style={{ color: quoteImbalance < 0 ? '#fca5a5' : '#6ee7b7' }}>
                            {quoteImbalance < 0 ? `ASK HEAVY (${Math.abs(Math.round(quoteImbalance * 100))}%)` : `BID HEAVY (${Math.round(quoteImbalance * 100)}%)`}
                        </span>
                    </div>
                    {/* Centered Bid/Ask Fluid Track Slider */}
                    <div style={{ width: 'full', backgroundColor: '#1f2937', height: '5px', borderRadius: '999px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            borderRadius: '999px',
                            position: 'absolute',
                            transition: 'all 0.3s ease',
                            backgroundColor: quoteImbalance < 0 ? '#f87171' : '#34d399',
                            right: quoteImbalance < 0 ? '50%' : 'auto',
                            left: quoteImbalance >= 0 ? '50%' : 'auto',
                            width: `${Math.abs(quoteImbalance) * 50}%`
                        }} />
                    </div>
                </div>

            </div>

            {/* SECTION 4: THE PROGRESS BAR METERS TELEMETRY CHANNEL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                {/* Meter 1: Buying Force */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#d1d5db', marginBottom: '4px' }}>
                        <span>🚀 SQUEEZE FORCE</span>
                        <span>{meters.pressure}%</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#1f2937', height: '8px', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${meters.pressure}%`, backgroundColor: '#34d399', height: '100%', borderRadius: '999px', transition: 'width 0.3s ease' }} />
                    </div>
                </div>

                {/* Meter 2: Inventory Acceleration Velocity */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#d1d5db', marginBottom: '4px' }}>
                        <span>⚡ INVENTORY VELOCITY</span>
                        <span>{meters.velocity}%</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#1f2937', height: '8px', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${meters.velocity}%`, backgroundColor: '#60a5fa', height: '100%', borderRadius: '999px', transition: 'width 0.3s ease' }} />
                    </div>
                </div>

                {/* Meter 3: Threat Index Danger */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#d1d5db', marginBottom: '4px' }}>
                        <span>⚠️ THREAT INDEX RISK</span>
                        <span>{meters.danger}%</span>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#1f2937', height: '8px', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${meters.danger}%`, backgroundColor: '#f87171', height: '100%', borderRadius: '999px', transition: 'width 0.3s ease' }} />
                    </div>
                </div>

            </div>

            {/* SECTION 5: STATIC CAP BOTTLENECK PROFILE FOOTER */}
            <div style={{ borderTop: '1px solid #1f2937', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', fontWeight: '700', color: '#4b5563' }}>
                <span>CAP RISK PROFILE:</span>
                {institutionalPct > 65 ? (
                    <span style={{ color: '#f87171', letterSpacing: '0.02em' }}>⚠️ HEAVY institutional OWNERSHIP ({institutionalPct}%)</span>
                ) : institutionalPct < 25 ? (
                    <span style={{ color: '#34d399', letterSpacing: '0.02em' }}>✅ LIQUID RETAIL RUNNER ({institutionalPct}%)</span>
                ) : (
                    <span style={{ color: '#9ca3af', letterSpacing: '0.02em' }}>NEUTRAL BALANCE ({institutionalPct}%)</span>
                )}
            </div>

        </div>
    );
}
