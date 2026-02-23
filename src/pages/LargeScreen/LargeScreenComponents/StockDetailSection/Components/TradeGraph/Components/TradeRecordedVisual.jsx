import React from 'react'

function TradeRecordedVisual({ serverTradeResponse })
{
    console.log(serverTradeResponse)

    let idealGainPerShare = serverTradeResponse.tradingPlanPrices[4] - serverTradeResponse.tradingPlanPrices[1]
    let totalRisk = (serverTradeResponse.tradingPlanPrices[1] - serverTradeResponse.tradingPlanPrices[0]) * serverTradeResponse.availableShares

    return (
        <div id='TradeRecordedVisual'>
            <h1>{serverTradeResponse.tickerSymbol} Trade Recorded</h1>

            <div className='flex'>
                <p>Avg Purchase Price: ${serverTradeResponse.averagePurchasePrice}</p>
                <p>Position Size: {serverTradeResponse.availableShares}</p>
            </div>
            <div className='flex'>
                <p>Risk {serverTradeResponse.idealPercents[0]}%</p>
                <p>Reward {serverTradeResponse.idealPercents[3]}%</p>
                <p>Ideal GPS: ${idealGainPerShare.toFixed(2)}</p>
            </div>

            <div>
                <p>Total Risk: ${totalRisk.toFixed(2)}</p>
                <p>Ideal Total Gain: ${(idealGainPerShare * serverTradeResponse.availableShares).toFixed(2)}</p>
            </div>
        </div>
    )
}

export default TradeRecordedVisual