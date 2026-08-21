import React from 'react';
import { useSelector } from 'react-redux';
import { selectNewsRunnerAbsorptionById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice';

export function AbsorptionCoilPanel({ ticker, elapsedSeconds })
{
    const { absorptionStyle, hiddenVolume, quoteImbalance } = useSelector((state) => selectNewsRunnerAbsorptionById(state, ticker))

    // 1. Map the 3 strict institutional signatures to clear visual themes
    const styleConfigs = {
        LIQUIDITY_VACUUM: {
            bg: '#1e1b4b', border: '#a855f7', title: '🌀 LIQUIDITY VACUUM',
            desc: 'Sellers have completely vanished. Order book is paper-thin.', action: 'CONFIRMED BUY ON NEXT 5s TICK'
        },
        BULLISH_ACCUMULATION: {
            bg: '#064e3b', border: '#10b981', title: '⚡ VALIDATED ABSORPTION',
            desc: `Buyers are successfully absorbing a hidden wall of ${hiddenVolume.toLocaleString()} shares.`, action: 'HOLD / RE-ENTER PULLBACKS'
        },
        TOXIC_DISTRIBUTION: {
            bg: '#451a03', border: '#ef4444', title: '❌ TOXIC DISTRIBUTION',
            desc: 'Institutional sell walls are completely overwhelming the market orders.', action: 'HARD ABORT - DO NOT ENTER'
        },
        QUIET: {
            bg: '#111827', border: '#374151', title: '🔎 ANALYZING COIL MATRIX',
            desc: 'Recombining historical Level 1 REST arrays back to news source timestamp...', action: 'WAITING FOR BLUEPRINT FLASH'
        }
    };

    const active = styleConfigs[absorptionStyle] || styleConfigs.QUIET;

    // 2. Base 350px Tall Card Layout Design
    const cardStyle = {
        display: 'flex',
        flexDirection: 'column',
        height: '350px',
        width: '350px',
        padding: '20px',
        borderRadius: '12px',
        border: `2px solid ${active.border}`,
        backgroundColor: active.bg,
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        color: '#ffffff',
        boxSizing: 'border-box',
        justifyContent: 'space-between',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7)'
    };

    return (
        <div style={cardStyle}>
            {/* HEADER SECTION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.05em', color: '#9ca3af' }}>INITIAL INCEPTION MATRIX</span>
                <span style={{ fontSize: '10px', fontWeight: '900', fontFamily: 'monospace', backgroundColor: '#374151', padding: '2px 6px', borderRadius: '4px' }}>
                    LOCK: {60 - elapsedSeconds}s
                </span>
            </div>

            {/* CORE ABSORPTION METRIC READOUT */}
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <h1 style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 8px 0', letterSpacing: '0.02em' }}>
                    {active.title}
                </h1>
                <p style={{ fontSize: '12px', color: '#d1d5db', margin: 0, lineHeight: '1.4', minHeight: '40px' }}>
                    {active.desc}
                </p>
            </div>

            {/* LIT BOOK DEPTH MID-LAYER SLIDER */}
            <div style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '700', color: '#9ca3af', marginBottom: '6px' }}>
                    <span>ORDER BOOK BALANCE</span>
                    <span>{quoteImbalance < 0 ? `ASK WALL` : `BID FLOOR`}</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#1f2937', height: '6px', borderRadius: '999px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        position: 'absolute',
                        transition: 'all 0.3s ease',
                        backgroundColor: quoteImbalance < 0 ? '#ef4444' : '#10b981',
                        right: quoteImbalance < 0 ? '50%' : 'auto',
                        left: quoteImbalance >= 0 ? '50%' : 'auto',
                        width: `${Math.abs(quoteImbalance) * 50}%`
                    }} />
                </div>
            </div>

            {/* COMMAND ACTION FIELD CONTAINER */}
            <div style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: `1px dashed ${active.border}`,
                padding: '12px',
                borderRadius: '6px',
                textAlign: 'center'
            }}>
                <span style={{ display: 'block', fontSize: '9px', fontWeight: '700', color: '#9ca3af', marginBottom: '2px', uppercase: true }}>TERMINAL INSTRUCTION</span>
                <span style={{ fontSize: '12px', fontWeight: '900', letterSpacing: '0.02em', color: '#ffffff' }}>
                    {active.action}
                </span>
            </div>
        </div>
    );
}
