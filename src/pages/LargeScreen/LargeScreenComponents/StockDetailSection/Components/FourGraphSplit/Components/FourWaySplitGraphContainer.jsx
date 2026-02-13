import { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import './FourWaySplitGraph.css'
import * as short from 'short-uuid'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../features/StockData/StockDataSliceApi'
import GraphLoadingError from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
import GraphLoadingSpinner from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import ChartWithChartingWrapper from '../../../../../../../components/ChartSubGraph/ChartWithChartingWrapper'
import ChartMenuBar from '../../../../../../../components/ChartSubGraph/ChartMenuBar'
import RSISubChart from '../../../../../../../components/ChartSubGraph/SubCharts/RSISubChart'
import VortexSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/VortexSubChart'
import StochasticSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/StochasticSubChart'
import MACDSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/MACDSubChart'

function FourWaySpitGraphContainer({ selectedStock, index })
{
    const dispatch = useDispatch()

    const uuid = useMemo(() => short.generate(), [])
    let interactions = { isLivePrice: true, isInteractive: false, isZoomAble: true }


    const [timeFrame, setTimeFrame] = useState(selectedStock.timeFrame)
    const [subCharts, setSubCharts] = useState([])

    const { data: stockData, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker: selectedStock.ticker, timeFrame: timeFrame, liveFeed: true })


    let graphVisual
    if (isSuccess && stockData.candleData.length > 0)
    {
        graphVisual = <ChartWithChartingWrapper ticker={selectedStock.ticker} candleData={stockData} chartId={selectedStock?.chartId}
            timeFrame={selectedStock.timeFrame} uuid={uuid} interactionController={interactions}
            candlesToKeepSinceLastQuery={stockData.candlesToKeepSinceLastQuery} lastCandleData={stockData.mostRecentTickerCandle} />

    } else if (isSuccess) graphVisual = <div>No data to display for this ticker</div>
    else if (isLoading) graphVisual = <GraphLoadingSpinner />
    else if (isError) graphVisual = <GraphLoadingError />

    function provideSubCharts()
    {
        {
            return subCharts.map((subChart) =>
            {
                switch (subChart)
                {
                    case 'rsi': return <RSISubChart candleData={stockData.candleData} uuid={uuid} timeFrame={timeFrame} />
                    case 'vortex': return <VortexSubChart candleData={stockData.candleData} uuid={uuid} timeFrame={timeFrame} />
                    case 'stochastic': return <StochasticSubChart candleData={stockData.candleData} uuid={uuid} timeFrame={timeFrame} />
                    case 'MACD': return <MACDSubChart candleData={stockData.candleData} uuid={uuid} timeFrame={timeFrame} />
                }
            })
        }
    }


    return (
        <div className='LSH-FourWaySplitContainer'>

            <ChartMenuBar ticker={selectedStock.ticker} setTimeFrame={setTimeFrame} timeFrame={timeFrame}
                uuid={uuid} subCharts={subCharts} setSubCharts={setSubCharts} />

            {graphVisual}
            {subCharts.length > 0 && <div className="SubChartWrapper">{provideSubCharts()}</div>}

        </div>
    )
}

export default FourWaySpitGraphContainer