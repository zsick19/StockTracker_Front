import React, { useMemo } from 'react'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../../../features/StockData/StockDataSliceApi'
import ChartWithNoFetchWrapper from '../../../../../../../../../components/ChartSubGraph/ChartWithNoFetchingWrapper'
import * as short from 'short-uuid'

function QuickSearchChartWrapper({ ticker, timeFrame })
{
    const { data, isSuccess, isLoading, isError, error } = useGetStockDataUsingTimeFrameQuery({ ticker, timeFrame, liveFeed: true })
    const uuid = useMemo(() => short.generate(), [])
    let graphContent
    if (isSuccess)
    {
        graphContent = <ChartWithNoFetchWrapper ticker={ticker} candleData={data} timeFrame={timeFrame} uuid={uuid}
            mostRecentPrice={data.mostRecentPrice}
            lastCandleData={data.mostRecentTickerCandle}
            interactionController={{ isLivePrice: true, isInteractive: false, isZoomAble: true }}
        />
    }
    console.log(error)

    return (
        <div>
            {graphContent}
        </div>
    )
}

export default QuickSearchChartWrapper