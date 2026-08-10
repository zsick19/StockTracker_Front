import React from 'react'
import TaskCheckOffContainer from '../WelcomeGreeting/TaskCheckOffContainer'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'
import './DailyWeeklySchedule.css'

function DailyWeeklySchedule()
{
    const dispatch = useDispatch()
    return (
        <div id='DailyWeeklySchedule'>
            <TaskCheckOffContainer />
            <div>
                <button onClick={() => dispatch(setStockDetailState(29))}>Weekly Review</button>
            </div>
        </div>
    )
}

export default DailyWeeklySchedule