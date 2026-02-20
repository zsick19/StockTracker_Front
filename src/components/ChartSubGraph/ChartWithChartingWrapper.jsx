import React, { useEffect } from 'react'
import ChartGraph from './ChartGraph'
import { useGetChartingDataQuery } from '../../features/Charting/ChartingSliceApi'
import { useDispatch } from 'react-redux'
import { setPreviousCharting } from '../../features/Charting/chartingElements'
import { setKeyLevelsCharting } from '../../features/KeyLevels/KeyLevelGraphElements'
import { setEnterExitCharting } from '../../features/EnterExitPlans/EnterExitGraphElement'
import { clearGraphControl, setInitialGraphControl } from '../../features/Charting/GraphHoverZoomElement'
import { clearGraphStudyControl, setInitialGraphStudyControl } from '../../features/Charting/GraphStudiesVisualElement'
import { clearGraphToSubGraphCrossHair, setInitialGraphToSubGraphCrossHair } from '../../features/Charting/GraphToSubGraphCrossHairElement'
import { clearGraphHoursControl, setInitialGraphHoursControl } from '../../features/Charting/GraphMarketHourElement'
import { clearGraphVisibility, setInitialGraphVisibility } from '../../features/Charting/ChartingVisibility'

function ChartWithChartingWrapper({ ticker, candleData, setChartInfoDisplay, interactionController, chartId, timeFrame, setTimeFrame, uuid, lastCandleData, candlesToKeepSinceLastQuery, showEMAs })
{
    const dispatch = useDispatch()
    const tickerForSearch = ticker?.ticker || ticker
    const chartIdForSearch = ticker?._id || chartId


    const { data: chartingData, isSuccess, isLoading, isError, error, refetch } = useGetChartingDataQuery({ tickerSymbol: ticker?.ticker || ticker, chartId: ticker?._id || chartId })

    useEffect(() =>
    {
        if (uuid)
        {
            dispatch(setInitialGraphControl({ uuid }))
            dispatch(setInitialGraphStudyControl({ uuid }))
            dispatch(setInitialGraphToSubGraphCrossHair({ uuid }))
            dispatch(setInitialGraphHoursControl({ uuid }))
            dispatch(setInitialGraphVisibility({ uuid }))
        }
        return (() =>
        {
            if (uuid)
            {
                dispatch(clearGraphControl({ uuid }))
                dispatch(clearGraphStudyControl({ uuid }))
                dispatch(clearGraphToSubGraphCrossHair({ uuid }))
                dispatch(clearGraphHoursControl({ uuid }))
                dispatch(clearGraphVisibility({ uuid }))
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
            <ChartGraph ticker={tickerForSearch} chartId={chartId} candleData={candleData.candleData} uuid={uuid}
                mostRecentPrice={candleData.mostRecentPrice}
                lastCandleData={lastCandleData}
                candlesToKeepSinceLastQuery={candlesToKeepSinceLastQuery}
                timeFrame={timeFrame} setTimeFrame={setTimeFrame}
                isLivePrice={interactionController?.isLivePrice} isInteractive={interactionController?.isInteractive}
                isZoomAble={interactionController?.isZoomAble} showEMAs={showEMAs} setChartInfoDisplay={setChartInfoDisplay} />
        </div>
    )
}

export default ChartWithChartingWrapper