import React from 'react'

function CashOutMessage({ activeTrade })
{
    console.log(activeTrade)

    return (
        <div className='LSH-ActiveTradeBlock'>
            <h2>{activeTrade.tickerSymbol}</h2>
            cash out
            They All Can't be Winners
        </div>
    )
}

export default CashOutMessage