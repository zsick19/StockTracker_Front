import { createSlice } from "@reduxjs/toolkit";

const editChartSelectionSlice = createSlice({
    name: 'chartEditSelection',
    initialState: { editMode: undefined },
    reducers: {
        setChartEditMode: (state, action) =>
        {
            state.editMode = action.payload
        },


    }
})

export const { setChartEditMode } = editChartSelectionSlice.actions

export default editChartSelectionSlice.reducer

export const selectChartEditMode = (state) => state.chartEditSelection.editMode
