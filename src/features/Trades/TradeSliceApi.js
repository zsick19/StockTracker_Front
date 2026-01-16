import { createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
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
                    trade.percentOfGain = ((trade.mostRecentPrice - trade.tradingPlanPrices[1]) / (trade.tradingPlanPrices[4] - trade.tradingPlanPrices[1]) * 100)
                    trade.gainPerShare = trade.mostRecentPrice - trade.averagePurchasePrice
                    trade.percentFromOpen = ((trade.mostRecentPrice - trade.tradingPlanPrices[1]) / trade.tradingPlanPrices[1]) * 100

                    trade.percentFromPlanPrices = [(trade.mostRecentPrice - trade.tradingPlanPrices[0]) * 100 / trade.tradingPlanPrices[0],
                    (trade.mostRecentPrice - trade.tradingPlanPrices[1]) * 100 / trade.tradingPlanPrices[1],
                    (trade.mostRecentPrice - trade.tradingPlanPrices[2]) * 100 / trade.tradingPlanPrices[2],
                    (trade.mostRecentPrice - trade.tradingPlanPrices[3]) * 100 / trade.tradingPlanPrices[3],
                    (trade.mostRecentPrice - trade.tradingPlanPrices[4]) * 100 / trade.tradingPlanPrices[4],
                    (trade.mostRecentPrice - trade.tradingPlanPrices[5]) * 100 / trade.tradingPlanPrices[5]
                    ]



                    return trade
                })
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
                        let activeTradeToUpdate = draft.entities[data.ticker]
                        activeTradeToUpdate.mostRecentPrice = data.price
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
        }),
        initiateTradeRecord: builder.mutation({
            query: (args) => ({
                url: '/trades/enterPosition',
                method: 'POST',
                body: { ...args }
            }),
            invalidatesTags: ['activeTrades']
        }),
        alterTradeRecord: builder.mutation({
            query: (args) => ({
                url: '/trades',
                method: 'PUT',
                body: { ...args }
            }),
            invalidatesTags: ['activeTrades']
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