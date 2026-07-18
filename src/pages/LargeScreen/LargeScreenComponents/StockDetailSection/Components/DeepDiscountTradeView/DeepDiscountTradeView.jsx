import React, { useMemo } from 'react'
import './DeepDiscountTradeView.css'
import { useClearDeepDiscountEngineLiveDataMutation, usePopulateInitialDeepDiscountEngineQuery } from '../../../../../../features/DeepDiscountEngine/EngineDeepDiscountApiSlice'
import { format } from 'date-fns'
import BidAskSpreadChart from './Components/BidAskSpreadChart'
import { shallowEqual, useSelector } from 'react-redux'
import { deepInterceptionAdapter, selectDeepDiscountWatchById } from '../../../../../../features/DeepDiscountEngine/DeepDiscountLocalSlice'
import TradeHistory from './Components/TradeHistory'
import { synthesizeTapeVelocityMetrics } from './Calculations/synthesizeTapeVelocityMetrics'
import { SpreadElasticityRollingChart } from './Components/SpreadElasticityRollingChart'
import { TradeVelocityScatterPlot } from './Components/TradeVelocityScatterPlot'
import { selectPlanForStaticDetails } from '../../../../../../features/Engine/EnginePlanApiSlice'
import IntegratedPlanChartWrapper from '../IntegratedPlanView/Components/IntegratedPlanChartWrapper'


function DeepDiscountTradeView({ tickerSymbol })
{

    const selectStaticFieldsInstance = useMemo(selectPlanForStaticDetails, [])
    const selectedPlannedTicker = useSelector((state) => selectStaticFieldsInstance(state, tickerSymbol), shallowEqual);

    const [clearDeepDiscountEngineLiveData] = useClearDeepDiscountEngineLiveDataMutation()
    async function attemptClearDeepDiscount()
    {
        try
        {
            const results = await clearDeepDiscountEngineLiveData({ tickerSymbol: tickerSymbol }).unwrap()
            console.log('cleared')
        } catch (error)
        {
            console.log(error)
        }
    }

    const liveAssetDataNode = useSelector((state) => selectDeepDiscountWatchById(state, tickerSymbol));
    const latestAskBid = liveAssetDataNode?.latestAskBid
    const results = synthesizeTapeVelocityMetrics(liveAssetDataNode?.tradeHistory, liveAssetDataNode?.quotesHistory, liveAssetDataNode?.latestAskBid.BidSize, liveAssetDataNode?.latestAskBid.AskSize)





    return (
        <div id='DeepDiscountTradeView'>

            <div id='ChartAndResultActions'>
                <IntegratedPlanChartWrapper plan={selectedPlannedTicker} />
                <div>
                    <p>Volume: {results.volumetricBias}</p>
                    <p>Spread Status: {results.spreadStatus}</p>
                    <p>Order Book Pressure: {results.bookPressure}</p>
                    <p>Is Tide Turning: {results.isTideTurning ? 'Yes' : 'No'}</p>
                </div>
            </div>




            <div className='flex'>
                <SpreadElasticityRollingChart tickerSymbol={tickerSymbol} rawQuoteHistory={liveAssetDataNode.quotesHistory} currentSpread={latestAskBid} />
                <BidAskSpreadChart quotesHistory={liveAssetDataNode.quotesHistory} />
            </div>
            <br />
            <div className='flex'>
                <TradeVelocityScatterPlot tickerSymbol={tickerSymbol} tradesHistory={liveAssetDataNode.tradeHistory} />
                <TradeHistory tradeHistory={liveAssetDataNode.tradeHistory} />
            </div>
        </div>
    )
}

export default DeepDiscountTradeView