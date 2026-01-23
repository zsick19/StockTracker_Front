import React from 'react'

function SingleSelectedTrade({ trade, selectedTrade, setSelectedTrade, setShowSelectedTradeOrStats })
{


    return (
        <div className={`${selectedTrade?.tickerSymbol === trade.tickerSymbol ? 'selectedTradeHighLite' : ''} singleTradeResult`} onClick={() => { setSelectedTrade(trade); setShowSelectedTradeOrStats(true) }}>
            <p>{trade.tickerSymbol}</p>
        </div>
    )
}

export default SingleSelectedTrade