import React, { useState } from 'react'
import HorizontalPlanDiagram from '../../../../ActiveTradeSection/Components/ActiveTradeAndWatchList/WatchList/Components/PlanPricingDiagram/HorizontalPlanDiagram'
import { useRemoveSingleEnterExitPlanMutation, useToggleEnterExitPlanImportantMutation } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { CircleAlert, SquareArrowOutUpRight, SquareArrowUpLeft, Trash, Trash2, X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setSingleChartTickerTimeFrameChartIdPlanIdForTrade } from '../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'


function SinglePlanView({ plan, selectedPlan, setSelectedPlan })
{
    const dispatch = useDispatch()
    const [toggleEnterExitPlanImportant] = useToggleEnterExitPlanImportantMutation()
    const [removeSingleEnterExitPlan] = useRemoveSingleEnterExitPlanMutation()
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [showPlanNumbers, setShowPlanNumbers] = useState(false)

    async function attemptTogglingImportance()
    {

        try
        {
            await toggleEnterExitPlanImportant({ tickerSymbol: plan.tickerSymbol, planId: plan._id, markImportant: !plan?.highImportance }).unwrap()
        } catch (error)
        {
            console.log(error)
        }
    }
    async function attemptRemovingPlan()
    {
        try
        {
            await removeSingleEnterExitPlan({ tickerSymbol: plan.tickerSymbol, planId: plan._id }).unwrap()
        } catch (error)
        {
            console.log(error)
        }
    }


    function handleTradeView()
    {
        dispatch(setSingleChartTickerTimeFrameChartIdPlanIdForTrade({ ticker: plan.tickerSymbol, chartId: plan._id, planId: plan._id, plan }))
        dispatch(setStockDetailState(8))
    }


    return (
        <div className={`LHS-SinglePlanResult ${selectedPlan?.tickerSymbol === plan.tickerSymbol ? 'highLightForSelectedPlan' : ''} 
        ${plan.mostRecentPrice > plan.plan.moonPrice ? 'wayOverPlan' :
                plan.mostRecentPrice < plan.plan.stopLossPrice ? 'wayUnderPlan' : 'planStillInPlay'}
                `}
            onClick={() => setSelectedPlan(plan)}>
            <div>
                <p>{plan.tickerSymbol}</p>
                <p>${plan.mostRecentPrice.toFixed(2)}</p>
            </div>
            <div>
                <p>{(plan.percentFromEnter * -1).toFixed(2)}% </p>
                <p>from ${plan.plan.enterPrice.toFixed(2)}</p>
            </div>
            <div> {plan.plan.percents[0].toFixed(2)} vs {plan.plan.percents[3].toFixed(2)}</div>
            <p>{plan?.sector}</p>
            <div>
                <p>{plan.trackingDays > 1 ? `${plan.trackingDays} Days` : `${plan.trackingDays} Day`}</p>
                <p>{plan.mostRecentPrice > plan.initialTrackingPrice ? 'Moving Away' : 'Moving Towards'}</p>
            </div>
            {showPlanNumbers ?
                <div className='flex' onClick={(e) => { e.stopPropagation(); setShowPlanNumbers(false) }}>
                    <p>${plan.plan.stopLossPrice} StopLoss</p>
                    <p>${plan.plan.enterPrice} Enter</p>
                    <p>${plan.plan.enterBufferPrice} Buffer</p>
                    <p>${plan.plan.exitPrice} Exit</p>
                    <p>${plan.initialTrackingPrice} Initial</p>
                </div> :
                <HorizontalPlanDiagram mostRecentPrice={plan.mostRecentPrice} planPricePointObject={plan.plan} initialTrackingPrice={plan.initialTrackingPrice} setShowPlanNumbers={setShowPlanNumbers} />
            }

            {showDeleteConfirmation ? <div className='flex'>
                <button className='buttonIcon' onClick={(e) => { e.stopPropagation(); setShowDeleteConfirmation(false) }}><X color='blue' /></button>
                <button className='buttonIcon' onClick={(e) => { e.stopPropagation(); attemptRemovingPlan() }}><Trash color='red' /></button>
            </div> :
                <div className='flex'>
                    <button className='buttonIcon' onClick={(e) => { e.stopPropagation(); setShowDeleteConfirmation(true) }}><Trash2 color='white' size={20} /></button>
                    <button className='buttonIcon' onClick={(e) => { e.stopPropagation(); attemptTogglingImportance(); }}><CircleAlert color={plan?.highImportance ? 'orange' : 'gray'} size={20} /></button>
                    <button className='buttonIcon' onClick={(e) => { e.stopPropagation(); handleTradeView() }}><SquareArrowOutUpRight color='white' size={20} /></button>
                </div>
            }

        </div>
    )
}

export default SinglePlanView