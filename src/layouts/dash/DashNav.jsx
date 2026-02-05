import React from "react";
import useWindowSize from "../../hooks/useWindowSize";
import { useLocation, useNavigate } from "react-router-dom";
import { usePopulateMacroTickersMutation, useResetUserMutation } from "../../features/test/testApiSlice";

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
      <p>Stock Tracker 3.0</p>

      <button onClick={() => attemptPopulatingMacros()} disabled>Populate Macros</button>

      <button onClick={() => attemptResettingUser()}>Dev Reset User</button>
    </nav>
  );
}

export default DashNav;
