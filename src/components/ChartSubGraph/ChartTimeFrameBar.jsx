import React, { useState } from "react";

function ChartTimeFrameBar({ ticker, setTimeFrame, timeFrame, subCharts, setSubCharts, setShowTimeFrameModal })
{


  return <nav className="ChartTimeFrameBar">
    {ticker}
    <button onClick={setShowTimeFrameModal(prev => !prev)}>1D:1Y</button>
  </nav>;
}

export default ChartTimeFrameBar;
