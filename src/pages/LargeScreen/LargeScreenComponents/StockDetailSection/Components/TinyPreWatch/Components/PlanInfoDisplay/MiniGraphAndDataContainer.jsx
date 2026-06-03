import React from 'react'
import MiniFiveMinChart from '../MiniFiveMinChart'
import { format } from 'date-fns'

function MiniGraphAndDataContainer({ candleData, planPrices, date, dailyCandle })
{
    let direction = dailyCandle.OpenPrice < dailyCandle.ClosePrice
    let percentPerDay = ((dailyCandle.ClosePrice - dailyCandle.OpenPrice) / dailyCandle.OpenPrice) * 100
    let spread = dailyCandle.ClosePrice - dailyCandle.OpenPrice
    return (
        <div>
            <p>{format(date, 'EEEE')}</p>
            <MiniFiveMinChart enterBufferPrice={planPrices.enterBufferPrice} enterPrice={planPrices.enterPrice} stopLossPrice={planPrices.stopLossPrice} candleData={candleData} xScaleFromCandles={true} direction={direction} openPrice={candleData[0].OpenPrice} />
            <p>${spread.toFixed(2)} // {percentPerDay.toFixed(2)}%</p>
        </div>
    )
}

export default MiniGraphAndDataContainer