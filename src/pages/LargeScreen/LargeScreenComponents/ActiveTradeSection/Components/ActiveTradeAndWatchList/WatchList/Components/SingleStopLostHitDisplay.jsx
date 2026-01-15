import React from 'react'
import { stopLossHitSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../../features/EnterExitPlans/EnterExitApiSlice'

function SingleStopLostHitDisplay({ id })
{

    const { plan } = useGetUsersEnterExitPlanQuery(undefined, {
        selectFromResult: ({ data, isLoading }) =>
            ({ plan: data ? stopLossHitSelectors.selectById(data.stopLossHit, id) : undefined })
    })
    return (
        <div className='flex'>
            {plan.tickerSymbol}
            <p>${plan.mostRecentPrice.toFixed(2)}</p>
            <p>{plan.currentDayPercentGain.toFixed(2)}%</p>
            <p>{plan.percentFromEnter.toFixed()}%</p>
        </div>
    )
}

export default SingleStopLostHitDisplay