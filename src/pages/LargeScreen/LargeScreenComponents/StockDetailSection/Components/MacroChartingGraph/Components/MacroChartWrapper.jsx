import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentTool } from '../../../../../../../features/Charting/ChartingTool'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../features/StockData/StockDataSliceApi'
import ChartWithChartingWrapper from '../../../../../../../components/ChartSubGraph/ChartWithChartingWrapper'
import GraphLoadingError from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
import GraphLoadingSpinner from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import RSISubChart from '../../../../../../../components/ChartSubGraph/SubCharts/RSISubChart'
import VortexSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/VortexSubChart'
import StochasticSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/StochasticSubChart'
import MACDSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/MACDSubChart'
import CorrelationSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/CorrelationSubChart'
import MacroChartToolBar from './MacroChartToolBar'

function MacroChartWrapper({ ticker, subCharts, timeFrame, setTimeFrame, chartId, setChartInfoDisplay, uuid, macroTickerInfo })
{
    const dispatch = useDispatch()
    const currentTool = useSelector(selectCurrentTool)

    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker, timeFrame, liveFeed: true, info: false, provideNews: false })
    const interactionController = { isLivePrice: true, isInteractive: true, isZoomAble: true }

    let actualGraph
    if (isSuccess && data.candleData.length > 0)
    {
        actualGraph = <ChartWithChartingWrapper ticker={ticker}
            interactionController={interactionController} candleData={data}
            chartId={chartId} timeFrame={timeFrame} setTimeFrame={setTimeFrame}
            uuid={uuid} setChartInfoDisplay={setChartInfoDisplay} lastCandleData={data.mostRecentTickerCandle}
            macroTickerInfo={macroTickerInfo}
        />

    } else if (isSuccess) { actualGraph = <div>No Data To Display</div> }
    else if (isLoading) { actualGraph = <GraphLoadingSpinner /> }
    else if (isError)
    {
        actualGraph = <GraphLoadingError refetch={refetch} />

    }

    function provideSubCharts()
    {
        {
            return subCharts.map((subChart) =>
            {
                switch (subChart)
                {
                    case 'rsi': return <RSISubChart candleData={data.candleData} uuid={uuid} timeFrame={timeFrame} />
                    case 'vortex': return <VortexSubChart candleData={data.candleData} uuid={uuid} />
                    case 'stochastic': return <StochasticSubChart candleData={data.candleData} uuid={uuid} />
                    case 'MACD': return <MACDSubChart candleData={data.candleData} uuid={uuid} />
                    case 'correlation': return <CorrelationSubChart candleData={data.candleData} uuid={uuid} timeFrame={timeFrame} />
                }
            })
        }
    }

    return (
        <div id='LHS-MacroChartWrapper'>
            <div id='LHS-MacroChartAndSubCharts'>
                {actualGraph}
                {subCharts.length > 0 && <div>
                    {provideSubCharts()}
                </div>}
            </div>

            <MacroChartToolBar />
        </div>
    )
}

export default MacroChartWrapper