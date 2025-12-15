import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
//import { setCredentials } from "../../features/auth/authSlice";

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:3500',
    // credentials: 'include',
    // prepareHeaders: (headers, { getState }) =>
    // {
    //     const token = getState().auth.token
    //     if (token) { headers.set('authorization', `Bearer ${token}`) }

    //     return headers
    // }
})

// const baseQueryWithReauth = async (args, api, extraOptions) =>
// {

//     let results = await baseQuery(args, api, extraOptions)

//     if (results?.error?.status === 403 || results?.error?.status === 401)
//     {
//         //console.log('sending refresh token')

//         //const user = sessionStorage.getItem('userId')
//         const refreshResults = await baseQuery(`/auth/refresh/${user}`, api, extraOptions)

//         if (refreshResults?.data)
//         {
//             api.dispatch(setCredentials({ ...refreshResults.data }))
//             results = await baseQuery(args, api, extraOptions)
//         } else
//         {
//             if (refreshResults?.error?.status === 403 || refreshResults?.error?.status === 401)
//                 refreshResults.error.data.message = "Your login has expired. "
//             return refreshResults
//         }
//     }
//     return results
// }

export const apiSlice = createApi({
    baseQuery,
    tagTypes: [],
    endpoints: builder => ({})
})