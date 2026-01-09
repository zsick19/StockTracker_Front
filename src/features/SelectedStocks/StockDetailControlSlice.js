import { createSlice } from "@reduxjs/toolkit";

const stockDetailControlSlice = createSlice({
    name: "stockDetailControl",
    initialState: 5,
    reducers: {
        setStockDetailState: (state, action) =>
        {
            return action.payload
        }
    },
});

export const {
    setStockDetailState
} = stockDetailControlSlice.actions;

export default stockDetailControlSlice.reducer;

export const selectStockDetailControl = (state) => state.stockDetailControl
