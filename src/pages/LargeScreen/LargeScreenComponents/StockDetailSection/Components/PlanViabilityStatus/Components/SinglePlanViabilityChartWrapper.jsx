import React from 'react'
import { enterBufferSelectors, enterExitPlannedSelectors, stopLossHitSelectors, useGetUsersEnterExitPlanQuery } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'

function SinglePlanViabilityChartWrapper({ id, watchList, candleData, selectedPlansForRemoval, handleRemovalToggle })
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
    console.log(plan)



    return (
        <div className='SingleViabilityChartBlock' >
            <div onClick={() => handleRemovalToggle(plan.tickerSymbol, plan._id)} className={selectedPlansForRemoval.find((t) => t.tickerSymbol === plan.tickerSymbol) ? 'setForRemoval' : ''}>
                Chart goes here
            </div>
            <div>
                {id}
            </div>
        </div>
    )
}

export default SinglePlanViabilityChartWrapper