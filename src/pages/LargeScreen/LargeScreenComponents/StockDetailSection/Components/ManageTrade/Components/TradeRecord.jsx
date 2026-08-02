import React from 'react'
import { useSelector } from 'react-redux'
import { selectMostRecentPriceByTicker } from '../../../../../../../features/Engine/EnginePlanApiSlice'
import { format } from 'date-fns'

function TradeRecord({ tickerSymbol, todayOpenPrice, tradeRecord })
{
    const mostRecentPrice = useSelector(state => selectMostRecentPriceByTicker(state, tickerSymbol))

    let totalCost = 0
    tradeRecord.purchaseRecords.forEach(t => totalCost += (t.purchasePrice * t.sharesRemaining))

    let openPL = 0
    tradeRecord.purchaseRecords.forEach(t => openPL += ((mostRecentPrice - t.purchasePrice) * t.sharesRemaining))
    let percentPLTotal = ((openPL - totalCost) / totalCost)


    let todayPL = 0
    if (todayOpenPrice) todayPL = (mostRecentPrice - todayOpenPrice) * tradeRecord.availableShares
    let todayPercent = ((mostRecentPrice - todayOpenPrice) / todayOpenPrice)

    let combinedRecords = [...tradeRecord.purchaseRecords, ...tradeRecord.sellRecords].sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))

    return (
        <div>

            <div>
                <div className='flex'>
                    <div>
                        <p>Open P&L(USD)</p>
                        <p style={{ color: `${openPL > 0 ? 'green' : openPL < 0 ? 'red' : 'white'}` }}>{openPL.toFixed(2)} {percentPLTotal.toFixed(2)}%</p>
                    </div>
                    <div>
                        <p>Day's P&L(USD)</p>
                        <p style={{ color: `${todayPL > 0 ? 'green' : todayPL < 0 ? 'red' : 'white'}` }}>{todayPL.toFixed(2)} {todayPercent.toFixed(2)}%</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                    <div>
                        <p>Market Value </p>
                        <p>${(mostRecentPrice * tradeRecord.availableShares).toFixed(2)}</p>
                    </div>
                    <div>
                        <p>Total Cost</p>
                        <p>${totalCost}</p>
                    </div>
                    <div>
                        <p>Average Price</p>
                        <p> ${tradeRecord.averagePurchasePrice}</p>
                    </div>
                    <div>
                        <p>Quantity</p>
                        <p>{tradeRecord.availableShares}</p>
                    </div>
                    <div>
                        <p>Position Ratio</p>
                        <p>%</p>
                    </div>

                    <div>
                        <p>Last Price</p>
                        <p> ${mostRecentPrice}</p>
                    </div>
                </div>
            </div>
            <br />
            <div>
                <p>Filled Records</p>
                <div className='flex'>
                    <p>Side/Qty</p>
                    <p>Filled Price/Amount</p>
                    <p>Filled Time</p>
                </div>

                {tradeRecord && combinedRecords.flatMap(t => 
                {
                    if (t.sharesRemaining > 0) return (
                        <div className='flex'>
                            <div>
                                <p style={{ color: 'green' }}>Buy</p>
                                <p>{t.positionSize}</p>
                            </div>

                            <div>
                                <p>${t.purchasePrice.toFixed(2)}</p>
                                <p>{(t.purchasePrice * t.positionSize).toFixed(2)}</p>
                            </div>

                            <div>
                                <p>{format(t.transactionDate, 'MM/dd/yyyy')}</p>
                                <p>{format(t.transactionDate, 'hh:mm:ss')} EDT</p>
                            </div>
                        </div>)
                    else if (t.sellPrice) return (
                        <div className='flex'>
                            <div>
                                <p style={{ color: 'red' }}>Sell</p>
                                <p>{t.sellSize}</p>
                            </div>
                            <div>
                                <p>${t.sellPrice}</p>
                                <p>${(t.sellPrice * t.sellSize).toFixed(2)}</p>
                            </div>
                            <div>
                                <p>Date:{format(t.transactionDate, 'MM/dd/yyyy')}</p>
                                <p>{format(t.transactionDate, 'hh:mm:ss')} EDT</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default TradeRecord