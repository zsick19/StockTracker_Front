import React, { useMemo, useState } from 'react'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../features/StockData/StockDataSliceApi'

import ChartWithChartingWrapper from '../../../../../../../components/ChartSubGraph/ChartWithChartingWrapper'
import GraphLoadingSpinner from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import GraphLoadingError from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
import { Binoculars, Check, Info, KeyRound, PiggyBank, Plane, Save, Siren, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentTool, setTool } from '../../../../../../../features/Charting/ChartingTool'
import { AlertTools, ChartingToolEdits, ChartingTools, PlanningTools } from '../../../../../../../Utilities/ChartingTools'
import { useUpdateChartingDataMutation } from '../../../../../../../features/Charting/ChartingSliceApi'
import { makeSelectChartAlteredByTicker, makeSelectChartingByTicker } from '../../../../../../../features/Charting/chartingElements'
import { makeSelectEnterExitPlanAltered } from '../../../../../../../features/EnterExitPlans/EnterExitGraphElement'
import { selectChartEditMode, setChartEditMode } from '../../../../../../../features/Charting/EditChartSelection'
import { useUpdateEnterExitPlanMutation } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'


function SingleGraphChartWrapper({ ticker, timeFrame, chartId, setChartInfoDisplay })
{
    const dispatch = useDispatch()
    const currentTool = useSelector(selectCurrentTool)

    const selectedChartingMemo = useMemo(makeSelectChartAlteredByTicker, [])
    const chartingAltered = useSelector(state => selectedChartingMemo(state, ticker))

    const selectedEnterExitPlanAlteredMemo = useMemo(makeSelectEnterExitPlanAltered, [])
    const enterExitAltered = useSelector(state => selectedEnterExitPlanAlteredMemo(state, ticker))

    const editMode = useSelector(selectChartEditMode)

    const [updateEnterExitPlan] = useUpdateEnterExitPlanMutation()
    const [serverResponse, setServerResponse] = useState(undefined)


    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker, timeFrame, 
        liveFeed: false, info: true })
    let actualGraph
    if (isSuccess && data.candleData.length > 0)
    {
        actualGraph = <ChartWithChartingWrapper ticker={ticker} candleData={data} chartId={chartId} timeFrame={timeFrame} />
    } else if (isSuccess) { actualGraph = <div>No Data To Display</div> }
    else if (isLoading) { actualGraph = <GraphLoadingSpinner /> }
    else if (isError) { actualGraph = <GraphLoadingError refetch={refetch} /> }

    const [updateChartingData] = useUpdateChartingDataMutation()

    async function attemptSavingCharting()
    {
        try
        {
            await updateChartingData({ ticker, chartId })
            setServerResponse("positive")
            setTimeout(() =>
            {
                setServerResponse(undefined)
            }, 2000);
        } catch (error)
        {
            console.log(error)
            setServerResponse("error")
            setTimeout(() =>
            {
                setServerResponse(undefined)
            }, 2000);

        }
    }

    async function attemptInitiatingPlanTracking()
    {
        try
        {
            await updateEnterExitPlan({ ticker, chartId })
            setServerResponse("positive")
            setTimeout(() =>
            {
                setServerResponse(undefined)
            }, 2000);
        } catch (error)
        {
            console.log(error)
            setServerResponse("error")
            setTimeout(() =>
            {
                setServerResponse(undefined)
            }, 2000);
        }

    }

    return (
        <div id='LHS-SingleGraphForChartingWrapper'>
            {actualGraph}
            <div id='LHS-SingleGraphToolBar'>

                <p className='veryTinyText'>Draw</p>
                {ChartingTools.map((tool, index) => { return <button key={tool.tool} title={tool.tool} onClick={() => dispatch(setTool(ChartingTools[index].tool))} className={currentTool === ChartingTools[index].tool ? 'currentTool' : 'notCurrentTool'} >{ChartingTools[index].icon}</button> })}
                <br />
                <br />

                <p className='veryTinyText'>Edit</p>
                {ChartingToolEdits.map((editTool, index) => { return <button key={editTool.editTool} className={editMode === editTool.tool ? 'notCurrentTool' : 'currentEditMode'} title={editTool.editTool} onClick={() => dispatch(setChartEditMode(editTool.editTool))}>{editTool.icon}</button> })}
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
                <button disabled={!chartId || !chartingAltered.altered} title='Direct Save' onClick={attemptSavingCharting}><Save size={20} color={chartingAltered.altered ? 'white' : 'gray'} /></button>
                {serverResponse === "positive" && <Check color='green' size={20} />}
                {serverResponse === "negative" && <X color='red' size={20} />}

                {((chartingAltered.hasPlanCharted && !enterExitAltered) || enterExitAltered) && <button title='Initiate Tracking' onClick={() => attemptInitiatingPlanTracking()} ><Binoculars size={20} color='red' /></button>}
            </div>
        </div>
    )
}

export default SingleGraphChartWrapper