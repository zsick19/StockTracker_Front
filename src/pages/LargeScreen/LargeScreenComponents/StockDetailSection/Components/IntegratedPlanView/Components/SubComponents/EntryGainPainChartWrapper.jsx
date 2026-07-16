import React, { useMemo, useState } from 'react'
import { useGetStockDataUsingStartAndEndDateWithTimeFrameQuery } from '../../../../../../../../features/StockData/StockDataSliceApi'
import * as short from 'short-uuid'
import BackTestChartWrapper from '../../../../../../../../components/ChartSubGraph/BackTestChartWrapper'
import { differenceInBusinessDays, format } from 'date-fns'

function EntryGainPainChartWrapper({ plan, entryDate, maxGainDate, maxPainDate, pricePoints, setPatternOrStockChart })
{
    const uuid = useMemo(() => short.generate(), [])
    const [timeFrameIncrement, setTimeFrameIncrement] = useState(1)
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingStartAndEndDateWithTimeFrameQuery({ ticker: plan.id, startDate: entryDate, endDate: maxGainDate, timeFrameIncrement })


    let graphContent
    if (isSuccess)
    {
        graphContent = <BackTestChartWrapper ticker={plan.id} candleData={data} uuid={uuid} chartStartDate={entryDate} chartEndDate={maxGainDate} pricePoints={pricePoints} />
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
            {graphContent}
            <div>
                <p>Start Date: {format(entryDate, 'MMM d')}</p>
                <p>End Date: {format(maxGainDate, 'MMM d')}</p>
                <p>Hold Time: {differenceInBusinessDays(maxGainDate, entryDate)}</p>
                <button onClick={() => setPatternOrStockChart({ display: false })}>Close</button>
            </div>
        </div>
    )
}

export default EntryGainPainChartWrapper