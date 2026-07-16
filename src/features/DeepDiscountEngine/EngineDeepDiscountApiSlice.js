import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";
import { differenceInBusinessDays, isWeekend, isWithinInterval, set, getDay, isBefore, isToday, isAfter, previousFriday, subMinutes } from "date-fns";
import { toZonedTime } from 'date-fns-tz'
import { enginePlanAdapter, EnginePlanPlanApiSlice } from "../Engine/EnginePlanApiSlice";
import { appendDailyCandles, appendInterceptQuoteTick, appendInterceptTradeTick } from "./DeepDiscountLocalSlice";


const { getWebSocket, subscribe, unsubscribe, checkStreamAuthorization } = setupWebSocket();

// export const deepDiscountAdapter = createEntityAdapter({})
// export const enginePlanAdapter = createEntityAdapter({})


export const EngineDeepDiscountApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        populateInitialDeepDiscountEngine: builder.mutation({
            // async queryFn(args, api, extraOptions, baseQuery)
            // {
            //     const state = api.getState()

            //     const selectFirstQueryData = EnginePlanPlanApiSlice.endpoints.initiateEngineWithEnterExitPlan.select(undefined);
            //     const entityState = selectFirstQueryData(state).data.plans;

            //     if (!entityState || !entityState.entities[args.tickerSymbol]) { return { error: { status: 404, data: 'Entity data not found in cache.' } }; }

            //     const planEntity = entityState.entities[args.tickerSymbol];

            //     const result = await baseQuery({
            //         url: `/engine/deepDiscount`,
            //         params: {
            //             ticker: args.tickerSymbol,
            //             patternDate: planEntity.planConfig.relevantCandleDate
            //         }
            //     })

            //     if (result.error) { return { error: result.error } }


            //     let deepDiscount = {
            //         id: args.tickerSymbol,
            //         patternCandles: result.data,
            //         quotes: [],
            //         bidAskImbalance: 0,
            //         trades: []
            //     }
            //     return { data: deepDiscount }
            //     // return { data: deepDiscountAdapter.setOne(deepDiscountAdapter.getInitialState(), deepDiscount) }
            // },
            query: (arg) => ({
                url: `/engine/deepDiscount`,
                method: 'POST',
                body: {
                    ticker: arg.tickerSymbol,
                    patternDate: arg.relevantCandleDate
                }
            }),
            async onCacheEntryAdded(arg, { getState, updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch },)
            {
                // let streamingPriceBuffer = {};
                // let throttledUIUpdateClock = null;
                // let pennyVelocityTimestampsMap = {};

                let wsConnection = null;
                const userId = getState().auth.userId
                const ws = getWebSocket(userId, 'Deep Discount Initiate')

                const incomingQuoteListener = (data) =>
                {
                    const { Symbol, BidPrice, BidSize, AskPrice, AskSize, Timestamp } = data
                    const tickEpoch = new Date(Timestamp).getTime();
                    const currentSpreadWidth = parseFloat((AskPrice - BidPrice).toFixed(4));
                    const bidAskImbalance = AskSize > 0 ? parseFloat((BidSize / AskSize).toFixed(2)) : 1.0;


                    if (Symbol === arg.tickerSymbol) dispatch(appendInterceptQuoteTick({
                        tickerSymbol: arg.tickerSymbol,
                        currentSpread: currentSpreadWidth, tickEpoch, BidSize, BidPrice, AskSize, AskPrice
                    }));

                }

                const incomingTradeListener = (data) =>
                {

                    dispatch(appendInterceptTradeTick({ tickerSymbol: arg.tickerSymbol, trade: data.trade }))
                }

                try
                {
                    const resolvedResponse = await cacheDataLoaded

                    resolvedResponse.data && dispatch(appendDailyCandles({ tickerSymbol: arg.tickerSymbol, ...resolvedResponse.data }))
                    subscribe('quoteLivePrice', incomingQuoteListener, 'initialDeepDiscountPopulate')
                    subscribe('enterExitWatchListPrice', incomingTradeListener, 'initialDeepDiscountPopulate')
                } catch (error)
                {
                    await cacheEntryRemoved
                    unsubscribe('quoteLivePrice', incomingQuoteListener, userId, 'initialDeepDiscountPopulate')
                    unsubscribe('enterExitWatchListPrice', incomingTradeListener, userId, 'initialDeepDiscountPopulate')

                }

                await cacheEntryRemoved
                unsubscribe('quoteLivePrice', incomingQuoteListener, userId, 'initialDeepDiscountPopulate')
                unsubscribe('enterExitWatchListPrice', incomingTradeListener, userId, 'initialDeepDiscountPopulate')
            }
        }),
        fetchDeepDiscountEngineLiveData: builder.query({

        }),




        // fetchEngineCandleBarData: builder.query({
        //     query: (args) => ({
        //         url: `/engine/today/bars/${args.oneMinOrFivMinBars}`,
        //         validateStatus: (response, result) => { return response.status === 200 && !result.isError }
        //     }),
        //     async onQueryStarted(args, { dispatch, queryFulfilled })
        //     {
        //         try
        //         {
        //             const { data: freshCandleData } = await queryFulfilled;

        //             dispatch(EnginePlanPlanApiSlice.util.updateQueryData('initiateEngineWithEnterExitPlan', undefined, (draft) =>
        //             {
        //                 if (!draft) return
        //                 if (freshCandleData?.planData) Object.keys(freshCandleData.planData).forEach(symbol =>
        //                 {
        //                     const entityToUpdate = draft.plans.entities[symbol]

        //                     if (!draft.plans.entities[symbol]) return
        //                     let liveCandles = freshCandleData.planData[symbol]
        //                     if (!liveCandles || liveCandles.length === 0) return

        //                     const cleanCandlesToday = filterRegularSessionCandles(liveCandles)


        //                     draft.plans.entities[symbol].todaysCandles = cleanCandlesToday
        //                     let lastCandle = cleanCandlesToday[cleanCandlesToday.length - 1].ClosePrice
        //                     entityToUpdate.mostRecentPriceUpDown = lastCandle >= entityToUpdate.mostRecentPrice
        //                     entityToUpdate.mostRecentPrice = lastCandle

        //                     if (isBefore(new Date(), set(new Date(), { hours: 10, minutes: 30 })) || entityToUpdate.firstHourCandles.candles.length === 0)
        //                     {
        //                         console.log('updating the first hour candles')
        //                         let firstHourCandles = filterFirstHourSessionCandles(cleanCandlesToday)

        //                         let firstHourHigh = firstHourCandles[0].HighPrice
        //                         let firstHourLow = firstHourCandles[0].LowPrice
        //                         let firstHourVolume = 0

        //                         let peak = entityToUpdate.metricConfig.morningMetrics.upSide.averageTimeToPeak
        //                         let peakTime = set(new Date(), { hours: peak.hour, minutes: peak.minute })
        //                         let volumeToPeak = 0
        //                         let highToPeak = firstHourCandles[0].HighPrice
        //                         let lowToPeak = firstHourCandles[0].LowPrice

        //                         let bottom = entityToUpdate.metricConfig.morningMetrics.downSide.averageTimeToBottom
        //                         let bottomTime = isWeekend(new Date()) ?
        //                             previousFriday(set(new Date(), { hours: bottom.hour, minutes: bottom.minute })) :
        //                             set(new Date(), { hours: bottom.hour, minutes: bottom.minute })

        //                         let volumeToBottom = 0
        //                         let highToBottom = firstHourCandles[0].HighPrice
        //                         let lowToBottom = firstHourCandles[0].LowPrice

        //                         firstHourCandles.forEach((t) =>
        //                         {

        //                             if (t.LowPrice < firstHourLow) firstHourLow = t.LowPrice
        //                             if (t.HighPrice > firstHourHigh) firstHourHigh = t.HighPrice
        //                             firstHourVolume += t.Volume

        //                             if (isBefore(t.Timestamp, peakTime))
        //                             {
        //                                 volumeToPeak += t.Volume
        //                                 if (t.LowPrice > lowToPeak) lowToPeak = t.LowPrice
        //                                 if (t.HighPrice > highToPeak) highToPeak = t.HighPrice
        //                             }
        //                             if (isBefore(t.Timestamp, bottomTime))
        //                             {

        //                                 volumeToBottom += t.Volume
        //                                 if (t.LowPrice > lowToBottom) lowToBottom = t.LowPrice
        //                                 if (t.HighPrice > highToBottom) highToBottom = t.HighPrice
        //                             }
        //                         })

        //                         let candleUpdate = {
        //                             candles: firstHourCandles,
        //                             mostRecentCandle: firstHourCandles.at(-1),
        //                             metrics: { high: firstHourHigh, low: firstHourLow, volume: firstHourVolume },
        //                             peakMetrics: { high: highToPeak, low: lowToPeak, volumeToPeak, peakTime },
        //                             bottomMetrics: { high: highToBottom, low: lowToBottom, volumeToBottom, bottomTime },
        //                             mostRecentPrice: lastCandle
        //                         }
        //                         entityToUpdate.firstHourCandles = candleUpdate
        //                     }

        //                     if (draft.plans.entities[symbol].patternConfig.maintainLiveCandles || args.oneMinOrFivMinBars === 'regularSession')
        //                     {

        //                         draft.plans.entities[symbol].combinedCandleData = [...draft.plans.entities[symbol].historicCandle, ...cleanCandlesToday]
        //                     } else
        //                     {
        //                         let chunked5MinCandles = downSampleOneMinToFiveMin(cleanCandlesToday)
        //                         draft.plans.entities[symbol].combinedCandleData = [...draft.plans.entities[symbol].historicCandle, ...chunked5MinCandles]
        //                     }
        //                 })

        //                 if (freshCandleData?.macroData) Object.keys(freshCandleData.macroData).forEach(symbol =>
        //                 {
        //                     if (!draft.macros.entities[symbol]) return
        //                     let liveCandles = freshCandleData.macroData[symbol]
        //                     if (!liveCandles || liveCandles.length === 0) return

        //                     const cleanCandlesToday = filterRegularSessionCandles(liveCandles)
        //                     draft.macros.entities[symbol].todaysCandles = cleanCandlesToday

        //                     const compiled5MinCandles = downSampleOneMinToFiveMin(cleanCandlesToday)
        //                     let combinedCandleData = [...(draft.macros.entities[symbol].historicCandle || []), ...compiled5MinCandles]
        //                     draft.macros.entities[symbol].combinedCandleData = combinedCandleData

        //                     const updatedMACDMetrics = calculateMacroThirtyMinMacd(combinedCandleData)

        //                     draft.macros.entities[symbol].macroTideSentry = {
        //                         ...draft.macros.entities[symbol].macroTideSentry,
        //                         macdLine: updatedMACDMetrics.macdLine,
        //                         signalLine: updatedMACDMetrics.signalLine,
        //                         histogram: updatedMACDMetrics.histogram,
        //                         isHistogramGrowingBearish: updatedMACDMetrics.isHistogramGrowingBearish,
        //                     }
        //                 })
        //             }))

        //         } catch (error)
        //         {
        //             console.log(error)
        //         }
        //     }
        // }),
        // fetchEngineOneMinCandleBarData: builder.query({
        //     query: (args) => ({
        //         url: `/engine/today/bars/regularSession/minute`,
        //         validateStatus: (response, result) => { return response.status === 200 && !result.isError }
        //     }),
        //     async onQueryStarted(args, { dispatch, queryFulfilled })
        //     {
        //         try
        //         {
        //             const { data: freshCandleData } = await queryFulfilled;
        //             dispatch(EnginePlanPlanApiSlice.util.updateQueryData('initiateEngineWithEnterExitPlan', undefined, (draft) =>
        //             {
        //                 if (!draft) return
        //                 if (freshCandleData?.planData) Object.keys(freshCandleData.planData).forEach(symbol =>
        //                 {
        //                     const entityToUpdate = draft.plans.entities[symbol]
        //                     if (!entityToUpdate) return


        //                     let liveCandles = freshCandleData.planData[symbol]
        //                     if (!liveCandles || liveCandles.length === 0) return
        //                     const cleanCandlesToday = filterRegularSessionCandles(liveCandles)

        //                     if (cleanCandlesToday.length === 0) return
        //                     let lastCandle = cleanCandlesToday[cleanCandlesToday.length - 1].ClosePrice


        //                     entityToUpdate.mostRecentPriceUpDown = lastCandle >= draft.mostRecentPrice
        //                     entityToUpdate.mostRecentPrice = lastCandle

        //                     if (isAfter(new Date(), set(new Date(), { hours: 10, minutes: 30 })) &&
        //                         entityToUpdate.firstHourCandles.candles.length === 0)
        //                     {
        //                         let firstHourCandles = filterFirstHourSessionCandles(cleanCandlesToday)


        //                         let firstHourHigh = firstHourCandles[0].HighPrice
        //                         let firstHourLow = firstHourCandles[0].LowPrice
        //                         let firstHourVolume = 0

        //                         let peak = entityToUpdate.metricConfig.morningMetrics.upSide.averageTimeToPeak
        //                         let peakTime = set(new Date(), { hours: peak.hour, minutes: peak.minute })
        //                         let volumeToPeak = 0
        //                         let highToPeak = firstHourCandles[0].HighPrice
        //                         let lowToPeak = firstHourCandles[0].LowPrice

        //                         let bottom = entityToUpdate.metricConfig.morningMetrics.downSide.averageTimeToBottom
        //                         let bottomTime = isWeekend(new Date()) ?
        //                             previousFriday(set(new Date(), { hours: bottom.hour, minutes: bottom.minute })) :
        //                             set(new Date(), { hours: bottom.hour, minutes: bottom.minute })

        //                         let volumeToBottom = 0
        //                         let highToBottom = firstHourCandles[0].HighPrice
        //                         let lowToBottom = firstHourCandles[0].LowPrice

        //                         firstHourCandles.forEach((t) =>
        //                         {
        //                             if (t.LowPrice < firstHourLow) firstHourLow = t.LowPrice
        //                             if (t.HighPrice > firstHourHigh) firstHourHigh = t.HighPrice
        //                             firstHourVolume += t.Volume

        //                             if (isBefore(t.Timestamp, peakTime))
        //                             {
        //                                 volumeToPeak += t.Volume
        //                                 if (t.LowPrice > lowToPeak) lowToPeak = t.LowPrice
        //                                 if (t.HighPrice > highToPeak) highToPeak = t.HighPrice
        //                             }
        //                             if (isBefore(t.Timestamp, bottomTime))
        //                             {

        //                                 volumeToBottom += t.Volume
        //                                 if (t.LowPrice > lowToBottom) lowToBottom = t.LowPrice
        //                                 if (t.HighPrice > highToBottom) highToBottom = t.HighPrice
        //                             }
        //                         })

        //                         let candleUpdate = {
        //                             candles: firstHourCandles,
        //                             mostRecentCandle: firstHourCandles.at(-1),
        //                             metrics: {
        //                                 high: firstHourHigh,
        //                                 low: firstHourLow,
        //                                 volume: firstHourVolume
        //                             },
        //                             peakMetrics: {
        //                                 high: highToPeak,
        //                                 low: lowToPeak,
        //                                 volumeToPeak,
        //                                 peakTime
        //                             },
        //                             bottomMetrics: {
        //                                 high: highToBottom,
        //                                 low: lowToBottom,
        //                                 volumeToBottom,
        //                                 bottomTime
        //                             },
        //                             mostRecentPrice: lastCandle
        //                         }
        //                         entityToUpdate.firstHourCandles = candleUpdate
        //                     }


        //                     draft.plans.entities[symbol].todaysCandles = cleanCandlesToday
        //                     draft.plans.entities[symbol].combinedCandleData = [...draft.plans.entities[symbol].historicCandle, ...cleanCandlesToday]
        //                 })

        //                 if (freshCandleData?.macroData) Object.keys(freshCandleData.macroData).forEach(symbol =>
        //                 {
        //                     if (!draft.macros.entities[symbol]) return

        //                     let liveCandles = freshCandleData.macroData[symbol]
        //                     if (!liveCandles || liveCandles.length === 0) return
        //                     const cleanCandlesToday = filterRegularSessionCandles(liveCandles)
        //                     draft.macros.entities[symbol].todaysCandles = cleanCandlesToday

        //                     const compiled5MinCandles = downSampleOneMinToFiveMin(cleanCandlesToday)
        //                     let combinedCandleData = [...(draft.macros.entities[symbol].historicCandle || []), ...compiled5MinCandles]
        //                     draft.macros.entities[symbol].combinedCandleData = combinedCandleData

        //                     const updatedMACDMetrics = calculateMacroThirtyMinMacd(combinedCandleData)

        //                     draft.macros.entities[symbol].macroTideSentry = {
        //                         ...draft.macros.entities[symbol].macroTideSentry,
        //                         macdLine: updatedMACDMetrics.macdLine,
        //                         signalLine: updatedMACDMetrics.signalLine,
        //                         histogram: updatedMACDMetrics.histogram,
        //                         isHistogramGrowingBearish: updatedMACDMetrics.isHistogramGrowingBearish,
        //                     }
        //                 })
        //             }))

        //         } catch (error)
        //         {
        //             console.log(error)
        //         }
        //     }
        // }),
        // fetchEngineTradeData: builder.query({
        //     query: () => ({
        //         url: `/engine/today/trades`,
        //         validateStatus: (response, result) => { return response.status === 200 && !result.isError }
        //     }),
        //     async onQueryStarted(args, { dispatch, queryFulfilled })
        //     {
        //         try
        //         {
        //             const { data: freshTradeData } = await queryFulfilled;

        //             dispatch(EnginePlanPlanApiSlice.util.updateQueryData('initiateEngineWithEnterExitPlan', undefined, (draft) =>
        //             {
        //                 if (!draft) return
        //                 if (freshTradeData?.tradeData) Object.keys(freshTradeData.tradeData).forEach(symbol =>
        //                 {
        //                     if (!draft.plans.entities[symbol]) return
        //                     let tradeData = freshTradeData.tradeData[symbol]
        //                     if (!tradeData || tradeData.length === 0) return
        //                     draft.plans.entities[symbol].tradeTapeConfig.liveTapeMetrics = processAuthoritativeTradesArray(tradeData)
        //                 })
        //             }))

        //         } catch (error)
        //         {
        //             console.log(error)
        //         }
        //     }
        // }),
        // fetchEngineOpenCrossData: builder.query({
        //     query: () => ({
        //         url: `/engine/today/openCross`,
        //         validateStatus: (response, result) => { return response.status === 200 && !result.isError }
        //     }),
        //     async onQueryStarted(args, { dispatch, queryFulfilled })
        //     {
        //         try
        //         {
        //             const { data: freshOpenCrosses } = await queryFulfilled;
        //             dispatch(EnginePlanPlanApiSlice.util.updateQueryData('initiateEngineWithEnterExitPlan', undefined, (draft) =>
        //             {
        //                 if (!draft) return
        //                 freshOpenCrosses.planAndTrackedStocks.map((t, i) =>
        //                 {
        //                     if (!draft.plans.entities[t.tickerSymbol]) return
        //                     draft.plans.entities[t.tickerSymbol].metricConfig.openCross = t.openCrossMetrics
        //                 })
        //             }))
        //         } catch (error)
        //         {
        //             console.log(error)
        //         }
        //     }
        // })
    })
});

export const {
    usePopulateInitialDeepDiscountEngineQuery,
    useFetchDeepDiscountEngineLiveDataQuery
} = EngineDeepDiscountApiSlice;

// export const deepDiscountSelectors = deepDiscountAdapter.getSelectors()

// const selectHistoricalQueryCache = EngineDeepDiscountApiSlice.endpoints.populateInitialDeepDiscountEngine.select()
// const selectApiCacheData = createSelector([selectHistoricalQueryCache], (queryResult) => queryResult.data);
// const deepDiscountSelectors = deepDiscountAdapter.getSelectors((state) => selectApiCacheData(state) || deepDiscountAdapter.getInitialState());

// export const selectDeepDiscountQuotesByTicker = createSelector(
//     [deepDiscountSelectors.selectEntities, (state, symbol) => symbol],
//     (deepDiscountEntities, symbol) =>
//     {
//         console.log(deepDiscountEntities)
//         const planEntity = deepDiscountEntities[symbol]
//         if (!planEntity) return {}

//         return planEntity
//     }
// )


// const selectHistoricalQueryCache = EnginePlanPlanApiSlice.endpoints.initiateEngineWithEnterExitPlan.select()
// const selectApiCacheData = createSelector([selectHistoricalQueryCache], (queryResult) => queryResult.data);
// const planSelectors = enginePlanAdapter.getSelectors((state) => selectApiCacheData(state)?.plans || enginePlanAdapter.getInitialState());
// const macroSelectors = engineMacroAdapter.getSelectors((state) => selectApiCacheData(state)?.macros || engineMacroAdapter.getInitialState());

// export const selectPlansMacroCorrelations = createSelector(
//     [macroSelectors.selectEntities, (state, symbol) => symbol],
//     (macroEntities, symbol) =>
//     {
//         return macroEntities[symbol] || {}

//     }
// )
// export const selectPrioritizedWatchlist = createSelector(
//     [planSelectors.selectIds, planSelectors.selectEntities, macroSelectors.selectIds, macroSelectors.selectEntities],
//     (stockIds, stockEntities, macroIds, macroEntities) =>
//     {
//         if (stockIds.length === 0) return [];

//         const liveSpyPlan = macroEntities['SPY']
//         const liveRSPPlan = macroEntities['RSP']

//         const scoredWatchlistArray = stockIds.map(id =>
//         {
//             const planEntity = stockEntities[id]; if (!planEntity) return null;

//             let liveSectorPlan = macroEntities[sectorToTicker[planEntity.planConfig.sector]]
//             const centralScoreProfile = calculateCentralPlanScore(planEntity, liveSpyPlan, liveRSPPlan, liveSectorPlan, false);

//             return {
//                 tickerSymbol: planEntity.id,
//                 mostRecentPrice: planEntity.mostRecentPrice,
//                 industry: planEntity.stockInfo?.Industry,
//                 patternClassification: planEntity.patternConfig.patternClassification,
//                 sector: planEntity.planConfig.sector,
//                 alphaConvictionScore: centralScoreProfile.matchScorePercent,
//                 executionStatus: centralScoreProfile.status,
//                 withinPlan: centralScoreProfile.viableTrade,
//                 insideStrike: centralScoreProfile.insideStrike,
//                 livePriceMetrics: centralScoreProfile.metrics
//             };
//         }).filter(Boolean);



//         const HIGH_CONVICTION_THRESHOLD = 75;
//         // =========================================================================
//         // ⚔️ THE HIGH-CONVICTION THRESHOLD THRESHOLD SORTING ENGINE
//         // =========================================================================
//         return scoredWatchlistArray.sort((a, b) =>
//         {
//             const aIsHigh = a.alphaConvictionScore >= HIGH_CONVICTION_THRESHOLD;
//             const bIsHigh = b.alphaConvictionScore >= HIGH_CONVICTION_THRESHOLD;

//             // ─────────────────────────────────────────────────────────────────
//             // CRITICAL TIER 1: HIGH CONVICTION ZONE SEGREGATION
//             // ─────────────────────────────────────────────────────────────────
//             if (bIsHigh && !aIsHigh) return 1;
//             if (!bIsHigh && aIsHigh) return -1;


//             // ─────────────────────────────────────────────────────────────────
//             // CRITICAL TIER 2: INSIDE THE ELITE HIGH-CONVICTION BLOCK
//             // ─────────────────────────────────────────────────────────────────
//             // If BOTH plans are high conviction, sort them PURELY by dollar payout!
//             if (bIsHigh && aIsHigh)
//             {
//                 const rewardA = a.positionPricingMetrics?.rewardDollarAllocation || 0;
//                 const rewardB = b.positionPricingMetrics?.rewardDollarAllocation || 0;

//                 // Sort by the largest absolute dollar reward potential on a $1,000 position
//                 if (rewardB !== rewardA) { return rewardB - rewardA; }

//                 // Tie-breaker: If payouts are identical, select the item with the smaller dollar risk
//                 const riskA = a.positionPricingMetrics?.riskDollarAllocation || 0;
//                 const riskB = b.positionPricingMetrics?.riskDollarAllocation || 0;
//                 return riskA - riskB;
//             }
//             // ─────────────────────────────────────────────────────────────────
//             // CRITICAL TIER 3: INSIDE THE OBSERVER RADAR BLOCK (SCORE < 75)
//             // ─────────────────────────────────────────────────────────────────
//             // If neither plan is high conviction, sort them traditionally by score hierarchy
//             if (b.alphaConvictionScore !== a.alphaConvictionScore) { return b.alphaConvictionScore - a.alphaConvictionScore; }

//             // Off-target standby cards (RADAR_STANDBY) hold null metrics; push them to the absolute bottom
//             const metricsA = a.positionPricingMetrics;
//             const metricsB = b.positionPricingMetrics;
//             if (!metricsA && metricsB) return 1;
//             if (metricsA && !metricsB) return -1;

//             // Score-tie fallback: Order by basic remaining reward potential
//             const rewardA = metricsA?.rewardDollarAllocation || 0;
//             const rewardB = metricsB?.rewardDollarAllocation || 0;
//             return rewardB - rewardA;
//         }
//         );
//     })
// export const selectScoreBySymbol = createSelector(
//     [selectPrioritizedWatchlist, (state, symbol) => symbol],
//     (prioritizedWatchlist, symbol) =>
//     {
//         const targetedPlan = prioritizedWatchlist.find(item => item.tickerSymbol === symbol);
//         return targetedPlan || { alphaConvictionScore: 0, executionStatus: "OFF_RADAR", livePrice: 0.00 };
//     }
// );
// export const selectDetailedScoreBreakDownBySymbol = createSelector(
//     [planSelectors.selectEntities, macroSelectors.selectEntities, (state, symbol) => symbol],
//     (stockEntities, macroEntities, symbol) =>
//     {
//         const planEntity = stockEntities[symbol]
//         if (!planEntity) return {}

//         const liveSpyPlan = macroEntities['SPY']
//         const liveRSPPlan = macroEntities['RSP']
//         const liveSectorPlan = macroEntities[sectorToTicker[planEntity.planConfig.sector]]

//         const centralScoreProfile = calculateCentralPlanScore(planEntity, liveSpyPlan, liveRSPPlan, liveSectorPlan, true);

//         return {
//             mostRecentPrice: planEntity.mostRecentPrice,
//             mostRecentPriceUpDown: planEntity.mostRecentPriceUpDown,
//             centralScoreProfile
//         }
//     }
// );
// export const selectLastCandleByTicker = createSelector(
//     [planSelectors.selectEntities, (state, symbol) => symbol],
//     (stockEntities, symbol) =>
//     {
//         const planEntity = stockEntities[symbol]
//         if (!planEntity) return {}

//         const todaysCandlesLength = planEntity.todaysCandles.length
//         if (todaysCandlesLength === 0) return {}

//         return planEntity.todaysCandles[todaysCandlesLength - 1]
//     }
// )
// export const makeSelectPlansFirstHourCandlesByTicker = () =>
// {

//     return createSelector(
//         [planSelectors.selectEntities, (state, symbol) => symbol],
//         (stockEntities, symbol) =>
//         {
//             const planEntity = stockEntities[symbol]
//             if (!planEntity) return {}
//             if (isAfter(new Date(), set(new Date(), { hours: 10, minutes: 30 })))
//             {
//                 return { ...planEntity.firstHourCandles }

//             } else
//             {
//                 return planEntity.firstHourCandles
//             }
//         }
//     )
// }
// export const selectCombinedCandlesByTicker = createSelector(
//     [planSelectors.selectEntities, (state, symbol) => symbol],
//     (stockEntities, symbol) =>
//     {
//         const planEntity = stockEntities[symbol]
//         if (!planEntity) return []
//         return planEntity.combinedCandleData
//     }
// )
// export const selectTodaysCandlesByTicker = createSelector(
//     [planSelectors.selectEntities, (state, symbol) => symbol],
//     (stockEntities, symbol) =>
//     {
//         const planEntity = stockEntities[symbol]
//         if (!planEntity) return []
//         return planEntity.todaysCandles
//     }
// )
// export const selectDeepDiscountByReviewedStatus = createSelector(

//     [planSelectors.selectAll, (state, onlyNonReviewedPlans) => onlyNonReviewedPlans],
//     (stockEntities, onlyNonReviewedPlans) =>
//     {
//         if (onlyNonReviewedPlans) return stockEntities.filter(t => !t.discountConfig.isReviewed).map(t => { return { id: t.id, reviewed: t.discountConfig.isReviewed } })
//         else return stockEntities.map(t => { return { id: t.id, reviewed: t.discountConfig.isReviewed } })
//     }
// )
// const selectTickerSymbolParam = (_, tickerSymbol) => tickerSymbol
// export const selectPlanForStaticDetails = () =>
// {
//     return createSelector(
//         [planSelectors.selectEntities, selectTickerSymbolParam],
//         (stockEntities, symbol) =>
//         {
//             const planEntity = stockEntities[symbol]
//             if (!planEntity) return null

//             return {
//                 id: planEntity.id,
//                 planConfig: planEntity.planConfig,
//                 patternConfig: planEntity.patternConfig,
//                 metricConfig: planEntity.metricConfig,
//                 stockInfo: planEntity.stockInfo,
//                 optionsConfig: planEntity.optionsConfig,
//                 snapShot: planEntity.snapShot,
//                 discountConfig: planEntity.discountConfig
//             }
//         }
//     )
// }
// export const selectPlanAndPatternChartingBySymbol = createSelector(
//     [planSelectors.selectEntities, (state, symbol) => symbol],
//     (stockEntities, symbol) =>
//     {
//         const planEntity = stockEntities[symbol]
//         let lowestHour = undefined
//         if (planEntity?.metricConfig.volumeDistribution.fiveMinAvgLowestVolume.oneHourLowestVolume)
//         {
//             let timeString = planEntity?.metricConfig.volumeDistribution.fiveMinAvgLowestVolume.oneHourLowestVolume
//             const [startTime, endTime] = timeString.split(' to ');
//             const today = new Date().toDateString();
//             lowestHour = { start: new Date(`${today} ${startTime}`), end: new Date(`${today} ${endTime}`) };
//         }

//         const currentDayCandles = isToday(planEntity?.currentPriceStats.snapShot.DailyBar.Timestamp)
//         return {
//             pattern: planEntity?.patternConfig || undefined,
//             plan: planEntity?.planConfig.plan || undefined,
//             options: planEntity?.optionsConfig || undefined,

//             lowestHour,
//             supportResistance: planEntity?.metricConfig.vpSupportResistance || undefined,
//             dailyCalculatedValues: planEntity?.planConfig.dailyCalculatedValues ? {
//                 ema9: planEntity?.planConfig.dailyCalculatedValues.ema9,
//                 ema50: planEntity?.planConfig.dailyCalculatedValues.ema50,
//                 ema200: planEntity?.planConfig.dailyCalculatedValues.ema200,
//                 atr: planEntity?.planConfig.dailyCalculatedValues.atr
//             } : undefined,
//             snapShot: planEntity?.currentPriceStats.snapShot ? {
//                 yesterday: currentDayCandles ? planEntity?.currentPriceStats.snapShot.PrevDailyBar : planEntity?.currentPriceStats.snapShot.DailyBar,
//                 today: currentDayCandles ? planEntity?.currentPriceStats.snapShot.DailyBar : undefined
//             } : undefined
//         }
//     }

// )

