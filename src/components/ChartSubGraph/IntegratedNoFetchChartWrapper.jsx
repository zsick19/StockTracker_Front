import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { clearGraphControl, setInitialGraphControl } from '../../features/Charting/GraphHoverZoomElement'
import { clearGraphStudyControl, setInitialGraphStudyControl } from '../../features/Charting/GraphStudiesVisualElement'
import { clearGraphHoursControl, setInitialGraphHoursControl } from '../../features/Charting/GraphMarketHourElement'
import { clearGraphVisibility, setInitialGraphVisibility } from '../../features/Charting/ChartingVisibility'
import { clearGraphToSubGraphCrossHair, setInitialGraphToSubGraphCrossHair } from '../../features/Charting/GraphToSubGraphCrossHairElement'
import ChartGraph from './ChartGraph'

function IntegratedNoFetchChartWrapper({ ticker, candleData, uuid, mostRecentPrice, timeFrame })
{
    console.log(uuid)
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
            <ChartGraph ticker={ticker}
                candleData={candleData}
                uuid={uuid}
                mostRecentPrice={mostRecentPrice}

                isInteractive={false}
                isZoomAble={true}
                isLivePrice={true}

                timeFrame={timeFrame}

                // chartId={chartId}
                // lastCandleData={lastCandleData}
                showEMAs={false}
            // EMNumbers={EMNumbers}
            // dailyCalculatedValues={dailyCalculatedValues}
            // morningMetrics={morningMetrics}
            // tradingPlanPrices={tradingPlanPrices}
            // liveActionTimeFrame={liveActionTimeFrame}

            />
        </div>)
}

export default IntegratedNoFetchChartWrapper