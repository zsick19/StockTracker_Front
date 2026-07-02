import React from 'react'
import VolDistChart from '../../../FinalPreTradeCheck/Components/VolDistributionCheck/VolDistChart'
import RangeDistChart from '../SubComponents/RangeDistChart'

function ProbabilityTimeLine({ plan })
{
  const extentProb = plan.metricConfig.extentProb
  // const extremesBy5Min = plan.metricConfig.extremeProbByFiveMin
  const morningMetrics = plan.metricConfig.morningMetrics
  const morningVolMetrics = plan.metricConfig.morningVolume

  return (
    <div id='ExpandedProbability'>
      <div>
        <div>
          <h4>Historical Extremes Probability</h4>
          <RangeDistChart results={plan.metricConfig.extremeProbByFiveMin} extremesBreakdown={plan.metricConfig.extentProb} />
          <div className='flex'>
            <div>
              <p>Morning</p>
              <p>High Hit: {extentProb.openH}%</p>
              <p>Low Hit: {extentProb.openL}%</p>
            </div>
            <div>
              <p>Mid-Day</p>
              <p>High Hit: {extentProb.midH}%</p>
              <p>Low Hit: {extentProb.midL}%</p>
            </div>
            <div>
              <p>Closing</p>
              <p>High Hit: {extentProb.closeH}%</p>
              <p>Low Hit: {extentProb.closeL}%</p>
            </div>
          </div>
        </div>

        <div>
          <h3>Historical Volume Distribution</h3>
          <VolDistChart candleData={plan.combinedCandleData} />
        </div>

      </div>

      <div>
        Details Explaining the findings here
      </div>
      
    </div>
  )
}

export default ProbabilityTimeLine