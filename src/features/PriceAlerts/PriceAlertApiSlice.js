import { add, addMinutes } from "date-fns";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
const { getWebSocket, subscribe, unsubscribe } = setupWebSocket();
import * as short from 'short-uuid'


export const PriceAlertApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUserPriceAlerts: builder.query({
            query: (args) => ({
                url: `/user/alerts`
            })
        }),
        createPriceAlert: builder.mutation({
            query: (args) => ({
                url: `/alerts`,
                method: 'POST',
                body: { ...args.alert }
            }),

        }),
    }),
});

export const {
    useGetUserPriceAlertsQuery,
    useCreatePriceAlertMutation
} = PriceAlertApiSlice;
