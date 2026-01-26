import { createSlice } from "@reduxjs/toolkit";

const stockInfoElementSlice = createSlice({
  name: "stockInfo",
  initialState: { stockInfo: { Symbol: undefined } },
  reducers: {
    setStockInfo: (state, action) =>
    {
      state.stockInfo = { ...action.payload }
    },
    clearStockInfo: (state, action) =>
    {
      state.stockInfo = { Symbol: undefined }
    }
  },
});

export const {
  setStockInfo,
  clearStockInfo
} = stockInfoElementSlice.actions;

export default stockInfoElementSlice.reducer;

export const selectStockInfo = (state) => state.stockInfo.stockInfo
