import React from 'react'

function TradeActionInfo({ percentGain, atr, todayAtr, ticker, mostRecentPrice, snapShot, setShowMACD, extentProb })
{
    return (
        <div className='TradeActionInfo' onClick={() => setShowMACD(true)}>
            <div>

                <p>${mostRecentPrice}</p>
                <p>${todayAtr} / ${atr}</p>
                <p>{percentGain}%</p>
            </div>
            {extentProb &&
                <div className='extentProp'>
                    <div>
                        <p className={extentProb.openH > 40 ? 'highExtreme' : ''}>High:{extentProb.openH}</p>
                        <p className={extentProb.openL > 40 ? 'lowExtreme' : ''}>Low: {extentProb.openL}</p>
                        <p>Open</p>
                    </div>
                    <div>
                        <p className={extentProb.midH > 40 ? 'highExtreme' : ''}>High:{extentProb.midH}</p>
                        <p className={extentProb.midL > 40 ? 'lowExtreme' : ''}>Low: {extentProb.midL}</p>
                        <p>Mid</p>
                    </div>
                    <div>
                        <p className={extentProb.closeH > 40 ? 'highExtreme' : ''}>High:{extentProb.closeH}</p>
                        <p className={extentProb.closeL > 40 ? 'lowExtreme' : ''}>Low: {extentProb.closeL}</p>
                        <p>Close</p>
                    </div>
                </div>
            }


        </div>
    )
}

export default TradeActionInfo