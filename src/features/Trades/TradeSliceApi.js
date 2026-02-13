import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
import { enterBufferHitAdapter, enterExitAdapter, EnterExitPlanApiSlice, highImportanceAdapter, stopLossHitAdapter } from "../EnterExitPlans/EnterExitApiSlice";
const { getWebSocket, subscribe, unsubscribe } = setupWebSocket();

const activeTradeAdapter = createEntityAdapter()

export const TradeApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsersActiveTrades: builder.query({
            query: () => ({
                url: `/trades/active`,
            }),
            transformResponse: (response) =>
            {
                let tradeResponse = response.activeTrades.map((trade) =>
                {
                    trade.id = trade.tickerSymbol
                    trade.mostRecentPrice = response.mostRecentPrices[trade.tickerSymbol]
                    console.log(trade.mostRecentPrice)


                    trade.percentOfGain = ((trade.mostRecentPrice - trade.tradingPlanPrices[1]) / (trade.tradingPlanPrices[4] - trade.tradingPlanPrices[1]) * 100)
                    trade.gainPerShare = trade.mostRecentPrice - trade.averagePurchasePrice
                    trade.percentFromOpen = ((trade.mostRecentPrice - trade.tradingPlanPrices[1]) / trade.tradingPlanPrices[1]) * 100
                    trade.totalGain = trade.gainPerShare * trade.availableShares

                    trade.percentFromPlanPrices = [(trade.mostRecentPrice - trade.tradingPlanPrices[0]) * 100 / trade.tradingPlanPrices[0],
                    (trade.mostRecentPrice - trade.tradingPlanPrices[1]) * 100 / trade.tradingPlanPrices[1],
                    (trade.mostRecentPrice - trade.tradingPlanPrices[2]) * 100 / trade.tradingPlanPrices[2],
                    (trade.mostRecentPrice - trade.tradingPlanPrices[3]) * 100 / trade.tradingPlanPrices[3],
                    (trade.mostRecentPrice - trade.tradingPlanPrices[4]) * 100 / trade.tradingPlanPrices[4],
                    (trade.mostRecentPrice - trade.tradingPlanPrices[5]) * 100 / trade.tradingPlanPrices[5]
                    ]

                    function getInsertionIndex(arr, num)
                    {
                        const index = arr.findIndex(element => element >= num);
                        return index === -1 ? arr.length : index;
                    }

                    switch (getInsertionIndex(trade.tradingPlanPrices, trade.mostRecentPrice))
                    {
                        case 0: trade.classVisual = 'belowStopLoss'; break;
                        case 1: trade.percentFromPlanPrices[0] < 0.5 ? trade.classVisual = 'nearStopLoss' : trade.classVisual = 'belowEnter'; break;
                        case 2: trade.percentFromPlanPrices[1] < 0.5 ? trade.classVisual = 'nearEnter' : trade.classVisual = 'belowEnterBuffer'; break;
                        case 3: trade.percentFromPlanPrices[2] < 0.5 ? trade.classVisual = 'nearEnterBuffer' : trade.classVisual = 'belowExitBuffer'; break;
                        case 4: trade.percentFromPlanPrices[3] < 0.5 ? trade.classVisual = 'nearExitBuffer' : trade.classVisual = 'belowExit'; break;
                        case 5: trade.percentFromPlanPrices[4] < 0.5 ? trade.classVisual = 'nearExit' : trade.classVisual = 'belowMoon'; break;
                        case 6: trade.classVisual = 'aboveMoon'; break;
                    }

                    trade.priceDirection = undefined

                    return trade
                })
                console.log(tradeResponse)
                return activeTradeAdapter.setAll(activeTradeAdapter.getInitialState(), tradeResponse)
            },
            async onCacheEntryAdded(arg, { getState, updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch },)
            {

                const userId = getState().auth.userId
                const ws = getWebSocket(userId, 'ActiveTrades')


                const incomingTradeListener = (data) =>
                {
                    updateCachedData((draft) =>
                    {

                        let activeTradeToUpdate = draft.entities[data.tickerSymbol]
                        if (activeTradeToUpdate === undefined) return



                        if (data.Price > activeTradeToUpdate.mostRecentPrice) activeTradeToUpdate.priceDirection = 'positiveDirection'
                        else if (data.Price < activeTradeToUpdate.mostRecentPrice) activeTradeToUpdate.priceDirection = 'negativeDirection'

                        activeTradeToUpdate.mostRecentPrice = data.Price

                        activeTradeToUpdate.percentOfGain = ((activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[1]) / (activeTradeToUpdate.tradingPlanPrices[4] - activeTradeToUpdate.tradingPlanPrices[1]) * 100)
                        activeTradeToUpdate.gainPerShare = activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.averagePurchasePrice
                        activeTradeToUpdate.percentFromOpen = ((activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[1]) / activeTradeToUpdate.tradingPlanPrices[1]) * 100
                        activeTradeToUpdate.totalGain = activeTradeToUpdate.gainPerShare * activeTradeToUpdate.availableShares

                        activeTradeToUpdate.percentFromPlanPrices = [
                            (activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[0]) * 100 / activeTradeToUpdate.tradingPlanPrices[0],
                            (activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[1]) * 100 / activeTradeToUpdate.tradingPlanPrices[1],
                            (activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[2]) * 100 / activeTradeToUpdate.tradingPlanPrices[2],
                            (activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[3]) * 100 / activeTradeToUpdate.tradingPlanPrices[3],
                            (activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[4]) * 100 / activeTradeToUpdate.tradingPlanPrices[4],
                            (activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[5]) * 100 / activeTradeToUpdate.tradingPlanPrices[5]
                        ]






                        function getInsertionIndex(arr, num)
                        {
                            const index = arr.findIndex(element => element >= num);
                            return index === -1 ? arr.length : index;
                        }

                        switch (getInsertionIndex(activeTradeToUpdate.tradingPlanPrices, activeTradeToUpdate.mostRecentPrice))
                        {
                            case 0: activeTradeToUpdate.classVisual = 'belowStopLoss'; break;
                            case 1: activeTradeToUpdate.percentFromPlanPrices[0] < 0.5 ? activeTradeToUpdate.classVisual = 'nearStopLoss' : activeTradeToUpdate.classVisual = 'belowEnter'; break;
                            case 2: activeTradeToUpdate.percentFromPlanPrices[1] < 0.5 ? activeTradeToUpdate.classVisual = 'nearEnter' : activeTradeToUpdate.classVisual = 'belowEnterBuffer'; break;
                            case 3: activeTradeToUpdate.percentFromPlanPrices[2] < 0.5 ? activeTradeToUpdate.classVisual = 'nearEnterBuffer' : activeTradeToUpdate.classVisual = 'belowExitBuffer'; break;
                            case 4: activeTradeToUpdate.percentFromPlanPrices[3] < 0.5 ? activeTradeToUpdate.classVisual = 'nearExitBuffer' : activeTradeToUpdate.classVisual = 'belowExit'; break;
                            case 5: activeTradeToUpdate.percentFromPlanPrices[4] < 0.5 ? activeTradeToUpdate.classVisual = 'nearExit' : activeTradeToUpdate.classVisual = 'belowMoon'; break;
                            case 6: activeTradeToUpdate.classVisual = 'aboveMoon'; break;
                        }



                        return draft
                    })
                }

                try
                {
                    await cacheDataLoaded
                    subscribe('activeTradePrice', incomingTradeListener, 'ActiveTrades')
                } catch (error)
                {
                    await cacheEntryRemoved
                    unsubscribe('activeTradePrice', incomingTradeListener, arg.userId, 'ActiveTrades')
                }

                await cacheEntryRemoved
                console.log('removed cache entry')
                unsubscribe('activeTradePrice', incomingTradeListener, arg.userId, 'ActiveTrades')
            },
            providesTags: ['activeTrades']
        }),
        getUsersTradeHistory: builder.query({
            query: () => ({
                url: `/trades/history`,
            }),
            providesTags: ['tradeHistory']
        }),
        initiateTradeRecord: builder.mutation({
            query: (args) => ({
                url: '/trades/enterPosition',
                method: 'POST',
                body: { ...args }
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                // 1. Manually update the 'getPosts' query cache
                const patchResult = dispatch(
                    EnterExitPlanApiSlice.util.updateQueryData('getUsersEnterExitPlan', undefined, (draft) =>
                    {
                        enterBufferHitAdapter.removeOne(draft.enterBufferHit, args.tickerSymbol)
                        stopLossHitAdapter.removeOne(draft.stopLossHit, args.tickerSymbol)
                        enterExitAdapter.removeOne(draft.plannedTickers, args.tickerSymbol)
                        highImportanceAdapter.removeOne(draft.highImportance, args.tickerSymbol)
                    })

                )

                try
                {
                    // 2. Wait for the actual server request to finish
                    await queryFulfilled;
                } catch
                {
                    // 3. If the server request fails, roll back the manual change
                    patchResult.undo();
                }
            },
            invalidatesTags: ['activeTrades', 'tradeHistory']
        }),
        alterTradeRecord: builder.mutation({
            query: (args) => ({
                url: '/trades/alter',
                method: 'PUT',
                body: { ...args }
            }),
            invalidatesTags: ['activeTrades', 'tradeHistory']
        }),
    })
});

export const {
    useGetUsersActiveTradesQuery,
    useGetUsersTradeHistoryQuery,
    useInitiateTradeRecordMutation,
    useAlterTradeRecordMutation
} = TradeApiSlice;



export const activeTradeSelectors = activeTradeAdapter.getSelectors();

export const selectCurrentTradeTickers = createSelector(TradeApiSlice.endpoints.getUsersActiveTrades.select(),
    (result) => { return result?.data.ids || [] })

