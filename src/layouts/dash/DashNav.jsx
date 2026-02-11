import React, { useState } from "react";
import useWindowSize from "../../hooks/useWindowSize";
import { useLocation, useNavigate } from "react-router-dom";
import { usePopulateMacroTickersMutation, useResetUserMutation } from "../../features/test/testApiSlice";
import { ChessKing } from "lucide-react";

function DashNav()
{
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

  return (
    <nav id="DashNav">
      {width > 1500 && !location.pathname.includes("/dash/largeScreen") && (
        <button onClick={() => navigate("/dash/largeScreen")}>
          Large Screen View
        </button>
      )}
      {width < 1500 && location.pathname.includes("/dash/largeScreen") && (
        <button onClick={() => navigate("/dash/largeScreen")}>
          Smaller Screen View
        </button>
      )}


      <p>Stock Tracker</p>
      {showSectorAbbr && <div className="flex">
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
      </div>}
      {/* <button onClick={() => attemptPopulatingMacros()} disabled>Populate Macros</button> */}
      {/* <button onClick={() => attemptResettingUser()}>Dev Reset User</button> */}
      <button className="buttonIcon" onMouseEnter={() => setShowSectorAbbr(true)} onMouseLeave={() => setShowSectorAbbr(false)}><ChessKing color="green" /></button>
    </nav>
  );
}

export default DashNav;
