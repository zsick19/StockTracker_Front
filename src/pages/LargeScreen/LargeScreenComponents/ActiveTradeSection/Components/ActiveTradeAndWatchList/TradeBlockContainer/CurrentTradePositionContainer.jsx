import React from 'react'
import { useDispatch } from 'react-redux'
import { setSelectedStockAndTimelineFourSplit } from '../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { useGetUsersActiveTradesQuery } from '../../../../../../../features/Trades/TradeSliceApi'
import ActiveTradeBlockWrapper from './Components/ActiveTradeBlockWrapper'
import './TradeBlockContainer.css'

function CurrentTradePositionContainer()
{
    const dispatch = useDispatch()

    const { data: activeTrades, isSuccess, isLoading, isError, error, refetch } = useGetUsersActiveTradesQuery()



    let tradeDisplayContent
    if (isSuccess && activeTrades.ids.length > 0)
    {
        tradeDisplayContent = <ActiveTradeBlockWrapper ids={activeTrades.ids} />
    } else if (isSuccess)
    {
        tradeDisplayContent = <div className='LSH-ActiveTradesMessage'>
            <h2>No Active Trades</h2>
            <div className='flex'>
                <button>Record A Trade</button>
                <button>Trading Journal</button>
            </div>
        </div>
    }
    else if (isLoading) { tradeDisplayContent = <div className='LSH-ActiveTradeMessage'><h2>Loading Current Trades...</h2></div> }
    else if (isError)
    {
        tradeDisplayContent = <div>
            <h2>Error Fetching Trades</h2>
            <button onClick={() => refetch()}>Retry</button>
        </div>
    }




    return (
        <div className='LSH-ActiveTradeContainer'>
            {tradeDisplayContent}
        </div>
    )
}

export default CurrentTradePositionContainer