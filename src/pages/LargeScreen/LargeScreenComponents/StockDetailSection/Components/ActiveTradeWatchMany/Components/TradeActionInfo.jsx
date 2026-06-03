import React from 'react'

function TradeActionInfo({ percentGain, atr, todayAtr, ticker, mostRecentPrice, snapShot, setShowMACD })
{
    return (
        <div className='TradeActionInfo' onClick={() => setShowMACD(true)}>
            <p>${mostRecentPrice}</p>
            <p>${todayAtr} / ${atr}</p>
            <p>{percentGain}%</p>


        </div>
    )
}

export default TradeActionInfo