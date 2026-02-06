import { useState } from "react";
import '../ChartSubGraph/ChartSubGraph.css'
import SubChartGraph from "./SubChartGraph";

import ChartWithChartingWrapper from "./ChartWithChartingWrapper";
import { useGetStockDataUsingTimeFrameQuery } from "../../features/StockData/StockDataSliceApi";
import GraphLoadingSpinner from "./GraphFetchStates/GraphLoadingSpinner";
import GraphLoadingError from "./GraphFetchStates/GraphLoadingError";
import ChartMenuBar from "./ChartMenuBar";
import RSISubChart from "./SubCharts/RSISubChart";
import VortexSubChart from "./SubCharts/VortexSubChart";
import MACDSubChart from "./SubCharts/MACDSubChart";

function ChartSubGraphContainer({ ticker, uuid, incomingTF })
{
  const [timeFrame, setTimeFrame] = useState(incomingTF);
  const [subCharts, setSubCharts] = useState([])

  const { data: stockData, isSuccess, isLoading, isError, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker: ticker.ticker, liveFeed: true, provideNews: false, timeFrame })


  let actualChart
  if (isSuccess && stockData.candleData.length > 0)
  {
    actualChart = <ChartWithChartingWrapper ticker={ticker.ticker} candleData={stockData} chartId={ticker._id}
      timeFrame={timeFrame} uuid={uuid} lastCandleData={stockData.mostRecentTickerCandle} candlesToKeepSinceLastQuery={stockData.candlesToKeepSinceLastQuery}
      interactionController={{ isLivePrice: true, isInteractive: false, isZoomAble: true }} />


  }
  else if (isSuccess) { actualChart = <div>No Data to display</div> }
  else if (isLoading) { actualChart = <GraphLoadingSpinner /> }
  else if (isError) { actualChart = <GraphLoadingError refetch={refetch} /> }


  return (
    <div className="ChartSubContainer">
      <ChartMenuBar ticker={ticker.ticker} timeFrame={timeFrame} setTimeFrame={setTimeFrame} uuid={uuid} subCharts={subCharts} setSubCharts={setSubCharts} />
      {actualChart}
      {subCharts.length > 0 &&
        <div className="SubChartWrapper">
          {subCharts.map((subChart) =>
          {
            switch (subChart)
            {
              case 'rsi': return <RSISubChart candleData={stockData.candleData} uuid={uuid} timeFrame={timeFrame} />
              case 'vortex': return <VortexSubChart candleData={stockData.candleData} uuid={uuid} />
              case 'MACD': return <MACDSubChart candleData={stockData.candleData} uuid={uuid} />
            }
          })}
        </div>}
    </div>
  );
}

export default ChartSubGraphContainer;
