import { createSlice } from "@reduxjs/toolkit";

const chartingVisibilitySlice = createSlice({
    name: 'chartingVisibility',
    initialState: {
        trendLines: true,
        currentPrice: true,
        enterExitPlan: true
    },
    reducers: {
        setAllVisibility: (state, action) =>
        {
            return action.payload
        },
        setIndividualVisibility: (state, action) =>
        {
            state.chartingVisibility[action.payload.chartingElement] = action.payload.visible
        },


    }
})

export const { setAllVisibility, setIndividualVisibility } = chartingVisibilitySlice.actions

export default chartingVisibilitySlice.reducer

export const selectChartVisibility = (state) => state.chartingVisibility
