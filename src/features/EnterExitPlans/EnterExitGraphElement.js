import { createSelector, createSlice } from "@reduxjs/toolkit";
import { ChartingApiSlice } from "../Charting/ChartingSliceApi";

const enterExitGraphElementsSlice = createSlice({
    name: "enterExitGraphElements",
    initialState: {},
    reducers: {
        setEnterExitCharting: (state, action) =>
        {
            let chartingData = action.payload

            if (action.payload?.plannedId)
            {
                state[chartingData.tickerSymbol] = {
                    ...chartingData.plannedId.plan,
                    id: chartingData.plannedId._id, enterExitPlanAltered: false
                }
            }
            else { state[chartingData.tickerSymbol] = undefined }
        },
        defineEnterExitPlan: (state, action) =>
        {
            state[action.payload.ticker] = {
                ...action.payload.enterExitPlan,
                id: state[action.payload.ticker].id,
                enterExitPlanAltered: true
            }
        },
        setEnterExitChartingFromPlan: (state, action) =>
        {
            state[action.payload.tickerSymbol] = {
                ...action.payload.plan, id: action.payload.planId, enterExitPlanAltered: false
            }
        }
    },
    extraReducers: (builder) =>
    {
        builder.addMatcher(
            ChartingApiSlice.endpoints.removeChartableStock.matchFulfilled,
            (state, { payload }) =>
            {
                if (payload.removedEnterExit) { delete state[payload.removedEnterExit.tickerSymbol] }
            }
        )
    }
});

export const {
    setEnterExitCharting,
    defineEnterExitPlan,
    setEnterExitChartingFromPlan
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