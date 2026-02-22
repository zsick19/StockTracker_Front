import { useState } from 'react';
import FourGraphSplitContainer from './Components/FourGraphSplit/FourGraphSplitContainer';
import './StockDetailSection.css'
import MarketSearch from './Components/MarketSearch/MarketSearch';
import ConfirmMarketSearch from './Components/ConfirmMarketSearch/ConfirmMarketSearch';
import ChartSingleGraph from './Components/ChartSingleGraph/ChartSingleGraph';
import { useDispatch, useSelector } from 'react-redux';
import { selectStockDetailControl, setStockDetailState } from '../../../../features/SelectedStocks/StockDetailControlSlice';
import PlanViabilityStatus from './Components/PlanViabilityStatus/PlanViabilityStatus';
import ConfirmedStatus from './Components/ConfirmedStatus/ConfirmedStatus';
import EnterExitTradeGraph from './Components/TradeGraph/EnterExitTradeGraph';
import TradingJournal from './Components/TradingJournal/TradingJournal';
import PreWatchMany from './Components/PrewatchMany/PrewatchMany';
import { Binoculars, ChartCandlestick, Expand, ListChecks, ListTodo, NotebookPen, PencilRuler, PiggyBank, SpellCheck } from 'lucide-react';
import PlanStatusView from './Components/PlanStatusView/PlanStatusView';
import SyncWithBackendVisual from './Components/SyncVisual/SyncWithBackendVisual';
import BestPositionSplit from './Components/BestPositionSplit/BestPositionSplit';

function StockDetailSection()
{
  const dispatch = useDispatch()
  const currentStockDetail = useSelector(selectStockDetailControl)

  const [currentMarketSearchPage, setCurrentMarketSearchPage] = useState(1)
  const [marketSearchFilter, setMarketSearchFilter] = useState({
    AvgVolume: undefined, Sector: undefined, Industry: undefined,
    MarketCap: undefined, ATR: undefined, Volume: undefined, Country: undefined
  })

  function provideDetailContent()
  {
    switch (currentStockDetail)
    {
      case 0: return <FourGraphSplitContainer />
      case 1: return <MarketSearch currentMarketSearchPage={currentMarketSearchPage}
        setCurrentMarketSearchPage={setCurrentMarketSearchPage}
        marketSearchFilter={marketSearchFilter}
        setMarketSearchFilter={setMarketSearchFilter} />
      case 2: return <ConfirmMarketSearch />
      case 3: return <ConfirmedStatus />
      case 4: return <PlanViabilityStatus />
      case 5: return <ChartSingleGraph />
      case 6: return <PreWatchMany watchList={0} />
      case 11: return <PreWatchMany watchList={1} />
      case 12: return <PreWatchMany watchList={2} />
      case 13: return <PreWatchMany watchList={3} />
      case 7: return <PlanStatusView />
      case 8: return <EnterExitTradeGraph />
      case 9: return <TradingJournal />
      case 10: return <SyncWithBackendVisual />
      case 14: return <BestPositionSplit />
    }
  }



  return (
    <section id="StockDetailSection">
      <nav>
        <button onClick={() => dispatch(setStockDetailState(0))}><Expand color='yellow' /><p>Four Graph</p></button>

        <button onClick={() => dispatch(setStockDetailState(1))}><Binoculars color='green' /><p>Market Search</p></button>
        <button onClick={() => dispatch(setStockDetailState(2))}><ListTodo color='green' /><p>Double Check</p></button>
        <button onClick={() => dispatch(setStockDetailState(3))}><ListChecks color='pink' /><p>Confirmed</p></button>
        <button onClick={() => dispatch(setStockDetailState(5))}><PencilRuler color='yellow' /><p>Charting Graph</p></button>
        <button onClick={() => dispatch(setStockDetailState(4))}><SpellCheck color='green' /><p>Viability Check</p></button>
        <button onClick={() => dispatch(setStockDetailState(7))}><PiggyBank color='pink' /><p>Plans</p></button>
        <button onClick={() => dispatch(setStockDetailState(14))}><ChartCandlestick color='yellow' /><p>Best Positions</p></button>
        <button onClick={() => dispatch(setStockDetailState(9))}><NotebookPen color='green' /><p>Trading Journal</p></button>
      </nav>
      {provideDetailContent()}
    </section>
  );
}

export default StockDetailSection;
