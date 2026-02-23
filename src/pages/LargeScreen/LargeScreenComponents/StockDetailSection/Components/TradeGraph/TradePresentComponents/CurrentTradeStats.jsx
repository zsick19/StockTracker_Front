import { differenceInBusinessDays } from 'date-fns'
import React from 'react'
import { getSimplifiedRatio } from '../../../../../../../Utilities/UtilityHelperFunctions'

function CurrentTradeStats({ trade })
{

    console.log(trade)

    let purchasedRisk = (trade.tradingPlanPrices[1] - trade.tradingPlanPrices[0]) * trade.availableShares
    let idealReward = (trade.tradingPlanPrices[4] - trade.tradingPlanPrices[1]) * trade.availableShares
    let ratioResult = getSimplifiedRatio(idealReward, purchasedRisk, 5)

    return (
        <div id='CurrentTradeStats'>

            <div>
                <h1>{trade.tickerSymbol}</h1>

                <p>Enter Date: {new Date(trade.enterDate).toDateString()}</p>
                <p>Hold Period: {differenceInBusinessDays(new Date(), trade.enterDate)}</p>
                <p>Market Value: ${(trade.availableShares * trade.averagePurchasePrice).toFixed(2)}</p>
            </div>



            <div>
                <p>Ideal Reward: ${(idealReward).toFixed(2)}</p>
                <p>Assumed Risk: ${(purchasedRisk).toFixed(2)} </p>
                <p>RvR: ~{ratioResult.string}</p>
                
                <p>Position Size: {trade.availableShares}</p>
                <p>Avg Purchase Price: ${trade.averagePurchasePrice}</p>
            </div>


        </div>
    )
}

export default CurrentTradeStats