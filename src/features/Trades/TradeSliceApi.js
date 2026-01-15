import { createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";


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
                    return trade
                })
                return activeTradeAdapter.setAll(activeTradeAdapter.getInitialState(), tradeResponse)
            },
            // async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch },)
            //   {

            //     const ws = getWebSocket(arg.userId, 'Single Stock Trade Stream')

            //     const incomingTradeListener = (data) =>
            //     {
            //       if (data.Symbol === arg.Symbol)
            //       {
            //         dispatch(singleStockTradeStreamApiSlice.util.upsertQueryData('getSingleStockTradeStream', { Symbol: arg.Symbol, userId: arg.userId }, { mostRecentPrice: data }))
            //       }
            //     }

            //     try
            //     {
            //       await cacheDataLoaded
            //       subscribe('tradeStreamForUser', incomingTradeListener, 'singleStockTrade')
            //     } catch (error)
            //     {
            //       await cacheEntryRemoved
            //       unsubscribe('tradeStreamForUser', incomingTradeListener, arg.userId, 'singleStockTrade')
            //     }

            //     await cacheEntryRemoved
            //     console.log('removed cache entry')
            //     unsubscribe('tradeStreamForUser', incomingTradeListener, arg.userId, 'singleStockTrade')
            //   }
            // }),
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