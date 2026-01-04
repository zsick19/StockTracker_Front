import React from 'react'
import { useDispatch } from 'react-redux'
import { setSelectedStockAndTimelineFourSplit } from '../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { CircleArrowRight } from 'lucide-react'

function PreTradeWatchList({ setActiveTradeLarger })
{
    const dispatch = useDispatch()
    const samplePreTradeAndBufferHit = [{ ticker: 'AA', _id: 'aa' }, { ticker: 'ZIM', _id: 'bb' }]

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
                    {samplePreTradeAndBufferHit.map((bufferHitPre) =>
                    {
                        return (
                            <div className='flex'>
                                <p>{bufferHitPre.ticker}</p>
                                <button onClick={() => handleSettingTickerToFourWaySplit(bufferHitPre)}>Q</button>
                            </div>
                        )
                    })}
                </div>
            </div>



            <div>Stoploss hit List</div>
            <div>Planned Tickers Watch</div>
        </div >
    )
}

export default PreTradeWatchList