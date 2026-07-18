import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
import { set, isToday, isAfter } from "date-fns";


import { enginePlanAdapter, EnginePlanPlanApiSlice } from "../Engine/EnginePlanApiSlice";
import { appendDailyCandles, appendInterceptQuoteTick, appendInterceptTradeTick, removeDeepDiscountWatch } from "./DeepDiscountLocalSlice";


const { getWebSocket, subscribe, unsubscribe, checkStreamAuthorization } = setupWebSocket();


export const EngineDeepDiscountApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        populateInitialDeepDiscountEngine: builder.mutation({
            query: (arg) => ({
                url: `/engine/deepDiscount`,
                method: 'POST',
                body: {
                    ticker: arg.tickerSymbol,
                    patternDate: arg.relevantCandleDate
                }
            }),
            async onCacheEntryAdded(arg, { getState, updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch },)
            {
                let wsConnection = null;
                const userId = getState().auth.userId
                const ws = getWebSocket(userId, 'Deep Discount Initiate')

                const incomingQuoteListener = (data) =>
                {
                    const { Symbol, BidPrice, BidSize, AskPrice, AskSize, Timestamp } = data

                    if (Symbol === arg.tickerSymbol)
                    {
                        const tickEpoch = new Date(Timestamp).getTime();
                        const currentSpreadWidth = parseFloat((AskPrice - BidPrice).toFixed(4));
                        const bidAskImbalance = AskSize > 0 ? parseFloat((BidSize / AskSize).toFixed(2)) : 1.0;

                        dispatch(appendInterceptQuoteTick({
                            tickerSymbol: arg.tickerSymbol,
                            currentSpread: currentSpreadWidth, tickEpoch, BidSize, BidPrice, AskSize, AskPrice
                        }))
                    }

                }

                const incomingTradeListener = (data) =>
                {
                    if (arg.tickerSymbol === data.trade.Symbol) { dispatch(appendInterceptTradeTick({ tickerSymbol: arg.tickerSymbol, trade: data.trade })) }
                }

                try
                {
                    const resolvedResponse = await cacheDataLoaded
                    subscribe('quoteLivePrice', incomingQuoteListener, 'initialDeepDiscountPopulate')
                    subscribe('enterExitWatchListPrice', incomingTradeListener, 'initialDeepDiscountPopulate')
                    resolvedResponse.data && dispatch(appendDailyCandles({ tickerSymbol: arg.tickerSymbol, ...resolvedResponse.data }))

                } catch (error)
                {
                    await cacheEntryRemoved
                    unsubscribe('quoteLivePrice', incomingQuoteListener, userId, 'initialDeepDiscountPopulate')
                    unsubscribe('enterExitWatchListPrice', incomingTradeListener, userId, 'initialDeepDiscountPopulate')
                }

                await cacheEntryRemoved
                unsubscribe('quoteLivePrice', incomingQuoteListener, userId, 'initialDeepDiscountPopulate')
                unsubscribe('enterExitWatchListPrice', incomingTradeListener, userId, 'initialDeepDiscountPopulate')
            }
        }),
        fetchDeepDiscountEngineLiveData: builder.query({

        }),
        clearDeepDiscountEngineLiveData: builder.mutation({
            query: (args) => ({
                url: '/engine/deedDiscount/remove',
                method: 'POST',
                body: { ticker: args.tickerSymbol }
            }),
            // async onQueryStarted(args, { dispatch, queryFulfilled })
            // {
            //     const patchResult = dispatch(
            //         EnterExitPlanApiSlice.util.updateQueryData('getUsersEnterExitPlan', undefined, (draft) =>
            //         {
            //             enterBufferHitAdapter.removeOne(draft.enterBufferHit, args.tickerSymbol)
            //             stopLossHitAdapter.removeOne(draft.stopLossHit, args.tickerSymbol)
            //             enterExitAdapter.removeOne(draft.plannedTickers, args.tickerSymbol)
            //         })
            //     )
            //     try { await queryFulfilled; }
            //     catch { patchResult.undo(); }
            // },

        }),
        generateOrUpdateDeepDiscountAlert: builder.mutation({
            query: (args) => ({
                url: 'engine/deepDiscount/planAlerts',
                method: 'POST',
                body: { ...args }
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data: mutationResult } = await queryFulfilled;
                    dispatch(EnginePlanPlanApiSlice.util.updateQueryData('initiateEngineWithEnterExitPlan', undefined, (draft) =>
                    {
                        let entityToUpdate = draft.plans.entities[args.tickerSymbol]

                        console.log(mutationResult)
                        entityToUpdate.discountConfig.aboveMaxPain = mutationResult?.aboveMaxPain || undefined
                        entityToUpdate.discountConfig.aboveStopLoss = mutationResult?.aboveStopLoss || undefined
                        entityToUpdate.discountConfig.belowStopLoss = mutationResult?.belowStopLoss || undefined
                        let priceUpdate = [mutationResult?.aboveStopLoss?.price || 0, mutationResult?.belowStopLoss?.price || 0, mutationResult?.aboveMaxPain?.price || 0]

                        entityToUpdate.discountConfig.prices = priceUpdate
                        entityToUpdate.discountConfig.includesDiscount = Math.max(...priceUpdate)
                    }))
                } catch (error)
                {
                    // Handle potential mutation errors here
                }
            }
        }),
        removeDeepDiscountAlert: builder.mutation({
            query: (args) => ({
                url: 'engine/deepDiscount/planAlerts',
                method: 'DELETE',
                body: { ...args }
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    console.log(args.tickerSymbol)
                    const { data: mutationResult } = await queryFulfilled;
                    console.log(mutationResult)
                    dispatch(EnginePlanPlanApiSlice.util.updateQueryData('initiateEngineWithEnterExitPlan', undefined, (draft) =>
                    {
                        let entityToUpdate = draft.plans.entities[args.tickerSymbol]
                        let priceUpdate = [...entityToUpdate.discountConfig.prices]
                        console.log(priceUpdate)

                        if (mutationResult.discountToRemove === 1)
                        {
                            entityToUpdate.discountConfig.aboveStopLoss = undefined
                            priceUpdate[0] = 0
                        }
                        else if (mutationResult.discountToRemove === 2)
                        {
                            priceUpdate[1] = 0
                            entityToUpdate.discountConfig.belowStopLoss = undefined
                        }
                        else if (mutationResult.discountToRemove === 3)
                        {
                            entityToUpdate.discountConfig.aboveMaxPain = undefined
                            priceUpdate[2] = 0
                        }

                        console.log(priceUpdate)
                        entityToUpdate.discountConfig.prices = priceUpdate
                        entityToUpdate.discountConfig.includesDiscount = Math.max(...priceUpdate)
                    }))
                } catch (error)
                {
                    // Handle potential mutation errors here

                }
            }
        }),
        markPlanDiscountsReviewed: builder.mutation({
            query: (args) => ({
                url: `engine/deepDiscount/planAlerts/reviewed?planId=${args.planId}`,
                method: 'GET',
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data: mutationResult } = await queryFulfilled;
                    console.log(mutationResult)
                    // Update a specific cache entry (e.g., your "getPlanDetails" query)
                    dispatch(
                        EnginePlanPlanApiSlice.util.updateQueryData('initiateEngineWithEnterExitPlan', undefined, (draft) =>
                        {
                            console.log(draft)
                            let entityToUpdate = draft.plans.entities[args.tickerSymbol]
                            console.log(entityToUpdate)
                            entityToUpdate.discountConfig.dateReviewed = mutationResult.dateReviewed
                            entityToUpdate.discountConfig.isReviewed = true
                        }))

                } catch (error)
                {
                    // Handle potential mutation errors here
                }


            }
        })

    })
});

export const {
    usePopulateInitialDeepDiscountEngineQuery,
    useFetchDeepDiscountEngineLiveDataQuery,
    useClearDeepDiscountEngineLiveDataMutation,
    useGenerateOrUpdateDeepDiscountAlertMutation,
    useRemoveDeepDiscountAlertMutation,
    useMarkPlanDiscountsReviewedMutation
} = EngineDeepDiscountApiSlice;

