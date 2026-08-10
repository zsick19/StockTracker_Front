import React, { useEffect, useRef, useState } from 'react'
import { useFetchWeeklyPlanResultsQuery } from '../../../../../../features/WeekReview/WeekReviewApiSlice'
import { differenceInBusinessDays, differenceInMinutes } from 'date-fns'
import './WeekInReview.css'
import SingleTradeReview from './Components/SingleTradeReview'

function WeekInReview()
{
    const [selectedEntryPrice, setSelectedEntryPrice] = useState('floorPrice')
    const { data, isSuccess, isLoading, isError, error, refetch } = useFetchWeeklyPlanResultsQuery({ selectedEntryPrice })
    const [tradesCount, setTradesCount] = useState()
    const [reviewedTrade, setReviewedTrade] = useState(undefined)

    let reviewContent = []
    if (isSuccess)
    {

        reviewContent = <div id='contentSummaryContainer' className='hide-scrollbar' >
            {data.weeklyReview.filter((t) => t.entered).map((t, i) => 
            {
                let enterToLowDays = differenceInMinutes(t.lowestLowTimestamp, t.enteredTimestamp)
                let enterToHighDays = differenceInMinutes(t.highestHighTimestamp, t.enteredTimestamp)

                let spanContent = enterToHighDays > enterToLowDays

                let percentFromExit = (t.highestHighSeen - t.priceTargets.exitPrice) * 100 / t.priceTargets.exitPrice
                let percentFromStop = (t.lowestLowSeen - t.priceTargets.stopLossPrice) * 100 / t.priceTargets.stopLossPrice

                let lossIfHeldOn = (!t.exitPriceHit && enterToHighDays < enterToLowDays)

                return (
                    <div className='singleWeeklyTrade' key={`weekReview${t.tickerSymbol}`}
                        style={{
                            border: `2px solid ${t.maxUnrealizedGainPositionValue > t.maxUnrealizedPainPositionValue ? 'green' : 'red'}`,
                            backgroundColor: `${enterToHighDays > enterToLowDays ? '' : 'rgba(71, 49, 49, 0.75)'}`
                        }} onClick={() => setReviewedTrade(t)}>


                        <p>{t.tickerSymbol}</p>
                        <div>
                            <p style={{ color: `${enterToHighDays > enterToLowDays ? 'green' : 'red'}` }}>Gain: ${t.maxUnrealizedGainPositionValue} <span style={{ color: 'gray' }}> {t.maxGainPercentage}%</span></p>
                            {(enterToHighDays > enterToLowDays) ?
                                <p >Loss: -${t.maxUnrealizedPainPositionValue} <span style={{ color: 'gray' }}> -{t.maxPainPercentage}%</span></p>
                                : <p>{percentFromExit.toFixed(2)}% Cut Below Exit</p>
                            }
                        </div>

                    </div>)
            }
            )
            }
        </div >


    } else if (isLoading)
    {
        reviewContent = <div>Loading...</div>
    } else if (isError)
    {
        reviewContent = <div>Error</div>
    }

    useEffect(() =>
    {
        if (isSuccess)
        {
            let enteredTrades = data.weeklyReview.filter((t) => t.entered)
            let gainsAboveBelow = {
                below25: 0,
                below50: 0,
                above50: 0,
                above75: 0,
                above100: 0
            }
            let lossAboveBelow = {
                below25: 0,
                below50: 0,
                above50: 0,
                above75: 0,
                above100: 0
            }
            let greatestLossTrade = enteredTrades.reduce((max, item) => item.maxUnrealizedPainPositionValue > max.maxUnrealizedPainPositionValue ? item : max)
            let greatestGainTrade = enteredTrades.reduce((max, item) => item.maxUnrealizedGainPositionValue > max.maxUnrealizedGainPositionValue ? item : max)
            const averageGain = enteredTrades.reduce((sum, { maxUnrealizedGainPositionValue }) => sum + maxUnrealizedGainPositionValue, 0) / enteredTrades.length;
            const averageGainPercent = enteredTrades.reduce((sum, { maxGainPercentage }) => sum + maxGainPercentage, 0) / enteredTrades.length;
            const averagePain = enteredTrades.reduce((sum, { maxUnrealizedPainPositionValue }) => sum + maxUnrealizedPainPositionValue, 0) / enteredTrades.length;
            const averagePainPercent = enteredTrades.reduce((sum, { maxPainPercentage }) => sum + maxPainPercentage, 0) / enteredTrades.length;

            const averageHoldToExitPrice = enteredTrades.reduce((sum, { highestHighTimestamp, enteredTimestamp }) => sum + differenceInMinutes(
                highestHighTimestamp, enteredTimestamp), 0) / enteredTrades.length;

            console.log(enteredTrades)
            let shortestHold = 100000
            let longestHold = 0
            enteredTrades.forEach((t) =>
            {
                if (t.maxUnrealizedGainPositionValue < 25) gainsAboveBelow.below25 += 1
                else if (t.maxUnrealizedGainPositionValue < 50) gainsAboveBelow.below50 += 1

                if (t.maxUnrealizedGainPositionValue >= 100) gainsAboveBelow.above100 += 1
                else if (t.maxUnrealizedGainPositionValue >= 75) gainsAboveBelow.above75 += 1
                else if (t.maxUnrealizedGainPositionValue >= 50) gainsAboveBelow.above50 += 1

                if (t.maxUnrealizedPainPositionValue < 25) lossAboveBelow.below25 += 1
                else if (t.maxUnrealizedPainPositionValue < 50) lossAboveBelow.below50 += 1

                if (t.maxUnrealizedPainPositionValue >= 100) lossAboveBelow.above100 += 1
                else if (t.maxUnrealizedPainPositionValue >= 75) lossAboveBelow.above75 += 1
                else if (t.maxUnrealizedPainPositionValue >= 50) lossAboveBelow.above50 += 1

                let minutesBetween = differenceInMinutes(t.highestHighTimestamp, t.enteredTimestamp)
                if (minutesBetween > longestHold) longestHold = minutesBetween
                if (minutesBetween <= shortestHold && minutesBetween !== 0) shortestHold = minutesBetween
            })

            setTradesCount({
                totalPlans: data.weeklyReview.length, entered: enteredTrades.length, greatestLossTrade, greatestGainTrade,
                averageGain, averageGainPercent, averagePain, averagePainPercent, gainsAboveBelow, lossAboveBelow, averageHoldToExitPrice, shortestHold, longestHold
            })
        }
    }, [data])

    return (
        <div id='WeekInReview'>
            {reviewedTrade ? <SingleTradeReview reviewedTrade={reviewedTrade} setReviewedTrade={setReviewedTrade} /> : <div>

                Select a trade for review
                {tradesCount && <>
                    <div className='flex'>
                        <div>
                            <p>Average Hold To Peak: {(tradesCount?.averageHoldToExitPrice / (60 * 24)).toFixed(2)} Days</p>
                            <p>Longest Hold To Peak: {(tradesCount?.longestHold / (60 * 24)).toFixed(2)} Days</p>
                            <p>Shortest Hold To Peak: {(tradesCount?.shortestHold / (60 * 24)).toFixed(2)} Days</p>
                        </div>
                        <br />
                        <div>
                            <p>Greatest Loss ${tradesCount?.greatestLossTrade?.maxUnrealizedPainPositionValue}</p>
                            <p>Average Pain ${tradesCount?.averagePain.toFixed(2)}</p>
                            <p>Average Percent {tradesCount?.averagePainPercent.toFixed(2)}%</p>
                        </div>
                        <br />
                        <div>
                            <p>Greatest Gain ${tradesCount?.greatestGainTrade?.maxUnrealizedGainPositionValue}</p>
                            <p>Average Gain ${tradesCount?.averageGain.toFixed(2)}</p>
                            <p>Average Percent {tradesCount?.averageGainPercent.toFixed(2)}%</p>
                        </div>
                    </div>
                    <br />
                    <div className='flex'>
                        <div>
                            <p>Gains</p>
                            <p>Below $25: {tradesCount?.gainsAboveBelow?.below25}/{tradesCount.totalPlans}</p>
                            <p>Below $50: {tradesCount?.gainsAboveBelow?.below50}/{tradesCount.totalPlans}</p>
                            <p>Above $50: {tradesCount?.gainsAboveBelow?.above50}/{tradesCount.totalPlans}</p>
                            <p>Above $75: {tradesCount?.gainsAboveBelow?.above75}/{tradesCount.totalPlans}</p>
                            <p>Above $100: {tradesCount?.gainsAboveBelow?.above100}/{tradesCount.totalPlans}</p>
                        </div>
                        <div>
                            <p>Losses</p>
                            <p>Below $25: {tradesCount?.lossAboveBelow?.below25}/{tradesCount.totalPlans}</p>
                            <p>Below $50: {tradesCount?.lossAboveBelow?.below50}/{tradesCount.totalPlans}</p>
                            <p>Above $50: {tradesCount?.lossAboveBelow?.above50}/{tradesCount.totalPlans}</p>
                            <p>Above $75: {tradesCount?.lossAboveBelow?.above75}/{tradesCount.totalPlans}</p>
                            <p>Above $100: {tradesCount?.lossAboveBelow?.above100}/{tradesCount.totalPlans}</p>
                        </div>
                    </div>
                </>}


                <div className='flex'>
                    <button style={{ backgroundColor: `${selectedEntryPrice === 'floorPrice' ? 'blue' : ''}` }} onClick={() => { setSelectedEntryPrice('floorPrice') }}>Floor Price Opportunities</button>
                    <button style={{ backgroundColor: `${selectedEntryPrice === 'entryBuffer' ? 'blue' : ''}` }} onClick={() => { setSelectedEntryPrice('entryBuffer') }}>Entry Buffer Opportunities</button>
                    <p>Trade Opportunities: {tradesCount?.entered}/{tradesCount?.totalPlans}</p>
                </div>

            </div>}
            <div>

                {reviewContent}
                <div>
                    <p>Green On Green=Traded as Planned</p>
                    <p>Green On Red=Gain Reversed to Smaller Loss</p>
                    <p>Red on Green=Gain Reversed to Larger Loss</p>
                    <p>Red on Red=Never Reversed</p>
                </div>
            </div>
        </div>
    )
}

export default WeekInReview