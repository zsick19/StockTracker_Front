import React from 'react'
import HorizontalPlanDiagram from '../../../../../ActiveTradeSection/Components/ActiveTradeAndWatchList/WatchList/Components/PlanPricingDiagram/HorizontalPlanDiagram'

function PlanInfo({ plan })
{
    if (!plan) return <div></div>

    return (
        <div id='ExpandedPlanInfo'>
            <div>
                <p>Current Price: ${plan.mostRecentPrice.toFixed(2)}</p>
                <p>{plan.sector}</p>
                <p>RvR {plan.plan.percents[0]} v  {plan.plan.percents[3]}</p>
            </div>
            <HorizontalPlanDiagram mostRecentPrice={plan.mostRecentPrice} planPricePointObject={plan.plan} initialTrackingPrice={plan.initialTrackingPrice} />
            <div className='ExpandedPlanPricing'>
                <p>StopLoss ${plan.plan.stopLossPrice}</p>
                <p>Enter ${plan.plan.enterPrice}</p>
                <p>Enter Buffer ${plan.plan.enterBufferPrice}</p>
                <p>Exit Buffer ${plan.plan.exitBufferPrice}</p>
                <p>Exit ${plan.plan.exitPrice}</p>
                <p>Moon ${plan.plan.moonPrice}</p>
            </div>

        </div>
    )
}

export default PlanInfo