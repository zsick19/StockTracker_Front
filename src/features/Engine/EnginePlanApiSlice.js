import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";
import { differenceInBusinessDays, isWeekend, isWithinInterval, set, getDay } from "date-fns";
import { toZonedTime } from 'date-fns-tz'

import { filterRegularSessionCandles } from "./RootCalculations/filterRegularSessionCandles";
import { calculateMacroThirtyMinMacd } from "./RootCalculations/macro30MinMACD";
import { compileHistoricalOneMinPennyBaselines } from "./RootCalculations/HistoricalCandleAnalytics/pennyStockPatternAnalytics";
import { compileHistoricalStandardChannelBaselines } from "./RootCalculations/HistoricalCandleAnalytics/horizontalChannelAnalytics";
import { compileHistoricalFiveMinCascadeBaselines } from "./RootCalculations/HistoricalCandleAnalytics/cascadePatternAnalytics";
import { compileHistoricalContinuationBaselines } from "./RootCalculations/HistoricalCandleAnalytics/continuationPatternAnalytics";

import { calculateCentralPlanScore } from "./RootCalculations/masterPrioritizer";
import { processAuthoritativeTradesArray } from "./RootCalculations/TradeBookAnalytics/processAuthoritativeTrade";
import { macroAndSectorTickers } from "../../Utilities/SectorsAndIndustries";
import { symbol } from "d3";


const { getWebSocket, subscribe, unsubscribe, checkStreamAuthorization } = setupWebSocket();

export const enginePlanAdapter = createEntityAdapter({})
export const engineMacroAdapter = createEntityAdapter({})

export const EnginePlanPlanApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        initiateEngineWithEnterExitPlan: builder.query({
            query: () => ({
                url: `/engine/historical`,
                validateStatus: (response, result) => { return response.status === 200 && !result.isError }
            }), transformResponse: (responseData) =>
            {

                let planResults = []
                if (responseData?.plans) planResults = responseData.plans.filter(t => t.plan?.patternClassification !== undefined).map((enterExit) =>
                {
                    let regularSessionCandles = filterRegularSessionCandles(enterExit.candleData)
                    let enterExitPlanPrices = enterExit.plan.plan
                    let patternClassification = enterExit.plan.patternClassification


                    let patternConfig
                    let baseLineIndicators = {}
                    if (patternClassification === 'channel')
                    {
                        patternConfig = enterExit.plan.channelPattern
                        if (patternConfig.channelType === "SUB_ENGINE_PENNY_STOCK_SCALP")
                        {
                            baseLineIndicators = compileHistoricalOneMinPennyBaselines(regularSessionCandles)
                        } else if (patternConfig.channelType === 'MULTIDAY_SPACED')
                        {
                            baseLineIndicators = compileHistoricalStandardChannelBaselines(patternConfig, regularSessionCandles)
                        }
                    } else if (patternClassification === 'continuation')
                    {
                        patternConfig = enterExit.plan.continuationPattern
                        baseLineIndicators = compileHistoricalContinuationBaselines(regularSessionCandles)
                    } else if (patternClassification === 'cascade')
                    {
                        patternConfig = enterExit.plan.cascadePattern
                        baseLineIndicators = compileHistoricalFiveMinCascadeBaselines(patternConfig, regularSessionCandles)
                    }
                    patternConfig.maintainLiveCandles = enterExit.plan?.maintainLiveCandles === true
                    patternConfig.patternClassification = patternClassification

                    let planConfig = {}
                    planConfig.trackingDays = differenceInBusinessDays(new Date(), new Date(enterExit.plan.dateAdded))
                    planConfig.tickerSymbol = enterExit.plan.tickerSymbol
                    planConfig.sector = enterExit.plan.sector
                    planConfig.plan = enterExit.plan.plan
                    planConfig.relevantCandleDate = enterExit.plan.relevantCandleDate
                    planConfig.dateAdded = enterExit.plan.dateAdded
                    planConfig.correlationValues = enterExit.plan.correlationValues
                    planConfig.greatestCorrelation = enterExit.plan.greatestCorrelation
                    planConfig.spyBetaValue = planConfig.plan.spyBetaValue
                    planConfig.dailyCalculatedValues = enterExit.plan.dailyTickerValues


                    let metricConfig = {}
                    metricConfig.extentProb = enterExit.plan.extentProb
                    metricConfig.morningMetrics = enterExit.plan.morningMetrics
                    metricConfig.morningVolume = enterExit.plan.morningVolumeMetrics
                    metricConfig.extremeProbByFiveMin = enterExit.plan.extremeProbByFiveMin


                    let currentPriceStats = {}
                    let mostRecentPrice = enterExit.snapShot.LatestTrade.Price
                    currentPriceStats.yesterdayClose = enterExit.snapShot.PrevDailyBar.ClosePrice
                    currentPriceStats.changeFromYesterdayClose = mostRecentPrice - currentPriceStats.yesterdayClose
                    currentPriceStats.currentRiskVReward = {
                        risk: ((mostRecentPrice - enterExitPlanPrices.stopLossPrice) * 100 / mostRecentPrice),
                        reward: ((enterExitPlanPrices.exitPrice - mostRecentPrice) * 100 / mostRecentPrice),
                    }
                    currentPriceStats.sharesToBuyWith1000DollarsCurrent = Math.floor(1000 / mostRecentPrice)
                    currentPriceStats.with1000DollarsCurrentGain = (enterExitPlanPrices.exitPrice - mostRecentPrice) * currentPriceStats.sharesToBuyWith1000DollarsCurrent
                    currentPriceStats.with1000DollarsCurrentRisk = (enterExitPlanPrices.stopLossPrice - mostRecentPrice) * currentPriceStats.sharesToBuyWith1000DollarsCurrent


                    let tradeTapeConfig = {}
                    if (enterExit.tradeData) tradeTapeConfig.liveTapeMetrics = processAuthoritativeTradesArray(enterExit.tradeData)
                    else tradeTapeConfig.liveTapeMetrics = undefined

                    // const currentTime = new Date()
                    // tradeDetails.currentDayPercentGain = (currentTime < target.getUTCDate() ? 0 : ((enterExit.mostRecentPrice - enterExit.yesterdayClose) / enterExit.yesterdayClose) * 100)
                    // tradeDetails.percentFromEnter = ((enterExit.plan.plan.enterPrice - tradeDetails.mostRecentPrice) / enterExit.plan.enterPrice) * 100
                    // tradeDetails.todayOpenPrice = stockTradeData.DailyBar.OpenPrice

                    // function getInsertionIndexLinear(arr, num) { for (let i = 0; i < 3; i++) { if (arr[i] >= num) { return i; } } return 3; }
                    // let priceVsPlan = getInsertionIndexLinear([enterExit.plan.stopLossPrice, enterExit.plan.enterPrice, enterExit.plan.enterBufferPrice], stockTradeData.LatestTrade.Price)
                    // enterExit.priceVsPlanUponFetch = priceVsPlan
                    // enterExit.listChange = false

                    // if (!enterExit?.watchForTomorrow) enterExit.watchForTomorrow = null
                    // if (!enterExit?.updateNeededDate) enterExit.updateNeededDate = null
                    // if (!enterExit?.relevantHighs) enterExit.relevantHighs = []
                    // if (!enterExit?.relevantLows) enterExit.relevantLows = []
                    // if (!enterExit?.institutionalPricePoints) enterExit.institutionalPricePoints = []

                    // if (!enterExit?.checkOffCriteria)
                    // {
                    //     enterExit.checkOffCriteria = {vpCheck: false, rsiCheck: false, macdCheck: false,
                    //         stochasticCheck: false, vortexCheck: false, volCheck: false, emaCheck: false }
                    // }



                    return {
                        id: enterExit.plan.tickerSymbol,
                        stockInfo: enterExit.plan.stockId,
                        mostRecentPrice,
                        planConfig,
                        patternConfig,
                        metricConfig,
                        tradeTapeConfig,
                        currentPriceStats,
                        historicCandle: regularSessionCandles,
                        todaysCandles: [],
                        combinedCandleData: regularSessionCandles,
                        liveAuctionMetrics: {
                            lastTradePrice: regularSessionCandles.length > 0 ? regularSessionCandles.at(-1).ClosePrice : 0.00,
                            auditedRollingVolume: 0,
                            liveTicksPerSecond: 0.0,

                            staticHistoryTouchCount: baseLineIndicators?.staticHistoryTouchCount || 0,
                            ceilingFatigueTouchCount: baseLineIndicators?.ceilingFatigueTouchCount || 0,
                            isChannelHeightViable: baseLineIndicators?.isChannelHeightViable || false,

                            historicalTrendHealthScore: baseLineIndicators?.historicalTrendHealthScore || 50,
                            isPullbackVolumeDry: baseLineIndicators?.isPullbackVolumeDry || false,
                            baseBreakoutVelocity: baseLineIndicators?.baseBreakoutVelocity || 0,

                            volumeCliffPrice: baseLineIndicators?.volumeCliffPrice || 0,
                            baselineAvgOneMinVolume: baseLineIndicators?.baselineAvgOneMinVolume || 0,
                            historicalAtr: baseLineIndicators?.historicalAtr || 0.0
                        }
                    }
                })

                // const currentTime = new Date()
                // tradeDetails.currentDayPercentGain = (currentTime < target.getUTCDate() ? 0 : ((enterExit.mostRecentPrice - enterExit.yesterdayClose) / enterExit.yesterdayClose) * 100)


                // tradeDetails.percentFromEnter = ((enterExit.plan.plan.enterPrice - tradeDetails.mostRecentPrice) / enterExit.plan.enterPrice) * 100
                // tradeDetails.trackingDays = differenceInBusinessDays(today, new Date(enterExit.plan.dateAdded))
                // tradeDetails.todayOpenPrice = stockTradeData.DailyBar.OpenPrice
                // enterExit.currentRiskVReward = {
                //     risk: ((enterExit.mostRecentPrice - enterExit.plan.stopLossPrice) * 100 / enterExit.mostRecentPrice),
                //     reward: ((enterExit.plan.exitPrice - enterExit.mostRecentPrice) * 100 / enterExit.mostRecentPrice),
                // }
                // let sharesToBuyWith1000DollarsCurrent = Math.floor(1000 / enterExit.mostRecentPrice)
                // enterExit.with1000DollarsCurrentGain = (enterExit.plan.exitPrice - enterExit.mostRecentPrice) * sharesToBuyWith1000DollarsCurrent
                // enterExit.with1000DollarsCurrentRisk = (enterExit.plan.stopLossPrice - enterExit.mostRecentPrice) * sharesToBuyWith1000DollarsCurrent
                // function getInsertionIndexLinear(arr, num) { for (let i = 0; i < 3; i++) { if (arr[i] >= num) { return i; } } return 3; }

                // let priceVsPlan = getInsertionIndexLinear([enterExit.plan.stopLossPrice, enterExit.plan.enterPrice, enterExit.plan.enterBufferPrice], stockTradeData.LatestTrade.Price)
                // enterExit.priceVsPlanUponFetch = priceVsPlan
                // enterExit.listChange = false
                // if (!enterExit?.watchForTomorrow) enterExit.watchForTomorrow = null
                // if (!enterExit?.updateNeededDate) enterExit.updateNeededDate = null
                // if (!enterExit?.relevantHighs) enterExit.relevantHighs = []
                // if (!enterExit?.relevantLows) enterExit.relevantLows = []
                // if (!enterExit?.institutionalPricePoints) enterExit.institutionalPricePoints = []


                // if (!enterExit?.with1000DollarsIdealGain)
                // {
                //     let sharesToBuyWith1000DollarsIdeal = Math.floor(1000 / enterExit.plan.enterPrice)
                //     enterExit.with1000DollarsIdealGain = (enterExit.plan.exitPrice - enterExit.plan.enterPrice) * sharesToBuyWith1000DollarsIdeal
                // }

                // if (!enterExit?.checkOffCriteria)
                // {
                //     enterExit.checkOffCriteria = {vpCheck: false, rsiCheck: false, macdCheck: false,
                //         stochasticCheck: false, vortexCheck: false, volCheck: false, emaCheck: false }
                // }

                let macroResults = []
                if (responseData?.macros) macroResults = responseData.macros.map((macroPlan) =>
                {
                    let regularSessionCandles = filterRegularSessionCandles(macroPlan.candleData)
                    let computedMACDMetrics = calculateMacroThirtyMinMacd(regularSessionCandles)
                    let macroPlanData = macroPlan.macroPlan

                    return {
                        id: macroPlanData.tickerSymbol,
                        planData: macroPlanData,
                        historicCandle: regularSessionCandles,
                        todaysCandles: [],
                        combinedCandleData: regularSessionCandles,
                        macroTideSentry: {
                            macdLine: computedMACDMetrics.macdLine,
                            signalLine: computedMACDMetrics.signalLine,
                            histogram: computedMACDMetrics.histogram,
                            isHistogramGrowingBearish: computedMACDMetrics.isHistogramGrowingBearish,
                            lastPrice: regularSessionCandles.length > 0 ? regularSessionCandles.at(-1).ClosePrice : 0.00
                        },
                        mostRecentPrice: macroPlan.snapShot.LatestTrade.Price
                    }
                })

                return {
                    plans: enginePlanAdapter.setAll(enginePlanAdapter.getInitialState(), planResults),
                    macros: engineMacroAdapter.setAll(engineMacroAdapter.getInitialState(), macroResults)
                }
            },
            async onCacheEntryAdded(arg, { getState, updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch },)
            {
                let streamingPriceBuffer = {};
                let macroStreamingPriceBuffer = Object.fromEntries(macroAndSectorTickers.map(key => [key, null]))
                let throttledUIUpdateClock = null;
                let macroThrottledUIUpdateClock = null;
                let pennyVelocityTimestampsMap = {};

                let wsConnection = null;
                const userId = getState().auth.userId
                const ws = getWebSocket(userId, 'PlannedWatchListTickers')


                const incomingPlanTradeListener = (data) =>
                {
                    updateCachedData((draft) =>
                    {
                        let activePlan = draft.plans.entities[data.tickerSymbol]
                        if (!activePlan) return

                        // --- PATH A: THE REAL-TIME PRICE PATCH (ALL ASSETS) ---
                        let currentPrice = parseFloat(data.trade.Price.toFixed(2))
                        streamingPriceBuffer[symbol] = parseFloat(data.trade.Price.toFixed(2))


                        // entityToUpdate.percentFromEnter = ((entityToUpdate.plan.enterPrice - data.tradePrice) / entityToUpdate.plan.enterPrice) * 100
                        // entityToUpdate.changeFromYesterdayClose = entityToUpdate.mostRecentPrice - entityToUpdate.yesterdayClose
                        // entityToUpdate.currentDayPercentGain = (entityToUpdate.changeFromYesterdayClose / entityToUpdate.yesterdayClose) * 100




                        // --- PATH B: THE PENNY TAPE VELOCITY COLLECTOR ---
                        if (activePlan.patternConfig.maintainLiveCandles)
                        {
                            if (!pennyVelocityTimestampsMap[activePlan.id]) { pennyVelocityTimestampsMap[activePlan.id] = []; }
                            pennyVelocityTimestampsMap[activePlan.id].push(Date.now()); // Store only the integer millisecond timestamp of the transaction [INDEX]
                        }
                        // CRITICAL STAGE B: THE 500MS SYSTEM BATCH THROTTLER (ONE REDUX PASS)
                        throttledUIUpdateClock = setInterval(() =>
                        {

                            // --- CRITICAL OVERRIDE: IF OUTSIDE AUTHORIZED MARKET HOURS, SCRUB AND EXIT ---
                            if (!checkStreamAuthorization())
                            {
                                streamingPriceBuffer = {};
                                pennyVelocityTimestampsMap = {};
                                return;
                            }


                            const now = Date.now();
                            const fiveSecondsAgo = now - 5000;

                            // Process your velocity calculations in raw memory first
                            const currentCalculatedMetrics = {};
                            Object.keys(pennyVelocityTimestampsMap).forEach(symbol =>
                            {
                                // Trim old timestamps out of your raw memory arrays
                                pennyVelocityTimestampsMap[symbol] = pennyVelocityTimestampsMap[symbol].filter(ts => ts >= fiveSecondsAgo);

                                const activeTicksCount = pennyVelocityTimestampsMap[symbol].length;
                                const currentVelocityTPS = parseFloat((activeTicksCount / 5).toFixed(1));

                                currentCalculatedMetrics[symbol] = {
                                    liveTicksPerSecond: currentVelocityTPS,
                                    isTapeSpeedScreaming: currentVelocityTPS >= 12.0
                                };
                            });

                            // Check if any fresh stream updates are actually sitting in your memory cache
                            const symbolsWithActivePriceUpdates = Object.keys(streamingPriceBuffer);
                            const symbolsWithActiveVelocityUpdates = Object.keys(currentCalculatedMetrics);
                            if (symbolsWithActivePriceUpdates.length === 0 && symbolsWithActiveVelocityUpdates.length === 0) { return; }

                            // FIRE ONE SINGLE MUTATION FOR THE ENTIRE WATCHLIST COMPILATION PASS
                            updateCachedData((draft) =>
                            {
                                if (!draft) return;
                                // Part 1: Batch overwrite the latest prices for standard and penny tickers
                                symbolsWithActivePriceUpdates.forEach(symbol =>
                                {
                                    const activePlan = draft.plans.entities[symbol];
                                    if (!activePlan) return;

                                    let price = parseFloat(streamingPriceBuffer[symbol].toFixed(2))
                                    activePlan.liveAuctionMetrics = {
                                        ...activePlan.liveAuctionMetrics,
                                        lastTradePrice: price
                                    };
                                    activePlan.liveAuctionMetrics = { ...activePlan.liveAuctionMetrics, lastTradePrice: price };
                                    activePlan.mostRecentPrice = price

                                    activePlan.currentPriceStats.changeFromYesterdayClose = price - activePlan.currentPriceStats.yesterdayClose
                                    activePlan.currentPriceStats.currentRiskVReward = {
                                        risk: ((price - activePlan.planConfig.plan.stopLossPrice) * 100 / price),
                                        reward: ((activePlan.planConfig.plan.exitPrice - price) * 100 / price),
                                    }
                                    activePlan.currentPriceStats.sharesToBuyWith1000DollarsCurrent = Math.floor(1000 / price)
                                    activePlan.currentPriceStats.with1000DollarsCurrentGain = (activePlan.planConfig.plan.exitPrice - price) * activePlan.currentPriceStats.sharesToBuyWith1000DollarsCurrent
                                    activePlan.currentPriceStats.with1000DollarsCurrentRisk = (activePlan.planConfig.plan.stopLossPrice - price) * activePlan.currentPriceStats.sharesToBuyWith1000DollarsCurrent




                                });

                                // Part 2: Batch overwrite velocity values for active penny tickers
                                symbolsWithActiveVelocityUpdates.forEach(symbol =>
                                {
                                    const activePlan = draft.plans.entities[symbol];
                                    if (!activePlan) return;

                                    activePlan.liveAuctionMetrics = {
                                        ...activePlan.liveAuctionMetrics,
                                        liveTicksPerSecond: currentCalculatedMetrics[symbol].liveTicksPerSecond,
                                        isTapeSpeedScreaming: currentCalculatedMetrics[symbol].isTapeSpeedScreaming
                                    };
                                });

                                for (const prop in streamingPriceBuffer) { delete streamingPriceBuffer[prop]; }
                            });
                        }, 9000)
                    })
                }


                const incomingMacroTradeListener = (data) =>
                {
                    if (!Object.hasOwn(macroStreamingPriceBuffer, data.Symbol)) return
                    macroStreamingPriceBuffer[data.Symbol] = data.Price

                    macroThrottledUIUpdateClock = setInterval(() =>
                    {
                        if (!checkStreamAuthorization()) { macroStreamingPriceBuffer = {}; return; }

                        const symbolsWithActiveTicks = Object.keys(macroStreamingPriceBuffer).filter(symbol => macroStreamingPriceBuffer[symbol] !== null)
                        if (symbolsWithActiveTicks.length === 0) return

                        updateCachedData((draft) =>
                        {
                            if (!draft) return
                            symbolsWithActiveTicks.forEach(symbol =>
                            {
                                const activeMacroEntity = draft.macros.entities[symbol]
                                if (!activeMacroEntity) return;

                                let price = parseFloat(macroStreamingPriceBuffer[symbol].toFixed(2))
                                activeMacroEntity.mostRecentPrice = price
                                activeMacroEntity.macroTideSentry.lastPrice = price
                            })
                            symbolsWithActiveTicks.forEach(symbol => { macroStreamingPriceBuffer[symbol] = null })

                        })
                    }, 9000);
                }



                // let sharesToBuyWith1000DollarsCurrent = Math.floor(1000 / entityToUpdate.mostRecentPrice)
                // entityToUpdate.with1000DollarsCurrentGain = (entityToUpdate.plan.exitPrice - entityToUpdate.mostRecentPrice) * sharesToBuyWith1000DollarsCurrent
                // entityToUpdate.with1000DollarsCurrentRisk = (entityToUpdate.plan.stopLossPrice - entityToUpdate.mostRecentPrice) * sharesToBuyWith1000DollarsCurrent

                // function getInsertionIndexLinear(arr, num) { for (let i = 0; i < 3; i++) { if (arr[i] >= num) { return i; } } return 3; }
                // let priceVsPlan = getInsertionIndexLinear([entityToUpdate.plan.stopLossPrice, entityToUpdate.plan.enterPrice, entityToUpdate.plan.enterBufferPrice], data.tradePrice)
                // if (!entityToUpdate.listChange && priceVsPlan !== entityToUpdate.priceVsPlanUponFetch)
                //     entityToUpdate.listChange = true



                try
                {
                    await cacheDataLoaded
                    subscribe('enterExitWatchListPrice', incomingPlanTradeListener, 'initialEnginePopulate')
                    subscribe('macroWatchListUpdate', incomingMacroTradeListener, 'initialEnginePopulate')
                } catch (error)
                {
                    await cacheEntryRemoved
                    unsubscribe('enterExitWatchListPrice', incomingPlanTradeListener, userId, 'initialEnginePopulate')
                    unsubscribe('macroWatchListUpdate', incomingMacroTradeListener, userId, 'initialEnginePopulate')
                    if (throttledUIUpdateClock) clearInterval(throttledUIUpdateClock);
                    if (macroThrottledUIUpdateClock) clearInterval(macroThrottledUIUpdateClock)
                }

                await cacheEntryRemoved
                unsubscribe('enterExitWatchListPrice', incomingPlanTradeListener, userId, 'initialEnginePopulate')
                unsubscribe('macroWatchListUpdate', incomingMacroTradeListener, userId, 'initialEnginePopulate')
                if (throttledUIUpdateClock) clearInterval(throttledUIUpdateClock);
                if (macroThrottledUIUpdateClock) clearInterval(macroThrottledUIUpdateClock)
            }

        }),
        fetchEngineCandleBarData: builder.query({
            query: (args) => ({
                url: `/engine/today/bars/${args.oneMinOrFivMinBars}`,
                validateStatus: (response, result) => { return response.status === 200 && !result.isError }
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data: freshCandleData } = await queryFulfilled;
                    dispatch(EnginePlanPlanApiSlice.util.updateQueryData('initiateEngineWithEnterExitPlan', undefined, (draft) =>
                    {
                        if (!draft) return
                        if (freshCandleData?.planData) Object.keys(freshCandleData.planData).forEach(symbol =>
                        {
                            if (!draft.plans.entities[symbol]) return
                            let liveCandles = freshCandleData.planData[symbol]
                            console.log(liveCandles.length)
                            if (!liveCandles || liveCandles.length === 0) return
                            const cleanCandlesToday = filterRegularSessionCandles(liveCandles)

                            draft.plans.entities[symbol].todaysCandles = cleanCandlesToday
                            console.log(draft.plans.entities[symbol].todaysCandles)

                            if (draft.plans.entities[symbol].maintainLiveCandles)
                            {
                                draft.plans.entities[symbol].combinedCandleData = [...draft.plans.entities[symbol].historicCandle, ...cleanCandlesToday]
                            } else if (args.oneMinOrFivMinBars === 'regularSession')
                            {
                                draft.plans.entities[symbol].combinedCandleData = [...draft.plans.entities[symbol].historicCandle, ...cleanCandlesToday]
                            } else
                            {
                                let chunked5MinCandles = downSampleOneMinToFiveMin(cleanCandlesToday)
                                draft.plans.entities[symbol].combinedCandleData = [...draft.plans.entities[symbol].historicCandle, ...chunked5MinCandles]
                            }
                        })

                        if (freshCandleData?.macroData) Object.keys(freshCandleData.macroData).forEach(symbol =>
                        {
                            if (!draft.macros.entities[symbol]) return
                            let liveCandles = freshCandleData.macroData[symbol]
                            if (!liveCandles || liveCandles.length === 0) return

                            const cleanCandlesToday = filterRegularSessionCandles(liveCandles)
                            draft.macros.entities[symbol].todaysCandles = cleanCandlesToday

                            const compiled5MinCandles = downSampleOneMinToFiveMin(cleanCandlesToday)
                            let combinedCandleData = [...(draft.macros.entities[symbol].historicCandle || []), ...compiled5MinCandles]
                            draft.macros.entities[symbol].combinedCandleData = combinedCandleData

                            const updatedMACDMetrics = calculateMacroThirtyMinMacd(combinedCandleData)

                            draft.macros.entities[symbol].macroTideSentry = {
                                ...draft.macros.entities[symbol].macroTideSentry,
                                macdLine: updatedMACDMetrics.macdLine,
                                signalLine: updatedMACDMetrics.signalLine,
                                histogram: updatedMACDMetrics.histogram,
                                isHistogramGrowingBearish: updatedMACDMetrics.isHistogramGrowingBearish,
                            }
                        })
                    }))

                } catch (error)
                {
                    console.log(error)
                }
            }
        }),
        fetchEngineOneMinCandleBarData: builder.query({
            query: (args) => ({
                url: `/engine/today/bars/regularSession/minute`,
                validateStatus: (response, result) => { return response.status === 200 && !result.isError }
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data: freshCandleData } = await queryFulfilled;

                    dispatch(EnginePlanPlanApiSlice.util.updateQueryData('initiateEngineWithEnterExitPlan', undefined, (draft) =>
                    {
                        if (!draft) return
                        if (freshCandleData?.planData) Object.keys(freshCandleData.planData).forEach(symbol =>
                        {
                            if (!draft.plans.entities[symbol]) return
                            let liveCandles = freshCandleData.planData[symbol]
                            if (!liveCandles || liveCandles.length === 0) return
                            const cleanCandlesToday = filterRegularSessionCandles(liveCandles)

                            draft.plans.entities[symbol].todaysCandles = cleanCandlesToday

                            const currentHistoric = draft.plans.entities[symbol].historicCandle

                            draft.plans.entities[symbol].combinedCandleData = [...currentHistoric, ...cleanCandlesToday]
                        })

                        if (freshCandleData?.macroData) Object.keys(freshCandleData.macroData).forEach(symbol =>
                        {

                            if (!draft.macros.entities[symbol]) return
                            let liveCandles = freshCandleData.macroData[symbol]
                            if (!liveCandles || liveCandles.length === 0) return
                            const cleanCandlesToday = filterRegularSessionCandles(liveCandles)
                            draft.macros.entities[symbol].todaysCandles = cleanCandlesToday
                            const compiled5MinCandles = downSampleOneMinToFiveMin(cleanCandlesToday)

                            let combinedCandleData = [...(draft.macros.entities[symbol].historicCandle || []), ...compiled5MinCandles]
                            draft.macros.entities[symbol].combinedCandleData = combinedCandleData
                            const updatedMACDMetrics = calculateMacroThirtyMinMacd(combinedCandleData)

                            draft.macros.entities[symbol].macroTideSentry = {
                                ...draft.macros.entities[symbol].macroTideSentry,
                                macdLine: updatedMACDMetrics.macdLine,
                                signalLine: updatedMACDMetrics.signalLine,
                                histogram: updatedMACDMetrics.histogram,
                                isHistogramGrowingBearish: updatedMACDMetrics.isHistogramGrowingBearish,
                            }
                        })
                    }))

                } catch (error)
                {
                    console.log(error)
                }
            }
        }),
        fetchEngineTradeData: builder.query({
            query: () => ({
                url: `/engine/today/trades`,
                validateStatus: (response, result) => { return response.status === 200 && !result.isError }
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data: freshTradeData } = await queryFulfilled;

                    dispatch(EnginePlanPlanApiSlice.util.updateQueryData('initiateEngineWithEnterExitPlan', undefined, (draft) =>
                    {
                        if (!draft) return
                        if (freshTradeData?.tradeData) Object.keys(freshTradeData.tradeData).forEach(symbol =>
                        {
                            if (!draft.plans.entities[symbol]) return
                            let tradeData = freshTradeData.tradeData[symbol]
                            if (!tradeData || tradeData.length === 0) return
                            draft.plans.entities[symbol].tradeTapeConfig.liveTapeMetrics = processAuthoritativeTradesArray(tradeData)
                        })
                    }))

                } catch (error)
                {
                    console.log(error)
                }
            }
        })
    })
});

export const {
    useInitiateEngineWithEnterExitPlanQuery,
    useFetchEngineCandleBarDataQuery,
    useFetchEngineTradeDataQuery,
    useFetchEngineOneMinCandleBarDataQuery
} = EnginePlanPlanApiSlice;

function downSampleOneMinToFiveMin(oneMinArray)
{
    const candlesBy5MinBucket = {}
    const sortedArray = [...oneMinArray].sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp))

    sortedArray.forEach((candle) =>
    {
        const timeObj = new Date(candle.Timestamp)
        const slotFloor = Math.floor(timeObj.getUTCMinutes() / 5) * 5
        timeObj.setUTCMinutes(slotFloor)
        timeObj.setUTCSeconds(0)
        timeObj.setUTCMilliseconds(0)
        const slotKey = timeObj.toISOString()

        if (!candlesBy5MinBucket[slotKey]) candlesBy5MinBucket[slotKey] = [];
        candlesBy5MinBucket[slotKey].push(candle)
    })

    return Object.keys(candlesBy5MinBucket).map(slotKey =>
    {
        const bucket = candlesBy5MinBucket[slotKey]
        return {
            Timestamp: slotKey,
            OpenPrice: bucket[0].OpenPrice,
            HighPrice: Math.max(...bucket.map(c => c.HighPrice)),
            LowPrice: Math.min(...bucket.map(c => c.LowPrice)),
            ClosePrice: bucket[bucket.length - 1].ClosePrice,
            Volume: bucket.reduce((sum, c) => sum + c.Volume, 0)
        }
    })

}



const selectHistoricalQueryCache = EnginePlanPlanApiSlice.endpoints.initiateEngineWithEnterExitPlan.select()
const selectApiCacheData = createSelector([selectHistoricalQueryCache], (queryResult) => queryResult.data);
const planSelectors = enginePlanAdapter.getSelectors((state) => selectApiCacheData(state)?.plans || enginePlanAdapter.getInitialState());
const macroSelectors = engineMacroAdapter.getSelectors((state) => selectApiCacheData(state)?.macros || engineMacroAdapter.getInitialState());


export const selectPrioritizedWatchlist = createSelector(
    [planSelectors.selectIds, planSelectors.selectEntities, macroSelectors.selectIds, macroSelectors.selectEntities],
    (stockIds, stockEntities, macroIds, macroEntities) =>
    {
        if (stockIds.length === 0) return [];

        // // Isolate your SPY macro tide constants cleanly out of your index dictionary
        const liveSpyPlan = macroEntities['SPY']


        const scoredWatchlistArray = stockIds.map(id =>
        {
            const planEntity = stockEntities[id];
            if (!planEntity) return null;

            // // Execute your Tier 1 and Tier 2 matrix scoring rules in mid-air!
            const centralScoreProfile = calculateCentralPlanScore(planEntity, liveSpyPlan);

            return {
                // ...planEntity,
                tickerSymbol: planEntity.id,
                alphaConvictionScore: centralScoreProfile.matchScorePercent,
                executionStatus: centralScoreProfile.status,
                livePriceMetrics: centralScoreProfile.metrics
            };
        }).filter(Boolean);

        // Sort chronologically from absolute highest conviction (100%) to lowest (0%)
        return scoredWatchlistArray.sort((a, b) => b.alphaConvictionScore - a.alphaConvictionScore);

    }
);

