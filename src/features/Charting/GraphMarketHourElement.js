import { createSelector, createSlice } from "@reduxjs/toolkit";
import { isSaturday, isSunday, previousFriday, subBusinessDays, subDays, subMonths, subQuarters } from "date-fns";

const graphMarketHoursElement = createSlice({
    name: "graphMarketHoursElement",
    initialState: {},
    reducers: {
        setInitialGraphHoursControl: (state, action) =>
        {
            state[action.payload.uuid] = { showOnlyIntraDay: false, focusDates: undefined }
        },
        setToggleShowOnlyMarketHours: (state, action) =>
        {
            if (!action.payload.uuid) return
            state[action.payload.uuid].showOnlyIntraDay = !state[action.payload.uuid].showOnlyIntraDay
        },
        setFocusStartFinishDate: (state, action) =>
        {

            if (!action.payload.uuid || !action.payload.focusDates) return

            let startDate = new Date()
            let endDate = new Date()

            switch (action.payload.focusDates)
            {
                case 'OMHO':
                    if (isSaturday(startDate)) startDate = subDays(startDate, 1)
                    else if (isSunday(startDate)) startDate = subDays(startDate, 2)
                    startDate.setHours(9, 30, 0, 0)
                    endDate = new Date(startDate).setHours(16, 0, 0, 0)
                    break;
                case 'PMPM':
                    if (isSaturday(startDate)) startDate = subDays(startDate, 1)
                    else if (isSunday(startDate)) startDate = subDays(startDate, 2)
                    startDate.setHours(4, 0, 0, 0)
                    endDate = new Date(startDate).setHours(20, 0, 0, 0)
                    break;
                    
                case 'MP1H':
                    if (isSaturday(startDate)) startDate = subDays(startDate, 1)
                    else if (isSunday(startDate)) startDate = subDays(startDate, 2)
                    startDate.setHours(8, 30, 0, 0)
                    endDate = new Date(startDate).setHours(17, 0, 0, 0)
                    break;
                case 'firstHour':
                    if (isSaturday(startDate)) startDate = subDays(startDate, 1)
                    else if (isSunday(startDate)) startDate = subDays(startDate, 2)
                    startDate.setHours(9, 0, 0, 0)
                    endDate = new Date(startDate).setHours(10, 30, 0, 0)
                    break;
                case 'H3D':
                    if (isSaturday(startDate))
                    {
                        startDate = subBusinessDays(startDate, 3)
                        endDate = previousFriday(endDate)
                    }
                    else if (isSunday(startDate))
                    {
                        startDate = subBusinessDays(startDate, 3)
                        endDate = previousFriday(endDate)
                    } else
                    {
                        startDate = subBusinessDays(startDate, 3)
                    }
                    startDate.setHours(4, 0, 0, 0)
                    endDate.setHours(20, 0, 0, 0)
                    break;
                case 'H10D':
                    if (isSaturday(startDate) || isSunday(startDate))
                    {
                        endDate = previousFriday(endDate)
                    }

                    startDate = subBusinessDays(endDate, 10)

                    startDate.setHours(4, 0, 0, 0)
                    endDate.setHours(20, 0, 0, 0)
                    break;
                case 'P2D':
                    if (isSaturday(startDate))
                    {
                        startDate = subDays(startDate, 2)
                        endDate = subDays(endDate, 1)
                    }
                    else if (isSunday(startDate))
                    {
                        startDate = subDays(startDate, 3)
                        endDate = subDays(endDate, 2)
                    } else
                    {
                        startDate = subDays(startDate, 2)
                    }
                    endDate.setHours(16, 0, 0, 0)
                    startDate.setHours(9, 0, 0, 0)
                    break;
                case 'P3D':
                    if (isSaturday(startDate))
                    {
                        startDate = subDays(startDate, 3)
                        endDate = subDays(endDate, 1)
                    }
                    else if (isSunday(startDate))
                    {
                        startDate = subDays(startDate, 4)
                        endDate = subDays(endDate, 2)
                    } else
                    {
                        startDate = subDays(startDate, 3)
                    }
                    endDate.setHours(16, 0, 0, 0)
                    startDate.setHours(9, 0, 0, 0)
                    break;
                case 'P5D':
                    if (isSaturday(startDate))
                    {
                        startDate = subDays(startDate, 5)
                        endDate = subDays(endDate, 1)
                    }
                    else if (isSunday(startDate))
                    {
                        startDate = subDays(startDate, 6)
                        endDate = subDays(endDate, 2)
                    } else
                    {
                        startDate = subDays(startDate, 5)
                    }
                    startDate.setHours(9, 0, 0, 0)
                    endDate.setHours(16, 0, 0, 0)
                    break;
                case 'P2W':
                    startDate = subDays(startDate, 14)
                    break;
                case 'P3W':
                    startDate = subDays(startDate, 21)
                    break;
                case 'PM':
                    startDate = subMonths(startDate, 1)
                    break;
                case 'PQ':
                    startDate = subQuarters(startDate, 1)
                    break;
                case 'PHY':
                    startDate = subMonths(startDate, 6)
                    break;
                case 'PY':
                    startDate = subMonths(startDate, 12)
                    break;

                case 'twentyDay':
                    if (isSaturday(startDate))
                    {
                        startDate = subBusinessDays(startDate, 21)
                        endDate = subBusinessDays(endDate, 1)
                    }
                    else if (isSunday(startDate))
                    {
                        startDate = subBusinessDays(startDate, 22)
                        endDate = subBusinessDays(endDate, 2)
                    } else
                    {
                        startDate = subBusinessDays(startDate, 20)
                    } break;
                case 'relevantDate':
                    startDate = action.payload.relevantCandleDate;
                    break;
                case 'sixMonths':
                    startDate = subDays(startDate, 180)
                    break;


            }
            console.log(startDate)
            state[action.payload.uuid].focusDates = { startDate: new Date(startDate).toISOString(), endDate: new Date(endDate).toISOString() }
        },
        clearGraphHoursControl: (state, action) =>
        {
            delete state[action.payload.uuid]
        }
    },
});

export const {
    setInitialGraphHoursControl,
    setToggleShowOnlyMarketHours,
    setFocusStartFinishDate,
    clearGraphHoursControl
} = graphMarketHoursElement.actions;

export default graphMarketHoursElement.reducer;


export const makeSelectGraphHoursByUUID = () => createSelector(
    [(state) => state.graphHoursControl, (state, uuid) => uuid],
    (entities, uuid) => { if (uuid) return entities[uuid] }
)
