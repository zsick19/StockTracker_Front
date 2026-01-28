import { apiSlice } from "../../AppRedux/api/apiSlice";

export const testApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        connectionTest: builder.query({
            query: () => ({
                url: '/index',
            }),
            transformResponse: (response) =>
            {
                console.log(response)
            }
        }),
        resetUser: builder.mutation({
            query: () => ({
                url: '/user/reset'
            })
        })

    })
})

export const {
    useConnectionTestQuery,
    useResetUserMutation
} = testApiSlice