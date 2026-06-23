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


const { getWebSocket, subscribe, unsubscribe } = setupWebSocket();

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
                const currentTime = new Date()
                let planResults = []
                if (responseData?.plans) planResults = responseData.plans.filter(t => t.plan?.patternClassification !== undefined).map((enterExit) =>
                {
                    let patternClassification = enterExit.plan.patternClassification

                    let baseLineIndicators = {}
                    let patternConfig
                    let regularSessionCandles = filterRegularSessionCandles(enterExit.candleData)

                    if (patternClassification === 'channel')
                    {
                        let patternConfig = enterExit.plan.channelPattern
                        if (patternConfig.channelType === "SUB_ENGINE_PENNY_STOCK_SCALP")
                        {
                            baseLineIndicators = compileHistoricalOneMinPennyBaselines(regularSessionCandles)
                        } else
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

                    // let stockTradeData = enterExit.snapShot

                    // let liveTradeMetrics = undefined
                    // if (enterExit.tradeData) liveTradeMetrics = processAuthoritativeTradesArray(enterExit.tradeData)


                    // let tradeDetails = {}
                    // tradeDetails.mostRecentPrice = stockTradeData.LatestTrade.Price
                    // tradeDetails.changeFromYesterdayClose = tradeDetails.mostRecentPrice - stockTradeData.PrevDailyBar.ClosePrice
                    // tradeDetails.yesterdayClose = stockTradeData.PrevDailyBar.ClosePrice


                    return {
                        id: enterExit.plan.tickerSymbol,
                        planConfig: enterExit.plan,
                        patternConfig,
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
                //     enterExit.checkOffCriteria = {
                //         vpCheck: false,
                //         rsiCheck: false,
                //         macdCheck: false,
                //         stochasticCheck: false,
                //         vortexCheck: false,
                //         volCheck: false,
                //         emaCheck: false
                //     }
                // }

                // return {
                //     ...enterExit.plan,
                //     ...tradeDetails,
                //     id: enterExit.plan.tickerSymbol,
                //     historicCandle: enterExit.candleData,
                //     todayCandleData: [],
                //     combinedCandleData: enterExit.candleData,
                //     liveAuctionMetrics
                // }


                let macroResults = []
                if (responseData?.macros) macroResults = responseData.macros.map((macroPlan) =>
                {
                    let regularSessionCandles = filterRegularSessionCandles(macroPlan.candleData)
                    let regularSessionLength = regularSessionCandles.length
                    let computedMACDMetrics = calculateMacroThirtyMinMacd(regularSessionCandles)

                    return {
                        id: macroPlan.macroPlan.tickerSymbol,
                        planData: { ...macroPlan.macroPlan },
                        historicCandle: regularSessionCandles,
                        todaysCandles: [],
                        combinedCandleData: regularSessionCandles,
                        macroTideSentry: {
                            macdLine: computedMACDMetrics.macdLine,
                            signalLine: computedMACDMetrics.signalLine,
                            histogram: computedMACDMetrics.histogram,
                            isHistogramGrowingBearish: computedMACDMetrics.isHistogramGrowingBearish,
                            lastPrice: regularSessionLength > 0 ? regularSessionCandles.at(-1).ClosePrice : 0.00
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
                // const macroAndSectorTickers = ['SPY', 'QQQ', 'IWM', 'DIA', 'XLV', 'XLP', 'XLI', 'XLC', 'XLU', 'XLK', 'XLF', "XLB", 'XLE', 'XLY', 'XLRE']
                let macroStreamingPriceBuffer = Object.fromEntries(['SPY', 'QQQ', 'IWM', 'DIA', 'XLV', 'XLP', 'XLI', 'XLC', 'XLU', 'XLK', 'XLF', "XLB", 'XLE', 'XLY', 'XLRE'].map(key => [key, null]))
                let streamingPriceBuffer = {};

                let throttledUIUpdateClock = null;
                let macroThrottledUIUpdateClock = null;

                let pennyVelocityTimestampsMap = {};


                let wsConnection = null;
                const userId = getState().auth.userId
                const ws = getWebSocket(userId, 'PlannedWatchListTickers')
                const checkStreamAuthorization = () =>
                {
                    const systemTime = new Date();
                    const nyTime = toZonedTime(systemTime, 'America/New_York')

                    const streamOpenBarrier = set(nyTime, { hours: 7, minutes: 30, seconds: 0, milliseconds: 0 });
                    const streamCloseBarrier = set(nyTime, { hours: 16, minutes: 30, seconds: 0, milliseconds: 0 });

                    return !isWeekend(nyTime) && isWithinInterval(nyTime, { start: streamOpenBarrier, end: streamCloseBarrier });
                }



                const incomingPlanTradeListener = (data) =>
                {
                    updateCachedData((draft) =>
                    {
                        let activePlan = draft.plans.entities[data.tickerSymbol]
                        if (!activePlan) return
                        // Check your database flag to determine the asset class routing channel
                        // const isPennyScalpAsset = activePlan.planConfig?.userSelectedPattern === "SUB_ENGINE_PENNY_STOCK_SCALP";
                        const isPennyScalpAsset = activePlan.maintainLiveCandles;

                        // --- PATH A: THE REAL-TIME PRICE PATCH (ALL ASSETS) ---
                        activePlan.liveAuctionMetrics = { ...activePlan.liveAuctionMetrics, lastTradePrice: parseFloat(data.trade.Price.toFixed(2)) };

                        // --- PATH B: THE PENNY TAPE VELOCITY COLLECTOR ---
                        if (isPennyScalpAsset)
                        {
                            if (!pennyVelocityTimestampsMap[activePlan.id]) { pennyVelocityTimestampsMap[activePlan.id] = []; }
                            pennyVelocityTimestampsMap[activePlan.id].push(Date.now()); // Store only the integer millisecond timestamp of the transaction [INDEX]
                        }


                        // =========================================================================
                        // ⏰ CRITICAL STAGE B: THE 500MS SYSTEM BATCH THROTTLER (ONE REDUX PASS)
                        // =========================================================================
                        // Instead of mutating state 500 times a second, this clock bundles all active 
                        // changes across your entire watchlist and updates your UI inside ONE clean frame! [INDEX]
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
                            // Stalls the clock if no active data changed, saving CPU power

                            // FIRE ONE SINGLE MUTATION FOR THE ENTIRE WATCHLIST COMPILATION PASS [INDEX]
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
                                    activePlan.mostRecentPrice = price
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
                        }, 500)
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
                    }, 500);
                }

                // entityToUpdate.mostRecentPrice = data.tradePrice
                // entityToUpdate.percentFromEnter = ((entityToUpdate.plan.enterPrice - data.tradePrice) / entityToUpdate.plan.enterPrice) * 100
                // entityToUpdate.changeFromYesterdayClose = entityToUpdate.mostRecentPrice - entityToUpdate.yesterdayClose
                // entityToUpdate.currentDayPercentGain = (entityToUpdate.changeFromYesterdayClose / entityToUpdate.yesterdayClose) * 100

                // entityToUpdate.currentRiskVReward = {
                //     risk: ((entityToUpdate.mostRecentPrice - entityToUpdate.plan.stopLossPrice) * 100 / entityToUpdate.mostRecentPrice),
                //     reward: ((entityToUpdate.plan.exitPrice - entityToUpdate.mostRecentPrice) * 100 / entityToUpdate.mostRecentPrice),
                // }

                // let sharesToBuyWith1000DollarsCurrent = Math.floor(1000 / entityToUpdate.mostRecentPrice)
                // entityToUpdate.with1000DollarsCurrentGain = (entityToUpdate.plan.exitPrice - entityToUpdate.mostRecentPrice) * sharesToBuyWith1000DollarsCurrent
                // entityToUpdate.with1000DollarsCurrentRisk = (entityToUpdate.plan.stopLossPrice - entityToUpdate.mostRecentPrice) * sharesToBuyWith1000DollarsCurrent

                // function getInsertionIndexLinear(arr, num)
                // {
                //     for (let i = 0; i < 3; i++) { if (arr[i] >= num) { return i; } }
                //     return 3;
                // }
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
                            // if other parts of the entity are necessary to access 
                            let entityToUpdate = draft.plans.entities[symbol]
                            if (!entityToUpdate) return
                            let liveCandles = freshCandleData.planData[symbol]
                            if (liveCandles.length === 0) return

                            entityToUpdate.todaysCandles = liveCandles
                            let liveCandlePrice = liveCandles.at(-1).ClosePrice

                            entityToUpdate.combinedCandleData = [...(entityToUpdate.historicCandles || []), ...freshCandleData.planData[symbol]]
                        })

                        if (freshCandleData?.macroData) Object.keys(freshCandleData.macroData).forEach(symbol =>
                        {
                            let entityToUpdate = draft.macros.entities[symbol]
                            let liveCandles = freshCandleData.macroData[symbol]
                            if (!entityToUpdate || liveCandles.length === 0) return

                            const compiled5MinCandles = downSampleOneMinToFiveMin(liveCandles)
                            entityToUpdate.todaysCandles = liveCandles

                            const cleanRegularCandles = filterRegularSessionCandles(compiled5MinCandles)
                            const fullCombinedCandles = [...EnginePlanPlanApiSlice(entityToUpdate.historicCandle || []), ...cleanRegularCandles]

                            const updatedMACDMetrics = calculateMacroThirtyMinMacd(fullCombinedCandles)
                            entityToUpdate.combinedCandleData = fullCombinedCandles

                            entityToUpdate.macroTideSentry = {
                                ...entityToUpdate.macroTideSentry,
                                macdLine: updatedMACDMetrics.macdLine,
                                signalLine: updatedMACDMetrics.signalLine,
                                histogram: updatedMACDMetrics.histogram,
                                isHistogramGrowingBearish: updatedMACDMetrics.isHistogramGrowingBearish,
                            }
                            console.log(updatedMACDMetrics)
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
                            let entityToUpdate = draft.plans.entities[symbol]
                            if (!entityToUpdate) return

                            let liveCandles = freshCandleData.planData[symbol]
                            if (liveCandles.length === 0) return
                            entityToUpdate.todaysCandles = liveCandles

                            entityToUpdate.combinedCandleData = [...(entityToUpdate.historic10Day5MinCandle || []), ...liveCandles]
                        })

                        if (freshCandleData?.macroData) Object.keys(freshCandleData.macroData).forEach(symbol =>
                        {
                            let entityToUpdate = draft.macros.entities[symbol]
                            let liveCandles = freshCandleData.macroData[symbol]
                            if (!entityToUpdate || liveCandles.length === 0) return

                            const compiled5MinCandles = downSampleOneMinToFiveMin(liveCandles)
                            entityToUpdate.todaysCandles = liveCandles

                            const cleanRegularCandles = filterRegularSessionCandles(compiled5MinCandles)
                            const fullCombinedCandles = [...EnginePlanPlanApiSlice(entityToUpdate.historicCandle || []), ...cleanRegularCandles]
                            entityToUpdate.combinedCandleData = fullCombinedCandles

                            const updatedMACDMetrics = calculateMacroThirtyMinMacd(fullCombinedCandles)
                            entityToUpdate.macroTideSentry = {
                                ...entityToUpdate.macroTideSentry,
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
                        Object.keys(freshTradeData).forEach(symbol =>
                        {
                            let entityToUpdate = draft.plans.entities[symbol]
                            if (!entityToUpdate || !freshTradeData[symbol]) return

                            entityToUpdate.liveAuctionMetrics = processAuthoritativeTradesArray(freshTradeData[symbol])
                            console.log(entityToUpdate.liveAuctionMetrics)
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
const stockPlanSelectors = enginePlanAdapter.getSelectors((state) => selectApiCacheData(state)?.plans || enginePlanAdapter.getInitialState());
const macroMarketSelectors = engineMacroAdapter.getSelectors((state) => selectApiCacheData(state)?.macros || engineMacroAdapter.getInitialState());


export const selectPrioritizedWatchlist = createSelector(
    [
        stockPlanSelectors.selectIds,      // Array of active stock keys ["AMD", "NVDA"]
        stockPlanSelectors.selectEntities, // The raw stock documents dictionary
        macroMarketSelectors.selectIds,
        macroMarketSelectors.selectEntities // The raw macro index dictionary
    ],
    (stockIds, stockEntities, macroIds, macroEntities) =>
    {
        if (stockIds.length === 0) return [];

        // // Isolate your SPY macro tide constants cleanly out of your index dictionary
        const liveSpyPlan = macroEntities['SPY'] ? macroEntities['SPY'].macroTideSentry : null;
        console.log(liveSpyPlan)


        const scoredWatchlistArray = stockIds.map(id =>
        {
            const planEntity = stockEntities[id];
            if (!planEntity) return null;
            console.log(planEntity)
            const todaysLiveCandles = planEntity.todaysCandles || [];
            return { alphaConvictionScore: Math.random(0, 1) * 100 }

            // // Execute your Tier 1 and Tier 2 matrix scoring rules in mid-air! [INDEX]
            // const centralScoreProfile = calculateCentralPlanScore(planEntity, todaysLiveCandles, liveSpyPlan);

            // return {
            //     ...planEntity,
            //     alphaConvictionScore: centralScoreProfile.matchScorePercent,
            //     executionStatus: centralScoreProfile.status,
            //     livePriceMetrics: centralScoreProfile.metrics
            // };
        }).filter(Boolean);

        // Sort chronologically from absolute highest conviction (100%) to lowest (0%)
        return scoredWatchlistArray.sort((a, b) => b.alphaConvictionScore - a.alphaConvictionScore);

    }
);

