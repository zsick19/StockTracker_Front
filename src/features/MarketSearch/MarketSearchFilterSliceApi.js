import { apiSlice } from "../../AppRedux/api/apiSlice";

export const MarketSearchFilterApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createNewSavedFilter: builder.mutation({
            query: (args) => ({
                url: `/user/marketSearch`,
                method: 'POST',
                body: { ...args }
            })
        }),
    }),
});

export const { useCreateNewSavedFilterMutation } = MarketSearchFilterApiSlice;
