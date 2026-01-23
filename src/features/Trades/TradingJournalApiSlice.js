
import { apiSlice } from "../../AppRedux/api/apiSlice";

export const TradingJournalApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsersTradingJournal: builder.query({
            query: (args) => ({
                url: `/trades/journal?start=${new Date()}`,
            }),
            // transformResponse: (response) =>
            // {

            // },
            providesTags: ['tradingJournal']
        })
    })
});

export const {
    useGetUsersTradingJournalQuery,
} = TradingJournalApiSlice;


