import { createSelector, createSlice } from "@reduxjs/toolkit";

const keyLevelGraphElementsSlice = createSlice({
    name: "keyLevelGraphElements",
    initialState: {
    },
    reducers: {
        setKeyLevelsCharting: (state, action) =>
        {
            let chartingData = action.payload

            state[chartingData.tickerSymbol] = {
                gammaFlip: chartingData?.gammaFlip || undefined,
                dailyEM: chartingData.dailyEM,
                weeklyEM: chartingData.weeklyEM,
                standardDeviation: chartingData.standardDeviation,
                oneDayToExpire: chartingData?.oneDayToExpire || []
            }
        },
    },
});

export const {
    setKeyLevelsCharting
} = keyLevelGraphElementsSlice.actions;

export default keyLevelGraphElementsSlice.reducer;


export const makeSelectKeyLevelsByTicker = () => createSelector(
    [(state) => state.keyLevelElement, (state, ticker) => ticker],
    (keyLevelElement, ticker) => keyLevelElement[ticker]
)


export const selectTickerKeyLevels = (state, ticker) =>
{
    if (ticker in state.keyLevelElement) return state.keyLevelElement[ticker]
    else return {}
}

export const { selectByTicker } = keyLevelGraphElementsSlice.selectors