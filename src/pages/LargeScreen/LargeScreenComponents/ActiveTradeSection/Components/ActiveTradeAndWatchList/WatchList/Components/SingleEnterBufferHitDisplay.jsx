import React, { useState } from 'react'
import { enterBufferSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { CircleChevronLeft, CircleChevronRight, X } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setSelectedStockAndTimelineFourSplit, setSingleChartTickerTimeFrameAndChartingId, setSingleChartTickerTimeFrameChartIdPlanIdForTrade } from '../../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'

function SingleEnterBufferHitDisplay({ id })
{
    const dispatch = useDispatch()
    const [showDiagram, setShowDiagram] = useState(false)

    const { plan } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: ({ data }) => ({ plan: data ? enterBufferSelectors.selectById(data.enterBufferHit, id) : undefined }) })



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
        <div className='SingleBufferHitWatchList'>
            {showDiagram ?
                <div className='SingleTickerDiagram'>
                    Diagram Of Position
                    <div className='flex'>
                        <button className='iconButton' onClick={() => setShowDiagram(false)}><CircleChevronLeft /></button>
                        <button className='iconButton'> <X /></button>
                    </div>
                </div> :
                <div className='SingleWatchListTicker'>
                    <p onClick={handleSingleViewTicker} onDoubleClick={handleFourWaySplit}>{plan.tickerSymbol}</p>
                    <p onClick={handleTradeView}>${plan.mostRecentPrice}</p>
                    <p>{plan.currentDayPercentGain.toFixed(2)}%</p>

                    <p>{plan.percentFromEnter.toFixed()}%</p>
                    <button className='iconButton' onClick={() => setShowDiagram(true)}>
                        <CircleChevronRight size={12} color='white' /></button>

                </div>
            }
        </div>
    )
}

export default SingleEnterBufferHitDisplay