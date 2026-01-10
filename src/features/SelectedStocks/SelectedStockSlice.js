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
            state[action.payload.index].timeFrame = action.payload.timeFrame
        },
        setSelectedStockAndTimelineFourSplit: (state, action) =>
        {
            return [
                { ticker: action.payload.ticker, timeFrame: defaultTimeFrames.threeDayOneMin },
                { ticker: action.payload.ticker, timeFrame: defaultTimeFrames.threeDayFiveMin },
                { ticker: action.payload.ticker, timeFrame: defaultTimeFrames.threeDayOneHour },
                { ticker: action.payload.ticker, timeFrame: defaultTimeFrames.dailyOneYear },
            ]
        },
        setSingleChartTickerTimeFrameAndChartingId: (state, action) =>
        {
            return [{ ticker: action.payload.ticker, timeFrame: defaultTimeFrames.dailyOneYear, chartId: action.payload.chartId }]
        }
    },
});

export const {
    setSelectedStockAndTimelineFourSplit,
    setSelectedIndexTimeFrame,
    setSingleChartTickerTimeFrameAndChartingId
} = selectedStockSlice.actions;

export default selectedStockSlice.reducer;

export const selectAllFourStocks = (state) => state.selectedStock
export const selectSelectedStockByIndex = (state, index) => state.selectedStock[index];

export const selectSingleChartStock = (state) => state.selectedStock[0]