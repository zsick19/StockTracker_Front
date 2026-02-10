import React, { useState } from 'react'
import { highImportanceSelectors, useGetUsersEnterExitPlanQuery, useRemoveSingleEnterExitPlanMutation, useToggleEnterExitPlanImportantMutation } from '../../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { AlertCircle, Trash2, X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setSelectedStockAndTimelineFourSplit, setSingleChartTickerTimeFrameChartIdPlanIdForTrade } from '../../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import HorizontalPlanDiagram from './PlanPricingDiagram/HorizontalPlanDiagram'

function SingleHighImportanceTickerDisplay({ id })
{
    const dispatch = useDispatch()
    const [showImportantRemove, setShowImportantRemove] = useState(false)
    const [toggleEnterExitPlanImportant, { isLoading }] = useToggleEnterExitPlanImportantMutation()
    const [removeSingleEnterExitPlan] = useRemoveSingleEnterExitPlanMutation()
    const [showPlanNumbers, setShowPlanNumbers] = useState(false)


    const { plan } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: ({ data }) => ({ plan: data ? highImportanceSelectors.selectById(data.highImportance, id) : undefined }) })

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
        <div className='highImportancePlanAndDiagram'>
            <div className={`SingleWatchListTicker ${plan.listChange ? 'blinkForListUpdate' : ''} ${plan.changeFromYesterdayClose === 0 ? 'trackingNeutral' : plan.changeFromYesterdayClose > 0 ? 'trackingPositive' : 'trackingNegative'}`}>
                <p onClick={handleFourWaySplit}>{plan.tickerSymbol}</p>

                {showImportantRemove ? <>
                    <button className='buttonIcon' onClick={() => attemptRemovingImportance()} disabled={isLoading}><AlertCircle size={14} color='red' /></button>
                    <button className='buttonIcon' onClick={() => attemptRemovingPlan()}><Trash2 color='red' size={14} /></button>
                    <button className='buttonIcon' onClick={() => setShowImportantRemove(false)}><X color='white' size={14} /></button>
                </> :
                    <>
                        <p onClick={handleTradeView}>${plan.mostRecentPrice.toFixed(2)}</p>
                        <p>{(plan.percentFromEnter * -1).toFixed(2)}%</p>
                        <p onClick={() => setShowImportantRemove(true)}>{plan.currentDayPercentGain.toFixed(2)}%</p>
                    </>}
            </div>

            {showPlanNumbers ? <div className='SingleTickerDiagram' onClick={() => setShowPlanNumbers(prev => !prev)}>
                <p>ST: ${plan.plan.stopLossPrice}</p>
                <p>E: ${plan.plan.enterPrice}</p>
                <p>EB: ${plan.plan.enterBufferPrice}</p>
                <p>Cur: ${plan.mostRecentPrice.toFixed(2)}</p>
            </div> :
                <div className='SingleTickerDiagram' onClick={() => setShowPlanNumbers(prev => !prev)} >
                    <HorizontalPlanDiagram mostRecentPrice={plan.mostRecentPrice} planPricePointObject={plan.plan} initialTrackingPrice={plan.initialTrackingPrice} />
                    <p>{plan.plan.percents[0].toFixed(2)} v {plan.plan.percents[3].toFixed(2)}</p>
                </div>
            }
        </ div>
    )
}

export default SingleHighImportanceTickerDisplay