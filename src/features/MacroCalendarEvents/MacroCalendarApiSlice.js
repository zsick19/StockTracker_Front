import { createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";

export const MacroCalendarApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchMacroCalendar: builder.query({
      query: (args) => ({
        url: `/macroCalendar?start=${args.start}`,
      }),
      providesTags: ['macroEventCalendar']
    }),

    createMacroCalendarEvent: builder.mutation({
      query: (args) => ({
        url: `/macroCalendar`,
        method: 'POST',
        body: { ...args.macroEvent }
      }),
      invalidatesTags: ['macroEventCalendar']
    })
  })
});

export const { useFetchMacroCalendarQuery, useCreateMacroCalendarEventMutation } = MacroCalendarApiSlice;
