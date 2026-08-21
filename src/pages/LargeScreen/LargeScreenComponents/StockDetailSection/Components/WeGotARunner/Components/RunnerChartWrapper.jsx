import React from 'react'
import { useFetchNewsRunnerCandleDataQuery } from '../../../../../../../features/NewsRunnerEngine/NewsRunnerApiSlice'
import GraphLoadingSpinner from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import GraphLoadingError from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
import RunnerChart from './RunnerChart'
import { isWeekend } from 'date-fns'
import { MinuteMacdChart } from './MinuteMacdChart'

function RunnerChartWrapper({ ticker })
{
    // const currentNewsRunner = useSelector((state) => selectNewsRunnerById(state, ticker))

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <RunnerChart ticker={ticker} />
            <MinuteMacdChart ticker={ticker} height={96} />
        </div>
    )
}

export default RunnerChartWrapper