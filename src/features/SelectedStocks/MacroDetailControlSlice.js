import { createSlice } from "@reduxjs/toolkit";

const MacroDetailControlSlice = createSlice({
    name: "macroDetailControl",
    initialState: { detailSelected: 1, ticker: undefined },
    reducers: {
        setMacroDetailState: (state, action) =>
        {
            state.detailSelected = action.payload?.detail || action.payload
        },
        setMacroDetailStateWithTicker: (state, action) =>
        {
            state.detailSelected = action.payload.detail
            state.ticker = action.payload.ticker
        },
        setMacroDetailIfClearingRunner: (state, action) =>
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
    setMacroDetailState,
    setMacroDetailStateWithTicker,
    setMacroDetailIfClearingRunner
} = MacroDetailControlSlice.actions;

export default MacroDetailControlSlice.reducer;

export const selectMacroDetailControl = (state) => state.macroDetailControl
export const selectMacroDetailTickerControl = (state) => state.macroDetailControl.ticker
