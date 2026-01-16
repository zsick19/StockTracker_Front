import React, { useState } from 'react'
import { enterBufferSelectors, enterExitPlannedSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
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

    function handleSingleViewTicker()
    {
        dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: plan.tickerSymbol, chartId: plan._id }))
        dispatch(setStockDetailState(5))
    }
    function handleFourWaySplit()
    {
        dispatch(setSelectedStockAndTimelineFourSplit({ ticker: plan.tickerSymbol, chartId: plan._id }))
        dispatch(setStockDetailState(0))
    }
    function handleTradeView()
    {
        dispatch(setSingleChartTickerTimeFrameChartIdPlanIdForTrade({ ticker: plan.tickerSymbol, chartId: plan._id, planId: plan._id, plan }))
        dispatch(setStockDetailState(8))
    }

    return (
        <>
            {showDiagram ?
                <div className='SingleTickerDiagram' onClick={() => setShowDiagram(false)}>
                    <HorizontalPlanDiagram mostRecentPrice={plan.mostRecentPrice} planPricePoints={plan.plan} initialTrackingPrice={plan.initialTrackingPrice} />
                    <button className='iconButton' onClick={(e) => e.stopPropagation()}> <X size={16} color='white' /></button>
                </div> :
                <div className={`SingleWatchListTicker`}>
                    <p onClick={handleSingleViewTicker} onDoubleClick={handleFourWaySplit}>{plan.tickerSymbol}</p>
                    <p onClick={handleTradeView}>${plan.mostRecentPrice.toFixed(2)}</p>
                    <p onClick={() => setShowDiagram(true)}>{plan.currentDayPercentGain.toFixed()}%</p>
                    <p>{plan.percentFromEnter.toFixed(2)}%</p>
                </div>
            }
        </>
    )
}

export default SinglePlannedTickerDisplay