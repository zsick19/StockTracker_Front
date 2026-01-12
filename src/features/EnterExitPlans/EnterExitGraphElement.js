import { createSelector, createSlice } from "@reduxjs/toolkit";

const enterExitGraphElementsSlice = createSlice({
    name: "enterExitGraphElements",
    initialState: {},
    reducers: {
        setEnterExitCharting: (state, action) =>
        {
            let chartingData = action.payload
            if (action.payload.plannedId)
            {
                state[chartingData.tickerSymbol] = { ...chartingData.plannedId.plan }
            } else
            {
                state[chartingData.tickerSymbol] = {
                    enterBufferPrice: undefined,
                    enterPrice: undefined,
                    stoplossPrice: undefined,
                    exitBufferPrice: undefined,
                    exitPrice: undefined,
                    moonPrice: undefined,
                    risk: undefined,
                    reward: undefined
                }
            }

        },

    },
});

export const {
    setEnterExitCharting
} = enterExitGraphElementsSlice.actions;

export default enterExitGraphElementsSlice.reducer;


const enterExitPlans = (state) => { return state.enterExitElement }
const selectedTicker = (state, ticker) => ticker
export const selectEnterExitByTickerMemo = createSelector(
    [enterExitPlans, selectedTicker],
    (enterExitPlans, ticker) => { return enterExitPlans[ticker] }
)


export const makeSelectEnterExitByTicker = () => createSelector(
    [(state) => state.enterExitElement, (state, ticker) => ticker],
    (enterExitPlans, ticker) => enterExitPlans[ticker]
)
