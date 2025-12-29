import React, { useMemo, useRef, useState } from "react";
import "../MacroControlSection/MacroControlSection.css";
import ChartSubGraphContainer from "../../../../components/ChartSubGraph/ChartSubGraphContainer";
import MacroWatchListContainer from "./Components/MacroWatchListContainer";

import { useCreateUserWatchListMutation } from "../../../../features/WatchList/WatchListSliceApi";
import { CirclePlus } from "lucide-react";

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

  const [createUserWatchList, { isSuccess, isError }] = useCreateUserWatchListMutation()
  const addWatchListTitle = useRef()
  const [showAddWatchlist, setShowAddWatchlist] = useState(false)
  const [errorMessage, setErrorMessage] = useState(undefined)

  async function attemptAddingMacroWatchList(e)
  {
    e.preventDefault()
    try
    {
      let title = addWatchListTitle.current.value
      if (title !== '')
      {
        await createUserWatchList({ userId: '6952bd331482f8927092ddcc', watchListInfo: { title }, macroWatchlist: true }).unwrap()
        addWatchListTitle.current.value = ''
        setShowAddWatchlist(false)
      }
    } catch (error)
    {
      setErrorMessage("Error Adding Watchlist")
      console.log(error)
    }
  }

  return (
    <section id="LSH-MacroSection">

      <div id="LSH-MacroWatchLists">
        <MacroWatchListContainer setPrimaryChartTicker={setPrimaryChartTicker} setSecondaryChartTicker={setSecondaryChartTicker} />

        {showAddWatchlist ?
          <div className="LSH-AddWatchListForm">
            <form onSubmit={(e) => attemptAddingMacroWatchList(e)}>
              <input type="text" ref={addWatchListTitle} />
              <button><CirclePlus /></button>
            </form>
            <button onClick={() => setShowAddWatchlist(false)}>Cancel</button>
          </div> :
          <div>
            <button onClick={() => setShowAddWatchlist(true)}>Create A New Macro</button>
          </div>}

        <div>
          {errorMessage}
          <form>
            <input type="text" ref={secondarySearchTicker} />
            <button type="button" onClick={(e) => handleSecondaryChartSearch(e)}>Second Chart</button>
          </form>

          <div className='flex'>
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
