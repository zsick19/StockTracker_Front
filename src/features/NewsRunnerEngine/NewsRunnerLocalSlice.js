import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { isAfter, isBefore, subMinutes } from 'date-fns';
import { NewsRunnerApiSlice } from './NewsRunnerApiSlice';

// 1. Establish an absolute, argument-free structural entity adapter matrix
export const newsRunnerAdapter = createEntityAdapter({
    selectId: (entity) => entity.id
});


const newsRunnerSlice = createSlice({
    name: 'newsRunnerSlice',
    // Optional global tracking states can be added here
    initialState: newsRunnerAdapter.getInitialState(),
    reducers: {
        initiateNewsRunnerWatch: (state, action) =>
        {
            if (!state.ids.includes(action.payload.ticker))
            {
                newsRunnerAdapter.addOne(state, {
                    id: action.payload.ticker,
                    newsAlertOriginalPrice: action.payload.mostRecentTrade.Price,

                    percentChangeFromOriginal: 0,
                    mostRecentTrade: action.payload.mostRecentTrade,
                    mostRecentQuote: action.payload.mostRecentQuote,
                    trades: [],
                    quotes: [],
                    status: 'quite',
                    foundEntrySurge: null,
                    breakOutMetrics: null,
                    ...action.payload
                })
            }
        },
        setIncomingNewsAlertPrice: (state, action) =>
        {
            const existingNode = state.entities[action.payload.Symbol];
            if (existingNode)
            {
                existingNode.mostRecentTrade = action.payload
                let percentChange = (action.payload.Price - existingNode.newsAlertOriginalPrice) * 100 / existingNode.newsAlertOriginalPrice
                existingNode.percentChangeFromOriginal =

                    existingNode.trades.push(action.payload);
                if (existingNode.trades.length > 20) existingNode.trades.shift();

                if (Math.abs(percentChange) > 0.5)
                {
                    existingNode.status = 'moving'
                    evaluateMomentum(existingNode, action.payload.Symbol)
                }
            }
        },
        setIncomingNewsAlertQuote: (state, action) =>
        {
            const existingNode = state.entities[action.payload.Symbol];
            if (existingNode)
            {
                existingNode.mostRecentQuote = action.payload
                existingNode.quotes.push(action.payload);
                if (existingNode.quotes.length > 20) existingNode.quotes.shift();
                evaluateMomentum(existingNode, action.payload.Symbol)
            }
        },
        removeNewsRunnerWatch: (state, action) =>
        {
            const { tickerSymbol } = action.payload
            newsRunnerAdapter.removeOne(state, tickerSymbol)
        }

        // updateDeepDiscountWatch: (state, action) =>
        // {
        //     const { tickerSymbol } = action.payload
        //     const existingNode = state.entities[tickerSymbol]
        //     existingNode.discountLevel = action.payload.discountLevel
        // },
        // muteDeepDiscountWatch: (state, action) =>
        // {
        //     const { tickerSymbol } = action.payload
        //     const existingNode = state.entities[tickerSymbol]
        //     existingNode.muted = true
        // },
        // unMuteDeepDiscountWatch: (state, action) =>
        // {
        //     const { tickerSymbol } = action.payload
        //     const existingNode = state.entities[tickerSymbol]
        //     existingNode.muted = false
        // },
        // removeDeepDiscountWatch: (state, action) =>
        // {
        //     const { tickerSymbol } = action.payload
        //     console.log(action.payload)
        //     deepInterceptionAdapter.removeOne(state, tickerSymbol)

        // },
        // appendDailyCandles: (state, action) =>
        // {
        //     const { tickerSymbol, dailyCandleData } = action.payload;

        //     const existingNode = state.entities[tickerSymbol];

        //     if (!existingNode)
        //     {
        //         deepInterceptionAdapter.addOne(state, {
        //             tickerSymbol,
        //             dailyCandles: dailyCandleData,
        //             currentSpread: undefined,
        //             quotesHistory: [],
        //             tradeHistory: [],
        //             latestAskBid: { BidSize: 0, BidPrice: 0, AskSize: 0, AskPrice: 0 },
        //             muted: undefined,
        //             timeAdded: new Date()
        //         });
        //     } else { existingNode.dailyCandles = dailyCandleData }

        // },
        // appendInterceptQuoteTick: (state, action) =>
        // {
        //     const { tickerSymbol, currentSpread, tickEpoch, BidSize, BidPrice, AskSize, AskPrice } = action.payload;

        //     const existingNode = state.entities[tickerSymbol];

        //     if (!existingNode) return
        //     existingNode.currentSpread = currentSpread;
        //     existingNode.quotesHistory.push({ spread: currentSpread, time: tickEpoch, BidPrice, BidSize, AskPrice, AskSize });

        //     // Self-cleaning time fence: instantly cull points older than 5 minutes
        //     const fiveMinutesAgo = tickEpoch - (5 * 60 * 1000);
        //     existingNode.quotesHistory = existingNode.quotesHistory.filter(q => q.time >= fiveMinutesAgo);
        //     existingNode.latestAskBid = { BidSize: BidSize, BidPrice: BidPrice, AskSize: AskSize, AskPrice: AskPrice }
        // },
        // appendInterceptTradeTick: (state, action) =>
        // {
        //     const { tickerSymbol, trade } = action.payload

        //     const existingNode = state.entities[trade.Symbol];
        //     if (!existingNode || existingNode.tickerSymbol !== trade.Symbol) return

        //     existingNode.tradeHistory.push(trade)
        //     existingNode.tradeHistory = existingNode.tradeHistory.filter(q => isAfter(q.Timestamp, subMinutes(new Date(), 3)));
        // }
    },
    extraReducers: (builder) =>
    {
        builder.addMatcher(
            NewsRunnerApiSlice.endpoints.fetchNewsRunnerTradeQuotes.matchFulfilled,
            (state, action) =>
            {
                const ticker = action.meta.arg.originalArgs.tickerSymbol
                const existingNode = state.entities[ticker];
                if (!existingNode || !action.payload.trades || !action.payload.quotes) return

                // existingNode.foundEntrySurge = identifyEarlyEntryTrack(action.payload.trades, action.payload.quotes)

                // const quoteData = action.payload.quotes

                // existingNode.quotesHistory = quoteData.map((t, i) =>
                // {
                //     const currentSpreadWidth = parseFloat((t.AskPrice - t.BidPrice).toFixed(4));
                //     const tickEpoch = new Date(t.Timestamp).getTime();
                //     return { spread: currentSpreadWidth, time: tickEpoch, BidPrice: t.BidPrice, BidSize: t.BidSize, AskPrice: t.AskPrice, AskSize: t.AskSize }
                // })

                // const mostRecent = quoteData[quoteData.length - 1]
                // const bidAskImbalance = mostRecent.AskSize > 0 ? parseFloat((mostRecent.BidSize / mostRecent.AskSize).toFixed(2)) : 1.0;
                // const currentSpreadWidth = parseFloat((mostRecent.AskPrice - mostRecent.BidPrice).toFixed(4));


                // existingNode.tradeHistory = action.payload.trades
                // existingNode.currentSpread = currentSpreadWidth;
                // existingNode.latestAskBid = { BidSize: mostRecent.BidSize, BidPrice: mostRecent.BidPrice, AskSize: mostRecent.AskSize, AskPrice: mostRecent.AskPrice }
            }
        )
    }
});

export const { initiateNewsRunnerWatch, setIncomingNewsAlertPrice, removeNewsRunnerWatch, setIncomingNewsAlertQuote,
} = newsRunnerSlice.actions;
export default newsRunnerSlice.reducer;

const newsRunnerAdapterSelectors = newsRunnerAdapter.getSelectors()


export const selectAllNewsRunners = (state) => newsRunnerAdapter.getSelectors().selectAll(state.newsRunnerSlice)
export const selectAllNewsRunnerIds = (state) => newsRunnerAdapter.getSelectors().selectIds(state.newsRunnerSlice)
export const selectNewsRunnerById = (state, ticker) => newsRunnerAdapterSelectors.selectById(state.newsRunnerSlice, ticker)

export const selectNewRunnerQuotesById = (state, ticker) =>
{
    let record = newsRunnerAdapterSelectors.selectById(state.newsRunnerSlice, ticker)
    if (record) return record.mostRecentQuote
}
export const selectNewRunnerTradeById = (state, ticker) =>
{
    let record = newsRunnerAdapterSelectors.selectById(state.newsRunnerSlice, ticker)
    if (record) return record.mostRecentTrade
}




function evaluateMomentum(monitor, symbol)
{
    if (monitor.trades.length < 5 || monitor.quotes.length < 5) return;

    const currentTrade = monitor.trades[monitor.trades.length - 1];
    const currentQuote = monitor.quotes[monitor.quotes.length - 1];

    // SIGNAL A: Micro Price Spike
    // Checks if the current price is at least 1.2% higher than the baseline news discovery price
    const targetPercentGain = 1.2;
    const priceGainFromBaseline = ((currentTrade.Price - monitor.newsAlertOriginalPrice) / monitor.newsAlertOriginalPrice) * 100;

    // SIGNAL B: Aggressive Market Buying (Hitting the Ask)
    // Look at the last 5 trades. Are they executing at or above the current Ask price?
    const recentTrades = monitor.trades.slice(-5);
    const hittingTheAskCount = recentTrades.filter(t => t.Price >= currentQuote.AskPrice).length;
    const isAggressiveBuying = hittingTheAskCount >= 3; // 60%+ of recent volume is crossing the spread

    // SIGNAL C: Positive Price Velocity
    // Is the current price higher than the oldest trade inside our rolling memory window?
    const oldestTradeInCache = monitor.trades[0];
    const isMovingUpward = currentTrade.Price > oldestTradeInCache.Price;

    // Verification Matrix: Trigger immediate alert status if conditions align
    if (priceGainFromBaseline >= targetPercentGain && isAggressiveBuying && isMovingUpward)
    {
        monitor.status = 'breakout';
        monitor.breakoutMetrics = {
            velocityPrice: currentTrade.Price,
            percentageJump: priceGainFromBaseline.toFixed(2),
            askAggression: `${hittingTheAskCount}/5 ticks`
        };
    }
}


/**
 * Processes arrays returned from historical 10-second polling updates
 * to identify early entry inflection points for the chart component.
 */
function identifyEarlyEntryTrack(historicalTrades, historicalQuotes)
{
    let earlyEntryIndex = -1;

    // Sort items sequentially to ensure chronological traversal
    const sortedTrades = [...historicalTrades].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    for (let i = 1; i < sortedTrades.length; i++)
    {
        const previous = sortedTrades[i - 1];
        const current = sortedTrades[i];

        // Find the quote snapshot corresponding closest to this execution tick
        const matchingQuote = historicalQuotes.find(q =>
            Math.abs(new Date(q.timestamp) - new Date(current.timestamp)) < 2000
        );

        if (!matchingQuote) continue;

        // Mathematical parameters defining the early phase of a sudden riser:
        const priceVelocity = current.price - previous.price;
        const isBuyingPressure = current.price >= matchingQuote.askPrice;
        const isVolumeSurging = current.size > (previous.size * 3); // Volume spike multiplier

        if (priceVelocity > 0 && isBuyingPressure && isVolumeSurging)
        {
            // Inflection found: Mark the exact index where momentum detached from normal sideways noise
            earlyEntryIndex = i;
            break;
        }
    }

    return earlyEntryIndex !== -1 ? sortedTrades[earlyEntryIndex] : null;
}
