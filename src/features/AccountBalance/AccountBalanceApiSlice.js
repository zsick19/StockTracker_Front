import { apiSlice } from "../../AppRedux/api/apiSlice";

export const AccountBalanceApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsersAccountBalance: builder.query({
            query: () => ({
                url: `/user/account`,
            }),
            providesTags: ['accountBalance']
        }),
        updateAccountRiskThreshold: builder.mutation({
            query: (args) => ({
                url: `/user/account/riskThreshold?risk=${args.risk}`
            }),
            invalidatesTags: ['accountBalance']
        })
    })
});

export const {
    useGetUsersAccountBalanceQuery,
    useUpdateAccountRiskThresholdMutation
} = AccountBalanceApiSlice;


