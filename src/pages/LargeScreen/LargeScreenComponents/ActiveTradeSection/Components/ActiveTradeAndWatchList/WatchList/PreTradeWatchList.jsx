import React, { useState } from 'react'
import { useGetTinyEnterExit5MinChartsQuery, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import EnterBufferHitContainer from './Components/EnterBufferHitContainer'
import StopLossHitContainer from './Components/StopLossHitContainer'
import PlannedTrackingContainer from './Components/PlannedTrackingContainer'
import './WatchListStyles.css'
import HighImportanceWatchListContainer from './Components/HighImportanceWatchListContainer'
import WatchForTomorrowContainer from './Components/WatchForTomorrowContainer'
import { isWeekend } from 'date-fns'

function PreTradeWatchList()
{
    let isWeekendPollingInterval = isWeekend(new Date()) ? 30000 : 0
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetTinyEnterExit5MinChartsQuery(undefined, { pollingInterval: isWeekendPollingInterval })
    const { data: enterExitData, isSuccess: isEnterExitSuccess, refetch: refetchEnterExitPlan } = useGetUsersEnterExitPlanQuery()
    const [selectedWatchList, setSelectedWatchList] = useState(0)
    function handleSwitchingWatchList()
    {
        if (selectedWatchList === 3) setSelectedWatchList(0)
        else setSelectedWatchList(prev => prev + 1)
    }

    let highImportanceContent
    let watchForTomorrow
    let enterBufferHitContent
    let stopLossHitContent
    let plannedTrackedContent

    if (isSuccess && isEnterExitSuccess)
    {
        highImportanceContent = <HighImportanceWatchListContainer handleSwitchingWatchList={handleSwitchingWatchList} />
        watchForTomorrow = <WatchForTomorrowContainer handleSwitchingWatchList={handleSwitchingWatchList} />
        enterBufferHitContent = <EnterBufferHitContainer enterBufferHitIds={enterExitData.enterBufferHit.ids} refetch={refetch} handleSwitchingWatchList={handleSwitchingWatchList} />
        // stopLossHitContent = <StopLossHitContainer stopLossHitIds={data.stopLossHit.ids} handleSwitchingWatchList={handleSwitchingWatchList} />
        plannedTrackedContent = <PlannedTrackingContainer enterExitPlansIds={enterExitData.plannedTickers.ids} handleSwitchingWatchList={handleSwitchingWatchList} />
    }
    else if (isLoading)
    {
        highImportanceContent = <div>Loading...</div>
        enterBufferHitContent = <div>Loading</div>
        // stopLossHitContent = <div>Loading</div>
        plannedTrackedContent = <div>Loading</div>
    }
    else if (isError)
    {
        highImportanceContent = <div>Error <button onClick={() => { refetch(); refetchEnterExitPlan() }}>Refetch</button></div>
        enterBufferHitContent = <div>Error</div>
        // stopLossHitContent = <div>Error</div>
        plannedTrackedContent = <div>Error</div>
    }


    function provideWatchList()
    {

        switch (selectedWatchList)
        {
            case 0: return highImportanceContent
            case 1: return plannedTrackedContent
            case 2: return enterBufferHitContent;
            case 3: return watchForTomorrow
        }
    }

    return (
        <div id='LSH-PreTradeWatchAsList' onDoubleClick={() => { refetch(); refetchEnterExitPlan() }} >
            {provideWatchList()}
        </div >
    )
}

export default PreTradeWatchList