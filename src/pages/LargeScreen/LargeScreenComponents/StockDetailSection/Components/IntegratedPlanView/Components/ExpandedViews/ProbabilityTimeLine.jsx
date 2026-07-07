import React, { useEffect, useMemo, useRef, useState } from 'react'
import VolDistChart from '../../../FinalPreTradeCheck/Components/VolDistributionCheck/VolDistChart'
import RangeDistChart from '../SubComponents/RangeDistChart'
import VolDistributionChart from '../SubComponents/VolDistributionChart'

function ProbabilityTimeLine({ plan })
{
  const extentProb = plan.metricConfig.extentProb
  const volDistribution = plan.metricConfig.volumeDistribution
  const morningMetrics = plan.metricConfig.morningMetrics
  const morningVolMetrics = plan.metricConfig.morningVolume

  const extremesBy5Min = plan.metricConfig.extremeProbByFiveMin

  const greatestProb = useMemo(() =>
  {
    let highProb = [extentProb.openH, extentProb.midH, extentProb.closeH]
    const maxHighIndex = highProb.indexOf(Math.max(...highProb))

    let lowProb = [extentProb.openL, extentProb.midL, extentProb.closeL]
    const maxLowIndex = lowProb.indexOf(Math.max(...lowProb))

    return {
      greatestLowSession: maxLowIndex === 0 ? 'Open' : maxHighIndex === 1 ? 'Mid' : 'Close',
      greatestHighSession: maxHighIndex === 0 ? 'Open' : maxHighIndex === 1 ? 'Mid' : 'Close'
    }
  }, [plan.id])


  const openCandleHighLow = (extremes) =>
  {
    let highProbInFirst10Mins = (extremes[0].highProb + extremes[1].highProb) / 2
    let lowProbInFirst10Mins = (extremes[0].lowProb + extremes[1].lowProb) / 2
    let numberOfTimeHighHitAfterFirst10Mins = 0
    let numberOfTimeLowHitAfterFirst10Mins = 0
    for (let index = 2; index < extremes.length; index++)
    {
      if (extremes[index].highProb > highProbInFirst10Mins) numberOfTimeHighHitAfterFirst10Mins += 1
      if (extremes[index].lowProb > lowProbInFirst10Mins) numberOfTimeLowHitAfterFirst10Mins += 1
    }

    let highProb = 'Highly Likely'
    if (numberOfTimeHighHitAfterFirst10Mins > 3) highProb = 'Not Likely'
    else if (numberOfTimeHighHitAfterFirst10Mins > 1) highProb = 'Somewhat Likely'

    let lowProb = 'Highly Likely'
    if (numberOfTimeLowHitAfterFirst10Mins > 3) lowProb = 'Not Likely'
    else if (numberOfTimeLowHitAfterFirst10Mins > 1) lowProb = 'Somewhat Likely'

    return {
      highProb, lowProb
    }
  }

  const results = openCandleHighLow(extremesBy5Min)

  const [currentTimeForTrace, setCurrentTimeForTrace] = useState(new Date())
  const movingBarIntervalRef = useRef()

  useEffect(() =>
  {
    movingBarIntervalRef.current = setInterval(() => { setCurrentTimeForTrace(new Date()) }, [300000])
    return () => { clearInterval(movingBarIntervalRef.current) }
  }, [])



  return (
    <div id='ExpandedProbability'>
      <div>
        <div id='extremeProbVisual'>
          <h4>Extremes Probability</h4>
          <RangeDistChart results={plan.metricConfig.extremeProbByFiveMin} extremesBreakdown={plan.metricConfig.extentProb}
            currentTimeBar={currentTimeForTrace} />
          <div>
            <div>
              <p className={extentProb.openH > 60 && 'highProbVisual'}>High Hit: <span>{extentProb.openH}%</span></p>
              <p className={extentProb.openL > 60 && 'lowProbVisual'}>Low Hit: <span>{extentProb.openL}%</span></p>
              <p>Open</p>
            </div>
            <div>
              <p className={extentProb.midH > 60 && 'highProbVisual'}>High Hit: <span>{extentProb.midH}%</span></p>
              <p className={extentProb.midL > 60 && 'lowProbVisual'}>Low Hit: <span>{extentProb.midL}%</span></p>
              <p>Mid-Day</p>
            </div>
            <div>
              <p className={extentProb.closeH > 60 && 'highProbVisual'}>High Hit: <span>{extentProb.closeH}%</span></p>
              <p className={extentProb.closeL > 60 && 'lowProbVisual'}>Low Hit: <span>{extentProb.closeL}%</span></p>
              <p>Close</p>
            </div>
          </div>
        </div>

        <div id='volDistributionVisual'>
          <h3>Volume Distribution</h3>



          <VolDistributionChart volDis={volDistribution.fiveMinAvgVolume} lowestIndexStart={volDistribution.fiveMinAvgLowestVolume?.startingIndex}
            currentTimeBar={currentTimeForTrace} />



          <div>
            <div>
              <p>{volDistribution.fiveMinAvgVolumeShare.firstHour}% Of Volume</p>
              <p>Open</p>
            </div>
            <div>
              <p>{volDistribution.fiveMinAvgLowestVolume.oneHourLowestVolume}</p>
              <p>Lowest 1 Hour Volume</p>
            </div>
            <div>
              <p>{volDistribution.fiveMinAvgVolumeShare.lastHour}% Volume</p>
              <p>Close</p>
            </div>
          </div>



        </div>
      </div>

      <div>
        <h3>Probability Details</h3>
        <p>Daily High Most Likely: {greatestProb.greatestHighSession} Session</p>
        <p>Daily Low Most Likely: {greatestProb.greatestLowSession} Session</p>
        <br />

        <p>Morning Liquidity Concentration: {(volDistribution.fiveMinAvgVolumeShare.firstHour / volDistribution.fiveMinAvgVolumeShare.lastHour).toFixed(2)}</p>
        <p>Greater than 2, much higher volume needed in afternoon trading session for convection</p>
        <br />

        <h3>High Print At Open</h3>
        <p>{results.highProb}</p>

        <br />
        <h3>Low Print At Open</h3>
        <p>{results.lowProb}</p>
        <br />

        <p>Slippage Buffer For lowest volume:</p>
        <p>+$0.04 to be calculated</p>

        <p>Last Calculated:{plan.planConfig.datesLastCalculated.morningMetrics}</p>
      </div>

    </div>
  )
}

export default ProbabilityTimeLine