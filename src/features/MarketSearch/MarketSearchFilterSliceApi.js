import { apiSlice } from "../../AppRedux/api/apiSlice";
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";

export const MarketSearchFilterApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createNewSavedFilter: builder.mutation({
            query: (args) => ({
                url: `/user/marketSearch/filter`,
                method: 'POST',
                body: { ...args }
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data: updatedFilters } = await queryFulfilled;
                    dispatch(InitializationApiSlice.util.updateQueryData("getUserInitialization", undefined,
                        (draft) => { draft.marketSearchFilters = updatedFilters })
                    );
                } catch
                {
                    // If mutation fails, the cache remains untouched
                }
            },
        }),
        removeSavedFilter: builder.mutation({
            query: (args) => ({
                url: `/user/marketSearch/filter`,
                method: 'DELETE',
                body: { ...args }
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {

                try
                {
                    const { data: updatedFilters } = await queryFulfilled;

                    dispatch(InitializationApiSlice.util.updateQueryData("getUserInitialization", undefined,
                        (draft) => { draft.marketSearchFilters = updatedFilters })
                    );
                } catch
                {
                    // If mutation fails, the cache remains untouched
                }
            },



        })
    })
});

export const { useCreateNewSavedFilterMutation, useRemoveSavedFilterMutation } = MarketSearchFilterApiSlice;
