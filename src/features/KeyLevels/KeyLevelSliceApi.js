import { apiSlice } from "../../AppRedux/api/apiSlice";

export const KeyLevelsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getStockKeyLevels: builder.query({
            query: (args) => ({
                url: `/chartingData/keyLevels/single/${args.chartId}`
            })
        }),
        getUsersMacroKeyLevels: builder.query({
            query: () => ({
                url: `/chartingData/keyLevels/macros`
            })
        }),
        updateStockKeyLevels: builder.mutation({
            query: (args) => ({
                url: `/chartingData/keyLevels/single/${args.chartId}`,
                method: 'PUT',
                body: { updatedKeyLevels: args.updatedKeyLevels }
            })
        }),
    }),
});

export const { useGetStockKeyLevelsQuery, useGetUsersMacroKeyLevelsQuery, useUpdateStockKeyLevelsMutation } = KeyLevelsApiSlice;
