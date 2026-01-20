import { apiSlice } from "../../AppRedux/api/apiSlice";

export const ChartingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChartingData: builder.query({
      query: (args) =>
      {
        if (args.chartId) return { url: `/chartingData/${args.chartId}` };
      }, providesTags: (result, error, args) => [{ type: 'chartingData', id: args.chartId }]
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
      //  invalidatesTags: (result, error, args) => [{ type: 'chartingData', id: args.chartId }]
    })
  }),
});

export const { useGetChartingDataQuery, useUpdateChartingDataMutation, useRemoveChartableStockMutation } = ChartingApiSlice;
