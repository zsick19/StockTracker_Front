import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedStockAndTimelineFourSplit, setSingleChartTickerTimeFrameChartIdPlanIdForTrade } from '../../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState, setStockDetailStateWithTicker } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { fiveMinSelectors, useRemoveSingleEnterExitPlanMutation, useToggleEnterExitPlanImportantMutation } from '../../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import MiniFiveMinChart from '../../../../../StockDetailSection/Components/TinyPreWatch/Components/MiniFiveMinChart'
import { Check, CheckCircle, CheckCircle2, Info, Undo2, X } from 'lucide-react'
import TwoDayFiveMinChart from './TwoDayFiveMinChart'
import { sectorToTicker } from '../../../../../../../../Utilities/SectorsAndIndustries'
import { initiateTickerPreCheck } from '../../../../../../../../features/Trades/PreTradeCheckSlice'

function PreCheckedTickerDisplay({ plan })
{
    const tickerData = useSelector(state => fiveMinSelectors.selectById(state, plan?.tickerSymbol))
    let direction = plan?.todayOpenPrice < plan?.mostRecentPrice
    const [showDoubleCheckRemove, setShowDoubleCheckRemove] = useState(false)

    const dispatch = useDispatch()
    function handleFourWaySplit()
    {
        dispatch(setSelectedStockAndTimelineFourSplit({ ticker: plan.tickerSymbol, chartId: plan._id, tickerSector: plan.sector, planId: plan._id, plan: plan }))
        dispatch(setStockDetailState(0))
    }

    function handleTradeView()
    {
        dispatch(setSingleChartTickerTimeFrameChartIdPlanIdForTrade({
            ticker: plan.tickerSymbol, tickerSector: plan.sector,
            chartId: plan._id, planId: plan._id, plan: plan
        }))
        dispatch(setStockDetailState(8))
    }

    function handleStockToTradeChart()
    {
        dispatch(setSingleChartToTickerTimeFrameTradeId({ tickerSymbol: activeTrade.tickerSymbol, chartId: activeTrade._id, planId: activeTrade._id, trade: activeTrade }))
        dispatch(setStockDetailState(8))
    }


    function handleFinalPreCheckView()
    {
        dispatch(initiateTickerPreCheck({
            ticker: plan.tickerSymbol, tickerSector: plan.sector,
            chartId: plan._id, planId: plan._id, plan: plan
        }))
        dispatch(setStockDetailState(20))
    }

    const [toggleEnterExitPlanImportant] = useToggleEnterExitPlanImportantMutation()
    async function attemptToToggleImportance()
    {
        try
        {
            const results = await toggleEnterExitPlanImportant({ tickerSymbol: plan.tickerSymbol, planId: plan._id, markImportant: false }).unwrap()
        } catch (error)
        {
            console.log(error)
        }
    }
    return (
        <div className='SinglePreChecked'>
            <div className='SinglePreCheckTicker'>
                <h2 onClick={handleFourWaySplit}>{plan.tickerSymbol}</h2>
                <p className={direction > 0 ? 'greenText' : 'redText'}>${plan.mostRecentPrice.toFixed(2)}</p>
                <p className={direction > 0 ? 'greenText' : 'redText'}> {plan.currentDayPercentGain.toFixed(2)}%</p>
                {showDoubleCheckRemove ? <button className='buttonIcon' onClick={attemptToToggleImportance}><Info size={14} color='red' /></button> :
                    <p>{plan.changeFromYesterdayClose.toFixed(2)} / {plan.dailyTickerValues.atr} ATR</p>}
                {showDoubleCheckRemove ? <button className='buttonIcon' onClick={() => setShowDoubleCheckRemove(false)}><Undo2 size={14} color='white' /></button> :
                    <button className='buttonIcon' onClick={() => setShowDoubleCheckRemove(true)}><Info size={14} color='orange' /></button>}
            </div>


            <div className='TwoDayGraphSector'>
                <div>
                    <MiniFiveMinChart candleData={tickerData.candleData} openPrice={plan?.todayOpenPrice} direction={direction}
                        enterPrice={plan?.plan.enterPrice} stopLossPrice={plan?.plan.stopLossPrice}
                        enterBufferPrice={plan?.plan.enterBufferPrice} yesterdayCandles={true} />
                    <MiniFiveMinChart candleData={tickerData.candleData} openPrice={plan?.todayOpenPrice} direction={direction}
                        enterPrice={plan?.plan.enterPrice} stopLossPrice={plan?.plan.stopLossPrice}
                        enterBufferPrice={plan?.plan.enterBufferPrice} />
                </div>

                <div onClick={handleTradeView} >
                    <p>${plan.with1000DollarsCurrentGain.toFixed()}</p>
                    <p>Gain</p>
                </div>
            </div>

            <div className='SinglePreCheckTicker'>
                <p onClick={handleFinalPreCheckView}>{-1 * plan.percentFromEnter.toFixed(2)}% To Enter</p>
                <p>{plan.plan.percents[0]} vs {plan.plan.percents[3]}</p>
                <p onClick={() => dispatch(setStockDetailStateWithTicker({ detail: 19, ticker: sectorToTicker[plan.sector] }))} >{plan.sector}</p>
            </div>
        </div>
    )
}

export default PreCheckedTickerDisplay