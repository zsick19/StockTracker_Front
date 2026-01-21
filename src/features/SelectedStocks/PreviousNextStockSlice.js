import { createSlice, current } from "@reduxjs/toolkit";
import { ChartingApiSlice } from "../Charting/ChartingSliceApi";

const previousNextStockSlice = createSlice({
    name: "previousNextStock",
    initialState: {
        confirmedUncharted: [],
        confirmedUnChartedLastIndex: 0,
        totalUncharted: 0,
        fetchedData: false,
        startedCharting: false
    },
    reducers: {
        setConfirmedUnChartedData: (state, action) =>
        {
            state.confirmedUncharted = []
            action.payload.forEach((confirmed) => { if (confirmed.status < 2) state.confirmedUncharted.push({ chartId: confirmed._id, ticker: confirmed.tickerSymbol, reviewed: false }) })
            state.totalUncharted = state.confirmedUncharted.length
            state.confirmedUnChartedLastIndex = 0
            state.fetchedData = true
        },

        setConfirmedUnChartedNavIndex: (state, action) =>
        {
            let visit = state.confirmedUncharted[state.confirmedUnChartedLastIndex]


            if (action.payload.next && state.confirmedUnChartedLastIndex + 1 < state.confirmedUncharted.length)
            {
                state.confirmedUncharted[state.confirmedUnChartedLastIndex] = { ...visit, reviewed: true }
                state.confirmedUnChartedLastIndex = state.confirmedUnChartedLastIndex + 1
            } else if (!action.payload.next && state.confirmedUnChartedLastIndex - 1 >= 0)
            {
                state.confirmedUnChartedLastIndex = state.confirmedUnChartedLastIndex - 1
            }
            state.startedCharting = true
        },
        setStartedCharting: (state, action) =>
        {
            state.startedCharting = true
        },
        setFetchedChartingToSync: (state, action) =>
        {
            //state.fetchedData = false
            state.confirmedUnChartedLastIndex = 0
        }
    },
    extraReducers: (builder) =>
    {
        builder.addMatcher(
            ChartingApiSlice.endpoints.removeChartableStock.matchFulfilled,
            (state, { payload }) =>
            {
                state.confirmedUncharted = state.confirmedUncharted.filter((t) => { return t.ticker !== payload.removedChart.tickerSymbol })
                state.totalUncharted = state.confirmedUncharted.length
            }
        )
    }
});

export const {
    setConfirmedUnChartedData,
    setConfirmedUnChartedNavIndex,
    setStartedCharting,
    setFetchedChartingToSync
} = previousNextStockSlice.actions;

export default previousNextStockSlice.reducer;


export const selectConfirmedUnChartedTrio = (state) => ({
    previous: state.previousNextStock.confirmedUncharted[state.previousNextStock.confirmedUnChartedLastIndex - 1],
    current: state.previousNextStock.confirmedUncharted[state.previousNextStock.confirmedUnChartedLastIndex],
    next: state.previousNextStock.confirmedUncharted[state.previousNextStock.confirmedUnChartedLastIndex + 1],
    indexInfo: { current: state.previousNextStock.confirmedUnChartedLastIndex, total: state.previousNextStock.totalUncharted }
})

export const selectCurrentUnConfirmed = (state) => state.previousNextStock.confirmedUncharted[state.previousNextStock.confirmedUnChartedLastIndex]
export const selectFetchUnchartedState = (state) => { return { fetchedData: state.previousNextStock.fetchedData, startedCharting: state.previousNextStock.startedCharting } }
export const provideFirstUncharted = (state) => state.previousNextStock.confirmedUncharted[0]


export const unchartedVisitedList = (state) => state.previousNextStock.confirmedUncharted