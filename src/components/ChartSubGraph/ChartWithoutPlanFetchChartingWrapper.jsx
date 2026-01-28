import React, { useEffect } from 'react'
import ChartGraph from './ChartGraph'
import { useDispatch } from 'react-redux'
import { setEnterExitChartingFromPlan } from '../../features/EnterExitPlans/EnterExitGraphElement'
import { clearGraphControl, setInitialGraphControl } from '../../features/Charting/GraphHoverZoomElement'

function ChartWithoutPlanFetchChartingWrapper({ ticker, candleData, interactionController, chartId, timeFrame,
    planData, mostRecentPrice, initialTracking, uuid })
{
    const dispatch = useDispatch()
    useEffect(() => { dispatch(setEnterExitChartingFromPlan({ tickerSymbol: ticker, plan: planData, planId: chartId })) }, [])

    useEffect(() =>
    {
        if (uuid) dispatch(setInitialGraphControl(uuid))
        return (() => { if (uuid) dispatch(clearGraphControl(uuid)) })
    }, [])

    return (
        <div className="ChartGraphWrapper">
            <ChartGraph ticker={ticker} chartId={chartId} candleData={candleData.candleData}
                mostRecentPrice={{ Price: mostRecentPrice }}
                timeFrame={timeFrame} nonLivePrice={interactionController?.nonLivePrice} nonInteractive={interactionController?.nonInteractive} nonZoomAble={interactionController?.nonZoomAble}
                initialTracking={initialTracking} uuid={uuid} />
        </div>)
}

export default ChartWithoutPlanFetchChartingWrapper