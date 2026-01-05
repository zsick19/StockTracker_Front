import { apiSlice } from "../../AppRedux/api/apiSlice";

export const MarketSearchApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMarketSearchStockData: builder.query({
            query: (args) => 
            {
                return ({

                    url: `/stockData/marketSearch`,
                    params: {
                        page: args.currentPage,
                        pageSize: args.resultsPerPage
                    },
                    method: 'POST',
                    body: { ...args.searchFilter }
                })
            }
        }),
    }),
});

export const { useGetMarketSearchStockDataQuery } = MarketSearchApiSlice;
