import { apiSlice } from "../../AppRedux/api/apiSlice";

export const EnterExitPlanApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    createEnterExitPlan: builder.mutation({

    }),

    updateEnterExitPlan: builder.mutation({
      async queryFn(args, api, extraOptions, baseQuery)
      {
        //if (!args.chartId) return
        const state = api.getState()

        let updatedEnterExit = state.enterExitElement[args.ticker]
        console.log(args, updatedEnterExit)
        let result
        if (updatedEnterExit.id)
        {

          result = await baseQuery({
            url: `/enterExitPlan/update/${updatedEnterExit.id}`,
            method: 'PUT',
            body: updatedEnterExit
          })
        } else
        {
          result = await baseQuery({
            url: `/enterExitPlan/initiate/${args.chartId}`,
            method: 'POST',
            body: updatedEnterExit
          })
        }

        return result.data ? { data: result.data } : { error: result.error }
      },
      //invalidatesTags: (result, error, args) => [{ type: 'chartingData', id: args.chartId }]
    })

  }),
});

export const { useCreateEnterExitPlanMutation, useUpdateEnterExitPlanMutation } = EnterExitPlanApiSlice;
