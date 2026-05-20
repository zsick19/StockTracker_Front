import { add, addMinutes } from "date-fns";
import { apiSlice } from "../../AppRedux/api/apiSlice";
import { setupWebSocket } from '../../AppRedux/api/ws'
const { getWebSocket, subscribe, unsubscribe } = setupWebSocket();
import * as short from 'short-uuid'
import { EnterExitPlanApiSlice } from "../EnterExitPlans/EnterExitApiSlice";


export const PriceAlertApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUserPriceAlerts: builder.query({
            query: (args) => ({
                url: `/user/alerts`
            })
        }),
        createPriceAlert: builder.mutation({
            query: (args) => ({
                url: `/alerts/${args.ticker}/${args.chartId}`,
                method: 'POST',
                body: { ...args.alert }
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data } = await queryFulfilled
                    console.log(data)
                    dispatch(EnterExitPlanApiSlice.util.updateQueryData('getUsersEnterExitPlan', undefined, (draft) =>
                    {
                        console.log(draft)
                        let entityToUpdate
                        if (draft.highImportance.ids.includes(data.ticker)) { entityToUpdate = draft.highImportance.entities[data.ticker] }
                        else if (draft.enterBufferHit.ids.includes(data.ticker)) { entityToUpdate = draft.enterBufferHit.entities[data.ticker] }
                        else if (draft.stopLossHit.ids.includes(data.ticker)) { entityToUpdate = draft.stopLossHit.entities[data.ticker] }
                        else { entityToUpdate = draft.plannedTickers.entities[data.ticker] }

                        if (entityToUpdate)
                        {
                            if (!entityToUpdate?.priceAlerts)
                            {
                                entityToUpdate.priceAlerts = []
                            }
                            entityToUpdate.priceAlerts.push(data)
                        }
                    }
                    ))
                } catch (error)
                {
                    console.log(error)
                }
            }
        }),
    }),
});

export const {
    useGetUserPriceAlertsQuery,
    useCreatePriceAlertMutation
} = PriceAlertApiSlice;
