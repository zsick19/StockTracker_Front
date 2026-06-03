import React, { useEffect, useState } from 'react'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../../features/StockData/StockDataSliceApi'
import { defaultTimeFrames } from '../../../../../../../../Utilities/TimeFrames'
import MiniGraphAndDataContainer from './MiniGraphAndDataContainer'

function PastFiveTradingDays({ plan })
{
    const { data: dailyData, isSuccess: isSuccessDaily, isError: isErrorDaily, isLoading: isLoadingDaily, error: errorDaily } = useGetStockDataUsingTimeFrameQuery({ ticker: plan.tickerSymbol, timeFrame: defaultTimeFrames.dailyHalfYear, provideNews: false })

    const { data: stockData, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker: plan.tickerSymbol, timeFrame: defaultTimeFrames.threeDayFiveMin, liveFeed: true })
    const [brokenUpCandleData, setBrokenUpCandleData] = useState([])
    const [numberOfDaysToShow, setNumberOfDaysToShow] = useState(6)

    useEffect(() =>
    {

        if (isSuccess)
        {
            let results = groupCandlesticksByDay(stockData.candleData)
            setBrokenUpCandleData(results)
        }

        function groupCandlesticksByDay(candlesticks)
        {
            const groups = {};
            candlesticks.forEach(candle =>
            {
                const dateStr = new Date(candle.Timestamp).toISOString().split('T')[0];
                if (!groups[dateStr]) { groups[dateStr] = []; }
                groups[dateStr].push(candle);
            });
            return Object.values(groups);
        }

    }, [isSuccess])

    return (
        <div className='flex'>
            {brokenUpCandleData.map((t, i) =>
            {
                if (i > brokenUpCandleData.length - numberOfDaysToShow) return <MiniGraphAndDataContainer planPrices={plan.plan} candleData={t}
                    date={t[0].Timestamp}
                    dailyCandle={dailyData.candleData.at(i - brokenUpCandleData.length)} />
            })}
            <button onClick={() => setNumberOfDaysToShow(prev => prev - 1)}>less</button>
            <button onClick={() => setNumberOfDaysToShow(prev => prev + 1)}>more</button>
        </div>
    )
}

export default PastFiveTradingDays