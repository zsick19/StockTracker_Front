import React from 'react';
import { useSelector } from 'react-redux';
import { selectPrioritizedWatchlist } from '../store/watchlistSelectors';

export const WatchlistPriorityGrid = () =>
{
    // 1. Invoke your high-performance prioritized watchlist selector
    // This hook naturally updates your view layout whenever prices or macro indices shift!
    const prioritizedWatchlist = useSelector(selectPrioritizedWatchlist);

    return (
        <div className="watchlist-grid-container" style={{ padding: '20px', background: '#0a0a0a', color: '#fff', fontFamily: 'monospace' }}>
            <h2 style={{ color: '#00FFFF', letterSpacing: '2px', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
                ⚡ ALPHA CONVICTION PRIORITY RADAR
            </h2>

            <div className="grid-header" style={{ display: 'flex', background: '#111', padding: '10px', fontWeight: 'bold', color: '#888', fontSize: '12px' }}>
                <div style={{ flex: 1 }}>RANK / TICKER</div>
                <div style={{ flex: 1 }}>PATTERN TYPE</div>
                <div style={{ flex: 1, textAlign: 'center' }}>LIVE PRICE</div>
                <div style={{ flex: 1, textAlign: 'center' }}>TAPE STATUS</div>
                <div style={{ flex: 1, textAlign: 'right', color: '#00FFFF' }}>CONVICTION SCORE</div>
            </div>

            <div className="grid-rows-wrapper" style={{ marginTop: '10px' }}>
                {prioritizedWatchlist.map((plan, index) =>
                {
                    const isHighConviction = plan.alphaConvictionScore >= 75;

                    return (
                        <div key={plan.tickerSymbol} className="grid-row-card"
                            style={{
                                display: 'flex',
                                padding: '12px 10px',
                                background: isHighConviction ? 'rgba(0, 255, 255, 0.02)' : '#161616',
                                borderLeft: isHighConviction ? '4px solid #00FFFF' : '4px solid #333',
                                marginBottom: '6px',
                                borderRadius: '0 4px 4px 0',
                                fontSize: '13px',
                                alignItems: 'center',
                                transition: 'transform 0.2s ease'
                            }}>

                            {/* RANK & SYMBOL */}
                            <div style={{ flex: 1, fontWeight: 'bold' }}>
                                <span style={{ color: '#666', marginRight: '8px' }}>#{index + 1}</span>
                                <span style={{ color: isHighConviction ? '#00FFFF' : '#fff', fontSize: '15px' }}>{plan.tickerSymbol}</span>
                            </div>

                            {/* PATTERN CLASSIFICATION CLUE */}
                            <div style={{ flex: 1, color: '#aaa', fontSize: '11px' }}>
                                {plan.patternClassification.replace('TOOL_', '')}
                            </div>

                            {/* LIVE HALF-SECOND PRICE TICK */}
                            <div style={{ flex: 1, textAlign: 'center', fontFamily: 'SFMono-Regular, monospace' }}>
                                ${plan.livePriceMetrics?.livePrice?.toFixed(2) || '0.00'}
                            </div>

                            {/* SIGNAL BATCH STATUS INDICATOR */}
                            <div style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: isHighConviction ? '#00FFCC' : '#666' }}>
                                {plan.executionStatus}
                            </div>

                            {/* THE PAGED ALPHA SCORE VALUE */}
                            <div style={{ flex: 1, textAlign: 'right', fontWeight: 'bold', fontSize: '16px', color: isHighConviction ? '#00FFFF' : '#ffea00' }}>
                                {plan.alphaConvictionScore}%
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};
