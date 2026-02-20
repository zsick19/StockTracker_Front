import React, { useEffect, useState } from 'react'
import { useInitiateTradeRecordMutation } from '../../../../../../../features/Trades/TradeSliceApi'
import ToMakeXAmount from '../PreTradeComponents/ToMakeXAmount'
import WithXAmount from '../PreTradeComponents/WithXAmount'
import WithXShares from '../PreTradeComponents/WithXShares'
import PreTradePlanExamine from '../PreTradeComponents/PreTradePlanExamine'
import { AlertCircle, Banknote, Coins, HandCoins, Plane } from 'lucide-react'
import CompanyInfo from '../PreTradeComponents/CompanyInfo'
import '../PreTradeComponents/PreTradeStyles.css'
import { enterBufferSelectors, enterExitPlannedSelectors, highImportanceSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { useGetStockAverageTrueRangeQuery } from '../../../../../../../features/StockData/StockDataSliceApi'


function PreTradePlanPresent({ selectedStock, setShowSupportingTickers })
{
    const [initiateTradeRecord] = useInitiateTradeRecordMutation()
    const [preTradeDetailDisplay, setPreTradeDetailDisplay] = useState(0)

    const [tradeRecordDetails, setTradeRecordDetails] = useState({ positionSize: undefined, purchasePrice: undefined })
    const [serverTradeResponse, setServerTradeResponse] = useState(undefined)
    const [showConfirmTradeValues, setShowConfirmTradeValues] = useState(false)
    const { data, isLoading, isError, isSuccess, error, refetch } = useGetStockAverageTrueRangeQuery({ ticker: selectedStock.tickerSymbol })

    async function attemptToInitiateTradeRecord(e)
    {
        if (selectedStock?.tradeId || !tradeRecordDetails.positionSize > 0 || !tradeRecordDetails.purchasePrice > 0) return
        let planPricing = selectedStock.plan.plan


        let tradingPlanPrices = [planPricing.stopLossPrice, tradeRecordDetails.purchasePrice, planPricing.enterBufferPrice, planPricing.exitBufferPrice, planPricing.exitPrice, planPricing.moonPrice]
        let idealPercents = tradingPlanPrices.map((p, i) => calcPercentage(tradeRecordDetails.purchasePrice, p)).filter(t => t !== 0)

        let atrAtPurchase = undefined
        let daysToCover = undefined
        if (isSuccess)
        {
            atrAtPurchase = parseFloat(data.currentATR.toFixed(2))
            daysToCover = Math.ceil((plan.plan.exitPrice - tradeRecordDetails.purchasePrice) / data.currentATR)
        }

        try
        {
            const results = await initiateTradeRecord({
                ...tradeRecordDetails,
                atrAtPurchase,
                daysToCover,
                tickerSector: selectedStock.plan.sector,
                tradingPlanPrices,
                enterExitPlanId: selectedStock.planId,
                tickerSymbol: selectedStock.tickerSymbol,
                idealPercents,
                idealGainPercent: idealPercents[3]
            })

            setServerTradeResponse(results)
        } catch (error)
        {
            console.log(error)
        }

        function calcPercentage(basePrice, p2)
        {
            let difference = basePrice - p2
            let percentage = (difference / basePrice) * 100
            return Math.abs(parseFloat(percentage.toFixed(2)))
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


    function checkAndThenShowConfirm()
    {
        if (tradeRecordDetails.purchasePrice > (selectedStock.plan.mostRecentPrice * 1.2) || tradeRecordDetails.purchasePrice < (selectedStock.plan.mostRecentPrice * 0.8)) return
        else setShowConfirmTradeValues(true)
    }

    return (
        <>

            {serverTradeResponse ? <div>
                Trade Recorded!!!
                <button>Alter Trade</button>
                <button>Go To Watch All Trades</button>
            </div> :

                <div id='PreTradeInitiator'>

                    <div className='TradeMenuChoice'>
                        <button className='buttonIcon' onClick={() => setPreTradeDetailDisplay(4)}><AlertCircle color={preTradeDetailDisplay === 4 ? 'green' : 'white'} /></button>
                        <button className='buttonIcon' onClick={() => setPreTradeDetailDisplay(0)}><Plane color={preTradeDetailDisplay === 0 ? 'green' : 'white'} /></button>
                        <button className='buttonIcon' onClick={() => setPreTradeDetailDisplay(1)}><Coins color={preTradeDetailDisplay === 1 ? 'green' : 'white'} /></button>
                        <button className='buttonIcon' onClick={() => setPreTradeDetailDisplay(2)}><Banknote color={preTradeDetailDisplay === 2 ? 'green' : 'white'} /></button>
                        <button className='buttonIcon' onClick={() => setPreTradeDetailDisplay(3)}><HandCoins color={preTradeDetailDisplay === 3 ? 'green' : 'white'} /></button>
                    </div>

                    <div id='PreTradeDetailContent'>
                        {provideDetailDisplay()}
                    </div>

                    <div className='TradeActionExecution'>

                        {showConfirmTradeValues ?
                            <div>
                                <p>${tradeRecordDetails.purchasePrice}</p>
                                <p>Purchase Price</p>
                                <p>${tradeRecordDetails.purchasePrice}</p>
                                <p>Quantity</p>
                                <button onClick={() => attemptToInitiateTradeRecord()}>Record Trade</button>
                                <button onClick={() => setShowConfirmTradeValues(false)}>Cancel</button>
                            </div> :
                            <form className='RecordTradeForm' onSubmit={(e) => { e.preventDefault(); checkAndThenShowConfirm() }} onChange={(e) => setTradeRecordDetails(prev => ({ ...prev, [e.target.name]: parseFloat(e.target.value) }))}>
                                <div>
                                    <input type="number" name="purchasePrice" id="purchasePrice" autoComplete='off' value={tradeRecordDetails.purchasePrice} />
                                    <label htmlFor='purchasePrice'>Purchase Price</label>
                                </div>
                                <div>
                                    <input type="number" name="positionSize" id="numberOfShares" min={1} autoComplete='off' value={tradeRecordDetails.positionSize} />
                                    <label htmlFor="numberOfShares">Quantity</label>
                                </div>
                                {isError ? <button onClick={() => refetch()}>ATR Reload</button> :
                                    <button disabled={tradeRecordDetails.purchasePrice === undefined || tradeRecordDetails.positionSize === undefined}>Submit Trade</button>
                                }
                            </form>
                        }
                    </div>
                </div >
            }
        </>
    )
}

export default PreTradePlanPresent