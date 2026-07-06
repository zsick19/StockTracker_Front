import React, { useMemo } from 'react'
import { compileCumulativeChartData } from '../../Util/compileCumulativeVol'
import OpeningVolCompareChart from '../SubComponents/OpeningVolCompareChart'
import { VolumeVelocityOscillator } from '../SubComponents/VolumeVelocityOscillator'
import { isAfter, isBefore, isWeekend, previousFriday, previousThursday } from 'date-fns'
import { VolumeAccelerationChart } from '../SubComponents/VolumeAccelerationOscillator'

function FirstHourReview({ plan })
{
    const openPrice = plan.currentPriceStats.prevDailyBar.ClosePrice
    const upDay = plan.mostRecentPrice > plan.currentPriceStats.prevDailyBar.ClosePrice

    const extentProb = plan.metricConfig.extentProb
    // const extremesBy5Min = plan.metricConfig.extremeProbByFiveMin
    const morningMetricsDown = plan.metricConfig.morningMetrics.downSide
    const morningMetricsUp = plan.metricConfig.morningMetrics.upSide
    const morningVolMetrics = plan.metricConfig.morningVolume

    const rallyPrice = openPrice * (1 + (morningMetricsUp.averageInitialRallyStretch / 100))
    const dropPrice = openPrice * (1 - (morningMetricsDown.averageInitialDropStretch / 100))

    let marketOpen = new Date()
    let firstHour = new Date()
    if (isWeekend(marketOpen))
    {
        marketOpen = previousFriday(new Date())
        firstHour = previousFriday(new Date())
    }
    marketOpen.setHours(9, 30, 0, 0)
    firstHour.setHours(10, 30, 0, 0)


    const baseLineVolData = useMemo(() => compileCumulativeChartData(morningVolMetrics.fiveMinDownDay, morningVolMetrics.fiveMinUpDay), [plan.id])
    const openHourCandles = useMemo(() =>
    {
        if (plan.todaysCandles.length === 0) return []
        return plan.todaysCandles.filter(candle => { if (isAfter(candle.Timestamp, marketOpen.toISOString()) && isBefore(candle.Timestamp, firstHour)) return candle });        
    }, [plan.todaysCandles])

    const todaysVolOverFiveMinInc = useMemo(() =>
    {
        if (baseLineVolData.length === 0 || plan.todaysCandles.length === 0) return []

        // 4. MAP AND ALIGN CODES INTO 5-MINUTE TIME COORDINATE BLOCKS [INDEX]
        const chartCoordinatePayload = baseLineVolData.baseLineDown.map((t, index) =>
        {
            const minutesElapsed = (index + 1) * 5;
            // Accumulate today's live volume up to this exact 5-minute slice [INDEX]
            const candleSliceLimit = Math.min(openHourCandles.length, minutesElapsed);
            let liveCumulativeSum = 0;
            for (let j = 0; j < candleSliceLimit; j++) { liveCumulativeSum += (openHourCandles[j].Volume || openHourCandles[j].v || 0); }
            return openHourCandles.length >= minutesElapsed ? liveCumulativeSum : 0
        });
        return chartCoordinatePayload
    }, [baseLineVolData, openHourCandles])

    return (
        <div id='ExpandedFirstHour'>
            <div>
                <div>
                    <div className='flex'>
                        <p>Peak: {morningMetricsUp.averageTimeToPeak.hour}:{morningMetricsUp.averageTimeToPeak.minute}</p>
                        <p>Initial Rally: {morningMetricsUp.averageInitialRallyStretch}%</p>
                        <p>Avg Vol To Peak: {morningVolMetrics.avgUpVolToHighTime}</p>
                    </div>
                    <p>{morningMetricsUp.pullbackBelowOpenProbability.toFixed()}% of the time expect {morningMetricsUp.averageSuccessfulPullbackSize}% reversal to</p>
                    <OpeningVolCompareChart baseLineVolData={baseLineVolData.baseLineUp} upOrDown={true} todaysVol={todaysVolOverFiveMinInc} />
                </div>

                <br />

                <div>
                    <div className='flex'>
                        <p>Time: {morningMetricsDown.averageTimeToBottom.hour}:{morningMetricsDown.averageTimeToBottom.minute}</p>
                        <p>Initial Drop: {morningMetricsDown.averageInitialDropStretch}%</p>
                        <p>Avg Vol To Drop: {morningVolMetrics.avgDownVolToLowTime}</p>
                    </div>
                    <p>{morningMetricsDown.reboundProbability.toFixed()}% of the time expect {morningMetricsDown.averageSuccessfulReboundExpansion}% rebound</p>
                    <OpeningVolCompareChart baseLineVolData={baseLineVolData.baseLineDown} upOrDown={false} todaysVol={todaysVolOverFiveMinInc} />
                </div>
            </div>

            <div>
                <VolumeVelocityOscillator todaysCandles={openHourCandles} />
                <br />
                <VolumeAccelerationChart todaysCandles={openHourCandles} upTimeToPeak={morningMetricsUp.averageTimeToPeak} downTimeToBottom={morningMetricsDown.averageTimeToBottom}
                />
                {/* <p>Open Price: {openPrice} vs Current Price:{plan.mostRecentPrice}</p>
                <p>Status:{upDay ? 'Up' : 'Down'}</p>
                <br />
                <div className='flex'>
                    <p>Initial Rally: ${rallyPrice.toFixed(2)}</p>
                    <p>Inital Drop: ${dropPrice.toFixed(2)}</p>
                </div>
                <p>High of Day Reached In First Hour: {extentProb.openH}%</p>
                <p>Low of Day Reached In First Hour: {extentProb.openL}%</p>
                <p>Running Vol Total: {todaysVolOverFiveMinInc.at(-1)}</p>
                <p>Vol In First Hour (up): {morningVolMetrics.avgUpTotalVolToFirstHour}</p>
                <p>Vol In First Hour (down):{morningVolMetrics.avgDownTotalVolToFirstHour}</p> */}
            </div>

        </div>
    )
}

export default FirstHourReview