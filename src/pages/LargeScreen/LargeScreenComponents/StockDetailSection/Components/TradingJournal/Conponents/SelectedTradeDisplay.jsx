import React from 'react'

function SelectedTradeDisplay({ selectedTrade, setShowSelectedTradeOrStats })
{

    return (
        <div id='LHS-TradeJournalSelectedTradeDisplay' className='TradeStatsSelectedSection'>
            <div>
                chart graph will go here
            </div>
            <div>
                <h2>Trade: {selectedTrade.tickerSymbol}</h2>
                <button onClick={() => setShowSelectedTradeOrStats(prev => !prev)}>View Trade Stats</button>
            </div>
        </div>
    )
}

export default SelectedTradeDisplay