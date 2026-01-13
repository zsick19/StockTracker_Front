import { createSlice, current } from "@reduxjs/toolkit";

const previousNextStockSlice = createSlice({
    name: "previousNextStock",
    initialState: {
        confirmedUncharted: [{ ticker: 'AARD', chartId: '695eee1fbc2c64a116d5cbd7' }, { ticker: 'AAUC', chartId: '695eee1fbc2c64a116d5cbd8' }, { ticker: 'AAPL', chartId: '695ef093b364759947ace43c' },
        { ticker: 'AAP', chartId: "695ef093b364759947ace43d" }, { ticker: 'AAON', chartId: "695ef20ab364759947ace462" }, { ticker: 'AB', _id: '695ef2d8b364759947ace476' }
        ],
        confirmedUnChartedLastIndex: 0,
        totalUncharted: 6
    },
    reducers: {
        setConfirmedUnChartedData: (state, action) =>
        {
            state.confirmedUncharted = action.payload
        },
        // setConfirmedUnChartedLastIndex: (state, action) =>
        // {
        //     state.confirmedUnChartedLastIndex = state.payload
        // },
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
        setClearConfirmedUnChartedFromPreviousNext: (state, action) =>
        {
            //
        }
    },
});

export const {
    setConfirmedUnChartedData,
    //setConfirmedUnChartedLastIndex,
    setConfirmedUnChartedNavIndex
} = previousNextStockSlice.actions;

export default previousNextStockSlice.reducer;


export const selectConfirmedUnChartedTrio = (state) => ({
    previous: state.previousNextStock.confirmedUncharted[state.previousNextStock.confirmedUnChartedLastIndex - 1],
    current: state.previousNextStock.confirmedUncharted[state.previousNextStock.confirmedUnChartedLastIndex],
    next: state.previousNextStock.confirmedUncharted[state.previousNextStock.confirmedUnChartedLastIndex + 1],
    indexInfo: { current: state.previousNextStock.confirmedUnChartedLastIndex, total: state.previousNextStock.totalUncharted }
})

export const selectCurrentUnConfirmed = (state) => state.previousNextStock.confirmedUncharted[state.previousNextStock.confirmedUnChartedLastIndex]
