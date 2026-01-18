import React, { useEffect } from 'react'
import ChartGraph from './ChartGraph'
import { useGetChartingDataQuery } from '../../features/Charting/ChartingSliceApi'
import { useDispatch, useSelector } from 'react-redux'
import { setPreviousCharting } from '../../features/Charting/chartingElements'
import { setKeyLevelsCharting } from '../../features/KeyLevels/KeyLevelGraphElements'
import { setEnterExitCharting } from '../../features/EnterExitPlans/EnterExitGraphElement'

function ChartWithChartingWrapper({ ticker, candleData, chartId, timeFrame })
{

    const dispatch = useDispatch()
    const { data: chartingData, isSuccess, isLoading, isError, refetch } = useGetChartingDataQuery({ chartId })

    useEffect(() =>
    {
        if (isSuccess)
        {
            dispatch(setEnterExitCharting(chartingData))
            dispatch(setKeyLevelsCharting(chartingData))
            dispatch(setPreviousCharting(chartingData))
        }
    }, [chartingData])

    console.log(candleData?.nonLivePrice)

    return (
        <div className="ChartGraphWrapper">
            <ChartGraph ticker={ticker} chartId={chartId} candleData={candleData.candleData} mostRecentPrice={candleData.mostRecentPrice}
                timeFrame={timeFrame} nonLivePrice={candleData?.nonLivePrice} />
        </div>
    )
}

export default ChartWithChartingWrapper