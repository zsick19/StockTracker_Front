import { createSelector, createSlice } from "@reduxjs/toolkit";


const streamMostRecentSlice = createSlice({
    name: "streamMostRecent",
    initialState: { mostRecentTickerStreamed: undefined, mostRecentPriceStreamed: undefined, monitorStatus: true },
    reducers: {
        updateStreamMostRecent: (state, action) =>
        {
            state.mostRecentTickerStreamed = action.payload.ticker
            state.mostRecentPriceStreamed = action.payload.price
            state.monitorStatus = true
        },
        setMonitorDisconnectionMessage: (state, action) =>
        {
            state.monitorStatus = false
        }
    },
});

export const {
    updateStreamMostRecent,
    setMonitorDisconnectionMessage
} = streamMostRecentSlice.actions;

export default streamMostRecentSlice.reducer;

export const selectMostRecentStream = (state) => { return state.streamMostRecent }
