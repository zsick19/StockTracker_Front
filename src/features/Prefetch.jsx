import { useEffect } from "react";
import { store } from "../AppRedux/store";

import { useDispatch } from "react-redux";
import { InitializationApiSlice } from "./Initializations/InitializationSliceApi";
import { Outlet } from "react-router-dom";

function Prefetch()
{
  const dispatch = useDispatch();

  useEffect(() =>
  {
    const prefetchUserInitial = store.dispatch(
      InitializationApiSlice.endpoints.getUserInitialization.initiate(
        undefined,
        { subscribe: true, forceRefetch: true }
      )
    );

    return () =>
    {
      prefetchUserInitial.unsubscribe();
    };
  }, [dispatch]);

  return <Outlet />;
}

export default Prefetch;

export const manualRefetchOfInitializedData = () =>
{
  store.dispatch(
    InitializationApiSlice.endpoints.getUserInitialization.initiate(
      undefined,
      { subscribe: false, forceRefetch: true }
    )
  );
};
