import React from 'react'
import SingleEnterBufferHitDisplay from './SingleEnterBufferHitDisplay'
import { Grip } from 'lucide-react'

function EnterBufferHitContainer({ enterBufferHitIds })
{



    return (
        <div>
            <div className='flex'>
                <p>Enter Buffer</p>
                <button className='iconButton'><Grip size={20} color='white' /></button>
            </div>
            <div id='LSH-PreWatchBufferHitList' className='hide-scrollbar'>
                {enterBufferHitIds.map((id) => <SingleEnterBufferHitDisplay id={id} />)}
            </div>
        </div>
    )
}

export default EnterBufferHitContainer