import { createSlice } from "@reduxjs/toolkit";

const stockDetailControlSlice = createSlice({
    name: "stockDetailControl",
    initialState: { detailSelected: 1, ticker: undefined },
    reducers: {
        setStockDetailState: (state, action) =>
        {
            console.log(action.payload)
            state.detailSelected = action.payload
        },
        setStockDetailStateWithTicker: (state, action) =>
        {
            state.detailSelected = action.payload.detail
            state.ticker = action.payload.ticker
        }
    },
});

export const {
    setStockDetailState,
    setStockDetailStateWithTicker
} = stockDetailControlSlice.actions;

export default stockDetailControlSlice.reducer;

export const selectStockDetailControl = (state) => state.stockDetailControl
export const selectStockDetailTickerControl = (state) => state.stockDetailControl.ticker
