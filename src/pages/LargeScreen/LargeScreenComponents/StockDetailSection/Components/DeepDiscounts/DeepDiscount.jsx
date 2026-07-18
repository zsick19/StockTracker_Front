import React, { useMemo, useState } from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { selectPlanForStaticDetails } from '../../../../../../features/Engine/EnginePlanApiSlice';
import './DeepDiscount.css'
import { useGetStockDataUsingStartAndEndDateWithTimeFrameQuery } from '../../../../../../features/StockData/StockDataSliceApi';
import BackTestTimeLineChart from '../IntegratedPlanView/Components/SubComponents/BackTestTimeLineChart';
import CustomPriceBackTestWrapper from './Components/CustomPriceBackTestWrapper';
import * as short from 'short-uuid'
import DailyChartWrapper from '../../../../../../components/ChartSubGraph/DailyChartWrapper';
import EntryGainPainChartWrapper from '../IntegratedPlanView/Components/SubComponents/EntryGainPainChartWrapper';
import { useMarkPlanDiscountsReviewedMutation } from '../../../../../../features/DeepDiscountEngine/EngineDeepDiscountApiSlice';
import { differenceInBusinessDays } from 'date-fns';

function DeepDiscount({ tickerSymbol })
{
    const selectStaticFieldsInstance = useMemo(selectPlanForStaticDetails, [])
    const selectedPlannedTicker = useSelector((state) => selectStaticFieldsInstance(state, tickerSymbol), shallowEqual);
    const planConfig = selectedPlannedTicker.planConfig
    const patternConfig = selectedPlannedTicker.patternConfig
    const discountConfig = selectedPlannedTicker.discountConfig

    const dailyChartUUID = useMemo(() => short.generate(), [])

    const entryBackTests = planConfig.backTestedValues.entryPrice.backTests
    const entryBackTestAverage = planConfig.backTestedValues.entryPrice.averages
    const maxPainFromPattern = entryBackTestAverage.lowestPatternValue
    const floorBackTests = planConfig.backTestedValues.floorPrice.backTests
    const floorBackTestAverage = planConfig.backTestedValues.floorPrice.averages

    const { data, isSuccess, isError, isLoading, error } = useGetStockDataUsingStartAndEndDateWithTimeFrameQuery({ ticker: tickerSymbol, dailyCandles: true, timeFrameIncrement: 1, startDate: '2026-04-22T04:00:00.000Z' })

    const [currentDiscount, setCurrentDiscount] = useState('Above Max Pain')
    const [showEntryOrFloor, setShowEntryOrFloor] = useState(0)
    const [patternOrStockChart, setPatternOrStockChart] = useState({ display: false })

    const [markPlanDiscountsReviewed] = useMarkPlanDiscountsReviewedMutation()
    async function attemptMarkingPlanFullyReviewed()
    {
        try
        {
            if (!planConfig.planId) return
            console.log(planConfig.planId)
            const results = await markPlanDiscountsReviewed({ planId: planConfig.planId, tickerSymbol }).unwrap()
            console.log(results)
        } catch (error)
        {

            console.log(error)
        }
    }


    const daysSinceLastReview = discountConfig?.dateReviewed ? differenceInBusinessDays(new Date(), discountConfig.dateReviewed) : undefined

    const [discountPrices, setDiscountPrices] = useState({
        aboveStopLoss: discountConfig?.aboveStopLoss?.price || planConfig.plan.stopLossPrice * 1.02,
        belowStopLoss: discountConfig?.belowStopLoss?.price || planConfig.plan.stopLossPrice * 0.98,
        aboveMaxPain: discountConfig?.aboveMaxPain?.price || maxPainFromPattern * 1.02
    })
    console.log(discountConfig)

    let dailyChart
    let customChartDiscount
    if (isSuccess)
    {
        dailyChart = <DailyChartWrapper ticker={tickerSymbol} candleData={data} uuid={dailyChartUUID}
            chartStartDate={planConfig.relevantCandleDate} chartEndDate={new Date()}
            pricePoints={{ entryPrice: patternConfig.entryStrikeBuffer, floorPrice: patternConfig.channelBottom, exitPrice: patternConfig.channelTop, stopLossPrice: planConfig.plan.stopLossPrice }} 
            currentDiscount={currentDiscount} discountPrices={discountPrices}
            />

        customChartDiscount = <CustomPriceBackTestWrapper
            discountPrices={discountPrices}
            setDiscountPrices={setDiscountPrices}
            exitPrice={patternConfig.channelTop}
            entryPrice={planConfig.plan.stopLossPrice}
            stopLossPrice={planConfig.plan.stopLossPrice}
            maxPainPrice={entryBackTestAverage.lowestPatternValue}
            planId={planConfig.planId}
            tickerSymbol={tickerSymbol}
            currentDiscount={currentDiscount} setCurrentDiscount={setCurrentDiscount}
            relevantCandleDate={planConfig.relevantCandleDate} dateAdded={planConfig.dateAdded} candleData={data}
            patternOrStockChart={patternOrStockChart} setPatternOrStockChart={setPatternOrStockChart}
        />
    }
    else if (isLoading)
    {
        dailyChart = <div>Loading Daily Candles</div>
        customChartDiscount = <div>Loading..</div>

    } else if (isError)
    {
        dailyChart = <div>Error Fetching Daily Candles</div>
        customChartDiscount = <div>Error Fetching Data</div>
    }



    const borderColor = currentDiscount === 'Above Stop' ? 'blue' : currentDiscount === 'Below Stop' ? 'orange' : 'red'
    return (
        <div id='DeepDiscount'>

            <div id='CurrentChartAndBackTest'>
                <div>
                    <h3>{tickerSymbol}</h3>
                </div>
                {patternOrStockChart.display ?
                    <EntryGainPainChartWrapper plan={{ id: tickerSymbol }} entryDate={patternOrStockChart.entryDate} pricePoints={{
                        entryPrice: patternConfig.entryStrikeBuffer, floorPrice: patternConfig.channelBottom,
                        exitPrice: patternConfig.channelTop, stopLossPrice: planConfig.plan.stopLossPrice
                    }} maxGainDate={patternOrStockChart.maxGainDate}
                        maxPainDate={patternOrStockChart.maxPainDate}
                        setPatternOrStockChart={setPatternOrStockChart}
                    />
                    : dailyChart}

                <BackTestTimeLineChart backTests={showEntryOrFloor === 0 ? entryBackTests : floorBackTests}
                    relevantCandleDate={planConfig.relevantCandleDate} entryPriceDisplay={showEntryOrFloor === 0}
                    entry={showEntryOrFloor === 0 ? patternConfig.entryStrikeBuffer : patternConfig.channelBottom}

                    exit={patternConfig.channelTop} stopLoss={planConfig.plan.stopLossPrice}

                    backTestAverage={showEntryOrFloor === 0 ? entryBackTestAverage : floorBackTestAverage} hideText={false}
                    setPatternOrStockChart={setPatternOrStockChart}
                />
            </div>

            <div style={{ border: `3px solid ${borderColor}`, background: `${borderColor}`, borderRadius: '5px' }}>
                {customChartDiscount}
            </div>


            <div id='DiscountSelectionButtons' className='flex'>
                <div style={{ border: `3px solid red`, borderRadius: '5px' }}>
                    {discountConfig?.aboveMaxPain?.price && <p>Max Pain Discount: ${discountConfig.aboveMaxPain.price}</p>}
                    <button onClick={() => { setCurrentDiscount('Above Max Pain'); setPatternOrStockChart({ display: false }) }}>Above Max Pain</button>
                </div>
                <div style={{ border: `3px solid blue`, borderRadius: '5px' }}>
                    {discountConfig?.aboveStopLoss?.price && <p>Above Stop Discount: ${discountConfig.aboveStopLoss.price}</p>}
                    <button onClick={() => { setCurrentDiscount('Above Stop'); setPatternOrStockChart({ display: false }) }}>Above Stop</button>
                </div>
                <div style={{ border: `3px solid orange`, borderRadius: '5px' }}>
                    {discountConfig?.belowStopLoss?.price && <p>Below Stop Discount: ${discountConfig.belowStopLoss.price}</p>}
                    <button onClick={() => { setCurrentDiscount('Below Stop'); setPatternOrStockChart({ display: false }) }}>Below Stop</button>
                </div>


                {discountConfig?.dateReviewed ? <div>
                    <p>Days Since Last Reviewed: {daysSinceLastReview}</p>
                    {daysSinceLastReview > 5 && <button onClick={() => attemptMarkingPlanFullyReviewed()}>Marked Reviewed</button>}

                </div> :
                    <button onClick={() => attemptMarkingPlanFullyReviewed()}>Marked Reviewed</button>
                }
                <br />
                <div>
                    <p>Exit Alert Input:</p>
                </div>
            </div>
        </div>
    )
}

export default DeepDiscount