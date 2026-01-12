import { createSlice } from "@reduxjs/toolkit";

const chartingVisibilitySlice = createSlice({
    name: 'chartingVisibility',
    initialState: {
        trendLines: true,
        currentPrice: true,
        enterExitPlan: true,
        
        anyFreeLines: true, freeLines: true, previousFreeLines: true,
        anyLinesH: true, linesH: true, previousLinesH: true,
        anyTrendLines: true, trendLines: true, previousTrendLines: true,
        anyChannels: true, channels: true, previousChannels: true,
        anyTriangles: true, triangles: true, previousTriangles: true,
        anyWedges: true, wedges: true, previousWedges: true,
        anyEnterExits: true, enterExits: true, previousEnterExits: true,
        showAnyPrevious: true, showAnyCurrent: true,
        showAll: true, showOnlyEnterExit: false
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
