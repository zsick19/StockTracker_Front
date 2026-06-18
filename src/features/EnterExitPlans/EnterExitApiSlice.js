import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";
import { differenceInBusinessDays } from "date-fns";
const { getWebSocket, subscribe, unsubscribe } = setupWebSocket();

export const enterExitAdapter = createEntityAdapter({ sortComparer: (a, b) => b.percentFromEnter - a.percentFromEnter })
export const enterBufferHitAdapter = createEntityAdapter({ sortComparer: (a, b) => b.percentFromEnter - a.percentFromEnter })
export const stopLossHitAdapter = createEntityAdapter({ sortComparer: (a, b) => b.percentFromEnter - a.percentFromEnter })
export const fiveMinPlanAdapter = createEntityAdapter({})

export const EnterExitPlanApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsersEnterExitPlan: builder.query({
      query: () => ({
        url: `/user/enterExitPlans`,
        validateStatus: (response, result) => { return response.status === 200 && !result.isError }
      }),
      transformResponse: responseData =>
      {
        const listOfTickers = responseData.mostRecentPrice.map((ticker) => ticker.symbol)


        const enterBufferResponse = []
        const stopLossResponse = []
        const plansResponse = []
        const today = new Date()
        const currentTime = today.getUTCDate()
        const target = new Date()
        target.setHours(9, 30, 0, 0)

        responseData.plans.forEach((enterExit) =>
        {
          let stockTradeData = responseData.mostRecentPrice[listOfTickers.indexOf(enterExit.tickerSymbol)]

          enterExit.id = enterExit.tickerSymbol
          enterExit.mostRecentPrice = stockTradeData.LatestTrade.Price

          enterExit.changeFromYesterdayClose = enterExit.mostRecentPrice - stockTradeData.PrevDailyBar.ClosePrice

          enterExit.yesterdayClose = stockTradeData.PrevDailyBar.ClosePrice
          enterExit.currentDayPercentGain = (currentTime < target.getUTCDate() ? 0 : ((enterExit.mostRecentPrice - enterExit.yesterdayClose) / enterExit.yesterdayClose) * 100)
          enterExit.percentFromEnter = ((enterExit.plan.enterPrice - enterExit.mostRecentPrice) / enterExit.plan.enterPrice) * 100
          enterExit.trackingDays = differenceInBusinessDays(today, new Date(enterExit.dateAdded))
          enterExit.todayOpenPrice = stockTradeData.DailyBar.OpenPrice

          enterExit.currentRiskVReward = {
            risk: ((enterExit.mostRecentPrice - enterExit.plan.stopLossPrice) * 100 / enterExit.mostRecentPrice),
            reward: ((enterExit.plan.exitPrice - enterExit.mostRecentPrice) * 100 / enterExit.mostRecentPrice),
          }


          if (!enterExit?.relevantHighs) enterExit.relevantHighs = []
          if (!enterExit?.relevantLows) enterExit.relevantLows = []
          if (!enterExit?.institutionalPricePoints) enterExit.institutionalPricePoints = []


          let sharesToBuyWith1000DollarsCurrent = Math.floor(1000 / enterExit.mostRecentPrice)
          enterExit.with1000DollarsCurrentGain = (enterExit.plan.exitPrice - enterExit.mostRecentPrice) * sharesToBuyWith1000DollarsCurrent
          enterExit.with1000DollarsCurrentRisk = (enterExit.plan.stopLossPrice - enterExit.mostRecentPrice) * sharesToBuyWith1000DollarsCurrent

          if (!enterExit?.checkOffCriteria)
          {
            enterExit.checkOffCriteria = {
              vpCheck: false,
              rsiCheck: false,
              macdCheck: false,
              stochasticCheck: false,
              vortexCheck: false,
              volCheck: false,
              emaCheck: false
            }
          }

          if (!enterExit?.with1000DollarsIdealGain)
          {
            let sharesToBuyWith1000DollarsIdeal = Math.floor(1000 / enterExit.plan.enterPrice)
            enterExit.with1000DollarsIdealGain = (enterExit.plan.exitPrice - enterExit.plan.enterPrice) * sharesToBuyWith1000DollarsIdeal
          }

          function getInsertionIndexLinear(arr, num) { for (let i = 0; i < 3; i++) { if (arr[i] >= num) { return i; } } return 3; }

          let priceVsPlan = getInsertionIndexLinear([enterExit.plan.stopLossPrice, enterExit.plan.enterPrice, enterExit.plan.enterBufferPrice],
            stockTradeData.LatestTrade.Price)
          enterExit.priceVsPlanUponFetch = priceVsPlan
          enterExit.listChange = false



          if (!enterExit?.watchForTomorrow) enterExit.watchForTomorrow = null
          if (!enterExit?.updateNeededDate) enterExit.updateNeededDate = null

          switch (priceVsPlan)
          {
            case 0: stopLossResponse.push(enterExit); break;
            case 1: enterBufferResponse.push(enterExit); break;
            case 2: enterBufferResponse.push(enterExit); break;
            case 3: plansResponse.push(enterExit); break;
          }

        })

        return {
          enterBufferHit: enterBufferHitAdapter.setAll(enterBufferHitAdapter.getInitialState(), enterBufferResponse.sort((a, b) => b.percentFromEnter - a.percentFromEnter)),
          stopLossHit: stopLossHitAdapter.setAll(stopLossHitAdapter.getInitialState(), stopLossResponse.sort((a, b) => b.percentFromEnter - a.percentFromEnter)),
          plannedTickers: enterExitAdapter.setAll(enterExitAdapter.getInitialState(), plansResponse.sort((a, b) => b.percentFromEnter - a.percentFromEnter))
        }
      },
      providesTags: (result, error, args) => [{ type: 'enterExitPlans' }],
      async onCacheEntryAdded(arg, { getState, updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch },)
      {
        const userId = getState().auth.userId
        const ws = getWebSocket(userId, 'PlannedWatchListTickers')

        const incomingTradeListener = (data) =>
        {
          updateCachedData((draft) =>
          {
            let entityToUpdate
            if (draft.enterBufferHit.ids.includes(data.tickerSymbol)) { entityToUpdate = draft.enterBufferHit.entities[data.tickerSymbol] }
            else if (draft.stopLossHit.ids.includes(data.tickerSymbol)) { entityToUpdate = draft.stopLossHit.entities[data.tickerSymbol] }
            else { entityToUpdate = draft.plannedTickers.entities[data.tickerSymbol] }



            if (entityToUpdate)
            {
              entityToUpdate.mostRecentPrice = data.tradePrice
              entityToUpdate.percentFromEnter = ((entityToUpdate.plan.enterPrice - data.tradePrice) / entityToUpdate.plan.enterPrice) * 100
              entityToUpdate.changeFromYesterdayClose = entityToUpdate.mostRecentPrice - entityToUpdate.yesterdayClose
              entityToUpdate.currentDayPercentGain = (entityToUpdate.changeFromYesterdayClose / entityToUpdate.yesterdayClose) * 100

              entityToUpdate.currentRiskVReward = {
                risk: ((entityToUpdate.mostRecentPrice - entityToUpdate.plan.stopLossPrice) * 100 / entityToUpdate.mostRecentPrice),
                reward: ((entityToUpdate.plan.exitPrice - entityToUpdate.mostRecentPrice) * 100 / entityToUpdate.mostRecentPrice),
              }

              let sharesToBuyWith1000DollarsCurrent = Math.floor(1000 / entityToUpdate.mostRecentPrice)
              entityToUpdate.with1000DollarsCurrentGain = (entityToUpdate.plan.exitPrice - entityToUpdate.mostRecentPrice) * sharesToBuyWith1000DollarsCurrent
              entityToUpdate.with1000DollarsCurrentRisk = (entityToUpdate.plan.stopLossPrice - entityToUpdate.mostRecentPrice) * sharesToBuyWith1000DollarsCurrent

              function getInsertionIndexLinear(arr, num)
              {
                for (let i = 0; i < 3; i++) { if (arr[i] >= num) { return i; } }
                return 3;
              }
              let priceVsPlan = getInsertionIndexLinear([entityToUpdate.plan.stopLossPrice, entityToUpdate.plan.enterPrice, entityToUpdate.plan.enterBufferPrice], data.tradePrice)
              if (!entityToUpdate.listChange && priceVsPlan !== entityToUpdate.priceVsPlanUponFetch)
                entityToUpdate.listChange = true
            }
          })
        }
        try
        {
          await cacheDataLoaded
          subscribe('enterExitWatchListPrice', incomingTradeListener, 'PlannedWatchListTickers')
        } catch (error)
        {
          await cacheEntryRemoved
          unsubscribe('enterExitWatchListPrice', incomingTradeListener, userId, 'PlannedWatchListTickers')
        }

        await cacheEntryRemoved
        unsubscribe('enterExitWatchListPrice', incomingTradeListener, userId, 'PlannedWatchListTickers')
      }
    }),
    toggleEnterExitPlanImportant: builder.mutation({
      query: (args) => ({
        url: `/enterExitPlan/importance/${args.planId}?markImportant=${args.markImportant}`
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled, getState })
      {
        try
        {
          const { data: updatedEnterExitWithImportance } = await queryFulfilled;

          dispatch(
            EnterExitPlanApiSlice.util.updateQueryData('getUsersEnterExitPlan', undefined, (draft) =>
            {
              let entityToMove
              if (draft.enterBufferHit.ids.includes(args.tickerSymbol)) { entityToMove = draft.enterBufferHit.entities[args.tickerSymbol] }
              else if (draft.stopLossHit.ids.includes(args.tickerSymbol)) { entityToMove = draft.stopLossHit.entities[args.tickerSymbol] }
              else { entityToMove = draft.plannedTickers.entities[args.tickerSymbol] }

              if (updatedEnterExitWithImportance?.highImportance && updatedEnterExitWithImportance.highImportance !== undefined)
              {
                entityToMove.highImportance = updatedEnterExitWithImportance.highImportance
                entityToMove.extentProb = updatedEnterExitWithImportance.extentProb
                entityToMove.morningMetrics = updatedEnterExitWithImportance.morningMetrics
              } else
              {
                entityToMove.highImportance = undefined
              }
            })
          )

        } catch (error)
        {
          console.log(error)
        }
      }
    }),
    toggleEnterExitPlanWatchTomorrow: builder.mutation({
      query: (args) => ({
        url: `/enterExitPlan/watchTomorrow/${args.planId}?markTomorrow=${args.markTomorrow}`
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled, getState })
      {
        try
        {
          const { data: updatedEnterExitWithTomorrow } = await queryFulfilled;

          dispatch(
            EnterExitPlanApiSlice.util.updateQueryData('getUsersEnterExitPlan', undefined, (draft) =>
            {
              let entityToMove
              if (draft.enterBufferHit.ids.includes(args.tickerSymbol)) { entityToMove = draft.enterBufferHit.entities[args.tickerSymbol] }
              else if (draft.stopLossHit.ids.includes(args.tickerSymbol)) { entityToMove = draft.stopLossHit.entities[args.tickerSymbol] }
              else { entityToMove = draft.plannedTickers.entities[args.tickerSymbol] }

              if (updatedEnterExitWithTomorrow?.watchForTomorrow && updatedEnterExitWithTomorrow.watchForTomorrow !== undefined)
              {

                entityToMove.watchForTomorrow = updatedEnterExitWithTomorrow.watchForTomorrow
              } else
              {
                entityToMove.watchForTomorrow = undefined
              }
            })
          )

        } catch (error)
        {
          console.log(error)
        }
      }
    }),
    toggleEnterExitPlanUpdateNeeded: builder.mutation({
      query: (args) => ({
        url: `/enterExitPlan/needsUpdate/${args.planId}?markUpdate=${args.markUpdate}`
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled, getState })
      {
        try
        {
          const { data: updatedEnterExitWithUpdate } = await queryFulfilled;

          dispatch(
            EnterExitPlanApiSlice.util.updateQueryData('getUsersEnterExitPlan', undefined, (draft) =>
            {
              let entityToMove
              if (draft.enterBufferHit.ids.includes(args.tickerSymbol)) { entityToMove = draft.enterBufferHit.entities[args.tickerSymbol] }
              else if (draft.stopLossHit.ids.includes(args.tickerSymbol)) { entityToMove = draft.stopLossHit.entities[args.tickerSymbol] }
              else { entityToMove = draft.plannedTickers.entities[args.tickerSymbol] }

              if (updatedEnterExitWithUpdate?.updateNeededDate && updatedEnterExitWithUpdate.updateNeededDate !== undefined)
              {

                entityToMove.updateNeededDate = updatedEnterExitWithUpdate.updateNeededDate
              } else
              {
                entityToMove.updateNeededDate = undefined
              }
            })
          )

        } catch (error)
        {
          console.log(error)
        }
      }
    }),
    updateEnterExitPlan: builder.mutation({
      async queryFn(args, api, extraOptions, baseQuery)
      {
        const state = api.getState()
        let result
        let updatedEnterExit = state.enterExitElement[args.ticker]
        if (!updatedEnterExit)
        {
          updatedEnterExit = state.chartingElement[args.ticker].enterExitLines
          result = await baseQuery({
            url: `/enterExitPlan/initiate/${args.chartId}`,
            method: 'POST',
            body: updatedEnterExit
          })
        } else
        {
          result = await baseQuery({
            url: `/enterExitPlan/update/${updatedEnterExit.id}`,
            method: 'PUT',
            body: updatedEnterExit
          })
        }

        return result.data ? { data: result.data } : { error: result.error }
      },
      invalidatesTags: (result, error, args) => [{ type: 'chartingData', id: args.ticker }, 'enterExitPlans', 'confirmedSummary', 'singleEnterExit', { type: 'activeTrades', id: args.ticker }]
    }),
    removeSingleEnterExitPlan: builder.mutation({
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
        return result.data ? { data: result.data } : { error: result.error }
      },
      invalidatesTags: (result, error, args) => ['userData', 'chartingData', 'enterExitPlans', 'confirmedSummary']
    }),
    removeGroupedEnterExitPlan: builder.mutation({
      async queryFn(args, api, extraOptions, baseQuery)
      {
        const state = api.getState()
        const initializationEndpointDataSelector = InitializationApiSlice.endpoints.getUserInitialization.select(undefined)
        const userInitializationData = initializationEndpointDataSelector(state);
        const userStockHistory = userInitializationData?.data.userStockHistory

        let historyIds = []
        userStockHistory.forEach((t) => { if (args.removeTickers.includes(t.symbol)) historyIds.push(t._id) })

        let result = await baseQuery({
          url: `/enterExitPlan/viability`,
          method: 'DELETE',
          body: { removeThesePlans: args.removeIds, removeTheseTickers: args.removeTickers, removeHistory: historyIds },
        })

        return result.data ? { data: result.data } : { error: result.error }
      },
      invalidatesTags: (result, error, args) => ['userData', 'chartingData', 'enterExitPlans', 'confirmedSummary']
    }),
    getTinyEnterExit5MinCharts: builder.query({
      query: () => ({
        url: `/user/enterExitPlans/tiny`,
        validateStatus: (response, result) => { return response.status === 200 && !result.isError }
      }),
      transformResponse: responseData =>
      {
        return fiveMinPlanAdapter.setAll(fiveMinPlanAdapter.getInitialState(), responseData)
      }
    }),
    updateEnterExitCheckOffCriteria: builder.mutation({
      query: (args) => ({
        url: `/enterExitPlan/criteriaCheckoff/${args.planId}?${args.criteria}=${args.criteriaValue}`
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled, getState })
      {
        try
        {
          const { data } = await queryFulfilled;
          dispatch(
            EnterExitPlanApiSlice.util.updateQueryData('getUsersEnterExitPlan', undefined, (draft) =>
            {
              let entityToUpdate
              if (draft.enterBufferHit.ids.includes(data.ticker)) { entityToUpdate = draft.enterBufferHit.entities[data.ticker] }
              else if (draft.stopLossHit.ids.includes(data.ticker)) { entityToUpdate = draft.stopLossHit.entities[data.ticker] }
              else { entityToUpdate = draft.plannedTickers.entities[data.ticker] }


              const converted = Object.fromEntries(
                Object.entries(data.criteria).map(([key, value]) =>
                {
                  if (value === "true") return [key, true];
                  if (value === "false") return [key, false];
                  return [key, value]; // Leave other types unchanged
                })
              );

              if (entityToUpdate) { entityToUpdate.checkOffCriteria = { ...entityToUpdate.checkOffCriteria, ...converted } }
            }
            ))



        } catch (error)
        {
          console.log(error)
        }
      }
    })
  })
});

export const { useGetUsersEnterExitPlanQuery,
  useToggleEnterExitPlanImportantMutation,
  useToggleEnterExitPlanWatchTomorrowMutation,
  useToggleEnterExitPlanUpdateNeededMutation,
  useUpdateEnterExitPlanMutation,
  useRemoveSingleEnterExitPlanMutation,
  useRemoveGroupedEnterExitPlanMutation,
  useUpdateEnterExitCheckOffCriteriaMutation,
  useGetTinyEnterExit5MinChartsQuery } = EnterExitPlanApiSlice;



export const enterExitPlannedSelectors = enterExitAdapter.getSelectors()
export const enterBufferSelectors = enterBufferHitAdapter.getSelectors()
export const stopLossHitSelectors = stopLossHitAdapter.getSelectors()



const selectFiveMinResult = EnterExitPlanApiSlice.endpoints.getTinyEnterExit5MinCharts.select()
const selectFiveMinData = createSelector(selectFiveMinResult, (fiveMinResult) => fiveMinResult.data)
export const fiveMinSelectors = fiveMinPlanAdapter.getSelectors((state) => selectFiveMinData(state))



const stopLossHit = stopLossHitAdapter.getSelectors(state => state.stopLossHit)
const enterBuffer = enterBufferHitAdapter.getSelectors(state => state.enterBufferHit)
const allOtherPlans = enterExitAdapter.getSelectors(state => state.plannedTickers)


export const enterExitPlanSectorFilter = (sectorToFilterFor) => createSelector([(queryResults) => queryResults.data],
  (data) =>
  {

    if (!data) return { highImportance: [] }

    const stopLossHit = stopLossHitAdapter.getSelectors().selectAll(data.stopLossHit)
    const enterBuffer = enterBufferHitAdapter.getSelectors().selectAll(data.enterBufferHit)
    const allOtherPlans = enterExitAdapter.getSelectors().selectAll(data.plannedTickers)

    let highImportance = []
    stopLossHit.map((t) => { if (t.highImportance) highImportance.push(t) })
    enterBuffer.map((t) => { if (t.highImportance) highImportance.push(t) })
    allOtherPlans.map((t) => { if (t.highImportance) highImportance.push(t) })

    if (sectorToFilterFor === 'all') return highImportance
    return highImportance.filter(t => t.sector === sectorToFilterFor).sort((a, b) => b.correlationValues.sector - a.correlationValues.sector)

  }
)

export const enterExitBySector = (sectorForFilter) => createSelector([(queryResults) => queryResults.data],
  (data) =>
  {
    if (!data) return []

    const stopLossHit = stopLossHitAdapter.getSelectors().selectAll(data.stopLossHit)
    const enterBuffer = enterBufferHitAdapter.getSelectors().selectAll(data.enterBufferHit)
    const allOtherPlans = enterExitAdapter.getSelectors().selectAll(data.plannedTickers)
    let sectorResults = []
    stopLossHit.map(t => { if (t.sector === sectorForFilter) sectorResults.push(t) })
    enterBuffer.map(t => { if (t.sector === sectorForFilter) sectorResults.push(t) })
    allOtherPlans.map(t => { if (t.sector === sectorForFilter) sectorResults.push(t) })
    return sectorResults.sort((a, b) => b.correlationValues.sector - a.correlationValues.sector)

  }
)



export const selectCombinedHighImportance = createSelector([(res) => res.data], (data) =>
{
  if (!data) return { highImportance: [] }

  const stopLossHit = stopLossHitAdapter.getSelectors().selectAll(data.stopLossHit)
  const enterBuffer = enterBufferHitAdapter.getSelectors().selectAll(data.enterBufferHit)
  const allOtherPlans = enterExitAdapter.getSelectors().selectAll(data.plannedTickers)

  let highImportance = []
  stopLossHit.map((t) => { if (t.highImportance) highImportance.push(t) })
  enterBuffer.map((t) => { if (t.highImportance) highImportance.push(t) })
  allOtherPlans.map((t) => { if (t.highImportance) highImportance.push(t) })
  return highImportance
})

export const selectCombinedWatchForTomorrow = createSelector([(res) => res.data], (data) =>
{
  if (!data) return []

  const stopLossHit = stopLossHitAdapter.getSelectors().selectAll(data.stopLossHit)
  const enterBuffer = enterBufferHitAdapter.getSelectors().selectAll(data.enterBufferHit)
  const allOtherPlans = enterExitAdapter.getSelectors().selectAll(data.plannedTickers)

  let watchForTomorrow = []
  stopLossHit.map((t) => { if (t.watchForTomorrow) watchForTomorrow.push(t) })
  enterBuffer.map((t) => { if (t.watchForTomorrow) watchForTomorrow.push(t) })
  allOtherPlans.map((t) => { if (t.watchForTomorrow) watchForTomorrow.push(t) })
  return watchForTomorrow
})





export const selectAllPlansAndCombined = createSelector([(res) => res.data],
  (data) =>
  {
    if (!data) return { stopLossHit: [], enterBuffer: [], allOtherPlans: [], combined: [] }

    const stopLossHit = stopLossHitAdapter.getSelectors().selectAll(data.stopLossHit)
    const enterBuffer = enterBufferHitAdapter.getSelectors().selectAll(data.enterBufferHit)
    const allOtherPlans = enterExitAdapter.getSelectors().selectAll(data.plannedTickers)
    const counts = { stopLoss: stopLossHit.length, enterBuffer: enterBuffer.length, allOtherPlans: allOtherPlans.length }

    return {
      counts,
      stopLossHit,
      enterBuffer,
      allOtherPlans,

      allOtherPlansCount: allOtherPlans.length,

      totalCount: counts.stopLoss + counts.enterBuffer + counts.allOtherPlans,
      combined: [...stopLossHit, ...enterBuffer, ...allOtherPlans]
    }
  })
