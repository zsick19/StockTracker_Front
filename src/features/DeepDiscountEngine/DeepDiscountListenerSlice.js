import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { EngineDeepDiscountApiSlice } from './EngineDeepDiscountApiSlice';

// 1. Instantiate the central listener middleware layer container
export const deepDiscountSentryListener = createListenerMiddleware();
let triggeredOnce = false
// 2. Program the listener to monitor your primary regular market ingestion actions
deepDiscountSentryListener.startListening({
    // Replace this string matching predicate with your actual RTK Query fulfillment action type [INDEX]
    matcher: (action) =>  
    {
        // console.log(action.type, action.meta?.arg.endpointName)
        return (action.type.endsWith('/queries/queryResultPatched') && action.meta?.arg?.endpointName === 'initiateEngineWithEnterExitPlan') ||
            (action.type.endsWith('/executeQuery/fulfilled') && action.meta?.arg?.endpointName === 'fetchEngineCandleBarData') ||
            (action.type.endsWith('/executeQuery/fulfilled') && action.meta?.arg?.endpointName === 'fetchEngineOneMinCandleBarData')
    },
    effect: async (action, listenerApi) =>
    {
        // Extract your primary global state nodes safely out of memory [INDEX]
        const globalState = listenerApi.getState();
        const planEndPoint = globalState.api.queries['initiateEngineWithEnterExitPlan(undefined)']

        // console.log(planEndPoint)
        if (planEndPoint.status !== 'fulfilled') return

        const allPlansDictionary = planEndPoint.data.plans?.entities || {};
        const allTickerIds = planEndPoint.data.plans?.ids || [];

        if (!triggeredOnce)
        {
            console.log('firing api request')
            listenerApi.dispatch(
                EngineDeepDiscountApiSlice.endpoints.populateInitialDeepDiscountEngine.initiate({ tickerSymbol: 'ALT', relevantCandleDate: '2026-04-22T04:00:00.000+00:00' })
            )
        }
        triggeredOnce = true

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
    }
});
