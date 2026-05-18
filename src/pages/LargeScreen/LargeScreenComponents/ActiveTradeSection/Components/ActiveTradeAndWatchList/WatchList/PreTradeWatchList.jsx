import React, { useState } from 'react'
import { useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import EnterBufferHitContainer from './Components/EnterBufferHitContainer'
import StopLossHitContainer from './Components/StopLossHitContainer'
import PlannedTrackingContainer from './Components/PlannedTrackingContainer'
import './WatchListStyles.css'
import HighImportanceWatchListContainer from './Components/HighImportanceWatchListContainer'

function PreTradeWatchList()
{
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetUsersEnterExitPlanQuery(undefined, { pollingInterval: 180000 })
    const [selectedWatchList, setSelectedWatchList] = useState(0)
    function handleSwitchingWatchList()
    {
        if (selectedWatchList === 2) setSelectedWatchList(0)
        else setSelectedWatchList(prev => prev + 1)
    }

    let highImportanceContent
    let enterBufferHitContent
    let stopLossHitContent
    let plannedTrackedContent

    if (isSuccess)
    {
        highImportanceContent = <HighImportanceWatchListContainer highImportanceWatchListIds={data.highImportance.ids} />
        enterBufferHitContent = <EnterBufferHitContainer enterBufferHitIds={data.enterBufferHit.ids} refetch={refetch} handleSwitchingWatchList={handleSwitchingWatchList} />
        stopLossHitContent = <StopLossHitContainer stopLossHitIds={data.stopLossHit.ids} handleSwitchingWatchList={handleSwitchingWatchList} />
        plannedTrackedContent = <PlannedTrackingContainer enterExitPlansIds={data.plannedTickers.ids} handleSwitchingWatchList={handleSwitchingWatchList} />
    }
    else if (isLoading)
    {
        highImportanceContent = <div>Loading...</div>
        enterBufferHitContent = <div>Loading</div>
        stopLossHitContent = <div>Loading</div>
        plannedTrackedContent = <div>Loading</div>
    }
    else if (isError)
    {
        highImportanceContent = <div>Error <button onClick={() => refetch()}>Refetch</button></div>
        enterBufferHitContent = <div>Error</div>
        stopLossHitContent = <div>Error</div>
        plannedTrackedContent = <div>Error</div>
    }


    function provideWatchList()
    {
        switch (selectedWatchList)
        {
            case 0: return enterBufferHitContent
            case 1: return stopLossHitContent
            case 2: return plannedTrackedContent;

        }
    }

    return (
        <div id='LSH-PreTradeWatchAsList' >
            {highImportanceContent}
            {provideWatchList()}

        </div >
    )
}

export default PreTradeWatchList