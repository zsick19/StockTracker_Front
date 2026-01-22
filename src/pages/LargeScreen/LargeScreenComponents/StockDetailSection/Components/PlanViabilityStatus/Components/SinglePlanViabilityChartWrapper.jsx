import React from 'react'
import { enterBufferSelectors, enterExitPlannedSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'
import ChartWithoutPlanFetchChartingWrapper from '../../../../../../../components/ChartSubGraph/ChartWithoutPlanFetchChartingWrapper'
import { ClipboardPen } from 'lucide-react'
import { differenceInCalendarDays } from 'date-fns'
function SinglePlanViabilityChartWrapper({ id, watchList, candleData, 
    selectedPlansForRemoval, handleRemovalToggle, selectedPlansForUpdate, handleUpdateToggle })
{

    function provideSelector(data)
    {
        switch (watchList)
        {
            case 0: return stopLossHitSelectors.selectById(data.stopLossHit, id)
            case 1: return enterBufferSelectors.selectById(data.enterBufferHit, id)
            case 2: return enterExitPlannedSelectors.selectById(data.plannedTickers, id)
        }
    }

    const { plan } = useGetUsersEnterExitPlanQuery(undefined, { selectFromResult: ({ data }) => ({ plan: data ? provideSelector(data) : undefined }) })

    return (
        <div className='SingleViabilityChartBlock' >
            <div onClick={() => handleRemovalToggle(plan.tickerSymbol, plan._id)} className={selectedPlansForRemoval.find((t) => t.tickerSymbol === plan.tickerSymbol) ? 'setForRemoval' : ''}>
                <ChartWithoutPlanFetchChartingWrapper ticker={id} candleData={{ candleData: candleData }}
                    interactionController={{ nonLivePrice: true, nonInteractive: true, nonZoomAble: true }}
                    chartId={plan._id} timeFrame={defaultTimeFrames.threeDayOneMin}
                    planData={plan.plan} mostRecentPrice={plan.mostRecentPrice}
                    initialTrackingPrice={{ price: plan.initialTrackingPrice, date: plan.dateAdded }}
                />
            </div>
            <div className='SingleViabilityChartBlockTitle' onClick={() => handleUpdateToggle(plan.tickerSymbol, plan._id)}>
                {id}
                <p>{differenceInCalendarDays(new Date(), plan.dateAdded)} Days</p>

                <button className='iconButton'>
                    <ClipboardPen size={18} color={selectedPlansForUpdate.find((t) => t.tickerSymbol === plan.tickerSymbol) ? 'green' : 'white'} /> </button>
            </div>
        </div>
    )
}

export default SinglePlanViabilityChartWrapper