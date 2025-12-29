import React, { useRef, useState } from "react";
import "../MacroControlSection/MacroControlSection.css";
import ChartSubGraphContainer from "../../../../components/ChartSubGraph/ChartSubGraphContainer";
import MacroWatchListContainer from "./Components/MacroWatchListContainer";

function MacroControlSection()
{
  const secondarySearchTicker = useRef();
  const [primaryChartTicker, setPrimaryChartTicker] = useState("SPY");
  const [secondaryChartTicker, setSecondaryChartTicker] = useState(undefined);

  const handleSecondaryChartSearch = (e) =>
  {
    e.preventDefault();
    setSecondaryChartTicker(secondarySearchTicker.current.value);
    secondarySearchTicker.current.value = "";
  };

  return (
    <section id="LSH-MacroSection">

      <div id="LSH-MacroWatchLists">
        <MacroWatchListContainer />
        <div>
          <button>Create A New Macro</button>
          <form>
            <input type="text" ref={secondarySearchTicker} />
            <button type="button" onClick={(e) => handleSecondaryChartSearch(e)}>Second Chart</button>
          </form>

          <button onClick={() => setSecondaryChartTicker(undefined)}>
            Clear Second Chart
          </button>
        </div>
      </div>

      <div id="LSH-MacroCharts">
        <ChartSubGraphContainer ticker={primaryChartTicker} />
        {secondaryChartTicker && (
          <ChartSubGraphContainer ticker={secondaryChartTicker} />
        )}
      </div>
    </section>
  );
}

export default MacroControlSection;
