import { apiSlice } from "../../AppRedux/api/apiSlice";
import { EnginePlanPlanApiSlice } from "../Engine/EnginePlanApiSlice";
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";

export const UtilityApiSLice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        uploadStockDataCsv: builder.mutation({
            query: (args) => ({
                url: 'util/dailyStockCSVUpload',
                method: 'POST',
                body: args.formData,
            }),
            async onQueryStarted(args, { dispatch, queryFulfilled })
            {
                try
                {
                    const { data: freshStockData } = await queryFulfilled;
                    dispatch(EnginePlanPlanApiSlice.util.updateQueryData('initiateEngineWithEnterExitPlan', undefined, (draft) =>
                    {
                        if (!draft) return
                        if (freshStockData?.stockInfoData.planAndTrackedStocks) freshStockData?.stockInfoData.planAndTrackedStocks.forEach(stockInfo =>
                        {
                            if (!draft.plans.entities[stockInfo.stockId.Symbol]) return
                            draft.plans.entities[stockInfo.stockId.Symbol].stockInfo = stockInfo.stockId
                        })
                    }))
                } catch (error)
                {
                    console.log(error)
                }
            }
        }),
        uploadExpectedCoreMovesFromAsherBot: builder.mutation({
            query: (args) => ({
                url: 'util/expectedMovesCoreUpload',
                method: 'POST',
                body: args.formData,
            }),
        }),
        uploadZoneDocument: builder.mutation({
            query: (args) => ({
                url: 'util/zoneDocUpload',
                method: 'POST',
                body: args.formData,
            }),
        }),


    }),
});

export const {
    useUploadStockDataCsvMutation,
    useUploadExpectedCoreMovesFromAsherBotMutation,
    useUploadZoneDocumentMutation
} = UtilityApiSLice;
