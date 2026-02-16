import React, { useState } from 'react'
import { enterBufferSelectors, highImportanceSelectors, useGetUsersEnterExitPlanQuery, useRemoveSingleEnterExitPlanMutation, useToggleEnterExitPlanImportantMutation } from '../../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { AlertCircle, Trash2, X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setSelectedStockAndTimelineFourSplit, setSingleChartTickerTimeFrameChartIdPlanIdForTrade } from '../../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import HorizontalPlanDiagram from './PlanPricingDiagram/HorizontalPlanDiagram'
import { useGetStockAverageTrueRangeQuery } from '../../../../../../../../features/StockData/StockDataSliceApi'
import ATRRequest from './ATRRequest'

function SingleHighImportanceTickerDisplay({ id, watchList, sectorHighlight })
{
    const dispatch = useDispatch()
    const [toggleEnterExitPlanImportant, { isLoading }] = useToggleEnterExitPlanImportantMutation()
    const [removeSingleEnterExitPlan] = useRemoveSingleEnterExitPlanMutation()

    const [showImportantRemove, setShowImportantRemove] = useState(false)
    const [showPlanNumbers, setShowPlanNumbers] = useState(false)
    const [showChangeFromYesterday, setShowChangeFromYesterday] = useState(false)
    const [showIdealRiskVReward, setShowIdealRiskVReward] = useState(false)
    const [show1000Dollars, setShow1000Dollars] = useState(false)

    const { plan } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: ({ data }) => ({ plan: data ? provideSelector(data) : undefined }) })
    function provideSelector(data)
    {
        switch (watchList)
        {
            case 0: return enterBufferSelectors.selectById(data.enterBufferHit, id)
            default: return highImportanceSelectors.selectById(data.highImportance, id)
        }
    }


    function handleFourWaySplit()
    {
        dispatch(setSelectedStockAndTimelineFourSplit({ ticker: plan.tickerSymbol, chartId: plan._id }))
        dispatch(setStockDetailState(0))
    }
    function handleTradeView()
    {
        dispatch(setSingleChartTickerTimeFrameChartIdPlanIdForTrade({ ticker: plan.tickerSymbol, chartId: plan._id, planId: plan._id, plan }))
        dispatch(setStockDetailState(8))
    }
    async function attemptRemovingImportance()
    {
        try
        {
            const results = await toggleEnterExitPlanImportant({ tickerSymbol: plan.tickerSymbol, planId: plan._id, markImportant: false }).unwrap()
        } catch (error)
        {
            console.log(error)
        }
    }
    async function attemptRemovingPlan()
    {
        try
        {
            const results = await removeSingleEnterExitPlan({ tickerSymbol: plan.tickerSymbol, planId: plan._id }).unwrap()

        } catch (error)
        {
            console.log(error)
        }
    }


    return (
        <>
            {(sectorHighlight === 'all' || sectorHighlight === plan.sector) &&
                <div className={`highImportancePlanAndDiagram ${plan.listChange ? 'blinkForListUpdate' : ''}`}>
                    <div className={`SingleWatchListTicker  ${plan.changeFromYesterdayClose === 0 ? 'trackingNeutral' : plan.changeFromYesterdayClose > 0 ? 'trackingPositive' : 'trackingNegative'}`}>
                        <p onClick={handleFourWaySplit}>{plan.tickerSymbol}</p>

                        {showImportantRemove ? <>
                            <button className='buttonIcon' onClick={() => attemptRemovingImportance()} disabled={isLoading}><AlertCircle size={14} color='red' /></button>
                            <button className='buttonIcon' onClick={() => attemptRemovingPlan()}><Trash2 color='red' size={14} /></button>
                            <button className='buttonIcon' onClick={() => setShowImportantRemove(false)}><X color='white' size={14} /></button>
                        </> :
                            <>
                                <p onClick={handleTradeView}>${plan.mostRecentPrice.toFixed(2)}</p>
                                <p onClick={() => setShow1000Dollars(prev => !prev)}>{(plan.percentFromEnter * -1).toFixed(2)}%</p>
                                <div onClick={() => setShowImportantRemove(true)} onMouseEnter={() => setShowChangeFromYesterday(true)} onMouseLeave={() => setShowChangeFromYesterday(false)}>
                                    {showChangeFromYesterday ? <ATRRequest changeFromYesterdayClose={plan.changeFromYesterdayClose} ticker={plan.tickerSymbol} /> :
                                        <p>{plan.currentDayPercentGain.toFixed(2)}%</p>}
                                </div>
                            </>}
                    </div>

                    {showPlanNumbers ? <div className='SingleTickerDiagram' onClick={() => setShowPlanNumbers(prev => !prev)}>
                        <p>ST: ${plan.plan.stopLossPrice}</p>
                        <p>E: ${plan.plan.enterPrice}</p>
                        <p>EB: ${plan.plan.enterBufferPrice}</p>
                        <p>Ex: ${plan.plan.exitPrice}</p>
                    </div> :
                        <div className='SingleTickerDiagram' onClick={() => setShowPlanNumbers(prev => !prev)} >
                            {show1000Dollars ?
                                <p>Ideal: ${plan.with1000DollarsIdealGain.toFixed(2)} vs Current: ${plan.with1000DollarsCurrentGain.toFixed(2)}</p> :
                                <HorizontalPlanDiagram mostRecentPrice={plan.mostRecentPrice} planPricePointObject={plan.plan} initialTrackingPrice={plan.initialTrackingPrice} />}
                            {showIdealRiskVReward ?
                                <p onMouseLeave={() => setShowIdealRiskVReward(false)}> {plan.plan.percents[0].toFixed(2)} v {plan.plan.percents[3].toFixed(2)}</p> :
                                <p onMouseEnter={() => setShowIdealRiskVReward(true)}>{plan.currentRiskVReward.risk.toFixed(2)} v {plan.currentRiskVReward.reward.toFixed(2)}</p>
                            }
                        </div>
                    }
                </ div>
            }
        </>
    )
}

export default SingleHighImportanceTickerDisplay