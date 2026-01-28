import React from 'react'
import HorizontalPlanDiagram from '../../../../ActiveTradeSection/Components/ActiveTradeAndWatchList/WatchList/Components/PlanPricingDiagram/HorizontalPlanDiagram'


function SinglePlanView({ plan, selectedPlan, setSelectedPlan })
{


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

            <div className='flex'>
                <button onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan) }}>Remove</button>
                <button onClick={(e) => { e.stopPropagation(); console.log('putting in for high importance') }}>
                    {plan?.highImportance ? 'Remove Importance' : 'Set Importance'}
                </button>
            </div>

        </div>
    )
}

export default SinglePlanView