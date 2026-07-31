import React, { useState } from 'react'
import './WeeksCalendar.css'
import { useFetchMacroCalendarQuery } from '../../../../../../../../features/MacroCalendarEvents/MacroCalendarApiSlice'
import MacroEventForm from './Components/MacroEventForm'

function WeeksCalendar()
{
    // const { data, isSuccess, isLoading, isError, error } = useFetchMacroCalendarQuery()
    const [showCreateEventForm, setShowCreateForm] = useState(false)

    return (
        <div>
            {showCreateEventForm ? <MacroEventForm setShowCreateForm={setShowCreateForm} /> :
                <div>
                    WeeksCalendar
                    <button onClick={() => setShowCreateForm(true)}>Create Event</button>
                </div>}
        </div>
    )
}

export default WeeksCalendar