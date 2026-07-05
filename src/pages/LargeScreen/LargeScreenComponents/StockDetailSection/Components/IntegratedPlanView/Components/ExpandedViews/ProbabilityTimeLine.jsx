import React, { useMemo } from 'react'
import VolDistChart from '../../../FinalPreTradeCheck/Components/VolDistributionCheck/VolDistChart'
import RangeDistChart from '../SubComponents/RangeDistChart'
import VolDistributionChart from '../SubComponents/VolDistributionChart'

function ProbabilityTimeLine({ plan })
{
  const extentProb = plan.metricConfig.extentProb
  const volDistribution = plan.metricConfig.volumeDistribution
  console.log(volDistribution)
  // const extremesBy5Min = plan.metricConfig.extremeProbByFiveMin
  const morningMetrics = plan.metricConfig.morningMetrics
  const morningVolMetrics = plan.metricConfig.morningVolume

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

  return (
    <div id='ExpandedProbability'>
      <div>
        <div id='extremeProbVisual'>
          <h4>Extremes Probability</h4>
          <RangeDistChart results={plan.metricConfig.extremeProbByFiveMin} extremesBreakdown={plan.metricConfig.extentProb} />
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
          <VolDistributionChart volDis={volDistribution.fiveMinAvgVolume} lowestIndexStart={volDistribution.fiveMinAvgLowestVolume.startingIndex} />
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
        <h4>Details</h4>
        <p>Daily High Most Likely: {greatestProb.greatestHighSession}</p>
        <p>Daily Low Most Likely: {greatestProb.greatestLowSession}</p>
        <p>Last Calculated:{ }</p>
      </div>

    </div>
  )
}

export default ProbabilityTimeLine