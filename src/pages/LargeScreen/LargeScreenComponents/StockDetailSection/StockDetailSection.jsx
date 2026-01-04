import { useState } from 'react';
import FourGraphSplitContainer from './Components/FourGraphSplit/FourGraphSplitContainer';
import './StockDetailSection.css'
import MarketSearch from './Components/MarketSearch/MarketSearch';
import ConfirmMarketSearch from './Components/ConfirmMarketSearch/ConfirmMarketSearch';
import ChartSingleGraph from './Components/ChartSingleGraph/ChartSingleGraph';
import PreWatchMany from './Components/PrewatchMany/PrewatchMany';

function StockDetailSection()
{
  const [detailContent, setDetailContent] = useState(0)

  function provideDetailContent()
  {
    switch (detailContent)
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
      <p>StockDetailSection</p>
      <nav>
        <button onClick={() => setDetailContent(0)}>Four Graph Split</button>
        <button onClick={() => setDetailContent(1)}>Market Search</button>
        <button onClick={() => setDetailContent(2)}>Confirmation</button>
        <button onClick={() => setDetailContent(3)}>Single Graph For Charting</button>
        <button onClick={() => setDetailContent(4)}>Prewatch</button>
      </nav>
      {provideDetailContent()}
    </section>
  );
}

export default StockDetailSection;
