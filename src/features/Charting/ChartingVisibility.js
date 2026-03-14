import { createSelector, createSlice } from "@reduxjs/toolkit";
import { setInitialGraphControl } from "./GraphHoverZoomElement";

const chartingVisibilitySlice = createSlice({
    name: 'chartingVisibility',
    initialState: {},
    reducers: {
        setInitialGraphVisibility: (state, action) =>
        {
            state[action.payload.uuid] = {

                enterExitPlan: true,
                enterExitText: false,
                anyEnterExits: true, enterExits: true, previousEnterExits: true,


                anyFreeLines: true, freeLines: true, previousFreeLines: true,
                anyTrendLines: true, trendLines: true, previousTrendLines: true,
                anyKeyLevels: true, keyLevels: true, previousKeyLevels: true,
                anyLinesH: true, linesH: true, previousLinesH: true,
                anyVolumeNodes: true, volNodes: true, previousVolNodes: true,
                anySupportResistance: true, supportResistance: true, previousSupportResistance: true,


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
        setIndividualAnyVisibility: (state, action) =>
        {
            if (!action.payload.uuid || !action.payload.chartingElement) return

            switch (action.payload.chartingElement)
            {
                case 'linesH': state[action.payload.uuid].anyLinesH = !state[action.payload.uuid].anyLinesH; break;
                case 'supportResistance': state[action.payload.uuid].anySupportResistance = !state[action.payload.uuid].anySupportResistance; break;
                case 'volNodes': state[action.payload.uuid].anyVolumeNodes = !state[action.payload.uuid].anyVolumeNodes; break;
                case 'freeLines': state[action.payload.uuid].anyFreeLines = !state[action.payload.uuid].anyFreeLines; break;
                case 'trendLines': state[action.payload.uuid].anyTrendLines = !state[action.payload.uuid].anyTrendLines; break;
                case 'keyLevels': state[action.payload.uuid].anyKeyLevels = !state[action.payload.uuid].anyKeyLevels; break;
            }
        },
        setIndividualPreviousVisibility: (state, action) =>
        {
            if (!action.payload.uuid || !action.payload.chartingElement) return

            switch (action.payload.chartingElement)
            {
                case 'linesH': state[action.payload.uuid].previousLinesH = !state[action.payload.uuid].previousLinesH; break;
                case 'supportResistance': state[action.payload.uuid].previousSupportResistance = !state[action.payload.uuid].previousSupportResistance; break;
                case 'volNodes': state[action.payload.uuid].previousVolumeNodes = !state[action.payload.uuid].previousVolumeNodes; break;
                case 'freeLines': state[action.payload.uuid].previousFreeLines = !state[action.payload.uuid].previousFreeLines; break;
                case 'trendLines': state[action.payload.uuid].previousTrendLines = !state[action.payload.uuid].previousTrendLines; break;
                case 'keyLevels': state[action.payload.uuid].previousKeyLevels = !state[action.payload.uuid].previousKeyLevels; break;
            }
        },


    }
})

export const { setInitialGraphVisibility, setToggleAllVisibility, setToggleOnlyEnterExitVisibility, setToggleEnterExitText, clearGraphVisibility, setIndividualPreviousVisibility, setIndividualAnyVisibility } = chartingVisibilitySlice.actions

export default chartingVisibilitySlice.reducer

export const makeSelectGraphVisibilityByUUID = () => createSelector(
    [(state) => state.chartingVisibility, (state, uuid) => uuid],
    (entities, uuid) =>
    {
        if (uuid) return entities[uuid]
    }
)

export const selectChartVisibility = (state) => state.chartingVisibility
