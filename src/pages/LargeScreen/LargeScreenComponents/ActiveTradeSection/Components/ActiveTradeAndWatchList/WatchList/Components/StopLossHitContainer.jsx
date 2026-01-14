import React from 'react'
import SingleStopLostHitDisplay from './SingleStopLostHitDisplay'
import { Grip } from 'lucide-react'

function StopLossHitContainer({ stopLossHitIds })
{

    return (
        <div id='LSH-PreWatchStopLosHit'>
            <div>
                <p>Stop Loss Hit</p>
                <button className='iconButton'><Grip size={20} color='white' /></button>

            </div>
            <div className='hide-scrollbar'>
                {stopLossHitIds.map((id) => <SingleStopLostHitDisplay id={id} />)}
            </div>
        </div>
    )
}

export default StopLossHitContainer