import { createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";

export const NewsFeedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMajorMacroNews: builder.query({
      query: (args) => ({
        url: `/news/macro?tickerForSearch=${args.tickersToSearch}`,
        validateStatus: (response, result) =>
        {
          return response.status === 200 && !result.isError
        }
      }),
      transformResponse: responseData =>
      {
        return responseData
      },
      providesTags: (result, error, args) => [{ type: 'macroNews' }],
    }),



  }),
});

export const { useGetMajorMacroNewsQuery } = NewsFeedApiSlice;
