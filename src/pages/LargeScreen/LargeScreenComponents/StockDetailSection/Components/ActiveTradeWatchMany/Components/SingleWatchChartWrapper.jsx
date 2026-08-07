import React, { useMemo } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { selectMostRecentPriceAndDailyChangeByTicker, selectPlanForStaticDetails, selectTodaysCandlesByTicker } from '../../../../../../../features/Engine/EnginePlanApiSlice'
import TodayOnlyChartWrapper from '../../../../../../../components/ChartSubGraph/TodayOnlyChart/TodayOnlyChartWrapper'
import { setStockDetailStateWithTicker } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'

function SingleWatchChartWrapper({ tickerSymbol })
{
    const dispatch = useDispatch()
    const selectStaticFieldsInstance = useMemo(selectPlanForStaticDetails, [])
    const plannedTicker = useSelector((state) => selectStaticFieldsInstance(state, tickerSymbol), shallowEqual);

    const dailyCalculatedValues = {
        PrevDailyBar: plannedTicker.snapShot.PrevDailyBar,
        TodayOpenPrice: plannedTicker.snapShot.DailyBar.OpenPrice,
        ATR: plannedTicker.planConfig.dailyCalculatedValues.atr,
        dailyEMA: {
            ema9: plannedTicker.planConfig.dailyCalculatedValues.ema9,
            ema50: plannedTicker.planConfig.dailyCalculatedValues.ema50,
            ema200: plannedTicker.planConfig.dailyCalculatedValues.ema200,
        }
    }
    const morningMetrics = plannedTicker.metricConfig.morningMetrics



    const todaysCandles = useSelector((state) => selectTodaysCandlesByTicker(state, tickerSymbol))
    const { mostRecentPrice, yesterdayPriceChange, yesterdayPercentChange, changeFromOpen, percentChange } = useSelector((state) => selectMostRecentPriceAndDailyChangeByTicker(state, tickerSymbol))

    let positiveNegativeColor = yesterdayPriceChange > 0 ? 'green' : yesterdayPriceChange === 0 ? 'gray' : 'red'
    return (
        <div className='SingleWatchChartWrapper'>
            <TodayOnlyChartWrapper ticker={tickerSymbol} candleData={todaysCandles} isOnlyYZoomAble={false} isZoomAble={true}
                morningMetrics={morningMetrics} dailyCalculatedValues={dailyCalculatedValues} />
            <div className='flex' onClick={() => dispatch(setStockDetailStateWithTicker({ detail: 21, ticker: tickerSymbol }))}>
                <p>{tickerSymbol}</p>
                <p style={{ color: positiveNegativeColor }}>${yesterdayPriceChange.toFixed(2)}</p>
                <p style={{ color: positiveNegativeColor }}>{yesterdayPercentChange.toFixed(2)}%</p>
            </div>
        </div>
    )
}

export default SingleWatchChartWrapper