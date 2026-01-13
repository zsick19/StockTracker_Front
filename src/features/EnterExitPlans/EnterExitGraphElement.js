import { createSelector, createSlice } from "@reduxjs/toolkit";

const enterExitGraphElementsSlice = createSlice({
    name: "enterExitGraphElements",
    initialState: {},
    reducers: {
        setEnterExitCharting: (state, action) =>
        {
            let chartingData = action.payload

            if (action.payload.plannedId) { state[chartingData.tickerSymbol] = { ...chartingData.plannedId.plan, id: chartingData.plannedId._id, enterExitPlanAltered: false } }
            else { state[chartingData.tickerSymbol] = undefined }
        },
        defineEnterExitPlan: (state, action) =>
        {
            state[action.payload.ticker] = {
                id: state[action.payload.ticker].id,
                enterExitPlanAltered: true,
                ...action.payload.enterExitPlan
            }
        }
    },
});

export const {
    setEnterExitCharting,
    defineEnterExitPlan
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

export const makeSelectEnterExitPlanAltered = () => createSelector(
    [(state) => state.enterExitElement, (state, ticker) => ticker],
    (enterExitPlans, ticker) => enterExitPlans[ticker]?.enterExitPlanAltered
)