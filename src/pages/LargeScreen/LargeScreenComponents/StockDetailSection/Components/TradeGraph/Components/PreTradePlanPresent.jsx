import React, { useState } from 'react'
import { useInitiateTradeRecordMutation } from '../../../../../../../features/Trades/TradeSliceApi'
import ToMakeXAmount from '../PreTradeComponents/ToMakeXAmount'
import WithXAmount from '../PreTradeComponents/WithXAmount'
import WithXShares from '../PreTradeComponents/WithXShares'
import PreTradePlanExamine from '../PreTradeComponents/PreTradePlanExamine'
import { AlertCircle, Banknote, Coins, HandCoins, Plane } from 'lucide-react'
import CompanyInfo from '../PreTradeComponents/CompanyInfo'
import '../PreTradeComponents/PreTradeStyles.css'
import { enterBufferSelectors, enterExitPlannedSelectors, highImportanceSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'


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



    function provideSelector(data)
    {
        switch (selectedStock.watchList)
        {
            case 0: return enterBufferSelectors.selectById(data.enterBufferHit, selectedStock.tickerSymbol)
            case 1: return stopLossHitSelectors.selectById(data.stopLossHit, selectedStock.tickerSymbol)
            case 2: return enterExitPlannedSelectors.selectById(data.plannedTickers, selectedStock.tickerSymbol)
            case 4: return highImportanceSelectors.selectById(data.highImportance, selectedStock.tickerSymbol)
        }
    }
    const { plan } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: ({ data }) => ({ plan: data ? provideSelector(data) : undefined }) })



    function provideDetailDisplay()
    {
        switch (preTradeDetailDisplay)
        {
            case 0: return <PreTradePlanExamine selectedStock={plan} setShowSupportingTickers={setShowSupportingTickers} />
            case 1: return <ToMakeXAmount selectedStock={plan} />
            case 2: return <WithXShares selectedStock={plan} />
            case 3: return <WithXAmount selectedStock={plan} />
            case 4: return <CompanyInfo selectedStock={plan} />
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
                        <button className='buttonIcon' onClick={() => setPreTradeDetailDisplay(4)}><AlertCircle color={preTradeDetailDisplay === 4 ? 'green' : 'white'} /></button>
                        <button className='buttonIcon' onClick={() => setPreTradeDetailDisplay(0)}><Plane color={preTradeDetailDisplay === 0 ? 'green' : 'white'} /></button>
                        <button className='buttonIcon' onClick={() => setPreTradeDetailDisplay(1)}><Coins color={preTradeDetailDisplay === 1 ? 'green' : 'white'} /></button>
                        <button className='buttonIcon' onClick={() => setPreTradeDetailDisplay(2)}><Banknote color={preTradeDetailDisplay === 2 ? 'green' : 'white'} /></button>
                        <button className='buttonIcon' onClick={() => setPreTradeDetailDisplay(3)}><HandCoins color={preTradeDetailDisplay === 3 ? 'green' : 'white'} /></button>
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