import { createSelector, createSlice, current } from "@reduxjs/toolkit";

const graphStudiesVisualElement = createSlice({
    name: "graphStudiesVisualElement",
    initialState: {},
    reducers: {
        setInitialGraphStudyControl: (state, action) =>
        {
            state[action.payload.uuid] = {
                ema: false,
                vwap: false,
                volume: false,
                volumeProfile: false
            }
        },
        setGraphEMAControl: (state, action) =>
        {
            if (!action.payload.uuid) return
            state[action.payload.uuid].ema = !state[action.payload.uuid].ema
        },
        setGraphVWAPControl: (state, action) =>
        {
            if (!action.payload.uuid) return
            state[action.payload.uuid].vwap = !state[action.payload.uuid].vwap
        },
        setGraphVolumeControl: (state, action) =>
        {
            if (!action.payload.uuid) return
            state[action.payload.uuid].volume = !state[action.payload.uuid].volume
        },
        setGraphVolumeProfileControl: (state, action) =>
        {
            if (!action.payload.uuid) return
            state[action.payload.uuid].volumeProfile = !state[action.payload.uuid].volumeProfile
        },
        clearGraphStudyControl: (state, action) =>
        {
            delete state[action.payload.uuid]
        }
    },
});

export const {
    setInitialGraphStudyControl,
    setGraphEMAControl,
    setGraphVWAPControl,
    setGraphVolumeControl,
    setGraphVolumeProfileControl,
    clearGraphStudyControl

} = graphStudiesVisualElement.actions;

export default graphStudiesVisualElement.reducer;


export const makeSelectGraphStudyByUUID = () => createSelector(
    [(state) => state.graphStudyVisual, (state, uuid) => uuid],
    (entities, uuid) =>
    {
        if (uuid) return entities[uuid]
    })
