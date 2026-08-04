import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import * as short from 'short-uuid'
import { clearGraphControl, setInitialGraphControl } from '../../../features/Charting/GraphHoverZoomElement'
import TodaysMarketOnlyChart from './TodaysMarketOnlyChart'

function TodayOnlyChartWrapper({ ticker, candleData, mostRecentPrice, planData, snapShotInfo, zoneData, dailyEM, weeklyEM, isZoomAble })
{
    const dispatch = useDispatch()
    const uuid = useMemo(() => short.generate(), [])
    // zoneData={macroResult.planData.dailyZone}
    //                     dailyExpectedMove={macroResult.planData.dailyEM}
    //                     weeklyExpectedMove={macroResult.planData.weeklyEM}
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
        <TodaysMarketOnlyChart ticker={ticker} candleData={candleData} isZoomAble={isZoomAble} uuid={uuid}
            zoneData={zoneData} dailyEM={dailyEM} weeklyEM={weeklyEM} snapShotInfo={snapShotInfo}  isOnlyYZoomAble={true}/>
    )
}

export default TodayOnlyChartWrapper