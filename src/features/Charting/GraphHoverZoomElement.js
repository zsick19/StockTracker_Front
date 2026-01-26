import { createSelector, createSlice, current } from "@reduxjs/toolkit";

const graphHoverZoomElementSlice = createSlice({
  name: "graphHoverZoomElement",
  initialState: {},
  reducers: {
    setInitialGraphControl: (state, action) =>
    {

      state[action.payload] = { x: undefined, y: undefined }
    },
    setXZoomState: (state, action) =>
    {
      if (!action.payload.uuid) return
      state[action.payload.uuid].x = action.payload.zoom
    },
    setYZoomState: (state, action) =>
    {
      if (!action.payload.uuid) return
      state[action.payload.uuid].y = action.payload.zoom
    },
    setResetXYZoomState: (state, action) =>
    {
      if (!action.payload.uuid) return
      state[action.payload.uuid] = { x: undefined, y: undefined }
    },
    clearGraphControl: (state, action) =>
    {
      delete state[action.payload]
    }
  },
});

export const {
  setInitialGraphControl,
  clearGraphControl,
  setXZoomState,
  setYZoomState,
  setResetXYZoomState
} = graphHoverZoomElementSlice.actions;

export default graphHoverZoomElementSlice.reducer;


export const makeSelectZoomStateByUUID = () => createSelector(
  [(state) => state.graphHoverZoom, (state, uuid) => uuid],
  (entities, uuid) =>
  {
    if (uuid) return entities[uuid]
  })
// export const makeSelectMouseStateByUUID = () => createSelector(
//   [(state) => state.graphHoverZoom, (state, uuid) => uuid],
//   (entities, uuid) => entities[uuid].mousePosition
// )

