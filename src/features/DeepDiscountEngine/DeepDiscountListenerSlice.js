import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { EngineDeepDiscountApiSlice } from './EngineDeepDiscountApiSlice';
import { initiateDeepDiscountWatch, updateDeepDiscountWatch } from './DeepDiscountLocalSlice';

export const deepDiscountSentryListener = createListenerMiddleware();

deepDiscountSentryListener.startListening({
    matcher: (action) =>  
    {
        return (action.type === 'api/queries/queryResultPatched' && action.payload.queryCacheKey === 'initiateEngineWithEnterExitPlan(undefined)') ||
            (action.type.endsWith('/executeQuery/fulfilled') && action.meta?.arg?.endpointName === 'fetchEngineCandleBarData') ||
            (action.type.endsWith('/executeQuery/fulfilled') && action.meta?.arg?.endpointName === 'fetchEngineOneMinCandleBarData')
    },
    effect: async (action, listenerApi) =>
    {

        if (action.type === 'api/queries/queryResultPatched')
        {
            const firstPatchPath = action.payload?.patches.filter(t => t.path[0] === 'plans' && t.path.at(-1) === 'mostRecentPrice').map(t => t.path[2])
            if (firstPatchPath.length === 0) return

            const uniquePatchSymbols = [...new Set(firstPatchPath)]
            const globalState = listenerApi.getState();
            const planEndPoint = globalState.api.queries['initiateEngineWithEnterExitPlan(undefined)']
            if (planEndPoint.status !== 'fulfilled') return

            uniquePatchSymbols.forEach((changedTicker, i) =>
            {
                const plan = planEndPoint.data.plans?.entities?.[changedTicker] || {};
                const discountConfig = plan?.discountConfig
                const livePrice = plan?.mostRecentPrice || 0;

                if (!plan || discountConfig.includesDiscount === 0 || livePrice === 0) return;

                const discountInsertionIndex = findDeepDiscountInsertionIndex(discountConfig.prices, livePrice)
                if (discountInsertionIndex === -1) return

                const localDiscountAlertEntity = globalState.interceptSentrySlice.entities?.[changedTicker]

                if (!localDiscountAlertEntity)
                {
                    console.log('Initiating local state with ticker details')
                    listenerApi.dispatch(initiateDeepDiscountWatch({ tickerSymbol: changedTicker, discountLevel: discountInsertionIndex }))
                    console.log('Firing api request for quote and trade stream')
                    listenerApi.dispatch(EngineDeepDiscountApiSlice.endpoints.populateInitialDeepDiscountEngine.initiate({ tickerSymbol: changedTicker, relevantCandleDate: '2026-04-22T04:00:00.000+00:00' }))
                }
                else if (discountInsertionIndex > localDiscountAlertEntity.discountLevel)
                {
                    //ticker is in state, update with new insertion index if it is low than original discount level
                    console.log('Update local state with new greater discount insertion Index')
                    listenerApi.dispatch(updateDeepDiscountWatch({ tickerSymbol: targetedTickerToken, discountLevel: discountInsertionIndex }))
                }

            })

        }
        else
        {
            const globalState = listenerApi.getState();
            const planEndPoint = globalState.api.queries['initiateEngineWithEnterExitPlan(undefined)']
            if (planEndPoint.status !== 'fulfilled') return

            const allPlansDictionary = planEndPoint.data.plans?.entities || {};
            const allTickerIds = planEndPoint.data.plans?.ids || [];
            let targetedTickerToken = null

            for (let i = 0; i < allTickerIds.length; i++)
            {
                const targetedTickerToken = allTickerIds[i];
                const plan = allPlansDictionary[targetedTickerToken];

                const discountConfig = plan?.discountConfig
                const livePrice = plan?.mostRecentPrice || 0;

                if (!plan || discountConfig.includesDiscount === 0 || livePrice === 0) continue;
                const discountInsertionIndex = findDeepDiscountInsertionIndex(discountConfig.prices, livePrice)
                if (discountInsertionIndex === -1) continue



                const localDiscountAlertEntity = globalState.interceptSentrySlice.entities?.[targetedTickerToken] //grabbed from global state above
                if (!localDiscountAlertEntity)
                {
                    console.log('Initiating local state with ticker details')
                    listenerApi.dispatch(initiateDeepDiscountWatch({ tickerSymbol: targetedTickerToken, discountLevel: discountInsertionIndex }))
                    console.log('Firing api request for quote and trade stream')
                    listenerApi.dispatch(EngineDeepDiscountApiSlice.endpoints.populateInitialDeepDiscountEngine.initiate({ tickerSymbol: targetedTickerToken, relevantCandleDate: '2026-04-22T04:00:00.000+00:00' }))
                } else if (discountInsertionIndex > localDiscountAlertEntity.discountLevel)
                {
                    //ticker is in state, update with new insertion index if it is low than original discount level
                    console.log('Update local state with new greater discount insertion Index')
                    listenerApi.dispatch(updateDeepDiscountWatch({ tickerSymbol: targetedTickerToken, discountLevel: discountInsertionIndex }))
                }
            }
        }

    }
});






function findDeepDiscountInsertionIndex(arr, value)
{
    // If the array is empty or value is higher than the max possible value, return -1
    if (arr.length === 0 || (arr[0] !== 0 && value > arr[0])) { return -1; }
    
    let result = -1;    

    if (value < arr[2]) result = 3
    else if (value < arr[1]) result = 2
    else if (value < arr[0]) result = 1

    return result;
}


