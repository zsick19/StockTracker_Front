import { createSelector, createSlice } from "@reduxjs/toolkit";
import { ChartingApiSlice } from "../Charting/ChartingSliceApi";
import { EnterExitPlanApiSlice } from "./EnterExitApiSlice";

const enterExitGraphElementsSlice = createSlice({
    name: "enterExitGraphElements",
    initialState: {},
    reducers: {
        setEnterExitCharting: (state, action) =>
        {
            let chartingData = action.payload
            console.log(action.payload)
            if (action.payload?.plannedId)
            {
                state[chartingData.tickerSymbol] = {
                    ...chartingData.plannedId.plan,
                    initialTrackingPrice: chartingData.plannedId?.initialTrackingPrice || undefined,
                    tradeEnterDate: chartingData.plannedId?.tradeEnterDate || undefined,
                    id: chartingData.plannedId._id, enterExitPlanAltered: false,
                    dailyTickerValues: chartingData.plannedId?.dailyTickerValues || undefined
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
        defineRelevantHighLow: (state, action) =>
        {
            if (action.payload.isHigh) { state[action.payload.ticker].relevantHighs.push(action.payload.relevant) } else
            { state[action.payload.ticker].relevantLows.push(action.payload.relevant) }
        },
        removeRelevantHighLowInstitution: (state, action) =>
        {
            if (action.payload.remove.group === 'relevantHigh')
            {
                state[action.payload.ticker].relevantHighs = state[action.payload.ticker].relevantHighs.filter(t => t.dateHit !== action.payload?.remove.chartingElement.dateHit)
            } else if (action.payload.remove.group === 'relevantLow')
            {
                state[action.payload.ticker].relevantLows = state[action.payload.ticker].relevantLows.filter(t => t.dateHit !== action.payload?.remove.chartingElement.dateHit)
            } else if (action.payload.remove.group === 'institutional')
            {
                state[action.payload.ticker].institutionalPricePoints = state[action.payload.ticker].institutionalPricePoints.filter(t => t.dateHit !== action.payload?.remove.chartingElement.dateHit)
            }
        },
        defineInstitutionalPrice: (state, action) =>
        {
            state[action.payload.ticker].institutionalPricePoints.push(action.payload.institutional)
        },
        setEnterExitChartingFromPlan: (state, action) =>
        {
            if (action.payload.plan?.length)
            {
                let planArray = action.payload.plan


                state[action.payload.tickerSymbol] = {
                    stopLossPrice: planArray[0],
                    enterPrice: planArray[1],
                    enterBufferPrice: planArray[2],
                    exitBufferPrice: planArray[3],
                    exitPrice: planArray[4],
                    moonPrice: planArray[5],
                    id: action.payload.planId,
                    percents: [1, 1, 1, 1, 1, 1],
                    enterExitPlanAltered: false,
                    relevantHighs: action.payload.relevantHighs,
                    relevantLows: action.payload.relevantLows,
                    institutionalPricePoints: action.payload.institutionalPricePoints
                }
            } else
            {
                state[action.payload.tickerSymbol] = {
                    ...action.payload.plan, id: action.payload.planId, enterExitPlanAltered: false
                }
            }
        },
        setEnterExitWithDetailsFromPlan: (state, action) =>
        {
            state[action.payload.tickerSymbol] = {
                stopLossPrice: action.payload.plan.stopLossPrice,
                enterPrice: action.payload.plan.enterPrice,
                enterBufferPrice: action.payload.plan.enterBufferPrice,
                exitBufferPrice: action.payload.plan.exitBufferPrice,
                exitPrice: action.payload.plan.exitPrice,
                moonPrice: action.payload.plan.moonPrice,
                id: action.payload._id,
                percents: action.payload.plan.percents,
                enterExitPlanAltered: false,
                relevantHighs: action.payload.relevantHighs,
                relevantLows: action.payload.relevantLows,
                institutionalPricePoints: action.payload.institutionalPricePoints
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
        ),
            builder.addMatcher(
                EnterExitPlanApiSlice.endpoints.removeGroupedEnterExitPlan.matchFulfilled,
                (state, { payload }) =>
                {
                    if (payload.removeTheseTickers)
                    {
                        payload.removeTheseTickers.forEach((removedTicker) =>
                        {
                            delete state[removedTicker]
                        })
                    }
                }
            )
    }
});

export const {
    setEnterExitCharting,
    defineEnterExitPlan,
    defineInstitutionalPrice,
    defineRelevantHighLow, removeRelevantHighLowInstitution,
    setEnterExitChartingFromPlan,
    setEnterExitWithDetailsFromPlan
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