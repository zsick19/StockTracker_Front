import { apiSlice } from "../../AppRedux/api/apiSlice";
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";

export const WatchListApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createUserWatchList: builder.mutation({
      query: (args) => ({
        url: `/user/${args.userId}/watchlist?macro=${args.macroWatchlist}`,
        method: "POST",
        body: { ...args.watchListInfo },
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data: createdPost } = await queryFulfilled;
          dispatch(
            InitializationApiSlice.util.updateQueryData(
              "getUserInitialization",
              { userId: args.userId },
              (draft) => {
                draft.macroWatchLists.push(createdPost);
              }
            )
          );
        } catch {
          // If mutation fails, the cache remains untouched
        }
      },
    }),
  }),
});

export const { useCreateUserWatchListMutation } = WatchListApiSlice;
