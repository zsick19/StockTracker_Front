import { createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { isToday } from "date-fns";

export const InitializationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserInitialization: builder.query({
      query: () => ({
        url: `/user/login`,
      }),
      transformResponse: (response) =>
      {
        response.patternedTickers = []
        response.userStockHistory.map((history) => { response.patternedTickers.push(history.symbol) })

        response.dailyTasksForComplete = {
          preMarket: response.dailyTasks?.preMarket.map((t, i) => { if (!t?.status || !isToday(t.status)) return { ...t, status: undefined }; else return t }) || [],
          firstHour: response.dailyTasks?.firstHour.map((t, i) => { if (!t?.status || !isToday(t.status)) return { ...t, status: undefined }; else return t }) || {},
          midDay: response.dailyTasks?.midDay.map((t, i) => { if (!t?.status || !isToday(t.status)) return { ...t, status: undefined }; else return t }) || [],
          powerHour: response.dailyTasks?.powerHour.map((t, i) => { if (!t?.status || !isToday(t.status)) return { ...t, status: undefined }; else return t }) || [],
          postClose: response.dailyTasks?.postClose.map((t, i) => { if (!t?.status || !isToday(t.status)) return { ...t, status: undefined }; else return t }) || []
        }

        return response
      },
      keepUnusedDataFor: 60000,
      providesTags: ['userData']
    }),
    markDailyTaskComplete: builder.mutation({
      query: (arg) => ({
        url: `/user/dailyTask?session=${arg.session}&taskId=${arg.taskId}`
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled })
      {
        const patchResult = dispatch(InitializationApiSlice.util.updateQueryData('getUserInitialization', undefined, (draft) =>
        {
          if (draft.dailyTasksForComplete[arg.session][arg.taskIndex].status) draft.dailyTasksForComplete[arg.session][arg.taskIndex].status = undefined
          else { draft.dailyTasksForComplete[arg.session][arg.taskIndex].status = new Date() }
        }));

        try { await queryFulfilled; } catch { patchResult.undo(); }
      },
    })
  }),
});

export const { useGetUserInitializationQuery, useMarkDailyTaskCompleteMutation } = InitializationApiSlice;

export const selectSPYIdFromUser = () =>
  createSelector(
    InitializationApiSlice.endpoints.getUserInitialization.select(),
    (result) => { return result?.data?._id || undefined }
  )

export const selectDailyTaskFromUser = () =>
  createSelector(
    InitializationApiSlice.endpoints.getUserInitialization.select(),
    (result) =>
    {
      return result?.data?.dailyTasksForComplete || {
        preMarket: [],
        firstHour: [],
        midDay: [],
        powerHour: [],
        postClose: []
      }
    }
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

export const selectOldestRelevantDate = () => createSelector(
  InitializationApiSlice.endpoints.getUserInitialization.select(),
  (result) => { return result?.data?.oldestRelevantDateToFetch }
)


