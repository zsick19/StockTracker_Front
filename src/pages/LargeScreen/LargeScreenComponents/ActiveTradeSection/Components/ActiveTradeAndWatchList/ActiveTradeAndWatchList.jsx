import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { setSelectedStockAndTimelineFourSpite } from '../../../../../../features/SelectedStocks/SelectedStockSlice'
import './ActiveTradeAndWatchList.css'

function ActiveTradeAndWatchList()
{
    const [activeTradeLarger, setActiveTradeLarger] = useState(true)


    const sampleActiveTrades = [{ ticker: 'DIA', _id: 'aaa' }, { ticker: 'SPY', _id: 'bbb' }]

    const dispatch = useDispatch()

    const trialHandleStockToFourWay = (trade) =>
    {
        dispatch(setSelectedStockAndTimelineFourSpite(trade))
    }

    return (
        <div id={activeTradeLarger ? 'LSH-ActiveTradeLarger' : 'LSH-PreTradeLarger'}>
            <div>
                <div>Buffer Hit List</div>
                <div>Stoploss hit List</div>
                <div>WatchList general</div>
            </div>

            <div className='LSH-ActiveTradeContainer'>
                {sampleActiveTrades.map((trade) =>
                {
                    return <div className='LSH-ActiveTradeBlock'>
                        <div className='flex'>
                            <p>{trade.ticker}</p>
                            <button onClick={() => trialHandleStockToFourWay(trade)}>4way</button>
                        </div>
                        <p>Trade/Stock Chart will go here</p>
                    </div>
                })}
            </div>
        </div>
    )
}

export default ActiveTradeAndWatchList