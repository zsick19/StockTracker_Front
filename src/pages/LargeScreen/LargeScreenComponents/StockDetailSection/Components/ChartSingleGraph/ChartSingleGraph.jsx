import React, { useEffect, useState } from 'react'
import './ChartSingleGraph.css'
import { useDispatch, useSelector } from 'react-redux'
import { selectSingleChartStock, setSingleChartTickerTimeFrameAndChartingId } from '../../../../../../features/SelectedStocks/SelectedStockSlice'
import SingleGraphChartWrapper from './Components/SingleGraphChartWrapper'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { selectConfirmedUnChartedTrio, setConfirmedUnChartedNavIndex } from '../../../../../../features/SelectedStocks/PreviousNextStockSlice'
import { selectCurrentTool } from '../../../../../../features/Charting/ChartingTool'
import VisibilityModal from './Components/VisibilityModal'

function ChartSingleGraph()
{
    const dispatch = useDispatch()
    const currentTool = useSelector(selectCurrentTool)
    const selectedTicker = useSelector(selectSingleChartStock)
    const currentUnChartedTicker = useSelector(selectConfirmedUnChartedTrio)

    const [chartInfoDisplay, setChartInfoDisplay] = useState(0)
    const [showVisibilityModal, setShowVisibilityModal] = useState(false)


    function handleNavigatingToNextUnChartedStock(nextDirection)
    {
        if (nextDirection)
        {
            if (currentUnChartedTicker.current.ticker === selectedTicker.ticker)
            {
                if (currentUnChartedTicker.next)
                {
                    dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: currentUnChartedTicker.next.ticker, chartingId: currentUnChartedTicker.next._id }))
                    dispatch(setConfirmedUnChartedNavIndex({ next: nextDirection }))
                }
            } else { dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: currentUnChartedTicker.current.ticker, chartingId: currentUnChartedTicker.current._id })) }
        } else
        {
            if (currentUnChartedTicker.current.ticker === selectedTicker.ticker)
            {
                if (currentUnChartedTicker.previous)
                {
                    dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: currentUnChartedTicker.previous.ticker, chartingId: currentUnChartedTicker.previous._id }))
                    dispatch(setConfirmedUnChartedNavIndex({ next: nextDirection }))
                }
            } else { dispatch(setSingleChartTickerTimeFrameAndChartingId({ ticker: currentUnChartedTicker.current.ticker, chartingId: currentUnChartedTicker.current._id })) }
        }
    }

    async function attemptRemoveOfConfirmedStock()
    {

    }

    async function attemptSavingCharting()
    {

    }

    function provideChartInfoDisplay()
    {
        switch (chartInfoDisplay)
        {
            case 0:
                return (
                    <div>
                        <button>Reject</button>

                        <button>Begin Tracking</button>
                    </div>)
            case 1:
                return (
                    <div>
                        Alert info here
                    </div>
                )

            case 2: return (
                <div>
                    Planning Enter/Exit
                </div>
            )

            default:
                break;
        }
    }

    useEffect(() =>
    {
        switch (currentTool)
        {
            case 'Trace': return setChartInfoDisplay(0)
            case 'PriceAlert': return setChartInfoDisplay(1)
            case 'EnterExit': return setChartInfoDisplay(2)
            default: return setChartInfoDisplay(0)
        }

    }, [currentTool])


    return (
        <div id='LHS-SingleGraphForCharting'>
            <div id='LHS-SingleGraphMenuBar'>
                {selectedTicker?.ticker || 'No ticker selected'}
                <button>Studies</button>
                <button onClick={() => setShowVisibilityModal(true)}>Visibility Control</button>
                <button>TimeFrame Control</button>
            </div>


            {showVisibilityModal && <VisibilityModal setShowVisibilityModal={setShowVisibilityModal} />}

            {selectedTicker ?
                <SingleGraphChartWrapper ticker={selectedTicker.ticker} chartId={undefined} timeFrame={selectedTicker.timeFrame} setChartInfoDisplay={setChartInfoDisplay} />
                : <div>No Chart Selected</div>}

            <div id='LHS-SingleChartControls'>
                <div>
                    <h3>Chart Controls</h3>
                    {provideChartInfoDisplay()}
                </div>
                <div id='LHS-UnChartedNavigation'>
                    <div>
                        <p>Uncharted</p>
                        <button disabled={!currentUnChartedTicker.previous} onClick={() => handleNavigatingToNextUnChartedStock(false)}><ChevronLeft /></button>
                        <button disabled={!currentUnChartedTicker.next} onClick={() => handleNavigatingToNextUnChartedStock(true)}><ChevronRight /></button>
                    </div>
                    <div>
                        <p>Unplanned</p>
                        <button disabled={!currentUnChartedTicker.previous} onClick={() => handleNavigatingToNextUnChartedStock(false)}><ChevronLeft /></button>
                        <button disabled={!currentUnChartedTicker.next} onClick={() => handleNavigatingToNextUnChartedStock(true)}><ChevronRight /></button>
                    </div>
                    <button>Sync Progress</button>
                </div>
            </div>
        </div>
    )
}

export default ChartSingleGraph