import { createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";


const enterExitAdapter = createEntityAdapter({})
const enterBufferHitAdapter = createEntityAdapter({})
const stopLossHitAdapter = createEntityAdapter({})

const initialState = {
  enterExit: enterExitAdapter.getInitialState(),
  enterBufferHit: enterBufferHitAdapter.getInitialState(),
  stopLossHit: stopLossHitAdapter.getInitialState()
}

export const EnterExitPlanApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsersEnterExitPlan: builder.query({
      query: () => ({
        url: `/user/enterExitPlans`,
        validateStatus: (response, result) =>
        {
          return response.status === 200 && !result.isError
        }
      }),
      transformResponse: responseData =>
      {
        const listOfTickers = responseData.mostRecentPrice.map((ticker) => ticker.symbol)

        const enterBufferResponse = []
        const stopLossResponse = []
        const plansResponse = []
        const currentTime = new Date().getUTCDate()
        const target = new Date()
        target.setHours(9, 30, 0, 0)



        responseData.plans.forEach((enterExit) =>
        {
          let stockTradeData = responseData.mostRecentPrice[listOfTickers.indexOf(enterExit.tickerSymbol)]

          enterExit.id = enterExit.tickerSymbol
          enterExit.mostRecentPrice = stockTradeData.LatestTrade.Price
          enterExit.dailyOpenPrice = stockTradeData.DailyBar.OpenPrice
          enterExit.currentDayPercentGain = (currentTime < target.getUTCDate() ? 0 : ((enterExit.mostRecentPrice - enterExit.dailyOpenPrice) / enterExit.dailyOpenPrice) * 100)
          enterExit.percentFromEnter = ((enterExit.plan.enterPrice - enterExit.mostRecentPrice) / enterExit.plan.enterPrice) * 100

          switch (enterExit.priceHitSinceTracked)
          {
            case 0: plansResponse.push(enterExit); break;
            case 1: enterBufferResponse.push(enterExit); break;
            case 2: enterBufferResponse.push(enterExit); break;
            case 3: stopLossResponse.push(enterExit); break;
          }
        })


        return {
          plannedTickers: enterExitAdapter.setAll(enterExitAdapter.getInitialState(), plansResponse.sort((a, b) => b.percentFromEnter - a.percentFromEnter)),
          enterBufferHit: enterBufferHitAdapter.setAll(enterBufferHitAdapter.getInitialState(), enterBufferResponse.sort((a, b) => b.percentFromEnter - a.percentFromEnter)),
          stopLossHit: stopLossHitAdapter.setAll(stopLossHitAdapter.getInitialState(), stopLossResponse.sort((a, b) => b.percentFromEnter - a.percentFromEnter))
        }
      }
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

    }),
    updateEnterExitPlan: builder.mutation({
      async queryFn(args, api, extraOptions, baseQuery)
      {
        const state = api.getState()
        let result
        let updatedEnterExit = state.enterExitElement[args.ticker]

        if (!updatedEnterExit)
        {
          updatedEnterExit = state.chartingElement[args.ticker].enterExitLines
          result = await baseQuery({
            url: `/enterExitPlan/initiate/${args.chartId}`,
            method: 'POST',
            body: updatedEnterExit
          })
        } else
        {
          result = await baseQuery({
            url: `/enterExitPlan/update/${updatedEnterExit.id}`,
            method: 'PUT',
            body: updatedEnterExit
          })
        }

        return result.data ? { data: result.data } : { error: result.error }
      },
      invalidatesTags: (result, error, args) => [{ type: 'chartingData', id: args.chartId }]
    })
  }),
});

export const { useGetUsersEnterExitPlanQuery, useUpdateEnterExitPlanMutation } = EnterExitPlanApiSlice;



export const enterExitPlannedSelectors = enterExitAdapter.getSelectors()
export const enterBufferSelectors = enterBufferHitAdapter.getSelectors()
export const stopLossHitSelectors = stopLossHitAdapter.getSelectors()

