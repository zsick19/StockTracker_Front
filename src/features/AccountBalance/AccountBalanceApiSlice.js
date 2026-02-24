import { apiSlice } from "../../AppRedux/api/apiSlice";

export const AccountBalanceApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsersAccountBalance: builder.query({
            query: () => ({
                url: `/user/account`,
            }),
            providesTags: ['accountBalance']
        }),
    })
});

export const {
    useGetUsersAccountBalanceQuery
} = AccountBalanceApiSlice;


