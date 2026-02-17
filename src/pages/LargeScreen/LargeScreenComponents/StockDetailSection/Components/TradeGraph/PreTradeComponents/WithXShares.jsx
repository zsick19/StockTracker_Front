import React, { useRef, useState } from 'react'

function WithXShares({ selectedStock })
{
    const xShares = useRef()
    const [withXShares, setWithXShares] = useState(100)

    const sharesBoughtAtIdealCost = withXShares * selectedStock.plan.enterPrice
    const gainPSTradingIdeal = selectedStock.plan.exitPrice - selectedStock.plan.enterPrice

    const sharesBoughtAtCurrentCost = withXShares * selectedStock.mostRecentPrice
    const gainPSTradingCurrent = selectedStock.plan.exitPrice - selectedStock.mostRecentPrice

    return (
        <div id='WithXShares'>
            <div>
                <p>With {withXShares} Shares</p>
                <input type="number" ref={xShares} />
                <button onClick={() => setWithXShares(parseInt(xShares.current.value))}>s</button>
            </div>
            <div>
                <p>Ideal Price: ${selectedStock.plan.enterPrice}</p>
                <p>Total Cost: {sharesBoughtAtIdealCost.toFixed(2)}</p>
                <p>Potential GPS: {gainPSTradingIdeal.toFixed(2)} </p>
                <p>Total Gain: ${(gainPSTradingIdeal * withXShares).toFixed(2)}</p>
            </div>
            <div>
                <p>Current Price: ${selectedStock.mostRecentPrice}</p>
                <p>Total Cost: {sharesBoughtAtCurrentCost.toFixed(2)}</p>
                <p>Potential GPS: {gainPSTradingCurrent.toFixed(2)}</p>
                <p>Total Gain: ${(gainPSTradingCurrent * withXShares).toFixed(2)}</p>
            </div>
        </div>
    )
}

export default WithXShares