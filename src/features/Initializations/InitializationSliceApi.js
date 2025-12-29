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

export const selectMacroWatchListsFromUser = (args) =>
  createSelector(
    InitializationApiSlice.endpoints.getUserInitialization.select(args),
    (result) => {
      return {
        macroWatchLists: result?.data?.macroWatchLists,
        isSuccess: result.isSuccess,
        isLoading: result.isLoading,
        isError: result.isError,
        refetch: result.refetch,
      };
    }
  );
