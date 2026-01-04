import { createSlice } from "@reduxjs/toolkit";
import { defaultTimeFrames } from "../../Utilities/TimeFrames";

const selectedStockSlice = createSlice({
    name: "selectedStock",
    initialState: [
        { ticker: 'SPY', timeFrame: defaultTimeFrames.threeDayOneMin },
        { ticker: 'SPY', timeFrame: defaultTimeFrames.threeDayFiveMin },
        { ticker: 'SPY', timeFrame: defaultTimeFrames.threeDayOneHour },
        { ticker: 'SPY', timeFrame: defaultTimeFrames.dailyOneYear },
    ],
    reducers: {

        setSelectedIndexTimeFrame: (state, action) =>
        {
            console.log(state)
            state[action.payload.index].timeFrame = action.payload.timeFrame
        },
        setSelectedStockAndTimelineFourSpite: (state, action) =>
        {

        },
    },
});

export const {
    setSelectedStockAndTimelineFourSpite,
    setSelectedIndexTimeFrame
} = selectedStockSlice.actions;

export default selectedStockSlice.reducer;

export const selectAllFourStocks = (state) => state.selectedStock
export const selectSelectedStockByIndex = (state, index) => state.selectedStock[index];