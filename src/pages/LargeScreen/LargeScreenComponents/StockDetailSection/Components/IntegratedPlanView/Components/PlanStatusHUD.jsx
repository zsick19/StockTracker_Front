import React, { useEffect, useState } from 'react'
import { CapitalAllocationHUD } from './CapitalAllocationHUD'
import { ExecutionUrgencyHud } from './ExecutionUrgencyHUD'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectDetailedScoreBreakDownBySymbol } from '../../../../../../../features/Engine/EnginePlanApiSlice'

function PlanStatusHUD({ plan })
{
    const planConfig = plan.planConfig
    const { centralScoreProfile, mostRecentPrice, mostRecentPriceUpDown } = useSelector((state) => selectDetailedScoreBreakDownBySymbol(state, plan.id))

    const yesterDayClose = planConfig.dailyCalculatedValues.PrevDailyBar.ClosePrice
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

            <div id='PlanStatusHUD'>
                <div id='StockPriceChange'>
                    <div>
                        <h2>{plan.id}</h2>

                        <h2>{mostRecentPrice.toFixed(trailingDecimals)}</h2>
                        {mostRecentPriceUpDown !== undefined ? mostRecentPriceUpDown ? <ChevronUp color='green' /> : <ChevronDown color='red' /> : ''}
                    </div>

                    <div className={dollarChange === 0 ? 'dollarChangeNeutral' : dollarChange > 0 ? 'dollarChangePositive' : 'dollarChangeNegative'}>
                        <p>{dollarChange.toFixed(3)}</p>
                        <p>{((dollarChange / yesterDayClose) * 100).toFixed(2)}%</p>
                    </div>
                </div>

                <div id='PlanScore'>
                    <h2>{currentScore}</h2>
                    <p>ALPHA SCORE</p>
                </div>
            </div>


            <ExecutionUrgencyHud planData={plan} scoreData={centralScoreProfile} mostRecentPrice={mostRecentPrice} />

            {displayRvR ?
                <>
                    <CapitalAllocationHUD planData={plan} mostRecentPrice={mostRecentPrice} />
                    {showScoreDetails.display ? <div className='miniScoreBreakDown hide-scrollbar' onClick={() => setShowScoreDetails({ display: false, scoreSelection: undefined })}>
                        {auditLedger[showScoreDetails.scoreSelection].map((t) => <p>{t.ruleName}</p>)}
                    </div> :
                        <div className='flex'>
                            <div onClick={() => setShowScoreDetails({ display: true, scoreSelection: 'BASE' })}>
                                <p>Base</p>
                                <p>{scores.baseEnvironmentScore}</p>
                            </div>
                            <div onClick={() => setShowScoreDetails({ display: true, scoreSelection: 'TIME' })}>
                                <p>Time</p>
                                <p>{scores.timeDependentScore}</p>
                            </div>
                            <div onClick={() => setShowScoreDetails({ display: true, scoreSelection: 'STRATEGY' })}>
                                <p>Strategy</p>
                                <p>{scores.patternSpecificScore}</p>
                            </div>
                            <div onClick={() => setShowScoreDetails({ display: true, scoreSelection: 'PENALTIES' })}>
                                <p>Penalties</p>
                                <p>{scores.systemicPenaltiesApplied}</p>
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