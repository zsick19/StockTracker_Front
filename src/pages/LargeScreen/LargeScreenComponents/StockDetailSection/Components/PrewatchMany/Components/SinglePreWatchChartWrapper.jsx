import React, { useMemo } from 'react'
import { enterBufferSelectors, enterExitPlannedSelectors, highImportanceAdapter, highImportanceSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import ChartWithoutPlanFetchChartingWrapper from '../../../../../../../components/ChartSubGraph/ChartWithoutPlanFetchChartingWrapper'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'
import { useDispatch } from 'react-redux'
import { setSelectedStockAndTimelineFourSplit, setSingleChartTickerTimeFrameChartIdPlanIdForTrade } from '../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { setStockDetailState } from '../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import * as short from 'short-uuid'
import { calculateCurrentRSI } from '../../../../../../../Utilities/technicalIndicatorFunctions'

function SinglePreWatchChartWrapper({ id, watchList, candleData, lastCandleData, mostRecentPrice })
{

    function provideSelector(data)
    {
        switch (watchList)
        {
            case 0: return enterBufferSelectors.selectById(data.enterBufferHit, id)
            case 1: return stopLossHitSelectors.selectById(data.stopLossHit, id)
            case 2: return enterExitPlannedSelectors.selectById(data.plannedTickers, id)
            case 3: return highImportanceSelectors.selectById(data.highImportance, id)
        }
    }

    const { plan } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: ({ data }) => ({ plan: data ? provideSelector(data) : undefined }) })

    const RSIValue = useMemo(() => calculateCurrentRSI(candleData, lastCandleData), [])

    const dispatch = useDispatch()

    function handleFourWaySplit()
    {

        dispatch(setSelectedStockAndTimelineFourSplit({ ticker: plan.tickerSymbol, chartId: plan._id }))
        dispatch(setStockDetailState(0))
    }
    function handleTradeView()
    {
        dispatch(setSingleChartTickerTimeFrameChartIdPlanIdForTrade({ ticker: plan.tickerSymbol, tickerSector: plan.sector, watchList, chartId: plan._id, planId: plan._id, plan }))
        dispatch(setStockDetailState(8))
    }

    const uuid = useMemo(() => short.generate(), [])

    return (
        <div className='SinglePreWatchChartBlock'>
            <div>
                <ChartWithoutPlanFetchChartingWrapper uuid={uuid} isUpdatedByPlan={true}
                    ticker={id} candleData={{ candleData: candleData }}
                    interactionController={{ isLivePrice: true, isInteractive: false, isZoomAble: true }}
                    chartId={plan._id} timeFrame={defaultTimeFrames.dailyMonth}
                    planData={plan.plan} mostRecentPrice={plan.mostRecentPrice}
                    lastCandleData={lastCandleData}
                    initialTrackingPrice={{ price: plan.initialTrackingPrice, date: plan.dateAdded }}
                />
            </div>
            <div className='PreWatchChartBlockTitle'>
                <button onClick={() => handleTradeView()} onContextMenu={(e) => { e.preventDefault(); handleFourWaySplit() }}>{id}</button>
                <p>RSI: {RSIValue.toFixed()}</p>
                <p>${plan.with1000DollarsCurrentRisk.toFixed(2)} vs ${plan.with1000DollarsCurrentGain.toFixed(2)}</p>
                <p>{plan.sector}</p>
            </div>
        </div>
    )
}

export default SinglePreWatchChartWrapper