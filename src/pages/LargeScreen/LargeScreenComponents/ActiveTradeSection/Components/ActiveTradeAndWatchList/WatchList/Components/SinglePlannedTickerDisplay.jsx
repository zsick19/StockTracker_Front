import React from 'react'
import { selectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../../features/EnterExitPlans/EnterExitApiSlice'

function SinglePlannedTickerDisplay({ id })
{

    const { plan, isLoading } = useGetUsersEnterExitPlanQuery(undefined, {
        selectFromResult: ({ data, isLoading }) => ({ plan: data ? selectors.selectById(data, id) : undefined, isLoading })
    })

    return (
        <div>
            {plan.tickerSymbol}
        </div>
    )
}

export default SinglePlannedTickerDisplay