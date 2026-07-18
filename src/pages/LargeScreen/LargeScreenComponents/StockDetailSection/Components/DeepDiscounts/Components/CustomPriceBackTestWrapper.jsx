import React, { useEffect, useState } from 'react'
import { processBackTests } from '../Utility/backTestAverages'
import BackTestTimeLineChart from '../../IntegratedPlanView/Components/SubComponents/BackTestTimeLineChart'
import { useGenerateOrUpdateDeepDiscountAlertMutation, useRemoveDeepDiscountAlertMutation } from '../../../../../../../features/DeepDiscountEngine/EngineDeepDiscountApiSlice'

function CustomPriceBackTestWrapper({ planId, tickerSymbol, discountPrices, setDiscountPrices, entryPrice, exitPrice, stopLossPrice, maxPainPrice, relevantCandleDate, dateAdded, candleData, currentDiscount, setCurrentDiscount, patternOrStockChart, setPatternOrStockChart })
{
    const [generateOrUpdateDeepDiscountAlert] = useGenerateOrUpdateDeepDiscountAlertMutation()
    const [removeDeepDiscountAlert] = useRemoveDeepDiscountAlertMutation()

    const discountEntry = currentDiscount === 'Above Stop' ? discountPrices.aboveStopLoss : currentDiscount === 'Below Stop' ? discountPrices.belowStopLoss : discountPrices.aboveMaxPain

    async function attemptGenerateOrUpdateDiscountToPlan()
    {
        try
        {
            if (!planId) return
            let currentDiscountToNumber = currentDiscount === 'Above Max Pain' ? 3 : currentDiscount === 'Above Stop' ? 1 : 2

            const result = await generateOrUpdateDeepDiscountAlert({ planId, discountToUpdate: currentDiscountToNumber, alertPrice: discountEntry, suggestedProfile: 1, tickerSymbol }).unwrap()
            console.log(result)
        } catch (error)
        {
            console.log("Error generating discount", error)
        }

    }
    async function attemptRemovingDiscountFromPlan()
    {
        try
        {
            if (!planId) return
            let currentDiscountToNumber = currentDiscount === 'Above Max Pain' ? 3 : currentDiscount === 'Above Stop' ? 1 : 2

            const result = await removeDeepDiscountAlert({ planId, discountToRemove: currentDiscountToNumber, tickerSymbol }).unwrap()
            console.log(result)
        } catch (error)
        {
            console.log("Error generating discount", error)
        }
    }



    function handleDiscountPriceChange(posDirection)
    {

        switch (currentDiscount)
        {
            case 'Above Stop': setDiscountPrices(prev => { return { ...prev, aboveStopLoss: posDirection ? parseFloat((prev.aboveStopLoss + upDownIncrement).toFixed(3)) : parseFloat((prev.aboveStopLoss - upDownIncrement).toFixed(3)) } }); break;
            case 'Below Stop': setDiscountPrices(prev => { return { ...prev, belowStopLoss: posDirection ? parseFloat((prev.belowStopLoss + upDownIncrement).toFixed(3)) : parseFloat((prev.belowStopLoss - upDownIncrement).toFixed(3)) } }); break;
            default: setDiscountPrices(prev => { return { ...prev, aboveMaxPain: posDirection ? parseFloat((prev.aboveMaxPain + upDownIncrement).toFixed(3)) : parseFloat((prev.aboveMaxPain - upDownIncrement).toFixed(3)) } }); break;
        }
    }

    const { backTests, averages } = processBackTests(discountEntry, exitPrice, stopLossPrice, { relevantCandleDate: relevantCandleDate, dateAdded: dateAdded }, candleData)
    const [upDownIncrement, setUpDownIncrement] = useState(0.01)

    return (
        <div id='CurrentDeepDiscountBuild'>
            <div id='DeepDiscountParams'>
                <h3>{currentDiscount} Deep Discount</h3>
                <div>
                    <p>${discountEntry.toFixed(3)}</p>
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
                    entry={discountEntry} exit={(exitPrice - discountEntry) * Math.floor(1000 / discountEntry)} stopLoss={stopLossPrice}
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
                        <p>No Successful Trades With An Discount Price of ${discountEntry.toFixed(3)}</p>
                    </div>
                }
            </div>

            <div id='DiscountActionControls'>
                <form onSubmit={(e) => { e.preventDefault(); console.log(e.incChange); setUpDownIncrement(parseFloat(e.target.elements.incChange.value)) }}>
                    <input type="text" placeholder={upDownIncrement} id='incChange' name='incChange' autoComplete='off' />
                    <label htmlFor="">Increment</label>
                </form>

                <button onClick={() => handleDiscountPriceChange(true)}
                //  setDiscountEntryPrices(prev => prev + upDownIncrement)}
                >Up ${upDownIncrement}</button>
                <button onClick={() => handleDiscountPriceChange(false)}>Down ${upDownIncrement}</button>
                <button onClick={() => attemptGenerateOrUpdateDiscountToPlan()}>Initiate DD Watch</button>
                <button onClick={() => attemptRemovingDiscountFromPlan()}>Remove</button>
            </div>
        </div>
    )
}

export default CustomPriceBackTestWrapper