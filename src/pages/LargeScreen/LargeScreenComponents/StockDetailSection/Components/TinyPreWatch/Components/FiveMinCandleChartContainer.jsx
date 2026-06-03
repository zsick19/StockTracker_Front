import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { fiveMinSelectors } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import ChartWithNoFetchWrapper from '../../../../../../../components/ChartSubGraph/ChartWithNoFetchingWrapper'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'
import * as short from 'short-uuid'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../features/StockData/StockDataSliceApi'
import GraphLoadingError from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
import GraphLoadingSpinner from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import ChartWithChartingWrapper from '../../../../../../../components/ChartSubGraph/ChartWithChartingWrapper'
import MACDSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/MACDSubChart'

function FiveMinCandleChartContainer({ id })
{
    const uuid = useMemo(() => short.generate(), [])

    const { data: stockData, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker: id, timeFrame: defaultTimeFrames.threeDayFiveMin, liveFeed: true })

    let graphVisual
    let macdContent
    if (isSuccess && stockData.candleData.length > 0)
    {
        graphVisual = <ChartWithChartingWrapper ticker={id} candleData={stockData}
            timeFrame={defaultTimeFrames.threeDayFiveMin} uuid={uuid} interactionController={{ isZoomAble: true, isInteractive: false }}
            candlesToKeepSinceLastQuery={stockData.candlesToKeepSinceLastQuery} lastCandleData={stockData.mostRecentTickerCandle} />

        macdContent = <MACDSubChart candleData={stockData.candleData} uuid={uuid} timeFrame={defaultTimeFrames.threeDayFiveMin} hideTimeLine={true} />
    } else if (isSuccess) graphVisual = <div>No data to display for this ticker</div>
    else if (isLoading) graphVisual = <GraphLoadingSpinner />
    else if (isError) graphVisual = <GraphLoadingError />

    return (
        <div className='FiveMinExpandedChartWrapper'>
            {graphVisual}
            {/* {macdContent} */}
        </div>
    )
}

export default FiveMinCandleChartContainer