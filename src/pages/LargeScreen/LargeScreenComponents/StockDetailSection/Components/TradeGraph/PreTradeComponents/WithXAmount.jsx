import React, { useRef, useState } from 'react'

function WithXAmount({ selectedStock })
{
    const [withXAmount, setWithXAmount] = useState(1000)
    const withAmount = useRef()

    const numberOfSharesIdeal = withXAmount / selectedStock.plan.enterPrice
    const numberOfSharesCurrent = withXAmount / selectedStock.mostRecentPrice
    const planExitMinusCurrent = selectedStock.plan.exitPrice - selectedStock.mostRecentPrice
    const planExitMinusIdeal = selectedStock.plan.exitPrice - selectedStock.plan.enterPrice
    return (
        <div className='flex'>
            <div>
                <p>With ${withXAmount}</p>
                <input type="double" ref={withAmount} />
                <button onClick={() => setWithXAmount(parseFloat(withAmount.current.value))}>s</button>
                <p>Exit Price: ${selectedStock.plan.exitPrice}</p>
            </div>
            <div>
                <p>Ideal Price: ${selectedStock.plan.enterPrice}</p>
                <p>Number Of Shares: {numberOfSharesIdeal.toFixed(2)}</p>
                <p>Potential GPS: {planExitMinusIdeal.toFixed(2)} </p>
                <p>Total Gain: ${(planExitMinusIdeal * numberOfSharesIdeal).toFixed(2)}</p>
            </div>
            <div>
                <p>Current Price: ${selectedStock.mostRecentPrice}</p>
                <p>Number Of Shares: {numberOfSharesCurrent.toFixed(2)}</p>
                <p>Potential GPS: {planExitMinusCurrent.toFixed(2)}</p>
                <p>Total Gain: ${(planExitMinusCurrent * numberOfSharesCurrent).toFixed(2)}</p>
            </div>
        </div>
    )
}

export default WithXAmount