import React, { useMemo, useRef } from 'react'
import { useFetchNewsRunnerTradeQuotesQuery } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerApiSlice'
import QuoteVisual from './QuoteVisual'
import TradesVisual from './TradesVisual'
import { isWeekend } from 'date-fns'
import NewsDetail from './NewsDetail'
import { useSelector } from 'react-redux'
import { selectNewsRunnerLargeSmallOrderById } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import { useResizeObserver } from '../../../../../../../hooks/useResizeObserver'
import { select } from 'd3'
import OrderSizeVisual from './OrderSizeVisual'
import { OrderVelocityAcceleration } from './OrderVelocityAcceleration'
import { VisualSqueezePanel } from './VisualSqueezeSummaryPanel'

function TradeAndQuoteWrapper({ tickerForStream })
{
  const tradeQuoteMetrics = useSelector((state) => selectNewsRunnerLargeSmallOrderById(state, tickerForStream))


  return (
    <div id='QuoteTradeArticleContainer'>
      <OrderSizeVisual data={tradeQuoteMetrics.historicalChartIntervals} />
      <OrderVelocityAcceleration data={tradeQuoteMetrics.historicalChartIntervals} />
    </div>
  )
}

export default TradeAndQuoteWrapper