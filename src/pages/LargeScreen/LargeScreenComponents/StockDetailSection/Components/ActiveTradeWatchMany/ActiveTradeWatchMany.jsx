import React from 'react'
import { selectCurrentTradeDailyMove, useGetUsersActiveTradesQuery, useGetUsersActiveTradesWithGraphQuery } from '../../../../../../features/Trades/TradeSliceApi'
import './ActiveTradeWatchMany.css'
import SingleTradeGraphWrapper from './Components/SingleTradeGraphWrapper'
import { isWeekend } from 'date-fns'
import { useSelector } from 'react-redux'
import PositionListDailyMoves from './Components/PositionListDailyMoves'

function ActiveTradeWatchMany()
{
    const firstHour = new Date()
    firstHour.setHours(10, 30)
    const polling = new Date() < firstHour ? 300000 : 0


    const { data, isLoading, isError, isSuccess, refetch, error } = useGetUsersActiveTradesWithGraphQuery(undefined, { refetchOnMountOrArgChange: true, pollingInterval: polling })


    let activeTradeContent
    if (isSuccess)
    {
        activeTradeContent = data.ids.map((symbol) => <SingleTradeGraphWrapper id={symbol} key={`${symbol}activeTradeGraph`} />)
    } else if (isLoading)
    {
        activeTradeContent = <p>Loading...</p>
    } else if (isError)
    {
        activeTradeContent = <button onClick={() => refetch()}>refetch</button>
    }



    return (
        <div id='ActiveTradeWatchMany' onDoubleClick={() => refetch()}>
            <div className='TradeWatchManyLegend'>
                <p>YesterDay</p>
                <p>Dotted Green - High</p>
                <p>Dotted Red - Low</p>
                <p>Dash Black - Close</p>
                <br />
                <p>Today</p>
                <p>Solid Gray - Today Open</p>
                <p>Dash Gray - ATR</p>
                <br />
                <p>EMA</p>
                <p>Blue - 9ema</p>
                <p>Purple -50ema</p>
                <p>Red - 200ema</p>
            </div>
            <div>
                <div id='tradeWithGraphContainer' className='hide-scrollbar'>
                    <PositionListDailyMoves />
                    {activeTradeContent}
                </div>

            </div>
        </div>
    )
}

export default ActiveTradeWatchMany