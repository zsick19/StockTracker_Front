import { startOfDay, subBusinessDays } from 'date-fns'
import React, { useMemo, useState } from 'react'
import { useGetStockDataUsingStartDateAndTimeFrameQuery } from '../../../../../../../../features/StockData/StockDataSliceApi'
import GraphLoadingSpinner from '../../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import GraphLoadingError from '../../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
import DailyChartWrapper from '../../../../../../../../components/ChartSubGraph/DailyChartWrapper'
import * as short from 'short-uuid'
import IntraDayChartWrapper from '../../../../../../../../components/ChartSubGraph/IntraDayChart/IntraDayChartWrapper'
import MACDSubChart from '../../../../../../../../components/ChartSubGraph/SubCharts/MACDSubChart'

function ChartReview({ plan })
{
    const patternStartDate = plan.planConfig.relevantCandleDate
    const patternConfig = plan.patternConfig
    const planConfig = plan.planConfig
    const tickerSymbol = plan.id


    const [timeFrame, setTimeFrame] = useState({ start: startOfDay(patternStartDate), intraDay: false, unitOfIncrement: 'D', increment: 1, selection: 0 })

    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingStartDateAndTimeFrameQuery({ ticker: tickerSymbol, timeFrame, start: timeFrame.start })

    const uuid = useMemo(() => short.generate(), [])
    const intraDayUUID = useMemo(() => short.generate(), [])


    let chartContent
    if (isSuccess)
    {
        if (timeFrame.unitOfIncrement === 'D')
        {
            chartContent = <DailyChartWrapper ticker={tickerSymbol} candleData={data.candleData} uuid={uuid}
                chartStartDate={timeFrame.selection === 0 ? patternStartDate : subBusinessDays(new Date(), 10)} chartEndDate={new Date()}
                pricePoints={{ entryPrice: patternConfig.entryStrikeBuffer, floorPrice: patternConfig.channelBottom, exitPrice: patternConfig.channelTop, stopLossPrice: planConfig.plan.stopLossPrice }}
            // currentDiscount={currentDiscount} discountPrices={discountPrices} exitAlertPrice={exitAlertPrice}
            />
            // MACDContent = <MACDSubChart candleData={data.candleData} uuid={uuid} timeFrame={timeFrame} />
        } else
        {
            chartContent = <IntraDayChartWrapper ticker={tickerSymbol} candleData={data.candleData} uuid={intraDayUUID}
                chartStartDate={timeFrame.start} chartEndDate={new Date()} timeFrame={timeFrame}
                pricePoints={{ entryPrice: patternConfig.entryStrikeBuffer, floorPrice: patternConfig.channelBottom, exitPrice: patternConfig.channelTop, stopLossPrice: planConfig.plan.stopLossPrice }}
            // currentDiscount={currentDiscount} discountPrices={discountPrices} exitAlertPrice={exitAlertPrice}
            />
        }


    } else if (isLoading)
    {
        chartContent = <GraphLoadingSpinner />
    } else if (isError)
    {
        chartContent = <GraphLoadingError refetch={refetch} />
    }


    return (
        <div id='ExpandedCharts'>
            <div>
                {chartContent}
            </div>
            <div>
                <button style={{ backgroundColor: timeFrame.selection === 0 ? 'blue' : '' }} onClick={() => setTimeFrame({ intraDay: false, start: startOfDay(patternStartDate), unitOfIncrement: 'D', increment: 1, selection: 0 })}>Pattern Daily</button>
                <button style={{ backgroundColor: timeFrame.selection === 1 ? 'blue' : '' }} onClick={() => setTimeFrame({ intraDay: false, start: startOfDay(subBusinessDays(new Date(), 10)), unitOfIncrement: 'D', increment: 1, selection: 1 })}>Daily 10 Day</button>
                <button style={{ backgroundColor: timeFrame.selection === 2 ? 'blue' : '' }} onClick={() => setTimeFrame({ intraDay: true, start: startOfDay(subBusinessDays(new Date(), 5)), unitOfIncrement: 'M', increment: 30, selection: 2 })}>5D:30M</button>
                <button style={{ backgroundColor: timeFrame.selection === 3 ? 'blue' : '' }} onClick={() => setTimeFrame({ intraDay: true, start: startOfDay(subBusinessDays(new Date(), 5)), unitOfIncrement: 'M', increment: 15, selection: 3 })}>5D:15M</button>
                <button style={{ backgroundColor: timeFrame.selection === 4 ? 'blue' : '' }} onClick={() => setTimeFrame({ intraDay: true, start: startOfDay(subBusinessDays(new Date(), 5)), unitOfIncrement: 'M', increment: 5, selection: 4 })}>5D:5M</button>
            </div>
        </div>
    )
}

export default ChartReview