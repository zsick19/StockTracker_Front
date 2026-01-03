import { apiSlice } from "../../AppRedux/api/apiSlice";

export const ChartingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChartingData: builder.query({
      query: (args) =>
      {
        if (args.chartId) return { url: `/chartingData/${args.chartId}` };
      }, providesTags: ['chartingData']
    }),
  }),
});

export const { useGetChartingDataQuery } = ChartingApiSlice;
