import { createSelector, createSlice } from "@reduxjs/toolkit";
import { ChartingApiSlice } from "../Charting/ChartingSliceApi";
import { TradeApiSlice } from "./TradeSliceApi";


const preTradeCheckSlice = createSlice({
    name: "preTradeCheck",
    initialState: {
        currentTicker: undefined,
        preTradeDetails: {}
    },
    reducers: {

        initiateTickerPreCheck: (state, action) =>
        {
            state.plan = action.payload.plan
            state.activeTrade = action.payload?.activeTrade
        },
    },
    extraReducers: (builder) =>
    {

    }
});

export const {
    initiateTickerPreCheck
} = preTradeCheckSlice.actions;

export default preTradeCheckSlice.reducer;


export const selectPreCheckTickerMemo = (state) => state.preTradeCheck.plan
export const selectPreCheckTickerActiveTradeMemo = (state) => state.preTradeCheck.activeTrade


