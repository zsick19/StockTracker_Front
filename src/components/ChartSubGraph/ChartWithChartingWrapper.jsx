import React, { useEffect, useState } from 'react'
import ChartGraph from './ChartGraph'
import { useGetChartingDataQuery } from '../../features/Charting/ChartingSliceApi'
import { useDispatch, useSelector } from 'react-redux'
import { setPreviousCharting } from '../../features/Charting/chartingElements'
import { setKeyLevelsCharting } from '../../features/KeyLevels/KeyLevelGraphElements'
import { setEnterExitCharting } from '../../features/EnterExitPlans/EnterExitGraphElement'
import { clearGraphControl, setInitialGraphControl } from '../../features/Charting/GraphHoverZoomElement'
import { clearGraphStudyControl, setInitialGraphStudyControl } from '../../features/Charting/GraphStudiesVisualElement'

function ChartWithChartingWrapper({ ticker, candleData, interactionController, chartId, timeFrame, uuid, lastCandleData, candlesToKeepSinceLastQuery, showEMAs })
{
    const dispatch = useDispatch()
    const { data: chartingData, isSuccess, isLoading, isError, error, refetch } = useGetChartingDataQuery({ chartId })

    useEffect(() =>
    {
        if (uuid)
        {
            dispatch(setInitialGraphControl({ uuid }))
            dispatch(setInitialGraphStudyControl({ uuid }))
        }
        return (() =>
        {
            if (uuid)
            {
                dispatch(clearGraphControl({ uuid }))
                dispatch(clearGraphStudyControl({ uuid }))
            }
        })
    }, [])

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
            <ChartGraph ticker={ticker} chartId={chartId} candleData={candleData.candleData} uuid={uuid}
                mostRecentPrice={candleData.mostRecentPrice} lastCandleData={lastCandleData} candlesToKeepSinceLastQuery={candlesToKeepSinceLastQuery}
                timeFrame={timeFrame} isLivePrice={interactionController?.isLivePrice} isInteractive={interactionController?.isInteractive}
                isZoomAble={interactionController?.isZoomAble} showEMAs={showEMAs} />
        </div>
    )
}

export default ChartWithChartingWrapper