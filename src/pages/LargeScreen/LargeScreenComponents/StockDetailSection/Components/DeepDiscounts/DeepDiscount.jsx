import React, { useMemo, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { selectPlanForStaticDetails } from '../../../../../../features/Engine/EnginePlanApiSlice';
import './DeepDiscount.css'
import { useGetStockDataUsingStartAndEndDateWithTimeFrameQuery } from '../../../../../../features/StockData/StockDataSliceApi';
import BackTestTimeLineChart from '../IntegratedPlanView/Components/SubComponents/BackTestTimeLineChart';
import CustomPriceBackTestWrapper from './Components/CustomPriceBackTestWrapper';
import * as short from 'short-uuid'
import DailyChartWrapper from '../../../../../../components/ChartSubGraph/DailyChartWrapper';
import EntryGainPainChartWrapper from '../IntegratedPlanView/Components/SubComponents/EntryGainPainChartWrapper';
import { useGenerateOrUpdateExitAlertMutation, useMarkPlanDiscountsReviewedMutation, useRemoveExitPriceAlertMutation } from '../../../../../../features/DeepDiscountEngine/EngineDeepDiscountApiSlice';
import { differenceInBusinessDays } from 'date-fns';
import GraphLoadingSpinner from '../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner';
import GraphLoadingError from '../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError';
import { setStockDetailStateWithTicker } from '../../../../../../features/SelectedStocks/StockDetailControlSlice';

function DeepDiscount({ tickerSymbol })
{
    const dispatch = useDispatch()
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


    const [exitAlertPrice, setExitAlertPrice] = useState(planConfig.plan?.exitAlertPrice || patternConfig.channelTop)
    const [exitAlertIncrement, setExitAlertIncrement] = useState(0.01)
    const hasExitAlert = planConfig.plan?.exitAlertPrice
    const [generateOrUpdateExitAlert] = useGenerateOrUpdateExitAlertMutation()
    const [removeExitPriceAlert] = useRemoveExitPriceAlertMutation()
    async function attemptGenerateOrUpdateExitPriceAlert()
    {
        try
        {
            const results = await generateOrUpdateExitAlert({ planId: planConfig.planId, tickerSymbol, exitPrice: exitAlertPrice }).unwrap()
            console.log(results)
        } catch (error)
        {
            console.log(error)
        }
    }
    async function attemptRemovingExitPriceAlert()
    {
        try
        {
            const results = await removeExitPriceAlert({ planId: planConfig.planId, tickerSymbol }).unwrap()
            console.log(results)
        } catch (error)
        {
            console.log(error)
        }
    }





    const [discountPrices, setDiscountPrices] = useState({
        aboveStopLoss: discountConfig?.aboveStopLoss?.price || planConfig.plan.stopLossPrice * 1.02,
        belowStopLoss: discountConfig?.belowStopLoss?.price || planConfig.plan.stopLossPrice * 0.98,
        aboveMaxPain: discountConfig?.aboveMaxPain?.price || maxPainFromPattern * 1.02
    })



    let dailyChart
    let customChartDiscount
    if (isSuccess)
    {
        dailyChart = <DailyChartWrapper ticker={tickerSymbol} candleData={data} uuid={dailyChartUUID}
            chartStartDate={planConfig.relevantCandleDate} chartEndDate={new Date()}
            pricePoints={{ entryPrice: patternConfig.entryStrikeBuffer, floorPrice: patternConfig.channelBottom, exitPrice: patternConfig.channelTop, stopLossPrice: planConfig.plan.stopLossPrice }}
            currentDiscount={currentDiscount} discountPrices={discountPrices} exitAlertPrice={exitAlertPrice}
        />

        customChartDiscount = <CustomPriceBackTestWrapper candleData={data} discountPrices={discountPrices} setDiscountPrices={setDiscountPrices} tickerSymbol={tickerSymbol}
            currentDiscount={currentDiscount} setCurrentDiscount={setCurrentDiscount} patternOrStockChart={patternOrStockChart} setPatternOrStockChart={setPatternOrStockChart}

            exitPrice={patternConfig.channelTop} entryPrice={planConfig.plan.stopLossPrice} stopLossPrice={planConfig.plan.stopLossPrice}
            maxPainPrice={entryBackTestAverage.lowestPatternValue} planId={planConfig.planId} relevantCandleDate={planConfig.relevantCandleDate}
            dateAdded={planConfig.dateAdded}
        />
    }
    else if (isLoading)
    {
        dailyChart = <GraphLoadingSpinner />
        customChartDiscount = <div>Loading..</div>

    } else if (isError)
    {
        dailyChart = <GraphLoadingError refetch={refetch} />
        customChartDiscount = <div>Error Fetching Data</div>
    }


    const borderColor = currentDiscount === 'Above Stop' ? 'blue' : currentDiscount === 'Below Stop' ? 'orange' : 'red'

    return (
        <div id='DeepDiscount'>

            <div id='CurrentChartAndBackTest'>
                <div className='flex'>
                    <h3>{tickerSymbol}</h3>
                    <button onClick={() => dispatch(setStockDetailStateWithTicker({ detail: 21, ticker: tickerSymbol }))}>Integrated View</button>
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
                <div style={{ backgroundColor: 'red', borderRadius: '5px' }}>
                    {discountConfig?.aboveMaxPain?.price && <p>${discountConfig.aboveMaxPain.price}</p>}
                    <button onClick={() => { setCurrentDiscount('Above Max Pain'); setPatternOrStockChart({ display: false }) }}>Above Max Pain</button>
                </div>
                <div style={{ backgroundColor: 'blue', borderRadius: '5px' }}>
                    {discountConfig?.aboveStopLoss?.price && <p>${discountConfig.aboveStopLoss.price}</p>}
                    <button onClick={() => { setCurrentDiscount('Above Stop'); setPatternOrStockChart({ display: false }) }}>Above Stop</button>
                </div>
                <div style={{ backgroundColor: 'orange', borderRadius: '5px' }}>
                    {discountConfig?.belowStopLoss?.price && <p>${discountConfig.belowStopLoss.price}</p>}
                    <button onClick={() => { setCurrentDiscount('Below Stop'); setPatternOrStockChart({ display: false }) }}>Below Stop</button>
                </div>


                {discountConfig?.dateReviewed ? <div>
                    <p>Days Since Last Reviewed: {daysSinceLastReview}</p>
                    {daysSinceLastReview > 5 &&
                        <button className='pulsingNeedMarkedReviewed' onClick={() => attemptMarkingPlanFullyReviewed()}>Marked Reviewed</button>}

                </div> :
                    <div>
                        <button className='pulsingNeedMarkedReviewed' onClick={() => attemptMarkingPlanFullyReviewed()}>Marked Reviewed</button>

                    </div>
                }


                <div>
                    <div className='flex'>
                        <p>Exit Alert: ${exitAlertPrice} </p>
                        <button onClick={() => setExitAlertPrice(prev => parseFloat((prev - exitAlertIncrement).toFixed(3)))}>Down ${exitAlertIncrement}</button>
                        <button onClick={() => setExitAlertPrice(prev => parseFloat((prev + exitAlertIncrement).toFixed(3)))}>Up ${exitAlertIncrement}</button>
                    </div>
                    <div className='flex'>
                        <div>
                            <button onClick={() => setExitAlertIncrement(0.01)}>1c</button>
                            <button onClick={() => setExitAlertIncrement(0.05)}>5c</button>
                            <button onClick={() => setExitAlertIncrement(0.25)}>25c</button>
                            <button onClick={() => setExitAlertIncrement(1)}>$1</button>
                        </div>
                        <div>
                            <button onClick={() => attemptGenerateOrUpdateExitPriceAlert()}>{hasExitAlert ? 'Update' : 'Initiate'} Exit Alert</button>
                            {hasExitAlert && <button onClick={() => attemptRemovingExitPriceAlert()}>Remove</button>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeepDiscount