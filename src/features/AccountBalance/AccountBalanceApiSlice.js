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
                url: `/user/account/riskThreshold?risk=${args.risk}&maxLossDollar=${args.maxLossDollar}&maxLossPercent=${args.maxLossPercent}&deposit=${args.deposit}`
            }),
            invalidatesTags: ['accountBalance']
        }),
        updateAccountBalance: builder.mutation({
            query: (args) => ({
                url: `/user/account`,
                method: 'POST',
                body: { ...args }
            }),
        })


    })
});

export const {
    useGetUsersAccountBalanceQuery,
    useUpdateAccountRiskThresholdMutation,
    useUpdateAccountBalanceMutation
} = AccountBalanceApiSlice;


