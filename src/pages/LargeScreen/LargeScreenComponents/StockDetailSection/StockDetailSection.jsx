import { useState } from 'react';
import FourGraphSplitContainer from './Components/FourGraphSplit/FourGraphSplitContainer';
import './StockDetailSection.css'
import MarketSearch from './Components/MarketSearch/MarketSearch';
import ConfirmMarketSearch from './Components/ConfirmMarketSearch/ConfirmMarketSearch';
import ChartSingleGraph from './Components/ChartSingleGraph/ChartSingleGraph';
import PreWatchMany from './Components/PrewatchMany/PrewatchMany';
import { useDispatch, useSelector } from 'react-redux';
import { selectStockDetailControl, setStockDetailState } from '../../../../features/SelectedStocks/StockDetailControlSlice';

function StockDetailSection()
{
  const dispatch = useDispatch()
  const currentStockDetail = useSelector(selectStockDetailControl)

  function provideDetailContent()
  {
    switch (currentStockDetail)
    {
      case 0: return <FourGraphSplitContainer />
      case 1: return <MarketSearch />
      case 2: return <ConfirmMarketSearch />
      case 3: return <ChartSingleGraph />
      case 4: return <PreWatchMany />
    }
  }

  return (
    <section id="StockDetailSection">
      <nav>
        <button onClick={() => dispatch(setStockDetailState(0))}>Four Graph Split</button>
        <button onClick={() => dispatch(setStockDetailState(1))}>Market Search</button>
        <button onClick={() => dispatch(setStockDetailState(2))}>Confirmation</button>
        <button onClick={() => dispatch(setStockDetailState(3))}>Single Graph For Charting</button>
        <button onClick={() => dispatch(setStockDetailState(4))}>Prewatch</button>
      </nav>
      {provideDetailContent()}
    </section>
  );
}

export default StockDetailSection;
