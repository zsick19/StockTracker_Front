import { add, addMinutes } from "date-fns";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
const { getWebSocket, subscribe, unsubscribe } = setupWebSocket();
import * as short from 'short-uuid'


export const StockDataApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStockDataUsingTimeFrame: builder.query({
      query: (args) => ({
        url: `/stockData/ticker/${args.ticker}?liveFeed=${args?.liveFeed || false}&info=${args?.info || false}&provideNews=${args?.provideNews || false}`,
        method: "POST",
        body: { timeFrame: args.timeFrame },
      }), transformResponse: (response, meta, args) =>
      {

        if (!args.liveFeed) response.nonLivePrice = response.mostRecentPrice.Price
        else
        {
          response.mostRecentTickerCandle = response.candleData.pop()
          response.mostRecentTickerCandle.ClosePrice = response.mostRecentPrice.Price
          response.mostRecentTickerCandle.Timestamp = response.mostRecentTickerCandle.Timestamp

          response.mostRecentPrice = response.mostRecentPrice.Price
        }
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
              if (data.Symbol === args.ticker)
              {
                draft.mostRecentPrice = data.Price
                let compareTimestamp = { previous: draft.mostRecentTickerCandle.Timestamp, incoming: data.Timestamp }
                if (checkForSameTimeFrameCandle(compareTimestamp))
                {
                  if (draft.mostRecentTickerCandle.OpenPrice < data.Price)
                  {
                    //if price is greater than open//compare high...if greater than high--->set close and high to be price
                    //if less than high set close to be price
                    if (data.Price > draft.mostRecentTickerCandle.HighPrice) { draft.mostRecentTickerCandle.HighPrice = data.Price }
                  } else 
                  {
                    //if price is less than open//compare low...if less than low-->set close and low to be price
                    // //if greater than low set close to be price
                    if (data.Price < draft.mostRecentTickerCandle.LowPrice) { draft.mostRecentTickerCandle.LowPrice = data.Price }
                  }
                  draft.mostRecentTickerCandle.ClosePrice = data.Price
                } else
                {
                  let copyOfClosingCandle = draft.mostRecentTickerCandle
                  draft.candleData.push(draft.mostRecentTickerCandle)
                  if (data.Price >= copyOfClosingCandle.ClosePrice) 
                  {
                    draft.mostRecentTickerCandle = {
                      ...copyOfClosingCandle,
                      Timestamp: provideNewTimeStamp(compareTimestamp.previous).toISOString(),
                      HighPrice: data.Price,
                      LowPrice: copyOfClosingCandle.ClosePrice,
                      OpenPrice: copyOfClosingCandle.ClosePrice,
                      ClosePrice: data.Price
                    }
                  } else if (data.Price < copyOfClosingCandle.ClosePrice)
                  {
                    draft.mostRecentTickerCandle = {
                      ...copyOfClosingCandle,
                      Timestamp: provideNewTimeStamp(compareTimestamp.previous).toISOString(),
                      HighPrice: copyOfClosingCandle.ClosePrice,
                      LowPrice: data.Price,
                      OpenPrice: copyOfClosingCandle.ClosePrice,
                      ClosePrice: data.Price
                    }
                  }
                }
              }

              function checkForSameTimeFrameCandle(compareTimestamp)
              {
                if (args.timeFrame.unitOfIncrement === 'H') { return new Date(compareTimestamp.incoming) < add(new Date(compareTimestamp.previous), { hours: parseInt(args.timeFrame.increment) }) }
                else if (args.timeFrame.unitOfIncrement === 'M') { return new Date(compareTimestamp.incoming) < addMinutes(compareTimestamp.previous, (parseInt(args.timeFrame.increment))); }
                else return true
              }

              function provideNewTimeStamp(timeStampToMoveForward)
              {
                if (args.timeFrame.unitOfIncrement === 'H' && args.timeFrame.increment === "1") return add(new Date(timeStampToMoveForward), { hours: parseInt(args.timeFrame.increment) })
                else if (args.timeFrame.unitOfIncrement === 'M') return addMinutes(timeStampToMoveForward, parseInt(args.timeFrame.increment))
                else return data.Timestamp
              }

              return draft
            })
          }
          const connectionId = short.generate()
          try
          {
            await cacheDataLoaded
            subscribe('singleLiveChart', incomingTradeListener, 'tempLiveChart', args.ticker, connectionId)
          } catch (error)
          {
            await cacheEntryRemoved
            unsubscribe('singleLiveChart', incomingTradeListener, userId, 'tempLiveChart', args.ticker, connectionId)
          }

          await cacheEntryRemoved
          unsubscribe('singleLiveChart', incomingTradeListener, userId, 'tempLiveChart', args.ticker, connectionId)
        }
      }
    }),
    getGroupedBy12StockData: builder.infiniteQuery({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams, queryArg) =>
        {
          const nextIndex = lastPageParam + 12
          return nextIndex < queryArg.total ? nextIndex : undefined
        },
      },
      query: ({ queryArg, pageParam }) =>
      {
        if (queryArg.total === 0) return undefined
        const nextBatch = queryArg.ids.slice(pageParam, pageParam + 12);
        return {
          url: `/stockData/tickerGroup`,
          method: 'POST',
          body: { tickerGroup: nextBatch }
        }
      },
      keepUnusedDataFor: 15,
      transformResponse: (response, meta, args) =>
      {
        let results = response.map((ticker) =>
        {

          ticker.mostRecentTickerCandle = ticker.candleData.pop()

          ticker.mostRecentTickerCandle.ClosePrice = ticker.mostRecentPrice
          // ticker.mostRecentTickerCandle.Timestamp = ticker.mostRecentTickerCandle.Timestamp

          // ticker.mostRecentPrice = ticker.mostRecentPrice
          return ticker
        })

        return results
      },
      async onCacheEntryAdded(args, { getState, updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch },)
      {
        const userId = getState().auth.userId
        const ws = getWebSocket(userId, `TickerGroupPreWatch`)

        const incomingTradeListener = (data) =>
        {
          updateCachedData((draft) =>
          {

            for (const page of draft.pages)
            {
              const itemIndex = page.findIndex(item => item.ticker === data.tickerSymbol)
              if (itemIndex != -1)
              {
                page[itemIndex].mostRecentPrice = data.tradePrice
                let itemMostRecentCandle = page[itemIndex].mostRecentTickerCandle

                if (itemMostRecentCandle.OpenPrice < data.tradePrice)
                {
                  //if price is greater than open//compare high...if greater than high--->set close and high to be price
                  //if less than high set close to be price
                  if (data.Price > itemMostRecentCandle.HighPrice) { itemMostRecentCandle.HighPrice = data.tradePrice }
                } else 
                {
                  //if price is less than open//compare low...if less than low-->set close and low to be price
                  // //if greater than low set close to be price
                  if (data.Price < itemMostRecentCandle.LowPrice) { itemMostRecentCandle.LowPrice = data.tradePrice }
                }

                itemMostRecentCandle.ClosePrice = data.tradePrice

                page[itemIndex].mostRecentTickerCandle = itemMostRecentCandle
                break;
              }
            }
          })
        }

        const connectionId = short.generate()
        try
        {
          await cacheDataLoaded
          subscribe('enterExitWatchListPrice', incomingTradeListener, 'tickerGroupPreWatch', undefined, connectionId)
        } catch (error)
        {
          await cacheEntryRemoved
          unsubscribe('enterExitWatchListPrice', incomingTradeListener, userId, 'tickerGroupPreWatch', undefined, connectionId)
        }

        await cacheEntryRemoved
        unsubscribe('enterExitWatchListPrice', incomingTradeListener, userId, 'tickerGroupPreWatch', undefined, connectionId)

      },
      providesTags: (result, error, args) => [{ type: 'preWatchGroup' }]
    }),
    getStockAverageTrueRange: builder.query({
      query: (args) => ({
        url: `/stockData/atr/${args.ticker}`
      }),
      keepUnusedDataFor: 28800 //8 hours
    }),
    getWatchListFiveMinCharts: builder.query({
      query: (args) =>
      {
        if (args.tickers.length === 0) return
        else return ({
          url: `/stockData/watchlist?minIncrement=${args.minIncrement}`,
          method: "POST",
          body: args.tickers
        })
      }
    })
  }),
});

export const { useGetStockDataUsingTimeFrameQuery,
  useGetGroupedBy12StockDataInfiniteQuery,
  useGetStockAverageTrueRangeQuery,
  useGetWatchListFiveMinChartsQuery

} = StockDataApiSlice;
