import React, { useEffect, useRef, useState } from 'react'
import { defaultTimeFrames } from '../../../../../../../../Utilities/TimeFrames'
import { useGetStockDataUsingStartDateAndTimeFrameQuery, useGetStockDataUsingTimeFrameQuery } from '../../../../../../../../features/StockData/StockDataSliceApi'
import { calculateCompleteMorningMetrics, evaluateRvsWinRateBoost } from '../../../../../../../../Utilities/technicalIndicatorFunctions'
import { subBusinessDays } from 'date-fns'

function RsvWinRate({ plannedTicker })
{

    let ticker = plannedTicker?.tickerSymbol || plannedTicker.ticker
    let startDate = plannedTicker.plan?.relevantCandleDate || subBusinessDays(new Date(), 20).toISOString()

    const { data, isSuccess, isLoading, isFetching, isError, error } = useGetStockDataUsingStartDateAndTimeFrameQuery({
        ticker,
        timeFrame: defaultTimeFrames.threeDayFiveMin, start: startDate.split('T')[0]
    })

    const { data: dailyData, isSuccess: isSuccessDaily, isLoading: isLoadingDaily, isError: isErrorDaily, error: errorDaily, refetch: refetchDaily }
        = useGetStockDataUsingTimeFrameQuery({ ticker, timeFrame: defaultTimeFrames.dailyHalfYear })

    let edgeReport
    let resultsContent

    let averageStretch
    let averageReboundPercentage
    const [trial, setTrial] = useState(0.04)
    if (isSuccess && isSuccessDaily)
    {
        edgeReport = evaluateRvsWinRateBoost(dailyData.candleData, data.candleData, -trial, 30)
        resultsContent = <div>
            <p>Baseline 2-Day Win Rate: {edgeReport.baselinePerformance.day2WinRatePercent}%</p>
            <p>Baseline 2-Day Percent Return: {edgeReport.baselinePerformance.day2AverageReturnPercent}%</p>
            <p>Low-RVS Filtered 2-Day Win Rate: {edgeReport.lowRvsFilteredPerformance.day2WinRatePercent}%</p>
            <p>🚀 EDGE BOOST ACHIEVED: {edgeReport.statisticalEdgeBoostPercent}% increase in accuracy!</p>
        </div>
    }
    const percentDropRef = useRef()

    return (
        <div>RsvWinRate
            {resultsContent}
            <p>Percent Drop: {(trial * 100).toFixed()}%</p>
            <input type="range" ref={percentDropRef} min={1} step={1} max={10} onChange={(e) => setTrial(parseFloat(e.target.value) / 100)} />
        </div>
    )
}

export default RsvWinRate