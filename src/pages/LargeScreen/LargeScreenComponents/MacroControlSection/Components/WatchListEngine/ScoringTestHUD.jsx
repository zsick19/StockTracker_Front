import React from 'react';
import { useSelector } from 'react-redux';
import { selectPrioritizedWatchlist } from '../../../../../../features/Engine/EnginePlanApiSlice';

export const ScoringTestHUD = () =>
{
    // Pull the live sorted watchlist straight from your master selector loop
    const prioritizedWatchlist = useSelector(selectPrioritizedWatchlist)
    return (
        <div style={{ padding: '20px', background: '#0a0a0c', color: '#fff', fontFamily: 'monospace', minHeight: '100vh' }}>
            <h2 style={{ color: '#00ffff', borderBottom: '1px solid #222', paddingBottom: '10px', margin: '0 0 20px 0' }}>
                🔬 CORE ENGINE INFERENCE MATRIX TEST SCRATCHPAD
            </h2>

            {prioritizedWatchlist.length === 0 ? (
                <div style={{ color: '#666', padding: '20px', border: '1px dashed #333', textAlign: 'center' }}>
                    ⏳ Awaiting data ingestion... Populate your 6 test plans to run live calculations.
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ background: '#111', color: '#888', borderBottom: '2px solid #222' }}>
                            <th style={{ padding: '12px 10px' }}>SYMBOL</th>
                            <th style={{ padding: '12px 10px' }}>PATTERN STRATEGY CLASSIFICATION</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center' }}>LIVE PRICE</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center', color: '#50fa7b' }}>TIER 1 (BASE)</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center', color: '#50fa7b' }}>TIER 2 (STRAT)</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center', color: '#ff5555' }}>PENALTIES</th>
                            <th style={{ padding: '12px 10px', textAlign: 'right', color: '#00ffff' }}>FINAL ALPHA SCORE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prioritizedWatchlist.map((plan) =>
                        {
                            // Extract our headless pre-compiled metrics
                            const baseScore = plan.livePriceMetrics?.baseEnvironmentScore || 0;
                            const strategyScore = plan.livePriceMetrics?.patternSpecificScore || 0;
                            const penaltiesApplied = plan.livePriceMetrics?.systemicPenaltiesApplied || 0;
                            const finalScore = plan.alphaConvictionScore;

                            return (
                                <tr key={plan.tickerSymbol} style={{ borderBottom: '1px solid #1c1c24', background: finalScore >= 75 ? 'rgba(0,255,255,0.02)' : 'transparent' }}>
                                    {/* TICKER */}
                                    <td style={{ padding: '14px 10px', fontWeight: 'bold', color: finalScore >= 75 ? '#00ffff' : '#fff', fontSize: '15px' }}>
                                        {plan.tickerSymbol}
                                    </td>

                                    {/* STRATEGY PATTERN TRACK */}
                                    <td style={{ padding: '14px 10px', color: '#aaa' }}>
                                        {plan.patternClassification.replace('TOOL_', '')}
                                    </td>

                                    {/* DYNAMIC CLOSE PRICE */}
                                    <td style={{ padding: '14px 10px', textAlign: 'center', color: '#8be9fd' }}>
                                        ${plan.livePriceMetrics?.livePrice?.toFixed(2) || '0.00'}
                                    </td>

                                    {/* TIER 1 BASE (CAPPED 50) */}
                                    <td style={{ padding: '14px 10px', textAlign: 'center', color: '#50fa7b', fontWeight: 'bold' }}>
                                        +{baseScore}
                                    </td>

                                    {/* TIER 2 STRATEGY (CAPPED 50) */}
                                    <td style={{ padding: '14px 10px', textAlign: 'center', color: '#50fa7b', fontWeight: 'bold' }}>
                                        +{strategyScore}
                                    </td>

                                    {/* ACTIVE RISK PENALTIES */}
                                    <td style={{ padding: '14px 10px', textAlign: 'center', color: '#ff5555', fontWeight: 'bold' }}>
                                        {penaltiesApplied}
                                    </td>

                                    {/* COMPENSATED FINAL MATCHING SCORE PERCENTAGE */}
                                    <td style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 'bold', fontSize: '16px', color: finalScore >= 75 ? '#50fa7b' : '#fff' }}>
                                        {finalScore}%
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};
