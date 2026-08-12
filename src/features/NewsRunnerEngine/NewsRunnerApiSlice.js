import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
import { setStockDetailState } from "../SelectedStocks/StockDetailControlSlice";
import { removeNewsRunnerWatch } from "./NewsRunnerLocalSlice";


// const { getWebSocket, subscribe, unsubscribe, checkStreamAuthorization } = setupWebSocket();


export const NewsRunnerApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        clearNewsRunnerData: builder.mutation({
            query: (args) => ({
                url: `/news/newsRunner?tickerSymbol=${args.tickerSymbol}`,
                method: 'DELETE',
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    await queryFulfilled;
                    dispatch(setStockDetailState(1))
                    dispatch(removeNewsRunnerWatch({ tickerSymbol: args.tickerSymbol }))
                }
                catch { }
            },
        }),
        fetchNewsRunnerCandleData: builder.query({
            query: (args) => ({
                url: `/stockData/newsRunner/candles?ticker=${args.tickerSymbol}`
            })
        }),
        fetchNewsRunnerTradeQuotes: builder.query({
            query: (args) => ({
                url: `/stockData/newsRunner/tradeQuotes?ticker=${args.tickerSymbol}`
            })
        })
    })
});

export const {
    useClearNewsRunnerDataMutation,
    useFetchNewsRunnerCandleDataQuery,
    useFetchNewsRunnerTradeQuotesQuery
} = NewsRunnerApiSlice;

