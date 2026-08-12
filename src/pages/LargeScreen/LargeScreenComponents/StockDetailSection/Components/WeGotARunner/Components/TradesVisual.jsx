import React from 'react'
import { useSelector } from 'react-redux'
import { selectNewRunnerTradeById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import { TradeVelocityScatterPlot } from '../../DeepDiscountTradeView/Components/TradeVelocityScatterPlot'

function TradesVisual({ trades, ticker })
{
    const mostRecentTrade = useSelector((state) => selectNewRunnerTradeById(state, ticker))

    return (
        <div>

            <TradeVelocityScatterPlot tickerSymbol={ticker} tradesHistory={trades} />

        </div>
    )
}

export default TradesVisual