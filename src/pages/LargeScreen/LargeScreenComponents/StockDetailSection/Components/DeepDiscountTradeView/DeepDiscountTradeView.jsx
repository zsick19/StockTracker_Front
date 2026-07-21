import React, { useMemo, useState } from 'react'
import * as short from 'short-uuid'

import './DeepDiscountTradeView.css'
import { useClearDeepDiscountEngineLiveDataMutation, useFetchDeepDiscountEngineLiveDataQuery, usePopulateInitialDeepDiscountEngineQuery } from '../../../../../../features/DeepDiscountEngine/EngineDeepDiscountApiSlice'
import { format, isAfter, set } from 'date-fns'
import BidAskSpreadChart from './Components/BidAskSpreadChart'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { deepInterceptionAdapter, removeDeepDiscountWatch, selectDeepDiscountWatchById } from '../../../../../../features/DeepDiscountEngine/DeepDiscountLocalSlice'
import TradeHistory from './Components/TradeHistory'
import { synthesizeTapeVelocityMetrics } from './Calculations/synthesizeTapeVelocityMetrics'
import { SpreadElasticityRollingChart } from './Components/SpreadElasticityRollingChart'
import { TradeVelocityScatterPlot } from './Components/TradeVelocityScatterPlot'
import { selectPlanForStaticDetails } from '../../../../../../features/Engine/EnginePlanApiSlice'
import IntegratedPlanChartWrapper from '../IntegratedPlanView/Components/IntegratedPlanChartWrapper'
import { setStockDetailState } from '../../../../../../features/SelectedStocks/StockDetailControlSlice'
import DailyChartWrapper from '../../../../../../components/ChartSubGraph/DailyChartWrapper'


function DeepDiscountTradeView({ tickerSymbol })
{
    const dispatch = useDispatch()
    const selectStaticFieldsInstance = useMemo(selectPlanForStaticDetails, [])
    const selectedPlannedTicker = useSelector((state) => selectStaticFieldsInstance(state, tickerSymbol), shallowEqual);
    const patternConfig = selectedPlannedTicker.patternConfig


    const postClosePolling = isAfter(new Date(), set(new Date(), { hours: 16, minutes: 0, seconds: 0, milliseconds: 0 })) ? 0 : 5000
    const { data, isSuccess } = useFetchDeepDiscountEngineLiveDataQuery({ tickerSymbol }, { pollingInterval: postClosePolling })

    const dailyChartUUID = useMemo(() => short.generate(), [])

    const [clearDeepDiscountEngineLiveData] = useClearDeepDiscountEngineLiveDataMutation()
    async function attemptClearDeepDiscount()
    {
        try
        {
            const results = await clearDeepDiscountEngineLiveData({ tickerSymbol: tickerSymbol }).unwrap()
            // dispatch(removeDeepDiscountWatch({ tickerSymbol }))
            // dispatch(setStockDetailState({ detail: 1 }))          
        } catch (error)
        {
            console.log(error)
        }
    }

    const liveAssetDataNode = useSelector((state) => selectDeepDiscountWatchById(state, tickerSymbol));
    const latestAskBid = liveAssetDataNode?.latestAskBid
    const results = synthesizeTapeVelocityMetrics(liveAssetDataNode?.tradeHistory, liveAssetDataNode?.quotesHistory, liveAssetDataNode?.latestAskBid.BidSize, liveAssetDataNode?.latestAskBid.AskSize)

    const [graphOrLists, setGraphOrLists] = useState({ velocity: false, spread: false })
    const [minuteOrDailyChart, setMinuteOrDailyChart] = useState(false)
    return (
        <div id='DeepDiscountTradeView'>

            <div id='ChartAndResultActions'>
                {minuteOrDailyChart ?
                    <DailyChartWrapper ticker={tickerSymbol} candleData={liveAssetDataNode.dailyCandles} uuid={dailyChartUUID}
                        chartStartDate={selectedPlannedTicker.planConfig.relevantCandleDate} chartEndDate={new Date()}
                        pricePoints={{ entryPrice: patternConfig.entryStrikeBuffer, floorPrice: patternConfig.channelBottom, exitPrice: patternConfig.channelTop, stopLossPrice: selectedPlannedTicker.planConfig.plan.stopLossPrice }}
                        mostRecentPrice={5}
                    /> :

                    <IntegratedPlanChartWrapper plan={selectedPlannedTicker} />
                }
                <div>
                    {tickerSymbol}
                    <p>Volume: {results.volumetricBias.status}</p>
                    <p>Spread Status: {results.spreadStatus.status}</p>
                    <p>Order Book Pressure: {results.bookPressure.status}</p>
                    <p>Is Tide Turning: {results.isTideTurning ? 'Yes' : 'No'}</p>
                    <button onClick={() => attemptClearDeepDiscount()}>Clear Deep Discount</button>
                    <button onClick={() => setMinuteOrDailyChart(prev => !prev)}>Daily Chart</button>
                </div>
            </div>



            <div className='flex'>

                <div onClick={() => setGraphOrLists(prev => { return { ...prev, spread: !prev.spread } })}>
                    {graphOrLists.spread ?
                        <BidAskSpreadChart quotesHistory={liveAssetDataNode.quotesHistory} /> :
                        <SpreadElasticityRollingChart tickerSymbol={tickerSymbol} rawQuoteHistory={liveAssetDataNode.quotesHistory} currentSpread={latestAskBid} />
                    }
                </div>

                <div onClick={() => setGraphOrLists(prev => { return { ...prev, velocity: !prev.velocity } })}>
                    {graphOrLists.velocity ?
                        <TradeHistory tradeHistory={liveAssetDataNode.tradeHistory} /> :
                        <TradeVelocityScatterPlot tickerSymbol={tickerSymbol} tradesHistory={liveAssetDataNode.tradeHistory} />
                    }
                </div>

            </div>
        </div>
    )
}

export default DeepDiscountTradeView