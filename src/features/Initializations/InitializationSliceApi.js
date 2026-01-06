import { createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";

export const InitializationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserInitialization: builder.query({
      query: () => ({
        url: `/user/login`,
      }),
      transformResponse: (response) =>
      {
        response.patternedTickers = []
        response.userStockHistory.map((history) =>
        {
          response.patternedTickers.push(history.symbol)
        })
        return response
      },
      keepUnusedDataFor: 60000,
    }),
  }),
});

export const { useGetUserInitializationQuery } = InitializationApiSlice;

export const selectSPYIdFromUser = () =>
  createSelector(
    InitializationApiSlice.endpoints.getUserInitialization.select(),
    (result) => { return result?.data?.spyChartId || undefined }
  )

export const selectUserMarketSearchFilters = () =>
  createSelector(
    InitializationApiSlice.endpoints.getUserInitialization.select(),
    (result) => { return result?.data?.marketSearchFilters || [] }
  )
export const selectUsersPatternedHistory = () =>
  createSelector(
    InitializationApiSlice.endpoints.getUserInitialization.select(),
    (result) => { return result?.data?.patternedTickers || [] }
  )


