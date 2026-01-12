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
      //state.chartingAltered = true;
    },
    updateLine: (state, action) =>
    {
      state.freeLines = state.freeLines.map((line) =>
      {
        if (line.id === action.payload.id) return action.payload;
        return line;
      });
      state.chartingAltered = true;
    },

    // addKeyPrice: (state, action) =>
    // {
    //   let keyPrice = action.payload;
    //   keyPrice.id = state.keyPriceLinesId + 1;
    //   keyPrice.dateCreated = new Date().toLocaleDateString();
    //   state.keyPriceLinesId = state.keyPriceLinesId + 1;
    //   state.keyPriceLines.push(keyPrice);
    //   state.chartingAltered = true;
    // },
    updateKeyPrice: (state, action) =>
    {
      state.keyPriceLines = state.keyPriceLines.map((keyPrice) =>
      {
        if (keyPrice.id === action.payload.id) return action.payload;
        return keyPrice;
      });
      state.chartingAltered = true;
    },

    // removeViaChartingElement: (state, action) =>
    // {
    //   switch (action.payload.group)
    //   {
    //     case "freeLines":
    //       state.freeLines = state.freeLines.filter((t) =>
    //       {
    //         return t.id !== action.payload.chartingElement.id;
    //       });
    //       break;
    //     case "trendLines":
    //       state.trendLines = state.trendLines.filter((t) =>
    //       {
    //         return t.id !== action.payload.chartingElement.id;
    //       });
    //       break;
    //     case "channels":
    //       state.channels = state.channels.filter((t) =>
    //       {
    //         return t.id !== action.payload.chartingElement.id;
    //       });
    //       break;
    //     case "linesH":
    //       state.linesH = state.linesH.filter((t) =>
    //       {
    //         return t.id !== action.payload.chartingElement.id;
    //       });
    //       break;
    //     case "triangles":
    //       state.triangles = state.triangles.filter((t) =>
    //       {
    //         return t.id !== action.payload.chartingElement.id;
    //       });
    //       break;
    //     case "wedges":
    //       state.wedges = state.wedges.filter((t) =>
    //       {
    //         return t.id !== action.payload.chartingElement.id;
    //       });
    //       break;
    //     case "enterExitLines":
    //       {
    //         if (state.enterExitLines.length === 1) return;
    //         state.enterExitLines = state.enterExitLines.filter((t) =>
    //         {
    //           return t.id !== action.payload.chartingElement.id;
    //         });
    //       }
    //       break;
    //     case "keyPriceLines":
    //       state.keyPriceLines = state.keyPriceLines.filter((t) =>
    //       {
    //         return t.id !== action.payload.chartingElement.id;
    //       });
    //       break;
    //   }
    //   state.chartingAltered = true;
    // },
    setPreviousCharting: (state, action) =>
    {
      if (action.payload.charting) { state[action.payload.tickerSymbol] = { ...action.payload.charting } }
      else
      {
        state[action.payload.tickerSymbol] = {

          freeLines: [],
          freeLinesId: 1,
          trendLines: [],
          trendLinesId: 1,
          linesH: [],
          linesHId: 1,
          //   channels: [],
          //   channelsId: 1,
          //   triangles: [],
          //   trianglesId: 1,
          //   wedges: [],
          //   wedgesId: 1,


        }
      }
    },
    // clearPreviousCharting: (state, action) =>
    // {
    //   state.chartingAltered = false;
    //   state.freeLines = [];
    //   state.freeLinesId = 1;

    //   state.trendLines = [];
    //   state.trendLinesId = 1;

    //   state.linesH = [];
    //   state.linesHId = 1;

    //   state.channels = [];
    //   state.channelsId = 1;

    //   state.triangles = [];
    //   state.trianglesId = 1;

    //   state.wedges = [];
    //   state.wedgesId = 1;

    //   state.enterExitLines = [];
    //   state.enterExitsId = 1;

    //   state.keyPriceLines = [];
    //   state.keyPriceLinesId = 1;
    // },
  },
});

export const {
  addLine,
  updateLine,
  // addKeyPrice,
  updateKeyPrice,
  setPreviousCharting,
  // clearPreviousCharting,
} = chartingElementSlice.actions;

export default chartingElementSlice.reducer;


export const makeSelectChartingByTicker = () => createSelector(
  [(state) => state.chartingElement, (state, ticker) => ticker],
  (entities, ticker) => entities[ticker]
)


// freeLines: [],
//   freeLinesId: 1,
//   trendLines: [],
//   trendLinesId: 1,
//   linesH: [],
//   linesHId: 1,
//   channels: [],
//   channelsId: 1,
//   triangles: [],
//   trianglesId: 1,
//   wedges: [],
//   wedgesId: 1,
//   enterExitLines: [],
//   enterExitsId: 1,
//   keyPriceLines: [],
//   keyPriceLinesId: 1,