import React from 'react'
import { activeTradeSelectors, useGetUsersActiveTradesQuery } from '../../../../../../../../features/Trades/TradeSliceApi'
import { data } from 'react-router-dom'

function SingleActiveTradeBlock({ id })
{
    const { activeTrade } = useGetUsersActiveTradesQuery(undefined, { selectFromResult: ({ data }) => ({ activeTrade: data ? activeTradeSelectors.selectById(data, id) : undefined }) })

    const trialHandleStockToFourWay = (trade) =>
    {
        //    dispatch(setStockDetailState(0))
        //  dispatch(setSelectedStockAndTimelineFourSplit(trade))
    }
    const trialHandleStockToSingleChart = (trade) =>
    {
        //dispatch(setStockDetailState(5))
        // dispatch(setSelectedStockAndTimelineFourSplit(trade))
    }
    return (<div className='LSH-ActiveTradeBlock'>
        <div className='flex'>
            <p>{activeTrade.tickerSymbol}</p>
            <p>Most Recent Trade Price: {activeTrade.mostRecentPrice}</p>
            <button onClick={() => trialHandleStockToSingleChart(trade)}>Single Chart</button>
            <button onClick={() => trialHandleStockToFourWay(trade)}>4way</button>
        </div>
        <p>Trade/Stock Chart will go here</p>
    </div>)
}

export default SingleActiveTradeBlock