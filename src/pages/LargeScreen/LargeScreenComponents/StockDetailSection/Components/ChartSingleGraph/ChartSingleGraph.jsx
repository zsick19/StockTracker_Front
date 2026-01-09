import React, { useState } from 'react'
import './ChartSingleGraph.css'
import { useDispatch, useSelector } from 'react-redux'
import { selectSingleChartStock, setSingleChartTickerTimeFrameAndChartingId } from '../../../../../../features/SelectedStocks/SelectedStockSlice'
import SingleGraphChartWrapper from './Components/SingleGraphChartWrapper'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { selectCurrentConfirmedUnCharted, setConfirmedUnChartedNavIndex } from '../../../../../../features/SelectedStocks/PreviousNextStockSlice'

function ChartSingleGraph()
{
    const dispatch = useDispatch()
    const selectedTicker = useSelector(selectSingleChartStock)
    const currentUnChartedTicker = useSelector(selectCurrentConfirmedUnCharted)


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





    return (
        <div id='LHS-SingleGraphForCharting'>
            <div id='LHS-SingleGraphMenuBar'>
                {selectedTicker?.ticker || 'No ticker selected'}
                <button>Studies</button>
                <button>Visibility Control</button>
                <button>TimeFrame Control</button>
            </div>


            {selectedTicker ?
                <SingleGraphChartWrapper ticker={selectedTicker.ticker} timeFrame={selectedTicker.timeFrame} />
                : <div>No Chart Selected</div>}

            <div id='LHS-SingleChartControls'>
                Chart Controls And Ticker

                <div>
                    <p>UnCharted</p>
                    <button onClick={() => handleNavigatingToNextUnChartedStock(false)}><ChevronLeft /></button>
                    <button onClick={() => handleNavigatingToNextUnChartedStock(true)}><ChevronRight /></button>
                </div>
                <div>
                    <button>Show All Alerts</button>
                    <button>Reject</button>
                    <button>Save Charting</button>
                    <button>Begin Tracking</button>
                </div>
            </div>
        </div>
    )
}

export default ChartSingleGraph