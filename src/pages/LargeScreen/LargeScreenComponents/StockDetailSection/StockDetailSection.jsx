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

function StockDetailSection()
{
  const dispatch = useDispatch()
  const currentStockDetail = useSelector(selectStockDetailControl)

  const [currentMarketSearchPage, setCurrentMarketSearchPage] = useState(1)
  const [marketSearchFilter, setMarketSearchFilter] = useState({ AvgVolume: undefined, Sector: undefined, Industry: undefined, MarketCap: undefined, ATR: undefined, Volume: undefined, Country: undefined })

  function provideDetailContent()
  {
    switch (currentStockDetail)
    {
      case 0: return <FourGraphSplitContainer />
      case 1: return <MarketSearch currentMarketSearchPage={currentMarketSearchPage} setCurrentMarketSearchPage={setCurrentMarketSearchPage} marketSearchFilter={marketSearchFilter} setMarketSearchFilter={setMarketSearchFilter} />
      case 2: return <ConfirmMarketSearch />
      case 3: return <ConfirmedStatus />
      case 4: return <PlanViabilityStatus />
      case 5: return <ChartSingleGraph />
      case 6: return <PreWatchMany />
      case 7: return <div>Build Large Plan List Like Confirmed</div>
      case 8: return <EnterExitTradeGraph />
      case 9: return <TradingJournal />
    }
  }



  return (
    <section id="StockDetailSection">
      <nav>
        <button onClick={() => dispatch(setStockDetailState(0))}>Four Graph Split</button>
        <button onClick={() => dispatch(setStockDetailState(5))}>Single Graph For Charting</button>

        <button onClick={() => dispatch(setStockDetailState(1))}>Market Search</button>
        <button onClick={() => dispatch(setStockDetailState(2))}>Confirmation</button>
        <button onClick={() => dispatch(setStockDetailState(3))}>Confirmed Status</button>

        <button onClick={() => dispatch(setStockDetailState(4))}>Plan Viability Status</button>
        <button onClick={() => dispatch(setStockDetailState(6))}>PreWatch</button>
        <button onClick={() => dispatch(setStockDetailState(7))}>Plan List</button>
        <button onClick={() => dispatch(setStockDetailState(8))}>Trade Graph</button>
        <button onClick={() => dispatch(setStockDetailState(9))}>Trading Journal</button>
      </nav>
      {provideDetailContent()}
    </section>
  );
}

export default StockDetailSection;
