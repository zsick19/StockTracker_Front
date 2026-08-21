import { createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit';
import { addMinutes, isAfter, isBefore, isSameMinute, startOfDay, subMinutes } from 'date-fns';
import { NewsRunnerApiSlice } from './NewsRunnerApiSlice';
import { Key } from 'lucide-react';
import { processInitialSeedBatchSafe } from './NewsRunnerCalculations/InitialSeedBatch';
import { processNewsRunnerTradeAndQuoteInterval } from './NewsRunnerCalculations/TradeAndQuoteProcessing';
import { calculateNewsRunnerTradeQuoteDerivatives } from './NewsRunnerCalculations/TradeQuoteDerivatives';
import { calculateNewsRunnerVWAPMetrics } from './NewsRunnerCalculations/CalculateVWAP';
import { calculateNewsRunnerSpreadLeakage } from './NewsRunnerCalculations/SpreadLeakage';
import { calculateNewsRunnerSweepToVolume } from './NewsRunnerCalculations/SweepToVolume';
import { calculateNewsRunnerIceberg } from './NewsRunnerCalculations/IceBergCalculations';
import { calculateNewsRunnerDailyMacdProfile } from './NewsRunnerCalculations/CalculateDailyMACD';
import { calculateAndEvaluateNewsRunner1MinMACD } from './NewsRunnerCalculations/CalculateOneMinMACD';
import { calculateQuoteImbalanceVelocity } from './NewsRunnerCalculations/CalculateQuoteImbalance';
import { calculateQuoteAskBidImbalance } from './NewsRunnerCalculations/CalculateAskBidSizeImbalance';
import { generateAdvanceSqueezeSummary } from './NewsRunnerCalculations/TradeQuoteSummary'
import { reconstructOrderBookAbsorption } from './NewsRunnerCalculations/ReconstructOrderBook';
import { checkInstitutionalAbandonment } from './NewsRunnerCalculations/InstitutionalAbandonment';
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
                    stockInfo: null,

                    newsAlertOriginalPrice: action.payload.mostRecentTrade.Price,
                    percentChangeFromOriginal: 0,
                    status: 'INITIALIZING',
                    executionStatus: { status: 'QUIET', headline: 'Initializing Core Matrix Feed...', meters: { pressure: 0, velocity: 0, danger: 0 } },


                    candleData: [],
                    mostRecentCandle: action.payload.mostRecentMin,
                    lastTradePrice: action.payload.mostRecentTrade.Price,

                    largeOrderThreshold: Math.ceil(100000 / action.payload.mostRecentTrade.Price),
                    tradeCursor: undefined,
                    quoteCursor: undefined,

                    cumulativeSharesTraded: 0,
                    floatTurnOverRatio: 0,

                    macroTrendStatus: undefined,
                    macroHistogram: undefined,
                    absorptionData: { absorptionStyle: 'QUIET', icebergDetected: false, hiddenVolume: 0, quoteImbalance: 0 },

                    MACDOneMinEval: { status: 'INITIALIZING', conviction: 'NEUTRAL', alert: false },
                    MACDPoints: [],

                    exitProof: undefined,


                    quoteAskBidImbalance: undefined,
                    lastQuoteImbalance: 0.5,
                    lastQuoteVelocity: 0,

                    runningTotalVWAPValue: 0,
                    runningTotalVolume: 0,

                    tradeCache: [],
                    quoteCache: [],
                    historicalChartIntervals: [],

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
                existingNode.percentChangeFromOriginal = percentChange
                if (percentChange > 0.5) { existingNode.status = 'MOVING' }

                if (isSameMinute(existingNode.mostRecentCandle.Timestamp, action.payload.Timestamp))
                {
                    if (existingNode.mostRecentCandle.OpenPrice < action.payload.Price)
                    {
                        //if price is greater than open//compare high...if greater than high--->set close and high to be price
                        //if less than high set close to be price
                        if (action.payload.Price > existingNode.mostRecentCandle.HighPrice) { existingNode.mostRecentCandle.HighPrice = action.payload.Price }
                    } else 
                    {
                        //if price is less than open//compare low...if less than low-->set close and low to be price
                        // //if greater than low set close to be price
                        if (action.payload.Price < existingNode.mostRecentCandle.LowPrice) { existingNode.mostRecentCandle.LowPrice = action.payload.Price }
                    }
                    existingNode.mostRecentCandle.ClosePrice = action.payload.Price


                } else
                {
                    let copyOfClosingCandle = existingNode.mostRecentCandle
                    existingNode.candleData.push(existingNode.mostRecentCandle)

                    if (action.payload.Price >= copyOfClosingCandle.ClosePrice) 
                    {
                        existingNode.mostRecentCandle = {
                            ...copyOfClosingCandle,
                            Timestamp: addMinutes(copyOfClosingCandle.Timestamp, 1).toISOString(),
                            HighPrice: action.payload.Price,
                            LowPrice: copyOfClosingCandle.ClosePrice,
                            OpenPrice: copyOfClosingCandle.ClosePrice,
                            ClosePrice: action.payload.Price
                        }
                    } else if (action.payload.Price < copyOfClosingCandle.ClosePrice)
                    {
                        existingNode.mostRecentCandle = {
                            ...copyOfClosingCandle,
                            Timestamp: addMinutes(copyOfClosingCandle.Timestamp, 1).toISOString(),
                            HighPrice: copyOfClosingCandle.ClosePrice,
                            LowPrice: action.payload.Price,
                            OpenPrice: copyOfClosingCandle.ClosePrice,
                            ClosePrice: action.payload.Price
                        }
                    }
                }
            }
        },
        setIncomingNewsAlertQuote: (state, action) =>
        {
            const existingNode = state.entities[action.payload.Symbol];
            if (existingNode)
            {
                // existingNode.mostRecentQuote = action.payload
                // existingNode.quotes.push(action.payload);
                // if (existingNode.quotes.length > 20) existingNode.quotes.shift();
                // evaluateMomentum(existingNode, action.payload.Symbol)
            }
        },


        removeNewsRunnerWatch: (state, action) =>
        {
            const { tickerSymbol } = action.payload
            newsRunnerAdapter.removeOne(state, tickerSymbol)
        },
        markNewsRunnerActive: (state, action) =>
        {
            const existingNode = state.entities[action.payload.Symbol];

            if (existingNode) { existingNode.status = 'ACTIVE' }
        },




    },
    extraReducers: (builder) =>
    {
        builder.addMatcher(NewsRunnerApiSlice.endpoints.fetchNewsRunnerCandleData.matchFulfilled,
            (state, action) =>
            {
                if (!action.payload.candles) return
                const tickersToProcess = action.meta.arg.originalArgs.tickerSymbol

                tickersToProcess.map((t) =>
                {
                    const existingNode = state.entities[t]
                    if (!existingNode || action.payload.candles[t]) return



                    let candles = action.payload.candles[t]

                    if (candles)
                    {
                        existingNode.mostRecentCandle = candles.pop()
                        existingNode.candleData = candles.splice(-1)

                        let macdResults = calculateAndEvaluateNewsRunner1MinMACD(candles)
                        existingNode.MACDOneMinEval = macdResults.latestEvaluation
                        existingNode.MACDPoints = macdResults.macdPoints
                    }
                })
            }
        ),
            builder.addMatcher(NewsRunnerApiSlice.endpoints.fetchNewsRunnerInfo.matchFulfilled,
                (state, action) =>
                {
                    if (!action.payload.stockInfo) return
                    action.payload.stockInfo.map((t) =>
                    {
                        const existingNode = state.entities[t.Symbol];
                        if (!existingNode) return
                        existingNode.stockInfo = t

                        const trades = action.payload.trades[t.Symbol] || []
                        const quotes = action.payload.quotes[t.Symbol] || []
                        const candleData = action.payload.candleData[t.Symbol]
                        if (candleData)
                        {
                            let macdResults = calculateAndEvaluateNewsRunner1MinMACD(candleData)
                            existingNode.MACDOneMinEval = macdResults.latestEvaluation
                            existingNode.MACDPoints = macdResults.macdPoints
                            existingNode.candleData = candleData
                        }

                        const dailyCandleData = action.payload.dailyCandles[t.Symbol] || []
                        const macroMACDProfile = calculateNewsRunnerDailyMacdProfile(dailyCandleData)
                        existingNode.macroMACDProfile = macroMACDProfile.crossoverStatus
                        existingNode.macroHistogram = macroMACDProfile.histogram


                        if (trades && quotes)
                        {
                            let filterRecentTrades = trades.filter((k) => isAfter(k.Timestamp, existingNode.article_published_at))
                            let filterRecentQuotes = quotes.filter((k) => isAfter(k.Timestamp, existingNode.article_published_at))


                            const initialResults = processInitialSeedBatchSafe(filterRecentTrades, filterRecentQuotes, t.SharesFloat, existingNode.newsAlertOriginalPrice, existingNode.article_published_at)

                            existingNode.largeOrderThreshold = initialResults.largeOrderThreshold

                            existingNode.tradeCursor = initialResults.cursors.tradeTimestamp
                            existingNode.quoteCursor = initialResults.cursors.quoteTimestamp
                            existingNode.lastTradePrice = initialResults.cursors.lastKnownPrice

                            existingNode.tradeCache = initialResults.rawCache.trades
                            existingNode.quoteCache = initialResults.rawCache.quotes

                            existingNode.historicalChartIntervals = initialResults.chartData

                        } else if (t.SharesFloat)
                        {
                            let largeOrderThreshold
                            if (existingNode.newsAlertOriginalPrice < 1.0)
                            {
                                largeOrderThreshold = Math.min((t.SharesFloat * 0.0005), 25000);
                                if (largeOrderThreshold < 2500) largeOrderThreshold = 2500;
                            }
                            existingNode.largeOrderThreshold = largeOrderThreshold

                        }
                    })
                }
            ),
            builder.addMatcher(NewsRunnerApiSlice.endpoints.fetchNewsRunnerVolumePriceChecks.matchFulfilled,
                (state, action) =>
                {
                    if (action.payload?.snaps)
                    {
                        action.payload.snaps.map((t) =>
                        {
                            const existingNode = state.entities[t.symbol];
                            if (!existingNode) return

                            existingNode.mostRecentTrade = t.LatestTrade
                            let percentChange = (t.LatestTrade.Price - existingNode.newsAlertOriginalPrice) * 100 / existingNode.newsAlertOriginalPrice

                            existingNode.percentChangeFromOriginal = percentChange
                            existingNode.todayVolumeAtRelease.push(t.DailyBar.Volume)
                            const VolumeStatus = analyzeVolumeVelocity(existingNode.todayVolumeAtRelease)

                            if (percentChange > 0.25) existingNode.status = 'ACTIVE'
                            else if (existingNode.status === 'ACTIVE' && VolumeStatus !== 'FLAT' && VolumeStatus !== 'INITIALIZING') { existingNode.status = VolumeStatus }
                            else if (VolumeStatus !== 'FLAT' && VolumeStatus !== 'INITIALIZING') existingNode.status = VolumeStatus


                            if (existingNode.todayVolumeAtRelease.length > 30) existingNode.todayVolumeAtRelease = existingNode.todayVolumeAtRelease.slice(-30)
                        })
                    }

                    if (action.payload?.quotes && action.payload?.trades)
                    {
                        const tickersToProcess = action.meta.arg.originalArgs.tickerSymbol
                        tickersToProcess.forEach((t) =>
                        {
                            const existingNode = state.entities[t]
                            if (!existingNode) return

                            const quotes = action.payload.quotes[t] || []
                            const trades = action.payload.trades[t] || []

                            try
                            {

                                const orderBookResults = reconstructOrderBookAbsorption(trades, quotes, existingNode.article_published_at)
                                existingNode.absorptionData = orderBookResults





                                const quoteMetrics = calculateQuoteImbalanceVelocity(quotes, existingNode.lastQuoteImbalance, existingNode.previousVelocity)
                                const quoteAskBidImbalance = calculateQuoteAskBidImbalance(quotes)
                                const intervalResults = processNewsRunnerTradeAndQuoteInterval(trades, quotes, existingNode)

                                existingNode.lastQuoteImbalance = quoteMetrics.currentImbalanceRatio;
                                existingNode.lastQuoteVelocity = quoteMetrics.quoteVelocity;
                                existingNode.quoteAskBidImbalance = quoteAskBidImbalance

                                existingNode.cumulativeSharesTraded += intervalResults.newIntervalMetrics.totalVolume
                                if (existingNode.stockInfo?.SharesFloat > 0)
                                {
                                    existingNode.floatTurnOverRatio = existingNode.cumulativeSharesTraded / existingNode.stockInfo.SharesFloat
                                }

                                existingNode.tradeCursor = intervalResults.cursors.tradeTimestamp
                                existingNode.quoteCursor = intervalResults.cursors.quoteTimestamp
                                existingNode.lastTradePrice = intervalResults.cursors.lastKnownPrice
                                existingNode.tradeCache = intervalResults.updatedCache.trades
                                existingNode.quoteCache = intervalResults.updatedCache.quotes


                                const derivativeResults = calculateNewsRunnerTradeQuoteDerivatives(intervalResults.newIntervalMetrics, existingNode.historicalChartIntervals)
                                if (derivativeResults.largeVelocity !== 0) existingNode.status = 'LARGEVOLUME'
                                const VWAPResults = calculateNewsRunnerVWAPMetrics(trades, existingNode.runningTotalVolume, existingNode.runningTotalVWAPValue)
                                const slippageResults = calculateNewsRunnerSpreadLeakage(trades, quotes)
                                const sweepToVolResults = calculateNewsRunnerSweepToVolume(trades)
                                const iceBergResults = calculateNewsRunnerIceberg(trades, quotes)



                                let update = {
                                    ...intervalResults.newIntervalMetrics,
                                    ...derivativeResults,
                                    intervalVwap: VWAPResults.intervalVwap,
                                    anchoredSessionVwap: VWAPResults.anchoredSessionVwap,
                                    spreadLeakage: slippageResults, // appended neatly here
                                    sweepRatio: sweepToVolResults.sweepRatio,
                                    icebergRatio: iceBergResults.icebergRatio,
                                    hiddenVolume: iceBergResults.hiddenVolume,
                                    floatTurnOverRatio: existingNode.floatTurnOverRatio,
                                    quoteImbalance: quoteMetrics.currentImbalanceRatio,
                                    quoteAcceleration: quoteMetrics.quoteAcceleration
                                }

                                existingNode.historicalChartIntervals.push(update)



                                if (existingNode.historicalChartIntervals.length > 120) existingNode.historicalChartIntervals.shift();
                                existingNode.executionStatus = generateAdvanceSqueezeSummary(existingNode.historicalChartIntervals, existingNode.macroMACDProfile, existingNode.MACDOneMinEval, existingNode.stockInfo.InstitutionalSharePercent)
                                const exitProofPayload = checkInstitutionalAbandonment({
                                    newTrades: trades,
                                    newQuotes: quotes,
                                    calculatedIntervalMetrics: update
                                });
                                if (exitProofPayload) { existingNode.exitProof = exitProofPayload; }

                            } catch (error)
                            {
                                console.log(`Error processing first minute data for ${t}`, error)
                            }
                        })

                    }
                }
            ),
            builder.addMatcher(NewsRunnerApiSlice.endpoints.fetchNewsRunnerQuotesAndTrades.matchFulfilled,
                (state, action) =>
                {
                    if (!action.payload?.trades || !action.payload?.quotes) return

                    const tickersToProcess = action.meta.arg.originalArgs.tickerSymbol
                    tickersToProcess.map((t) =>
                    {
                        try
                        {

                            const existingNode = state.entities[t]
                            if (!existingNode) return

                            const trades = action.payload.trades[t] || []
                            const quotes = action.payload.quotes[t] || []


                            const quoteMetrics = calculateQuoteImbalanceVelocity(quotes, existingNode.lastQuoteImbalance, existingNode.previousVelocity)


                            existingNode.lastQuoteImbalance = quoteMetrics.currentImbalanceRatio;
                            existingNode.lastQuoteVelocity = quoteMetrics.quoteVelocity;
                            existingNode.quoteAskBidImbalance = calculateQuoteAskBidImbalance(quotes)

                            const intervalResults = processNewsRunnerTradeAndQuoteInterval(trades, quotes, existingNode)

                            existingNode.cumulativeSharesTraded += intervalResults.newIntervalMetrics.totalVolume
                            if (existingNode.stockInfo?.SharesFloat > 0) { existingNode.floatTurnOverRatio = existingNode.cumulativeSharesTraded / existingNode.stockInfo.SharesFloat }

                            existingNode.tradeCursor = intervalResults.cursors.tradeTimestamp
                            existingNode.quoteCursor = intervalResults.cursors.quoteTimestamp
                            existingNode.lastTradePrice = intervalResults.cursors.lastKnownPrice
                            existingNode.tradeCache = intervalResults.updatedCache.trades
                            existingNode.quoteCache = intervalResults.updatedCache.quotes


                            const derivativeResults = calculateNewsRunnerTradeQuoteDerivatives(intervalResults.newIntervalMetrics, existingNode.historicalChartIntervals)
                            if (derivativeResults.largeVelocity !== 0) existingNode.status = 'LARGEVOLUME'
                            const VWAPResults = calculateNewsRunnerVWAPMetrics(trades, existingNode.runningTotalVolume, existingNode.runningTotalVWAPValue)
                            const slippageResults = calculateNewsRunnerSpreadLeakage(trades, quotes)
                            const sweepToVolResults = calculateNewsRunnerSweepToVolume(trades)
                            const iceBergResults = calculateNewsRunnerIceberg(trades, quotes)
                            let update = {
                                ...intervalResults.newIntervalMetrics,
                                ...derivativeResults,
                                intervalVwap: VWAPResults.intervalVwap,
                                anchoredSessionVwap: VWAPResults.anchoredSessionVwap,
                                spreadLeakage: slippageResults,
                                sweepRatio: sweepToVolResults.sweepRatio,
                                icebergRatio: iceBergResults.icebergRatio,
                                hiddenVolume: iceBergResults.hiddenVolume,
                                floatTurnOverRatio: existingNode.floatTurnOverRatio,
                                quoteImbalance: quoteMetrics.currentImbalanceRatio,
                                quoteAcceleration: quoteMetrics.quoteAcceleration
                            }
                            existingNode.historicalChartIntervals.push(update)
                            if (existingNode.historicalChartIntervals.length > 120) existingNode.historicalChartIntervals.shift();

                            const exitProofPayload = checkInstitutionalAbandonment({ newTrades: trades, newQuotes: quotes, calculatedIntervalMetrics: update });
                            if (exitProofPayload) { existingNode.exitProof = exitProofPayload; }

                            existingNode.executionStatus = generateAdvanceSqueezeSummary(existingNode.historicalChartIntervals, existingNode.macroMACDProfile, existingNode.MACDOneMinEval, existingNode.stockInfo.InstitutionalSharePercent)
                        } catch (error)
                        {
                            console.log('Error processing trade and quote stream', error)
                        }
                        // 720 intervals * 5s = 1 Hour
                    })
                }
            )
    }
});



/**
 * Analyzes the cumulative volume array to gauge runner strength.
 * @param {number[]} cumulativeVolumeArray - The raw array updated every 5 seconds
 * @returns {string} 'FLAT' | 'PROGRESSING' | 'EXPLODING' | 'INITIALIZING'
 */
function analyzeVolumeVelocity(cumulativeVolumeArray)
{
    // We need at least 8 data points (40 seconds) to form a baseline and a current window
    if (cumulativeVolumeArray.length < 8) return 'INITIALIZING';



    const deltas = getIntervalDeltas(cumulativeVolumeArray);

    // 1. Establish baseline from the first 5 intervals (First 25 seconds of tracking)
    const baselineDeltas = deltas.slice(0, 5);
    const avgBaselineVolume = baselineDeltas.reduce((a, b) => a + b, 0) / baselineDeltas.length;

    // Guard against division by zero for extremely illiquid tickers
    if (avgBaselineVolume === 0) return 'FLAT';

    // 2. Isolate the most recent 3 intervals (Last 15 seconds) to analyze current velocity
    const recentDeltas = deltas.slice(-3);
    const currentIntervalVolume = recentDeltas[recentDeltas.length - 1];
    const previousIntervalVolume = recentDeltas[recentDeltas.length - 2];

    // 3. Evaluation Matrix
    const velocityMultiplier = currentIntervalVolume / avgBaselineVolume;

    // Condition 1: Exploding
    if (velocityMultiplier >= 6.0 && currentIntervalVolume > (previousIntervalVolume * 1.8))
    {
        return 'EXPLODING';
    }

    // Condition 2: Progressing
    if (velocityMultiplier >= 2.0 && currentIntervalVolume >= (previousIntervalVolume * 0.7))
    {
        return 'PROGRESSING';
    }

    // Condition 3: Flat / Dying
    return 'FLAT';
}

function getIntervalDeltas(cumulativeArray)
{
    if (cumulativeArray.length < 2) return [];
    const deltas = [];
    for (let i = 1; i < cumulativeArray.length; i++)
    {
        deltas.push(cumulativeArray[i] - cumulativeArray[i - 1]);
    }
    return deltas;
}


export const { initiateNewsRunnerWatch, setIncomingNewsAlertPrice, removeNewsRunnerWatch, setIncomingNewsAlertQuote, markNewsRunnerActive } = newsRunnerSlice.actions;
export default newsRunnerSlice.reducer;

const newsRunnerAdapterSelectors = newsRunnerAdapter.getSelectors()

const selectAllRawNewsRunners = (state) => newsRunnerAdapterSelectors.selectAll(state.newsRunnerSlice)
export const selectAllNewsRunnersAndSort = createSelector([selectAllRawNewsRunners], (newsRunners) => { return newsRunners.toSorted((a, b) => b.percentChangeFromOriginal - a.percentChangeFromOriginal); });












export const selectAllNewsRunners = (state) => newsRunnerAdapter.getSelectors().selectAll(state.newsRunnerSlice)
export const selectAllNewsRunnerIds = (state) => newsRunnerAdapter.getSelectors().selectIds(state.newsRunnerSlice)



//CANDLE STICK CHART SELECTORS
const EMPTY_FALLBACK = {
    candleData: [],
    originalPrice: 0,
    articlePublishDate: startOfDay(new Date()),
}
export const makeSelectNewsRunnerMostRecentCandleById = () => createSelector(
    (state) => state.newsRunnerSlice,
    (_, ticker) => ticker,
    (newsRunnerSlice, ticker) =>
    {
        let record = newsRunnerAdapterSelectors.selectById(newsRunnerSlice, ticker)
        if (record) return record?.mostRecentCandle || undefined
    }
)

export const makeSelectNewsRunnerCandlesById = () => createSelector(
    (state) => state.newsRunnerSlice,
    (_, ticker) => ticker,
    (newsRunnerSlice, ticker) =>
    {
        let record = newsRunnerAdapterSelectors.selectById(newsRunnerSlice, ticker)
        if (record) return {
            candleData: record?.candleData || [],
            originalPrice: record?.newsAlertOriginalPrice || 0,
            articlePublishDate: new Date(record.dispatched_at_ms)
        }
        else return EMPTY_FALLBACK
    }
)





export const selectNewsRunnerMostRecentPriceById = (state, ticker) =>
{
    let record = newsRunnerAdapterSelectors.selectById(state.newsRunnerSlice, ticker)
    if (record) return record?.lastKnownPrice || 0

}


export const selectNewsRunnerLargeSmallOrderById = (state, ticker) =>
{
    let record = newsRunnerAdapterSelectors.selectById(state.newsRunnerSlice, ticker)
    if (record) return record
}










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


const selectNewsRunnerSlice = (state) => state.newsRunnerSlice
const selectTickerParam = (_, ticker) => ticker

const selectRecordById = createSelector([selectNewsRunnerSlice, selectTickerParam],
    (slice, ticker) => newsRunnerAdapterSelectors.selectById(slice, ticker)
)





const BLANK_PRICE_CHANGE = { percent: 0, originalPrice: 0, mostRecentPrice: 0 }
export const selectNewsRunnerPriceChangeById = createSelector([selectRecordById],
    (record) => record?.mostRecentCandle ? {
        percent: record.percentChangeFromOriginal,
        originalPrice: record.newsAlertOriginalPrice,
        mostRecentPrice: record.mostRecentCandle.ClosePrice
    } : BLANK_PRICE_CHANGE
)



const BLANK_EXECUTION_STATUS = { status: undefined, headline: undefined, meters: undefined, floatTurnover: undefined, quoteImbalance: undefined, institutionalPct: undefined }
export const selectNewsRunnerSummaryExecutionById = createSelector([selectRecordById], (record) => record?.executionStatus || BLANK_EXECUTION_STATUS)

const BLANK_ABSORPTION = { absorptionStyle: 'QUIET', icebergDetected: false, hiddenVolume: 0, quoteImbalance: 0 }
export const selectNewsRunnerAbsorptionById = createSelector([selectRecordById], (record) => record?.absorptionData || BLANK_ABSORPTION)

export const selectExitProofById = createSelector([selectRecordById], (record) => record?.exitProof || undefined)

// export const selectNewsRunnerTradeInfoById = (state, ticker) =>
// {
//     let record = newsRunnerAdapterSelectors.selectById(state.newsRunnerSlice, ticker)
//     if (record) return record.tickerInfo
// }


export const makeSelectNewsRunnerStockInfoById = createSelector([selectRecordById], (record) => record.stockInfo)
export const makeSelectNewsRunnerRTPRDetailsById = createSelector([selectRecordById], (record) =>
{
    return {
        alertKind: record?.alert_kind || undefined,
        impactScore: record?.impact_score || undefined,
        impactTier: record?.impact_tier,
        eventType: record?.event_type,
        impactDirection: record?.impact_direction,
        articleURL: record?.article_url,
        articlePublishDate: record?.article_published_at,
        bandHitRate: record?.band_hit_rate
    }

})

export const selectLargeOrderThresholdById = createSelector([selectRecordById], record => record?.largeOrderThreshold || 0)