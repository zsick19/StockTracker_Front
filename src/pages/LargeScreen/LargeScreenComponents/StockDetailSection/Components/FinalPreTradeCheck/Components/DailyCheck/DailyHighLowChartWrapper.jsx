import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { clearGraphControl, setInitialGraphControl } from '../../../../../../../../features/Charting/GraphHoverZoomElement'
import { clearGraphHoursControl, setFocusStartFinishDate, setInitialGraphHoursControl } from '../../../../../../../../features/Charting/GraphMarketHourElement'
import { clearGraphToSubGraphCrossHair, setInitialGraphToSubGraphCrossHair } from '../../../../../../../../features/Charting/GraphToSubGraphCrossHairElement'
import { clearGraphStudyControl, setInitialGraphStudyControl } from '../../../../../../../../features/Charting/GraphStudiesVisualElement'
import { clearGraphVisibility, setInitialGraphVisibility } from '../../../../../../../../features/Charting/ChartingVisibility'
import ChartGraph from '../../../../../../../../components/ChartSubGraph/ChartGraph'
import { setEnterExitCharting, setEnterExitChartingFromPlan, setEnterExitWithDetailsFromPlan } from '../../../../../../../../features/EnterExitPlans/EnterExitGraphElement'

function DailyHighLowChartWrapper({ ticker, candleData, chartingData, setChartInfoDisplay, interactionController,
    chartId, timeFrame, setTimeFrame, uuid, lastCandleData, candlesToKeepSinceLastQuery,
    showEMAs, macroTickerInfo, onlyMarketHours, relevantCandleDate })
{
    const dispatch = useDispatch()

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

        if (onlyMarketHours) dispatch(setToggleShowOnlyMarketHours({ uuid }))

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

    //add charting to graph
    useEffect(() =>
    {
        dispatch(setEnterExitWithDetailsFromPlan(chartingData))

    }, [chartingData])



    return (
        <div className="ChartGraphWrapper">

            <ChartGraph ticker={ticker} chartId={chartId} candleData={candleData.candleData} uuid={uuid}
                mostRecentPrice={candleData.mostRecentPrice}
                lastCandleData={lastCandleData}
                candlesToKeepSinceLastQuery={candlesToKeepSinceLastQuery}
                timeFrame={timeFrame} setTimeFrame={setTimeFrame}
                isLivePrice={interactionController?.isLivePrice} isInteractive={interactionController?.isInteractive}
                isZoomAble={interactionController?.isZoomAble} showEMAs={showEMAs} setChartInfoDisplay={setChartInfoDisplay}
                macroTickerInfo={macroTickerInfo} />
        </div>
    )
}
export default DailyHighLowChartWrapper