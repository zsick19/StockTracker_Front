import React, { useMemo } from 'react'
import { compileCumulativeChartData } from '../../Util/compileCumulativeVol'
import OpeningVolCompareChart from '../SubComponents/OpeningVolCompareChart'

function FirstHourReview({ plan })
{
    const openPrice = plan.currentPriceStats.prevDailyBar.ClosePrice
    const upDay = plan.mostRecentPrice > plan.currentPriceStats.prevDailyBar.ClosePrice

    const extentProb = plan.metricConfig.extentProb
    // const extremesBy5Min = plan.metricConfig.extremeProbByFiveMin
    const morningMetricsDown = plan.metricConfig.morningMetrics.downSide
    const morningMetricsUp = plan.metricConfig.morningMetrics.upSide
    const morningVolMetrics = plan.metricConfig.morningVolume
    // console.log(morningVolMetrics)

    const rallyPrice = openPrice * (1 + (morningMetricsUp.averageInitialRallyStretch / 100))
    const dropPrice = openPrice * (1 - (morningMetricsDown.averageInitialDropStretch / 100))

    const baseLineVolData = useMemo(() => compileCumulativeChartData(plan.todaysCandles, morningVolMetrics.fiveMinDownDay, morningVolMetrics.fiveMinUpDay), [plan.id])

    const todaysVol = useMemo(() =>
    {
        if (baseLineVolData.length === 0) return []
        // 3. BUILD TODAY'S LIVE RUNNING CUMULATIVE TIMELINE
        const cleanRthCandles = (plan.todaysCandles || []).filter(candle =>
        {
            const rawTimestamp = candle.Timestamp || candle.t || candle.timestamp;
            if (!rawTimestamp) return false;
            const timeStr = new Date(rawTimestamp).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour12: false });
            return timeStr >= "09:30:00" && timeStr <= "10:30:00";
        });

        // 4. MAP AND ALIGN CODES INTO 5-MINUTE TIME COORDINATE BLOCKS [INDEX]
        const chartCoordinatePayload = baseLineVolData.baseLineDown.map((historicalCumulativeSum, index) =>
        {
            const minutesElapsed = (index + 1) * 5;

            // Calculate timestamp label string (e.g., index 0 = 5 mins elapsed = "09:35")
            const targetHour = Math.floor((570 + minutesElapsed) / 60);
            const targetMinute = (570 + minutesElapsed) % 60;
            const timeLabel = `${targetHour}:${targetMinute < 10 ? '0' + targetMinute : targetMinute}`;

            // Accumulate today's live volume up to this exact 5-minute slice [INDEX]
            const candleSliceLimit = Math.min(cleanRthCandles.length, minutesElapsed);
            let liveCumulativeSum = 0;

            for (let j = 0; j < candleSliceLimit; j++)
            {
                liveCumulativeSum += (cleanRthCandles[j].Volume || cleanRthCandles[j].v || 0);
            }

            return {
                timeLabel,
                liveVolumeToday: cleanRthCandles.length >= minutesElapsed ? liveCumulativeSum : null
            };
        });
        return chartCoordinatePayload
    }, [baseLineVolData, plan.todaysCandles])

    return (
        <div id='ExpandedFirstHour'>
            <div>
                <div>
                    <p>Up Morning</p>
                    <div className='flex'>
                        <p>Peak: {morningMetricsUp.averageTimeToPeak.hour}:{morningMetricsUp.averageTimeToPeak.minute}</p>
                        <p>Initial Rally: {morningMetricsUp.averageInitialRallyStretch}%</p>
                        <p>Avg Vol To Peak: {morningVolMetrics.avgUpVolToHighTime}</p>
                    </div>
                    <p>{morningMetricsUp.pullbackBelowOpenProbability.toFixed()}% of the time expect {morningMetricsUp.averageSuccessfulPullbackSize}% reversal to</p>
                    <OpeningVolCompareChart baseLineVolData={baseLineVolData.baseLineUp} upOrDown={true} todaysVol={todaysVol} />
                </div>

                <br />

                <div>
                    <p>Down Morning</p>
                    <div className='flex'>
                        <p>Time: {morningMetricsDown.averageTimeToBottom.hour}:{morningMetricsDown.averageTimeToBottom.minute}</p>
                        <p>Initial Drop: {morningMetricsDown.averageInitialDropStretch}%</p>
                        <p>Avg Vol To Drop: {morningVolMetrics.avgDownVolToLowTime}</p>
                    </div>
                    <p>{morningMetricsDown.reboundProbability.toFixed()}% of the time expect {morningMetricsDown.averageSuccessfulReboundExpansion}% rebound</p>
                    <OpeningVolCompareChart baseLineVolData={baseLineVolData.baseLineDown} upOrDown={false} todaysVol={todaysVol} />
                </div>
            </div>

            <div>
                <p>Open Price: {openPrice} vs Current Price:{plan.mostRecentPrice}</p>
                <p>Status:{upDay ? 'Up' : 'Down'}</p>
                <br />
                <div className='flex'>
                    <p>Initial Rally: ${rallyPrice.toFixed(2)}</p>
                    <p>Inital Drop: ${dropPrice.toFixed(2)}</p>
                </div>
                <br />
                <p>High of Day Reached In First Hour: {extentProb.openH}%</p>
                <p>Low of Day Reached In First Hour: {extentProb.openL}%</p>
                <br />
                <p>Running Vol Total: {todaysVol.at(-1).liveVolumeToday}</p>
                <p>Vol In First Hour (up): {morningVolMetrics.avgUpTotalVolToFirstHour}</p>
                <p>Vol In First Hour (down):{morningVolMetrics.avgDownTotalVolToFirstHour}</p>

            </div>

        </div>
    )
}

export default FirstHourReview