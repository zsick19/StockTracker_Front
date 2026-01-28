import React from 'react'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'

function TradeSuccessCompleted({ completedTrade })
{
    const dispatch = useDispatch()


    return (
        <div>
            trade stats displayed from results
            <button onClick={() => dispatch(setStockDetailState(9))}>Trade Journal</button>
        </div>
    )
}

export default TradeSuccessCompleted