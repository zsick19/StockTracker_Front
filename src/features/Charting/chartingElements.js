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
    addHorizontalLine: (state, action) =>
    {
      let { lineH, ticker } = action.payload
      let nextLineHId = state[ticker].linesHId + 1
      lineH.id = nextLineHId
      lineH.dateCreated = new Date().toLocaleDateString();

      state[ticker].linesHId = nextLineHId
      state[ticker].linesH.push(lineH)
      state[ticker].chartingAltered = true;
    },
    updateHorizontalLine: (state, action) =>
    {
      let { ticker, update } = action.payload
      state[ticker].linesH = state[ticker].linesH.map((line) => { if (line.id === update.id) { return update; } else return line })
      state[ticker].chartingAltered = true
    },


    addVolumeNode: (state, action) =>
    {
      let { completeCapture, ticker, isHighVolNode } = action.payload
      if (completeCapture.priceP1 > 0)
      {
        if (isHighVolNode)
        {
          let volNode = { id: state[ticker].highVolumeNodesId, price: completeCapture.priceP1, dateCreated: new Date().toDateString() };
          state[ticker].highVolumeNodesId = state[ticker].highVolumeNodesId + 1;
          state[ticker].highVolumeNodes.push(volNode)
        } else
        {
          let volNode = { id: state[ticker].lowVolumeNodesId, price: completeCapture.priceP1, dateCreated: new Date().toDateString() };
          state[ticker].lowVolumeNodesId = state[ticker].lowVolumeNodesId + 1;
          state[ticker].lowVolumeNodes.push(volNode)
        }
        state[ticker].chartingAltered = true;
      }
    },
    updateVolumeNode: (state, action) =>
    {
      let { ticker, update, isHighVolNode } = action.payload
      if (isHighVolNode)
      {
        state[ticker].highVolumeNodes = state[ticker].highVolumeNodes.map((vol) => { if (vol.id === update.id) { return update } else return vol })
      } else
      {
        state[ticker].lowVolumeNodes = state[ticker].lowVolumeNodes.map((vol) => { if (vol.id === update.id) { return update } else return vol })
      }
      state[ticker].chartingAltered = true;

    },


    addEnterExitToCharting: (state, action) =>
    {
      let { enterExit, ticker } = action.payload
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

    addSupportResistance: (state, action) =>
    {
      let { completeCapture, ticker, isResistance } = action.payload

      let supportResistanceNode = { id: state[ticker].supportResistanceLinesId, ...completeCapture, isResistance, dateCreated: new Date().toDateString() };
      state[ticker].supportResistanceLinesId = state[ticker].supportResistanceLinesId + 1;
      state[ticker].supportResistanceLines.push(supportResistanceNode)
      state[ticker].chartingAltered = true;
    },
    updateSupportResistance: (state, action) =>
    {

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
        case "freeLines": state[ticker].freeLines = state[ticker].freeLines.filter((t) => t.id !== chartingElement.id); break;
        case "linesH": state[ticker].linesH = state[ticker].linesH.filter((t) => t.id !== chartingElement.id); break;
        case 'highVolumeNodes': state[ticker].highVolumeNodes = state[ticker].highVolumeNodes.filter((t) => t.id !== chartingElement.id); break;
        case 'lowVolumeNodes': state[ticker].lowVolumeNodes = state[ticker].lowVolumeNodes.filter((t) => t.id !== chartingElement.id); break;
        case "enterExit": state[ticker].enterExitLines = undefined; break;
      }
      state[ticker].chartingAltered = true;
    },
    setPreviousCharting: (state, action) =>
    {

      if (action.payload.charting)
      {
        if (action.payload.charting?.supportResistance) state[action.payload.tickerSymbol] = { ...action.payload.charting, chartingAltered: false }
        else state[action.payload.tickerSymbol] = { ...action.payload.charting, supportResistanceLines: [], supportResistanceLinesId: 1, chartingAltered: false }
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
          lowVolumeNodes: [],
          lowVolumeNodesId: 1,
          highVolumeNodes: [],
          highVolumeNodesId: 1,
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
  addHorizontalLine,
  updateHorizontalLine,
  addSupportResistance,
  updateSupportResistance,

  addEnterExitToCharting,
  updateEnterExitToCharting,
  removeChartingElement,
  updateKeyPrice,
  setPreviousCharting,
  addVolumeNode,
  updateVolumeNode
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
