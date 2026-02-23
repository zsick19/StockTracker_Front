import { apiSlice } from "../../AppRedux/api/apiSlice";
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";

export const PatternApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        addTickerToUserPatterns: builder.mutation({
            query: (args) => ({
                url: `/patterns/found?patternToAdd=${args.patternToAdd}`,
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data: createdHistory } = await queryFulfilled;
                    dispatch(InitializationApiSlice.util.updateQueryData("getUserInitialization", undefined,
                        (draft) =>
                        {
                            draft.userStockHistory.push(createdHistory)
                            draft.patternedTickers.push(createdHistory.symbol)
                        })
                    );
                } catch
                {
                    // If mutation fails, the cache remains untouched
                }
            },
        }),
        removeTickerFromUserPatterns: builder.mutation({
            query: (args) => ({
                url: `/patterns/found/${args.historyId}`,
                method: 'DELETE'
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data: removedHistory } = await queryFulfilled;

                    dispatch(InitializationApiSlice.util.updateQueryData("getUserInitialization", undefined,
                        (draft) =>
                        {
                            if (removedHistory.deletedCount > 0)
                            {
                                draft.userStockHistory = draft.userStockHistory.filter((t) => t._id !== args.historyId)
                                draft.patternedTickers = draft.patternedTickers.filter((t) => t !== args.ticker)
                            }
                            return draft
                        })
                    );
                } catch
                {
                    // If mutation fails, the cache remains untouched
                }
            },
        })
    }),
});

export const { useAddTickerToUserPatternsMutation, useRemoveTickerFromUserPatternsMutation } = PatternApiSlice;
