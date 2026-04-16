import React, { useEffect } from 'react'
import ChartGraph from './ChartGraph'
import { useDispatch } from 'react-redux'
import { setEnterExitChartingFromPlan } from '../../features/EnterExitPlans/EnterExitGraphElement'
import { clearGraphControl, setInitialGraphControl } from '../../features/Charting/GraphHoverZoomElement'
import { clearGraphStudyControl, setInitialGraphStudyControl } from '../../features/Charting/GraphStudiesVisualElement'
import { clearGraphHoursControl, setInitialGraphHoursControl } from '../../features/Charting/GraphMarketHourElement'
import { clearGraphToSubGraphCrossHair, setInitialGraphToSubGraphCrossHair } from '../../features/Charting/GraphToSubGraphCrossHairElement'
import { clearGraphVisibility, setInitialGraphVisibility } from '../../features/Charting/ChartingVisibility'

function ChartWithNoFetchWrapper({ ticker, candleData, interactionController, chartId, timeFrame, mostRecentPrice, EMNumbers, uuid, lastCandleData })
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

    return (
        <div className="ChartGraphWrapper">
            <ChartGraph ticker={ticker} chartId={chartId} candleData={candleData.candleData}
                mostRecentPrice={{ Price: mostRecentPrice }}
                timeFrame={timeFrame} lastCandleData={lastCandleData}
                isLivePrice={interactionController?.isLivePrice}
                isInteractive={interactionController?.isInteractive}
                isZoomAble={interactionController.isZoomAble}
                uuid={uuid}
                EMNumbers={EMNumbers}
            />
        </div>)
}

export default ChartWithNoFetchWrapper