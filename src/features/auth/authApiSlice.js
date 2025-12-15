import { apiSlice } from "../../AppRedux/api/apiSlice";
import { logOut, setCredentials } from "./authSlice";

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        login: builder.mutation({
            query: credentials => ({
                url: '/auth/login',
                method: 'POST',
                body: { ...credentials }
            })
        }),
        sendLogout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled })
            {
                try
                {
                    await queryFulfilled
                    dispatch(logOut())
                    setTimeout(() => { dispatch(apiSlice.util.resetApiState()) }, 1000)
                } catch (err)
                {
                    console.log(err)
                }
            }
        }),
        refresh: builder.mutation({
            query: (userId) => ({
                url: `/auth/refresh/${userId}`,
                method: 'GET'
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data } = await queryFulfilled
                    console.log(data)
                    const { accessToken, userId } = data
                    dispatch(setCredentials({ accessToken, userId }))
                } catch (error)
                {
                    console.log(error)
                }
            }
        }),
        registerNewUser: builder.mutation({
            query: (userInfo) => ({
                url: '/auth/register',
                method: 'POST',
                body: { ...userInfo }
            })
        })
    })
})

export const {
    useLoginMutation,
    useSendLogoutMutation,
    useRefreshMutation,
    useRegisterNewUserMutation
} = authApiSlice