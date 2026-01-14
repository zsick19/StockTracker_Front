import React from 'react'
import { enterBufferSelectors, enterExitPlannedSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../../features/EnterExitPlans/EnterExitApiSlice'

function SinglePlannedTickerDisplay({ id })
{

    const { plan } = useGetUsersEnterExitPlanQuery(undefined, {
        selectFromResult: ({ data }) => ({ plan: data ? enterExitPlannedSelectors.selectById(data.plannedTickers, id) : undefined })
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

export default SinglePlannedTickerDisplay