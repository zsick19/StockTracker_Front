import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectMacroDetailTickerControl } from '../../../../../../features/SelectedStocks/MacroDetailControlSlice'
import { setStockDetailStateWithTicker } from '../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { selectNewsRunnerById } from '../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import RunnerChartWrapper from '../../../StockDetailSection/Components/WeGotARunner/Components/RunnerChartWrapper'
import PowderCheck from './Components/PowderCheck'
import './PowderKeg.css'
import RunnerChart from '../../../StockDetailSection/Components/WeGotARunner/Components/RunnerChart'

function PowderKeg({ currentNewsRunner })
{
    const dispatch = useDispatch()


    return (
        <div id='PowderKeg' onClick={() => dispatch(setStockDetailStateWithTicker({ detail: 30, ticker: currentNewsRunner.id }))}>
            <h4>{currentNewsRunner.id}</h4>
            <RunnerChart ticker={currentNewsRunner.id} />
            {currentNewsRunner?.stockInfo && <PowderCheck stockInfo={currentNewsRunner.stockInfo} />}
        </div>
    )
}

export default PowderKeg