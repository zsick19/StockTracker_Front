import React, { useEffect, useState } from 'react'
import './MessageNewsCenter.css'
import SectorZones from './Components/SectorZones/SectorZones';
import { useDispatch, useSelector } from 'react-redux';
import { selectMessageNewsDetailControl, setMessageNewsDetailState } from '../../../../../../features/SelectedStocks/MessageNewsDetailControl';
import ExpectedMoves from './Components/ExpectedMoves/ExpectedMoves';
import StandardDeviationVisual from './Components/SDVisual';
import JournalRecord from './Components/JournalRecord/JournalRecord';
import DailyValueFileUploads from './Components/WelcomeGreeting/DailyValueFileUploads';
import QuickSearch from './Components/QuickSearch/QuickSearch';
import { TerminalTaskStatusTickerHUD } from '../../../../../../layouts/dash/TerminalTaskStatusTickerHUD';
import WeeksCalendar from './Components/MacroCalendar/WeeksCalendar';
import { setStockDetailState } from '../../../../../../features/SelectedStocks/StockDetailControlSlice';
import AccountPLInfo from './Components/AccountPLInfo/AccountPLInfo';
import DailyWeeklySchedule from './Components/Schedule/DailyWeeklySchedule';

function MessageNewsCenter()
{
    const dispatch = useDispatch()
    const currentMessageNewsDetail = useSelector(selectMessageNewsDetailControl)

    function provideCurrentComponent()
    {
        switch (currentMessageNewsDetail)
        {
            case 'schedule': return <DailyWeeklySchedule />
            case 'account': return <AccountPLInfo />
            case 'journalRecord': return <JournalRecord />
            case 'calendar': return <WeeksCalendar />
            case 'dailyValues': return <DailyValueFileUploads />            
        }
    }

    function provideChecked(idForCheck) { return idForCheck === currentMessageNewsDetail }

    const [showExpandedClock, setShowExpandedClock] = useState(false)
    return (
        <section id='MessageNewsCenterSection'>
            <fieldset onChange={(e) => dispatch(setMessageNewsDetailState(e.target.id))} id='NewsCenterDisplayNav' className='fieldSetWithTabs'>
                <input type="radio" name="messageDisplay" id="account" readOnly className='hidden-radio' checked={provideChecked('account')} />
                <label htmlFor="account">Account</label>
                <input type="radio" name="messageDisplay" id="schedule" readOnly checked={provideChecked('schedule')} className='hidden-radio' />
                <label htmlFor="schedule">Schedule</label>
                <input type="radio" name="messageDisplay" id="calendar" readOnly className='hidden-radio' checked={provideChecked('tickerInfo')} />
                <label htmlFor="calendar">Calendar</label>
                <input type="radio" name="dailyValues" id="dailyValues" readOnly className='hidden-radio' checked={provideChecked('dailyValues')} />
                <label htmlFor="dailyValues">Daily Values</label>
                <input type="radio" name="messageDisplay" id="journalRecord" readOnly className='hidden-radio' checked={provideChecked('journalRecord')} />
                <label htmlFor="journalRecord">Journal</label>
            </fieldset>
            <div className='messageCenterContent'>
                {provideCurrentComponent()}
            </div>
            <TerminalTaskStatusTickerHUD showExpandedClock={showExpandedClock} setShowExpandedClock={setShowExpandedClock} />
        </section>
    )
}

export default MessageNewsCenter