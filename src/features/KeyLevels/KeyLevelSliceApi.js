import { apiSlice } from "../../AppRedux/api/apiSlice";

export const KeyLevelsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getStockKeyLevels: builder.query({
            query: (args) => ({
                url: `/chartingData/keyLevels/singleMacro/${args.chartId}`
            }),
            providesTags: ['stockKeyLevels']
        }),
        getUsersMacroKeyLevels: builder.query({
            query: () => ({
                url: `/chartingData/keyLevels/macros`
            })
        }),
        updateStockKeyLevels: builder.mutation({
            query: (args) => ({
                url: `/chartingData/keyLevels/singleMacro/${args.chartId}`,
                method: 'PUT',
                body: { updatedKeyLevels: args.updatedKeyLevels }
            }),
            invalidatesTags: ['chartingData', 'stockKeyLevels']
        }),
        takeInDailyZoneLevels: builder.mutation({
            query: (args) => ({
                url: `/chartingData/keyLevels/dailyZones`,
                method: 'POST',
                body: { zones: args.zones }
            }),
            invalidatesTags: ['dailyMacroZones']
        }),
        takeInDailyExpectedMoves: builder.mutation({
            query: (args) => ({
                url: `/chartingData/keyLevels/dailyMacroExpectedMoves`,
                method: 'POST',
                body: { expectedMoves: args.expectedMoves }
            }),
            invalidatesTags: ['dailyMacroZones']
        }),
        takeInWeeklyExpectedMoves: builder.mutation({
            query: (args) => ({
                url: `/chartingData/keyLevels/weeklyMacroExpectedMoves`,
                method: 'POST',
                body: { expectedMoves: args.expectedMoves }
            }),
            invalidatesTags: ['dailyMacroZones']
        }),
        takeInMonthlyExpectedMoves: builder.mutation({
            query: (args) => ({
                url: `/chartingData/keyLevels/monthlyMacroExpectedMoves`,
                method: 'POST',
                body: { expectedMoves: args.expectedMoves }
            }),
            invalidatesTags: ['dailyMacroZones']
        }),
        takeInQuarterlyExpectedMoves: builder.mutation({
            query: (args) => ({
                url: `/chartingData/keyLevels/quarterlyMacroExpectedMoves`,
                method: 'POST',
                body: { expectedMoves: args.expectedMoves }
            }),
            invalidatesTags: ['dailyMacroZones']
        }),

    }),
});

export const {
    useGetStockKeyLevelsQuery,
    useGetUsersMacroKeyLevelsQuery,
    useUpdateStockKeyLevelsMutation,
    useTakeInDailyZoneLevelsMutation,
    useTakeInDailyExpectedMovesMutation,
    useTakeInWeeklyExpectedMovesMutation,
    useTakeInMonthlyExpectedMovesMutation,
    useTakeInQuarterlyExpectedMovesMutation
} = KeyLevelsApiSlice;
