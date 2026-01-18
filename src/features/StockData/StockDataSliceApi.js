import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
const { getWebSocket, subscribe, unsubscribe } = setupWebSocket();

export const StockDataApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStockDataUsingTimeFrame: builder.query({
      query: (args) => ({
        url: `/stockData/ticker/${args.ticker}?liveFeed=${args.liveFeed}&info=${args?.info || false}`,
        method: "POST",
        body: { timeFrame: args.timeFrame },
      }), transformResponse: (response, args) =>
      {
        if (!args.liveFeed) response.nonLivePrice = response.mostRecentPrice.Price
        response.mostRecentMinuteChartData = {}
        return response
      },
      keepUnusedDataFor: 15,
      async onCacheEntryAdded(args, { getState, updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch },)
      {
        if (args.liveFeed)
        {
          const userId = getState().auth.userId
          const ws = getWebSocket(userId, `TickerGraph_${args.ticker}`)

          const incomingTradeListener = (data) =>
          {
            updateCachedData((draft) =>
            {
              if (data.tickerSymbol === args.ticker) { draft.mostRecentPrice.Price = data.price }
              return draft
            })
          }
          try
          {
            await cacheDataLoaded
            subscribe('singleLiveChart', incomingTradeListener, 'TickerGraph')
          } catch (error)
          {
            await cacheEntryRemoved
            unsubscribe('singleLiveChart', incomingTradeListener, userId, 'tempLiveChart', args.ticker)
          }

          await cacheEntryRemoved
          unsubscribe('singleLiveChart', incomingTradeListener, userId, 'tempLiveChart', args.ticker)
        }
      }



    }),
    // getStockDataAndInfoUsingTimeFrame: builder.query({
    //   query: (args) => ({
    //     url: `/stockData/ticker/${args.ticker}?liveFeed=${args.liveFeed}`,
    //     method: "POST",
    //     body: { timeFrame: args.timeFrame },
    //   }),
    //   keepUnusedDataFor: 60000,
    // })
  }),
});

export const { useGetStockDataUsingTimeFrameQuery,
  //useGetStockDataAndInfoUsingTimeFrameQuery 
} = StockDataApiSlice;
