import { useState } from "react";
import '../ChartSubGraph/ChartSubGraph.css'
import ChartTimeFrameBar from "./ChartTimeFrameBar";
import { defaultTimeFrames } from "../../Utilities/TimeFrames";
import ChartGraph from "./ChartGraph";
import SubChartGraph from "./SubChartGraph";
import ChartMenuBar from "./ChartMenuBar";

function ChartSubGraphContainer({ ticker })
{
  //ticker to search for
  //show any subcharts/studies
  const [timeFrame, setTimeFrame] = useState(defaultTimeFrames.dailyOneYear);
  const [showTimeFrameModal, setShowTimeFrameModal] = useState(false)
  const [subCharts, setSubCharts] = useState(['rsi'])

  const chartData = [{ result: 'sample' }]
  //timeframe modal for custom or button through time framebar for quick
  let actualChart
  if (chartData)
  {
    actualChart = <ChartGraph />
  }


  return (
    <div className="ChartSubContainer">
      <ChartTimeFrameBar ticker={ticker} timeFrame={timeFrame} setTimeFrame={setTimeFrame} subCharts={subCharts} setSubCharts={setSubCharts} setShowTimeFrameModal={setShowTimeFrameModal} />
      
      <ChartMenuBar />

      <div className="ChartGraphWrapper">
        {actualChart}
      </div>
      {showTimeFrameModal && <div>Time Frame Modal</div>}

      {subCharts.length > 0 &&
        <div className="SubChartWrapper">
          {subCharts.map((subChart) => <SubChartGraph />)}
        </div>
      }
    </div>
  );
}

export default ChartSubGraphContainer;
