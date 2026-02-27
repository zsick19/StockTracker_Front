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
        })
    }),
});

export const { useGetStockKeyLevelsQuery, useGetUsersMacroKeyLevelsQuery, useUpdateStockKeyLevelsMutation, useTakeInDailyZoneLevelsMutation } = KeyLevelsApiSlice;
