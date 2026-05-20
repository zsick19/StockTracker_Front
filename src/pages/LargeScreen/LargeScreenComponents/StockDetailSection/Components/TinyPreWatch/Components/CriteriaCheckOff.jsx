import React from 'react'

function CriteriaCheckOff({ attemptCriteriaUpdate, plan })
{

    return (
        <fieldset onChange={(e) => attemptCriteriaUpdate(e)} className='PreWatchChecks'>
            <input className='hidden-button' type="checkbox" id="emaCheck" checked={plan?.emaCheck?.toString() === 'true'} />
            <label className='visual-button' htmlFor="emaCheck">EMA</label>

            <input className='hidden-button' type="checkbox" id="vpCheck" checked={plan?.vpCheck?.toString() === 'true'} />
            <label className='visual-button' htmlFor="vpCheck">VP</label>

            <input className='hidden-button' type="checkbox" id="volCheck" checked={plan?.volCheck?.toString() === 'true'} />
            <label className='visual-button' htmlFor="volCheck">Volume</label>

            <input className='hidden-button' type="checkbox" id="rsiCheck" checked={plan?.rsiCheck?.toString() === 'true'} />
            <label className='visual-button' htmlFor="rsiCheck">RSI</label>

            <input className='hidden-button' type="checkbox" id="macdCheck" checked={plan?.macdCheck?.toString() === 'true'} />
            <label className='visual-button' htmlFor="macdCheck">MACD</label>

            <input className='hidden-button' type="checkbox" id="stochasticCheck" checked={plan?.stochasticCheck?.toString() === 'true'} />
            <label className='visual-button' htmlFor="stochasticCheck">Stochastic</label>

            <input className='hidden-button' type="checkbox" id="vortexCheck" checked={plan?.vortexCheck?.toString() === 'true'} />
            <label className='visual-button' htmlFor="vortexCheck">Vortex</label>
        </fieldset>)
}

export default CriteriaCheckOff