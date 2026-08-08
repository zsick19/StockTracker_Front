import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";


export const WeekReviewApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchWeeklyPlanResults: builder.query({
      query: () => ({
        url: `/enterExitPlan/weeklyReview`,
        validateStatus: (response, result) => { return response.status === 200 && !result.isError }
      }),
    }),

  })
});

export const { useFetchWeeklyPlanResultsQuery,
} = WeekReviewApiSlice;

