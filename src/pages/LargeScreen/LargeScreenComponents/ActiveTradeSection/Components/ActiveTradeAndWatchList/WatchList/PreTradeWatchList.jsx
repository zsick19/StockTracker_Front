import React from 'react'
import { useDispatch } from 'react-redux'
import { setSelectedStockAndTimelineFourSplit } from '../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { CircleArrowRight } from 'lucide-react'
import SinglePlannedTickerDisplay from './Components/SinglePlannedTickerDisplay'

function PreTradeWatchList({ setActiveTradeLarger, refetch, ids })
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

    return (
        <div id='LSH-PreTradeWatchAsList' >
            <div>
                <div className='flex'>
                    <p>Enter Buffer</p>
                    <button onClick={() => handleBufferHitToVisualPreWatch()}>Graph All</button>
                    <button onClick={() => setActiveTradeLarger(prev => !prev)}><CircleArrowRight /></button>
                </div>
                <div>

                    <button onClick={() => refetch()}>refetch</button>
                </div>
            </div>



            <div>Stoploss hit List

            </div>
            <div>
                Planned Tickers Watch
                {ids.map((id) => { return <SinglePlannedTickerDisplay id={id} /> })}
            </div>
        </div >
    )
}

export default PreTradeWatchList