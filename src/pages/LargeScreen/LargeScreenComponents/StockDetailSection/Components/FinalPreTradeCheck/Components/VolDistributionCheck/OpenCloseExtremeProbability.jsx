import React, { useEffect, useMemo, useState } from 'react'
import { calculateExtendedSessionProbabilities } from '../../../../../../../../Utilities/technicalIndicatorFunctions'

function OpenCloseExtremeProbability({ candleData, setTradeDetails })
{
  const probability = useMemo(() => calculateExtendedSessionProbabilities(candleData), [candleData])
  useEffect(() =>
  {
    setTradeDetails(prev =>
    {
      return {
        ...prev, extentProb:
        {
          openH: probability.morningSession.highPrintedPercent,
          openL: probability.morningSession.lowPrintedPercent,
          midH: probability.middaySession.highPrintedPercent,
          midL: probability.middaySession.lowPrintedPercent,
          closeH: probability.closingSession.highPrintedPercent,
          closeL: probability.closingSession.lowPrintedPercent
        }
      }
    })
  }, [candleData])


  return (
    <div id='OpenCloseProbability' className='flex'>
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