import React, { useState } from 'react'
import { useInitiateTradeRecordMutation } from '../../../../../../../features/Trades/TradeSliceApi'

function PreTradePlanPresent({ selectedStock })
{
    const [initiateTradeRecord] = useInitiateTradeRecordMutation()


    let planPricing = selectedStock.plan

    const [tradeRecordDetails, setTradeRecordDetails] = useState({ positionSize: undefined, purchasePrice: undefined })
    const [serverTradeResponse, setServerTradeResponse] = useState(undefined)

    async function attemptToInitiateTradeRecord(e)
    {
        e.preventDefault()
        if (selectedStock?.tradeId || !tradeRecordDetails.positionSize > 0 || !tradeRecordDetails.purchasePrice > 0) return

        try
        {
            const results = await initiateTradeRecord({
                ...tradeRecordDetails,
                tradingPlanPrices: [planPricing.stopLossPrice, tradeRecordDetails.purchasePrice, planPricing.enterBufferPrice,
                planPricing.exitBufferPrice, planPricing.exitPrice, planPricing.moonPrice],
                enterExitPlanId: selectedStock.planId,
                tickerSymbol: selectedStock.ticker
            })
            console.log(results)
            setServerTradeResponse(results)
        } catch (error)
        {
            console.log(error)
        }

    }




    return (
        <div>
            initiate trade here
            {serverTradeResponse ? <div>
                Trade Recorded!!!
                <button>Alter Trade</button>
                <button>Go To Watch All Trades</button>
            </div> :
                <form onSubmit={attemptToInitiateTradeRecord} onChange={(e) => setTradeRecordDetails(prev => ({ ...prev, [e.target.name]: parseFloat(e.target.value) }))}>

                    <div>
                        <label htmlFor='purchasePrice'>Current Share Price:</label>
                        <input type="double" name="purchasePrice" id="purchasePrice" />
                    </div>
                    <div>
                        <label htmlFor="numberOfShares">Quantity</label>
                        <input type="number" name="positionSize" id="numberOfShares" min={1} />
                    </div>
                    <button>Record Trade</button>
                </form>
            }
        </div>
    )
}

export default PreTradePlanPresent