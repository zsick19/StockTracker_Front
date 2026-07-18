import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { EngineDeepDiscountApiSlice } from './EngineDeepDiscountApiSlice';
import { isAfter, isBefore, subMinutes } from 'date-fns';

// 1. Establish an absolute, argument-free structural entity adapter matrix
export const deepInterceptionAdapter = createEntityAdapter({
    selectId: (entity) => entity.tickerSymbol
});

const interceptSentrySlice = createSlice({
    name: 'interceptSentrySlice',
    // Optional global tracking states can be added here
    initialState: deepInterceptionAdapter.getInitialState({}),
    reducers: {
        initiateDeepDiscountWatch: (state, action) =>
        {
            const { tickerSymbol, discountLevel } = action.payload;

            if (!state.ids.includes(tickerSymbol))
            {
                deepInterceptionAdapter.addOne(state, {
                    tickerSymbol,
                    dailyCandles: [],
                    currentSpread: 0,
                    quotesHistory: [],
                    tradeHistory: [],
                    discountLevel,
                    latestAskBid: { BidSize: 10, BidPrice: 10, AskSize: 0, AskPrice: 0 },
                    muted: undefined,
                    timeAdded: new Date()
                })
            }
        },
        updateDeepDiscountWatch: (state, action) =>
        {
            const { tickerSymbol } = action.payload
            const existingNode = state.entities[tickerSymbol]
            existingNode.discountLevel = action.payload.discountLevel
        },
        muteDeepDiscountWatch: (state, action) =>
        {
            const { tickerSymbol } = action.payload
            const existingNode = state.entities[tickerSymbol]
            existingNode.muted = new Date()
        },
        removeDeepDiscountWatch: (state, action) =>
        {
            const { tickerSymbol } = action.payload
            deepInterceptionAdapter.removeOne(state, tickerSymbol)

        },
        appendDailyCandles: (state, action) =>
        {
            const { tickerSymbol, dailyCandleData } = action.payload;

            const existingNode = state.entities[tickerSymbol];

            if (!existingNode)
            {
                deepInterceptionAdapter.addOne(state, {
                    tickerSymbol,
                    dailyCandles: dailyCandleData,
                    currentSpread: undefined,
                    quotesHistory: [],
                    tradeHistory: [],
                    latestAskBid: { BidSize: 0, BidPrice: 0, AskSize: 0, AskPrice: 0 },
                    muted: undefined,
                    timeAdded: new Date()
                });
            } else { existingNode.dailyCandles = dailyCandleData }

        },
        appendInterceptQuoteTick: (state, action) =>
        {
            const { tickerSymbol, currentSpread, tickEpoch, BidSize, BidPrice, AskSize, AskPrice } = action.payload;

            const existingNode = state.entities[tickerSymbol];

            if (!existingNode) return
            existingNode.currentSpread = currentSpread;
            existingNode.quotesHistory.push({ spread: currentSpread, time: tickEpoch, BidPrice, BidSize, AskPrice, AskSize });

            // Self-cleaning time fence: instantly cull points older than 5 minutes
            const fiveMinutesAgo = tickEpoch - (5 * 60 * 1000);
            existingNode.quotesHistory = existingNode.quotesHistory.filter(q => q.time >= fiveMinutesAgo);
            existingNode.latestAskBid = { BidSize: BidSize, BidPrice: BidPrice, AskSize: AskSize, AskPrice: AskPrice }
        },
        appendInterceptTradeTick: (state, action) =>
        {
            const { tickerSymbol, trade } = action.payload

            const existingNode = state.entities[trade.Symbol];
            if (!existingNode || existingNode.tickerSymbol !== trade.Symbol) return

            existingNode.tradeHistory.push(trade)
            existingNode.tradeHistory = existingNode.tradeHistory.filter(q => isAfter(q.Timestamp, subMinutes(new Date(), 3)));
        }
    }
});

export const { initiateDeepDiscountWatch, muteDeepDiscountWatch, updateDeepDiscountWatch, removeDeepDiscountWatch, appendInterceptQuoteTick, appendDailyCandles, appendInterceptTradeTick } = interceptSentrySlice.actions;
export default interceptSentrySlice.reducer;

const deepInterceptionAdapterSelectors = deepInterceptionAdapter.getSelectors()


export const selectAllDeepDiscountWatches = (state) => deepInterceptionAdapter.getSelectors().selectAll(state.interceptSentrySlice)
export const selectDeepDiscountWatchById = (state, ticker) => deepInterceptionAdapterSelectors.selectById(state.interceptSentrySlice, ticker)
