import React from 'react'
import { useDispatch } from 'react-redux'
import { setSelectedStockAndTimelineFourSplit } from '../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { CircleArrowRight } from 'lucide-react'
import { useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'

import EnterBufferHitContainer from './Components/EnterBufferHitContainer'
import StopLossHitContainer from './Components/StopLossHitContainer'
import PlannedTrackingContainer from './Components/PlannedTrackingContainer'
import './WatchListStyles.css'

function PreTradeWatchList({ setActiveTradeLarger })
{
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetUsersEnterExitPlanQuery()


    let enterBufferHitContent
    let stopLossHitContent
    let plannedTrackedContent

    if (isSuccess)
    {
        enterBufferHitContent = <EnterBufferHitContainer enterBufferHitIds={data.enterBufferHit.ids} refetch={refetch} />
        stopLossHitContent = <StopLossHitContainer stopLossHitIds={data.stopLossHit.ids} />
        plannedTrackedContent = <PlannedTrackingContainer enterExitPlansIds={data.plannedTickers.ids} />
    }
    else if (isLoading)
    {
        enterBufferHitContent = <div>Loading</div>
        stopLossHitContent = <div>Loading</div>
        plannedTrackedContent = <div>Loading</div>
    }
    else if (isError)
    {

        enterBufferHitContent = <div>Error</div>
        stopLossHitContent = <div>Error</div>
        plannedTrackedContent = <div>Error</div>
    }


    return (
        <div id='LSH-PreTradeWatchAsList' >
            {enterBufferHitContent}
            {stopLossHitContent}
            {plannedTrackedContent}
        </div >
    )
}

export default PreTradeWatchList