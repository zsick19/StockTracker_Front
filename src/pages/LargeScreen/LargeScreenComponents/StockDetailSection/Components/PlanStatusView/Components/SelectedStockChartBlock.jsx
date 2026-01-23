import React from 'react'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../features/StockData/StockDataSliceApi'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'
import ChartWithoutPlanFetchChartingWrapper from '../../../../../../../components/ChartSubGraph/ChartWithoutPlanFetchChartingWrapper'
import GraphLoadingSpinner from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import GraphLoadingError from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'

function SelectedStockChartBlock({ ticker, plan })
{

    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker, timeFrame: defaultTimeFrames.dailyHalfYear, liveFeed: false, info: false })
    let interactions = { nonLivePrice: false, nonInteractive: true, nonZoomAble: false }
    let chartContent
    if (isSuccess)
    {
        chartContent = <ChartWithoutPlanFetchChartingWrapper ticker={ticker} candleData={data} interactionController={interactions}
            chartId={plan._id} timeFrame={defaultTimeFrames.dailyHalfYear} planData={plan.plan} mostRecentPrice={plan.mostRecentPrice} initialTrackingPrice={plan.initialTrackingPrice}
        />
    } else if (isLoading)
    {
        chartContent = <GraphLoadingSpinner />
    } else if (isError)
    {
        chartContent = <GraphLoadingError refetch={refetch} />
    }
    return (
        <div id='LHS-SelectedPlanChartContainer'>
            {chartContent}
        </div>
    )
}

export default SelectedStockChartBlock