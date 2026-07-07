import React, { useMemo } from 'react'
import { compileCumulativeChartData } from '../../Util/compileCumulativeVol'
import OpeningVolCompareChart from '../SubComponents/OpeningVolCompareChart'
import { VolumeVelocityOscillator } from '../SubComponents/VolumeVelocityOscillator'
import { addMinutes, isAfter, isBefore, isWeekend, previousFriday, previousThursday, set } from 'date-fns'
import { VolumeAccelerationChart } from '../SubComponents/VolumeAccelerationOscillator'

function FirstHourReview({ plan })
{
    const yesterdayClose = plan.currentPriceStats.prevDailyBar.ClosePrice
    const upDay = plan.mostRecentPrice > plan.currentPriceStats.prevDailyBar.ClosePrice

    const extentProb = plan.metricConfig.extentProb
    const morningMetricsDown = plan.metricConfig.morningMetrics.downSide
    const morningMetricsUp = plan.metricConfig.morningMetrics.upSide
    const morningVolMetrics = plan.metricConfig.morningVolume
    const openCross = plan.metricConfig.openCross

    const rallyPrice = yesterdayClose * (1 + (morningMetricsUp.averageInitialRallyStretch / 100))
    const dropPrice = yesterdayClose * (1 - (morningMetricsDown.averageInitialDropStretch / 100))

    let marketOpen = new Date()
    let firstHour = new Date()
    if (isWeekend(marketOpen))
    {
        marketOpen = previousFriday(new Date())
        firstHour = previousFriday(new Date())
    }
    marketOpen.setHours(9, 30, 0, 0)
    firstHour.setHours(10, 31, 0, 0)


    const baseLineVolData = useMemo(() => compileCumulativeChartData(morningVolMetrics.fiveMinDownDay, morningVolMetrics.fiveMinUpDay), [plan.id])
    const openHourCandles = useMemo(() =>
    {
        if (plan.todaysCandles.length === 0) return []
        return plan.todaysCandles.filter(candle => { if (isAfter(candle.Timestamp, marketOpen.toISOString()) && isBefore(candle.Timestamp, firstHour)) return candle });
    }, [plan.todaysCandles])

    const todaysVolOverFiveMinInc = useMemo(() =>
    {
        if (baseLineVolData.length === 0 || plan.todaysCandles.length === 0) return []
        const openHourCandlesLength = openHourCandles.length

        // 4. MAP AND ALIGN CODES INTO 5-MINUTE TIME COORDINATE BLOCKS [INDEX]
        return baseLineVolData.baseLineDown.map((t, index) =>
        {
            const minutesElapsed = (index + 1) * 5;
            const forwardInTime = addMinutes(marketOpen, minutesElapsed)
            let liveCumulativeSum = 0;

            for (const candle of openHourCandles)
            {
                if (isAfter(candle.Timestamp, forwardInTime)) break;
                liveCumulativeSum += candle.Volume
            }
            return liveCumulativeSum
        });

    }, [baseLineVolData, openHourCandles])

    const peakTime = set(new Date(), { hours: morningMetricsUp.averageTimeToPeak.hour, minutes: morningMetricsUp.averageTimeToPeak.minute })
    const bottomTime = set(new Date(), { hours: morningMetricsDown.averageTimeToBottom.hour, minutes: morningMetricsDown.averageTimeToBottom.minute })

    const todaysVolToPeakBottomTime = useMemo(() =>
    {
        if (!openHourCandles || openHourCandles.length == 0) return 0
        let volumeToPeak = 0
        let volumeToBottom = 0
        for (const t of openHourCandles)
        {
            if (isAfter(t.Timestamp, peakTime) && isAfter(t.Timestamp, bottomTime)) break;
            if (isBefore(t.Timestamp, peakTime)) volumeToPeak += t.Volume
            if (isBefore(t.Timestamp, bottomTime)) volumeToBottom += t.Volume
        }
        return {
            todaysVolumeToPeakTime: volumeToPeak / morningVolMetrics.avgUpVolToHighTime * 100,
            todaysVolumeToBottomTime: volumeToBottom / morningVolMetrics.avgDownVolToLowTime * 100
        }
    }, [openHourCandles])



    return (
        <div id='ExpandedFirstHour'>
            <div id='FirstHourHistoricalCompare'>
                <div className={upDay ? 'focusFirstHour' : 'offFocusFirstHour'}>
                    <div className='flex'>
                        <p>Peak: {morningMetricsUp.averageTimeToPeak.hour}:{morningMetricsUp.averageTimeToPeak.minute}</p>
                        <p>Initial Rally: {morningMetricsUp.averageInitialRallyStretch}%</p>
                        <p>{morningMetricsUp.pullbackBelowOpenProbability.toFixed()}% of the time expect {morningMetricsUp.averageSuccessfulPullbackSize}% reversal to</p>
                    </div>
                    <OpeningVolCompareChart baseLineVolData={baseLineVolData.baseLineUp} upOrDown={true} isMorningUp={upDay}
                        todaysVol={todaysVolOverFiveMinInc} peakOrBottomTime={morningMetricsUp.averageTimeToPeak}
                        volToPeak={morningVolMetrics.avgUpVolToHighTime} />
                </div>

                {upDay ?
                    <div className='flex'>
                        <p>{todaysVolToPeakBottomTime.todaysVolumeToPeakTime.toFixed()}% of Avg Vol To Peak</p>
                        <p>{todaysVolToPeakBottomTime.todaysVolumeToPeakTime > 100 ? 'Extremely Strong Upward Pressure' :
                            todaysVolToPeakBottomTime.todaysVolumeToPeakTime > 75 ? "Strong Upward Pressure" :
                                'Weak Upward Pressure, Possible Reversal'}</p>
                    </div> :
                    <div className='flex'>
                        <p>{todaysVolToPeakBottomTime.todaysVolumeToBottomTime.toFixed()}% of Avg Vol To Bottom</p>
                        <p>{todaysVolToPeakBottomTime.todaysVolumeToBottomTime > 100 ? 'Extremely Strong Selling Pressure' :
                            todaysVolToPeakBottomTime.todaysVolumeToBottomTime > 75 ? "Strong Selling Pressure" :
                                'Weak Selling Pressure, Possible Reversal'}</p>
                    </div>
                }

                <div className={!upDay ? 'focusFirstHour' : 'offFocusFirstHour'}>
                    <OpeningVolCompareChart baseLineVolData={baseLineVolData.baseLineDown} upOrDown={false}
                        todaysVol={todaysVolOverFiveMinInc} peakOrBottomTime={morningMetricsDown.averageTimeToBottom}
                        volToPeak={morningVolMetrics.avgDownVolToLowTime} isMorningUp={upDay} />
                    <div className='flex'>
                        <p>Avg Bottom Time: {morningMetricsDown.averageTimeToBottom.hour}:{morningMetricsDown.averageTimeToBottom.minute}</p>
                        <p>Initial Drop: {morningMetricsDown.averageInitialDropStretch}%</p>
                        <p>{morningMetricsDown.reboundProbability.toFixed()}% of the time expect {morningMetricsDown.averageSuccessfulReboundExpansion}% rebound</p>
                    </div>
                </div>
            </div>

            <div id='FirstHourLive'>
                <div>
                    open Cross details
                    <p>Yesterday Close: ${yesterdayClose}</p>
                    <br />
                    <p>Today's Open Cross: ${openCross.todaysOpenCross.officialAuctionCrossPrice}</p>
                    <p>Yesterday's Open Cross: ${openCross.previousOpenCross.at(-1).officialAuctionCrossPrice}</p>

                </div>
                <div className='flex'>
                    <VolumeVelocityOscillator todaysCandles={openHourCandles} />
                    <VolumeAccelerationChart todaysCandles={openHourCandles}
                        upTimeToPeak={morningMetricsUp.averageTimeToPeak}
                        downTimeToBottom={morningMetricsDown.averageTimeToBottom} />
                </div>
            </div>

        </div>
    )
}

export default FirstHourReview