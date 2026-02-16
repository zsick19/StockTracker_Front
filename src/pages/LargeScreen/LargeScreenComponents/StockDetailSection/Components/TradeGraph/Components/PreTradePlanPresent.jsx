import React, { useState } from 'react'
import { useInitiateTradeRecordMutation } from '../../../../../../../features/Trades/TradeSliceApi'
import ToMakeXAmount from '../PreTradeComponents/ToMakeXAmount'
import WithXAmount from '../PreTradeComponents/WithXAmount'
import WithXShares from '../PreTradeComponents/WithXShares'
import PreTradePlanExamine from '../PreTradeComponents/PreTradePlanExamine'
import { Banknote, Coins, Expand, HandCoins, Plane } from 'lucide-react'

function PreTradePlanPresent({ selectedStock, setShowSupportingTickers })
{
    const [initiateTradeRecord] = useInitiateTradeRecordMutation()
    const [preTradeDetailDisplay, setPreTradeDetailDisplay] = useState(0)




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
            case 0: return <PreTradePlanExamine selectedStock={selectedStock} />
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
                        <button className='buttonIcon' onClick={() => setPreTradeDetailDisplay(0)}><Plane color='white' /></button>
                        <button className='buttonIcon' onClick={() => setPreTradeDetailDisplay(1)}><Coins color='green' /></button>
                        <button className='buttonIcon' onClick={() => setPreTradeDetailDisplay(2)}><Banknote color='green' /></button>
                        <button className='buttonIcon' onClick={() => setPreTradeDetailDisplay(3)}><HandCoins color='green' /></button>
                        <button className='buttonIcon' onClick={() => setShowSupportingTickers(prev => !prev)}><Expand color='white' /></button>
                    </div>

                    <div id='PreTradeDetailContent'>
                        {provideDetailDisplay()}
                    </div>


                    <form id='RecordTradeForm' onSubmit={attemptToInitiateTradeRecord} onChange={(e) => setTradeRecordDetails(prev => ({ ...prev, [e.target.name]: parseFloat(e.target.value) }))}>
                        <div>
                            <input type="double" name="purchasePrice" id="purchasePrice" />
                            <label htmlFor='purchasePrice'>Purchase Price</label>
                        </div>
                        <div>
                            <input type="number" name="positionSize" id="numberOfShares" min={1} />
                            <label htmlFor="numberOfShares">Quantity</label>
                        </div>
                        <button>Record Trade</button>
                    </form>
                </div>
            }
        </>
    )
}

export default PreTradePlanPresent