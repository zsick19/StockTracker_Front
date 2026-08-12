import React from 'react'
import { useFetchNewsRunnerCandleDataQuery } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerApiSlice'
import GraphLoadingSpinner from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import GraphLoadingError from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
import RunnerChart from './RunnerChart'
import { isWeekend } from 'date-fns'

function RunnerChartWrapper({ tickerForStream })
{
    const pollingInterval = isWeekend(new Date()) ? 0 : 1000 * 30
    const { data, isSuccess, isLoading, isError, error, refetch } = useFetchNewsRunnerCandleDataQuery({ tickerSymbol: tickerForStream }, { pollingInterval })

    let chartContent
    if (isSuccess)
    {
        chartContent = <RunnerChart candleData={data.todays} ticker={tickerForStream} />
    } else if (isLoading)
    {
        chartContent = <GraphLoadingSpinner />
    } else if (isError)
    {
        chartContent = <GraphLoadingError refetch={refetch} />
    }

    return (
        <div>
            {chartContent}
        </div>
    )
}

export default RunnerChartWrapper