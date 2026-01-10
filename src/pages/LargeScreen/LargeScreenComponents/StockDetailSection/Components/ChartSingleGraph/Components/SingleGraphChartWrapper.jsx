import React from 'react'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../features/StockData/StockDataSliceApi'

import ChartWithChartingWrapper from '../../../../../../../components/ChartSubGraph/ChartWithChartingWrapper'
import GraphLoadingSpinner from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import GraphLoadingError from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
import { Info, KeyRound, Plane, Save, Siren } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentTool, setTool } from '../../../../../../../features/Charting/ChartingTool'
import { AlertTools, ChartingTools, PlanningTools } from '../../../../../../../Utilities/ChartingTools'


function SingleGraphChartWrapper({ ticker, timeFrame, chartId, setChartInfoDisplay })
{
    const dispatch = useDispatch()
    const currentTool = useSelector(selectCurrentTool)
    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker, timeFrame, info: true })


    let actualGraph
    if (isSuccess && data.candleData.length > 0)
    {
        actualGraph = <ChartWithChartingWrapper ticker={ticker} candleData={data} chartId={chartId} timeFrame={timeFrame} />
    } else if (isSuccess) { actualGraph = <div>No Data To Display</div> }
    else if (isLoading) { actualGraph = <GraphLoadingSpinner /> }
    else if (isError) { actualGraph = <GraphLoadingError refetch={refetch} /> }


    return (
        <div id='LHS-SingleGraphForChartingWrapper'>
            {actualGraph}
            <div id='LHS-SingleGraphToolBar'>

                <p className='veryTinyText'>Draw</p>
                {ChartingTools.map((tool, index) => { return <button key={tool.tool} title={tool.tool} onClick={() => dispatch(setTool(ChartingTools[index].tool))} className={currentTool === ChartingTools[index].tool ? 'currentTool' : 'notCurrentTool'} >{ChartingTools[index].icon}</button> })}
                <br />
                <br />


                <p className='veryTinyText'>Plan</p>
                <button title='Planning' onClick={() => setChartInfoDisplay(1)}><Plane size={20} color='white' /></button>
                <p className='veryTinyText'>Levels</p>
                <button title='Key Levels' onClick={() => setChartInfoDisplay(2)}><KeyRound size={20} color='white' /></button>
                <p className='veryTinyText'>Alerts</p>
                <button title='Alerts' onClick={() => setChartInfoDisplay(3)}><Siren size={20} color='white' /></button>
                <p className='veryTinyText'>Info</p>
                <button onClick={() => setChartInfoDisplay(0)}><Info size={20} color='white' /></button>

                <br />
                <br />

                <p className='veryTinyText'>Utility</p>
                <button><Save size={20} color='white' /></button>
            </div>
        </div>
    )
}

export default SingleGraphChartWrapper