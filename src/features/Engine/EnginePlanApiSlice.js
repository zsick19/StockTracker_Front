import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";
import { differenceInBusinessDays, isWeekend, isWithinInterval } from "date-fns";
import { toZonedTime } from 'date-fns-tz'
import { symbol } from "d3";
import { Volume } from "lucide-react";

const { getWebSocket, subscribe, unsubscribe } = setupWebSocket();

export const enginePlanAdapter = createEntityAdapter({})

export const EnginePlanPlanApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsersEnterExitPlan: builder.query({
            query: () => ({
                url: `/user/enterExitPlans`,
                validateStatus: (response, result) => { return response.status === 200 && !result.isError }
            }),
            // transformResponse: responseData =>
            // {
            //     const listOfTickers = responseData.mostRecentPrice.map((ticker) => ticker.symbol)


            //     const enterBufferResponse = []
            //     const stopLossResponse = []
            //     const plansResponse = []
            //     const today = new Date()
            //     const currentTime = today.getUTCDate()
            //     const target = new Date()
            //     target.setHours(9, 30, 0, 0)

            //     responseData.plans.forEach((enterExit) =>
            //     {
            //         let stockTradeData = responseData.mostRecentPrice[listOfTickers.indexOf(enterExit.tickerSymbol)]

            //         enterExit.id = enterExit.tickerSymbol
            //         enterExit.mostRecentPrice = stockTradeData.LatestTrade.Price

            //         enterExit.changeFromYesterdayClose = enterExit.mostRecentPrice - stockTradeData.PrevDailyBar.ClosePrice

            //         enterExit.yesterdayClose = stockTradeData.PrevDailyBar.ClosePrice
            //         enterExit.currentDayPercentGain = (currentTime < target.getUTCDate() ? 0 : ((enterExit.mostRecentPrice - enterExit.yesterdayClose) / enterExit.yesterdayClose) * 100)
            //         enterExit.percentFromEnter = ((enterExit.plan.enterPrice - enterExit.mostRecentPrice) / enterExit.plan.enterPrice) * 100
            //         enterExit.trackingDays = differenceInBusinessDays(today, new Date(enterExit.dateAdded))
            //         enterExit.todayOpenPrice = stockTradeData.DailyBar.OpenPrice

            //         enterExit.currentRiskVReward = {
            //             risk: ((enterExit.mostRecentPrice - enterExit.plan.stopLossPrice) * 100 / enterExit.mostRecentPrice),
            //             reward: ((enterExit.plan.exitPrice - enterExit.mostRecentPrice) * 100 / enterExit.mostRecentPrice),
            //         }


            //         if (!enterExit?.relevantHighs) enterExit.relevantHighs = []
            //         if (!enterExit?.relevantLows) enterExit.relevantLows = []
            //         if (!enterExit?.institutionalPricePoints) enterExit.institutionalPricePoints = []


            //         let sharesToBuyWith1000DollarsCurrent = Math.floor(1000 / enterExit.mostRecentPrice)
            //         enterExit.with1000DollarsCurrentGain = (enterExit.plan.exitPrice - enterExit.mostRecentPrice) * sharesToBuyWith1000DollarsCurrent
            //         enterExit.with1000DollarsCurrentRisk = (enterExit.plan.stopLossPrice - enterExit.mostRecentPrice) * sharesToBuyWith1000DollarsCurrent

            //         if (!enterExit?.checkOffCriteria)
            //         {
            //             enterExit.checkOffCriteria = {
            //                 vpCheck: false,
            //                 rsiCheck: false,
            //                 macdCheck: false,
            //                 stochasticCheck: false,
            //                 vortexCheck: false,
            //                 volCheck: false,
            //                 emaCheck: false
            //             }
            //         }

            //         if (!enterExit?.with1000DollarsIdealGain)
            //         {
            //             let sharesToBuyWith1000DollarsIdeal = Math.floor(1000 / enterExit.plan.enterPrice)
            //             enterExit.with1000DollarsIdealGain = (enterExit.plan.exitPrice - enterExit.plan.enterPrice) * sharesToBuyWith1000DollarsIdeal
            //         }

            //         function getInsertionIndexLinear(arr, num) { for (let i = 0; i < 3; i++) { if (arr[i] >= num) { return i; } } return 3; }

            //         let priceVsPlan = getInsertionIndexLinear([enterExit.plan.stopLossPrice, enterExit.plan.enterPrice, enterExit.plan.enterBufferPrice],
            //             stockTradeData.LatestTrade.Price)
            //         enterExit.priceVsPlanUponFetch = priceVsPlan
            //         enterExit.listChange = false



            //         if (!enterExit?.watchForTomorrow) enterExit.watchForTomorrow = null
            //         if (!enterExit?.updateNeededDate) enterExit.updateNeededDate = null

            //         switch (priceVsPlan)
            //         {
            //             case 0: stopLossResponse.push(enterExit); break;
            //             case 1: enterBufferResponse.push(enterExit); break;
            //             case 2: enterBufferResponse.push(enterExit); break;
            //             case 3: plansResponse.push(enterExit); break;
            //         }

            //         if (enterExit.tickerSymbol === "CSWC") console.log(priceVsPlan)
            //     })

            //     return {
            //         enterBufferHit: enterBufferHitAdapter.setAll(enterBufferHitAdapter.getInitialState(), enterBufferResponse.sort((a, b) => b.percentFromEnter - a.percentFromEnter)),
            //         stopLossHit: stopLossHitAdapter.setAll(stopLossHitAdapter.getInitialState(), stopLossResponse.sort((a, b) => b.percentFromEnter - a.percentFromEnter)),
            //         plannedTickers: enterExitAdapter.setAll(enterExitAdapter.getInitialState(), plansResponse.sort((a, b) => b.percentFromEnter - a.percentFromEnter))
            //     }
            // },
            providesTags: (result, error, args) => [{ type: 'enterExitPlans' }],
            // async onCacheEntryAdded(arg, { getState, updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch },)
            // {
            //     const userId = getState().auth.userId
            //     const ws = getWebSocket(userId, 'PlannedWatchListTickers')

            //     const incomingTradeListener = (data) =>
            //     {
            //         updateCachedData((draft) =>
            //         {
            //             let entityToUpdate
            //             if (draft.enterBufferHit.ids.includes(data.tickerSymbol)) { entityToUpdate = draft.enterBufferHit.entities[data.tickerSymbol] }
            //             else if (draft.stopLossHit.ids.includes(data.tickerSymbol)) { entityToUpdate = draft.stopLossHit.entities[data.tickerSymbol] }
            //             else { entityToUpdate = draft.plannedTickers.entities[data.tickerSymbol] }



            //             if (entityToUpdate)
            //             {
            //                 entityToUpdate.mostRecentPrice = data.tradePrice
            //                 entityToUpdate.percentFromEnter = ((entityToUpdate.plan.enterPrice - data.tradePrice) / entityToUpdate.plan.enterPrice) * 100
            //                 entityToUpdate.changeFromYesterdayClose = entityToUpdate.mostRecentPrice - entityToUpdate.yesterdayClose
            //                 entityToUpdate.currentDayPercentGain = (entityToUpdate.changeFromYesterdayClose / entityToUpdate.yesterdayClose) * 100

            //                 entityToUpdate.currentRiskVReward = {
            //                     risk: ((entityToUpdate.mostRecentPrice - entityToUpdate.plan.stopLossPrice) * 100 / entityToUpdate.mostRecentPrice),
            //                     reward: ((entityToUpdate.plan.exitPrice - entityToUpdate.mostRecentPrice) * 100 / entityToUpdate.mostRecentPrice),
            //                 }

            //                 let sharesToBuyWith1000DollarsCurrent = Math.floor(1000 / entityToUpdate.mostRecentPrice)
            //                 entityToUpdate.with1000DollarsCurrentGain = (entityToUpdate.plan.exitPrice - entityToUpdate.mostRecentPrice) * sharesToBuyWith1000DollarsCurrent
            //                 entityToUpdate.with1000DollarsCurrentRisk = (entityToUpdate.plan.stopLossPrice - entityToUpdate.mostRecentPrice) * sharesToBuyWith1000DollarsCurrent

            //                 function getInsertionIndexLinear(arr, num)
            //                 {
            //                     for (let i = 0; i < 3; i++) { if (arr[i] >= num) { return i; } }
            //                     return 3;
            //                 }
            //                 let priceVsPlan = getInsertionIndexLinear([entityToUpdate.plan.stopLossPrice, entityToUpdate.plan.enterPrice, entityToUpdate.plan.enterBufferPrice], data.tradePrice)
            //                 if (!entityToUpdate.listChange && priceVsPlan !== entityToUpdate.priceVsPlanUponFetch)
            //                     entityToUpdate.listChange = true
            //             }
            //         })
            //     }
            //     try
            //     {
            //         await cacheDataLoaded
            //         subscribe('enterExitWatchListPrice', incomingTradeListener, 'PlannedWatchListTickers')
            //     } catch (error)
            //     {
            //         await cacheEntryRemoved
            //         unsubscribe('enterExitWatchListPrice', incomingTradeListener, userId, 'PlannedWatchListTickers')
            //     }

            //     await cacheEntryRemoved
            //     unsubscribe('enterExitWatchListPrice', incomingTradeListener, userId, 'PlannedWatchListTickers')
            // }
        }),

        initiateEngineWithEnterExitPlan: builder.query({
            query: () => ({
                url: `/engine/historical`,
                validateStatus: (response, result) => { return response.status === 200 && !result.isError }
            }), transformResponse: (responseData) =>
            {

                const currentTime = new Date()
                let results = responseData.map((enterExit) =>
                {
                    let stockTradeData = enterExit.snapShot

                    let liveAuctionMetrics = undefined
                    if (enterExit.tradeData) liveAuctionMetrics = processAuthoritativeTradesArray(enterExit.tradeData)

                    let tradeDetails = {}
                    tradeDetails.mostRecentPrice = stockTradeData.LatestTrade.Price

                    tradeDetails.changeFromYesterdayClose = tradeDetails.mostRecentPrice - stockTradeData.PrevDailyBar.ClosePrice
                    tradeDetails.yesterdayClose = stockTradeData.PrevDailyBar.ClosePrice


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


                    return { ...enterExit.plan, ...tradeDetails, id: enterExit.plan.tickerSymbol, historicCandle: enterExit.candleData, todayCandleData: [], combinedCandleData: [], liveAuctionMetrics }
                })
                return enginePlanAdapter.setAll(enginePlanAdapter.getInitialState(), results)
            },
            async onCacheEntryAdded(arg, { getState, updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch },)
            {
                const streamingPriceBuffer = {};
                const pennyVelocityTimestampsMap = {};
                let throttledUIUpdateClock = null;

                let wsConnection = null;

                const userId = getState().auth.userId
                const ws = getWebSocket(userId, 'PlannedWatchListTickers')

                const incomingTradeListener = (data) =>
                {
                    updateCachedData((draft) =>
                    {
                        let activePlan = draft.entities[data.tickerSymbol]
                        if (activePlan)
                        {
                            // Check your database flag to determine the asset class routing channel
                            // const isPennyScalpAsset = activePlan.planConfig?.userSelectedPattern === "SUB_ENGINE_PENNY_STOCK_SCALP";
                            const isPennyScalpAsset = activePlan.maintainLiveCandles;

                            // --- PATH A: THE REAL-TIME PRICE PATCH (ALL ASSETS) ---
                            activePlan.liveAuctionMetrics = {
                                ...activePlan.liveAuctionMetrics,
                                lastTradePrice: parseFloat(data.trade.Price.toFixed(2))
                            };

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
                                // 1. GET PRISTINE WALL STREET TIME OVERRIDES VIA DATE-FNS
                                const systemTime = new Date();
                                const nyTime = toZonedTime(systemTime, 'America/New_York')

                                // 2. EXPRESSIVE TIME-GATE CALCULATIONS (NO STRING CONCATENATION)
                                // We use date-fns 'set' to cleanly attach our market open/close boundaries to today's NY object
                                const streamOpenBarrier = set(nyTime, { hours: 7, minutes: 30, seconds: 0, milliseconds: 0 });
                                const streamCloseBarrier = set(nyTime, { hours: 16, minutes: 30, seconds: 0, milliseconds: 0 });

                                // Declaratively check if the stream is authorized to run right now
                                const isStreamAuthorized = !isWeekend(nyTime) && isWithinInterval(nyTime, {
                                    start: streamOpenBarrier,
                                    end: streamCloseBarrier
                                });

                                // --- CRITICAL OVERRIDE: IF OUTSIDE AUTHORIZED MARKET HOURS, SCRUB AND EXIT ---
                                if (!isStreamAuthorized)
                                {
                                    // Instantly flush your temporary objects so no residual data leaks overnight
                                    streamingPriceBuffer = {};
                                    pennyVelocityTimestampsMap = {};
                                    return; // Shortcut exit! Bypasses the heavy Redux mutation logic below
                                }



                                const now = Date.now();
                                const fiveSecondsAgo = now - 5000;

                                // Process your velocity calculations in raw memory first
                                const currentCalculatedMetrics = {};

                                Object.keys(pennyVelocityTimestampsMap).forEach(symbol =>
                                {
                                    // Trim old timestamps out of your raw memory arrays
                                    pennyVelocityTimestampsMap[symbol] = pennyVelocityTimestampsMap[symbol].filter(
                                        ts => ts >= fiveSecondsAgo
                                    );

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

                                if (symbolsWithActivePriceUpdates.length === 0 && symbolsWithActiveVelocityUpdates.length === 0)
                                {
                                    return; // Stalls the clock if no active data changed, saving CPU power
                                }

                                // FIRE ONE SINGLE MUTATION FOR THE ENTIRE WATCHLIST COMPILATION PASS [INDEX]
                                updateCachedData((draft) =>
                                {
                                    if (!draft) return;

                                    // Part 1: Batch overwrite the latest prices for standard and penny tickers
                                    symbolsWithActivePriceUpdates.forEach(symbol =>
                                    {
                                        const activePlan = draft[symbol];
                                        if (activePlan)
                                        {
                                            activePlan.liveAuctionMetrics = {
                                                ...activePlan.liveAuctionMetrics,
                                                lastTradePrice: parseFloat(streamingPriceBuffer[symbol].toFixed(2))
                                            };
                                        }
                                    });

                                    // Part 2: Batch overwrite velocity values for active penny tickers
                                    symbolsWithActiveVelocityUpdates.forEach(symbol =>
                                    {
                                        const activePlan = draft[symbol];
                                        if (activePlan)
                                        {
                                            activePlan.liveAuctionMetrics = {
                                                ...activePlan.liveAuctionMetrics,
                                                liveTicksPerSecond: currentCalculatedMetrics[symbol].liveTicksPerSecond,
                                                isTapeSpeedScreaming: currentCalculatedMetrics[symbol].isTapeSpeedScreaming
                                            };
                                        }
                                    });

                                    // Clear out your temporary memory pricing buffer to reset for the next 500ms cycle
                                    // This leaves your memory arrays pristine for the incoming stream frames
                                    for (const prop in streamingPriceBuffer) { delete streamingPriceBuffer[prop]; }
                                });
                            }, 500)











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
                        }
                    })
                }


                try
                {
                    await cacheDataLoaded
                    subscribe('enterExitWatchListPrice', incomingTradeListener, 'initialEnginePopulate')
                } catch (error)
                {
                    await cacheEntryRemoved
                    unsubscribe('enterExitWatchListPrice', incomingTradeListener, userId, 'initialEnginePopulate')
                    if (throttledUIUpdateClock) clearInterval(throttledUIUpdateClock);

                }

                await cacheEntryRemoved
                unsubscribe('enterExitWatchListPrice', incomingTradeListener, userId, 'initialEnginePopulate')
                if (throttledUIUpdateClock) clearInterval(throttledUIUpdateClock);

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
                        Object.keys(freshCandleData).forEach(symbol =>
                        {

                            // if other parts of the entity are necessary to access 
                            let entityToUpdate = draft.entities[symbol]
                            entityToUpdate.todayCandleData = freshCandleData[symbol]

                            entityToUpdate.combinedCandleData = [...(entityToUpdate.historicCandles || []), ...freshCandleData[symbol]]

                            //if just pumping changes
                            // enginePlanAdapter.updateOne(draft, {
                            //     id: symbol,
                            //     changes: { freshDailyCandleData: freshCandleData[symbol] }
                            // })

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
                        Object.keys(freshCandleData).forEach(symbol =>
                        {

                            // if other parts of the entity are necessary to access 
                            let entityToUpdate = draft.entities[symbol]
                            entityToUpdate.todayCandleData = freshCandleData[symbol]
                            entityToUpdate.combinedFiveMinCandleData = [...(entityToUpdate.historic10Day5MinCandle || []), ...freshCandleData[symbol]]
                            console.log(entityToUpdate)
                            //if just pumping changes
                            // enginePlanAdapter.updateOne(draft, {
                            //     id: symbol,
                            //     changes: { freshDailyCandleData: freshCandleData[symbol] }
                            // })

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

                            // if other parts of the entity are necessary to access 
                            let entityToUpdate = draft.entities[symbol]
                            if (freshTradeData[symbol]) { entityToUpdate.liveAuctionMetrics = processAuthoritativeTradesArray(freshTradeData[symbol]) }

                            console.log(entityToUpdate.liveAuctionMetrics)






                            //if just pumping changes
                            // enginePlanAdapter.updateOne(draft, {
                            //     id: symbol,
                            //     changes: { freshDailyCandleData: freshCandleData[symbol] }
                            // })

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




/**
 * Isolated Authoritative Trade Array Processor.
 * Ingests a raw array of Alpaca REST trades, extracts true velocity 
 * and volume metrics over the real data footprint, and returns pure scalar values.
 * 
 * @param {Array} alpacaTradesArray - Raw historical trade prints: [{ p: Number, s: Number, t: String }]
 * @returns {Object} Clean, calculated execution constants for your cache overwrite
 */
function processAuthoritativeTradesArray(alpacaTradesArray)
{
    if (alpacaTradesArray.length === 0)
    {
        return {
            auditedTicksPerSecond: 0.0,
            auditedRollingVolume: 0,
            lastTradePrice: 0.00,
            hasDataFootprint: false
        };
    }

    let totalVolumeAccumulated = 0;
    const totalTicksCount = alpacaTradesArray.length;

    // 1. Accumulate total share volume size via a fast loop pass
    alpacaTradesArray.forEach(trade =>
    {
        totalVolumeAccumulated += trade.Size; // 's' is Alpaca's primitive key for Size (Shares executed)
    });

    // Extract the most recent settled print to act as your live price anchor
    const lastTradeIndex = totalTicksCount - 1;
    const latestTradePrice = alpacaTradesArray[lastTradeIndex].Price; // 'p' is Price

    // 2. COMPUTE THE TRUE ACTIVE TIME FOOTPRINT
    // Convert Alpaca's ISO strings into absolute millisecond timestamps
    const earliestTimestampMS = new Date(alpacaTradesArray[0].Timestamp).getTime(); // 't' is Timestamp
    const latestTimestampMS = new Date(alpacaTradesArray[lastTradeIndex].Timestamp).getTime();

    // Calculate total seconds elapsed between the first and last printed trade inside the file
    const elapsedSecondsDistance = (latestTimestampMS - earliestTimestampMS) / 1000;

    // Defensive Cushion: If all trades occurred in the same second, default the window to 1.0 to prevent a Divide-by-Zero crash
    const trueActiveWindowSeconds = elapsedSecondsDistance > 0 ? elapsedSecondsDistance : 1.0;

    // 3. EXTRACT TRUE VELOCITY (Ticks Per Second)
    const exactTicksPerSecond = totalTicksCount / trueActiveWindowSeconds;

    return {
        // Enforce a strict one-decimal floating point for clean, stable UI rendering
        auditedTicksPerSecond: parseFloat(exactTicksPerSecond.toFixed(1)),
        auditedRollingVolume: totalVolumeAccumulated,
        lastTradePrice: parseFloat(latestTradePrice.toFixed(2)),
        hasDataFootprint: true
    };
}