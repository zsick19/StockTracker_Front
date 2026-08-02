import React, { useMemo, useState } from 'react'
import './WeeksCalendar.css'
import { makeSelectCalendarEventByFilter, useFetchMacroCalendarQuery } from '../../../../../../../../features/MacroCalendarEvents/MacroCalendarApiSlice'
import MacroEventForm from './Components/MacroEventForm'
import { shallowEqual, useSelector } from 'react-redux'
import { addDays, endOfWeek, format, startOfWeek } from 'date-fns'

function WeeksCalendar()
{
    const [chosenWeek, setChosenWeek] = useState('thisWeek')
    const startDay = startOfWeek(addDays(new Date(), chosenWeek === 'thisWeek' ? 0 : 7))
    const endDay = endOfWeek(addDays(new Date(), chosenWeek === 'thisWeek' ? 0 : 7))

    const selectCalendarByFilter = useMemo(makeSelectCalendarEventByFilter, [])
    const calendarResults = useSelector((state) => selectCalendarByFilter(state, { startDate: startDay, endDate: endDay, span: 'week' }))

    const [showCreateEventForm, setShowCreateForm] = useState(false)
    return (
        <>
            {showCreateEventForm ? <MacroEventForm setShowCreateForm={setShowCreateForm} /> :
                <div id='QuickViewCalendar'>
                    <div className='flex'>
                        <div className='flex'>
                            <p>{format(startDay, 'MM/dd')} - {format(endDay, 'MM/dd')}</p>
                            {chosenWeek === 'thisWeek' ?
                                <button onClick={() => setChosenWeek('nextWeek')}>Next Week</button> :
                                <button onClick={() => setChosenWeek('thisWeek')}>This Week</button>
                            }</div>
                        <button onClick={() => setShowCreateForm(true)}>Create Event</button>
                    </div>

                    <div id='WeeksCalendar'>
                        <div>
                            <p>Sunday</p>
                            {calendarResults.sunday.map((t) => <p>{t.title}</p>)}
                        </div>
                        <div>
                            <p>Monday</p>
                            {calendarResults.monday.map((t) => <p>{t.title}</p>)}
                        </div>
                        <div>
                            <p>Tuesday</p>
                            {calendarResults.tuesday.map((t) => <p>{t.title}</p>)}
                        </div>
                        <div>
                            <p>Wednesday</p>
                            {calendarResults.wednesday.map((t) => <p>{t.title}</p>)}
                        </div>
                        <div>
                            <p>Thursday</p>
                            {calendarResults.thursday.map((t) => <p>{t.title}</p>)}
                        </div>
                        <div>
                            <p>Friday</p>
                            {calendarResults.friday.map((t) => <p>{t.title}</p>)}
                        </div>
                        <div>
                            <p>Saturday</p>
                            {calendarResults.saturday.map((t) => <p>{t.title}</p>)}
                        </div>
                    </div>
                </div>}
        </>
    )
}

export default WeeksCalendar