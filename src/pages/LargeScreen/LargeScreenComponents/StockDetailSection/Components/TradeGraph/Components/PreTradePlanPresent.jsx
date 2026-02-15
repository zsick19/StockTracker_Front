import React, { useState } from 'react'
import { useInitiateTradeRecordMutation } from '../../../../../../../features/Trades/TradeSliceApi'
import ToMakeXAmount from '../PreTradeComponents/ToMakeXAmount'
import WithXAmount from '../PreTradeComponents/WithXAmount'
import WithXShares from '../PreTradeComponents/WithXShares'

function PreTradePlanPresent({ selectedStock })
{
    const [initiateTradeRecord] = useInitiateTradeRecordMutation()
    const [preTradeDetailDisplay, setPreTradeDetailDisplay] = useState(1)




    const [tradeRecordDetails, setTradeRecordDetails] = useState({ positionSize: undefined, purchasePrice: undefined })
    const [serverTradeResponse, setServerTradeResponse] = useState(undefined)

    async function attemptToInitiateTradeRecord(e)
    {
        e.preventDefault()
        if (selectedStock?.tradeId || !tradeRecordDetails.positionSize > 0 || !tradeRecordDetails.purchasePrice > 0) return
        let planPricing = selectedStock.plan

        try
        {
            const results = await initiateTradeRecord({
                ...tradeRecordDetails,
                tickerSector: selectedStock.tickerSector,
                tradingPlanPrices: [planPricing.stopLossPrice, tradeRecordDetails.purchasePrice, planPricing.enterBufferPrice,
                planPricing.exitBufferPrice, planPricing.exitPrice, planPricing.moonPrice],
                enterExitPlanId: selectedStock.planId,
                tickerSymbol: selectedStock.tickerSymbol
            })

            setServerTradeResponse(results)
        } catch (error)
        {
            console.log(error)
        }

    }


    function provideDetailDisplay()
    {
        switch (preTradeDetailDisplay)
        {
            case 0: return (
                <div>
                    Plan Figures here
                </div>)
            case 1: return <ToMakeXAmount selectedStock={selectedStock.plan} />
            case 2: return <WithXShares selectedStock={selectedStock.plan} />
            case 3: return <WithXAmount selectedStock={selectedStock.plan} />

        }
    }

    return (
        <>

            {serverTradeResponse ? <div>
                Trade Recorded!!!
                <button>Alter Trade</button>
                <button>Go To Watch All Trades</button>
            </div> :

                <div id='PreTradeInitiator'>

                    <div id='PreTradeMenuChoice'>
                        <button onClick={() => setPreTradeDetailDisplay(0)}>P</button>
                        <button onClick={() => setPreTradeDetailDisplay(1)}>G</button>
                        <button onClick={() => setPreTradeDetailDisplay(2)}>S</button>
                        <button onClick={() => setPreTradeDetailDisplay(3)}>X</button>
                    </div>

                    {provideDetailDisplay()}


                    <form id='RecordTradeForm' onSubmit={attemptToInitiateTradeRecord} onChange={(e) => setTradeRecordDetails(prev => ({ ...prev, [e.target.name]: parseFloat(e.target.value) }))}>
                        <div>
                            <label htmlFor='purchasePrice'>Purchase Price</label>
                            <input type="double" name="purchasePrice" id="purchasePrice" />
                        </div>
                        <div>
                            <label htmlFor="numberOfShares">Quantity</label>
                            <input type="number" name="positionSize" id="numberOfShares" min={1} />
                        </div>
                        <button>Record Trade</button>
                    </form>
                </div>
            }
        </>
    )
}

export default PreTradePlanPresent