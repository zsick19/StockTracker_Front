import React, { useEffect } from 'react'
import { useGetUsersEnterExitPlanQuery } from '../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import PreWatchManyPlanWrapper from './Components/PreWatchManyPlanWrapper'
import './PrewatchMany.css'

function PreWatchMany({ watchList })
{
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetUsersEnterExitPlanQuery()

    let planDisplayContent
    if (isSuccess)
    {
        let watchListIds
        switch (watchList)
        {
            case 0: watchListIds = data.stopLossHit.ids; break;
            case 1: watchListIds = data.enterBufferHit.ids; break;
            case 2: watchListIds = data.plannedTickers.ids; break;
            case 3: watchListIds = data.highImportance.ids; break;
        }
        planDisplayContent = <PreWatchManyPlanWrapper ids={watchListIds} watchList={watchList} />
    }

    useEffect(() =>
    {
        if (isSuccess)
        {
            let watchListIds
            switch (watchList)
            {
                case 0: watchListIds = data.stopLossHit.ids; break;
                case 1: watchListIds = data.enterBufferHit.ids; break;
                case 2: watchListIds = data.plannedTickers.ids; break;
                case 3: watchListIds = data.highImportance.ids; break;
            }
            planDisplayContent = <PreWatchManyPlanWrapper ids={watchListIds} watchList={watchList} />
        }
    }, [watchList])

    
    return (
        <div id='PrewatchMany'>
            {watchList === 0 ? <h1>StopLoss Hit Pre-Watch</h1> : watchList === 1 ? <h1>Buffer Hit Pre-Watch</h1> : watchList === 2 ? <h1>Planned Stocks Pre-Watch</h1> : <h1>High Importance</h1>}
            {planDisplayContent}
        </div>
    )
}

export default PreWatchMany