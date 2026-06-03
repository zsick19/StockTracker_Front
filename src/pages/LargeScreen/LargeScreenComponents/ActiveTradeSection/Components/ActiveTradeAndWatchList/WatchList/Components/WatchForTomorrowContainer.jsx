import React from 'react'
import { selectCombinedWatchForTomorrow, useGetUsersEnterExitPlanQuery } from '../../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { useDispatch } from 'react-redux'

function WatchForTomorrowContainer({ handleSwitchingWatchList })
{

    const dispatch = useDispatch()

    const { data: watchForTomorrow } = useGetUsersEnterExitPlanQuery(undefined, {
        selectFromResult: (results) => ({
            ...results,
            data: selectCombinedWatchForTomorrow(results)
        })
    })

    console.log(watchForTomorrow)
    return (
        <div onClick={handleSwitchingWatchList}>
            WatchForTomorrowContainer
            {watchForTomorrow.map((t) => <p>{t.tickerSymbol}</p>)}
        </div>
    )
}

export default WatchForTomorrowContainer