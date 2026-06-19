import { apiSlice } from "../../AppRedux/api/apiSlice";
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";

export const UtilityApiSLice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        uploadStockDataCsv: builder.mutation({
            query: (formDataPayload) => ({
                url: '/upload-csv-snapshot',
                method: 'POST',
                body: formDataPayload, // Injects your binary file FormData container straight into the request body

                // CRITICAL STRUCTURAL ARCHITECTURE STEP: 
                // Do NOT supply a 'Content-Type' header here. By leaving headers undefined or omitted,
                // RTK Query forces the browser to automatically compute your multi-part boundaries!
            }),

            // Optional: Once the file successfully hydrates your MongoDB StockInfo collection, 
            // you can automatically invalidate relevant query cache tags to trigger a frontend refresh!
            invalidatesTags: ['StockPlanCollection']
        }),

    }),
});

export const {
    useUploadStockDataCsvMutation
} = UtilityApiSLice;
