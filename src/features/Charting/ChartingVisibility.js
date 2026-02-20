import { createSelector, createSlice } from "@reduxjs/toolkit";
import { setInitialGraphControl } from "./GraphHoverZoomElement";

const chartingVisibilitySlice = createSlice({
    name: 'chartingVisibility',
    initialState: {},
    reducers: {
        setInitialGraphVisibility: (state, action) =>
        {
            state[action.payload.uuid] = {
                trendLines: true,
                currentPrice: true,
                enterExitPlan: true,
                enterExitText: false,
                anyFreeLines: true, freeLines: true, previousFreeLines: true,
                // anyLinesH: true, linesH: true, previousLinesH: true,
                // anyTrendLines: true, trendLines: true, previousTrendLines: true,
                // anyChannels: true, channels: true, previousChannels: true,
                // anyTriangles: true, triangles: true, previousTriangles: true,
                // anyWedges: true, wedges: true, previousWedges: true,
                anyEnterExits: true, enterExits: true, previousEnterExits: true,
                showAnyPrevious: true, showAnyCurrent: true,
                showAll: true, showOnlyEnterExit: false
            }
        },
        clearGraphVisibility: (state, action) =>
        {
            delete state[action.payload.uuid]
        },
        setToggleAllVisibility: (state, action) =>
        {
            if (!action.payload.uuid) return
            state[action.payload.uuid].showAll = !state[action.payload.uuid].showAll
        },
        setToggleOnlyEnterExitVisibility: (state, action) =>
        {
            if (!action.payload.uuid) return
            state[action.payload.uuid].showOnlyEnterExit = !state[action.payload.uuid].showOnlyEnterExit
        },
        setToggleEnterExitText: (state, action) =>
        {
            if (!action.payload.uuid) return
            state[action.payload.uuid].enterExitText = !state[action.payload.uuid].enterExitText
        },
        setIndividualVisibility: (state, action) =>
        {
            state.chartingVisibility[action.payload.chartingElement] = action.payload.visible
        },


    }
})

export const { setInitialGraphVisibility, setToggleAllVisibility, setToggleOnlyEnterExitVisibility, setToggleEnterExitText, clearGraphVisibility } = chartingVisibilitySlice.actions

export default chartingVisibilitySlice.reducer

export const makeSelectGraphVisibilityByUUID = () => createSelector(
    [(state) => state.chartingVisibility, (state, uuid) => uuid],
    (entities, uuid) =>
    {
        if (uuid) return entities[uuid]
    }
)

export const selectChartVisibility = (state) => state.chartingVisibility
