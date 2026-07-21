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

    const dailyCalculatedValues = {
        PrevDailyBar: plan.snapShot.PrevDailyBar,
        TodayOpenPrice: plan.snapShot.DailyBar.OpenPrice,
        ATR: plan.planConfig.dailyCalculatedValues.atr
    }
    const morningMetrics = plan.metricConfig.morningMetrics




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