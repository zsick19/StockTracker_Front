import React from 'react'
import { useSelector } from 'react-redux'
import { selectMostRecentPriceByTicker } from '../../../../../../../../../features/Engine/EnginePlanApiSlice'
import { isToday } from 'date-fns'

function SinglePosition({ trade })
{

    const mostRecentPrice = useSelector((state) => selectMostRecentPriceByTicker(state, trade.tickerSymbol))
    const todayOpenPrice = isToday(trade.snapShot.DailyBar.Timestamp) ? trade.snapShot.DailyBar.OpenPrice : 0

    let todayPL = 0
    if (todayOpenPrice) todayPL = (mostRecentPrice - todayOpenPrice) * trade.availableShares
    let todayPercent = ((mostRecentPrice - todayOpenPrice) / todayOpenPrice)

    let totalCost = 0
    trade.purchaseRecords.forEach(t => totalCost += (t.purchasePrice * t.sharesRemaining))

    let openPL = 0
    trade.purchaseRecords.forEach(t => openPL += ((mostRecentPrice - t.purchasePrice) * t.sharesRemaining))
    let percentPLTotal = ((openPL - totalCost) / totalCost)


    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
            <div>
                <p>{trade.tickerSymbol}</p>
            </div>
            <div>
                <p style={{ color: `${openPL > 0 ? 'green' : openPL < 0 ? 'red' : 'white'}` }}>{openPL.toFixed(2)}</p>
                <p style={{ color: `${openPL > 0 ? 'green' : openPL < 0 ? 'red' : 'white'}` }}>{percentPLTotal.toFixed(2)}%</p>
            </div>
            <div>
                <p>{mostRecentPrice}</p>
                <p>${trade.averagePurchasePrice}</p>
            </div>
            <div>
                <p style={{ color: `${todayPL > 0 ? 'green' : todayPL < 0 ? 'red' : 'white'}` }}> {todayOpenPrice === 0 ? 0.00 : todayPL.toFixed(2)}</p>
                <p style={{ color: `${todayPL > 0 ? 'green' : todayPL < 0 ? 'red' : 'white'}` }}>  {todayOpenPrice === 0 ? 0.00 : todayPercent.toFixed(2)}%</p>
            </div>
            <div>
                <p>{(trade.availableShares * mostRecentPrice).toFixed(2)}</p>
                <p>{trade.availableShares}</p>
            </div>
        </div>
    )
}

export default SinglePosition