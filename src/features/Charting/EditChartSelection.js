import { createSlice } from "@reduxjs/toolkit";

const editChartSelectionSlice = createSlice({
    name: 'editChartSelection',
    initialState: { editMode: undefined },
    reducers: {
        setChartEditMode: (state, action) =>
        {
            if (state.editMode)
            {

                state.editMode = undefined
            } else
            {

                state.editMode = action.payload
            }
        },


    }
})

export const { setChartEditMode } = editChartSelectionSlice.actions

export default editChartSelectionSlice.reducer

export const selectChartEditMode = (state) => { return state.editChartSelection.editMode }
