import React, { useState } from 'react'
import HorizontalPlanDiagram from '../../../../ActiveTradeSection/Components/ActiveTradeAndWatchList/WatchList/Components/PlanPricingDiagram/HorizontalPlanDiagram'
import { useRemoveSingleEnterExitPlanMutation, useToggleEnterExitPlanImportantMutation } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { CircleAlert, Trash, Trash2, X } from 'lucide-react'


function SinglePlanView({ plan, selectedPlan, setSelectedPlan })
{
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

    function provideGroup()
    {
        switch (plan.priceVsPlanUponFetch)
        {
            case 1: return 'StopLoss Hit'
            case 2: return 'Enter Buffer Hit'
            case 3: return 'Above Enter Buffer'
        }
    }


    return (
        <div className={`LHS-SinglePlanResult ${selectedPlan?.tickerSymbol === plan.tickerSymbol ? 'highLightForSelectedPlan' : ''} 
        ${plan.mostRecentPrice > plan.plan.moonPrice ? 'wayOverPlan' :
                plan.mostRecentPrice < plan.plan.stopLossPrice ? 'wayOverPlan' : ''}
                `}
            onClick={() => setSelectedPlan(plan)}>
            <div>
                <p>{plan.tickerSymbol}</p>
                <p>{(plan.percentFromEnter * -1).toFixed(2)}% away</p>
            </div>
            <div>
                <p>Curr: ${plan.mostRecentPrice.toFixed(2)}</p>
                <p>vs ${plan.plan.enterPrice}</p>
            </div>
            <div> {plan.plan.percents[0].toFixed(2)} vs {plan.plan.percents[3].toFixed(2)}</div>
            <p>{plan?.sector}</p>
            <div>
                <p>{plan.trackingDays > 1 ? `${plan.trackingDays} Days` : `${plan.trackingDays} Day`}</p>
                <p>{provideGroup()}</p>
            </div>
            {showPlanNumbers ?
                <div className='flex' onClick={() => setShowPlanNumbers(false)}>
                    <p>SL: ${plan.plan.stopLossPrice}</p>
                    <p>E: ${plan.plan.enterPrice}</p>
                    <p>EB: ${plan.plan.enterBufferPrice}</p>
                </div> :
                <HorizontalPlanDiagram mostRecentPrice={plan.mostRecentPrice} planPricePointObject={plan.plan} initialTrackingPrice={plan.initialTrackingPrice} setShowPlanNumbers={setShowPlanNumbers} />
            }

            {showDeleteConfirmation ? <div className='flex'>
                <button className='buttonIcon' onClick={(e) => { e.stopPropagation(); setShowDeleteConfirmation(false) }}><X color='blue' /></button>
                <button className='buttonIcon' onClick={(e) => { e.stopPropagation(); attemptRemovingPlan() }}><Trash color='red' /></button>
            </div> :
                <div className='flex'>
                    <button className='buttonIcon' onClick={(e) => { e.stopPropagation(); setShowDeleteConfirmation(true) }}><Trash2 color='white' /></button>
                    <button className='buttonIcon' onClick={(e) => { e.stopPropagation(); attemptTogglingImportance(); }}><CircleAlert color={plan?.highImportance ? 'green' : 'gray'} /></button>
                </div>
            }

        </div>
    )
}

export default SinglePlanView