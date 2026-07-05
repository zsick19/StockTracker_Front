import React from 'react'

function PriceLevels({ plan })
{

  const priceLevelsAbove = plan.metricConfig.vpSupportResistance.overHeadResistance
  const priceLevelsBelow = plan.metricConfig.vpSupportResistance.underlyingSupport
  const patternEntryPrice = plan.patternConfig.entryStrikeBuffer
  const patternBottomPrice = plan.patternConfig.channelBottom
  const patternTopPrice = plan.patternConfig.channelTop


  return (
    <div id='ExpandedSupportResistance'>
      <div>
        <h3>Over Head</h3>
        {priceLevelsAbove.map(t => (<div className='flex'>
          <p>${t.priceLevel.toFixed(2)}</p>
          <p>{t.volumePct}%</p>
          <p>{t.frictionRating}</p>
        </div>))}
      </div>
      <br />
      <div className='flex'>
        <p>Entry: ${patternEntryPrice}</p>
        <p>Bottom: ${patternBottomPrice}</p>
        <p>Ceiling: ${patternTopPrice}</p>
        <p>Current Price: ${plan.mostRecentPrice}</p>
      </div>
      <br />
      <div>
        <h3>Below Support</h3>
        {priceLevelsBelow.map(t => (<div className='flex'>
          <p>${t.priceLevel.toFixed(2)}</p>
          <p>{t.volumePct}%</p>
          <p>{t.frictionRating}</p>
        </div>))}
      </div>

      <p>Days anaylised: 5</p>
    </div>
  )
}

export default PriceLevels