import { apiSlice } from "../../AppRedux/api/apiSlice";
import { enterBufferHitAdapter, enterExitAdapter, EnterExitPlanApiSlice, stopLossHitAdapter } from "../EnterExitPlans/EnterExitApiSlice";
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";

const possibleDefaultMacros = ['SPY']

export const ChartingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChartingData: builder.query({
      query: (args) =>
      {
        if (possibleDefaultMacros.includes(args?.tickerSymbol)) return { url: `/chartingData/macro/${args.chartId}` }
        else if (args?.chartId) return { url: `/chartingData/${args.chartId}` };
      },
      providesTags: (result, error, args) => [{ type: 'chartingData', id: args.chartId }]
    }),

    updateChartingData: builder.mutation({
      async queryFn(args, api, extraOptions, baseQuery)
      {
        if (!args.chartId) return
        const state = api.getState()
        let updatedCharting = state.chartingElement[args.ticker]
        const result = await baseQuery({
          url: `/chartingData/${args.chartId}`,
          method: 'PUT',
          body: updatedCharting
        })

        return result.data ? { data: result.data } : { error: result.error }
      },
      invalidatesTags: (result, error, args) => [{ type: 'chartingData', id: args.chartId }]
    }),

    removeChartableStock: builder.mutation({
      query: (args) => ({
        url: `/chartingData/${args.chartId}`,
        method: 'DELETE'
      }),
      async onQueryStarted(args, { dispatch, getState, queryFulfilled })
      {
        try
        {
          const { data: removedCharted } = await queryFulfilled;
          console.log(removedCharted)

          if (removedCharted.removedEnterExit)
          {
            dispatch(EnterExitPlanApiSlice.util.updateQueryData("getUsersEnterExitPlan", undefined,
              (draft) =>
              {
                let enterExitToBeRemoved = removedCharted.removedEnterExit.tickerSymbol
                enterExitAdapter.removeOne(draft.plannedTickers, enterExitToBeRemoved)
                enterBufferHitAdapter.removeOne(draft.enterBufferHit, enterExitToBeRemoved)
                stopLossHitAdapter.removeOne(draft.stopLossHit, enterExitToBeRemoved)
              }))
          }

          // dispatch(InitializationApiSlice.util.updateQueryData("getUserInitialization",undefined,
          //   (draft)=>{
          //     draft.userStockHistory.filter((history)=>{
          //       return history.tickerSymbol!==removedCharted.removedChart.tickerSymbol
          //     })
          //   }
          // ))


          // dispatch(InitializationApiSlice.util.updateQueryData("getUserInitialization", undefined,
          //   (draft) =>
          //   {
          //     if (removedHistory.deletedCount > 0)
          //     {
          //       draft.userStockHistory = draft.userStockHistory.filter((t) => t._id !== args.historyId)
          //       draft.patternedTickers = draft.patternedTickers.filter((t) => t !== args.ticker)
          //     }
          //     return draft
          //   })
          //);


        } catch
        {
          // If mutation fails, the cache remains untouched
        }
      },
      invalidatesTags: (result, error, args) => ['userData']
    })
  }),
});

export const { useGetChartingDataQuery, useUpdateChartingDataMutation, useRemoveChartableStockMutation } = ChartingApiSlice;
