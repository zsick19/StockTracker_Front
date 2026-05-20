import React, { useMemo } from 'react'
import { selectMacroTickersAndChartIds, useFetchMacroDailyZoneInfoQuery, useFetchUsersMacroWatchListQuery } from '../../../../../../../features/WatchList/WatchListStreamingSliceApi'
import { isWeekend } from 'date-fns'
import * as short from 'short-uuid'
import ChartWithChartingWrapper from '../../../../../../../components/ChartSubGraph/ChartWithChartingWrapper'
import ChartWithNoFetchWrapper from '../../../../../../../components/ChartSubGraph/ChartWithNoFetchingWrapper'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'
import { useSelector } from 'react-redux'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../features/StockData/StockDataSliceApi'
import GraphLoadingError from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
import GraphLoadingSpinner from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'

function FiveMinSectorChartContainer({ sector })
{
    const { item } = useFetchUsersMacroWatchListQuery(undefined, { selectFromResult: ({ data }) => ({ item: data?.tickerState.entities[sector] }) })

    const uuid = useMemo(() => short.generate(), [])


    const macroToChartMemo = useMemo(selectMacroTickersAndChartIds, [])
    const macroToChartId = useSelector(state => macroToChartMemo(state))

    const { data: stockData, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker: sector, timeFrame: defaultTimeFrames.threeDayFiveMin, liveFeed: true })

    let graphVisual
    if (isSuccess && stockData.candleData.length > 0)
    {
        graphVisual = <ChartWithChartingWrapper ticker={sector} candleData={stockData} chartId={macroToChartId[sector]}
            timeFrame={defaultTimeFrames.threeDayFiveMin} uuid={uuid} interactionController={{ isZoomAble: true, isInteractive: false }}
            candlesToKeepSinceLastQuery={stockData.candlesToKeepSinceLastQuery} lastCandleData={stockData.mostRecentTickerCandle} />
    } else if (isSuccess) graphVisual = <div>No data to display for this ticker</div>
    else if (isLoading) graphVisual = <GraphLoadingSpinner />
    else if (isError) graphVisual = <GraphLoadingError />


    return (
        <div className='FiveMinExpandedChartWrapper'>
            <div>
                {sector}
            </div>
            {graphVisual}
        </div>
    )
}

export default FiveMinSectorChartContainer