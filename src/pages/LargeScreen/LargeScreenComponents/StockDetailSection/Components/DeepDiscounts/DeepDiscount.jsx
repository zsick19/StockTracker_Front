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
    const floorBackTests = planConfig.backTestedValues.floorPrice.backTests
    const floorBackTestAverage = planConfig.backTestedValues.floorPrice.averages

    const { data, isSuccess, isError, isLoading, error } = useGetStockDataUsingStartAndEndDateWithTimeFrameQuery({ ticker: tickerSymbol, dailyCandles: true, timeFrameIncrement: 1, startDate: '2026-04-22T04:00:00.000Z' })

    const [currentDiscount, setCurrentDiscount] = useState('Above Stop')
    const [showEntryOrFloor, setShowEntryOrFloor] = useState(0)
    const [patternOrStockChart, setPatternOrStockChart] = useState({ display: false })


    let dailyChart
    let customChartDiscount


    if (isSuccess)
    {
        dailyChart = <DailyChartWrapper ticker={tickerSymbol} candleData={data} uuid={dailyChartUUID}
            chartStartDate={planConfig.relevantCandleDate} chartEndDate={new Date()}
            pricePoints={{
                entryPrice: patternConfig.entryStrikeBuffer, floorPrice: patternConfig.channelBottom,
                exitPrice: patternConfig.channelTop, stopLossPrice: planConfig.plan.stopLossPrice
            }} />

        customChartDiscount = <CustomPriceBackTestWrapper

            exitPrice={patternConfig.channelTop}
            entryPrice={planConfig.plan.stopLossPrice}
            stopLossPrice={planConfig.plan.stopLossPrice}
            maxPainPrice={entryBackTestAverage.lowestPatternValue}


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

    const sampleCurrentDiscounts = {
        aboveStop: { level: 0, entryPrice: undefined },
        belowStop: { level: 1, entryPrice: undefined },
        aboveMaxPain: { level: 2, entryPrice: undefined }
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
                    backTestAverage={showEntryOrFloor === 0 ? entryBackTestAverage : floorBackTestAverage} hideText={false}
                    exit={patternConfig.channelTop} stopLoss={planConfig.plan.stopLossPrice} setPatternOrStockChart={setPatternOrStockChart}
                />
            </div>

            <div style={{ border: `3px solid ${borderColor}`, background: `${borderColor}`, borderRadius: '5px' }}>
                {customChartDiscount}
            </div>


            <div id='DiscountSelectionButtons' className='flex'>
                <div style={{ border: `3px solid blue`, borderRadius: '5px' }}>
                    {sampleCurrentDiscounts.aboveStop.entryPrice ?
                        <>
                            <p>Above Stop</p>
                            <p>Deep Discount: ${sampleCurrentDiscounts.aboveStop.entryPrice}</p>
                            <button>Edit</button>
                            <button>Remove</button>
                        </> : <button onClick={() => { setCurrentDiscount('Above Stop'); setPatternOrStockChart({ display: false }) }}>Above Stop</button>
                    }
                </div>
                <div style={{ border: `3px solid orange`, borderRadius: '5px' }}>
                    {sampleCurrentDiscounts.belowStop.entryPrice ?
                        <>
                            <p>Below Stop</p>
                            <p>Deep Discount: ${sampleCurrentDiscounts.belowStop.entryPrice}</p>
                            <button>Edit</button>
                            <button>Remove</button>
                        </> : <button onClick={() => { setCurrentDiscount('Below Stop'); setPatternOrStockChart({ display: false }) }}>Below Stop</button>
                    }
                </div>
                <div style={{ border: `3px solid red`, borderRadius: '5px' }}>
                    {sampleCurrentDiscounts.aboveMaxPain.entryPrice ?
                        <>
                            <p>Max Pain</p>
                            <p>Deep Discount: ${sampleCurrentDiscounts.aboveMaxPain.entryPrice}</p>
                            <button>Edit</button>
                            <button>Remove</button>
                        </> : <button onClick={() => { setCurrentDiscount('Above Max Pain'); setPatternOrStockChart({ display: false }) }}>Above Max Pain</button>
                    }
                </div>
                <button>Marked Reviewed</button>
                <div>
                    <p>Exit Alert Input:</p>
                </div>
            </div>
        </div>
    )
}

export default DeepDiscount