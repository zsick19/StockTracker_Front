import { createSelector, createSlice } from "@reduxjs/toolkit";

const graphMarketHoursElement = createSlice({
    name: "graphMarketHoursElement",
    initialState: {},
    reducers: {
        setInitialGraphHoursControl: (state, action) =>
        {
            state[action.payload.uuid] = { showOnlyIntraDay: false }
        },
        setToggleShowOnlyMarketHours: (state, action) =>
        {
            if (!action.payload.uuid) return
            state[action.payload.uuid].showOnlyIntraDay = !state[action.payload.uuid].showOnlyIntraDay
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
    clearGraphHoursControl
} = graphMarketHoursElement.actions;

export default graphMarketHoursElement.reducer;


export const makeSelectGraphHoursByUUID = () => createSelector(
    [(state) => state.graphHoursControl, (state, uuid) => uuid],
    (entities, uuid) => { if (uuid) return entities[uuid] }
)
