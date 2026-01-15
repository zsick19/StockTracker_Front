import React from 'react'
import { useDispatch } from 'react-redux'
import { setSelectedStockAndTimelineFourSplit } from '../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { useGetUsersActiveTradesQuery } from '../../../../../../../features/Trades/TradeSliceApi'
import ActiveTradeBlockWrapper from './Components/ActiveTradeBlockWrapper'

function CurrentTradePositionContainer()
{
    const dispatch = useDispatch()

    const { data: activeTrades, isSuccess, isLoading, isError, error } = useGetUsersActiveTradesQuery()



    let tradeDisplayContent
    if (isSuccess && activeTrades.ids.length > 0)
    {
        tradeDisplayContent = <ActiveTradeBlockWrapper ids={activeTrades.ids} />
    } else if (isSuccess) { tradeDisplayContent = <div>No Active Trades and this needs to be styled</div> }
    else if (isLoading) { tradeDisplayContent = <div>Loading Active Trades...</div> }
    else if (isError) { tradeDisplayContent = <div>Error Loading Trade Records</div> }




    return (
        <div className='LSH-ActiveTradeContainer'>
            {tradeDisplayContent}
        </div>
    )
}

export default CurrentTradePositionContainer