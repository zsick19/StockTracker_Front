import { createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { getDay, isAfter, isBefore, isThisWeek } from "date-fns";

export const MacroCalendarApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchMacroCalendar: builder.query({
      query: (args) => ({
        url: `/macroCalendar`,
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

// const selectMacroCalendarResult = MacroCalendarApiSlice.endpoints.fetchMacroCalendar.select()
const selectCalendarData = createSelector(MacroCalendarApiSlice.endpoints.fetchMacroCalendar.select(), (result) => 
{
  console.log(result)
  return result.data ?? []
})


const macroNewsEvents = Object.freeze({
  sunday: [],
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: []
});


export const makeSelectCalendarEventByFilter = () => createSelector(
  [selectCalendarData,
    (state, timeSpan) => timeSpan.span,
    (state, timeSpan) => timeSpan.startDate,
    (state, timeSpan) => timeSpan.endDate,

  ],
  (calendarEvents, span, startDate, endDate) =>
  {
    if (span === 'week')
    {
      const macroNewsEvents = {
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: []
      }

      let eventsBetweenDates = calendarEvents.calendarEvents.filter((t) => (isAfter(t.eventDate, startDate) && isBefore(t.eventDate, endDate)))

      eventsBetweenDates.forEach((t) =>
      {
        switch (getDay(t.eventDate))
        {
          case 0: macroNewsEvents.sunday.push(t); break;
          case 1: macroNewsEvents.monday.push(t); break;
          case 2: macroNewsEvents.tuesday.push(t); break;
          case 3: macroNewsEvents.wednesday.push(t); break;
          case 4: macroNewsEvents.thursday.push(t); break;
          case 5: macroNewsEvents.friday.push(t); break;
          case 6: macroNewsEvents.saturday.push(t); break;
        }
      })

      return macroNewsEvents
    }
    if (span === 'month'){
      //return month view
    }


    return calendarEvents
  }
)