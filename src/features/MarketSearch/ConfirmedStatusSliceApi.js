import { apiSlice } from "../../AppRedux/api/apiSlice";
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";

export const ConfirmedStatusApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsersConfirmedSummary: builder.query({
            query: () => ({
                url: `/patterns/confirmed`,
            }),
            providesTags: ['confirmedSummary']
        }),

        addTickerDirectlyToConfirmedList: builder.mutation({
            query: (args) => ({
                url: `/patterns/directConfirmed?tickerToAdd=${args.tickerToAdd}`
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data } = await queryFulfilled;
                    dispatch(ConfirmedStatusApiSlice.util.updateQueryData("getUsersConfirmedSummary", undefined,
                        (draft) =>
                        {
                            draft.push(data.directConfirmed)
                        }
                    ))

                    if (data.userHistory)
                    {
                        console.log('working on it')
                        dispatch(InitializationApiSlice.util.updateQueryData("getUserInitialization", undefined,
                            (draft) =>
                            {
                                draft.userStockHistory = data.userHistory
                                draft.patternedTickers = draft.patternedTickers.push(data.directConfirmed.tickerSymbol)

                                return draft
                            })
                        );
                    }
                } catch
                {
                    // If mutation fails, the cache remains untouched
                }
            },

        })
    })
});

export const {
    useGetUsersConfirmedSummaryQuery,
    useAddTickerDirectlyToConfirmedListMutation,

} = ConfirmedStatusApiSlice;
