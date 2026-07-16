import React, { useEffect, useState } from 'react'
import { processBackTests } from '../Utility/backTestAverages'
import BackTestTimeLineChart from '../../IntegratedPlanView/Components/SubComponents/BackTestTimeLineChart'

function CustomPriceBackTestWrapper({ entryPrice, exitPrice, stopLossPrice, maxPainPrice, relevantCandleDate, dateAdded, candleData, currentDiscount, setCurrentDiscount, patternOrStockChart, setPatternOrStockChart })
{
    const [discountEntryPrice, setDiscountEntryPrices] = useState(currentDiscount === 'Above Stop' ? stopLossPrice * 1.02 : currentDiscount === 'Below Stop' ? stopLossPrice * 0.98 : maxPainPrice * 1.02)
    const { backTests, averages } = processBackTests(discountEntryPrice, exitPrice, stopLossPrice, { relevantCandleDate: relevantCandleDate, dateAdded: dateAdded }, candleData)
    useEffect(() => { setDiscountEntryPrices(currentDiscount === 'Above Stop' ? stopLossPrice * 1.02 : currentDiscount === 'Below Stop' ? stopLossPrice * 0.98 : maxPainPrice * 1.02) }, [currentDiscount])

    const [upDownIncrement, setUpDownIncrement] = useState(0.01)

    return (
        <div id='CurrentDeepDiscountBuild'>
            <div id='DeepDiscountParams'>
                <h3>{currentDiscount} Deep Discount</h3>
                <div>
                    <p>${discountEntryPrice.toFixed(3)}</p>
                    <p>Discount Entry</p>
                    <br />
                    <p>Successful Trades: {averages.numberOfClosedTrades}/{averages.totalNumberOfTrades}</p>
                </div>
                <div className='flex'>
                    <p>StopLoss ${stopLossPrice}</p>
                    <p>Max Pain ${maxPainPrice}</p>
                </div>
            </div>

            <div>
                <BackTestTimeLineChart
                    backTests={backTests} hideText={true}
                    relevantCandleDate={relevantCandleDate} entryPriceDisplay={true}
                    entry={discountEntryPrice} exit={(exitPrice - discountEntryPrice) * Math.floor(1000 / discountEntryPrice)} stopLoss={stopLossPrice}
                    setPatternOrStockChart={setPatternOrStockChart} backTestAverage={averages}
                />

                {backTests.length > 0 ?
                    <div>
                        <div className='flex'>
                            <p>Average Max Gain:{averages.averageMaxGain} at {averages.averageGainPercent}%</p>
                            <p>Average Max Pain: -{averages.averageMaxPain} at {averages.averagePainPercent}%</p>
                            <p>DD To Plan Reward: {averages.positionReward}</p>
                            <p>DD To Plan Risk: -{averages.positionRisk}</p>
                        </div>
                        <div className='flex'>
                            <p>StopLoss Hit Count: {averages.numberOfStoplossHitTrades}</p>
                            <p>Average Hold Time: {averages.averageHoldTime} Days</p>
                            <p>Average Days Between Successful Trades: {averages.averageDaysBetweenSuccessfulTrades} Days</p>
                        </div>
                    </div>
                    : <div>
                        <p>No Successful Trades With An Discount Price of ${discountEntryPrice.toFixed(3)}</p>
                    </div>
                }
            </div>

            <div id='DiscountActionControls'>
                <form onSubmit={(e) => { e.preventDefault(); console.log(e.incChange); setUpDownIncrement(parseFloat(e.target.elements.incChange.value)) }}>
                    <input type="text" placeholder={upDownIncrement} id='incChange' name='incChange' />
                    <label htmlFor="">Increment</label>
                </form>

                <button onClick={() => setDiscountEntryPrices(prev => prev + upDownIncrement)}>Up ${upDownIncrement}</button>
                <button onClick={() => setDiscountEntryPrices(prev => prev - upDownIncrement)}>Down ${upDownIncrement}</button>
                <button>Initiate DD Watch</button>
            </div>
        </div>
    )
}

export default CustomPriceBackTestWrapper