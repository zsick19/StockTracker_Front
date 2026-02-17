import React, { useRef, useState } from 'react'

function ToMakeXAmount({ selectedStock })
{
    const makeAmount = useRef()
    const [makeXAmount, setMakeXAmount] = useState(200)

    const planExitMinusCurrent = selectedStock.plan.exitPrice - selectedStock.mostRecentPrice
    const currentPriceExitGain = makeXAmount / planExitMinusCurrent
    const planExitMinusIdeal = selectedStock.plan.exitPrice - selectedStock.plan.enterPrice
    const idealPriceExitGain = makeXAmount / planExitMinusIdeal


    return (
        <div id='ToMakeXAmount'>
            <div>
                <p>To Gain ${makeXAmount}</p>
                <input type="double" ref={makeAmount} />
                <button onClick={() => setMakeXAmount(parseFloat(makeAmount.current.value))}>s</button>
                <p>Exit Price: ${selectedStock.plan.exitPrice}</p>
            </div>
            <div>
                <p>Ideal Price: ${selectedStock.plan.enterPrice}</p>
                <p>GPS: ${planExitMinusIdeal.toFixed(2)}</p>
                <p>Number of Shares: {Math.ceil(idealPriceExitGain)}</p>
                <p>Cost: ${(idealPriceExitGain * selectedStock.plan.enterPrice).toFixed(2)}</p>
            </div>
            <div>
                <p>Current Price: ${selectedStock.mostRecentPrice}</p>
                <p>GPS: ${planExitMinusCurrent.toFixed(2)}</p>
                <p>Number of Shares: {Math.ceil(currentPriceExitGain)}</p>
                <p>Cost: ${(currentPriceExitGain * selectedStock.mostRecentPrice).toFixed(2)}</p>
            </div>
        </div>
    )
}

export default ToMakeXAmount