import React, { useEffect, useRef, useState } from "react";
import useWindowSize from "../../hooks/useWindowSize";
import { useLocation, useNavigate } from "react-router-dom";
import { usePopulateMacroTickersMutation, useResetUserMutation } from "../../features/test/testApiSlice";
import { Check, ChessKing, ChessQueen, RefreshCcwDot } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { selectStandardDeviationState } from "../../features/STDs/StockDetailControlSlice";
import SDTNotificationControl from "./SDTNotification/SDTNotificationControl";
import { useRefreshStreamTickersMutation } from "../../features/auth/authApiSlice";
import PriceAlertNotification from "./PriceAlertNotification/PriceAlertNotification";
import { startBackgroundSessionTicker } from "../../features/Scheduling/sessionClockSlice";
import { useFetchPlanUpdatesMutation } from "../../features/Engine/EnginePlanApiSlice";
import { selectMostRecentStream } from "../../features/Initializations/StreamMostRecentSlice";
import StreamProof from "./StreamProof";
import SearchResult from "./SearchResult";

function DashNav()
{
  const dispatch = useDispatch()
  useEffect(() => { dispatch(startBackgroundSessionTicker()) }, [dispatch])




  const [fetchPlanUpdates] = useFetchPlanUpdatesMutation()
  async function attemptPlanRefetch()
  {
    try
    {
      const results = await fetchPlanUpdates().unwrap()
      console.log(results)
    } catch (error)
    {
      console.log(error)
    }
  }

  const width = useWindowSize();
  const navigate = useNavigate();
  const location = useLocation();

  const [resetUser] = useResetUserMutation()
  const [populateMacroTickers] = usePopulateMacroTickersMutation()

  async function attemptResettingUser(params)
  {
    try
    {
      const results = await resetUser().unwrap()
      window.location.reload()
    } catch (error)
    {
      console.log(error)
    }
  }

  async function attemptPopulatingMacros()
  {
    try
    {
      const results = await populateMacroTickers().unwrap()

    } catch (error)
    {
      console.log(error)
    }
  }

  const [showSectorAbbr, setShowSectorAbbr] = useState(false)
  const [centerInformationDisplay, setShowCenterInformationDisplay] = useState(0)


  const [refreshStreamTickers] = useRefreshStreamTickersMutation()
  const [showRefreshDelivered, setShowRefreshDelivered] = useState(false)
  async function attemptStreamTickerRefresh()
  {
    try
    {
      await refreshStreamTickers().unwrap()
      setShowRefreshDelivered(true)

      setTimeout(() => { setShowRefreshDelivered(false) }, [2000])
    } catch (error)
    {
      console.log(error)
    }
  }


  const searchRef = useRef()
  const [searchThisTicker, setSearchThisTicker] = useState(undefined)
  function handleSearchChange(e) { setSearchThisTicker(searchRef.current.value) }
  useEffect(() =>
  {

    const handleKeyDown = (event) =>
    {
      if (event.key === 'Escape' && document.activeElement.id === 'centerSearch')
      {
        setSearchThisTicker(undefined)
        searchRef.current.value = ''
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => { window.removeEventListener('keydown', handleKeyDown) }
  }, [])
  function handleNavigateClear()
  {
    setSearchThisTicker(undefined)
    searchRef.current.value = ''
  }



  return (
    <nav id="DashNav" style={{ position: 'relative' }}>
      {/* <SDTNotificationControl /> */}
      {/* <button onClick={() => attemptPopulatingMacros()} disabled>Populate Macros</button> */}
      {/* <button onClick={() => attemptResettingUser()}>Dev Reset User</button> */}
      {/* <PriceAlertNotification /> */}
      <div>
        <p>Stock Tracker</p>
        {width > 1500 && !location.pathname.includes("/dash/largeScreen") && (<button onClick={() => navigate("/dash/largeScreen")}>Large Screen View</button>)}
        {width < 1500 && location.pathname.includes("/dash/largeScreen") && (<button onClick={() => navigate("/dash/largeScreen")}>Smaller Screen View</button>)}
      </div>

      <div className="flex">
        <button className="buttonIcon" onMouseEnter={() => setShowCenterInformationDisplay(1)} onMouseLeave={() => setShowCenterInformationDisplay(0)}><ChessKing color="green" /></button>
        <button className="buttonIcon" onMouseEnter={() => setShowCenterInformationDisplay(2)} onMouseLeave={() => setShowCenterInformationDisplay(0)}><ChessQueen color="green" /></button>

      </div>

      {centerInformationDisplay === 1 ? <div className="flex">
        <p>XLRE: Real Estate</p>
        <p>XLY: Consumer Discretionary</p>
        <p>XLK: Technology</p>
        <p>XLF: Financials</p>
        <p>XLU: Utilities</p>
        <p>XLP: Consumer Staples</p>
        <p>XLE: Energy</p>
        <p>XLC: Communications</p>
        <p>XLI: Industrials</p>
        <p>XLV: Healthcare</p>
        <p>XLB: Materials</p>
      </div> :
        centerInformationDisplay === 2 ? <div className="flex">
          <p>GDX: Gold Miners</p>
          <p>//</p>
          <p>SMH: Semi Conductors ETF</p>
          <p>XBI: BioTech ETF</p>
          <p>KRP: Oil & Gas ETF</p>
          <p>XCP: BioTech ETF</p>
          <p>XRT: Retail ETF</p>
        </div> :
          <div>
            <input onChange={(e) => { handleSearchChange(e) }}
              onBlur={(e) => { e.target.value = ''; }}
              type="text" onInput={(e) => e.target.value = e.target.value.toUpperCase()} id="centerSearch"
              placeholder="Tracker Search" ref={searchRef} autoComplete="off" />

          </div>}

      <StreamProof />
      {searchThisTicker && <SearchResult tickerSymbol={searchThisTicker} handleNavigateClear={handleNavigateClear} />}


      <div className="flex" style={{ fontSize: 'var(--fs-100)' }}>
        <button onClick={() => attemptPlanRefetch()}>Plan <RefreshCcwDot size={15} /></button>
        {showRefreshDelivered ? <p>Stream Refreshed <Check color="green" /></p> : <button onClick={() => attemptStreamTickerRefresh()}>Stream <RefreshCcwDot size={15} /></button>}
        <button onClick={() => window.location.reload()}>Page <RefreshCcwDot size={15} /></button>
      </div>

    </nav>
  );
}

export default DashNav;
