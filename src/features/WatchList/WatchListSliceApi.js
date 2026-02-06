import { apiSlice } from "../../AppRedux/api/apiSlice";
import { InitializationApiSlice } from "../Initializations/InitializationSliceApi";

export const WatchListApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createUserWatchList: builder.mutation({
      query: (args) => ({
        url: `/user/watchlist/${args.userId}?macro=${args.macroWatchlist}`,
        method: "POST",
        body: { ...args.watchListInfo },
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled })
      {
        try
        {
          const { data: createdPost } = await queryFulfilled;
          dispatch(InitializationApiSlice.util.updateQueryData("getUserInitialization", { userId: args.userId },
            (draft) => { draft.macroWatchLists.push(createdPost); }));
        } catch
        {
          // If mutation fails, the cache remains untouched
        }
      },
    }),
    updateWatchListName: builder.mutation({
      query: (args) => ({
        url: `/user/watchlist/${args.watchlistId}/edit?updatedTitle=${args.updatedTitle}`,
        method: 'PUT'
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled })
      {
        try
        {
          const { data: updatedTitle } = await queryFulfilled;
          dispatch(InitializationApiSlice.util.updateQueryData("getUserInitialization", { userId: "6952bd331482f8927092ddcc" },
            (draft) => { draft.macroWatchLists.map((watchlist) => { if (watchlist._id === args.watchlistId) { watchlist.title = updatedTitle.updatedTitle } }); })
          );
        } catch
        {
          // If mutation fails, the cache remains untouched
        }
      },
    }),
    deleteUserWatchList: builder.mutation({
      query: (args) => ({
        url: `/user/watchlist/${args.watchlistId}/edit`,
        method: "DELETE",
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled })
      {
        try
        {
          const { data: deletedWatchList } = await queryFulfilled;
          dispatch(InitializationApiSlice.util.updateQueryData("getUserInitialization", { userId: "6952bd331482f8927092ddcc" },
            (draft) => { draft.macroWatchLists = draft.macroWatchLists.filter((watchlist) => { return watchlist._id !== deletedWatchList.deletedWatchlist }); })
          );
        } catch
        {
          // If mutation fails, the cache remains untouched
        }
      },
    }),
    addTickerToWatchList: builder.mutation({
      query: (args) => ({
        url: `/user/watchlist/${args.watchlistId}/tickers?ticker=${args.tickerToAdd}`,
        method: "POST",
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled })
      {
        try
        {
          const { data: addedWatchListTicker } = await queryFulfilled;
          dispatch(InitializationApiSlice.util.updateQueryData("getUserInitialization", { userId: "6952bd331482f8927092ddcc" },
            (draft) => { draft.macroWatchLists.map((watchlist) => { if (watchlist._id === args.watchlistId) { watchlist.tickersContained.push(addedWatchListTicker); } }); })
          );
        } catch
        {
          // If mutation fails, the cache remains untouched
        }
      },
    }),
    removeTickerFromWatchList: builder.mutation({
      query: (args) => ({
        url: `/user/watchlist/${args.watchlistId}/tickers?ticker=${args.tickerToRemove}`,
        method: "PUT",
      }),
      async onQueryStarted(args, { dispatch, queryFulfilled })
      {
        try
        {
          const { data: removedWatchListTicker } = await queryFulfilled;
          dispatch(InitializationApiSlice.util.updateQueryData("getUserInitialization", { userId: "6952bd331482f8927092ddcc" },
            (draft) =>
            {
              draft.macroWatchLists.map((watchlist) =>
              {
                if (watchlist._id === args.watchlistId) { watchlist.tickersContained = watchlist.tickersContained.filter((t) => { return t.ticker !== removedWatchListTicker.tickerRemoved; }); }
              });
            }
          )
          );
        } catch
        {
          // If mutation fails, the cache remains untouched
        }
      },
    }),
  }),
});

export const {
  useCreateUserWatchListMutation,
  useUpdateWatchListNameMutation,
  useDeleteUserWatchListMutation,
  useAddTickerToWatchListMutation,
  useRemoveTickerFromWatchListMutation,
} = WatchListApiSlice;
