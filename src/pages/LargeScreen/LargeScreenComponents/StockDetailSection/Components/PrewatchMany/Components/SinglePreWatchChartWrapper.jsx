import React from 'react'
import { enterBufferSelectors, enterExitPlannedSelectors, highImportanceAdapter, highImportanceSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import ChartWithoutPlanFetchChartingWrapper from '../../../../../../../components/ChartSubGraph/ChartWithoutPlanFetchChartingWrapper'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'
import { useDispatch } from 'react-redux'
import { setSingleChartTickerTimeFrameChartIdPlanIdForTrade } from '../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'

function SinglePreWatchChartWrapper({ id, watchList, candleData })
{

    function provideSelector(data)
    {
        switch (watchList)
        {
            case 0: return stopLossHitSelectors.selectById(data.stopLossHit, id)
            case 1: return enterBufferSelectors.selectById(data.enterBufferHit, id)
            case 2: return enterExitPlannedSelectors.selectById(data.plannedTickers, id)
            case 3: return highImportanceSelectors.selectById(data.highImportance, id)
        }
    }

    const { plan } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: ({ data }) => ({ plan: data ? provideSelector(data) : undefined }) })

    const dispatch = useDispatch()

    function handleTradeView()
    {
        dispatch(setSingleChartTickerTimeFrameChartIdPlanIdForTrade({ ticker: plan.tickerSymbol, chartId: plan._id, planId: plan._id, plan }))
        dispatch(setStockDetailState(8))
    }

    return (
        <div className='SinglePreWatchChartBlock'>
            <div>
                <ChartWithoutPlanFetchChartingWrapper
                    ticker={id} candleData={{ candleData: candleData }}
                    interactionController={{ isLivePrice: true, isInteractive: false, isZoomAble: true }}
                    chartId={plan._id} timeFrame={defaultTimeFrames.threeDayOneMin}
                    planData={plan.plan} mostRecentPrice={plan.mostRecentPrice}
                    initialTrackingPrice={{ price: plan.initialTrackingPrice, date: plan.dateAdded }}
                />
            </div>
            <div className='PreWatchChartBlockTitle'>
                {id}
                <button onClick={() => handleTradeView()}>Trade</button>
            </div>
        </div>
    )
}

export default SinglePreWatchChartWrapper