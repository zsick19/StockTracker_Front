import { createSlice } from "@reduxjs/toolkit";

const stockInfoElementSlice = createSlice({
  name: "stockInfo",
  initialState: { stockInfo: { Symbol: undefined }, stockNews: [] },
  reducers: {
    setStockInfoAndNews: (state, action) =>
    {
      state.stockInfo = { ...action.payload.info }
      state.stockNews = action.payload.news
    },
    clearStockInfo: (state, action) =>
    {
      state.stockInfo = { Symbol: undefined }
      state.stockNews = []
    }
  },
});

export const {
  setStockInfoAndNews,
  clearStockInfo
} = stockInfoElementSlice.actions;

export default stockInfoElementSlice.reducer;

export const selectStockInfo = (state) => state.stockInfo.stockInfo
export const selectStockNews = (state) => state.stockInfo.stockNews