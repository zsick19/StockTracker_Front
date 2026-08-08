import React from 'react'
import TaskCheckOffContainer from '../WelcomeGreeting/TaskCheckOffContainer'
import { useDispatch } from 'react-redux'
import { setStockDetailState } from '../../../../../../../../features/SelectedStocks/StockDetailControlSlice'

function DailyWeeklySchedule()
{
    const dispatch = useDispatch()
    return (
        <div>
            <TaskCheckOffContainer />

            <button onClick={() => dispatch(setStockDetailState(29))}>Weekly Review</button>
        </div>
    )
}

export default DailyWeeklySchedule