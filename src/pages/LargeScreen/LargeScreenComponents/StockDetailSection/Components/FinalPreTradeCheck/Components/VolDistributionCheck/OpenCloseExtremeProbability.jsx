import React, { useEffect, useMemo } from 'react'
import { calculateExtendedSessionProbabilities } from '../../../../../../../../Utilities/technicalIndicatorFunctions'

function OpenCloseExtremeProbability({ candleData })
{

  const probability = useMemo(() => calculateExtendedSessionProbabilities(candleData), [candleData])
  useEffect(() =>
  {
    console.log('ok hit')
  }, [])

  return (
    <div className='flex'>
      <div>
        <p>Morning</p>
        <p>High Hit: {probability.morningSession.highPrintedPercent}%</p>
        <p>Low Hit: {probability.morningSession.lowPrintedPercent}%</p>
      </div>
      <div>
        <p>Mid-Day</p>
        <p>High Hit: {probability.middaySession.highPrintedPercent}%</p>
        <p>Low Hit: {probability.middaySession.lowPrintedPercent}%</p>
      </div>
      <div>
        <p>Closing</p>
        <p>High Hit: {probability.closingSession.highPrintedPercent}%</p>
        <p>Low Hit: {probability.closingSession.lowPrintedPercent}%</p>
      </div>
    </div>
  )
}

export default OpenCloseExtremeProbability