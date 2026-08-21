import { createSlice } from "@reduxjs/toolkit";

const stockDetailControlSlice = createSlice({
    name: "stockDetailControl",
    initialState: { detailSelected: 1, ticker: undefined },
    reducers: {
        setStockDetailState: (state, action) =>
        {
            state.detailSelected = action.payload?.detail || action.payload
        },
        setStockDetailStateWithTicker: (state, action) =>
        {
            state.detailSelected = action.payload.detail
            state.ticker = action.payload.ticker
        },
        setStockDetailIfClearingRunner: (state, action) =>
        {
            if (state.ticker === action.payload)
            {
                state.detailSelected = 1
                state.ticker = undefined
            }
        }
    },
});

export const {
    setStockDetailState,
    setStockDetailStateWithTicker,
    setStockDetailIfClearingRunner
} = stockDetailControlSlice.actions;

export default stockDetailControlSlice.reducer;

export const selectStockDetailControl = (state) => state.stockDetailControl
export const selectStockDetailTickerControl = (state) => state.stockDetailControl.ticker
