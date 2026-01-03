import { createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";

const singleTickerAdapter = createEntityAdapter({
    selectId: (item) => item.ticker
});

export const WatchListStreamingApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        fetchUsersMacroWatchList: builder.query({
            query: () => ({
                url: `/user/watchlist/macro`
            }),
            transformResponse: (response) =>
            {
                let normalizedTickerData = {}
                response.tickerData.map((tickerPriceData) => { normalizedTickerData[tickerPriceData.symbol] = tickerPriceData })

                const currentTime = new Date().getUTCDate()
                const target = new Date()
                target.setHours(9, 30, 0, 0)

                let tickerMap = {}
                response.macroWatchList.map((watchList) =>
                {
                    watchList.tickersContained.map((ticker) =>
                    {
                        //ticker.snapshot = normalizedTickerData[ticker.ticker]
                        ticker.mostRecentPrice = normalizedTickerData[ticker.ticker]?.LatestTrade.Price
                        ticker.dailyOpenPrice = normalizedTickerData[ticker.ticker]?.DailyBar.OpenPrice

                        let difference = ((ticker.mostRecentPrice - ticker.dailyOpenPrice) / ticker.dailyOpenPrice) * 100


                        ticker.currentDayPercentGain = (currentTime < target.getUTCDate() ? 0 : difference)
                        tickerMap[ticker.ticker] = ticker
                    })
                })

                const tickerState = singleTickerAdapter.setAll(singleTickerAdapter.getInitialState(), tickerMap)

                return {
                    watchLists: response.macroWatchList,
                    tickerState
                }
            }, async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved })
            {
                const ws = new WebSocket('ws://localhost:8080');
                try
                {
                    await cacheDataLoaded;
                    ws.onmessage = (event) =>
                    {
                        const update = JSON.parse(event.data); // e.g., { _id: 'item123', price: 99 }

                        updateCachedData((draft) =>
                        {
                            singleTickerAdapter.updateOne(draft.tickerState, {
                                id: update.ticker,


                                changes: update
                            });
                        });
                    };
                } catch { }
                await cacheEntryRemoved;
                ws.close();
            }
        }),
    }),
});

export const {
    useFetchUsersMacroWatchListQuery
} = WatchListStreamingApiSlice;
