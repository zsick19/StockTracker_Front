import { useEffect, useRef, useState } from "react";
import { store } from "../AppRedux/store";
import { toZonedTime } from 'date-fns-tz'
import { useDispatch } from "react-redux";
import { InitializationApiSlice } from "./Initializations/InitializationSliceApi";
import { Outlet } from "react-router-dom";
import { EnginePlanPlanApiSlice } from "./Engine/EnginePlanApiSlice";
import { format, isWeekend, isWithinInterval, parse } from "date-fns";

function Prefetch()
{
  const dispatch = useDispatch();
  const [isSystemHydrated, setIsSystemHydrated] = useState(false);
  const [prefetchError, setPrefetchError] = useState(null);

  const pollingClockRef = useRef(null);
  const oneMinPollingClockRef = useRef(null);
  const tradeSyncTimeoutRef = useRef(null);
  const currentIntervalMS = useRef(60000);


  useEffect(() =>
  {
    // --- HELPER FUNCTION: CLEAN EXPRESSIVE TIME GATING VIA DATE-FNS ---
    const getMarketTimeContext = () =>
    {
      const systemTime = new Date();
      // Securely snap system clock to New York Time regardless of your local machine setup
      const nyTime = toZonedTime(systemTime, 'America/New_York');

      // Quick check via date-fns native boolean
      const weekendCheck = isWeekend(nyTime);

      // Create precise, clear mathematical intervals for market hours using date-fns parsing
      const formatDayStr = format(nyTime, 'yyyy-MM-dd');

      const powerHourStart = parse(`${formatDayStr} 09:30:00`, 'yyyy-MM-dd HH:mm:ss', nyTime);
      const powerHourEnd = parse(`${formatDayStr} 10:30:00`, 'yyyy-MM-dd HH:mm:ss', nyTime);
      const regularOpen = parse(`${formatDayStr} 09:30:00`, 'yyyy-MM-dd HH:mm:ss', nyTime);
      const regularClose = parse(`${formatDayStr} 16:00:00`, 'yyyy-MM-dd HH:mm:ss', nyTime);

      // Evaluate window status expressively using isWithinInterval
      const isMorningPowerHour = isWithinInterval(nyTime, { start: powerHourStart, end: powerHourEnd });
      const isRegularSessionActive = isWithinInterval(nyTime, { start: regularOpen, end: regularClose });

      return { isWeekend: weekendCheck, isMorningPowerHour, isRegularSessionActive };
    };

    // --- CORE CORE: THE HEADLESS CHRONOLOGICAL RECONCILIATION ENGINE ---
    let liveSubscriptionRef = null;
    let oneMinLiveSubscriptionRef = null;

    // --- DYNAMIC POLLING BALANCER AND TIMEFRAME SWITCHER ---
    const manageDynamicIntervalLoop = () =>
    {
      const { isWeekend, isMorningPowerHour, isRegularSessionActive } = getMarketTimeContext();

      if (!isSystemHydrated)
      {
        store.dispatch(EnginePlanPlanApiSlice.endpoints.fetchEngineOneMinCandleBarData.initiate(undefined, { subscribe: true, forceRefetch: true }))
        store.dispatch(EnginePlanPlanApiSlice.endpoints.fetchEngineTradeData.initiate(undefined, { subscribe: true, forceRefetch: true }))
      }

      // WEEKEND GATEWAY: Shut down loop immediately if Saturday or Sunday
      if (isWeekend)
      {
        if (pollingClockRef.current)
        {
          clearInterval(pollingClockRef.current);
          pollingClockRef.current = null;
        }
        console.log("📆 Weekend Mode Activated: Single pass data hydration completed. Interval locked.");
        return;
      }

      // Clean, explicit interval assignments: 1-min for Opening Hour, 5-min for typical session
      const targetIntervalMS = isMorningPowerHour ? 60000 : 300000;
      if (!pollingClockRef.current || currentIntervalMS.current !== targetIntervalMS)
      {
        if (pollingClockRef.current) { clearInterval(pollingClockRef.current); }

        pollingClockRef.current = setInterval(() =>
        {
          const clock = getMarketTimeContext();
          if (clock.isRegularSessionActive && !clock.isWeekend)
          {
            if (liveSubscriptionRef) { store.dispatch(EnginePlanPlanApiSlice.endpoints.fetchEngineCandleBarData.initiate({ oneMinOrFivMinBars: clock.isMorningPowerHour ? 'openingSession' : 'regularSession' }, { subscribe: true, forceRefetch: true })) }
            if (tradeSyncTimeoutRef.current) clearTimeout(tradeSyncTimeoutRef.current)
            tradeSyncTimeoutRef.current = setTimeout(() => { store.dispatch(EnginePlanPlanApiSlice.endpoints.fetchEngineTradeData.initiate(undefined, { subscribe: true, forceRefetch: true })) }, 45000)
          }

          manageDynamicIntervalLoop();
        }, targetIntervalMS);
      }

      if (!isMorningPowerHour && !isWeekend)
      {
        if (!oneMinPollingClockRef.current)
        {
          oneMinPollingClockRef.current = setInterval(() =>
          {
            const clock = getMarketTimeContext()
            if (clock.isRegularSessionActive && !clock.isWeekend)
            {
              store.dispatch(EnginePlanPlanApiSlice.endpoints.fetchEngineOneMinCandleBarData.initiate(undefined, { subscribe: true, forceRefetch: true }))

              if (tradeSyncTimeoutRef.current) clearTimeout(tradeSyncTimeoutRef.current)
              tradeSyncTimeoutRef.current = setTimeout(() =>
              {
                store.dispatch(EnginePlanPlanApiSlice.endpoints.fetchEngineTradeData.initiate(undefined, { subscribe: true, forceRefetch: true }))
              }, 45000)
            }
          }, 60000)
        }

      }
      else if (isMorningPowerHour && !isWeekend)
      {
        if (!oneMinPollingClockRef.current)
        {
          oneMinPollingClockRef.current = setInterval(() =>
          {
            if (tradeSyncTimeoutRef.current) clearTimeout(tradeSyncTimeoutRef.current)
            tradeSyncTimeoutRef.current = setTimeout(() =>
            {
              store.dispatch(EnginePlanPlanApiSlice.endpoints.fetchEngineTradeData.initiate(undefined, { subscribe: true, forceRefetch: true }))
            }, 45000)
          }, 60000)
        }
      }
      else
      {
        if (oneMinPollingClockRef.current)
        {
          clearInterval(oneMinPollingClockRef.current)
          oneMinPollingClockRef.current = null
        }
        if (tradeSyncTimeoutRef.current)
        {
          clearTimeout(tradeSyncTimeoutRef.current)
          tradeSyncTimeoutRef.current = null
        }
      }
      
    };




    const prefetchUserInitial = store.dispatch(InitializationApiSlice.endpoints.getUserInitialization.initiate(undefined, { subscribe: true, forceRefetch: true }));
    const prefetchHistoricalEngineData = store.dispatch(EnginePlanPlanApiSlice.endpoints.initiateEngineWithEnterExitPlan.initiate(undefined, { subscribe: true, forceRefetch: true }))

    prefetchHistoricalEngineData.unwrap()
      .then(() =>
      {
        const timeContext = getMarketTimeContext();
        liveSubscriptionRef = store.dispatch(EnginePlanPlanApiSlice.endpoints.fetchEngineCandleBarData.initiate({ oneMinOrFivMinBars: timeContext.isMorningPowerHour ? 'openingSession' : 'regularSession' }, { subscribe: true, forceRefetch: true }))
        return liveSubscriptionRef.unwrap()
      })
      .then((data) =>
      {
        setIsSystemHydrated(true);
        manageDynamicIntervalLoop()

        console.log("✅ RTK Query Global Prefetch: Store fully hydrated. Workspace unlocked.");
      })
      .catch((error) =>
      {

        console.error("❌ Critical RTK Query Root Ingestion Failure:", error);
        setPrefetchError(error.message || "Failed to load historical data.");
      });
















    return () =>
    {
      prefetchUserInitial.unsubscribe();
      prefetchHistoricalEngineData.unsubscribe()
      if (liveSubscriptionRef) liveSubscriptionRef.unsubscribe()
      if (pollingClockRef.current) clearInterval(pollingClockRef.current);
      if (oneMinPollingClockRef.current) clearInterval(oneMinPollingClockRef.current)
      if (tradeSyncTimeoutRef.current) clearInterval(tradeSyncTimeoutRef.current)
    };
  }, [dispatch]);

  if (prefetchError)
  {
    return (
      <div className="system-boot-error-screen" style={{ padding: "40px", background: "#111", color: "#FF0055", fontFamily: "monospace" }}>
        <h2>🚨 CRITICAL DATA PIPELINE DE-SYNCHRONIZATION</h2>
        <p>Failed to populate baseline historical cache matrices from Alpaca central exchanges via RTK Query.</p>
        <p>Error Core: {prefetchError}</p>
      </div>
    );
  }

  if (!isSystemHydrated)
  {
    return (
      <div className="system-boot-loading-screen" style={{ height: "100%", background: "#0a0a0a", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#fff", fontFamily: "monospace" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "4px solid #333", borderTop: "4px solid #00FFFF", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <h3 style={{ marginTop: "20px", color: "#00FFFF", letterSpacing: "2px" }}>INITIALIZING QUANT TRADING ENVIRONMENT</h3>
        <p style={{ color: "#666", fontSize: "12px" }}>Hydrating global RTK Entity Adapter memory arrays via root cache subscription...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <Outlet />;
}

export default Prefetch;

export const manualRefetchOfInitializedData = () => { store.dispatch(InitializationApiSlice.endpoints.getUserInitialization.initiate(undefined, { subscribe: false, forceRefetch: true })); };
