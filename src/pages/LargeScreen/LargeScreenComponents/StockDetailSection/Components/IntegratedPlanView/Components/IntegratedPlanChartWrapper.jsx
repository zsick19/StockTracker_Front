import React, { useEffect, useMemo, useState } from 'react'
import * as short from 'short-uuid'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'
import IntegratedNoFetchChartWrapper from '../../../../../../../components/ChartSubGraph/IntegratedNoFetchChartWrapper'
import { useDispatch, useSelector } from 'react-redux'
import { setFocusStartFinishDate } from '../../../../../../../features/Charting/GraphMarketHourElement'
import { selectCombinedCandlesByTicker } from '../../../../../../../features/Engine/EnginePlanApiSlice'

function IntegratedPlanChartWrapper({ plan, timeFrameView })
{
    if (!plan) return
    const dispatch = useDispatch()
    const candleData = useSelector((state) => selectCombinedCandlesByTicker(state, plan.id))

    const threeDayHistoricalOrTenDay = plan?.patternConfig.maintainLiveCandles || false
    const uuid = useMemo(() => short.generate(), [])
    const [scaleForTimeFrame, setScaleForTimeFrame] = useState()
    // const [candleDataForTimeFrame, setCandleDataForTimeFrame] = useState(candleData || [])

    const dailyCalculatedValues = {
        PrevDailyBar: plan.snapShot.PrevDailyBar,
        TodayOpenPrice: plan.snapShot.DailyBar.OpenPrice,
        ATR: plan.planConfig.dailyCalculatedValues.atr

    }
    const morningMetrics = plan.metricConfig.morningMetrics



    // useEffect(() =>
    // {
    //     // switch (timeFrameView)
    //     // {
    //     //     case 0:
    //     //         setCandleDataForTimeFrame(plan.todaysCandles)
    //     //         //today opening hour

    //     //         //add one day 5 min timeframe
    //     //         setScaleForTimeFrame({ start: 3, end: 4 });
    //     //         //    dispatch(setFocusStartFinishDate({ uuid: uuid, focusDates: 'firstHour' }))
    //     //         break;

    //     //     case 1:
    //     //         //add one day 5 min timeframe
    //     //         setCandleDataForTimeFrame(plan.todaysCandles)
    //     //         // dispatch(setFocusStartFinishDate({ uuid: uuid, focusDates: 'MP1H' }))
    //     //         setScaleForTimeFrame({ start: 3, end: 4 });
    //     //         break;

    //     //     case 2:
    //     //         setCandleDataForTimeFrame(plan.combinedCandleData)

    //     //         // if (threeDayHistoricalOrTenDay) dispatch(setFocusStartFinishDate({ uuid: uuid, focusDates: 'H3D' }))
    //     //         // else dispatch(setFocusStartFinishDate({ uuid: uuid, focusDates: 'H10D' }))
    //     //         // break;
    //     //         break;
    //     // }
    //     setCandleDataForTimeFrame(candleData)
    // }, [timeFrameView, plan.id, candleData])

    return (
        <>

            <IntegratedNoFetchChartWrapper
                ticker={plan.id} candleData={candleData}
                uuid={uuid} mostRecentPrice={plan.mostRecentPrice}
                timeFrame={defaultTimeFrames.oneDayOneMin}
                dailyCalculatedValues={dailyCalculatedValues}
                morningMetrics={morningMetrics}
            />
        </>
    )
}

export default IntegratedPlanChartWrapper