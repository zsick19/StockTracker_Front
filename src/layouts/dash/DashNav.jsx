import React from "react";
import useWindowSize from "../../hooks/useWindowSize";
import { useLocation, useNavigate } from "react-router-dom";

function DashNav() {
  const width = useWindowSize();
  const navigate = useNavigate();
  const location = useLocation();

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
      <p>UserName</p>
    </nav>
  );
}

export default DashNav;
