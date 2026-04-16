import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { provideSelectedDeviation } from '../../../../../../../../features/STDs/StockDetailControlSlice'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../../features/StockData/StockDataSliceApi'
import { defaultTimeFrames } from '../../../../../../../../Utilities/TimeFrames'
import ChartWithNoFetchWrapper from '../../../../../../../../components/ChartSubGraph/ChartWithNoFetchingWrapper'
import * as short from 'short-uuid'
function StandardDeviationVisual()
{
    const selectedDeviation = useSelector((state) => provideSelectedDeviation(state))
    console.log(selectedDeviation)
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({
        ticker: selectedDeviation.Symbol, timeFrame: defaultTimeFrames.threeDayOneMin
        , liveFeed: true, info: false, provideNews: false
    })
    const uuid = useMemo(() => short.generate(), [])

    let graphVisual
    if (isSuccess)
    {
        graphVisual = <ChartWithNoFetchWrapper ticker={selectedDeviation.Symbol}
            candleData={data}
            mostRecentPrice={data.mostRecentPrice}
            lastCandleData={data.mostRecentTickerCandle}
            interactionController={{ isLivePrice: true, isInteractive: false, isZoomAble: true }}
            timeFrame={defaultTimeFrames.threeDayOneMin}
            EMNumbers={selectedDeviation.EM}
            uuid={uuid}
        />
    }

    return (
        <div>
            StandardDeviationVisual
            <p>{selectedDeviation.Symbol}</p>
            <p>{selectedDeviation.Price}</p>
            {graphVisual}
        </div>
    )
}

export default StandardDeviationVisual