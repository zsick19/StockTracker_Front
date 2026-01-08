import { apiSlice } from "../../AppRedux/api/apiSlice";
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";

export const ConfirmationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsersUnconfirmedPatterns: builder.query({
            query: () => ({
                url: `/patterns/unconfirmed`,
            }),
            providesTags: ['unconfirmedPatterns']
        }),

        submitConfirmedPatterns: builder.mutation({
            query: (args) => ({
                url: '/patterns/unconfirmed/sync',
                method: 'PATCH',
                body: { confirmed: args.confirmed, remove: args.remove }
            }),
            invalidatesTags: ['userData', 'unconfirmedPatterns'],
        })
    })
});

export const {
    useGetUsersUnconfirmedPatternsQuery,
    useSubmitConfirmedPatternsMutation
} = ConfirmationApiSlice;
