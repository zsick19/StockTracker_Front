import React from 'react'
import { enterBufferSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../../features/EnterExitPlans/EnterExitApiSlice'

function SingleEnterBufferHitDisplay({ id })
{

    const { plan } = useGetUsersEnterExitPlanQuery(undefined, {
        selectFromResult: ({ data, isLoading }) =>
            ({ plan: data ? enterBufferSelectors.selectById(data.enterBufferHit, id) : undefined })
    })

    return (
        <div className='flex'>
            {plan.tickerSymbol}
            <p>${plan.mostRecentPrice}</p>
            <p>{plan.currentDayPercentGain.toFixed(2)}%</p>
            <p>{plan.percentFromEnter.toFixed()}%</p>
        </div>
    )
}

export default SingleEnterBufferHitDisplay