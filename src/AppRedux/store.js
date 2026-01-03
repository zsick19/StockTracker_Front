import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api/apiSlice";
import { setupListeners } from "@reduxjs/toolkit/query";

import testReducer from "../features/test/testSlice";
import authReducer from "../features/auth/authSlice";
import chartingElementReducers from "../features/Charting/chartingElements";
import keyLevelGraphElementsReducers from '../features/KeyLevels/KeyLevelGraphElements'

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    chartingElement: chartingElementReducers,
    keyLevelElement: keyLevelGraphElementsReducers,
    auth: authReducer,
    test: testReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: true,
});

export const RootState = store.getState();
setupListeners(store.dispatch);
