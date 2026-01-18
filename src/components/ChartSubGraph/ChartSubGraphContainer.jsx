import { useState } from "react";
import '../ChartSubGraph/ChartSubGraph.css'
import ChartTimeFrameBar from "./ChartTimeFrameBar";
import { defaultTimeFrames } from "../../Utilities/TimeFrames";
import SubChartGraph from "./SubChartGraph";
import ChartMenuBar from "./ChartMenuBar";
import ChartWithChartingWrapper from "./ChartWithChartingWrapper";
import { useGetStockDataUsingTimeFrameQuery } from "../../features/StockData/StockDataSliceApi";
import GraphLoadingSpinner from "./GraphFetchStates/GraphLoadingSpinner";
import GraphLoadingError from "./GraphFetchStates/GraphLoadingError";

function ChartSubGraphContainer({ ticker })
{
  const [timeFrame, setTimeFrame] = useState(defaultTimeFrames.dailyOneYear);
  const [subCharts, setSubCharts] = useState([])


  const { data: stockData, isSuccess, isLoading, isError, refetch } = useGetStockDataUsingTimeFrameQuery({
    ticker: ticker.ticker,
    liveFeed: true, timeFrame
  })

  let actualChart
  if (isSuccess && stockData.candleData.length > 0)
  {
    actualChart = <ChartWithChartingWrapper ticker={ticker} candleData={stockData} chartId={ticker._id} timeFrame={timeFrame} />
  }
  else if (isSuccess) { actualChart = <div>No Data to display</div> }
  else if (isLoading) { actualChart = <GraphLoadingSpinner /> }
  else if (isError) { actualChart = <GraphLoadingError refetch={refetch} /> }





  return (
    <div className="ChartSubContainer">
      <ChartTimeFrameBar ticker={ticker.ticker} timeFrame={timeFrame} setTimeFrame={setTimeFrame} subCharts={subCharts} setSubCharts={setSubCharts} />
      <ChartMenuBar />

      {actualChart}

      {subCharts.length > 0 &&
        <div className="SubChartWrapper">
          {subCharts.map((subChart) => <SubChartGraph />)}
        </div>}
    </div>
  );
}

export default ChartSubGraphContainer;
