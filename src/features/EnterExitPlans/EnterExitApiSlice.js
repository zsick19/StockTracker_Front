import { createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";


const enterExitAdapter = createEntityAdapter({})

const initialState = enterExitAdapter.getInitialState()

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

        const loadedEnterExitPlans = responseData.plans.map((enterExit) =>
        {
          enterExit.id = enterExit.tickerSymbol
          enterExit.mostRecentPrice = responseData.mostRecentPrice[listOfTickers.indexOf(enterExit.tickerSymbol)]
          return enterExit
        })
        return enterExitAdapter.setAll(initialState, loadedEnterExitPlans)
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



export const selectors = enterExitAdapter.getSelectors()


