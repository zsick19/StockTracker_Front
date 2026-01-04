import React, { useEffect } from 'react'
import ChartGraph from './ChartGraph'
import { useGetChartingDataQuery } from '../../features/Charting/ChartingSliceApi'
import { useDispatch } from 'react-redux'
import { setPreviousCharting } from '../../features/Charting/chartingElements'
import { setKeyLevelsCharting } from '../../features/KeyLevels/KeyLevelGraphElements'

function ChartWithChartingWrapper({ ticker, candleData, chartId, timeFrame })
{
    const dispatch = useDispatch()
    const { data: chartingData, isSuccess, isLoading, isError, refetch } = useGetChartingDataQuery({ chartId })

    useEffect(() =>
    {
        if (isSuccess)
        {
            dispatch(setKeyLevelsCharting(chartingData))
            dispatch(setPreviousCharting(chartingData))
        }
    }, [chartingData])



    return (
        <div className="ChartGraphWrapper">
            <ChartGraph ticker={ticker} candleData={candleData.candleData} mostRecentPrice={candleData.mostRecentPrice} timeFrame={timeFrame} />
        </div>
    )
}

export default ChartWithChartingWrapper