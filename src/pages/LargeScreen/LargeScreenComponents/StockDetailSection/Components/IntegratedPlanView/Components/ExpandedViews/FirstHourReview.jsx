import React from 'react'

function FirstHourReview({ plan })
{
    const openPrice = plan.currentPriceStats.dailyBar.OpenPrice
    const upDay = plan.mostRecentPrice > plan.currentPriceStats.dailyBar.OpenPrice

    const extentProb = plan.metricConfig.extentProb
    // const extremesBy5Min = plan.metricConfig.extremeProbByFiveMin
    const morningMetricsDown = plan.metricConfig.morningMetrics.downSide
    const morningMetricsUp = plan.metricConfig.morningMetrics.upSide
    const morningVolMetrics = plan.metricConfig.morningVolume
    const rallyPrice = openPrice * (1 + (morningMetricsUp.averageInitialRallyStretch / 100))
    const dropPrice = openPrice * (1 - (morningMetricsDown.averageInitialDropStretch / 100))

    console.log(morningMetricsDown)
    return (
        <div id='ExpandedFirstHour'>


            <div>
                <div>
                    <p>Up Morning</p>
                    <p>Time To Peak: {morningMetricsUp.averageTimeToPeak.hour}:{morningMetricsUp.averageTimeToPeak.minute}</p>
                    <p>Initial Rally: {morningMetricsUp.averageInitialRallyStretch}%</p>
                    <p>From High Expect: {morningMetricsUp.averageSuccessfulPullbackSize}% Reversal {morningMetricsUp.pullbackBelowOpenProbability.toFixed()}% of the time</p>
                </div>

                <br />

                <div>
                    <p>Down Morning</p>
                    <p>Time To Bottom: {morningMetricsDown.averageTimeToBottom.hour}:{morningMetricsDown.averageTimeToBottom.minute}</p>
                    <p>Initial Drop: {morningMetricsDown.averageInitialDropStretch}%</p>
                    <p>From Low Expect: {morningMetricsDown.averageSuccessfulReboundExpansion}% Rebound {morningMetricsDown.reboundProbability.toFixed()}% of the time</p>
                </div>
            </div>

            <div>
                <p>Open Price: {openPrice} vs Current Price:{plan.mostRecentPrice}</p>
                <p>Initial Rally: ${rallyPrice.toFixed(2)}</p>
                <p>Inital Drop: ${dropPrice.toFixed(2)}</p>
                <p>Status:{upDay ? 'Up' : 'Down'}</p>

                <p>High Reached In First Hour: {extentProb.openH}%</p>
                <p>Low Reached In First Hour: {extentProb.openL}%</p>
            </div>

        </div>
    )
}

export default FirstHourReview