import React from 'react'
import { activeTradeSelectors, useGetUsersActiveTradesQuery } from '../../../../../../../../features/Trades/TradeSliceApi'
import { setSelectedStockAndTimelineFourSplit, setSingleChartToTickerTimeFrameTradeId } from '../../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { Expand } from 'lucide-react'

function SingleActiveTradeBlock({ id })
{
    const dispatch = useDispatch()
    const { activeTrade } = useGetUsersActiveTradesQuery(undefined, { selectFromResult: ({ data }) => ({ activeTrade: data ? activeTradeSelectors.selectById(data, id) : undefined }) })

    const handleStockToFourWay = () =>
    {
        dispatch(setStockDetailState(0))
        dispatch(setSelectedStockAndTimelineFourSplit({ ticker: activeTrade.tickerSymbol, trade: activeTrade }))
    }
    const handleStockToTradeChart = () =>
    {
        dispatch(setStockDetailState(8))
        dispatch(setSingleChartToTickerTimeFrameTradeId({ ticker: activeTrade.tickerSymbol, chartId: activeTrade.enterExitPlanId, planId: activeTrade.enterExitPlanId, trade: activeTrade }))
    }
    return (<div className='LSH-ActiveTradeBlock'>
        <div className='flex'>
            <p>{activeTrade.tickerSymbol}</p>
            <p>Most Recent Trade Price: {activeTrade.mostRecentPrice}</p>
            <button onClick={() => handleStockToTradeChart()}>Trade</button>
            <button onClick={() => handleStockToFourWay()}><Expand /></button>
        </div>
        <p>Trade/Stock Visual will go here</p>


    </div>)
}

export default SingleActiveTradeBlock