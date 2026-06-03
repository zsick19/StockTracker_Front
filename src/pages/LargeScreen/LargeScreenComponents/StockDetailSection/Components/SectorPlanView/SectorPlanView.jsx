import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import './SectorPlanView.css'
import { selectStockDetailTickerControl } from '../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { useFetchMacroDailyZoneInfoQuery } from '../../../../../../features/WatchList/WatchListStreamingSliceApi'
import { isWeekend } from 'date-fns'
import SectorGraphWrapper from './Components/SectorGraphWrapper'
import { useGetTinyEnterExit5MinChartsQuery, useGetUsersEnterExitPlanQuery } from '../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import FiveMinSectorChartContainer from '../TinyPreWatch/Components/FiveMinSectorChartContainer'
import { defaultTimeFrames } from '../../../../../../Utilities/TimeFrames'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../features/StockData/StockDataSliceApi'
import ChartWithChartingWrapper from '../../../../../../components/ChartSubGraph/ChartWithChartingWrapper'
import * as short from 'short-uuid'
import SectorViewHighImportance from './Components/SectorViewHighImportance'
import SectorViewAllPlans from './Components/SectorViewAllPlans'

function SectorPlanView()
{
    const dispatch = useDispatch()
    const ticker = useSelector(selectStockDetailTickerControl)


    const pollingInterval = isWeekend(new Date()) ? 0 : 300000
    const { data, isSuccess, isLoading, isError, error, refetch } = useFetchMacroDailyZoneInfoQuery(undefined, { pollingInterval: pollingInterval })
    const { data: dailyCandles, isSuccess: isSuccessDaily, isError: isErrorDaily, isLoading: isLoadingDaily, error: errorDaily } =
        useGetStockDataUsingTimeFrameQuery({ ticker, timeFrame: defaultTimeFrames.dailyHalfYear, provideNews: false, liveFeed: true })


    const { data: miniChartData, isSuccess: isMiniChartSuccess, isLoading: isMiniChartLoading, isError: isMiniChartError, error: miniChartError, refetch: miniChartRefetch } = useGetTinyEnterExit5MinChartsQuery(undefined, { pollingInterval })
    const { data: enterExitData, isSuccess: isEnterExitSuccess, refetch: refetchEnterExitPlan } = useGetUsersEnterExitPlanQuery()


    let sectorGraph
    if (isSuccess)
    {
        sectorGraph = <FiveMinSectorChartContainer sector={ticker} />
    } else if (isLoading)
    {
        sectorGraph = <div>Loading Sector Data</div>
    } else if (isError)
    {
        sectorGraph = <div>Error Loading Sector</div>
    }

    const uuid = useMemo(() => short.generate(), [])
    let sectorGraphDaily
    if (isSuccessDaily)
    {
        sectorGraphDaily = <ChartWithChartingWrapper
            ticker={ticker}
            candleData={dailyCandles} uuid={uuid} timeFrame={defaultTimeFrames.dailyHalfYear}
            interactionController={{ isZoomAble: true, isInteractive: false }}
            showEMAs={true} />
    }

    return (
        <div id='SectorPlanView'>
            <div id='sectorDailyFiveLeader'>
                {sectorGraph}
                {sectorGraphDaily}
                <div id='sectorLeaderBoard'>
                    <div>
                        <p>Ticker</p>
                        <p>% Daily</p>
                        <p>% Weekly</p>
                    </div>
                    <div>
                        values
                    </div>
                </div>
            </div>

            <SectorViewHighImportance sector={ticker} />
            <SectorViewAllPlans sector={ticker} />

        </div>
    )
}

export default SectorPlanView