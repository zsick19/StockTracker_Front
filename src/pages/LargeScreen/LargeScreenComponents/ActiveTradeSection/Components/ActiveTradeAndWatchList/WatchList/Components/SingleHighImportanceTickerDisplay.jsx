import React, { useState } from 'react'
import { highImportanceSelectors, useGetUsersEnterExitPlanQuery, useRemoveSingleEnterExitPlanMutation, useToggleEnterExitPlanImportantMutation } from '../../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setSelectedStockAndTimelineFourSplit, setSingleChartTickerTimeFrameAndChartingId, setSingleChartTickerTimeFrameChartIdPlanIdForTrade } from '../../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import HorizontalPlanDiagram from './PlanPricingDiagram/HorizontalPlanDiagram'

function SingleHighImportanceTickerDisplay({ id })
{
    const dispatch = useDispatch()
    const [showImportantRemove, setShowImportantRemove] = useState(false)
    const [toggleEnterExitPlanImportant, { isLoading }] = useToggleEnterExitPlanImportantMutation()
    const [removeSingleEnterExitPlan] = useRemoveSingleEnterExitPlanMutation()



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
            <div className={`SingleWatchListTicker ${plan.listChange ? 'blinkForListUpdate' : ''}`}>
                <p onClick={handleFourWaySplit}>{plan.tickerSymbol}</p>

                {showImportantRemove ? <>
                    <button className='buttonIcon' onClick={() => attemptRemovingImportance()} disabled={isLoading}> Unimportant</button>
                    <button className='buttonIcon' onClick={() => attemptRemovingPlan()}>Remove</button>
                    <button className='buttonIcon' onClick={() => setShowImportantRemove(false)}><X color='white' size={14} /></button>
                </> :
                    <>
                        <p onClick={handleTradeView}>${plan.mostRecentPrice.toFixed(2)}</p>
                        <p>{plan.currentDayPercentGain.toFixed()}%</p>
                        <p onClick={() => setShowImportantRemove(true)}>{plan.percentFromEnter.toFixed(2)}%</p>
                    </>}
            </div>
            <div className='SingleTickerDiagram' >
                <HorizontalPlanDiagram mostRecentPrice={plan.mostRecentPrice} planPricePointObject={plan.plan} initialTrackingPrice={plan.initialTrackingPrice} />
            </div>
        </ div>
    )
}

export default SingleHighImportanceTickerDisplay