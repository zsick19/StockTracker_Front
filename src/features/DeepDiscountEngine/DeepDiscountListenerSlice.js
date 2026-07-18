import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { EngineDeepDiscountApiSlice } from './EngineDeepDiscountApiSlice';
import { initiateDeepDiscountWatch, updateDeepDiscountWatch } from './DeepDiscountLocalSlice';

export const deepDiscountSentryListener = createListenerMiddleware();


let triggeredOnceBeforeGoingLive = false
deepDiscountSentryListener.startListening({
    matcher: (action) =>  
    {
        return (action.type.endsWith('/queries/queryResultPatched') && action.meta?.arg?.endpointName === 'initiateEngineWithEnterExitPlan') ||
            (action.type.endsWith('/executeQuery/fulfilled') && action.meta?.arg?.endpointName === 'fetchEngineCandleBarData') ||
            (action.type.endsWith('/executeQuery/fulfilled') && action.meta?.arg?.endpointName === 'fetchEngineOneMinCandleBarData')
    },
    effect: async (action, listenerApi) => {
        let targetedTickerToken=null

        if(action.type==='/queries/queryResultPatched')
        {
            const firstPatchPath=action.payload?.patches?.[0]?.path;
            if(firstPatchPath){targetedTickerToken=firstPatchPath.split('/')[2]}
            // const segments=firstPatchPath.split('/')
            if (!targetedTickerToken || targetedTickerToken === 'undefined') return;



            const globalState = listenerApi.getState();
            
            const planEndPoint = globalState.api.queries['initiateEngineWithEnterExitPlan(undefined)']
            if (planEndPoint.status !== 'fulfilled') return
            
            const plan = planEndPoint.data.plans?.entities?.[targetedTickerToken] || {};
            const discountConfig=plan?.discountConfig
            const livePrice = plan?.mostRecentPrice || 0;
        
            if (!plan ||!discountConfig.includesDiscount!==0||livePrice===0) return;
            const discountInsertionIndex=findDeepDiscountInsertionIndex(discountConfig.discountPrices,livePrice)
            if(discountInsertionIndex===-1) return




            const localDiscountAlertEntity=globalState.interceptSentrySlice.entities?.[targetedTickerToken] //grabbed from global state above
            
            if(!localDiscountAlertEntity){
            
            console.log('Initiating local state with ticker details')
            listenerApi.dispatch(initiateDeepDiscountWatch({ tickerSymbol: targetedTickerToken, discountLevel: discountInsertionIndex }))
            console.log('Firing api request for quote and trade stream')
            listenerApi.dispatch(EngineDeepDiscountApiSlice.endpoints.populateInitialDeepDiscountEngine.initiate({ tickerSymbol: targetedTickerToken, relevantCandleDate: '2026-04-22T04:00:00.000+00:00' }))    
            }
            else if(discountInsertionIndex>localDiscountAlertEntity.discountLevel){
            //ticker is in state, update with new insertion index if it is low than original discount level
            console.log('Update local state with new greater discount insertion Index')
            listenerApi.dispatch(updateDeepDiscountWatch({tickerSymbol:targetedTickerToken,discountLevel:discountInsertionIndex}))
            }
        }
        else{
            const globalState = listenerApi.getState();
            const planEndPoint = globalState.api.queries['initiateEngineWithEnterExitPlan(undefined)']
            if (planEndPoint.status !== 'fulfilled') return
                        
            const allPlansDictionary = planEndPoint.data.plans?.entities || {};
            const allTickerIds = planEndPoint.data.plans?.ids || [];
            
            //Pull plans and check for deep discount prices against triggering watch only if true
            for (let i = 0; i < allTickerIds.length; i++) {
                const targetedTickerToken = allTickerIds[i];
                const plan = allPlansDictionary[targetedTickerToken];                    

                const discountConfig=plan?.discountConfig
                const livePrice = plan?.mostRecentPrice || 0;
        
                if (!plan ||!discountConfig.includesDiscount!==0||livePrice===0) return;
                const discountInsertionIndex=findDeepDiscountInsertionIndex(discountConfig.discountPrices,livePrice)
                if(discountInsertionIndex===-1) return


                const localDiscountAlertEntity=globalState.interceptSentrySlice.entities?.[targetedTickerToken] //grabbed from global state above
                        
                if(!localDiscountAlertEntity){
                    console.log('Initiating local state with ticker details')
                    listenerApi.dispatch(initiateDeepDiscountWatch({ tickerSymbol: targetedTickerToken, discountLevel: discountInsertionIndex }))
                    console.log('Firing api request for quote and trade stream')
                    listenerApi.dispatch(EngineDeepDiscountApiSlice.endpoints.populateInitialDeepDiscountEngine.initiate({ tickerSymbol: targetedTickerToken, relevantCandleDate: '2026-04-22T04:00:00.000+00:00' }))    
                }
                else if(discountInsertionIndex>localDiscountAlertEntity.discountLevel){
                    //ticker is in state, update with new insertion index if it is low than original discount level
                    console.log('Update local state with new greater discount insertion Index')
                    listenerApi.dispatch(updateDeepDiscountWatch({tickerSymbol:targetedTickerToken,discountLevel:discountInsertionIndex}))
                }


            }
        }
    
    }
});






function findDeepDiscountInsertionIndex(arr, value) {
    // If the array is empty or value is higher than the max possible value, return -1
    if (arr.length === 0 || (arr[0]!==0 && value > arr[0]) ) { return -1;}

    let low = 0;
    let high = arr.length - 1;
    let result = -1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);

        // Check if the value fits the condition: equal to or lower than arr[mid]
        if (arr[mid] >= value) {
            result = mid;     // This is a candidate index
            low = mid + 1;    // Look right to see if there is a closer/lower bounding index
        } else {
            high = mid - 1;   // Value is too high, look left
        }
    }

    return result;
}



        //    for (let i = 0; i < ids.length; i++) {
        //             const ticker = ids[i];
        //             const plan = allPlans[ticker];
        //             if (!plan) continue;

        //             const livePrice = plan.mostRecentPrice || 0;
        //             const springs = plan.deepDiscountSpringMetrics || {};

        //             if (springs.reviewStatus === 'APPROVED' && livePrice > 0 && livePrice <= (springs.approvedDiscountEntryPrice || 0)) {

        //                 // ✅ TRIGGER THE ARGUMENT-FREE ENDPOINT WIRE:
        //                 // We pass the parameter inside the object argument block. 
        //                 // RTK Query routes this directly to your cache entry lifecycle without splitting your core keys! [INDEX]
        //                 listenerApi.dispatch(
        //                     deepDiscountApiSlice.endpoints.streamDeepDiscountMetrics.initiate({
        //                         tickerSymbol: ticker
        //                     })
        //                 );

        //                 console.log(`📡 [STREAM RADAR ENGAGED] Micro-engine channel initialized for: ${ticker}`);
        //             }


        // Loop through your monitored tickers to check for structural price breaches
        // for (let i = 0; i < allTickerIds.length; i++)
        // {
        //     const ticker = allTickerIds[i];
        //     const plan = allPlansDictionary[ticker];
        //     if (!plan) continue;

        //     const livePrice = plan.mostRecentPrice || 0;
        //     const springs = plan.deepDiscountSpringMetrics || {};

        //     // Sentry Check: Has the asset been approved and has it breached your custom level? [INDEX]
        //     const isApproved = springs.reviewStatus === 'APPROVED' && springs.isDeepDiscountInterceptionValid;
        //     const customEntryTargetFloor = springs.approvedDiscountEntryPrice || 0;

        //     if (isApproved && livePrice > 0 && livePrice <= customEntryTargetFloor)
        //     {

        //         // Check if this specific cache node is already active to prevent redundant network fetches
        //         const currentCacheState = EngineDeepDiscountApiSlice.endpoints.fetchDeepData.select(ticker)(globalState);

        //         if (currentCacheState?.status !== 'fulfilled' && currentCacheState?.status !== 'pending')
        //         {
        //             console.log(`🛰️ [MIDDLEWARE TRIGGER] Ticker ${ticker} breached deep-discount floor ($${livePrice} <= $${customEntryTargetFloor}). Initializing pre-fetch...`);

        //             // ✅ ATOMIC INTER-ENGINE HANDOFF: Trigger the specialized API request [INDEX]!
        //             listenerApi.dispatch(
        //                 EngineDeepDiscountApiSlice.endpoints.fetchDeepData.initiate(
        //                     ticker,
        //                     { forceRefetch: true }
        //                 )
        //             );

        //             // ✅ OPEN THE DEDICATED WEBSOCKET CONTRACT early in background space!
        //             // listenerApi.dispatch(initiateLiveQuoteWebSocketWire(ticker));
        //         }
        //     }
        // }

