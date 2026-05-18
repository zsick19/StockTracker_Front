import { createSlice } from "@reduxjs/toolkit";
import * as short from 'short-uuid'

const standardDeviationSlice = createSlice({
    name: "standardDeviationControl",
    initialState: {
        std1Daily: [],
        std2Daily: [],
        selectedDeviation: undefined
    },
    reducers: {
        addSTDDaily: (state, action) =>
        {
            let indexOfTickerAlreadyPresent = state.std1Daily.findIndex(t => t.Symbol === action.payload.Symbol)
            if (indexOfTickerAlreadyPresent !== -1) { state.std1Daily.splice(indexOfTickerAlreadyPresent, 1) }
            state.std1Daily.push({ id: short.generate(), ...action.payload })
        },
        clearSTDDaily: (state, action) =>
        {
            state.std1Daily = state.std1Daily.filter(t => t.id !== action.payload)
        },
        setSelectedDeviation: (state, action) =>
        {
            state.selectedDeviation = action.payload
        }
    },
});

export const {
    addSTDDaily,
    clearSTDDaily,
    setSelectedDeviation
} = standardDeviationSlice.actions;

export default standardDeviationSlice.reducer;

export const selectStandardDeviationState = (state) => state.standardDeviationControl

export const dailySingleDeviationCount = (state) => state.standardDeviationControl.std1Daily.count

export const provideSelectedDeviation = (state) => state.standardDeviationControl.selectedDeviation