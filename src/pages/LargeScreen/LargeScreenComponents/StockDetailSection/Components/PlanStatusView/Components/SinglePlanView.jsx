import React, { useState } from 'react'
import HorizontalPlanDiagram from '../../../../ActiveTradeSection/Components/ActiveTradeAndWatchList/WatchList/Components/PlanPricingDiagram/HorizontalPlanDiagram'
import { useRemoveSingleEnterExitPlanMutation, useToggleEnterExitPlanImportantMutation } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { CircleAlert, Trash, X } from 'lucide-react'


function SinglePlanView({ plan, selectedPlan, setSelectedPlan })
{
    const [toggleEnterExitPlanImportant] = useToggleEnterExitPlanImportantMutation()
    const [removeSingleEnterExitPlan] = useRemoveSingleEnterExitPlanMutation()
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    
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
        <div className={`LHS-SinglePlanResult ${selectedPlan?.tickerSymbol === plan.tickerSymbol ? 'highLightForSelectedPlan' : ''}`} onClick={() => setSelectedPlan(plan)}>
            <div>
                <p>{plan.tickerSymbol}</p>
                <p>${plan.mostRecentPrice}</p>
            </div>
            <div>
                <p>${plan.plan.enterPrice}</p>
                <p>{plan.percentFromEnter.toFixed(2)}%</p>
            </div>
            <div> {plan.plan.percents[0]} vs {plan.plan.percents[4]}</div>
            <div>{plan?.sector}</div>
            <div>
                <p>{plan.trackingDays > 1 ? `${plan.trackingDays} Days` : `${plan.trackingDays} Day`}</p>
                <p>{provideGroup()}</p>
            </div>
            <HorizontalPlanDiagram mostRecentPrice={plan.mostRecentPrice} planPricePointObject={plan.plan} initialTrackingPrice={plan.initialTrackingPrice} />

            {showDeleteConfirmation ? <div className='flex'>
                <button className='buttonIcon' onClick={(e) => { e.stopPropagation(); setShowDeleteConfirmation(false) }}><X color='blue' /></button>
                <button className='buttonIcon' onClick={(e) => { e.stopPropagation(); attemptRemovingPlan() }}><Trash color='red' /></button>
            </div> :
                <div className='flex'>
                    <button className='buttonIcon' onClick={(e) => { e.stopPropagation(); setShowDeleteConfirmation(true) }}><Trash color='white' /></button>
                    <button className='buttonIcon' onClick={(e) => { e.stopPropagation(); attemptTogglingImportance(); console.log('CLCIKED') }}><CircleAlert color={plan?.highImportance ? 'green' : 'gray'} /></button>
                </div>
            }

        </div>
    )
}

export default SinglePlanView