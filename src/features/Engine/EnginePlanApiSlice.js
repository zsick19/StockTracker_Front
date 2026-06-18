import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";
import { differenceInBusinessDays } from "date-fns";
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
                console.log(responseData)
            }

        }),
        fetchEngineCandleBarData: builder.query({
            query: () => ({
                url: `/engine/today/bars`,
                validateStatus: (response, result) => { return response.status === 200 && !result.isError }
            }), transformResponse: (responseData) =>
            {
                console.log(responseData)

            }
        }),
        fetchEngineTradeData: builder.query({
            query: () => ({
                url: `/engine/today/trades`,
                validateStatus: (response, result) => { return response.status === 200 && !result.isError }
            }), transformResponse: (responseData) =>
            {

                console.log(responseData)
            }
        })
    })
});

export const {
    useInitiateEngineWithEnterExitPlanQuery,
    useFetchEngineCandleBarDataQuery,
    useFetchEngineTradeDataQuery
} = EnginePlanPlanApiSlice;

