import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from "../../AppRedux/api/ws";
const { getWebSocket, subscribe, unsubscribe } = setupWebSocket();

const singleTickerAdapter = createEntityAdapter({
    selectId: (item) => item.ticker
});

export const WatchListStreamingApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        fetchUsersMacroWatchList: builder.query({
            query: () => ({
                url: `/user/watchlist/macro`
            }),
            transformResponse: (response) =>
            {
                let normalizedTickerData = {}
                response.tickerData.map((tickerPriceData) => { normalizedTickerData[tickerPriceData.symbol] = tickerPriceData })

                const currentTime = new Date().getUTCDate()
                const target = new Date()
                target.setHours(9, 30, 0, 0)

                let tickerMap = {}
                response.macroWatchList.map((watchList) =>
                {
                    watchList.tickersContained.map((ticker) =>
                    {
                        ticker.mostRecentPrice = normalizedTickerData[ticker.ticker]?.LatestTrade.Price
                        ticker.dailyOpenPrice = normalizedTickerData[ticker.ticker]?.DailyBar.OpenPrice

                        let difference = ((ticker.mostRecentPrice - ticker.dailyOpenPrice) / ticker.dailyOpenPrice) * 100

                        ticker.currentDayPercentGain = (currentTime < target.getUTCDate() ? 0 : difference)
                        tickerMap[ticker.ticker] = ticker
                    })
                })

                const tickerState = singleTickerAdapter.setAll(singleTickerAdapter.getInitialState(), tickerMap)

                return {
                    watchLists: response.macroWatchList,
                    tickerState
                }
            }, async onCacheEntryAdded(args, { getState, updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch },)
            {
                const userId = getState().auth.userId
                const ws = getWebSocket(userId, 'MacroWatchListStream')

                const incomingTradeListener = (data) =>
                {
                    dispatch(
                        WatchListStreamingApiSlice.util.updateQueryData('fetchUsersMacroWatchList', undefined, (draft) =>
                        {
                            const entity = draft.tickerState.entities[data.Symbol]

                            if (entity)
                            {
                                entity.mostRecentPrice = data.Price
                                entity.currentDayPercentGain = ((entity.mostRecentPrice - entity.dailyOpenPrice) / entity.dailyOpenPrice) * 100
                            }
                        }))
                }
                try
                {
                    await cacheDataLoaded
                    subscribe('macroWatchListUpdate', incomingTradeListener, 'macroWatchList')
                } catch (error)
                {
                    await cacheEntryRemoved
                    unsubscribe('macroWatchListUpdate', incomingTradeListener, userId, 'macroWatchList')
                }
                await cacheEntryRemoved
                unsubscribe('macroWatchListUpdate', incomingTradeListener, userId, 'macroWatchList')
            }
        }),
        fetchMacroDailyZoneInfo: builder.query({
            query: () => ({
                url: '/user/watchlist/dailyMacroZones'
            }),
            transformResponse: (response) =>
            {
                let values = {}
                response.forEach((zone) =>
                {
                    values[zone.tickerSymbol] = zone.dailyZone
                })
                return values
            },
            keepUnusedDataFor: 60 * 60 * 18,
            providesTags: ['dailyMacroZones']
        })
        , updateMacroCharting: builder.mutation({
            async queryFn(args, api, extraOptions, baseQuery)
            {
                const state = api.getState()
                let result
                let updatedMacroChart = state.chartingElement[args.ticker]

                if (!updatedMacroChart) return

                result = await baseQuery({
                    url: `/chartingData/macro/${args.id}`,
                    method: 'POST',
                    body: updatedMacroChart
                })

                return result.data ? { data: result.data } : { error: result.error }
            },
            invalidatesTags: (result, error, args) => [{ type: 'chartingData', id: args.ticker }]
        }),

    }),





});

export const {
    useFetchUsersMacroWatchListQuery,
    useFetchMacroDailyZoneInfoQuery,
    useUpdateMacroChartingMutation
} = WatchListStreamingApiSlice;


export const selectMacroTickersAndChartIds = () =>
    createSelector(WatchListStreamingApiSlice.endpoints.fetchUsersMacroWatchList.select(),
        (result) =>
        {
            let macroTickerToIds = {}
            result.data?.watchLists.forEach((watchList) => { watchList.tickersContained.forEach((ticker) => { macroTickerToIds[ticker.ticker] = ticker._id }) })
            return macroTickerToIds
        }
    )

const selectMacroResults = WatchListStreamingApiSlice.endpoints.fetchUsersMacroWatchList.select()

const selectMacroData = createSelector(selectMacroResults, (macroResults) => macroResults.data.tickerState)

export const { selectMacroById } = singleTickerAdapter.getSelectors(state => selectMacroData(state) ?? undefined)



export const isTickerMacro = () => createSelector(
    [selectMacroResults, (state, ticker) => ticker],
    (stream, ticker) =>
    {
        console.log(singleTickerAdapter.getSelectors(state => stream.data(state)))
        // if (stream.data.tickerState)
        //     console.log(stream.data)
        return stream
    }
)

