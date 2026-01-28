import React, { useMemo } from 'react'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../../../features/StockData/StockDataSliceApi'
import { defaultTimeFrames } from '../../../../../../../../../Utilities/TimeFrames'
import * as short from 'short-uuid'
import ChartWithoutPlanFetchChartingWrapper from '../../../../../../../../../components/ChartSubGraph/ChartWithoutPlanFetchChartingWrapper'
import GraphLoadingError from '../../../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
import GraphLoadingSpinner from '../../../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'

function SelectedTradeChartBlock({ ticker, trade })
{
    const { data, isSuccess, isLoading, isError, error } = useGetStockDataUsingTimeFrameQuery({ ticker, timeFrame: defaultTimeFrames.threeDayOneMin, liveFeed: true, info: false })

    const uuid = useMemo(() => short.generate(), [])

    let interactions = { nonLivePrice: true, nonInteractive: true, nonZoomAble: false }
    let chartContent
    if (isSuccess)
    {
        chartContent = <ChartWithoutPlanFetchChartingWrapper ticker={ticker} candleData={data} interactionController={interactions}
            chartId={trade.enterExitPlanId} timeFrame={defaultTimeFrames.threeDayOneMin} planData={trade.tradingPlanPrices} mostRecentPrice={trade.mostRecentPrice}
            initialTracking={{ price: trade.tradingPlanPrices[1], date: trade.enterDate }} uuid={uuid} />
    } else if (isLoading)
    {
        chartContent = <GraphLoadingSpinner />
    } else if (isError)
    {
        chartContent = <GraphLoadingError refetch={refetch} />
    }



    return (
        <div id='LSH-SelectedTradeChartWrapper'>
            {chartContent}
        </div>
    )
}

export default SelectedTradeChartBlock