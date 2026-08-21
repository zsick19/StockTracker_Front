import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
import { setStockDetailIfClearingRunner, setStockDetailState, setStockDetailStateWithTicker } from "../SelectedStocks/StockDetailControlSlice";
import { removeNewsRunnerWatch } from "./NewsRunnerLocalSlice";
import { setMacroDetailIfClearingRunner, setMacroDetailStateWithTicker } from "../SelectedStocks/MacroDetailControlSlice";


// const { getWebSocket, subscribe, unsubscribe, checkStreamAuthorization } = setupWebSocket();


export const NewsRunnerApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        clearNewsRunnerData: builder.mutation({
            query: (args) => ({
                url: `/news/newsRunner?tickerSymbol=${args.tickerSymbol}`,
                method: 'DELETE',
            }),
            async onQueryStarted(args, { getState, dispatch, queryFulfilled })
            {
                const currentState = getState()
                try
                {
                    await queryFulfilled;
                    if (currentState.newsRunnerSlice.ids.length > 1 && currentState.stockDetailControl.detailSelected === 30 && args.tickerSymbol === currentState.stockDetailControl.ticker)
                    {
                        const largest = { ticker: undefined, percent: -1000 }
                        Object.entries(currentState.newsRunnerSlice.entities).forEach(([key, value]) =>
                        {
                            if ((value.percentChangeFromOriginal >= largest.percent) && args.tickerSymbol !== key)
                            {
                                largest.ticker = key
                                largest.percent = value.percentChangeFromOriginal
                            }
                        })

                        if (largest.ticker)
                        {
                            dispatch(setStockDetailStateWithTicker({ detail: 30, ticker: largest.ticker }))
                            if (currentState.macroDetailControl.ticker === largest.ticker) dispatch(setMacroDetailIfClearingRunner(largest.ticker))

                            setTimeout(() => dispatch(removeNewsRunnerWatch({ tickerSymbol: args.tickerSymbol })), 500)
                        }
                    } else
                    {
                        dispatch(setStockDetailIfClearingRunner(args.tickerSymbol))
                        setTimeout(() => dispatch(removeNewsRunnerWatch({ tickerSymbol: args.tickerSymbol })), 500)
                    }

                }
                catch { }
            },
        }),

        fetchNewsRunnerTradeQuotes: builder.query({
            query: (args) => ({
                url: `/stockData/newsRunner/tradeQuotes?ticker=${args.tickerSymbol}`
            })
        }),


        fetchNewsRunnerCandleData: builder.query({
            query: (args) => ({
                url: `/stockData/newsRunner/candles`,
                method: 'POST',
                body: { tickerToFetch: args.tickerSymbol }

            })
        }),
        fetchNewsRunnerInfo: builder.mutation({
            query: (args) => ({
                url: `/news/newsRunner/info`,
                method: 'POST',
                body: { tickersToFetch: args.tickersToFetch }
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data } = await queryFulfilled;
                    let mostImportantTicker = { tickerSymbol: undefined, score: 0 }
                    if (data.stockInfo)
                    {
                        data.stockInfo.map((t) =>
                        {
                            let individualScore = 0
                            if (t.MarketCap < 500000000)
                                individualScore += 1
                            if (t.SharesFloat < 200000000)
                                individualScore += 3
                            if (t?.ShortPercentOfFloat > 20)
                                individualScore += 4
                            if (t?.ShortRatioDaysToCover > 3.5)
                                individualScore += 2
                            if (individualScore > 7 && individualScore > mostImportantTicker.score)
                            {
                                mostImportantTicker = { tickerSymbol: t.Symbol, score: individualScore }
                            }
                        })

                        if (mostImportantTicker.tickerSymbol)
                        {
                            dispatch(setMacroDetailStateWithTicker({ detail: 1, ticker: mostImportantTicker.tickerSymbol }))
                        }
                    }
                }
                catch { }
            },
        }),
        fetchNewsRunnerVolumePriceChecks: builder.mutation({
            query: (args) => ({
                url: `/news/newsRunner/price`,
                method: 'POST',
                body: { tickersForPrice: args.tickerSymbol }
            }),

        }),
        fetchNewsRunnerQuotesAndTrades: builder.mutation({
            query: (args) => ({
                url: `/news/newsRunner/QuotesAndTrades`,
                method: 'POST',
                body: { tickers: args.tickerSymbol }
            }),
        })
    })
});

export const {
    useClearNewsRunnerDataMutation,
    useFetchNewsRunnerCandleDataQuery,
    useFetchNewsRunnerTradeQuotesQuery,
    useFetchNewsRunnerInfoMutation,
    useFetchNewsRunnerPriceMutation
} = NewsRunnerApiSlice;

