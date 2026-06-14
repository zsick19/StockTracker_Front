import React, { useEffect, useMemo, useState } from 'react'
import './DailyCheck.css'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../../features/StockData/StockDataSliceApi'
import { defaultTimeFrames } from '../../../../../../../../Utilities/TimeFrames'
import { X } from 'lucide-react'
import { ChartingToolEdits, PreTradeTools } from '../../../../../../../../Utilities/ChartingTools'
import DailyHighLowChartWrapper from './DailyHighLowChartWrapper'
import * as short from 'short-uuid'
import { setTool } from '../../../../../../../../features/Charting/ChartingTool'
import RSISubChart from '../../../../../../../../components/ChartSubGraph/SubCharts/RSISubChart'
import VortexSubChart from '../../../../../../../../components/ChartSubGraph/SubCharts/VortexSubChart'
import StochasticSubChart from '../../../../../../../../components/ChartSubGraph/SubCharts/StochasticSubChart'
import MACDSubChart from '../../../../../../../../components/ChartSubGraph/SubCharts/MACDSubChart'
import CorrelationSubChart from '../../../../../../../../components/ChartSubGraph/SubCharts/CorrelationSubChart'
import { setChartEditMode } from '../../../../../../../../features/Charting/EditChartSelection'
import { useDispatch, useSelector } from 'react-redux'
import { makeSelectEnterExitByTicker, removeRelevantHighLowInstitution } from '../../../../../../../../features/EnterExitPlans/EnterExitGraphElement'
import { useUpdateEnterExitPlanMutation } from '../../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import CriteriaCheckOff from '../../../TinyPreWatch/Components/CriteriaCheckOff'
import { setFocusStartFinishDate } from '../../../../../../../../features/Charting/GraphMarketHourElement'

function DailyCheck({ plannedTicker, tradeDetails, undoRelevantHighLowChanges, setTradeDetails })
{
    const dispatch = useDispatch()
    console.log(plannedTicker)
    const selectedEnterExitMemo = useMemo(makeSelectEnterExitByTicker, [plannedTicker?.tickerSymbol || plannedTicker?.ticker])
    const EnterExitPlan = useSelector(state => selectedEnterExitMemo(state, plannedTicker?.tickerSymbol || plannedTicker?.ticker))

    const [updateEnterExitPlan] = useUpdateEnterExitPlanMutation()
    async function attemptToUpdateEnterExit() { try { await updateEnterExitPlan({ ticker: plannedTicker?.tickerSymbol || plannedTicker.ticker, chartId: plannedTicker._id }) } catch (error) { console.log(error) } }



    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker: plannedTicker?.tickerSymbol || plannedTicker?.ticker, timeFrame: defaultTimeFrames.dailyHalfYear })

    const uuid = useMemo(() => short.generate(), [])

    let dailyChartContent
    let subChartContent
    if (isSuccess)
    {
        dailyChartContent =
            <DailyHighLowChartWrapper ticker={plannedTicker?.tickerSymbol || plannedTicker.ticker} relevantCandleDate={plannedTicker?.relevantCandleDate} candleData={data} chartingData={plannedTicker}
                interactionController={{ isZoomAble: true, isInteractive: true }}
                uuid={uuid} timeFrame={defaultTimeFrames.dailyHalfYear}
                showEMAs={true}
            />
        subChartContent = <>
            <MACDSubChart timeFrame={defaultTimeFrames.dailyHalfYear} uuid={uuid} candleData={data.candleData} hideTimeLine={true} />
            <RSISubChart timeFrame={defaultTimeFrames.dailyHalfYear} uuid={uuid} candleData={data.candleData} hideTimeLine={true} />
            <StochasticSubChart timeFrame={defaultTimeFrames.dailyHalfYear} uuid={uuid} candleData={data.candleData} hideTimeLine={true} />
            <VortexSubChart timeFrame={defaultTimeFrames.dailyHalfYear} uuid={uuid} candleData={data.candleData} hideTimeLine={true} />
        </>

    } else if (isLoading)
    {
        dailyChartContent = <div>Loading...</div>
        subChartContent = <div>Loading...</div>
    } else if (isError)
    {
        dailyChartContent = <div>Error fetching data</div>
        subChartContent = <div></div>
    }

    function handleRemovingRelevantHighLow(removeHigh, relevantToRemove)
    {
        dispatch(removeRelevantHighLowInstitution({ remove: { chartingElement: { ...relevantToRemove }, group: removeHigh ? 'relevantHigh' : 'relevantLow' }, ticker: plannedTicker?.tickerSymbol || plannedTicker.ticker }))
        attemptToUpdateEnterExit()
    }

    function provideSubCharts()
    {

        return subCharts.map((subChart) =>
        {
            switch (subChart)
            {
                case 'rsi': return <RSISubChart candleData={stockData.candleData} uuid={uuid} timeFrame={timeFrame} />
                case 'vortex': return <VortexSubChart candleData={stockData.candleData} uuid={uuid} timeFrame={timeFrame} />
                case 'stochastic': return <StochasticSubChart candleData={stockData.candleData} uuid={uuid} timeFrame={timeFrame} />
                case 'MACD': return <MACDSubChart candleData={stockData.candleData} uuid={uuid} timeFrame={timeFrame} />
                case 'correlation': return <CorrelationSubChart candleData={stockData.candleData} uuid={uuid} timeFrame={timeFrame} />
            }
        })
    }

    async function attemptCriteriaUpdate()
    {

    }
    console.log(plannedTicker)
    function handleFocusDateChange(e)
    {
        dispatch(setFocusStartFinishDate({ uuid: uuid, focusDates: e.target.id, relevantCandleDate: plannedTicker?.relevantCandleDate }))
    }


    return (
        <div id='DailyCheck'>
            <div id='DailyHighLowChartAndActions'>
                <div id='DailyHighLowChart'>
                    <div className='flex'>
                        <h2>{plannedTicker?.tickerSymbol || plannedTicker.ticker}</h2>
                        <fieldset onChange={(e) => handleFocusDateChange(e)} className='flex'>
                            <input type="radio" name="sixOrRelevant" id="sixMonths" className='hiddenRadioInput' defaultChecked />
                            <label htmlFor="sixMonths" className='clickableLabel'>6 Month</label>

                            <input type="radio" name="sixOrRelevant" id="relevantDate" className='hiddenRadioInput' />
                            <label htmlFor="relevantDate" className='clickableLabel'>Relevant</label>

                            <input type="radio" name="sixOrRelevant" id="twentyDay" className='hiddenRadioInput' />
                            <label htmlFor="twentyDay" className='clickableLabel'>20 Days</label>
                        </fieldset >
                    </div>
                    <div className='chartAndSubCharts'>
                        <div>
                            {dailyChartContent}
                            {subChartContent}
                        </div>
                        <div>

                            {PreTradeTools.map((t) => <button className='buttonIcon' title={t.tool} onClick={() => dispatch(setTool(t.tool))}>{t.icon}</button>)}
                            <p className='veryTinyText'>Edit</p>
                            {ChartingToolEdits.map((editTool, index) =>
                            {
                                return <button key={editTool.editTool} className='buttonIcon'
                                    title={editTool.editTool} onClick={() => dispatch(setChartEditMode(editTool.editTool))}>{editTool.icon}</button>
                            })}
                        </div>
                    </div>
                </div>

                <div id='ListedOutRelevantHighLows'>
                    <div>
                        <p>Relevant Highs</p>
                        {EnterExitPlan?.relevantHighs && EnterExitPlan.relevantHighs.map((t, index) =>
                            <div className='flex'>
                                <p>{t.price}</p>
                                <button className='buttonIcon' onClick={() => handleRemovingRelevantHighLow(true, t)}><X color='red' /></button>
                            </div>
                        )}
                    </div>

                    <div>
                        <p>Relevant Lows</p>
                        {EnterExitPlan?.relevantLows && EnterExitPlan.relevantLows.map((t, index) =>
                            <div className='flex'>
                                <p>{t.price}</p>
                                <button className='buttonIcon' onClick={() => handleRemovingRelevantHighLow(false, t)}><X color='red' /></button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CriteriaCheckOff attemptCriteriaUpdate={attemptCriteriaUpdate} plan={EnterExitPlan} />





        </div>
    )
}

export default DailyCheck