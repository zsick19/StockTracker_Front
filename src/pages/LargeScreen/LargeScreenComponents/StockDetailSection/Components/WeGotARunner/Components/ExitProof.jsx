import React from 'react';

export function ExitProof({ exitProofPayload, onClearOverride })
{
    // 1. Fallback rendering safeguard if payload layer is empty
    if (!exitProofPayload || !exitProofPayload.isExitOverrideActive)
    {
        return (
            <div style={{
                width: '700px', height: '400px', backgroundColor: '#111827', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid #374151', fontFamily: 'sans-serif', color: '#9ca3af', fontSize: '13px'
            }}>
                SCANNING STREAM TIMELINE FOR VELOCITY DEVIATION EVENTS...
            </div>
        );
    }

    const { timestamp, headline, reason, slippageDamage, quoteImbalancePct, tapeProof } = exitProofPayload;

    // 2. Base Geometric Layout Containers (Locked 700x400 Terminal Frame)
    const mainTerminalStyle = {
        display: 'flex',
        flexDirection: 'row',
        width: '700px',
        height: '400px',
        backgroundColor: '#1f1313', // Deep crimson undertone matching standard exit HUD theme
        border: '2px solid #ef4444', // High-contrast scarlet warning border
        borderRadius: '12px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        boxSizing: 'border-box',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none'
    };

    // 3. Compartment Style Slices
    const leftPanelStyle = {
        width: '45%',
        padding: '24px 16px 16px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid rgba(239, 68, 68, 0.25)',
        boxSizing: 'border-box',
        backgroundColor: 'rgba(0, 0, 0, 0.15)'
    };

    const rightPanelStyle = {
        width: '55%',
        padding: '24px 24px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box'
    };

    return (
        <div style={mainTerminalStyle}>

            {/* 🛑 LEFT SIDE: INSTANT RISK INTENT REGISTRATION SHIELD */}
            <div style={leftPanelStyle}>

                {/* Flash Header & Timestamp Cursors */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: '#ef4444', letterSpacing: '0.1em', animation: 'pulse 1.5s infinite' }}>
                            CIRCUIT BREAKER LATCHED
                        </span>
                        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#6b7280', fontWeight: '600' }}>
                            {timestamp}
                        </span>
                    </div>

                    <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#fca5a5', margin: '0 0 16px 0', letterSpacing: '0.01em', lineHeight: '1.2' }}>
                        {headline}
                    </h1>

                    <p style={{ fontSize: '12px', color: '#ef4444', fontWeight: '700', margin: '0 0 20px 0', lineHeight: '1.4', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        {reason}
                    </p>
                </div>

                {/* Scaled Telemetry Metrics Readouts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '10px 0' }}>

                    {/* Telemetry Indicator A: Slippage Execution Cost */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#d1d5db', marginBottom: '4px' }}>
                            <span>⚠️ SLIPPAGE LOSS DAMAGE</span>
                            <span style={{ color: '#f87171', fontFamily: 'monospace', fontWeight: '900' }}>
                                -${Math.abs(slippageDamage).toFixed(4)}
                            </span>
                        </div>
                        <div style={{ width: '100%', backgroundColor: '#2d1a1a', height: '6px', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, Math.abs(slippageDamage) * 1000)}%`, backgroundColor: '#ef4444', height: '100%' }} />
                        </div>
                    </div>

                    {/* Telemetry Indicator B: Passive Ask Wall Concentration */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#d1d5db', marginBottom: '4px' }}>
                            <span>🧱 ORDER BOOK ASK CONCENTRATION</span>
                            <span style={{ color: '#ef4444', fontFamily: 'monospace', fontWeight: '900' }}>
                                {quoteImbalancePct}%
                            </span>
                        </div>
                        <div style={{ width: '100%', backgroundColor: '#2d1a1a', height: '6px', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${quoteImbalancePct}%`, backgroundColor: '#f87171', height: '100%' }} />
                        </div>
                    </div>

                </div>

                {/* Absolute Command Prompt Action Block */}
                <div style={{ backgroundColor: '#ef4444', color: '#ffffff', textAlign: 'center', padding: '12px', borderRadius: '6px', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}>
                    <span style={{ display: 'block', fontSize: '9px', fontWeight: '900', letterSpacing: '0.05em', opacity: 0.8, marginBottom: '1px' }}>IMPERATIVE COMMAND</span>
                    <span style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '0.03em' }}>EXECUTE IMMEDIATE EXIT</span>
                </div>

            </div>

            {/* 🔎 RIGHT SIDE: HISTORICAL RECORD TAPE VERIFICATION PROOF */}
            <div style={rightPanelStyle}>

                {/* Ticker Sub-Header Title Label */}
                <div>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#9ca3af', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                        SUB-SECOND LIQUIDITY TIMELINE AUDIT TRAIL
                    </span>

                    {/* Chronological Scroll Core Stack Container */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#111113', padding: '12px', borderRadius: '8px', border: '1px solid #2d1a1a', minHeight: '260px' }}>
                        {tapeProof.map((item, idx) =>
                        {
                            const isQuote = item.type === 'QUOTE';
                            const isBidHit = item.details.includes('BID HIT');

                            // Dynamic line color coding rules matching ticker parameters
                            const markerColor = isQuote ? '#6b7280' : isBidHit ? '#f87171' : '#34d399';
                            const bgFadeColor = isQuote ? 'transparent' : isBidHit ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)';

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        padding: '8px 10px',
                                        borderRadius: '4px',
                                        backgroundColor: bgFadeColor,
                                        borderLeft: `3px solid ${markerColor}`,
                                        fontSize: '11px',
                                        fontFamily: 'monospace',
                                        boxSizing: 'border-box'
                                    }}
                                >
                                    <span style={{ color: '#4b5563', marginRight: '10px', fontWeight: '600' }}>[{item.timestamp}]</span>
                                    <span style={{ color: '#9ca3af', marginRight: '8px', fontWeight: '800' }}>{item.type}</span>
                                    <span style={{ color: isQuote ? '#d1d5db' : '#ffffff', fontWeight: isQuote ? '500' : '700' }}>{item.details}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* HUD Return Override Cancel Action Link Trigger */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button
                        onClick={() => onClearOverride(false)}
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#4b5563',
                            fontSize: '10px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em',
                            transition: 'color 0.2s ease',
                            outline: 'none'
                        }}
                        onMouseOver={(e) => e.target.style.color = '#9ca3af'}
                        onMouseOut={(e) => e.target.style.color = '#4b5563'}
                    >
                        Clear Alert HUD & Return to Live Metrics →
                    </button>
                </div>

            </div>

        </div>
    );
}
