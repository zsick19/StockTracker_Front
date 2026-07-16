import React from 'react'
import './DeepDiscountTradeView.css'
import { usePopulateInitialDeepDiscountEngineQuery } from '../../../../../../features/DeepDiscountEngine/EngineDeepDiscountApiSlice'
import { format } from 'date-fns'
import BidAskSpreadChart from './Components/BidAskSpreadChart'
import { useSelector } from 'react-redux'
import { deepInterceptionAdapter } from '../../../../../../features/DeepDiscountEngine/DeepDiscountLocalSlice'
import TradeHistory from './Components/TradeHistory'
import { synthesizeTapeVelocityMetrics } from './Calculations/synthesizeTapeVelocityMetrics'
import { SpreadElasticityRollingChart } from './Components/SpreadElasticityRollingChart'
import { TradeVelocityScatterPlot } from './Components/TradeVelocityScatterPlot'


const { selectById } = deepInterceptionAdapter.getSelectors((state) => state.interceptSentrySlice)
function DeepDiscountTradeView({ tickerSymbol })
{

    const liveAssetDataNode = useSelector((state) => selectById(state, tickerSymbol));
    const latestAskBid = liveAssetDataNode.latestAskBid

    const results = synthesizeTapeVelocityMetrics(liveAssetDataNode.tradeHistory, liveAssetDataNode.quotesHistory, liveAssetDataNode.latestAskBid.BidSize, liveAssetDataNode.latestAskBid.AskSize)

    return (
        <div id='DeepDiscountTradeView'>
            <div>
                <p>Volume: {results.volumetricBias}</p>
                <p>Spread Status: {results.spreadStatus}</p>
                <p>Order Book Pressure: {results.bookPressure}</p>
                <p>Is Tide Turning: {results.isTideTurning ? 'Yes' : 'No'}</p>
            </div>

            <h2>Latest Quote</h2>
            <div className='flex'>
                <div>
                    <p>Ask ${latestAskBid.AskPrice}</p>
                    <p>{latestAskBid.AskSize}</p>
                </div>
                <div >
                    <p>Bid ${latestAskBid.BidPrice}</p>
                    <p>{latestAskBid.BidSize}</p>
                </div>
            </div>
            <br />
            <div className='flex'>
                <BidAskSpreadChart quotesHistory={liveAssetDataNode.quotesHistory} />
                <TradeHistory tradeHistory={liveAssetDataNode.tradeHistory} />
            </div>

            <SpreadElasticityRollingChart tickerSymbol={tickerSymbol} rawQuoteHistory={liveAssetDataNode.quotesHistory} currentSpread={latestAskBid} />
            <TradeVelocityScatterPlot tickerSymbol={tickerSymbol} tradesHistory={liveAssetDataNode.tradeHistory} />
        </div>
    )
}

export default DeepDiscountTradeView