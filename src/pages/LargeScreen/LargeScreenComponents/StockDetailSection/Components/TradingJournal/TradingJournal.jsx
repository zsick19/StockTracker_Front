import React, { useRef, useState } from 'react'
import { useGetUsersTradingJournalQuery } from '../../../../../../features/Trades/TradingJournalApiSlice'
import './TradingJournal.css'
import PreviousTradeJournal from './Conponents/PreviousTradeJournal'
import CurrentTradeJournal from './Conponents/CurrentTradeJournal'

function TradingJournal()
{
    const [currentTrades, setCurrentTrades] = useState(false)

    const [tradeFilter, setTradeFilter] = useState({ tickerSearch: undefined })

    const tickerSearch = useRef()

    function handleTickerSearch()
    {
        if (tickerSearch.current.value === '') setTradeFilter(prev => ({ ...prev, tickerSearch: undefined }))
        else setTradeFilter(prev => ({ ...prev, tickerSearch: tickerSearch.current.value.toUpperCase() }))
    }

    return (
        <div id='LHS-TradeJournal'>
            <div id='LHS-TradeFilterControls'>
                <div className='flex'>
                    <h2>Trading Journal</h2>
                    <button onClick={() => setCurrentTrades(false)}>Trade History</button>
                    <button onClick={() => setCurrentTrades(true)}>Current Trades</button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleTickerSearch() }}>
                    <input type="text" ref={tickerSearch} />
                    <button>Search</button>
                </form>
            </div>

            {currentTrades ?
                <CurrentTradeJournal /> :
                <PreviousTradeJournal tradeFilter={tradeFilter} />
            }

        </div>
    )
}

export default TradingJournal