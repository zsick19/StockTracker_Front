import React, { useEffect, useMemo, useState } from 'react'
import { useGetStockDataUsingTimeFrameQuery } from '../../../../../../../features/StockData/StockDataSliceApi'
import ChartWithChartingWrapper from '../../../../../../../components/ChartSubGraph/ChartWithChartingWrapper'
import GraphLoadingSpinner from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingSpinner'
import GraphLoadingError from '../../../../../../../components/ChartSubGraph/GraphFetchStates/GraphLoadingError'
import { Binoculars, Check, Info, KeyRound, Newspaper, Plane, Save, Siren, Trash2, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentTool, setTool } from '../../../../../../../features/Charting/ChartingTool'
import { ChartingToolEdits, ChartingTools } from '../../../../../../../Utilities/ChartingTools'
import { useRemoveChartableStockMutation, useUpdateChartingDataMutation } from '../../../../../../../features/Charting/ChartingSliceApi'
import { makeSelectChartAlteredByTicker } from '../../../../../../../features/Charting/chartingElements'
import { makeSelectEnterExitPlanAltered } from '../../../../../../../features/EnterExitPlans/EnterExitGraphElement'
import { selectChartEditMode, setChartEditMode } from '../../../../../../../features/Charting/EditChartSelection'
import { useUpdateEnterExitPlanMutation } from '../../../../../../../features/EnterExitPlans/EnterExitApiSlice'
import { selectConfirmedUnChartedTrio } from '../../../../../../../features/SelectedStocks/PreviousNextStockSlice'
import { setSingleChartTickerTimeFrameAndChartingId } from '../../../../../../../features/SelectedStocks/SelectedStockSlice'
import { selectSPYIdFromUser } from '../../../../../../../features/Initializations/InitializationSliceApi'
import { clearStockInfo, setStockInfoAndNews } from '../../../../../../../features/StockData/StockInfoElement'
import RSISubChart from '../../../../../../../components/ChartSubGraph/SubCharts/RSISubChart'
import VortexSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/VortexSubChart'
import StochasticSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/StochasticSubChart'
import MACDSubChart from '../../../../../../../components/ChartSubGraph/SubCharts/MACDSubChart'


function SingleGraphChartWrapper({ ticker, subCharts, timeFrame, setTimeFrame, chartId, setChartInfoDisplay, uuid })
{
    const dispatch = useDispatch()
    const currentTool = useSelector(selectCurrentTool)

    const selectedChartingMemo = useMemo(makeSelectChartAlteredByTicker, [])
    const chartingAltered = useSelector(state => selectedChartingMemo(state, ticker))

    const selectedEnterExitPlanAlteredMemo = useMemo(makeSelectEnterExitPlanAltered, [])
    const enterExitAltered = useSelector(state => selectedEnterExitPlanAlteredMemo(state, ticker))

    const editMode = useSelector(selectChartEditMode)
    const userSpyId = useSelector(selectSPYIdFromUser)

    const currentUnChartedTicker = useSelector(selectConfirmedUnChartedTrio)


    const [updateEnterExitPlan, { isLoading: isEnterExitLoading }] = useUpdateEnterExitPlanMutation()
    const [serverResponse, setServerResponse] = useState(undefined)

    const { data, isSuccess, isLoading, isError, error, refetch } = useGetStockDataUsingTimeFrameQuery({ ticker, timeFrame, liveFeed: false, info: true, provideNews: true })

    const interactionController = { isLivePrice: false, isInteractive: true, isZoomAble: true }
    let actualGraph
    if (isSuccess && data.candleData.length > 0)
    {
        actualGraph = <ChartWithChartingWrapper ticker={ticker} interactionController={interactionController} candleData={data} chartId={chartId} timeFrame={timeFrame} setTimeFrame={setTimeFrame} uuid={uuid} />
    } else if (isSuccess) { actualGraph = <div>No Data To Display</div> }
    else if (isLoading) { actualGraph = <GraphLoadingSpinner /> }
    else if (isError)
    {
        actualGraph = <GraphLoadingError refetch={refetch} />
        dispatch(clearStockInfo())
    }

    const [updateChartingData] = useUpdateChartingDataMutation()
    const [removeChartableStock] = useRemoveChartableStockMutation()


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
            await updateEnterExitPlan({ ticker, chartId }).unwrap()
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

    async function attemptRemoveOfConfirmedStock()
    {
        if (!chartId || chartId === userSpyId) return
        try
        {
            const results = await removeChartableStock({ chartId }).unwrap()
            if (currentUnChartedTicker.next) { dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: currentUnChartedTicker.next.ticker, chartId: currentUnChartedTicker.next.chartId })) }
            else if (currentUnChartedTicker.previous) { dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: currentUnChartedTicker.previous.ticker, chartId: currentUnChartedTicker.previous.chartId })) }
            else { dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: 'SPY', chartId: undefined })) }
        } catch (error)
        {
            console.log(error)
        }
    }

    useEffect(() =>
    {
        if (!isSuccess) return

        if (data?.tickerInfo) { dispatch(setStockInfoAndNews({ info: data.tickerInfo, news: data.news })) }
        else { dispatch(clearStockInfo()) }

    }, [data])

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
                }
            })
        }
    }

    const [showDoubleCheckRemoval, setShowDoubleCheckRemoval] = useState()
    return (
        <div id='LHS-SingleGraphForChartingWrapper'>

            <div id='LHS-SingleChartAndSubCharts'>
                {actualGraph}
                {subCharts.length > 0 && <div className="SubChartWrapper">{provideSubCharts()}</div>}
            </div>


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
                <p className='veryTinyText'>News</p>
                <button onClick={() => setChartInfoDisplay(4)}><Newspaper size={20} color='white' /></button>
                <p className='veryTinyText'>Info</p>
                <button onClick={() => setChartInfoDisplay(0)}><Info size={20} color='white' /></button>

                <br />
                <br />

                <p className='veryTinyText'>Utility</p>
                <button disabled={!chartId || !chartingAltered.altered} title='Direct Save' onClick={attemptSavingCharting}><Save size={20} color={chartingAltered.altered ? 'white' : 'gray'} /></button>
                {serverResponse === "positive" && <Check color='green' size={20} />}
                {serverResponse === "negative" && <X color='red' size={20} />}

                {showDoubleCheckRemoval ?
                    <div>
                        <button onClick={() => setShowDoubleCheckRemoval(false)}><X /> </button>
                        {(chartId && (chartId !== userSpyId)) && <button onClick={attemptRemoveOfConfirmedStock}><Trash2 color='red' /></button>}
                    </div>
                    : (chartId && (chartId !== userSpyId)) && <button onClick={() => setShowDoubleCheckRemoval(true)}><Trash2 /></button>
                }


                {/* <button title='Initiate Tracking' disabled={isEnterExitLoading} onClick={() => attemptInitiatingPlanTracking()}  ><Binoculars className='blinkingRed' size={20} /></button> */}
                {((chartingAltered.hasPlanCharted && !enterExitAltered) || enterExitAltered) && <button title='Initiate Tracking' disabled={isEnterExitLoading} onClick={() => attemptInitiatingPlanTracking()} ><Binoculars className='blinkingRed' size={20} color={isEnterExitLoading ? 'gray' : 'red'} /></button>}
            </div>
        </div>
    )
}

export default SingleGraphChartWrapper