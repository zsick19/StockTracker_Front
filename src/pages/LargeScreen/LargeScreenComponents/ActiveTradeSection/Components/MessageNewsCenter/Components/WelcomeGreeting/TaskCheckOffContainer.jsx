import React, { useState } from 'react'
import DailyCheckList from './DailyCheckListContainer';
import { preSetDailyTimes } from '../../../../../../../../Utilities/TimeFrames';
import { useSelector } from 'react-redux';
import { selectDailyTaskFromUser } from '../../../../../../../../features/Initializations/InitializationSliceApi';
import './TaskCheckOffStyles.css'
import { AlarmClock, Moon, Sun, Sunrise, Sunset } from 'lucide-react';

function TaskCheckOffContainer()
{
    const [taskGroup, setTaskGroup] = useState('preMarket')
    const dailyTasks = useSelector(selectDailyTaskFromUser())

    const groups = ['preMarket', 'firstHour', 'midDay', 'powerHour', 'postClose']

    return (
        <div id='TaskCheckOffWrapper'>
            <div>
                <button className='buttonIcon' onClick={() => setTaskGroup(groups[0])}><AlarmClock color={taskGroup === groups[0] ? 'blue' : 'white'} /></button>
                <button className='buttonIcon' onClick={() => setTaskGroup(groups[1])}><Sunrise color={taskGroup === groups[1] ? 'blue' : 'white'} /></button>
                <button className='buttonIcon' onClick={() => setTaskGroup(groups[2])}><Sun color={taskGroup === groups[2] ? 'blue' : 'white'} /></button>
                <button className='buttonIcon' onClick={() => setTaskGroup(groups[3])}><Sunset color={taskGroup === groups[3] ? 'blue' : 'white'} /></button>
                <button className='buttonIcon' onClick={() => setTaskGroup(groups[4])}><Moon color={taskGroup === groups[4] ? 'blue' : 'white'} /></button>
            </div>
            <DailyCheckList listSelect={taskGroup} tasks={dailyTasks[taskGroup]} />


        </div>
    )
}

export default TaskCheckOffContainer