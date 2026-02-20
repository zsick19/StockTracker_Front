import { differenceInBusinessDays } from 'date-fns'
import React from 'react'

function CurrentTradeStats({ trade })
{


    return (
        <div id='CurrentTradeStats'>

            <div>
                <h1>{trade.tickerSymbol}</h1>

                <p>Enter Date: {new Date(trade.enterDate).toDateString()}</p>
                <p>Hold Period: {differenceInBusinessDays(new Date(), trade.enterDate)}</p>
            </div>



            <div>
                <p>Ideal Risk: </p>
                <p>Ideal Reward: ${(trade.averagePurchasePrice * (trade.idealGainPercent / 100) * trade.availableShares).toFixed(2)}</p>
                <br />
                <p>Avg Price: ${trade.averagePurchasePrice}</p>
                <p>Position Size: {trade.availableShares}</p>
                <p>Market Value: ${(trade.availableShares * trade.averagePurchasePrice).toFixed(2)}</p>
            </div>


        </div>
    )
}

export default CurrentTradeStats