import React, { useEffect, useState } from 'react'
import './ChartSingleGraph.css'
import { useDispatch, useSelector } from 'react-redux'
import { selectSingleChartStock, setSingleChartTickerTimeFrameAndChartingId } from '../../../../../../features/SelectedStocks/SelectedStockSlice'
import SingleGraphChartWrapper from './Components/SingleGraphChartWrapper'
import { CalendarCog, ChevronLeft, ChevronRight, EyeOff, Scale3D } from 'lucide-react'
import { selectConfirmedUnChartedTrio, setConfirmedUnChartedNavIndex } from '../../../../../../features/SelectedStocks/PreviousNextStockSlice'
import { selectCurrentTool } from '../../../../../../features/Charting/ChartingTool'
import VisibilityModal from './Components/VisibilityModal'
import { interDayTimeFrames } from '../../../../../../Utilities/TimeFrames'
import KeyLevelsPanel from './Components/ChartControlPanels/KeyLevelsPanel'
import EnterExitPanel from './Components/ChartControlPanels/EnterExitPanel'
import InfoPanel from './Components/ChartControlPanels/InfoPanel'
import AlertPanel from './Components/ChartControlPanels/AlertPanel'
import CustomTimeFrameModal from './Components/CustomTimeFrameModal'
import StudiesModal from './Components/StudiesModal'
import ContinueChartingNav from './Components/ContinueChartingNav'

function ChartSingleGraph()
{
    const dispatch = useDispatch()
    
    const selectedTicker = useSelector(selectSingleChartStock)
    const currentUnChartedTicker = useSelector(selectConfirmedUnChartedTrio)

    const [timeFrame, setTimeFrame] = useState(selectedTicker.timeFrame)

    const [chartInfoDisplay, setChartInfoDisplay] = useState(0)
    const [showCustomTimeFrameModal, setShowCustomTimeFrameModal] = useState(false)
    const [showVisibilityModal, setShowVisibilityModal] = useState(false)
    const [showStudiesModal, setShowStudiesModal] = useState(false)


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
            case 1: return <EnterExitPanel />
            case 2: return <KeyLevelsPanel />
            case 3: return <AlertPanel />
            default: return <InfoPanel />
        }
    }







    return (
        <div id='LHS-SingleGraphForCharting'>

            <div id='LHS-SingleGraphMenuBar'>
                {selectedTicker?.ticker || 'No ticker selected'}
                <button onClick={() => { setShowStudiesModal(true) }}>Studies</button>
                <button onClick={() => { setShowVisibilityModal(true) }} title='Visibility Control'><EyeOff size={20} /></button>

                <div className='IntraDayTimeFrameBtns'>
                    {interDayTimeFrames.map((timeFrame) => { return <button onClick={() => setTimeFrame(timeFrame.timeFrame)}>{timeFrame.label}</button> })}
                    <button onClick={() => { setShowCustomTimeFrameModal(true) }}><CalendarCog size={20} /></button>
                </div>
                <button onClick={() => handleResetScale()} className='buttonIcon'><Scale3D color='white' size={20} /></button>
            </div>

            {showVisibilityModal && <VisibilityModal setShowVisibilityModal={setShowVisibilityModal} />}
            {showCustomTimeFrameModal && <CustomTimeFrameModal timeFrame={timeFrame} setTimeFrame={setTimeFrame} setShowCustomTimeFrameModal={setShowCustomTimeFrameModal} />}
            {showStudiesModal && <StudiesModal setShowStudiesModal={setShowStudiesModal} />}



            {selectedTicker ? <SingleGraphChartWrapper 
            ticker={selectedTicker.ticker} chartId={selectedTicker.chartId} timeFrame={timeFrame} setChartInfoDisplay={setChartInfoDisplay} />
                : <div>No Chart Selected</div>}


            <div id='LHS-SingleChartControls'>
                {provideChartInfoDisplay()}
                <ContinueChartingNav currentUnChartedTicker={currentUnChartedTicker} handleNavigatingToNextUnChartedStock={handleNavigatingToNextUnChartedStock} />
            </div>
        </div>
    )
}

export default ChartSingleGraph