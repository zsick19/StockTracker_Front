import React from 'react'
import { useSelector } from 'react-redux'
import { selectMostRecentStream } from '../../features/Initializations/StreamMostRecentSlice'
import { isWeekend } from 'date-fns'
function StreamProof()
{
    const streamProof = useSelector((state) => selectMostRecentStream(state))

    return (
        <div>
            {
                streamProof.monitorStatus ?
                    isWeekend(new Date()) ? "" : <p>{streamProof.mostRecentTickerStreamed} ${streamProof.mostRecentPriceStreamed}</p> :
                    <p>STOCK MONITOR DISCONNECTED</p>
            }
        </div>
    )
}

export default StreamProof