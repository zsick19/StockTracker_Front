import { createSlice } from "@reduxjs/toolkit";
import { defaultTimeFrames } from "../../Utilities/TimeFrames";
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";

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
                { ticker: action.payload.ticker, timeFrame: defaultTimeFrames.threeDayOneMin, trade: action.payload?.trade },
                { ticker: action.payload.ticker, timeFrame: defaultTimeFrames.threeDayFiveMin },
                { ticker: action.payload.ticker, timeFrame: defaultTimeFrames.threeDayOneHour },
                { ticker: action.payload.ticker, timeFrame: defaultTimeFrames.dailyOneYear },
            ]
        },
        setSingleChartTickerTimeFrameAndChartingId: (state, action) =>
        {
            return [{ ticker: action.payload.ticker, timeFrame: defaultTimeFrames.dailyOneYear, chartId: action.payload.chartId }]
        },
        setSingleChartTickerTimeFrameChartIdPlanIdForTrade: (state, action) =>
        {
            return [{ ticker: action.payload.ticker, timeFrame: defaultTimeFrames.threeDayOneMin, chartId: action.payload.chartId, planId: action.payload.planId, plan: action.payload.plan.plan }]
        },
        setSingleChartToTickerTimeFrameTradeId: (state, action) =>
        {
            return [{
                ticker: action.payload.ticker,
                timeFrame: defaultTimeFrames.threeDayOneMin,
                chartId: action.payload.chartId,
                planId: action.payload.planId,
                trade: action.payload.trade
            }]
        }
    },
});

export const {
    setSelectedStockAndTimelineFourSplit,
    setSelectedIndexTimeFrame,
    setSingleChartTickerTimeFrameAndChartingId,
    setSingleChartTickerTimeFrameChartIdPlanIdForTrade,
    setSingleChartToTickerTimeFrameTradeId
} = selectedStockSlice.actions;

export default selectedStockSlice.reducer;

export const selectAllFourStocks = (state) => state.selectedStock
export const selectSelectedStockByIndex = (state, index) => state.selectedStock[index];

export const selectSingleChartStock = (state) => state.selectedStock[0]

export const selectTradeChartStock = (state) => state.selectedStock[0]