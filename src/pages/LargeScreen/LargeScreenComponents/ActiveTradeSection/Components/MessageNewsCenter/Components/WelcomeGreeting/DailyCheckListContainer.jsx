import React, { useEffect, useState } from 'react'
import { useMarkDailyTaskCompleteMutation } from '../../../../../../../../features/Initializations/InitializationSliceApi';

function DailyCheckList({ listSelect, tasks })
{
    const [markDailyTaskComplete] = useMarkDailyTaskCompleteMutation()
    async function attemptToggleEventComplete(i, id)
    {
        try
        {
            const result = await markDailyTaskComplete({ session: listSelect, taskId: id, taskIndex: i }).unwrap()
        } catch (error)
        {
            console.log(error)
        }
    }

    return (
        <div className='DailyTaskCheckList hide-scrollbar'>
            {tasks.map((t, i) =>
            {
                return (<div className={t.status ? 'completedToday singleMorningCheck' : 'notCompletedToday singleMorningCheck'}
                    onClick={() => attemptToggleEventComplete(i, t._id)}>
                    <p>{t.title}</p>
                    <p>{t.time}</p>
                </div>)
            })}
        </div>
    )
}

export default DailyCheckList