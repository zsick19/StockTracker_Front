import { apiSlice } from "../../AppRedux/api/apiSlice";
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";

export const UtilityApiSLice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        uploadStockDataCsv: builder.mutation({
            query: (args) => ({
                url: 'util/dailyStockCSVUpload',
                method: 'POST',
                body: args.formData,
            }),
            // invalidatesTags: ['StockPlanCollection']
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
