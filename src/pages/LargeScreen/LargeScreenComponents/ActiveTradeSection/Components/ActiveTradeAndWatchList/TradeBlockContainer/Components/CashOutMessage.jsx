import React, { useRef } from 'react'

function CashOutMessage({ activeTrade, liquidateFullPosition })
{
    const liquidateCashOutPrice = useRef()

    function handleCashOut()
    {
        let price = parseFloat(liquidateCashOutPrice.current.value)
        if (price) liquidateFullPosition(price)
    }

    return (
        <div className='LSH-CashOutMessage'>
            <div>

                <h2>{activeTrade.tickerSymbol}</h2>
                <input type="number" placeholder={activeTrade.mostRecentPrice} ref={liquidateCashOutPrice} />
                <button onClick={() => handleCashOut()}>Cash Out</button>

                They All Can't be Winners
            </div>

        </div>
    )
}

export default CashOutMessage