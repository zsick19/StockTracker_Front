import React, { useState } from 'react'
import { enterBufferSelectors, enterExitPlannedSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery, useToggleEnterExitPlanImportantMutation } from '../../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { CircleChevronRight, CircleChevronLeft, X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setSelectedStockAndTimelineFourSplit, setSingleChartTickerTimeFrameAndChartingId, setSingleChartTickerTimeFrameChartIdPlanIdForTrade } from '../../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import HorizontalPlanDiagram from './PlanPricingDiagram/HorizontalPlanDiagram'

function SinglePlannedTickerDisplay({ id, watchList })
{
    const dispatch = useDispatch()
    const [showDiagram, setShowDiagram] = useState(false)

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


    const [showImportantRemove, setShowImportantRemove] = useState(false)

    const [toggleEnterExitPlanImportant, { }] = useToggleEnterExitPlanImportantMutation()
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
    return (
        <>
            {showDiagram ?
                <div className='SingleTickerDiagram' onClick={() => setShowDiagram(false)}>
                    <HorizontalPlanDiagram mostRecentPrice={plan.mostRecentPrice} planPricePointObject={plan.plan} initialTrackingPrice={plan.initialTrackingPrice} />
                </div> :
                <div className={`SingleWatchListTicker ${plan.listChange ? 'blinkForListUpdate' : ''}`}>
                    <p onClick={handleFourWaySplit}>{plan.tickerSymbol}</p>

                    {showImportantRemove ? <>
                        <button className='buttonIcon' onClick={() => attemptToToggleImportance()}>Important</button>
                        <button className='buttonIcon'>Remove</button>
                        <button className='buttonIcon' onClick={() => setShowImportantRemove(false)}><X color='white' size={14} /></button>
                    </> :
                        <>
                            <p onClick={handleTradeView}>${plan.mostRecentPrice.toFixed(2)}</p>
                            <p onClick={() => setShowDiagram(true)}>{plan.currentDayPercentGain.toFixed()}%</p>
                            <p onClick={() => setShowImportantRemove(true)}>{plan.percentFromEnter.toFixed(2)}%</p>
                        </>
                    }

                </div>
            }
        </>
    )
}

export default SinglePlannedTickerDisplay