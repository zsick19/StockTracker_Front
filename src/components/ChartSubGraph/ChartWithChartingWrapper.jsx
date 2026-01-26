import React, { useEffect } from 'react'
import ChartGraph from './ChartGraph'
import { useGetChartingDataQuery } from '../../features/Charting/ChartingSliceApi'
import { useDispatch, useSelector } from 'react-redux'
import { setPreviousCharting } from '../../features/Charting/chartingElements'
import { setKeyLevelsCharting } from '../../features/KeyLevels/KeyLevelGraphElements'
import { setEnterExitCharting } from '../../features/EnterExitPlans/EnterExitGraphElement'
import ChartGraphTrial from '../ChartTimeFrameTrials/ChartGraphTrial'

function ChartWithChartingWrapper({ ticker, candleData, interactionController, chartId, timeFrame })
{
    const dispatch = useDispatch()
    const { data: chartingData, isSuccess, isLoading, isError, error, refetch } = useGetChartingDataQuery({ chartId })


    useEffect(() =>
    {
        if (isSuccess)
        {
            dispatch(setEnterExitCharting(chartingData))
            dispatch(setKeyLevelsCharting(chartingData))
            dispatch(setPreviousCharting(chartingData))
        } else if (isError)
        {
            console.log(error);
        }

    }, [chartingData])

    return (
        <div className="ChartGraphWrapper">

            <ChartGraph ticker={ticker} chartId={chartId} candleData={candleData.candleData}
                mostRecentPrice={candleData.mostRecentPrice}
                timeFrame={timeFrame} nonLivePrice={interactionController?.nonLivePrice} nonInteractive={interactionController?.nonInteractive} nonZoomAble={interactionController?.nonZoomAble} />
        </div>
    )
}

export default ChartWithChartingWrapper