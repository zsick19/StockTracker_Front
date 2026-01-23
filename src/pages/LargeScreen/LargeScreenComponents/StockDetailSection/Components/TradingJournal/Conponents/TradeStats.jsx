import React from 'react'

function TradeStats({ tradeData, setShowSelectedTradeOrStats })
{
    return (
        <div>TradeStats
            monthly view of wins/losses
            weekly option
            <button onClick={() => setShowSelectedTradeOrStats(true)}>View Selected Trade</button>
        </div>
    )
}

export default TradeStats