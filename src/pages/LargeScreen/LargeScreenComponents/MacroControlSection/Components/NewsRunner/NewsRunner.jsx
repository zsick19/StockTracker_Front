import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setStockDetailState, setStockDetailStateWithTicker } from '../../../../../../features/SelectedStocks/StockDetailControlSlice'
import { selectAllNewsRunnerIds, selectAllNewsRunners, selectAllNewsRunnersAndSort } from '../../../../../../features/NewsRunnerEngine/NewsRunnerLocalSlice'
import SingleNewsRunner from './Components/SingleNewsRunner'
import './NewsRunner.css'

function NewsRunner()
{
    const sorted = useSelector((state) => selectAllNewsRunnersAndSort(state))
    return (
        <div id='NewsRunnerContainer'>
            <div>
                <h3>News Runners</h3>
            </div>
            <div style={{ height: '250px', overflowY: 'scroll' }} className='hide-scrollbar'>
                {sorted.map((t, i) => <SingleNewsRunner key={`${t.id}newsRunner`} newsRunner={t} />)}
            </div>
        </div>
    )
}

export default NewsRunner