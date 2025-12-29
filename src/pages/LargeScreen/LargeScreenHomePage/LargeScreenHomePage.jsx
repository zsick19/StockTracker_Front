import React from "react";
import MacroControlSection from "../LargeScreenComponents/MacroControlSection/MacroControlSection";
import ActiveTradeSection from "../LargeScreenComponents/ActiveTradeSection/ActiveTradeSection";
import StockDetailSection from "../LargeScreenComponents/StockDetailSection/StockDetailSection";
import "../LargeScreenHomePage/LargeScreenHomePage.css";

function LargeScreenHomePage() {
  return (
    <div id="LSH-Container">
      <MacroControlSection />
      <ActiveTradeSection />
      <StockDetailSection />
    </div>
  );
}

export default LargeScreenHomePage;
