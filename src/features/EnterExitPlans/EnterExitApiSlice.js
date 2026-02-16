import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";
import { differenceInBusinessDays, differenceInDays } from "date-fns";
const { getWebSocket, subscribe, unsubscribe } = setupWebSocket();

export const enterExitAdapter = createEntityAdapter({})
export const enterBufferHitAdapter = createEntityAdapter({})
export const stopLossHitAdapter = createEntityAdapter({})
export const highImportanceAdapter = createEntityAdapter({})

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

        const highImportanceResponse = []
        const enterBufferResponse = []
        const stopLossResponse = []
        const plansResponse = []
        const today = new Date()
        const currentTime = today.getUTCDate()
        const target = new Date()
        target.setHours(9, 30, 0, 0)

        //console.log(responseData.mostRecentPrice)

        responseData.plans.forEach((enterExit) =>
        {
          let stockTradeData = responseData.mostRecentPrice[listOfTickers.indexOf(enterExit.tickerSymbol)]

          enterExit.id = enterExit.tickerSymbol
          enterExit.mostRecentPrice = stockTradeData.LatestTrade.Price
          enterExit.changeFromYesterdayClose = enterExit.mostRecentPrice - stockTradeData.PrevDailyBar.ClosePrice
          enterExit.yesterdayClose = stockTradeData.PrevDailyBar.ClosePrice
          enterExit.currentDayPercentGain = (currentTime < target.getUTCDate() ? 0 :
            ((enterExit.mostRecentPrice - enterExit.yesterdayClose) / enterExit.yesterdayClose) * 100)

          enterExit.percentFromEnter = ((enterExit.plan.enterPrice - enterExit.mostRecentPrice) / enterExit.plan.enterPrice) * 100
          enterExit.trackingDays = differenceInBusinessDays(today, new Date(enterExit.dateAdded))

          enterExit.currentRiskVReward = {
            risk: ((enterExit.mostRecentPrice - enterExit.plan.stopLossPrice) * 100 / enterExit.mostRecentPrice),
            reward: ((enterExit.plan.exitPrice - enterExit.mostRecentPrice) * 100 / enterExit.mostRecentPrice),
          }


          let sharesToBuyWith1000DollarsIdeal = Math.floor(1000 / enterExit.plan.enterPrice)
          enterExit.with1000DollarsIdealGain = (enterExit.plan.exitPrice - enterExit.plan.enterPrice) * sharesToBuyWith1000DollarsIdeal


          let sharesToBuyWith1000DollarsCurrent = Math.floor(1000 / enterExit.mostRecentPrice)
          enterExit.with1000DollarsCurrentGain = (enterExit.plan.exitPrice - enterExit.mostRecentPrice) * sharesToBuyWith1000DollarsCurrent





          function getInsertionIndexLinear(arr, num)
          {
            for (let i = 0; i < 3; i++) { if (arr[i] >= num) { return i; } } return 3;
          }

          let priceVsPlan = getInsertionIndexLinear([enterExit.plan.stopLossPrice, enterExit.plan.enterPrice, enterExit.plan.enterBufferPrice], stockTradeData.LatestTrade.Price)
          enterExit.priceVsPlanUponFetch = priceVsPlan
          enterExit.listChange = false

          if (enterExit?.highImportance)
          {
            highImportanceResponse.push(enterExit)
          } else
          {
            switch (priceVsPlan)
            {
              case 0: stopLossResponse.push(enterExit); break;
              case 1: enterBufferResponse.push(enterExit); break;
              case 2: enterBufferResponse.push(enterExit); break;
              case 3: plansResponse.push(enterExit); break;
            }
          }
        })


        return {
          highImportance: highImportanceAdapter.setAll(highImportanceAdapter.getInitialState(), highImportanceResponse.sort((a, b) => b.percentFromEnter - a.percentFromEnter)),
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
            if (draft.highImportance.ids.includes(data.tickerSymbol)) { entityToUpdate = draft.highImportance.entities[data.tickerSymbol] }
            else if (draft.enterBufferHit.ids.includes(data.tickerSymbol)) { entityToUpdate = draft.enterBufferHit.entities[data.tickerSymbol] }
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



              function getInsertionIndexLinear(arr, num)
              {
                for (let i = 0; i < 3; i++) { if (arr[i] >= num) { return i; } }
                return 3;
              }
              let priceVsPlan = getInsertionIndexLinear([entityToUpdate.plan.stopLossPrice, entityToUpdate.plan.enterPrice, entityToUpdate.plan.enterBufferPrice], data.tradePrice)
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
              if (updatedEnterExitWithImportance?.highImportance && updatedEnterExitWithImportance.highImportance !== undefined)
              {
                let entityToMove
                if (draft.enterBufferHit.ids.includes(args.tickerSymbol))
                {
                  entityToMove = draft.enterBufferHit.entities[args.tickerSymbol]
                  enterBufferHitAdapter.removeOne(draft.enterBufferHit, entityToMove.id)
                }
                else if (draft.stopLossHit.ids.includes(args.tickerSymbol))
                {
                  entityToMove = draft.stopLossHit.entities[args.tickerSymbol]
                  stopLossHitAdapter.removeOne(draft.stopLossHit, entityToMove.id)
                }
                else
                {
                  entityToMove = draft.plannedTickers.entities[args.tickerSymbol]
                  enterExitAdapter.removeOne(draft.plannedTickers, entityToMove.id)
                }

                entityToMove.highImportance = updatedEnterExitWithImportance.highImportance
                highImportanceAdapter.addOne(draft.highImportance, entityToMove)
              }
              else
              {
                let entityToMove = draft.highImportance.entities[args.tickerSymbol]
                entityToMove.highImportance = undefined

                switch (entityToMove.priceVsPlanUponFetch)
                {
                  case 0: stopLossHitAdapter.addOne(draft.stopLossHit, entityToMove); break;
                  case 1: enterBufferHitAdapter.addOne(draft.enterBufferHit, entityToMove); break;
                  case 2: enterBufferHitAdapter.addOne(draft.enterBufferHit, entityToMove); break;
                  case 3: enterExitAdapter.addOne(draft.plannedTickers, entityToMove); break;
                }

                enterExitAdapter.removeOne(draft.highImportance, entityToMove.id)
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
      invalidatesTags: (result, error, args) => [{ type: 'chartingData', id: args.chartId }, 'enterExitPlans']
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
      invalidatesTags: (result, error, args) => ['userData', 'chartingData', 'enterExitPlans']
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

export const { useGetUsersEnterExitPlanQuery, useToggleEnterExitPlanImportantMutation, useUpdateEnterExitPlanMutation, useRemoveSingleEnterExitPlanMutation, useRemoveGroupedEnterExitPlanMutation } = EnterExitPlanApiSlice;


export const highImportanceSelectors = highImportanceAdapter.getSelectors()
export const enterExitPlannedSelectors = enterExitAdapter.getSelectors()
export const enterBufferSelectors = enterBufferHitAdapter.getSelectors()
export const stopLossHitSelectors = stopLossHitAdapter.getSelectors()

export const selectAllPlansAndCombined = createSelector([(res) => res.data],
  (data) =>
  {
    if (!data) return { highImportance: [], stopLossHit: [], enterBuffer: [], allOtherPlans: [], combined: [] }

    const highImportanceTickers = highImportanceAdapter.getSelectors().selectAll(data.highImportance)
    const stopLossHit = stopLossHitAdapter.getSelectors().selectAll(data.stopLossHit)
    const enterBuffer = enterBufferHitAdapter.getSelectors().selectAll(data.enterBufferHit)
    const allOtherPlans = enterExitAdapter.getSelectors().selectAll(data.plannedTickers)
    const counts = { highImportance: highImportanceTickers.length, stopLoss: stopLossHit.length, enterBuffer: enterBuffer.length, allOtherPlans: allOtherPlans.length }


    return {
      counts,
      stopLossHit,
      enterBuffer,
      allOtherPlans,
      highImportance: highImportanceTickers,
      allOtherPlansCount: allOtherPlans.length,

      totalCount: counts.stopLoss + counts.enterBuffer + counts.allOtherPlans + counts.highImportance,
      combined: [...stopLossHit, ...enterBuffer, ...allOtherPlans, ...highImportanceTickers]
    }
  })