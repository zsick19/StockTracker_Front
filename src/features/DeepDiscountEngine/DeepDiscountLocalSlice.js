import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { EngineDeepDiscountApiSlice } from './EngineDeepDiscountApiSlice';
import { isAfter, isBefore, subMinutes } from 'date-fns';

// 1. Establish an absolute, argument-free structural entity adapter matrix
export const deepInterceptionAdapter = createEntityAdapter({
    selectId: (entity) => entity.tickerSymbol
});

const interceptSentrySlice = createSlice({
    name: 'interceptSentry',
    initialState: deepInterceptionAdapter.getInitialState({
        // Optional global tracking states can be added here
    }),
    reducers: {
        // ✅ THE CORRECT PRODUCTION CACHE INGESTION REDUCER
        // Triggered via dispatch from inside your mutation lifecycle to avoid errors
        appendDailyCandles: (state, action) =>
        {
            const { tickerSymbol, dailyCandleData } = action.payload;

            const existingNode = state.entities[tickerSymbol];

            if (!existingNode)
            {
                // Initialize an autonomous entity profile row on frame zero if missing
                deepInterceptionAdapter.addOne(state, {
                    tickerSymbol,
                    dailyCandles: dailyCandleData,
                    currentSpread: undefined,
                    quotesHistory: [],
                    tradeHistory: [],
                    latestAskBid: { BidSize: 0, BidPrice: 0, AskSize: 0, AskPrice: 0 }

                });
            } else { existingNode.dailyCandles = dailyCandleData }

        },
        appendInterceptQuoteTick: (state, action) =>
        {
            const { tickerSymbol, currentSpread, tickEpoch, BidSize, BidPrice, AskSize, AskPrice } = action.payload;

            const existingNode = state.entities[tickerSymbol];

            if (!existingNode) return
            // {
            //     // Initialize an autonomous entity profile row on frame zero if missing
            //     deepInterceptionAdapter.addOne(state, {
            //         tickerSymbol,
            //         dailyCandles: [],
            //         currentSpread,
            //         quotesHistory: [{ spread: currentSpread, time: tickEpoch }],
            //         tradeHistory: []
            //     });
            // } else
            // {
            // Append high-velocity data points directly to your rolling memory matrix
            existingNode.currentSpread = currentSpread;
            existingNode.quotesHistory.push({ spread: currentSpread, time: tickEpoch });

            // Self-cleaning time fence: instantly cull points older than 5 minutes
            const fiveMinutesAgo = tickEpoch - (5 * 60 * 1000);
            existingNode.quotesHistory = existingNode.quotesHistory.filter(q => q.time >= fiveMinutesAgo);
            existingNode.latestAskBid = { BidSize: BidSize, BidPrice: BidPrice, AskSize: AskSize, AskPrice: AskPrice }

        },
        appendInterceptTradeTick: (state, action) =>
        {
            const { tickerSymbol, trade } = action.payload
            const existingNode = state.entities[tickerSymbol];

            if (!existingNode || existingNode.tickerSymbol !== trade.Symbol) return
            console.log(existingNode.tickerSymbol, trade.Symbol)

            existingNode.tradeHistory.push(trade)
            existingNode.tradeHistory = existingNode.tradeHistory.filter(q => isAfter(q.Timestamp, subMinutes(new Date(), 3)));
        }
    }
});

export const { appendInterceptQuoteTick, appendDailyCandles, appendInterceptTradeTick } = interceptSentrySlice.actions;
export default interceptSentrySlice.reducer;
