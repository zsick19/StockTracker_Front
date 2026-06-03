import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
import { enterBufferHitAdapter, enterExitAdapter, EnterExitPlanApiSlice, stopLossHitAdapter } from "../EnterExitPlans/EnterExitApiSlice";
import { addMinutes, isToday } from "date-fns";
const { getWebSocket, subscribe, unsubscribe } = setupWebSocket();

const activeTradeAdapter = createEntityAdapter()
const activeTradeGraphAdapter = createEntityAdapter()

export const TradeApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsersActiveTrades: builder.query({
            query: () => ({
                url: `/trades/active`,
            }),
            transformResponse: (response) =>
            {

                let tradeResponse = response.activeTrades.map((trade) =>
                {
                    trade.id = trade.tickerSymbol
                    trade.mostRecentPrice = response.mostRecentPrices[trade.tickerSymbol]
                    trade.previousClose = response.previousClose[trade.tickerSymbol]


                    trade.dailyCandles = response.dailyCandles[trade.tickerSymbol]
                    trade.openPrice = response.openPrice[trade.tickerSymbol]

                    trade.percentOfGain = ((trade.mostRecentPrice - trade.tradingPlanPrices[1]) / (trade.tradingPlanPrices[4] - trade.tradingPlanPrices[1]) * 100)
                    trade.gainPerShare = trade.mostRecentPrice - trade.averagePurchasePrice
                    trade.percentFromOpen = ((trade.mostRecentPrice - trade.tradingPlanPrices[1]) / trade.tradingPlanPrices[1]) * 100
                    trade.totalGain = trade.gainPerShare * trade.availableShares

                    trade.percentFromPlanPrices = [(trade.mostRecentPrice - trade.tradingPlanPrices[0]) * 100 / trade.tradingPlanPrices[0],
                    (trade.mostRecentPrice - trade.tradingPlanPrices[1]) * 100 / trade.tradingPlanPrices[1],
                    (trade.mostRecentPrice - trade.tradingPlanPrices[2]) * 100 / trade.tradingPlanPrices[2],
                    (trade.mostRecentPrice - trade.tradingPlanPrices[3]) * 100 / trade.tradingPlanPrices[3],
                    (trade.mostRecentPrice - trade.tradingPlanPrices[4]) * 100 / trade.tradingPlanPrices[4],
                    (trade.mostRecentPrice - trade.tradingPlanPrices[5]) * 100 / trade.tradingPlanPrices[5]]

                    if (isToday(trade.enterDate))
                    {
                        trade.todaysGain = trade.totalGain
                        trade.todaysGainPercent = trade.percentFromOpen
                    } else
                    {
                        trade.todaysGain = (trade.mostRecentPrice - trade.previousClose) * trade.availableShares
                        trade.todaysGainPercent = ((trade.mostRecentPrice - trade.previousClose) / trade.previousClose) * 100
                    }


                    function getInsertionIndex(arr, num)
                    {
                        const index = arr.findIndex(element => element >= num);
                        return index === -1 ? arr.length : index;
                    }

                    switch (getInsertionIndex(trade.tradingPlanPrices, trade.mostRecentPrice))
                    {
                        case 0: trade.classVisual = 'belowStopLoss'; break;
                        case 1: trade.percentFromPlanPrices[0] < 0.5 ? trade.classVisual = 'nearStopLoss' : trade.classVisual = 'belowEnter'; break;
                        case 2: trade.percentFromPlanPrices[1] < 0.5 ? trade.classVisual = 'nearEnter' : trade.classVisual = 'belowEnterBuffer'; break;
                        case 3: trade.percentFromPlanPrices[2] < 0.5 ? trade.classVisual = 'nearEnterBuffer' : trade.classVisual = 'belowExitBuffer'; break;
                        case 4: trade.percentFromPlanPrices[3] < 0.5 ? trade.classVisual = 'nearExitBuffer' : trade.classVisual = 'belowExit'; break;
                        case 5: trade.percentFromPlanPrices[4] < 0.5 ? trade.classVisual = 'nearExit' : trade.classVisual = 'belowMoon'; break;
                        case 6: trade.classVisual = 'aboveMoon'; break;
                    }

                    trade.priceDirection = undefined

                    return trade
                })

                return activeTradeAdapter.setAll(activeTradeAdapter.getInitialState(), tradeResponse)
            },
            async onCacheEntryAdded(arg, { getState, updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch },)
            {

                const userId = getState().auth.userId
                const ws = getWebSocket(userId, 'ActiveTrades')


                const incomingTradeListener = (data) =>
                {
                    updateCachedData((draft) =>
                    {

                        let activeTradeToUpdate = draft.entities[data.tickerSymbol]
                        if (activeTradeToUpdate === undefined) return



                        if (data.Price > activeTradeToUpdate.mostRecentPrice) activeTradeToUpdate.priceDirection = 'positiveDirection'
                        else if (data.Price < activeTradeToUpdate.mostRecentPrice) activeTradeToUpdate.priceDirection = 'negativeDirection'

                        activeTradeToUpdate.mostRecentPrice = data.Price

                        activeTradeToUpdate.percentOfGain = ((activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[1]) / (activeTradeToUpdate.tradingPlanPrices[4] - activeTradeToUpdate.tradingPlanPrices[1]) * 100)
                        activeTradeToUpdate.gainPerShare = activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.averagePurchasePrice
                        activeTradeToUpdate.percentFromOpen = ((activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[1]) / activeTradeToUpdate.tradingPlanPrices[1]) * 100
                        activeTradeToUpdate.totalGain = activeTradeToUpdate.gainPerShare * activeTradeToUpdate.availableShares

                        activeTradeToUpdate.percentFromPlanPrices = [
                            (activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[0]) * 100 / activeTradeToUpdate.tradingPlanPrices[0],
                            (activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[1]) * 100 / activeTradeToUpdate.tradingPlanPrices[1],
                            (activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[2]) * 100 / activeTradeToUpdate.tradingPlanPrices[2],
                            (activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[3]) * 100 / activeTradeToUpdate.tradingPlanPrices[3],
                            (activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[4]) * 100 / activeTradeToUpdate.tradingPlanPrices[4],
                            (activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[5]) * 100 / activeTradeToUpdate.tradingPlanPrices[5]
                        ]


                        if (isToday(activeTradeToUpdate.enterDate))
                        {
                            activeTradeToUpdate.todaysGain = activeTradeToUpdate.totalGain
                            activeTradeToUpdate.todaysGainPercent = activeTradeToUpdate.percentFromOpen
                        } else
                        {
                            activeTradeToUpdate.todaysGain = (activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.previousClose) * activeTradeToUpdate.availableShares
                            activeTradeToUpdate.todaysGainPercent = ((activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.previousClose) / activeTradeToUpdate.previousClose) * 100
                        }




                        function getInsertionIndex(arr, num)
                        {
                            const index = arr.findIndex(element => element >= num);
                            return index === -1 ? arr.length : index;
                        }

                        switch (getInsertionIndex(activeTradeToUpdate.tradingPlanPrices, activeTradeToUpdate.mostRecentPrice))
                        {
                            case 0: activeTradeToUpdate.classVisual = 'belowStopLoss'; break;
                            case 1: activeTradeToUpdate.percentFromPlanPrices[0] < 0.5 ? activeTradeToUpdate.classVisual = 'nearStopLoss' : activeTradeToUpdate.classVisual = 'belowEnter'; break;
                            case 2: activeTradeToUpdate.percentFromPlanPrices[1] < 0.5 ? activeTradeToUpdate.classVisual = 'nearEnter' : activeTradeToUpdate.classVisual = 'belowEnterBuffer'; break;
                            case 3: activeTradeToUpdate.percentFromPlanPrices[2] < 0.5 ? activeTradeToUpdate.classVisual = 'nearEnterBuffer' : activeTradeToUpdate.classVisual = 'belowExitBuffer'; break;
                            case 4: activeTradeToUpdate.percentFromPlanPrices[3] < 0.5 ? activeTradeToUpdate.classVisual = 'nearExitBuffer' : activeTradeToUpdate.classVisual = 'belowExit'; break;
                            case 5: activeTradeToUpdate.percentFromPlanPrices[4] < 0.5 ? activeTradeToUpdate.classVisual = 'nearExit' : activeTradeToUpdate.classVisual = 'belowMoon'; break;
                            case 6: activeTradeToUpdate.classVisual = 'aboveMoon'; break;
                        }



                        return draft
                    })
                }

                try
                {
                    await cacheDataLoaded
                    subscribe('activeTradePrice', incomingTradeListener, 'ActiveTrades')
                } catch (error)
                {
                    await cacheEntryRemoved
                    unsubscribe('activeTradePrice', incomingTradeListener, userId, 'ActiveTrades')
                }

                await cacheEntryRemoved
                console.log('removed cache entry')
                unsubscribe('activeTradePrice', incomingTradeListener, userId, 'ActiveTrades')
            },
            providesTags: (result) => { return result ? [{ type: 'activeTrades', id: 'LIST' }, ...(result.ids.map((id) => ({ type: 'activeTrades', id })) || []),] : [{ type: 'activeTrades', id: 'LIST' }] }
        }),
        getUsersActiveTradesWithGraph: builder.query({
            query: () => ({
                url: '/trades/activeGraph'
            }),
            transformResponse: (response) =>
            {
                let tradeWithGraphResponse = response.activeTrades.map((trade) =>
                {
                    trade.id = trade.tickerSymbol
                    trade.mostRecentPrice = response.snapShots[trade.tickerSymbol].LatestTrade.Price
                    trade.dailyCandles = response.dailyCandles[trade.tickerSymbol]
                    trade.previousClose = response.snapShots[trade.tickerSymbol].PrevDailyBar.ClosePrice
                    trade.snapShot = response.snapShots[trade.tickerSymbol]
                    trade.percentFromOpen = ((trade.mostRecentPrice - trade.tradingPlanPrices[1]) / trade.tradingPlanPrices[1]) * 100


                    let openBell = new Date()
                    openBell.setHours(9, 30)
                    if (new Date() > openBell)
                    {
                        trade.PrevDailyBar = response.snapShots[trade.tickerSymbol].PrevDailyBar
                        trade.TodayOpenPrice = response.snapShots[trade.tickerSymbol].DailyBar.OpenPrice
                    } else
                    {
                        trade.PrevDailyBar = response.snapShots[trade.tickerSymbol].DailyBar
                        trade.TodayOpenPrice = undefined
                    }
                    trade.mostRecentTickerCandle = response.dailyCandles[trade.tickerSymbol].pop()
                    trade.mostRecentTickerCandle.ClosePrice = response.snapShots[trade.tickerSymbol].LatestTrade.Price
                    trade.mostRecentTickerCandle.Timestamp = response.snapShots[trade.tickerSymbol].LatestTrade.Timestamp

                    trade.percentOfGain = ((trade.mostRecentPrice - trade.tradingPlanPrices[1]) / (trade.tradingPlanPrices[4] - trade.tradingPlanPrices[1]) * 100)

                    trade.todaysATRCapture = trade.mostRecentPrice - trade.previousClose

                    if (isToday(trade.enterDate))
                    {
                        trade.todaysGain = trade.totalGain
                        trade.todaysGainPercent = trade.percentFromOpen
                    } else
                    {
                        trade.todaysGain = (trade.mostRecentPrice - trade.previousClose) * trade.availableShares
                        trade.todaysGainPercent = ((trade.mostRecentPrice - trade.previousClose) / trade.previousClose) * 100
                    }

                    trade.priceDirection = undefined
                    return trade
                })
                return activeTradeGraphAdapter.setAll(activeTradeGraphAdapter.getInitialState(), tradeWithGraphResponse)
            },
            async onCacheEntryAdded(arg, { getState, updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch },)
            {

                const userId = getState().auth.userId
                const ws = getWebSocket(userId, 'ActiveTrades')


                const incomingTradeGraphListener = (data) =>
                {
                    updateCachedData((draft) =>
                    {

                        let activeTradeToUpdate = draft.entities[data.tickerSymbol]
                        if (activeTradeToUpdate === undefined) return



                        if (data.Price > activeTradeToUpdate.mostRecentPrice) activeTradeToUpdate.priceDirection = 'positiveDirection'
                        else if (data.Price < activeTradeToUpdate.mostRecentPrice) activeTradeToUpdate.priceDirection = 'negativeDirection'

                        activeTradeToUpdate.mostRecentPrice = data.Price

                        let compareTimestamp = { previous: activeTradeToUpdate.mostRecentTickerCandle.Timestamp, incoming: data.Timestamp }
                        if (checkForSameTimeFrameCandle(compareTimestamp))
                        {
                            if (activeTradeToUpdate.mostRecentTickerCandle.OpenPrice < data.Price)
                            {
                                //if price is greater than open//compare high...if greater than high--->set close and high to be price
                                //if less than high set close to be price
                                if (data.Price > activeTradeToUpdate.mostRecentTickerCandle.HighPrice) { activeTradeToUpdate.mostRecentTickerCandle.HighPrice = data.Price }
                            } else 
                            {
                                //if price is less than open//compare low...if less than low-->set close and low to be price
                                // //if greater than low set close to be price
                                if (data.Price < activeTradeToUpdate.mostRecentTickerCandle.LowPrice) { activeTradeToUpdate.mostRecentTickerCandle.LowPrice = data.Price }
                            }
                            activeTradeToUpdate.mostRecentTickerCandle.ClosePrice = data.Price
                        } else
                        {
                            let copyOfClosingCandle = activeTradeToUpdate.mostRecentTickerCandle
                            activeTradeToUpdate.dailyCandles.push(activeTradeToUpdate.mostRecentTickerCandle)
                            if (data.Price >= copyOfClosingCandle.ClosePrice) 
                            {
                                activeTradeToUpdate.mostRecentTickerCandle = {
                                    ...copyOfClosingCandle,
                                    Timestamp: provideNewTimeStamp(compareTimestamp.previous).toISOString(),
                                    HighPrice: data.Price,
                                    LowPrice: copyOfClosingCandle.ClosePrice,
                                    OpenPrice: copyOfClosingCandle.ClosePrice,
                                    ClosePrice: data.Price
                                }
                            } else if (data.Price < copyOfClosingCandle.ClosePrice)
                            {
                                activeTradeToUpdate.mostRecentTickerCandle = {
                                    ...copyOfClosingCandle,
                                    Timestamp: provideNewTimeStamp(compareTimestamp.previous).toISOString(),
                                    HighPrice: copyOfClosingCandle.ClosePrice,
                                    LowPrice: data.Price,
                                    OpenPrice: copyOfClosingCandle.ClosePrice,
                                    ClosePrice: data.Price
                                }
                            }
                        }


                        function checkForSameTimeFrameCandle(compareTimestamp) { return new Date(compareTimestamp.incoming) < addMinutes(compareTimestamp.previous, 1); }

                        function provideNewTimeStamp(timeStampToMoveForward) { return addMinutes(timeStampToMoveForward, 1) }

                        activeTradeToUpdate.percentOfGain = ((activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[1]) / (activeTradeToUpdate.tradingPlanPrices[4] - activeTradeToUpdate.tradingPlanPrices[1]) * 100)
                        activeTradeToUpdate.percentFromOpen = ((activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.tradingPlanPrices[1]) / activeTradeToUpdate.tradingPlanPrices[1]) * 100

                        if (isToday(activeTradeToUpdate.enterDate))
                        {
                            activeTradeToUpdate.todaysGain = activeTradeToUpdate.totalGain
                            activeTradeToUpdate.todaysGainPercent = activeTradeToUpdate.percentFromOpen
                        } else
                        {
                            activeTradeToUpdate.todaysGain = (activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.previousClose) * activeTradeToUpdate.availableShares
                            activeTradeToUpdate.todaysGainPercent = ((activeTradeToUpdate.mostRecentPrice - activeTradeToUpdate.previousClose) / activeTradeToUpdate.previousClose) * 100
                        }




                        // function getInsertionIndex(arr, num)
                        // {
                        //     const index = arr.findIndex(element => element >= num);
                        //     return index === -1 ? arr.length : index;
                        // }

                        // switch (getInsertionIndex(activeTradeToUpdate.tradingPlanPrices, activeTradeToUpdate.mostRecentPrice))
                        // {
                        //     case 0: activeTradeToUpdate.classVisual = 'belowStopLoss'; break;
                        //     case 1: activeTradeToUpdate.percentFromPlanPrices[0] < 0.5 ? activeTradeToUpdate.classVisual = 'nearStopLoss' : activeTradeToUpdate.classVisual = 'belowEnter'; break;
                        //     case 2: activeTradeToUpdate.percentFromPlanPrices[1] < 0.5 ? activeTradeToUpdate.classVisual = 'nearEnter' : activeTradeToUpdate.classVisual = 'belowEnterBuffer'; break;
                        //     case 3: activeTradeToUpdate.percentFromPlanPrices[2] < 0.5 ? activeTradeToUpdate.classVisual = 'nearEnterBuffer' : activeTradeToUpdate.classVisual = 'belowExitBuffer'; break;
                        //     case 4: activeTradeToUpdate.percentFromPlanPrices[3] < 0.5 ? activeTradeToUpdate.classVisual = 'nearExitBuffer' : activeTradeToUpdate.classVisual = 'belowExit'; break;
                        //     case 5: activeTradeToUpdate.percentFromPlanPrices[4] < 0.5 ? activeTradeToUpdate.classVisual = 'nearExit' : activeTradeToUpdate.classVisual = 'belowMoon'; break;
                        //     case 6: activeTradeToUpdate.classVisual = 'aboveMoon'; break;
                        // }



                        return draft
                    })
                }

                try
                {
                    await cacheDataLoaded
                    subscribe('activeTradePrice', incomingTradeGraphListener, 'ActiveTradesGraphs')
                } catch (error)
                {
                    await cacheEntryRemoved
                    unsubscribe('activeTradePrice', incomingTradeGraphListener, userId, 'ActiveTradesGraphs')
                }

                await cacheEntryRemoved
                unsubscribe('activeTradePrice', incomingTradeGraphListener, userId, 'ActiveTradesGraphs')
            },
        }),
        getUsersTradeHistory: builder.query({
            query: () => ({
                url: `/trades/history`,
            }),
            providesTags: ['tradeHistory']
        }),
        initiateTradeRecord: builder.mutation({
            query: (args) => ({
                url: '/trades/enterPosition',
                method: 'POST',
                body: { ...args }
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                // 1. Manually update the 'getPosts' query cache
                const patchResult = dispatch(
                    EnterExitPlanApiSlice.util.updateQueryData('getUsersEnterExitPlan', undefined, (draft) =>
                    {
                        enterBufferHitAdapter.removeOne(draft.enterBufferHit, args.tickerSymbol)
                        stopLossHitAdapter.removeOne(draft.stopLossHit, args.tickerSymbol)
                        enterExitAdapter.removeOne(draft.plannedTickers, args.tickerSymbol)
                    })

                )

                try { await queryFulfilled; }
                catch { patchResult.undo(); }
            },
            invalidatesTags: (result, error, args) => ['activeTrades', 'accountBalance', 'tradeHistory', 'tradingJournal', { type: 'chartingData', id: args.tickerSymbol }]
        }),
        alterTradeRecord: builder.mutation({
            query: (args) => ({
                url: '/trades/alter',
                method: 'PUT',
                body: { ...args }
            }),
            invalidatesTags: ['activeTrades', 'accountBalance', 'tradeHistory', 'tradingJournal']
        }),
    })
});

export const {
    useGetUsersActiveTradesQuery,
    useGetUsersActiveTradesWithGraphQuery,
    useGetUsersTradeHistoryQuery,
    useInitiateTradeRecordMutation,
    useAlterTradeRecordMutation
} = TradeApiSlice;

export const activeTradeWithGraphSelectors = activeTradeGraphAdapter.getSelectors()


export const activeTradeSelectors = activeTradeAdapter.getSelectors();

export const selectCurrentTradeTickers = createSelector(TradeApiSlice.endpoints.getUsersActiveTrades.select(),
    (result) => { return result?.data.ids || [] })

