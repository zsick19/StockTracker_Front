import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import * as short from 'short-uuid'
import { clearGraphControl, setInitialGraphControl } from '../../../features/Charting/GraphHoverZoomElement'
import TodaysMarketOnlyChart from './TodaysMarketOnlyChart'

function TodayOnlyChartWrapper({ ticker, candleData, mostRecentPrice, planData, snapShotInfo, morningMetrics, dailyCalculatedValues, zoneData, dailyEM, weeklyEM, isZoomAble, isOnlyYZoomAble })
{
    const dispatch = useDispatch()
    const uuid = useMemo(() => short.generate(), [])

    const [chartZoomState, setChartZoomState] = useState({ x: undefined, y: undefined })

    useEffect(() =>
    {
        if (uuid)
        {

            dispatch(setInitialGraphControl({ uuid }))

            // dispatch(setInitialGraphToSubGraphCrossHair({ uuid }))
            // dispatch(setInitialGraphHoursControlForIntraDay({ uuid }))
            // dispatch(setInitialGraphVisibility({ uuid }))
        }

        return (() =>
        {
            if (uuid)
            {
                dispatch(clearGraphControl({ uuid }))
                // dispatch(clearGraphToSubGraphCrossHair({ uuid }))
                // dispatch(clearGraphHoursControl({ uuid }))
                // dispatch(clearGraphVisibility({ uuid }))
            }
        })
    }, [])
    // function TodaysMarketOnlyChart({ ticker,  timeFrame, chartStartDate, pricePoints, uuid, isZoomAble, currentDiscount, discountPrices, exitAlertPrice })
    return (
        <TodaysMarketOnlyChart ticker={ticker} candleData={candleData} isZoomAble={isZoomAble} uuid={uuid} morningMetrics={morningMetrics} dailyCalculatedValues={dailyCalculatedValues}
            zoneData={zoneData} dailyEM={dailyEM} weeklyEM={weeklyEM} snapShotInfo={snapShotInfo} isOnlyYZoomAble={isOnlyYZoomAble || true} />
    )
}

export default TodayOnlyChartWrapper