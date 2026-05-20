import { createSlice } from "@reduxjs/toolkit";
import * as short from 'short-uuid'

const priceAlertSlice = createSlice({
    name: "priceAlertControl",
    initialState: {
        priceBelowAlert: [],
        priceAboveAlert: [],
    },
    reducers: {
        addPriceAlert: (state, action) =>
        {
            let foundAndReplaced = true
            state.priceBelowAlert = state.priceBelowAlert.map((t, i) =>
            {
                if (t.Symbol === action.payload.Symbol)
                {
                    foundAndReplaced = false
                    return action.payload
                }
                return t
            })
            if (foundAndReplaced) state.priceBelowAlert.push(action.payload)

            // let indexOfTickerAlreadyPresent = state.std1Daily.findIndex(t => t.Symbol === action.payload.Symbol)
            // if (indexOfTickerAlreadyPresent !== -1) { state.std1Daily.splice(indexOfTickerAlreadyPresent, 1) }
            // state.std1Daily.push({ id: short.generate(), ...action.payload })
        },
        clearPriceAlert: (state, action) =>
        {
            state.std1Daily = state.std1Daily.filter(t => t.id !== action.payload)
        },

    },
});

export const {
    addPriceAlert,
} = priceAlertSlice.actions;

export default priceAlertSlice.reducer;

export const selectPriceAlertState = (state) => state.priceAlertControl
// export const dailySingleDeviationCount = (state) => state.standardDeviationControl.std1Daily.count
// export const provideSelectedDeviation = (state) => state.standardDeviationControl.selectedDeviation