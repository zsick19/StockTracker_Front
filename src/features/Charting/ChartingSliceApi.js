import { apiSlice } from "../../AppRedux/api/apiSlice";
import { enterBufferHitAdapter, enterExitAdapter, EnterExitPlanApiSlice, stopLossHitAdapter } from "../EnterExitPlans/EnterExitApiSlice";
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";

const possibleDefaultMacros = ['SPY', 'ES', 'DIA', 'QQQ', 'IWM', 'TLT', 'XLRE', 'XLY', 'XLK', 'XLF', 'XLU', 'XLP', 'XLE', 'XLC', 'XLI', 'XLV', 'XLB', 'GLD', 'SLV', 'GDX', 'SMH', 'XBI', 'KRE', 'XOP', 'XRT']

export const ChartingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChartingData: builder.query({
      query: (args) =>
      {

        if (possibleDefaultMacros.includes(args.tickerSymbol)) return { url: `/chartingData/macro/${args.chartId}` }
        else if (args?.chartId) return { url: `/chartingData/${args.chartId}` };
      },
      providesTags: (result, error, args) => [{ type: 'chartingData', id: args.tickerSymbol }]
    }),


    getMacroChartingData: builder.query({
      query: (args) =>
      {
        console.log(args)
        return { url: `/chartingData/macro/${args.chartId}` }
      }
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

            dispatch(InitializationApiSlice.util.updateQueryData("getUserInitialization", undefined,
              (draft) =>
              {
                draft.userStockHistory.filter((t) => t !== removedCharted.removedEnterExit.tickerSymbol)
              }
            ))
          }


        } catch
        {
          // If mutation fails, the cache remains untouched
        }
      },
      invalidatesTags: (result, error, args) => ['userData', 'confirmedSummary']
    })
  }),
});

export const { useGetChartingDataQuery, useGetMacroChartingDataQuery, useUpdateChartingDataMutation, useRemoveChartableStockMutation } = ChartingApiSlice;
