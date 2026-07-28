import React, { useMemo } from 'react'
import { compileCumulativeChartData } from '../../Util/compileCumulativeVol'
import OpeningVolCompareChart from '../SubComponents/OpeningVolCompareChart'
import { VolumeVelocityOscillator } from '../SubComponents/VolumeVelocityOscillator'
import { addMinutes, eachMinuteOfInterval, isAfter, isBefore, isWeekend, previousFriday, previousThursday, set } from 'date-fns'
import { VolumeAccelerationChart } from '../SubComponents/VolumeAccelerationOscillator'
import { shallowEqual, useSelector } from 'react-redux'
import { makeSelectPlansFirstHourCandlesByTicker, selectDetailedScoreBreakDownBySymbol, selectTodaysCandlesByTicker } from '../../../../../../../../features/Engine/EnginePlanApiSlice'
import { VolumetricClimaxSentryBadge } from '../SubComponents/VolumetricClimaxSentryBadge'

function FirstHourReview({ plan })
{
    const yesterdayClose = plan.snapShot.PrevDailyBar.ClosePrice
    const extentProb = plan.metricConfig.extentProb
    const morningMetricsDown = plan.metricConfig.morningMetrics.downSide
    const morningMetricsUp = plan.metricConfig.morningMetrics.upSide
    const openCross = plan.metricConfig.openCross
    const morningVolMetrics = plan.metricConfig.morningVolume
    const extremesBy5Min = plan.metricConfig.extremeProbByFiveMin

    let chanceOfLowAfter = 0
    let chanceOfHighAfter = 0
    for (let index = 12; index < extremesBy5Min.length; index++)
    {
        if (extremesBy5Min[index].lowProb !== 0 && chanceOfLowAfter === 0) chanceOfLowAfter = index
        if (extremesBy5Min[index].highProb !== 0 && chanceOfHighAfter === 0) chanceOfHighAfter = index
    }
    const timeAfterForLow = addMinutes(set(new Date(), { hours: 9, minutes: 30 }), (chanceOfLowAfter * 5))
    const timeAfterForHigh = addMinutes(set(new Date(), { hours: 9, minutes: 30 }), (chanceOfHighAfter * 5))




    const baseLineVolData = useMemo(() => compileCumulativeChartData(morningVolMetrics.fiveMinUpDay, morningVolMetrics.fiveMinDownDay), [plan.id])

    const selectFirstHourValveInstance = useMemo(makeSelectPlansFirstHourCandlesByTicker, []);
    const firstHourCandles = useSelector((state) => selectFirstHourValveInstance(state, plan.id), shallowEqual)

    const openHourCandles = firstHourCandles.candles
    console.log(openHourCandles)

    const isUpMorning = firstHourCandles?.candles[0]?.OpenPrice ? firstHourCandles.mostRecentPrice ? firstHourCandles.mostRecentPrice > firstHourCandles?.candles[0].OpenPrice :
        firstHourCandles?.candles[0]?.OpenPrice ? firstHourCandles.mostRecentCandle.ClosePrice > firstHourCandles?.candles[0].OpenPrice : true : false


    const peakMetrics = firstHourCandles.peakMetrics
    const peakTime = firstHourCandles.peakMetrics.peakTime
    const rallyPrice = yesterdayClose * (1 + (morningMetricsUp.averageInitialRallyStretch / 100))
    const todaysVolumeToPeakTime = peakMetrics.volumeToPeak / morningVolMetrics.avgUpVolToHighTime * 100
    const currentHighReboundPrice = firstHourCandles.peakMetrics.high - (firstHourCandles.peakMetrics.high * morningMetricsUp.averageSuccessfulPullbackSize / 100)


    const bottomMetrics = firstHourCandles.bottomMetrics
    const bottomTime = firstHourCandles.bottomMetrics.bottomTime
    const dropPrice = yesterdayClose * (1 - (morningMetricsDown.averageInitialDropStretch / 100))
    const currentLowReboundPrice = firstHourCandles.bottomMetrics.low + (firstHourCandles.bottomMetrics.low * morningMetricsDown.averageSuccessfulReboundExpansion / 100)
    const todaysVolumeToBottomTime = bottomMetrics.volumeToBottom / morningVolMetrics.avgDownVolToLowTime * 100


    const todaysCurrentVolFirstHour = firstHourCandles.metrics.volume
    const todaysVolFirstHourUpRatio = todaysCurrentVolFirstHour / morningVolMetrics.avgUpTotalVolToFirstHour * 100
    const todaysVolFirstHourDownRatio = todaysCurrentVolFirstHour / morningVolMetrics.avgDownTotalVolToFirstHour * 100

    const isPriceHigherThanAvgPeak = firstHourCandles.mostRecentCandle.ClosePrice ? firstHourCandles.mostRecentCandle.ClosePrice > rallyPrice : false
    const isPriceLowerThanAvgBottom = firstHourCandles.mostRecentCandle.ClosePrice ? firstHourCandles.mostRecentCandle.ClosePrice < dropPrice : false
    const isPriceOutsideOfAverage = isPriceHigherThanAvgPeak || isPriceLowerThanAvgBottom


    const todaysVolOverFiveMinInc = useMemo(() =>
    {
        if (baseLineVolData.length === 0 || openHourCandles.length === 0) return []
        const openHourCandlesLength = openHourCandles.length

        const marketOpen = isWeekend(new Date()) ? previousFriday(set(new Date(), { hours: 9, minutes: 30 })) : set(new Date(), { hours: 9, minutes: 30 })
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

    const ticksFirstHour = eachMinuteOfInterval({ start: set(new Date(), { hours: 9, minutes: 30, milliseconds: 0 }), end: set(new Date(), { hours: 10, minutes: 30, milliseconds: 30 }) }).map(t =>
    {
        return t.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit', hour12: false })
    })

    return (
        <div id='ExpandedFirstHour'>
            <div id='FirstHourHistoricalCompare'>
                {isUpMorning ?
                    <div className={isUpMorning ? 'UpOrDownVisualPositive volAccumulation' : 'UpOrDownVisualNegative volAccumulation'}>
                        <h3>First Hour Volume Accumulation</h3>
                        <div className='flex'>
                            <div>
                                <p>{todaysVolumeToPeakTime.toFixed()}%</p>
                                <p>Peak Time</p>
                            </div>
                            <div>
                                <p>{todaysVolFirstHourUpRatio.toFixed()}%</p>
                                <p>First Hour</p>
                            </div>
                        </div>
                    </div> :
                    <div className={isUpMorning ? 'UpOrDownVisualPositive volAccumulation' : 'UpOrDownVisualNegative volAccumulation'}>
                        <h3>First Hour Volume Accumulation</h3>
                        <div className='flex'>
                            <div>
                                <p>{todaysVolumeToBottomTime.toFixed()}%</p>
                                <p>Bottom Time</p>
                            </div>
                            <div>
                                <p>{todaysVolFirstHourDownRatio.toFixed()}%</p>
                                <p>First Hour</p>
                            </div>
                        </div>
                    </div>
                }

                <div className={isUpMorning ? 'focusFirstHourPositive' : 'offFocusFirstHour'}>
                    <OpeningVolCompareChart baseLineVolData={baseLineVolData.baseLineUp} upOrDown={true} isMorningUp={isUpMorning}
                        todaysVol={todaysVolOverFiveMinInc} peakOrBottomTime={morningMetricsUp.averageTimeToPeak}
                        volToPeak={morningVolMetrics.avgUpVolToHighTime} />
                    <div className='flex'>
                        <p>Peak Time: {morningMetricsUp.averageTimeToPeak.hour}:{morningMetricsUp.averageTimeToPeak.minute}</p>
                        <p>Avg Rally: {morningMetricsUp.averageInitialRallyStretch}% </p>
                    </div>
                </div>

                <div className={!isUpMorning ? 'focusFirstHourNegative' : 'offFocusFirstHour'}>
                    <OpeningVolCompareChart baseLineVolData={baseLineVolData.baseLineDown} upOrDown={false}
                        todaysVol={todaysVolOverFiveMinInc} peakOrBottomTime={morningMetricsDown.averageTimeToBottom}
                        volToPeak={morningVolMetrics.avgDownVolToLowTime} isMorningUp={isUpMorning} />
                    <div className='flex'>
                        <p>Bottom Time: {morningMetricsDown.averageTimeToBottom.hour}:{morningMetricsDown.averageTimeToBottom.minute}</p>
                        <p>Avg Drop: {morningMetricsDown.averageInitialDropStretch}% </p>
                    </div>
                </div>
            </div>

            <div id='FirstHourLive'>
                <div id='FirstHourLiveAction'>

                    {isPriceOutsideOfAverage ?

                        <div className='PriceOutSideOfFirstHourRange'>
                            <div>
                                <p>🚨 PRICE OUTSIDE OF MORNING RANGE 🚨</p>
                                <p>Do not expect normal reversals.</p>
                            </div>

                            <div>
                                {isUpMorning ? (
                                    <div>
                                        <strong>VELOCITY EXPANSION BREAKOUT:</strong> Price has shattered your historical opening rally cap on heavy volume ahead of schedule.
                                        <p>A temporary overhead liquidity vacuum is active; expect an continued extension.</p>
                                        <p>Time for likely daily high: {timeAfterForHigh.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit', hour12: false })}   </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p><strong>DOWNWARD LIQUIDATION:</strong> Price has broken beneath historical morning downside markers.</p>
                                        <p>Time for likely daily low: {timeAfterForLow.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit', hour12: false })}   </p>
                                        <p>Assert lowest relevant price stabilization levels before considering.</p>
                                        <p>ATR, Deep Volume Nodes, Daily EMA Lines</p>
                                    </div>
                                )}
                            </div>
                        </div> :

                        <div className='PriceWithinFirsHourRange'>
                            {isUpMorning ?
                                <div>
                                    <div>
                                        <span>🚀 UP-MORNING WITHIN TARGETS</span>
                                    </div>
                                    <div className='flex'>
                                        <div>Morning High: <strong>${firstHourCandles.peakMetrics.high}</strong></div>
                                        <div>Expected Peak: <strong>${rallyPrice.toFixed(2)}</strong></div>
                                        <div>Expected Peak Time: <strong>{morningMetricsUp.averageTimeToPeak.hour}:{morningMetricsUp.averageTimeToPeak.minute} AM EST</strong></div>
                                    </div>
                                    <br />
                                    <div className='flex'>
                                        <div>Reversal Probability: <strong>{morningMetricsUp.pullbackBelowOpenProbability.toFixed()}%</strong></div>
                                        <div>Expected Reversal: -{morningMetricsUp.averageSuccessfulPullbackSize}% </div>
                                        <div>Price: <strong>${currentHighReboundPrice.toFixed(2)}</strong></div>
                                    </div>
                                    <br />

                                    <div style={{ fontSize: '12px' }}>
                                        <strong>STRATEGY SUMMARY:</strong> Prepare to take profits as the market clock approaches the <strong>{morningMetricsUp.averageTimeToPeak.hour}:{morningMetricsUp.averageTimeToPeak.minute} AM</strong> apex threshold, where institutional upside buying power historically exhausts.
                                    </div>
                                </div>
                                :
                                <div>
                                    <div>📥 DOWN-MORNING WITHIN TARGETS</div>
                                    <div className='flex'>
                                        <p>Morning Low: ${bottomMetrics.low}</p>
                                        <div>Expected Bottom: <strong>${dropPrice.toFixed(2)}</strong></div>
                                        <div>Expected Bottom Time: <strong>{morningMetricsDown.averageTimeToBottom.hour}:{morningMetricsDown.averageTimeToBottom.minute} AM EST</strong></div>
                                    </div>
                                    <br />
                                    <div className='flex'>
                                        <div>Reversal Probability: <strong>{morningMetricsDown.reboundProbability.toFixed()}%</strong></div>
                                        <p>Expected Reversal: +{morningMetricsDown.averageSuccessfulReboundExpansion}%</p>
                                        <p>Price: ${currentLowReboundPrice.toFixed(2)}</p>
                                    </div>
                                    <br />
                                    <div style={{ fontSize: '12px' }}>
                                        <strong>STRATEGY SUMMARY:</strong> Price is staging a standard down-morning flush into accumulation corridor.
                                        Look for streaming 1-minute volume climax spikes past your 3.5x baseline near the
                                        <strong> AM</strong> clock gate. This marks your high-conviction asymmetric reversal entry window
                                    </div>
                                </div>
                            }

                        </div>
                    }


                    {/* <VolumetricClimaxSentryBadge plan={plan} accumulatedVolumeUp={todaysVolumeToPeakTime} isUpMorning={isUpMorning}
                        accumulatedVolumeDown={todaysVolumeToBottomTime} currentPrice={firstHourCandles.mostRecentPrice} />
                     */}


                    <div className='FirstHourLiveStats' style={{ fontSize: '12px' }}>
                        {openCross &&
                            <p>Today's Open Cross: ${openCross?.todaysOpenCross?.officialAuctionCrossPrice || 0} vs Yesterday: ${openCross?.previousOpenCross?.at(-1)?.officialAuctionCrossPrice || 0}</p>
                        }
                        <p>Yesterday {new Date(plan?.snapShot?.PrevDailyBar.Timestamp).toDateString()} Close: ${yesterdayClose} </p>
                        <p>Opening Range: ${dropPrice.toFixed(2)} to ${rallyPrice.toFixed(2)}</p>
                    </div>

                </div>

                <div id='FirstHourVelAclCharts'>
                    <VolumeVelocityOscillator todaysCandles={openHourCandles} ticksFirstHour={ticksFirstHour} />
                    <VolumeAccelerationChart todaysCandles={openHourCandles}
                        upTimeToPeak={morningMetricsUp.averageTimeToPeak}
                        downTimeToBottom={morningMetricsDown.averageTimeToBottom} ticksFirstHour={ticksFirstHour} />
                </div>

            </div>
        </div >
    )
}

export default FirstHourReview