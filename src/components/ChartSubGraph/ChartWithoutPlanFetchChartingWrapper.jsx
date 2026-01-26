import React, { useEffect } from 'react'
import ChartGraph from './ChartGraph'
import { useDispatch } from 'react-redux'
import { setEnterExitChartingFromPlan } from '../../features/EnterExitPlans/EnterExitGraphElement'

function ChartWithoutPlanFetchChartingWrapper({ ticker, candleData, interactionController, chartId, timeFrame,
    planData, mostRecentPrice, initialTracking })
{
    const dispatch = useDispatch()
    useEffect(() => { dispatch(setEnterExitChartingFromPlan({ tickerSymbol: ticker, plan: planData, planId: chartId })) }, [])

    return (
        <div className="ChartGraphWrapper">
            <ChartGraph ticker={ticker} chartId={chartId} candleData={candleData.candleData}
                mostRecentPrice={{ Price: mostRecentPrice }}
                timeFrame={timeFrame} nonLivePrice={interactionController?.nonLivePrice} nonInteractive={interactionController?.nonInteractive} nonZoomAble={interactionController?.nonZoomAble}
                initialTracking={initialTracking} />
        </div>)
}

export default ChartWithoutPlanFetchChartingWrapper