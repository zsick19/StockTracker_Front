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
                { ticker: action.payload.ticker, timeFrame: defaultTimeFrames.threeDayOneMin, trade: action.payload?.trade, chartId: action.payload?.chartId, tickerSector: action.payload?.tickerSector },
                { ticker: action.payload.ticker, timeFrame: defaultTimeFrames.threeDayFiveMin, chartId: action.payload?.chartId, tickerSector: action.payload?.tickerSector },
                { ticker: action.payload.ticker, timeFrame: defaultTimeFrames.threeDayOneHour, chartId: action.payload?.chartId, tickerSector: action.payload?.tickerSector },
                { ticker: action.payload.ticker, timeFrame: defaultTimeFrames.dailyOneYear, chartId: action.payload?.chartId, tickerSector: action.payload?.tickerSector },
            ]
        },
        setSingleChartTickerTimeFrameAndChartingId: (state, action) =>
        {

            return [{ ticker: action.payload.ticker, timeFrame: defaultTimeFrames.dailyOneYear, chartId: action.payload.chartId, tickerSector: action.payload?.tickerSector }]
        },
        setSingleChartTickerTimeFrameChartIdPlanIdForTrade: (state, action) =>
        {
            return [{
                tickerSymbol: action.payload?.ticker || action.payload.tickerSymbol,
                tickerSector: action.payload.tickerSector,
                timeFrame: defaultTimeFrames.threeDayOneMin,
                chartId: action.payload.chartId,
                planId: action.payload.planId,
                plan: action.payload.plan,
                watchList: action.payload?.watchList
            }]
        },
        setSingleChartToTickerTimeFrameTradeId: (state, action) =>
        {
            return [{
                tickerSymbol: action.payload.tickerSymbol,
                timeFrame: defaultTimeFrames.threeDayOneMin,
                chartId: action.payload.chartId,
                planId: action.payload.planId,
                trade: action.payload.trade
            }]
        },

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