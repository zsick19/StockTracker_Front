import { createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
const { getWebSocket, subscribe, unsubscribe } = setupWebSocket();

const enterExitAdapter = createEntityAdapter({})
const enterBufferHitAdapter = createEntityAdapter({})
const stopLossHitAdapter = createEntityAdapter({})

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
        const currentTime = new Date().getUTCDate()
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

          switch (enterExit.priceHitSinceTracked)
          {
            case 0: plansResponse.push(enterExit); break;
            case 1: enterBufferResponse.push(enterExit); break;
            case 2: enterBufferResponse.push(enterExit); break;
            case 3: stopLossResponse.push(enterExit); break;
          }
        })


        return {
          enterBufferHit: enterBufferHitAdapter.setAll(enterBufferHitAdapter.getInitialState(), enterBufferResponse.sort((a, b) => b.percentFromEnter - a.percentFromEnter)),
          stopLossHit: stopLossHitAdapter.setAll(stopLossHitAdapter.getInitialState(), stopLossResponse.sort((a, b) => b.percentFromEnter - a.percentFromEnter)),
          plannedTickers: enterExitAdapter.setAll(enterExitAdapter.getInitialState(), plansResponse.sort((a, b) => b.percentFromEnter - a.percentFromEnter))
        }
      },
      async onCacheEntryAdded(arg, { getState, updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch },)
      {

        const userId = getState().auth.userId
        const ws = getWebSocket(userId, 'PlannedWatchListTickers')

        const incomingTradeListener = (data) =>
        {
          updateCachedData((draft) =>
          {
            let enterBufferEntity = draft.enterBufferHit.entities[data.ticker]
            if (enterBufferEntity === undefined) { enterBufferEntity = draft.stopLossHit.entities[data.ticker] }
            if (enterBufferEntity === undefined) enterBufferEntity = draft.plannedTickers.entities[data.ticker]

            if (enterBufferEntity)
            {
              enterBufferEntity.mostRecentPrice = data.price
              enterBufferEntity.percentFromEnter = ((enterBufferEntity.plan.enterPrice - data.price) / enterBufferEntity.plan.enterPrice) * 100
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
      invalidatesTags: (result, error, args) => [{ type: 'chartingData', id: args.chartId }]
    })
  }),
});

export const { useGetUsersEnterExitPlanQuery, useUpdateEnterExitPlanMutation } = EnterExitPlanApiSlice;



export const enterExitPlannedSelectors = enterExitAdapter.getSelectors()
export const enterBufferSelectors = enterBufferHitAdapter.getSelectors()
export const stopLossHitSelectors = stopLossHitAdapter.getSelectors()

