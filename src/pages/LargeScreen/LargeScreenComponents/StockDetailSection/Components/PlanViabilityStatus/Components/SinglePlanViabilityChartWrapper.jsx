import React from 'react'
import { enterBufferSelectors, enterExitPlannedSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import ChartWithChartingWrapper from '../../../../../../../components/ChartSubGraph/ChartWithChartingWrapper'
import { defaultTimeFrames } from '../../../../../../../Utilities/TimeFrames'
function SinglePlanViabilityChartWrapper({ id, watchList, candleData, selectedPlansForRemoval, handleRemovalToggle, selectedPlansForUpdate, handleUpdateToggle })
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
                <ChartWithChartingWrapper ticker={id} candleData={{ candleData: candleData }}
                    interactionController={{ nonLivePrice: false, nonInteractive: true, nonZoomAble: true }}
                    chartId={plan._id} timeFrame={defaultTimeFrames.threeDayOneMin} />
            </div>
            <div className='flex'>
                {id}
                <button onClick={() => handleUpdateToggle(plan.tickerSymbol, plan._id)}>{selectedPlansForUpdate.find((t) => t.tickerSymbol === plan.tickerSymbol) ? <p>Remove From Update</p> : <p>Mark For Update</p>}</button>
            </div>
        </div>
    )
}

export default SinglePlanViabilityChartWrapper