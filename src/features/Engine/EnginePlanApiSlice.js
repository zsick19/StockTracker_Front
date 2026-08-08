import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";
import { differenceInBusinessDays, isWeekend, isWithinInterval, set, getDay, isBefore, isToday, isAfter, previousFriday } from "date-fns";
import { toZonedTime } from 'date-fns-tz'

import { filterFirstHourSessionCandles, filterRegularSessionCandles } from "./RootCalculations/filterRegularSessionCandles";
import { calculateMacroThirtyMinMacd } from "./RootCalculations/macro30MinMACD";
import { compileHistoricalOneMinPennyBaselines } from "./RootCalculations/HistoricalCandleAnalytics/pennyStockPatternAnalytics";
import { compileHistoricalStandardChannelBaselines } from "./RootCalculations/HistoricalCandleAnalytics/horizontalChannelAnalytics";
import { compileHistoricalFiveMinCascadeBaselines } from "./RootCalculations/HistoricalCandleAnalytics/cascadePatternAnalytics";
import { compileHistoricalContinuationBaselines } from "./RootCalculations/HistoricalCandleAnalytics/continuationPatternAnalytics";

import { calculateCentralPlanScore } from "./RootCalculations/masterPrioritizer";
import { processAuthoritativeTradesArray } from "./RootCalculations/TradeBookAnalytics/processAuthoritativeTrade";
import { defaultSectors, macroAndSectorTickers, sectorToTicker } from "../../Utilities/SectorsAndIndustries";
import { symbol } from "d3";
import { compileThreeTierPennyResistance } from "./RootCalculations/HistoricalCandleAnalytics/compilePennyStockOverheadResistance";
import { compileThreeTierOverheadResistance } from "./RootCalculations/HistoricalCandleAnalytics/compileOverheadResistance";
import { downSampleOneMinToFiveMin, preSetDailyTimes } from "../../Utilities/TimeFrames";
import { updateStreamMostRecent } from "../Initializations/StreamMostRecentSlice";


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
                const sectorExposure = Object.fromEntries(defaultSectors.map(item => [`${item}`, 0]))
                let industryExposure = Object.fromEntries(defaultSectors.map(item => [`${item}`, {}]))
                let totalPlans = 0

                let activeTrades = []
                let planResults = []
                const positionBreakDown = Object.fromEntries(defaultSectors.map(item => [`${item}`, 0]))

                if (responseData?.plans) planResults = responseData.plans.filter(t => t.plan?.patternClassification !== undefined).map((enterExit) =>
                {



                    if (enterExit.plan.stockId)
                    {
                        totalPlans += 1
                        sectorExposure[enterExit.plan.stockId.Sector] += 1
                        industryExposure[enterExit.plan.stockId.Sector][enterExit.plan.stockId.Industry] =
                            (industryExposure[enterExit.plan.stockId.Sector][enterExit.plan.stockId.Industry] ?? 0) + 1
                    }








                    let filteredCandles = filterRegularSessionCandles(enterExit.candleData)
                    let regularSessionCandles = filteredCandles.regularSession
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
                    patternConfig.maintainLiveCandles = enterExit.plan?.maintainLiveCandles || false
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
                    planConfig.spyBetaValue = enterExit.plan.dailyTickerValues.spyBetaValue || 1
                    planConfig.dailyCalculatedValues = enterExit.plan.dailyTickerValues
                    planConfig.planId = enterExit.plan._id
                    planConfig.backTestedValues = {
                        entryPrice: enterExit.plan.relevantDateBackTests,
                        floorPrice: enterExit.plan.relevantDateBackTestsUsingFloor
                    }
                    planConfig.datesLastCalculated = {
                        morningMetrics: enterExit.plan.dateMorningMetricsLastCalculated,
                        volumeProfileMetrics: enterExit.plan.dateVolumeProfileLastCalculated,
                        absorptionWindow: enterExit.plan.dateAbsorptionWindowLastCalculated,
                        options: enterExit.plan.dateOptionsEMLastCalculated,
                        pattern: enterExit.plan.datePatternLastCalculated,
                        retailVsInstitution: enterExit.plan.dateRvILastCalculated
                    }

                    let activeTradeConfig = undefined
                    if (enterExit.plan.activeTradeId)
                    {

                        activeTradeConfig = enterExit.plan.activeTradeId


                        let totalMarketValue = 0
                        enterExit.plan.activeTradeId.purchaseRecords.forEach((t) =>
                        {
                            totalMarketValue += (t.sharesRemaining * t.purchasePrice)
                        })

                        positionBreakDown[enterExit.plan.stockId.Sector] += totalMarketValue
                        activeTrades.push({ ...enterExit.plan.activeTradeId, snapShot: enterExit.snapShot })
                    }




                    let metricConfig = {}
                    metricConfig.extentProb = enterExit.plan.extentProb
                    metricConfig.morningMetrics = enterExit.plan.morningMetrics
                    metricConfig.morningVolume = enterExit.plan.morningVolumeMetrics
                    metricConfig.extremeProbByFiveMin = enterExit.plan.extremeProbByFiveMin
                    metricConfig.vpSupportResistance = enterExit.plan.volumeProfileMetrics
                    metricConfig.absorptionWindow = enterExit.plan.absorptionWindowMetrics
                    metricConfig.retailVsInstitution = enterExit.plan.retailVsInstitutionMetrics
                    metricConfig.volumeDistribution = enterExit.plan.volumeDistributionMetrics
                    metricConfig.openCross = enterExit.plan.openCrossMetrics
                    if (isBefore(new Date(), set(new Date(), { hours: 9, minutes: 4 }))) metricConfig.openCross.todaysOpenCross = undefined


                    let currentPriceStats = {}
                    let mostRecentPrice = enterExit.snapShot.LatestTrade.Price
                    currentPriceStats.snapShot = enterExit.snapShot
                    currentPriceStats.dailyBar = enterExit.snapShot.DailyBar
                    currentPriceStats.prevDailyBar = enterExit.snapShot.PrevDailyBar

                    currentPriceStats.yesterdayClose = enterExit.snapShot.PrevDailyBar.ClosePrice
                    currentPriceStats.changeFromYesterdayClose = mostRecentPrice - currentPriceStats.yesterdayClose

                    let optionsConfig = {}
                    optionsConfig = enterExit.plan?.optionsExpectedMoves || undefined




                    let discountConfig = {}
                    discountConfig.isReviewed = enterExit.plan.deepDiscounts?.dateReviewed ?
                        differenceInBusinessDays(new Date(), enterExit.plan.deepDiscounts?.dateReviewed) < 5 ? true : false : false

                    discountConfig.aboveStopLoss = enterExit.plan?.deepDiscounts?.aboveStopLoss
                    discountConfig.belowStopLoss = enterExit.plan?.deepDiscounts?.belowStopLoss
                    discountConfig.aboveMaxPain = enterExit.plan?.deepDiscounts?.aboveMaxPain

                    discountConfig.dateReviewed = enterExit.plan.deepDiscounts?.dateReviewed

                    discountConfig.prices = [enterExit.plan?.deepDiscounts?.aboveStopLoss?.price || 0,
                    enterExit.plan?.deepDiscounts?.belowStopLoss?.price || 0,
                    enterExit.plan?.deepDiscounts?.aboveMaxPain?.price || 0
                    ]

                    discountConfig.includesDiscount = Math.max(...discountConfig.prices)
                    //provides 0 for no discounts set or the first discount to compare a live price against



                    let tradeTapeConfig = {}
                    if (enterExit.tradeData) tradeTapeConfig.liveTapeMetrics = processAuthoritativeTradesArray(enterExit.tradeData)
                    else tradeTapeConfig.liveTapeMetrics = undefined

                    let firstHourCandles = {
                        candles: [],
                        metrics: {
                            high: undefined,
                            low: undefined,
                            volume: undefined
                        },
                        peakMetrics: {
                            high: undefined,
                            volumeToPeak: undefined
                        },
                        bottomMetrics: {
                            low: undefined,
                            volumeToBottom: undefined
                        },
                        mostRecentCandle: { ClosePrice: enterExit.snapShot.LatestTrade.Price }
                    }

                    return {
                        id: enterExit.plan.tickerSymbol,
                        stockInfo: enterExit.plan.stockId,
                        mostRecentPrice,
                        mostRecentPriceUpDown: undefined,
                        highImportance: enterExit.plan?.highImportance || undefined,
                        planConfig,

                        patternConfig,
                        activeTradeConfig,
                        optionsConfig,
                        metricConfig,
                        discountConfig,
                        tradeTapeConfig,
                        currentPriceStats,
                        historicCandle: regularSessionCandles,
                        firstHourCandles,
                        todaysCandles: [],
                        preMarketCandles: [],
                        combinedCandleData: regularSessionCandles,
                        snapShot: enterExit.snapShot,
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


                let macroResults = []
                if (responseData?.macros) macroResults = responseData.macros.map((macroPlan) =>
                {
                    let filteredCandles = filterRegularSessionCandles(macroPlan.candleData)
                    let regularSessionCandles = filteredCandles.regularSession
                    let computedMACDMetrics = calculateMacroThirtyMinMacd(regularSessionCandles)
                    let macroPlanData = macroPlan.macroPlan

                    return {
                        id: macroPlanData.tickerSymbol,
                        planData: macroPlanData,
                        historicCandle: regularSessionCandles,
                        todaysCandles: [],
                        preMarketCandles: [],
                        combinedCandleData: regularSessionCandles,
                        macroTideSentry: {
                            macdLine: computedMACDMetrics.macdLine,
                            signalLine: computedMACDMetrics.signalLine,
                            histogram: computedMACDMetrics.histogram,
                            isHistogramGrowingBearish: computedMACDMetrics.isHistogramGrowingBearish,
                            lastPrice: regularSessionCandles.length > 0 ? regularSessionCandles.at(-1).ClosePrice : 0.00
                        },
                        snapShot: macroPlan.snapShot,
                        mostRecentPrice: macroPlan.snapShot.LatestTrade.Price
                    }
                })


                return {
                    plans: enginePlanAdapter.setAll(enginePlanAdapter.getInitialState(), planResults),
                    macros: engineMacroAdapter.setAll(engineMacroAdapter.getInitialState(), macroResults),
                    trades: activeTrades,
                    exposureResults: { sectorExposure, industryExposure, totalPlans, positionBreakDown }
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
                        dispatch(updateStreamMostRecent({ ticker: data.tickerSymbol, price: data.trade.Price }))
                        // --- PATH A: THE REAL-TIME PRICE PATCH (ALL ASSETS) ---
                        let currentPrice = parseFloat(data.trade.Price)
                        streamingPriceBuffer[data.tickerSymbol] = currentPrice


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

                                    let price = streamingPriceBuffer[symbol]

                                    activePlan.liveAuctionMetrics = { ...activePlan.liveAuctionMetrics, lastTradePrice: price };
                                    activePlan.mostRecentPriceUpDown = price >= activePlan.mostRecentPrice
                                    activePlan.mostRecentPrice = price
                                    activePlan.firstHourCandles.mostRecentPrice = price
                                    activePlan.currentPriceStats.changeFromYesterdayClose = price - activePlan.currentPriceStats.yesterdayClose

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
                        }, 3000)
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
                    }, 3000);
                }


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
                            const entityToUpdate = draft.plans.entities[symbol]

                            if (!draft.plans.entities[symbol]) return
                            let liveCandles = freshCandleData.planData[symbol]
                            if (!liveCandles || liveCandles.length === 0) return

                            const filteredCandles = filterRegularSessionCandles(liveCandles)

                            entityToUpdate.preMarketCandles = filteredCandles.preMarket
                            const cleanCandlesToday = filteredCandles.regularSession
                            if (cleanCandlesToday.length === 0) return

                            draft.plans.entities[symbol].todaysCandles = cleanCandlesToday
                            let lastCandle = cleanCandlesToday[cleanCandlesToday.length - 1].ClosePrice
                            entityToUpdate.mostRecentPriceUpDown = lastCandle >= entityToUpdate.mostRecentPrice
                            entityToUpdate.mostRecentPrice = lastCandle


                            if (isBefore(new Date(), preSetDailyTimes.firstHour) || entityToUpdate.firstHourCandles.candles.length === 0)
                            {
                                let firstHourCandles = filterFirstHourSessionCandles(cleanCandlesToday)
                                let firstHourHigh = firstHourCandles[0]?.HighPrice || 0
                                let firstHourLow = firstHourCandles[0]?.LowPrice || 0
                                let firstHourVolume = 0

                                let peak = entityToUpdate.metricConfig.morningMetrics.upSide.averageTimeToPeak
                                let peakTime = set(new Date(), { hours: peak.hour, minutes: peak.minute })
                                let volumeToPeak = 0
                                let highToPeak = firstHourCandles[0]?.HighPrice || 0
                                let lowToPeak = firstHourCandles[0]?.LowPrice || 0

                                let bottom = entityToUpdate.metricConfig.morningMetrics.downSide.averageTimeToBottom
                                let bottomTime = isWeekend(new Date()) ?
                                    previousFriday(set(new Date(), { hours: bottom.hour, minutes: bottom.minute })) :
                                    set(new Date(), { hours: bottom.hour, minutes: bottom.minute })

                                let volumeToBottom = 0
                                let highToBottom = firstHourCandles[0]?.HighPrice || 0
                                let lowToBottom = firstHourCandles[0]?.LowPrice || 0

                                firstHourCandles.forEach((t) =>
                                {

                                    if (t.LowPrice < firstHourLow) firstHourLow = t.LowPrice
                                    if (t.HighPrice > firstHourHigh) firstHourHigh = t.HighPrice
                                    firstHourVolume += t.Volume

                                    if (isBefore(t.Timestamp, peakTime))
                                    {
                                        volumeToPeak += t.Volume
                                        if (t.LowPrice > lowToPeak) lowToPeak = t.LowPrice
                                        if (t.HighPrice > highToPeak) highToPeak = t.HighPrice
                                    }
                                    if (isBefore(t.Timestamp, bottomTime))
                                    {

                                        volumeToBottom += t.Volume
                                        if (t.LowPrice > lowToBottom) lowToBottom = t.LowPrice
                                        if (t.HighPrice > highToBottom) highToBottom = t.HighPrice
                                    }
                                })

                                let candleUpdate = {
                                    candles: firstHourCandles,
                                    mostRecentCandle: firstHourCandles.at(-1),
                                    metrics: { high: firstHourHigh, low: firstHourLow, volume: firstHourVolume },
                                    peakMetrics: { high: highToPeak, low: lowToPeak, volumeToPeak, peakTime },
                                    bottomMetrics: { high: highToBottom, low: lowToBottom, volumeToBottom, bottomTime },
                                    mostRecentPrice: lastCandle
                                }
                                entityToUpdate.firstHourCandles = candleUpdate

                            }

                            if (draft.plans.entities[symbol].patternConfig.maintainLiveCandles || args.oneMinOrFivMinBars === 'openingSession')
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

                            const filteredCandles = filterRegularSessionCandles(liveCandles)
                            const cleanCandlesToday = filteredCandles.regularSession
                            draft.macros.entities[symbol].todaysCandles = cleanCandlesToday
                            draft.macros.entities[symbol].preMarketCandles = filteredCandles.preMarket

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
                            const entityToUpdate = draft.plans.entities[symbol]
                            if (!entityToUpdate) return

                            let liveCandles = freshCandleData.planData[symbol]
                            if (!liveCandles || liveCandles.length === 0) return

                            let filteredCandles = filterRegularSessionCandles(liveCandles)
                            const cleanCandlesToday = filteredCandles.regularSession

                            if (entityToUpdate.preMarketCandles.length === 0) entityToUpdate.preMarketCandles = filteredCandles.preMarket

                            if (cleanCandlesToday.length === 0) return
                            let lastCandle = cleanCandlesToday[cleanCandlesToday.length - 1].ClosePrice


                            entityToUpdate.mostRecentPriceUpDown = lastCandle >= draft.mostRecentPrice
                            entityToUpdate.mostRecentPrice = lastCandle

                            if (isAfter(new Date(), set(new Date(), { hours: 10, minutes: 30 })) && entityToUpdate.firstHourCandles.candles.length === 0)
                            {
                                let firstHourCandles = filterFirstHourSessionCandles(cleanCandlesToday)

                                let firstHourHigh = firstHourCandles[0]?.HighPrice || 0
                                let firstHourLow = firstHourCandles[0]?.LowPrice || 0
                                let firstHourVolume = 0

                                let peak = entityToUpdate.metricConfig.morningMetrics.upSide.averageTimeToPeak
                                let peakTime = set(new Date(), { hours: peak.hour, minutes: peak.minute })
                                let volumeToPeak = 0
                                let highToPeak = firstHourCandles[0]?.HighPrice || 0
                                let lowToPeak = firstHourCandles[0]?.LowPrice || 0

                                let bottom = entityToUpdate.metricConfig.morningMetrics.downSide.averageTimeToBottom
                                let bottomTime = isWeekend(new Date()) ?
                                    previousFriday(set(new Date(), { hours: bottom.hour, minutes: bottom.minute })) :
                                    set(new Date(), { hours: bottom.hour, minutes: bottom.minute })

                                let volumeToBottom = 0
                                let highToBottom = firstHourCandles[0]?.HighPrice || 0
                                let lowToBottom = firstHourCandles[0]?.LowPrice || 0

                                firstHourCandles.forEach((t) =>
                                {
                                    if (t.LowPrice < firstHourLow) firstHourLow = t.LowPrice
                                    if (t.HighPrice > firstHourHigh) firstHourHigh = t.HighPrice
                                    firstHourVolume += t.Volume

                                    if (isBefore(t.Timestamp, peakTime))
                                    {
                                        volumeToPeak += t.Volume
                                        if (t.LowPrice > lowToPeak) lowToPeak = t.LowPrice
                                        if (t.HighPrice > highToPeak) highToPeak = t.HighPrice
                                    }
                                    if (isBefore(t.Timestamp, bottomTime))
                                    {

                                        volumeToBottom += t.Volume
                                        if (t.LowPrice > lowToBottom) lowToBottom = t.LowPrice
                                        if (t.HighPrice > highToBottom) highToBottom = t.HighPrice
                                    }
                                })

                                let candleUpdate = {
                                    candles: firstHourCandles,
                                    mostRecentCandle: firstHourCandles.at(-1),
                                    metrics: {
                                        high: firstHourHigh,
                                        low: firstHourLow,
                                        volume: firstHourVolume
                                    },
                                    peakMetrics: {
                                        high: highToPeak,
                                        low: lowToPeak,
                                        volumeToPeak,
                                        peakTime
                                    },
                                    bottomMetrics: {
                                        high: highToBottom,
                                        low: lowToBottom,
                                        volumeToBottom,
                                        bottomTime
                                    },
                                    mostRecentPrice: lastCandle
                                }
                                entityToUpdate.firstHourCandles = candleUpdate

                            }


                            draft.plans.entities[symbol].todaysCandles = cleanCandlesToday
                            draft.plans.entities[symbol].combinedCandleData = [...draft.plans.entities[symbol].historicCandle, ...cleanCandlesToday]
                        })

                        if (freshCandleData?.macroData) Object.keys(freshCandleData.macroData).forEach(symbol =>
                        {
                            if (!draft.macros.entities[symbol]) return

                            let liveCandles = freshCandleData.macroData[symbol]
                            if (!liveCandles || liveCandles.length === 0) return
                            const filteredCandles = filterRegularSessionCandles(liveCandles)
                            const cleanCandlesToday = filteredCandles.regularSession
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
        }),

        fetchPlanUpdates: builder.mutation({
            query: () => ({
                url: `/engine/planRefresh`,
                validateStatus: (response, result) => { return response.status === 200 && !result.isError }
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data: freshPlanData } = await queryFulfilled;
                    console.log(freshPlanData)
                    const cacheUpdateRecipe = EnginePlanPlanApiSlice.util.updateQueryData(
                        'initiateEngineWithEnterExitPlan', undefined, (draft) =>
                    {
                        console.log(draft)
                        if (!draft || !draft.plans.entities) return;

                        freshPlanData.plans.forEach((newPlan) =>
                        {
                            const ticker = newPlan.plan.tickerSymbol
                            console.log(ticker)
                            const existingPlan = draft.plans.entities[ticker]

                            if (existingPlan)
                            {
                                console.log(`This ${ticker} already exist and will be updated`)
                                //process through all possible updates form incoming data

                            } else
                            {
                                console.log(`This ${ticker} needs to be created`)

                                let regularSessionCandles = filterRegularSessionCandles(newPlan.candleData)
                                let todaysRegularSessionCandles = filterRegularSessionCandles(newPlan.todayCandleData)
                                console.log(regularSessionCandles.length, todaysRegularSessionCandles.length)
                                let enterExitPlanPrices = newPlan.plan.plan
                                let patternClassification = newPlan.plan.patternClassification

                                let patternConfig = {}
                                let baseLineIndicators = {}
                                if (patternClassification === 'channel')
                                {
                                    patternConfig = { ...newPlan.plan.channelPattern }
                                    if (patternConfig.channelType !== 'MULTIDAY_SPACED')
                                    {
                                        baseLineIndicators = compileHistoricalOneMinPennyBaselines(regularSessionCandles)
                                    } else if (patternConfig.channelType === 'MULTIDAY_SPACED')
                                    {
                                        baseLineIndicators = compileHistoricalStandardChannelBaselines(patternConfig, regularSessionCandles)
                                    }
                                } else if (patternClassification === 'continuation')
                                {
                                    patternConfig = newPlan.plan.continuationPattern
                                    baseLineIndicators = compileHistoricalContinuationBaselines(regularSessionCandles)
                                } else if (patternClassification === 'cascade')
                                {
                                    patternConfig = newPlan.plan.cascadePattern
                                    baseLineIndicators = compileHistoricalFiveMinCascadeBaselines(patternConfig, regularSessionCandles)
                                }
                                patternConfig.maintainLiveCandles = newPlan.plan?.maintainLiveCandles || false
                                patternConfig.patternClassification = patternClassification

                                let planConfig = {}
                                planConfig.trackingDays = differenceInBusinessDays(new Date(), new Date(newPlan.plan.dateAdded))
                                planConfig.tickerSymbol = newPlan.plan.tickerSymbol
                                planConfig.sector = newPlan.plan.sector
                                planConfig.plan = newPlan.plan.plan
                                planConfig.relevantCandleDate = newPlan.plan.relevantCandleDate
                                planConfig.dateAdded = newPlan.plan.dateAdded
                                planConfig.correlationValues = newPlan.plan.correlationValues
                                planConfig.greatestCorrelation = newPlan.plan.greatestCorrelation
                                planConfig.spyBetaValue = newPlan.plan.dailyTickerValues.spyBetaValue || 1
                                planConfig.dailyCalculatedValues = newPlan.plan.dailyTickerValues
                                planConfig.planId = newPlan.plan._id
                                planConfig.backTestedValues = {
                                    entryPrice: newPlan.plan.relevantDateBackTests,
                                    floorPrice: newPlan.plan.relevantDateBackTestsUsingFloor
                                }
                                planConfig.datesLastCalculated = {
                                    morningMetrics: newPlan.plan.dateMorningMetricsLastCalculated,
                                    volumeProfileMetrics: newPlan.plan.dateVolumeProfileLastCalculated,
                                    absorptionWindow: newPlan.plan.dateAbsorptionWindowLastCalculated,
                                    options: newPlan.plan.dateOptionsEMLastCalculated,
                                    pattern: newPlan.plan.datePatternLastCalculated,
                                    retailVsInstitution: newPlan.plan.dateRvILastCalculated
                                }


                                let metricConfig = {}
                                metricConfig.extentProb = newPlan.plan.extentProb
                                metricConfig.morningMetrics = newPlan.plan.morningMetrics
                                metricConfig.morningVolume = newPlan.plan.morningVolumeMetrics
                                metricConfig.extremeProbByFiveMin = newPlan.plan.extremeProbByFiveMin
                                metricConfig.vpSupportResistance = newPlan.plan.volumeProfileMetrics
                                metricConfig.absorptionWindow = newPlan.plan.absorptionWindowMetrics
                                metricConfig.retailVsInstitution = newPlan.plan.retailVsInstitutionMetrics
                                metricConfig.volumeDistribution = newPlan.plan.volumeDistributionMetrics
                                console.log(newPlan.plan.openCrossMetrics)
                                metricConfig.openCross = { ...newPlan.plan.openCrossMetrics }
                                if (isBefore(new Date(), set(new Date(), { hours: 9, minutes: 4 })))
                                    metricConfig.openCross.todaysOpenCross = undefined


                                let currentPriceStats = {}
                                let mostRecentPrice = newPlan.snapShot.LatestTrade.Price
                                currentPriceStats.snapShot = newPlan.snapShot
                                currentPriceStats.dailyBar = newPlan.snapShot.DailyBar
                                currentPriceStats.prevDailyBar = newPlan.snapShot.PrevDailyBar

                                currentPriceStats.yesterdayClose = newPlan.snapShot.PrevDailyBar.ClosePrice
                                currentPriceStats.changeFromYesterdayClose = mostRecentPrice - currentPriceStats.yesterdayClose

                                let optionsConfig = {}
                                optionsConfig = newPlan.plan?.optionsExpectedMoves || undefined




                                let discountConfig = {}
                                discountConfig.isReviewed = newPlan.plan.deepDiscounts?.dateReviewed ?
                                    differenceInBusinessDays(new Date(), newPlan.plan.deepDiscounts?.dateReviewed) < 5 ? true : false : false

                                discountConfig.aboveStopLoss = newPlan.plan?.deepDiscounts?.aboveStopLoss
                                discountConfig.belowStopLoss = newPlan.plan?.deepDiscounts?.belowStopLoss
                                discountConfig.aboveMaxPain = newPlan.plan?.deepDiscounts?.aboveMaxPain

                                discountConfig.dateReviewed = newPlan.plan.deepDiscounts?.dateReviewed

                                discountConfig.prices = [newPlan.plan?.deepDiscounts?.aboveStopLoss?.price || 0,
                                newPlan.plan?.deepDiscounts?.belowStopLoss?.price || 0,
                                newPlan.plan?.deepDiscounts?.aboveMaxPain?.price || 0
                                ]

                                discountConfig.includesDiscount = Math.max(...discountConfig.prices)
                                //provides 0 for no discounts set or the first discount to compare a live price against



                                let tradeTapeConfig = {}
                                if (newPlan.tradeData) tradeTapeConfig.liveTapeMetrics = processAuthoritativeTradesArray(newPlan.tradeData)
                                else tradeTapeConfig.liveTapeMetrics = undefined

                                let firstHourCandles
                                if (isBefore(new Date(), preSetDailyTimes.marketOpen))
                                {
                                    firstHourCandles = {
                                        candles: [],
                                        metrics: {
                                            high: undefined,
                                            low: undefined,
                                            volume: undefined
                                        },
                                        peakMetrics: {
                                            high: undefined,
                                            volumeToPeak: undefined
                                        },
                                        bottomMetrics: {
                                            low: undefined,
                                            volumeToBottom: undefined
                                        },
                                        mostRecentCandle: { ClosePrice: newPlan.snapShot.LatestTrade.Price }
                                    }
                                } else if (isBefore(new Date(), preSetDailyTimes.firstHour))
                                {
                                    let cleanFirstHourCandles = filterFirstHourSessionCandles(todaysRegularSessionCandles)

                                    let firstHourHigh = cleanFirstHourCandles[0].HighPrice
                                    let firstHourLow = cleanFirstHourCandles[0].LowPrice
                                    let firstHourVolume = 0

                                    let peak = morningMetrics.upSide.averageTimeToPeak
                                    let peakTime = set(new Date(), { hours: peak.hour, minutes: peak.minute })
                                    let volumeToPeak = 0
                                    let highToPeak = cleanFirstHourCandles[0].HighPrice
                                    let lowToPeak = cleanFirstHourCandles[0].LowPrice

                                    let bottom = morningMetrics.downSide.averageTimeToBottom
                                    let bottomTime = isWeekend(new Date()) ?
                                        previousFriday(set(new Date(), { hours: bottom.hour, minutes: bottom.minute })) :
                                        set(new Date(), { hours: bottom.hour, minutes: bottom.minute })

                                    let volumeToBottom = 0
                                    let highToBottom = cleanFirstHourCandles[0].HighPrice
                                    let lowToBottom = cleanFirstHourCandles[0].LowPrice

                                    cleanFirstHourCandles.forEach((t) =>
                                    {

                                        if (t.LowPrice < firstHourLow) firstHourLow = t.LowPrice
                                        if (t.HighPrice > firstHourHigh) firstHourHigh = t.HighPrice
                                        firstHourVolume += t.Volume

                                        if (isBefore(t.Timestamp, peakTime))
                                        {
                                            volumeToPeak += t.Volume
                                            if (t.LowPrice > lowToPeak) lowToPeak = t.LowPrice
                                            if (t.HighPrice > highToPeak) highToPeak = t.HighPrice
                                        }
                                        if (isBefore(t.Timestamp, bottomTime))
                                        {

                                            volumeToBottom += t.Volume
                                            if (t.LowPrice > lowToBottom) lowToBottom = t.LowPrice
                                            if (t.HighPrice > highToBottom) highToBottom = t.HighPrice
                                        }
                                    })

                                    firstHourCandles = {
                                        candles: cleanFirstHourCandles,
                                        metrics: { high: firstHourHigh, low: firstHourLow, volume: firstHourVolume },
                                        peakMetrics: { high: highToPeak, low: lowToPeak, volumeToPeak, peakTime },
                                        bottomMetrics: { high: highToBottom, low: lowToBottom, volumeToBottom, bottomTime },
                                        mostRecentCandle: firstHourCandles.at(-1),
                                        mostRecentPrice: newPlan.snapShot.LatestTrade.Price
                                    }
                                }
                                else 
                                {
                                    let cleanFirstHourCandles = filterFirstHourSessionCandles(todaysRegularSessionCandles)


                                    let firstHourHigh = cleanFirstHourCandles[0].HighPrice
                                    let firstHourLow = cleanFirstHourCandles[0].LowPrice
                                    let firstHourVolume = 0

                                    let peak = metricConfig.morningMetrics.upSide.averageTimeToPeak
                                    let peakTime = set(new Date(), { hours: peak.hour, minutes: peak.minute })
                                    let volumeToPeak = 0
                                    let highToPeak = cleanFirstHourCandles[0].HighPrice
                                    let lowToPeak = cleanFirstHourCandles[0].LowPrice

                                    let bottom = metricConfig.morningMetrics.downSide.averageTimeToBottom
                                    let bottomTime = isWeekend(new Date()) ?
                                        previousFriday(set(new Date(), { hours: bottom.hour, minutes: bottom.minute })) :
                                        set(new Date(), { hours: bottom.hour, minutes: bottom.minute })

                                    let volumeToBottom = 0
                                    let highToBottom = cleanFirstHourCandles[0].HighPrice
                                    let lowToBottom = cleanFirstHourCandles[0].LowPrice

                                    cleanFirstHourCandles.forEach((t) =>
                                    {
                                        if (t.LowPrice < firstHourLow) firstHourLow = t.LowPrice
                                        if (t.HighPrice > firstHourHigh) firstHourHigh = t.HighPrice
                                        firstHourVolume += t.Volume

                                        if (isBefore(t.Timestamp, peakTime))
                                        {
                                            volumeToPeak += t.Volume
                                            if (t.LowPrice > lowToPeak) lowToPeak = t.LowPrice
                                            if (t.HighPrice > highToPeak) highToPeak = t.HighPrice
                                        }
                                        if (isBefore(t.Timestamp, bottomTime))
                                        {

                                            volumeToBottom += t.Volume
                                            if (t.LowPrice > lowToBottom) lowToBottom = t.LowPrice
                                            if (t.HighPrice > highToBottom) highToBottom = t.HighPrice
                                        }
                                    })
                                    firstHourCandles = {
                                        candles: cleanFirstHourCandles,
                                        mostRecentCandle: firstHourCandles.at(-1),
                                        metrics: {
                                            high: firstHourHigh,
                                            low: firstHourLow,
                                            volume: firstHourVolume
                                        },
                                        peakMetrics: {
                                            high: highToPeak,
                                            low: lowToPeak,
                                            volumeToPeak,
                                            peakTime
                                        },
                                        bottomMetrics: {
                                            high: highToBottom,
                                            low: lowToBottom,
                                            volumeToBottom,
                                            bottomTime
                                        },
                                        mostRecentPrice: lastCandle
                                    }
                                }



                                enginePlanAdapter.addOne(draft.plans, {
                                    id: newPlan.plan.tickerSymbol,
                                    stockInfo: newPlan.plan.stockId,
                                    mostRecentPrice,
                                    mostRecentPriceUpDown: undefined,
                                    planConfig,
                                    patternConfig,
                                    optionsConfig,
                                    metricConfig,
                                    discountConfig,
                                    tradeTapeConfig,
                                    currentPriceStats,
                                    historicCandle: regularSessionCandles,
                                    firstHourCandles,
                                    todaysCandles: todaysRegularSessionCandles,
                                    combinedCandleData: [...regularSessionCandles, ...todaysRegularSessionCandles],
                                    snapShot: newPlan.snapShot,
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
                                })
                            }
                        })
                    })

                    dispatch(cacheUpdateRecipe)
                } catch (error)
                {
                    console.log(error)
                    // Handle potential mutation errors here
                }
            }
        }),

        removePlanFromUser: builder.mutation({
            async queryFn(args, api, extraOptions, baseQuery)
            {
                const state = api.getState()
                const initializationEndpointDataSelector = InitializationApiSlice.endpoints.getUserInitialization.select(undefined)
                const userInitializationData = initializationEndpointDataSelector(state);
                const userStockHistory = userInitializationData?.data.userStockHistory

                let historyIdForRemoval
                userStockHistory.forEach((t) => { if (args.tickerSymbol === t.symbol) historyIdForRemoval = t._id })

                let result = await baseQuery({
                    url: `/enterExitPlan/remove/${args.planId}/history/${historyIdForRemoval}`,
                    method: 'DELETE',
                })

                if (result.error) { return { error: result.error }; }
                return { data: result.data };
            },
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                const { data: deletionConfirmation } = await queryFulfilled;

                try
                {
                    const cacheUpdateRecipe = EnginePlanPlanApiSlice.util.updateQueryData('initiateEngineWithEnterExitPlan', undefined, (draft) =>
                    {
                        if (!draft || !draft.plans.entities) return;
                        enginePlanAdapter.removeOne(draft.plans, deletionConfirmation.tickerRemoved)
                    })
                    setTimeout(() => dispatch(cacheUpdateRecipe), [3000])
                } catch (error)
                {
                    console.log(error)
                    // Handle potential mutation errors here
                }
            }
        }),
        fetchEngineMorningData: builder.query({
            query: () => ({
                url: `/engine/today/morning`,
                validateStatus: (response, result) => { return response.status === 200 && !result.isError }
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data: freshMorningData } = await queryFulfilled;
                    dispatch(EnginePlanPlanApiSlice.util.updateQueryData('initiateEngineWithEnterExitPlan', undefined, (draft) =>
                    {
                        if (!draft) return
                        freshMorningData.planAndTrackedStocks.map((t, i) =>
                        {
                            if (!draft.plans.entities[t.tickerSymbol]) return
                            const entityToUpdate = draft.plans.entities[t.tickerSymbol]

                            if (t?.extentProb) entityToUpdate.metricConfig.extentProb = t.extentProb
                            if (t?.extremeProbByFiveMin) entityToUpdate.metricConfig.extremeProbByFiveMin = t.extremeProbByFiveMin
                            if (t?.morningMetrics) entityToUpdate.metricConfig.morningMetrics = t.morningMetrics
                            if (t?.morningVolumeMetrics) entityToUpdate.metricConfig.morningVolume = t.morningVolumeMetrics
                            if (t?.volumeDistributionMetrics) entityToUpdate.metricConfig.volumeDistribution = t.volumeDistributionMetrics
                            if (t?.optionsExpectedMoves) entityToUpdate.optionsConfig = t.optionsExpectedMoves

                            if (t?.dateOptionsEMLastCalculated) entityToUpdate.planConfig.datesLastCalculated.options = t.dateOptionsEMLastCalculated
                            if (t?.dateMorningMetricsLastCalculated) entityToUpdate.planConfig.datesLastCalculated.morningMetrics = t.dateMorningMetricsLastCalculated

                        })
                    }))
                } catch (error) { console.log(error) }
            }
        }),
        fetchEngineOpenCrossData: builder.query({
            query: () => ({
                url: `/engine/today/openCross`,
                validateStatus: (response, result) => { return response.status === 200 && !result.isError }
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data: freshOpenCrosses } = await queryFulfilled;
                    dispatch(EnginePlanPlanApiSlice.util.updateQueryData('initiateEngineWithEnterExitPlan', undefined, (draft) =>
                    {
                        if (!draft) return
                        freshOpenCrosses.openCross.map((t, i) =>
                        {
                            if (!draft.plans.entities[t.tickerSymbol]) return
                            if (t?.openCrossMetrics) draft.plans.entities[t.tickerSymbol].metricConfig.openCross = t.openCrossMetrics
                        })

                        if (freshOpenCrosses.snapShots)
                        {
                            freshOpenCrosses.snapShots.map((t, i) =>
                            {
                                let entityForUpdate = draft.plans.entities[t.symbol]
                                if (entityForUpdate)
                                {
                                    entityForUpdate.snapShot = t


                                    entityForUpdate.currentPriceStats.snapShot = t
                                    entityForUpdate.currentPriceStats.dailyBar = t.DailyBar
                                    entityForUpdate.currentPriceStats.prevDailyBar = t.PrevDailyBar

                                    entityForUpdate.currentPriceStats.yesterdayClose = t.PrevDailyBar.ClosePrice
                                    entityForUpdate.currentPriceStats.changeFromYesterdayClose = entityForUpdate.mostRecentPrice - t.PrevDailyBar.ClosePrice


                                    if (entityForUpdate.activeTradeConfig)
                                    {
                                        let tradesCopy = [...draft.trades]
                                        draft.trades = tradesCopy.map((k, i) =>
                                        {
                                            if (k.snapShot.symbol === t.symbol) return { ...k, snapShot: t }
                                            else return k
                                        })
                                    }


                                } else if (draft.macros.entities[t.symbol])
                                {
                                    entityForUpdate = draft.macros.entities[t.symbol]
                                    entityForUpdate.snapShot = t
                                }

                            })

                        }


                    }))
                } catch (error) { console.log(error) }
            }
        }),
        fetchEngineMidDayData: builder.query({
            query: () => ({
                url: `/engine/today/midday`,
                validateStatus: (response, result) => { return response.status === 200 && !result.isError }
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data: freshMidDayData } = await queryFulfilled;
                    dispatch(EnginePlanPlanApiSlice.util.updateQueryData('initiateEngineWithEnterExitPlan', undefined, (draft) =>
                    {
                        if (!draft) return
                        freshMidDayData.planAndTrackedStocks.map((t, i) =>
                        {
                            if (!draft.plans.entities[t.tickerSymbol]) return
                            const entityToUpdate = draft.plans.entities[t.tickerSymbol]
                            if (t?.optionsExpectedMoves) entityToUpdate.optionsConfig = t.optionsExpectedMoves
                            if (t?.dateOptionsEMLastCalculated) entityToUpdate.planConfig.datesLastCalculated.options = t.dateOptionsEMLastCalculated

                        })
                    }))
                } catch (error) { console.log(error) }
            }
        }),
        fetchEnginePostCloseData: builder.query({
            query: () => ({
                url: `/engine/today/postClose`,
                validateStatus: (response, result) => { return response.status === 200 && !result.isError }
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data: freshPostCloseData } = await queryFulfilled;

                    dispatch(EnginePlanPlanApiSlice.util.updateQueryData('initiateEngineWithEnterExitPlan', undefined, (draft) =>
                    {
                        if (!draft) return
                        freshPostCloseData.planAndTrackedStocks.map((t, i) =>
                        {
                            if (!draft.plans.entities[t.tickerSymbol]) return

                            const entityToUpdate = draft.plans.entities[t.tickerSymbol]
                            if (t?.channelPattern || t?.cascadePattern || t?.continuationPattern)
                            {
                                if (entityToUpdate.patternConfig.patternClassification === 'channel') { entityToUpdate.patternConfig = t.channelPattern }
                                else if (entityToUpdate.patternConfig.patternClassification === 'continuation') { entityToUpdate.patternConfig = t.continuationPattern }
                                else if (entityToUpdate.patternConfig.patternClassification === 'cascade') { entityToUpdate.patternConfig = t.cascadePattern }
                            }

                            if (t?.correlationValues) entityToUpdate.planConfig.correlationValues = t.correlationValues
                            if (t?.greatestCorrelation) entityToUpdate.planConfig.greatestCorrelation = t.greatestCorrelation
                            if (t?.dailyTickerValues) entityToUpdate.planConfig.dailyCalculatedValues = t.dailyTickerValues
                            if (t?.relevantDateBackTests && t?.relevantDateBackTestsUsingFloor) entityToUpdate.planConfig.backTestedValues = { entryPrice: t.relevantDateBackTests, floorPrice: t.relevantDateBackTestsUsingFloor }

                            if (t?.absorptionWindowMetrics) entityToUpdate.metricConfig.absorptionWindow = t.absorptionWindowMetrics
                            if (t?.retailVsInstitutionMetrics) entityToUpdate.metricConfig.retailVsInstitution = t.retailVsInstitutionMetrics
                            if (t?.volumeProfileMetrics) entityToUpdate.metricConfig.vpSupportResistance = t.volumeProfileMetrics

                            if (t?.dateVolumeProfileLastCalculated) entityToUpdate.planConfig.datesLastCalculated.volumeProfileMetrics = t.dateVolumeProfileLastCalculated
                            if (t?.datePatternLastCalculated) entityToUpdate.planConfig.datesLastCalculated.pattern = t.datePatternLastCalculated
                            if (t?.dateRvILastCalculated) entityToUpdate.planConfig.datesLastCalculated.retailVsInstitution = t.dateRvILastCalculated
                            if (t?.dateAbsorptionWindowLastCalculated) entityToUpdate.planConfig.datesLastCalculated.absorptionWindow = t.dateAbsorptionWindowLastCalculated

                        })
                    }))
                } catch (error) { console.log(error) }
            }
        })
    })
});

export const {
    useInitiateEngineWithEnterExitPlanQuery,
    useFetchEngineCandleBarDataQuery,
    useFetchPlanUpdatesMutation,
    useRemovePlanFromUserMutation,
    useFetchEngineTradeDataQuery,
    useFetchEngineOneMinCandleBarDataQuery,
    useFetchEngineMorningDataQuery,
    useFetchEngineOpenCrossDataQuery,
    useFetchEngineMidDayDataQuery,
    useFetchEnginePostCloseDataQuery
} = EnginePlanPlanApiSlice;



const selectHistoricalQueryCache = EnginePlanPlanApiSlice.endpoints.initiateEngineWithEnterExitPlan.select()
const selectApiCacheData = createSelector([selectHistoricalQueryCache], (queryResult) => queryResult.data);
const planSelectors = enginePlanAdapter.getSelectors((state) => selectApiCacheData(state)?.plans || enginePlanAdapter.getInitialState());
const macroSelectors = engineMacroAdapter.getSelectors((state) => selectApiCacheData(state)?.macros || engineMacroAdapter.getInitialState());

export const selectPlansMacroCorrelations = createSelector(
    [macroSelectors.selectEntities, (state, symbol) => symbol],
    (macroEntities, symbol) =>
    {
        return macroEntities[symbol] || {}

    }
)

export const selectPrioritizedWatchlist = createSelector(
    [planSelectors.selectIds, planSelectors.selectEntities, macroSelectors.selectIds, macroSelectors.selectEntities],
    (stockIds, stockEntities, macroIds, macroEntities) =>
    {
        if (stockIds.length === 0) return [];

        const liveSpyPlan = macroEntities['SPY']
        const liveRSPPlan = macroEntities['RSP']

        const scoredWatchlistArray = stockIds.map(id =>
        {
            const planEntity = stockEntities[id]; if (!planEntity) return null;

            let liveSectorPlan = macroEntities[sectorToTicker[planEntity.planConfig.sector]]
            const centralScoreProfile = calculateCentralPlanScore(planEntity, liveSpyPlan, liveRSPPlan, liveSectorPlan, false);

            return {
                tickerSymbol: planEntity.id,
                planId: planEntity.planConfig.planId,
                highImportance: planEntity.highImportance,
                mostRecentPrice: planEntity.mostRecentPrice,
                industry: planEntity.stockInfo?.Industry,
                patternClassification: planEntity.patternConfig.patternClassification,
                sector: planEntity.planConfig.sector,
                alphaConvictionScore: centralScoreProfile.matchScorePercent,
                executionStatus: centralScoreProfile.status,
                pricePosition: centralScoreProfile.pricePosition,
                withinPlan: centralScoreProfile.viableTrade,
                insideStrike: centralScoreProfile.insideStrike,
                livePriceMetrics: centralScoreProfile.metrics
            };
        }).filter(Boolean);



        const HIGH_CONVICTION_THRESHOLD = 75;
        // =========================================================================
        // ⚔️ THE HIGH-CONVICTION THRESHOLD THRESHOLD SORTING ENGINE
        // =========================================================================
        return scoredWatchlistArray.sort((a, b) =>
        {
            const aIsHigh = a.alphaConvictionScore >= HIGH_CONVICTION_THRESHOLD;
            const bIsHigh = b.alphaConvictionScore >= HIGH_CONVICTION_THRESHOLD;

            // ─────────────────────────────────────────────────────────────────
            // CRITICAL TIER 1: HIGH CONVICTION ZONE SEGREGATION
            // ─────────────────────────────────────────────────────────────────
            if (bIsHigh && !aIsHigh) return 1;
            if (!bIsHigh && aIsHigh) return -1;


            // ─────────────────────────────────────────────────────────────────
            // CRITICAL TIER 2: INSIDE THE ELITE HIGH-CONVICTION BLOCK
            // ─────────────────────────────────────────────────────────────────
            // If BOTH plans are high conviction, sort them PURELY by dollar payout!
            if (bIsHigh && aIsHigh)
            {
                const rewardA = a.positionPricingMetrics?.rewardDollarAllocation || 0;
                const rewardB = b.positionPricingMetrics?.rewardDollarAllocation || 0;

                // Sort by the largest absolute dollar reward potential on a $1,000 position
                if (rewardB !== rewardA) { return rewardB - rewardA; }

                // Tie-breaker: If payouts are identical, select the item with the smaller dollar risk
                const riskA = a.positionPricingMetrics?.riskDollarAllocation || 0;
                const riskB = b.positionPricingMetrics?.riskDollarAllocation || 0;
                return riskA - riskB;
            }
            // ─────────────────────────────────────────────────────────────────
            // CRITICAL TIER 3: INSIDE THE OBSERVER RADAR BLOCK (SCORE < 75)
            // ─────────────────────────────────────────────────────────────────
            // If neither plan is high conviction, sort them traditionally by score hierarchy
            if (b.alphaConvictionScore !== a.alphaConvictionScore) { return b.alphaConvictionScore - a.alphaConvictionScore; }

            // Off-target standby cards (RADAR_STANDBY) hold null metrics; push them to the absolute bottom
            const metricsA = a.positionPricingMetrics;
            const metricsB = b.positionPricingMetrics;
            if (!metricsA && metricsB) return 1;
            if (metricsA && !metricsB) return -1;

            // Score-tie fallback: Order by basic remaining reward potential
            const rewardA = metricsA?.rewardDollarAllocation || 0;
            const rewardB = metricsB?.rewardDollarAllocation || 0;
            return rewardB - rewardA;
        }
        );
    })

export const selectExposureResults = createSelector([selectApiCacheData], (cachedData) => cachedData.exposureResults)

export const selectActiveTradeResults = createSelector([selectApiCacheData], (cachedData) => cachedData.trades)

export const selectActiveTradeResultIds = () =>
{
    return createSelector(
        [selectApiCacheData], (cachedData) => cachedData.trades.map(t => t.tickerSymbol)
    )
}




const selectCurrentTradeTickers = createSelector(
    [selectApiCacheData],
    (trades) => trades.trades.map(t => t.tickerSymbol) || []
)
const selectTickerByWatchList = (_, watchList) => watchList
export const selectPlansForWatchManyByWatchList = () =>
{
    return createSelector([selectCurrentTradeTickers, selectHighImportancePlanIds, selectPrioritizedWatchlist, selectTickerByWatchList],
        (currentTrades, importantIds, alphaScoredPlans, selectedWatchList) =>
        {
            switch (selectedWatchList)
            {
                case 'activeTrade': return currentTrades
                case 'belowStop': return alphaScoredPlans.filter(t => t.pricePosition === 0).map(t => t.tickerSymbol)
                case 'discount': return alphaScoredPlans.filter(t => t.pricePosition === 1).map(t => t.tickerSymbol)
                case 'entryStrike': return alphaScoredPlans.filter(t => t.pricePosition === 2).map(t => t.tickerSymbol)
                case 'viableEntry': return alphaScoredPlans.filter(t => t.pricePosition < 3 && t.pricePosition > 0).map(t => t.tickerSymbol)
                case 'highImportance': return importantIds.map(t => t.tickerSymbol)
            }
        })
}








export const selectDayPL = createSelector([selectApiCacheData, planSelectors.selectEntities], (activeTrades, planEntity) =>
{
    let totalPurchasePrice = 0
    let openPLTotal = 0

    let todayPLTotal = 0
    let todayOpenTotal = 0

    let currentTrades = activeTrades.trades.map((t) =>
    {
        const plan = planEntity[t.tickerSymbol]
        let openPL = 0
        t.purchaseRecords.forEach(t => 
        {
            openPL += ((plan.mostRecentPrice - t.purchasePrice) * t.sharesRemaining)
            totalPurchasePrice += (t.purchasePrice * t.sharesRemaining)
            openPLTotal += openPL
        })

        const todayOpenPrice = isToday(t.snapShot.DailyBar.Timestamp) ? t.snapShot.DailyBar.OpenPrice : 0
        let todayPL = 0
        if (todayOpenPrice)
        {
            todayPL = (plan.mostRecentPrice - todayOpenPrice) * t.availableShares
            todayOpenTotal += (todayOpenPrice * t.availableShares)
            todayPLTotal += todayPL
        }
        return { ...t, openPL }
    })
    let todayOpenPercent = 0
    if (todayOpenTotal !== 0)
    {
        todayOpenPercent = (todayPLTotal / todayOpenTotal) * 100
    }
    let openPLPercent = 0
    if (totalPurchasePrice !== 0)
    {
        openPLPercent = (openPLTotal / totalPurchasePrice) * 100
    }


    return { openPLTotal, openPLPercent, todayPLTotal, todayOpenPercent, trades: currentTrades.sort((a, b) => b.openPL - a.openPL) }
})







export const selectPlansByMacroSector = createSelector([planSelectors.selectIds, planSelectors.selectEntities, (state, sector) => sector],
    (stockIds, stockEntities, sector) =>
    {
        return stockIds.flatMap(id =>
        {
            const planEntity = stockEntities[id]; if (!planEntity) return [];
            if (sector === 'all') return planEntity
            if (planEntity.stockInfo.Sector === sector) return planEntity
            else return []
        })
    })
export const selectPlansByMacroIndustry = createSelector([planSelectors.selectIds, planSelectors.selectEntities, (state, industry) => industry],
    (stockIds, stockEntities, industry) =>
    {
        if (industry === 'all') return []
        return stockIds.flatMap(id =>
        {
            const planEntity = stockEntities[id]; if (!planEntity) return [];

            if (planEntity.stockInfo.Industry === industry) return planEntity
            else return []
        })
    })



/**
 * Parameter-Driven Curried Score Selector.
 * Allows independent UI components to securely query the live alpha score 
 * of a SINGLE specific symbol without subscribing to the whole watchlist array [INDEX].
 */
export const selectScoreBySymbol = createSelector(
    [selectPrioritizedWatchlist, (state, symbol) => symbol],
    (prioritizedWatchlist, symbol) =>
    {
        const targetedPlan = prioritizedWatchlist.find(item => item.tickerSymbol === symbol);
        return targetedPlan || { alphaConvictionScore: 0, executionStatus: "OFF_RADAR", livePrice: 0.00 };
    }
);
export const selectDetailedScoreBreakDownBySymbol = createSelector(
    [planSelectors.selectEntities, macroSelectors.selectEntities, (state, symbol) => symbol],
    (stockEntities, macroEntities, symbol) =>
    {
        const planEntity = stockEntities[symbol]
        if (!planEntity) return {}

        const liveSpyPlan = macroEntities['SPY']
        const liveRSPPlan = macroEntities['RSP']
        const liveSectorPlan = macroEntities[sectorToTicker[planEntity.planConfig.sector]]

        const centralScoreProfile = calculateCentralPlanScore(planEntity, liveSpyPlan, liveRSPPlan, liveSectorPlan, true);

        return {
            mostRecentPrice: planEntity.mostRecentPrice,
            mostRecentPriceUpDown: planEntity.mostRecentPriceUpDown,
            centralScoreProfile
        }
    }
);




export const selectLastCandleByTicker = createSelector(
    [planSelectors.selectEntities, (state, symbol) => symbol],
    (stockEntities, symbol) =>
    {
        const planEntity = stockEntities[symbol]
        if (!planEntity) return {}

        const todaysCandlesLength = planEntity.todaysCandles.length
        if (todaysCandlesLength === 0) return {}

        return planEntity.todaysCandles[todaysCandlesLength - 1]
    }
)


export const makeSelectPlansFirstHourCandlesByTicker = () =>
{

    return createSelector(
        [planSelectors.selectEntities, (state, symbol) => symbol],
        (stockEntities, symbol) =>
        {
            const planEntity = stockEntities[symbol]
            if (!planEntity) return {}
            if (isAfter(new Date(), set(new Date(), { hours: 10, minutes: 30 })))
            {
                return { ...planEntity.firstHourCandles }

            } else
            {
                return planEntity.firstHourCandles
            }
        }
    )
}


export const selectCombinedCandlesByTicker = createSelector(
    [planSelectors.selectEntities, (state, symbol) => symbol],
    (stockEntities, symbol) =>
    {
        const planEntity = stockEntities[symbol]
        if (!planEntity) return []
        return planEntity.combinedCandleData
    }
)
export const selectTodaysCandlesByTicker = createSelector(
    [planSelectors.selectEntities, (state, symbol) => symbol],
    (stockEntities, symbol) =>
    {
        const planEntity = stockEntities[symbol]
        if (!planEntity) return []
        return planEntity.todaysCandles
    }
)


export const selectMostRecentPriceByTicker = createSelector(
    [planSelectors.selectEntities, macroSelectors.selectEntities, (state, symbol) => symbol],
    (stockEntities, macroEntities, symbol) =>
    {
        const planEntity = stockEntities[symbol]
        if (!planEntity)
        {
            const macroEntity = macroEntities[symbol]
            if (!macroEntity) return undefined
            else return macroEntity.mostRecentPrice
        }

        else return planEntity.mostRecentPrice
    }
)
export const selectMostRecentPriceAndDailyChangeByTicker = createSelector(
    [planSelectors.selectEntities, (state, symbol) => symbol],
    (stockEntities, symbol) =>
    {
        const planEntity = stockEntities[symbol]
        if (!planEntity) return undefined
        let priceChange = 0
        let percentChange = 0
        let yesterdayPriceChange = 0
        let yesterdayPercentChange = 0
        if (isToday(planEntity.snapShot.DailyBar.Timestamp))
        {
            priceChange = planEntity.mostRecentPrice - planEntity.snapShot.DailyBar.OpenPrice
            percentChange = (priceChange / planEntity.snapShot.DailyBar.OpenPrice) * 100

            yesterdayPriceChange = planEntity.mostRecentPrice - planEntity.snapShot.PrevDailyBar.ClosePrice
            yesterdayPercentChange = (yesterdayPriceChange / planEntity.snapShot.PrevDailyBar.ClosePrice) * 100
        }

        return {
            mostRecentPrice: planEntity.mostRecentPrice, changeFromOpen: priceChange, percentChange: percentChange, yesterdayPriceChange, yesterdayPercentChange
        }
    }
)
export const selectDeepDiscountByReviewedStatus = createSelector(

    [planSelectors.selectAll, (state, onlyNonReviewedPlans) => onlyNonReviewedPlans],
    (stockEntities, onlyNonReviewedPlans) =>
    {
        if (onlyNonReviewedPlans) return stockEntities.filter(t => !t.discountConfig.isReviewed).map(t => { return { id: t.id, reviewed: t.discountConfig.isReviewed } })
        else return stockEntities.map(t => { return { id: t.id, reviewed: t.discountConfig.isReviewed } })
    }
)





const selectTickerSymbolParam = (_, tickerSymbol) => tickerSymbol
export const selectPlanForStaticDetails = () =>
{
    return createSelector(
        [planSelectors.selectEntities, selectTickerSymbolParam],
        (stockEntities, symbol) =>
        {
            const planEntity = stockEntities[symbol]
            if (!planEntity) return null

            return {
                id: planEntity.id,
                highImportance: planEntity.highImportance,
                planConfig: planEntity.planConfig,
                patternConfig: planEntity.patternConfig,
                metricConfig: planEntity.metricConfig,
                stockInfo: planEntity.stockInfo,
                optionsConfig: planEntity.optionsConfig,
                snapShot: planEntity.snapShot,
                discountConfig: planEntity.discountConfig,
                activeTradeConfig: planEntity.activeTradeConfig
            }
        }
    )
}


//High Importance Selectors
export const selectHighImportancePlanIds = createSelector(
    [planSelectors.selectEntities, planSelectors.selectIds],
    (entities, ids) =>
    {
        return ids.filter(id =>
        {
            const plan = entities[id];
            return plan && plan.highImportance !== undefined && plan.highImportance !== null

        }).map(id =>
        {
            const plan = entities[id]
            return { tickerSymbol: id, planId: plan.planConfig.planId }
        });
    }
);








export const selectPlanAndPatternChartingBySymbol = createSelector(
    [planSelectors.selectEntities, (state, symbol) => symbol],
    (stockEntities, symbol) =>
    {
        const planEntity = stockEntities[symbol]
        let lowestHour = undefined
        if (planEntity?.metricConfig.volumeDistribution.fiveMinAvgLowestVolume.oneHourLowestVolume)
        {
            let timeString = planEntity?.metricConfig.volumeDistribution.fiveMinAvgLowestVolume.oneHourLowestVolume
            const [startTime, endTime] = timeString.split(' to ');
            const today = new Date().toDateString();
            lowestHour = { start: new Date(`${today} ${startTime}`), end: new Date(`${today} ${endTime}`) };
        }

        const currentDayCandles = isToday(planEntity?.currentPriceStats.snapShot.DailyBar.Timestamp)
        return {
            pattern: planEntity?.patternConfig || undefined,
            plan: planEntity?.planConfig.plan || undefined,
            options: planEntity?.optionsConfig || undefined,

            lowestHour,
            supportResistance: planEntity?.metricConfig.vpSupportResistance || undefined,
            dailyCalculatedValues: planEntity?.planConfig.dailyCalculatedValues ? {
                ema9: planEntity?.planConfig.dailyCalculatedValues.ema9,
                ema50: planEntity?.planConfig.dailyCalculatedValues.ema50,
                ema200: planEntity?.planConfig.dailyCalculatedValues.ema200,
                atr: planEntity?.planConfig.dailyCalculatedValues.atr
            } : undefined,
            snapShot: planEntity?.currentPriceStats.snapShot ? {
                yesterday: currentDayCandles ? planEntity?.currentPriceStats.snapShot.PrevDailyBar : planEntity?.currentPriceStats.snapShot.DailyBar,
                today: currentDayCandles ? planEntity?.currentPriceStats.snapShot.DailyBar : undefined
            } : undefined
        }
    }

)

export const selectMacroTickers = createSelector(
    [macroSelectors.selectEntities, (state, symbol) => symbol],
    (macros, symbol) => { return macros[symbol] }
)





const selectPlanConfig = createSelector(
    [planSelectors.selectEntities, selectTickerSymbolParam],
    (stockEntities, symbol) => stockEntities[symbol]?.planConfig || null
)

const selectMetricConfig = createSelector(
    [planSelectors.selectEntities, selectTickerSymbolParam],
    (stockEntities, symbol) => stockEntities[symbol]?.metricConfig || null
)
export const selectStaticTradeBlockInfoByTicker = () =>
{
    return createSelector(
        [
            selectPlanConfig,
            selectMetricConfig
        ],
        (plan, metrics) =>
        {
            if (!plan) return null


            return {
                planPricePoints: [plan.plan.stopLossPrice, plan.plan.enterPrice, plan.plan.enterBufferPrice, plan.plan.exitBufferPrice,
                plan.patternConfig?.channelTop ||
                plan.plan.exitPrice, plan.plan.moonPrice],
                dailyCalculatedValues: plan.dailyCalculatedValues,
                emaPricePoints: {
                    ema9: plan.dailyCalculatedValues.ema9,
                    ema50: plan.dailyCalculatedValues.ema50,
                    ema200: plan.dailyCalculatedValues.ema200
                },
                volumeProfile: metrics?.vpSupportResistance,
                atr: plan.dailyCalculatedValues.atr,
                sector: plan.sector,
                averagePositionPrice: plan.activeTradeConfig,
                PrevClosePrice: plan.dailyCalculatedValues.PrevDailyBar.ClosePrice,
                TodayOpenPrice: plan.dailyCalculatedValues.DailyBar.OpenPrice
            }
        }
    )
}
