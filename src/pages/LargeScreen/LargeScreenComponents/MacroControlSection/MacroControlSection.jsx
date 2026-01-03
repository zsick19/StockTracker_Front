import React, { useEffect, useMemo, useRef, useState } from "react";
import "../MacroControlSection/MacroControlSection.css";
import ChartSubGraphContainer from "../../../../components/ChartSubGraph/ChartSubGraphContainer";
import MacroWatchListContainer from "./Components/MacroWatchLists/MacroWatchListContainer";

import { useCreateUserWatchListMutation } from "../../../../features/WatchList/WatchListSliceApi";
import { ChartLine, CirclePlus, ListOrdered } from "lucide-react";
import MacroKeyValuesInputContainer from "./Components/MacroKeyInputs/MacroKeyValuesInputContainer";
import { selectSPYIdFromUser } from "../../../../features/Initializations/InitializationSliceApi";
import { useSelector } from "react-redux";

function MacroControlSection()
{
  const memoizedSelectedSPYId = useMemo(() => selectSPYIdFromUser({ userId: '6952bd331482f8927092ddcc' }), [])
  const usersSPYId = useSelector(memoizedSelectedSPYId)
  useEffect(() => { if (usersSPYId) setPrimaryChartTicker({ ticker: 'SPY', _id: usersSPYId }) }, [usersSPYId])

  const addWatchListTitle = useRef()
  const secondarySearchTicker = useRef();
  const [primaryChartTicker, setPrimaryChartTicker] = useState({ ticker: "SPY", _id: usersSPYId });
  const [secondaryChartTicker, setSecondaryChartTicker] = useState({ ticker: "SPY", _id: usersSPYId });
  const [showAddWatchlist, setShowAddWatchlist] = useState(false)
  const [showMacroKeyLevelDisplay, setShowMacroKeyLevelDisplay] = useState(false)
  const [errorMessage, setErrorMessage] = useState(undefined)

  const [createUserWatchList, { isSuccess, isError }] = useCreateUserWatchListMutation()

  const handleSecondaryChartSearch = (e) =>
  {
    e.preventDefault();
    setSecondaryChartTicker(secondarySearchTicker.current.value);
    secondarySearchTicker.current.value = "";
  };

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
        {showAddWatchlist ? <div className="LSH-AddWatchListForm">
          <form onSubmit={(e) => attemptAddingMacroWatchList(e)}>
            <input type="text" ref={addWatchListTitle} />
            <button><CirclePlus /></button>
          </form>
          <button onClick={() => setShowAddWatchlist(false)}>Cancel</button>
        </div> :
          <div className="LSH-MacroOptionControlButtons">
            <button onClick={() => { }}><ListOrdered size={16} /></button>
            <button onClick={() => setShowMacroKeyLevelDisplay(true)}><ChartLine size={16} /></button>
            <button onClick={() => setShowAddWatchlist(true)}><CirclePlus size={16} /></button>
          </div>}

        <div>
          {errorMessage}
          <form>
            <input type="text" ref={secondarySearchTicker} />
            <button type="button" onClick={(e) => handleSecondaryChartSearch(e)}>Second Chart</button>
          </form>

        </div>
      </div>

      <div id="LSH-MacroCharts">
        <ChartSubGraphContainer ticker={primaryChartTicker} />
        {showMacroKeyLevelDisplay ? <MacroKeyValuesInputContainer selectedStock={primaryChartTicker} setShowMacroKeyLevelDisplay={setShowMacroKeyLevelDisplay} /> : <ChartSubGraphContainer ticker={secondaryChartTicker} />}
      </div>
    </section>
  );
}

export default MacroControlSection;
