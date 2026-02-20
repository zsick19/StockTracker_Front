import React from 'react'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../features/StockData/StockDataSliceApi'
import ChartWithChartingWrapper from '../../../../../../../components/ChartSubGraph/ChartWithChartingWrapper'
import GraphLoadingSpinner from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import GraphLoadingError from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
import { Circle } from 'lucide-react'
import RSISubChart from '../../../../../../../components/ChartSubGraph/SubCharts/RSISubChart'
import VortexSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/VortexSubChart'
import StochasticSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/StochasticSubChart'
import MACDSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/MACDSubChart'
import { ChartingToolEdits } from '../../../../../../../Utilities/ChartingTools'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentTool } from '../../../../../../../features/Charting/ChartingTool'
import { selectChartEditMode, setChartEditMode } from '../../../../../../../features/Charting/EditChartSelection'
import CorrelationSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/CorrelationSubChart'

function TradeGraphChartWrapper({ selectedStock, uuid, timeFrame, setTimeFrame, showEMAs, subCharts })
{

    const dispatch = useDispatch()
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker: selectedStock.tickerSymbol, timeFrame: timeFrame, liveFeed: true, info: true })
    const currentTool = useSelector(selectCurrentTool)
    const editMode = useSelector(selectChartEditMode)

    let chartContent
    if (isSuccess && data.candleData.length > 0)
    {
        chartContent =

            <ChartWithChartingWrapper ticker={selectedStock.tickerSymbol} candleData={data}
                interactionController={{ isLivePrice: true, isInteractive: true, isZoomAble: true }}
                candlesToKeepSinceLastQuery={data.candlesToKeepSinceLastQuery} chartId={selectedStock.chartId}
                timeFrame={timeFrame} setTimeFrame={setTimeFrame} uuid={uuid} lastCandleData={data.mostRecentTickerCandle} showEMAs={showEMAs} />


    } else if (isSuccess) { chartContent = <div>No Data To Display for this ticker</div> }
    else if (isLoading) { chartContent = <GraphLoadingSpinner /> }
    else if (isError) { chartContent = <GraphLoadingError refetch={refetch} /> }

    function provideSubCharts()
    {
        return subCharts.map((subChart) =>
        {
            switch (subChart)
            {
                case 'rsi': return <RSISubChart candleData={data.candleData} uuid={uuid} timeFrame={timeFrame} />
                case 'vortex': return <VortexSubChart candleData={data.candleData} uuid={uuid} timeFrame={timeFrame} />
                case 'stochastic': return <StochasticSubChart candleData={data.candleData} uuid={uuid} timeFrame={timeFrame} />
                case 'MACD': return <MACDSubChart candleData={data.candleData} uuid={uuid} timeFrame={timeFrame} />
                case 'correlation': return <CorrelationSubChart candleData={data.candleData} uuid={uuid} timeFrame={timeFrame} />
            }
        })
    }


    return (
        <div id='LHS-TradeChartWrapper'>
            <div id='LHS-SingleChartAndSubCharts'>
                {chartContent}

                {subCharts.length > 0 &&
                    <div className="SubChartWrapper">
                        {provideSubCharts()}
                    </div>
                }

            </div>

            <div id='LHS-TradeWrapperChartingTools'>

                <p className='veryTinyText'>Edit</p>
                {ChartingToolEdits.map((editTool, index) => { return <button key={editTool.editTool} className={editMode === editTool.tool ? 'notCurrentTool buttonIcon' : 'currentEditMode buttonIcon'} title={editTool.editTool} onClick={() => dispatch(setChartEditMode(editTool.editTool))}>{editTool.icon}</button> })}
                <br />

            </div>
        </div>
    )
}

export default TradeGraphChartWrapper