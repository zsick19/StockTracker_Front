import React, { useMemo, useState } from 'react'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../features/StockData/StockDataSliceApi'
import ChartWithoutPlanFetchChartingWrapper from '../../../../../../../components/ChartSubGraph/ChartWithoutPlanFetchChartingWrapper'
import GraphLoadingSpinner from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import GraphLoadingError from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
import * as short from 'short-uuid'

function SelectedStockChartBlock({ ticker, plan, timeFrame })
{
    let interactions = { nonLivePrice: false, nonInteractive: true, nonZoomAble: false }

    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({
        ticker, timeFrame, liveFeed: false, info: false
    })
    const uuid = useMemo(() => short.generate(), [])

    let chartContent
    if (isSuccess)
    {
        chartContent = <ChartWithoutPlanFetchChartingWrapper ticker={ticker} uuid={uuid} candleData={data} interactionController={interactions}
            chartId={plan._id} timeFrame={timeFrame} planData={plan.plan} mostRecentPrice={plan.mostRecentPrice} initialTracking={{ price: plan.initialTrackingPrice, date: plan.dateAdded }}
        />
    } else if (isLoading) { chartContent = <GraphLoadingSpinner /> }
    else if (isError) { chartContent = <GraphLoadingError refetch={refetch} /> }
    return (
        <div id='LHS-SelectedPlanChartContainer'>
            {chartContent}
        </div>
    )
}

export default SelectedStockChartBlock