import { createSlice } from "@reduxjs/toolkit";

const keyLevelGraphElementsSlice = createSlice({
    name: "keyLevelGraphElements",
    initialState: {
    },
    reducers: {
        // addLine: (state, action) =>
        // {
        //     let line = action.payload;
        //     line.id = state.freeLinesId + 1;
        //     line.dateCreated = new Date().toLocaleDateString();
        //     state.freeLinesId = state.freeLinesId + 1;
        //     state.freeLines.push(line);
        //     state.chartingAltered = true;
        // },
        // updateLine: (state, action) =>
        // {
        //     state.freeLines = state.freeLines.map((line) =>
        //     {
        //         if (line.id === action.payload.id) return action.payload;
        //         return line;
        //     });
        //     state.chartingAltered = true;
        // },

        // addKeyPrice: (state, action) =>
        // {
        //     let keyPrice = action.payload;
        //     keyPrice.id = state.keyPriceLinesId + 1;
        //     keyPrice.dateCreated = new Date().toLocaleDateString();
        //     state.keyPriceLinesId = state.keyPriceLinesId + 1;
        //     state.keyPriceLines.push(keyPrice);
        //     state.chartingAltered = true;
        // },
        // updateKeyPrice: (state, action) =>
        // {
        //     state.keyPriceLines = state.keyPriceLines.map((keyPrice) =>
        //     {
        //         if (keyPrice.id === action.payload.id) return action.payload;
        //         return keyPrice;
        //     });
        //     state.chartingAltered = true;
        // },

        // removeViaChartingElement: (state, action) =>
        // {
        //     switch (action.payload.group)
        //     {
        //         case "freeLines":
        //             state.freeLines = state.freeLines.filter((t) =>
        //             {
        //                 return t.id !== action.payload.chartingElement.id;
        //             });
        //             break;
        //         case "trendLines":
        //             state.trendLines = state.trendLines.filter((t) =>
        //             {
        //                 return t.id !== action.payload.chartingElement.id;
        //             });
        //             break;
        //         case "channels":
        //             state.channels = state.channels.filter((t) =>
        //             {
        //                 return t.id !== action.payload.chartingElement.id;
        //             });
        //             break;
        //         case "linesH":
        //             state.linesH = state.linesH.filter((t) =>
        //             {
        //                 return t.id !== action.payload.chartingElement.id;
        //             });
        //             break;
        //         case "triangles":
        //             state.triangles = state.triangles.filter((t) =>
        //             {
        //                 return t.id !== action.payload.chartingElement.id;
        //             });
        //             break;
        //         case "wedges":
        //             state.wedges = state.wedges.filter((t) =>
        //             {
        //                 return t.id !== action.payload.chartingElement.id;
        //             });
        //             break;
        //         case "enterExitLines":
        //             {
        //                 if (state.enterExitLines.length === 1) return;
        //                 state.enterExitLines = state.enterExitLines.filter((t) =>
        //                 {
        //                     return t.id !== action.payload.chartingElement.id;
        //                 });
        //             }
        //             break;
        //         case "keyPriceLines":
        //             state.keyPriceLines = state.keyPriceLines.filter((t) =>
        //             {
        //                 return t.id !== action.payload.chartingElement.id;
        //             });
        //             break;
        //     }
        //     state.chartingAltered = true;
        // },
        setKeyLevelsCharting: (state, action) =>
        {
            let chartingData = action.payload
            if (action.payload.gammaFlip) { state[chartingData.tickerSymbol] = { gammaFlip: chartingData.gammaFlip } }
        },
        // clearPreviousCharting: (state, action) =>
        // {

        // },

    },
});

export const {
    setKeyLevelsCharting
} = keyLevelGraphElementsSlice.actions;

export default keyLevelGraphElementsSlice.reducer;

export const selectTickerKeyLevels = (state, ticker) =>
{
    if (ticker in state.keyLevelElement) return state.keyLevelElement[ticker]
    else return {}
}

export const { selectByTicker } = keyLevelGraphElementsSlice.selectors