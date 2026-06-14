import React, { useMemo } from 'react'
import ChartWithoutPlanFetchChartingWrapper from '../../../../../../../../components/ChartSubGraph/ChartWithoutPlanFetchChartingWrapper'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../../features/StockData/StockDataSliceApi'
import { defaultTimeFrames } from '../../../../../../../../Utilities/TimeFrames'
import GraphLoadingSpinner from '../../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import * as short from 'short-uuid'
import GraphLoadingError from '../../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'

function MiniGraphChartWrapper({ activeTrade, setShowMiniGraph })
{
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({
        ticker: activeTrade.tickerSymbol,
        timeFrame: defaultTimeFrames.dailyQuarter, liveFeed: true
    })

    const uuid = useMemo(() => short.generate(), [])
    let graphContent
    if (isSuccess)
    {
        graphContent = <ChartWithoutPlanFetchChartingWrapper ticker={activeTrade.tickerSymbol}
            candleData={data} interactionController={{ isZoomAble: true, isInteractive: false, isLivePrice: true }} timeFrame={defaultTimeFrames.dailyQuarter}
            mostRecentPrice={activeTrade.mostRecentPrice} uuid={uuid} chartId={activeTrade._id} lastCandleData={data.mostRecentTickerCandle}
            planData={activeTrade.tradingPlanPrices}
        />
    } else if (isLoading)
    {
        graphContent = <GraphLoadingSpinner />
    } else if (isError)
    {
        graphContent = <GraphLoadingError />
    }


    return (
        <div onClick={() => setShowMiniGraph(false)} className={`TradeBlockMiniChart ${activeTrade.classVisual}`}>
            {graphContent}
        </div>
    )
}

export default MiniGraphChartWrapper