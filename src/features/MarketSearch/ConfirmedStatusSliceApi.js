import { apiSlice } from "../../AppRedux/api/apiSlice";

export const ConfirmedStatusApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsersConfirmedSummary: builder.query({
            query: () => ({
                url: `/patterns/confirmed`,
            }),
            providesTags:['confirmedSummary']
        })
    })
});

export const {
    useGetUsersConfirmedSummaryQuery
} = ConfirmedStatusApiSlice;
