import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";
import { differenceInDays } from "date-fns";
const { getWebSocket, subscribe, unsubscribe } = setupWebSocket();

export const enterExitAdapter = createEntityAdapter({})
export const enterBufferHitAdapter = createEntityAdapter({})
export const stopLossHitAdapter = createEntityAdapter({})

const initialState = {
  enterExit: enterExitAdapter.getInitialState(),
  enterBufferHit: enterBufferHitAdapter.getInitialState(),
  stopLossHit: stopLossHitAdapter.getInitialState()
}

export const EnterExitPlanApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsersEnterExitPlan: builder.query({
      query: () => ({
        url: `/user/enterExitPlans`,
        validateStatus: (response, result) =>
        {
          return response.status === 200 && !result.isError
        }
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
          enterExit.dailyOpenPrice = stockTradeData.DailyBar.OpenPrice
          enterExit.currentDayPercentGain = (currentTime < target.getUTCDate() ? 0 : ((enterExit.mostRecentPrice - enterExit.dailyOpenPrice) / enterExit.dailyOpenPrice) * 100)
          enterExit.percentFromEnter = ((enterExit.plan.enterPrice - enterExit.mostRecentPrice) / enterExit.plan.enterPrice) * 100
          enterExit.trackingDays = differenceInDays(today, enterExit.dateAdded)

          function getInsertionIndexLinear(arr, num)
          {
            for (let i = 0; i < 3; i++) { if (arr[i] >= num) { return i; } }
            return 3;
          }
          let priceVsPlan = getInsertionIndexLinear([enterExit.plan.stopLossPrice, enterExit.plan.enterPrice, enterExit.plan.enterBufferPrice], stockTradeData.LatestTrade.Price)
          enterExit.priceVsPlanUponFetch = priceVsPlan
          enterExit.listChange = false

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
            if (draft.enterBufferHit.ids.includes(data.ticker)) { entityToUpdate = draft.enterBufferHit.entities[data.ticker] }
            else if (draft.stopLossHit.ids.includes(data.ticker)) { entityToUpdate = draft.stopLossHit.entities[data.ticker] }
            else { entityToUpdate = draft.plannedTickers.entities[data.ticker] }

            if (entityToUpdate)
            {
              entityToUpdate.mostRecentPrice = data.price
              entityToUpdate.percentFromEnter = ((entityToUpdate.plan.enterPrice - data.price) / entityToUpdate.plan.enterPrice) * 100

              function getInsertionIndexLinear(arr, num)
              {
                for (let i = 0; i < 3; i++) { if (arr[i] >= num) { return i; } }
                return 3;
              }
              let priceVsPlan = getInsertionIndexLinear([enterExit.plan.stopLossPrice, enterExit.plan.enterPrice, enterExit.plan.enterBufferPrice], stockTradeData.LatestTrade.Price)
              if (!entityToUpdate.listChange && priceVsPlan !== entityToUpdate.priceVsPlanUponFetch) entityToUpdate.listChange = true
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
      invalidatesTags: (result, error, args) => [{ type: 'chartingData', id: args.chartId }, 'enterExitPlans']
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
      invalidatesTags: (result, error, args) => ['userData', 'chartingData', 'enterExitPlans']
    })
  }),
});

export const { useGetUsersEnterExitPlanQuery, useUpdateEnterExitPlanMutation, useRemoveGroupedEnterExitPlanMutation } = EnterExitPlanApiSlice;



export const enterExitPlannedSelectors = enterExitAdapter.getSelectors()
export const enterBufferSelectors = enterBufferHitAdapter.getSelectors()
export const stopLossHitSelectors = stopLossHitAdapter.getSelectors()

export const selectAllPlansAndCombined = createSelector([(res) => res.data],
  (data) =>
  {
    if (!data) return { stopLossHit: [], enterBuffer: [], allOtherPlans: [], combined: [] }

    const stopLossHit = stopLossHitAdapter.getSelectors().selectAll(data.stopLossHit)
    const enterBuffer = enterBufferHitAdapter.getSelectors().selectAll(data.enterBufferHit)
    const allOtherPlans = enterExitAdapter.getSelectors().selectAll(data.plannedTickers)
    const counts = {
      stopLoss: stopLossHit.length,
      enterBuffer: enterBuffer.length,
      allOtherPlans: allOtherPlans.length,
    }


    return {
      stopLossHit,
      counts,
      enterBuffer,
      allOtherPlans,
      allOtherPlansCount: allOtherPlans.length,
      totalCount: counts.stopLoss + counts.enterBuffer + counts.allOtherPlans,
      combined: [...stopLossHit, ...enterBuffer, ...allOtherPlans]
    }
  })