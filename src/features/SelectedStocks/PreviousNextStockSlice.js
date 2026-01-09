import { createSlice } from "@reduxjs/toolkit";

const previousNextStockSlice = createSlice({
    name: "previousNextStock",
    initialState: {
        confirmedUncharted: [{ ticker: 'AA', _id: 'aa' }, { ticker: 'AAPL', _id: 'aapl' }, { ticker: 'ZIM', _id: 'zim' }],
        confirmedUnChartedLastIndex: 0
    },
    reducers: {
        setConfirmedUnChartedData: (state, action) =>
        {
            state.confirmedUncharted = action.payload
        },
        setConfirmedUnChartedLastIndex: (state, action) =>
        {
            state.confirmedUnChartedLastIndex = state.payload
        },
        setConfirmedUnChartedNavIndex: (state, action) =>
        {
            if (action.payload.next && state.confirmedUnChartedLastIndex + 1 < state.confirmedUncharted.length)
            {
                state.confirmedUnChartedLastIndex = state.confirmedUnChartedLastIndex + 1
            } else if (!action.payload.next && state.confirmedUnChartedLastIndex - 1 >= 0)
            {
                state.confirmedUnChartedLastIndex = state.confirmedUnChartedLastIndex - 1
            }
        },
    },
});

export const {
    setConfirmedUnChartedData,
    setConfirmedUnChartedLastIndex,
    setConfirmedUnChartedNavIndex
} = previousNextStockSlice.actions;

export default previousNextStockSlice.reducer;


export const selectCurrentConfirmedUnCharted = (state) => ({
    previous: state.previousNextStock.confirmedUncharted[state.previousNextStock.confirmedUnChartedLastIndex - 1],
    current: state.previousNextStock.confirmedUncharted[state.previousNextStock.confirmedUnChartedLastIndex],
    next: state.previousNextStock.confirmedUncharted[state.previousNextStock.confirmedUnChartedLastIndex + 1],
})
