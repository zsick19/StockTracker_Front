import React from 'react'

function TradePlan({ trade })
{
    return (
        <div className='flex'>
            <div>
                <p>${trade.tradingPlanPrices[0]}</p>
                <p>Stoploss</p>
            </div>
            <div>
                <p>${trade.tradingPlanPrices[1]}</p>
                <p>Enter</p>
            </div>
            <div>
                <p>${trade.tradingPlanPrices[2]}</p>
                <p>Enter Buffer</p>
            </div>
            <div>
                <p>${trade.tradingPlanPrices[3]}</p>
                <p>Ex Buffer</p>
            </div>
            <div>
                <p>${trade.tradingPlanPrices[4]}</p>
                <p>Exit</p>
            </div>
            <div>
                <p>${trade.tradingPlanPrices[5]}</p>
                <p>Moon</p>
            </div>
        </div>
    )
}

export default TradePlan