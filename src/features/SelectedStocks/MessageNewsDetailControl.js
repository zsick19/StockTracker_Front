import { createSlice } from "@reduxjs/toolkit";

const messageNewsDetailControlSlice = createSlice({
    name: "messageNewsDetailControl",
    initialState: 'general',
    reducers: {
        setMessageNewsDetailState: (state, action) =>
        {
            return action.payload
        }
    },
});

export const {
    setMessageNewsDetailState
} = messageNewsDetailControlSlice.actions;

export default messageNewsDetailControlSlice.reducer;

export const selectMessageNewsDetailControl = (state) => state.messageNewsDetailControl
