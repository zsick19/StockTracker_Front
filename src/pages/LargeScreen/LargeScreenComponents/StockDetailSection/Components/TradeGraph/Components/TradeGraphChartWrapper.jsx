import React from 'react'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../features/StockData/StockDataSliceApi'
import ChartWithChartingWrapper from '../../../../../../../components/ChartSubGraph/ChartWithChartingWrapper'
import GraphLoadingSpinner from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import GraphLoadingError from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
import { Circle } from 'lucide-react'

function TradeGraphChartWrapper({ selectedStock, uuid, timeFrame, showEMAs })
{
    
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker: selectedStock.tickerSymbol, timeFrame: timeFrame, liveFeed: true, info: true })

    let chartContent
    if (isSuccess && data.candleData.length > 0)
    {
        chartContent = <ChartWithChartingWrapper ticker={selectedStock.tickerSymbol} candleData={data} interactionController={{ isLivePrice: true, isInteractive: true, isZoomAble: true }}
            candlesToKeepSinceLastQuery={data.candlesToKeepSinceLastQuery} chartId={selectedStock.chartId} timeFrame={timeFrame} uuid={uuid} lastCandleData={data.mostRecentTickerCandle} showEMAs={showEMAs} />
    } else if (isSuccess) { chartContent = <div>No Data To Display for this ticker</div> }
    else if (isLoading) { chartContent = <GraphLoadingSpinner /> }
    else if (isError) { chartContent = <GraphLoadingError refetch={refetch} /> }


    return (
        <div id='LHS-TradeChartWrapper'>
            {chartContent}
            <div>
                <Circle />
            </div>
        </div>
    )
}

export default TradeGraphChartWrapper