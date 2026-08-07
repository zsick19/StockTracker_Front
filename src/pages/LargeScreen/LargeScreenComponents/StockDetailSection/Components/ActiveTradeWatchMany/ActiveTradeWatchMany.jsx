import React, { useMemo, useState } from 'react'
import { selectCurrentTradeDailyMove, useGetUsersActiveTradesQuery, useGetUsersActiveTradesWithGraphQuery } from '../../../../../../features/Trades/TradeSliceApi'
import './ActiveTradeWatchMany.css'
import SingleTradeGraphWrapper from './Components/SingleTradeGraphWrapper'
import { isWeekend } from 'date-fns'
import { shallowEqual, useSelector } from 'react-redux'
import PositionListDailyMoves from './Components/PositionListDailyMoves'
import { selectPlansForWatchManyByWatchList } from '../../../../../../features/Engine/EnginePlanApiSlice'
import SingleWatchChartWrapper from './Components/SingleWatchChartWrapper'

function ActiveTradeWatchMany({ tickerList })
{
    const [chosenWatchList, setChosenWatchList] = useState(tickerList)

    const plansByWatchlist = useMemo(() => selectPlansForWatchManyByWatchList(), [chosenWatchList])
    const tickersToWatch = useSelector((state) => plansByWatchlist(state, chosenWatchList), shallowEqual)





    return (
        <div id='ActiveTradeWatchMany' >
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
                <button onClick={() => setChosenWatchList('activeTrade')}>Current Trades</button>
                <button onClick={() => setChosenWatchList('belowStop')}>Below Stop</button>
                <button onClick={() => setChosenWatchList('discount')}>Discount</button>
                <button onClick={() => setChosenWatchList('entryStrike')}>Strike Zone</button>
                <button onClick={() => setChosenWatchList('viableEntry')}>Viable Entry</button>
                <button onClick={() => setChosenWatchList('highImportance')}>High Importance</button>
            </div>
            <div>
                <div id='tradeWithGraphContainer' className='hide-scrollbar'>
                    {tickersToWatch.map((t, i) => <SingleWatchChartWrapper key={`watchMany${t}`} tickerSymbol={t} />)}
                </div>

            </div>
        </div>
    )
}

export default ActiveTradeWatchMany