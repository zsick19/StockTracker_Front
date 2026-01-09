import { apiSlice } from "../../AppRedux/api/apiSlice";

export const StockDataApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStockDataUsingTimeFrame: builder.query({
      query: (args) => ({
        url: `/stockData/ticker/${args.ticker}?liveFeed=${args.liveFeed}&info=${args?.info || false}`,
        method: "POST",
        body: { timeFrame: args.timeFrame },
      }),
      keepUnusedDataFor: 60000,
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
