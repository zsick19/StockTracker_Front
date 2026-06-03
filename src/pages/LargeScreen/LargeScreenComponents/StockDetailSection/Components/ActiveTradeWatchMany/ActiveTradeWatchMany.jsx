import React from 'react'
import { useGetUsersActiveTradesWithGraphQuery } from '../../../../../../features/Trades/TradeSliceApi'
import './ActiveTradeWatchMany.css'
import SingleTradeGraphWrapper from './Components/SingleTradeGraphWrapper'

function ActiveTradeWatchMany()
{

    const { data, isLoading, isError, isSuccess, refetch, error } = useGetUsersActiveTradesWithGraphQuery(undefined, { refetchOnMountOrArgChange: true })
    let activeTradeContent
    if (isSuccess)
    {
        activeTradeContent = <div id='tradeWithGraphContainer' className='hide-scrollbar'>{data.ids.map((symbol) => <SingleTradeGraphWrapper id={symbol} key={`${symbol}activeTradeGraph`} />)}</div>
    } else if (isLoading)
    {
        activeTradeContent = <div>Loading...</div>
    } else if (isError)
    {
        activeTradeContent = <div>Error
            <button onClick={() => refetch()}>refetch</button>
        </div>
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
            {activeTradeContent}
        </div>
    )
}

export default ActiveTradeWatchMany