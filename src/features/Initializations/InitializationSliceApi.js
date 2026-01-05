import { createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";

export const InitializationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserInitialization: builder.query({
      query: () => ({
        url: `/user/login`,
      }),
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


