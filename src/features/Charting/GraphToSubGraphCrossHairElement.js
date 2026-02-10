import { createSelector, createSlice, current } from "@reduxjs/toolkit";

const graphToSubGraphCrossHairElement = createSlice({
    name: "graphToSubGraphCrossHairElement",
    initialState: {},
    reducers: {
        setInitialGraphToSubGraphCrossHair: (state, action) =>
        {
            state[action.payload.uuid] = {
                x: undefined
            }
        },
        setGraphToSubGraphCrossHair: (state, action) =>
        {
            if (!action.payload.uuid) return
            state[action.payload.uuid].x = action.payload.x
        },
        setNoCurrentCrossHair: (state, action) =>
        {
            if (!action.payload.uuid) return
            state[action.payload.uuid].x = undefined
        },
        clearGraphToSubGraphCrossHair: (state, action) =>
        {
            delete state[action.payload.uuid]
        }
    },
});

export const {
    setInitialGraphToSubGraphCrossHair,
    setGraphToSubGraphCrossHair,
    clearGraphToSubGraphCrossHair,
    setNoCurrentCrossHair
} = graphToSubGraphCrossHairElement.actions;

export default graphToSubGraphCrossHairElement.reducer;


export const makeSelectGraphCrossHairsByUUID = () => createSelector(
    [(state) => state.graphToSubGraphCrossHairs, (state, uuid) => uuid],
    (entities, uuid) =>
    {
        if (uuid) return entities[uuid]
    })
