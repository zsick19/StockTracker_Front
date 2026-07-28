import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import * as short from 'short-uuid'

function IntegratedFetchChartWrapper({ ticker, plan })
{
    const dispatch = useDispatch()
    const [timeFrame, setTimeFrame] = useState()
    const uuid = useMemo(() => short.generate(), [])

    //set up the initial dispatches 
    useEffect(() =>
    {
        if (uuid)
        {

        }
        return (() =>
        {
            if (uuid)
            {

            }
        })
    }, [])
    

    //fetch chart data
    let chartContent = <div>chart goes here</div>


    return (
        <div>
            <div>
                <button>Pattern</button>
                <button>5D</button>
                <button>5D:15</button>
            </div>
            <div>
                {chartContent}
                <div>
                    subchart here
                </div>
            </div>
        </div>
    )
}

export default IntegratedFetchChartWrapper