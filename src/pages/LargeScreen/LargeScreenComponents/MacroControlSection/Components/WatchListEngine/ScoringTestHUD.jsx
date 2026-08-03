import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPrioritizedWatchlist } from '../../../../../../features/Engine/EnginePlanApiSlice';
import { setStockDetailStateWithTicker } from '../../../../../../features/SelectedStocks/StockDetailControlSlice';
import { isBefore, set } from 'date-fns';
import { preSetDailyTimes } from '../../../../../../Utilities/TimeFrames';
import { useToggleEnterExitPlanImportantMutation } from '../../../../../../features/EnterExitPlans/EnterExitApiSlice';

export const ScoringTestHUD = () =>
{
    const dispatch = useDispatch()
    const prioritizedWatchlist = useSelector(selectPrioritizedWatchlist)

    const [showAll, setShowAll] = useState(6)
    const [headerOrShowSelect, setHeaderOrShowSelect] = useState(true)
    const possiblePositions = ['Below Stoploss', 'Discount Area', 'Inside Strike Zone', 'Monitoring', 'Above Plan Exit']


    function handleNavigateToSinglePlan(tickerSymbol) { dispatch(setStockDetailStateWithTicker({ detail: 21, ticker: tickerSymbol })) }
    const [toggleEnterExitPlanImportant] = useToggleEnterExitPlanImportantMutation()
    async function attemptToggleImportance(plan)
    {
        try
        {
            const result = await toggleEnterExitPlanImportant({ tickerSymbol: plan.tickerSymbol, planId: plan.planId, markImportant: plan.highImportance === undefined })
        } catch (error)
        {
            console.log(error)
        }
    }

    return (
        <div style={{ background: '#0a0a0c', color: '#fff', fontFamily: 'monospace', maxHeight: '600px' }}>

            {headerOrShowSelect ?
                <table style={{ width: '100%', height: '65px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }} onClick={(e) => { e.preventDefault(); setHeaderOrShowSelect(prev => !prev) }}>
                    <thead>
                        <tr style={{ background: '#111', color: '#888', borderBottom: '2px solid #222' }}>
                            <th style={{ padding: '12px 10px', width: '75px' }}>SYMBOL</th>
                            <th style={{ padding: '12px 10px', width: '125px' }}>PATTERN STATUS</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center', width: '100px' }}>LIVE PRICE</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center', color: '#50fa7b', width: '100px' }}>TIER 1 (BASE)</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center', color: '#50fa7b', width: '100px' }}>TIER 1 (TIME)</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center', color: '#de50fa', width: '100px' }}>TIER 2 (STRAT)</th>
                            <th style={{ padding: '12px 10px', textAlign: 'center', color: '#ff5555', width: '100px' }}>PENALTIES</th>
                            <th style={{ padding: '12px 10px', textAlign: 'right', color: '#00ffff' }}>ALPHA SCORE</th>
                        </tr>
                    </thead>
                </table> :
                <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', padding: '12px 10px', height: '65px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }} onContextMenu={(e) => { e.preventDefault(); setHeaderOrShowSelect(prev => !prev) }}>
                    <button onClick={() => { setShowAll(0); setHeaderOrShowSelect(true) }}>Below Stoploss</button>
                    <button onClick={() => { setShowAll(1); setHeaderOrShowSelect(true) }}>Discount Area</button>
                    <button onClick={() => { setShowAll(2); setHeaderOrShowSelect(true) }}>Inside Strike</button>
                    <button onClick={() => { setShowAll(3); setHeaderOrShowSelect(true) }}>Monitoring</button>
                    <button onClick={() => { setShowAll(4); setHeaderOrShowSelect(true) }}>Beyond Plan</button>
                    <br />
                    <button onClick={() => { setShowAll(6); setHeaderOrShowSelect(true) }}>Viable Entries</button>
                    <button onClick={() => { setShowAll(5); setHeaderOrShowSelect(true) }}>All</button>
                </div>
            }
            {prioritizedWatchlist.length === 0 ? (
                <div style={{ color: '#666', padding: '20px', border: '1px dashed #333', textAlign: 'center' }}>
                    ⏳ Awaiting data ingestion... Populate your 6 test plans to run live calculations.
                </div>
            ) : (
                <div className='hide-scrollbar' style={{ height: '500px', overflowY: 'scroll' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ background: '#111', color: '#888', }} >
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody >
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

                                const position = plan.pricePosition

                                if (showAll === 0 && position !== 0) return
                                if (showAll === 1 && position !== 1) return
                                if (showAll === 2 && position !== 2) return
                                if (showAll === 3 && position !== 3) return
                                if (showAll === 4 && position !== 4) return
                                if (showAll === 6 && (position === 0 || position > 2)) return

                                return (
                                    <tr onClick={() => handleNavigateToSinglePlan(plan.tickerSymbol)} onContextMenu={(e) =>
                                    {
                                        e.preventDefault();
                                        attemptToggleImportance(plan)
                                    }} key={plan.tickerSymbol}
                                        style={{
                                            paddingInline: '1rem', borderBottom: '1px solid #1c1c24',
                                            background: finalScore >= 75 ? 'rgba(0,255,255,0.05)' : 'transparent',
                                            opacity: insideStrike ? 1 : withinPlan ? '0.50' : '0.20'
                                        }}>

                                        {/* TICKER */}
                                        <td style={{ width: "75px", padding: '14px 10px', fontWeight: 'bold', color: finalScore >= 75 ? '#00ffff' : '#fff', fontSize: '15px' }}>
                                            {plan.tickerSymbol}
                                        </td>

                                        {/* STRATEGY PATTERN TRACK */}
                                        <td style={{ width: '125px', padding: '14px 10px', color: '#aaa' }}>
                                            {status === 'HIGH CONVICTION' ? status : possiblePositions[position]}
                                        </td>

                                        {/* DYNAMIC CLOSE PRICE */}
                                        <td style={{ width: '100px', padding: '14px 10px', textAlign: 'center', color: '#8be9fd' }}>
                                            ${plan?.mostRecentPrice.toFixed(3) || '0.00'}
                                        </td>

                                        {/* TIER 1 BASE (CAPPED 50) */}
                                        <td style={{ width: '100px', padding: '14px 10px', textAlign: 'center', color: '#50fa7b', fontWeight: 'bold' }}>
                                            +{baseScore}
                                        </td>

                                        {/* TIER 1 BASE (CAPPED 50) */}
                                        <td style={{ width: '100px', padding: '14px 10px', textAlign: 'center', color: '#50fa7b', fontWeight: 'bold' }}>
                                            +{timeScore}
                                        </td>

                                        {/* TIER 2 STRATEGY (CAPPED 50) */}
                                        <td style={{ width: '100px', padding: '14px 10px', textAlign: 'center', color: '#de50fa', fontWeight: 'bold' }}>
                                            +{strategyScore}
                                        </td>

                                        {/* ACTIVE RISK PENALTIES */}
                                        <td style={{ width: '100px', padding: '14px 10px', textAlign: 'center', color: '#ff5555', fontWeight: 'bold' }}>
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
                </div>
            )}
        </div>
    );
};
