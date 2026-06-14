import React from 'react'
import { selectCurrentTradeDailyMove, useGetUsersActiveTradesQuery } from '../../../../../../../features/Trades/TradeSliceApi'
import { useSelector } from 'react-redux'

function PositionListDailyMoves()
{
    const currentPositionMoves = useSelector(state => selectCurrentTradeDailyMove(state))

    return (
        <div id='PositionListDailyMoves' className='hide-scrollbar'>
            <div className='flex'>
                <p>Symbol</p>
                <p>Open P&L</p>
                <p>Last/Avg Price</p>
                <p>Day's P&L</p>
            </div>

            {currentPositionMoves.map((t) => <div className='singlePositionDailyMove flex'>
                <p>{t.tickerSymbol}</p>
                <div className={t.percentFromOpen > 0 ? 'greenText' : 'redText'}>
                    <p>{t.positionGain}</p>
                    <p>{t.percentFromOpen}%</p>
                </div>

                <div>
                    <p>{t.mostRecentPrice}</p>
                    <p>${t.averagePurchasePrice}</p>
                </div>

                <div className={t.todaysGainPercent > 0 ? 'greenText' : 'redText'}>
                    <p>{t.todaysGain}</p>
                    <p>{t.todaysGainPercent}%</p>
                </div>

            </div>)}
        </div>
    )
}

export default PositionListDailyMoves