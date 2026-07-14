import React, { useState } from 'react'
import { useGetStockDataUsingStartAndEndDateWithTimeFrameQuery } from '../../../../../../../../features/StockData/StockDataSliceApi'

function EntryGainPainChartWrapper({ plan, entryDate, maxGainDate, maxPainDate, setPatternOrStockChart })
{

    const [timeFrameIncrement, setTimeFrameIncrement] = useState(1)
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingStartAndEndDateWithTimeFrameQuery({ ticker: plan.id, startDate: entryDate, endDate: maxGainDate, timeFrameIncrement })


    let graphContent
    if (isSuccess)
    {
        graphContent = <div>graph will go here</div>
    } else if (isLoading)
    {
        graphContent = <div>Loading...</div>
    } else if (isError)
    {
        console.log(error)
        graphContent = <div>Error
            <button onClick={() => refetch()}>Refetch</button>
        </div>
    }

    return (
        <div id='EntryPainGainChartWrapper'>
            <div>{entryDate}</div>
            <div>{maxGainDate}</div>
            <div>{maxPainDate}</div>
            <button onClick={() => setPatternOrStockChart({ display: false })}>Close</button>
            {graphContent}
        </div>
    )
}

export default EntryGainPainChartWrapper