import React, { useEffect } from 'react'
import ChartGraph from './ChartGraph'
import { useDispatch } from 'react-redux'
import { clearGraphControl, setInitialGraphControl } from '../../features/Charting/GraphHoverZoomElement'
import { clearGraphStudyControl, setInitialGraphStudyControl } from '../../features/Charting/GraphStudiesVisualElement'
import { clearGraphHoursControl, setInitialGraphHoursControl } from '../../features/Charting/GraphMarketHourElement'
import { clearGraphToSubGraphCrossHair, setInitialGraphToSubGraphCrossHair } from '../../features/Charting/GraphToSubGraphCrossHairElement'
import { clearGraphVisibility, setInitialGraphVisibility } from '../../features/Charting/ChartingVisibility'
import { setEnterExitCharting, setEnterExitChartingFromPlan, setEnterExitWithDetailsFromPlan } from '../../features/EnterExitPlans/EnterExitGraphElement'

function ChartWithNoFetchWrapper({ ticker, dailyCalculatedValues, morningMetrics, candleData, interactionController, chartId,
    timeFrame, mostRecentPrice, EMNumbers, uuid, lastCandleData, showEMAs, tradingPlanPrices, liveActionTimeFrame, planChartingData })
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

        return (() =>
        {
            if (uuid)
            {
                dispatch(clearGraphControl({ uuid }))
                dispatch(setInitialGraphStudyControl({ uuid }))
                dispatch(clearGraphToSubGraphCrossHair({ uuid }))
                dispatch(clearGraphHoursControl({ uuid }))
                dispatch(clearGraphVisibility({ uuid }))
            }
        })
    }, [])

    useEffect(() =>
    {
        if (planChartingData) dispatch(setEnterExitWithDetailsFromPlan(planChartingData))
    }, [])

    return (
        <div className="ChartGraphWrapper">
            <ChartGraph ticker={ticker} chartId={chartId} candleData={candleData.candleData}
                mostRecentPrice={{ Price: mostRecentPrice }}
                timeFrame={timeFrame} lastCandleData={lastCandleData}
                isLivePrice={interactionController?.isLivePrice}
                isInteractive={interactionController?.isInteractive}
                isZoomAble={interactionController.isZoomAble}
                uuid={uuid}
                showEMAs={showEMAs}
                EMNumbers={EMNumbers}
                dailyCalculatedValues={dailyCalculatedValues}
                morningMetrics={morningMetrics}
                tradingPlanPrices={tradingPlanPrices}
                liveActionTimeFrame={liveActionTimeFrame}
            />
        </div>)
}

export default ChartWithNoFetchWrapper