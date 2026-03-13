import React, { useEffect, useMemo, useState } from 'react'
import './MacroChartingGraph.css'
import { useDispatch, useSelector } from 'react-redux'
import { selectSingleChartStock } from '../../../../../../features/SelectedStocks/SelectedStockSlice'
import ChartMenuBar from '../../../../../../components/ChartSubGraph/ChartMenuBar'
import * as short from 'short-uuid'
import MacroChartWrapper from './Components/MacroChartWrapper'
import { useFetchUsersMacroWatchListQuery } from '../../../../../../features/WatchList/WatchListStreamingSliceApi'

function MacroChartingGraph()
{
    const dispatch = useDispatch()
    const uuid = useMemo(() => short.generate(), [])

    const selectedTicker = useSelector(selectSingleChartStock)
    const [subCharts, setSubCharts] = useState([])
    const [macroChartInfoDisplay, setMacroChartInfoDisplay] = useState(0)
    const [timeFrame, setTimeFrame] = useState(selectedTicker.timeFrame)

    function provideMacroChartInfoDisplay()
    {
        switch (macroChartInfoDisplay)
        {
            case 0:
                return (<div className='macroInfoDisplay'>
                    General Info Goes here
                </div>)
                break;

            default:
                break;
        }
    }

    useEffect(() => { setTimeFrame(selectedTicker.timeFrame) }, [selectedTicker])
    const { macroTicker } = useFetchUsersMacroWatchListQuery(undefined, { selectFromResult: ({ data }) => ({ macroTicker: data?.tickerState.entities[selectedTicker.ticker], }), });

    return (
        <div id='LHS-MacroGraphForCharting'>
            <div id='LHS-MacroChartAndHeader'>
                <ChartMenuBar ticker={selectedTicker.ticker} setTimeFrame={setTimeFrame} timeFrame={timeFrame} uuid={uuid} subCharts={subCharts} setSubCharts={setSubCharts} />
                {selectedTicker ?
                    <MacroChartWrapper ticker={selectedTicker.ticker}
                        subCharts={subCharts}
                        timeFrame={timeFrame}
                        setTimeFrame={setTimeFrame}
                        chartId={selectedTicker.chartId}
                        setChartInfoDisplay={setMacroChartInfoDisplay}
                        uuid={uuid}
                        macroTickerInfo={macroTicker}
                    /> : <div>No chart selected</div>}
            </div>


            {provideMacroChartInfoDisplay()}


        </div>
    )
}

export default MacroChartingGraph