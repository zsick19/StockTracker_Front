import { createSelector, createSlice } from "@reduxjs/toolkit";

const keyLevelGraphElementsSlice = createSlice({
    name: "keyLevelGraphElements",
    initialState: {
    },
    reducers: {
        setKeyLevelsCharting: (state, action) =>
        {
            let chartingData = action.payload

            if (action.payload.gammaFlip)
            {
                state[chartingData.tickerSymbol] = {
                    gammaFlip: chartingData.gammaFlip,
                    dailyEM: chartingData.dailyEM,
                    weeklyEM: chartingData.weeklyEM,
                    previousWeekEM: [{ weekStart: new Date().toISOString(), EMUpper: 944, EMLower: 231 }],
                    monthlyEM: [{ monthStart: new Date().toISOString(), EMLower: 222, EMUpper: 333 }]
                }
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