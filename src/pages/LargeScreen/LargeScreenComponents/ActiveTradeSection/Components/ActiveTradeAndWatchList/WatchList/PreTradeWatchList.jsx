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
        enterBufferHitContent = <EnterBufferHitContainer enterBufferHitIds={data.enterBufferHit.ids} />
        stopLossHitContent = <StopLossHitContainer stopLossHitIds={data.stopLossHit.ids} />
        plannedTrackedContent = <PlannedTrackingContainer enterExitPlansIds={data.plannedTickers.ids} />
    }
    else if (isLoading)
    {
        enterBufferHitContent = <div>Loading</div>
        stopLossHitContent = <div>Loading</div>
        plannedTrackedContent = <div>Loading</div>
    }
    else if(isError){
        
        enterBufferHitContent = <div>Loading</div>
        stopLossHitContent = <div>Loading</div>
        plannedTrackedContent = <div>Loading</div>
    }

    const dispatch = useDispatch()

    const handleSettingTickerToFourWaySplit = (ticker) =>
    {
        dispatch(setStockDetailState(0))
        dispatch(setSelectedStockAndTimelineFourSplit(ticker))
    }

    const handleBufferHitToVisualPreWatch = () =>
    {
        dispatch(setStockDetailState(4))
        //dispatch selected stock to show pre-watch many
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