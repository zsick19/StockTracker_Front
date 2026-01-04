import React from 'react'
import { useDispatch } from 'react-redux'
import { setSelectedStockAndTimelineFourSplit } from '../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'

function CurrentTradePositionContainer()
{
    const dispatch = useDispatch()

    const sampleActiveTrades = [{ ticker: 'DIA', _id: 'aaa' }, { ticker: 'SPY', _id: 'bbb' }]
    const trialHandleStockToFourWay = (trade) =>
    {
        dispatch(setStockDetailState(0))
        dispatch(setSelectedStockAndTimelineFourSplit(trade))
    }



    return (
        <div className='LSH-ActiveTradeContainer'>
            {sampleActiveTrades.map((trade) =>
            {
                return <div className='LSH-ActiveTradeBlock'>
                    <div className='flex'>
                        <p>{trade.ticker}</p>

                        <button onClick={() => trialHandleStockToFourWay(trade)}>Single Chart</button>
                        <button onClick={() => trialHandleStockToFourWay(trade)}>4way</button>
                    </div>
                    <p>Trade/Stock Chart will go here</p>
                </div>
            })}
        </div>
    )
}

export default CurrentTradePositionContainer