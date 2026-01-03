import { createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";

export const InitializationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserInitialization: builder.query({
      query: (args) => ({
        url: `/user/login/${args.userId}`,
      }),
      keepUnusedDataFor: 60000,
    }),
  }),
});

export const { useGetUserInitializationQuery } = InitializationApiSlice;

export const selectSPYIdFromUser = (args) =>
  createSelector(
    InitializationApiSlice.endpoints.getUserInitialization.select(args),
    (result) =>
    {
      return result?.data?.spyChartId || undefined
    }
  )

