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
      query: (args) => 
      {
        if (args.chartId) return {
          url: `/chartingData/${args.chartId}`,
          method: 'PUT',
          body: args.chartingUpdate
        }
      },
      invalidatesTags: (result, error, args) => [{ type: 'chartingData', id: args.chartId }]
    })

  }),
});

export const { useGetChartingDataQuery, useUpdateChartingDataMutation } = ChartingApiSlice;
