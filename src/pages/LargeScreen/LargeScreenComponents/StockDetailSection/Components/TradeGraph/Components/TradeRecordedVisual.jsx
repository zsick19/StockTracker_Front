import React from 'react'

function TradeRecordedVisual({ serverTradeResponse })
{
    console.log(serverTradeResponse)
    return (
        <div id='TradeRecordedVisual'>
            <p>{serverTradeResponse.tickerSymbol}</p>
            <div className='flex'>
                {serverTradeResponse.tradingPlanPrices.map((p) => <p>{p}</p>)}
            </div>
            Trade Recorded!!!
            <button>Alter Trade</button>
            <button>Go To Watch All Trades</button>
        </div>
    )
}

export default TradeRecordedVisual