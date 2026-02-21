import { apiSlice } from "../../AppRedux/api/apiSlice";

export const MarketSearchApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMarketSearchStockData: builder.query({
            query: (args) => ({
                url: `/stockData/marketSearch`,
                params: {
                    page: args.currentPage,
                    pageSize: args.resultsPerPage
                },
                method: 'POST',
                body: { ...args.searchFilter }
            })
        }),
        getUsersMarketSearchProgress: builder.mutation({
            query: () => ({
                url: `/user/marketSearch/record`,
            })
        }),
        setMarketSearchFilterAndPageProgress: builder.mutation({
            query: (args) => ({
                url: `/user/marketSearch/record`,
                method: 'POST',
                body: { marketFilters: args.searchFilter, mostRecentPage: args.currentPage, resultsPerPage: args.resultsPerPage }
            })
        })
    }),
});

export const { useGetMarketSearchStockDataQuery, useGetUsersMarketSearchProgressMutation, useSetMarketSearchFilterAndPageProgressMutation } = MarketSearchApiSlice;
