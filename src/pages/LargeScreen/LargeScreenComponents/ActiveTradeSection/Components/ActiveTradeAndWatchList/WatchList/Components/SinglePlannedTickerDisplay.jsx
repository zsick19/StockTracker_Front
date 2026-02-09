import React, { useState } from 'react'
import { enterBufferSelectors, enterExitPlannedSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery, useRemoveSingleEnterExitPlanMutation, useToggleEnterExitPlanImportantMutation } from '../../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { CircleChevronRight, CircleChevronLeft, X, Trash2, AlertCircle, Undo2 } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setSelectedStockAndTimelineFourSplit, setSingleChartTickerTimeFrameAndChartingId, setSingleChartTickerTimeFrameChartIdPlanIdForTrade } from '../../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import HorizontalPlanDiagram from './PlanPricingDiagram/HorizontalPlanDiagram'

function SinglePlannedTickerDisplay({ id, watchList })
{
    const dispatch = useDispatch()
    const [showDiagram, setShowDiagram] = useState(false)
    const [showImportantRemove, setShowImportantRemove] = useState(false)
    const [showChangeFromYesterday, setShowChangeFromYesterday] = useState(false)
    const [showPlanNumbers, setShowPlanNumbers] = useState(false)
    const [showConfirmRemove, setShowConfirmRemove] = useState(false)

    const [toggleEnterExitPlanImportant] = useToggleEnterExitPlanImportantMutation()
    const [removeSingleEnterExitPlan] = useRemoveSingleEnterExitPlanMutation()

    function provideSelector(data)
    {
        switch (watchList)
        {
            case 0: return enterBufferSelectors.selectById(data.enterBufferHit, id)
            case 1: return stopLossHitSelectors.selectById(data.stopLossHit, id)
            case 2: return enterExitPlannedSelectors.selectById(data.plannedTickers, id)
        }
    }
    const { plan } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: ({ data }) => ({ plan: data ? provideSelector(data) : undefined }) })


    function handleFourWaySplit()
    {
        dispatch(setSelectedStockAndTimelineFourSplit({ ticker: plan.tickerSymbol, chartId: plan._id, tickerSector: plan.sector, planId: plan._id, plan: plan }))
        dispatch(setStockDetailState(0))
    }
    function handleTradeView()
    {
        dispatch(setSingleChartTickerTimeFrameChartIdPlanIdForTrade({ ticker: plan.tickerSymbol, tickerSector: plan.sector, chartId: plan._id, planId: plan._id, plan: plan.plan }))
        dispatch(setStockDetailState(8))
    }

    async function attemptToToggleImportance(params)
    {
        try
        {
            const results = await toggleEnterExitPlanImportant({ tickerSymbol: plan.tickerSymbol, planId: plan._id, markImportant: true }).unwrap()
        } catch (error)
        {
            console.log(error)
        }
    }
    async function attemptToRemovePlan(params)
    {
        try
        {
            const results = await removeSingleEnterExitPlan({ tickerSymbol: plan.tickerSymbol, planId: plan._id }).unwrap()
        } catch (error)
        {
            console.log(error)
        }
    }

    return (
        <>
            {showDiagram ?
                <div className='SingleTickerDiagram' onClick={() => setShowPlanNumbers(prev => !prev)} onMouseLeave={() => setShowDiagram(false)}>
                    {showPlanNumbers ? <div className='flex'>
                        <p>${plan.plan.stopLossPrice}</p>
                        <p>--${plan.plan.enterPrice}</p>
                        <p>--${plan.plan.enterBufferPrice}</p>
                        <p>Cur: ${plan.mostRecentPrice.toFixed(2)}</p>
                    </div> :
                        <HorizontalPlanDiagram mostRecentPrice={plan.mostRecentPrice} planPricePointObject={plan.plan} initialTrackingPrice={plan.initialTrackingPrice} />
                    }
                </div> :

                <div className={`SingleWatchListTicker ${plan.listChange ? 'blinkForListUpdate' : ''} ${plan.changeFromYesterdayClose === 0 ? 'trackingNeutral' : plan.changeFromYesterdayClose > 0 ? 'trackingPositive' : 'trackingNegative'}`}>
                    <p onClick={handleFourWaySplit}>{plan.tickerSymbol}</p>

                    {showImportantRemove ?
                        showConfirmRemove ?
                            <>
                                <button className='buttonIcon' onClick={() => attemptToRemovePlan()}><Trash2 size={14} color='red' /></button>
                                <button className='buttonIcon' onClick={() => setShowConfirmRemove(false)}><Undo2 color='white' size={14} /></button>
                                <button className='buttonIcon' onClick={() => { setShowConfirmRemove(false); setShowImportantRemove(false) }}><X color='white' size={14} /></button>
                            </> :
                            <>
                                <button className='buttonIcon' onClick={() => attemptToToggleImportance()}><AlertCircle size={14} color='white' /></button>
                                <button className='buttonIcon' onClick={() => setShowConfirmRemove(true)}><Trash2 size={14} color='white' /></button>
                                <button className='buttonIcon' onClick={() => setShowImportantRemove(false)}><X color='white' size={14} /></button>
                            </>

                        :
                        <>
                            <p onClick={handleTradeView}>${plan.mostRecentPrice.toFixed(2)}</p>
                            <p onMouseEnter={() => setShowDiagram(true)}>{(plan.percentFromEnter * -1).toFixed(2)}%</p>
                            <div onClick={() => setShowImportantRemove(true)} onMouseEnter={() => setShowChangeFromYesterday(true)} onMouseLeave={() => setShowChangeFromYesterday(false)}>
                                {showChangeFromYesterday ? <p>{plan.changeFromYesterdayClose.toFixed(2)}</p>
                                    : <p>{plan.currentDayPercentGain.toFixed(2)}%</p>
                                }
                            </div>
                        </>}
                </div >
            }
        </>
    )
}

export default SinglePlannedTickerDisplay