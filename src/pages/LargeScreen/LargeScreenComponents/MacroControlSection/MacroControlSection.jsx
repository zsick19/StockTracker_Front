import React, { useMemo, useRef, useState } from "react";
import "../MacroControlSection/MacroControlSection.css";
import ChartSubGraphContainer from "../../../../components/ChartSubGraph/ChartSubGraphContainer";
import MacroWatchListContainer from "./Components/MacroWatchListContainer";
import { InitializationApiSlice, selectMacroWatchListsFromUser, useGetUserInitializationQuery } from "../../../../features/Initializations/InitializationSliceApi";
import { useSelector } from "react-redux";

function MacroControlSection()
{
  const secondarySearchTicker = useRef();
  const [primaryChartTicker, setPrimaryChartTicker] = useState({ ticker: "SPY", _id: undefined });
  const [secondaryChartTicker, setSecondaryChartTicker] = useState({ ticker: "SPY", _id: undefined });

  const handleSecondaryChartSearch = (e) =>
  {
    e.preventDefault();
    setSecondaryChartTicker(secondarySearchTicker.current.value);
    secondarySearchTicker.current.value = "";
  };



  return (
    <section id="LSH-MacroSection">

      <div id="LSH-MacroWatchLists">
        <MacroWatchListContainer setPrimaryChartTicker={setPrimaryChartTicker} setSecondaryChartTicker={setSecondaryChartTicker} />

        <div>
          <form>
            <input type="text" ref={secondarySearchTicker} />
            <button type="button" onClick={(e) => handleSecondaryChartSearch(e)}>Second Chart</button>
          </form>

          <div className='flex'>
            <button>Create A New Macro</button>
            <button>Input Macro levels</button>
          </div>
        </div>
      </div>

      <div id="LSH-MacroCharts">
        <ChartSubGraphContainer ticker={primaryChartTicker} />
        <ChartSubGraphContainer ticker={secondaryChartTicker} />
      </div>
    </section>
  );
}

export default MacroControlSection;
