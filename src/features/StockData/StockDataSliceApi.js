import { add, addMinutes, isSameHour, isSameMinute, startOfHour } from "date-fns";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
const { getWebSocket, subscribe, unsubscribe } = setupWebSocket();

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
          if (args.timeFrame.unitOfIncrement === 'H') { response.mostRecentTickerCandle.Timestamp = startOfHour(new Date(response.mostRecentTickerCandle.Timestamp)) }
          else { response.mostRecentTickerCandle.Timestamp = new Date(response.mostRecentTickerCandle.Timestamp).setSeconds(0, 0) }
          response.mostRecentTickerCandle.ClosePrice = response.mostRecentPrice.Price
          response.candlesToKeepSinceLastQuery = []
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

                //different timeFrames need different checks for same candle timeframe
                //check if timeFrames overlap
                //if same timeFrame, compare prices to update most recent Ticker directly
                //else push finished recent ticker to previous tickers and extract a new ticker comparing incoming data with last candle for OCLH values




                if (checkForSameTimeFrameCandle((new Date(data.Timestamp), new Date(draft.mostRecentTickerCandle.Timestamp))))
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


                  draft.candlesToKeepSinceLastQuery.push(draft.mostRecentTickerCandle)

                  if (data.Price >= copyOfClosingCandle.ClosePrice) 
                  {
                    draft.mostRecentTickerCandle = {
                      ...copyOfClosingCandle,
                      Timestamp: provideNewTimeStamp(new Date(copyOfClosingCandle.Timestamp)),
                      HighPrice: data.Price,
                      LowPrice: copyOfClosingCandle.ClosePrice,
                      OpenPrice: copyOfClosingCandle.ClosePrice,
                      ClosePrice: data.Price
                    }
                  } else if (data.Price < copyOfClosingCandle.ClosePrice)
                  {
                    draft.mostRecentTickerCandle = {
                      ...copyOfClosingCandle,
                      Timestamp: provideNewTimeStamp(new Date(copyOfClosingCandle.Timestamp)),
                      HighPrice: copyOfClosingCandle.ClosePrice,
                      LowPrice: data.Price,
                      OpenPrice: copyOfClosingCandle.ClosePrice,
                      ClosePrice: data.Price
                    }
                  }
                }
              }


              function checkForSameTimeFrameCandle(incomingData, mostRecent)
              {
                if (args.timeFrame.unitOfIncrement === 'H' && args.timeFrame.increment === "1") isSameHour(incomingData, mostRecent)
                else if (args.timeFrame.unitOfIncrement === 'H') { return incomingData < new Date().setHours(12, 30) }
                else if (args.timeFrame.unitOfIncrement === 'M')
                {
                  return incomingData > addMinutes(mostRecent, args.timeFrame.increment);
                }
              }
              function provideNewTimeStamp(mostRecent)
              {
                if (args.timeFrame.unitOfIncrement === 'H' && args.timeFrame.increment === "1") return add(mostRecent, { hours: args.timeFrame.increment })
                else if (args.timeFrame.unitOfIncrement === 'M') return add(mostRecent, { minutes: args.timeFrame.increment })
              }


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
    })
  }),
});

export const { useGetStockDataUsingTimeFrameQuery,
  useGetGroupedBy12StockDataInfiniteQuery

} = StockDataApiSlice;
