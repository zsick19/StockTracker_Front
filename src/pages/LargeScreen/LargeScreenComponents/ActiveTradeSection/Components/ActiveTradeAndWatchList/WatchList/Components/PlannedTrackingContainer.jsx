import React from 'react'
import SinglePlannedTickerDisplay from './SinglePlannedTickerDisplay'
import { Grip } from 'lucide-react'

function PlannedTrackingContainer({ enterExitPlansIds })
{

    return (
        <div id='LSH-PreWatchPlanList'>
            <div>
                <p>Planned Tickers</p>
                <button className='iconButton'><Grip size={20} color='white' /></button>
            </div>
            <div className='hide-scrollbar'>
                {enterExitPlansIds.map((id) => { return <SinglePlannedTickerDisplay id={id} /> })}
            </div>
        </div>
    )
}

export default PlannedTrackingContainer