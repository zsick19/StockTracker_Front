import { apiSlice } from "../../AppRedux/api/apiSlice";
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";

export const ConfirmationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsersUnconfirmedPatterns: builder.query({
            query: () => ({
                url: `/patterns/unconfirmed`,
            })
        }),
        
    })
});

export const { useGetUsersUnconfirmedPatternsQuery } = ConfirmationApiSlice;
