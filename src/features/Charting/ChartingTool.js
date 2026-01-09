import { createSlice } from "@reduxjs/toolkit";

const chartingToolSlice = createSlice({
    name: 'chartingTool',
    initialState: 'Trace',
    reducers: {
        setTool: (state, action) =>
        {
            return action.payload
        },


    }
})

export const { setTool } = chartingToolSlice.actions

export default chartingToolSlice.reducer

export const selectCurrentTool = (state) => state.chartingTool
