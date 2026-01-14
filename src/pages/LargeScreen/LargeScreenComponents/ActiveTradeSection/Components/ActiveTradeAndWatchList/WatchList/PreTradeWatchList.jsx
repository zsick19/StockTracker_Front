import React from 'react'
import { useDispatch } from 'react-redux'
import { setSelectedStockAndTimelineFourSplit } from '../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { CircleArrowRight } from 'lucide-react'
import SinglePlannedTickerDisplay from './Components/SinglePlannedTickerDisplay'
import { enterBufferSelectors, enterExitPlannedSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import SingleStopLostHitDisplay from './Components/SingleStopLostHitDisplay'
import SingleEnterBufferHitDisplay from './Components/SingleEnterBufferHitDisplay'

function PreTradeWatchList({ setActiveTradeLarger })
{
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


    const { enterExitPlansIds } = useGetUsersEnterExitPlanQuery(undefined, {
        selectFromResult: ({ data }) => ({
            enterExitPlansIds: data ? enterExitPlannedSelectors.selectIds(data.plannedTickers) : []
        })
    })



    const { enterBufferHitIds } = useGetUsersEnterExitPlanQuery(undefined, {
        selectFromResult: ({ data }) => ({
            enterBufferHitIds: data ? enterBufferSelectors.selectIds(data.enterBufferHit) : []
        })
    })

    const { stopLossHitIds } = useGetUsersEnterExitPlanQuery(undefined, {
        selectFromResult: ({ data }) => ({
            stopLossHitIds: data ? stopLossHitSelectors.selectIds(data.stopLossHit) : []
        })
    })


    return (
        <div id='LSH-PreTradeWatchAsList' >
            <div>
                <div className='flex'>
                    <p>Enter Buffer</p>
                    <button onClick={() => handleBufferHitToVisualPreWatch()}>Graph All</button>
                </div>
                {/* <button onClick={() => setActiveTradeLarger(prev => !prev)}><CircleArrowRight /></button> */}
                <div id='LSH-PreWatchBufferHitList'>
                    {enterBufferHitIds.map((id) => <SingleEnterBufferHitDisplay id={id} />)}
                </div>
            </div>

            <div id='LSH-PreWatchStopLosHit'>Stoploss hit List
                {stopLossHitIds.map((id) => <SingleStopLostHitDisplay id={id} />)}
            </div>
            <div id='LSH-PreWatchPlanList'>
                Planned Tickers Watch
                {enterExitPlansIds.map((id) => { return <SinglePlannedTickerDisplay id={id} /> })}
            </div>
        </div >
    )
}

export default PreTradeWatchList