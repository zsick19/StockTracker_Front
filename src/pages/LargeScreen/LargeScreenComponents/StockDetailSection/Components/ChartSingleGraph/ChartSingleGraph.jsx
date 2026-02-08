import React, { useEffect, useMemo, useState } from 'react'
import './ChartSingleGraph.css'
import './PanelDisplayStyles.css'
import { useDispatch, useSelector } from 'react-redux'
import { selectSingleChartStock, setSingleChartTickerTimeFrameAndChartingId } from '../../../../../../features/SelectedStocks/SelectedStockSlice'
import SingleGraphChartWrapper from './Components/SingleGraphChartWrapper'
import { selectConfirmedUnChartedTrio, setConfirmedUnChartedNavIndex } from '../../../../../../features/SelectedStocks/PreviousNextStockSlice'
import VisibilityModal from './Components/VisibilityModal'
import KeyLevelsPanel from './Components/ChartControlPanels/KeyLevelsPanel'
import EnterExitPanel from './Components/ChartControlPanels/EnterExitPanel'
import InfoPanel from './Components/ChartControlPanels/InfoPanel'
import AlertPanel from './Components/ChartControlPanels/AlertPanel'
import ChartMenuBar from '../../../../../../components/ChartSubGraph/ChartMenuBar'
import ContinueChartingNav from './Components/ContinueChartingNav'
import UnChartedProgressDisplay from './Components/UnChartedProgressDisplay'
import NewsPanel from './Components/ChartControlPanels/NewsPanel'
import * as short from 'short-uuid'



function ChartSingleGraph()
{
    const dispatch = useDispatch()

    const uuid = useMemo(() => short.generate(), [])
    const [subCharts, setSubCharts] = useState([])
    const [chartInfoDisplay, setChartInfoDisplay] = useState(0)
    const [showUnChartedList, setShowUnchartedList] = useState(false)


    const selectedTicker = useSelector(selectSingleChartStock)
    const currentUnChartedTicker = useSelector(selectConfirmedUnChartedTrio)
    const [timeFrame, setTimeFrame] = useState(selectedTicker.timeFrame)



    function handleNavigatingToNextUnChartedStock(nextDirection)
    {
        if (nextDirection)
        {
            if (currentUnChartedTicker.current.ticker === selectedTicker.ticker)
            {
                if (currentUnChartedTicker.next)
                {
                    dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: currentUnChartedTicker.next.ticker, chartId: currentUnChartedTicker.next.chartId }))
                    dispatch(setConfirmedUnChartedNavIndex({ next: nextDirection }))
                }
            } else { dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: currentUnChartedTicker.current.ticker, chartId: currentUnChartedTicker.current.chartId })) }
        } else
        {
            if (currentUnChartedTicker.current.ticker === selectedTicker.ticker)
            {
                if (currentUnChartedTicker.previous)
                {
                    dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: currentUnChartedTicker.previous.ticker, chartId: currentUnChartedTicker.previous.chartId }))
                    dispatch(setConfirmedUnChartedNavIndex({ next: nextDirection }))
                }
            } else { dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: currentUnChartedTicker.current.ticker, chartId: currentUnChartedTicker.current.chartId })) }
        }
    }

    function provideChartInfoDisplay()
    {
        switch (chartInfoDisplay)
        {
            case 0: return <InfoPanel />
            case 1: return <EnterExitPanel ticker={selectedTicker.ticker} />
            case 2: return <KeyLevelsPanel />
            case 3: return <AlertPanel />
            case 4: return <NewsPanel />
            default: return <InfoPanel />
        }
    }

    useEffect(() => { setTimeFrame(selectedTicker.timeFrame) }, [selectedTicker])


    return (
        <div id='LHS-SingleGraphForCharting'>
            <ChartMenuBar ticker={selectedTicker.ticker} setTimeFrame={setTimeFrame} timeFrame={timeFrame} uuid={uuid} subCharts={subCharts} setSubCharts={setSubCharts} />



            {selectedTicker ?
                <SingleGraphChartWrapper subCharts={subCharts} ticker={selectedTicker.ticker} chartId={selectedTicker.chartId} timeFrame={timeFrame} setTimeFrame={setTimeFrame} setChartInfoDisplay={setChartInfoDisplay} uuid={uuid} /> :
                <div>No Chart Selected</div>}

            <div id='LHS-SingleChartControls'>
                {showUnChartedList ?
                    <UnChartedProgressDisplay setShowUnchartedList={setShowUnchartedList} /> :
                    provideChartInfoDisplay()
                }

                <ContinueChartingNav ticker={selectedTicker.ticker} currentUnChartedTicker={currentUnChartedTicker} setShowUnchartedList={setShowUnchartedList} handleNavigatingToNextUnChartedStock={handleNavigatingToNextUnChartedStock} />
            </div>
        </div>
    )
}

export default ChartSingleGraph