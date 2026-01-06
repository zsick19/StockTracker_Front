import { apiSlice } from "../../AppRedux/api/apiSlice";
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";

export const PatternApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        addTickerToUserPatterns: builder.mutation({
            query: (args) => ({
                url: `/patterns/found?patternToAdd=${args.patternToAdd}&addOrRemove=${args.addOrRemove}`,
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
    }),
});

export const { useAddTickerToUserPatternsMutation } = PatternApiSlice;
