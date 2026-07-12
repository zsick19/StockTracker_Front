import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPrioritizedWatchlist } from '../../../../../../features/Engine/EnginePlanApiSlice';
import { setStockDetailStateWithTicker } from '../../../../../../features/SelectedStocks/StockDetailControlSlice';

export const ScoringTestHUD = () =>
{
    // Pull the live sorted watchlist straight from your master selector loop
    const dispatch = useDispatch()
    const prioritizedWatchlist = useSelector(selectPrioritizedWatchlist)

    function handleNavigateToSinglePlan(tickerSymbol) { dispatch(setStockDetailStateWithTicker({ detail: 21, ticker: tickerSymbol })) }

    const [showAll, setShowAll] = useState(0)


    return (
        <div style={{ padding: '20px', background: '#0a0a0c', color: '#fff', fontFamily: 'monospace', maxHeight: '600px' }}>
            <div className='flex' style={{ borderBottom: '1px solid #222', paddingBottom: '10px', margin: '0 0 20px 0' }}>
                <h2 style={{ color: '#00ffff' }}>
                    CORE ENGINE MATRIX TEST SCRATCHPAD
                </h2>
                <button onClick={() => setShowAll(0)}>Monitor</button>
                <button onClick={() => setShowAll(1)}>Strike</button>
                <button onClick={() => setShowAll(2)}>All</button>
            </div>

            {prioritizedWatchlist.length === 0 ? (
                <div style={{ color: '#666', padding: '20px', border: '1px dashed #333', textAlign: 'center' }}>
                    ⏳ Awaiting data ingestion... Populate your 6 test plans to run live calculations.
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ background: '#111', color: '#888', borderBottom: '2px solid #222' }}>
                            <th style={{ padding: '12px 10px' }}>SYMBOL</th>
                            <th style={{ padding: '12px 10px' }}>PATTERN STATUS</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center' }}>LIVE PRICE</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center', color: '#50fa7b' }}>TIER 1 (BASE)</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center', color: '#50fa7b' }}>TIER 1 (TIME)</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center', color: '#de50fa' }}>TIER 2 (STRAT)</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center', color: '#ff5555' }}>PENALTIES</th>
                            <th style={{ padding: '12px 10px', textAlign: 'right', color: '#00ffff' }}>ALPHA SCORE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prioritizedWatchlist.map((plan) =>
                        {
                            // Extract our headless pre-compiled metrics
                            const baseScore = plan.livePriceMetrics?.baseEnvironmentScore || 0;
                            const timeScore = plan.livePriceMetrics?.timeDependentScore || 0
                            const strategyScore = plan.livePriceMetrics?.patternSpecificScore || 0;
                            const penaltiesApplied = plan.livePriceMetrics?.systemicPenaltiesApplied || 0;
                            const finalScore = plan.alphaConvictionScore;
                            const status = plan.executionStatus
                            const withinPlan = plan.withinPlan
                            const insideStrike = plan.insideStrike
                            if (!withinPlan && (showAll === 1 || showAll === 0)) return
                            if (!insideStrike && showAll === 1) return

                            return (
                                <tr onClick={() => handleNavigateToSinglePlan(plan.tickerSymbol)} key={plan.tickerSymbol}
                                    style={{
                                        borderBottom: '1px solid #1c1c24',
                                        background: finalScore >= 75 ? 'rgba(0,255,255,0.02)' : 'transparent',
                                        opacity: insideStrike ? 1 : withinPlan ? '0.50' : '0.20'
                                    }}>
                                    {/* TICKER */}
                                    <td style={{ padding: '14px 10px', fontWeight: 'bold', color: finalScore >= 75 ? '#00ffff' : '#fff', fontSize: '15px' }}>
                                        {plan.tickerSymbol}
                                    </td>

                                    {/* STRATEGY PATTERN TRACK */}
                                    <td style={{ padding: '14px 10px', color: '#aaa' }}>
                                        {insideStrike ? 'Within Strike Zone' : status}
                                    </td>

                                    {/* DYNAMIC CLOSE PRICE */}
                                    <td style={{ padding: '14px 10px', textAlign: 'center', color: '#8be9fd' }}>
                                        ${plan?.mostRecentPrice.toFixed(2) || '0.00'}
                                    </td>

                                    {/* TIER 1 BASE (CAPPED 50) */}
                                    <td style={{ padding: '14px 10px', textAlign: 'center', color: '#50fa7b', fontWeight: 'bold' }}>
                                        +{baseScore}
                                    </td>

                                    {/* TIER 1 BASE (CAPPED 50) */}
                                    <td style={{ padding: '14px 10px', textAlign: 'center', color: '#50fa7b', fontWeight: 'bold' }}>
                                        +{timeScore}
                                    </td>

                                    {/* TIER 2 STRATEGY (CAPPED 50) */}
                                    <td style={{ padding: '14px 10px', textAlign: 'center', color: '#de50fa', fontWeight: 'bold' }}>
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
