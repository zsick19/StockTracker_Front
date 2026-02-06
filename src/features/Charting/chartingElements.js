import { createSelector, createSlice, current } from "@reduxjs/toolkit";

const chartingElementSlice = createSlice({
  name: "chartingElement",
  initialState: {},
  reducers: {
    addLine: (state, action) =>
    {
      let { line, ticker } = action.payload;
      line.id = state[ticker].freeLinesId + 1;
      line.dateCreated = new Date().toLocaleDateString();
      state[ticker].freeLinesId = state[ticker].freeLinesId + 1;
      state[ticker].freeLines.push(line);
      state[ticker].chartingAltered = true;
    },
    updateLine: (state, action) =>
    {
      let { ticker, update } = action.payload
      state[ticker].freeLines = state[ticker].freeLines.map((line) => { if (line.id === update.id) { return update; } else return line; });
      state[ticker].chartingAltered = true;
    },

    addEnterExitToCharting: (state, action) =>
    {
      console.log(action.payload)
      let { enterExit, ticker } = action.payload
      // if (ticker === undefined) ticker = action.payload.ticker.ticker
      enterExit.dateCreated = new Date().toLocaleDateString();
      state[ticker].enterExitLines = enterExit
      state[ticker].chartingAltered = true
    },
    updateEnterExitToCharting: (state, action) =>
    {
      let { updatedEnterExit, ticker } = action.payload
      state[ticker].enterExitLines = updatedEnterExit
      state[ticker].chartingAltered = true
    },
    updateKeyPrice: (state, action) =>
    {
      state.keyPriceLines = state.keyPriceLines.map((keyPrice) =>
      {
        if (keyPrice.id === action.payload.id) return action.payload;
        return keyPrice;
      });
      state.chartingAltered = true;
    },

    removeChartingElement: (state, action) =>
    {
      let { group, ticker, chartingElement } = action.payload
      switch (group)
      {
        case "freeLines": state[ticker].freeLines = state[ticker].freeLines.filter((t) => { return t.id !== chartingElement.id; }); break;
        case "trendLines": state[ticker].trendLines = state[ticker].trendLines.filter((t) => { return t.id !== chartingElement.id; }); break;
        case "channels": state[ticker].channels = state[ticker].channels.filter((t) => { return t.id !== chartingElement.id; }); break;
        case "linesH": state[ticker].linesH = state[ticker].linesH.filter((t) => { return t.id !== chartingElement.id; }); break;
        case "triangles": state[ticker].triangles = state[ticker].triangles.filter((t) => { return t.id !== chartingElement.id; }); break;
        case "wedges": state[ticker].wedges = state[ticker].wedges.filter((t) => { return t.id !== action.payload.chartingElement.id; }); break;
        case "enterExit": state[ticker].enterExitLines = undefined; break;
      }
      state[ticker].chartingAltered = true;
    },
    setPreviousCharting: (state, action) =>
    {

      if (action.payload.charting)
      {
        state[action.payload.tickerSymbol] = { ...action.payload.charting, chartingAltered: false }
      }
      else
      {
        state[action.payload.tickerSymbol] = {

          freeLines: [],
          freeLinesId: 1,
          trendLines: [],
          trendLinesId: 1,
          linesH: [],
          linesHId: 1,
          enterExitLines: {},
          chartingAltered: false
        }
      }
    },
  },
});

export const {
  addLine,
  updateLine,
  addEnterExitToCharting,
  updateEnterExitToCharting,
  removeChartingElement,
  updateKeyPrice,
  setPreviousCharting,
} = chartingElementSlice.actions;

export default chartingElementSlice.reducer;


export const makeSelectChartingByTicker = () => createSelector(
  [(state) => state.chartingElement, (state, ticker) => ticker],
  (entities, ticker) => entities[ticker]
)

export const makeSelectChartAlteredByTicker = () => createSelector(
  [(state) => state.chartingElement, (state, ticker) => ticker],
  (entities, ticker) => { return { altered: entities[ticker]?.chartingAltered, hasPlanCharted: entities[ticker]?.enterExitLines?.enterPrice } }
)
