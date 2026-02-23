import React from 'react'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'

function TradeSuccessCompleted({ completedTrade })
{
    const dispatch = useDispatch()

    console.log(completedTrade)
    return (
        <div id='SuccessfulTradeExit'>
            <h1>Trade Exit Recorded</h1>

            <button onClick={() => dispatch(setStockDetailState(9))}>Trade Journal</button>
        </div>
    )
}

export default TradeSuccessCompleted