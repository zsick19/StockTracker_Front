import React, { useEffect, useState } from 'react'
import { CapitalAllocationHUD } from './CapitalAllocationHUD'
import { ExecutionUrgencyHud } from './ExecutionUrgencyHUD'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectDetailedScoreBreakDownBySymbol } from '../../../../../../../features/Engine/EnginePlanApiSlice'

function PlanStatusHUD({ plan, setShowMinuteOrDailyChart })
{
    const planConfig = plan.planConfig
    const { centralScoreProfile, mostRecentPrice, mostRecentPriceUpDown } = useSelector((state) => selectDetailedScoreBreakDownBySymbol(state, plan.id))

    const yesterDayClose = plan.snapShot.PrevDailyBar.ClosePrice
    const dollarChange = (mostRecentPrice - yesterDayClose)

    const currentScore = centralScoreProfile.matchScorePercent
    const trailingDecimals = mostRecentPrice < 4 ? 3 : 2

    const displayRvR = centralScoreProfile.withinPlan
    const scores = centralScoreProfile.metrics
    const auditLedger = centralScoreProfile.auditLedger

    const [showScoreDetails, setShowScoreDetails] = useState({ display: false, scoreSelection: undefined })
    const planExtremes = { stopLoss: plan.planConfig.plan.stopLossPrice, ceiling: plan.patternConfig.channelTop }

    return (
        <div id='PlanActionContainer'>

            <div id='StockPriceChange' onClick={() => setShowMinuteOrDailyChart(prev => !prev)}>
                <div>
                    <h2>{plan.id}</h2>

                    <div className='flex'>
                        <h2>{mostRecentPrice.toFixed(trailingDecimals)}</h2>
                        {mostRecentPriceUpDown !== undefined ? mostRecentPriceUpDown ? <ChevronUp color='green' /> : <ChevronDown color='red' /> : ''}
                    </div>
                </div>

                <div className={dollarChange === 0 ? 'dollarChangeNeutral' : dollarChange > 0 ? 'dollarChangePositive' : 'dollarChangeNegative'}>
                    <p>{dollarChange.toFixed(3)}</p>
                    <p>{((dollarChange / yesterDayClose) * 100).toFixed(2)}%</p>
                </div>
            </div>


            <ExecutionUrgencyHud planData={plan} scoreData={centralScoreProfile} mostRecentPrice={mostRecentPrice} />

            {displayRvR ?
                <>
                    <CapitalAllocationHUD planData={plan} mostRecentPrice={mostRecentPrice} />

                    {showScoreDetails.display ?
                        <div className='miniScoreBreakDown' style={{ background: '#111219', height: '75px', marginBottom: '1rem', borderRadius: '5px', padding: '0.5rem' }}
                            onClick={() => setShowScoreDetails({ display: false, scoreSelection: undefined })}>
                            <p style={{ color: showScoreDetails.displayColor }}>{showScoreDetails.scoreSelection}</p>
                            <div style={{ height: "42px", overflowY: 'scroll' }} className='hide-scrollbar' >
                                {auditLedger[showScoreDetails.scoreSelection].map((t) => <p>{t.ruleName}</p>)}
                            </div>
                        </div> :
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', textAlign: 'center', alignItems: 'center',
                            height: '100%', background: '#111219', borderRadius: '5px', padding: '1rem', marginBottom: '1rem'
                            , fontSize: 'var(--fs-200)'
                        }}>
                            <div onClick={() => setShowScoreDetails({ display: true, scoreSelection: 'BASE', displayColor: '#50fa7b' })} style={{ color: '#50fa7b' }}                            >
                                <p>{scores.baseEnvironmentScore}</p>
                                <p>Base</p>
                            </div>
                            <div onClick={() => setShowScoreDetails({ display: true, scoreSelection: 'TIME', displayColor: '#50fa7b' })} style={{ color: '#50fa7b' }}>
                                <p>{scores.timeDependentScore}</p>
                                <p>Time</p>
                            </div>
                            <div onClick={() => setShowScoreDetails({ display: true, scoreSelection: 'STRATEGY', displayColor: '#de50fa' })} style={{ color: '#de50fa' }}>
                                <p>{scores.patternSpecificScore}</p>
                                <p>Strategy</p>
                            </div>
                            <div onClick={() => setShowScoreDetails({ display: true, scoreSelection: 'PENALTIES', displayColor: '#ff5555' })} style={{ color: '#ff5555' }}>
                                <p>{scores.systemicPenaltiesApplied}</p>
                                <p>Penalties</p>
                            </div>

                            <div style={{ color: '#00ffff' }}>
                                <p>{currentScore}</p>
                                <p>Alpha</p>
                            </div>

                        </div>
                    }
                </>
                : <div>
                    <p>Trade Sits Outside Planned Zone</p>
                    <p>Stoploss: {planExtremes.stopLoss}</p>
                    <p>Ceiling: {planExtremes.ceiling}</p>
                </div>}
        </div>
    )
}

export default PlanStatusHUD