import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setStockDetailState, setStockDetailStateWithTicker } from '../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { selectAllNewsRunnerIds, selectAllNewsRunners } from '../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import SingleNewsRunner from './Components/SingleNewsRunner'
import './NewsRunner.css'

function NewsRunner()
{
    const newsRunners = useSelector((state) => selectAllNewsRunnerIds(state))

    return (
        <div id='NewsRunnerContainer'>
            <div>
                <h3>News Runner</h3>
            </div>
            <div style={{ height: '500px', overflowY: 'scroll' }} className='hide-scrollbar'>
                {newsRunners.map((t, i) => <SingleNewsRunner key={`${t}newsRunner`} tickerSymbol={t} />)}
            </div>
        </div>
    )
}

export default NewsRunner